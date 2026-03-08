import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()
app.use('/api/*', cors())

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────
interface User {
  id: string
  username: string
  password: string
  balance: number        // USDT (소수점 2자리)
  depositAddress: string // 가상 USDT 입금 주소
  totalDeposit: number
  totalWithdraw: number
  referralCode: string
  referredBy: string | null
  level1Referrals: string[]
  level2Referrals: string[]
  totalEarned: number
  referralEarnings: number
  createdAt: number
}

interface Bet {
  userId: string
  username: string
  choice: 'odd' | 'even'
  amount: number   // USDT
  timestamp: number
}

interface Round {
  id: number
  status: 'betting' | 'finished'
  startTime: number
  endTime: number
  bets: Bet[]
  result: 'odd' | 'even' | null
  hashValue: string | null
  serverSeed: string
  serverSeedHash: string
  blockHeight: number
  totalOdd: number
  totalEven: number
  settled: boolean
}

interface HistoryItem {
  roundId: number
  result: 'odd' | 'even'
  hashValue: string
  blockHeight: number
  totalBets: number
  totalPayout: number
  timestamp: number
  serverSeed: string
}

// ─────────────────────────────────────────────
// 전역 상태
// ─────────────────────────────────────────────
const users = new Map<string, User>()
const sessions = new Map<string, string>()

const ROUND_DURATION = 30000
const RESULT_SHOW    = 8000
const CYCLE          = ROUND_DURATION + RESULT_SHOW
const GAME_START     = Date.now()

const rounds     = new Map<number, Round>()
const gameHistory: HistoryItem[] = []
const allBetHistory: Array<Bet & { roundId: number; win: boolean; payout: number }> = []

let totalBetAmount    = 0
let totalPayoutAmount = 0
let totalReferralPaid = 0
let houseProfit       = 0

const PAYOUT = 1.90
const L1     = 0.025
const L2     = 0.010

// ─────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────
async function sha256(msg: string): Promise<string> {
  const buf  = new TextEncoder().encode(msg)
  const hash = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}
const uid  = () => Math.random().toString(36).slice(2,15) + Math.random().toString(36).slice(2,15)
const rcode= () => Math.random().toString(36).slice(2,8).toUpperCase()
const getU = (sid: string) => { const id = sessions.get(sid); return id ? users.get(id) ?? null : null }
const isOdd= (h: string)   => parseInt(h[h.length-1], 16) % 2 === 1

// 가상 USDT 입금 주소 생성 (TRC20 형식 모방)
const genAddr = () => 'T' + Array.from({length:33}, () => '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'[Math.floor(Math.random()*58)]).join('')

// ─────────────────────────────────────────────
// 라운드 상태머신
// ─────────────────────────────────────────────
function getPhase() {
  const elapsed = (Date.now() - GAME_START) % CYCLE
  const idx     = Math.floor((Date.now() - GAME_START) / CYCLE)
  if (elapsed < ROUND_DURATION)
    return { phase: 'betting' as const, timeLeft: Math.floor((ROUND_DURATION - elapsed)/1000), idx }
  return   { phase: 'result'  as const, timeLeft: Math.floor((CYCLE - elapsed)/1000), idx }
}

async function ensureRound(idx: number): Promise<Round> {
  if (rounds.has(idx)) return rounds.get(idx)!
  const serverSeed     = uid() + uid()
  const serverSeedHash = await sha256(serverSeed)
  const round: Round   = {
    id: idx+1, status: 'betting',
    startTime: GAME_START + idx*CYCLE,
    endTime:   GAME_START + idx*CYCLE + ROUND_DURATION,
    bets: [], result: null, hashValue: null,
    serverSeed, serverSeedHash,
    blockHeight: 881000 + idx + 1,
    totalOdd: 0, totalEven: 0, settled: false
  }
  rounds.set(idx, round)
  return round
}

async function settleRound(round: Round) {
  if (round.settled) return
  round.settled = true
  const userSeeds = round.bets.map(b => b.userId).join('')
  const hash      = await sha256(round.serverSeed + round.blockHeight + userSeeds)
  const result    = isOdd(hash) ? 'odd' : 'even' as 'odd'|'even'
  round.result    = result
  round.hashValue = hash
  round.status    = 'finished'

  let totalPayout = 0
  for (const bet of round.bets) {
    const user = users.get(bet.userId)
    if (!user) continue
    totalBetAmount += bet.amount
    const win    = bet.choice === result
    const payout = win ? Math.round(bet.amount * PAYOUT * 100) / 100 : 0
    totalPayout += payout
    if (win) { user.balance += payout; totalPayoutAmount += payout; user.totalEarned += payout - bet.amount }
    if (user.referredBy) {
      const l1u = users.get(user.referredBy)
      if (l1u) {
        const r1 = Math.round(bet.amount * L1 * 100) / 100
        l1u.balance += r1; l1u.referralEarnings += r1; totalReferralPaid += r1
        if (l1u.referredBy) {
          const l2u = users.get(l1u.referredBy)
          if (l2u) { const r2 = Math.round(bet.amount * L2 * 100) / 100; l2u.balance += r2; l2u.referralEarnings += r2; totalReferralPaid += r2 }
        }
      }
    }
    allBetHistory.unshift({ ...bet, roundId: round.id, win, payout })
  }
  if (allBetHistory.length > 500) allBetHistory.splice(500)
  houseProfit += (round.totalOdd + round.totalEven) - totalPayout
  gameHistory.unshift({ roundId: round.id, result, hashValue: hash, blockHeight: round.blockHeight, totalBets: round.totalOdd+round.totalEven, totalPayout, timestamp: Date.now(), serverSeed: round.serverSeed })
  if (gameHistory.length > 200) gameHistory.pop()
}

app.use('/api/*', async (c, next) => {
  const { phase, idx } = getPhase()
  const round = await ensureRound(idx)
  if (phase === 'result' && !round.settled) await settleRound(round)
  await next()
})

// ─────────────────────────────────────────────
// 데모 유저
// ─────────────────────────────────────────────
async function initUsers() {
  const list = [
    { username:'admin',  password:'admin123',  balance:10000 },
    { username:'demo1',  password:'demo123',   balance:500   },
    { username:'demo2',  password:'demo123',   balance:250   },
    { username:'demo3',  password:'demo123',   balance:100   },
    { username:'tester', password:'test1234',  balance:1000  },
  ]
  for (const d of list) {
    const id = uid()
    users.set(id, { id, ...d, depositAddress: genAddr(), totalDeposit:0, totalWithdraw:0, referralCode:rcode(), referredBy:null, level1Referrals:[], level2Referrals:[], totalEarned:0, referralEarnings:0, createdAt:Date.now() })
  }
}
initUsers()

// ─────────────────────────────────────────────
// API
// ─────────────────────────────────────────────
app.post('/api/register', async (c) => {
  const { username, password, referralCode } = await c.req.json()
  if (!username || !password) return c.json({ error: 'NEED_FIELDS' }, 400)
  if (username.length < 3)    return c.json({ error: 'USERNAME_SHORT' }, 400)
  if ([...users.values()].find(u => u.username === username)) return c.json({ error: 'USERNAME_TAKEN' }, 400)
  let referredBy: string|null = null
  let l1: User|null = null
  if (referralCode) {
    l1 = [...users.values()].find(u => u.referralCode === referralCode) ?? null
    if (!l1) return c.json({ error: 'INVALID_REF' }, 400)
    referredBy = l1.id
  }
  const id = uid()
  const newUser: User = { id, username, password, balance:10, depositAddress:genAddr(), totalDeposit:10, totalWithdraw:0, referralCode:rcode(), referredBy, level1Referrals:[], level2Referrals:[], totalEarned:0, referralEarnings:0, createdAt:Date.now() }
  users.set(id, newUser)
  if (l1) { l1.level1Referrals.push(id); if (l1.referredBy) { const l2u = users.get(l1.referredBy); if (l2u) l2u.level2Referrals.push(id) } }
  const sid = uid(); sessions.set(sid, id)
  return c.json({ success:true, sessionId:sid, user:{ id, username, balance:10, referralCode:newUser.referralCode, depositAddress:newUser.depositAddress } })
})

app.post('/api/login', async (c) => {
  const { username, password } = await c.req.json()
  const user = [...users.values()].find(u => u.username===username && u.password===password)
  if (!user) return c.json({ error: 'INVALID_CRED' }, 401)
  const sid = uid(); sessions.set(sid, user.id)
  return c.json({ success:true, sessionId:sid, user:{ id:user.id, username:user.username, balance:user.balance, referralCode:user.referralCode, referralEarnings:user.referralEarnings, level1Count:user.level1Referrals.length, level2Count:user.level2Referrals.length, depositAddress:user.depositAddress } })
})

app.post('/api/logout', async (c) => { sessions.delete(c.req.header('X-Session-Id')||''); return c.json({success:true}) })

app.get('/api/me', async (c) => {
  const user = getU(c.req.header('X-Session-Id')||'')
  if (!user) return c.json({ error:'UNAUTH' }, 401)
  return c.json({ id:user.id, username:user.username, balance:user.balance, referralCode:user.referralCode, referralEarnings:user.referralEarnings, totalEarned:user.totalEarned, level1Count:user.level1Referrals.length, level2Count:user.level2Referrals.length, depositAddress:user.depositAddress, totalDeposit:user.totalDeposit, totalWithdraw:user.totalWithdraw })
})

// 가상 입금 처리 (데모용)
app.post('/api/deposit', async (c) => {
  const user = getU(c.req.header('X-Session-Id')||'')
  if (!user) return c.json({ error:'UNAUTH' }, 401)
  const { amount } = await c.req.json()
  if (!amount || amount < 1) return c.json({ error:'INVALID_AMOUNT' }, 400)
  user.balance      += parseFloat(amount)
  user.totalDeposit += parseFloat(amount)
  return c.json({ success:true, balance:user.balance })
})

// 가상 출금 처리 (데모용)
app.post('/api/withdraw', async (c) => {
  const user = getU(c.req.header('X-Session-Id')||'')
  if (!user) return c.json({ error:'UNAUTH' }, 401)
  const { amount, address } = await c.req.json()
  if (!amount || amount < 1)      return c.json({ error:'MIN_WITHDRAW' }, 400)
  if (amount > user.balance)      return c.json({ error:'INSUFFICIENT' }, 400)
  if (!address || address.length < 10) return c.json({ error:'INVALID_ADDR' }, 400)
  user.balance       -= parseFloat(amount)
  user.totalWithdraw += parseFloat(amount)
  return c.json({ success:true, balance:user.balance, txHash:'0x'+uid()+uid() })
})

app.get('/api/round/current', async (c) => {
  const { phase, timeLeft, idx } = getPhase()
  const round = await ensureRound(idx)
  return c.json({ id:round.id, phase, status:phase==='betting'?'betting':'finished', timeLeft, serverSeedHash:round.serverSeedHash, blockHeight:round.blockHeight, totalOdd:round.totalOdd, totalEven:round.totalEven, betCount:round.bets.length, result:round.result, hashValue:round.hashValue, serverSeed:phase==='result'?round.serverSeed:null, recentBets:round.bets.slice(-10).map(b=>({ username:b.username.substring(0,2)+'**', choice:b.choice, amount:b.amount, timestamp:b.timestamp })) })
})

app.post('/api/bet', async (c) => {
  const user = getU(c.req.header('X-Session-Id')||'')
  if (!user) return c.json({ error:'UNAUTH' }, 401)
  const { phase, idx } = getPhase()
  if (phase !== 'betting') return c.json({ error:'NOT_BETTING' }, 400)
  const round = await ensureRound(idx)
  const { choice, amount } = await c.req.json()
  if (choice!=='odd'&&choice!=='even') return c.json({ error:'INVALID_CHOICE' }, 400)
  if (!amount || amount < 0.1)         return c.json({ error:'MIN_BET' }, 400)
  if (amount > 1000)                   return c.json({ error:'MAX_BET' }, 400)
  if (amount > user.balance)           return c.json({ error:'INSUFFICIENT' }, 400)
  if (round.bets.find(b=>b.userId===user.id)) return c.json({ error:'ALREADY_BET' }, 400)
  user.balance = Math.round((user.balance - amount)*100)/100
  const bet: Bet = { userId:user.id, username:user.username, choice, amount, timestamp:Date.now() }
  round.bets.push(bet)
  if (choice==='odd') round.totalOdd  = Math.round((round.totalOdd+amount)*100)/100
  else                round.totalEven = Math.round((round.totalEven+amount)*100)/100
  return c.json({ success:true, balance:user.balance, bet:{ choice, amount, roundId:round.id, serverSeedHash:round.serverSeedHash } })
})

app.get('/api/history', async (c) => {
  return c.json({ history:gameHistory.slice(0,30), stats:{ totalGames:gameHistory.length, oddWins:gameHistory.filter(h=>h.result==='odd').length, evenWins:gameHistory.filter(h=>h.result==='even').length, totalBetAmount, totalPayoutAmount, houseProfit:Math.max(0,houseProfit), totalReferralPaid, userCount:users.size } })
})

app.get('/api/feed', async (c) => {
  return c.json({ recentBets:allBetHistory.slice(0,20).map(b=>({ username:b.username.substring(0,2)+'**', choice:b.choice, amount:b.amount, win:b.win, payout:b.payout, roundId:b.roundId, timestamp:b.timestamp })) })
})

app.get('/api/referral', async (c) => {
  const user = getU(c.req.header('X-Session-Id')||'')
  if (!user) return c.json({ error:'UNAUTH' }, 401)
  return c.json({ referralCode:user.referralCode, referralEarnings:user.referralEarnings, level1:{ count:user.level1Referrals.length, rate:'2.5%', users:user.level1Referrals.map(id=>{const u=users.get(id);return u?{username:u.username.substring(0,2)+'**',joinedAt:u.createdAt}:null}).filter(Boolean) }, level2:{ count:user.level2Referrals.length, rate:'1.0%' } })
})

app.post('/api/verify', async (c) => {
  const { serverSeed, blockHeight, userSeeds } = await c.req.json()
  const hash = await sha256(serverSeed + blockHeight + (userSeeds||''))
  return c.json({ hash, result:isOdd(hash)?'odd':'even', lastChar:hash[hash.length-1] })
})

app.get('/api/stats', async (c) => {
  const total=gameHistory.length, odd=gameHistory.filter(h=>h.result==='odd').length, even=total-odd
  return c.json({ totalGames:total, oddCount:odd, evenCount:even, oddRate:total>0?((odd/total)*100).toFixed(2):'50.00', evenRate:total>0?((even/total)*100).toFixed(2):'50.00', totalBetAmount, totalPayoutAmount, actualHouseEdge:totalBetAmount>0?(((totalBetAmount-totalPayoutAmount)/totalBetAmount)*100).toFixed(2):'0.00', userCount:users.size, houseProfit:Math.max(0,houseProfit), totalReferralPaid })
})

app.get('/api/time', async (c) => {
  const { phase, timeLeft, idx } = getPhase()
  return c.json({ serverTime:Date.now(), phase, timeLeft, idx })
})

// ─────────────────────────────────────────────
// 메인 HTML (다국어 + USDT)
// ─────────────────────────────────────────────
app.get('*', (c) => c.html(HTML))

const HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>🎲 ODD/EVEN - Blockchain Fair Game</title>
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&family=Noto+Sans+SC:wght@400;700;900&family=Noto+Sans+JP:wght@400;700;900&display=swap');
*{font-family:'Noto Sans KR','Noto Sans SC','Noto Sans JP',sans-serif}
body{background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);min-height:100vh}
.glass{background:rgba(255,255,255,0.06);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,0.12)}
.btn-odd{background:linear-gradient(135deg,#e53e3e,#c53030)}
.btn-odd:hover:not(:disabled){background:linear-gradient(135deg,#c53030,#9b2c2c);transform:scale(1.03)}
.btn-even{background:linear-gradient(135deg,#3182ce,#2b6cb0)}
.btn-even:hover:not(:disabled){background:linear-gradient(135deg,#2b6cb0,#2c5282);transform:scale(1.03)}
.tab-on{border-bottom:2px solid #63b3ed;color:#fff}
.tab-off{border-bottom:2px solid transparent;color:#9ca3af}
.lang-btn{padding:4px 10px;border-radius:6px;font-size:12px;font-weight:700;transition:all .2s;border:1px solid rgba(255,255,255,0.2)}
.lang-btn.active{background:rgba(99,179,237,0.3);border-color:#63b3ed;color:#63b3ed}
.lang-btn:not(.active){color:#9ca3af}
.lang-btn:hover{background:rgba(255,255,255,0.1)}
.pulse{animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
.slide{animation:slide .25s ease}
@keyframes slide{from{transform:translateY(-8px);opacity:0}to{transform:translateY(0);opacity:1}}
.usdt{color:#26a17b;font-weight:900}
.mono{font-family:monospace}
.badge-usdt{background:rgba(38,161,123,.2);border:1px solid rgba(38,161,123,.4);color:#26a17b;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:700}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18);border-radius:2px}
.ring-odd{box-shadow:0 0 24px rgba(229,62,62,.35)}
.ring-even{box-shadow:0 0 24px rgba(49,130,206,.35)}
.wallet-card{background:linear-gradient(135deg,rgba(38,161,123,.15),rgba(38,161,123,.05));border:1px solid rgba(38,161,123,.3)}
</style>
</head>
<body class="text-white">

<!-- 헤더 -->
<header class="sticky top-0 z-50 border-b border-white/10" style="background:rgba(10,8,30,.97);backdrop-filter:blur(20px)">
  <div class="max-w-6xl mx-auto px-3 py-2.5 flex items-center justify-between gap-3">
    <div class="flex items-center gap-2 shrink-0">
      <span class="text-xl">🎲</span>
      <div>
        <div class="font-black text-sm leading-tight">ODD/EVEN</div>
        <div class="text-xs text-green-400 flex items-center gap-1">
          <span class="w-1.5 h-1.5 bg-green-400 rounded-full pulse inline-block"></span>
          <span data-i18n="blockchain_fair">블록체인 공정</span>
        </div>
      </div>
    </div>
    <!-- 언어 선택 -->
    <div class="flex items-center gap-1">
      <button onclick="setLang('ko')" id="lang-ko" class="lang-btn active">🇰🇷 KO</button>
      <button onclick="setLang('en')" id="lang-en" class="lang-btn">🇺🇸 EN</button>
      <button onclick="setLang('zh')" id="lang-zh" class="lang-btn">🇨🇳 中</button>
      <button onclick="setLang('ja')" id="lang-ja" class="lang-btn">🇯🇵 JP</button>
    </div>
    <div id="hdrGuest" class="flex gap-1.5 shrink-0">
      <button onclick="showTab('login')"    class="px-3 py-1.5 text-xs border border-white/20 rounded-lg hover:bg-white/10 transition" data-i18n="login">로그인</button>
      <button onclick="showTab('register')" class="px-3 py-1.5 text-xs bg-blue-600 rounded-lg hover:bg-blue-700 transition" data-i18n="register">회원가입</button>
    </div>
    <div id="hdrUser" class="hidden items-center gap-2 shrink-0">
      <div class="text-right hidden sm:block">
        <div class="text-xs text-gray-400" id="hdrName">-</div>
        <div class="font-black text-sm usdt" id="hdrBal">0 USDT</div>
      </div>
      <button onclick="logout()" class="px-3 py-1.5 text-xs border border-white/20 rounded-lg hover:bg-white/10 transition" data-i18n="logout">로그아웃</button>
    </div>
  </div>
</header>

<!-- 탭 -->
<nav class="border-b border-white/10 bg-black/30 overflow-x-auto">
  <div class="max-w-6xl mx-auto px-3 flex whitespace-nowrap">
    <button onclick="showTab('game')"      id="t-game"      class="tab-off px-4 py-2.5 text-xs font-bold transition" data-i18n="tab_game">🎲 게임</button>
    <button onclick="showTab('wallet')"    id="t-wallet"    class="tab-off px-4 py-2.5 text-xs font-bold transition" data-i18n="tab_wallet">💰 지갑</button>
    <button onclick="showTab('dashboard')" id="t-dashboard" class="tab-off px-4 py-2.5 text-xs font-bold transition" data-i18n="tab_dashboard">📊 투명성</button>
    <button onclick="showTab('referral')"  id="t-referral"  class="tab-off px-4 py-2.5 text-xs font-bold transition" data-i18n="tab_referral">👥 추천수당</button>
    <button onclick="showTab('verify')"    id="t-verify"    class="tab-off px-4 py-2.5 text-xs font-bold transition" data-i18n="tab_verify">🔍 검증</button>
    <button onclick="showTab('login')"     id="t-login"     class="tab-off px-4 py-2.5 text-xs font-bold transition" data-i18n="login">🔐 로그인</button>
    <button onclick="showTab('register')"  id="t-register"  class="tab-off px-4 py-2.5 text-xs font-bold transition" data-i18n="register">✍️ 가입</button>
  </div>
</nav>

<main class="max-w-6xl mx-auto px-3 py-4">

<!-- ══ 게임 탭 ══ -->
<div id="p-game" class="hidden">
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <div class="lg:col-span-2 space-y-4">

      <!-- 라운드 카드 -->
      <div class="glass rounded-2xl p-5">
        <div class="flex items-start justify-between mb-3">
          <div>
            <div class="text-xs text-gray-400" data-i18n="round">라운드</div>
            <div class="text-2xl font-black" id="gRoundId">#-</div>
            <div class="text-xs text-gray-500 mono" id="gBlock">Block #-</div>
          </div>
          <div class="text-center">
            <div id="gPhaseBadge" class="inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 mb-1"></div>
            <div class="text-5xl font-black leading-none" id="gTimer">30</div>
            <div class="text-xs text-gray-400 mt-0.5" data-i18n="sec_left">초 남음</div>
          </div>
          <div class="text-right">
            <div class="text-xs text-gray-400" data-i18n="payout">배당</div>
            <div class="text-2xl font-black text-green-400">1.90x</div>
            <div class="badge-usdt">USDT</div>
          </div>
        </div>
        <div class="w-full bg-white/10 rounded-full h-1.5 mb-3">
          <div id="gBar" class="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000" style="width:100%"></div>
        </div>
        <div class="bg-black/40 rounded-xl p-3 border border-green-500/20">
          <div class="flex items-center gap-2 mb-1">
            <i class="fas fa-lock text-green-400 text-xs"></i>
            <span class="text-green-400 text-xs font-bold" data-i18n="seed_hash_label">사전 공개 서버시드 해시</span>
          </div>
          <div class="mono text-xs text-gray-300 break-all" id="gSeedHash">-</div>
          <div class="text-xs text-gray-500 mt-1" data-i18n="seed_desc">베팅 전에 봉인 — 수학적으로 조작 불가</div>
        </div>
      </div>

      <!-- 베팅 -->
      <div class="glass rounded-2xl p-5">
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-center">
            <div class="text-red-400 font-bold text-sm mb-1">🔴 <span data-i18n="odd">홀 (ODD)</span></div>
            <div class="text-xl font-black" id="gTotalOdd">0 USDT</div>
            <div class="text-xs text-gray-400 mt-0.5" id="gOddBetters">0 <span data-i18n="players">명</span></div>
          </div>
          <div class="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-center">
            <div class="text-blue-400 font-bold text-sm mb-1">🔵 <span data-i18n="even">짝 (EVEN)</span></div>
            <div class="text-xl font-black" id="gTotalEven">0 USDT</div>
            <div class="text-xs text-gray-400 mt-0.5" id="gEvenBetters">0 <span data-i18n="players">명</span></div>
          </div>
        </div>

        <div id="betArea">
          <div class="mb-3">
            <label class="text-xs text-gray-400 block mb-1.5" data-i18n="bet_amount_label">베팅 금액 (USDT, 최소 0.1)</label>
            <input type="number" id="betAmt" placeholder="0.00 USDT" min="0.1" max="1000" step="0.1"
              class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-lg font-black focus:outline-none focus:border-green-400 placeholder-gray-600">
            <div class="flex gap-1.5 mt-2 flex-wrap">
              <button onclick="addBet(1)"    class="px-2 py-1 text-xs bg-white/10 rounded-lg hover:bg-white/20 transition">+1</button>
              <button onclick="addBet(5)"    class="px-2 py-1 text-xs bg-white/10 rounded-lg hover:bg-white/20 transition">+5</button>
              <button onclick="addBet(10)"   class="px-2 py-1 text-xs bg-white/10 rounded-lg hover:bg-white/20 transition">+10</button>
              <button onclick="addBet(50)"   class="px-2 py-1 text-xs bg-white/10 rounded-lg hover:bg-white/20 transition">+50</button>
              <button onclick="addBet(100)"  class="px-2 py-1 text-xs bg-white/10 rounded-lg hover:bg-white/20 transition">+100</button>
              <button onclick="maxBet()"     class="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition">MAX</button>
              <button onclick="clearBet()"   class="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition" data-i18n="clear">초기화</button>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <button onclick="doBet('odd')" id="btnOdd" class="btn-odd ring-odd text-white font-black text-xl py-5 rounded-xl transition active:scale-95 shadow-lg">
              🔴 <span data-i18n="odd_bet">홀 베팅</span>
            </button>
            <button onclick="doBet('even')" id="btnEven" class="btn-even ring-even text-white font-black text-xl py-5 rounded-xl transition active:scale-95 shadow-lg">
              🔵 <span data-i18n="even_bet">짝 베팅</span>
            </button>
          </div>
          <div id="needLogin" class="hidden text-center py-2 text-xs text-gray-400 mt-2">
            <a onclick="showTab('login')" class="text-blue-400 cursor-pointer hover:underline" data-i18n="login">로그인</a>
            <span data-i18n="after_login_bet"> 후 베팅 가능</span>
          </div>
        </div>

        <div id="resultBox" class="hidden text-center py-5">
          <div class="text-6xl mb-2" id="resEmoji">-</div>
          <div class="text-3xl font-black mb-1" id="resText">-</div>
          <div class="text-sm mb-2" id="resDetail">-</div>
          <div class="mono text-xs text-gray-500 break-all" id="resHash">-</div>
          <div class="text-xs text-green-400 mt-2"><span data-i18n="next_round">다음 라운드</span> <span id="resNext">-</span><span data-i18n="sec_unit">초</span></div>
        </div>
      </div>
    </div>

    <!-- 사이드 -->
    <div class="space-y-4">
      <div class="glass rounded-2xl p-4">
        <div class="text-sm font-bold text-gray-300 mb-2" data-i18n="my_info">💼 내 정보</div>
        <div id="sideGuest" class="text-center py-3">
          <div class="text-gray-500 text-xs mb-2" data-i18n="need_login">로그인이 필요합니다</div>
          <button onclick="showTab('login')" class="px-4 py-2 bg-blue-600 rounded-lg text-xs hover:bg-blue-700 transition" data-i18n="login">로그인</button>
        </div>
        <div id="sideUser" class="hidden space-y-2">
          <div class="flex justify-between"><span class="text-gray-400 text-xs" data-i18n="balance">잔액</span><span class="font-black usdt text-sm" id="siBal">0 USDT</span></div>
          <div class="flex justify-between"><span class="text-gray-400 text-xs" data-i18n="ref_earnings">추천수당</span><span class="font-bold text-green-400 text-xs" id="siRef">0 USDT</span></div>
          <div class="flex justify-between"><span class="text-gray-400 text-xs" data-i18n="level1">1단계</span><span class="font-bold text-blue-400 text-xs" id="siL1">0</span></div>
          <div class="flex justify-between"><span class="text-gray-400 text-xs" data-i18n="level2">2단계</span><span class="font-bold text-purple-400 text-xs" id="siL2">0</span></div>
          <div class="pt-2 border-t border-white/10">
            <div class="text-xs text-gray-400 mb-1" data-i18n="ref_code">추천코드</div>
            <div class="flex gap-1.5">
              <div class="flex-1 bg-black/30 rounded-lg px-2 py-1.5 mono text-yellow-400 font-black text-sm" id="siCode">-</div>
              <button onclick="copyCode()" class="px-2 py-1.5 bg-blue-600/30 rounded-lg text-xs hover:bg-blue-600/50 transition">📋</button>
            </div>
          </div>
          <button onclick="showTab('wallet')" class="w-full py-2 mt-1 bg-green-600/20 border border-green-600/30 rounded-xl text-xs text-green-400 hover:bg-green-600/30 transition font-bold" data-i18n="deposit_withdraw">💰 입금 / 출금</button>
        </div>
      </div>

      <div class="glass rounded-2xl p-4">
        <div class="text-xs font-bold text-gray-300 mb-2" data-i18n="recent_results">🎯 최근 결과</div>
        <div id="recentRes" class="flex flex-wrap gap-1"><span class="text-xs text-gray-500" data-i18n="no_record">기록 없음</span></div>
      </div>

      <div class="glass rounded-2xl p-4">
        <div class="text-xs font-bold text-gray-300 mb-2" data-i18n="live_feed">📡 실시간 베팅</div>
        <div id="liveFeed" class="space-y-1 max-h-52 overflow-y-auto">
          <div class="text-xs text-gray-500 text-center py-2" data-i18n="no_bets">베팅 내역 없음</div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ══ 지갑 탭 ══ -->
<div id="p-wallet" class="hidden">
  <div class="mb-4"><h2 class="text-xl font-black mb-1" data-i18n="wallet_title">💰 USDT 지갑</h2><p class="text-gray-400 text-sm" data-i18n="wallet_desc">TRC20 (TRON) 네트워크 기반 USDT 입출금</p></div>
  <div id="walletNeedLogin" class="glass rounded-xl p-8 text-center">
    <div class="text-gray-400 mb-3 text-sm" data-i18n="need_login">로그인이 필요합니다</div>
    <button onclick="showTab('login')" class="px-6 py-2 bg-blue-600 rounded-xl hover:bg-blue-700 transition text-sm font-bold" data-i18n="login">로그인</button>
  </div>
  <div id="walletInfo" class="hidden space-y-4">
    <!-- 잔액 카드 -->
    <div class="wallet-card rounded-2xl p-5">
      <div class="flex items-center justify-between mb-3">
        <div>
          <div class="text-xs text-gray-400 mb-1" data-i18n="total_balance">총 잔액</div>
          <div class="text-4xl font-black usdt" id="wBal">0.00 USDT</div>
        </div>
        <div class="text-4xl opacity-50">₮</div>
      </div>
      <div class="grid grid-cols-2 gap-3 text-center">
        <div class="bg-black/20 rounded-xl p-3">
          <div class="text-xs text-gray-400 mb-1" data-i18n="total_deposit">총 입금</div>
          <div class="font-bold text-green-400 text-sm" id="wTotalDep">0 USDT</div>
        </div>
        <div class="bg-black/20 rounded-xl p-3">
          <div class="text-xs text-gray-400 mb-1" data-i18n="total_withdraw">총 출금</div>
          <div class="font-bold text-red-400 text-sm" id="wTotalWd">0 USDT</div>
        </div>
      </div>
    </div>

    <!-- 입금 섹션 -->
    <div class="glass rounded-2xl p-5">
      <div class="font-bold mb-3 text-green-400" data-i18n="deposit_title">📥 USDT 입금</div>
      <div class="bg-black/30 border border-green-500/30 rounded-xl p-4 mb-3">
        <div class="text-xs text-gray-400 mb-1" data-i18n="deposit_addr">입금 주소 (TRC20)</div>
        <div class="mono text-xs text-green-400 break-all font-bold" id="wDepAddr">-</div>
        <button onclick="copyAddr()" class="mt-2 px-3 py-1.5 bg-green-600/20 border border-green-600/30 rounded-lg text-xs text-green-400 hover:bg-green-600/30 transition" data-i18n="copy_addr">📋 주소 복사</button>
      </div>
      <div class="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-xs text-yellow-400 mb-3">
        <i class="fas fa-exclamation-triangle mr-1"></i>
        <span data-i18n="deposit_warning">반드시 TRC20(TRON) 네트워크로 입금하세요. 다른 네트워크 입금 시 손실됩니다.</span>
      </div>
      <!-- 데모 입금 -->
      <div class="border-t border-white/10 pt-3">
        <div class="text-xs text-gray-400 mb-2" data-i18n="demo_deposit">🧪 데모 입금 (테스트용)</div>
        <div class="flex gap-2">
          <input type="number" id="demoDepAmt" placeholder="10" min="1" step="1" class="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-400">
          <span class="flex items-center text-xs text-gray-400">USDT</span>
          <button onclick="demoDeposit()" class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-bold transition" data-i18n="deposit_btn">입금</button>
        </div>
      </div>
    </div>

    <!-- 출금 섹션 -->
    <div class="glass rounded-2xl p-5">
      <div class="font-bold mb-3 text-red-400" data-i18n="withdraw_title">📤 USDT 출금</div>
      <div class="space-y-3">
        <div>
          <label class="text-xs text-gray-400 block mb-1" data-i18n="withdraw_addr">출금 주소 (TRC20)</label>
          <input type="text" id="wdAddr" placeholder="T..." class="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm mono focus:outline-none focus:border-red-400">
        </div>
        <div>
          <label class="text-xs text-gray-400 block mb-1" data-i18n="withdraw_amount">출금 금액 (USDT, 최소 1)</label>
          <div class="flex gap-2">
            <input type="number" id="wdAmt" placeholder="0.00" min="1" step="0.01" class="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-red-400">
            <button onclick="setMaxWd()" class="px-3 py-2 bg-white/10 rounded-lg text-xs hover:bg-white/20 transition">MAX</button>
          </div>
        </div>
        <div class="bg-black/20 rounded-lg p-2 text-xs text-gray-400 flex justify-between">
          <span data-i18n="withdraw_fee">수수료</span><span class="text-white">1 USDT (네트워크 수수료)</span>
        </div>
        <div id="wdErr" class="hidden text-red-400 text-xs bg-red-500/10 rounded-lg p-2"></div>
        <div id="wdOk" class="hidden text-green-400 text-xs bg-green-500/10 rounded-lg p-2"></div>
        <button onclick="doWithdraw()" class="w-full py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold transition text-sm" data-i18n="withdraw_btn">출금 신청</button>
      </div>
    </div>

    <!-- 본사 USDT 보관 안내 -->
    <div class="glass rounded-2xl p-5">
      <div class="font-bold mb-3" data-i18n="house_wallet_title">🏦 본사 USDT 보관 방법</div>
      <div class="space-y-2 text-sm">
        <div class="flex items-start gap-3 p-3 bg-black/20 rounded-xl">
          <span class="text-2xl">🔐</span>
          <div><div class="font-bold text-green-400 text-xs mb-0.5" data-i18n="hw1_title">하드웨어 지갑 (Ledger)</div><div class="text-gray-400 text-xs" data-i18n="hw1_desc">대규모 장기 보관 — 오프라인 보안 최강</div></div>
        </div>
        <div class="flex items-start gap-3 p-3 bg-black/20 rounded-xl">
          <span class="text-2xl">🏪</span>
          <div><div class="font-bold text-yellow-400 text-xs mb-0.5" data-i18n="hw2_title">거래소 지갑 (Binance/OKX)</div><div class="text-gray-400 text-xs" data-i18n="hw2_desc">운영 자금 보관 — 빠른 출금 처리용</div></div>
        </div>
        <div class="flex items-start gap-3 p-3 bg-black/20 rounded-xl">
          <span class="text-2xl">🔑</span>
          <div><div class="font-bold text-blue-400 text-xs mb-0.5" data-i18n="hw3_title">멀티시그 지갑</div><div class="text-gray-400 text-xs" data-i18n="hw3_desc">2/3 서명 필요 — 단독 인출 불가 최고 보안</div></div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ══ 투명성 탭 ══ -->
<div id="p-dashboard" class="hidden">
  <div class="mb-4"><h2 class="text-xl font-black mb-1" data-i18n="dash_title">📊 투명성 대시보드</h2><p class="text-gray-400 text-sm" data-i18n="dash_desc">모든 데이터 실시간 공개 — 숨기는 것 없음</p></div>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
    <div class="glass rounded-xl p-3 text-center"><div class="text-2xl font-black text-blue-400" id="dTotalGames">0</div><div class="text-xs text-gray-400 mt-1" data-i18n="total_games">총 게임</div></div>
    <div class="glass rounded-xl p-3 text-center"><div class="text-2xl font-black text-green-400" id="dUserRate">-</div><div class="text-xs text-gray-400 mt-1" data-i18n="user_rate">유저 수익률</div></div>
    <div class="glass rounded-xl p-3 text-center"><div class="text-2xl font-black text-yellow-400" id="dOddRate">-</div><div class="text-xs text-gray-400 mt-1" data-i18n="odd_rate">홀 당첨률</div></div>
    <div class="glass rounded-xl p-3 text-center"><div class="text-2xl font-black text-purple-400" id="dUsers">0</div><div class="text-xs text-gray-400 mt-1" data-i18n="total_users">유저수</div></div>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
    <div class="glass rounded-xl p-4">
      <div class="font-bold mb-3 text-sm" data-i18n="profit_structure">💰 수익 배분 구조</div>
      <div class="space-y-2.5">
        <div><div class="flex justify-between text-xs mb-1"><span class="text-gray-300" data-i18n="user_payout">유저 배당</span><span class="text-green-400 font-black">90.0%</span></div><div class="w-full bg-white/10 rounded-full h-2.5"><div class="h-2.5 rounded-full bg-green-500" style="width:90%"></div></div></div>
        <div><div class="flex justify-between text-xs mb-1"><span class="text-gray-300" data-i18n="l1_reward">1단계 추천수당</span><span class="text-blue-400 font-black">2.5%</span></div><div class="w-full bg-white/10 rounded-full h-2.5"><div class="h-2.5 rounded-full bg-blue-500" style="width:25%"></div></div></div>
        <div><div class="flex justify-between text-xs mb-1"><span class="text-gray-300" data-i18n="l2_reward">2단계 추천수당</span><span class="text-purple-400 font-black">1.0%</span></div><div class="w-full bg-white/10 rounded-full h-2.5"><div class="h-2.5 rounded-full bg-purple-500" style="width:10%"></div></div></div>
        <div><div class="flex justify-between text-xs mb-1"><span class="text-gray-300" data-i18n="house_net">본사 순수익</span><span class="text-yellow-400 font-black">6.5%</span></div><div class="w-full bg-white/10 rounded-full h-2.5"><div class="h-2.5 rounded-full bg-yellow-500" style="width:65%"></div></div></div>
      </div>
    </div>
    <div class="glass rounded-xl p-4">
      <div class="font-bold mb-3 text-sm" data-i18n="realtime_stats">📈 실시간 통계</div>
      <div class="space-y-2 text-xs">
        <div class="flex justify-between"><span class="text-gray-400" data-i18n="total_bet">총 베팅</span><span class="font-bold usdt" id="dTotalBet">0 USDT</span></div>
        <div class="flex justify-between"><span class="text-gray-400" data-i18n="total_payout">총 지급</span><span class="font-bold text-green-400" id="dTotalPayout">0 USDT</span></div>
        <div class="flex justify-between"><span class="text-gray-400" data-i18n="ref_paid">추천수당 지급</span><span class="font-bold text-blue-400" id="dRefPaid">0 USDT</span></div>
        <div class="flex justify-between"><span class="text-gray-400" data-i18n="actual_edge">실제 엣지</span><span class="font-bold text-yellow-400" id="dActualEdge">0%</span></div>
        <div class="flex justify-between"><span class="text-gray-400" data-i18n="theory_edge">이론 엣지</span><span class="font-bold text-gray-300">10.00%</span></div>
        <div class="flex justify-between border-t border-white/10 pt-1.5"><span class="text-gray-400" data-i18n="house_profit">본사 수익</span><span class="font-bold text-yellow-400" id="dHouseProfit">0 USDT</span></div>
      </div>
    </div>
  </div>
  <div class="glass rounded-xl p-4 mb-4">
    <div class="font-bold mb-3 text-sm" data-i18n="dist_title">🎯 홀짝 분포</div>
    <div class="grid grid-cols-2 gap-4">
      <div><div class="flex justify-between mb-1 text-xs"><span class="text-red-400 font-bold" data-i18n="odd">홀</span><span class="text-red-400" id="dOddCnt">0</span></div><div class="w-full bg-white/10 rounded-full h-3"><div id="dOddBar" class="h-3 rounded-full bg-red-500 transition-all" style="width:50%"></div></div><div class="text-xs text-gray-400 mt-0.5" id="dOddPct">50%</div></div>
      <div><div class="flex justify-between mb-1 text-xs"><span class="text-blue-400 font-bold" data-i18n="even">짝</span><span class="text-blue-400" id="dEvenCnt">0</span></div><div class="w-full bg-white/10 rounded-full h-3"><div id="dEvenBar" class="h-3 rounded-full bg-blue-500 transition-all" style="width:50%"></div></div><div class="text-xs text-gray-400 mt-0.5" id="dEvenPct">50%</div></div>
    </div>
  </div>
  <div class="glass rounded-xl p-4">
    <div class="font-bold mb-3 text-sm" data-i18n="game_history">📜 게임 기록</div>
    <div class="overflow-x-auto"><table class="w-full text-xs"><thead><tr class="text-gray-400 border-b border-white/10 text-left"><th class="py-1.5 px-2" data-i18n="round">라운드</th><th class="py-1.5 px-2" data-i18n="result">결과</th><th class="py-1.5 px-2" data-i18n="hash">해시</th><th class="py-1.5 px-2 text-right" data-i18n="total_bet">베팅</th><th class="py-1.5 px-2 text-right" data-i18n="time">시간</th></tr></thead><tbody id="dHistTbl"><tr><td colspan="5" class="text-center text-gray-500 py-3" data-i18n="no_record">기록 없음</td></tr></tbody></table></div>
  </div>
</div>

<!-- ══ 추천수당 탭 ══ -->
<div id="p-referral" class="hidden">
  <div class="mb-4"><h2 class="text-xl font-black mb-1" data-i18n="ref_title">👥 추천인 수당 시스템</h2><p class="text-gray-400 text-sm" data-i18n="ref_desc">친구 초대 → 베팅 때마다 자동 USDT 수당</p></div>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
    <div class="glass rounded-xl p-4 text-center border border-blue-500/30"><div class="text-3xl mb-1">👤</div><div class="text-blue-400 font-black text-2xl">2.5%</div><div class="font-bold text-sm my-1" data-i18n="l1_title">1단계 수당</div><div class="text-xs text-gray-400" data-i18n="l1_desc">직접 초대 친구 베팅금의 2.5% 자동 지급</div></div>
    <div class="glass rounded-xl p-4 text-center border border-purple-500/30"><div class="text-3xl mb-1">👥</div><div class="text-purple-400 font-black text-2xl">1.0%</div><div class="font-bold text-sm my-1" data-i18n="l2_title">2단계 수당</div><div class="text-xs text-gray-400" data-i18n="l2_desc">친구가 초대한 친구 베팅금의 1.0% 자동 지급</div></div>
    <div class="glass rounded-xl p-4 text-center border border-green-500/30"><div class="text-3xl mb-1">♾️</div><div class="text-green-400 font-black text-2xl" data-i18n="unlimited">무제한</div><div class="font-bold text-sm my-1" data-i18n="no_limit">수당 상한 없음</div><div class="text-xs text-gray-400" data-i18n="no_limit_desc">인원·베팅액 비례 무한 수익</div></div>
  </div>
  <div id="refNeedLogin" class="glass rounded-xl p-6 text-center">
    <div class="text-gray-400 text-sm mb-3" data-i18n="need_login">로그인이 필요합니다</div>
    <button onclick="showTab('login')" class="px-6 py-2 bg-blue-600 rounded-xl hover:bg-blue-700 transition font-bold text-sm" data-i18n="login">로그인</button>
  </div>
  <div id="refInfo" class="hidden space-y-4">
    <div class="glass rounded-xl p-4">
      <div class="font-bold mb-2 text-sm" data-i18n="my_ref_code">🎁 내 추천코드</div>
      <div class="flex gap-2 items-center mb-2">
        <div class="flex-1 bg-black/40 border border-yellow-500/30 rounded-xl px-4 py-3 mono text-2xl font-black text-yellow-400 text-center" id="rCode">-</div>
        <div class="flex flex-col gap-1.5">
          <button onclick="copyCode()" class="px-3 py-2 bg-yellow-600/30 border border-yellow-600/50 rounded-xl text-xs hover:bg-yellow-600/50 transition">📋</button>
          <button onclick="shareRef()" class="px-3 py-2 bg-green-600/30 border border-green-600/50 rounded-xl text-xs hover:bg-green-600/50 transition">📤</button>
        </div>
      </div>
      <div class="text-xs text-gray-400 break-all"><span data-i18n="ref_link">추천링크</span>: <span class="text-blue-400" id="rLink">-</span></div>
    </div>
    <div class="grid grid-cols-3 gap-3">
      <div class="glass rounded-xl p-3 text-center"><div class="text-lg font-black usdt" id="rEarnings">0</div><div class="text-xs text-gray-400 mt-0.5" data-i18n="total_ref_earn">총 수당(USDT)</div></div>
      <div class="glass rounded-xl p-3 text-center"><div class="text-lg font-black text-blue-400" id="rL1Cnt">0</div><div class="text-xs text-gray-400 mt-0.5" data-i18n="l1_count">1단계</div></div>
      <div class="glass rounded-xl p-3 text-center"><div class="text-lg font-black text-purple-400" id="rL2Cnt">0</div><div class="text-xs text-gray-400 mt-0.5" data-i18n="l2_count">2단계</div></div>
    </div>
    <div class="glass rounded-xl p-4">
      <div class="font-bold mb-3 text-sm" data-i18n="simulator">🧮 수익 시뮬레이터</div>
      <div class="grid grid-cols-2 gap-2 mb-3">
        <div><label class="text-xs text-gray-400 block mb-1" data-i18n="sim_l1">1단계 수</label><input type="number" id="sL1" value="10" min="1" oninput="calcSim()" class="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-sm"></div>
        <div><label class="text-xs text-gray-400 block mb-1" data-i18n="sim_l2">2단계 수</label><input type="number" id="sL2" value="30" min="0" oninput="calcSim()" class="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-sm"></div>
        <div><label class="text-xs text-gray-400 block mb-1" data-i18n="sim_bet">1인 일 베팅(USDT)</label><input type="number" id="sBet" value="50" min="1" step="1" oninput="calcSim()" class="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-sm"></div>
        <div><label class="text-xs text-gray-400 block mb-1" data-i18n="sim_times">일 참여 횟수</label><input type="number" id="sTimes" value="20" min="1" oninput="calcSim()" class="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-sm"></div>
      </div>
      <div class="bg-black/30 rounded-xl p-3 grid grid-cols-3 gap-2 text-center">
        <div><div class="text-xs text-gray-400 mb-0.5" data-i18n="daily_earn">일 수익</div><div class="font-black usdt text-sm" id="sDayE">0</div></div>
        <div><div class="text-xs text-gray-400 mb-0.5" data-i18n="monthly_earn">월 수익</div><div class="font-black text-green-400 text-sm" id="sMonE">0</div></div>
        <div><div class="text-xs text-gray-400 mb-0.5" data-i18n="yearly_earn">연 수익</div><div class="font-black text-blue-400 text-sm" id="sYrE">0</div></div>
      </div>
    </div>
  </div>
</div>

<!-- ══ 검증 탭 ══ -->
<div id="p-verify" class="hidden">
  <div class="mb-4"><h2 class="text-xl font-black mb-1" data-i18n="verify_title">🔍 공정성 직접 검증</h2><p class="text-gray-400 text-sm" data-i18n="verify_desc">결과가 조작되지 않았음을 수학적으로 확인</p></div>
  <div class="glass rounded-xl p-4 mb-4">
    <div class="font-bold mb-3 text-sm" data-i18n="system_title">🔐 하이브리드 공정성 시스템</div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
      <div class="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3"><div class="text-blue-400 font-bold mb-1 text-xs" data-i18n="v1_title">① 서버 시드</div><div class="text-xs text-gray-400" data-i18n="v1_desc">라운드 전 SHA256 해시 공개. 종료 후 원본 공개→변조 불가 증명.</div></div>
      <div class="bg-green-500/10 border border-green-500/20 rounded-xl p-3"><div class="text-green-400 font-bold mb-1 text-xs" data-i18n="v2_title">② 유저 시드</div><div class="text-xs text-gray-400" data-i18n="v2_desc">참여자 ID 합산. 본사가 사전에 알 수 없어 조작 원천 차단.</div></div>
      <div class="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3"><div class="text-yellow-400 font-bold mb-1 text-xs" data-i18n="v3_title">③ 블록 높이</div><div class="text-xs text-gray-400" data-i18n="v3_desc">비트코인 블록높이 추가 난수 소스. 외부 검증 가능.</div></div>
    </div>
    <div class="bg-black/30 rounded-xl p-3 text-xs mono">
      <div class="text-gray-400 mb-1" data-i18n="formula">공식:</div>
      <div class="text-green-400">hash = SHA256(serverSeed + blockHeight + userSeeds)</div>
      <div class="text-yellow-400 mt-1" data-i18n="last_char_rule">마지막자리 홀수→ODD / 짝수→EVEN</div>
    </div>
  </div>
  <div class="glass rounded-xl p-4 mb-4">
    <div class="font-bold mb-3 text-sm" data-i18n="verify_tool">🧮 직접 검증</div>
    <div class="space-y-2 mb-3">
      <div><label class="text-xs text-gray-400 block mb-1" data-i18n="server_seed">서버시드</label><input type="text" id="vSeed" class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white mono text-xs focus:outline-none focus:border-blue-400"></div>
      <div><label class="text-xs text-gray-400 block mb-1" data-i18n="block_height">블록 높이</label><input type="text" id="vBlock" class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white mono text-xs focus:outline-none focus:border-blue-400"></div>
      <div><label class="text-xs text-gray-400 block mb-1" data-i18n="user_seed_opt">유저시드 (선택)</label><input type="text" id="vUser" class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white mono text-xs focus:outline-none focus:border-blue-400"></div>
      <button onclick="doVerify()" class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition text-sm" data-i18n="verify_btn">🔍 검증하기</button>
    </div>
    <div id="vResult" class="hidden bg-black/30 rounded-xl p-3 space-y-1.5 text-xs">
      <div class="text-gray-400"><span data-i18n="hash_val">해시</span>: <span id="vHash" class="text-green-400 mono break-all">-</span></div>
      <div class="text-gray-400"><span data-i18n="last_char">마지막자리</span>: <span id="vLast" class="text-yellow-400 mono">-</span></div>
      <div class="text-lg font-black" id="vFinal">-</div>
    </div>
  </div>
  <div class="glass rounded-xl p-4">
    <div class="font-bold mb-3 text-sm" data-i18n="recent_verify">📋 최근 라운드 검증</div>
    <div id="vHistory" class="space-y-2"><div class="text-gray-500 text-xs text-center py-3" data-i18n="no_record">기록 없음</div></div>
  </div>
</div>

<!-- ══ 로그인 탭 ══ -->
<div id="p-login" class="hidden">
  <div class="max-w-sm mx-auto">
    <div class="glass rounded-2xl p-7">
      <div class="text-center mb-5"><div class="text-4xl mb-2">🔐</div><h2 class="text-xl font-black" data-i18n="login">로그인</h2></div>
      <form onsubmit="event.preventDefault();doLogin()" class="space-y-3">
        <div><label class="text-xs text-gray-400 block mb-1" data-i18n="username">아이디</label><input type="text" id="lUser" autocomplete="username" class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-400 text-sm"></div>
        <div><label class="text-xs text-gray-400 block mb-1" data-i18n="password">비밀번호</label><input type="password" id="lPass" autocomplete="current-password" class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-400 text-sm"></div>
        <div id="lErr" class="hidden text-red-400 text-xs text-center bg-red-500/10 rounded-lg py-2"></div>
        <button type="submit" class="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-black transition" data-i18n="login">로그인</button>
        <div class="text-center text-xs text-gray-400"><span data-i18n="no_account">계정 없음?</span> <a onclick="showTab('register')" class="text-blue-400 cursor-pointer hover:underline" data-i18n="register">회원가입</a></div>
        <div class="border-t border-white/10 pt-3">
          <div class="text-xs text-gray-500 text-center mb-2" data-i18n="test_accounts">테스트 계정</div>
          <div class="grid grid-cols-2 gap-1.5">
            <button type="button" onclick="qLogin('admin','admin123')" class="px-2 py-2 bg-white/5 rounded-lg text-xs hover:bg-white/10 transition text-left">👑 admin<br><span class="text-gray-500">admin123 (10000 USDT)</span></button>
            <button type="button" onclick="qLogin('demo1','demo123')" class="px-2 py-2 bg-white/5 rounded-lg text-xs hover:bg-white/10 transition text-left">🧪 demo1<br><span class="text-gray-500">demo123 (500 USDT)</span></button>
            <button type="button" onclick="qLogin('demo2','demo123')" class="px-2 py-2 bg-white/5 rounded-lg text-xs hover:bg-white/10 transition text-left">🧪 demo2<br><span class="text-gray-500">demo123 (250 USDT)</span></button>
            <button type="button" onclick="qLogin('tester','test1234')" class="px-2 py-2 bg-white/5 rounded-lg text-xs hover:bg-white/10 transition text-left">🧪 tester<br><span class="text-gray-500">test1234 (1000 USDT)</span></button>
          </div>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- ══ 회원가입 탭 ══ -->
<div id="p-register" class="hidden">
  <div class="max-w-sm mx-auto">
    <div class="glass rounded-2xl p-7">
      <div class="text-center mb-5"><div class="text-4xl mb-2">✍️</div><h2 class="text-xl font-black" data-i18n="register">회원가입</h2><p class="text-green-400 text-xs mt-1" data-i18n="bonus_msg">🎁 가입 즉시 10 USDT 보너스!</p></div>
      <form onsubmit="event.preventDefault();doRegister()" class="space-y-3">
        <div><label class="text-xs text-gray-400 block mb-1" data-i18n="username">아이디</label><input type="text" id="rUser" autocomplete="username" class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-400 text-sm"></div>
        <div><label class="text-xs text-gray-400 block mb-1" data-i18n="password">비밀번호</label><input type="password" id="rPass" autocomplete="new-password" class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-400 text-sm"></div>
        <div><label class="text-xs text-gray-400 block mb-1" data-i18n="ref_code_opt">추천코드 (선택)</label><input type="text" id="rRef" class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-400 text-sm mono"></div>
        <div id="rErr" class="hidden text-red-400 text-xs text-center bg-red-500/10 rounded-lg py-2"></div>
        <div id="rOk"  class="hidden text-green-400 text-xs text-center bg-green-500/10 rounded-lg py-2"></div>
        <button type="submit" class="w-full py-3 bg-green-600 hover:bg-green-700 rounded-xl font-black transition" data-i18n="register_btn">🎁 회원가입</button>
        <div class="text-center text-xs text-gray-400"><span data-i18n="have_account">이미 계정?</span> <a onclick="showTab('login')" class="text-blue-400 cursor-pointer hover:underline" data-i18n="login">로그인</a></div>
      </form>
    </div>
  </div>
</div>

</main>

<!-- 토스트 -->
<div id="toast" class="fixed bottom-5 right-4 z-50 hidden max-w-xs w-full px-2">
  <div id="toastMsg" class="glass rounded-xl px-4 py-3 text-sm font-bold shadow-2xl slide"></div>
</div>

<script>
// ══════════════════════════════════════════
// 다국어 사전
// ══════════════════════════════════════════
const I18N = {
  ko: {
    blockchain_fair:'블록체인 기반 · 조작 불가',
    login:'로그인', logout:'로그아웃', register:'회원가입',
    tab_game:'🎲 게임', tab_wallet:'💰 지갑', tab_dashboard:'📊 투명성',
    tab_referral:'👥 추천수당', tab_verify:'🔍 검증',
    round:'라운드', sec_left:'초 남음', payout:'배당',
    seed_hash_label:'사전 공개 서버시드 해시',
    seed_desc:'베팅 전에 봉인 — 수학적으로 조작 불가',
    odd:'홀 (ODD)', even:'짝 (EVEN)', players:'명',
    bet_amount_label:'베팅 금액 (USDT, 최소 0.1)',
    odd_bet:'홀 베팅', even_bet:'짝 베팅',
    clear:'초기화', after_login_bet:' 후 베팅 가능',
    next_round:'다음 라운드', sec_unit:'초',
    my_info:'💼 내 정보', balance:'잔액', ref_earnings:'추천수당',
    level1:'1단계', level2:'2단계', ref_code:'추천코드',
    deposit_withdraw:'💰 입금 / 출금', need_login:'로그인이 필요합니다',
    recent_results:'🎯 최근 결과', live_feed:'📡 실시간 베팅',
    no_record:'기록 없음', no_bets:'베팅 내역 없음',
    wallet_title:'💰 USDT 지갑', wallet_desc:'TRC20 (TRON) 네트워크 기반 USDT 입출금',
    total_balance:'총 잔액', total_deposit:'총 입금', total_withdraw:'총 출금',
    deposit_title:'📥 USDT 입금', deposit_addr:'입금 주소 (TRC20)',
    copy_addr:'📋 주소 복사',
    deposit_warning:'반드시 TRC20(TRON) 네트워크로 입금하세요. 다른 네트워크 입금 시 손실됩니다.',
    demo_deposit:'🧪 데모 입금 (테스트용)', deposit_btn:'입금',
    withdraw_title:'📤 USDT 출금', withdraw_addr:'출금 주소 (TRC20)',
    withdraw_amount:'출금 금액 (USDT, 최소 1)', withdraw_fee:'수수료',
    withdraw_btn:'출금 신청',
    house_wallet_title:'🏦 본사 USDT 보관 방법',
    hw1_title:'하드웨어 지갑 (Ledger)', hw1_desc:'대규모 장기 보관 — 오프라인 보안 최강',
    hw2_title:'거래소 지갑 (Binance/OKX)', hw2_desc:'운영 자금 보관 — 빠른 출금 처리용',
    hw3_title:'멀티시그 지갑', hw3_desc:'2/3 서명 필요 — 단독 인출 불가 최고 보안',
    dash_title:'📊 투명성 대시보드', dash_desc:'모든 데이터 실시간 공개 — 숨기는 것 없음',
    total_games:'총 게임', user_rate:'유저 수익률', odd_rate:'홀 당첨률', total_users:'유저수',
    profit_structure:'💰 수익 배분 구조', user_payout:'유저 배당',
    l1_reward:'1단계 추천수당', l2_reward:'2단계 추천수당', house_net:'본사 순수익',
    realtime_stats:'📈 실시간 통계', total_bet:'총 베팅', total_payout:'총 지급',
    ref_paid:'추천수당 지급', actual_edge:'실제 엣지', theory_edge:'이론 엣지', house_profit:'본사 수익',
    dist_title:'🎯 홀짝 분포', game_history:'📜 게임 기록',
    result:'결과', hash:'해시', time:'시간',
    ref_title:'👥 추천인 수당 시스템', ref_desc:'친구 초대 → 베팅 때마다 자동 USDT 수당',
    l1_title:'1단계 수당', l1_desc:'직접 초대 친구 베팅금의 2.5% 자동 지급',
    l2_title:'2단계 수당', l2_desc:'친구가 초대한 친구 베팅금의 1.0% 자동 지급',
    unlimited:'무제한', no_limit:'수당 상한 없음', no_limit_desc:'인원·베팅액 비례 무한 수익',
    my_ref_code:'🎁 내 추천코드', ref_link:'추천링크',
    total_ref_earn:'총 수당(USDT)', l1_count:'1단계', l2_count:'2단계',
    simulator:'🧮 수익 시뮬레이터',
    sim_l1:'1단계 수', sim_l2:'2단계 수', sim_bet:'1인 일 베팅(USDT)', sim_times:'일 참여 횟수',
    daily_earn:'일 수익', monthly_earn:'월 수익', yearly_earn:'연 수익',
    verify_title:'🔍 공정성 직접 검증', verify_desc:'결과가 조작되지 않았음을 수학적으로 확인',
    system_title:'🔐 하이브리드 공정성 시스템',
    v1_title:'① 서버 시드', v1_desc:'라운드 전 SHA256 해시 공개. 종료 후 원본 공개→변조 불가 증명.',
    v2_title:'② 유저 시드', v2_desc:'참여자 ID 합산. 본사가 사전에 알 수 없어 조작 원천 차단.',
    v3_title:'③ 블록 높이', v3_desc:'비트코인 블록높이 추가 난수 소스. 외부 검증 가능.',
    formula:'공식:', last_char_rule:'마지막자리 홀수→ODD / 짝수→EVEN',
    verify_tool:'🧮 직접 검증', server_seed:'서버시드', block_height:'블록 높이',
    user_seed_opt:'유저시드 (선택)', verify_btn:'🔍 검증하기',
    hash_val:'해시', last_char:'마지막자리', recent_verify:'📋 최근 라운드 검증',
    username:'아이디', password:'비밀번호',
    no_account:'계정 없음?', have_account:'이미 계정?',
    ref_code_opt:'추천코드 (선택)', register_btn:'🎁 회원가입',
    bonus_msg:'🎁 가입 즉시 10 USDT 보너스!',
    test_accounts:'테스트 계정',
    betting_phase:'🟢 베팅 중', result_phase:'🔵 결과 발표',
    bet_complete:'베팅 완료!', bet_win:'🎉 당첨!', bet_lose:'😢 패배',
    copied:'복사됨!', ref_link_copied:'추천링크 복사됨!',
    err_min_bet:'최소 0.1 USDT 이상 베팅하세요',
    err_insufficient:'잔액이 부족합니다',
    err_already_bet:'이미 이번 라운드에 베팅하셨습니다',
    err_not_betting:'베팅 시간이 아닙니다',
    err_need_login:'로그인이 필요합니다',
    welcome:'님 환영합니다!',
    deposit_success:'입금 완료!',
    withdraw_success:'출금 신청 완료! TX: ',
  },
  en: {
    blockchain_fair:'Blockchain · Provably Fair',
    login:'Login', logout:'Logout', register:'Register',
    tab_game:'🎲 Game', tab_wallet:'💰 Wallet', tab_dashboard:'📊 Transparency',
    tab_referral:'👥 Referral', tab_verify:'🔍 Verify',
    round:'Round', sec_left:'sec left', payout:'Payout',
    seed_hash_label:'Pre-disclosed Server Seed Hash',
    seed_desc:'Sealed before betting — Mathematically tamper-proof',
    odd:'ODD', even:'EVEN', players:'players',
    bet_amount_label:'Bet Amount (USDT, min 0.1)',
    odd_bet:'BET ODD', even_bet:'BET EVEN',
    clear:'Clear', after_login_bet:' to bet',
    next_round:'Next round in', sec_unit:'s',
    my_info:'💼 My Info', balance:'Balance', ref_earnings:'Ref Earnings',
    level1:'Level 1', level2:'Level 2', ref_code:'Ref Code',
    deposit_withdraw:'💰 Deposit / Withdraw', need_login:'Please login',
    recent_results:'🎯 Recent Results', live_feed:'📡 Live Bets',
    no_record:'No records', no_bets:'No bets yet',
    wallet_title:'💰 USDT Wallet', wallet_desc:'USDT deposit & withdrawal via TRC20 (TRON)',
    total_balance:'Total Balance', total_deposit:'Total Deposit', total_withdraw:'Total Withdraw',
    deposit_title:'📥 Deposit USDT', deposit_addr:'Deposit Address (TRC20)',
    copy_addr:'📋 Copy Address',
    deposit_warning:'Always use TRC20 (TRON) network. Deposits on other networks will be lost.',
    demo_deposit:'🧪 Demo Deposit (Test)', deposit_btn:'Deposit',
    withdraw_title:'📤 Withdraw USDT', withdraw_addr:'Withdrawal Address (TRC20)',
    withdraw_amount:'Withdrawal Amount (USDT, min 1)', withdraw_fee:'Fee',
    withdraw_btn:'Request Withdrawal',
    house_wallet_title:'🏦 House USDT Storage',
    hw1_title:'Hardware Wallet (Ledger)', hw1_desc:'Large-scale long-term storage — Best offline security',
    hw2_title:'Exchange Wallet (Binance/OKX)', hw2_desc:'Operating funds — Fast withdrawal processing',
    hw3_title:'Multi-sig Wallet', hw3_desc:'2/3 signatures required — Highest security',
    dash_title:'📊 Transparency Dashboard', dash_desc:'All data public in real-time — Nothing hidden',
    total_games:'Total Games', user_rate:'User RTP', odd_rate:'ODD Rate', total_users:'Users',
    profit_structure:'💰 Profit Distribution', user_payout:'User Payout',
    l1_reward:'Level 1 Referral', l2_reward:'Level 2 Referral', house_net:'House Net',
    realtime_stats:'📈 Real-time Stats', total_bet:'Total Bet', total_payout:'Total Payout',
    ref_paid:'Referral Paid', actual_edge:'Actual Edge', theory_edge:'Theory Edge', house_profit:'House Profit',
    dist_title:'🎯 ODD/EVEN Distribution', game_history:'📜 Game History',
    result:'Result', hash:'Hash', time:'Time',
    ref_title:'👥 Referral System', ref_desc:'Invite friends → Auto USDT rewards on every bet',
    l1_title:'Level 1 Reward', l1_desc:"2.5% of your direct referral's bet amount",
    l2_title:'Level 2 Reward', l2_desc:"1.0% of your referral's referral's bet amount",
    unlimited:'Unlimited', no_limit:'No Cap', no_limit_desc:'Proportional to members and bet amounts',
    my_ref_code:'🎁 My Referral Code', ref_link:'Referral Link',
    total_ref_earn:'Total Ref (USDT)', l1_count:'Level 1', l2_count:'Level 2',
    simulator:'🧮 Earnings Simulator',
    sim_l1:'Level 1 count', sim_l2:'Level 2 count', sim_bet:'Daily bet/person (USDT)', sim_times:'Daily rounds',
    daily_earn:'Daily', monthly_earn:'Monthly', yearly_earn:'Yearly',
    verify_title:'🔍 Provably Fair Verification', verify_desc:'Mathematically verify no manipulation',
    system_title:'🔐 Hybrid Fairness System',
    v1_title:'① Server Seed', v1_desc:'SHA256 hash published before round. Original revealed after → Tamper-proof.',
    v2_title:'② User Seeds', v2_desc:'All participant IDs combined. House cannot predict result in advance.',
    v3_title:'③ Block Height', v3_desc:'Bitcoin block height as additional entropy. Externally verifiable.',
    formula:'Formula:', last_char_rule:'Last char odd→ODD / even→EVEN',
    verify_tool:'🧮 Verify', server_seed:'Server Seed', block_height:'Block Height',
    user_seed_opt:'User Seeds (optional)', verify_btn:'🔍 Verify',
    hash_val:'Hash', last_char:'Last Char', recent_verify:'📋 Recent Round Verification',
    username:'Username', password:'Password',
    no_account:"Don't have an account?", have_account:'Already have account?',
    ref_code_opt:'Referral Code (optional)', register_btn:'🎁 Register',
    bonus_msg:'🎁 10 USDT Bonus on signup!',
    test_accounts:'Test Accounts',
    betting_phase:'🟢 Betting', result_phase:'🔵 Result',
    bet_complete:'Bet placed!', bet_win:'🎉 You won!', bet_lose:'😢 Better luck next time',
    copied:'Copied!', ref_link_copied:'Referral link copied!',
    err_min_bet:'Minimum bet is 0.1 USDT',
    err_insufficient:'Insufficient balance',
    err_already_bet:'Already bet this round',
    err_not_betting:'Not in betting phase',
    err_need_login:'Please login first',
    welcome:' Welcome!',
    deposit_success:'Deposit successful!',
    withdraw_success:'Withdrawal requested! TX: ',
  },
  zh: {
    blockchain_fair:'区块链 · 公平可验证',
    login:'登录', logout:'退出', register:'注册',
    tab_game:'🎲 游戏', tab_wallet:'💰 钱包', tab_dashboard:'📊 透明度',
    tab_referral:'👥 推荐奖励', tab_verify:'🔍 验证',
    round:'轮次', sec_left:'秒剩余', payout:'赔率',
    seed_hash_label:'预先公开的服务器种子哈希',
    seed_desc:'投注前封印 — 数学上无法篡改',
    odd:'单 (ODD)', even:'双 (EVEN)', players:'人',
    bet_amount_label:'投注金额 (USDT, 最低 0.1)',
    odd_bet:'投注单', even_bet:'投注双',
    clear:'清除', after_login_bet:' 后可投注',
    next_round:'下一轮', sec_unit:'秒',
    my_info:'💼 我的信息', balance:'余额', ref_earnings:'推荐奖励',
    level1:'一级', level2:'二级', ref_code:'推荐码',
    deposit_withdraw:'💰 充值 / 提现', need_login:'请先登录',
    recent_results:'🎯 最近结果', live_feed:'📡 实时投注',
    no_record:'无记录', no_bets:'暂无投注',
    wallet_title:'💰 USDT 钱包', wallet_desc:'基于TRC20 (TRON) 网络的USDT充提',
    total_balance:'总余额', total_deposit:'总充值', total_withdraw:'总提现',
    deposit_title:'📥 充值 USDT', deposit_addr:'充值地址 (TRC20)',
    copy_addr:'📋 复制地址',
    deposit_warning:'请务必使用TRC20 (TRON) 网络充值，使用其他网络充值将导致资产损失。',
    demo_deposit:'🧪 演示充值 (测试)', deposit_btn:'充值',
    withdraw_title:'📤 提现 USDT', withdraw_addr:'提现地址 (TRC20)',
    withdraw_amount:'提现金额 (USDT, 最低 1)', withdraw_fee:'手续费',
    withdraw_btn:'申请提现',
    house_wallet_title:'🏦 平台 USDT 存储方式',
    hw1_title:'硬件钱包 (Ledger)', hw1_desc:'大规模长期存储 — 最强离线安全性',
    hw2_title:'交易所钱包 (Binance/OKX)', hw2_desc:'运营资金存储 — 快速提现处理',
    hw3_title:'多签钱包', hw3_desc:'需2/3签名 — 无法单独提取 最高安全',
    dash_title:'📊 透明度仪表板', dash_desc:'所有数据实时公开 — 没有隐瞒',
    total_games:'总游戏', user_rate:'用户收益率', odd_rate:'单赢率', total_users:'用户数',
    profit_structure:'💰 收益分配结构', user_payout:'用户赔付',
    l1_reward:'一级推荐奖励', l2_reward:'二级推荐奖励', house_net:'平台净利润',
    realtime_stats:'📈 实时统计', total_bet:'总投注', total_payout:'总赔付',
    ref_paid:'推荐奖励支付', actual_edge:'实际优势', theory_edge:'理论优势', house_profit:'平台收益',
    dist_title:'🎯 单双分布', game_history:'📜 游戏记录',
    result:'结果', hash:'哈希', time:'时间',
    ref_title:'👥 推荐奖励系统', ref_desc:'邀请好友 → 每次投注自动获得USDT奖励',
    l1_title:'一级奖励', l1_desc:'直接邀请好友投注金额的2.5%自动支付',
    l2_title:'二级奖励', l2_desc:'好友邀请的好友投注金额的1.0%自动支付',
    unlimited:'无限制', no_limit:'奖励无上限', no_limit_desc:'按人数和投注金额比例无限收益',
    my_ref_code:'🎁 我的推荐码', ref_link:'推荐链接',
    total_ref_earn:'总奖励(USDT)', l1_count:'一级', l2_count:'二级',
    simulator:'🧮 收益模拟器',
    sim_l1:'一级人数', sim_l2:'二级人数', sim_bet:'每人日投注(USDT)', sim_times:'日参与次数',
    daily_earn:'日收益', monthly_earn:'月收益', yearly_earn:'年收益',
    verify_title:'🔍 公平性直接验证', verify_desc:'用数学方式验证结果未被篡改',
    system_title:'🔐 混合公平性系统',
    v1_title:'① 服务器种子', v1_desc:'轮次前公开SHA256哈希。结束后公开原始值→不可篡改证明。',
    v2_title:'② 用户种子', v2_desc:'所有参与者ID合并。平台无法提前预测结果。',
    v3_title:'③ 区块高度', v3_desc:'使用比特币区块高度作为额外随机源。可外部验证。',
    formula:'公式:', last_char_rule:'末位奇数→ODD / 偶数→EVEN',
    verify_tool:'🧮 直接验证', server_seed:'服务器种子', block_height:'区块高度',
    user_seed_opt:'用户种子 (选填)', verify_btn:'🔍 验证',
    hash_val:'哈希', last_char:'末位字符', recent_verify:'📋 最近轮次验证',
    username:'用户名', password:'密码',
    no_account:'没有账号?', have_account:'已有账号?',
    ref_code_opt:'推荐码 (选填)', register_btn:'🎁 注册',
    bonus_msg:'🎁 注册即送 10 USDT 奖励!',
    test_accounts:'测试账号',
    betting_phase:'🟢 投注中', result_phase:'🔵 结果',
    bet_complete:'投注成功!', bet_win:'🎉 恭喜获胜!', bet_lose:'😢 很遗憾，下次加油',
    copied:'已复制!', ref_link_copied:'推荐链接已复制!',
    err_min_bet:'最低投注0.1 USDT',
    err_insufficient:'余额不足',
    err_already_bet:'本轮已投注',
    err_not_betting:'非投注时段',
    err_need_login:'请先登录',
    welcome:' 欢迎!',
    deposit_success:'充值成功!',
    withdraw_success:'提现申请成功! TX: ',
  },
  ja: {
    blockchain_fair:'ブロックチェーン · 不正操作不可',
    login:'ログイン', logout:'ログアウト', register:'登録',
    tab_game:'🎲 ゲーム', tab_wallet:'💰 ウォレット', tab_dashboard:'📊 透明性',
    tab_referral:'👥 紹介報酬', tab_verify:'🔍 検証',
    round:'ラウンド', sec_left:'秒残り', payout:'配当',
    seed_hash_label:'事前公開サーバーシードハッシュ',
    seed_desc:'ベット前に封印 — 数学的に改ざん不可',
    odd:'奇数 (ODD)', even:'偶数 (EVEN)', players:'人',
    bet_amount_label:'ベット金額 (USDT, 最低 0.1)',
    odd_bet:'奇数ベット', even_bet:'偶数ベット',
    clear:'クリア', after_login_bet:' 後にベット可能',
    next_round:'次のラウンドまで', sec_unit:'秒',
    my_info:'💼 マイ情報', balance:'残高', ref_earnings:'紹介報酬',
    level1:'1段階', level2:'2段階', ref_code:'紹介コード',
    deposit_withdraw:'💰 入金 / 出金', need_login:'ログインが必要です',
    recent_results:'🎯 最近の結果', live_feed:'📡 リアルタイムベット',
    no_record:'記録なし', no_bets:'ベット履歴なし',
    wallet_title:'💰 USDT ウォレット', wallet_desc:'TRC20 (TRON) ネットワークのUSDT入出金',
    total_balance:'総残高', total_deposit:'総入金', total_withdraw:'総出金',
    deposit_title:'📥 USDT 入金', deposit_addr:'入金アドレス (TRC20)',
    copy_addr:'📋 アドレスコピー',
    deposit_warning:'必ずTRC20 (TRON) ネットワークで入金してください。他のネットワークでの入金は損失となります。',
    demo_deposit:'🧪 デモ入金 (テスト用)', deposit_btn:'入金',
    withdraw_title:'📤 USDT 出金', withdraw_addr:'出金アドレス (TRC20)',
    withdraw_amount:'出金金額 (USDT, 最低 1)', withdraw_fee:'手数料',
    withdraw_btn:'出金申請',
    house_wallet_title:'🏦 運営USDT保管方法',
    hw1_title:'ハードウェアウォレット (Ledger)', hw1_desc:'大規模長期保管 — 最強オフラインセキュリティ',
    hw2_title:'取引所ウォレット (Binance/OKX)', hw2_desc:'運営資金保管 — 迅速な出金処理用',
    hw3_title:'マルチシグウォレット', hw3_desc:'2/3署名必要 — 単独引き出し不可 最高セキュリティ',
    dash_title:'📊 透明性ダッシュボード', dash_desc:'全データリアルタイム公開 — 隠し事なし',
    total_games:'総ゲーム', user_rate:'ユーザーRTP', odd_rate:'奇数当選率', total_users:'ユーザー数',
    profit_structure:'💰 収益配分構造', user_payout:'ユーザー配当',
    l1_reward:'1段階紹介報酬', l2_reward:'2段階紹介報酬', house_net:'運営純利益',
    realtime_stats:'📈 リアルタイム統計', total_bet:'総ベット', total_payout:'総支払',
    ref_paid:'紹介報酬支払', actual_edge:'実際エッジ', theory_edge:'理論エッジ', house_profit:'運営収益',
    dist_title:'🎯 奇数偶数分布', game_history:'📜 ゲーム記録',
    result:'結果', hash:'ハッシュ', time:'時間',
    ref_title:'👥 紹介報酬システム', ref_desc:'友達招待 → ベットのたびに自動USDT報酬',
    l1_title:'1段階報酬', l1_desc:'直接招待した友達のベット金額の2.5%を自動支払',
    l2_title:'2段階報酬', l2_desc:'友達が招待した友達のベット金額の1.0%を自動支払',
    unlimited:'無制限', no_limit:'報酬上限なし', no_limit_desc:'人数・ベット額に比例して無限収益',
    my_ref_code:'🎁 マイ紹介コード', ref_link:'紹介リンク',
    total_ref_earn:'総報酬(USDT)', l1_count:'1段階', l2_count:'2段階',
    simulator:'🧮 収益シミュレーター',
    sim_l1:'1段階人数', sim_l2:'2段階人数', sim_bet:'1人日ベット(USDT)', sim_times:'日参加回数',
    daily_earn:'日収益', monthly_earn:'月収益', yearly_earn:'年収益',
    verify_title:'🔍 公平性直接検証', verify_desc:'結果が操作されていないことを数学的に確認',
    system_title:'🔐 ハイブリッド公平性システム',
    v1_title:'① サーバーシード', v1_desc:'ラウンド前にSHA256ハッシュ公開。終了後に原本公開→改ざん不可証明。',
    v2_title:'② ユーザーシード', v2_desc:'全参加者ID合算。運営が事前に予測不可能。',
    v3_title:'③ ブロック高さ', v3_desc:'ビットコインブロック高さを追加乱数として使用。外部検証可能。',
    formula:'計算式:', last_char_rule:'末尾奇数→ODD / 偶数→EVEN',
    verify_tool:'🧮 直接検証', server_seed:'サーバーシード', block_height:'ブロック高さ',
    user_seed_opt:'ユーザーシード (任意)', verify_btn:'🔍 検証する',
    hash_val:'ハッシュ', last_char:'末尾文字', recent_verify:'📋 最近ラウンド検証',
    username:'ユーザー名', password:'パスワード',
    no_account:'アカウントなし?', have_account:'既にアカウントあり?',
    ref_code_opt:'紹介コード (任意)', register_btn:'🎁 登録',
    bonus_msg:'🎁 登録即座に 10 USDT ボーナス!',
    test_accounts:'テストアカウント',
    betting_phase:'🟢 ベット中', result_phase:'🔵 結果発表',
    bet_complete:'ベット完了!', bet_win:'🎉 当選!', bet_lose:'😢 残念、次回頑張ろう',
    copied:'コピー済み!', ref_link_copied:'紹介リンクコピー済み!',
    err_min_bet:'最低0.1 USDTからベット可能です',
    err_insufficient:'残高が不足しています',
    err_already_bet:'このラウンドはすでにベット済みです',
    err_not_betting:'ベット時間外です',
    err_need_login:'ログインしてください',
    welcome:'さんようこそ!',
    deposit_success:'入金完了!',
    withdraw_success:'出金申請完了! TX: ',
  }
}

let LANG = localStorage.getItem('lang') || 'ko'

function t(key) { return (I18N[LANG] && I18N[LANG][key]) || (I18N['en'] && I18N['en'][key]) || key }

function applyLang() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n')
    el.textContent = t(key)
  })
  document.querySelectorAll('[id^="lang-"]').forEach(b => b.classList.remove('active'))
  const btn = document.getElementById('lang-'+LANG)
  if (btn) btn.classList.add('active')
  // 게임 페이즈 뱃지 갱신
  const badge = document.getElementById('gPhaseBadge')
  if (badge) badge.textContent = badge.dataset.phase === 'betting' ? t('betting_phase') : t('result_phase')
}

function setLang(lang) {
  LANG = lang
  localStorage.setItem('lang', lang)
  applyLang()
}

// ══════════════════════════════════════════
// 전역 상태
// ══════════════════════════════════════════
let sid = localStorage.getItem('sid') || ''
let me  = null
let lastRoundId = null
let myBet = null

const $ = id => document.getElementById(id)
const fmtU = n => parseFloat(n).toFixed(2) + ' USDT'
const ago  = ts => { const s=Math.floor((Date.now()-ts)/1000); return s<60?s+'s':s<3600?Math.floor(s/60)+'m':Math.floor(s/3600)+'h' }
const api  = async (url,method='GET',body=null) => {
  const r = await fetch(url,{method,headers:{'Content-Type':'application/json','X-Session-Id':sid},body:body?JSON.stringify(body):null})
  return r.json()
}
const toast = (msg,cls='text-white') => {
  $('toastMsg').className='glass rounded-xl px-4 py-3 text-sm font-bold shadow-2xl slide '+cls
  $('toastMsg').textContent=msg
  $('toast').classList.remove('hidden')
  setTimeout(()=>$('toast').classList.add('hidden'),3000)
}
const errMap = { UNAUTH:()=>t('err_need_login'), MIN_BET:()=>t('err_min_bet'), INSUFFICIENT:()=>t('err_insufficient'), ALREADY_BET:()=>t('err_already_bet'), NOT_BETTING:()=>t('err_not_betting'), INVALID_CRED:()=>t('err_invalid_cred')||'Invalid credentials', NEED_FIELDS:()=>t('err_need_fields')||'Fill all fields', USERNAME_SHORT:()=>t('err_username_short')||'Username too short', USERNAME_TAKEN:()=>t('err_username_taken')||'Username taken', INVALID_REF:()=>t('err_invalid_ref')||'Invalid referral code', MIN_WITHDRAW:()=>t('err_min_withdraw')||'Min 1 USDT', INVALID_ADDR:()=>t('err_invalid_addr')||'Invalid address' }
const errMsg = code => (errMap[code] && errMap[code]()) || code

// ── 탭 ──
function showTab(tab) {
  document.querySelectorAll('[id^="p-"]').forEach(el=>el.classList.add('hidden'))
  document.querySelectorAll('[id^="t-"]').forEach(el=>{el.classList.remove('tab-on');el.classList.add('tab-off')})
  $('p-'+tab).classList.remove('hidden')
  const tb=$('t-'+tab); if(tb){tb.classList.add('tab-on');tb.classList.remove('tab-off')}
  if(tab==='dashboard') loadDash()
  if(tab==='referral')  loadRef()
  if(tab==='verify')    loadVerifyHist()
  if(tab==='wallet')    loadWallet()
}

// ── UI 업데이트 ──
function updateUI() {
  if (me) {
    $('hdrGuest').classList.add('hidden')
    $('hdrUser').classList.remove('hidden'); $('hdrUser').classList.add('flex')
    $('hdrName').textContent = me.username
    $('hdrBal').textContent  = fmtU(me.balance)
    $('sideGuest').classList.add('hidden'); $('sideUser').classList.remove('hidden')
    $('siBal').textContent = fmtU(me.balance)
    $('siRef').textContent = fmtU(me.referralEarnings||0)
    $('siL1').textContent  = (me.level1Count||0)
    $('siL2').textContent  = (me.level2Count||0)
    $('siCode').textContent= me.referralCode
    $('betArea').classList.remove('hidden'); $('needLogin').classList.add('hidden')
  } else {
    $('hdrGuest').classList.remove('hidden'); $('hdrUser').classList.add('hidden')
    $('sideGuest').classList.remove('hidden'); $('sideUser').classList.add('hidden')
    $('betArea').classList.add('hidden'); $('needLogin').classList.remove('hidden')
  }
}

// ── 인증 ──
async function doLogin() {
  const u=$('lUser').value.trim(), p=$('lPass').value
  if(!u||!p){showErr('lErr',t('err_need_login'));return}
  const d=await api('/api/login','POST',{username:u,password:p})
  if(d.error){showErr('lErr',errMsg(d.error));return}
  sid=d.sessionId; localStorage.setItem('sid',sid); me=d.user; updateUI(); showTab('game')
  toast('🎉 '+u+t('welcome'),'text-green-400')
}
async function doRegister() {
  const u=$('rUser').value.trim(), p=$('rPass').value, ref=$('rRef').value.trim()
  if(!u||!p){showErr('rErr',errMsg('NEED_FIELDS'));return}
  const d=await api('/api/register','POST',{username:u,password:p,referralCode:ref||null})
  if(d.error){showErr('rErr',errMsg(d.error));return}
  $('rOk').textContent=t('bonus_msg'); $('rOk').classList.remove('hidden')
  sid=d.sessionId; localStorage.setItem('sid',sid); me=d.user
  setTimeout(()=>{updateUI();showTab('game')},1500)
}
async function logout() {
  await api('/api/logout','POST'); sid=''; me=null; localStorage.removeItem('sid'); updateUI(); showTab('game')
  toast(t('logout'))
}
function qLogin(u,p){$('lUser').value=u;$('lPass').value=p;doLogin()}
function showErr(id,msg){$(id).textContent=msg;$(id).classList.remove('hidden');setTimeout(()=>$(id).classList.add('hidden'),3000)}

// ── 게임 ──
async function loadRound() {
  try {
    const d = await api('/api/round/current')
    if(d.error) return
    $('gRoundId').textContent = '#'+d.id
    $('gBlock').textContent   = 'Block #'+d.blockHeight
    $('gSeedHash').textContent= d.serverSeedHash||'-'
    $('gTotalOdd').textContent = fmtU(d.totalOdd)
    $('gTotalEven').textContent= fmtU(d.totalEven)
    // 베팅 인원수 업데이트
    const oddBetters = d.recentBets ? d.recentBets.filter(b=>b.choice==='odd').length : 0
    const evenBetters = d.recentBets ? d.recentBets.filter(b=>b.choice==='even').length : 0
    if($('gOddBetters')) $('gOddBetters').textContent = d.betCount + ' ' + t('players')
    if($('gEvenBetters')) $('gEvenBetters').textContent = d.betCount + ' ' + t('players')
    const tl = d.timeLeft||0
    $('gTimer').textContent = tl
    if (d.phase==='betting') {
      $('gBar').style.width = Math.min(100,(tl/30)*100)+'%'
      const badge=$('gPhaseBadge'); badge.textContent=t('betting_phase'); badge.dataset.phase='betting'
      badge.className='inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 mb-1'
      $('resultBox').classList.add('hidden')
      if(lastRoundId!==d.id){lastRoundId=d.id;myBet=null;if(me)enableBtns()}
      if(myBet)disableBtns(); else if(me)enableBtns()
    } else {
      $('gBar').style.width='0%'
      const badge=$('gPhaseBadge'); badge.textContent=t('result_phase'); badge.dataset.phase='result'
      badge.className='inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 mb-1'
      disableBtns(); showResult(d)
      if(me&&sid){const mm=await api('/api/me');if(!mm.error){me={...me,...mm};updateUI()}}
    }
    updateLiveBets(d.recentBets||[])
    loadRecentResults()
  } catch(e){}
}

function showResult(d) {
  $('resultBox').classList.remove('hidden')
  const isOdd=d.result==='odd'
  $('resEmoji').textContent = isOdd?'🔴':'🔵'
  $('resText').textContent  = isOdd?t('odd'):t('even')
  $('resText').className    = 'text-3xl font-black mb-1 '+(isOdd?'text-red-400':'text-blue-400')
  $('resHash').textContent  = 'Hash: '+(d.hashValue||'-')
  $('resNext').textContent  = d.timeLeft||'-'
  if(myBet){
    const win=myBet===d.result
    $('resDetail').textContent = win?t('bet_win'):t('bet_lose')
    $('resDetail').className   = 'text-sm mb-2 '+(win?'text-green-400':'text-red-400')
  } else {
    $('resDetail').textContent = 'Last char: '+(d.hashValue?d.hashValue[d.hashValue.length-1]:'-')
    $('resDetail').className   = 'text-sm mb-2 text-gray-300'
  }
}

function updateLiveBets(bets) {
  if(!bets||!bets.length) return
  $('liveFeed').innerHTML = bets.map(b=>\`<div class="flex items-center justify-between text-xs py-1 border-b border-white/5"><span class="text-gray-300">\${b.username}</span><span class="\${b.choice==='odd'?'text-red-400':'text-blue-400'} font-bold">\${b.choice==='odd'?'🔴':'🔵'}</span><span class="usdt font-bold">\${fmtU(b.amount)}</span></div>\`).join('')
}

async function loadFeed() {
  try{const d=await api('/api/feed');if(d.recentBets&&d.recentBets.length){$('liveFeed').innerHTML=d.recentBets.map(b=>\`<div class="flex items-center justify-between text-xs py-1 border-b border-white/5"><span class="text-gray-300">\${b.username}</span><span class="\${b.choice==='odd'?'text-red-400':'text-blue-400'} font-bold">\${b.choice==='odd'?'🔴':'🔵'}</span><span class="usdt font-bold">\${fmtU(b.amount)}</span><span class="\${b.win?'text-green-400':'text-gray-500'}">\${b.win?'✅':'❌'}</span></div>\`).join('')}}catch(e){}
}

async function loadRecentResults() {
  try{const d=await api('/api/history');if(d.history&&d.history.length){$('recentRes').innerHTML=d.history.slice(0,20).map(h=>\`<div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black \${h.result==='odd'?'bg-red-500/30 text-red-400':'bg-blue-500/30 text-blue-400'}" title="#\${h.roundId}">\${h.result==='odd'?'O':'E'}</div>\`).join('')}}catch(e){}
}

const enableBtns =()=>{$('btnOdd').disabled=false;$('btnEven').disabled=false;$('btnOdd').classList.remove('opacity-40');$('btnEven').classList.remove('opacity-40')}
const disableBtns=()=>{$('btnOdd').disabled=true;$('btnEven').disabled=true;$('btnOdd').classList.add('opacity-40');$('btnEven').classList.add('opacity-40')}
const addBet=(n)=>{ $('betAmt').value=Math.round((parseFloat($('betAmt').value)||0)+n) }
const maxBet =()=>{ if(me)$('betAmt').value=Math.min(me.balance,1000) }
const clearBet=()=>{ $('betAmt').value='' }

async function doBet(choice) {
  if(!me){showTab('login');return}
  const amount=parseFloat($('betAmt').value)
  if(!amount||amount<0.1){toast(t('err_min_bet'),'text-red-400');return}
  const d=await api('/api/bet','POST',{choice,amount})
  if(d.error){toast(errMsg(d.error),'text-red-400');return}
  myBet=choice; me.balance=d.balance; updateUI(); clearBet(); disableBtns()
  toast((choice==='odd'?'🔴 ':' 🔵 ')+fmtU(amount)+' '+t('bet_complete'),'text-green-400')
}

function copyCode() {
  const c=$('siCode').textContent||$('rCode').textContent
  navigator.clipboard.writeText(c).then(()=>toast('📋 '+t('copied'),'text-green-400'))
}

// ── 지갑 ──
async function loadWallet() {
  if(!me){$('walletNeedLogin').classList.remove('hidden');$('walletInfo').classList.add('hidden');return}
  $('walletNeedLogin').classList.add('hidden');$('walletInfo').classList.remove('hidden')
  const d=await api('/api/me')
  if(d.error) return
  $('wBal').textContent       = fmtU(d.balance)
  $('wTotalDep').textContent  = fmtU(d.totalDeposit)
  $('wTotalWd').textContent   = fmtU(d.totalWithdraw)
  $('wDepAddr').textContent   = d.depositAddress||'-'
}

function copyAddr() {
  const addr=$('wDepAddr').textContent
  navigator.clipboard.writeText(addr).then(()=>toast('📋 '+t('copied'),'text-green-400'))
}

async function demoDeposit() {
  const amount=parseFloat($('demoDepAmt').value)||10
  const d=await api('/api/deposit','POST',{amount})
  if(d.error){toast(errMsg(d.error),'text-red-400');return}
  me.balance=d.balance; updateUI()
  $('wBal').textContent=$('wTotalDep').textContent?fmtU(d.balance):fmtU(d.balance)
  await loadWallet()
  toast('✅ '+t('deposit_success')+' +'+fmtU(amount),'text-green-400')
}

async function doWithdraw() {
  const amount=parseFloat($('wdAmt').value), addr=$('wdAddr').value.trim()
  if(!amount||amount<1){showErr('wdErr',errMsg('MIN_WITHDRAW'));return}
  if(!addr||addr.length<10){showErr('wdErr',errMsg('INVALID_ADDR'));return}
  const d=await api('/api/withdraw','POST',{amount,address:addr})
  if(d.error){showErr('wdErr',errMsg(d.error));return}
  me.balance=d.balance; updateUI(); await loadWallet()
  $('wdOk').textContent=t('withdraw_success')+d.txHash.slice(0,16)+'...'
  $('wdOk').classList.remove('hidden')
  setTimeout(()=>$('wdOk').classList.add('hidden'),5000)
  toast('✅ '+t('withdraw_success').replace('TX: ',''),'text-green-400')
}

function setMaxWd() { if(me)$('wdAmt').value=Math.max(0,me.balance-1) }

// ── 대시보드 ──
async function loadDash() {
  try {
    const [s,h]=await Promise.all([api('/api/stats'),api('/api/history')])
    $('dTotalGames').textContent=s.totalGames
    const ur=s.totalBetAmount>0?((s.totalPayoutAmount/s.totalBetAmount)*100).toFixed(1):'90.0'
    $('dUserRate').textContent=ur+'%'
    $('dOddRate').textContent=s.oddRate+'%'
    $('dUsers').textContent=s.userCount
    $('dTotalBet').textContent=fmtU(s.totalBetAmount)
    $('dTotalPayout').textContent=fmtU(s.totalPayoutAmount)
    $('dRefPaid').textContent=fmtU(s.totalReferralPaid)
    $('dActualEdge').textContent=s.actualHouseEdge+'%'
    $('dHouseProfit').textContent=fmtU(s.houseProfit)
    $('dOddCnt').textContent=s.oddCount; $('dEvenCnt').textContent=s.evenCount
    $('dOddPct').textContent=s.oddRate+'%'; $('dEvenPct').textContent=s.evenRate+'%'
    $('dOddBar').style.width=s.oddRate+'%'; $('dEvenBar').style.width=s.evenRate+'%'
    if(h.history&&h.history.length){
      $('dHistTbl').innerHTML=h.history.map(r=>\`<tr class="border-b border-white/5 hover:bg-white/5"><td class="py-1.5 px-2 text-gray-400">#\${r.roundId}</td><td class="py-1.5 px-2"><span class="px-1.5 py-0.5 rounded text-xs font-black \${r.result==='odd'?'bg-red-500/20 text-red-400':'bg-blue-500/20 text-blue-400'}">\${r.result==='odd'?'🔴 ODD':'🔵 EVEN'}</span></td><td class="py-1.5 px-2 mono text-xs text-gray-400">\${r.hashValue.slice(0,14)}...</td><td class="py-1.5 px-2 text-right usdt text-xs">\${fmtU(r.totalBets)}</td><td class="py-1.5 px-2 text-right text-gray-500 text-xs">\${ago(r.timestamp)}</td></tr>\`).join('')
    }
  }catch(e){}
}

// ── 추천 ──
async function loadRef() {
  if(!me){$('refNeedLogin').classList.remove('hidden');$('refInfo').classList.add('hidden');return}
  $('refNeedLogin').classList.add('hidden');$('refInfo').classList.remove('hidden')
  const d=await api('/api/referral'); if(d.error) return
  $('rCode').textContent=d.referralCode
  $('rLink').textContent=location.origin+'?ref='+d.referralCode
  $('rEarnings').textContent=fmtU(d.referralEarnings)
  $('rL1Cnt').textContent=d.level1.count
  $('rL2Cnt').textContent=d.level2.count
  calcSim()
}

function calcSim() {
  const l1=parseInt($('sL1').value)||0, l2=parseInt($('sL2').value)||0
  const bet=parseFloat($('sBet').value)||0, times=parseInt($('sTimes').value)||0
  const d=(l1*bet*times*0.025)+(l2*bet*times*0.01)
  $('sDayE').textContent=fmtU(d); $('sMonE').textContent=fmtU(d*30); $('sYrE').textContent=fmtU(d*365)
}

function shareRef() {
  const link=location.origin+'?ref='+$('rCode').textContent
  if(navigator.share){navigator.share({title:'ODD/EVEN Game',text:'Blockchain fair game! 10 USDT bonus!',url:link})}
  else{navigator.clipboard.writeText(link).then(()=>toast('📋 '+t('ref_link_copied'),'text-green-400'))}
}

// ── 검증 ──
async function doVerify() {
  const seed=$('vSeed').value.trim(), block=$('vBlock').value.trim(), user=$('vUser').value.trim()
  if(!seed||!block){toast(t('err_need_login'),'text-red-400');return}
  const d=await api('/api/verify','POST',{serverSeed:seed,blockHeight:block,userSeeds:user})
  $('vResult').classList.remove('hidden')
  $('vHash').textContent=d.hash
  $('vLast').textContent=d.lastChar+' → '+(parseInt(d.lastChar,16)%2===1?'ODD':'EVEN')
  $('vFinal').textContent=d.result==='odd'?'🔴 ODD':'🔵 EVEN'
  $('vFinal').className='text-lg font-black '+(d.result==='odd'?'text-red-400':'text-blue-400')
}

async function loadVerifyHist() {
  const d=await api('/api/history'); if(!d.history||!d.history.length) return
  $('vHistory').innerHTML=d.history.slice(0,8).map(h=>\`<div class="glass rounded-xl p-3"><div class="flex items-center justify-between mb-1.5"><span class="font-bold text-xs">#\${h.roundId}</span><span class="px-2 py-0.5 rounded text-xs font-black \${h.result==='odd'?'bg-red-500/20 text-red-400':'bg-blue-500/20 text-blue-400'}">\${h.result==='odd'?'🔴 ODD':'🔵 EVEN'}</span></div><div class="mono text-xs text-gray-400 break-all mb-1">\${h.hashValue}</div><div class="text-xs text-gray-500">Last: \${h.hashValue[h.hashValue.length-1]} → \${parseInt(h.hashValue[h.hashValue.length-1],16)%2===1?'ODD':'EVEN'}</div><button onclick="fillVerify('\${h.serverSeed}','\${h.blockHeight}')" class="mt-1.5 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition text-xs">🔍 \${t('verify_btn')}</button></div>\`).join('')
}

function fillVerify(seed,block){$('vSeed').value=seed;$('vBlock').value=block;showTab('verify');doVerify()}

// ── URL 추천코드 ──
function parseRef() {
  const ref=new URLSearchParams(location.search).get('ref')
  if(ref){$('rRef').value=ref;showTab('register');toast('📋 '+t('copied'),'text-green-400')}
}

// ── 초기화 ──
async function init() {
  applyLang()
  if(sid){const d=await api('/api/me');if(!d.error){me=d;updateUI()}else{sid='';localStorage.removeItem('sid')}}
  parseRef()
  showTab('game')
  await loadRound()
  setInterval(loadRound,1000)
  setInterval(loadFeed,4000)
  setInterval(()=>{if(!$('p-dashboard').classList.contains('hidden'))loadDash()},20000)
}
init()
</script>
</body>
</html>`

export default app
