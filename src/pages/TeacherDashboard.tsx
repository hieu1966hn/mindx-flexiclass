import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { Users, Play, Square, Award } from 'lucide-react';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const session = useStore((state) => state.session);
  const hostToken = useStore((state) => state.hostToken);
  const participants = useStore((state) => state.participants);
  const setParticipants = useStore((state) => state.setParticipants);
  const setSession = useStore((state) => state.setSession);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session || !hostToken) {
      navigate('/');
      return;
    }

    // Load initial participants
    const loadParticipants = async () => {
      const { data } = await supabase
        .from('participants')
        .select('*')
        .eq('session_id', session.id);
      if (data) setParticipants(data);
    };
    loadParticipants();

    // Subscribe to participant changes
    const participantSub = supabase.channel('public:participants')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants', filter: `session_id=eq.${session.id}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setParticipants([...useStore.getState().participants, payload.new as any]);
        } else if (payload.eventType === 'UPDATE') {
          setParticipants(useStore.getState().participants.map(p => p.id === payload.new.id ? payload.new as any : p));
        }
      })
      .subscribe();

    // Subscribe to session changes (e.g. status)
    const sessionSub = supabase.channel('public:sessions')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${session.id}` }, (payload) => {
        setSession(payload.new as any);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(participantSub);
      supabase.removeChannel(sessionSub);
    };
  }, [session, hostToken, navigate, setParticipants, setSession]);

  const handleStartSession = async () => {
    if (!session) return;
    setLoading(true);
    const now = new Date().toISOString();
    try {
      const { data, error } = await supabase
        .from('sessions')
        .update({ status: 'active', started_at: now })
        .eq('id', session.id)
        .eq('host_token', hostToken)
        .select()
        .single();
      if (error) throw error;
      setSession(data);
    } catch (err) {
      console.error(err);
      alert('Lỗi khi bắt đầu phòng học!');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!session) return;
    if (!confirm('Bạn có chắc chắn muốn kết thúc phiên học này không?')) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .update({ status: 'ended' })
        .eq('id', session.id)
        .eq('host_token', hostToken)
        .select()
        .single();
      if (error) throw error;
      setSession(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Info */}
      <div className="bg-mx-dark text-white rounded-3xl p-8 mb-8 shadow-card flex flex-col md:flex-row items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Teacher Dashboard</h1>
          <p className="text-mx-text-muted text-gray-300">
            Mã phòng học (Room Code): <span className="font-mono bg-black/30 px-3 py-1 rounded-lg text-white ml-2 text-xl tracking-wider">{session.code}</span>
          </p>
          <p className="text-sm text-gray-400 mt-2">Gửi link cho học viên: {window.location.origin}/join</p>
        </div>
        
        <div className="mt-6 md:mt-0 flex gap-4">
          {session.status === 'ended' && (
            <button 
              onClick={() => {
                useStore.getState().setSession(null);
                useStore.getState().setHostToken(null);
                useStore.getState().setRole(null);
                useStore.getState().setParticipants([]);
                navigate('/');
              }}
              className="flex items-center gap-2 rounded-full bg-mx-primary px-6 py-3 font-semibold text-white hover:bg-mx-primary-dark transition-colors"
            >
              Tạo phòng mới
            </button>
          )}
          {session.status === 'waiting' && (
            <button 
              onClick={handleStartSession}
              disabled={loading}
              className="flex items-center gap-2 rounded-full bg-mx-success px-6 py-3 font-semibold text-white hover:bg-green-700 transition-colors"
            >
              <Play className="w-5 h-5" />
              Bắt đầu ngay
            </button>
          )}
          {session.status === 'active' && (
            <button 
              onClick={handleEndSession}
              disabled={loading}
              className="flex items-center gap-2 rounded-full bg-mx-danger px-6 py-3 font-semibold text-white hover:bg-red-700 transition-colors"
            >
              <Square className="w-5 h-5" />
              Kết thúc
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-mx-surface rounded-2xl p-6 shadow-sm border border-mx-border">
          <h3 className="text-mx-text-muted text-sm font-semibold mb-1">Trạng thái</h3>
          <p className="text-2xl font-bold uppercase text-mx-accent-blue">{session.status}</p>
        </div>
        <div className="bg-mx-surface rounded-2xl p-6 shadow-sm border border-mx-border">
          <h3 className="text-mx-text-muted text-sm font-semibold mb-1">Học sinh tham gia</h3>
          <p className="text-2xl font-bold flex items-center gap-2"><Users className="text-mx-primary"/> {participants.length}</p>
        </div>
        <div className="bg-mx-surface rounded-2xl p-6 shadow-sm border border-mx-border">
          <h3 className="text-mx-text-muted text-sm font-semibold mb-1">Đang làm bài</h3>
          <p className="text-2xl font-bold text-mx-warning">{participants.filter(p => p.status === 'playing').length}</p>
        </div>
        <div className="bg-mx-surface rounded-2xl p-6 shadow-sm border border-mx-border">
          <h3 className="text-mx-text-muted text-sm font-semibold mb-1">Đã hoàn thành</h3>
          <p className="text-2xl font-bold text-mx-success">{participants.filter(p => p.status === 'completed').length}</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Participant List */}
        <div className="md:col-span-2 bg-mx-surface rounded-3xl p-6 shadow-card border border-mx-border min-h-[400px]">
          <h2 className="text-xl font-bold mb-6">Danh sách Lớp</h2>
          {participants.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-mx-text-muted">
              <p>Chưa có học sinh nào tham gia.</p>
              <p className="text-sm mt-1">Học sinh hãy truy cập và nhập mã phòng {session.code}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-mx-text-muted text-sm border-b border-mx-border">
                    <th className="pb-3 font-medium">Học sinh</th>
                    <th className="pb-3 font-medium">Mã</th>
                    <th className="pb-3 font-medium">Lớp</th>
                    <th className="pb-3 font-medium">Trạng thái</th>
                    <th className="pb-3 font-medium">Hint dùng</th>
                    <th className="pb-3 font-medium text-right">Raw Score</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p) => (
                    <tr key={p.id} className="border-b border-mx-border/50 last:border-0">
                      <td className="py-4 font-medium">{p.name}</td>
                      <td className="py-4 text-sm text-mx-text-muted font-mono">{p.student_code}</td>
                      <td className="py-4"><span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md">Lớp {p.grade}</span></td>
                      <td className="py-4">
                        {p.status === 'joined' && <span className="text-gray-500">Đang chờ</span>}
                        {p.status === 'playing' && <span className="text-mx-warning">Đang làm</span>}
                        {p.status === 'completed' && <span className="text-mx-success">Hoàn thành</span>}
                        {p.status === 'stuck' && <span className="text-mx-danger font-bold">Đang kẹt</span>}
                      </td>
                      <td className="py-4">{p.hints_used}</td>
                      <td className="py-4 text-right font-mono">{p.raw_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Live Leaderboard */}
        <div className="bg-mx-surface rounded-3xl p-6 shadow-card border border-mx-border">
          <div className="flex items-center gap-2 mb-6">
            <Award className="text-mx-primary" />
            <h2 className="text-xl font-bold">Bảng Xếp Hạng</h2>
          </div>
          
          <div className="flex flex-col gap-3">
            {participants.length === 0 && (
              <p className="text-mx-text-muted text-center py-8">Chưa có dữ liệu</p>
            )}
            
            {[...participants]
              .sort((a, b) => b.score - a.score)
              .map((p, index) => (
                <div 
                  key={p.id} 
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    index === 0 ? 'bg-amber-50 border-amber-200' : 
                    index === 1 ? 'bg-gray-50 border-gray-200' : 
                    index === 2 ? 'bg-orange-50 border-orange-200' : 
                    'border-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                      index === 0 ? 'bg-amber-400 text-white' : 
                      index === 1 ? 'bg-gray-300 text-gray-700' : 
                      index === 2 ? 'bg-orange-300 text-white' : 
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{p.name}</p>
                      <p className="text-xs text-mx-text-muted">Lớp {p.grade}</p>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-lg text-mx-primary">
                    {p.score}
                  </div>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
