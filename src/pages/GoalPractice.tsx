import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { mockEvaluatePractice } from '../lib/mockAI';
import { addChatMessage } from '../lib/chatService';
import AICoachPanel from '../components/AICoachPanel';
import { Lightbulb, Send, CheckCircle2, ArrowRight } from 'lucide-react';

export default function GoalPractice() {
  const navigate = useNavigate();
  const session = useStore((state) => state.session);
  const participant = useStore((state) => state.participant);
  const setParticipant = useStore((state) => state.setParticipant);
  const chatSession = useStore((state) => state.chatSession);
  const addMessageToStore = useStore((state) => state.addChatMessage);
  
  const [answer, setAnswer] = useState('');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!session || !participant) {
      navigate('/join');
      return;
    }
    
    // Redirect if already moved to next phase
    if (participant.status === 'playing') {
      navigate('/quiz');
    }
    
    if (participant.practice_eval) {
      setEvaluation(participant.practice_eval);
    }
    
  }, [session, participant, navigate]);

  if (!session || !participant) return null;

  const handleRequestHint = async () => {
    if (hintsUsed >= 3 || !chatSession) return;
    
    const newHintCount = hintsUsed + 1;
    setHintsUsed(newHintCount);
    
    const hintText = newHintCount === 1 
      ? "Hint 1: Hãy bắt đầu bằng việc xác định rõ các đại lượng đã cho và đại lượng cần tìm." 
      : newHintCount === 2 
        ? "Hint 2: Nhớ lại công thức hoặc tính chất liên quan mà bạn đã ôn ở phần Tự học nhé." 
        : "Hint 3: Hãy thử phân tích/rút gọn biểu thức trước khi thay số vào tính.";
        
    try {
      const hintMsg = await addChatMessage(chatSession, 'ai', 'hint', hintText, { hintLevel: newHintCount });
      addMessageToStore(hintMsg);
      
      await supabase
        .from('participants')
        .update({ hints_used: participant.hints_used + 1 })
        .eq('id', participant.id);
        
      setParticipant({ ...participant, hints_used: participant.hints_used + 1 });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !chatSession) return;
    setIsEvaluating(true);
    
    try {
      // 1. Gửi bài làm vào chat
      const submitMsg = await addChatMessage(chatSession, 'student', 'free_question', `Bài làm của tôi: \n${answer}`);
      addMessageToStore(submitMsg);
      
      // 2. Chấm điểm qua API
      const mode = import.meta.env.VITE_AI_MODE || 'mock';
      const goalText = participant.goal_data?.text || 'Chưa nhập đề bài';
      
      const evalRes = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiMode: mode, goalText, answer })
      });
      
      if (!evalRes.ok) throw new Error('Failed to evaluate');
      const result = await evalRes.json();
      
      // 3. AI phản hồi kết quả
      const evalMsg = await addChatMessage(chatSession, 'ai', 'evaluation', `Kết quả đánh giá: ${result.status} (${result.completionPercentage}%)\nNhận xét: ${result.improvementHint}`, { evaluation: result });
      addMessageToStore(evalMsg);
      
      // 4. Update DB
      const { data, error } = await supabase
        .from('participants')
        .update({ 
          practice_eval: result,
          answers: [...participant.answers, { question: 'goal_practice', answer }],
          score: result.completionPercentage // Gán tạm điểm cho bài tự học
        })
        .eq('id', participant.id)
        .select()
        .single();
        
      if (error) throw error;
      setParticipant(data);
      setEvaluation(result);
    } catch (err) {
      console.error(err);
      alert("Có lỗi khi nộp bài.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextPhase = async () => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .update({ status: 'playing' })
        .eq('id', participant.id)
        .select()
        .single();
      if (error) throw error;
      setParticipant(data);
      navigate('/quiz');
    } catch (err) {
      console.error(err);
    }
  };

  const submitCount = (participant.answers || []).filter((a: any) => a.question === 'goal_practice').length;
  const canRetry = evaluation && evaluation.completionPercentage < 100 && submitCount < 3;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      
      {/* Left Column: Practice Workspace */}
      <div className="flex-1">
        <div className="bg-mx-dark text-white rounded-3xl p-8 mb-6 shadow-card">
          <h1 className="text-3xl font-bold mb-2">Thực hành giải bài tập</h1>
          <p className="text-gray-300">Vận dụng các kiến thức vừa học để giải quyết bài tập ban đầu của bạn.</p>
        </div>

        <div className="bg-mx-surface rounded-3xl p-8 shadow-card border border-mx-border mb-6">
          <h2 className="text-xl font-bold mb-4">Mục tiêu của bạn:</h2>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-900 font-medium mb-6">
            <p>{participant.goal_data?.text || 'Chưa nhập nội dung text'}</p>
            {participant.goal_data?.files && participant.goal_data.files.length > 0 && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {participant.goal_data.files.map((file: any, idx: number) => (
                  <div key={idx} className="bg-white p-2 border border-blue-200 rounded">
                    {file.data && (
                      <div className="cursor-pointer group relative" onClick={() => setZoomedImage(file.data)}>
                        <img src={file.data} alt={file.name} className="w-full max-h-48 object-contain rounded mb-2 group-hover:opacity-80 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 transition-opacity">
                          <span className="bg-black/60 text-white text-xs px-2 py-1 rounded">Click để phóng to</span>
                        </div>
                      </div>
                    )}
                    <p className="text-sm italic truncate" title={file.name}>File đính kèm: {file.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!evaluation ? (
            <>
              <div className="mb-4">
                <label className="block font-semibold mb-2">Trình bày lời giải của bạn:</label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Viết từng bước giải toán..."
                  className="w-full bg-mx-bg border-2 border-mx-border rounded-xl px-4 py-3 focus:outline-none focus:border-mx-primary min-h-[200px] resize-none"
                />
              </div>

              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={handleRequestHint}
                  disabled={hintsUsed >= 3 || chatSession?.status === 'locked' || session?.status === 'ended'}
                  className="flex items-center gap-2 text-amber-600 font-bold hover:bg-amber-50 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Lightbulb className="w-5 h-5" />
                  Xin gợi ý AI ({hintsUsed}/3)
                </button>
                
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!answer.trim() || isEvaluating || chatSession?.status === 'locked' || session?.status === 'ended'}
                  className="flex items-center gap-2 bg-mx-primary text-white font-bold py-3 px-8 rounded-xl shadow-md hover:bg-mx-primary-dark transition-colors disabled:opacity-50"
                >
                  {isEvaluating ? 'Đang chấm...' : 'Nộp bài cho AI Coach'}
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4 text-green-700">
                <CheckCircle2 className="w-8 h-8" />
                <h3 className="text-2xl font-bold">Đã nộp bài</h3>
              </div>
              
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">Kết quả</p>
                  <p className="text-xl font-bold text-mx-primary">{evaluation.status}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">Độ hoàn thiện</p>
                  <p className="text-xl font-bold text-mx-success">{evaluation.completionPercentage}%</p>
                </div>
              </div>

              <div className="space-y-4 text-sm bg-white p-6 rounded-xl shadow-sm">
                <div>
                  <strong className="text-green-600 block mb-1">Những điểm làm tốt:</strong>
                  <ul className="list-disc pl-5">
                    {evaluation.correctSteps.map((step: string, i: number) => <li key={i}>{step}</li>)}
                  </ul>
                </div>
                {evaluation.missingSteps?.length > 0 && (
                  <div>
                    <strong className="text-amber-600 block mb-1">Những điểm cần cải thiện:</strong>
                    <ul className="list-disc pl-5">
                      {evaluation.missingSteps.map((step: string, i: number) => <li key={i}>{step}</li>)}
                    </ul>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-100">
                  <strong className="text-blue-600">AI Coach Note: </strong>
                  {evaluation.improvementHint}
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                {canRetry && (
                  <button
                    onClick={() => {
                      setEvaluation(null);
                      setAnswer(''); // Reset để làm lại từ đầu hoặc có thể giữ lại để sửa
                    }}
                    className="flex-1 flex justify-center items-center gap-2 bg-white border-2 border-mx-dark text-mx-dark font-bold py-4 rounded-xl shadow-md hover:bg-gray-50 transition-colors"
                  >
                    Làm lại (Còn {3 - submitCount} lần)
                  </button>
                )}
                
                <button
                  onClick={handleNextPhase}
                  className="flex-[2] flex justify-center items-center gap-2 bg-mx-dark text-white font-bold py-4 rounded-xl shadow-md hover:bg-black transition-colors"
                >
                  Tiếp tục tham gia Competitive Activity
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: AI Coach Panel */}
      <div className="w-full md:w-[400px] flex-shrink-0">
        <AICoachPanel />
      </div>

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setZoomedImage(null)}>
          <div className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center">
            <button 
              className="absolute top-4 right-4 bg-white text-black p-2 rounded-full font-bold hover:bg-gray-200 z-10"
              onClick={() => setZoomedImage(null)}
            >
              Đóng (X)
            </button>
            <img src={zoomedImage} alt="Zoomed" className="max-w-full max-h-full object-contain bg-white rounded-xl shadow-2xl p-2" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}
    </div>
  );
}
