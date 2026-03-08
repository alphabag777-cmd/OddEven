-- ══════════════════════════════════════════════
-- ODD/EVEN 게임 초기 스키마
-- ══════════════════════════════════════════════

-- 유저 테이블
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  balance REAL DEFAULT 0,
  deposit_address TEXT NOT NULL,
  total_deposit REAL DEFAULT 0,
  total_withdraw REAL DEFAULT 0,
  total_bet_amount REAL DEFAULT 0,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by TEXT,
  total_earned REAL DEFAULT 0,
  referral_earnings REAL DEFAULT 0,
  is_admin INTEGER DEFAULT 0,
  is_banned INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  last_ip TEXT DEFAULT '',
  login_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);

-- 세션 테이블
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- 라운드 테이블
CREATE TABLE IF NOT EXISTS rounds (
  id INTEGER PRIMARY KEY,
  status TEXT DEFAULT 'betting',
  start_time INTEGER NOT NULL,
  end_time INTEGER NOT NULL,
  result TEXT,
  hash_value TEXT,
  server_seed TEXT NOT NULL,
  server_seed_hash TEXT NOT NULL,
  block_height INTEGER NOT NULL,
  total_odd REAL DEFAULT 0,
  total_even REAL DEFAULT 0,
  total_payout REAL DEFAULT 0,
  bet_count INTEGER DEFAULT 0,
  settled INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

-- 베팅 테이블
CREATE TABLE IF NOT EXISTS bets (
  id TEXT PRIMARY KEY,
  round_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  choice TEXT NOT NULL,
  amount REAL NOT NULL,
  win INTEGER DEFAULT 0,
  payout REAL DEFAULT 0,
  settled INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (round_id) REFERENCES rounds(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_bets_round_id ON bets(round_id);
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_created_at ON bets(created_at DESC);

-- 출금 요청 테이블
CREATE TABLE IF NOT EXISTS withdraw_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  amount REAL NOT NULL,
  address TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at INTEGER NOT NULL,
  processed_at INTEGER,
  tx_hash TEXT,
  note TEXT DEFAULT '',
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_withdraws_user_id ON withdraw_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdraws_status ON withdraw_requests(status);

-- 입금 로그 테이블
CREATE TABLE IF NOT EXISTS deposit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  amount REAL NOT NULL,
  tx_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposit_logs(user_id);

-- 추천 관계 테이블
CREATE TABLE IF NOT EXISTS referrals (
  id TEXT PRIMARY KEY,
  referrer_id TEXT NOT NULL,
  referee_id TEXT NOT NULL,
  level INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (referrer_id) REFERENCES users(id),
  FOREIGN KEY (referee_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
