-- ═══════════════════════════════════════════════
-- 0008: Web3 지갑 로그인 + P2P 배틀룸
-- ═══════════════════════════════════════════════

-- 1) 유저 테이블에 지갑 주소 컬럼 추가
ALTER TABLE users ADD COLUMN wallet_address TEXT;
ALTER TABLE users ADD COLUMN wallet_type TEXT;  -- metamask, trustwallet, tokenpocket

-- 지갑 주소 유니크 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address) WHERE wallet_address IS NOT NULL;

-- 2) Web3 nonce 테이블 (서명 검증용 일회성 토큰)
CREATE TABLE IF NOT EXISTS web3_nonces (
  id         TEXT PRIMARY KEY,
  address    TEXT NOT NULL,
  nonce      TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  used       INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_nonces_address ON web3_nonces(address);

-- 3) P2P 배틀룸 베팅 테이블
CREATE TABLE IF NOT EXISTS p2p_bets (
  id           TEXT PRIMARY KEY,
  round_id     TEXT NOT NULL,
  user_id      TEXT NOT NULL,
  choice       TEXT NOT NULL,  -- odd | even
  amount       REAL NOT NULL,
  payout       REAL,           -- 실제 지급액 (결과 후 계산)
  win          INTEGER,        -- 1=win, 0=lose, null=pending
  fee_taken    REAL,           -- 수수료
  created_at   INTEGER NOT NULL,
  settled_at   INTEGER
);
CREATE INDEX IF NOT EXISTS idx_p2pbets_round ON p2p_bets(round_id);
CREATE INDEX IF NOT EXISTS idx_p2pbets_user  ON p2p_bets(user_id);

-- 4) P2P 라운드 테이블 (별도 관리)
CREATE TABLE IF NOT EXISTS p2p_rounds (
  id              TEXT PRIMARY KEY,
  room            TEXT NOT NULL DEFAULT 'battle',
  phase           TEXT NOT NULL DEFAULT 'betting',  -- betting | result | settled
  start_time      INTEGER NOT NULL,
  bet_end_time    INTEGER NOT NULL,
  result_time     INTEGER NOT NULL,
  result          TEXT,         -- odd | even
  server_seed     TEXT NOT NULL,
  server_seed_hash TEXT NOT NULL,
  block_height    INTEGER,
  total_odd       REAL NOT NULL DEFAULT 0,
  total_even      REAL NOT NULL DEFAULT 0,
  bet_count       INTEGER NOT NULL DEFAULT 0,
  house_fee       REAL NOT NULL DEFAULT 0,
  created_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_p2prounds_phase ON p2p_rounds(phase);
