-- Migration 005: CS Handoff Reports
-- Creates a table to store immutable snapshots of sessions after they end.

CREATE TABLE IF NOT EXISTS cs_handoff_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  session_code TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  students_report JSONB DEFAULT '[]'::jsonb, -- Mảng chứa snapshot dữ liệu của từng học sinh
  overall_summary JSONB DEFAULT '{}'::jsonb, -- Tổng quan chung
  CONSTRAINT unique_session_report UNIQUE (session_id) -- Chống tạo trùng report cho cùng 1 session
);

-- Thêm trường ghi chú thêm của CS (nếu có update sau này) vào bảng participants
-- để không làm sửa đổi snapshot tĩnh. Hoặc để cs_follow_up_note trực tiếp trong JSON snapshot nếu update được.
-- Nhưng tốt nhất là cho bảng cs_handoff_reports một JSONB riêng để CS update:
ALTER TABLE cs_handoff_reports ADD COLUMN cs_follow_up_notes JSONB DEFAULT '{}'::jsonb; -- Map participant_id -> note string

-- Bật RLS
ALTER TABLE cs_handoff_reports ENABLE ROW LEVEL SECURITY;

-- Policy mở cho Demo
CREATE POLICY "Cho phép đọc cs_handoff_reports" ON cs_handoff_reports FOR SELECT USING (true);
CREATE POLICY "Cho phép tạo cs_handoff_reports" ON cs_handoff_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Cho phép cập nhật cs_handoff_reports" ON cs_handoff_reports FOR UPDATE USING (true);
