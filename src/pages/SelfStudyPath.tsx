import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import AICoachPanel from '../components/AICoachPanel';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default function SelfStudyPath() {
  const navigate = useNavigate();
  const session = useStore((state) => state.session);
  const participant = useStore((state) => state.participant);
  const setParticipant = useStore((state) => state.setParticipant);
  
  const path = participant?.study_path;
  const [completedBlocks, setCompletedBlocks] = useState<Record<string, boolean>>({});
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!session || !participant) {
      navigate('/join');
      return;
    }
    
    // Redirect logic
    if (participant.status === 'goal_practice') {
      navigate('/practice');
    } else if (participant.status === 'playing') {
      navigate('/quiz');
    }
  }, [session, participant, navigate]);

  if (!path) return null;

  const handleToggleBlock = (blockId: string) => {
    setCompletedBlocks(prev => ({
      ...prev,
      [blockId]: !prev[blockId]
    }));
  };

  const handleToggleTasks = (blockId: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [blockId]: !prev[blockId]
    }));
  };

  const isAllCompleted = path.blocks.every((b: any) => completedBlocks[b.id]);

  const handleFinishPath = async () => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .update({ status: 'goal_practice' })
        .eq('id', participant.id)
        .select()
        .single();
        
      if (error) throw error;
      setParticipant(data);
      navigate('/practice');
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
      
      {/* Left Column: Path */}
      <div className="flex-1">
        <div className="bg-mx-dark text-white rounded-3xl p-8 mb-6 shadow-card">
          <h1 className="text-3xl font-bold mb-2">Lộ trình tự học (60 phút)</h1>
          <p className="text-gray-300 mb-4">{path.goalSummary}</p>
          
          {/* Progress bar */}
          <div className="w-full bg-white/20 rounded-full h-3 mb-2">
            <div 
              className="bg-mx-success h-3 rounded-full transition-all duration-500" 
              style={{ width: `${(Object.values(completedBlocks).filter(Boolean).length / path.blocks.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm font-semibold">
            Tiến độ: {Object.values(completedBlocks).filter(Boolean).length} / {path.blocks.length} phần
          </p>
        </div>

        <div className="space-y-4">
          {path.blocks.map((block: any) => (
            <div 
              key={block.id} 
              className={`bg-mx-surface rounded-2xl p-6 border-2 transition-colors ${completedBlocks[block.id] ? 'border-mx-success bg-green-50' : 'border-mx-border'}`}
            >
              <div className="flex items-start gap-4">
                <button 
                  onClick={() => handleToggleBlock(block.id)}
                  className={`mt-1 flex-shrink-0 ${completedBlocks[block.id] ? 'text-mx-success' : 'text-mx-text-muted hover:text-mx-primary'}`}
                >
                  {completedBlocks[block.id] ? <CheckCircle className="w-8 h-8" /> : <Circle className="w-8 h-8" />}
                </button>
                
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold">{block.title}</h3>
                    <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-1 rounded-md">
                      {block.durationMinutes} phút
                    </span>
                  </div>
                  <p className="text-mx-text whitespace-pre-wrap">{block.content}</p>

                  {block.practiceTasks && block.practiceTasks.length > 0 && (
                    <div className="mt-4">
                      <button
                        onClick={() => handleToggleTasks(block.id)}
                        className="flex items-center gap-2 text-sm font-semibold text-mx-primary hover:text-mx-primary-dark transition-colors bg-blue-50 px-3 py-2 rounded-lg w-full text-left"
                      >
                        📝 Xem bài tập thực hành ({block.practiceTasks.length} bài)
                        <span className="ml-auto text-xs">{expandedTasks[block.id] ? '▲ Thu gọn' : '▼ Mở rộng'}</span>
                      </button>
                      
                      {expandedTasks[block.id] && (
                        <div className="mt-2 bg-white border border-blue-100 rounded-lg p-4 shadow-sm">
                          <p className="text-xs text-gray-500 mb-3 italic">Hãy chọn và làm các bài tập sau để lấp đầy {block.durationMinutes} phút tự học nhé!</p>
                          <ul className="space-y-3">
                            {block.practiceTasks.map((task: string, idx: number) => (
                              <li key={idx} className="flex gap-3 text-sm">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs">
                                  {idx + 1}
                                </span>
                                <span className="text-gray-800 inline-block [&_p]:inline">
                                  <ReactMarkdown
                                    remarkPlugins={[remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                  >
                                    {task}
                                  </ReactMarkdown>
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleFinishPath}
            disabled={!isAllCompleted}
            className={`flex items-center gap-2 font-bold py-4 px-8 rounded-xl shadow-md transition-colors ${
              isAllCompleted 
                ? 'bg-mx-primary text-white hover:bg-mx-primary-dark' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Vào phần Giải bài (Goal Practice)
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Right Column: AI Coach Panel */}
      <div className="w-[400px] flex-shrink-0 hidden lg:block">
        <AICoachPanel />
      </div>
    </div>
  );
}
