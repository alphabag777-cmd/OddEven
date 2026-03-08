// ═══════════════════════════════════════════════
// i18n 다국어
// ═══════════════════════════════════════════════
const I18N = {
  ko: {
    blockchain_fair:'블록체인 공정',login:'로그인',register:'회원가입',logout:'로그아웃',
    tab_game:'🎲 게임',tab_mypage:'👤 마이페이지',tab_wallet:'💰 지갑',
    tab_dashboard:'📊 투명성',tab_referral:'👥 추천수당',tab_verify:'🔍 검증',
    round:'라운드',sec_left:'초 남음',payout:'배당',
    seed_hash_label:'사전 공개 서버시드 해시',seed_desc:'베팅 전에 봉인 — 수학적으로 조작 불가',
    odd:'홀 (ODD)',even:'짝 (EVEN)',players:'명',total_pool:'총 풀',
    bet_amount_label:'베팅 금액 (USDT, 최소 0.1)',clear:'초기화',
    odd_bet:'홀 베팅',even_bet:'짝 베팅',after_login_bet:' 후 베팅 가능',
    next_round:'다음 라운드',sec_unit:'초',
    my_info:'💼 내 정보',need_login:'로그인이 필요합니다',
    balance:'잔액',ref_earnings:'추천수당',level1:'1단계',level2:'2단계',
    ref_code:'추천코드',deposit_withdraw:'💰 입금 / 출금',
    recent_results:'🎯 최근 결과',no_record:'기록 없음',
    live_feed:'📡 실시간 베팅',no_bets:'베팅 내역 없음',
    mypage_title:'👤 마이페이지',total_games:'총 게임',win_rate:'승률',
    net_profit:'순손익(USDT)',my_bet_history:'📋 내 베팅 내역',
    choice:'선택',result:'결과',bet_amount:'베팅액',time:'시간',
    withdraw_history:'📤 출금 내역',
    wallet_title:'💰 USDT 지갑',wallet_desc:'TRC20 (TRON) 네트워크 기반 USDT 입출금',
    total_balance:'총 잔액',total_deposit:'총 입금',total_withdraw:'총 출금',
    total_bet_amount:'누적 베팅',deposit_title:'📥 USDT 입금',
    deposit_addr:'입금 주소 (TRC20)',copy_addr:'📋 주소 복사',
    deposit_warning:'반드시 TRC20(TRON) 네트워크로 입금하세요. 다른 네트워크 입금 시 손실됩니다.',
    demo_deposit:'🧪 데모 입금 (테스트용)',deposit_btn:'입금',
    withdraw_title:'📤 USDT 출금',
    withdraw_condition:'출금 조건: 입금액의 50% 이상 베팅 필요 / 이미 처리 중인 출금 없을 것',
    bet_progress:'베팅 달성',withdraw_addr:'출금 주소 (TRC20)',
    withdraw_amount:'출금 금액 (USDT, 최소 1)',withdraw_btn:'출금 신청',
    dash_title:'📊 투명성 대시보드',dash_desc:'모든 데이터 실시간 공개 — 숨기는 것 없음',
    user_rate:'유저 수익률',odd_rate:'홀 당첨률',total_users:'유저수',
    profit_structure:'💰 수익 배분 구조',
    user_payout:'유저 배당',l1_reward:'1단계 추천수당',l2_reward:'2단계 추천수당',house_net:'운영 수수료',
    realtime_stats:'📈 실시간 통계',total_bet:'총 베팅',total_payout:'총 지급',
    ref_paid:'추천수당 지급',user_rtp:'유저 실제 RTP',theory_rtp:'이론 RTP',
    dist_title:'🎯 홀짝 분포',game_history:'📜 게임 기록',hash:'해시',
    ref_title:'👥 추천인 수당 시스템',ref_desc:'친구 초대 → 베팅 때마다 자동 USDT 수당',
    l1_title:'1단계 수당',l1_desc:'직접 초대 친구 베팅금의 2.5% 자동 지급',
    l2_title:'2단계 수당',l2_desc:'친구가 초대한 친구 베팅금의 1.0% 자동 지급',
    unlimited:'무제한',no_limit:'수당 상한 없음',no_limit_desc:'인원·베팅액 비례 무한 수익',
    my_ref_code:'🎁 내 추천코드',ref_link:'추천링크',
    total_ref_earn:'총 수당(USDT)',l1_count:'1단계',l2_count:'2단계',
    simulator:'🧮 수익 시뮬레이터',sim_l1:'1단계 수',sim_l2:'2단계 수',
    sim_bet:'1인 일 베팅(USDT)',sim_times:'일 참여 횟수',
    daily_earn:'일 수익',monthly_earn:'월 수익',yearly_earn:'연 수익',
    verify_title:'🔍 공정성 직접 검증',verify_desc:'결과가 조작되지 않았음을 수학적으로 확인',
    system_title:'🔐 하이브리드 공정성 시스템',
    v1_title:'① 서버 시드',v1_desc:'라운드 전 SHA256 해시 공개. 종료 후 원본 공개→변조 불가 증명.',
    v2_title:'② 유저 시드',v2_desc:'참여자 ID 합산. 본사가 사전에 알 수 없어 조작 원천 차단.',
    v3_title:'③ 블록 높이',v3_desc:'비트코인 블록높이 추가 난수 소스. 외부 검증 가능.',
    formula:'공식:',last_char_rule:'마지막자리 홀수→ODD / 짝수→EVEN',
    verify_tool:'🧮 직접 검증',server_seed:'서버시드',block_height:'블록 높이',
    user_seed_opt:'유저시드 (선택)',verify_btn:'🔍 검증하기',
    hash_val:'해시',last_char:'마지막자리',recent_verify:'📋 최근 라운드 검증',
    username:'아이디',password:'비밀번호',test_accounts:'테스트 계정',
    no_account:'계정 없음?',have_account:'이미 계정?',
    ref_code_opt:'추천코드 (선택)',register_btn:'🎁 회원가입',bonus_msg:'🎁 가입 즉시 10 USDT 보너스!',
    phase_betting:'베팅 중',phase_result:'결과 발표',
    err_min_bet:'최소 베팅은 0.1 USDT입니다',err_insufficient:'잔액이 부족합니다',
    err_already_bet:'이미 베팅했습니다',err_not_betting:'베팅 시간이 아닙니다',
    err_unauth:'로그인이 필요합니다',err_banned:'계정이 정지되었습니다',
    err_invalid_cred:'아이디 또는 비밀번호가 틀렸습니다',err_username_taken:'이미 사용 중인 아이디입니다',
    err_username_short:'아이디는 3자 이상이어야 합니다',err_password_short:'비밀번호는 6자 이상이어야 합니다',
    err_invalid_ref:'유효하지 않은 추천코드입니다',err_ip_limit:'동일 IP 최대 3계정까지 가입 가능합니다',
    err_min_withdraw:'최소 출금액은 1 USDT입니다',err_invalid_addr:'유효하지 않은 출금 주소입니다',
    err_bet_requirement:'출금 조건 미달 (베팅 누적 필요)',err_withdraw_pending:'이미 처리 중인 출금이 있습니다',
    err_max_bet:'최대 베팅은 1000 USDT입니다',
    welcome:'환영합니다',deposit_ok:'입금 완료',withdraw_ok:'출금 신청 완료',
    copied:'복사됨!',win_msg:'🎉 당첨!',lose_msg:'😢 낙첨',
  },
  en: {
    blockchain_fair:'Blockchain Fair',login:'Login',register:'Register',logout:'Logout',
    tab_game:'🎲 Game',tab_mypage:'👤 My Page',tab_wallet:'💰 Wallet',
    tab_dashboard:'📊 Transparency',tab_referral:'👥 Referral',tab_verify:'🔍 Verify',
    round:'Round',sec_left:'sec left',payout:'Payout',
    seed_hash_label:'Pre-disclosed Server Seed Hash',seed_desc:'Sealed before bet — mathematically tamper-proof',
    odd:'ODD',even:'EVEN',players:'players',total_pool:'Total Pool',
    bet_amount_label:'Bet Amount (USDT, min 0.1)',clear:'Clear',
    odd_bet:'BET ODD',even_bet:'BET EVEN',after_login_bet:' to place bet',
    next_round:'Next round in',sec_unit:'s',
    my_info:'💼 My Info',need_login:'Please login',
    balance:'Balance',ref_earnings:'Ref Earnings',level1:'Level 1',level2:'Level 2',
    ref_code:'Ref Code',deposit_withdraw:'💰 Deposit / Withdraw',
    recent_results:'🎯 Recent Results',no_record:'No records',
    live_feed:'📡 Live Feed',no_bets:'No bets yet',
    mypage_title:'👤 My Page',total_games:'Total Games',win_rate:'Win Rate',
    net_profit:'Net Profit(USDT)',my_bet_history:'📋 My Bet History',
    choice:'Choice',result:'Result',bet_amount:'Bet',time:'Time',
    withdraw_history:'📤 Withdraw History',
    wallet_title:'💰 USDT Wallet',wallet_desc:'TRC20 (TRON) network USDT deposit & withdrawal',
    total_balance:'Total Balance',total_deposit:'Total Deposit',total_withdraw:'Total Withdraw',
    total_bet_amount:'Total Wagered',deposit_title:'📥 Deposit USDT',
    deposit_addr:'Deposit Address (TRC20)',copy_addr:'📋 Copy Address',
    deposit_warning:'Only send USDT via TRC20 (TRON) network. Other networks will result in loss.',
    demo_deposit:'🧪 Demo Deposit (Test)',deposit_btn:'Deposit',
    withdraw_title:'📤 Withdraw USDT',
    withdraw_condition:'Requirement: Wager at least 50% of deposit / No pending withdraw',
    bet_progress:'Bet Progress',withdraw_addr:'Withdraw Address (TRC20)',
    withdraw_amount:'Withdraw Amount (USDT, min 1)',withdraw_btn:'Request Withdraw',
    dash_title:'📊 Transparency Dashboard',dash_desc:'All data public in real-time — nothing hidden',
    user_rate:'User Win Rate',odd_rate:'ODD Win Rate',total_users:'Users',
    profit_structure:'💰 Profit Structure',
    user_payout:'User Payout',l1_reward:'Level 1 Referral',l2_reward:'Level 2 Referral',house_net:'Operating Fee',
    realtime_stats:'📈 Real-time Stats',total_bet:'Total Bet',total_payout:'Total Payout',
    ref_paid:'Referral Paid',user_rtp:'Actual RTP',theory_rtp:'Theoretical RTP',
    dist_title:'🎯 ODD/EVEN Distribution',game_history:'📜 Game History',hash:'Hash',
    ref_title:'👥 Referral Reward System',ref_desc:'Invite friends → Earn USDT every bet',
    l1_title:'Level 1 Reward',l1_desc:'2.5% of direct referral bets paid automatically',
    l2_title:'Level 2 Reward',l2_desc:'1.0% of 2nd level referral bets paid automatically',
    unlimited:'Unlimited',no_limit:'No Cap',no_limit_desc:'Earn proportional to members & bets',
    my_ref_code:'🎁 My Referral Code',ref_link:'Ref Link',
    total_ref_earn:'Total Earnings(USDT)',l1_count:'Level 1',l2_count:'Level 2',
    simulator:'🧮 Earnings Simulator',sim_l1:'Level 1 Count',sim_l2:'Level 2 Count',
    sim_bet:'Daily bet/user(USDT)',sim_times:'Daily rounds',
    daily_earn:'Daily',monthly_earn:'Monthly',yearly_earn:'Yearly',
    verify_title:'🔍 Provably Fair Verification',verify_desc:'Mathematically verify results were not manipulated',
    system_title:'🔐 Hybrid Fairness System',
    v1_title:'① Server Seed',v1_desc:'SHA256 hash disclosed before round. Original revealed after — tamper-proof.',
    v2_title:'② User Seeds',v2_desc:'Aggregated participant IDs. House cannot know in advance.',
    v3_title:'③ Block Height',v3_desc:'Bitcoin block height as extra entropy. Externally verifiable.',
    formula:'Formula:',last_char_rule:'Last digit odd→ODD / even→EVEN',
    verify_tool:'🧮 Manual Verify',server_seed:'Server Seed',block_height:'Block Height',
    user_seed_opt:'User Seed (optional)',verify_btn:'🔍 Verify',
    hash_val:'Hash',last_char:'Last Char',recent_verify:'📋 Recent Rounds',
    username:'Username',password:'Password',test_accounts:'Test Accounts',
    no_account:'No account?',have_account:'Have account?',
    ref_code_opt:'Referral Code (optional)',register_btn:'🎁 Register',bonus_msg:'🎁 Get 10 USDT bonus on signup!',
    phase_betting:'Betting',phase_result:'Result',
    err_min_bet:'Minimum bet is 0.1 USDT',err_insufficient:'Insufficient balance',
    err_already_bet:'Already bet this round',err_not_betting:'Not in betting phase',
    err_unauth:'Please login',err_banned:'Account suspended',
    err_invalid_cred:'Invalid username or password',err_username_taken:'Username already taken',
    err_username_short:'Username must be at least 3 chars',err_password_short:'Password must be at least 6 chars',
    err_invalid_ref:'Invalid referral code',err_ip_limit:'Max 3 accounts per IP',
    err_min_withdraw:'Minimum withdrawal is 1 USDT',err_invalid_addr:'Invalid withdrawal address',
    err_bet_requirement:'Bet requirement not met',err_withdraw_pending:'Withdrawal already pending',
    err_max_bet:'Maximum bet is 1000 USDT',
    welcome:'Welcome',deposit_ok:'Deposit successful',withdraw_ok:'Withdrawal requested',
    copied:'Copied!',win_msg:'🎉 WIN!',lose_msg:'😢 LOSE',
  },
  zh: {
    blockchain_fair:'区块链公平',login:'登录',register:'注册',logout:'退出',
    tab_game:'🎲 游戏',tab_mypage:'👤 我的',tab_wallet:'💰 钱包',
    tab_dashboard:'📊 透明度',tab_referral:'👥 推荐',tab_verify:'🔍 验证',
    round:'局',sec_left:'秒剩余',payout:'赔率',
    seed_hash_label:'预先公布的服务器种子哈希',seed_desc:'投注前封印 — 数学上防篡改',
    odd:'单(ODD)',even:'双(EVEN)',players:'人',total_pool:'总池',
    bet_amount_label:'投注金额 (USDT, 最低 0.1)',clear:'重置',
    odd_bet:'单 投注',even_bet:'双 投注',after_login_bet:' 后可投注',
    next_round:'下一局',sec_unit:'秒',
    my_info:'💼 我的信息',need_login:'请先登录',
    balance:'余额',ref_earnings:'推荐收益',level1:'一级',level2:'二级',
    ref_code:'推荐码',deposit_withdraw:'💰 存款 / 提款',
    recent_results:'🎯 最近结果',no_record:'暂无记录',
    live_feed:'📡 实时投注',no_bets:'暂无投注',
    mypage_title:'👤 我的主页',total_games:'总游戏',win_rate:'胜率',
    net_profit:'净盈亏(USDT)',my_bet_history:'📋 我的投注记录',
    choice:'选择',result:'结果',bet_amount:'投注额',time:'时间',
    withdraw_history:'📤 提款记录',
    wallet_title:'💰 USDT 钱包',wallet_desc:'TRC20 (TRON) 网络 USDT 存款和提款',
    total_balance:'总余额',total_deposit:'总存款',total_withdraw:'总提款',
    total_bet_amount:'累计投注',deposit_title:'📥 USDT 存款',
    deposit_addr:'存款地址 (TRC20)',copy_addr:'📋 复制地址',
    deposit_warning:'请务必通过 TRC20 (TRON) 网络存款。其他网络存款将导致损失。',
    demo_deposit:'🧪 演示存款 (测试)',deposit_btn:'存款',
    withdraw_title:'📤 USDT 提款',
    withdraw_condition:'提款条件: 需投注存款额的50%以上 / 无待处理提款',
    bet_progress:'投注进度',withdraw_addr:'提款地址 (TRC20)',
    withdraw_amount:'提款金额 (USDT, 最低 1)',withdraw_btn:'申请提款',
    dash_title:'📊 透明度仪表板',dash_desc:'所有数据实时公开 — 无隐藏',
    user_rate:'用户胜率',odd_rate:'单赢率',total_users:'用户数',
    profit_structure:'💰 收益分配结构',
    user_payout:'用户赔付',l1_reward:'一级推荐奖',l2_reward:'二级推荐奖',house_net:'运营费用',
    realtime_stats:'📈 实时统计',total_bet:'总投注',total_payout:'总赔付',
    ref_paid:'推荐奖已付',user_rtp:'实际RTP',theory_rtp:'理论RTP',
    dist_title:'🎯 单双分布',game_history:'📜 游戏记录',hash:'哈希',
    ref_title:'👥 推荐奖励系统',ref_desc:'邀请朋友 → 每次投注自动获得 USDT',
    l1_title:'一级奖励',l1_desc:'直接推荐朋友投注额的2.5%自动发放',
    l2_title:'二级奖励',l2_desc:'朋友推荐朋友投注额的1.0%自动发放',
    unlimited:'无限',no_limit:'无上限',no_limit_desc:'按人数和投注额成比例无限收益',
    my_ref_code:'🎁 我的推荐码',ref_link:'推荐链接',
    total_ref_earn:'总收益(USDT)',l1_count:'一级',l2_count:'二级',
    simulator:'🧮 收益模拟器',sim_l1:'一级人数',sim_l2:'二级人数',
    sim_bet:'每人日投注(USDT)',sim_times:'日参与次数',
    daily_earn:'日收益',monthly_earn:'月收益',yearly_earn:'年收益',
    verify_title:'🔍 公平性直接验证',verify_desc:'数学验证结果未被篡改',
    system_title:'🔐 混合公平性系统',
    v1_title:'① 服务器种子',v1_desc:'局前公布SHA256哈希。结束后公开原始数据→不可篡改证明。',
    v2_title:'② 用户种子',v2_desc:'参与者ID汇总。本部无法事先知晓，从源头防止操纵。',
    v3_title:'③ 区块高度',v3_desc:'比特币区块高度作为额外随机源。可外部验证。',
    formula:'公式:',last_char_rule:'最后一位奇数→ODD / 偶数→EVEN',
    verify_tool:'🧮 手动验证',server_seed:'服务器种子',block_height:'区块高度',
    user_seed_opt:'用户种子 (可选)',verify_btn:'🔍 验证',
    hash_val:'哈希',last_char:'最后一位',recent_verify:'📋 最近轮次验证',
    username:'用户名',password:'密码',test_accounts:'测试账户',
    no_account:'没有账户?',have_account:'已有账户?',
    ref_code_opt:'推荐码 (可选)',register_btn:'🎁 注册',bonus_msg:'🎁 注册即获 10 USDT 奖励!',
    phase_betting:'投注中',phase_result:'公布结果',
    err_min_bet:'最低投注为0.1 USDT',err_insufficient:'余额不足',
    err_already_bet:'本局已投注',err_not_betting:'非投注阶段',
    err_unauth:'请先登录',err_banned:'账户已封禁',
    err_invalid_cred:'用户名或密码错误',err_username_taken:'用户名已被使用',
    err_username_short:'用户名至少3个字符',err_password_short:'密码至少6个字符',
    err_invalid_ref:'无效推荐码',err_ip_limit:'同一IP最多注册3个账户',
    err_min_withdraw:'最低提款为1 USDT',err_invalid_addr:'无效提款地址',
    err_bet_requirement:'未满足投注条件',err_withdraw_pending:'已有待处理提款',
    err_max_bet:'最高投注为1000 USDT',
    welcome:'欢迎',deposit_ok:'存款成功',withdraw_ok:'提款申请已提交',
    copied:'已复制!',win_msg:'🎉 赢了!',lose_msg:'😢 输了',
  },
  ja: {
    blockchain_fair:'ブロックチェーン公正',login:'ログイン',register:'登録',logout:'ログアウト',
    tab_game:'🎲 ゲーム',tab_mypage:'👤 マイページ',tab_wallet:'💰 ウォレット',
    tab_dashboard:'📊 透明性',tab_referral:'👥 紹介報酬',tab_verify:'🔍 検証',
    round:'ラウンド',sec_left:'秒残り',payout:'配当',
    seed_hash_label:'事前公開サーバーシードハッシュ',seed_desc:'ベット前に封印 — 数学的に改ざん不可',
    odd:'奇数(ODD)',even:'偶数(EVEN)',players:'人',total_pool:'総プール',
    bet_amount_label:'ベット額 (USDT, 最低 0.1)',clear:'リセット',
    odd_bet:'奇数 ベット',even_bet:'偶数 ベット',after_login_bet:' してベット',
    next_round:'次のラウンド',sec_unit:'秒',
    my_info:'💼 マイ情報',need_login:'ログインが必要です',
    balance:'残高',ref_earnings:'紹介報酬',level1:'1段階',level2:'2段階',
    ref_code:'紹介コード',deposit_withdraw:'💰 入金 / 出金',
    recent_results:'🎯 最近の結果',no_record:'記録なし',
    live_feed:'📡 リアルタイムベット',no_bets:'ベット履歴なし',
    mypage_title:'👤 マイページ',total_games:'総ゲーム',win_rate:'勝率',
    net_profit:'純損益(USDT)',my_bet_history:'📋 ベット履歴',
    choice:'選択',result:'結果',bet_amount:'ベット額',time:'時刻',
    withdraw_history:'📤 出金履歴',
    wallet_title:'💰 USDTウォレット',wallet_desc:'TRC20 (TRON) ネットワーク USDT 入出金',
    total_balance:'総残高',total_deposit:'総入金',total_withdraw:'総出金',
    total_bet_amount:'累計ベット',deposit_title:'📥 USDT 入金',
    deposit_addr:'入金アドレス (TRC20)',copy_addr:'📋 アドレスコピー',
    deposit_warning:'必ずTRC20(TRON)ネットワークで入金してください。他のネットワークでは損失になります。',
    demo_deposit:'🧪 デモ入金 (テスト)',deposit_btn:'入金',
    withdraw_title:'📤 USDT 出金',
    withdraw_condition:'出金条件: 入金額の50%以上ベット必要 / 処理中の出金なし',
    bet_progress:'ベット達成',withdraw_addr:'出金アドレス (TRC20)',
    withdraw_amount:'出金額 (USDT, 最低 1)',withdraw_btn:'出金申請',
    dash_title:'📊 透明性ダッシュボード',dash_desc:'全データリアルタイム公開 — 隠し事なし',
    user_rate:'ユーザー勝率',odd_rate:'奇数勝率',total_users:'ユーザー数',
    profit_structure:'💰 収益配分構造',
    user_payout:'ユーザー配当',l1_reward:'1段階紹介報酬',l2_reward:'2段階紹介報酬',house_net:'運営手数料',
    realtime_stats:'📈 リアルタイム統計',total_bet:'総ベット',total_payout:'総支払',
    ref_paid:'紹介報酬支払',user_rtp:'実際RTP',theory_rtp:'理論RTP',
    dist_title:'🎯 奇偶分布',game_history:'📜 ゲーム記録',hash:'ハッシュ',
    ref_title:'👥 紹介報酬システム',ref_desc:'友達招待 → ベットのたびに自動 USDT 報酬',
    l1_title:'1段階報酬',l1_desc:'直接招待した友達のベット額の2.5%自動支払',
    l2_title:'2段階報酬',l2_desc:'友達の友達のベット額の1.0%自動支払',
    unlimited:'無制限',no_limit:'上限なし',no_limit_desc:'人数・ベット額比例で無限収益',
    my_ref_code:'🎁 マイ紹介コード',ref_link:'紹介リンク',
    total_ref_earn:'総報酬(USDT)',l1_count:'1段階',l2_count:'2段階',
    simulator:'🧮 収益シミュレーター',sim_l1:'1段階数',sim_l2:'2段階数',
    sim_bet:'1人日ベット(USDT)',sim_times:'日参加回数',
    daily_earn:'日収益',monthly_earn:'月収益',yearly_earn:'年収益',
    verify_title:'🔍 公正性直接検証',verify_desc:'結果が操作されていないことを数学的に確認',
    system_title:'🔐 ハイブリッド公正性システム',
    v1_title:'① サーバーシード',v1_desc:'ラウンド前にSHA256ハッシュ公開。終了後原本公開→改ざん不可証明。',
    v2_title:'② ユーザーシード',v2_desc:'参加者ID集計。本部が事前に知ることができず操作を根本的に防止。',
    v3_title:'③ ブロック高',v3_desc:'ビットコインブロック高を追加乱数ソースとして使用。外部検証可能。',
    formula:'公式:',last_char_rule:'最後の桁が奇数→ODD / 偶数→EVEN',
    verify_tool:'🧮 直接検証',server_seed:'サーバーシード',block_height:'ブロック高',
    user_seed_opt:'ユーザーシード (任意)',verify_btn:'🔍 検証する',
    hash_val:'ハッシュ',last_char:'最後の桁',recent_verify:'📋 最近のラウンド検証',
    username:'ユーザー名',password:'パスワード',test_accounts:'テストアカウント',
    no_account:'アカウントなし?',have_account:'アカウントあり?',
    ref_code_opt:'紹介コード (任意)',register_btn:'🎁 登録',bonus_msg:'🎁 登録で10 USDTボーナス!',
    phase_betting:'ベット中',phase_result:'結果発表',
    err_min_bet:'最低ベットは0.1 USDTです',err_insufficient:'残高不足',
    err_already_bet:'このラウンドはすでにベット済み',err_not_betting:'ベット時間外です',
    err_unauth:'ログインが必要です',err_banned:'アカウントが停止されています',
    err_invalid_cred:'ユーザー名またはパスワードが違います',err_username_taken:'既に使用中のユーザー名です',
    err_username_short:'ユーザー名は3文字以上必要です',err_password_short:'パスワードは6文字以上必要です',
    err_invalid_ref:'無効な紹介コードです',err_ip_limit:'同一IPで最大3アカウントまで登録可能',
    err_min_withdraw:'最低出金は1 USDTです',err_invalid_addr:'無効な出金アドレスです',
    err_bet_requirement:'ベット条件未達',err_withdraw_pending:'処理中の出金があります',
    err_max_bet:'最高ベットは1000 USDTです',
    welcome:'ようこそ',deposit_ok:'入金完了',withdraw_ok:'出金申請完了',
    copied:'コピー済み!',win_msg:'🎉 当選!',lose_msg:'😢 落選',
  }
}

let lang = localStorage.getItem('lang') || 'ko'
const t = k => (I18N[lang]||I18N.ko)[k] || (I18N.en[k]) || k

function applyLang() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.getAttribute('data-i18n')
    el.textContent = t(k)
  })
  ;['ko','en','zh','ja'].forEach(l => {
    const b = document.getElementById('lang-'+l)
    if (b) { b.classList.toggle('active', l===lang) }
  })
  const pb = document.getElementById('gPhaseBadge')
  if (pb && pb.textContent) {
    const isBetting = pb.classList.contains('betting-phase')
    if (isBetting !== undefined) pb.textContent = isBetting ? t('phase_betting') : t('phase_result')
  }
}
function setLang(l) { lang = l; localStorage.setItem('lang', l); applyLang() }

// ═══════════════════════════════════════════════
// 전역 상태
// ═══════════════════════════════════════════════
let sid = localStorage.getItem('sid') || ''
let me = null
let lastRoundId = -1
let myBet = null

const $ = id => document.getElementById(id)
const fmtU = n => (Math.round(n * 100) / 100).toFixed(2)
const ago = ts => {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return s + 's'
  if (s < 3600) return Math.floor(s/60) + 'm'
  return Math.floor(s/3600) + 'h'
}

async function api(path, opts={}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', 'X-Session-Id': sid },
    ...opts
  })
  return res.json()
}

function toast(msg, color='text-white') {
  const el = $('toast'), msg_el = $('toastMsg')
  msg_el.className = 'glass rounded-xl px-4 py-3 text-sm font-bold shadow-2xl slide ' + color
  msg_el.textContent = msg
  el.classList.remove('hidden')
  setTimeout(() => el.classList.add('hidden'), 3000)
}

const errMap = code => {
  const m = {
    MIN_BET:'err_min_bet', INSUFFICIENT:'err_insufficient', ALREADY_BET:'err_already_bet',
    NOT_BETTING:'err_not_betting', UNAUTH:'err_unauth', BANNED:'err_banned',
    INVALID_CRED:'err_invalid_cred', USERNAME_TAKEN:'err_username_taken',
    USERNAME_SHORT:'err_username_short', PASSWORD_SHORT:'err_password_short',
    INVALID_REF:'err_invalid_ref', IP_LIMIT:'err_ip_limit',
    MIN_WITHDRAW:'err_min_withdraw', INVALID_ADDR:'err_invalid_addr',
    BET_REQUIREMENT:'err_bet_requirement', WITHDRAW_PENDING:'err_withdraw_pending',
    MAX_BET:'err_max_bet'
  }
  return t(m[code] || 'err_unauth')
}

// ═══════════════════════════════════════════════
// 탭 네비게이션
// ═══════════════════════════════════════════════
function showTab(name) {
  const tabs = ['game','mypage','wallet','dashboard','referral','verify','login','register','admin']
  tabs.forEach(t => {
    const p = $('p-' + t), btn = $('t-' + t)
    if (p) p.classList.toggle('hidden', t !== name)
    if (btn) { btn.classList.toggle('tab-on', t === name); btn.classList.toggle('tab-off', t !== name) }
  })
  if (name === 'dashboard') loadDashboard()
  if (name === 'referral')  loadReferral()
  if (name === 'verify')    loadVerifyHist()
  if (name === 'wallet')    loadWallet()
  if (name === 'mypage')    loadMypage()
  if (name === 'admin')     loadAdmin()
}

function updateUI() {
  const loggedIn = !!me
  $('hdrGuest').classList.toggle('hidden', loggedIn)
  $('hdrUser').classList.toggle('hidden', !loggedIn)
  $('hdrUser').classList.toggle('flex', loggedIn)
  const loginTabs = ['login','register']
  loginTabs.forEach(t => { const b = $('t-'+t); if (b) b.classList.toggle('hidden', loggedIn) })
  const userTabs = ['mypage','wallet']
  userTabs.forEach(t => { const b = $('t-'+t); if (b) b.classList.toggle('hidden', !loggedIn) })
  const adminTab = $('t-admin')
  if (adminTab) adminTab.classList.toggle('hidden', !(me && me.isAdmin))

  if (me) {
    if ($('hdrName')) $('hdrName').textContent = me.username
    if ($('hdrBal'))  $('hdrBal').textContent  = fmtU(me.balance) + ' USDT'
    $('sideGuest').classList.add('hidden')
    $('sideUser').classList.remove('hidden')
    if ($('siBal'))  $('siBal').textContent  = fmtU(me.balance) + ' USDT'
    if ($('siRef'))  $('siRef').textContent  = fmtU(me.referralEarnings || 0) + ' USDT'
    if ($('siL1'))   $('siL1').textContent   = me.level1Count || 0
    if ($('siL2'))   $('siL2').textContent   = me.level2Count || 0
    if ($('siCode')) $('siCode').textContent = me.referralCode || '-'
  } else {
    $('sideGuest').classList.remove('hidden')
    $('sideUser').classList.add('hidden')
    myBet = null
  }
}

// ═══════════════════════════════════════════════
// 인증
// ═══════════════════════════════════════════════
async function doLogin() {
  const username = $('lUser').value.trim()
  const password = $('lPass').value
  $('lErr').classList.add('hidden')
  const data = await api('/api/login', { method:'POST', body: JSON.stringify({username, password}) })
  if (data.error) { $('lErr').textContent = errMap(data.error); $('lErr').classList.remove('hidden'); return }
  sid = data.sessionId
  me  = data.user
  localStorage.setItem('sid', sid)
  updateUI()
  showTab('game')
  toast('👋 ' + t('welcome') + ', ' + me.username + '!', 'text-green-400')
}

async function doRegister() {
  const username = $('rUser').value.trim()
  const password = $('rPass').value
  const referralCode = $('rRef').value.trim()
  $('rErr').classList.add('hidden'); $('rOk').classList.add('hidden')
  const data = await api('/api/register', { method:'POST', body: JSON.stringify({username, password, referralCode}) })
  if (data.error) { $('rErr').textContent = errMap(data.error); $('rErr').classList.remove('hidden'); return }
  sid = data.sessionId; me = data.user
  localStorage.setItem('sid', sid)
  $('rOk').textContent = t('bonus_msg'); $('rOk').classList.remove('hidden')
  setTimeout(() => { updateUI(); showTab('game') }, 1000)
  toast('🎁 ' + t('bonus_msg'), 'text-green-400')
}

function qLogin(u, p) { $('lUser').value = u; $('lPass').value = p; doLogin() }

async function logout() {
  await api('/api/logout', { method:'POST' })
  sid = ''; me = null; myBet = null
  localStorage.removeItem('sid')
  updateUI()
  showTab('game')
  toast('👋 로그아웃')
}

// ═══════════════════════════════════════════════
// 게임
// ═══════════════════════════════════════════════
async function loadRound() {
  const data = await api('/api/round/current')
  if (!data.id) return

  const isBetting = data.phase === 'betting'
  const pb = $('gPhaseBadge')
  if (pb) {
    pb.textContent = isBetting ? t('phase_betting') : t('phase_result')
    pb.className = 'inline-block px-3 py-1 rounded-full text-xs font-bold mb-1 ' +
      (isBetting ? 'bg-green-500/20 text-green-400 betting-phase' : 'bg-red-500/20 text-red-400')
  }

  if ($('gRoundId')) $('gRoundId').textContent = '#' + data.id
  if ($('gBlock'))   $('gBlock').textContent   = 'Block #' + data.blockHeight
  if ($('gTimer'))   $('gTimer').textContent   = data.timeLeft
  const bar = $('gBar')
  if (bar) bar.style.width = (isBetting ? (data.timeLeft/30*100) : (data.timeLeft/8*100)) + '%'

  if ($('gSeedHash')) $('gSeedHash').textContent = data.serverSeedHash

  if ($('gTotalOdd'))  $('gTotalOdd').textContent  = fmtU(data.totalOdd) + ' USDT'
  if ($('gTotalEven')) $('gTotalEven').textContent = fmtU(data.totalEven) + ' USDT'
  if ($('gBetCount'))  $('gBetCount').textContent  = data.betCount + ' ' + t('players')
  if ($('gTotalPool')) $('gTotalPool').textContent = t('total_pool') + ': ' + fmtU(data.totalOdd + data.totalEven)

  // 결과 상태 vs 베팅 상태 UI
  if (data.phase === 'result' && data.result) {
    $('betArea').classList.add('hidden')
    $('resultBox').classList.remove('hidden')
    const isOdd = data.result === 'odd'
    $('resEmoji').textContent = isOdd ? '🔴' : '🔵'
    $('resText').textContent  = isOdd ? '홀 (ODD)' : '짝 (EVEN)'
    $('resText').className = 'text-3xl font-black mb-1 ' + (isOdd ? 'text-red-400' : 'text-blue-400')

    if (myBet) {
      const win = myBet.choice === data.result
      $('resDetail').textContent = win ? t('win_msg') + ' +' + fmtU(myBet.amount * 1.9) + ' USDT' : t('lose_msg') + ' -' + fmtU(myBet.amount) + ' USDT'
      $('resDetail').className = 'text-sm mb-2 ' + (win ? 'text-green-400 font-black' : 'text-red-400')
    } else {
      $('resDetail').textContent = data.result === 'odd' ? '홀 당첨' : '짝 당첨'
      $('resDetail').className = 'text-sm mb-2 text-gray-300'
    }
    if ($('resHash')) $('resHash').textContent = data.hashValue ? 'Hash: ' + data.hashValue.substring(0,32) + '...' : ''
    if ($('resNext')) $('resNext').textContent = data.timeLeft

    // 결과 후 잔액 갱신
    if (me) refreshMe()
  } else {
    $('betArea').classList.remove('hidden')
    $('resultBox').classList.add('hidden')
    if (data.id !== lastRoundId) { myBet = null; lastRoundId = data.id }
  }

  // 베팅 버튼 상태
  const canBet = isBetting && me && !myBet
  const btnOdd = $('btnOdd'), btnEven = $('btnEven')
  if (btnOdd)  btnOdd.disabled  = !canBet
  if (btnEven) btnEven.disabled = !canBet
  const nl = $('needLogin')
  if (nl) nl.classList.toggle('hidden', !(!me))

  // 최근 결과 업데이트
  loadRecentResults()
}

async function refreshMe() {
  if (!sid) return
  const data = await api('/api/me')
  if (data.error) return
  me = data
  updateUI()
}

function addBet(n) { const el=$('betAmt'); el.value = Math.round((parseFloat(el.value||0)+n)*100)/100 }
function clearBet() { $('betAmt').value = '' }
function maxBet()  { if (me) $('betAmt').value = Math.min(me.balance, 1000) }

async function doBet(choice) {
  if (!me) { showTab('login'); return }
  const amount = parseFloat($('betAmt').value)
  if (!amount || amount <= 0) { toast(t('err_min_bet'), 'text-red-400'); return }
  const data = await api('/api/bet', { method:'POST', body: JSON.stringify({choice, amount}) })
  if (data.error) { toast(errMap(data.error), 'text-red-400'); return }
  myBet = { choice, amount }
  me.balance = data.balance
  updateUI()
  toast('✅ ' + (choice==='odd' ? t('odd') : t('even')) + ' ' + amount + ' USDT', 'text-green-400')
  $('betAmt').value = ''
}

// 최근 결과 (사이드바)
let cachedHistory = []
async function loadRecentResults() {
  if (cachedHistory.length === 0) {
    const d = await api('/api/history')
    if (d.history) cachedHistory = d.history
  }
  const el = $('recentRes')
  if (!el) return
  if (cachedHistory.length === 0) return
  el.innerHTML = cachedHistory.slice(0,15).map(h =>
    `<span class="w-6 h-6 flex items-center justify-center rounded-full text-xs font-black ${h.result==='odd'?'bg-red-500/30 text-red-400':'bg-blue-500/30 text-blue-400'}">${h.result==='odd'?'홀':'짝'}</span>`
  ).join('')
  // 5분마다 갱신
  setTimeout(() => { cachedHistory = [] }, 300000)
}

// 라이브 피드
async function loadFeed() {
  const data = await api('/api/feed')
  const el = $('liveFeed')
  if (!el || !data.recentBets) return
  if (data.recentBets.length === 0) {
    el.innerHTML = `<div class="text-xs text-gray-500 text-center py-2">${t('no_bets')}</div>`
    return
  }
  el.innerHTML = data.recentBets.slice(0,12).map(b => `
    <div class="flex items-center justify-between py-0.5">
      <span class="text-xs text-gray-400 w-12 truncate">${b.username}</span>
      <span class="text-xs font-bold w-16 text-center ${b.choice==='odd'?'text-red-400':'text-blue-400'}">${b.choice==='odd'?t('odd'):t('even')}</span>
      <span class="text-xs font-black usdt w-16 text-right">${fmtU(b.amount)}</span>
      <span class="text-xs ${b.win?'text-green-400':'text-red-400'} w-10 text-right">${b.win?'WIN':'LOSE'}</span>
    </div>`).join('')
}

// ═══════════════════════════════════════════════
// 마이페이지
// ═══════════════════════════════════════════════
async function loadMypage() {
  if (!me) {
    $('mypageNeedLogin').classList.remove('hidden')
    $('mypageInfo').classList.add('hidden')
    return
  }
  $('mypageNeedLogin').classList.add('hidden')
  $('mypageInfo').classList.remove('hidden')

  const data = await api('/api/mypage')
  if (data.error) return
  const s = data.stats
  if ($('mpTotalGames')) $('mpTotalGames').textContent = s.totalGames
  if ($('mpWinRate'))    $('mpWinRate').textContent    = s.winRate + '%'
  if ($('mpNetProfit'))  {
    $('mpNetProfit').textContent = (s.netProfit >= 0 ? '+' : '') + fmtU(s.netProfit)
    $('mpNetProfit').className = 'text-2xl font-black ' + (s.netProfit >= 0 ? 'text-green-400' : 'text-red-400')
  }
  if ($('mpRefEarnings')) $('mpRefEarnings').textContent = fmtU(s.referralEarnings)

  const tbl = $('mpBetTable')
  if (tbl) {
    if (data.bets.length === 0) {
      tbl.innerHTML = `<tr><td colspan="6" class="text-center text-gray-500 py-3">${t('no_record')}</td></tr>`
    } else {
      tbl.innerHTML = data.bets.map(b => `
        <tr class="border-b border-white/5 hover:bg-white/5">
          <td class="py-1.5 px-2 font-bold">#${b.roundId}</td>
          <td class="py-1.5 px-2"><span class="px-2 py-0.5 rounded-full text-xs ${b.choice==='odd'?'bg-red-500/20 text-red-400':'bg-blue-500/20 text-blue-400'}">${b.choice==='odd'?t('odd'):t('even')}</span></td>
          <td class="py-1.5 px-2"><span class="px-2 py-0.5 rounded-full text-xs ${b.result==='odd'?'bg-red-500/20 text-red-400':'bg-blue-500/20 text-blue-400'}">${b.result==='odd'?t('odd'):t('even')}</span></td>
          <td class="py-1.5 px-2 text-right font-bold">${fmtU(b.amount)}</td>
          <td class="py-1.5 px-2 text-right ${b.win?'text-green-400 font-black':'text-red-400'}">${b.win?'+'+fmtU(b.payout):'-'+fmtU(b.amount)}</td>
          <td class="py-1.5 px-2 text-right text-gray-500">${ago(b.timestamp)}</td>
        </tr>`).join('')
    }
  }

  // 출금 내역
  const wdData = await api('/api/withdraw/status')
  const wdEl = $('wdHistory')
  if (wdEl && wdData.requests) {
    if (wdData.requests.length === 0) {
      wdEl.innerHTML = `<div class="text-xs text-gray-500 text-center py-2">${t('no_record')}</div>`
    } else {
      wdEl.innerHTML = wdData.requests.map(r => `
        <div class="flex items-center justify-between p-2 bg-black/20 rounded-lg">
          <div>
            <div class="text-xs font-bold">${fmtU(r.amount)} USDT</div>
            <div class="text-xs text-gray-500 mono">${r.address.substring(0,12)}...</div>
          </div>
          <div class="text-right">
            <span class="px-2 py-0.5 rounded-full text-xs status-${r.status}">${r.status}</span>
            <div class="text-xs text-gray-500">${ago(r.createdAt)}</div>
            ${r.txHash ? `<div class="text-xs text-green-400 mono">${r.txHash.substring(0,10)}...</div>` : ''}
          </div>
        </div>`).join('')
    }
  }
}

// ═══════════════════════════════════════════════
// 지갑
// ═══════════════════════════════════════════════
async function loadWallet() {
  if (!me) {
    $('walletNeedLogin').classList.remove('hidden')
    $('walletInfo').classList.add('hidden')
    return
  }
  $('walletNeedLogin').classList.add('hidden')
  $('walletInfo').classList.remove('hidden')

  const data = await api('/api/me')
  if (data.error) return
  me = data
  updateUI()

  if ($('wBal'))      $('wBal').textContent      = fmtU(data.balance) + ' USDT'
  if ($('wTotalDep')) $('wTotalDep').textContent = fmtU(data.totalDeposit) + ' USDT'
  if ($('wTotalWd'))  $('wTotalWd').textContent  = fmtU(data.totalWithdraw) + ' USDT'
  if ($('wTotalBet')) $('wTotalBet').textContent = fmtU(data.totalBetAmount) + ' USDT'
  if ($('wDepAddr'))  $('wDepAddr').textContent  = data.depositAddress

  // 베팅 달성 현황
  const required = data.totalDeposit * 0.5
  const progress = Math.min(100, required > 0 ? (data.totalBetAmount / required * 100) : 100)
  if ($('wBetProgress')) $('wBetProgress').textContent = fmtU(data.totalBetAmount) + ' / ' + fmtU(required) + ' USDT'
  if ($('wBetBar'))      $('wBetBar').style.width      = progress + '%'
  if ($('wBetBar'))      $('wBetBar').className = 'h-2 rounded-full transition-all ' + (progress >= 100 ? 'bg-green-500' : 'bg-blue-500')
}

function copyAddr() {
  const addr = $('wDepAddr').textContent
  navigator.clipboard.writeText(addr).then(() => toast('📋 ' + t('copied'), 'text-blue-400'))
}

function setMaxWd() {
  if (me) $('wdAmt').value = Math.max(0, me.balance).toFixed(2)
}

async function demoDeposit() {
  const amt = parseFloat($('demoDepAmt').value) || 10
  const data = await api('/api/deposit/demo', { method:'POST', body: JSON.stringify({amount: amt}) })
  if (data.error) { toast('❌ ' + data.error, 'text-red-400'); return }
  me.balance = data.balance
  updateUI()
  loadWallet()
  toast('✅ ' + t('deposit_ok') + ' +' + amt + ' USDT', 'text-green-400')
}

async function doWithdraw() {
  const address = $('wdAddr').value.trim()
  const amount  = parseFloat($('wdAmt').value)
  $('wdErr').classList.add('hidden'); $('wdOk').classList.add('hidden')
  const data = await api('/api/withdraw', { method:'POST', body: JSON.stringify({address, amount}) })
  if (data.error) {
    let msg = errMap(data.error)
    if (data.error === 'BET_REQUIREMENT') msg += ` (${fmtU(data.current||0)}/${fmtU(data.required||0)} USDT)`
    $('wdErr').textContent = msg; $('wdErr').classList.remove('hidden')
    return
  }
  me.balance = data.balance
  updateUI()
  loadWallet()
  $('wdOk').textContent = t('withdraw_ok') + ' #' + data.requestId.substring(0,8)
  $('wdOk').classList.remove('hidden')
  toast('📤 ' + t('withdraw_ok'), 'text-green-400')
  $('wdAddr').value = ''; $('wdAmt').value = ''
}

// ═══════════════════════════════════════════════
// 대시보드
// ═══════════════════════════════════════════════
async function loadDashboard() {
  const data = await api('/api/stats')
  if (!data.totalGames && data.totalGames !== 0) return

  if ($('dTotalGames')) $('dTotalGames').textContent = data.totalGames
  if ($('dUsers'))      $('dUsers').textContent      = data.userCount
  if ($('dTotalBet'))   $('dTotalBet').textContent   = fmtU(data.totalBetAmount) + ' USDT'
  if ($('dTotalPayout'))$('dTotalPayout').textContent= fmtU(data.totalPayoutAmount) + ' USDT'
  if ($('dRefPaid'))    $('dRefPaid').textContent    = fmtU(data.totalReferralPaid) + ' USDT'

  const rtp = data.totalBetAmount > 0 ? (data.totalPayoutAmount / data.totalBetAmount * 100).toFixed(2) : '0.00'
  if ($('dUserRate'))   $('dUserRate').textContent   = rtp + '%'
  if ($('dOddRate'))    $('dOddRate').textContent    = data.oddRate + '%'
  if ($('dActualRTP'))  $('dActualRTP').textContent  = rtp + '%'

  const odd = parseInt(data.oddCount), even = parseInt(data.evenCount), total = odd + even
  if ($('dOddCnt'))  $('dOddCnt').textContent  = odd
  if ($('dEvenCnt')) $('dEvenCnt').textContent = even
  const oddPct  = total > 0 ? (odd/total*100).toFixed(1)  : '50.0'
  const evenPct = total > 0 ? (even/total*100).toFixed(1) : '50.0'
  if ($('dOddBar'))  $('dOddBar').style.width  = oddPct + '%'
  if ($('dEvenBar')) $('dEvenBar').style.width = evenPct + '%'
  if ($('dOddPct'))  $('dOddPct').textContent  = oddPct + '%'
  if ($('dEvenPct')) $('dEvenPct').textContent = evenPct + '%'

  // 히스토리 테이블
  const d2 = await api('/api/history')
  const tbl = $('dHistTbl')
  if (tbl && d2.history) {
    if (d2.history.length === 0) {
      tbl.innerHTML = `<tr><td colspan="5" class="text-center text-gray-500 py-3">${t('no_record')}</td></tr>`
    } else {
      tbl.innerHTML = d2.history.slice(0,20).map(h => `
        <tr class="border-b border-white/5 hover:bg-white/5">
          <td class="py-1.5 px-2 font-bold">#${h.roundId}</td>
          <td class="py-1.5 px-2"><span class="px-2 py-0.5 rounded-full text-xs ${h.result==='odd'?'bg-red-500/20 text-red-400':'bg-blue-500/20 text-blue-400'}">${h.result==='odd'?t('odd'):t('even')}</span></td>
          <td class="py-1.5 px-2 mono text-gray-400 text-xs">${h.hashValue.substring(0,16)}...</td>
          <td class="py-1.5 px-2 text-right usdt">${fmtU(h.totalBets)}</td>
          <td class="py-1.5 px-2 text-right text-gray-500">${ago(h.timestamp)}</td>
        </tr>`).join('')
    }
  }
}

// ═══════════════════════════════════════════════
// 추천수당
// ═══════════════════════════════════════════════
async function loadReferral() {
  if (!me) {
    $('refNeedLogin').classList.remove('hidden')
    $('refInfo').classList.add('hidden')
    return
  }
  $('refNeedLogin').classList.add('hidden')
  $('refInfo').classList.remove('hidden')

  const data = await api('/api/referral')
  if (data.error) return
  if ($('rCode'))     $('rCode').textContent     = data.referralCode
  if ($('rEarnings')) $('rEarnings').textContent = fmtU(data.referralEarnings) + ' USDT'
  if ($('rL1Cnt'))    $('rL1Cnt').textContent    = data.level1.count
  if ($('rL2Cnt'))    $('rL2Cnt').textContent    = data.level2.count

  const link = location.origin + '?ref=' + data.referralCode
  if ($('rLink')) $('rLink').textContent = link

  calcSim()
}

function calcSim() {
  const l1 = parseInt($('sL1')?.value||10)
  const l2 = parseInt($('sL2')?.value||30)
  const bet = parseFloat($('sBet')?.value||50)
  const times = parseInt($('sTimes')?.value||20)
  const daily = (l1 * bet * times * 0.025) + (l2 * bet * times * 0.010)
  if ($('sDayE')) $('sDayE').textContent = fmtU(daily) + ' USDT'
  if ($('sMonE')) $('sMonE').textContent = fmtU(daily * 30) + ' USDT'
  if ($('sYrE'))  $('sYrE').textContent  = fmtU(daily * 365) + ' USDT'
}

function copyCode() {
  const code = ($('siCode') || $('rCode'))?.textContent
  if (code && code !== '-') navigator.clipboard.writeText(code).then(() => toast('📋 ' + t('copied'), 'text-blue-400'))
}

function shareRef() {
  const link = $('rLink')?.textContent
  if (link) navigator.clipboard.writeText(link).then(() => toast('📋 ' + t('copied'), 'text-green-400'))
}

// ═══════════════════════════════════════════════
// 검증
// ═══════════════════════════════════════════════
async function doVerify() {
  const serverSeed = $('vSeed').value.trim()
  const blockHeight = $('vBlock').value.trim()
  const userSeeds = $('vUser').value.trim()
  if (!serverSeed || !blockHeight) return
  const data = await api('/api/verify', { method:'POST', body: JSON.stringify({serverSeed, blockHeight, userSeeds}) })
  if (data.error) return
  $('vHash').textContent  = data.hash
  $('vLast').textContent  = data.lastChar
  $('vFinal').textContent = data.result === 'odd' ? '🔴 ' + t('odd') : '🔵 ' + t('even')
  $('vFinal').className   = 'text-lg font-black ' + (data.result==='odd' ? 'text-red-400' : 'text-blue-400')
  $('vResult').classList.remove('hidden')
}

async function loadVerifyHist() {
  const data = await api('/api/history')
  const el = $('vHistory')
  if (!el || !data.history) return
  if (data.history.length === 0) {
    el.innerHTML = `<div class="text-gray-500 text-xs text-center py-3">${t('no_record')}</div>`
    return
  }
  el.innerHTML = data.history.slice(0,8).map(h => `
    <div class="bg-black/30 rounded-xl p-3 space-y-1">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold">#${h.roundId}</span>
        <span class="px-2 py-0.5 rounded-full text-xs ${h.result==='odd'?'bg-red-500/20 text-red-400':'bg-blue-500/20 text-blue-400'}">${h.result==='odd'?t('odd'):t('even')}</span>
        <button onclick="fillVerify('${h.serverSeed}','${h.blockHeight}')" class="text-xs text-blue-400 hover:underline">검증</button>
      </div>
      <div class="mono text-xs text-gray-500 break-all">${h.hashValue}</div>
    </div>`).join('')
}

function fillVerify(seed, block) {
  if ($('vSeed'))  $('vSeed').value  = seed
  if ($('vBlock')) $('vBlock').value = block
  doVerify()
}

// ═══════════════════════════════════════════════
// 관리자
// ═══════════════════════════════════════════════
async function loadAdmin() {
  if (!me || !me.isAdmin) { showTab('game'); return }

  const data = await api('/api/admin/stats')
  if (data.error) return

  if ($('adTotalUsers')) $('adTotalUsers').textContent = data.totalUsers
  if ($('adTotalBet'))   $('adTotalBet').textContent   = fmtU(data.totalBetAmount)
  if ($('adPendingWd'))  $('adPendingWd').textContent  = data.pendingWithdrawCount
  if ($('adPendingAmt')) $('adPendingAmt').textContent = fmtU(data.pendingWithdrawAmount)

  loadAdminWithdraws()
  loadAdminUsers()
}

async function loadAdminWithdraws() {
  const data = await api('/api/admin/withdraws')
  const el = $('adWithdrawList')
  if (!el || !data.requests) return
  if (data.requests.length === 0) {
    el.innerHTML = '<div class="text-xs text-gray-500 text-center py-3">출금 요청 없음</div>'
    return
  }
  el.innerHTML = data.requests.map(r => `
    <div class="flex flex-wrap items-center justify-between gap-2 p-3 bg-black/20 rounded-xl border border-white/10">
      <div>
        <div class="text-sm font-black">${r.username} — <span class="usdt">${fmtU(r.amount)} USDT</span></div>
        <div class="text-xs text-gray-400 mono">${r.address}</div>
        <div class="text-xs text-gray-500">${ago(r.createdAt)} 전</div>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-2 py-0.5 rounded-full text-xs status-${r.status}">${r.status}</span>
        ${r.status === 'pending' ? `
          <button onclick="adminApprove('${r.id}')" class="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-xs font-bold transition">✅ 승인</button>
          <button onclick="adminReject('${r.id}')" class="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-bold transition">❌ 거절</button>` : ''}
        ${r.txHash ? `<div class="text-xs text-green-400 mono">TX: ${r.txHash.substring(0,12)}...</div>` : ''}
      </div>
    </div>`).join('')
}

async function adminApprove(id) {
  const txHash = prompt('TxHash (선택사항):') || ''
  const data = await api('/api/admin/withdraw/approve', { method:'POST', body: JSON.stringify({requestId:id, txHash}) })
  if (data.success) { toast('✅ 출금 승인', 'text-green-400'); loadAdmin() }
  else toast('❌ ' + (data.error||'오류'), 'text-red-400')
}

async function adminReject(id) {
  const note = prompt('거절 사유:') || ''
  const data = await api('/api/admin/withdraw/reject', { method:'POST', body: JSON.stringify({requestId:id, note}) })
  if (data.success) { toast('✅ 출금 거절 처리', 'text-yellow-400'); loadAdmin() }
  else toast('❌ ' + (data.error||'오류'), 'text-red-400')
}

async function loadAdminUsers() {
  const data = await api('/api/admin/users')
  const tbl = $('adUserTable')
  if (!tbl || !data.users) return
  tbl.innerHTML = data.users.map(u => `
    <tr class="border-b border-white/5 hover:bg-white/5">
      <td class="py-1.5 px-2">
        <div class="font-bold text-xs">${u.username}</div>
        <div class="text-xs text-gray-500">${u.isAdmin?'👑 관리자':''} ${u.isBanned?'🚫 차단':''}</div>
      </td>
      <td class="py-1.5 px-2 text-right usdt text-xs">${fmtU(u.balance)}</td>
      <td class="py-1.5 px-2 text-right text-xs text-green-400">${fmtU(u.totalDeposit)}</td>
      <td class="py-1.5 px-2 text-right text-xs text-blue-400">${fmtU(u.totalBetAmount)}</td>
      <td class="py-1.5 px-2 text-xs">${u.isBanned?'<span class="text-red-400">차단</span>':'<span class="text-green-400">정상</span>'}</td>
      <td class="py-1.5 px-2">
        <div class="flex gap-1">
          <button onclick="showBalModal('${u.id}','${u.username}')" class="px-2 py-1 bg-yellow-600/30 rounded text-xs hover:bg-yellow-600/50 transition">💰</button>
          <button onclick="adminBan('${u.id}',${!u.isBanned})" class="px-2 py-1 ${u.isBanned?'bg-green-600/30':'bg-red-600/30'} rounded text-xs hover:opacity-80 transition">${u.isBanned?'해제':'차단'}</button>
        </div>
      </td>
    </tr>`).join('')
}

function showBalModal(userId, username) {
  $('adBalUserId').value  = userId
  $('adBalUser').textContent = username
  $('adBalAmt').value = ''
  $('adBalModal').classList.remove('hidden')
}

async function adminAdjBal(type) {
  const userId = $('adBalUserId').value
  const amount = parseFloat($('adBalAmt').value)
  if (!amount) return
  const data = await api('/api/admin/user/balance', { method:'POST', body: JSON.stringify({userId, amount, type}) })
  if (data.success) {
    toast('✅ 잔액 조정 완료: ' + fmtU(data.balance) + ' USDT', 'text-green-400')
    $('adBalModal').classList.add('hidden')
    loadAdminUsers()
  } else toast('❌ ' + (data.error||'오류'), 'text-red-400')
}

async function adminBan(userId, ban) {
  const data = await api('/api/admin/user/ban', { method:'POST', body: JSON.stringify({userId, ban}) })
  if (data.success) { toast(ban ? '🚫 차단 처리' : '✅ 차단 해제', ban?'text-red-400':'text-green-400'); loadAdminUsers() }
}

// ═══════════════════════════════════════════════
// URL 추천 파라미터
// ═══════════════════════════════════════════════
function parseRef() {
  const ref = new URLSearchParams(location.search).get('ref')
  if (ref) {
    const el = $('rRef')
    if (el) el.value = ref
    showTab('register')
    toast('🎁 추천코드: ' + ref, 'text-yellow-400')
  }
}

// ═══════════════════════════════════════════════
// 초기화
// ═══════════════════════════════════════════════
async function init() {
  applyLang()
  parseRef()

  if (sid) {
    const data = await api('/api/me')
    if (!data.error) {
      me = data
    } else {
      sid = ''; localStorage.removeItem('sid')
    }
  }

  updateUI()
  showTab('game')
  loadRound()
  loadFeed()
  loadDashboard()

  setInterval(loadRound, 1000)
  setInterval(loadFeed,  4000)
  setInterval(loadDashboard, 30000)
}

init()
