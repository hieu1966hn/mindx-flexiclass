import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { mockAnalyzeGoal, mockGenerateStudyPath } from '../lib/mockAI';
import { getOrCreateChatSession, addChatMessage, getChatMessages } from '../lib/chatService';
import { Upload, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';

export default function StudentGoalIntake() {
  const navigate = useNavigate();
  const session = useStore((state) => state.session);
  const participant = useStore((state) => state.participant);
  const setParticipant = useStore((state) => state.setParticipant);
  const setChatSession = useStore((state) => state.setChatSession);
  const setChatMessages = useStore((state) => state.setChatMessages);
  
  const [goalText, setGoalText] = useState('');
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<{name: string, data?: string, error?: string}[]>([]);

  useEffect(() => {
    if (!session || !participant) {
      navigate('/join');
      return;
    }

    // Initialize or restore chat session
    const initChat = async () => {
      try {
        const cs = await getOrCreateChatSession(session.id, participant.id, participant.student_code);
        setChatSession(cs);
        const msgs = await getChatMessages(cs.id);
        setChatMessages(msgs);
        
        // If already submitted goal, skip to path
        if (participant.status !== 'joined' && participant.status !== 'goal_intake') {
           navigate('/path');
        }
      } catch (err) {
        console.error('Error init chat session', err);
      }
    };
    initChat();
  }, [session, participant, navigate, setChatSession, setChatMessages]);

  if (!session || !participant) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const newFiles: {name: string, data?: string, error?: string}[] = [];
      let pendingFiles = selectedFiles.length;

      selectedFiles.forEach((file) => {
        const isImage = file.type.startsWith('image/');
        
        if (isImage) {
          if (file.size > 1024 * 1024) {
            newFiles.push({ name: file.name, error: 'File lớn hơn 1MB, bản demo chỉ lưu tên.' });
            pendingFiles--;
            if (pendingFiles === 0) setFiles(prev => [...prev, ...newFiles]);
          } else {
            const reader = new FileReader();
            reader.onload = (event) => {
              newFiles.push({ name: file.name, data: event.target?.result as string });
              pendingFiles--;
              if (pendingFiles === 0) setFiles(prev => [...prev, ...newFiles]);
            };
            reader.onerror = () => {
              newFiles.push({ name: file.name, error: 'Lỗi đọc file.' });
              pendingFiles--;
              if (pendingFiles === 0) setFiles(prev => [...prev, ...newFiles]);
            };
            reader.readAsDataURL(file);
          }
        } else {
          // If not an image (e.g. PDF or DOC), just store the name
          newFiles.push({ name: file.name, error: 'Bản Demo chỉ lưu tên file với định dạng này.' });
          pendingFiles--;
          if (pendingFiles === 0) setFiles(prev => [...prev, ...newFiles]);
        }
      });
    }
  };

  const handleSubmit = async () => {
    if (!goalText.trim() && files.length === 0) return;
    
    setLoading(true);
    try {
      const cs = useStore.getState().chatSession;
      if (!cs) throw new Error('Chat session not initialized');

      // 1. Student sends goal message
      const fileNamesStr = files.map(f => f.name).join(', ');
      const msgContent = goalText || (fileNamesStr ? `[Đã tải lên tệp: ${fileNamesStr}]` : '');
      const studentMsg = await addChatMessage(cs, 'student', 'free_question', msgContent);
      useStore.getState().addChatMessage(studentMsg);

      // 2. Analyze Goal
      const mapping = await mockAnalyzeGoal(goalText || fileNamesStr || 'Bài tập toán', participant.grade);
      
      // 3. Generate Path
      const path = await mockGenerateStudyPath(mapping);
      
      // 4. AI sends response message
      const aiMsg = await addChatMessage(cs, 'ai', 'goal_analysis', 'Đây là lộ trình tự học tôi đã thiết kế cho bạn dựa trên mục tiêu này.', { mapping, path });
      useStore.getState().addChatMessage(aiMsg);

      // 5. Update participant status & JSONB fallbacks
      const goalData = { text: goalText, files: files, mapping: mapping };
      
      const { data, error } = await supabase
        .from('participants')
        .update({
          goal_data: goalData,
          study_path: path,
          status: 'self_study'
        })
        .eq('id', participant.id)
        .select()
        .single();
        
      if (error) throw error;
      
      setParticipant(data);
      navigate('/path');
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi phân tích mục tiêu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-3">Mục tiêu hôm nay của bạn là gì?</h1>
        <p className="text-mx-text-muted">Hệ thống AI sẽ phân tích và lập lộ trình tự học cá nhân hóa cho bạn.</p>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl mb-8 flex gap-3 text-sm">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="block mb-1">Cảnh báo bảo mật (PII Warning)</strong>
          Vui lòng KHÔNG upload bài có chứa thông tin thật: <b>tên thật, số điện thoại, email, tên trường/lớp thật</b>. Bản demo sử dụng API AI công cộng.
        </div>
      </div>
      
      <div className="bg-mx-surface rounded-3xl p-8 shadow-card border border-mx-border">
        <div className="mb-6">
          <label className="block font-semibold mb-2">Nhập nội dung bài tập / Mục tiêu (Text)</label>
          <textarea
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            placeholder="Ví dụ: Thầy giao bài tập về nhà về rút gọn phân số..."
            className="w-full bg-mx-bg border-2 border-mx-border rounded-xl px-4 py-3 focus:outline-none focus:border-mx-primary min-h-[120px] resize-none"
          />
        </div>
        
        <div className="mb-8">
          <label className="block font-semibold mb-2">Hoặc Upload ảnh/file bài tập (Tùy chọn)</label>
          <div className="border-2 border-dashed border-mx-border rounded-xl p-6 text-center hover:bg-gray-50 transition-colors relative">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx"
              multiple
            />
            {files.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {files.map((file, idx) => (
                  <div key={idx} className="flex flex-col items-center p-2 border rounded bg-white">
                    {file.data ? (
                      <img src={file.data} alt={file.name} className="h-20 object-contain mb-2 rounded" />
                    ) : (
                      <div className="h-20 w-20 flex items-center justify-center bg-gray-100 rounded mb-2">
                        <Upload className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <p className="font-semibold text-mx-primary text-xs truncate w-full" title={file.name}>{file.name}</p>
                    {file.error && <p className="text-[10px] text-red-500 text-center leading-tight mt-1">{file.error}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-mx-text-muted mx-auto mb-2" />
                <p className="text-mx-text-muted text-sm">
                  Kéo thả hoặc bấm để tải lên (Image, PDF, DOC)
                </p>
                <p className="italic text-xs text-amber-600 font-medium mt-2">Ảnh {'<'} 1MB sẽ được lưu để hiển thị ở màn sau. Bạn có thể chọn nhiều file.</p>
              </>
            )}
          </div>
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={loading || (!goalText.trim() && files.length === 0)}
          className="w-full flex items-center justify-center gap-2 bg-mx-primary text-white font-bold py-4 rounded-xl shadow-md hover:bg-mx-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              AI đang phân tích lộ trình...
            </>
          ) : (
            <>
              Tạo lộ trình học tập
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
