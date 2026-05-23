import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { DEMO_PROFILES } from '../lib/mockData';

export default function StudentJoin() {
  const navigate = useNavigate();
  const setRole = useStore((state) => state.setRole);
  const setSession = useStore((state) => state.setSession);
  const setParticipant = useStore((state) => state.setParticipant);
  
  const [roomCode, setRoomCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [studentCode, setStudentCode] = useState('S6-A');
  const [confidence, setConfidence] = useState('Hơi hiểu');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // PII Guard Helper
  const hasPII = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d\s\-\+]{8,15}$/;
    return emailRegex.test(text) || phoneRegex.test(text);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (hasPII(displayName)) {
      setErrorMsg('Vui lòng không dùng email hoặc số điện thoại. Hãy dùng mã ẩn danh như HV-001.');
      return;
    }

    if (!DEMO_PROFILES[studentCode]) {
      setErrorMsg('Mã học viên không tồn tại trong hệ thống demo. (Gợi ý: S6-A, S7-B, S8-C, S9-D, S8-E)');
      return;
    }

    setLoading(true);
    try {
      // 1. Fetch active session
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('code', roomCode.trim().toUpperCase())
        .in('status', ['waiting', 'active'])
        .single();
        
      if (sessionError || !sessionData) {
        throw new Error('Không tìm thấy phòng học hoặc phòng đã kết thúc.');
      }

      const grade = DEMO_PROFILES[studentCode].grade;

      // 2. Create participant record
      let team = undefined;
      if (sessionData.template_id === 'tug-of-war') {
         const { count } = await supabase
           .from('participants')
           .select('*', { count: 'exact', head: true })
           .eq('session_id', sessionData.id);
         team = (count || 0) % 2 === 0 ? 'blue' : 'red';
      }

      const { data: participantData, error: participantError } = await supabase
        .from('participants')
        .insert([
          { 
            session_id: sessionData.id,
            name: displayName.trim() || 'Học viên ẩn danh',
            student_code: studentCode,
            grade: grade,
            team: team,
            status: 'goal_intake'
          }
        ])
        .select()
        .single();

      if (participantError) throw participantError;

      // 3. Save to store
      setRole('student');
      setSession(sessionData);
      setParticipant(participantData);
      
      // Navigate to Goal Intake
      navigate('/intake');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Lỗi khi tham gia phòng học.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="bg-mx-surface rounded-3xl shadow-card border border-mx-border p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-mx-primary mb-2">Math Arena</h1>
          <p className="text-mx-text-muted text-sm">
            Cùng học Toán, mỗi bạn một thử thách đúng trình độ
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-mx-danger text-mx-danger rounded-xl text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1">Mã phòng học (Room Code)</label>
            <input 
              required
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-mx-border focus:outline-none focus:ring-2 focus:ring-mx-primary uppercase"
              placeholder="Nhập mã phòng"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Tên hiển thị</label>
            <input 
              required
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-mx-border focus:outline-none focus:ring-2 focus:ring-mx-primary"
              placeholder="VD: HV-001"
            />
            <p className="text-xs text-mx-text-muted mt-1">Chỉ dùng mã ẩn danh. Không nhập tên thật, email hoặc số điện thoại.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Mã học sinh (Demo)</label>
            <select 
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-mx-border focus:outline-none focus:ring-2 focus:ring-mx-primary bg-white"
            >
              <option value="S6-A">S6-A (Lớp 6)</option>
              <option value="S7-B">S7-B (Lớp 7)</option>
              <option value="S8-C">S8-C (Lớp 8)</option>
              <option value="S9-D">S9-D (Lớp 9)</option>
              <option value="S8-E">S8-E (Lớp 8 - Medium)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Mức độ tự tin với bài học</label>
            <select 
              value={confidence}
              onChange={(e) => setConfidence(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-mx-border focus:outline-none focus:ring-2 focus:ring-mx-primary bg-white"
            >
              <option>Chưa tự tin</option>
              <option>Hơi hiểu</option>
              <option>Khá ổn</option>
              <option>Rất tự tin</option>
            </select>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-4 rounded-full bg-mx-primary px-6 py-4 font-semibold text-white shadow-pop hover:bg-mx-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang kết nối...' : 'Vào phòng học'}
          </button>
        </form>
      </div>
    </div>
  );
}
