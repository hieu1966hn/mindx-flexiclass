import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Users, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function CSReportView() {
  const navigate = useNavigate();
  const session = useStore((state) => state.session);
  const hostToken = useStore((state) => state.hostToken);
  
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session || !hostToken) {
      navigate('/');
      return;
    }

    const fetchReport = async () => {
      try {
        const { data, error } = await supabase
          .from('cs_handoff_reports')
          .select('*')
          .eq('session_id', session.id)
          .single();
          
        if (error) throw error;
        setReport(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReport();
  }, [session, hostToken, navigate]);

  if (!session) return null;

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Đang tải báo cáo...</div>;
  }

  if (!report) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/host')} className="flex items-center gap-2 mb-4 text-mx-primary hover:underline">
          <ArrowLeft className="w-4 h-4" /> Quay lại Dashboard
        </button>
        <div className="bg-red-50 text-red-600 p-8 rounded-xl text-center">
          Không tìm thấy báo cáo CS cho phiên học này.
        </div>
      </div>
    );
  }

  const { overall_summary, students_report } = report;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/host')} className="flex items-center gap-2 mb-6 text-mx-primary font-medium hover:underline">
        <ArrowLeft className="w-4 h-4" /> Quay lại Teacher Dashboard
      </button>
      
      {/* Header Info */}
      <div className="bg-mx-dark text-white rounded-3xl p-8 mb-8 shadow-card flex flex-col md:flex-row items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">CS Handoff Report</h1>
          <p className="text-mx-text-muted text-gray-300">
            Mã phòng học: <span className="font-mono bg-black/30 px-3 py-1 rounded-lg text-white ml-2 text-xl tracking-wider">{report.session_code}</span>
          </p>
          <p className="text-sm text-gray-400 mt-2">Báo cáo tĩnh (Snapshot) được tạo lúc: {new Date(report.generated_at).toLocaleString('vi-VN')}</p>
        </div>
        
        <div className="mt-6 md:mt-0 flex gap-4 text-center">
           <div className="bg-black/30 px-4 py-3 rounded-xl border border-white/10">
             <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Tổng học sinh</div>
             <div className="text-2xl font-bold">{overall_summary.totalStudents}</div>
           </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 rounded-2xl p-6 shadow-sm border border-green-200 flex items-start gap-4">
          <div className="bg-green-100 p-3 rounded-full text-green-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-green-800 text-sm font-semibold mb-1 uppercase tracking-wider">Nhóm Xanh (Green)</h3>
            <p className="text-3xl font-bold text-green-600">{overall_summary.greenCount}</p>
            <p className="text-sm text-green-700 mt-2">Đạt &gt;= 80% mục tiêu, ít dùng hint. Không cần can thiệp nhiều.</p>
          </div>
        </div>
        
        <div className="bg-yellow-50 rounded-2xl p-6 shadow-sm border border-yellow-200 flex items-start gap-4">
          <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-yellow-800 text-sm font-semibold mb-1 uppercase tracking-wider">Nhóm Vàng (Yellow)</h3>
            <p className="text-3xl font-bold text-yellow-600">{overall_summary.yellowCount}</p>
            <p className="text-sm text-yellow-700 mt-2">Cần quan tâm thêm. Có nỗ lực nhưng dùng nhiều hint hoặc đạt mức TB.</p>
          </div>
        </div>
        
        <div className="bg-red-50 rounded-2xl p-6 shadow-sm border border-red-200 flex items-start gap-4">
          <div className="bg-red-100 p-3 rounded-full text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-red-800 text-sm font-semibold mb-1 uppercase tracking-wider">Nhóm Đỏ (Red)</h3>
            <p className="text-3xl font-bold text-red-600">{overall_summary.redCount}</p>
            <p className="text-sm text-red-700 mt-2">Báo động: Chưa đạt, kẹt lại hoặc không tham gia làm bài.</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <h2 className="text-2xl font-bold mb-6">Chi tiết học viên</h2>
      
      <div className="flex flex-col gap-6">
        {students_report.map((student: any) => {
          const isGreen = student.cs_status === 'Green';
          const isYellow = student.cs_status === 'Yellow';
          const isRed = student.cs_status === 'Red';
          
          return (
            <div key={student.participant_id} className={`bg-white rounded-2xl p-6 shadow-sm border-l-8 ${isGreen ? 'border-l-green-500' : isYellow ? 'border-l-yellow-400' : 'border-l-red-500'} border-t border-r border-b border-gray-200`}>
              <div className="flex justify-between items-start mb-4 border-b pb-4">
                 <div>
                   <h3 className="text-xl font-bold flex items-center gap-2">
                     {student.name} 
                     <span className="text-sm font-mono text-gray-500 font-normal bg-gray-100 px-2 py-0.5 rounded">{student.student_code}</span>
                   </h3>
                   <div className="flex gap-3 mt-2 text-sm">
                     <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">Lớp {student.grade}</span>
                     <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded">Chủ đề: {student.topic}</span>
                     <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded capitalize">Status: {student.self_study_progress}</span>
                   </div>
                 </div>
                 <div className="text-right">
                    <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">Mức độ hoàn thành</div>
                    <div className={`text-3xl font-bold ${isGreen ? 'text-green-600' : isYellow ? 'text-yellow-500' : 'text-red-600'}`}>
                      {student.goal_completion_percent}%
                    </div>
                 </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Thông số học tập</h4>
                  <ul className="text-sm space-y-2">
                    <li><span className="text-gray-500 w-32 inline-block">Mục tiêu:</span> <span className="font-medium text-gray-800">{student.goal}</span></li>
                    <li><span className="text-gray-500 w-32 inline-block">KQ Bài tập:</span> <span className="font-medium text-gray-800">{student.practice_result}</span></li>
                    <li><span className="text-gray-500 w-32 inline-block">Gợi ý AI (Hints):</span> <span className="font-medium text-gray-800">{student.hints_used} lần</span></li>
                    <li><span className="text-gray-500 w-32 inline-block">Điểm thi đua:</span> <span className="font-medium text-gray-800">{student.competitive_score} pts</span></li>
                  </ul>
                  
                  {student.teacher_note && (
                    <div className="mt-4 bg-orange-50 p-3 rounded-lg border border-orange-100">
                      <span className="font-semibold text-orange-800 text-xs uppercase block mb-1">Ghi chú từ Giáo viên:</span>
                      <p className="text-sm text-orange-900">{student.teacher_note}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Góc CS (Dành cho tư vấn)</h4>
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 h-full">
                     <div className="mb-4">
                       <span className="font-semibold text-blue-800 text-xs uppercase block mb-1 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3"/> Gợi ý nói chuyện với Phụ Huynh (AI sinh):
                       </span>
                       <p className="text-sm text-blue-900 italic font-medium leading-relaxed">
                         "{student.parent_talking_points}"
                       </p>
                     </div>
                     <div>
                       <span className="font-semibold text-gray-600 text-xs uppercase block mb-1">Đề xuất lộ trình tiếp theo:</span>
                       <p className="text-sm text-gray-700">
                         {student.recommended_next_steps}
                       </p>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {students_report.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl">
            Không có dữ liệu học viên trong báo cáo này.
          </div>
        )}
      </div>
      
      <div className="mt-12 text-center text-sm text-gray-400">
         * Dữ liệu trong báo cáo này là bản lưu tĩnh (Read-only Snapshot) không thể chỉnh sửa. Phục vụ mục đích bàn giao cho bộ phận CSKH.
      </div>
    </div>
  );
}
