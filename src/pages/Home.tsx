import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { useState } from 'react';

export default function Home() {
  const navigate = useNavigate();
  const setRole = useStore((state) => state.setRole);
  const setSession = useStore((state) => state.setSession);
  const setHostToken = useStore((state) => state.setHostToken);

  const handleCreateRoom = () => {
    navigate('/templates');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-mx-primary mb-4">MindX Math Arena</h1>
        <p className="text-mx-text-muted text-lg max-w-lg mx-auto">
          Cùng học Toán, mỗi bạn một thử thách đúng trình độ. Mô hình thi đua học tập dành cho học sinh THCS.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl justify-center">
        {/* Teacher Card */}
        <div className="flex-1 bg-mx-surface rounded-3xl shadow-card border border-mx-border p-8 flex flex-col items-center text-center">
          <h2 className="text-2xl font-semibold mb-2">Giáo viên</h2>
          <p className="text-mx-text-muted text-sm mb-6">
            Tạo phòng học chung, quản lý và theo dõi tiến độ của học sinh theo thời gian thực.
          </p>
          <button 
            onClick={handleCreateRoom}
            className="w-full rounded-full bg-mx-primary px-6 py-3 font-semibold text-white shadow-md hover:bg-mx-primary-dark transition-colors"
          >
            Tạo phòng học mới
          </button>
        </div>

        {/* Student Card */}
        <div className="flex-1 bg-mx-surface rounded-3xl shadow-card border border-mx-border p-8 flex flex-col items-center text-center">
          <h2 className="text-2xl font-semibold mb-2">Học sinh</h2>
          <p className="text-mx-text-muted text-sm mb-6">
            Tham gia phòng học đã được giáo viên tạo. Hoàn thành thử thách Toán học cá nhân hóa.
          </p>
          <button 
            onClick={() => {
              setRole('student');
              navigate('/join');
            }}
            className="w-full rounded-full bg-mx-accent-blue px-6 py-3 font-semibold text-white shadow-md hover:bg-blue-700 transition-colors"
          >
            Vào phòng học
          </button>
        </div>
      </div>
    </div>
  );
}
