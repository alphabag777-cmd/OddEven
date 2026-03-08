-- ══════════════════════════════════════════════
-- 개선사항 마이그레이션
-- ══════════════════════════════════════════════

-- 1. 세션 만료 컬럼 추가
ALTER TABLE sessions ADD COLUMN expires_at INTEGER NOT NULL DEFAULT 0;

-- 기존 세션 만료 시간 설정 (지금부터 7일)
UPDATE sessions SET expires_at = (strftime('%s','now') * 1000) + (7 * 24 * 60 * 60 * 1000);

-- 2. 공지사항 테이블
CREATE TABLE IF NOT EXISTS notices (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'info',   -- info | warning | danger
  is_active INTEGER DEFAULT 1,
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 3. 히스토리 페이지네이션을 위한 인덱스 (이미 있을 수 있으나 IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_rounds_settled_id ON rounds(settled, id DESC);
