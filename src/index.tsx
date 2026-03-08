import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────
type Bindings = { DB: D1Database }

const app = new Hono<{ Bindings: Bindings }>()
app.use('/api/*', cors())
app.use('/static/*', serveStatic({ root: './' }))

// ─────────────────────────────────────────────
// 상수
// ─────────────────────────────────────────────
const PAYOUT          = 1.90
const L1              = 0.025
const L2              = 0.010
const MIN_WITHDRAW_AMT = 1
const MIN_BET         = 0.1
const MAX_BET         = 1000
const ROUND_DURATION  = 30000   // ms
const RESULT_SHOW     = 8000    // ms
const CYCLE           = ROUND_DURATION + RESULT_SHOW
const GAME_START      = 1700000000000  // 고정 기준시간 (서버 재시작 무관)

// ─────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────
async function sha256(msg: string): Promise<string> {
  const buf  = new TextEncoder().encode(msg)
  const hash = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('')
}

async function hashPassword(password: string): Promise<string> {
  const salt    = crypto.getRandomValues(new Uint8Array(16))
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2,'0')).join('')
  const key     = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits    = await crypto.subtle.deriveBits({ name:'PBKDF2', salt, iterations:100000, hash:'SHA-256' }, key, 256)
  const hashHex = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2,'0')).join('')
  return saltHex + ':' + hashHex
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [saltHex, storedHash] = stored.split(':')
    const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(h => parseInt(h,16)))
    const key  = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
    const bits = await crypto.subtle.deriveBits({ name:'PBKDF2', salt, iterations:100000, hash:'SHA-256' }, key, 256)
    const hashHex = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2,'0')).join('')
    return hashHex === storedHash
  } catch { return false }
}

const uid     = () => crypto.randomUUID().replace(/-/g,'')
const rcode   = () => Math.random().toString(36).slice(2,8).toUpperCase()
const genAddr = () => 'T' + Array.from({length:33}, () => '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'[Math.floor(Math.random()*58)]).join('')
const isOdd   = (h: string) => parseInt(h[h.length-1], 16) % 2 === 1
const r2      = (n: number) => Math.round(n * 100) / 100

// ─────────────────────────────────────────────
// 라운드 페이즈 계산
// ─────────────────────────────────────────────
function getPhase() {
  const elapsed = (Date.now() - GAME_START) % CYCLE
  const idx     = Math.floor((Date.now() - GAME_START) / CYCLE)
  if (elapsed < ROUND_DURATION)
    return { phase: 'betting' as const, timeLeft: Math.ceil((ROUND_DURATION - elapsed)/1000), idx }
  return   { phase: 'result'  as const, timeLeft: Math.ceil((CYCLE - elapsed)/1000), idx }
}

// ─────────────────────────────────────────────
// DB 헬퍼
// ─────────────────────────────────────────────
async function getSession(db: D1Database, sid: string) {
  if (!sid) return null
  const row = await db.prepare('SELECT user_id FROM sessions WHERE id=?').bind(sid).first<{user_id:string}>()
  return row ? row.user_id : null
}

async function getUser(db: D1Database, userId: string) {
  return db.prepare('SELECT * FROM users WHERE id=?').bind(userId).first<any>()
}

async function getUserBySid(db: D1Database, sid: string) {
  const uid = await getSession(db, sid)
  if (!uid) return null
  return getUser(db, uid)
}

async function ensureRound(db: D1Database, idx: number) {
  const roundId = idx + 1
  const existing = await db.prepare('SELECT * FROM rounds WHERE id=?').bind(roundId).first<any>()
  if (existing) return existing

  const serverSeed     = uid() + uid()
  const serverSeedHash = await sha256(serverSeed)
  const startTime      = GAME_START + idx * CYCLE
  const endTime        = startTime + ROUND_DURATION
  const blockHeight    = 881000 + roundId

  await db.prepare(`
    INSERT INTO rounds (id, status, start_time, end_time, server_seed, server_seed_hash, block_height, settled, created_at)
    VALUES (?, 'betting', ?, ?, ?, ?, ?, 0, ?)
  `).bind(roundId, startTime, endTime, serverSeed, serverSeedHash, blockHeight, Date.now()).run()

  return db.prepare('SELECT * FROM rounds WHERE id=?').bind(roundId).first<any>()
}

async function settleRound(db: D1Database, round: any) {
  if (round.settled) return round

  // 이 라운드 베팅 가져오기
  const betsResult = await db.prepare('SELECT * FROM bets WHERE round_id=? AND settled=0').bind(round.id).all<any>()
  const bets = betsResult.results || []

  const userSeeds = bets.map((b: any) => b.user_id).join('')
  const hash      = await sha256(round.server_seed + round.block_height + userSeeds)
  const result    = isOdd(hash) ? 'odd' : 'even'

  let totalPayout = 0
  const stmts: any[] = []

  for (const bet of bets) {
    const win    = bet.choice === result
    const payout = win ? r2(bet.amount * PAYOUT) : 0
    totalPayout += payout

    // 베팅 결과 업데이트
    stmts.push(
      db.prepare('UPDATE bets SET win=?, payout=?, settled=1 WHERE id=?')
        .bind(win ? 1 : 0, payout, bet.id)
    )

    // 유저 잔액 업데이트
    if (win) {
      stmts.push(
        db.prepare('UPDATE users SET balance=balance+?, total_earned=total_earned+? WHERE id=?')
          .bind(payout, r2(payout - bet.amount), bet.user_id)
      )
    }
    stmts.push(
      db.prepare('UPDATE users SET total_bet_amount=total_bet_amount+? WHERE id=?')
        .bind(bet.amount, bet.user_id)
    )

    // 추천수당 지급
    const betUser = await db.prepare('SELECT referred_by FROM users WHERE id=?').bind(bet.user_id).first<any>()
    if (betUser?.referred_by) {
      const r1 = r2(bet.amount * L1)
      stmts.push(
        db.prepare('UPDATE users SET balance=balance+?, referral_earnings=referral_earnings+? WHERE id=?')
          .bind(r1, r1, betUser.referred_by)
      )
      const l1User = await db.prepare('SELECT referred_by FROM users WHERE id=?').bind(betUser.referred_by).first<any>()
      if (l1User?.referred_by) {
        const r2amt = r2(bet.amount * L2)
        stmts.push(
          db.prepare('UPDATE users SET balance=balance+?, referral_earnings=referral_earnings+? WHERE id=?')
            .bind(r2amt, r2amt, l1User.referred_by)
        )
      }
    }
  }

  // 라운드 결과 업데이트
  stmts.push(
    db.prepare('UPDATE rounds SET result=?, hash_value=?, status="finished", total_payout=?, settled=1 WHERE id=?')
      .bind(result, hash, r2(totalPayout), round.id)
  )

  await db.batch(stmts)
  return db.prepare('SELECT * FROM rounds WHERE id=?').bind(round.id).first<any>()
}

// ─────────────────────────────────────────────
// 미들웨어: 라운드 자동 처리
// ─────────────────────────────────────────────
app.use('/api/*', async (c, next) => {
  const { phase, idx } = getPhase()
  const round = await ensureRound(c.env.DB, idx)
  if (phase === 'result' && round && !round.settled) {
    await settleRound(c.env.DB, round)
  }
  await next()
})

// ─────────────────────────────────────────────
// 데모 유저 초기화 API (최초 1회)
// ─────────────────────────────────────────────
app.post('/api/init-demo', async (c) => {
  const existing = await c.env.DB.prepare('SELECT COUNT(*) as cnt FROM users').first<{cnt:number}>()
  if (existing && existing.cnt > 0) return c.json({ message: '이미 초기화됨', count: existing.cnt })

  const demos = [
    { username:'admin',  password:'admin123',  balance:10000, isAdmin:1 },
    { username:'demo1',  password:'demo123',   balance:500,   isAdmin:0 },
    { username:'demo2',  password:'demo123',   balance:250,   isAdmin:0 },
    { username:'tester', password:'test1234',  balance:1000,  isAdmin:0 },
  ]

  const stmts = []
  for (const d of demos) {
    const id   = uid()
    const hash = await hashPassword(d.password)
    stmts.push(
      c.env.DB.prepare(`
        INSERT INTO users (id, username, password_hash, balance, deposit_address, total_deposit,
          referral_code, is_admin, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(id, d.username, hash, d.balance, genAddr(), d.balance, rcode(), d.isAdmin, Date.now())
    )
  }
  await c.env.DB.batch(stmts)
  return c.json({ success: true, message: '데모 유저 4명 생성 완료' })
})

// ─────────────────────────────────────────────
// API: 인증
// ─────────────────────────────────────────────
app.post('/api/register', async (c) => {
  const { username, password, referralCode } = await c.req.json()
  if (!username || !password)     return c.json({ error:'NEED_FIELDS' }, 400)
  if (username.length < 3)        return c.json({ error:'USERNAME_SHORT' }, 400)
  if (password.length < 6)        return c.json({ error:'PASSWORD_SHORT' }, 400)

  const dup = await c.env.DB.prepare('SELECT id FROM users WHERE username=?').bind(username).first()
  if (dup) return c.json({ error:'USERNAME_TAKEN' }, 400)

  // IP 제한
  const ip      = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown'
  const ipCount = await c.env.DB.prepare("SELECT COUNT(*) as cnt FROM users WHERE last_ip=?").bind(ip).first<{cnt:number}>()
  if (ipCount && ipCount.cnt >= 3) return c.json({ error:'IP_LIMIT' }, 400)

  let referredBy: string | null = null
  if (referralCode) {
    const refUser = await c.env.DB.prepare('SELECT id FROM users WHERE referral_code=?').bind(referralCode).first<{id:string}>()
    if (!refUser) return c.json({ error:'INVALID_REF' }, 400)
    referredBy = refUser.id
  }

  const id           = uid()
  const passwordHash = await hashPassword(password)
  const newRcode     = rcode()
  const now          = Date.now()

  await c.env.DB.prepare(`
    INSERT INTO users (id, username, password_hash, balance, deposit_address, total_deposit,
      referral_code, referred_by, is_admin, created_at, last_ip)
    VALUES (?, ?, ?, 10, ?, 10, ?, ?, 0, ?, ?)
  `).bind(id, username, passwordHash, genAddr(), newRcode, referredBy, now, ip).run()

  // 추천 관계 등록
  if (referredBy) {
    await c.env.DB.prepare('INSERT INTO referrals (id, referrer_id, referee_id, level, created_at) VALUES (?, ?, ?, 1, ?)').bind(uid(), referredBy, id, now).run()
    // 2단계
    const l1User = await c.env.DB.prepare('SELECT referred_by FROM users WHERE id=?').bind(referredBy).first<any>()
    if (l1User?.referred_by) {
      await c.env.DB.prepare('INSERT INTO referrals (id, referrer_id, referee_id, level, created_at) VALUES (?, ?, ?, 2, ?)').bind(uid(), l1User.referred_by, id, now).run()
    }
  }

  const sid = uid()
  await c.env.DB.prepare('INSERT INTO sessions (id, user_id, created_at) VALUES (?, ?, ?)').bind(sid, id, now).run()

  return c.json({ success:true, sessionId:sid, user:{ id, username, balance:10, referralCode:newRcode, depositAddress:'', isAdmin:false } })
})

app.post('/api/login', async (c) => {
  const { username, password } = await c.req.json()
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE username=?').bind(username).first<any>()
  if (!user) return c.json({ error:'INVALID_CRED' }, 401)
  if (user.is_banned) return c.json({ error:'BANNED' }, 403)

  const ok = await verifyPassword(password, user.password_hash)
  if (!ok) return c.json({ error:'INVALID_CRED' }, 401)

  const ip  = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown'
  await c.env.DB.prepare('UPDATE users SET login_count=login_count+1, last_ip=? WHERE id=?').bind(ip, user.id).run()

  const sid = uid()
  await c.env.DB.prepare('INSERT INTO sessions (id, user_id, created_at) VALUES (?, ?, ?)').bind(sid, user.id, Date.now()).run()

  // 추천 카운트
  const l1cnt = await c.env.DB.prepare('SELECT COUNT(*) as cnt FROM referrals WHERE referrer_id=? AND level=1').bind(user.id).first<{cnt:number}>()
  const l2cnt = await c.env.DB.prepare('SELECT COUNT(*) as cnt FROM referrals WHERE referrer_id=? AND level=2').bind(user.id).first<{cnt:number}>()

  return c.json({ success:true, sessionId:sid, user:{
    id: user.id, username: user.username, balance: user.balance,
    referralCode: user.referral_code, referralEarnings: user.referral_earnings,
    level1Count: l1cnt?.cnt || 0, level2Count: l2cnt?.cnt || 0,
    depositAddress: user.deposit_address, isAdmin: !!user.is_admin
  }})
})

app.post('/api/logout', async (c) => {
  const sid = c.req.header('X-Session-Id') || ''
  if (sid) await c.env.DB.prepare('DELETE FROM sessions WHERE id=?').bind(sid).run()
  return c.json({ success:true })
})

app.get('/api/me', async (c) => {
  const user = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  if (!user) return c.json({ error:'UNAUTH' }, 401)

  const l1cnt = await c.env.DB.prepare('SELECT COUNT(*) as cnt FROM referrals WHERE referrer_id=? AND level=1').bind(user.id).first<{cnt:number}>()
  const l2cnt = await c.env.DB.prepare('SELECT COUNT(*) as cnt FROM referrals WHERE referrer_id=? AND level=2').bind(user.id).first<{cnt:number}>()

  return c.json({
    id: user.id, username: user.username, balance: user.balance,
    referralCode: user.referral_code, referralEarnings: user.referral_earnings,
    totalEarned: user.total_earned,
    level1Count: l1cnt?.cnt || 0, level2Count: l2cnt?.cnt || 0,
    depositAddress: user.deposit_address,
    totalDeposit: user.total_deposit, totalWithdraw: user.total_withdraw,
    totalBetAmount: user.total_bet_amount, isAdmin: !!user.is_admin
  })
})

// ─────────────────────────────────────────────
// API: 입금
// ─────────────────────────────────────────────
app.post('/api/deposit/demo', async (c) => {
  const user = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  if (!user) return c.json({ error:'UNAUTH' }, 401)
  const { amount } = await c.req.json()
  const amt = parseFloat(amount)
  if (!amt || amt < 1) return c.json({ error:'INVALID_AMOUNT' }, 400)

  await c.env.DB.batch([
    c.env.DB.prepare('UPDATE users SET balance=balance+?, total_deposit=total_deposit+? WHERE id=?').bind(amt, amt, user.id),
    c.env.DB.prepare('INSERT INTO deposit_logs (id,user_id,username,amount,tx_hash,created_at) VALUES (?,?,?,?,?,?)').bind(uid(), user.id, user.username, amt, 'DEMO_'+uid(), Date.now())
  ])

  const updated = await getUser(c.env.DB, user.id)
  return c.json({ success:true, balance: updated?.balance || 0 })
})

// ─────────────────────────────────────────────
// API: 출금
// ─────────────────────────────────────────────
app.post('/api/withdraw', async (c) => {
  const user = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  if (!user) return c.json({ error:'UNAUTH' }, 401)

  const { amount, address } = await c.req.json()
  const amt = parseFloat(amount)
  if (!amt || amt < MIN_WITHDRAW_AMT)  return c.json({ error:'MIN_WITHDRAW' }, 400)
  if (amt > user.balance)              return c.json({ error:'INSUFFICIENT' }, 400)
  if (!address || address.length < 10) return c.json({ error:'INVALID_ADDR' }, 400)

  // 베팅 조건 확인
  const minBetRequired = user.total_deposit * 0.5
  if (user.total_bet_amount < minBetRequired)
    return c.json({ error:'BET_REQUIREMENT', required: minBetRequired, current: user.total_bet_amount }, 400)

  // 중복 출금 신청 확인
  const pending = await c.env.DB.prepare("SELECT id FROM withdraw_requests WHERE user_id=? AND status='pending'").bind(user.id).first()
  if (pending) return c.json({ error:'WITHDRAW_PENDING' }, 400)

  const reqId = uid()
  await c.env.DB.batch([
    c.env.DB.prepare('UPDATE users SET balance=balance-? WHERE id=?').bind(amt, user.id),
    c.env.DB.prepare('INSERT INTO withdraw_requests (id,user_id,username,amount,address,status,created_at) VALUES (?,?,?,?,?,?,?)').bind(reqId, user.id, user.username, amt, address, 'pending', Date.now())
  ])

  const updated = await getUser(c.env.DB, user.id)
  return c.json({ success:true, balance: updated?.balance || 0, requestId: reqId })
})

app.get('/api/withdraw/status', async (c) => {
  const user = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  if (!user) return c.json({ error:'UNAUTH' }, 401)
  const reqs = await c.env.DB.prepare('SELECT * FROM withdraw_requests WHERE user_id=? ORDER BY created_at DESC LIMIT 10').bind(user.id).all<any>()
  return c.json({ requests: reqs.results || [] })
})

// ─────────────────────────────────────────────
// API: 게임
// ─────────────────────────────────────────────
app.get('/api/round/current', async (c) => {
  const { phase, timeLeft, idx } = getPhase()
  const round = await ensureRound(c.env.DB, idx)
  if (!round) return c.json({ error:'ROUND_ERROR' }, 500)

  const bets = await c.env.DB.prepare('SELECT username, choice, amount, created_at FROM bets WHERE round_id=? ORDER BY created_at DESC LIMIT 10').bind(round.id).all<any>()

  return c.json({
    id: round.id, phase, status: phase === 'betting' ? 'betting' : 'finished',
    timeLeft, serverSeedHash: round.server_seed_hash, blockHeight: round.block_height,
    totalOdd: round.total_odd, totalEven: round.total_even, betCount: round.bet_count,
    result: round.result, hashValue: round.hash_value,
    serverSeed: phase === 'result' ? round.server_seed : null,
    recentBets: (bets.results||[]).map((b:any) => ({
      username: b.username.substring(0,2)+'**', choice: b.choice,
      amount: b.amount, timestamp: b.created_at
    }))
  })
})

app.post('/api/bet', async (c) => {
  const user = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  if (!user) return c.json({ error:'UNAUTH' }, 401)
  if (user.is_banned) return c.json({ error:'BANNED' }, 403)

  const { phase, idx } = getPhase()
  if (phase !== 'betting') return c.json({ error:'NOT_BETTING' }, 400)

  const round = await ensureRound(c.env.DB, idx)
  if (!round) return c.json({ error:'ROUND_ERROR' }, 500)

  const { choice, amount } = await c.req.json()
  if (choice !== 'odd' && choice !== 'even') return c.json({ error:'INVALID_CHOICE' }, 400)

  const amt = parseFloat(amount)
  if (!amt || amt < MIN_BET)  return c.json({ error:'MIN_BET' }, 400)
  if (amt > MAX_BET)          return c.json({ error:'MAX_BET' }, 400)
  if (amt > user.balance)     return c.json({ error:'INSUFFICIENT' }, 400)

  // 중복 베팅 확인
  const alreadyBet = await c.env.DB.prepare('SELECT id FROM bets WHERE round_id=? AND user_id=?').bind(round.id, user.id).first()
  if (alreadyBet) return c.json({ error:'ALREADY_BET' }, 400)

  const betId = uid()
  const now   = Date.now()
  const oddAdd  = choice === 'odd'  ? amt : 0
  const evenAdd = choice === 'even' ? amt : 0

  await c.env.DB.batch([
    c.env.DB.prepare('UPDATE users SET balance=balance-? WHERE id=?').bind(amt, user.id),
    c.env.DB.prepare('INSERT INTO bets (id,round_id,user_id,username,choice,amount,created_at) VALUES (?,?,?,?,?,?,?)').bind(betId, round.id, user.id, user.username, choice, amt, now),
    c.env.DB.prepare('UPDATE rounds SET total_odd=total_odd+?, total_even=total_even+?, bet_count=bet_count+1 WHERE id=?').bind(oddAdd, evenAdd, round.id)
  ])

  const updated = await getUser(c.env.DB, user.id)
  return c.json({ success:true, balance: updated?.balance || 0, bet:{ choice, amount:amt, roundId:round.id, serverSeedHash:round.server_seed_hash } })
})

// ─────────────────────────────────────────────
// API: 히스토리 & 통계
// ─────────────────────────────────────────────
app.get('/api/history', async (c) => {
  const history = await c.env.DB.prepare(`
    SELECT r.id as roundId, r.result, r.hash_value as hashValue, r.block_height as blockHeight,
           r.total_odd+r.total_even as totalBets, r.total_payout as totalPayout,
           r.created_at as timestamp, r.server_seed as serverSeed
    FROM rounds r WHERE r.settled=1 ORDER BY r.id DESC LIMIT 30
  `).all<any>()

  const stats = await c.env.DB.prepare(`
    SELECT
      COUNT(*) as totalGames,
      SUM(CASE WHEN result='odd' THEN 1 ELSE 0 END) as oddWins,
      SUM(CASE WHEN result='even' THEN 1 ELSE 0 END) as evenWins,
      (SELECT COALESCE(SUM(amount),0) FROM bets) as totalBetAmount,
      (SELECT COALESCE(SUM(payout),0) FROM bets) as totalPayoutAmount,
      (SELECT COALESCE(SUM(referral_earnings),0) FROM users) as totalReferralPaid,
      (SELECT COUNT(*) FROM users) as userCount
    FROM rounds WHERE settled=1
  `).first<any>()

  return c.json({ history: history.results || [], stats: stats || {} })
})

app.get('/api/stats', async (c) => {
  const stats = await c.env.DB.prepare(`
    SELECT
      COUNT(*) as totalGames,
      SUM(CASE WHEN result='odd' THEN 1 ELSE 0 END) as oddCount,
      SUM(CASE WHEN result='even' THEN 1 ELSE 0 END) as evenCount,
      (SELECT COALESCE(SUM(amount),0) FROM bets) as totalBetAmount,
      (SELECT COALESCE(SUM(payout),0) FROM bets) as totalPayoutAmount,
      (SELECT COALESCE(SUM(referral_earnings),0) FROM users) as totalReferralPaid,
      (SELECT COUNT(*) FROM users) as userCount
    FROM rounds WHERE settled=1
  `).first<any>()

  const total    = stats?.totalGames || 0
  const odd      = stats?.oddCount   || 0
  const even     = stats?.evenCount  || 0

  return c.json({
    totalGames: total, oddCount: odd, evenCount: even,
    oddRate:  total > 0 ? ((odd/total)*100).toFixed(2)  : '50.00',
    evenRate: total > 0 ? ((even/total)*100).toFixed(2) : '50.00',
    totalBetAmount:    stats?.totalBetAmount    || 0,
    totalPayoutAmount: stats?.totalPayoutAmount || 0,
    totalReferralPaid: stats?.totalReferralPaid || 0,
    userCount: stats?.userCount || 0
  })
})

app.get('/api/feed', async (c) => {
  const bets = await c.env.DB.prepare(`
    SELECT b.username, b.choice, b.amount, b.win, b.payout, b.round_id as roundId, b.created_at as timestamp
    FROM bets b WHERE b.settled=1 ORDER BY b.created_at DESC LIMIT 20
  `).all<any>()

  return c.json({ recentBets: (bets.results||[]).map((b:any) => ({
    username: b.username.substring(0,2)+'**', choice:b.choice,
    amount:b.amount, win:!!b.win, payout:b.payout, roundId:b.roundId, timestamp:b.timestamp
  }))})
})

// ─────────────────────────────────────────────
// API: 마이페이지
// ─────────────────────────────────────────────
app.get('/api/mypage', async (c) => {
  const user = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  if (!user) return c.json({ error:'UNAUTH' }, 401)

  const bets = await c.env.DB.prepare(`
    SELECT b.*, r.result FROM bets b
    JOIN rounds r ON b.round_id = r.id
    WHERE b.user_id=? AND b.settled=1
    ORDER BY b.created_at DESC LIMIT 50
  `).bind(user.id).all<any>()

  const myBets = bets.results || []
  const wins   = myBets.filter((b:any) => b.win).length
  const total  = myBets.length
  const totalWagered = myBets.reduce((s:number, b:any) => s + b.amount, 0)
  const totalWon     = myBets.filter((b:any) => b.win).reduce((s:number, b:any) => s + b.payout, 0)

  return c.json({
    bets: myBets.map((b:any) => ({
      roundId: b.round_id, choice: b.choice, result: b.result,
      amount: b.amount, win: !!b.win, payout: b.payout, timestamp: b.created_at
    })),
    stats: {
      totalGames: total, wins, losses: total - wins,
      winRate: total > 0 ? ((wins/total)*100).toFixed(1) : '0',
      totalWagered: r2(totalWagered), totalWon: r2(totalWon),
      netProfit: r2(totalWon - totalWagered),
      referralEarnings: user.referral_earnings
    }
  })
})

// ─────────────────────────────────────────────
// API: 추천
// ─────────────────────────────────────────────
app.get('/api/referral', async (c) => {
  const user = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  if (!user) return c.json({ error:'UNAUTH' }, 401)

  const l1 = await c.env.DB.prepare(`
    SELECT u.username, u.created_at FROM referrals r
    JOIN users u ON r.referee_id = u.id
    WHERE r.referrer_id=? AND r.level=1 ORDER BY r.created_at DESC
  `).bind(user.id).all<any>()

  const l2cnt = await c.env.DB.prepare('SELECT COUNT(*) as cnt FROM referrals WHERE referrer_id=? AND level=2').bind(user.id).first<{cnt:number}>()

  return c.json({
    referralCode: user.referral_code,
    referralEarnings: user.referral_earnings,
    level1: {
      count: l1.results?.length || 0, rate:'2.5%',
      users: (l1.results||[]).map((u:any) => ({ username: u.username.substring(0,2)+'**', joinedAt: u.created_at }))
    },
    level2: { count: l2cnt?.cnt || 0, rate:'1.0%' }
  })
})

// ─────────────────────────────────────────────
// API: 검증
// ─────────────────────────────────────────────
app.post('/api/verify', async (c) => {
  const { serverSeed, blockHeight, userSeeds } = await c.req.json()
  const hash = await sha256(serverSeed + blockHeight + (userSeeds||''))
  return c.json({ hash, result: isOdd(hash) ? 'odd' : 'even', lastChar: hash[hash.length-1] })
})

// ─────────────────────────────────────────────
// API: 관리자
// ─────────────────────────────────────────────
async function checkAdmin(db: D1Database, sid: string): Promise<boolean> {
  const user = await getUserBySid(db, sid)
  return !!(user && user.is_admin)
}

app.get('/api/admin/stats', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)

  const stats = await c.env.DB.prepare(`
    SELECT
      (SELECT COUNT(*) FROM users) as totalUsers,
      (SELECT COALESCE(SUM(amount),0) FROM bets) as totalBetAmount,
      (SELECT COALESCE(SUM(payout),0) FROM bets) as totalPayoutAmount,
      (SELECT COALESCE(SUM(referral_earnings),0) FROM users) as totalReferralPaid,
      (SELECT COUNT(*) FROM withdraw_requests WHERE status='pending') as pendingWithdrawCount,
      (SELECT COALESCE(SUM(amount),0) FROM withdraw_requests WHERE status='pending') as pendingWithdrawAmount,
      (SELECT COUNT(*) FROM rounds WHERE settled=1) as totalGames
  `).first<any>()

  const houseProfit = r2((stats?.totalBetAmount||0) - (stats?.totalPayoutAmount||0) - (stats?.totalReferralPaid||0))

  return c.json({ ...stats, houseProfit })
})

app.get('/api/admin/withdraws', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const reqs = await c.env.DB.prepare('SELECT * FROM withdraw_requests ORDER BY created_at DESC LIMIT 50').all<any>()
  return c.json({ requests: reqs.results || [] })
})

app.post('/api/admin/withdraw/approve', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const { requestId, txHash } = await c.req.json()
  const req = await c.env.DB.prepare('SELECT * FROM withdraw_requests WHERE id=?').bind(requestId).first<any>()
  if (!req) return c.json({ error:'NOT_FOUND' }, 404)
  if (req.status !== 'pending') return c.json({ error:'ALREADY_PROCESSED' }, 400)

  const finalTx = txHash || 'TX_'+uid()
  await c.env.DB.batch([
    c.env.DB.prepare("UPDATE withdraw_requests SET status='approved', processed_at=?, tx_hash=? WHERE id=?").bind(Date.now(), finalTx, requestId),
    c.env.DB.prepare('UPDATE users SET total_withdraw=total_withdraw+? WHERE id=?').bind(req.amount, req.user_id)
  ])
  return c.json({ success:true })
})

app.post('/api/admin/withdraw/reject', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const { requestId, note } = await c.req.json()
  const req = await c.env.DB.prepare('SELECT * FROM withdraw_requests WHERE id=?').bind(requestId).first<any>()
  if (!req) return c.json({ error:'NOT_FOUND' }, 404)
  if (req.status !== 'pending') return c.json({ error:'ALREADY_PROCESSED' }, 400)

  await c.env.DB.batch([
    c.env.DB.prepare("UPDATE withdraw_requests SET status='rejected', processed_at=?, note=? WHERE id=?").bind(Date.now(), note||'', requestId),
    c.env.DB.prepare('UPDATE users SET balance=balance+? WHERE id=?').bind(req.amount, req.user_id)
  ])
  return c.json({ success:true })
})

app.get('/api/admin/users', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const users = await c.env.DB.prepare(`
    SELECT id, username, balance, total_deposit, total_withdraw, total_bet_amount,
           referral_earnings, is_admin, is_banned, created_at, last_ip, login_count
    FROM users ORDER BY created_at DESC
  `).all<any>()
  return c.json({ users: (users.results||[]).map((u:any) => ({
    id: u.id, username: u.username, balance: u.balance,
    totalDeposit: u.total_deposit, totalWithdraw: u.total_withdraw,
    totalBetAmount: u.total_bet_amount, referralEarnings: u.referral_earnings,
    isAdmin: !!u.is_admin, isBanned: !!u.is_banned,
    createdAt: u.created_at, lastIp: u.last_ip, loginCount: u.login_count
  }))})
})

app.post('/api/admin/user/balance', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const { userId, amount, type } = await c.req.json()
  const amt = parseFloat(amount)
  if (!amt) return c.json({ error:'INVALID_AMOUNT' }, 400)

  const logId = uid()
  if (type === 'set') {
    await c.env.DB.batch([
      c.env.DB.prepare('UPDATE users SET balance=? WHERE id=?').bind(amt, userId),
      c.env.DB.prepare('INSERT INTO deposit_logs (id,user_id,username,amount,tx_hash,created_at) SELECT ?,id,username,?,?,? FROM users WHERE id=?').bind(logId, amt, 'ADMIN_SET_'+uid(), Date.now(), userId)
    ])
  } else {
    await c.env.DB.batch([
      c.env.DB.prepare('UPDATE users SET balance=balance+?, total_deposit=total_deposit+? WHERE id=?').bind(amt, amt, userId),
      c.env.DB.prepare('INSERT INTO deposit_logs (id,user_id,username,amount,tx_hash,created_at) SELECT ?,id,username,?,?,? FROM users WHERE id=?').bind(logId, amt, 'ADMIN_ADD_'+uid(), Date.now(), userId)
    ])
  }
  const updated = await getUser(c.env.DB, userId)
  return c.json({ success:true, balance: updated?.balance || 0 })
})

app.post('/api/admin/user/ban', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const { userId, ban } = await c.req.json()
  await c.env.DB.prepare('UPDATE users SET is_banned=? WHERE id=?').bind(ban ? 1 : 0, userId).run()
  return c.json({ success:true })
})

app.get('/api/admin/deposits', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const logs = await c.env.DB.prepare('SELECT * FROM deposit_logs ORDER BY created_at DESC LIMIT 50').all<any>()
  return c.json({ deposits: logs.results || [] })
})

// ─────────────────────────────────────────────
// 정적/기본 라우트
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
.admin-card{background:linear-gradient(135deg,rgba(255,165,0,.1),rgba(255,165,0,.05));border:1px solid rgba(255,165,0,.3)}
.status-pending{color:#f6ad55;background:rgba(246,173,85,.1);border:1px solid rgba(246,173,85,.3);padding:1px 8px;border-radius:99px}
.status-approved{color:#68d391;background:rgba(104,211,145,.1);border:1px solid rgba(104,211,145,.3);padding:1px 8px;border-radius:99px}
.status-rejected{color:#fc8181;background:rgba(252,129,129,.1);border:1px solid rgba(252,129,129,.3);padding:1px 8px;border-radius:99px}
</style>
</head>
<body class="text-white">

<!-- 헤더 -->
<header class="sticky top-0 z-50 border-b border-white/10" style="background:rgba(10,8,30,.97);backdrop-filter:blur(20px)">
  <div class="max-w-6xl mx-auto px-3 py-2.5 flex items-center justify-between gap-2">
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
    <div class="flex items-center gap-1">
      <button onclick="setLang('ko')" id="lang-ko" class="lang-btn active">🇰🇷</button>
      <button onclick="setLang('en')" id="lang-en" class="lang-btn">🇺🇸</button>
      <button onclick="setLang('zh')" id="lang-zh" class="lang-btn">🇨🇳</button>
      <button onclick="setLang('ja')" id="lang-ja" class="lang-btn">🇯🇵</button>
    </div>
    <div id="hdrGuest" class="flex gap-1.5 shrink-0">
      <button onclick="showTab('login')" class="px-3 py-1.5 text-xs border border-white/20 rounded-lg hover:bg-white/10 transition" data-i18n="login">로그인</button>
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
    <button onclick="showTab('mypage')"    id="t-mypage"    class="tab-off hidden px-4 py-2.5 text-xs font-bold transition" data-i18n="tab_mypage">👤 마이페이지</button>
    <button onclick="showTab('wallet')"    id="t-wallet"    class="tab-off hidden px-4 py-2.5 text-xs font-bold transition" data-i18n="tab_wallet">💰 지갑</button>
    <button onclick="showTab('dashboard')" id="t-dashboard" class="tab-off px-4 py-2.5 text-xs font-bold transition" data-i18n="tab_dashboard">📊 투명성</button>
    <button onclick="showTab('referral')"  id="t-referral"  class="tab-off px-4 py-2.5 text-xs font-bold transition" data-i18n="tab_referral">👥 추천수당</button>
    <button onclick="showTab('verify')"    id="t-verify"    class="tab-off px-4 py-2.5 text-xs font-bold transition" data-i18n="tab_verify">🔍 검증</button>
    <button onclick="showTab('login')"     id="t-login"     class="tab-off px-4 py-2.5 text-xs font-bold transition" data-i18n="login">🔐 로그인</button>
    <button onclick="showTab('register')"  id="t-register"  class="tab-off px-4 py-2.5 text-xs font-bold transition" data-i18n="register">✍️ 가입</button>
    <button onclick="showTab('admin')"     id="t-admin"     class="tab-off hidden px-4 py-2.5 text-xs font-bold transition text-yellow-400">⚙️ 관리자</button>
  </div>
</nav>

<main class="max-w-6xl mx-auto px-3 py-4">

<!-- ══ 게임 탭 ══ -->
<div id="p-game" class="hidden">
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <div class="lg:col-span-2 space-y-4">
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
      <div class="glass rounded-2xl p-5">
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-center">
            <div class="text-red-400 font-bold text-sm mb-1">🔴 <span data-i18n="odd">홀 (ODD)</span></div>
            <div class="text-xl font-black" id="gTotalOdd">0 USDT</div>
            <div class="text-xs text-gray-400 mt-0.5" id="gBetCount">0 <span data-i18n="players">명</span></div>
          </div>
          <div class="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-center">
            <div class="text-blue-400 font-bold text-sm mb-1">🔵 <span data-i18n="even">짝 (EVEN)</span></div>
            <div class="text-xl font-black" id="gTotalEven">0 USDT</div>
            <div class="text-xs text-gray-400 mt-0.5" id="gTotalPool"><span data-i18n="total_pool">총 풀</span>: 0</div>
          </div>
        </div>
        <div id="betArea">
          <div class="mb-3">
            <label class="text-xs text-gray-400 block mb-1.5" data-i18n="bet_amount_label">베팅 금액 (USDT, 최소 0.1)</label>
            <input type="number" id="betAmt" placeholder="0.00 USDT" min="0.1" max="1000" step="0.1"
              class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-lg font-black focus:outline-none focus:border-green-400 placeholder-gray-600">
            <div class="flex gap-1.5 mt-2 flex-wrap">
              <button onclick="addBet(1)"   class="px-2 py-1 text-xs bg-white/10 rounded-lg hover:bg-white/20 transition">+1</button>
              <button onclick="addBet(5)"   class="px-2 py-1 text-xs bg-white/10 rounded-lg hover:bg-white/20 transition">+5</button>
              <button onclick="addBet(10)"  class="px-2 py-1 text-xs bg-white/10 rounded-lg hover:bg-white/20 transition">+10</button>
              <button onclick="addBet(50)"  class="px-2 py-1 text-xs bg-white/10 rounded-lg hover:bg-white/20 transition">+50</button>
              <button onclick="addBet(100)" class="px-2 py-1 text-xs bg-white/10 rounded-lg hover:bg-white/20 transition">+100</button>
              <button onclick="maxBet()"    class="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition">MAX</button>
              <button onclick="clearBet()"  class="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition" data-i18n="clear">초기화</button>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <button onclick="doBet('odd')"  id="btnOdd"  class="btn-odd ring-odd text-white font-black text-xl py-5 rounded-xl transition active:scale-95 shadow-lg">🔴 <span data-i18n="odd_bet">홀 베팅</span></button>
            <button onclick="doBet('even')" id="btnEven" class="btn-even ring-even text-white font-black text-xl py-5 rounded-xl transition active:scale-95 shadow-lg">🔵 <span data-i18n="even_bet">짝 베팅</span></button>
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

<!-- ══ 마이페이지 탭 ══ -->
<div id="p-mypage" class="hidden">
  <div class="mb-4"><h2 class="text-xl font-black mb-1" data-i18n="mypage_title">👤 마이페이지</h2></div>
  <div id="mypageNeedLogin" class="glass rounded-xl p-8 text-center">
    <div class="text-gray-400 mb-3 text-sm" data-i18n="need_login">로그인이 필요합니다</div>
    <button onclick="showTab('login')" class="px-6 py-2 bg-blue-600 rounded-xl hover:bg-blue-700 transition text-sm font-bold" data-i18n="login">로그인</button>
  </div>
  <div id="mypageInfo" class="hidden space-y-4">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div class="glass rounded-xl p-3 text-center"><div class="text-2xl font-black text-blue-400" id="mpTotalGames">0</div><div class="text-xs text-gray-400 mt-1" data-i18n="total_games">총 게임</div></div>
      <div class="glass rounded-xl p-3 text-center"><div class="text-2xl font-black text-green-400" id="mpWinRate">0%</div><div class="text-xs text-gray-400 mt-1" data-i18n="win_rate">승률</div></div>
      <div class="glass rounded-xl p-3 text-center"><div class="text-2xl font-black text-yellow-400" id="mpNetProfit">0</div><div class="text-xs text-gray-400 mt-1" data-i18n="net_profit">순손익(USDT)</div></div>
      <div class="glass rounded-xl p-3 text-center"><div class="text-2xl font-black text-purple-400" id="mpRefEarnings">0</div><div class="text-xs text-gray-400 mt-1" data-i18n="ref_earnings">추천수당</div></div>
    </div>
    <div class="glass rounded-xl p-4">
      <div class="font-bold mb-3 text-sm" data-i18n="my_bet_history">📋 내 베팅 내역</div>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead><tr class="text-gray-400 border-b border-white/10 text-left">
            <th class="py-1.5 px-2" data-i18n="round">라운드</th>
            <th class="py-1.5 px-2" data-i18n="choice">선택</th>
            <th class="py-1.5 px-2" data-i18n="result">결과</th>
            <th class="py-1.5 px-2 text-right" data-i18n="bet_amount">베팅액</th>
            <th class="py-1.5 px-2 text-right" data-i18n="payout">수령액</th>
            <th class="py-1.5 px-2 text-right" data-i18n="time">시간</th>
          </tr></thead>
          <tbody id="mpBetTable"><tr><td colspan="6" class="text-center text-gray-500 py-3" data-i18n="no_record">기록 없음</td></tr></tbody>
        </table>
      </div>
    </div>
    <div class="glass rounded-xl p-4">
      <div class="font-bold mb-3 text-sm" data-i18n="withdraw_history">📤 출금 내역</div>
      <div id="wdHistory" class="space-y-2"><div class="text-xs text-gray-500 text-center py-2" data-i18n="no_record">기록 없음</div></div>
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
    <div class="wallet-card rounded-2xl p-5">
      <div class="flex items-center justify-between mb-3">
        <div>
          <div class="text-xs text-gray-400 mb-1" data-i18n="total_balance">총 잔액</div>
          <div class="text-4xl font-black usdt" id="wBal">0.00 USDT</div>
        </div>
        <div class="text-4xl opacity-50">₮</div>
      </div>
      <div class="grid grid-cols-3 gap-3 text-center">
        <div class="bg-black/20 rounded-xl p-3"><div class="text-xs text-gray-400 mb-1" data-i18n="total_deposit">총 입금</div><div class="font-bold text-green-400 text-sm" id="wTotalDep">0 USDT</div></div>
        <div class="bg-black/20 rounded-xl p-3"><div class="text-xs text-gray-400 mb-1" data-i18n="total_withdraw">총 출금</div><div class="font-bold text-red-400 text-sm" id="wTotalWd">0 USDT</div></div>
        <div class="bg-black/20 rounded-xl p-3"><div class="text-xs text-gray-400 mb-1" data-i18n="total_bet_amount">누적 베팅</div><div class="font-bold text-blue-400 text-sm" id="wTotalBet">0 USDT</div></div>
      </div>
    </div>
    <div class="glass rounded-2xl p-5">
      <div class="font-bold mb-3 text-green-400" data-i18n="deposit_title">📥 USDT 입금</div>
      <div class="bg-black/30 border border-green-500/30 rounded-xl p-4 mb-3">
        <div class="text-xs text-gray-400 mb-1" data-i18n="deposit_addr">입금 주소 (TRC20)</div>
        <div class="mono text-xs text-green-400 break-all font-bold" id="wDepAddr">-</div>
        <button onclick="copyAddr()" class="mt-2 px-3 py-1.5 bg-green-600/20 border border-green-600/30 rounded-lg text-xs text-green-400 hover:bg-green-600/30 transition" data-i18n="copy_addr">📋 주소 복사</button>
      </div>
      <div class="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-xs text-yellow-400 mb-3">
        <i class="fas fa-exclamation-triangle mr-1"></i>
        <span data-i18n="deposit_warning">반드시 TRC20(TRON) 네트워크로 입금하세요.</span>
      </div>
      <div class="border-t border-white/10 pt-3">
        <div class="text-xs text-gray-400 mb-2" data-i18n="demo_deposit">🧪 데모 입금 (테스트용)</div>
        <div class="flex gap-2">
          <input type="number" id="demoDepAmt" placeholder="10" min="1" step="1" class="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-400">
          <span class="flex items-center text-xs text-gray-400">USDT</span>
          <button onclick="demoDeposit()" class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-bold transition" data-i18n="deposit_btn">입금</button>
        </div>
      </div>
    </div>
    <div class="glass rounded-2xl p-5">
      <div class="font-bold mb-3 text-red-400" data-i18n="withdraw_title">📤 USDT 출금</div>
      <div class="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300 mb-3">
        <i class="fas fa-info-circle mr-1"></i>
        <span data-i18n="withdraw_condition">출금 조건: 입금액의 50% 이상 베팅 필요</span>
      </div>
      <div class="mb-2">
        <div class="flex justify-between text-xs mb-1">
          <span class="text-gray-400" data-i18n="bet_progress">베팅 달성</span>
          <span id="wBetProgress" class="text-blue-400 font-bold">0 / 0 USDT</span>
        </div>
        <div class="w-full bg-white/10 rounded-full h-2">
          <div id="wBetBar" class="h-2 rounded-full bg-blue-500 transition-all" style="width:0%"></div>
        </div>
      </div>
      <div class="space-y-3 mt-3">
        <div><label class="text-xs text-gray-400 block mb-1" data-i18n="withdraw_addr">출금 주소 (TRC20)</label><input type="text" id="wdAddr" placeholder="T..." class="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm mono focus:outline-none focus:border-red-400"></div>
        <div><label class="text-xs text-gray-400 block mb-1" data-i18n="withdraw_amount">출금 금액 (USDT, 최소 1)</label>
          <div class="flex gap-2">
            <input type="number" id="wdAmt" placeholder="0.00" min="1" step="0.01" class="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-red-400">
            <button onclick="setMaxWd()" class="px-3 py-2 bg-white/10 rounded-lg text-xs hover:bg-white/20 transition">MAX</button>
          </div>
        </div>
        <div id="wdErr" class="hidden text-red-400 text-xs bg-red-500/10 rounded-lg p-2"></div>
        <div id="wdOk"  class="hidden text-green-400 text-xs bg-green-500/10 rounded-lg p-2"></div>
        <button onclick="doWithdraw()" class="w-full py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold transition text-sm" data-i18n="withdraw_btn">출금 신청</button>
      </div>
    </div>
  </div>
</div>

<!-- ══ 투명성 탭 ══ -->
<div id="p-dashboard" class="hidden">
  <div class="mb-4"><h2 class="text-xl font-black mb-1" data-i18n="dash_title">📊 투명성 대시보드</h2><p class="text-gray-400 text-sm" data-i18n="dash_desc">모든 데이터 실시간 공개</p></div>
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
        <div><div class="flex justify-between text-xs mb-1"><span class="text-gray-300" data-i18n="house_net">운영 수수료</span><span class="text-yellow-400 font-black">6.5%</span></div><div class="w-full bg-white/10 rounded-full h-2.5"><div class="h-2.5 rounded-full bg-yellow-500" style="width:65%"></div></div></div>
      </div>
    </div>
    <div class="glass rounded-xl p-4">
      <div class="font-bold mb-3 text-sm" data-i18n="realtime_stats">📈 실시간 통계</div>
      <div class="space-y-2 text-xs">
        <div class="flex justify-between"><span class="text-gray-400" data-i18n="total_bet">총 베팅</span><span class="font-bold usdt" id="dTotalBet">0 USDT</span></div>
        <div class="flex justify-between"><span class="text-gray-400" data-i18n="total_payout">총 지급</span><span class="font-bold text-green-400" id="dTotalPayout">0 USDT</span></div>
        <div class="flex justify-between"><span class="text-gray-400" data-i18n="ref_paid">추천수당 지급</span><span class="font-bold text-blue-400" id="dRefPaid">0 USDT</span></div>
        <div class="flex justify-between"><span class="text-gray-400" data-i18n="user_rtp">유저 실제 RTP</span><span class="font-bold text-green-400" id="dActualRTP">-</span></div>
        <div class="flex justify-between"><span class="text-gray-400" data-i18n="theory_rtp">이론 RTP</span><span class="font-bold text-gray-300">90.00%</span></div>
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
        <div><label class="text-xs text-gray-400 block mb-1" data-i18n="sim_bet">1인 일 베팅(USDT)</label><input type="number" id="sBet" value="50" min="1" oninput="calcSim()" class="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-sm"></div>
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
      <div class="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3"><div class="text-blue-400 font-bold mb-1 text-xs" data-i18n="v1_title">① 서버 시드</div><div class="text-xs text-gray-400" data-i18n="v1_desc">라운드 전 SHA256 해시 공개.</div></div>
      <div class="bg-green-500/10 border border-green-500/20 rounded-xl p-3"><div class="text-green-400 font-bold mb-1 text-xs" data-i18n="v2_title">② 유저 시드</div><div class="text-xs text-gray-400" data-i18n="v2_desc">참여자 ID 합산. 조작 원천 차단.</div></div>
      <div class="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3"><div class="text-yellow-400 font-bold mb-1 text-xs" data-i18n="v3_title">③ 블록 높이</div><div class="text-xs text-gray-400" data-i18n="v3_desc">비트코인 블록높이 추가 난수 소스.</div></div>
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
        <div><label class="text-xs text-gray-400 block mb-1" data-i18n="username">아이디 (3자 이상)</label><input type="text" id="rUser" autocomplete="username" class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-400 text-sm"></div>
        <div><label class="text-xs text-gray-400 block mb-1" data-i18n="password">비밀번호 (6자 이상)</label><input type="password" id="rPass" autocomplete="new-password" class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-400 text-sm"></div>
        <div><label class="text-xs text-gray-400 block mb-1" data-i18n="ref_code_opt">추천코드 (선택)</label><input type="text" id="rRef" class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-400 text-sm mono"></div>
        <div id="rErr" class="hidden text-red-400 text-xs text-center bg-red-500/10 rounded-lg py-2"></div>
        <div id="rOk"  class="hidden text-green-400 text-xs text-center bg-green-500/10 rounded-lg py-2"></div>
        <button type="submit" class="w-full py-3 bg-green-600 hover:bg-green-700 rounded-xl font-black transition" data-i18n="register_btn">🎁 회원가입</button>
        <div class="text-center text-xs text-gray-400"><span data-i18n="have_account">이미 계정?</span> <a onclick="showTab('login')" class="text-blue-400 cursor-pointer hover:underline" data-i18n="login">로그인</a></div>
      </form>
    </div>
  </div>
</div>

<!-- ══ 관리자 탭 ══ -->
<div id="p-admin" class="hidden">
  <div class="mb-4"><h2 class="text-xl font-black mb-1 text-yellow-400">⚙️ 관리자 페이지</h2></div>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
    <div class="admin-card rounded-xl p-3 text-center"><div class="text-2xl font-black text-yellow-400" id="adTotalUsers">0</div><div class="text-xs text-gray-400 mt-1">전체 유저</div></div>
    <div class="admin-card rounded-xl p-3 text-center"><div class="text-2xl font-black text-green-400" id="adTotalBet">0</div><div class="text-xs text-gray-400 mt-1">총 베팅(USDT)</div></div>
    <div class="admin-card rounded-xl p-3 text-center"><div class="text-2xl font-black text-red-400" id="adPendingWd">0</div><div class="text-xs text-gray-400 mt-1">대기 출금</div></div>
    <div class="admin-card rounded-xl p-3 text-center"><div class="text-2xl font-black text-blue-400" id="adPendingAmt">0</div><div class="text-xs text-gray-400 mt-1">출금 대기액</div></div>
  </div>
  <div class="glass rounded-xl p-4 mb-4">
    <div class="flex items-center justify-between mb-3">
      <div class="font-bold text-sm text-yellow-400">📤 출금 요청 관리</div>
      <button onclick="loadAdminWithdraws()" class="px-3 py-1 bg-white/10 rounded-lg text-xs hover:bg-white/20 transition">🔄 새로고침</button>
    </div>
    <div id="adWithdrawList" class="space-y-2"><div class="text-xs text-gray-500 text-center py-3">로딩 중...</div></div>
  </div>
  <div class="glass rounded-xl p-4 mb-4">
    <div class="flex items-center justify-between mb-3">
      <div class="font-bold text-sm text-yellow-400">👤 유저 관리</div>
      <button onclick="loadAdminUsers()" class="px-3 py-1 bg-white/10 rounded-lg text-xs hover:bg-white/20 transition">🔄 새로고침</button>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-xs">
        <thead><tr class="text-gray-400 border-b border-white/10 text-left">
          <th class="py-1.5 px-2">아이디</th><th class="py-1.5 px-2 text-right">잔액</th>
          <th class="py-1.5 px-2 text-right">총입금</th><th class="py-1.5 px-2 text-right">총베팅</th>
          <th class="py-1.5 px-2">상태</th><th class="py-1.5 px-2">관리</th>
        </tr></thead>
        <tbody id="adUserTable"><tr><td colspan="6" class="text-center text-gray-500 py-3">로딩 중...</td></tr></tbody>
      </table>
    </div>
  </div>
  <div id="adBalModal" class="hidden glass rounded-xl p-4 mb-4 border border-yellow-500/30">
    <div class="font-bold text-sm text-yellow-400 mb-3">💰 잔액 조정</div>
    <div class="space-y-2">
      <div class="text-xs text-gray-400">유저: <span id="adBalUser" class="text-white font-bold">-</span></div>
      <input type="hidden" id="adBalUserId">
      <div class="flex gap-2">
        <input type="number" id="adBalAmt" placeholder="금액" min="0" step="0.01" class="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400">
        <span class="flex items-center text-xs text-gray-400">USDT</span>
      </div>
      <div class="flex gap-2">
        <button onclick="adminAdjBal('add')" class="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-xs font-bold transition">+ 추가</button>
        <button onclick="adminAdjBal('set')" class="flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-xs font-bold transition">= 설정</button>
        <button onclick="document.getElementById('adBalModal').classList.add('hidden')" class="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs transition">취소</button>
      </div>
    </div>
  </div>
</div>

</main>

<div id="toast" class="fixed bottom-5 right-4 z-50 hidden max-w-xs w-full px-2">
  <div id="toastMsg" class="glass rounded-xl px-4 py-3 text-sm font-bold shadow-2xl slide"></div>
</div>

<script src="/static/app.js"></script>
</body>
</html>`

export default app
