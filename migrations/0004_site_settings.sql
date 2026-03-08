-- ══════════════════════════════════════════════════════
-- 0004: 사이트 설정 테이블 (본사 입금주소, 네트워크 관리)
-- ══════════════════════════════════════════════════════

-- 사이트 전역 설정 테이블
CREATE TABLE IF NOT EXISTS site_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at INTEGER DEFAULT 0
);

-- 기본값 삽입
INSERT OR IGNORE INTO site_settings (key, value, updated_at) VALUES
  -- TRC20 (TRON) 설정
  ('deposit_trc20_enabled', '1', 0),
  ('deposit_trc20_address', '', 0),
  ('deposit_trc20_memo',    'TRC20(TRON) 네트워크 전용 USDT 주소입니다. 반드시 TRC20으로 전송하세요.', 0),

  -- ERC20 (Ethereum) 설정
  ('deposit_erc20_enabled', '0', 0),
  ('deposit_erc20_address', '', 0),
  ('deposit_erc20_memo',    'ERC20(Ethereum) 네트워크 전용 USDT 주소입니다. 가스비가 발생할 수 있습니다.', 0),

  -- BEP20 (BSC) 설정
  ('deposit_bep20_enabled', '0', 0),
  ('deposit_bep20_address', '', 0),
  ('deposit_bep20_memo',    'BEP20(BSC) 네트워크 전용 USDT 주소입니다.', 0),

  -- TRC20 (TRON) USDT - 영문 안내
  ('deposit_trc20_memo_en', 'USDT deposit address (TRC20/TRON network). Always use TRC20 when transferring.', 0),
  ('deposit_erc20_memo_en', 'USDT deposit address (ERC20/Ethereum). Gas fees may apply.', 0),
  ('deposit_bep20_memo_en', 'USDT deposit address (BEP20/BSC network).', 0),

  -- 최소 입금액
  ('deposit_min_amount', '1', 0),

  -- 사이트명 / 슬로건
  ('site_name',   'ODD/EVEN', 0),
  ('site_slogan', '블록체인 공정', 0);
