-- 유저 개인 메시지 테이블 (관리자가 발송하는 팝업 메시지)
CREATE TABLE IF NOT EXISTS user_messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_user_messages_user ON user_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_read ON user_messages(user_id, is_read);
