import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Award, BookOpen, Target, FileText, CheckSquare, MessageCircle } from 'lucide-react';

export default function StudentReport() {
  const navigate = useNavigate();
  const session = useStore((state) => state.session);
  const participant = useStore((state) => state.participant);
  
  useEffect(() => {
    if (!session || !participant) {
      navigate('/');
    }
  }, [session, participant, navigate]);

  if (!session || !participant) return null;

  const goalData = participant.goal_data;
  const evalData = participant.practice_eval;
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 text-mx-primary">Báo cáo học tập (Take-home Report)</h1>
        <p className="text-lg text-mx-text-muted">Tổng kết buổi học tự do (Goal-based Self-study) của bạn.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Goal Summary */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-mx-border">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-6 h-6 text-mx-accent-blue" />
            <h2 className="text-xl font-bold">Mục tiêu ban đầu</h2>
          </div>
          <div className="bg-blue-50 text-blue-900 p-4 rounded-xl text-sm font-medium mb-4">
            {goalData?.text || 'Không có nội dung text'}
            {goalData?.fileName && <div className="mt-1 italic opacity-75">File đính kèm: {goalData.fileName}</div>}
          </div>
          
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-500 mb-1">Chủ đề kiến thức (AI Map):</p>
            <p className="font-bold">{goalData?.mapping?.topic || 'Không xác định'}</p>
          </div>
        </div>

        {/* Practice Eval */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-mx-border">
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="w-6 h-6 text-mx-success" />
            <h2 className="text-xl font-bold">Kết quả tự luyện</h2>
          </div>
          
          <div className="flex justify-between items-center bg-green-50 p-4 rounded-xl mb-4">
            <div>
              <p className="text-sm text-green-700 font-medium">Trạng thái</p>
              <p className="text-2xl font-bold text-green-800">{evalData?.status || 'Chưa làm'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-700 font-medium">Mức độ hoàn thành</p>
              <p className="text-2xl font-bold text-green-800">{evalData?.completionPercentage || 0}%</p>
            </div>
          </div>
          
          <p className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
            <strong>Nhận xét AI:</strong> {evalData?.improvementHint || 'Không có nhận xét.'}
          </p>
        </div>
      </div>

      {/* Activity Stats & Teacher Note */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-card border border-mx-border text-center">
          <MessageCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <h3 className="text-gray-500 text-sm font-medium">Lượt dùng Hint</h3>
          <p className="text-3xl font-bold text-amber-600">{participant.hints_used} / 3</p>
        </div>
        
        <div className="bg-white rounded-3xl p-6 shadow-card border border-mx-border text-center">
          <Award className="text-purple-500 mx-auto mb-2" />
          <h3 className="text-gray-500 text-sm font-medium">Điểm Competitive</h3>
          <p className="text-3xl font-bold text-purple-600">{participant.score}</p>
          {participant.team && <p className="text-xs text-gray-500 mt-1">Đội: {participant.team === 'blue' ? 'Xanh' : 'Đỏ'}</p>}
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-card border border-mx-border flex flex-col justify-center">
          <h3 className="text-sm font-bold text-gray-500 mb-2 flex items-center gap-1">
            <BookOpen className="w-4 h-4" /> Lời nhắn từ Giáo viên:
          </h3>
          {participant.teacher_note ? (
            <p className="text-sm italic font-medium text-gray-800">"{participant.teacher_note}"</p>
          ) : (
            <p className="text-sm text-gray-400 italic">Không có ghi chú.</p>
          )}
        </div>
      </div>

      <div className="mt-12 flex justify-center">
        <button 
          onClick={() => {
            useStore.getState().reset();
            navigate('/');
          }}
          className="bg-gray-200 text-gray-700 font-bold py-3 px-8 rounded-full hover:bg-gray-300 transition-colors"
        >
          Quay lại trang chủ
        </button>
      </div>
    </div>
  );
}
