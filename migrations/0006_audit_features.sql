-- 관리자 활동 로그 테이블
CREATE TABLE IF NOT EXISTS admin_logs (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  admin_username TEXT NOT NULL,
  action TEXT NOT NULL,        -- 'balance_set','balance_add','ban','unban','approve_withdraw','reject_withdraw','manual_deposit','reset_password','memo_update'
  target_user_id TEXT,
  target_username TEXT,
  detail TEXT,                 -- JSON 형태의 상세 정보
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_logs(created_at DESC);

-- 출금 일일 한도 설정을 위한 site_settings 추가
-- (이미 site_settings 테이블 존재, INSERT OR IGNORE로 기본값 추가)
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('daily_withdraw_limit', '0');
-- 0 = 무제한

-- 공지사항 예약 발송용 publish_at 컬럼 추가
ALTER TABLE notices ADD COLUMN publish_at INTEGER DEFAULT 0;

-- 유저 개인 통계를 위한 일별 손익 집계 뷰는 쿼리로 처리 (별도 테이블 불필요)
