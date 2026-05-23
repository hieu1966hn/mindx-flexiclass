-- Migration 004: Soft Kick Feature

-- Thêm cột lưu thông tin bị kick
ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS kicked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS kicked_reason TEXT;

-- Cập nhật Constraint để bổ sung trạng thái 'kicked'
ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_status_check;
ALTER TABLE participants ADD CONSTRAINT participants_status_check 
CHECK (status IN ('joined', 'goal_intake', 'self_study', 'goal_practice', 'playing', 'completed', 'stuck', 'kicked'));

-- Thông báo cho PostgREST reload cache schema
NOTIFY pgrst, 'reload schema';
