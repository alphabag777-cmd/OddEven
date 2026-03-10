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
    err_wrong_password:'현재 비밀번호가 틀렸습니다',err_same_password:'새 비밀번호가 현재와 동일합니다',
    err_not_found:'요청을 찾을 수 없습니다',
    welcome:'환영합니다',deposit_ok:'입금 완료',withdraw_ok:'출금 신청 완료',
    cancel_withdraw:'출금 취소',cancel_ok:'출금이 취소되었습니다',
    copied:'복사됨!',win_msg:'🎉 당첨!',lose_msg:'😢 낙첨',
    change_pw_title:'비밀번호 변경',change_pw_btn:'비밀번호 변경',
    withdraw_fee_notice:'TRC20 네트워크 수수료 1 USDT 자동 차감',
    pw_change_ok:'비밀번호가 변경되었습니다',pw_current:'현재 비밀번호',
    pw_new:'새 비밀번호 (6자 이상)',pw_confirm:'새 비밀번호 확인',
    pw_mismatch:'새 비밀번호가 일치하지 않습니다',
    notice_placeholder:'공지 내용 입력...',notice_post:'등록',notice_empty:'공지 없음',
    notice_delete:'삭제',
    tab_faq:'❓ FAQ',tab_support:'💬 문의',
    faq_desc:'자주 묻는 질문과 답변',faq_no_answer:'원하는 답변이 없으신가요?',
    faq_contact:'1:1 문의하기',
    faq_cat_general:'일반',faq_cat_deposit:'입금',faq_cat_withdraw:'출금',
    faq_cat_bet:'게임',faq_cat_referral:'추천',faq_cat_partner:'파트너',
    support_desc:'궁금한 점을 문의하시면 빠르게 답변드립니다',
    new_inquiry:'새 문의 작성',inquiry_category:'카테고리',
    inquiry_title:'제목',inquiry_content:'내용',inquiry_submit:'문의 제출',
    my_inquiries:'내 문의 내역',inquiry_detail:'문의 상세',
    inq_status_pending:'답변 대기',inq_status_answered:'답변 완료',inq_status_closed:'처리 완료',
    err_locked:'계정이 잠겼습니다. 잠시 후 다시 시도하세요.',
    err_title_too_long:'제목이 너무 깁니다 (최대 100자)',
    err_content_too_long:'내용이 너무 깁니다 (최대 2000자)',
    partner_code_label:'파트너코드',partner_desc:'파트너 링크로 가입 시 자동 적용됩니다',
    // 누락 키 추가
    after_login_bet:' 후 베팅 가능',bet_amount:'베팅액',block_height:'블록 높이',
    bonus_msg:'🎁 가입 즉시 10 USDT 보너스!',change_pw_btn:'비밀번호 변경',clear:'초기화',
    dash_desc:'모든 데이터 실시간 공개 — 숨기는 것 없음',deposit_btn:'입금',
    deposit_title:'📥 USDT 입금',deposit_withdraw:'💰 입금 / 출금',
    even:'짝 (EVEN)',even_bet:'짝 베팅',
    faq_cat_deposit:'입금',faq_cat_partner:'파트너',faq_cat_referral:'추천',faq_cat_withdraw:'출금',
    faq_no_answer:'원하는 답변이 없으신가요?',game_history:'📜 게임 기록',hash:'해시',
    have_account:'이미 계정?',house_net:'운영 수수료',
    inquiry_category:'카테고리',inquiry_content:'내용',inquiry_detail:'📄 문의 상세',inquiry_submit:'문의 제출',
    l1_count:'1단계',l1_desc:'직접 초대 친구 베팅금의 2.5% 자동 지급',l1_reward:'1단계 추천수당',l1_title:'1단계 수당',
    l2_count:'2단계',l2_desc:'친구가 초대한 친구 베팅금의 1.0% 자동 지급',l2_reward:'2단계 추천수당',l2_title:'2단계 수당',
    last_char:'마지막자리',last_char_rule:'마지막자리 홀수→ODD / 짝수→EVEN',
    level1:'1단계',level2:'2단계',login:'로그인',logout:'로그아웃',
    monthly_earn:'월 수익',my_bet_history:'📋 내 베팅 내역',need_login:'로그인이 필요합니다',
    no_bets:'베팅 내역 없음',no_limit:'수당 상한 없음',no_limit_desc:'인원·베팅액 비례 무한 수익',
    no_record:'기록 없음',odd_rate:'홀 당첨률',password:'비밀번호',payout:'배당',players:'명',
    recent_verify:'📋 최근 라운드 검증',ref_desc:'친구 초대 → 베팅 때마다 자동 USDT 수당',
    ref_earnings:'추천수당',ref_link:'추천링크',register:'회원가입',register_btn:'🎁 회원가입',
    result:'결과',sec_left:'초 남음',sec_unit:'초',seed_desc:'베팅 전에 봉인 — 수학적으로 조작 불가',
    server_seed:'서버시드',sim_l1:'1단계 수',sim_l2:'2단계 수',sim_times:'일 참여 횟수',
    tab_mypage:'👤 마이페이지',tab_referral:'👥 추천수당',tab_support:'💬 문의',
    tab_verify:'🔍 검증',tab_wallet:'💰 지갑',test_accounts:'테스트 계정',
    theory_rtp:'이론 RTP',time:'시간',total_bet:'총 베팅',total_deposit:'총 입금',
    total_games:'총 게임',total_payout:'총 지급',total_pool:'총 풀',
    total_users:'유저수',total_withdraw:'총 출금',user_rtp:'유저 실제 RTP',
    v1_desc:'라운드 전 SHA256 해시 공개. 종료 후 원본 공개→변조 불가 증명.',v1_title:'① 서버 시드',
    v2_desc:'참여자 ID 합산. 본사가 사전에 알 수 없어 조작 원천 차단.',v2_title:'② 유저 시드',
    v3_desc:'비트코인 블록높이 추가 난수 소스. 외부 검증 가능.',v3_title:'③ 블록 높이',
    verify_btn:'🔍 검증하기',verify_desc:'결과가 조작되지 않았음을 수학적으로 확인',
    wallet_desc:'TRC20 (TRON) 네트워크 기반 USDT 입출금',win_rate:'승률',
    withdraw_btn:'출금 신청',yearly_earn:'연 수익',
    lb_rank:'순위',lb_loading:'랭킹 로딩 중...',lb_bet_rank:'💰 베팅액 순위',lb_roi_rank:'📈 순이익 순위',
    lb_title:'랭킹 리더보드',lb_desc:'누적 베팅 TOP10 및 순이익 TOP10',
    lb_notice:'* 아이디는 부분 마스킹 표시됩니다 · 최소 베팅 10 USDT 이상 유저만 순이익 랭킹에 표시',
    // 방 선택 번역
    room_select_title:'게임 방 선택',room_select_desc:'참여할 게임 방을 선택하세요',
    room_turbo:'⚡ 터보',room_turbo_desc:'15초 · 수수료 7%',
    room_standard:'🎯 스탠다드',room_standard_desc:'30초 · 수수료 5%',
    room_high:'💎 하이롤러',room_high_desc:'30초 · 수수료 4%',
    room_vip:'👑 VIP',room_vip_desc:'30초 · 수수료 3%',
    room_master:'🏆 마스터',room_master_desc:'30초 · 수수료 2%',
    room_bet_range:'베팅 범위',room_loading:'로딩 중...',room_back:'방 선택으로',
    room_players:'명 참여 중',room_phase_betting:'베팅 중',room_phase_result:'결과 확인',
    room_fee:'수수료',room_payout_rate:'배당률',
    // P2P 배틀룸
    room_battle:'⚔️ 배틀',room_battle_desc:'60초 · 수수료 3% · P2P 고배당',
    p2p_title:'⚔️ P2P 배틀룸',p2p_desc:'참여자끼리 베팅 — 소수 쪽에 베팅하면 고배당!',
    p2p_odd_payout:'홀 예상 배당',p2p_even_payout:'짝 예상 배당',
    p2p_pool_odd:'홀 풀',p2p_pool_even:'짝 풀',
    p2p_dynamic:'배당률 실시간 변동',p2p_hint:'소수 쪽에 베팅할수록 배당↑',
    p2p_history:'배틀룸 결과',
    // 지갑 로그인
    wallet_login:'🔗 지갑으로 로그인',wallet_login_desc:'MetaMask / TrustWallet / TokenPocket',
    wallet_connecting:'지갑 연결 중...',wallet_sign:'서명 요청 중...',
    wallet_no_provider:'지갑 앱을 설치해주세요 (MetaMask 등)',
    wallet_connected:'지갑 연결됨',wallet_address:'지갑 주소',
    wallet_login_ok:'지갑 로그인 성공!',wallet_login_fail:'지갑 로그인 실패',
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
    err_wrong_password:'Current password is incorrect',err_same_password:'New password is same as current',
    err_not_found:'Request not found',
    welcome:'Welcome',deposit_ok:'Deposit successful',withdraw_ok:'Withdrawal requested',
    cancel_withdraw:'Cancel Withdraw',cancel_ok:'Withdrawal cancelled',
    copied:'Copied!',win_msg:'🎉 WIN!',lose_msg:'😢 LOSE',
    change_pw_title:'Change Password',change_pw_btn:'Change Password',
    withdraw_fee_notice:'TRC20 network fee 1 USDT auto-deducted',
    pw_change_ok:'Password changed successfully',pw_current:'Current password',
    pw_new:'New password (min 6 chars)',pw_confirm:'Confirm new password',
    pw_mismatch:'New passwords do not match',
    notice_placeholder:'Enter notice content...',notice_post:'Post',notice_empty:'No notices',
    notice_delete:'Delete',
    tab_faq:'❓ FAQ',tab_support:'💬 Support',
    faq_desc:'Frequently Asked Questions',faq_no_answer:'Can\'t find an answer?',
    faq_contact:'Contact Support',
    faq_cat_general:'General',faq_cat_deposit:'Deposit',faq_cat_withdraw:'Withdraw',
    faq_cat_bet:'Game',faq_cat_referral:'Referral',faq_cat_partner:'Partner',
    support_desc:'Ask us anything, we\'ll reply quickly',
    new_inquiry:'New Inquiry',inquiry_category:'Category',
    inquiry_title:'Title',inquiry_content:'Content',inquiry_submit:'Submit',
    my_inquiries:'My Inquiries',inquiry_detail:'Inquiry Detail',
    inq_status_pending:'Pending',inq_status_answered:'Answered',inq_status_closed:'Closed',
    err_locked:'Account locked. Please try again later.',
    err_title_too_long:'Title too long (max 100 chars)',
    err_content_too_long:'Content too long (max 2000 chars)',
    partner_code_label:'Partner Code',partner_desc:'Automatically applied when registering via partner link',
    // missing keys
    after_login_bet:' to place bet',bet_amount:'Bet',block_height:'Block Height',
    bonus_msg:'🎁 Get 10 USDT bonus on signup!',change_pw_btn:'Change Password',clear:'Clear',
    dash_desc:'All data public in real-time — nothing hidden',deposit_btn:'Deposit',
    deposit_title:'📥 Deposit USDT',deposit_withdraw:'💰 Deposit / Withdraw',
    even:'EVEN',even_bet:'BET EVEN',
    faq_cat_deposit:'Deposit',faq_cat_partner:'Partner',faq_cat_referral:'Referral',faq_cat_withdraw:'Withdraw',
    faq_no_answer:'Can\'t find an answer?',game_history:'📜 Game History',hash:'Hash',
    have_account:'Have account?',house_net:'Operating Fee',
    inquiry_category:'Category',inquiry_content:'Content',inquiry_detail:'📄 Inquiry Detail',inquiry_submit:'Submit',
    l1_count:'Level 1',l1_desc:'2.5% of direct referral bets paid automatically',l1_reward:'Level 1 Referral',l1_title:'Level 1 Reward',
    l2_count:'Level 2',l2_desc:'1.0% of 2nd level referral bets paid automatically',l2_reward:'Level 2 Referral',l2_title:'Level 2 Reward',
    last_char:'Last Char',last_char_rule:'Last digit odd→ODD / even→EVEN',
    level1:'Level 1',level2:'Level 2',login:'Login',logout:'Logout',
    monthly_earn:'Monthly',my_bet_history:'📋 My Bet History',need_login:'Please login',
    no_bets:'No bets yet',no_limit:'No Cap',no_limit_desc:'Earn proportional to members & bets',
    no_record:'No records',odd_rate:'ODD Win Rate',password:'Password',payout:'Payout',players:'players',
    recent_verify:'📋 Recent Rounds',ref_desc:'Invite friends → Earn USDT every bet',
    ref_earnings:'Ref Earnings',ref_link:'Ref Link',register:'Register',register_btn:'🎁 Register',
    result:'Result',sec_left:'sec left',sec_unit:'s',seed_desc:'Sealed before bet — mathematically tamper-proof',
    server_seed:'Server Seed',sim_l1:'Level 1 Count',sim_l2:'Level 2 Count',sim_times:'Daily rounds',
    tab_mypage:'👤 My Page',tab_referral:'👥 Referral',tab_support:'💬 Support',
    tab_verify:'🔍 Verify',tab_wallet:'💰 Wallet',test_accounts:'Test Accounts',
    theory_rtp:'Theoretical RTP',time:'Time',total_bet:'Total Bet',total_deposit:'Total Deposit',
    total_games:'Total Games',total_payout:'Total Payout',total_pool:'Total Pool',
    total_users:'Users',total_withdraw:'Total Withdraw',user_rtp:'Actual RTP',
    v1_desc:'SHA256 hash disclosed before round. Original revealed after — tamper-proof.',v1_title:'① Server Seed',
    v2_desc:'Aggregated participant IDs. House cannot know in advance.',v2_title:'② User Seeds',
    v3_desc:'Bitcoin block height as extra entropy. Externally verifiable.',v3_title:'③ Block Height',
    verify_btn:'🔍 Verify',verify_desc:'Mathematically verify results were not manipulated',
    wallet_desc:'TRC20 (TRON) network USDT deposit & withdrawal',win_rate:'Win Rate',
    withdraw_btn:'Request Withdraw',yearly_earn:'Yearly',
    lb_rank:'Rank',lb_loading:'Loading rankings...',lb_bet_rank:'💰 Top Bettors',lb_roi_rank:'📈 Top Profit',
    lb_title:'Leaderboard',lb_desc:'Top 10 Bettors & Top 10 Profit',
    lb_notice:'* Usernames are partially masked · Min 10 USDT wagered for profit ranking',
    // Room selection
    room_select_title:'Select Game Room',room_select_desc:'Choose the game room to join',
    room_turbo:'⚡ Turbo',room_turbo_desc:'15s · 7% fee',
    room_standard:'🎯 Standard',room_standard_desc:'30s · 5% fee',
    room_high:'💎 High Roller',room_high_desc:'30s · 4% fee',
    room_vip:'👑 VIP',room_vip_desc:'30s · 3% fee',
    room_master:'🏆 Master',room_master_desc:'30s · 2% fee',
    room_bet_range:'Bet Range',room_loading:'Loading...',room_back:'Back to Rooms',
    room_players:'players',room_phase_betting:'Betting',room_phase_result:'Result',
    room_fee:'Fee',room_payout_rate:'Payout',
    room_battle:'⚔️ Battle',room_battle_desc:'60s · 3% fee · P2P High Payout',
    p2p_title:'⚔️ P2P Battle Room',p2p_desc:'Bet against each other — bet on the minority side for high payout!',
    p2p_odd_payout:'ODD Est.Payout',p2p_even_payout:'EVEN Est.Payout',
    p2p_pool_odd:'ODD Pool',p2p_pool_even:'EVEN Pool',
    p2p_dynamic:'Payout changes in real-time',p2p_hint:'Fewer bets = Higher payout!',
    p2p_history:'Battle Results',
    wallet_login:'🔗 Login with Wallet',wallet_login_desc:'MetaMask / TrustWallet / TokenPocket',
    wallet_connecting:'Connecting wallet...',wallet_sign:'Requesting signature...',
    wallet_no_provider:'Please install a wallet app (MetaMask etc.)',
    wallet_connected:'Wallet connected',wallet_address:'Wallet Address',
    wallet_login_ok:'Wallet login successful!',wallet_login_fail:'Wallet login failed',
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
    err_wrong_password:'当前密码不正确',err_same_password:'新密码与当前密码相同',
    err_not_found:'请求未找到',
    welcome:'欢迎',deposit_ok:'存款成功',withdraw_ok:'提款申请已提交',
    cancel_withdraw:'取消提款',cancel_ok:'提款已取消',
    copied:'已复制!',win_msg:'🎉 赢了!',lose_msg:'😢 输了',
    change_pw_title:'修改密码',change_pw_btn:'修改密码',
    withdraw_fee_notice:'TRC20网络手续费1 USDT自动扣除',
    pw_change_ok:'密码已修改',pw_current:'当前密码',
    pw_new:'新密码 (至少6位)',pw_confirm:'确认新密码',
    pw_mismatch:'两次输入的密码不一致',
    notice_placeholder:'输入公告内容...',notice_post:'发布',notice_empty:'暂无公告',
    notice_delete:'删除',
    tab_faq:'❓ FAQ',tab_support:'💬 客服',
    faq_desc:'常见问题解答',faq_no_answer:'没有找到答案?',
    faq_contact:'联系客服',
    faq_cat_general:'一般',faq_cat_deposit:'充值',faq_cat_withdraw:'提现',
    faq_cat_bet:'游戏',faq_cat_referral:'推荐',faq_cat_partner:'合作',
    support_desc:'有任何问题请联系我们，我们将尽快回复',
    new_inquiry:'新建咨询',inquiry_category:'类别',
    inquiry_title:'标题',inquiry_content:'内容',inquiry_submit:'提交',
    my_inquiries:'我的咨询',inquiry_detail:'咨询详情',
    inq_status_pending:'待回复',inq_status_answered:'已回复',inq_status_closed:'已关闭',
    err_locked:'账户已锁定，请稍后再试。',
    err_title_too_long:'标题过长（最多100字）',
    err_content_too_long:'内容过长（最多2000字）',
    partner_code_label:'合作码',partner_desc:'通过合作链接注册时自动应用',
    // missing keys
    after_login_bet:' 后可投注',bet_amount:'投注额',block_height:'区块高度',
    bonus_msg:'🎁 注册即获 10 USDT 奖励!',change_pw_btn:'修改密码',clear:'重置',
    dash_desc:'所有数据实时公开 — 无隐藏',deposit_btn:'存款',
    deposit_title:'📥 USDT 存款',deposit_withdraw:'💰 存款 / 提款',
    even:'双(EVEN)',even_bet:'双 投注',
    faq_cat_deposit:'充值',faq_cat_partner:'合作',faq_cat_referral:'推荐',faq_cat_withdraw:'提现',
    faq_no_answer:'没有找到答案?',game_history:'📜 游戏记录',hash:'哈希',
    have_account:'已有账户?',house_net:'运营费用',
    inquiry_category:'类别',inquiry_content:'内容',inquiry_detail:'📄 咨询详情',inquiry_submit:'提交',
    l1_count:'一级',l1_desc:'直接推荐朋友投注额的2.5%自动发放',l1_reward:'一级推荐奖',l1_title:'一级奖励',
    l2_count:'二级',l2_desc:'朋友推荐朋友投注额的1.0%自动发放',l2_reward:'二级推荐奖',l2_title:'二级奖励',
    last_char:'最后一位',last_char_rule:'最后一位奇数→ODD / 偶数→EVEN',
    level1:'一级',level2:'二级',login:'登录',logout:'退出',
    monthly_earn:'月收益',my_bet_history:'📋 我的投注记录',need_login:'请先登录',
    no_bets:'暂无投注',no_limit:'无上限',no_limit_desc:'按人数和投注额成比例无限收益',
    no_record:'暂无记录',odd_rate:'单赢率',password:'密码',payout:'赔率',players:'人',
    recent_verify:'📋 最近轮次验证',ref_desc:'邀请朋友 → 每次投注自动获得 USDT',
    ref_earnings:'推荐收益',ref_link:'推荐链接',register:'注册',register_btn:'🎁 注册',
    result:'结果',sec_left:'秒剩余',sec_unit:'秒',seed_desc:'投注前封印 — 数学上防篡改',
    server_seed:'服务器种子',sim_l1:'一级人数',sim_l2:'二级人数',sim_times:'日参与次数',
    tab_mypage:'👤 我的',tab_referral:'👥 推荐',tab_support:'💬 客服',
    tab_verify:'🔍 验证',tab_wallet:'💰 钱包',test_accounts:'测试账户',
    theory_rtp:'理论RTP',time:'时间',total_bet:'总投注',total_deposit:'总存款',
    total_games:'总游戏',total_payout:'总赔付',total_pool:'总池',
    total_users:'用户数',total_withdraw:'总提款',user_rtp:'实际RTP',
    v1_desc:'局前公布SHA256哈希。结束后公开原始数据→不可篡改证明。',v1_title:'① 服务器种子',
    v2_desc:'参与者ID汇总。本部无法事先知晓，从源头防止操纵。',v2_title:'② 用户种子',
    v3_desc:'比特币区块高度作为额外随机源。可外部验证。',v3_title:'③ 区块高度',
    verify_btn:'🔍 验证',verify_desc:'数学验证结果未被篡改',
    wallet_desc:'TRC20 (TRON) 网络 USDT 存款和提款',win_rate:'胜率',
    withdraw_btn:'申请提款',yearly_earn:'年收益',
    lb_rank:'排名',lb_loading:'加载排行榜...',lb_bet_rank:'💰 投注排行',lb_roi_rank:'📈 盈利排行',
    lb_title:'排行榜',lb_desc:'累计投注TOP10 及 净盈利TOP10',
    lb_notice:'* 用户名部分隐藏 · 最低投注10 USDT以上用户参与盈利排名',
    // 房间选择
    room_select_title:'选择游戏房间',room_select_desc:'请选择要参与的游戏房间',
    room_turbo:'⚡ 极速',room_turbo_desc:'15秒 · 手续费7%',
    room_standard:'🎯 标准',room_standard_desc:'30秒 · 手续费5%',
    room_high:'💎 大额',room_high_desc:'30秒 · 手续费4%',
    room_vip:'👑 VIP',room_vip_desc:'30秒 · 手续费3%',
    room_master:'🏆 大师',room_master_desc:'30秒 · 手续费2%',
    room_bet_range:'投注范围',room_loading:'加载中...',room_back:'返回房间选择',
    room_players:'人参与',room_phase_betting:'投注中',room_phase_result:'查看结果',
    room_fee:'手续费',room_payout_rate:'赔率',
    room_battle:'⚔️ 对战',room_battle_desc:'60秒 · 手续费3% · P2P高赔率',
    p2p_title:'⚔️ P2P对战室',p2p_desc:'参与者互相对赌 — 少数方下注可获高赔率!',
    p2p_odd_payout:'单预估赔率',p2p_even_payout:'双预估赔率',
    p2p_pool_odd:'单池',p2p_pool_even:'双池',
    p2p_dynamic:'赔率实时变动',p2p_hint:'下注越少 = 赔率越高!',
    p2p_history:'对战结果',
    wallet_login:'🔗 钱包登录',wallet_login_desc:'MetaMask / TrustWallet / TokenPocket',
    wallet_connecting:'连接钱包中...',wallet_sign:'签名请求中...',
    wallet_no_provider:'请安装钱包应用 (MetaMask等)',
    wallet_connected:'钱包已连接',wallet_address:'钱包地址',
    wallet_login_ok:'钱包登录成功!',wallet_login_fail:'钱包登录失败',
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
    err_wrong_password:'現在のパスワードが間違っています',err_same_password:'新しいパスワードが現在と同じです',
    err_not_found:'リクエストが見つかりません',
    welcome:'ようこそ',deposit_ok:'入金完了',withdraw_ok:'出金申請完了',
    cancel_withdraw:'出金取消',cancel_ok:'出金がキャンセルされました',
    copied:'コピー済み!',win_msg:'🎉 当選!',lose_msg:'😢 落選',
    change_pw_title:'パスワード変更',change_pw_btn:'パスワード変更',
    withdraw_fee_notice:'TRC20ネットワーク手数料1 USDT自動控除',
    pw_change_ok:'パスワードが変更されました',pw_current:'現在のパスワード',
    pw_new:'新しいパスワード (6文字以上)',pw_confirm:'新しいパスワードの確認',
    pw_mismatch:'新しいパスワードが一致しません',
    notice_placeholder:'お知らせ内容を入力...',notice_post:'投稿',notice_empty:'お知らせなし',
    notice_delete:'削除',
    tab_faq:'❓ FAQ',tab_support:'💬 お問い合わせ',
    faq_desc:'よくある質問と回答',faq_no_answer:'お探しの回答が見つかりませんか?',
    faq_contact:'1:1お問い合わせ',
    faq_cat_general:'一般',faq_cat_deposit:'入金',faq_cat_withdraw:'出金',
    faq_cat_bet:'ゲーム',faq_cat_referral:'紹介',faq_cat_partner:'パートナー',
    support_desc:'ご不明な点はお気軽にお問い合わせください',
    new_inquiry:'新規お問い合わせ',inquiry_category:'カテゴリ',
    inquiry_title:'タイトル',inquiry_content:'内容',inquiry_submit:'送信',
    my_inquiries:'お問い合わせ履歴',inquiry_detail:'お問い合わせ詳細',
    inq_status_pending:'未回答',inq_status_answered:'回答済み',inq_status_closed:'クローズ',
    err_locked:'アカウントがロックされています。しばらくしてからお試しください。',
    err_title_too_long:'タイトルが長すぎます（最大100文字）',
    err_content_too_long:'内容が長すぎます（最大2000文字）',
    partner_code_label:'パートナーコード',partner_desc:'パートナーリンクで登録時に自動適用されます',
    // missing keys
    after_login_bet:' してベット',bet_amount:'ベット額',block_height:'ブロック高',
    bonus_msg:'🎁 登録で10 USDTボーナス!',change_pw_btn:'パスワード変更',clear:'リセット',
    dash_desc:'全データリアルタイム公開 — 隠し事なし',deposit_btn:'入金',
    deposit_title:'📥 USDT 入金',deposit_withdraw:'💰 入金 / 出金',
    even:'偶数(EVEN)',even_bet:'偶数 ベット',
    faq_cat_deposit:'入金',faq_cat_partner:'パートナー',faq_cat_referral:'紹介',faq_cat_withdraw:'出金',
    faq_no_answer:'お探しの回答が見つかりませんか?',game_history:'📜 ゲーム記録',hash:'ハッシュ',
    have_account:'アカウントあり?',house_net:'運営手数料',
    inquiry_category:'カテゴリ',inquiry_content:'内容',inquiry_detail:'📄 お問い合わせ詳細',inquiry_submit:'送信',
    l1_count:'1段階',l1_desc:'直接招待した友達のベット額の2.5%自動支払',l1_reward:'1段階紹介報酬',l1_title:'1段階報酬',
    l2_count:'2段階',l2_desc:'友達の友達のベット額の1.0%自動支払',l2_reward:'2段階紹介報酬',l2_title:'2段階報酬',
    last_char:'最後の桁',last_char_rule:'最後の桁が奇数→ODD / 偶数→EVEN',
    level1:'1段階',level2:'2段階',login:'ログイン',logout:'ログアウト',
    monthly_earn:'月収益',my_bet_history:'📋 ベット履歴',need_login:'ログインが必要です',
    no_bets:'ベット履歴なし',no_limit:'上限なし',no_limit_desc:'人数・ベット額比例で無限収益',
    no_record:'記録なし',odd_rate:'奇数勝率',password:'パスワード',payout:'配当',players:'人',
    recent_verify:'📋 最近のラウンド検証',ref_desc:'友達招待 → ベットのたびに自動 USDT 報酬',
    ref_earnings:'紹介報酬',ref_link:'紹介リンク',register:'登録',register_btn:'🎁 登録',
    result:'結果',sec_left:'秒残り',sec_unit:'秒',seed_desc:'ベット前に封印 — 数学的に改ざん不可',
    server_seed:'サーバーシード',sim_l1:'1段階数',sim_l2:'2段階数',sim_times:'日参加回数',
    tab_mypage:'👤 マイページ',tab_referral:'👥 紹介報酬',tab_support:'💬 お問い合わせ',
    tab_verify:'🔍 検証',tab_wallet:'💰 ウォレット',test_accounts:'テストアカウント',
    theory_rtp:'理論RTP',time:'時刻',total_bet:'総ベット',total_deposit:'総入金',
    total_games:'総ゲーム',total_payout:'総支払',total_pool:'総プール',
    total_users:'ユーザー数',total_withdraw:'総出金',user_rtp:'実際RTP',
    v1_desc:'ラウンド前にSHA256ハッシュ公開。終了後原本公開→改ざん不可証明。',v1_title:'① サーバーシード',
    v2_desc:'参加者ID集計。本部が事前に知ることができず操作を根本的に防止。',v2_title:'② ユーザーシード',
    v3_desc:'ビットコインブロック高を追加乱数ソースとして使用。外部検証可能。',v3_title:'③ ブロック高',
    verify_btn:'🔍 検証する',verify_desc:'結果が操作されていないことを数学的に確認',
    wallet_desc:'TRC20 (TRON) ネットワーク USDT 入出金',win_rate:'勝率',
    withdraw_btn:'出金申請',yearly_earn:'年収益',
    lb_rank:'順位',lb_loading:'ランキング読込中...',lb_bet_rank:'💰 ベット額順位',lb_roi_rank:'📈 純損益順位',
    lb_title:'ランキング リーダーボード',lb_desc:'累計ベットTOP10 & 純損益TOP10',
    lb_notice:'* ユーザー名は部分マスク表示 · 最低10 USDT以上ベットしたユーザーのみ純損益ランキングに表示',
    // 部屋選択
    room_select_title:'ゲームルーム選択',room_select_desc:'参加するゲームルームを選択してください',
    room_turbo:'⚡ ターボ',room_turbo_desc:'15秒 · 手数料7%',
    room_standard:'🎯 スタンダード',room_standard_desc:'30秒 · 手数料5%',
    room_high:'💎 ハイローラー',room_high_desc:'30秒 · 手数料4%',
    room_vip:'👑 VIP',room_vip_desc:'30秒 · 手数料3%',
    room_master:'🏆 マスター',room_master_desc:'30秒 · 手数料2%',
    room_bet_range:'ベット範囲',room_loading:'読み込み中...',room_back:'ルーム選択に戻る',
    room_players:'人が参加中',room_phase_betting:'ベット中',room_phase_result:'結果確認',
    room_fee:'手数料',room_payout_rate:'配当率',
    room_battle:'⚔️ バトル',room_battle_desc:'60秒 · 手数料3% · P2P高配当',
    p2p_title:'⚔️ P2P バトルルーム',p2p_desc:'参加者同士でベット — 少数派に賭けるほど高配当!',
    p2p_odd_payout:'単推定配当',p2p_even_payout:'双推定配当',
    p2p_pool_odd:'単プール',p2p_pool_even:'双プール',
    p2p_dynamic:'配当はリアルタイム変動',p2p_hint:'少ない方に賭けると高配当!',
    p2p_history:'バトル結果',
    wallet_login:'🔗 ウォレットでログイン',wallet_login_desc:'MetaMask / TrustWallet / TokenPocket',
    wallet_connecting:'ウォレット接続中...',wallet_sign:'署名リクエスト中...',
    wallet_no_provider:'ウォレットアプリをインストールしてください (MetaMask等)',
    wallet_connected:'ウォレット接続済み',wallet_address:'ウォレットアドレス',
    wallet_login_ok:'ウォレットログイン成功!',wallet_login_fail:'ウォレットログイン失敗',
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
function setLang(l) { lang = l; localStorage.setItem('lang', l); applyLang(); loadNotices() }

// ═══════════════════════════════════════════════
// 전역 상태
// ═══════════════════════════════════════════════
let sid = localStorage.getItem('sid') || ''
let me = null
let lastRoundId = -1
let myBet = null
let currentPayout = 1.90  // 게임 배당률 (동적 업데이트)
let currentRoom = localStorage.getItem('currentRoom') || 'standard'  // 현재 선택된 방
let roomStatusInterval = null  // 방 상태 폴링 인터벌
let p2pInterval = null         // P2P 방 폴링 인터벌

const $ = id => document.getElementById(id)
const fmtU = n => (Math.round(n * 100) / 100).toFixed(2)
const ago = ts => {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return s + 's'
  if (s < 3600) return Math.floor(s/60) + 'm'
  return Math.floor(s/3600) + 'h'
}

async function api(path, opts={}, retries=2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(path, {
        headers: { 'Content-Type': 'application/json', 'X-Session-Id': sid },
        ...opts
      })
      if (res.status >= 500) {
        if (i < retries) { await new Promise(r => setTimeout(r, 800 * (i+1))); continue }
        return { error: 'SERVER_ERROR' }
      }
      return await res.json()
    } catch(e) {
      if (i < retries) { await new Promise(r => setTimeout(r, 800 * (i+1))); continue }
      return { error: 'NETWORK_ERROR' }
    }
  }
  return { error: 'SERVER_ERROR' }
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
    MAX_BET:'err_max_bet', LOCKED:'err_locked',
    TITLE_TOO_LONG:'err_title_too_long', CONTENT_TOO_LONG:'err_content_too_long',
  }
  return t(m[code] || 'err_unauth')
}

// ═══════════════════════════════════════════════
// 탭 네비게이션
// ═══════════════════════════════════════════════
function showTab(name) {
  // 게임 탭 이탈 시 방 상태 폴링 인터벌 정리
  if (name !== 'game' && roomStatusInterval) {
    clearInterval(roomStatusInterval)
    roomStatusInterval = null
  }
  // P2P 인터벌 정리
  if (name !== 'p2p' && p2pInterval) {
    clearInterval(p2pInterval)
    p2pInterval = null
  }

  // 모든 패널 숨기기 / 선택 패널 보이기
  const tabs = ['game','mypage','wallet','dashboard','referral','verify','leaderboard','faq','support','login','register','admin','p2p']
  tabs.forEach(tab => {
    const p  = $('p-' + tab)
    const b1 = $('t-' + tab)
    const b2 = $('t-' + tab + '-m')
    if (p)  p.classList.toggle('hidden', tab !== name)
    if (b1) { b1.classList.toggle('tab-on', tab === name); b1.classList.toggle('tab-off', tab !== name) }
    if (b2) { b2.classList.toggle('tab-on', tab === name); b2.classList.toggle('tab-off', tab !== name) }
  })

  // 탭 전환 시 페이지 맨 위로 스크롤 (가장 확실한 방법)
  window.scrollTo({ top: 0, behavior: 'instant' })

  // 각 탭 데이터 로드
  try {
    if (name === 'dashboard')        loadDashboard()
    else if (name === 'referral')    loadReferral()
    else if (name === 'verify')      loadVerifyHist()
    else if (name === 'wallet')      loadWallet()
    else if (name === 'mypage')      loadMypage()
    else if (name === 'admin')       loadAdmin()
    else if (name === 'faq')         loadFAQ('')
    else if (name === 'support')     loadSupport()
    else if (name === 'leaderboard') loadLeaderboard('total_bet')
    else if (name === 'game')        showRoomSelect()
    else if (name === 'p2p')         loadP2PRoom()
  } catch(e) {
    console.error('showTab error:', e)
  }
}

function initLayout() {
  // CSS 변수 설정: 네비 top 위치 = 헤더 높이
  function setNavTop() {
    const hdr = $('mainHeader')
    if (hdr) {
      document.documentElement.style.setProperty('--hdr-h', hdr.offsetHeight + 'px')
    }
  }
  setNavTop()
  window.addEventListener('resize', setNavTop)
}

function updateUI() {
  const loggedIn = !!me

  // 헤더 로그인/로그아웃 영역
  const hdrGuest = $('hdrGuest')
  const hdrUser  = $('hdrUser')
  if (hdrGuest) hdrGuest.classList.toggle('hidden', loggedIn)
  if (hdrUser)  { hdrUser.classList.toggle('hidden', !loggedIn); hdrUser.classList.toggle('flex', loggedIn) }

  // 로그인 전용 탭 버튼 (로그인 후 숨김) - 탭 네비에 없을 수 있으므로 null 체크
  const loginOnlyTabs = ['login','register']
  loginOnlyTabs.forEach(tabName => {
    ['t-'+tabName, 't-'+tabName+'-m'].forEach(id => {
      const b = $(id); if (b) b.classList.toggle('hidden', loggedIn)
    })
  })

  // 로그인 후 표시 탭 버튼
  const userOnlyTabs = ['mypage','wallet','support','referral','verify']
  userOnlyTabs.forEach(tabName => {
    ['t-'+tabName, 't-'+tabName+'-m'].forEach(id => {
      const b = $(id); if (b) b.classList.toggle('hidden', !loggedIn)
    })
  })

  // 관리자 탭
  const adminTab = $('t-admin')
  if (adminTab) adminTab.classList.toggle('hidden', !(me && me.isAdmin))

  if (me) {
    if ($('hdrName')) $('hdrName').textContent = me.username
    if ($('hdrBal'))  $('hdrBal').textContent  = fmtU(me.balance) + ' USDT'
    const sg = $('sideGuest'); if (sg) sg.classList.add('hidden')
    const su = $('sideUser');  if (su) su.classList.remove('hidden')
    if ($('siBal'))  $('siBal').textContent  = fmtU(me.balance) + ' USDT'
    if ($('siRef'))  $('siRef').textContent  = fmtU(me.referralEarnings || 0) + ' USDT'
    if ($('siL1'))   $('siL1').textContent   = me.level1Count || 0
    if ($('siL2'))   $('siL2').textContent   = me.level2Count || 0
    if ($('siCode')) $('siCode').textContent = me.referralCode || '-'
  } else {
    const sg = $('sideGuest'); if (sg) sg.classList.remove('hidden')
    const su = $('sideUser');  if (su) su.classList.add('hidden')
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
  if (data.error) {
    let msg = errMap(data.error)
    if (data.error === 'LOCKED' && data.remainMin) msg = `잠금 효 ${data.remainMin}분 뒤 재시도하세요`
    $('lErr').textContent = msg; $('lErr').classList.remove('hidden'); return
  }
  sid = data.sessionId
  me  = data.user
  localStorage.setItem('sid', sid)
  updateUI()
  showTab('game')
  toast('👋 ' + t('welcome') + ', ' + me.username + '!', 'text-green-400')
}

async function doRegister() {
  const username     = $('rUser').value.trim()
  const password     = $('rPass').value
  const referralCode = $('rRef').value.trim()
  const partnerCode  = new URLSearchParams(location.search).get('partner') || ''
  $('rErr').classList.add('hidden'); $('rOk').classList.add('hidden')
  const data = await api('/api/register', { method:'POST', body: JSON.stringify({username, password, referralCode, partnerCode}) })
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
// 방 선택 기능
// ═══════════════════════════════════════════════
const ROOM_CONFIGS = {
  turbo:    { name:'Turbo',    emoji:'⚡', color:'yellow', minBet:1,    maxBet:100,   feeRate:0.07, payout:1.86, roundDuration:15 },
  standard: { name:'Standard', emoji:'🎯', color:'blue',   minBet:101,  maxBet:500,   feeRate:0.05, payout:1.90, roundDuration:30 },
  high:     { name:'High',     emoji:'💎', color:'purple', minBet:501,  maxBet:2000,  feeRate:0.04, payout:1.92, roundDuration:30 },
  vip:      { name:'VIP',      emoji:'👑', color:'orange', minBet:2001, maxBet:5000,  feeRate:0.03, payout:1.94, roundDuration:30 },
  master:   { name:'Master',   emoji:'🏆', color:'red',    minBet:5001, maxBet:10000, feeRate:0.02, payout:1.96, roundDuration:30 },
}

function showRoomSelect() {
  const ss = $('roomSelectScreen')
  const gs = $('gamePlayScreen')
  if (ss) ss.classList.remove('hidden')
  if (gs) gs.classList.add('hidden')
  // 방 상태 로드 시작
  loadAllRoomStatus()
  if (roomStatusInterval) clearInterval(roomStatusInterval)
  roomStatusInterval = setInterval(loadAllRoomStatus, 5000)
}

async function loadAllRoomStatus() {
  for (const roomKey of Object.keys(ROOM_CONFIGS)) {
    loadRoomStatus(roomKey)
  }
}

async function loadRoomStatus(roomKey) {
  const el = $('room-status-' + roomKey)
  if (!el) return
  try {
    const data = await api('/api/round/current?room=' + roomKey)
    if (!data || !data.id) return
    const r = ROOM_CONFIGS[roomKey]
    const phase = data.phase === 'betting' ? t('room_phase_betting') : t('room_phase_result')
    const timeLeft = data.timeLeft || 0
    const betCount = data.betCount || 0
    const color = r.color
    const dotColor = data.phase === 'betting' ? `bg-${color}-400` : 'bg-gray-400'
    el.innerHTML = `
      <span class="w-1.5 h-1.5 ${dotColor} rounded-full ${data.phase==='betting'?'pulse':''} inline-block"></span>
      <span class="font-medium">${phase}</span>
      <span class="text-gray-400">·</span>
      <span>${timeLeft}${t('sec_unit')}</span>
      <span class="text-gray-400">·</span>
      <span>${betCount} ${t('room_players')}</span>
    `
  } catch(e) {
    // ignore
  }
}

function selectRoom(roomKey) {
  if (!ROOM_CONFIGS[roomKey]) return
  currentRoom = roomKey
  localStorage.setItem('currentRoom', roomKey)
  if (roomStatusInterval) { clearInterval(roomStatusInterval); roomStatusInterval = null }
  const ss = $('roomSelectScreen')
  const gs = $('gamePlayScreen')
  if (ss) ss.classList.add('hidden')
  if (gs) gs.classList.remove('hidden')
  // 방 배지 업데이트
  updateRoomBadge()
  // 베팅 범위 업데이트
  updateBetLimitsForRoom()
  // 라운드 로드
  loadRound()
}

function backToRoomSelect() {
  currentRoom = 'standard'
  localStorage.removeItem('currentRoom')
  showRoomSelect()
}

function updateRoomBadge() {
  const badge = $('currentRoomBadge')
  if (!badge) return
  const r = ROOM_CONFIGS[currentRoom]
  if (!r) return
  const colorMap = {
    yellow: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40',
    blue:   'bg-blue-500/20 text-blue-300 border border-blue-500/40',
    purple: 'bg-purple-500/20 text-purple-300 border border-purple-500/40',
    orange: 'bg-orange-500/20 text-orange-300 border border-orange-500/40',
    red:    'bg-red-500/20 text-red-300 border border-red-500/40',
  }
  const cls = colorMap[r.color] || colorMap.blue
  badge.className = `flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold glass ${cls}`
  badge.innerHTML = `${r.emoji} ${t('room_' + currentRoom) || r.name} &nbsp;·&nbsp; ${r.minBet}~${r.maxBet.toLocaleString()} USDT &nbsp;·&nbsp; x${r.payout}`
}

function updateBetLimitsForRoom() {
  const r = ROOM_CONFIGS[currentRoom]
  if (!r) return
  const betAmt = $('betAmt')
  if (betAmt) {
    betAmt.min = r.minBet
    betAmt.max = r.maxBet
    betAmt.placeholder = `${r.minBet.toLocaleString()} ~ ${r.maxBet.toLocaleString()} USDT`
    betAmt.value = ''
  }
  // 베팅 금액 라벨 업데이트
  const label = document.querySelector('[data-i18n="bet_amount_label"]')
  if (label) {
    label.textContent = `${t('bet_amount_label').split('(')[0].trim()} (${r.minBet.toLocaleString()}~${r.maxBet.toLocaleString()} USDT)`
  }
  // 빠른 베팅 버튼 동적 업데이트
  const quickBetArea = $('quickBetBtns')
  if (quickBetArea) {
    const max = r.maxBet
    const min = r.minBet
    // 방별로 빠른 베팅 금액 설정
    let btns
    if (max <= 100) {         // 터보
      btns = [1, 5, 10, 25, 50, 100]
    } else if (max <= 500) {  // 스탠다드
      btns = [101, 150, 200, 300, 400, 500]
    } else if (max <= 2000) { // 하이롤러
      btns = [501, 700, 1000, 1500, 2000]
    } else if (max <= 5000) { // VIP
      btns = [2001, 2500, 3000, 4000, 5000]
    } else {                  // 마스터
      btns = [5001, 6000, 7000, 8000, 10000]
    }
    quickBetArea.innerHTML = btns.map(n =>
      `<button onclick="setBet(${n})" class="px-2 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition">${n >= 1000 ? (n/1000).toFixed(0)+'K' : n}</button>`
    ).join('') +
    `<button onclick="setBetFrac(0.25)" class="px-2 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition">1/4</button>` +
    `<button onclick="setBetFrac(0.5)"  class="px-2 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition">1/2</button>` +
    `<button onclick="maxBet()"         class="px-2 py-1.5 bg-yellow-500/30 hover:bg-yellow-500/50 rounded-lg text-xs font-bold text-yellow-300 transition">ALL-IN</button>` +
    `<button onclick="clearBet()"       class="px-2 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs font-bold text-red-300 transition" data-i18n="clear">${t('clear')}</button>`
  }
  // 배당률·수수료 표시 업데이트
  currentPayout = r.payout
  const pd = $('gPayoutDisplay')
  if (pd) pd.textContent = r.payout + 'x'
  // 수수료 표시 (있을 경우)
  const feeEl = $('roomFeeDisplay')
  if (feeEl) feeEl.textContent = (r.feeRate * 100) + '%'
}

// ═══════════════════════════════════════════════
// 게임
// ═══════════════════════════════════════════════
async function loadRound() {
  const data = await api('/api/round/current?room=' + currentRoom)
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
  const r = ROOM_CONFIGS[currentRoom] || ROOM_CONFIGS.standard
  const bar = $('gBar')
  if (bar) bar.style.width = (isBetting ? (data.timeLeft/r.roundDuration*100) : (data.timeLeft/8*100)) + '%'

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

function addBet(n) { const el=$('betAmt'); el.value = Math.round((parseFloat(el.value||0)+n)*100)/100; updatePayoutPreview() }
function setBet(n)  { const el=$('betAmt'); el.value = n; updatePayoutPreview() }
function clearBet() { $('betAmt').value = ''; updatePayoutPreview() }
function maxBet()  {
  if (me) {
    const r = ROOM_CONFIGS[currentRoom]
    const cap = r ? r.maxBet : 1000
    $('betAmt').value = Math.min(me.balance, cap)
    updatePayoutPreview()
  }
}

// 예상 수령액 미리보기
function updatePayoutPreview() {
  const amt = parseFloat($('betAmt')?.value || 0)
  const previewEl = $('payoutPreview')
  const amtEl = $('payoutPreviewAmt')
  const warnEl = $('betBalanceWarn')
  const warnCur = $('betBalanceCur')
  if (!previewEl || !amtEl) return
  if (!amt || amt <= 0) {
    previewEl.classList.add('hidden')
    if (warnEl) warnEl.classList.add('hidden')
    return
  }
  const payout = Math.round(amt * currentPayout * 100) / 100
  amtEl.textContent = fmtU(payout)
  previewEl.classList.remove('hidden')
  // 잔액 부족 경고
  if (warnEl && warnCur) {
    const balance = me ? parseFloat(me.balance || 0) : 0
    if (me && amt > balance) {
      warnCur.textContent = fmtU(balance)
      warnEl.classList.remove('hidden')
    } else {
      warnEl.classList.add('hidden')
    }
  }
}
// 1/4, 1/2 비율 베팅
function fracBet(frac) {
  if (!me) return
  const r = ROOM_CONFIGS[currentRoom]
  const cap = r ? r.maxBet : 1000
  const val = Math.round(Math.min(me.balance, cap) * frac * 100) / 100
  $('betAmt').value = val > 0 ? val : ''
  updatePayoutPreview()
}
const setBetFrac = fracBet  // 별칭

async function doBet(choice) {
  if (!me) { showTab('login'); return }
  const amount = parseFloat($('betAmt').value)
  if (!amount || amount <= 0) { toast(t('err_min_bet'), 'text-red-400'); return }
  const data = await api('/api/bet', { method:'POST', body: JSON.stringify({choice, amount, room: currentRoom}) })
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
let mpBetPage = 1
let mpBetTotalPages = 1

async function loadMypageBets(page) {
  page = Math.max(1, Math.min(page||1, mpBetTotalPages||99))
  mpBetPage = page
  const tbl = $('mpBetTable')
  if (!tbl) return
  const data = await api('/api/mypage?page=' + page)
  if (data.error) return
  mpBetTotalPages = data.totalPages || 1

  // 통계 업데이트 (첫 페이지만)
  if (page === 1) {
    const s = data.stats
    if ($('mpTotalGames')) $('mpTotalGames').textContent = data.totalCount || s.totalGames
    if ($('mpWinRate'))    $('mpWinRate').textContent    = s.winRate + '%'
    if ($('mpNetProfit'))  {
      $('mpNetProfit').textContent = (s.netProfit >= 0 ? '+' : '') + fmtU(s.netProfit)
      $('mpNetProfit').className = 'text-2xl font-black ' + (s.netProfit >= 0 ? 'text-green-400' : 'text-red-400')
    }
    if ($('mpRefEarnings')) $('mpRefEarnings').textContent = fmtU(s.referralEarnings)
  }

  // 페이지네이션
  const pager = $('mpBetPager')
  const pageInfo = $('mpBetPageInfo')
  if (pager) {
    if (mpBetTotalPages > 1) { pager.classList.remove('hidden') } else { pager.classList.add('hidden') }
  }
  if (pageInfo) pageInfo.textContent = `${page} / ${mpBetTotalPages} 페이지`
  const prev = $('mpBetPrev'), next = $('mpBetNext')
  if (prev) prev.disabled = page <= 1
  if (next) next.disabled = page >= mpBetTotalPages

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

async function loadMypage() {
  if (!me) {
    $('mypageNeedLogin').classList.remove('hidden')
    $('mypageInfo').classList.add('hidden')
    return
  }
  $('mypageNeedLogin').classList.add('hidden')
  $('mypageInfo').classList.remove('hidden')

  // 베팅 내역 (페이지네이션으로 분리)
  mpBetPage = 1
  await loadMypageBets(1)
  loadMyStats30()  // 30일 손익 그래프
  loadMyMessages() // 메시지함

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
            <div class="text-xs text-gray-500 mono">${r.address ? r.address.substring(0,12)+'...' : '-'}</div>
            ${r.note ? `<div class="text-xs text-red-400">${r.note}</div>` : ''}
          </div>
          <div class="text-right flex flex-col items-end gap-1">
            <span class="px-2 py-0.5 rounded-full text-xs status-${r.status} wd-status" data-status="${r.status}">${{pending:'대기중',approved:'승인완료',rejected:'거절',cancelled:'취소'}[r.status]||r.status}</span>
            <div class="text-xs text-gray-500">${ago(r.created_at || r.createdAt)}</div>
            ${(r.tx_hash||r.txHash) && r.status==='approved' ? `<a href="https://tronscan.org/#/transaction/${r.tx_hash||r.txHash}" target="_blank" class="text-xs text-blue-400 mono hover:underline">${(r.tx_hash||r.txHash).substring(0,10)}... 🔗</a>` : (r.tx_hash||r.txHash) ? `<div class="text-xs text-green-400 mono">${(r.tx_hash||r.txHash).substring(0,10)}...</div>` : ''}
            ${r.status === 'pending' ? `<button onclick="cancelWithdraw('${r.id}')" class="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition">${t('cancel_withdraw')}</button>` : ''}
          </div>
        </div>`).join('')

      // 출금 상태 한글화 + TX Hash 링크 처리
      wdEl.querySelectorAll('.wd-status').forEach(el => {
        const st = el.dataset.status
        const statusKo = { pending:'대기중', approved:'승인완료', rejected:'거절', cancelled:'취소' }
        el.textContent = statusKo[st] || st
      })
    }
  }

  // 입금 내역
  const depData = await api('/api/me/deposits')
  const depEl = $('depHistory')
  if (depEl) {
    if (!depData.deposits || depData.deposits.length === 0) {
      depEl.innerHTML = `<div class="text-xs text-gray-500 text-center py-2">${t('no_record')}</div>`
    } else {
      const netLbl = { trc20:'TRC20', erc20:'ERC20', bep20:'BEP20', manual:'수동', admin:'관리자' }
      depEl.innerHTML = depData.deposits.map(d => `
        <div class="flex items-center justify-between p-2 bg-black/20 rounded-lg">
          <div>
            <div class="text-xs font-bold text-green-400">+${fmtU(d.amount)} USDT</div>
            <div class="text-xs text-gray-500">${netLbl[d.network]||d.network} ${d.memo ? '· '+d.memo : ''}</div>
          </div>
          <div class="text-right">
            <div class="text-xs text-gray-500">${ago(d.createdAt)}</div>
            ${d.txHash ? `<div class="text-xs text-blue-400 mono">${d.txHash.substring(0,10)}...</div>` : ''}
          </div>
        </div>`).join('')
    }
  }
}

// ═══════════════════════════════════════════════
// 지갑
// ═══════════════════════════════════════════════
// 현재 선택된 네트워크
let currentDepositNetwork = null
let depositNetworks = []

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

  // 베팅 달성 현황
  const required = data.totalDeposit * 0.5
  const progress = Math.min(100, required > 0 ? (data.totalBetAmount / required * 100) : 100)
  if ($('wBetProgress')) $('wBetProgress').textContent = fmtU(data.totalBetAmount) + ' / ' + fmtU(required) + ' USDT'
  if ($('wBetBar'))      $('wBetBar').style.width      = progress + '%'
  if ($('wBetBar'))      $('wBetBar').className = 'h-2 rounded-full transition-all ' + (progress >= 100 ? 'bg-green-500' : 'bg-blue-500')

  // 입금 네트워크 정보 로드
  await loadDepositNetworks()
}

async function loadDepositNetworks() {
  const lang = localStorage.getItem('lang') || 'ko'
  const data = await api('/api/deposit-info?lang=' + lang)
  const tabsEl = $('depositNetworkTabs')
  const infoEl = $('depositNetworkInfo')
  if (!tabsEl || !infoEl) return

  depositNetworks = data.networks || []

  if (depositNetworks.length === 0) {
    // 설정된 입금 주소 없음 - 관리자에게 문의 안내
    infoEl.innerHTML = `
      <div class="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center text-sm text-yellow-400">
        <i class="fas fa-exclamation-triangle mb-2 text-lg block"></i>
        입금 주소가 아직 설정되지 않았습니다.<br>
        <span class="text-xs text-gray-400 mt-1 block">관리자에게 문의하거나 잠시 후 다시 시도하세요.</span>
      </div>`
    tabsEl.innerHTML = ''
    return
  }

  // 네트워크 탭 생성
  const netColors = { trc20:'green', erc20:'blue', bep20:'yellow' }
  tabsEl.innerHTML = depositNetworks.map((net, i) => `
    <button onclick="selectDepositNetwork('${net.id}')" id="depTab_${net.id}"
      class="px-3 py-1.5 rounded-full text-xs font-bold transition border ${i === 0
        ? `bg-${netColors[net.id] || 'green'}-500/30 text-${netColors[net.id] || 'green'}-300 border-${netColors[net.id] || 'green'}-500/40`
        : 'bg-white/10 text-gray-400 border-white/20 hover:bg-white/20'}">
      ${net.label}
    </button>`).join('')

  // 첫 번째 네트워크 선택
  if (depositNetworks.length > 0) selectDepositNetwork(depositNetworks[0].id)
}

function selectDepositNetwork(netId) {
  currentDepositNetwork = netId
  const net = depositNetworks.find(n => n.id === netId)
  if (!net) return

  // 탭 스타일 업데이트
  const colors = { trc20:'green', erc20:'blue', bep20:'yellow' }
  depositNetworks.forEach(n => {
    const tab = $('depTab_' + n.id)
    if (!tab) return
    const c = colors[n.id] || 'green'
    if (n.id === netId) {
      tab.className = `px-3 py-1.5 rounded-full text-xs font-bold transition border bg-${c}-500/30 text-${c}-300 border-${c}-500/40`
    } else {
      tab.className = 'px-3 py-1.5 rounded-full text-xs font-bold transition border bg-white/10 text-gray-400 border-white/20 hover:bg-white/20'
    }
  })

  const infoEl = $('depositNetworkInfo')
  if (!infoEl) return
  const c = colors[netId] || 'green'
  const networkName = net.label
  const qrNote = netId === 'trc20' ? '주소는 T로 시작합니다' : '주소는 0x로 시작합니다'

  infoEl.innerHTML = `
    <div class="bg-black/30 border border-${c}-500/30 rounded-xl p-4 mb-3">
      <div class="text-xs text-gray-400 mb-2">💳 ${networkName} 입금 주소</div>
      <div class="mono text-xs text-${c}-400 break-all font-bold leading-relaxed" id="wDepAddr">${net.address}</div>
      <div class="flex gap-2 mt-3">
        <button onclick="copyNetworkAddr('${net.address}')" 
          class="flex-1 py-2 bg-${c}-600/20 border border-${c}-600/30 rounded-lg text-xs text-${c}-400 hover:bg-${c}-600/30 transition font-bold">
          📋 주소 복사
        </button>
      </div>
      <div class="text-xs text-gray-500 mt-2">💡 ${qrNote}</div>
    </div>
    <div class="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-xs text-yellow-300 mb-2">
      <i class="fas fa-exclamation-triangle mr-1"></i>
      <strong>${networkName} 전용 주소</strong>입니다. 다른 네트워크로 전송 시 자산 손실이 발생합니다.
    </div>
    ${net.memo ? `<div class="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300">
      <i class="fas fa-info-circle mr-1"></i>${net.memo}
    </div>` : ''}
    <div class="text-xs text-gray-500 mt-2 text-center">최소 입금액: <strong class="text-white">${net.minAmount} USDT</strong></div>`
}

function copyNetworkAddr(addr) {
  navigator.clipboard.writeText(addr).then(() => toast('📋 ' + t('copied'), 'text-blue-400'))
    .catch(() => {
      // 구형 브라우저 fallback
      const el = document.createElement('textarea')
      el.value = addr; document.body.appendChild(el); el.select()
      document.execCommand('copy'); document.body.removeChild(el)
      toast('📋 ' + t('copied'), 'text-blue-400')
    })
}

function copyAddr() {
  const addr = $('wDepAddr')?.textContent
  if (addr && addr !== '-') copyNetworkAddr(addr)
}

function setMaxWd() {
  if (me) $('wdAmt').value = Math.max(0, me.balance - 1).toFixed(2)  // 수수료 1 USDT 자동 차감
}

// 출금 네트워크 선택
let currentWdNetwork = 'trc20'
const wdNetworkInfo = {
  trc20: {
    label: '출금 주소 (TRC20 - TRON)',
    placeholder: 'T로 시작하는 34자리 주소 (예: TXxxx...)',
    guide: '🟢 TRC20 (TRON): T로 시작하는 34자리 주소 | 수수료 최저 | 예) TRX7NMhVDU7YBo5GH5eSb9d...',
    guideColor: 'text-green-400'
  },
  erc20: {
    label: '출금 주소 (ERC20 - Ethereum)',
    placeholder: '0x로 시작하는 42자리 주소 (예: 0x1234...)',
    guide: '🔵 ERC20 (ETH): 0x로 시작하는 42자리 주소 | 가스비 높음 | 예) 0x742d35Cc6634C0532...',
    guideColor: 'text-blue-400'
  },
  bep20: {
    label: '출금 주소 (BEP20 - BSC)',
    placeholder: '0x로 시작하는 42자리 주소 (예: 0x1234...)',
    guide: '🟡 BEP20 (BSC): 0x로 시작하는 42자리 주소 | 수수료 저렴 | 예) 0x742d35Cc6634C0532...',
    guideColor: 'text-yellow-400'
  }
}

function selectWdNetwork(net) {
  currentWdNetwork = net
  const info = wdNetworkInfo[net]
  if (!info) return

  // 버튼 스타일
  document.querySelectorAll('.wdnet-btn').forEach(btn => {
    btn.className = 'px-3 py-1.5 rounded-lg text-xs font-bold border border-white/20 bg-white/5 text-gray-400 hover:bg-white/10 transition wdnet-btn'
  })
  const activeBtn = $('wdNet-' + net)
  if (activeBtn) {
    const colors = { trc20:'border-green-500/40 bg-green-500/10 text-green-400', erc20:'border-blue-500/40 bg-blue-500/10 text-blue-400', bep20:'border-yellow-500/40 bg-yellow-500/10 text-yellow-400' }
    activeBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-bold border transition wdnet-btn ' + (colors[net]||'')
  }

  // 주소 라벨 + 플레이스홀더 업데이트
  const labelEl = $('wdAddrLabel')
  const addrEl  = $('wdAddr')
  if (labelEl) labelEl.textContent = info.label
  if (addrEl)  { addrEl.placeholder = info.placeholder; addrEl.value = '' }

  // 안내 메시지
  const guideEl = $('wdNetGuide')
  if (guideEl) {
    guideEl.textContent = info.guide
    guideEl.className = 'mt-1.5 text-xs bg-white/5 rounded-lg px-3 py-2 ' + info.guideColor
    guideEl.classList.remove('hidden')
  }
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
  const network = currentWdNetwork || 'trc20'
  $('wdErr').classList.add('hidden'); $('wdOk').classList.add('hidden')
  const data = await api('/api/withdraw', { method:'POST', body: JSON.stringify({address, amount, network}) })
  if (data.error) {
    let msg = errMap(data.error)
    if (data.error === 'BET_REQUIREMENT') msg += ` (${fmtU(data.current||0)}/${fmtU(data.required||0)} USDT)`
    if (data.error === 'DAILY_LIMIT') msg = `⚠️ 일일 출금 한도 초과 (한도: ${fmtU(data.limit||0)} USDT, 잔여: ${fmtU(data.remaining||0)} USDT)`
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

// 출금 취소 (pending 상태만)
async function cancelWithdraw(requestId) {
  if (!confirm('출금 취소 하시겠습니까? 수수료 포함 금액이 반환됩니다.')) return
  const data = await api('/api/withdraw/cancel', { method:'POST', body: JSON.stringify({requestId}) })
  if (data.error) { toast('❌ ' + (data.error === 'NOT_FOUND_OR_PROCESSED' ? t('err_not_found') : data.error), 'text-red-400'); return }
  me.balance = data.balance
  updateUI()
  loadMypage()
  toast('✅ ' + t('cancel_ok') + ' (환불: ' + fmtU(data.refunded) + ' USDT)', 'text-green-400')
}

// ═══════════════════════════════════════════════
// 비밀번호 변경
// ═══════════════════════════════════════════════
async function doChangePassword() {
  const currentPassword = $('cpCurrent').value
  const newPassword     = $('cpNew').value
  const confirmPassword = $('cpConfirm').value
  $('cpErr').classList.add('hidden'); $('cpOk').classList.add('hidden')

  if (!currentPassword || !newPassword || !confirmPassword) {
    $('cpErr').textContent = t('err_unauth'); $('cpErr').classList.remove('hidden'); return
  }
  if (newPassword !== confirmPassword) {
    $('cpErr').textContent = t('pw_mismatch'); $('cpErr').classList.remove('hidden'); return
  }

  const data = await api('/api/change-password', { method:'POST', body: JSON.stringify({currentPassword, newPassword}) })
  if (data.error) {
    const eMap = { WRONG_PASSWORD: 'err_wrong_password', SAME_PASSWORD: 'err_same_password', PASSWORD_SHORT: 'err_password_short' }
    $('cpErr').textContent = t(eMap[data.error] || 'err_unauth')
    $('cpErr').classList.remove('hidden'); return
  }
  $('cpOk').classList.remove('hidden')
  $('cpCurrent').value = ''; $('cpNew').value = ''; $('cpConfirm').value = ''
  toast('🔐 ' + t('pw_change_ok'), 'text-green-400')
}

// ═══════════════════════════════════════════════
// 대시보드 (Chart.js + 페이지네이션)
// ═══════════════════════════════════════════════
let histPage = 1
let histTotalPages = 1
let oddEvenChartInstance = null

async function loadDashboard(page) {
  page = page || histPage
  if (page < 1 || page > histTotalPages) return
  histPage = page

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

  // Chart.js 도넛 차트 업데이트
  const chartCanvas = $('oddEvenChart')
  if (chartCanvas && typeof Chart !== 'undefined') {
    if (oddEvenChartInstance) oddEvenChartInstance.destroy()
    oddEvenChartInstance = new Chart(chartCanvas, {
      type: 'doughnut',
      data: {
        labels: [t('odd'), t('even')],
        datasets: [{
          data: [odd || 1, even || 1],
          backgroundColor: ['rgba(229,62,62,0.7)', 'rgba(49,130,206,0.7)'],
          borderColor: ['rgba(229,62,62,1)', 'rgba(49,130,206,1)'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#9ca3af', font: { size: 12 } } },
          tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}회 (${total > 0 ? (ctx.raw/total*100).toFixed(1) : 50}%)` } }
        }
      }
    })
  }

  // ─── 최근 50라운드 공정성 지표 ───
  if (data.recent50Results && data.recent50Results.length > 0) {
    const r50 = data.recent50Results
    const barEl = $('dRecent50Bar')
    if (barEl) {
      barEl.innerHTML = r50.map((res, i) =>
        `<div title="${i+1}번 (${res==='odd'?'홀':'짝'})"
          class="w-4 h-6 rounded-sm flex items-center justify-center text-xs font-black cursor-default
          ${res==='odd'?'bg-red-500/40 text-red-300':'bg-blue-500/40 text-blue-300'}">
          ${res==='odd'?'홀':'짝'}
        </div>`
      ).join('')
    }

    // 연속별 계산 (홀/짝 각각)
    let maxOddStreak = 0, maxEvenStreak = 0
    let curOdd = 0, curEven = 0
    r50.forEach(res => {
      if (res === 'odd') { curOdd++; curEven = 0; maxOddStreak = Math.max(maxOddStreak, curOdd) }
      else { curEven++; curOdd = 0; maxEvenStreak = Math.max(maxEvenStreak, curEven) }
    })

    if ($('dMaxOddStreak'))  $('dMaxOddStreak').textContent  = maxOddStreak
    if ($('dMaxEvenStreak')) $('dMaxEvenStreak').textContent = maxEvenStreak
    if ($('dMaxStreakAll'))  $('dMaxStreakAll').textContent  = data.maxStreak || Math.max(maxOddStreak, maxEvenStreak)

    // 50라운드 내 홀/짝 비율
    const r50Odd  = r50.filter(r => r==='odd').length
    const r50Even = r50.length - r50Odd
    const infoEl = $('dStreak50Info')
    if (infoEl) infoEl.textContent = `홀 ${r50Odd}번 / 짝 ${r50Even}번`
  }

  // 히스토리 테이블 (페이지네이션)
  const d2 = await api('/api/history?page=' + histPage)
  histTotalPages = d2.totalPages || 1
  const tbl = $('dHistTbl')
  if (tbl && d2.history) {
    if (d2.history.length === 0) {
      tbl.innerHTML = `<tr><td colspan="5" class="text-center text-gray-500 py-3">${t('no_record')}</td></tr>`
    } else {
      tbl.innerHTML = d2.history.map(h => `
        <tr class="border-b border-white/5 hover:bg-white/5">
          <td class="py-1.5 px-2 font-bold">#${h.roundId}</td>
          <td class="py-1.5 px-2"><span class="px-2 py-0.5 rounded-full text-xs ${h.result==='odd'?'bg-red-500/20 text-red-400':'bg-blue-500/20 text-blue-400'}">${h.result==='odd'?t('odd'):t('even')}</span></td>
          <td class="py-1.5 px-2 mono text-gray-400 text-xs">${h.hashValue ? h.hashValue.substring(0,16)+'...' : '-'}</td>
          <td class="py-1.5 px-2 text-right usdt">${fmtU(h.totalBets)}</td>
          <td class="py-1.5 px-2 text-right text-gray-500">${ago(h.timestamp)}</td>
        </tr>`).join('')
    }
  }

  // 페이지네이션 버튼
  const pageInfo = $('histPageInfo')
  if (pageInfo) pageInfo.textContent = histPage + ' / ' + histTotalPages
  const prevBtn = $('histPrevBtn'), nextBtn = $('histNextBtn')
  if (prevBtn) prevBtn.disabled = histPage <= 1
  if (nextBtn) nextBtn.disabled = histPage >= histTotalPages
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

  if ($('adTotalUsers'))   $('adTotalUsers').textContent   = data.totalUsers
  if ($('adTodayBet'))     $('adTodayBet').textContent     = fmtU(data.todayBetAmount || 0)
  if ($('adPendingWd'))    $('adPendingWd').textContent    = data.pendingWithdrawCount
  if ($('adNewUsers'))     $('adNewUsers').textContent     = data.newUsersToday || 0
  // 추가 지표
  if ($('adTotalDeposit')) $('adTotalDeposit').textContent = fmtU(data.totalDepositAmount || 0)
  if ($('adTotalWithdraw'))$('adTotalWithdraw').textContent= fmtU(data.totalWithdrawAmount || 0)
  if ($('adHouseProfit'))  $('adHouseProfit').textContent  = fmtU(data.houseProfit || 0)
  if ($('adTodayDeposit')) $('adTodayDeposit').textContent = fmtU(data.todayDepositAmount || 0)

  loadAdminWithdraws()
  loadAdminUsers()
  loadAdminNotices()
  loadAdminPartners()
  loadAdminInquiries('')
  loadAdminFAQs()
  loadDepositSettings()  // 입금 설정 로드
  loadGameSettings()     // 게임/운영 설정 로드
  loadAdminLogs(1)       // 관리자 활동 로그

  // 공지사항 Quill 에디터 초기화
  setTimeout(() => {
    initQuill('noticeEditorKo', '공지 내용을 입력하세요 (한국어)...', [
      ['bold', 'italic', 'underline'],
      [{ 'color': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ])
    initQuill('noticeEditorEn', 'Notice content (English, optional)...', [
      ['bold', 'italic', 'underline'],
      [{ 'color': [] }],
      ['link'],
      ['clean']
    ])
  }, 150)

  // 통계 차트 업데이트 (베팅 + 입금/출금/신규가입 추이)
  renderAdminCharts(data)
}

let adminChartInstances = {}
function renderAdminCharts(data) {
  // 공통 라벨 (7일)
  const allDates = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i)
    allDates.push((d.getMonth()+1).toString().padStart(2,'0') + '/' + d.getDate().toString().padStart(2,'0'))
  }
  const findVal = (arr, date, key) => (arr.find(r => r.date === date) || {})[key] || 0

  // 베팅 차트
  const betCtx = document.getElementById('adminBetChart')
  if (betCtx) {
    if (adminChartInstances.bet) adminChartInstances.bet.destroy()
    adminChartInstances.bet = new Chart(betCtx.getContext('2d'), {
      type: 'bar',
      data: {
        labels: allDates,
        datasets: [{
          label: '베팅금액(USDT)', data: allDates.map(d => findVal(data.dailyStats||[], d, 'betAmount')),
          backgroundColor: 'rgba(99,102,241,0.5)', borderColor: 'rgba(99,102,241,1)', borderWidth: 1, borderRadius: 4
        }]
      },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { ticks: { color:'#9ca3af' }, grid: { color:'rgba(255,255,255,0.05)' } }, x: { ticks: { color:'#9ca3af' }, grid: { display:false } } } }
    })
  }

  // 입금/출금 추이 차트
  const depWdCtx = document.getElementById('adminDepWdChart')
  if (depWdCtx) {
    if (adminChartInstances.depWd) adminChartInstances.depWd.destroy()
    adminChartInstances.depWd = new Chart(depWdCtx.getContext('2d'), {
      type: 'line',
      data: {
        labels: allDates,
        datasets: [
          { label: '입금', data: allDates.map(d => findVal(data.dailyDeposits||[], d, 'depositAmount')), borderColor:'rgba(74,222,128,1)', backgroundColor:'rgba(74,222,128,0.1)', tension:0.4, fill:true },
          { label: '출금', data: allDates.map(d => findVal(data.dailyWithdraws||[], d, 'withdrawAmount')), borderColor:'rgba(248,113,113,1)', backgroundColor:'rgba(248,113,113,0.1)', tension:0.4, fill:true }
        ]
      },
      options: { responsive: true, plugins: { legend: { labels: { color:'#9ca3af', boxWidth:12 } } }, scales: { y: { ticks: { color:'#9ca3af' }, grid: { color:'rgba(255,255,255,0.05)' } }, x: { ticks: { color:'#9ca3af' }, grid: { display:false } } } }
    })
  }

  // 신규 가입 추이 차트
  const signupCtx = document.getElementById('adminSignupChart')
  if (signupCtx) {
    if (adminChartInstances.signup) adminChartInstances.signup.destroy()
    adminChartInstances.signup = new Chart(signupCtx.getContext('2d'), {
      type: 'bar',
      data: {
        labels: allDates,
        datasets: [{ label: '신규가입', data: allDates.map(d => findVal(data.dailySignups||[], d, 'signupCount')), backgroundColor:'rgba(251,191,36,0.5)', borderColor:'rgba(251,191,36,1)', borderWidth:1, borderRadius:4 }]
      },
      options: { responsive: true, plugins: { legend: { display:false } }, scales: { y: { ticks: { color:'#9ca3af' }, grid: { color:'rgba(255,255,255,0.05)' } }, x: { ticks: { color:'#9ca3af' }, grid: { display:false } } } }
    })
  }
}

let currentWdFilter = 'all'
let currentWdPage = 1
let wdTotalPages = 1

function setWdFilter(status) {
  currentWdFilter = status
  // 버튼 스타일 업데이트
  ;['all','pending','approved','rejected'].forEach(s => {
    const btn = $('wdF-' + s)
    if (!btn) return
    btn.className = s === status
      ? 'px-2 py-1 rounded text-xs bg-white/20 text-white font-bold transition'
      : 'px-2 py-1 rounded text-xs bg-white/10 text-gray-400 hover:bg-white/20 transition'
  })
  loadAdminWithdraws(1)
}

async function loadAdminWithdraws(page) {
  page = page || currentWdPage
  if (page < 1 || page > wdTotalPages) return
  currentWdPage = page

  const search = $('wdSearchInput')?.value.trim() || ''
  const params = new URLSearchParams({ page: String(page) })
  if (currentWdFilter && currentWdFilter !== 'all') params.set('status', currentWdFilter)
  if (search) params.set('search', search)

  const data = await api('/api/admin/withdraws?' + params.toString())
  const el = $('adWithdrawList')
  if (!el || !data.requests) return
  if (data.requests.length === 0) {
    el.innerHTML = '<div class="text-xs text-gray-500 text-center py-3">출금 요청 없음</div>'
    return
  }
  const statusLabel = { pending:'대기중', approved:'승인완료', rejected:'거절', cancelled:'취소' }
  const statusCls   = { pending:'text-orange-400', approved:'text-green-400', rejected:'text-red-400', cancelled:'text-gray-400' }
  el.innerHTML = data.requests.map(r => `
    <div class="p-3 bg-black/20 rounded-xl border border-white/10 text-xs">
      <div class="flex items-center justify-between gap-2 mb-2">
        <div>
          <span class="font-black text-white text-sm">${r.username}</span>
          <span class="ml-2 text-green-400 font-bold">${fmtU(r.amount)} USDT</span>
        </div>
        <span class="px-2 py-0.5 rounded-full font-bold ${statusCls[r.status]||'text-gray-400'} bg-white/5">${statusLabel[r.status]||r.status}</span>
      </div>
      <div class="bg-black/30 rounded-lg px-2 py-1.5 mb-2">
        <div class="text-gray-400 text-xs mb-0.5">출금 주소</div>
        <div class="mono text-white break-all">${r.address||'-'}</div>
      </div>
      <div class="text-gray-500 mb-2">${ago(r.created_at || r.createdAt)}</div>
      ${r.tx_hash || r.txHash ? `<div class="bg-green-500/10 border border-green-500/20 rounded-lg px-2 py-1 mb-2"><span class="text-green-400">TX: </span><span class="mono text-green-300 break-all">${r.tx_hash||r.txHash}</span></div>` : ''}
      ${r.note ? `<div class="text-red-400 mb-2">사유: ${r.note}</div>` : ''}
      ${r.status === 'pending' ? `
        <div class="space-y-2">
          <input type="text" id="txInput_${r.id}" placeholder="TX Hash 입력 (실제 트랜잭션 해시 — 선택사항)"
            class="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white mono text-xs focus:outline-none focus:border-green-400">
          <div class="flex gap-2">
            <button onclick="adminApprove('${r.id}')" class="flex-1 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-xs font-bold transition">✅ 승인 처리</button>
            <button onclick="adminReject('${r.id}')" class="flex-1 py-1.5 bg-red-600/80 hover:bg-red-600 rounded-lg text-xs font-bold transition">❌ 거절</button>
          </div>
        </div>` : ''}
    </div>`).join('')

  // 페이지네이션 업데이트
  wdTotalPages = data.totalPages || 1
  const pageInfo = $('wdPageInfo')
  if (pageInfo) pageInfo.textContent = currentWdPage + ' / ' + wdTotalPages
  const prevBtn = $('wdPrevBtn'), nextBtn = $('wdNextBtn')
  if (prevBtn) prevBtn.disabled = currentWdPage <= 1
  if (nextBtn) nextBtn.disabled = currentWdPage >= wdTotalPages
}

async function adminApprove(id) {
  const txInput = document.getElementById('txInput_' + id)
  const txHash = txInput ? txInput.value.trim() : ''
  if (!confirm('출금을 승인하시겠습니까?\nTX Hash: ' + (txHash || '(미입력 — 자동 생성)') )) return
  const data = await api('/api/admin/withdraw/approve', { method:'POST', body: JSON.stringify({requestId:id, txHash}) })
  if (data.success) { toast('✅ 출금 승인 완료 (TX: ' + (data.txHash||'').substring(0,12) + '...)', 'text-green-400'); loadAdminWithdraws() }
  else toast('❌ ' + (data.error||'오류'), 'text-red-400')
}

async function adminReject(id) {
  const note = prompt('거절 사유를 입력하세요:')
  if (note === null) return // 취소
  const data = await api('/api/admin/withdraw/reject', { method:'POST', body: JSON.stringify({requestId:id, note: note||''}) })
  if (data.success) { toast('✅ 출금 거절 처리', 'text-yellow-400'); loadAdminWithdraws() }
  else toast('❌ ' + (data.error||'오류'), 'text-red-400')
}

// ═══════════════════════════════════════════════
// 수동 입금 처리
// ═══════════════════════════════════════════════
let lookupTimer = null
async function lookupUserForDeposit() {
  clearTimeout(lookupTimer)
  lookupTimer = setTimeout(async () => {
    const username = $('manDepUsername')?.value.trim()
    const infoEl = $('manDepUserInfo')
    const idEl = $('manDepUserId')
    if (!username || username.length < 2) {
      if (infoEl) infoEl.textContent = '-'
      if (idEl) idEl.value = ''
      return
    }
    // 유저 검색 (관리자 API 활용)
    const data = await api('/api/admin/users?search=' + encodeURIComponent(username))
    const user = data.users?.find(u => u.username === username)
    if (user) {
      if (infoEl) infoEl.innerHTML = `<span class="text-green-400 font-bold">✓ ${user.username}</span> <span class="text-gray-400">잔액: ${fmtU(user.balance)}</span>`
      if (idEl) idEl.value = user.id
    } else {
      if (infoEl) infoEl.innerHTML = '<span class="text-red-400">유저 없음</span>'
      if (idEl) idEl.value = ''
    }
  }, 500)
}

async function adminManualDeposit() {
  const userId  = $('manDepUserId')?.value
  const username = $('manDepUsername')?.value.trim()
  const amount  = parseFloat($('manDepAmount')?.value || '0')
  const txHash  = $('manDepTxHash')?.value.trim()
  const network = $('manDepNetwork')?.value || 'manual'
  const memo    = $('manDepMemo')?.value.trim() || '관리자 수동 입금'

  if (!userId)        { toast('❌ 유저를 먼저 조회하세요', 'text-red-400'); return }
  if (!amount || amount <= 0) { toast('❌ 입금액을 입력하세요', 'text-red-400'); return }
  if (!confirm(`${username}에게 ${fmtU(amount)} USDT를 입금 처리하시겠습니까?`)) return

  const data = await api('/api/admin/deposit/manual', {
    method: 'POST',
    body: JSON.stringify({ userId, amount, txHash, network, memo })
  })
  if (data.success) {
    toast(`✅ 입금 완료: ${username} +${fmtU(amount)} USDT (잔액: ${fmtU(data.balance)})`, 'text-green-400')
    // 입력 초기화
    if ($('manDepUsername')) $('manDepUsername').value = ''
    if ($('manDepUserId'))   $('manDepUserId').value   = ''
    if ($('manDepAmount'))   $('manDepAmount').value   = ''
    if ($('manDepTxHash'))   $('manDepTxHash').value   = ''
    if ($('manDepMemo'))     $('manDepMemo').value     = ''
    if ($('manDepUserInfo')) $('manDepUserInfo').textContent = '-'
    loadAdminDepositLogs()
    loadAdminUsers()
  } else toast('❌ ' + (data.error||'오류'), 'text-red-400')
}

async function loadAdminDepositLogs() {
  const el = $('adDepositLogList')
  if (!el) return
  el.classList.remove('hidden')
  const data = await api('/api/admin/deposits')
  if (!data.deposits || data.deposits.length === 0) {
    el.innerHTML = '<div class="text-gray-500 text-center py-2">입금 내역 없음</div>'
    return
  }
  el.innerHTML = '<div class="font-bold text-xs text-gray-400 mb-2">📋 최근 입금 내역</div>' +
    data.deposits.slice(0, 20).map(d => `
      <div class="flex items-center justify-between py-1.5 border-b border-white/5 gap-2">
        <div class="min-w-0">
          <span class="font-bold text-white">${d.username}</span>
          <span class="text-green-400 ml-1">+${fmtU(d.amount)}</span>
          <span class="text-gray-500 ml-1 text-xs">${d.network||'manual'}</span>
          ${d.memo ? `<div class="text-gray-500 truncate">${d.memo}</div>` : ''}
        </div>
        <div class="shrink-0 text-right">
          <div class="text-gray-500">${ago(d.created_at)}</div>
          ${d.tx_hash ? `<div class="mono text-xs text-blue-400">${d.tx_hash.substring(0,10)}...</div>` : ''}
        </div>
      </div>`).join('')
}

// ═══════════════════════════════════════════════
// 게임 · 운영 설정
// ═══════════════════════════════════════════════
async function loadGameSettings() {
  const data = await api('/api/game-settings')
  if (!data) return
  if ($('cfg_payout'))  $('cfg_payout').value  = data.payout  || 1.90
  if ($('cfg_min_bet')) $('cfg_min_bet').value  = data.minBet  || 0.1
  if ($('cfg_max_bet')) $('cfg_max_bet').value  = data.maxBet  || 1000
  if ($('cfg_wd_fee'))  $('cfg_wd_fee').value   = data.withdrawFee || 1
  if ($('cfg_min_wd'))  $('cfg_min_wd').value   = data.minWithdraw || 1
  if ($('cfg_bet_req')) $('cfg_bet_req').value   = Math.round((data.betRequirement || 0.5) * 100)
  // L1/L2 + 일일 한도는 admin/settings에서 별도 로드
  const sData = await api('/api/admin/settings')
  if (sData.settings) {
    if ($('cfg_l1')) $('cfg_l1').value = parseFloat(sData.settings['game_l1_rate'] || '0.025') * 100
    if ($('cfg_l2')) $('cfg_l2').value = parseFloat(sData.settings['game_l2_rate'] || '0.010') * 100
    if ($('cfg_daily_wd_limit')) $('cfg_daily_wd_limit').value = parseFloat(sData.settings['daily_withdraw_limit'] || '0')
  }
}

async function saveGameSettings() {
  const payout       = parseFloat($('cfg_payout')?.value       || '1.9')
  const minBet       = parseFloat($('cfg_min_bet')?.value      || '0.1')
  const maxBet       = parseFloat($('cfg_max_bet')?.value      || '1000')
  const wdFee        = parseFloat($('cfg_wd_fee')?.value       || '1')
  const minWd        = parseFloat($('cfg_min_wd')?.value       || '1')
  const betReq       = parseFloat($('cfg_bet_req')?.value      || '50') / 100
  const l1           = parseFloat($('cfg_l1')?.value           || '2.5') / 100
  const l2           = parseFloat($('cfg_l2')?.value           || '1.0') / 100
  const dailyWdLimit = parseFloat($('cfg_daily_wd_limit')?.value || '0')

  // 유효성 검사
  if (payout < 1.1 || payout > 2.0) { toast('❌ 배당률은 1.1x ~ 2.0x 사이여야 합니다', 'text-red-400'); return }
  if (minBet <= 0 || minBet >= maxBet) { toast('❌ 베팅 한도가 올바르지 않습니다', 'text-red-400'); return }

  const data = await api('/api/admin/settings', {
    method: 'POST',
    body: JSON.stringify({ settings: {
      game_payout:              String(payout),
      game_min_bet:             String(minBet),
      game_max_bet:             String(maxBet),
      game_l1_rate:             String(l1),
      game_l2_rate:             String(l2),
      withdraw_fee:             String(wdFee),
      withdraw_min_amount:      String(minWd),
      withdraw_bet_requirement: String(betReq),
      daily_withdraw_limit:     String(dailyWdLimit),
    }})
  })
  if (data.success) {
    toast(`✅ 설정 저장 완료 (${data.saved}개 항목)`, 'text-green-400')
    loadGameSettings() // 다시 로드해서 확인
  } else toast('❌ 저장 실패: ' + (data.error||'오류'), 'text-red-400')
}

let adUserPage = 1
let adUserTotalPages = 1

async function loadAdminUsers(page) {
  page = page || adUserPage
  if (page < 1 || page > adUserTotalPages) return
  adUserPage = page

  const search = $('userSearchInput')?.value || ''
  const data = await api('/api/admin/users?search=' + encodeURIComponent(search) + '&page=' + adUserPage)
  const tbl = $('adUserTable')
  if (!tbl || !data.users) return

  adUserTotalPages = data.totalPages || 1

  if (data.users.length === 0) {
    tbl.innerHTML = '<tr><td colspan="6" class="text-center text-gray-500 py-3">유저 없음</td></tr>'
  } else {
    tbl.innerHTML = data.users.map(u => `
      <tr class="border-b border-white/5 hover:bg-white/5">
        <td class="py-1.5 px-2">
          <div class="font-bold text-xs">${u.username}</div>
          <div class="text-xs text-gray-500">${u.isAdmin?'👑 관리자':''} ${u.isBanned?'🚫 차단':''}</div>
          <div class="text-xs text-gray-600">${u.lastIp||''}</div>
        </td>
        <td class="py-1.5 px-2 text-right usdt text-xs">${fmtU(u.balance)}</td>
        <td class="py-1.5 px-2 text-right text-xs text-green-400">${fmtU(u.totalDeposit)}</td>
        <td class="py-1.5 px-2 text-right text-xs text-blue-400">${fmtU(u.totalBetAmount)}</td>
        <td class="py-1.5 px-2 text-xs">${u.isBanned?'<span class="text-red-400">차단</span>':'<span class="text-green-400">정상</span>'}</td>
        <td class="py-1.5 px-2">
          <div class="flex gap-1">
            <button onclick="openUserDetail('${u.id}')" class="px-2 py-1 bg-blue-600/30 rounded text-xs hover:bg-blue-600/50 transition" title="상세보기">🔍</button>
            <button onclick="showBalModal('${u.id}','${u.username}')" class="px-2 py-1 bg-yellow-600/30 rounded text-xs hover:bg-yellow-600/50 transition">💰</button>
            <button onclick="adminBan('${u.id}',${!u.isBanned})" class="px-2 py-1 ${u.isBanned?'bg-green-600/30':'bg-red-600/30'} rounded text-xs hover:opacity-80 transition">${u.isBanned?'해제':'차단'}</button>
          </div>
        </td>
      </tr>`).join('')
  }

  // 페이지네이션 업데이트
  const pageInfo = $('adUserPageInfo')
  if (pageInfo) pageInfo.textContent = adUserPage + ' / ' + adUserTotalPages
  const prevBtn = $('adUserPrevBtn'), nextBtn = $('adUserNextBtn')
  if (prevBtn) prevBtn.disabled = adUserPage <= 1
  if (nextBtn) nextBtn.disabled = adUserPage >= adUserTotalPages
}

function showBalModal(userId, username) {
  $('adBalUserId').value  = userId
  $('adBalUser').textContent = username
  $('adBalAmt').value = ''
  $('adBalModal').style.display='flex'
}

async function adminAdjBal(type) {
  const userId = $('adBalUserId').value
  const amount = parseFloat($('adBalAmt').value)
  if (!amount) return
  const data = await api('/api/admin/user/balance', { method:'POST', body: JSON.stringify({userId, amount, type}) })
  if (data.success) {
    toast('✅ 잔액 조정 완료: ' + fmtU(data.balance) + ' USDT', 'text-green-400')
    $('adBalModal').style.display='none'
    loadAdminUsers()
  } else toast('❌ ' + (data.error||'오류'), 'text-red-400')
}

async function adminBan(userId, ban) {
  const data = await api('/api/admin/user/ban', { method:'POST', body: JSON.stringify({userId, ban}) })
  if (data.success) { toast(ban ? '🚫 차단 처리' : '✅ 차단 해제', ban?'text-red-400':'text-green-400'); loadAdminUsers() }
}

// ═══════════════════════════════════════════════
// 관리자 유저 상세 모달
// ═══════════════════════════════════════════════
async function openUserDetail(userId) {
  const modal = $('userDetailModal')
  const body  = $('userDetailBody')
  if (!modal || !body) return
  body.innerHTML = '<div class="text-center py-8 text-gray-400">로딩 중...</div>'
  modal.style.display='flex'

  const data = await api('/api/admin/user/' + userId + '/detail')
  if (data.error) { body.innerHTML = '<div class="text-red-400 text-center py-4">불러오기 실패</div>'; return }

  const u = data.user
  const statusLbl = { pending:'<span class="text-orange-400">대기중</span>', approved:'<span class="text-green-400">승인</span>', rejected:'<span class="text-red-400">거절</span>', cancelled:'<span class="text-gray-400">취소</span>' }
  const netLbl = { trc20:'TRC20', erc20:'ERC20', bep20:'BEP20', manual:'수동', admin:'관리자' }

  const sameIpHtml = data.sameIpUsers.length > 0
    ? `<div class="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <div class="text-xs font-bold text-yellow-400 mb-1">⚠️ 동일 IP 계정 (${data.sameIpUsers.length}개)</div>
        ${data.sameIpUsers.map(s => `<div class="text-xs text-gray-300">${s.username} ${s.isBanned?'<span class="text-red-400">[차단]</span>':''}</div>`).join('')}
      </div>` : ''

  body.innerHTML = `
    <div class="grid grid-cols-2 gap-3 mb-4">
      <div class="bg-white/5 rounded-lg p-3">
        <div class="text-xs text-gray-400 mb-1">👤 유저 정보</div>
        <div class="font-bold">${u.username} ${u.isAdmin?'👑':''} ${u.isBanned?'<span class="text-red-400">🚫차단</span>':''}</div>
        <div class="text-xs text-gray-400 mt-1">IP: ${u.lastIp||'-'} · 로그인 ${u.loginCount}회</div>
        <div class="text-xs text-gray-400">가입: ${ago(u.createdAt)}</div>
        ${sameIpHtml}
      </div>
      <div class="bg-white/5 rounded-lg p-3">
        <div class="text-xs text-gray-400 mb-1">💰 잔액 · 통계</div>
        <div class="font-bold usdt">${fmtU(u.balance)} USDT</div>
        <div class="text-xs mt-1"><span class="text-green-400">입금 ${fmtU(u.totalDeposit)}</span> · <span class="text-red-400">출금 ${fmtU(u.totalWithdraw)}</span></div>
        <div class="text-xs"><span class="text-blue-400">베팅 ${fmtU(u.totalBetAmount)}</span> · <span class="text-yellow-400">추천수당 ${fmtU(u.referralEarnings)}</span></div>
      </div>
    </div>

    <div class="mb-3">
      <div class="text-xs font-bold text-green-400 mb-1">📥 입금 내역 (${data.deposits.length}건)</div>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead><tr class="text-gray-500 border-b border-white/10"><th class="py-1 text-left">금액</th><th class="text-left">네트워크</th><th class="text-left">TX Hash</th><th class="text-left">메모</th><th class="text-left">시간</th></tr></thead>
          <tbody>
            ${data.deposits.length === 0 ? '<tr><td colspan="5" class="text-center text-gray-500 py-2">내역 없음</td></tr>' :
              data.deposits.map(d => `<tr class="border-b border-white/5">
                <td class="py-1 text-green-400 font-bold">+${fmtU(d.amount)}</td>
                <td class="py-1">${netLbl[d.network]||d.network}</td>
                <td class="py-1 mono text-gray-400">${d.txHash ? d.txHash.substring(0,12)+'...' : '-'}</td>
                <td class="py-1 text-gray-400">${d.memo||'-'}</td>
                <td class="py-1 text-gray-500">${ago(d.createdAt)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="mb-3">
      <div class="text-xs font-bold text-red-400 mb-1">📤 출금 내역 (${data.withdraws.length}건)</div>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead><tr class="text-gray-500 border-b border-white/10"><th class="py-1 text-left">금액</th><th class="text-left">주소</th><th class="text-left">상태</th><th class="text-left">TX Hash</th><th class="text-left">시간</th></tr></thead>
          <tbody>
            ${data.withdraws.length === 0 ? '<tr><td colspan="5" class="text-center text-gray-500 py-2">내역 없음</td></tr>' :
              data.withdraws.map(w => `<tr class="border-b border-white/5">
                <td class="py-1 text-red-400 font-bold">-${fmtU(w.amount)}</td>
                <td class="py-1 mono text-gray-400">${w.address ? w.address.substring(0,10)+'...' : '-'}</td>
                <td class="py-1">${statusLbl[w.status]||w.status}</td>
                <td class="py-1 mono text-gray-400">${w.txHash ? w.txHash.substring(0,10)+'...' : '-'}</td>
                <td class="py-1 text-gray-500">${ago(w.createdAt)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div>
      <div class="text-xs font-bold text-blue-400 mb-1">🎲 베팅 내역 (${data.bets.length}건)</div>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead><tr class="text-gray-500 border-b border-white/10"><th class="py-1 text-left">라운드</th><th class="text-left">선택</th><th class="text-left">결과</th><th class="text-right">베팅</th><th class="text-right">손익</th><th class="text-left">시간</th></tr></thead>
          <tbody>
            ${data.bets.length === 0 ? '<tr><td colspan="6" class="text-center text-gray-500 py-2">내역 없음</td></tr>' :
              data.bets.map(b => `<tr class="border-b border-white/5">
                <td class="py-1">#${b.roundId}</td>
                <td class="py-1"><span class="px-1 rounded ${b.choice==='odd'?'text-red-400':'text-blue-400'}">${b.choice==='odd'?'홀':'짝'}</span></td>
                <td class="py-1"><span class="px-1 rounded ${b.result==='odd'?'text-red-400':'text-blue-400'}">${b.result==='odd'?'홀':'짝'}</span></td>
                <td class="py-1 text-right">${fmtU(b.amount)}</td>
                <td class="py-1 text-right ${b.win?'text-green-400 font-bold':'text-red-400'}">${b.win?'+'+fmtU(b.payout):'-'+fmtU(b.amount)}</td>
                <td class="py-1 text-gray-500">${ago(b.timestamp)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="mt-3 flex gap-2">
      <button onclick="showBalModal('${u.id}','${u.username}')" class="flex-1 py-2 bg-yellow-600/30 hover:bg-yellow-600/50 rounded-lg text-xs font-bold transition">💰 잔액 조정</button>
      <button onclick="adminBan('${u.id}',${!u.isBanned})" class="flex-1 py-2 ${u.isBanned?'bg-green-600/30 hover:bg-green-600/50':'bg-red-600/30 hover:bg-red-600/50'} rounded-lg text-xs font-bold transition">${u.isBanned?'✅ 차단 해제':'🚫 차단'}</button>
      <button onclick="$('userDetailModal').style.display='none'" class="flex-1 py-2 bg-gray-600/30 hover:bg-gray-600/50 rounded-lg text-xs font-bold transition">닫기</button>
    </div>

    <!-- 관리자 메모 편집 -->
    <div class="mt-3 p-3 bg-white/5 rounded-xl border border-white/10">
      <div class="text-xs font-bold text-yellow-400 mb-2">📝 관리자 메모</div>
      <textarea id="adminMemoInput" rows="2"
        class="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-yellow-400 resize-none"
        placeholder="메모를 입력하세요...">${u.adminMemo||''}</textarea>
      <button onclick="saveAdminMemo('${u.id}')" class="mt-1.5 w-full py-1.5 bg-yellow-600/30 hover:bg-yellow-600/50 rounded-lg text-xs font-bold transition">💾 메모 저장</button>
    </div>
  `
}

// 관리자 메모 저장
async function saveAdminMemo(userId) {
  const memo = $('adminMemoInput')?.value || ''
  const data = await api('/api/admin/user/memo', { method:'POST', body: JSON.stringify({userId, memo}) })
  if (data.success) toast('✅ 메모가 저장되었습니다', 'text-green-400')
  else toast('❌ 메모 저장 실패: ' + (data.error||'오류'), 'text-red-400')
}

async function loadNotices() {
  const banner = $('noticeBanner')
  const list   = $('noticeList')
  if (!banner || !list) return
  const data = await api('/api/notices')
  if (!data || !data.notices || data.notices.length === 0) {
    banner.classList.add('hidden'); return
  }
  const colorMap = { warning:'bg-yellow-500/20 border-yellow-500/40 text-yellow-300', danger:'bg-red-500/20 border-red-500/40 text-red-300', info:'bg-blue-500/20 border-blue-500/40 text-blue-300' }
  list.innerHTML = data.notices.map(n => {
    const cls = colorMap[n.type] || colorMap.info
    const rawContent = n.displayContent || n.content
    // HTML 태그 포함 여부 확인 후 렌더링
    const isHtml = rawContent && rawContent.includes('<')
    const displayText = isHtml
      ? `<span class="notice-content text-xs font-bold">${rawContent}</span>`
      : `<span class="text-xs font-bold">${rawContent}</span>`
    return `<div class="border-b border-white/5 last:border-0 px-4 py-2 flex items-center justify-between gap-2 ${cls}">
      <div class="flex items-center gap-1 min-w-0">${n.type==='danger'?'🚨':n.type==='warning'?'⚠️':'ℹ️'} ${displayText}</div>
      <span class="text-xs opacity-60 shrink-0">${ago(n.created_at)}</span>
    </div>`
  }).join('')
  banner.classList.remove('hidden')
  banner.className = 'w-full border-b border-white/10'
}

async function loadAdminNotices() {
  const data = await api('/api/admin/notices')
  const el = $('adNoticeList')
  if (!el) return
  if (!data.notices || data.notices.length === 0) {
    el.innerHTML = `<div class="text-gray-500 text-center py-2 text-xs">${t('notice_empty')}</div>`
    return
  }
  el.innerHTML = data.notices.map(n => {
    // HTML 태그 포함 시 HTML로 렌더링, 아니면 텍스트
    const isHtml = n.content && n.content.includes('<')
    const displayContent = isHtml
      ? `<div class="notice-content text-xs text-white">${n.content}</div>`
      : `<span class="text-xs text-white">${n.content}</span>`
    const scheduledBadge = n.scheduled
      ? `<span class="text-xs text-yellow-400 shrink-0">⏰ ${new Date(n.publish_at).toLocaleString('ko-KR',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})}</span>`
      : ''
    return `
    <div class="flex items-start justify-between p-2 bg-black/20 rounded-lg gap-2 ${n.scheduled ? 'border border-yellow-500/20' : ''}">
      <div class="flex items-start gap-2 min-w-0 flex-1">
        <span class="text-xs shrink-0 mt-0.5">${n.type==='danger'?'🚨':n.type==='warning'?'⚠️':'ℹ️'}</span>
        ${displayContent}
        ${scheduledBadge}
      </div>
      <button onclick="deleteNotice('${n.id}')" class="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition shrink-0">${t('notice_delete')}</button>
    </div>`
  }).join('')
}

async function postNotice() {
  // Quill 에디터에서 HTML 콘텐츠 가져오기
  const content    = getQuillHTML('noticeEditorKo') || $('noticeInput')?.value.trim()
  const content_en = getQuillHTML('noticeEditorEn') || $('noticeInputEn')?.value.trim()
  const content_zh = $('noticeInputZh')?.value.trim()
  const content_ja = $('noticeInputJa')?.value.trim()
  const type       = $('noticeType')?.value || 'info'
  if (!content) { toast('⚠️ 공지 내용을 입력하세요', 'text-yellow-400'); return }

  // 예약 발행 시간
  const publishAtInput = $('noticePublishAt')?.value
  let publish_at = 0
  if (publishAtInput) {
    const ts = new Date(publishAtInput).getTime()
    if (!isNaN(ts) && ts > Date.now()) publish_at = ts
  }

  const data = await api('/api/admin/notice', { method:'POST', body: JSON.stringify({content, content_en, content_zh, content_ja, type, publish_at}) })
  if (data.success) {
    clearQuill('noticeEditorKo')
    clearQuill('noticeEditorEn')
    if ($('noticeInputZh')) $('noticeInputZh').value = ''
    if ($('noticeInputJa')) $('noticeInputJa').value = ''
    if ($('noticePublishAt')) $('noticePublishAt').value = ''
    const msg = data.scheduled ? `📅 예약 공지 등록 완료 (${new Date(data.publishAt).toLocaleString('ko-KR')})` : '📢 공지 등록 완료'
    toast(msg, 'text-green-400')
    loadAdminNotices()
    loadNotices()
  } else toast('❌ ' + (data.error||'오류'), 'text-red-400')
}

function clearPublishAt() {
  if ($('noticePublishAt')) $('noticePublishAt').value = ''
  toast('✅ 즉시 발행으로 설정', 'text-blue-400')
}

async function deleteNotice(noticeId) {
  const data = await api('/api/admin/notice/delete', { method:'POST', body: JSON.stringify({noticeId}) })
  if (data.success) { toast('🗑️ 공지 삭제', 'text-yellow-400'); loadAdminNotices(); loadNotices() }
}

// ═══════════════════════════════════════════════
// 관리자 통계 추가 기능 (loadAdmin 확장)
// ═══════════════════════════════════════════════
async function adminResetPw() {
  const userId = $('adBalUserId')?.value
  const uname  = $('adBalUser')?.textContent
  const newPw  = prompt(`${uname} 의 새 비밀번호 입력 (6자 이상):`)
  if (!newPw || newPw.length < 6) { toast('❌ 비밀번호는 6자 이상', 'text-red-400'); return }
  const data = await api('/api/admin/user/reset-password', { method:'POST', body: JSON.stringify({userId, newPassword: newPw}) })
  if (data.success) { toast('🔑 비밀번호 초기화 완료', 'text-green-400'); document.getElementById('adBalModal').classList.add('hidden') }
  else toast('❌ ' + (data.error||'오류'), 'text-red-400')
}

// ═══════════════════════════════════════════════
// 파트너 관리
// ═══════════════════════════════════════════════
// 입금 설정 (관리자)
// ═══════════════════════════════════════════════
async function loadDepositSettings() {
  const data = await api('/api/admin/settings')
  if (data.error) return
  const s = data.settings || {}

  const set = (id, val) => { const el = $(id); if (el) { if (el.type === 'checkbox') el.checked = val === '1'; else el.value = val || '' } }

  set('set_trc20_enabled', s['deposit_trc20_enabled'] || '1')
  set('set_trc20_address', s['deposit_trc20_address'] || '')
  set('set_trc20_memo',    s['deposit_trc20_memo']    || '')

  set('set_erc20_enabled', s['deposit_erc20_enabled'] || '0')
  set('set_erc20_address', s['deposit_erc20_address'] || '')
  set('set_erc20_memo',    s['deposit_erc20_memo']    || '')

  set('set_bep20_enabled', s['deposit_bep20_enabled'] || '0')
  set('set_bep20_address', s['deposit_bep20_address'] || '')
  set('set_bep20_memo',    s['deposit_bep20_memo']    || '')

  set('set_min_amount',    s['deposit_min_amount']    || '1')
}

async function saveDepositSettings() {
  const get  = id => { const el = $(id); if (!el) return ''; return el.type === 'checkbox' ? (el.checked ? '1' : '0') : el.value.trim() }

  const settings = {
    deposit_trc20_enabled: get('set_trc20_enabled'),
    deposit_trc20_address: get('set_trc20_address'),
    deposit_trc20_memo:    get('set_trc20_memo'),

    deposit_erc20_enabled: get('set_erc20_enabled'),
    deposit_erc20_address: get('set_erc20_address'),
    deposit_erc20_memo:    get('set_erc20_memo'),

    deposit_bep20_enabled: get('set_bep20_enabled'),
    deposit_bep20_address: get('set_bep20_address'),
    deposit_bep20_memo:    get('set_bep20_memo'),

    deposit_min_amount: get('set_min_amount') || '1'
  }

  // 활성화된 네트워크에 주소가 있는지 검증
  for (const net of ['trc20','erc20','bep20']) {
    if (settings[`deposit_${net}_enabled`] === '1' && !settings[`deposit_${net}_address`]) {
      toast(`❌ ${net.toUpperCase()} 활성화 시 주소를 입력해야 합니다`, 'text-red-400'); return
    }
  }

  const data = await api('/api/admin/settings', { method:'POST', body: JSON.stringify({ settings }) })
  if (data.success) {
    toast('✅ 입금 설정이 저장되었습니다', 'text-green-400')
  } else {
    toast('❌ 저장 실패: ' + (data.error || '오류'), 'text-red-400')
  }
}

// ═══════════════════════════════════════════════
async function loadAdminPartners() {
  const data = await api('/api/admin/partners')
  const el = $('adPartnerList')
  if (!el) return
  if (!data.partners || data.partners.length === 0) {
    el.innerHTML = '<div class="text-gray-500 text-center py-2">파트너 없음</div>'
    return
  }
  const origin = location.origin
  el.innerHTML = data.partners.map(p => `
    <div class="p-3 bg-black/20 rounded-xl border border-white/10 text-xs">
      <div class="flex items-center justify-between gap-2 mb-1.5">
        <div>
          <span class="font-black text-yellow-400 text-sm">${p.name}</span>
          <span class="ml-2 text-gray-400">(${p.owner_username})</span>
          <span class="ml-1 px-1.5 py-0.5 rounded ${p.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} text-xs">${p.is_active ? '활성' : '비활성'}</span>
        </div>
        <div class="flex gap-1">
          <button onclick="togglePartner('${p.code}',${p.is_active?0:1})" class="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs transition">${p.is_active?'비활성화':'활성화'}</button>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-2 mb-1.5 text-center">
        <div class="bg-black/20 rounded p-1.5"><div class="text-gray-400 text-xs">수수료율</div><div class="font-black text-blue-400">${(p.commission_rate*100).toFixed(1)}%</div></div>
        <div class="bg-black/20 rounded p-1.5"><div class="text-gray-400 text-xs">가입 유저</div><div class="font-black text-green-400">${p.user_count}</div></div>
        <div class="bg-black/20 rounded p-1.5"><div class="text-gray-400 text-xs">누적 수당</div><div class="font-black text-yellow-400">${fmtU(p.total_earned)} USDT</div></div>
      </div>
      <div class="bg-black/20 rounded p-2">
        <div class="text-gray-500 mb-0.5">파트너 링크:</div>
        <div class="text-blue-400 break-all mono text-xs">${origin}?partner=${p.code}</div>
        <button onclick="copyText('${origin}?partner=${p.code}')" class="mt-1 px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded text-xs hover:bg-blue-600/30 transition">📋 링크 복사</button>
      </div>
      <div class="mt-1.5 flex gap-1">
        <button onclick="togglePartner('${p.code}',${p.is_active?0:1})" class="flex-1 py-1 bg-white/10 hover:bg-white/20 rounded text-xs transition">${p.is_active?'비활성화':'활성화'}</button>
        <button onclick="showPartnerEarnings('${p.code}','${p.name}')" class="flex-1 py-1 bg-blue-600/20 hover:bg-blue-600/40 rounded text-xs text-blue-400 transition">📊 수익 내역</button>
      </div>
    </div>`).join('')
}

// 파트너 수익 내역 모달
async function showPartnerEarnings(code, name) {
  const modal = $('partnerEarningsModal')
  const title = $('partnerEarningsTitle')
  const body  = $('partnerEarningsBody')
  if (!modal || !body) return
  if (title) title.textContent = `📊 ${name} 수익 내역`
  body.innerHTML = '<div class="text-center py-6 text-gray-400 text-xs">로딩 중...</div>'
  modal.style.display='flex'

  const data = await api('/api/admin/partner/earnings?code=' + encodeURIComponent(code) + '&limit=50')
  if (!data.earnings) { body.innerHTML = '<div class="text-red-400 text-center py-4 text-xs">불러오기 실패</div>'; return }

  if (data.earnings.length === 0) {
    body.innerHTML = '<div class="text-gray-500 text-center py-4 text-xs">수익 내역 없음</div>'
    return
  }

  const total = data.earnings.reduce((s, e) => s + (e.amount||0), 0)
  body.innerHTML = `
    <div class="mb-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs text-center">
      <span class="text-gray-400">누적 수당: </span>
      <span class="text-yellow-400 font-black">${fmtU(total)} USDT</span>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-xs">
        <thead><tr class="text-gray-500 border-b border-white/10">
          <th class="py-1 text-left">유저</th>
          <th class="text-right">베팅액</th>
          <th class="text-right">수당</th>
          <th class="text-right">시간</th>
        </tr></thead>
        <tbody>
          ${data.earnings.map(e => `
            <tr class="border-b border-white/5">
              <td class="py-1">${e.username||'-'}</td>
              <td class="py-1 text-right text-gray-300">${fmtU(e.bet_amount||0)}</td>
              <td class="py-1 text-right text-yellow-400 font-bold">+${fmtU(e.amount)}</td>
              <td class="py-1 text-right text-gray-500">${ago(e.created_at)}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`
}

async function createPartner() {
  const owner = $('pOwner')?.value.trim()
  const rate  = parseFloat($('pRate')?.value) / 100 || 0.05
  if (!name || !owner) { toast('❌ 파트너명과 운영자 아이디를 입력하세요', 'text-red-400'); return }
  const data = await api('/api/admin/partner/create', { method:'POST', body: JSON.stringify({name, owner_username: owner, commission_rate: rate}) })
  if (data.success) {
    toast(`✅ 파트너 생성 완료! 코드: ${data.code}`, 'text-green-400')
    if ($('pName')) $('pName').value = ''
    if ($('pOwner')) $('pOwner').value = ''
    loadAdminPartners()
  } else toast('❌ ' + (data.error||'오류'), 'text-red-400')
}

async function togglePartner(code, isActive) {
  await api('/api/admin/partner/update', { method:'POST', body: JSON.stringify({code, is_active: isActive}) })
  loadAdminPartners()
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => toast('📋 ' + t('copied'), 'text-blue-400'))
}

// ═══════════════════════════════════════════════
// CSV 내보내기
// ═══════════════════════════════════════════════
async function exportCSV(type) {
  toast('⏳ CSV 생성 중...', 'text-blue-400')
  let rows = [], headers = [], filename = ''

  if (type === 'users') {
    const data = await api('/api/admin/users?page=1&limit=9999')
    // 전체 목록은 페이지 반복으로 수집
    let allUsers = data.users || []
    const totalPages = data.totalPages || 1
    for (let p = 2; p <= Math.min(totalPages, 50); p++) {
      const d2 = await api('/api/admin/users?page=' + p)
      if (d2.users) allUsers = allUsers.concat(d2.users)
    }
    headers = ['아이디','잔액','총입금','총출금','총베팅','추천수당','관리자','차단','가입일','최근IP','로그인수']
    rows = allUsers.map(u => [
      u.username, fmtU(u.balance), fmtU(u.totalDeposit), fmtU(u.totalWithdraw),
      fmtU(u.totalBetAmount), fmtU(u.referralEarnings),
      u.isAdmin ? 'Y' : 'N', u.isBanned ? 'Y' : 'N',
      new Date(u.createdAt).toLocaleDateString('ko-KR'),
      u.lastIp || '-', u.loginCount
    ])
    filename = 'users_' + new Date().toISOString().slice(0,10) + '.csv'
  } else if (type === 'deposits') {
    const data = await api('/api/admin/deposits')
    const deposits = data.deposits || []
    headers = ['아이디','유저명','금액(USDT)','TX Hash','네트워크','메모','일시']
    rows = deposits.map(d => [
      d.user_id||d.userId, d.username, fmtU(d.amount),
      d.tx_hash||d.txHash||'-', d.network||'manual', d.memo||'-',
      new Date(d.created_at||d.createdAt).toLocaleString('ko-KR')
    ])
    filename = 'deposits_' + new Date().toISOString().slice(0,10) + '.csv'
  } else if (type === 'withdraws') {
    const data = await api('/api/admin/withdraws?page=1&status=all')
    let allWd = data.requests || []
    const totalPages = data.totalPages || 1
    for (let p = 2; p <= Math.min(totalPages, 50); p++) {
      const d2 = await api('/api/admin/withdraws?page=' + p + '&status=all')
      if (d2.requests) allWd = allWd.concat(d2.requests)
    }
    headers = ['유저명','금액(USDT)','주소','상태','TX Hash','메모','신청일','처리일']
    rows = allWd.map(r => [
      r.username, fmtU(r.amount), r.address||'-',
      r.status, r.tx_hash||r.txHash||'-', r.note||'-',
      new Date(r.created_at||r.createdAt).toLocaleString('ko-KR'),
      r.processed_at ? new Date(r.processed_at).toLocaleString('ko-KR') : '-'
    ])
    filename = 'withdraws_' + new Date().toISOString().slice(0,10) + '.csv'
  }

  if (rows.length === 0) { toast('❌ 데이터 없음', 'text-red-400'); return }

  // BOM + CSV 생성 (한글 엑셀 호환)
  const bom = '\uFEFF'
  const csv = bom + [headers, ...rows]
    .map(r => r.map(cell => '"' + String(cell).replace(/"/g, '""') + '"').join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
  toast('✅ ' + rows.length + '건 CSV 다운로드 완료', 'text-green-400')
}

// ═══════════════════════════════════════════════
// Quill 에디터 인스턴스 관리
// ═══════════════════════════════════════════════
const quillInstances = {}

function initQuill(containerId, placeholder, toolbar) {
  if (quillInstances[containerId]) return quillInstances[containerId]
  const el = $(containerId)
  if (!el || typeof Quill === 'undefined') return null
  const toolbarOptions = toolbar || [
    ['bold', 'italic', 'underline'],
    [{ 'color': [] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link'],
    ['clean']
  ]
  const q = new Quill('#' + containerId, {
    theme: 'snow',
    placeholder: placeholder || '내용을 입력하세요...',
    modules: { toolbar: toolbarOptions }
  })
  // 글자 수 카운터 연동
  const countId = containerId === 'inqEditor' ? 'inqCharCount' : null
  if (countId) {
    q.on('text-change', () => {
      const len = q.getText().trim().length
      if ($(countId)) $(countId).textContent = len
    })
  }
  quillInstances[containerId] = q
  return q
}

function getQuillHTML(containerId) {
  const q = quillInstances[containerId]
  if (!q) return ''
  const html = q.root.innerHTML
  // 비어있는 경우 체크
  if (html === '<p><br></p>' || html.trim() === '') return ''
  return html
}

function getQuillText(containerId) {
  const q = quillInstances[containerId]
  if (!q) return ''
  return q.getText().trim()
}

function clearQuill(containerId) {
  const q = quillInstances[containerId]
  if (q) q.setContents([])
}

// 간이 자동번역 (한국어 → 영/중/일 로 동일 복사, 실제 번역 API 없으므로 원문 복사)
// 실제 DeepL/Papago API 연동 시 여기를 교체
async function autoTranslateNotice() {
  const koText = getQuillText('noticeEditorKo')
  const koHtml = getQuillHTML('noticeEditorKo')
  if (!koText) { toast('⚠️ 한국어 내용을 먼저 입력하세요', 'text-yellow-400'); return }

  // 스피너 표시
  const btn = $('btnAutoTranslate'), spinner = $('translateSpinner')
  if (btn) btn.disabled = true
  if (spinner) spinner.classList.remove('hidden')
  toast('🌐 번역 중...', 'text-blue-400')

  try {
    const data = await api('/api/translate', {
      method: 'POST',
      body: JSON.stringify({ text: koText, targets: ['en', 'zh', 'ja'] })
    })

    if (data.success && data.results) {
      // 영어 - Quill 에디터에 설정
      const qEn = quillInstances['noticeEditorEn']
      if (qEn && data.results.en) qEn.setText(data.results.en)
      else if (qEn) qEn.root.innerHTML = koHtml  // 번역 실패 시 원문 복사

      // 중국어/일본어 - textarea에 설정
      if ($('noticeInputZh')) $('noticeInputZh').value = data.results.zh || koText
      if ($('noticeInputJa')) $('noticeInputJa').value = data.results.ja || koText

      // 번역 결과 패널 표시
      const preview = $('noticeTranslatePreview')
      if (preview) preview.classList.remove('hidden')

      // 영어 에디터 초기화 (아직 없으면)
      if (!quillInstances['noticeEditorEn']) {
        setTimeout(() => {
          initQuill('noticeEditorEn', 'English translation...', [['bold','italic'],['link'],['clean']])
          const qEn2 = quillInstances['noticeEditorEn']
          if (qEn2 && data.results.en) qEn2.setText(data.results.en)
        }, 100)
      }

      toast('✅ 자동번역 완료! 내용을 확인하세요', 'text-green-400')
    } else {
      // API 실패 시 원문 복사
      const qEn = quillInstances['noticeEditorEn']
      if (qEn) qEn.root.innerHTML = koHtml
      if ($('noticeInputZh')) $('noticeInputZh').value = koText
      if ($('noticeInputJa')) $('noticeInputJa').value = koText
      const preview = $('noticeTranslatePreview')
      if (preview) preview.classList.remove('hidden')
      toast('⚠️ 번역 서비스 오류 - 원문이 복사됐습니다', 'text-yellow-400')
    }
  } catch(e) {
    toast('❌ 번역 오류가 발생했습니다', 'text-red-400')
  } finally {
    if (btn) btn.disabled = false
    if (spinner) spinner.classList.add('hidden')
  }
}

// ═══════════════════════════════════════════════
// 1:1 문의 - 유저
// ═══════════════════════════════════════════════
async function loadSupport() {
  const needLogin = $('supportNeedLogin'), info = $('supportInfo')
  if (!needLogin || !info) return
  if (!me) { needLogin.classList.remove('hidden'); info.classList.add('hidden'); return }
  needLogin.classList.add('hidden'); info.classList.remove('hidden')
  // Quill 에디터 초기화
  setTimeout(() => {
    initQuill('inqEditor', '문의 내용을 상세히 입력하세요...', [
      ['bold', 'italic', 'underline'],
      [{ 'color': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ])
  }, 100)
  await loadMyInquiries()
}

async function loadMyInquiries() {
  const data = await api('/api/inquiries')
  const el = $('myInquiryList')
  if (!el) return
  if (!data.inquiries || data.inquiries.length === 0) {
    el.innerHTML = `<div class="text-xs text-gray-500 text-center py-3">${t('no_record')}</div>`; return
  }
  const statusCls = { pending:'text-yellow-400', answered:'text-green-400', closed:'text-gray-400' }
  const statusLabel = s => t('inq_status_' + s) || s
  el.innerHTML = data.inquiries.map(inq => `
    <div class="p-3 bg-black/20 rounded-xl border border-white/10 cursor-pointer hover:border-blue-500/40 transition" onclick="openInquiryDetail('${inq.id}')">
      <div class="flex items-center justify-between gap-2">
        <div class="font-bold text-sm text-white">${inq.title}</div>
        <span class="text-xs shrink-0 ${statusCls[inq.status] || 'text-gray-400'}">${statusLabel(inq.status)}</span>
      </div>
      <div class="flex justify-between mt-1 text-xs text-gray-500">
        <span>${inq.category}</span>
        <span>${ago(inq.created_at)}</span>
      </div>
      ${inq.admin_reply ? `<div class="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300">💬 <span class="inquiry-content">${inq.admin_reply}</span></div>` : ''}
    </div>`).join('')
}

async function openInquiryDetail(id) {
  const data = await api('/api/inquiry/' + id)
  if (data.error || !data.inquiry) return
  const inq = data.inquiry
  const modal = $('inqDetailModal'), contentEl = $('inqDetailContent')
  if (!modal || !contentEl) return
  const statusLabel = s => t('inq_status_' + s) || s

  // 첨부 파일 메타 파싱
  const attachMatch = inq.content ? inq.content.match(/<!-- ATTACHMENTS:(.*?) -->/) : null
  let attachMeta = []
  let cleanContent = inq.content || ''
  if (attachMatch) {
    try { attachMeta = JSON.parse(attachMatch[1]) } catch(_) {}
    cleanContent = cleanContent.replace(/\n\n<!-- ATTACHMENTS:.*? -->/, '')
  }

  const attachHtml = attachMeta.length > 0
    ? `<div class="mt-2"><div class="text-gray-400 text-xs mb-1">📎 첨부 파일</div>
       <div class="flex flex-wrap gap-1">${attachMeta.map(a =>
         `<div class="attach-item">${fileIcon(a.type)} <span>${a.name}</span> <span class="text-gray-500">${(a.size/1024).toFixed(0)}KB</span></div>`
       ).join('')}</div></div>`
    : ''

  contentEl.innerHTML = `
    <div class="space-y-3 text-sm">
      <div><span class="text-gray-400 text-xs">${t('inquiry_category')}</span><div class="font-bold">${inq.category}</div></div>
      <div><span class="text-gray-400 text-xs">${t('inquiry_title')}</span><div class="font-bold">${inq.title}</div></div>
      <div><span class="text-gray-400 text-xs">${t('inquiry_content')}</span><div class="bg-black/30 rounded-lg p-3 text-xs text-gray-300 inquiry-content">${cleanContent}</div>${attachHtml}</div>
      ${inq.admin_reply ? `<div class="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3"><div class="text-blue-400 text-xs font-bold mb-1">💬 관리자 답변</div><div class="text-sm inquiry-content">${inq.admin_reply}</div><div class="text-xs text-gray-500 mt-1">${ago(inq.admin_reply_at)}</div></div>` : ''}
      ${inq.status !== 'closed' ? `
        <div class="border-t border-white/10 pt-3">
          <div class="text-xs text-gray-400 font-bold mb-2">📩 추가 문의 작성</div>
          <textarea id="followupContent_${inq.id}" rows="3" placeholder="추가 내용을 입력하세요..."
            class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-400 resize-none mb-2"></textarea>
          <button onclick="submitFollowup('${inq.id}')" class="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold transition">📤 추가 문의 전송</button>
        </div>` : `<div class="text-xs text-gray-500 text-center py-2">🔒 종료된 문의입니다</div>`}
    </div>`
  modal.style.display='flex'
}

function closeInquiryDetail() {
  const modal = $('inqDetailModal')
  if (modal) modal.style.display='none'
}

// 재문의(추가 답변) 전송
async function submitFollowup(inquiryId) {
  const content = $('followupContent_' + inquiryId)?.value.trim()
  if (!content) { toast('❌ 추가 문의 내용을 입력하세요', 'text-red-400'); return }
  const data = await api('/api/inquiry/followup', {
    method: 'POST',
    body: JSON.stringify({ inquiryId, content })
  })
  if (data.success) {
    toast('✅ 추가 문의가 전송되었습니다', 'text-green-400')
    closeInquiryDetail()
    loadMyInquiries()
  } else {
    toast('❌ 전송 실패: ' + (data.error||'오류'), 'text-red-400')
  }
}

async function submitInquiry() {
  const title   = $('inqTitle')?.value.trim()
  // Quill 에디터에서 HTML 콘텐츠 가져오기
  const content = getQuillHTML('inqEditor') || $('inqContent')?.value.trim()
  const category = $('inqCat')?.value || 'general'
  const errEl   = $('inqErr')
  if (errEl) errEl.classList.add('hidden')
  if (!title || !content) { if (errEl) { errEl.textContent = '제목과 내용을 입력하세요'; errEl.classList.remove('hidden') }; return }

  // 파일 첨부 처리 (Base64 인코딩)
  let attachments = []
  if (inqAttachedFiles.length > 0) {
    try {
      toast('⏳ 파일 처리 중...', 'text-blue-400')
      attachments = await encodeAttachments(inqAttachedFiles)
    } catch(e) {
      toast('⚠️ 파일 처리 오류, 첨부 없이 제출합니다', 'text-yellow-400')
    }
  }

  const data = await api('/api/inquiry/create', { method:'POST', body: JSON.stringify({title, content, category, attachments}) })
  if (data.error) {
    if (errEl) { errEl.textContent = errMap(data.error); errEl.classList.remove('hidden') }; return
  }
  if ($('inqTitle')) $('inqTitle').value = ''
  clearQuill('inqEditor')
  if ($('inqCharCount')) $('inqCharCount').textContent = '0'
  // 첨부 파일 초기화
  inqAttachedFiles.length = 0
  renderInqAttachPreview()
  toast('✅ 문의가 접수되었습니다', 'text-green-400')
  loadMyInquiries()
}

// ═══════════════════════════════════════════════
// 1:1 문의 - 관리자
// ═══════════════════════════════════════════════
let currentInqStatus = ''
let currentInqCategory = ''

function filterInquiryCategory(cat) {
  currentInqCategory = cat
  // 카테고리 버튼 스타일 업데이트
  ;['','deposit','withdraw','game','account','other'].forEach(c => {
    const btn = $('inqCat-' + (c || 'all'))
    if (!btn) return
    btn.className = c === cat
      ? 'px-2 py-1 rounded text-xs bg-white/20 text-white font-bold transition'
      : 'px-2 py-1 rounded text-xs bg-white/10 text-gray-400 hover:bg-white/20 transition'
  })
  loadAdminInquiries(currentInqStatus)
}

async function loadAdminInquiries(status) {
  if (status !== undefined) currentInqStatus = status
  const params = new URLSearchParams()
  if (currentInqStatus) params.set('status', currentInqStatus)
  if (currentInqCategory) params.set('category', currentInqCategory)
  const data = await api('/api/admin/inquiries?' + params.toString())
  const el = $('adInquiryList'), badge = $('adInquiryBadge')
  if (!el) return
  if (badge && data.pendingCount > 0) { badge.textContent = data.pendingCount; badge.classList.remove('hidden') }
  else if (badge) badge.classList.add('hidden')

  // 카테고리별 미답변 건수 표시
  if (data.categoryCounts) {
    ;['deposit','withdraw','game','account','other'].forEach(cat => {
      const el = $('inqCatCnt-' + cat)
      if (el) {
        const cnt = data.categoryCounts[cat] || 0
        el.textContent = cnt > 0 ? `(${cnt})` : ''
      }
    })
  }

  if (!data.inquiries || data.inquiries.length === 0) {
    el.innerHTML = '<div class="text-xs text-gray-500 text-center py-3">문의 없음</div>'; return
  }
  const statusCls = { pending:'text-orange-400', answered:'text-green-400', closed:'text-gray-400' }
  const statusLabel = { pending:'대기중', answered:'답변완료', closed:'종료' }
  const catLabel = { general:'일반', deposit:'입금', withdraw:'출금', bet:'게임', game:'게임', referral:'추천', account:'계정', other:'기타' }
  el.innerHTML = data.inquiries.map(inq => {
    // content에서 HTML 태그 제거해서 미리보기 텍스트 생성
    const previewText = inq.content ? inq.content.replace(/<[^>]*>/g, '').substring(0, 120) + (inq.content.replace(/<[^>]*>/g,'').length > 120 ? '...' : '') : ''
    return `
    <div class="p-3 bg-black/20 rounded-xl border border-white/10 text-xs">
      <div class="flex items-center justify-between gap-1 mb-1">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="font-bold text-white">${inq.username}</span>
          <span class="px-1.5 py-0.5 bg-white/10 text-gray-400 rounded text-xs">${catLabel[inq.category]||inq.category}</span>
        </div>
        <span class="px-2 py-0.5 rounded-full text-xs font-bold ${statusCls[inq.status]||'text-gray-400'} bg-white/5 shrink-0">${statusLabel[inq.status]||inq.status}</span>
      </div>
      <div class="font-bold text-sm text-white mb-1">${inq.title}</div>
      ${previewText ? `<div class="text-gray-400 mb-1.5 leading-relaxed bg-black/20 p-2 rounded inquiry-content">${previewText}</div>` : ''}
      <div class="text-gray-500 mb-2">${ago(inq.created_at)}</div>
      ${inq.admin_reply ? `<div class="bg-blue-500/10 p-2 rounded text-blue-300 mb-2 text-xs border border-blue-500/20">💬 관리자 답변: <span class="inquiry-content">${inq.admin_reply.replace(/<[^>]*>/g,'').substring(0,80)}</span></div>` : ''}
      <div class="flex gap-1 flex-wrap">
        <button onclick="openAdminInquiryDetail('${inq.id}')" class="px-2 py-1 bg-white/10 text-gray-300 rounded hover:bg-white/20 transition">📄 내용 보기</button>
        <button onclick="openAdminReply('${inq.id}','${inq.title.replace(/'/g,'')}')" class="px-2 py-1 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition">✏️ 답변</button>
        <button onclick="closeInquiry('${inq.id}')" class="px-2 py-1 bg-white/10 text-gray-400 rounded hover:bg-white/20 transition">✓ 종료</button>
      </div>
    </div>`
  }).join('')
}

function openAdminReply(id, title) {
  if ($('adReplyModal')) $('adReplyModal').style.display='flex'
  if ($('adReplyInqId')) $('adReplyInqId').value = id
  if ($('adReplyTitle')) $('adReplyTitle').textContent = title
  // Quill 에디터 초기화
  setTimeout(() => {
    const q = initQuill('adReplyEditor', '답변 내용을 입력하세요...', [
      ['bold', 'italic', 'underline'],
      [{ 'color': [] }],
      ['link'],
      ['clean']
    ])
    if (q) q.setContents([])
  }, 100)
}

async function openAdminInquiryDetail(id) {
  const data = await api('/api/inquiry/admin/' + id)
  if (!data || data.error) {
    // 폴백: 목록에서 찾기
    toast('❌ 문의 내용을 불러올 수 없습니다', 'text-red-400')
    return
  }
  const catLabel = { general:'일반', deposit:'입금', withdraw:'출금', bet:'게임', game:'게임', referral:'추천', account:'계정', other:'기타' }
  const statusLabel = { pending:'대기중', answered:'답변완료', closed:'종료' }
  const modal = document.createElement('div')
  modal.id = 'adminInqDetailModal'
  modal.className = 'fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4'
  modal.innerHTML = `
    <div class="bg-gray-900 rounded-2xl border border-white/20 w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 relative">
      <button onclick="document.getElementById('adminInqDetailModal').remove()" class="absolute top-3 right-3 text-gray-400 hover:text-white text-xl">✕</button>
      <div class="flex items-center gap-2 mb-3">
        <span class="px-2 py-0.5 bg-white/10 text-gray-400 rounded text-xs">${catLabel[data.category]||data.category}</span>
        <span class="text-xs text-gray-500">${data.username}</span>
        <span class="text-xs text-gray-500 ml-auto">${ago(data.created_at)}</span>
      </div>
      <div class="font-bold text-white text-base mb-3">${data.title}</div>
      <div class="bg-black/30 rounded-xl p-3 text-sm text-gray-300 mb-3 inquiry-content">${data.content||''}</div>
      ${data.admin_reply ? `
        <div class="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
          <div class="text-blue-400 text-xs font-bold mb-1">💬 관리자 답변</div>
          <div class="text-sm text-gray-200 inquiry-content">${data.admin_reply}</div>
          <div class="text-xs text-gray-500 mt-1">${ago(data.admin_reply_at)}</div>
        </div>` : ''}
      <div class="flex gap-2 mt-4">
        <button onclick="document.getElementById('adminInqDetailModal').remove(); openAdminReply('${data.id}','${(data.title||'').replace(/'/g,'')}')" class="flex-1 py-2 bg-blue-600/30 text-blue-300 rounded-xl hover:bg-blue-600/40 transition text-sm">✏️ 답변하기</button>
        <button onclick="document.getElementById('adminInqDetailModal').remove()" class="px-4 py-2 bg-white/10 text-gray-400 rounded-xl hover:bg-white/20 transition text-sm">닫기</button>
      </div>
    </div>`
  // 기존 모달 제거 후 추가
  const existing = document.getElementById('adminInqDetailModal')
  if (existing) existing.remove()
  document.body.appendChild(modal)
}

function closeAdminReply() {
  if ($('adReplyModal')) $('adReplyModal').style.display='none'
}

async function submitAdminReply() {
  const inquiryId = $('adReplyInqId')?.value
  // Quill 에디터에서 HTML 콘텐츠 가져오기
  const reply = getQuillHTML('adReplyEditor') || $('adReplyText')?.value.trim()
  if (!reply) { toast('❌ 답변 내용을 입력하세요', 'text-red-400'); return }
  const data = await api('/api/admin/inquiry/reply', { method:'POST', body: JSON.stringify({inquiryId, reply}) })
  if (data.success) { toast('✅ 답변 등록 완료', 'text-green-400'); closeAdminReply(); loadAdminInquiries('') }
  else toast('❌ ' + (data.error||'오류'), 'text-red-400')
}

async function closeInquiry(id) {
  await api('/api/admin/inquiry/close', { method:'POST', body: JSON.stringify({inquiryId: id}) })
  toast('✓ 문의 종료 처리', 'text-gray-400')
  loadAdminInquiries('')
}

// ═══════════════════════════════════════════════
// FAQ
// ═══════════════════════════════════════════════
let faqCurrentCat = ''

async function loadFAQ(category) {
  faqCurrentCat = category
  // 카테고리 버튼 활성화
  document.querySelectorAll('.faq-cat-btn').forEach(btn => {
    const isCurrent = btn.dataset.cat === category
    btn.className = 'faq-cat-btn ' + (isCurrent
      ? 'active px-3 py-1.5 rounded-full text-xs font-bold transition bg-blue-500/30 text-blue-300 border border-blue-500/40'
      : 'px-3 py-1.5 rounded-full text-xs font-bold transition bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20')
    btn.dataset.cat = btn.dataset.cat
  })
  const lang = localStorage.getItem('lang') || 'ko'
  const data = await api('/api/faqs?lang=' + lang + (category ? '&category=' + category : ''))
  const el = $('faqList')
  if (!el) return
  // 문의 버튼 표시 처리
  const faqToSupport = $('faqToSupport'), faqToLogin = $('faqToLogin')
  if (faqToSupport) faqToSupport.classList.toggle('hidden', !me)
  if (faqToLogin)   faqToLogin.classList.toggle('hidden', !!me)
  if (!data.faqs || data.faqs.length === 0) {
    el.innerHTML = `<div class="text-center text-gray-500 py-10 text-sm">${t('no_record')}</div>`; return
  }
  el.innerHTML = data.faqs.map((faq, i) => `
    <div class="glass rounded-xl overflow-hidden">
      <button onclick="toggleFaq(${i})" class="w-full px-5 py-4 text-left flex items-center justify-between gap-3 hover:bg-white/5 transition">
        <div class="flex items-center gap-2">
          <span class="text-blue-400 text-sm font-black shrink-0">Q</span>
          <span class="font-bold text-sm">${faq.question}</span>
        </div>
        <span id="faqIcon${i}" class="text-gray-400 shrink-0 transition-transform">▼</span>
      </button>
      <div id="faqAns${i}" class="hidden px-5 pb-4">
        <div class="flex gap-2">
          <span class="text-green-400 font-black shrink-0">A</span>
          <div class="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">${faq.answer}</div>
        </div>
      </div>
    </div>`).join('')
}

function toggleFaq(i) {
  const ans = $('faqAns' + i), icon = $('faqIcon' + i)
  if (!ans) return
  const hidden = ans.classList.toggle('hidden')
  if (icon) icon.textContent = hidden ? '▼' : '▲'
}

// ═══════════════════════════════════════════════
// FAQ 관리자
// ═══════════════════════════════════════════════
async function loadAdminFAQs() {
  const data = await api('/api/faqs?lang=ko')
  const el = $('adFaqList')
  if (!el) return
  if (!data.faqs || data.faqs.length === 0) {
    el.innerHTML = '<div class="text-gray-500 text-center py-2">FAQ 없음</div>'; return
  }
  const catLbl = { general:'일반', deposit:'입금', withdraw:'출금', bet:'게임', referral:'추천', other:'기타' }
  el.innerHTML = data.faqs.map(f => `
    <div class="p-2 bg-black/20 rounded-lg">
      <div class="flex items-start justify-between gap-2">
        <div class="flex-1 min-w-0">
          <div class="text-xs font-bold text-white truncate"><span class="text-yellow-400">[${catLbl[f.category]||f.category}]</span> ${f.question}</div>
          <div class="text-xs text-gray-400 truncate mt-0.5">${f.answer}</div>
        </div>
        <div class="flex gap-1 shrink-0">
          <button onclick="openFAQEdit('${f.id}')" class="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30 transition">수정</button>
          <button onclick="deleteFAQ('${f.id}')" class="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition">삭제</button>
        </div>
      </div>
    </div>`).join('')

  // FAQ 데이터를 전역에 캐시
  window._faqCache = data.faqs
}

async function createFAQ() {
  const category   = $('faqAdCat')?.value || 'general'
  const question   = $('faqAdQ')?.value.trim()
  const answer     = $('faqAdA')?.value.trim()
  const question_en = $('faqAdQen')?.value.trim()
  const answer_en   = $('faqAdAen')?.value.trim()
  const sort_order  = parseInt($('faqAdOrder')?.value || '0')
  if (!question || !answer) { toast('❌ 질문과 답변을 입력하세요', 'text-red-400'); return }
  const data = await api('/api/admin/faq/create', { method:'POST', body: JSON.stringify({category, question, answer, question_en, answer_en, sort_order}) })
  if (data.success) {
    toast('✅ FAQ 등록 완료', 'text-green-400')
    [$('faqAdQ'), $('faqAdA'), $('faqAdQen'), $('faqAdAen')].forEach(el => { if (el) el.value = '' })
    loadAdminFAQs()
  } else toast('❌ ' + (data.error||'오류'), 'text-red-400')
}

async function deleteFAQ(id) {
  if (!confirm('이 FAQ를 삭제하시겠습니까?')) return
  const data = await api('/api/admin/faq/delete', { method:'POST', body: JSON.stringify({id}) })
  if (data.success) { toast('🗑️ FAQ 삭제', 'text-yellow-400'); loadAdminFAQs() }
}

function openFAQEdit(id) {
  const faq = (window._faqCache || []).find(f => f.id === id)
  if (!faq) return
  const modal = $('faqEditModal')
  if (!modal) return
  $('faqEditId').value       = faq.id
  $('faqEditCat').value      = faq.category || 'general'
  $('faqEditQ').value        = faq.question || ''
  $('faqEditA').value        = faq.answer || ''
  modal.style.display='flex'
}

async function saveFAQEdit() {
  const id       = $('faqEditId')?.value
  const category = $('faqEditCat')?.value || 'general'
  const question = $('faqEditQ')?.value.trim()
  const answer   = $('faqEditA')?.value.trim()
  if (!question || !answer) { toast('❌ 질문과 답변을 입력하세요', 'text-red-400'); return }
  const data = await api('/api/admin/faq/update', { method:'POST', body: JSON.stringify({id, category, question, answer, is_active: true}) })
  if (data.success) {
    toast('✅ FAQ 수정 완료', 'text-green-400')
    $('faqEditModal').style.display='none'
    loadAdminFAQs()
  } else toast('❌ ' + (data.error||'오류'), 'text-red-400')
}

// ═══════════════════════════════════════════════
// URL 추천/파트너 파라미터
// ═══════════════════════════════════════════════
function parseRef() {
  const params  = new URLSearchParams(location.search)
  const ref     = params.get('ref')
  const partner = params.get('partner')
  if (ref) {
    const el = $('rRef')
    if (el) el.value = ref
    showTab('register')
    toast('🎁 추천코드: ' + ref, 'text-yellow-400')
  }
  if (partner) {
    // 파트너 코드는 회원가입 시 자동으로 URL에서 읽어 적용됨
    showTab('register')
    toast('🤝 파트너 링크로 접속 (코드: ' + partner + ')', 'text-blue-400')
  }
}

// ═══════════════════════════════════════════════
// 파일 첨부 기능 (1:1 문의)
// ═══════════════════════════════════════════════
const inqAttachedFiles = []  // 첨부 파일 목록
const MAX_FILES = 3
const MAX_SIZE = 5 * 1024 * 1024  // 5MB

function handleInqDrop(event) {
  event.preventDefault()
  const zone = $('inqDropZone')
  if (zone) zone.classList.remove('drag-over')
  handleInqFiles(event.dataTransfer.files)
}

function handleInqFiles(files) {
  if (!files || files.length === 0) return
  const allowed = ['image/jpeg','image/png','image/gif','image/webp','application/pdf','text/plain',
    'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  let added = 0
  for (const file of files) {
    if (inqAttachedFiles.length >= MAX_FILES) { toast(`❌ 최대 ${MAX_FILES}개까지 첨부 가능합니다`, 'text-red-400'); break }
    if (file.size > MAX_SIZE) { toast(`❌ ${file.name}: 5MB 초과`, 'text-red-400'); continue }
    if (!allowed.includes(file.type)) { toast(`❌ ${file.name}: 지원하지 않는 형식`, 'text-red-400'); continue }
    inqAttachedFiles.push(file)
    added++
  }
  if (added > 0) renderInqAttachPreview()
}

function renderInqAttachPreview() {
  const el = $('inqAttachPreview')
  if (!el) return
  el.innerHTML = inqAttachedFiles.map((f, i) => `
    <div class="attach-item">
      <span>${fileIcon(f.type)}</span>
      <span class="truncate max-w-[120px]">${f.name}</span>
      <span class="text-gray-500">${(f.size/1024).toFixed(0)}KB</span>
      <button onclick="removeInqFile(${i})" title="삭제">✕</button>
    </div>`).join('')
}

function removeInqFile(idx) {
  inqAttachedFiles.splice(idx, 1)
  renderInqAttachPreview()
}

function fileIcon(type) {
  if (type.startsWith('image/')) return '🖼️'
  if (type === 'application/pdf') return '📄'
  if (type.includes('word')) return '📝'
  return '📎'
}

// 파일을 Base64로 인코딩하여 첨부 정보 생성
async function encodeAttachments(files) {
  const result = []
  for (const file of files) {
    const b64 = await new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target.result.split(',')[1])
      reader.readAsDataURL(file)
    })
    result.push({ name: file.name, type: file.type, size: file.size, data: b64 })
  }
  return result
}

// ═══════════════════════════════════════════════
// Web3 지갑 로그인
// ═══════════════════════════════════════════════
async function connectWallet() {
  const btn = $('walletLoginBtn')
  if (btn) { btn.disabled = true; btn.textContent = t('wallet_connecting') }

  try {
    // EIP-1193 provider 감지 (MetaMask, TrustWallet, TokenPocket 등 모두 window.ethereum 사용)
    let provider = null
    if (window.ethereum) {
      provider = window.ethereum
    } else if (window.web3 && window.web3.currentProvider) {
      provider = window.web3.currentProvider
    } else {
      toast('⚠️ ' + t('wallet_no_provider'), 'text-yellow-400')
      if (btn) { btn.disabled = false; btn.textContent = t('wallet_login') }
      return
    }

    // 지갑 주소 요청
    const accounts = await provider.request({ method: 'eth_requestAccounts' })
    if (!accounts || accounts.length === 0) throw new Error('No accounts')
    const address = accounts[0].toLowerCase()

    if (btn) btn.textContent = t('wallet_sign')

    // 서버에서 nonce 받기
    const nonceRes = await api('/api/auth/nonce', {
      method: 'POST',
      body: JSON.stringify({ address })
    })
    if (nonceRes.error) throw new Error(nonceRes.error)

    // 개인 서명 (eth_sign 또는 personal_sign)
    const signature = await provider.request({
      method: 'personal_sign',
      params: [nonceRes.message, address]
    })

    // 서버에 서명 검증 요청
    const loginRes = await api('/api/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ address, signature })
    })
    if (loginRes.error) throw new Error(loginRes.error)

    // 로그인 성공
    sid = loginRes.sessionId
    me  = loginRes.user
    localStorage.setItem('sid', sid)
    updateUI()
    showTab('game')
    toast('🦊 ' + t('wallet_login_ok') + ' ' + address.slice(0,6) + '...' + address.slice(-4), 'text-green-400')

  } catch(e) {
    console.error('Wallet login error:', e)
    const msg = e.message === '4001' || e.code === 4001 ? '서명을 취소했습니다' : t('wallet_login_fail')
    toast('❌ ' + msg, 'text-red-400')
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = t('wallet_login') }
  }
}

// ═══════════════════════════════════════════════
// P2P 배틀룸
// ═══════════════════════════════════════════════
let myP2PBet = null

async function loadP2PRoom() {
  const data = await api('/api/p2p/round/current')
  if (!data || !data.id) return

  const isBetting = data.phase === 'betting'
  const pb = $('p2pPhaseBadge')
  if (pb) {
    pb.textContent = isBetting ? t('phase_betting') : t('phase_result')
    pb.className = 'inline-block px-3 py-1 rounded-full text-xs font-bold mb-1 ' +
      (isBetting ? 'bg-green-500/20 text-green-400 betting-phase' : 'bg-red-500/20 text-red-400')
  }

  if ($('p2pRoundId'))  $('p2pRoundId').textContent  = '#' + data.id
  if ($('p2pTimer'))    $('p2pTimer').textContent     = data.timeLeft
  const bar = $('p2pBar')
  if (bar) bar.style.width = (isBetting ? (data.timeLeft/60*100) : (data.timeLeft/15*100)) + '%'

  // 풀 현황
  if ($('p2pOddPool'))  $('p2pOddPool').textContent  = fmtU(data.totalOdd)  + ' USDT'
  if ($('p2pEvenPool')) $('p2pEvenPool').textContent = fmtU(data.totalEven) + ' USDT'
  if ($('p2pTotalPool'))$('p2pTotalPool').textContent= fmtU(data.totalPool) + ' USDT'
  if ($('p2pBetCount')) $('p2pBetCount').textContent = data.betCount + ' ' + t('players')

  // 예상 배당률 (실시간 변동)
  const oddPay  = data.oddPayout  > 0 ? data.oddPayout.toFixed(2)  + 'x' : '?'
  const evenPay = data.evenPayout > 0 ? data.evenPayout.toFixed(2) + 'x' : '?'
  if ($('p2pOddPayout'))  $('p2pOddPayout').textContent  = oddPay
  if ($('p2pEvenPayout')) $('p2pEvenPayout').textContent = evenPay

  // 결과 표시
  const resArea = $('p2pResultArea')
  if (!isBetting && data.result && resArea) {
    const isOddResult = data.result === 'odd'
    resArea.classList.remove('hidden')
    resArea.innerHTML = `
      <div class="text-center py-4">
        <div class="text-4xl mb-2">${isOddResult ? '🔴' : '🔵'}</div>
        <div class="text-2xl font-black ${isOddResult ? 'text-red-400' : 'text-blue-400'}">
          ${isOddResult ? t('odd') : t('even')}
        </div>
        ${myP2PBet ? `<div class="mt-2 text-sm ${myP2PBet.choice === data.result ? 'text-green-400 font-black' : 'text-gray-400'}">
          ${myP2PBet.choice === data.result ? '🎉 WIN!' : '😔 LOSE'}
        </div>` : ''}
      </div>`
    if (data.id !== (myP2PBet?.roundId)) myP2PBet = null
  } else if (resArea) {
    resArea.classList.add('hidden')
  }

  // 베팅 버튼 활성화
  const btnOdd  = $('p2pBtnOdd')
  const btnEven = $('p2pBtnEven')
  const canBet  = isBetting && !!me && !myP2PBet
  if (btnOdd)  btnOdd.disabled  = !canBet
  if (btnEven) btnEven.disabled = !canBet

  // 로그인 유도
  const needLogin = $('p2pNeedLogin')
  if (needLogin) needLogin.classList.toggle('hidden', !!me)

  // P2P 히스토리 로드
  loadP2PHistory()
}

async function doP2PBet(choice) {
  if (!me) { showTab('login'); return }
  const amtEl = $('p2pBetAmt')
  const amount = parseFloat(amtEl?.value || 0)
  if (!amount || amount < 10) { toast('⚠️ 최소 10 USDT', 'text-yellow-400'); return }
  if (amount > me.balance) { toast('⚠️ ' + t('no_balance'), 'text-yellow-400'); return }

  const data = await api('/api/p2p/bet', { method:'POST', body: JSON.stringify({ choice, amount }) })
  if (data.error) { toast('❌ ' + errMap(data.error), 'text-red-400'); return }

  const { idx } = (() => {
    const cycle = 75000, elapsed = (Date.now() - 1700000000000) % cycle
    const idx = Math.floor((Date.now() - 1700000000000) / cycle) + 50000000
    return { idx }
  })()

  myP2PBet = { choice, amount, roundId: String(idx) }
  me.balance = data.balance
  updateUI()
  loadP2PRoom()
  toast(`⚔️ ${choice.toUpperCase()} ${fmtU(amount)} USDT ${t('bet_ok')}`, 'text-green-400')
  if (amtEl) amtEl.value = ''
}

async function loadP2PHistory() {
  const data = await api('/api/p2p/history')
  const el = $('p2pHistory')
  if (!el) return
  if (!data.history || data.history.length === 0) {
    el.innerHTML = `<div class="text-xs text-gray-500 text-center py-2">${t('no_record')}</div>`
    return
  }
  el.innerHTML = data.history.slice(0,10).map(h => `
    <div class="flex items-center gap-2 py-1 border-b border-white/5">
      <span class="text-xs text-gray-500 w-14 shrink-0">#${String(h.id).slice(-4)}</span>
      <span class="text-xs font-black w-10 text-center ${h.result==='odd'?'text-red-400':'text-blue-400'}">${h.result==='odd'?t('odd'):t('even')}</span>
      <span class="text-xs text-gray-400">${fmtU(h.total_odd+h.total_even)} USDT</span>
      <span class="text-xs text-gray-500">${h.bet_count}${t('players')}</span>
    </div>`).join('')
}

// ═══════════════════════════════════════════════
// 초기화
// ═══════════════════════════════════════════════
async function init() {
  initLayout()  // CSS 변수 설정 (헤더 높이 → 네비 top)
  applyLang()
  parseRef()

  // UI 먼저 표시 (API 응답 기다리지 않음)
  updateUI()
  showTab('game')

  // 세션 복원 (백그라운드)
  if (sid) {
    api('/api/me').then(data => {
      if (!data.error) {
        me = data
        updateUI()
      } else {
        sid = ''; localStorage.removeItem('sid')
      }
    })
  }

  // Worker warm-up: 첫 요청 후 1초 뒤 데이터 로드
  setTimeout(() => {
    api('/api/game-settings').then(gs => {
      if (gs && gs.payout) {
        currentPayout = parseFloat(gs.payout) || 1.90
        const r = ROOM_CONFIGS[currentRoom]
        if (r) currentPayout = r.payout
        if ($('gPayoutDisplay')) $('gPayoutDisplay').textContent = currentPayout.toFixed(2) + 'x'
      }
    })
    loadFeed()
    loadDashboard()
    loadNotices()
    checkNoticePopup()
  }, 1000)

  setInterval(() => {
    const gs = $('gamePlayScreen')
    if (gs && !gs.classList.contains('hidden')) loadRound()
  }, 1000)
  setInterval(loadFeed,  4000)
  setInterval(loadDashboard, 30000)
  setInterval(loadNotices, 60000)
  setInterval(() => {
    const p2pPanel = $('p-p2p')
    if (p2pPanel && !p2pPanel.classList.contains('hidden')) loadP2PRoom()
  }, 1000)
}

// ═══════════════════════════════════════════════
// 공지사항 팝업 (오늘 하루 보지 않기)
// ═══════════════════════════════════════════════
async function checkNoticePopup() {
  const lang = localStorage.getItem('lang') || 'ko'
  const data = await api('/api/notice/latest?lang=' + lang)
  if (!data.notice) return

  const noticeId = data.notice.id
  const skipKey  = 'notice_skip_' + noticeId
  const skipTs   = localStorage.getItem(skipKey)
  if (skipTs) {
    const today = new Date(); today.setHours(0,0,0,0)
    if (parseInt(skipTs) >= today.getTime()) return  // 오늘 이미 닫음
  }

  const modal = $('noticePopupModal')
  const body  = $('noticePopupBody')
  if (!modal || !body) return

  const colorMap = { warning:'border-yellow-500/40 text-yellow-300', danger:'border-red-500/40 text-red-300', info:'border-blue-500/40 text-blue-300' }
  const typeClass = colorMap[data.notice.type] || colorMap.info
  body.innerHTML = `<div class="prose prose-invert prose-sm max-w-none text-sm text-gray-200">${data.notice.displayContent}</div>`
  modal.style.display='flex'
  $('noticePopupClose').onclick = () => modal.style.display='none'
  $('noticeSkipToday').onclick  = () => {
    const today = new Date(); today.setHours(0,0,0,0)
    localStorage.setItem(skipKey, String(today.getTime()))
    modal.style.display='none'
  }
}

init()

// ─────────────────────────────────────────────
// 기능 1: 관리자 활동 로그
// ─────────────────────────────────────────────
let adminLogPage = 1
let adminLogFilter = ''
let adminLogTotalPages = 1

function setAdminLogFilter(action) {
  adminLogFilter = action
  // 버튼 스타일
  document.querySelectorAll('.log-filter-btn').forEach(b => {
    b.classList.remove('active','bg-yellow-500/20','text-yellow-300','border-yellow-500/30')
    b.classList.add('bg-white/10','text-gray-300','border-white/20')
  })
  const activeBtn = [...document.querySelectorAll('.log-filter-btn')].find(b => b.getAttribute('onclick') === `setAdminLogFilter('${action}')`)
  if (activeBtn) {
    activeBtn.classList.add('active','bg-yellow-500/20','text-yellow-300','border-yellow-500/30')
    activeBtn.classList.remove('bg-white/10','text-gray-300','border-white/20')
  }
  loadAdminLogs(1)
}

async function loadAdminLogs(page) {
  page = Math.max(1, Math.min(page||1, adminLogTotalPages||1))
  adminLogPage = page
  const el = $('adLogList')
  if (!el) return
  el.innerHTML = '<div class="text-gray-500 text-center py-3">로딩 중...</div>'
  const params = new URLSearchParams({ page })
  if (adminLogFilter) params.set('action', adminLogFilter)
  const data = await api('/api/admin/logs?' + params)
  adminLogTotalPages = data.totalPages || 1

  const pager   = $('adLogPager')
  const pageInfo = $('adLogPageInfo')
  if (pager) {
    if (adminLogTotalPages > 1) { pager.classList.remove('hidden') } else { pager.classList.add('hidden') }
  }
  if (pageInfo) pageInfo.textContent = `${page} / ${adminLogTotalPages}`
  const prev = $('adLogPrev'), next = $('adLogNext')
  if (prev) prev.disabled = page <= 1
  if (next) next.disabled = page >= adminLogTotalPages

  if (!data.logs || data.logs.length === 0) {
    el.innerHTML = '<div class="text-gray-500 text-center py-3">로그 없음</div>'; return
  }

  const actionLabel = {
    balance_set:'💰 잔액설정', balance_add:'💵 잔액추가', manual_deposit:'📥 수동입금',
    approve_withdraw:'✅ 출금승인', reject_withdraw:'❌ 출금거절', ban:'🚫 계정정지',
    unban:'✅ 정지해제', reset_password:'🔑 비번초기화', memo_update:'📝 메모수정'
  }
  const actionColor = {
    balance_set:'text-blue-400', balance_add:'text-green-400', manual_deposit:'text-green-300',
    approve_withdraw:'text-emerald-400', reject_withdraw:'text-red-400', ban:'text-red-500',
    unban:'text-green-400', reset_password:'text-yellow-400', memo_update:'text-gray-300'
  }

  el.innerHTML = data.logs.map(log => {
    const label = actionLabel[log.action] || log.action
    const color = actionColor[log.action] || 'text-gray-300'
    const detail = log.detail || {}
    let detailStr = ''
    if (detail.amount !== undefined) detailStr += ` ${detail.amount} USDT`
    if (detail.txHash) detailStr += ` TX:${detail.txHash.slice(0,10)}…`
    if (detail.note) detailStr += ` [${detail.note}]`
    if (detail.memo) detailStr += ` "${String(detail.memo).slice(0,30)}"`
    if (detail.newBalance !== undefined) detailStr += ` → ${detail.newBalance} USDT`
    return `<div class="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 transition">
      <span class="text-gray-500 w-28 shrink-0">${new Date(log.createdAt).toLocaleString('ko-KR', {month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})}</span>
      <span class="font-bold ${color} w-28 shrink-0">${label}</span>
      <span class="text-purple-300 shrink-0">👤 ${log.adminUsername}</span>
      ${log.targetUsername ? `<span class="text-gray-400 shrink-0">→ ${log.targetUsername}</span>` : ''}
      <span class="text-gray-500 truncate">${detailStr}</span>
    </div>`
  }).join('')
}

// ─────────────────────────────────────────────
// 기능 4: 리더보드
// ─────────────────────────────────────────────
let currentLbType = 'total_bet'

async function loadLeaderboard(type) {
  currentLbType = type || currentLbType
  const el = $('leaderboardContent')
  if (!el) return

  // 탭 스타일 업데이트
  document.querySelectorAll('.lb-tab').forEach(b => {
    b.classList.remove('active','bg-yellow-500/20','text-yellow-300','border-yellow-500/30')
    b.classList.add('bg-white/10','text-gray-300','border-white/20')
  })
  const activeTab = currentLbType === 'total_bet' ? $('lb-tab-bet') : $('lb-tab-roi')
  if (activeTab) {
    activeTab.classList.add('active','bg-yellow-500/20','text-yellow-300','border-yellow-500/30')
    activeTab.classList.remove('bg-white/10','text-gray-300','border-white/20')
  }

  el.innerHTML = '<div class="text-gray-500 text-center py-8">🏆 ' + t('lb_loading') + '</div>'
  const data = await api('/api/leaderboard?type=all')
  const list = currentLbType === 'total_bet' ? data.topBet : data.topRoi

  if (!list || list.length === 0) {
    el.innerHTML = '<div class="text-gray-500 text-center py-8">' + t('no_record') + '</div>'; return
  }

  const rankIcon = ['🥇','🥈','🥉']
  const rankColors = ['text-yellow-400','text-gray-300','text-orange-400']

  if (currentLbType === 'total_bet') {
    el.innerHTML = `
      <table class="w-full text-sm">
        <thead><tr class="text-gray-400 border-b border-white/10 text-left">
          <th class="py-2 px-3">${t('lb_rank')}</th>
          <th class="py-2 px-3">${t('username')}</th>
          <th class="py-2 px-3 text-right">${t('total_bet_amount')}</th>
          <th class="py-2 px-3 text-right">${t('win_rate')}</th>
          <th class="py-2 px-3 text-right">${t('total_games')}</th>
        </tr></thead>
        <tbody>${list.map((u,i) => `
          <tr class="border-b border-white/5 hover:bg-white/5 transition ${i < 3 ? 'font-bold' : ''}">
            <td class="py-3 px-3"><span class="${rankColors[i] || 'text-gray-400'} text-lg">${rankIcon[i] || (i+1)}</span></td>
            <td class="py-3 px-3 text-white">${u.username}</td>
            <td class="py-3 px-3 text-right text-yellow-300 font-black">${fmtU(u.totalBet)} USDT</td>
            <td class="py-3 px-3 text-right ${parseFloat(u.winRate||'0') >= 50 ? 'text-green-400' : 'text-red-400'}">${u.winRate||'0'}%</td>
            <td class="py-3 px-3 text-right text-gray-400">${u.totalGames||0}</td>
          </tr>`).join('')}
        </tbody>
      </table>`
  } else {
    el.innerHTML = `
      <table class="w-full text-sm">
        <thead><tr class="text-gray-400 border-b border-white/10 text-left">
          <th class="py-2 px-3">${t('lb_rank')}</th>
          <th class="py-2 px-3">${t('username')}</th>
          <th class="py-2 px-3 text-right">${t('net_profit')}</th>
          <th class="py-2 px-3 text-right">${t('total_bet')}</th>
          <th class="py-2 px-3 text-right">ROI</th>
        </tr></thead>
        <tbody>${list.map((u,i) => `
          <tr class="border-b border-white/5 hover:bg-white/5 transition ${i < 3 ? 'font-bold' : ''}">
            <td class="py-3 px-3"><span class="${rankColors[i] || 'text-gray-400'} text-lg">${rankIcon[i] || (i+1)}</span></td>
            <td class="py-3 px-3 text-white">${u.username}</td>
            <td class="py-3 px-3 text-right ${(u.netProfit||0) >= 0 ? 'text-green-400' : 'text-red-400'} font-black">${(u.netProfit||0) >= 0 ? '+' : ''}${fmtU(u.netProfit||0)} USDT</td>
            <td class="py-3 px-3 text-right text-gray-400">${fmtU(u.totalBet||0)}</td>
            <td class="py-3 px-3 text-right ${parseFloat(u.roi||'0') >= 0 ? 'text-green-400' : 'text-red-400'}">${u.roi||'0'}%</td>
          </tr>`).join('')}
        </tbody>
      </table>`
  }
}

// ─────────────────────────────────────────────
// 기능 5: 유저 개인 30일 손익 그래프
// ─────────────────────────────────────────────
let myStats30ChartInst = null

async function loadMyStats30() {
  if (!me) return
  const data = await api('/api/my-stats')
  if (data.error) return

  // 요약 표시
  const s = data.summary
  const summaryEl = $('myStats30Summary')
  if (summaryEl) {
    const profit = s.netProfit
    summaryEl.innerHTML = `<span class="${profit >= 0 ? 'text-green-400' : 'text-red-400'} font-bold">${profit >= 0 ? '+' : ''}${fmtU(profit)} USDT</span> <span class="text-gray-500">30일 순손익 · ${s.totalGames}게임</span>`
  }

  // 차트 그리기
  const canvas = $('myStats30Chart')
  if (!canvas) return
  if (myStats30ChartInst) { myStats30ChartInst.destroy(); myStats30ChartInst = null }

  const ctx = canvas.getContext('2d')
  const profits = data.profits
  const colors  = profits.map(v => v >= 0 ? 'rgba(52,211,153,0.8)' : 'rgba(248,113,113,0.8)')
  const borderColors = profits.map(v => v >= 0 ? 'rgba(52,211,153,1)' : 'rgba(248,113,113,1)')

  myStats30ChartInst = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [{
        label: '일별 손익 (USDT)',
        data: profits,
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.parsed.y >= 0 ? '+' : ''}${fmtU(ctx.parsed.y)} USDT`
          }
        }
      },
      scales: {
        x: {
          ticks: { color:'#9ca3af', font:{ size:9 }, maxTicksLimit: 10 },
          grid: { color:'rgba(255,255,255,0.05)' }
        },
        y: {
          ticks: { color:'#9ca3af', font:{ size:10 } },
          grid: { color:'rgba(255,255,255,0.05)' }
        }
      }
    }
  })
}

// ─────────────────────────────────────────────
// 기능 8: 관리자 대량 메시지 발송 + 유저 메시지함
// ─────────────────────────────────────────────
async function sendMassMessage() {
  const filter  = $('msgFilter')?.value || 'all'
  const title   = $('msgTitle')?.value.trim()
  const content = $('msgContent')?.value.trim()
  if (!title) { toast('⚠️ 제목을 입력하세요', 'text-yellow-400'); return }
  if (!content) { toast('⚠️ 내용을 입력하세요', 'text-yellow-400'); return }

  const filterLabel = { all:'전체', active:'활성', highroller:'고액베터', inactive:'비활성' }
  if (!confirm(`[${filterLabel[filter]||filter}] 유저에게 메시지를 발송하시겠습니까?\n\n제목: ${title}\n내용: ${content}`)) return

  const data = await api('/api/admin/message/send', {
    method: 'POST',
    body: JSON.stringify({ filter, title, content })
  })
  if (data.success) {
    toast(`✅ ${data.sentCount}명에게 발송 완료`, 'text-green-400')
    if ($('msgTitle')) $('msgTitle').value = ''
    if ($('msgContent')) $('msgContent').value = ''
  } else {
    const errMsg = data.error === 'NO_USERS' ? '대상 유저 없음' : (data.error || '오류')
    toast('❌ ' + errMsg, 'text-red-400')
  }
}

async function loadMyMessages() {
  if (!me) return
  const data = await api('/api/my-messages')
  if (data.error) return

  // 읽지 않은 배지
  const badge = $('msgUnreadBadge')
  if (badge) {
    if (data.unreadCount > 0) {
      badge.textContent = data.unreadCount
      badge.classList.remove('hidden')
    } else {
      badge.classList.add('hidden')
    }
  }

  const el = $('myMessageList')
  if (!el) return
  if (!data.messages || data.messages.length === 0) {
    el.innerHTML = '<div class="text-xs text-gray-500 text-center py-3">메시지 없음</div>'
    return
  }

  el.innerHTML = data.messages.map(msg => `
    <div class="p-3 rounded-lg cursor-pointer transition ${msg.is_read ? 'bg-white/5' : 'bg-blue-500/10 border border-blue-500/20'}"
         onclick="readMessage('${msg.id}', this)">
      <div class="flex items-start justify-between gap-2">
        <div class="font-bold text-xs text-white ${msg.is_read ? 'opacity-70' : ''}">${msg.title}${!msg.is_read ? ' <span class="text-blue-400">●</span>' : ''}</div>
        <div class="text-xs text-gray-500 shrink-0">${new Date(msg.created_at).toLocaleString('ko-KR',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})}</div>
      </div>
      <div class="text-xs text-gray-400 mt-1 msg-body ${msg.is_read ? '' : 'hidden'}">${msg.content}</div>
    </div>`).join('')
}

async function readMessage(msgId, el) {
  // 본문 토글
  const body = el.querySelector('.msg-body')
  if (body) body.classList.toggle('hidden')

  // 읽음 처리
  const isUnread = el.classList.contains('bg-blue-500/10')
  if (isUnread) {
    el.classList.remove('bg-blue-500/10','border','border-blue-500/20')
    el.classList.add('bg-white/5')
    await api('/api/my-messages/read', { method:'POST', body: JSON.stringify({ msgId }) })
    // 배지 업데이트
    const badge = $('msgUnreadBadge')
    if (badge) {
      const cur = parseInt(badge.textContent || '0') - 1
      if (cur <= 0) badge.classList.add('hidden')
      else badge.textContent = cur
    }
  }
}

async function markAllMessagesRead() {
  if (!me) return
  await api('/api/my-messages/read', { method:'POST', body: JSON.stringify({}) })
  loadMyMessages()
  toast('✅ 모두 읽음 처리', 'text-blue-400')
}
