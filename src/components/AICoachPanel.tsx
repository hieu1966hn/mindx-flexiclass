import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { addChatMessage } from '../lib/chatService';
import { Bot, User, Send, Loader2, Lock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

export default function AICoachPanel() {
  const session = useStore((state) => state.session);
  const chatSession = useStore((state) => state.chatSession);
  const chatMessages = useStore((state) => state.chatMessages);
  const addMessageToStore = useStore((state) => state.addChatMessage);
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  if (!chatSession) return null;

  const handleSend = async () => {
    if (!input.trim() || chatSession.status === 'locked' || isTyping) return;
    
    // Đếm số lượng tin nhắn học sinh đã gửi để kiểm soát chi phí/limit
    const studentMessageCount = chatMessages.filter(m => m.sender === 'student').length;
    if (studentMessageCount >= 10) {
      alert('Đã đạt giới hạn 10 tin nhắn AI (Demo limit). Vui lòng nộp bài để kết thúc.');
      return;
    }

    const userText = input;
    setInput('');
    setIsTyping(true);
    
    try {
      // Add user message
      const userMsg = await addChatMessage(chatSession, 'student', 'free_question', userText);
      addMessageToStore(userMsg);
      
      // Call serverless endpoint for AI response
      const response = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: userText,
          messages: chatMessages
        })
      });

      if (!response.ok) {
        throw new Error('Lỗi kết nối AI server');
      }

      const data = await response.json();
      const aiText = data.reply || "Lỗi phản hồi từ AI";
      
      const aiMsg = await addChatMessage(chatSession, 'ai', 'explanation', aiText);
      addMessageToStore(aiMsg);
      
    } catch (err) {
      console.error(err);
      alert('Không thể gửi tin nhắn.');
    } finally {
      setIsTyping(false);
    }
  };

  const isLocked = chatSession.status === 'locked' || session?.status === 'ended';

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-3xl shadow-card border border-mx-border overflow-hidden">
      <div className="bg-mx-dark text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold">
          <Bot className="w-5 h-5 text-mx-primary" />
          AI Coach
        </div>
        {isLocked && (
          <div className="flex items-center gap-1 text-xs bg-red-500/20 text-red-200 px-2 py-1 rounded-md">
            <Lock className="w-3 h-3" /> Locked
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {chatMessages.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-4">Chưa có tin nhắn nào.</p>
        )}
        
        {chatMessages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.sender === 'student' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'student' ? 'bg-blue-100 text-blue-600' : 'bg-mx-primary/10 text-mx-primary'}`}>
              {msg.sender === 'student' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
              msg.sender === 'student' 
                ? 'bg-blue-600 text-white rounded-tr-sm' 
                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
            }`}>
              {msg.sender === 'student' ? (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              ) : (
                <div className="space-y-2 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
              
              {/* Optional: Render metadata details for Goal Analysis or Evaluation */}
              {msg.message_type === 'goal_analysis' && msg.metadata?.mapping && (
                <div className="mt-2 text-xs bg-gray-100 text-gray-700 p-2 rounded-md font-mono">
                  Đã phân tích: {msg.metadata.mapping.topic}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-mx-primary/10 text-mx-primary flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 bg-white border-t border-gray-100">
        {isLocked ? (
          <div className="text-center text-sm text-red-500 font-semibold py-2">
            Phiên học đã kết thúc. Tính năng chat đã bị khóa.
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Nhắn tin cho AI Coach..."
              className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-mx-primary focus:ring-0 rounded-xl px-4 py-2 text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="bg-mx-primary text-white p-2 rounded-xl hover:bg-mx-primary-dark disabled:opacity-50 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
