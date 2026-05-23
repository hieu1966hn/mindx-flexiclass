import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ACTIVITY_TEMPLATES, TemplateStatus } from '../lib/activityTemplates';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { ArrowLeft, Loader2, Play } from 'lucide-react';
import clsx from 'clsx';

export default function TemplateLibrary() {
  const navigate = useNavigate();
  const setSession = useStore((state) => state.setSession);
  const setHostToken = useStore((state) => state.setHostToken);
  const setRole = useStore((state) => state.setRole);
  
  const [loadingTemplate, setLoadingTemplate] = useState<string | null>(null);

  const generateRoomCode = () => {
    return 'MATH-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  };

  const handleSelectTemplate = async (templateId: string, status: TemplateStatus) => {
    if (status !== 'available') return;
    
    setLoadingTemplate(templateId);
    try {
      const roomCode = generateRoomCode();
      const hostToken = Math.random().toString(36).substring(2, 10);
      
      const { data, error } = await supabase
        .from('sessions')
        .insert([
          { 
            code: roomCode, 
            status: 'waiting', 
            host_token: hostToken,
            template_id: templateId,
            duration_minutes: 8
          }
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      setSession(data);
      setHostToken(hostToken);
      setRole('teacher');
      navigate(`/teacher/dashboard`);
    } catch (err) {
      console.error('Error creating session:', err);
      alert('Không thể tạo phòng, vui lòng xem console log.');
    } finally {
      setLoadingTemplate(null);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-mx-text-muted hover:text-mx-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>

        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-3">Thư viện Hoạt động (Template Library)</h1>
          <p className="text-mx-text-muted max-w-2xl">
            Chọn một mô hình hoạt động phù hợp cho buổi học. Các hoạt động "Available" đã sẵn sàng sử dụng, các hoạt động "Preview" đang trong lộ trình phát triển.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ACTIVITY_TEMPLATES.map((tpl) => {
            const Icon = tpl.icon;
            const isAvailable = tpl.status === 'available';
            
            return (
              <div 
                key={tpl.id} 
                className={clsx(
                  "bg-mx-surface rounded-3xl p-6 border-2 transition-all relative overflow-hidden group",
                  isAvailable 
                    ? "border-transparent shadow-card hover:border-mx-primary/20 hover:shadow-card-hover cursor-pointer" 
                    : "border-mx-border/50 bg-mx-surface-soft opacity-80 cursor-not-allowed"
                )}
                onClick={() => handleSelectTemplate(tpl.id, tpl.status)}
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {isAvailable ? (
                    <span className="bg-mx-success/10 text-mx-success text-xs font-bold px-3 py-1 rounded-full">Available</span>
                  ) : (
                    <span className="bg-mx-text-muted/10 text-mx-text-muted text-xs font-bold px-3 py-1 rounded-full">Preview</span>
                  )}
                </div>

                <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center mb-5", isAvailable ? "bg-mx-bg" : "bg-white")}>
                  <Icon className={clsx("w-7 h-7", tpl.color)} />
                </div>
                
                <h3 className="text-xl font-bold mb-2">{tpl.title}</h3>
                <p className="text-mx-text-muted text-sm leading-relaxed mb-6">
                  {tpl.description}
                </p>

                {isAvailable && (
                  <button className="flex items-center gap-2 text-mx-primary font-semibold text-sm group-hover:translate-x-1 transition-transform">
                    {loadingTemplate === tpl.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    Chọn Template Này
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
