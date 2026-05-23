-- Migration 003: AI Goal Chatbot Sessions

-- 1. Bổ sung các cột theo dõi phase cho shared session
ALTER TABLE sessions 
ADD COLUMN current_phase TEXT DEFAULT 'waiting' CHECK (current_phase IN ('waiting', 'goal-intake', 'self-study', 'goal-practice', 'competitive', 'ended')),
ADD COLUMN phase_started_at TIMESTAMPTZ,
ADD COLUMN phase_duration_minutes INTEGER;

-- 2. Tạo bảng chat_sessions cho từng học viên
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  student_code TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'locked')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  locked_at TIMESTAMPTZ,
  summary JSONB DEFAULT '{}'::jsonb,
  UNIQUE(session_id, participant_id) -- Ràng buộc không tạo trùng chatbot session
);

-- Bật RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Policy (Dùng policy mở cho Demo)
CREATE POLICY "Cho phép đọc chat_sessions" ON chat_sessions FOR SELECT USING (true);
CREATE POLICY "Cho phép tạo chat_sessions" ON chat_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Cho phép cập nhật chat_sessions" ON chat_sessions FOR UPDATE USING (true);

-- 3. Tạo bảng chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sequence_index INTEGER NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('student', 'ai', 'system')),
  message_type TEXT NOT NULL CHECK (message_type IN ('goal_analysis', 'hint', 'explanation', 'evaluation', 'report', 'free_question')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Đảm bảo tin nhắn trong cùng 1 session không trùng index
ALTER TABLE chat_messages ADD CONSTRAINT unique_chat_sequence UNIQUE(chat_session_id, sequence_index);

-- Bật RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy (Dùng policy mở cho Demo)
CREATE POLICY "Cho phép đọc chat_messages" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Cho phép tạo chat_messages" ON chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Cho phép cập nhật chat_messages" ON chat_messages FOR UPDATE USING (true);
