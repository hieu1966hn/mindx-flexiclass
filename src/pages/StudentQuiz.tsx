import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { MOCK_QUESTIONS, calculateNormalizedScore, tugOfWarScoring, DEMO_PROFILES } from '../lib/mockData';
import { Clock, HelpCircle, Trophy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default function StudentQuiz() {
  const navigate = useNavigate();
  const session = useStore((state) => state.session);
  const setSession = useStore((state) => state.setSession);
  const participant = useStore((state) => state.participant);
  const setParticipant = useStore((state) => state.setParticipant);
  const participants = useStore((state) => state.participants);
  const setParticipants = useStore((state) => state.setParticipants);

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [localStreak, setLocalStreak] = useState(0);

  // Filter questions based on student grade
  const questions = useMemo(() => {
    if (!participant) return [];
    return MOCK_QUESTIONS[participant.grade] || [];
  }, [participant]);

  // Real-time subscription for Session & Participants
  useEffect(() => {
    if (!session || !participant) {
      navigate('/join');
      return;
    }

    // Load leaderboard initially
    const loadLeaderboard = async () => {
      const { data } = await supabase.from('participants').select('*').eq('session_id', session.id);
      if (data) setParticipants(data);
    };
    loadLeaderboard();

    // Fetch latest session state initially to avoid being stuck if it changed while we were in another route
    const loadInitialSession = async () => {
      const { data } = await supabase.from('sessions').select('*').eq('id', session.id).single();
      if (data) setSession(data);
    };
    loadInitialSession();

    // Subscribe to Session (Wait for Teacher to start)
    const sessionSub = supabase.channel('student_session')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${session.id}` }, (payload) => {
        setSession(payload.new as any);
      })
      .subscribe();

    // Subscribe to Participants (Leaderboard)
    const participantSub = supabase.channel('student_leaderboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants', filter: `session_id=eq.${session.id}` }, () => {
        loadLeaderboard(); // Quick refresh for simplicity
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sessionSub);
      supabase.removeChannel(participantSub);
    };
  }, [session?.id, participant?.id, navigate, setSession, setParticipants]);

  // Client-side Timer Logic
  useEffect(() => {
    if (session?.status !== 'active' || !session.started_at) return;

    const interval = setInterval(() => {
      const startedAt = new Date(session.started_at!).getTime();
      const endTime = startedAt + session.duration_minutes * 60 * 1000;
      const now = new Date().getTime();
      const diffSeconds = Math.max(0, Math.floor((endTime - now) / 1000));
      
      setTimeLeft(diffSeconds);

      if (diffSeconds <= 0 && participant?.status !== 'completed') {
        // Auto submit if time is up
        handleFinishSession();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session?.status, session?.started_at, participant?.status]);

  // Auto-mark as playing once session is active
  useEffect(() => {
    if (session?.status === 'active' && participant?.status === 'joined') {
      const updateStatus = async () => {
        const { data } = await supabase
          .from('participants')
          .update({ status: 'playing' })
          .eq('id', participant.id)
          .select().single();
        if (data) setParticipant(data);
      };
      updateStatus();
    }
  }, [session?.status, participant?.status, participant?.id, setParticipant]);


  const handleRequestHint = async () => {
    if (hintsRevealed >= 3) return;
    const newHintCount = hintsRevealed + 1;
    setHintsRevealed(newHintCount);
    
    // Update DB
    await supabase.from('participants').update({
      hints_used: (participant!.hints_used || 0) + 1
    }).eq('id', participant!.id);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption || !participant) return;

    const currentQ = questions[currentQuestionIdx];
    const isCorrect = selectedOption === currentQ.correctAnswer;
    
    // Naive time spent logic (assume 15s for demo)
    const timeSpent = 15; 
    const newStreak = isCorrect ? localStreak + 1 : 0;
    setLocalStreak(newStreak);

    let rawScoreAdd = 0;
    let normalizedScoreAdd = 0;

    if (session?.template_id === 'tug-of-war') {
      const pull = tugOfWarScoring(isCorrect, hintsRevealed);
      rawScoreAdd = pull;
      normalizedScoreAdd = pull; 
    } else {
      const res = calculateNormalizedScore(isCorrect, timeSpent, hintsRevealed, newStreak);
      rawScoreAdd = res.rawScore;
      normalizedScoreAdd = res.normalizedScore;
    }

    const newAnswers = [...(participant.answers || []), {
      questionId: currentQ.id,
      selected: selectedOption,
      isCorrect
    }];

    const newRaw = (participant!.raw_score || 0) + rawScoreAdd;
    const newScore = (participant!.score || 0) + normalizedScoreAdd;

    // Update DB
    const { data } = await supabase.from('participants').update({
      score: newScore,
      raw_score: newRaw,
      answers: newAnswers
    }).eq('id', participant!.id).select().single();

    if (data) setParticipant(data);

    // Next question or Finish
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setHintsRevealed(0);
    } else {
      handleFinishSession();
    }
  };

  const handleFinishSession = async () => {
    if (!participant) return;
    const { data } = await supabase.from('participants').update({
      status: 'completed'
    }).eq('id', participant.id).select().single();
    if (data) setParticipant(data);
  };

  // Render Waiting Room
  if (session?.status === 'waiting') {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center bg-mx-surface p-10 rounded-3xl shadow-card border border-mx-border max-w-md">
          <div className="w-16 h-16 rounded-full border-4 border-mx-primary border-t-transparent animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold mb-2">Đang đợi giáo viên...</h2>
          <p className="text-mx-text-muted">Bạn đã vào phòng <strong className="text-mx-text">{session.code}</strong>. Thử thách sẽ bắt đầu khi giáo viên bấm Start.</p>
        </div>
      </div>
    );
  }

  // Render Final Results (Only when Teacher clicks End Session)
  if (session?.status === 'ended') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
        <div className="bg-mx-surface rounded-3xl shadow-card border border-mx-border p-8 text-center flex flex-col items-center justify-center">
          <Trophy className="w-20 h-20 text-amber-400 mb-4" />
          <h1 className="text-3xl font-bold mb-2">Hoàn thành thử thách!</h1>
          <p className="text-mx-text-muted mb-6">Bạn đã làm rất tốt. Hãy tiếp tục luyện tập để đạt kết quả cao hơn nhé.</p>
          <div className="bg-red-50 w-full p-6 rounded-2xl border border-red-100 mb-6">
            <p className="text-sm text-mx-text-muted mb-1">Điểm số quy đổi (Normalized)</p>
            <p className="text-5xl font-mono font-bold text-mx-primary">{participant.score}</p>
          </div>
          <button 
            onClick={() => navigate('/report')}
            className="w-full sm:w-auto bg-mx-primary text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-mx-primary-dark transition-colors"
          >
            Xem Báo Cáo Học Tập
          </button>
        </div>
        
        {/* Leaderboard View */}
        <div className="bg-mx-surface rounded-3xl p-6 shadow-card border border-mx-border">
          <h2 className="text-xl font-bold mb-4">Bảng Xếp Hạng Lớp</h2>
          <div className="flex flex-col gap-3">
            {[...participants].sort((a, b) => b.score - a.score).map((p, idx) => (
              <div key={p.id} className={`flex justify-between p-3 rounded-xl border ${p.id === participant.id ? 'bg-red-50 border-red-200' : 'border-mx-border/50'}`}>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-500 w-5">{idx + 1}</span>
                  <div>
                    <span className="font-bold">{p.name}</span>
                    {p.id === participant.id && <span className="ml-2 text-xs bg-mx-primary text-white px-2 py-0.5 rounded-full">Bạn</span>}
                  </div>
                </div>
                <span className="font-mono font-bold text-mx-primary">{p.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render Waiting for Others (When Student finished but Session is still active)
  if (participant?.status === 'completed') {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center bg-mx-surface p-10 rounded-3xl shadow-card border border-mx-border max-w-md">
          <div className="w-16 h-16 rounded-full border-4 border-mx-success border-t-transparent animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold mb-2 text-mx-success">Đã nộp bài!</h2>
          <p className="text-mx-text-muted">Tuyệt vời. Bạn hãy nghỉ ngơi một chút và chờ các bạn khác hoàn thành nhé. Kết quả chung cuộc sẽ hiện ra khi giáo viên kết thúc phiên học.</p>
        </div>
      </div>
    );
  }

  // Render Quiz Player
  const currentQ = questions[currentQuestionIdx];
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isTugOfWar = session?.template_id === 'tug-of-war';
  const blueScore = participants.filter(p => p.team === 'blue').reduce((sum, p) => sum + p.score, 0);
  const redScore = participants.filter(p => p.team === 'red').reduce((sum, p) => sum + p.score, 0);
  const totalScore = blueScore + redScore || 1;
  const bluePercentage = (blueScore / totalScore) * 100;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6 bg-mx-surface px-6 py-4 rounded-2xl shadow-sm border border-mx-border">
        <div>
          <span className="bg-mx-primary-soft text-mx-primary-dark px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {DEMO_PROFILES[participant!.student_code]?.topic}
          </span>
          <p className="font-semibold mt-2">{participant?.name} <span className="text-mx-text-muted font-normal">— Lớp {participant?.grade}</span></p>
        </div>
        <div className="flex flex-col items-end">
          <div className={`flex items-center gap-2 font-mono text-2xl font-bold ${timeLeft !== null && timeLeft < 60 ? 'text-mx-danger' : 'text-mx-text'}`}>
            <Clock className="w-6 h-6" />
            {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
          </div>
          <p className="text-sm text-mx-text-muted mt-1">Câu {currentQuestionIdx + 1} / {questions.length}</p>
        </div>
      </div>

      {/* Tug of War Progress Bar */}
      {isTugOfWar && (
        <div className="bg-mx-surface rounded-2xl p-4 shadow-sm border border-mx-border mb-6">
          <div className="flex justify-between mb-2 text-xs font-bold uppercase tracking-wider">
            <span className="text-blue-600">Đội Xanh: {blueScore}</span>
            <span className="text-red-600">Đội Đỏ: {redScore}</span>
          </div>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden flex relative">
            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${totalScore === 1 && blueScore === 0 ? 50 : bluePercentage}%` }}></div>
            <div className="h-full bg-red-500 transition-all duration-500 flex-1"></div>
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white -ml-px z-10"></div>
          </div>
        </div>
      )}

      {/* Question Card */}
      {currentQ && (
        <div className="bg-mx-surface rounded-3xl p-8 shadow-card border border-mx-border mb-6">
          <div className="text-2xl font-bold mb-8 leading-snug prose prose-lg max-w-none">
             <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
               {currentQ.questionText}
             </ReactMarkdown>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedOption(opt)}
                className={`p-4 rounded-xl border-2 text-lg font-medium transition-all ${
                  selectedOption === opt 
                  ? 'border-mx-primary bg-mx-primary-soft text-mx-primary-dark shadow-md' 
                  : 'border-mx-border hover:border-mx-primary/50 hover:bg-gray-50'
                }`}
              >
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                   {opt}
                </ReactMarkdown>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hints & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="w-full sm:w-auto">
          {hintsRevealed < 3 ? (
            <button 
              onClick={handleRequestHint}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-full border border-mx-warning text-mx-warning font-semibold hover:bg-amber-50 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              Xin gợi ý ({3 - hintsRevealed} lần)
            </button>
          ) : (
            <p className="text-mx-text-muted text-sm italic">Đã dùng hết gợi ý cho câu này.</p>
          )}

          {/* Render Hints */}
          {hintsRevealed > 0 && currentQ && (
            <div className="mt-4 flex flex-col gap-2">
              {currentQ.hints.slice(0, hintsRevealed).map((hint, idx) => (
                <div key={idx} className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-xl text-sm">
                  <strong className="block mb-1">Gợi ý {idx + 1}:</strong>
                  {hint}
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={handleSubmitAnswer}
          disabled={!selectedOption}
          className="w-full sm:w-auto bg-mx-primary text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-mx-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentQuestionIdx === questions.length - 1 ? 'Nộp Bài' : 'Câu Tiếp Theo'}
        </button>
      </div>
    </div>
  );
}
