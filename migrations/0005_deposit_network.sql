-- 0005: deposit_logs에 network, memo 컬럼 추가
--       game/withdraw 설정 키 초기값 등록

ALTER TABLE deposit_logs ADD COLUMN network TEXT DEFAULT 'manual';
ALTER TABLE deposit_logs ADD COLUMN memo    TEXT DEFAULT '';

-- 게임/출금 기본 설정값 등록 (없는 경우에만)
INSERT OR IGNORE INTO site_settings (key, value, updated_at) VALUES
  ('game_payout',              '1.90',  0),
  ('game_min_bet',             '0.1',   0),
  ('game_max_bet',             '1000',  0),
  ('game_l1_rate',             '0.025', 0),
  ('game_l2_rate',             '0.010', 0),
  ('withdraw_fee',             '1',     0),
  ('withdraw_min_amount',      '1',     0),
  ('withdraw_bet_requirement', '0.5',   0);
