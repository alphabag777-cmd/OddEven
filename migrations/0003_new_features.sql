-- ══════════════════════════════════════════════
-- 신규 기능 마이그레이션
-- ══════════════════════════════════════════════

-- 1. 로그인 브루트포스 방어 컬럼 추가
ALTER TABLE users ADD COLUMN login_fail_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN locked_until INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN admin_memo TEXT DEFAULT '';

-- 2. 대리점(파트너) 테이블
CREATE TABLE IF NOT EXISTS partners (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,          -- 파트너 고유 코드 (URL에 사용)
  name TEXT NOT NULL,                  -- 파트너 플랫폼명
  owner_username TEXT NOT NULL,        -- 파트너 운영자 아이디
  commission_rate REAL DEFAULT 0.05,   -- 하우스 수익의 몇 % (기본 5%)
  total_earned REAL DEFAULT 0,         -- 누적 수당
  total_bet_via REAL DEFAULT 0,        -- 해당 파트너 링크로 가입 유저들의 누적 베팅
  user_count INTEGER DEFAULT 0,        -- 파트너 링크로 가입한 유저 수
  is_active INTEGER DEFAULT 1,
  note TEXT DEFAULT '',
  created_at INTEGER NOT NULL,
  last_paid_at INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_partners_code ON partners(code);

-- 3. 유저에 파트너 코드 컬럼 추가
ALTER TABLE users ADD COLUMN partner_code TEXT DEFAULT '';

-- 4. 파트너 수당 지급 로그
CREATE TABLE IF NOT EXISTS partner_earning_logs (
  id TEXT PRIMARY KEY,
  partner_code TEXT NOT NULL,
  user_id TEXT NOT NULL,
  bet_amount REAL NOT NULL,
  commission_amount REAL NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_partner_logs_code ON partner_earning_logs(partner_code);
CREATE INDEX IF NOT EXISTS idx_partner_logs_created ON partner_earning_logs(created_at DESC);

-- 5. 공지사항 다국어 지원 컬럼 추가
ALTER TABLE notices ADD COLUMN content_en TEXT DEFAULT '';
ALTER TABLE notices ADD COLUMN content_zh TEXT DEFAULT '';
ALTER TABLE notices ADD COLUMN content_ja TEXT DEFAULT '';

-- 6. 1:1 문의 테이블
CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',   -- general | deposit | withdraw | bet | other
  status TEXT DEFAULT 'pending',     -- pending | answered | closed
  admin_reply TEXT DEFAULT '',
  admin_reply_at INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_inquiries_user_id ON inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries(created_at DESC);

-- 7. FAQ 테이블
CREATE TABLE IF NOT EXISTS faqs (
  id TEXT PRIMARY KEY,
  category TEXT DEFAULT 'general',   -- general | deposit | withdraw | bet | referral | partner
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  question_en TEXT DEFAULT '',
  answer_en TEXT DEFAULT '',
  question_zh TEXT DEFAULT '',
  answer_zh TEXT DEFAULT '',
  question_ja TEXT DEFAULT '',
  answer_ja TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_active ON faqs(is_active, sort_order);
