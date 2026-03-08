-- 관리자 대량 메시지 테이블
CREATE TABLE IF NOT EXISTS user_messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_user_messages_user ON user_messages(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_user_messages_created ON user_messages(created_at DESC);
