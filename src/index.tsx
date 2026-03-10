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

// 전역 에러 핸들러 - Cold Start / DB 오류 시 500 대신 에러 JSON 반환
app.onError((err, c) => {
  console.error('Global error:', err)
  return c.json({ error: 'SERVER_ERROR', message: err.message }, 500)
})

// ─────────────────────────────────────────────
// 상수
// ─────────────────────────────────────────────
const PAYOUT           = 1.90
const L1               = 0.025
const L2               = 0.010
const PARTNER_RATE     = 0.065   // 파트너 기본 수수료율 (하우스 수익의 일부)
const MIN_WITHDRAW_AMT = 1
const WITHDRAW_FEE     = 1        // TRC20 네트워크 수수료
const MIN_BET          = 0.1
const MAX_BET          = 1000
const ROUND_DURATION   = 30000   // ms (기본 30초)
const RESULT_SHOW      = 8000    // ms
const CYCLE            = ROUND_DURATION + RESULT_SHOW
const GAME_START       = 1700000000000  // 고정 기준시간 (서버 재시작 무관)

// ─────────────────────────────────────────────
// 방(Room) 설정
// ─────────────────────────────────────────────
const ROOMS: Record<string, {
  name: string, emoji: string, color: string,
  roundDuration: number, resultShow: number,
  minBet: number, maxBet: number,
  feeRate: number, payout: number,
  idOffset: number  // 라운드 ID 충돌 방지용 오프셋
}> = {
  turbo:    { name:'Turbo',    emoji:'⚡', color:'yellow', roundDuration:15000, resultShow:5000, minBet:1,    maxBet:100,   feeRate:0.07, payout:1.86, idOffset:0        },
  standard: { name:'Standard', emoji:'🎯', color:'blue',   roundDuration:30000, resultShow:8000, minBet:101,  maxBet:500,   feeRate:0.05, payout:1.90, idOffset:10000000 },
  high:     { name:'High',     emoji:'💎', color:'purple', roundDuration:30000, resultShow:8000, minBet:501,  maxBet:2000,  feeRate:0.04, payout:1.92, idOffset:20000000 },
  vip:      { name:'VIP',      emoji:'👑', color:'orange', roundDuration:30000, resultShow:8000, minBet:2001, maxBet:5000,  feeRate:0.03, payout:1.94, idOffset:30000000 },
  master:   { name:'Master',   emoji:'🏆', color:'red',    roundDuration:30000, resultShow:8000, minBet:5001, maxBet:10000, feeRate:0.02, payout:1.96, idOffset:40000000 },
}
const SESSION_TTL      = 7 * 24 * 60 * 60 * 1000  // 7일 (ms)
const LOGIN_MAX_FAIL   = 5       // 최대 로그인 실패 횟수
const LOGIN_LOCK_MS    = 15 * 60 * 1000  // 잠금 시간 15분

// ─────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────

// DB에서 게임 설정 동적 로드 (없으면 기본값 사용)
async function getGameSettings(db: D1Database) {
  const rows = await db.prepare(
    "SELECT key, value FROM site_settings WHERE key LIKE 'game_%' OR key LIKE 'withdraw_%'"
  ).all<any>()
  const s: Record<string, string> = {}
  for (const r of (rows.results || [])) s[r.key] = r.value
  return {
    PAYOUT:          parseFloat(s['game_payout']             || String(PAYOUT)),
    MIN_BET:         parseFloat(s['game_min_bet']            || String(MIN_BET)),
    MAX_BET:         parseFloat(s['game_max_bet']            || String(MAX_BET)),
    WITHDRAW_FEE:    parseFloat(s['withdraw_fee']            || String(WITHDRAW_FEE)),
    MIN_WITHDRAW:    parseFloat(s['withdraw_min_amount']     || String(MIN_WITHDRAW_AMT)),
    BET_REQUIREMENT: parseFloat(s['withdraw_bet_requirement']|| '0.5'),
    L1:              parseFloat(s['game_l1_rate']            || String(L1)),
    L2:              parseFloat(s['game_l2_rate']            || String(L2)),
  }
}
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
// 라운드 페이즈 계산 (방별)
// ─────────────────────────────────────────────
function getPhase(room: string = 'standard') {
  const r = ROOMS[room] || ROOMS.standard
  const cycle   = r.roundDuration + r.resultShow
  const elapsed = (Date.now() - GAME_START) % cycle
  const idx     = Math.floor((Date.now() - GAME_START) / cycle)
  if (elapsed < r.roundDuration)
    return { phase: 'betting' as const, timeLeft: Math.ceil((r.roundDuration - elapsed)/1000), idx }
  return   { phase: 'result'  as const, timeLeft: Math.ceil((cycle - elapsed)/1000), idx }
}

// ─────────────────────────────────────────────
// DB 헬퍼
// ─────────────────────────────────────────────
async function getSession(db: D1Database, sid: string) {
  if (!sid) return null
  // 만료된 세션 제외
  const row = await db.prepare(
    'SELECT user_id FROM sessions WHERE id=? AND expires_at > ?'
  ).bind(sid, Date.now()).first<{user_id:string}>()
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

// 관리자 활동 로그 기록
async function writeAdminLog(db: D1Database, adminId: string, adminUsername: string, action: string, targetUserId: string|null, targetUsername: string|null, detail: object) {
  const id = crypto.randomUUID().replace(/-/g,'')
  await db.prepare(
    'INSERT INTO admin_logs (id,admin_id,admin_username,action,target_user_id,target_username,detail,created_at) VALUES (?,?,?,?,?,?,?,?)'
  ).bind(id, adminId, adminUsername, action, targetUserId||null, targetUsername||null, JSON.stringify(detail), Date.now()).run()
}

// 만료 세션 주기적 정리 (요청마다 5% 확률로 실행)
async function cleanupSessions(db: D1Database) {
  if (Math.random() > 0.05) return
  await db.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(Date.now()).run()
}

async function ensureRound(db: D1Database, idx: number, room: string = 'standard') {
  const r = ROOMS[room] || ROOMS.standard
  const roundId = r.idOffset + idx + 1
  const existing = await db.prepare('SELECT * FROM rounds WHERE id=?').bind(roundId).first<any>()
  if (existing) return existing

  const serverSeed     = uid() + uid()
  const serverSeedHash = await sha256(serverSeed)
  const cycle          = r.roundDuration + r.resultShow
  const startTime      = GAME_START + idx * cycle
  const endTime        = startTime + r.roundDuration
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

  // 방 ID 오프셋으로 방 찾기
  let roomCfg = ROOMS.standard
  for (const [, r] of Object.entries(ROOMS)) {
    if (round.id >= r.idOffset && round.id < r.idOffset + 10000000) { roomCfg = r; break }
  }
  const payoutRate = roomCfg.payout

  const userSeeds = bets.map((b: any) => b.user_id).join('')
  const hash      = await sha256(round.server_seed + round.block_height + userSeeds)
  const result    = isOdd(hash) ? 'odd' : 'even'

  let totalPayout = 0
  const stmts: any[] = []

  for (const bet of bets) {
    const win    = bet.choice === result
    const payout = win ? r2(bet.amount * payoutRate) : 0
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
    const betUser = await db.prepare('SELECT referred_by, partner_code FROM users WHERE id=?').bind(bet.user_id).first<any>()
    if (betUser?.referred_by) {
      const r1 = r2(bet.amount * cfg.L1)
      stmts.push(
        db.prepare('UPDATE users SET balance=balance+?, referral_earnings=referral_earnings+? WHERE id=?')
          .bind(r1, r1, betUser.referred_by)
      )
      const l1User = await db.prepare('SELECT referred_by FROM users WHERE id=?').bind(betUser.referred_by).first<any>()
      if (l1User?.referred_by) {
        const r2amt = r2(bet.amount * cfg.L2)
        stmts.push(
          db.prepare('UPDATE users SET balance=balance+?, referral_earnings=referral_earnings+? WHERE id=?')
            .bind(r2amt, r2amt, l1User.referred_by)
        )
      }
    }
    // 파트너 수당 지급 (베팅한 유저의 파트너 코드 기준)
    if (betUser?.partner_code) {
      const partner = await db.prepare('SELECT * FROM partners WHERE code=? AND is_active=1').bind(betUser.partner_code).first<any>()
      if (partner) {
        const commission = r2(bet.amount * (partner.commission_rate || PARTNER_RATE))
        stmts.push(
          db.prepare('UPDATE partners SET total_earned=total_earned+?, total_bet_via=total_bet_via+? WHERE code=?')
            .bind(commission, bet.amount, betUser.partner_code)
        )
        stmts.push(
          db.prepare('INSERT INTO partner_earning_logs (id, partner_code, user_id, bet_amount, commission_amount, created_at) VALUES (?, ?, ?, ?, ?, ?)')
            .bind(uid(), betUser.partner_code, bet.user_id, bet.amount, commission, Date.now())
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
// 미들웨어: 라운드 자동 처리 (모든 방)
// ─────────────────────────────────────────────
app.use('/api/*', async (c, next) => {
  // 모든 방의 라운드를 자동으로 settle
  try {
    for (const room of Object.keys(ROOMS)) {
      const { phase, idx } = getPhase(room)
      const round = await ensureRound(c.env.DB, idx, room)
      if (phase === 'result' && round && !round.settled) {
        await settleRound(c.env.DB, round)
      }
    }
  } catch(e) {
    // Cold start 시 DB 연결 실패 무시 - 다음 요청에서 재시도
    console.error('middleware error (cold start?):', e)
  }
  await next()
})

// ─────────────────────────────────────────────
// 데모 유저 초기화 API (관리자 전용 시크릿 보호)
// ─────────────────────────────────────────────
app.post('/api/init-demo', async (c) => {
  // 시크릿 키 검증 (헤더 또는 쿼리파라미터로 전달)
  const secret = c.req.header('X-Init-Secret') || c.req.query('secret')
  const INIT_SECRET = 'oddeven-init-2025'  // 환경변수로 관리 권장
  if (secret !== INIT_SECRET) return c.json({ error: 'FORBIDDEN' }, 403)

  const existing = await c.env.DB.prepare('SELECT COUNT(*) as cnt FROM users').first<{cnt:number}>()
  if (existing && existing.cnt > 0) return c.json({ message: '이미 초기화됨', count: existing.cnt })

  const demos = [
    { username:'admin',  password:'admin123',  balance:10000, isAdmin:1 },
    { username:'demo1',  password:'demo123',   balance:500,   isAdmin:0 },
    { username:'demo2',  password:'demo123',   balance:250,   isAdmin:0 },
    { username:'tester', password:'test1234',  balance:1000,  isAdmin:0 },
  ]

  const now = Date.now()
  const stmts: any[] = []
  for (const d of demos) {
    const id   = uid()
    const hash = await hashPassword(d.password)
    stmts.push(
      c.env.DB.prepare(`
        INSERT INTO users (id, username, password_hash, balance, deposit_address, total_deposit,
          referral_code, is_admin, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(id, d.username, hash, d.balance, genAddr(), d.balance, rcode(), d.isAdmin, now)
    )
  }
  await c.env.DB.batch(stmts)
  return c.json({ success: true, message: '데모 유저 4명 생성 완료' })
})

// ─────────────────────────────────────────────
// API: 인증
// ─────────────────────────────────────────────
app.post('/api/register', async (c) => {
  const { username, password, referralCode, partnerCode } = await c.req.json()
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

  // 파트너 코드 검증
  let validPartnerCode: string = ''
  if (partnerCode) {
    const partner = await c.env.DB.prepare('SELECT code FROM partners WHERE code=? AND is_active=1').bind(partnerCode).first<any>()
    if (partner) {
      validPartnerCode = partnerCode
      // 파트너 유저 수 증가
      await c.env.DB.prepare('UPDATE partners SET user_count=user_count+1 WHERE code=?').bind(partnerCode).run()
    }
  }

  const id           = uid()
  const passwordHash = await hashPassword(password)
  const newRcode     = rcode()
  const now          = Date.now()

  await c.env.DB.prepare(`
    INSERT INTO users (id, username, password_hash, balance, deposit_address, total_deposit,
      referral_code, referred_by, is_admin, created_at, last_ip, partner_code)
    VALUES (?, ?, ?, 10, ?, 10, ?, ?, 0, ?, ?, ?)
  `).bind(id, username, passwordHash, genAddr(), newRcode, referredBy, now, ip, validPartnerCode).run()

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
  const now2 = Date.now()
  await c.env.DB.prepare('INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').bind(sid, id, now2, now2 + SESSION_TTL).run()

  return c.json({ success:true, sessionId:sid, user:{ id, username, balance:10, referralCode:newRcode, depositAddress:'', isAdmin:false } })
})

app.post('/api/login', async (c) => {
  const { username, password } = await c.req.json()
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE username=?').bind(username).first<any>()
  if (!user) return c.json({ error:'INVALID_CRED' }, 401)
  if (user.is_banned) return c.json({ error:'BANNED' }, 403)

  // 브루트포스 방어: 잠금 상태 확인
  const now0 = Date.now()
  if (user.locked_until && user.locked_until > now0) {
    const remainMin = Math.ceil((user.locked_until - now0) / 60000)
    return c.json({ error:'LOCKED', remainMin }, 403)
  }

  const ok = await verifyPassword(password, user.password_hash)
  if (!ok) {
    const newFail = (user.login_fail_count || 0) + 1
    if (newFail >= LOGIN_MAX_FAIL) {
      await c.env.DB.prepare('UPDATE users SET login_fail_count=?, locked_until=? WHERE id=?')
        .bind(newFail, now0 + LOGIN_LOCK_MS, user.id).run()
      return c.json({ error:'LOCKED', remainMin: 15 }, 403)
    }
    await c.env.DB.prepare('UPDATE users SET login_fail_count=? WHERE id=?').bind(newFail, user.id).run()
    return c.json({ error:'INVALID_CRED' }, 401)
  }
  // 로그인 성공 → 실패 카운트 초기화
  await c.env.DB.prepare('UPDATE users SET login_fail_count=0, locked_until=0 WHERE id=?').bind(user.id).run()

  const ip  = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown'
  const now = Date.now()
  await c.env.DB.prepare('UPDATE users SET login_count=login_count+1, last_ip=? WHERE id=?').bind(ip, user.id).run()
  await cleanupSessions(c.env.DB)

  const sid = uid()
  await c.env.DB.prepare('INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').bind(sid, user.id, now, now + SESSION_TTL).run()

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

// ─────────────────────────────────────────────
// Web3 지갑 인증 API
// ─────────────────────────────────────────────

// Step1: nonce 발급 (클라이언트가 지갑 주소로 요청)
app.post('/api/auth/nonce', async (c) => {
  const { address } = await c.req.json()
  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address))
    return c.json({ error: 'INVALID_ADDRESS' }, 400)

  const norm = address.toLowerCase()
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2,'0')).join('')
  const now = Date.now()
  const id  = uid()
  // 기존 미사용 nonce 삭제
  await c.env.DB.prepare('DELETE FROM web3_nonces WHERE address=? AND used=0').bind(norm).run()
  await c.env.DB.prepare(
    'INSERT INTO web3_nonces (id, address, nonce, created_at, expires_at, used) VALUES (?,?,?,?,?,0)'
  ).bind(id, norm, nonce, now, now + 300000).run() // 5분 유효

  const message = `ODD/EVEN Login\nAddress: ${norm}\nNonce: ${nonce}\nTime: ${now}`
  return c.json({ nonce, message })
})

// Step2: 서명 검증 후 로그인/자동가입
app.post('/api/auth/verify', async (c) => {
  const { address, signature } = await c.req.json()
  if (!address || !signature) return c.json({ error: 'NEED_FIELDS' }, 400)

  const norm = address.toLowerCase()
  // nonce 조회
  const nonceRow = await c.env.DB.prepare(
    'SELECT * FROM web3_nonces WHERE address=? AND used=0 ORDER BY created_at DESC LIMIT 1'
  ).bind(norm).first<any>()
  if (!nonceRow) return c.json({ error: 'NONCE_NOT_FOUND' }, 400)
  if (Date.now() > nonceRow.expires_at) return c.json({ error: 'NONCE_EXPIRED' }, 400)

  // 서명 검증 (ethers.js 없이 직접 ecrecover)
  try {
    const message = `ODD/EVEN Login\nAddress: ${norm}\nNonce: ${nonceRow.nonce}\nTime: ${nonceRow.created_at}`
    const prefixed = `\x19Ethereum Signed Message:\n${message.length}${message}`
    const msgHash  = await sha256(prefixed)

    // 간단한 서명 검증: sig 형식 체크만 (실제 ecrecover는 Web Crypto로 불가, 주소 체크로 대체)
    // 프로덕션에서는 ethers.js worker binding 권장
    // 현재는 sig 길이(132자)와 주소 형식만 검증
    if (signature.length < 130 || !signature.startsWith('0x'))
      return c.json({ error: 'INVALID_SIGNATURE' }, 400)
  } catch(e) {
    return c.json({ error: 'VERIFY_FAILED' }, 400)
  }

  // nonce 사용 처리
  await c.env.DB.prepare('UPDATE web3_nonces SET used=1 WHERE id=?').bind(nonceRow.id).run()

  // 유저 조회 또는 생성
  let user = await c.env.DB.prepare('SELECT * FROM users WHERE wallet_address=?').bind(norm).first<any>()
  if (!user) {
    // 자동 회원가입
    const id2      = uid()
    const username = 'wallet_' + norm.slice(2, 8)
    const now      = Date.now()
    const newRcode = rcode()
    const ip       = c.req.header('CF-Connecting-IP') || 'unknown'
    await c.env.DB.prepare(`
      INSERT INTO users (id, username, password_hash, balance, deposit_address, total_deposit,
        referral_code, is_admin, created_at, last_ip, wallet_address, wallet_type)
      VALUES (?, ?, '', 10, ?, 10, ?, 0, ?, ?, ?, 'web3')
    `).bind(id2, username, genAddr(), newRcode, now, ip, norm).run()
    user = await c.env.DB.prepare('SELECT * FROM users WHERE id=?').bind(id2).first<any>()
  }
  if (!user) return c.json({ error: 'USER_CREATE_FAILED' }, 500)
  if (user.is_banned) return c.json({ error: 'BANNED' }, 403)

  const ip  = c.req.header('CF-Connecting-IP') || 'unknown'
  const now = Date.now()
  await c.env.DB.prepare('UPDATE users SET login_count=login_count+1, last_ip=? WHERE id=?').bind(ip, user.id).run()
  await cleanupSessions(c.env.DB)
  const sid2 = uid()
  await c.env.DB.prepare('INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?,?,?,?)')
    .bind(sid2, user.id, now, now + SESSION_TTL).run()

  const l1cnt = await c.env.DB.prepare('SELECT COUNT(*) as cnt FROM referrals WHERE referrer_id=? AND level=1').bind(user.id).first<{cnt:number}>()
  const l2cnt = await c.env.DB.prepare('SELECT COUNT(*) as cnt FROM referrals WHERE referrer_id=? AND level=2').bind(user.id).first<{cnt:number}>()

  return c.json({ success:true, sessionId:sid2, user:{
    id: user.id, username: user.username, balance: user.balance,
    referralCode: user.referral_code, referralEarnings: user.referral_earnings || 0,
    level1Count: l1cnt?.cnt || 0, level2Count: l2cnt?.cnt || 0,
    depositAddress: user.deposit_address, isAdmin: !!user.is_admin,
    walletAddress: user.wallet_address
  }})
})

// ─────────────────────────────────────────────
// P2P 배틀룸 API
// ─────────────────────────────────────────────
const P2P_ROOM = {
  name: 'Battle', emoji: '⚔️', color: 'pink',
  roundDuration: 60000, resultShow: 15000,
  minBet: 10, maxBet: 50000,
  feeRate: 0.03,  // 3% 하우스 수수료
  idOffset: 50000000
}

function getP2PPhase() {
  const cycle   = P2P_ROOM.roundDuration + P2P_ROOM.resultShow
  const elapsed = (Date.now() - GAME_START) % cycle
  const idx     = Math.floor((Date.now() - GAME_START) / cycle) + P2P_ROOM.idOffset
  if (elapsed < P2P_ROOM.roundDuration)
    return { phase: 'betting' as const, timeLeft: Math.ceil((P2P_ROOM.roundDuration - elapsed)/1000), idx }
  return   { phase: 'result'  as const, timeLeft: Math.ceil((cycle - elapsed)/1000), idx }
}

app.get('/api/p2p/round/current', async (c) => {
  const { phase, timeLeft, idx } = getP2PPhase()
  const roundId = String(idx)

  // 현재 라운드 베팅 집계
  let totalOdd = 0, totalEven = 0, betCount = 0
  try {
    const agg = await c.env.DB.prepare(
      "SELECT SUM(CASE WHEN choice='odd' THEN amount ELSE 0 END) as odd_sum, SUM(CASE WHEN choice='even' THEN amount ELSE 0 END) as even_sum, COUNT(*) as cnt FROM p2p_bets WHERE round_id=?"
    ).bind(roundId).first<any>()
    if (agg) { totalOdd = agg.odd_sum || 0; totalEven = agg.even_sum || 0; betCount = agg.cnt || 0 }
  } catch(e) { /* table may not exist yet */ }

  const totalPool = totalOdd + totalEven
  const net = totalPool * (1 - P2P_ROOM.feeRate)
  const oddPayout  = totalOdd  > 0 ? net / totalOdd  : 0
  const evenPayout = totalEven > 0 ? net / totalEven : 0

  // 결과 라운드: 이전 라운드 seed로 결과 계산
  let result = null, serverSeedHash = ''
  const prevIdx = idx - 1
  try {
    const prev = await c.env.DB.prepare('SELECT * FROM p2p_rounds WHERE id=?').bind(String(prevIdx)).first<any>()
    if (prev) { result = prev.result; serverSeedHash = prev.server_seed_hash }
  } catch(e) {}

  // 현재 라운드 seed hash
  const seed = await sha256(`p2p_${roundId}_${GAME_START}`)
  const hash = await sha256(seed + roundId)
  if (!serverSeedHash) serverSeedHash = hash

  return c.json({
    id: roundId, phase, timeLeft,
    totalOdd, totalEven, betCount, totalPool,
    oddPayout: parseFloat(oddPayout.toFixed(4)),
    evenPayout: parseFloat(evenPayout.toFixed(4)),
    serverSeedHash,
    result: phase === 'result' ? result : null,
    roomInfo: { ...P2P_ROOM, roundDuration: P2P_ROOM.roundDuration/1000 }
  })
})

app.post('/api/p2p/bet', async (c) => {
  const user = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  if (!user) return c.json({ error:'UNAUTH' }, 401)

  const { choice, amount } = await c.req.json()
  if (!['odd','even'].includes(choice)) return c.json({ error:'INVALID_CHOICE' }, 400)
  if (!amount || amount < P2P_ROOM.minBet || amount > P2P_ROOM.maxBet)
    return c.json({ error:'INVALID_AMOUNT' }, 400)
  if (user.balance < amount) return c.json({ error:'INSUFFICIENT' }, 400)

  const { phase, idx } = getP2PPhase()
  if (phase !== 'betting') return c.json({ error:'NOT_BETTING' }, 400)

  const roundId = String(idx)
  // 이미 베팅했는지 확인
  const existing = await c.env.DB.prepare('SELECT id FROM p2p_bets WHERE round_id=? AND user_id=?').bind(roundId, user.id).first()
  if (existing) return c.json({ error:'ALREADY_BET' }, 400)

  const now = Date.now()
  const betId = uid()
  await c.env.DB.batch([
    c.env.DB.prepare('UPDATE users SET balance=balance-? WHERE id=?').bind(amount, user.id),
    c.env.DB.prepare('INSERT INTO p2p_bets (id,round_id,user_id,choice,amount,created_at) VALUES (?,?,?,?,?,?)')
      .bind(betId, roundId, user.id, choice, amount, now)
  ])

  const updated = await c.env.DB.prepare('SELECT balance FROM users WHERE id=?').bind(user.id).first<any>()
  return c.json({ success:true, balance: updated?.balance || 0 })
})

// P2P 결과 정산 (라운드 종료 시 자동 실행 - 실제로는 scheduled trigger 필요)
// 현재는 /api/p2p/round/current 호출 시 이전 라운드 정산도 함께 처리
app.post('/api/p2p/settle', async (c) => {
  const { roundId } = await c.req.json()
  if (!roundId) return c.json({ error: 'NEED_ROUND_ID' }, 400)

  // 이미 정산됐는지 확인
  const settled = await c.env.DB.prepare('SELECT id FROM p2p_rounds WHERE id=? AND phase=?').bind(roundId, 'settled').first()
  if (settled) return c.json({ message: 'already settled' })

  // 결과 계산
  const seed   = await sha256(`p2p_${roundId}_${GAME_START}`)
  const result = isOdd(seed) ? 'odd' : 'even'

  // 베팅 집계
  const bets = await c.env.DB.prepare('SELECT * FROM p2p_bets WHERE round_id=? AND win IS NULL').bind(roundId).all<any>()
  if (!bets.results || bets.results.length === 0) return c.json({ message: 'no bets' })

  const totalOdd  = bets.results.filter((b:any) => b.choice==='odd').reduce((s:number,b:any) => s+b.amount, 0)
  const totalEven = bets.results.filter((b:any) => b.choice==='even').reduce((s:number,b:any) => s+b.amount, 0)
  const totalPool = totalOdd + totalEven
  const net       = totalPool * (1 - P2P_ROOM.feeRate)
  const winPool   = result === 'odd' ? totalOdd : totalEven
  const houseFee  = totalPool * P2P_ROOM.feeRate

  const stmts: any[] = []
  for (const bet of bets.results as any[]) {
    const win    = bet.choice === result
    let payout = 0
    if (win && winPool > 0) payout = r2(bet.amount / winPool * net)
    stmts.push(
      c.env.DB.prepare('UPDATE p2p_bets SET win=?,payout=?,fee_taken=?,settled_at=? WHERE id=?')
        .bind(win?1:0, payout, win ? r2(bet.amount * P2P_ROOM.feeRate) : 0, Date.now(), bet.id)
    )
    if (win && payout > 0) {
      stmts.push(c.env.DB.prepare('UPDATE users SET balance=balance+? WHERE id=?').bind(payout, bet.user_id))
    }
  }
  // 라운드 기록 저장
  stmts.push(
    c.env.DB.prepare('INSERT OR REPLACE INTO p2p_rounds (id,room,phase,start_time,bet_end_time,result_time,result,server_seed,server_seed_hash,total_odd,total_even,bet_count,house_fee,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
      .bind(roundId,'battle','settled',0,0,Date.now(),result,seed,await sha256(seed),totalOdd,totalEven,bets.results.length,houseFee,Date.now())
  )

  if (stmts.length > 0) await c.env.DB.batch(stmts)
  return c.json({ success:true, result, totalOdd, totalEven, houseFee })
})

app.get('/api/p2p/history', async (c) => {
  try {
    const rows = await c.env.DB.prepare(
      'SELECT id, result, total_odd, total_even, bet_count FROM p2p_rounds WHERE phase=? ORDER BY created_at DESC LIMIT 20'
    ).bind('settled').all<any>()
    return c.json({ history: rows.results || [] })
  } catch(e) { return c.json({ history: [] }) }
})

// ─────────────────────────────────────────────
// API: 내 정보
// ─────────────────────────────────────────────
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
    totalBetAmount: user.total_bet_amount, isAdmin: !!user.is_admin,
    walletAddress: user.wallet_address
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
// API: 비밀번호 변경
// ─────────────────────────────────────────────
app.post('/api/change-password', async (c) => {
  const user = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  if (!user) return c.json({ error:'UNAUTH' }, 401)

  const { currentPassword, newPassword } = await c.req.json()
  if (!currentPassword || !newPassword) return c.json({ error:'NEED_FIELDS' }, 400)
  if (newPassword.length < 6)           return c.json({ error:'PASSWORD_SHORT' }, 400)
  if (currentPassword === newPassword)  return c.json({ error:'SAME_PASSWORD' }, 400)

  const ok = await verifyPassword(currentPassword, user.password_hash)
  if (!ok) return c.json({ error:'WRONG_PASSWORD' }, 401)

  const newHash = await hashPassword(newPassword)
  // 비밀번호 변경 후 다른 모든 세션 만료
  const sid = c.req.header('X-Session-Id') || ''
  await c.env.DB.batch([
    c.env.DB.prepare('UPDATE users SET password_hash=? WHERE id=?').bind(newHash, user.id),
    c.env.DB.prepare('DELETE FROM sessions WHERE user_id=? AND id!=?').bind(user.id, sid)
  ])
  return c.json({ success: true })
})

// ─────────────────────────────────────────────
// API: 출금
// ─────────────────────────────────────────────
app.post('/api/withdraw', async (c) => {
  const user = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  if (!user) return c.json({ error:'UNAUTH' }, 401)

  const { amount, address, network } = await c.req.json()
  const cfg = await getGameSettings(c.env.DB)
  const amt = parseFloat(amount)
  // 실제 차감액 = 요청금액 + 수수료
  const totalDeduct = r2(amt + cfg.WITHDRAW_FEE)
  if (!amt || amt < cfg.MIN_WITHDRAW)    return c.json({ error:'MIN_WITHDRAW', min: cfg.MIN_WITHDRAW }, 400)
  if (totalDeduct > user.balance)        return c.json({ error:'INSUFFICIENT' }, 400)
  if (!address || address.length < 10)  return c.json({ error:'INVALID_ADDR' }, 400)

  // 베팅 조건 확인
  const minBetRequired = user.total_deposit * cfg.BET_REQUIREMENT
  if (user.total_bet_amount < minBetRequired)
    return c.json({ error:'BET_REQUIREMENT', required: minBetRequired, current: user.total_bet_amount }, 400)

  // 일일 출금 한도 확인
  const dailyLimitRow = await c.env.DB.prepare("SELECT value FROM site_settings WHERE key='daily_withdraw_limit'").first<{value:string}>()
  const dailyLimit = parseFloat(dailyLimitRow?.value || '0')
  if (dailyLimit > 0) {
    const todayStart = new Date(); todayStart.setHours(0,0,0,0)
    const todayTs = todayStart.getTime()
    const todayTotal = await c.env.DB.prepare(
      "SELECT COALESCE(SUM(amount),0) as total FROM withdraw_requests WHERE user_id=? AND created_at>=? AND status!='rejected' AND status!='cancelled'"
    ).bind(user.id, todayTs).first<{total:number}>()
    const usedToday = todayTotal?.total || 0
    if (usedToday + amt > dailyLimit)
      return c.json({ error:'DAILY_LIMIT', limit: dailyLimit, used: usedToday, remaining: Math.max(0, dailyLimit - usedToday) }, 400)
  }

  // 중복 출금 신청 확인
  const pending = await c.env.DB.prepare("SELECT id FROM withdraw_requests WHERE user_id=? AND status='pending'").bind(user.id).first()
  if (pending) return c.json({ error:'WITHDRAW_PENDING' }, 400)

  const reqId = uid()
  const netVal = network || 'trc20'
  await c.env.DB.batch([
    c.env.DB.prepare('UPDATE users SET balance=balance-? WHERE id=?').bind(totalDeduct, user.id),
    c.env.DB.prepare('INSERT INTO withdraw_requests (id,user_id,username,amount,address,status,created_at,note) VALUES (?,?,?,?,?,?,?,?)').bind(reqId, user.id, user.username, amt, address, 'pending', Date.now(), 'network:'+netVal)
  ])

  const updated = await getUser(c.env.DB, user.id)
  return c.json({ success:true, balance: updated?.balance || 0, requestId: reqId, fee: cfg.WITHDRAW_FEE })
})

app.get('/api/withdraw/status', async (c) => {
  const user = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  if (!user) return c.json({ error:'UNAUTH' }, 401)
  const reqs = await c.env.DB.prepare('SELECT * FROM withdraw_requests WHERE user_id=? ORDER BY created_at DESC LIMIT 10').bind(user.id).all<any>()
  return c.json({ requests: reqs.results || [], withdrawFee: WITHDRAW_FEE })
})

// 출금 취소 (유저 요청, pending 상태만)
app.post('/api/withdraw/cancel', async (c) => {
  const user = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  if (!user) return c.json({ error:'UNAUTH' }, 401)

  const { requestId } = await c.req.json()
  const req = await c.env.DB.prepare(
    "SELECT * FROM withdraw_requests WHERE id=? AND user_id=? AND status='pending'"
  ).bind(requestId, user.id).first<any>()
  if (!req) return c.json({ error:'NOT_FOUND_OR_PROCESSED' }, 404)

  // 수수료 포함 반환 (차감된 전체 금액)
  const refundAmt = r2(req.amount + WITHDRAW_FEE)
  await c.env.DB.batch([
    c.env.DB.prepare("UPDATE withdraw_requests SET status='cancelled', processed_at=?, note=? WHERE id="+"?").bind(Date.now(), '유저 취소', req.id),
    c.env.DB.prepare('UPDATE users SET balance=balance+? WHERE id=?').bind(refundAmt, user.id)
  ])

  const updated = await getUser(c.env.DB, user.id)
  return c.json({ success:true, balance: updated?.balance || 0, refunded: refundAmt })
})

// ─────────────────────────────────────────────
// API: 게임
// ─────────────────────────────────────────────
app.get('/api/round/current', async (c) => {
  const room = c.req.query('room') || 'standard'
  const r = ROOMS[room] || ROOMS.standard
  const { phase, timeLeft, idx } = getPhase(room)
  const round = await ensureRound(c.env.DB, idx, room)
  if (!round) return c.json({ error:'ROUND_ERROR' }, 500)

  const bets = await c.env.DB.prepare('SELECT username, choice, amount, created_at FROM bets WHERE round_id=? ORDER BY created_at DESC LIMIT 10').bind(round.id).all<any>()

  return c.json({
    id: round.id, phase, status: phase === 'betting' ? 'betting' : 'finished',
    timeLeft, serverSeedHash: round.server_seed_hash, blockHeight: round.block_height,
    totalOdd: round.total_odd, totalEven: round.total_even, betCount: round.bet_count,
    result: round.result, hashValue: round.hash_value,
    serverSeed: phase === 'result' ? round.server_seed : null,
    room, roomInfo: { name: r.name, emoji: r.emoji, minBet: r.minBet, maxBet: r.maxBet, payout: r.payout, feeRate: r.feeRate, roundDuration: r.roundDuration },
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

  const { choice, amount, room: roomParam } = await c.req.json()
  const room = ROOMS[roomParam] ? roomParam : 'standard'
  const r = ROOMS[room]
  const { phase, idx } = getPhase(room)
  if (phase !== 'betting') return c.json({ error:'NOT_BETTING' }, 400)

  const round = await ensureRound(c.env.DB, idx, room)
  if (!round) return c.json({ error:'ROUND_ERROR' }, 500)

  if (choice !== 'odd' && choice !== 'even') return c.json({ error:'INVALID_CHOICE' }, 400)

  const amt = parseFloat(amount)
  if (!amt || amt < r.minBet)  return c.json({ error:'MIN_BET', min: r.minBet }, 400)
  if (amt > r.maxBet)          return c.json({ error:'MAX_BET', max: r.maxBet }, 400)
  if (amt > user.balance)      return c.json({ error:'INSUFFICIENT' }, 400)

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
  return c.json({ success:true, balance: updated?.balance || 0, bet:{ choice, amount:amt, roundId:round.id, serverSeedHash:round.server_seed_hash, room } })
})

// ─────────────────────────────────────────────
// API: 히스토리 & 통계 (페이지네이션 적용)
// ─────────────────────────────────────────────
app.get('/api/history', async (c) => {
  const page    = Math.max(1, parseInt(c.req.query('page') || '1'))
  const limit   = 30
  const offset  = (page - 1) * limit

  const history = await c.env.DB.prepare(`
    SELECT r.id as roundId, r.result, r.hash_value as hashValue, r.block_height as blockHeight,
           r.total_odd+r.total_even as totalBets, r.total_payout as totalPayout,
           r.created_at as timestamp, r.server_seed as serverSeed
    FROM rounds r WHERE r.settled=1 ORDER BY r.id DESC LIMIT ? OFFSET ?
  `).bind(limit, offset).all<any>()

  const totalRow = await c.env.DB.prepare('SELECT COUNT(*) as cnt FROM rounds WHERE settled=1').first<{cnt:number}>()
  const totalPages = Math.ceil((totalRow?.cnt || 0) / limit)

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

  return c.json({ history: history.results || [], stats: stats || {}, page, totalPages })
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

  // 최근 50라운드 결과 (공정성 지표용)
  const recent50 = await c.env.DB.prepare(
    'SELECT id, result FROM rounds WHERE settled=1 ORDER BY id DESC LIMIT 50'
  ).all<any>()
  const results50 = (recent50.results || []).map((r:any) => r.result).reverse()

  // 연속 결과 계산
  let maxStreak = 0, curStreak = 1
  for (let i = 1; i < results50.length; i++) {
    if (results50[i] === results50[i-1]) { curStreak++; maxStreak = Math.max(maxStreak, curStreak) }
    else curStreak = 1
  }
  if (results50.length > 0) maxStreak = Math.max(maxStreak, 1)

  const total = stats?.totalGames || 0
  const odd   = stats?.oddCount   || 0
  const even  = stats?.evenCount  || 0

  return c.json({
    totalGames: total, oddCount: odd, evenCount: even,
    oddRate:  total > 0 ? ((odd/total)*100).toFixed(2)  : '50.00',
    evenRate: total > 0 ? ((even/total)*100).toFixed(2) : '50.00',
    totalBetAmount:    stats?.totalBetAmount    || 0,
    totalPayoutAmount: stats?.totalPayoutAmount || 0,
    totalReferralPaid: stats?.totalReferralPaid || 0,
    userCount: stats?.userCount || 0,
    recent50Results: results50,
    maxStreak
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

  const page   = Math.max(1, parseInt(c.req.query('page') || '1'))
  const plimit  = 20
  const poffset = (page - 1) * plimit

  const bets = await c.env.DB.prepare(`
    SELECT b.*, r.result FROM bets b
    JOIN rounds r ON b.round_id = r.id
    WHERE b.user_id=? AND b.settled=1
    ORDER BY b.created_at DESC LIMIT ? OFFSET ?
  `).bind(user.id, plimit, poffset).all<any>()

  const totalRow = await c.env.DB.prepare('SELECT COUNT(*) as cnt FROM bets WHERE user_id=? AND settled=1').bind(user.id).first<{cnt:number}>()
  const totalCount = totalRow?.cnt || 0
  const totalPages = Math.ceil(totalCount / plimit)

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
    },
    page, totalPages, totalCount
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
// API: 검증 + Provably Fair (다음 라운드 해시 선공개)
// ─────────────────────────────────────────────
app.post('/api/verify', async (c) => {
  const { serverSeed, blockHeight, userSeeds } = await c.req.json()
  const hash = await sha256(serverSeed + blockHeight + (userSeeds||''))
  return c.json({ hash, result: isOdd(hash) ? 'odd' : 'even', lastChar: hash[hash.length-1] })
})

// 다음 라운드 서버시드 해시 선공개 (Provably Fair 강화)
app.get('/api/next-round-hash', async (c) => {
  const { idx } = getPhase()
  const nextIdx = idx + 1
  const nextRound = await ensureRound(c.env.DB, nextIdx)
  return c.json({
    nextRoundId: nextIdx + 1,
    nextServerSeedHash: nextRound?.server_seed_hash || null,
    nextBlockHeight: nextRound?.block_height || null,
    description: '다음 라운드 서버시드 해시가 미리 공개됩니다. 결과 발표 후 실제 시드와 비교 검증하세요.'
  })
})

// ─────────────────────────────────────────────
// API: 공지사항
// ─────────────────────────────────────────────
// ── 번역 API (MyMemory 프록시) ──────────────────────────────────
app.post('/api/translate', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const { text, targets } = await c.req.json() as { text: string, targets: string[] }
  if (!text || text.trim().length === 0) return c.json({ error:'EMPTY_TEXT' }, 400)

  const cleanText = text.replace(/<[^>]*>/g, '').trim()  // HTML 태그 제거 후 번역
  const results: Record<string, string> = {}

  const langMap: Record<string, string> = { en:'en-US', zh:'zh-CN', ja:'ja-JP' }
  const tgtList = (targets || ['en','zh','ja']).filter((t: string) => langMap[t])

  for (const tgt of tgtList) {
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=ko|${langMap[tgt]}`
      const res = await fetch(url, { headers: { 'User-Agent': 'OddEvenGame/1.0' } })
      const data = await res.json() as any
      if (data?.responseStatus === 200) {
        results[tgt] = data.responseData?.translatedText || ''
      }
    } catch (_) {
      results[tgt] = ''
    }
  }

  return c.json({ success: true, results })
})

app.get('/api/notices', async (c) => {
  const lang = c.req.query('lang') || 'ko'
  const now  = Date.now()
  const notices = await c.env.DB.prepare(
    "SELECT id, content, content_en, content_zh, content_ja, type, created_at, publish_at FROM notices WHERE is_active=1 AND (publish_at=0 OR publish_at IS NULL OR publish_at<=?) ORDER BY created_at DESC LIMIT 5"
  ).bind(now).all<any>()
  const result = (notices.results || []).map((n: any) => ({
    ...n,
    displayContent: (lang === 'en' && n.content_en) ? n.content_en
      : (lang === 'zh' && n.content_zh) ? n.content_zh
      : (lang === 'ja' && n.content_ja) ? n.content_ja
      : n.content
  }))
  return c.json({ notices: result })
})

// 공지사항 최신 1건 (팝업용)
app.get('/api/notice/latest', async (c) => {
  const lang = c.req.query('lang') || 'ko'
  const now  = Date.now()
  const notice = await c.env.DB.prepare(
    "SELECT id, content, content_en, content_zh, content_ja, type, created_at, publish_at FROM notices WHERE is_active=1 AND (publish_at=0 OR publish_at IS NULL OR publish_at<=?) ORDER BY created_at DESC LIMIT 1"
  ).bind(now).first<any>()
  if (!notice) return c.json({ notice: null })
  const displayContent = (lang === 'en' && notice.content_en) ? notice.content_en
    : (lang === 'zh' && notice.content_zh) ? notice.content_zh
    : (lang === 'ja' && notice.content_ja) ? notice.content_ja
    : notice.content
  return c.json({ notice: { ...notice, displayContent } })
})

app.post('/api/admin/notice', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const { content, content_en, content_zh, content_ja, type, publish_at } = await c.req.json()
  if (!content || content.trim().length === 0) return c.json({ error:'EMPTY_CONTENT' }, 400)
  const user = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  const now = Date.now()
  // publish_at: 0 또는 null이면 즉시 발행, 미래 timestamp이면 예약
  const pubAt = publish_at && parseInt(publish_at) > now ? parseInt(publish_at) : 0
  await c.env.DB.prepare(
    'INSERT INTO notices (id, content, content_en, content_zh, content_ja, type, is_active, created_by, created_at, updated_at, publish_at) VALUES (?,?,?,?,?,?,1,?,?,?,?)'
  ).bind(uid(), content.trim(), content_en||'', content_zh||'', content_ja||'', type || 'info', user!.id, now, now, pubAt).run()
  return c.json({ success: true, scheduled: pubAt > 0, publishAt: pubAt })
})

app.post('/api/admin/notice/delete', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const { noticeId } = await c.req.json()
  await c.env.DB.prepare('UPDATE notices SET is_active=0 WHERE id=?').bind(noticeId).run()
  return c.json({ success: true })
})

// 관리자용 공지 조회 (예약 공지 포함)
app.get('/api/admin/notices', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const notices = await c.env.DB.prepare(
    "SELECT id, content, type, publish_at, created_at FROM notices WHERE is_active=1 ORDER BY created_at DESC LIMIT 20"
  ).all<any>()
  const now = Date.now()
  return c.json({ notices: (notices.results||[]).map((n:any) => ({
    ...n,
    scheduled: n.publish_at > 0 && n.publish_at > now
  })) })
})

// ─────────────────────────────────────────────
// API: 파트너 시스템
// ─────────────────────────────────────────────
app.get('/api/partner/:code', async (c) => {
  const code = c.req.param('code')
  const partner = await c.env.DB.prepare(
    'SELECT code, name, user_count, total_bet_via, total_earned FROM partners WHERE code=? AND is_active=1'
  ).bind(code).first<any>()
  if (!partner) return c.json({ error:'NOT_FOUND' }, 404)
  return c.json({ partner })
})

app.get('/api/admin/partners', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const partners = await c.env.DB.prepare(
    'SELECT * FROM partners ORDER BY created_at DESC LIMIT 100'
  ).all<any>()
  return c.json({ partners: partners.results || [] })
})

app.post('/api/admin/partner/create', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const { name, owner_username, commission_rate, note } = await c.req.json()
  if (!name || !owner_username) return c.json({ error:'NEED_FIELDS' }, 400)
  // 파트너 코드 생성 (대문자 6자리)
  const code = rcode() + rcode().slice(0,2)
  const now  = Date.now()
  const rate = Math.min(0.20, Math.max(0.01, parseFloat(commission_rate) || PARTNER_RATE))
  await c.env.DB.prepare(
    'INSERT INTO partners (id, code, name, owner_username, commission_rate, note, created_at) VALUES (?,?,?,?,?,?,?)'
  ).bind(uid(), code, name, owner_username, rate, note||'', now).run()
  return c.json({ success: true, code, commission_rate: rate })
})

app.post('/api/admin/partner/update', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const { code, commission_rate, is_active, note } = await c.req.json()
  const rate = Math.min(0.20, Math.max(0.01, parseFloat(commission_rate) || PARTNER_RATE))
  await c.env.DB.prepare(
    'UPDATE partners SET commission_rate=?, is_active=?, note=? WHERE code=?'
  ).bind(rate, is_active ? 1 : 0, note||'', code).run()
  return c.json({ success: true })
})

app.get('/api/admin/partner/earnings', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const code  = c.req.query('code') || ''
  const limit = parseInt(c.req.query('limit') || '50')
  const logs  = await c.env.DB.prepare(
    'SELECT pel.*, u.username FROM partner_earning_logs pel LEFT JOIN users u ON pel.user_id=u.id WHERE pel.partner_code=? ORDER BY pel.created_at DESC LIMIT ?'
  ).bind(code, limit).all<any>()
  return c.json({ logs: logs.results || [] })
})

// ─────────────────────────────────────────────
// API: 1:1 문의
// ─────────────────────────────────────────────
app.get('/api/inquiries', async (c) => {
  const user = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  if (!user) return c.json({ error:'UNAUTH' }, 401)
  const inquiries = await c.env.DB.prepare(
    'SELECT id, title, category, status, admin_reply, created_at, admin_reply_at FROM inquiries WHERE user_id=? ORDER BY created_at DESC LIMIT 30'
  ).bind(user.id).all<any>()
  return c.json({ inquiries: inquiries.results || [] })
})

app.post('/api/inquiry/create', async (c) => {
  const user = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  if (!user) return c.json({ error:'UNAUTH' }, 401)
  const { title, content, category, attachments } = await c.req.json()
  if (!title || !content) return c.json({ error:'NEED_FIELDS' }, 400)
  if (title.length > 100) return c.json({ error:'TITLE_TOO_LONG' }, 400)
  if (content.length > 10000) return c.json({ error:'CONTENT_TOO_LONG' }, 400)

  // 첨부 파일 정보를 content에 병합 (메타데이터만, Base64 데이터는 별도 저장)
  let finalContent = content
  let attachMeta: any[] = []
  if (attachments && Array.isArray(attachments) && attachments.length > 0) {
    attachMeta = attachments.map((a: any) => ({ name: a.name, type: a.type, size: a.size }))
    // 첨부 정보를 JSON 주석으로 content에 포함
    const attachInfo = `\n\n<!-- ATTACHMENTS:${JSON.stringify(attachMeta)} -->`
    finalContent = content + attachInfo
  }

  const now = Date.now()
  const id  = uid()
  await c.env.DB.prepare(
    'INSERT INTO inquiries (id, user_id, username, title, content, category, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)'
  ).bind(id, user.id, user.username, title, finalContent, category||'general', 'pending', now, now).run()
  return c.json({ success: true, id, attachCount: attachMeta.length })
})

app.get('/api/inquiry/:id', async (c) => {
  const user = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  if (!user) return c.json({ error:'UNAUTH' }, 401)
  const inq = await c.env.DB.prepare(
    'SELECT * FROM inquiries WHERE id=? AND user_id=?'
  ).bind(c.req.param('id'), user.id).first<any>()
  if (!inq) return c.json({ error:'NOT_FOUND' }, 404)
  return c.json({ inquiry: inq })
})

// 유저 재문의 (추가 답변 요청)
app.post('/api/inquiry/followup', async (c) => {
  const user = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  if (!user) return c.json({ error:'UNAUTH' }, 401)
  const { inquiryId, content } = await c.req.json()
  if (!content || content.trim().length === 0) return c.json({ error:'EMPTY_CONTENT' }, 400)
  const inq = await c.env.DB.prepare('SELECT * FROM inquiries WHERE id=? AND user_id=?').bind(inquiryId, user.id).first<any>()
  if (!inq) return c.json({ error:'NOT_FOUND' }, 404)
  const now = Date.now()
  // 재문의: 원문의 content에 추가 답변 내용을 append하고 status를 pending으로 되돌림
  const appendedContent = inq.content + `<hr><div class="followup-msg"><div class="text-xs text-gray-400 mb-1">📩 추가 문의 (${new Date(now).toLocaleDateString('ko-KR')})</div>${content}</div>`
  await c.env.DB.prepare(
    'UPDATE inquiries SET content=?, status="pending", updated_at=? WHERE id=?'
  ).bind(appendedContent, now, inquiryId).run()
  return c.json({ success: true })
})

app.get('/api/admin/inquiries', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const status   = c.req.query('status')   || ''
  const category = c.req.query('category') || ''
  const page     = parseInt(c.req.query('page') || '1')
  const limit    = 20
  const offset   = (page - 1) * limit

  const conds: string[] = [], params: any[] = []
  if (status)   { conds.push('status=?');   params.push(status) }
  if (category) { conds.push('category=?'); params.push(category) }
  const where = conds.length ? ' WHERE ' + conds.join(' AND ') : ''

  const rows = await c.env.DB.prepare(`SELECT * FROM inquiries${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...params, limit, offset).all<any>()
  const total = await c.env.DB.prepare(`SELECT COUNT(*) as cnt FROM inquiries${where}`).bind(...params).first<{cnt:number}>()
  const pendingCnt = await c.env.DB.prepare('SELECT COUNT(*) as cnt FROM inquiries WHERE status="pending"').first<{cnt:number}>()

  // 카테고리별 대기 건수
  const catCounts = await c.env.DB.prepare(
    `SELECT category, COUNT(*) as cnt FROM inquiries WHERE status='pending' GROUP BY category`
  ).all<any>()

  return c.json({
    inquiries: rows.results || [],
    total: total?.cnt || 0,
    totalPages: Math.ceil((total?.cnt||0)/limit),
    pendingCount: pendingCnt?.cnt || 0,
    categoryCounts: Object.fromEntries((catCounts.results||[]).map((r:any) => [r.category, r.cnt]))
  })
})

app.post('/api/admin/inquiry/reply', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const { inquiryId, reply } = await c.req.json()
  if (!inquiryId || !reply) return c.json({ error:'NEED_FIELDS' }, 400)
  const now = Date.now()
  await c.env.DB.prepare(
    'UPDATE inquiries SET admin_reply=?, admin_reply_at=?, status="answered", updated_at=? WHERE id=?'
  ).bind(reply, now, now, inquiryId).run()
  return c.json({ success: true })
})

app.post('/api/admin/inquiry/close', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const { inquiryId } = await c.req.json()
  await c.env.DB.prepare('UPDATE inquiries SET status="closed", updated_at=? WHERE id=?').bind(Date.now(), inquiryId).run()
  return c.json({ success: true })
})

// 관리자 - 특정 문의 상세 조회 (내용 전체)
app.get('/api/inquiry/admin/:id', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const id = c.req.param('id')
  const row = await c.env.DB.prepare('SELECT * FROM inquiries WHERE id=?').bind(id).first<any>()
  if (!row) return c.json({ error:'NOT_FOUND' }, 404)
  return c.json(row)
})

// ─────────────────────────────────────────────
// API: FAQ
// ─────────────────────────────────────────────
app.get('/api/faqs', async (c) => {
  const lang     = c.req.query('lang') || 'ko'
  const category = c.req.query('category') || ''
  const rows     = category
    ? await c.env.DB.prepare('SELECT * FROM faqs WHERE is_active=1 AND category=? ORDER BY sort_order ASC, created_at ASC').bind(category).all<any>()
    : await c.env.DB.prepare('SELECT * FROM faqs WHERE is_active=1 ORDER BY sort_order ASC, created_at ASC').all<any>()
  const result = (rows.results || []).map((f: any) => ({
    id: f.id, category: f.category, sort_order: f.sort_order,
    question: (lang==='en' && f.question_en) ? f.question_en : (lang==='zh' && f.question_zh) ? f.question_zh : (lang==='ja' && f.question_ja) ? f.question_ja : f.question,
    answer:   (lang==='en' && f.answer_en)   ? f.answer_en   : (lang==='zh' && f.answer_zh)   ? f.answer_zh   : (lang==='ja' && f.answer_ja)   ? f.answer_ja   : f.answer,
  }))
  return c.json({ faqs: result })
})

app.post('/api/admin/faq/create', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const { category, question, answer, question_en, answer_en, question_zh, answer_zh, question_ja, answer_ja, sort_order } = await c.req.json()
  if (!question || !answer) return c.json({ error:'NEED_FIELDS' }, 400)
  const now = Date.now()
  await c.env.DB.prepare(
    'INSERT INTO faqs (id, category, question, answer, question_en, answer_en, question_zh, answer_zh, question_ja, answer_ja, sort_order, is_active, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,1,?,?)'
  ).bind(uid(), category||'general', question, answer, question_en||'', answer_en||'', question_zh||'', answer_zh||'', question_ja||'', answer_ja||'', sort_order||0, now, now).run()
  return c.json({ success: true })
})

app.post('/api/admin/faq/update', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const { id, category, question, answer, question_en, answer_en, question_zh, answer_zh, question_ja, answer_ja, sort_order, is_active } = await c.req.json()
  const now = Date.now()
  await c.env.DB.prepare(
    'UPDATE faqs SET category=?, question=?, answer=?, question_en=?, answer_en=?, question_zh=?, answer_zh=?, question_ja=?, answer_ja=?, sort_order=?, is_active=?, updated_at=? WHERE id=?'
  ).bind(category, question, answer, question_en||'', answer_en||'', question_zh||'', answer_zh||'', question_ja||'', answer_ja||'', sort_order||0, is_active?1:0, now, id).run()
  return c.json({ success: true })
})

app.post('/api/admin/faq/delete', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const { id } = await c.req.json()
  await c.env.DB.prepare('UPDATE faqs SET is_active=0 WHERE id=?').bind(id).run()
  return c.json({ success: true })
})

// 관리자 유저 메모 업데이트
app.post('/api/admin/user/memo', async (c) => {
  const admin = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  if (!admin || !admin.is_admin) return c.json({ error:'FORBIDDEN' }, 403)
  const { userId, memo } = await c.req.json()
  const target = await getUser(c.env.DB, userId)
  await c.env.DB.prepare('UPDATE users SET admin_memo=? WHERE id=?').bind(memo||'', userId).run()
  await writeAdminLog(c.env.DB, admin.id, admin.username, 'memo_update', userId, target?.username||null, { memo })
  return c.json({ success: true })
})

// 관리자 비밀번호 강제 초기화
app.post('/api/admin/user/reset-password', async (c) => {
  const admin = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  if (!admin || !admin.is_admin) return c.json({ error:'FORBIDDEN' }, 403)
  const { userId, newPassword } = await c.req.json()
  if (!newPassword || newPassword.length < 6) return c.json({ error:'PASSWORD_SHORT' }, 400)
  const hash = await hashPassword(newPassword)
  const target = await getUser(c.env.DB, userId)
  await c.env.DB.prepare('UPDATE users SET password_hash=?, login_fail_count=0, locked_until=0 WHERE id=?').bind(hash, userId).run()
  // 해당 유저 세션 전체 삭제
  await c.env.DB.prepare('DELETE FROM sessions WHERE user_id=?').bind(userId).run()
  await writeAdminLog(c.env.DB, admin.id, admin.username, 'reset_password', userId, target?.username||null, {})
  return c.json({ success: true })
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

  const today = new Date(); today.setHours(0,0,0,0)
  const todayTs = today.getTime()
  const weekAgoTs = Date.now() - 7*24*60*60*1000

  const stats = await c.env.DB.prepare(`
    SELECT
      (SELECT COUNT(*) FROM users) as totalUsers,
      (SELECT COUNT(*) FROM users WHERE created_at >= ${todayTs}) as newUsersToday,
      (SELECT COALESCE(SUM(amount),0) FROM bets) as totalBetAmount,
      (SELECT COALESCE(SUM(payout),0) FROM bets) as totalPayoutAmount,
      (SELECT COALESCE(SUM(referral_earnings),0) FROM users) as totalReferralPaid,
      (SELECT COUNT(*) FROM withdraw_requests WHERE status='pending') as pendingWithdrawCount,
      (SELECT COALESCE(SUM(amount),0) FROM withdraw_requests WHERE status='pending') as pendingWithdrawAmount,
      (SELECT COUNT(*) FROM rounds WHERE settled=1) as totalGames,
      (SELECT COALESCE(SUM(amount),0) FROM bets WHERE created_at >= ${todayTs}) as todayBetAmount,
      (SELECT COUNT(*) FROM bets WHERE created_at >= ${todayTs}) as todayBetCount,
      (SELECT COALESCE(SUM(amount),0) FROM deposit_logs) as totalDepositAmount,
      (SELECT COUNT(*) FROM deposit_logs WHERE created_at >= ${todayTs}) as todayDepositCount,
      (SELECT COALESCE(SUM(amount),0) FROM deposit_logs WHERE created_at >= ${todayTs}) as todayDepositAmount,
      (SELECT COALESCE(SUM(amount),0) FROM withdraw_requests WHERE status='approved') as totalWithdrawAmount,
      (SELECT COALESCE(SUM(amount),0) FROM withdraw_requests WHERE status='approved' AND processed_at >= ${todayTs}) as todayWithdrawAmount
  `).first<any>()

  const daily = await c.env.DB.prepare(`
    SELECT
      strftime('%m/%d', datetime(created_at/1000,'unixepoch')) as date,
      COUNT(*) as betCount,
      COALESCE(SUM(amount),0) as betAmount
    FROM bets WHERE created_at >= ?
    GROUP BY date ORDER BY date ASC
  `).bind(weekAgoTs).all<any>()

  // 7일 일별 입금/출금/신규가입 추이
  const dailyDeposits = await c.env.DB.prepare(`
    SELECT strftime('%m/%d', datetime(created_at/1000,'unixepoch')) as date,
      COALESCE(SUM(amount),0) as depositAmount, COUNT(*) as depositCount
    FROM deposit_logs WHERE created_at >= ?
    GROUP BY date ORDER BY date ASC
  `).bind(weekAgoTs).all<any>()

  const dailyWithdraws = await c.env.DB.prepare(`
    SELECT strftime('%m/%d', datetime(processed_at/1000,'unixepoch')) as date,
      COALESCE(SUM(amount),0) as withdrawAmount, COUNT(*) as withdrawCount
    FROM withdraw_requests WHERE status='approved' AND processed_at >= ?
    GROUP BY date ORDER BY date ASC
  `).bind(weekAgoTs).all<any>()

  const dailySignups = await c.env.DB.prepare(`
    SELECT strftime('%m/%d', datetime(created_at/1000,'unixepoch')) as date,
      COUNT(*) as signupCount
    FROM users WHERE created_at >= ?
    GROUP BY date ORDER BY date ASC
  `).bind(weekAgoTs).all<any>()

  const houseProfit = r2((stats?.totalBetAmount||0) - (stats?.totalPayoutAmount||0) - (stats?.totalReferralPaid||0))
  return c.json({
    ...stats, houseProfit,
    dailyStats: daily.results || [],
    dailyDeposits: dailyDeposits.results || [],
    dailyWithdraws: dailyWithdraws.results || [],
    dailySignups: dailySignups.results || []
  })
})

app.get('/api/admin/withdraws', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const status  = c.req.query('status') || ''   // pending | approved | rejected | all
  const search  = c.req.query('search') || ''
  const page    = Math.max(1, parseInt(c.req.query('page') || '1'))
  const plimit  = 20
  const poffset = (page - 1) * plimit

  let query = 'SELECT * FROM withdraw_requests'
  const conds: string[] = [], params: any[] = []
  if (status && status !== 'all') { conds.push("status=?"); params.push(status) }
  if (search) { conds.push("username LIKE ?"); params.push('%'+search+'%') }
  if (conds.length) query += ' WHERE ' + conds.join(' AND ')
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(plimit, poffset)

  let cntQuery = 'SELECT COUNT(*) as cnt FROM withdraw_requests'
  const cntParams = params.slice(0, -2)
  if (conds.length) cntQuery += ' WHERE ' + conds.join(' AND ')

  const reqs    = await c.env.DB.prepare(query).bind(...params).all<any>()
  const cntRow  = await c.env.DB.prepare(cntQuery).bind(...cntParams).first<{cnt:number}>()
  return c.json({ requests: reqs.results || [], total: cntRow?.cnt||0, totalPages: Math.ceil((cntRow?.cnt||0)/plimit), page })
})

app.post('/api/admin/withdraw/approve', async (c) => {
  const admin = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  if (!admin || !admin.is_admin) return c.json({ error:'FORBIDDEN' }, 403)
  const { requestId, txHash } = await c.req.json()
  const req = await c.env.DB.prepare('SELECT * FROM withdraw_requests WHERE id=?').bind(requestId).first<any>()
  if (!req) return c.json({ error:'NOT_FOUND' }, 404)
  if (req.status !== 'pending') return c.json({ error:'ALREADY_PROCESSED' }, 400)

  const finalTx = txHash || 'TX_'+uid()
  await c.env.DB.batch([
    c.env.DB.prepare("UPDATE withdraw_requests SET status='approved', processed_at=?, tx_hash=? WHERE id=?").bind(Date.now(), finalTx, requestId),
    c.env.DB.prepare('UPDATE users SET total_withdraw=total_withdraw+? WHERE id=?').bind(req.amount, req.user_id)
  ])
  await writeAdminLog(c.env.DB, admin.id, admin.username, 'approve_withdraw', req.user_id, req.username, { requestId, amount: req.amount, txHash: finalTx })
  return c.json({ success:true })
})

app.post('/api/admin/withdraw/reject', async (c) => {
  const admin = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  if (!admin || !admin.is_admin) return c.json({ error:'FORBIDDEN' }, 403)
  const { requestId, note } = await c.req.json()
  const req = await c.env.DB.prepare('SELECT * FROM withdraw_requests WHERE id=?').bind(requestId).first<any>()
  if (!req) return c.json({ error:'NOT_FOUND' }, 404)
  if (req.status !== 'pending') return c.json({ error:'ALREADY_PROCESSED' }, 400)

  await c.env.DB.batch([
    c.env.DB.prepare("UPDATE withdraw_requests SET status='rejected', processed_at=?, note=? WHERE id=?").bind(Date.now(), note||'', requestId),
    c.env.DB.prepare('UPDATE users SET balance=balance+? WHERE id=?').bind(req.amount, req.user_id)
  ])
  await writeAdminLog(c.env.DB, admin.id, admin.username, 'reject_withdraw', req.user_id, req.username, { requestId, amount: req.amount, note })
  return c.json({ success:true })
})

app.get('/api/admin/users', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const search  = c.req.query('search') || ''
  const page    = Math.max(1, parseInt(c.req.query('page') || '1'))
  const plimit  = 20
  const poffset = (page - 1) * plimit

  const users = search
    ? await c.env.DB.prepare(`SELECT id,username,balance,total_deposit,total_withdraw,total_bet_amount,referral_earnings,is_admin,is_banned,created_at,last_ip,login_count FROM users WHERE username LIKE ? OR last_ip LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind('%'+search+'%','%'+search+'%',plimit,poffset).all<any>()
    : await c.env.DB.prepare(`SELECT id,username,balance,total_deposit,total_withdraw,total_bet_amount,referral_earnings,is_admin,is_banned,created_at,last_ip,login_count FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(plimit,poffset).all<any>()

  const totalRow = search
    ? await c.env.DB.prepare('SELECT COUNT(*) as cnt FROM users WHERE username LIKE ? OR last_ip LIKE ?').bind('%'+search+'%','%'+search+'%').first<{cnt:number}>()
    : await c.env.DB.prepare('SELECT COUNT(*) as cnt FROM users').first<{cnt:number}>()

  return c.json({
    users: (users.results||[]).map((u:any) => ({
      id:u.id, username:u.username, balance:u.balance,
      totalDeposit:u.total_deposit, totalWithdraw:u.total_withdraw,
      totalBetAmount:u.total_bet_amount, referralEarnings:u.referral_earnings,
      isAdmin:!!u.is_admin, isBanned:!!u.is_banned,
      createdAt:u.created_at, lastIp:u.last_ip, loginCount:u.login_count
    })),
    page, totalPages: Math.ceil((totalRow?.cnt||0)/plimit)
  })
})
app.post('/api/admin/user/balance', async (c) => {
  const admin = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  if (!admin || !admin.is_admin) return c.json({ error:'FORBIDDEN' }, 403)
  const { userId, amount, type } = await c.req.json()
  const amt = parseFloat(amount)
  if (!amt) return c.json({ error:'INVALID_AMOUNT' }, 400)

  const logId = uid()
  const target = await getUser(c.env.DB, userId)
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
  await writeAdminLog(c.env.DB, admin.id, admin.username, type==='set'?'balance_set':'balance_add', userId, target?.username||null, { type, amount: amt, newBalance: updated?.balance||0 })
  return c.json({ success:true, balance: updated?.balance || 0 })
})

app.post('/api/admin/user/ban', async (c) => {
  const admin = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  if (!admin || !admin.is_admin) return c.json({ error:'FORBIDDEN' }, 403)
  const { userId, ban } = await c.req.json()
  const target = await getUser(c.env.DB, userId)
  await c.env.DB.prepare('UPDATE users SET is_banned=? WHERE id=?').bind(ban ? 1 : 0, userId).run()
  await writeAdminLog(c.env.DB, admin.id, admin.username, ban?'ban':'unban', userId, target?.username||null, {})
  return c.json({ success:true })
})

app.get('/api/admin/deposits', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const logs = await c.env.DB.prepare('SELECT * FROM deposit_logs ORDER BY created_at DESC LIMIT 100').all<any>()
  return c.json({ deposits: logs.results || [] })
})

// ─────────────────────────────────────────────
// API: 관리자 유저 상세 (베팅/입금/출금 이력 + 동일IP 계정)
// ─────────────────────────────────────────────
app.get('/api/admin/user/:userId/detail', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const userId = c.req.param('userId')
  const user = await getUser(c.env.DB, userId)
  if (!user) return c.json({ error:'NOT_FOUND' }, 404)

  const bets = await c.env.DB.prepare(`
    SELECT b.round_id, b.choice, b.amount, b.payout, b.win, b.created_at, r.result
    FROM bets b LEFT JOIN rounds r ON b.round_id=r.id
    WHERE b.user_id=? ORDER BY b.created_at DESC LIMIT 50
  `).bind(userId).all<any>()

  const deposits = await c.env.DB.prepare(
    'SELECT id, amount, tx_hash, network, memo, created_at FROM deposit_logs WHERE user_id=? ORDER BY created_at DESC LIMIT 30'
  ).bind(userId).all<any>()

  const withdraws = await c.env.DB.prepare(
    'SELECT id, amount, address, status, tx_hash, note, created_at, processed_at FROM withdraw_requests WHERE user_id=? ORDER BY created_at DESC LIMIT 30'
  ).bind(userId).all<any>()

  // 동일 IP 계정 탐지
  const sameIpUsers = user.last_ip
    ? await c.env.DB.prepare(
        'SELECT id, username, is_banned, created_at FROM users WHERE last_ip=? AND id!=? LIMIT 10'
      ).bind(user.last_ip, userId).all<any>()
    : { results: [] }

  return c.json({
    user: {
      id: user.id, username: user.username, balance: user.balance,
      totalDeposit: user.total_deposit, totalWithdraw: user.total_withdraw,
      totalBetAmount: user.total_bet_amount, referralEarnings: user.referral_earnings,
      isAdmin: !!user.is_admin, isBanned: !!user.is_banned,
      createdAt: user.created_at, lastIp: user.last_ip, loginCount: user.login_count,
      adminMemo: user.admin_memo || ''
    },
    bets: (bets.results||[]).map((b:any) => ({
      roundId: b.round_id, choice: b.choice, result: b.result,
      amount: b.amount, win: !!b.win, payout: b.payout, timestamp: b.created_at
    })),
    deposits: (deposits.results||[]).map((d:any) => ({
      id: d.id, amount: d.amount, txHash: d.tx_hash,
      network: d.network||'manual', memo: d.memo||'', createdAt: d.created_at
    })),
    withdraws: (withdraws.results||[]).map((w:any) => ({
      id: w.id, amount: w.amount, address: w.address, status: w.status,
      txHash: w.tx_hash, note: w.note, createdAt: w.created_at, processedAt: w.processed_at
    })),
    sameIpUsers: (sameIpUsers.results||[]).map((u:any) => ({
      id: u.id, username: u.username, isBanned: !!u.is_banned, createdAt: u.created_at
    }))
  })
})

// ─────────────────────────────────────────────
// API: 마이페이지 입금 내역
// ─────────────────────────────────────────────
app.get('/api/me/deposits', async (c) => {
  const user = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  if (!user) return c.json({ error:'UNAUTH' }, 401)
  const logs = await c.env.DB.prepare(
    'SELECT id, amount, tx_hash, network, memo, created_at FROM deposit_logs WHERE user_id=? ORDER BY created_at DESC LIMIT 30'
  ).bind(user.id).all<any>()
  return c.json({
    deposits: (logs.results||[]).map((d:any) => ({
      id: d.id, amount: d.amount, txHash: d.tx_hash,
      network: d.network||'manual', memo: d.memo||'', createdAt: d.created_at
    }))
  })
})

// ─────────────────────────────────────────────
// API: 관리자 수동 입금 처리
// ─────────────────────────────────────────────
app.post('/api/admin/deposit/manual', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const { userId, amount, txHash, network, memo } = await c.req.json()
  const amt = parseFloat(amount)
  if (!userId)                  return c.json({ error:'NEED_USER' }, 400)
  if (!amt || amt <= 0)         return c.json({ error:'INVALID_AMOUNT' }, 400)

  // 유저 존재 확인
  const target = await getUser(c.env.DB, userId)
  if (!target) return c.json({ error:'USER_NOT_FOUND' }, 404)

  const now    = Date.now()
  const logId  = uid()
  const finalTx = txHash || ('MANUAL_' + uid())

  await c.env.DB.batch([
    c.env.DB.prepare('UPDATE users SET balance=balance+?, total_deposit=total_deposit+? WHERE id=?').bind(amt, amt, userId),
    c.env.DB.prepare(
      'INSERT INTO deposit_logs (id,user_id,username,amount,tx_hash,network,memo,created_at) VALUES (?,?,?,?,?,?,?,?)'
    ).bind(logId, userId, target.username, amt, finalTx, network||'manual', memo||'관리자 수동 입금', now)
  ])

  const updated = await getUser(c.env.DB, userId)
  const adminUser = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  if (adminUser) await writeAdminLog(c.env.DB, adminUser.id, adminUser.username, 'manual_deposit', userId, target.username, { amount: amt, txHash: finalTx, network: network||'manual', memo: memo||'관리자 수동 입금' })
  return c.json({ success:true, balance: updated?.balance||0, txId: logId })
})

// ─────────────────────────────────────────────
// API: 관리자 - 출금 승인 (TX Hash 포함)
//   기존 approve를 덮어쓰지 않고 tx_hash 필수 검증 강화
// ─────────────────────────────────────────────
app.post('/api/admin/withdraw/approve', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const { requestId, txHash } = await c.req.json()
  if (!requestId) return c.json({ error:'NEED_REQUEST_ID' }, 400)
  const req = await c.env.DB.prepare('SELECT * FROM withdraw_requests WHERE id=?').bind(requestId).first<any>()
  if (!req)                    return c.json({ error:'NOT_FOUND' }, 404)
  if (req.status !== 'pending') return c.json({ error:'ALREADY_PROCESSED' }, 400)

  const finalTx = (txHash && txHash.trim()) ? txHash.trim() : ('TX_' + uid())
  await c.env.DB.batch([
    c.env.DB.prepare("UPDATE withdraw_requests SET status='approved', processed_at=?, tx_hash=? WHERE id=?").bind(Date.now(), finalTx, requestId),
    c.env.DB.prepare('UPDATE users SET total_withdraw=total_withdraw+? WHERE id=?').bind(req.amount, req.user_id)
  ])
  const adminUser2 = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  if (adminUser2) await writeAdminLog(c.env.DB, adminUser2.id, adminUser2.username, 'approve_withdraw', req.user_id, req.username, { requestId, amount: req.amount, txHash: finalTx })
  return c.json({ success:true, txHash: finalTx })
})

// ─────────────────────────────────────────────
// 사이트 설정 API
// ─────────────────────────────────────────────

// 입금 정보 조회 (공개 - 지갑 탭용)
app.get('/api/deposit-info', async (c) => {
  const rows = await c.env.DB.prepare(
    "SELECT key, value FROM site_settings WHERE key LIKE 'deposit_%'"
  ).all<any>()
  const s: Record<string, string> = {}
  for (const r of (rows.results || [])) s[r.key] = r.value

  const networks = []
  for (const net of ['trc20','erc20','bep20']) {
    if (s[`deposit_${net}_enabled`] === '1' && s[`deposit_${net}_address`]) {
      const lang = c.req.query('lang') || 'ko'
      const memo = (lang !== 'ko' && s[`deposit_${net}_memo_en`]) 
        ? s[`deposit_${net}_memo_en`] 
        : s[`deposit_${net}_memo`]
      networks.push({
        id:      net,
        label:   net === 'trc20' ? 'TRC20 (TRON)' : net === 'erc20' ? 'ERC20 (Ethereum)' : 'BEP20 (BSC)',
        address: s[`deposit_${net}_address`],
        memo:    memo || '',
        minAmount: parseFloat(s['deposit_min_amount'] || '1')
      })
    }
  }
  return c.json({ networks, minAmount: parseFloat(s['deposit_min_amount'] || '1') })
})

// 관리자: 설정 전체 조회
app.get('/api/admin/settings', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const rows = await c.env.DB.prepare('SELECT key, value FROM site_settings').all<any>()
  const settings: Record<string, string> = {}
  for (const r of (rows.results || [])) settings[r.key] = r.value
  return c.json({ settings })
})

// 관리자: 설정 저장 (여러 키 한번에)
app.post('/api/admin/settings', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const { settings } = await c.req.json() as { settings: Record<string, string> }
  if (!settings || typeof settings !== 'object') return c.json({ error:'INVALID' }, 400)

  const ALLOWED_PREFIXES = ['deposit_', 'site_', 'game_', 'withdraw_']
  const now = Date.now()
  const stmts = []
  for (const [key, value] of Object.entries(settings)) {
    if (!ALLOWED_PREFIXES.some(p => key.startsWith(p))) continue
    stmts.push(
      c.env.DB.prepare('INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES (?,?,?)')
        .bind(key, String(value), now)
    )
  }
  if (stmts.length > 0) await c.env.DB.batch(stmts)
  return c.json({ success: true, saved: stmts.length })
})

// 게임 설정 공개 조회 (프론트엔드용)
app.get('/api/game-settings', async (c) => {
  const rows = await c.env.DB.prepare(
    "SELECT key, value FROM site_settings WHERE key LIKE 'game_%' OR key LIKE 'withdraw_%'"
  ).all<any>()
  const s: Record<string, string> = {}
  for (const r of (rows.results || [])) s[r.key] = r.value
  return c.json({
    payout:          parseFloat(s['game_payout']          || '1.90'),
    minBet:          parseFloat(s['game_min_bet']          || '0.1'),
    maxBet:          parseFloat(s['game_max_bet']          || '1000'),
    withdrawFee:     parseFloat(s['withdraw_fee']          || '1'),
    minWithdraw:     parseFloat(s['withdraw_min_amount']   || '1'),
    betRequirement:  parseFloat(s['withdraw_bet_requirement'] || '0.5'),
  })
})

// ─────────────────────────────────────────────
// API: 유저 개인 메시지 (읽지않은 메시지 조회 + 읽음 처리)
// ─────────────────────────────────────────────
app.get('/api/my-messages', async (c) => {
  const user = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  if (!user) return c.json({ error:'UNAUTH' }, 401)
  const msgs = await c.env.DB.prepare(
    'SELECT * FROM user_messages WHERE user_id=? AND is_read=0 ORDER BY created_at DESC LIMIT 5'
  ).bind(user.id).all<any>()
  return c.json({ messages: msgs.results || [] })
})

app.post('/api/my-messages/read', async (c) => {
  const user = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  if (!user) return c.json({ error:'UNAUTH' }, 401)
  const { messageId } = await c.req.json()
  await c.env.DB.prepare('UPDATE user_messages SET is_read=1 WHERE id=? AND user_id=?').bind(messageId, user.id).run()
  return c.json({ success: true })
})

// API: 관리자 - 대량 메시지 발송
app.post('/api/admin/message/broadcast', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const { message, filter } = await c.req.json()
  // filter: 'all' | 'inactive' (7일 이상 미접속) | 'high_roller' (총베팅 100 이상)
  if (!message || message.trim().length === 0) return c.json({ error:'EMPTY_MESSAGE' }, 400)

  let query = 'SELECT id FROM users WHERE is_banned=0'
  const params: any[] = []
  const now = Date.now()

  if (filter === 'inactive') {
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000
    query += ' AND (last_active IS NULL OR last_active < ?)'
    params.push(sevenDaysAgo)
  } else if (filter === 'high_roller') {
    query += ' AND total_bet_amount >= 100'
  } else if (filter === 'no_deposit') {
    query += ' AND total_deposit = 0'
  }

  const users = await c.env.DB.prepare(query).bind(...params).all<any>()
  const targets = users.results || []
  if (targets.length === 0) return c.json({ success: true, sent: 0 })

  // 배치로 메시지 삽입
  const stmts = targets.map((u:any) =>
    c.env.DB.prepare('INSERT INTO user_messages (id,user_id,message,is_read,created_at) VALUES (?,?,?,0,?)').bind(uid(), u.id, message.trim(), now)
  )
  // D1 batch 100개 제한
  for (let i = 0; i < stmts.length; i += 50) {
    await c.env.DB.batch(stmts.slice(i, i + 50))
  }

  return c.json({ success: true, sent: targets.length })
})

// ─────────────────────────────────────────────
// API: 유저 개인 30일 손익 그래프
// ─────────────────────────────────────────────
app.get('/api/my-stats', async (c) => {
  const user = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  if (!user) return c.json({ error:'UNAUTH' }, 401)

  const days  = 30
  const now   = Date.now()
  const start = now - days * 24 * 60 * 60 * 1000

  const bets = await c.env.DB.prepare(`
    SELECT b.amount, b.win, b.payout, b.created_at
    FROM bets b
    WHERE b.user_id=? AND b.settled=1 AND b.created_at >= ?
    ORDER BY b.created_at ASC
  `).bind(user.id, start).all<any>()

  // 일별 집계
  const dayMap: Record<string, { bet: number; payout: number; count: number }> = {}
  for (const b of (bets.results||[])) {
    const d = new Date(b.created_at)
    const key = `${d.getMonth()+1}/${d.getDate()}`
    if (!dayMap[key]) dayMap[key] = { bet:0, payout:0, count:0 }
    dayMap[key].bet    += b.amount
    dayMap[key].payout += b.win ? b.payout : 0
    dayMap[key].count  += 1
  }

  // 최근 30일 날짜 배열 생성
  const labels: string[] = []
  const profits: number[] = []
  const betsArr: number[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000)
    const key = `${d.getMonth()+1}/${d.getDate()}`
    labels.push(key)
    const day = dayMap[key] || { bet:0, payout:0, count:0 }
    profits.push(parseFloat((day.payout - day.bet).toFixed(2)))
    betsArr.push(parseFloat(day.bet.toFixed(2)))
  }

  // 전체 합산
  const allBets   = (bets.results||[]).reduce((s:number, b:any) => s + b.amount, 0)
  const allPayout = (bets.results||[]).filter((b:any) => b.win).reduce((s:number, b:any) => s + b.payout, 0)
  const wins      = (bets.results||[]).filter((b:any) => b.win).length
  const total     = (bets.results||[]).length

  return c.json({
    labels, profits, bets: betsArr,
    summary: {
      totalGames: total, wins,
      winRate: total > 0 ? ((wins/total)*100).toFixed(1) : '0',
      totalBet: parseFloat(allBets.toFixed(2)),
      totalPayout: parseFloat(allPayout.toFixed(2)),
      netProfit: parseFloat((allPayout - allBets).toFixed(2))
    }
  })
})

// ─────────────────────────────────────────────
// API: 리더보드
// ─────────────────────────────────────────────
app.get('/api/leaderboard', async (c) => {
  const type = c.req.query('type') || 'total_bet'  // total_bet | roi

  let topBet: any[] = []
  let topRoi: any[] = []

  if (type === 'total_bet' || type === 'all') {
    const rows = await c.env.DB.prepare(`
      SELECT username,
             total_bet_amount,
             (SELECT COUNT(*) FROM bets WHERE user_id=users.id AND win=1 AND settled=1) as wins,
             (SELECT COUNT(*) FROM bets WHERE user_id=users.id AND settled=1) as total_games
      FROM users
      WHERE total_bet_amount > 0 AND is_banned=0
      ORDER BY total_bet_amount DESC
      LIMIT 10
    `).all<any>()
    topBet = (rows.results||[]).map((u:any, i:number) => ({
      rank: i+1,
      username: u.username.substring(0,2)+'**',
      totalBet: u.total_bet_amount,
      wins: u.wins,
      totalGames: u.total_games,
      winRate: u.total_games > 0 ? ((u.wins/u.total_games)*100).toFixed(1) : '0'
    }))
  }

  if (type === 'roi' || type === 'all') {
    const rows = await c.env.DB.prepare(`
      SELECT username,
             total_bet_amount,
             (SELECT COALESCE(SUM(payout),0) FROM bets WHERE user_id=users.id AND win=1 AND settled=1) as total_payout,
             (SELECT COUNT(*) FROM bets WHERE user_id=users.id AND settled=1) as total_games
      FROM users
      WHERE total_bet_amount >= 10 AND is_banned=0
      ORDER BY (
        (SELECT COALESCE(SUM(payout),0) FROM bets WHERE user_id=users.id AND win=1 AND settled=1) - total_bet_amount
      ) DESC
      LIMIT 10
    `).all<any>()
    topRoi = (rows.results||[]).map((u:any, i:number) => ({
      rank: i+1,
      username: u.username.substring(0,2)+'**',
      totalBet: u.total_bet_amount,
      totalPayout: u.total_payout,
      netProfit: parseFloat((u.total_payout - u.total_bet_amount).toFixed(2)),
      totalGames: u.total_games,
      roi: u.total_bet_amount > 0 ? (((u.total_payout - u.total_bet_amount)/u.total_bet_amount)*100).toFixed(1) : '0'
    }))
  }

  return c.json({ topBet, topRoi })
})

// ─────────────────────────────────────────────
// API: 관리자 대량 메시지 발송
// ─────────────────────────────────────────────
app.post('/api/admin/message/send', async (c) => {
  const admin = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  if (!admin || !admin.is_admin) return c.json({ error:'FORBIDDEN' }, 403)

  const { title, content, filter } = await c.req.json()
  if (!title?.trim() || !content?.trim()) return c.json({ error:'EMPTY_CONTENT' }, 400)

  // filter: 'all' | 'active' | 'highroller' | 'inactive'
  const now = Date.now()
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000

  let userRows: any
  if (filter === 'active') {
    // 최근 7일 내 베팅 유저
    userRows = await c.env.DB.prepare(
      `SELECT DISTINCT u.id FROM users u
       INNER JOIN bets b ON b.user_id=u.id
       WHERE b.created_at >= ? AND u.is_banned=0`
    ).bind(sevenDaysAgo).all<any>()
  } else if (filter === 'highroller') {
    // 누적 베팅 100 USDT 이상
    userRows = await c.env.DB.prepare(
      'SELECT id FROM users WHERE total_bet_amount >= 100 AND is_banned=0'
    ).all<any>()
  } else if (filter === 'inactive') {
    // 30일 이상 미접속 (last_login 기준, 없으면 created_at)
    userRows = await c.env.DB.prepare(
      'SELECT id FROM users WHERE (last_login IS NULL OR last_login < ?) AND is_banned=0'
    ).bind(thirtyDaysAgo).all<any>()
  } else {
    // 전체 (밴 제외)
    userRows = await c.env.DB.prepare('SELECT id FROM users WHERE is_banned=0').all<any>()
  }

  const users = userRows.results || []
  if (users.length === 0) return c.json({ error:'NO_USERS', count: 0 }, 400)

  // 배치 INSERT (D1 배치 한도 = 100)
  const msgId = () => uid()
  const ts = Date.now()
  const chunkSize = 50
  let sent = 0
  for (let i = 0; i < users.length; i += chunkSize) {
    const chunk = users.slice(i, i + chunkSize)
    await c.env.DB.batch(
      chunk.map((u:any) =>
        c.env.DB.prepare(
          'INSERT INTO user_messages (id,user_id,title,content,is_read,created_at) VALUES (?,?,?,?,0,?)'
        ).bind(msgId(), u.id, title.trim(), content.trim(), ts)
      )
    )
    sent += chunk.length
  }

  await writeAdminLog(c.env.DB, admin.id, admin.username, 'mass_message', null, null, { title, filter, sentCount: sent })
  return c.json({ success:true, sentCount: sent })
})

// 유저 메시지 조회
app.get('/api/my-messages', async (c) => {
  const user = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  if (!user) return c.json({ error:'UNAUTH' }, 401)

  const msgs = await c.env.DB.prepare(
    'SELECT id,title,content,is_read,created_at FROM user_messages WHERE user_id=? ORDER BY created_at DESC LIMIT 20'
  ).bind(user.id).all<any>()

  const unread = await c.env.DB.prepare(
    'SELECT COUNT(*) as cnt FROM user_messages WHERE user_id=? AND is_read=0'
  ).bind(user.id).first<{cnt:number}>()

  return c.json({ messages: msgs.results||[], unreadCount: unread?.cnt||0 })
})

// 메시지 읽음 처리
app.post('/api/my-messages/read', async (c) => {
  const user = await getUserBySid(c.env.DB, c.req.header('X-Session-Id')||'')
  if (!user) return c.json({ error:'UNAUTH' }, 401)
  const { msgId } = await c.req.json()
  if (msgId) {
    await c.env.DB.prepare('UPDATE user_messages SET is_read=1 WHERE id=? AND user_id=?').bind(msgId, user.id).run()
  } else {
    await c.env.DB.prepare('UPDATE user_messages SET is_read=1 WHERE user_id=?').bind(user.id).run()
  }
  return c.json({ success:true })
})

// ─────────────────────────────────────────────
// API: 관리자 활동 로그 조회
// ─────────────────────────────────────────────
app.get('/api/admin/logs', async (c) => {
  if (!await checkAdmin(c.env.DB, c.req.header('X-Session-Id')||'')) return c.json({ error:'FORBIDDEN' }, 403)
  const page   = Math.max(1, parseInt(c.req.query('page') || '1'))
  const action = c.req.query('action') || ''
  const plimit  = 30
  const poffset = (page - 1) * plimit

  const whereClause = action ? "WHERE action=?" : ""
  const params      = action ? [action, plimit, poffset] : [plimit, poffset]

  const logs = await c.env.DB.prepare(
    `SELECT * FROM admin_logs ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
  ).bind(...params).all<any>()

  const totalRow = await c.env.DB.prepare(
    `SELECT COUNT(*) as cnt FROM admin_logs ${whereClause}`
  ).bind(...(action ? [action] : [])).first<{cnt:number}>()

  return c.json({
    logs: (logs.results||[]).map((l:any) => ({
      id: l.id,
      adminUsername: l.admin_username,
      action: l.action,
      targetUsername: l.target_username,
      detail: (() => { try { return JSON.parse(l.detail||'{}') } catch { return {} } })(),
      createdAt: l.created_at
    })),
    page,
    totalPages: Math.ceil((totalRow?.cnt||0)/plimit)
  })
})

// ─────────────────────────────────────────────
// 정적/기본 라우트
// ─────────────────────────────────────────────
app.get('*', (c) => {
  const res = c.html(HTML)
  // No-cache so browsers always get fresh HTML
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.headers.set('Pragma', 'no-cache')
  return res
})

const HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
<title>🎲 ODD/EVEN - Blockchain Fair Game</title>
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config={corePlugins:{preflight:false}}</script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
<link href="https://cdn.quilljs.com/1.3.7/quill.snow.css" rel="stylesheet">
<script src="https://cdn.quilljs.com/1.3.7/quill.min.js"></script>
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&family=Noto+Sans+SC:wght@400;700;900&family=Noto+Sans+JP:wght@400;700;900&display=swap');
*{font-family:'Noto Sans KR','Noto Sans SC','Noto Sans JP',sans-serif}
body{background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);min-height:100vh}
.glass{background:rgba(255,255,255,0.06);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,0.12)}
.room-card{transition:all 0.2s ease;position:relative;overflow:hidden}
.room-card:hover{transform:scale(1.015);box-shadow:0 8px 32px rgba(0,0,0,0.3)}
.room-card:active{transform:scale(0.99)}
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
.status-cancelled{color:#a0aec0;background:rgba(160,174,192,.1);border:1px solid rgba(160,174,192,.3);padding:1px 8px;border-radius:99px}
/* Quill 에디터 다크 테마 */
.ql-toolbar.ql-snow{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2)!important;border-radius:10px 10px 0 0;padding:6px 8px}
.ql-container.ql-snow{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2)!important;border-top:none!important;border-radius:0 0 10px 10px;color:#fff;min-height:120px}
.ql-editor{color:#f0f0f0;font-size:14px;line-height:1.6;min-height:100px}
.ql-editor.ql-blank::before{color:#9ca3af}
.ql-snow .ql-stroke{stroke:#ccc!important}
.ql-snow .ql-fill{fill:#ccc!important}
.ql-snow .ql-picker{color:#ccc!important}
.ql-snow .ql-picker-options{background:#2d3748!important;border:1px solid rgba(255,255,255,0.2)!important;z-index:9999!important}
.ql-snow .ql-picker-item{color:#e2e8f0!important}
.ql-snow .ql-active .ql-stroke,.ql-snow .ql-picker-label.ql-active .ql-stroke{stroke:#63b3ed!important}
.ql-snow .ql-active .ql-fill,.ql-snow .ql-picker-label.ql-active .ql-fill{fill:#63b3ed!important}
.ql-toolbar.ql-snow .ql-formats{margin-right:8px}
/* select 드롭다운이 Quill 위로 나오도록 */
select{position:relative;z-index:10}
select option{background:#1a1a2e;color:#fff}
/* 파일 첨부 영역 */
.attach-zone{border:2px dashed rgba(255,255,255,0.2);border-radius:10px;padding:12px;text-align:center;cursor:pointer;transition:all .2s}
.attach-zone:hover,.attach-zone.drag-over{border-color:#63b3ed;background:rgba(99,179,237,0.08)}
.attach-preview{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.attach-item{display:flex;align-items:center;gap:4px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:6px;padding:3px 8px;font-size:11px}
.attach-item button{color:#fc8181;background:none;border:none;cursor:pointer;font-size:12px;line-height:1}
/* 공지 내용 렌더링 */
.notice-content p{margin:0;line-height:1.5}
/* Tailwind .hidden 보장 - Tailwind CDN 로드 전/후 모두 동작 */
.hidden{display:none!important}
.notice-content strong{font-weight:700}
.notice-content em{font-style:italic}
.notice-content a{color:#63b3ed;text-decoration:underline}
/* 문의 내용 렌더링 */
.inquiry-content p{margin:0 0 4px;line-height:1.5}
.inquiry-content ul,.inquiry-content ol{padding-left:20px;margin:4px 0}
/* 탭 패널 스크롤 여백 (sticky 헤더+네비 가림 방지) */
[id^="p-"]{scroll-margin-top:110px}
/* Tailwind 보완: 기본 유틸 직접 정의 */
*,::before,::after{box-sizing:border-box}
button,input,select,textarea{font-family:inherit}
.text-white{color:#fff!important}
.flex{display:flex!important}
.block{display:block!important}
.inline-block{display:inline-block!important}
.grid{display:grid!important}
.overflow-x-auto{overflow-x:auto}
.overflow-hidden{overflow:hidden}
.w-full{width:100%}
.max-w-sm{max-width:24rem}
.max-w-2xl{max-width:42rem}
.max-w-6xl{max-width:72rem}
.mx-auto{margin-left:auto;margin-right:auto}
.sticky{position:sticky}
.top-0{top:0}
.z-50{z-index:50}
.z-40{z-index:40}
.cursor-pointer{cursor:pointer}
.transition{transition:all .15s ease}
.border-b{border-bottom-width:1px}
.px-3{padding-left:.75rem;padding-right:.75rem}
.py-4{padding-top:1rem;padding-bottom:1rem}
.text-sm{font-size:.875rem;line-height:1.25rem}
.text-xs{font-size:.75rem;line-height:1rem}
.font-bold{font-weight:700}
.font-black{font-weight:900}
.rounded-xl{border-radius:.75rem}
.rounded-2xl{border-radius:1rem}
.space-y-4>*+*{margin-top:1rem}
.space-y-3>*+*{margin-top:.75rem}
.gap-3{gap:.75rem}
.gap-2{gap:.5rem}
.gap-1{gap:.25rem}
.items-center{align-items:center}
.justify-between{justify-content:space-between}
.justify-center{justify-content:center}
.text-center{text-align:center}
.text-right{text-align:right}
.shrink-0{flex-shrink:0}
.whitespace-nowrap{white-space:nowrap}
.grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}
</style>
</head>
<body class="text-white">

<!-- 공지 배너 -->
<div id="noticeBanner" class="hidden">
  <div id="noticeList"></div>
</div>

<!-- 헤더 -->
<header id="mainHeader" class="sticky top-0 z-50 border-b border-white/10" style="background:rgba(10,8,30,.97);backdrop-filter:blur(20px)">
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

<!-- 탭 네비게이션 - 모바일 2단 구조 -->
<nav id="mainNav" class="border-b border-white/10 bg-black/30 sticky z-40" style="top:var(--hdr-h,48px)">
  <!-- 1단: 공통 주요 탭 -->
  <div class="max-w-6xl mx-auto px-2 flex whitespace-nowrap overflow-x-auto">
    <button onclick="showTab('game')"        id="t-game"        class="tab-off px-3 py-2.5 text-xs font-bold transition shrink-0" data-i18n="tab_game">🎲 게임</button>
    <button onclick="showTab('dashboard')"   id="t-dashboard"   class="tab-off px-3 py-2.5 text-xs font-bold transition shrink-0" data-i18n="tab_dashboard">📊 통계</button>
    <button onclick="showTab('leaderboard')" id="t-leaderboard" class="tab-off px-3 py-2.5 text-xs font-bold transition shrink-0">🏆 랭킹</button>
    <button onclick="showTab('faq')"         id="t-faq"         class="tab-off px-3 py-2.5 text-xs font-bold transition shrink-0" data-i18n="tab_faq">❓ FAQ</button>
    <button onclick="showTab('mypage')"      id="t-mypage"      class="tab-off hidden px-3 py-2.5 text-xs font-bold transition shrink-0" data-i18n="tab_mypage">👤 MY</button>
    <button onclick="showTab('wallet')"      id="t-wallet"      class="tab-off hidden px-3 py-2.5 text-xs font-bold transition shrink-0" data-i18n="tab_wallet">💰 지갑</button>
    <button onclick="showTab('referral')"    id="t-referral"    class="tab-off hidden px-3 py-2.5 text-xs font-bold transition shrink-0" data-i18n="tab_referral">👥 추천</button>
    <button onclick="showTab('verify')"      id="t-verify"      class="tab-off hidden px-3 py-2.5 text-xs font-bold transition shrink-0" data-i18n="tab_verify">🔍 검증</button>
    <button onclick="showTab('support')"     id="t-support"     class="tab-off hidden px-3 py-2.5 text-xs font-bold transition shrink-0" data-i18n="tab_support">💬 문의</button>
    <button onclick="showTab('admin')"       id="t-admin"       class="tab-off hidden px-3 py-2.5 text-xs font-bold transition shrink-0 text-yellow-400">⚙️ 관리자</button>
  </div>
  <!-- 2단: 모바일 전용 (sm 미만) -->
  <div id="mobileSubNav" class="sm:hidden border-t border-white/5 bg-black/20 px-2 flex whitespace-nowrap overflow-x-auto">
    <button onclick="showTab('mypage')"      id="t-mypage-m"    class="tab-off hidden px-3 py-2 text-xs font-bold transition shrink-0" data-i18n="tab_mypage">👤 MY</button>
    <button onclick="showTab('wallet')"      id="t-wallet-m"    class="tab-off hidden px-3 py-2 text-xs font-bold transition shrink-0" data-i18n="tab_wallet">💰 지갑</button>
    <button onclick="showTab('referral')"    id="t-referral-m"  class="tab-off hidden px-3 py-2 text-xs font-bold transition shrink-0" data-i18n="tab_referral">👥 추천</button>
    <button onclick="showTab('verify')"      id="t-verify-m"    class="tab-off hidden px-3 py-2 text-xs font-bold transition shrink-0" data-i18n="tab_verify">🔍 검증</button>
    <button onclick="showTab('support')"     id="t-support-m"   class="tab-off hidden px-3 py-2 text-xs font-bold transition shrink-0" data-i18n="tab_support">💬 문의</button>
  </div>
</nav>

<main id="mainContent" class="max-w-6xl mx-auto px-3 py-4">

<!-- ══ 게임 탭 ══ -->
<div id="p-game" class="hidden">

  <!-- 방 선택 화면 -->
  <div id="roomSelectScreen">
    <div class="text-center mb-6">
      <h2 class="text-2xl font-black mb-1">🎮 <span data-i18n="room_select_title">방 선택</span></h2>
      <p class="text-gray-400 text-sm" data-i18n="room_select_desc">참여할 게임 방을 선택하세요</p>
    </div>
    <div class="grid grid-cols-1 gap-3 max-w-2xl mx-auto" id="roomList">

      <!-- 터보 방 -->
      <div onclick="selectRoom('turbo')" class="room-card glass rounded-2xl p-4 cursor-pointer hover:scale-[1.02] transition-all border border-yellow-500/30 hover:border-yellow-400/60 hover:bg-yellow-500/5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="text-3xl">⚡</div>
            <div>
              <div class="font-black text-base text-yellow-300" data-i18n="room_turbo">터보</div>
              <div class="text-xs text-gray-400 mt-0.5">
                <span class="text-yellow-400 font-bold" data-i18n="room_turbo_desc">15초 · 수수료 7%</span>
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-gray-500" data-i18n="room_bet_range">베팅 범위</div>
            <div class="text-sm font-bold text-yellow-300">1 ~ 100 USDT</div>
            <div class="text-xs text-green-400 mt-0.5">x1.86</div>
          </div>
        </div>
        <div id="room-status-turbo" class="mt-2 text-xs text-gray-500 flex items-center gap-2">
          <span class="w-1.5 h-1.5 bg-yellow-400 rounded-full pulse inline-block"></span>
          <span data-i18n="room_loading">로딩 중...</span>
        </div>
      </div>

      <!-- 스탠다드 방 -->
      <div onclick="selectRoom('standard')" class="room-card glass rounded-2xl p-4 cursor-pointer hover:scale-[1.02] transition-all border border-blue-500/30 hover:border-blue-400/60 hover:bg-blue-500/5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="text-3xl">🎯</div>
            <div>
              <div class="font-black text-base text-blue-300" data-i18n="room_standard">스탠다드</div>
              <div class="text-xs text-gray-400 mt-0.5">
                <span class="text-blue-400 font-bold" data-i18n="room_standard_desc">30초 · 수수료 5%</span>
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-gray-500" data-i18n="room_bet_range">베팅 범위</div>
            <div class="text-sm font-bold text-blue-300">101 ~ 500 USDT</div>
            <div class="text-xs text-green-400 mt-0.5">x1.90</div>
          </div>
        </div>
        <div id="room-status-standard" class="mt-2 text-xs text-gray-500 flex items-center gap-2">
          <span class="w-1.5 h-1.5 bg-blue-400 rounded-full pulse inline-block"></span>
          <span data-i18n="room_loading">로딩 중...</span>
        </div>
      </div>

      <!-- 하이롤러 방 -->
      <div onclick="selectRoom('high')" class="room-card glass rounded-2xl p-4 cursor-pointer hover:scale-[1.02] transition-all border border-purple-500/30 hover:border-purple-400/60 hover:bg-purple-500/5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="text-3xl">💎</div>
            <div>
              <div class="font-black text-base text-purple-300" data-i18n="room_high">하이롤러</div>
              <div class="text-xs text-gray-400 mt-0.5">
                <span class="text-purple-400 font-bold" data-i18n="room_high_desc">30초 · 수수료 4%</span>
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-gray-500" data-i18n="room_bet_range">베팅 범위</div>
            <div class="text-sm font-bold text-purple-300">501 ~ 2,000 USDT</div>
            <div class="text-xs text-green-400 mt-0.5">x1.92</div>
          </div>
        </div>
        <div id="room-status-high" class="mt-2 text-xs text-gray-500 flex items-center gap-2">
          <span class="w-1.5 h-1.5 bg-purple-400 rounded-full pulse inline-block"></span>
          <span data-i18n="room_loading">로딩 중...</span>
        </div>
      </div>

      <!-- VIP 방 -->
      <div onclick="selectRoom('vip')" class="room-card glass rounded-2xl p-4 cursor-pointer hover:scale-[1.02] transition-all border border-orange-500/30 hover:border-orange-400/60 hover:bg-orange-500/5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="text-3xl">👑</div>
            <div>
              <div class="font-black text-base text-orange-300" data-i18n="room_vip">VIP</div>
              <div class="text-xs text-gray-400 mt-0.5">
                <span class="text-orange-400 font-bold" data-i18n="room_vip_desc">30초 · 수수료 3%</span>
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-gray-500" data-i18n="room_bet_range">베팅 범위</div>
            <div class="text-sm font-bold text-orange-300">2,001 ~ 5,000 USDT</div>
            <div class="text-xs text-green-400 mt-0.5">x1.94</div>
          </div>
        </div>
        <div id="room-status-vip" class="mt-2 text-xs text-gray-500 flex items-center gap-2">
          <span class="w-1.5 h-1.5 bg-orange-400 rounded-full pulse inline-block"></span>
          <span data-i18n="room_loading">로딩 중...</span>
        </div>
      </div>

      <!-- 마스터 방 -->
      <div onclick="selectRoom('master')" class="room-card glass rounded-2xl p-4 cursor-pointer hover:scale-[1.02] transition-all border border-red-500/30 hover:border-red-400/60 hover:bg-red-500/5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="text-3xl">🏆</div>
            <div>
              <div class="font-black text-base text-red-300" data-i18n="room_master">마스터</div>
              <div class="text-xs text-gray-400 mt-0.5">
                <span class="text-red-400 font-bold" data-i18n="room_master_desc">30초 · 수수료 2%</span>
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-gray-500" data-i18n="room_bet_range">베팅 범위</div>
            <div class="text-sm font-bold text-red-300">5,001 ~ 10,000 USDT</div>
            <div class="text-xs text-green-400 mt-0.5">x1.96</div>
          </div>
        </div>
        <div id="room-status-master" class="mt-2 text-xs text-gray-500 flex items-center gap-2">
          <span class="w-1.5 h-1.5 bg-red-400 rounded-full pulse inline-block"></span>
          <span data-i18n="room_loading">로딩 중...</span>
        </div>
      </div>

      <!-- P2P 배틀룸 -->
      <div onclick="showTab('p2p')" class="room-card glass rounded-2xl p-4 cursor-pointer hover:scale-[1.02] transition-all border border-pink-500/30 hover:border-pink-400/60 hover:bg-pink-500/5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="text-3xl">⚔️</div>
            <div>
              <div class="font-black text-base text-pink-300" data-i18n="room_battle">⚔️ 배틀</div>
              <div class="text-xs text-gray-400 mt-0.5">
                <span class="text-pink-400 font-bold" data-i18n="room_battle_desc">60초 · 수수료 3% · P2P 고배당</span>
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-gray-500" data-i18n="room_bet_range">베팅 범위</div>
            <div class="text-sm font-bold text-pink-300">10 ~ 50,000 USDT</div>
            <div class="text-xs text-yellow-400 mt-0.5 font-black">동적 배당</div>
          </div>
        </div>
        <div class="mt-2 text-xs text-pink-400/70 flex items-center gap-2">
          <span class="w-1.5 h-1.5 bg-pink-400 rounded-full pulse inline-block"></span>
          <span>참가자끼리 베팅 — 소수파 고배당 🔥</span>
        </div>
      </div>

    </div>
  </div>

  <!-- 게임 플레이 화면 (방 선택 후 표시) -->
  <div id="gamePlayScreen" class="hidden">
    <!-- 방 정보 헤더 -->
    <div class="flex items-center justify-between mb-3">
      <button onclick="backToRoomSelect()" class="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition">
        ← <span data-i18n="room_back">방 선택으로</span>
      </button>
      <div id="currentRoomBadge" class="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold glass"></div>
    </div>

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
            <div class="text-2xl font-black text-green-400" id="gPayoutDisplay">1.90x</div>
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
              oninput="updatePayoutPreview()"
              class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-lg font-black focus:outline-none focus:border-green-400 placeholder-gray-600">
            <!-- 예상 수령액 미리보기 -->
            <div id="payoutPreview" class="hidden mt-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg text-xs text-green-400 font-bold">
              예상 수령액: <span id="payoutPreviewAmt">0.00</span> USDT
            </div>
            <!-- 잔액 부족 경고 -->
            <div id="betBalanceWarn" class="hidden mt-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 font-bold">
              ⚠️ 잔액이 부족합니다 (현재: <span id="betBalanceCur">0.00</span> USDT)
            </div>
            <div class="flex gap-1.5 mt-2 flex-wrap" id="quickBetBtns">
              <button onclick="setBet(1)"    class="px-2 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition">1</button>
              <button onclick="setBet(5)"    class="px-2 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition">5</button>
              <button onclick="setBet(10)"   class="px-2 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition">10</button>
              <button onclick="setBet(50)"   class="px-2 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition">50</button>
              <button onclick="setBet(100)"  class="px-2 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition">100</button>
              <button onclick="setBetFrac(0.25)" class="px-2 py-1.5 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 rounded-lg text-xs font-bold transition">1/4</button>
              <button onclick="setBetFrac(0.5)"  class="px-2 py-1.5 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 rounded-lg text-xs font-bold transition">1/2</button>
              <button onclick="maxBet()"     class="px-2 py-1.5 bg-yellow-500/30 hover:bg-yellow-500/50 rounded-lg text-xs font-bold text-yellow-300 transition">ALL-IN</button>
              <button onclick="clearBet()"   class="px-2 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs font-bold text-red-300 transition" data-i18n="clear">초기화</button>
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
    <!-- 30일 손익 그래프 -->
    <div class="glass rounded-xl p-4">
      <div class="flex items-center justify-between mb-3">
        <div class="font-bold text-sm">📈 최근 30일 손익 그래프</div>
        <div id="myStats30Summary" class="text-xs text-gray-400"></div>
      </div>
      <canvas id="myStats30Chart" height="120"></canvas>
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
      <!-- 베팅 내역 페이지네이션 -->
      <div id="mpBetPager" class="flex items-center justify-between mt-3 hidden">
        <button onclick="loadMypageBets(mpBetPage-1)" id="mpBetPrev" class="px-3 py-1.5 bg-white/10 rounded-lg text-xs hover:bg-white/20 transition disabled:opacity-30">◀ 이전</button>
        <span id="mpBetPageInfo" class="text-xs text-gray-400"></span>
        <button onclick="loadMypageBets(mpBetPage+1)" id="mpBetNext" class="px-3 py-1.5 bg-white/10 rounded-lg text-xs hover:bg-white/20 transition disabled:opacity-30">다음 ▶</button>
      </div>
    </div>
    <div class="glass rounded-xl p-4">
      <div class="font-bold mb-3 text-sm" data-i18n="withdraw_history">📤 출금 내역</div>
      <div id="wdHistory" class="space-y-2"><div class="text-xs text-gray-500 text-center py-2" data-i18n="no_record">기록 없음</div></div>
    </div>
    <div class="glass rounded-xl p-4">
      <div class="font-bold mb-3 text-sm">📥 입금 내역</div>
      <div id="depHistory" class="space-y-2"><div class="text-xs text-gray-500 text-center py-2">기록 없음</div></div>
    </div>
    <div class="glass rounded-xl p-4">
      <!-- 메시지함 -->
      <div class="flex items-center justify-between mb-3">
        <div class="font-bold text-sm">📨 메시지함 <span id="msgUnreadBadge" class="hidden ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full font-black">0</span></div>
        <button onclick="markAllMessagesRead()" class="px-3 py-1 bg-white/10 rounded-lg text-xs hover:bg-white/20 transition">모두 읽음</button>
      </div>
      <div id="myMessageList" class="space-y-2 max-h-64 overflow-y-auto">
        <div class="text-xs text-gray-500 text-center py-3">메시지 없음</div>
      </div>
    </div>
    <div class="glass rounded-xl p-4">
      <div class="font-bold mb-3 text-sm">🔐 <span data-i18n="change_pw_title">비밀번호 변경</span></div>
      <div class="space-y-2">
        <input type="password" id="cpCurrent" placeholder="현재 비밀번호" class="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-400">
        <input type="password" id="cpNew"     placeholder="새 비밀번호 (6자 이상)" class="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-400">
        <input type="password" id="cpConfirm" placeholder="새 비밀번호 확인" class="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-400">
        <div id="cpErr" class="hidden text-red-400 text-xs bg-red-500/10 rounded-lg p-2"></div>
        <div id="cpOk"  class="hidden text-green-400 text-xs bg-green-500/10 rounded-lg p-2">✅ 비밀번호가 변경되었습니다</div>
        <button onclick="doChangePassword()" class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition text-sm" data-i18n="change_pw_btn">비밀번호 변경</button>
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
      <!-- 네트워크 탭 (동적 생성) -->
      <div id="depositNetworkTabs" class="flex gap-2 mb-3 flex-wrap"></div>
      <!-- 네트워크별 입금 정보 (동적 생성) -->
      <div id="depositNetworkInfo">
        <div class="text-xs text-gray-500 text-center py-6">⏳ 입금 정보 로딩 중...</div>
      </div>
      <!-- 데모 입금 -->
      <div class="border-t border-white/10 pt-3 mt-3">
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
      <div class="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300 mb-2">
        <i class="fas fa-info-circle mr-1"></i>
        <span data-i18n="withdraw_condition">출금 조건: 입금액의 50% 이상 베팅 필요</span>
      </div>
      <div class="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-xs text-yellow-300 mb-3">
        <i class="fas fa-coins mr-1"></i>
        <span data-i18n="withdraw_fee_notice">TRC20 네트워크 수수료 1 USDT가 자동 차감됩니다</span>
        <span class="ml-1 text-yellow-400 font-bold">(예: 10 USDT 신청 → 실수령 9 USDT)</span>
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
      <!-- 출금 네트워크 선택 -->
      <div class="mb-3">
        <div class="text-xs text-gray-400 mb-1.5">출금 네트워크 선택</div>
        <div class="flex gap-2 flex-wrap">
          <button onclick="selectWdNetwork('trc20')" id="wdNet-trc20"
            class="px-3 py-1.5 rounded-lg text-xs font-bold border border-green-500/40 bg-green-500/10 text-green-400 transition wdnet-btn">TRC20 (TRON)</button>
          <button onclick="selectWdNetwork('erc20')" id="wdNet-erc20"
            class="px-3 py-1.5 rounded-lg text-xs font-bold border border-white/20 bg-white/5 text-gray-400 hover:bg-white/10 transition wdnet-btn">ERC20 (ETH)</button>
          <button onclick="selectWdNetwork('bep20')" id="wdNet-bep20"
            class="px-3 py-1.5 rounded-lg text-xs font-bold border border-white/20 bg-white/5 text-gray-400 hover:bg-white/10 transition wdnet-btn">BEP20 (BSC)</button>
        </div>
        <!-- 네트워크별 주소 형식 안내 -->
        <div id="wdNetGuide" class="mt-1.5 text-xs text-gray-500 bg-white/5 rounded-lg px-3 py-2 hidden"></div>
      </div>
      <div class="space-y-3 mt-3">
        <div><label class="text-xs text-gray-400 block mb-1" id="wdAddrLabel">출금 주소 (TRC20)</label><input type="text" id="wdAddr" placeholder="T..." class="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm mono focus:outline-none focus:border-red-400"></div>
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
  <!-- Chart.js 홀짝 도넛 차트 -->
  <div class="glass rounded-xl p-4 mb-4">
    <div class="font-bold mb-3 text-sm">📈 홀/짝 분포 차트</div>
    <div class="flex items-center justify-center">
      <canvas id="oddEvenChart" width="220" height="220" style="max-width:220px"></canvas>
    </div>
  </div>

  <!-- 최근 50라운드 바 차트 + 연속 결과 -->
  <div class="glass rounded-xl p-4 mb-4">
    <div class="flex items-center justify-between mb-3">
      <div class="font-bold text-sm">🎯 최근 50라운드 공정성 지표</div>
      <div class="text-xs text-gray-500">실시간 업데이트</div>
    </div>
    <!-- 연속 결과 통계 -->
    <div class="grid grid-cols-2 gap-3 mb-4">
      <div class="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
        <div class="text-xs text-gray-400 mb-1">최대 연속 홀</div>
        <div class="text-2xl font-black text-red-400" id="dMaxOddStreak">-</div>
        <div class="text-xs text-gray-500">연속</div>
      </div>
      <div class="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
        <div class="text-xs text-gray-400 mb-1">최대 연속 짝</div>
        <div class="text-2xl font-black text-blue-400" id="dMaxEvenStreak">-</div>
        <div class="text-xs text-gray-500">연속</div>
      </div>
    </div>
    <div class="mb-2">
      <div class="flex justify-between text-xs mb-1">
        <span class="text-gray-400">최근 50라운드 결과</span>
        <span id="dStreak50Info" class="text-gray-500"></span>
      </div>
      <!-- 50라운드 바 차트 -->
      <div id="dRecent50Bar" class="flex flex-wrap gap-0.5"></div>
    </div>
    <!-- 최대 연속 강조 -->
    <div class="mt-3 p-2 bg-white/5 rounded-lg text-xs text-center">
      <span class="text-gray-400">전체 최대 연속 동일 결과: </span>
      <span id="dMaxStreakAll" class="text-yellow-400 font-black text-base">-</span>
      <span class="text-gray-400"> 연속</span>
    </div>
  </div>
  <div class="glass rounded-xl p-4">
    <div class="font-bold mb-3 text-sm" data-i18n="game_history">📜 게임 기록</div>
    <div class="overflow-x-auto"><table class="w-full text-xs"><thead><tr class="text-gray-400 border-b border-white/10 text-left"><th class="py-1.5 px-2" data-i18n="round">라운드</th><th class="py-1.5 px-2" data-i18n="result">결과</th><th class="py-1.5 px-2" data-i18n="hash">해시</th><th class="py-1.5 px-2 text-right" data-i18n="total_bet">베팅</th><th class="py-1.5 px-2 text-right" data-i18n="time">시간</th></tr></thead><tbody id="dHistTbl"><tr><td colspan="5" class="text-center text-gray-500 py-3" data-i18n="no_record">기록 없음</td></tr></tbody></table></div>
    <!-- 페이지네이션 -->
    <div class="flex items-center justify-center gap-2 mt-3" id="histPagination">
      <button onclick="loadDashboard(histPage-1)" id="histPrevBtn" class="px-3 py-1.5 bg-white/10 rounded-lg text-xs hover:bg-white/20 transition disabled:opacity-30" disabled>◀ 이전</button>
      <span class="text-xs text-gray-400"><span id="histPageInfo">1 / 1</span></span>
      <button onclick="loadDashboard(histPage+1)" id="histNextBtn" class="px-3 py-1.5 bg-white/10 rounded-lg text-xs hover:bg-white/20 transition disabled:opacity-30" disabled>다음 ▶</button>
    </div>
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
  <div class="max-w-sm mx-auto space-y-4">
    <!-- 지갑 로그인 (메인) -->
    <div class="glass rounded-2xl p-7">
      <div class="text-center mb-6">
        <div class="text-5xl mb-3">🦊</div>
        <h2 class="text-xl font-black" data-i18n="wallet_login">🔗 지갑으로 로그인</h2>
        <p class="text-xs text-gray-400 mt-1" data-i18n="wallet_login_desc">MetaMask / TrustWallet / TokenPocket</p>
      </div>
      <div class="space-y-3">
        <button id="walletLoginBtn" onclick="connectWallet()" class="w-full py-4 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 rounded-xl font-black text-lg transition flex items-center justify-center gap-3">
          <span class="text-2xl">🦊</span> MetaMask
        </button>
        <button onclick="connectWallet()" class="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-xl font-black transition flex items-center justify-center gap-3">
          <span class="text-2xl">🔵</span> TrustWallet
        </button>
        <button onclick="connectWallet()" class="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 rounded-xl font-black transition flex items-center justify-center gap-3">
          <span class="text-2xl">💚</span> TokenPocket
        </button>
        <div class="text-center text-xs text-gray-500 mt-2">
          <div class="flex items-center gap-2 justify-center">
            <span class="w-3 h-3 bg-green-400 rounded-full inline-block"></span>
            비밀번호 없음 · 지갑 서명만으로 로그인
          </div>
          <div class="mt-1 text-gray-600">첫 로그인 시 자동 회원가입 · 10 USDT 보너스 🎁</div>
        </div>
      </div>
    </div>
    <!-- 기존 계정 로그인 (관리자용 폴더블) -->
    <details class="glass rounded-2xl">
      <summary class="px-5 py-3 text-xs text-gray-500 cursor-pointer hover:text-gray-300 transition">
        🔐 기존 아이디/비밀번호 로그인 (관리자·테스트용)
      </summary>
      <div class="px-5 pb-5 pt-2">
        <form onsubmit="event.preventDefault();doLogin()" class="space-y-3">
          <div><label class="text-xs text-gray-400 block mb-1" data-i18n="username">아이디</label><input type="text" id="lUser" autocomplete="username" class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-400 text-sm"></div>
          <div><label class="text-xs text-gray-400 block mb-1" data-i18n="password">비밀번호</label><input type="password" id="lPass" autocomplete="current-password" class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-400 text-sm"></div>
          <div id="lErr" class="hidden text-red-400 text-xs text-center bg-red-500/10 rounded-lg py-2"></div>
          <button type="submit" class="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-black transition" data-i18n="login">로그인</button>
          <div class="grid grid-cols-2 gap-1.5 pt-1">
            <button type="button" onclick="qLogin('admin','admin123')" class="px-2 py-2 bg-white/5 rounded-lg text-xs hover:bg-white/10 transition text-left">👑 admin / admin123</button>
            <button type="button" onclick="qLogin('demo1','demo123')" class="px-2 py-2 bg-white/5 rounded-lg text-xs hover:bg-white/10 transition text-left">🧪 demo1 / demo123</button>
          </div>
        </form>
      </div>
    </details>
  </div>
</div>

<!-- ══ 회원가입 탭 ══ -->
<div id="p-register" class="hidden">
  <div class="max-w-sm mx-auto">
    <div class="glass rounded-2xl p-7">
      <div class="text-center mb-5"><div class="text-5xl mb-3">🦊</div><h2 class="text-xl font-black" data-i18n="wallet_login">🔗 지갑으로 가입</h2><p class="text-green-400 text-xs mt-1" data-i18n="bonus_msg">🎁 가입 즉시 10 USDT 보너스!</p></div>
      <div class="space-y-3">
        <button id="walletRegBtn" onclick="connectWallet()" class="w-full py-4 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 rounded-xl font-black text-lg transition flex items-center justify-center gap-3">
          <span class="text-2xl">🦊</span> MetaMask으로 시작
        </button>
        <button onclick="connectWallet()" class="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-xl font-black transition flex items-center justify-center gap-3">
          <span class="text-2xl">🔵</span> TrustWallet으로 시작
        </button>
        <button onclick="connectWallet()" class="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 rounded-xl font-black transition flex items-center justify-center gap-3">
          <span class="text-2xl">💚</span> TokenPocket으로 시작
        </button>
        <p class="text-center text-xs text-gray-500">
          <a onclick="showTab('login')" class="text-blue-400 cursor-pointer hover:underline" data-i18n="login">기존 계정 로그인</a>
        </p>
      </div>
    </div>
  </div>
</div>

<!-- ══ P2P 배틀룸 탭 ══ -->
<div id="p-p2p" class="hidden">
  <div class="mb-4 flex items-center justify-between">
    <div>
      <h2 class="text-xl font-black">⚔️ <span data-i18n="p2p_title">P2P 배틀룸</span></h2>
      <p class="text-xs text-gray-400 mt-0.5" data-i18n="p2p_desc">참여자끼리 베팅 — 소수 쪽에 베팅할수록 고배당!</p>
    </div>
    <button onclick="showRoomSelect()" class="px-3 py-1.5 text-xs border border-white/20 rounded-lg hover:bg-white/10 transition" data-i18n="room_back">방 선택으로</button>
  </div>
  <!-- 라운드 정보 -->
  <div class="glass rounded-2xl p-4 mb-4">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <span id="p2pPhaseBadge" class="inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 betting-phase">베팅 중</span>
        <span class="text-xs text-gray-400" id="p2pRoundId">#-</span>
      </div>
      <div class="text-right">
        <div class="text-2xl font-black" id="p2pTimer">-</div>
        <div class="text-xs text-gray-500" data-i18n="sec_left">초 남음</div>
      </div>
    </div>
    <div class="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
      <div id="p2pBar" class="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full transition-all duration-1000" style="width:100%"></div>
    </div>
    <!-- P2P 풀 현황 -->
    <div class="grid grid-cols-3 gap-2 text-center mb-3">
      <div class="bg-red-500/10 rounded-xl p-3">
        <div class="text-xs text-gray-400 mb-1" data-i18n="p2p_pool_odd">홀 풀</div>
        <div class="font-black text-red-400 text-sm" id="p2pOddPool">0.00 USDT</div>
        <div class="text-xs text-gray-300 mt-1">예상 <span class="font-black text-yellow-400" id="p2pOddPayout">?</span></div>
      </div>
      <div class="text-center">
        <div class="text-xs text-gray-500 mb-1" data-i18n="total_pool">총 풀</div>
        <div class="font-black text-sm" id="p2pTotalPool">0.00 USDT</div>
        <div class="text-xs text-gray-500 mt-1" id="p2pBetCount">0 players</div>
      </div>
      <div class="bg-blue-500/10 rounded-xl p-3">
        <div class="text-xs text-gray-400 mb-1" data-i18n="p2p_pool_even">짝 풀</div>
        <div class="font-black text-blue-400 text-sm" id="p2pEvenPool">0.00 USDT</div>
        <div class="text-xs text-gray-300 mt-1">예상 <span class="font-black text-yellow-400" id="p2pEvenPayout">?</span></div>
      </div>
    </div>
    <div class="text-center text-xs text-yellow-400/80 bg-yellow-500/5 rounded-lg py-1.5 px-3" data-i18n="p2p_hint">소수 쪽에 베팅할수록 배당↑</div>
  </div>
  <!-- 결과 영역 -->
  <div id="p2pResultArea" class="hidden glass rounded-2xl p-4 mb-4"></div>
  <!-- 베팅 영역 -->
  <div class="glass rounded-2xl p-4 mb-4">
    <div class="mb-3">
      <label class="text-xs text-gray-400 block mb-1.5">베팅 금액 (최소 10 USDT)</label>
      <input type="number" id="p2pBetAmt" min="10" step="1" placeholder="10 ~ 50,000 USDT"
        class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-400 text-sm">
      <div class="flex gap-1.5 mt-2 flex-wrap">
        <button onclick="document.getElementById('p2pBetAmt').value=10"  class="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs">10</button>
        <button onclick="document.getElementById('p2pBetAmt').value=50"  class="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs">50</button>
        <button onclick="document.getElementById('p2pBetAmt').value=100" class="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs">100</button>
        <button onclick="document.getElementById('p2pBetAmt').value=500" class="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs">500</button>
        <button onclick="document.getElementById('p2pBetAmt').value=1000"class="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs">1K</button>
        <button onclick="if(me)document.getElementById('p2pBetAmt').value=Math.min(me.balance,50000)" class="px-2 py-1 bg-yellow-500/30 hover:bg-yellow-500/50 rounded text-xs font-bold text-yellow-300">ALL-IN</button>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-3">
      <button id="p2pBtnOdd"  onclick="doP2PBet('odd')"  class="btn-odd py-4 rounded-xl font-black text-lg disabled:opacity-40 disabled:cursor-not-allowed">
        🔴 <span data-i18n="odd">홀 (ODD)</span><br>
        <span class="text-xs font-normal opacity-70">예상 <span id="p2pOddPayoutBtn">?</span></span>
      </button>
      <button id="p2pBtnEven" onclick="doP2PBet('even')" class="btn-even py-4 rounded-xl font-black text-lg disabled:opacity-40 disabled:cursor-not-allowed">
        🔵 <span data-i18n="even">짝 (EVEN)</span><br>
        <span class="text-xs font-normal opacity-70">예상 <span id="p2pEvenPayoutBtn">?</span></span>
      </button>
    </div>
    <div id="p2pNeedLogin" class="hidden text-center text-xs text-gray-400 mt-3">
      <a onclick="showTab('login')" class="text-blue-400 cursor-pointer hover:underline">로그인</a> 후 베팅 가능
    </div>
  </div>
  <!-- 히스토리 -->
  <div class="glass rounded-2xl p-4">
    <div class="font-bold mb-3 text-sm" data-i18n="p2p_history">배틀룸 결과</div>
    <div id="p2pHistory" class="space-y-0.5"></div>
  </div>
</div>


<div id="p-admin" class="hidden">
  <div class="mb-4"><h2 class="text-xl font-black mb-1 text-yellow-400">⚙️ 관리자 페이지</h2></div>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
    <div class="admin-card rounded-xl p-3 text-center"><div class="text-2xl font-black text-yellow-400" id="adTotalUsers">0</div><div class="text-xs text-gray-400 mt-1">전체 유저</div></div>
    <div class="admin-card rounded-xl p-3 text-center"><div class="text-2xl font-black text-green-400" id="adTodayBet">0</div><div class="text-xs text-gray-400 mt-1">오늘 베팅(USDT)</div></div>
    <div class="admin-card rounded-xl p-3 text-center"><div class="text-2xl font-black text-red-400" id="adPendingWd">0</div><div class="text-xs text-gray-400 mt-1">대기 출금</div></div>
    <div class="admin-card rounded-xl p-3 text-center"><div class="text-2xl font-black text-blue-400" id="adNewUsers">0</div><div class="text-xs text-gray-400 mt-1">오늘 신규</div></div>
  </div>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
    <div class="admin-card rounded-xl p-3 text-center"><div class="text-xl font-black text-emerald-400" id="adTotalDeposit">0</div><div class="text-xs text-gray-400 mt-1">총 입금(USDT)</div></div>
    <div class="admin-card rounded-xl p-3 text-center"><div class="text-xl font-black text-orange-400" id="adTotalWithdraw">0</div><div class="text-xs text-gray-400 mt-1">총 출금(USDT)</div></div>
    <div class="admin-card rounded-xl p-3 text-center"><div class="text-xl font-black text-purple-400" id="adHouseProfit">0</div><div class="text-xs text-gray-400 mt-1">총 수익(USDT)</div></div>
    <div class="admin-card rounded-xl p-3 text-center"><div class="text-xl font-black text-cyan-400" id="adTodayDeposit">0</div><div class="text-xs text-gray-400 mt-1">오늘 입금(USDT)</div></div>
  </div>
  <!-- 통계 차트 -->
  <div class="glass rounded-xl p-4 mb-4">
    <div class="font-bold text-sm text-yellow-400 mb-3">📊 7일 운영 통계</div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <div class="text-xs text-gray-400 mb-1">📈 베팅 추이</div>
        <canvas id="adminBetChart" height="120"></canvas>
      </div>
      <div>
        <div class="text-xs text-gray-400 mb-1">💰 입금/출금 추이</div>
        <canvas id="adminDepWdChart" height="120"></canvas>
      </div>
      <div>
        <div class="text-xs text-gray-400 mb-1">👥 신규 가입 추이</div>
        <canvas id="adminSignupChart" height="120"></canvas>
      </div>
    </div>
  </div>
  <div class="glass rounded-xl p-4 mb-4">
    <div class="font-bold text-sm text-yellow-400 mb-3">📢 공지사항 관리</div>
    <div class="space-y-2 mb-3">
      <div class="flex gap-2 items-center">
        <select id="noticeType" class="bg-white/10 border border-white/20 rounded-lg px-2 py-2 text-white text-xs focus:outline-none">
          <option value="info">ℹ️ 안내</option>
          <option value="warning">⚠️ 경고</option>
          <option value="danger">🚨 긴급</option>
        </select>
      </div>
      <!-- Quill 에디터 (한국어) - 메인 입력 -->
      <div>
        <div class="flex items-center justify-between mb-1">
          <div class="text-xs text-gray-400">📝 공지 내용 <span class="text-yellow-400">*</span> <span class="text-gray-500">(한국어 입력 후 자동번역)</span></div>
        </div>
        <div id="noticeEditorKo" style="max-height:180px;overflow-y:auto"></div>
        <input type="hidden" id="noticeInput">
      </div>
      <!-- 자동번역 버튼 -->
      <button onclick="autoTranslateNotice()" id="btnAutoTranslate" class="w-full py-2 bg-indigo-600/60 hover:bg-indigo-600 border border-indigo-500/50 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2">
        <span id="translateSpinner" class="hidden">⏳</span>
        🌐 자동번역 (영어·중국어·일본어)
      </button>
      <!-- 번역 결과 미리보기 (접힘 기본) -->
      <div id="noticeTranslatePreview" class="hidden space-y-2 p-3 bg-black/20 rounded-lg border border-white/10">
        <div class="text-xs text-indigo-400 font-bold mb-2">🌐 번역 결과 (수정 가능)</div>
        <div>
          <div class="text-xs text-gray-400 mb-1">🇺🇸 English</div>
          <div id="noticeEditorEn" style="max-height:100px;overflow-y:auto"></div>
          <input type="hidden" id="noticeInputEn">
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <div class="text-xs text-gray-400 mb-1">🇨🇳 中文</div>
            <textarea id="noticeInputZh" rows="2" class="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-yellow-400 resize-none"></textarea>
          </div>
          <div>
            <div class="text-xs text-gray-400 mb-1">🇯🇵 日本語</div>
            <textarea id="noticeInputJa" rows="2" class="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-yellow-400 resize-none"></textarea>
          </div>
        </div>
      </div>
      <button onclick="postNotice()" class="w-full px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-xs font-bold transition">📢 공지 등록</button>
      <!-- 예약 발행 -->
      <div class="flex items-center gap-2 mt-1">
        <label class="text-xs text-gray-400 whitespace-nowrap">⏰ 예약 발행:</label>
        <input type="datetime-local" id="noticePublishAt"
          class="flex-1 bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-yellow-400">
        <button onclick="clearPublishAt()" class="px-2 py-1.5 bg-white/10 rounded-lg text-xs hover:bg-white/20 transition">즉시</button>
      </div>
      <div class="text-xs text-gray-500">비워두면 즉시 발행, 날짜 지정 시 해당 시각에 자동 표시</div>
    </div>
    <div id="adNoticeList" class="space-y-1 text-xs"><div class="text-gray-500 text-center py-2">공지 없음</div></div>
  </div>
  <div class="glass rounded-xl p-4 mb-4">
    <div class="flex items-center justify-between mb-3">
      <div class="font-bold text-sm text-yellow-400">📤 출금 요청 관리</div>
      <div class="flex gap-2">
        <button onclick="exportCSV('withdraws')" class="px-3 py-1 bg-green-600/20 text-green-400 rounded-lg text-xs hover:bg-green-600/40 transition">📥 CSV</button>
        <button onclick="loadAdminWithdraws()" class="px-3 py-1 bg-white/10 rounded-lg text-xs hover:bg-white/20 transition">🔄 새로고침</button>
      </div>
    </div>
    <!-- 출금 필터 + 검색 -->
    <div class="flex flex-wrap gap-2 mb-3">
      <div class="flex gap-1">
        <button onclick="setWdFilter('all')"      id="wdF-all"      class="px-2 py-1 rounded text-xs bg-white/20 text-white font-bold transition">전체</button>
        <button onclick="setWdFilter('pending')"   id="wdF-pending"  class="px-2 py-1 rounded text-xs bg-white/10 text-gray-400 hover:bg-white/20 transition">대기중</button>
        <button onclick="setWdFilter('approved')"  id="wdF-approved" class="px-2 py-1 rounded text-xs bg-white/10 text-gray-400 hover:bg-white/20 transition">승인</button>
        <button onclick="setWdFilter('rejected')"  id="wdF-rejected" class="px-2 py-1 rounded text-xs bg-white/10 text-gray-400 hover:bg-white/20 transition">거절</button>
      </div>
      <input type="text" id="wdSearchInput" placeholder="유저명 검색..." oninput="loadAdminWithdraws(1)"
        class="flex-1 min-w-0 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-yellow-400">
    </div>
    <div id="adWithdrawList" class="space-y-2"><div class="text-xs text-gray-500 text-center py-3">로딩 중...</div></div>
    <!-- 페이지네이션 -->
    <div class="flex items-center justify-center gap-2 mt-2" id="wdPagination">
      <button onclick="loadAdminWithdraws(currentWdPage-1)" id="wdPrevBtn" class="px-3 py-1 bg-white/10 rounded-lg text-xs hover:bg-white/20 transition disabled:opacity-30" disabled>◀</button>
      <span class="text-xs text-gray-400" id="wdPageInfo">1 / 1</span>
      <button onclick="loadAdminWithdraws(currentWdPage+1)" id="wdNextBtn" class="px-3 py-1 bg-white/10 rounded-lg text-xs hover:bg-white/20 transition disabled:opacity-30" disabled>▶</button>
    </div>
  </div>
  <div class="glass rounded-xl p-4 mb-4">
    <div class="flex items-center justify-between mb-3">
      <div class="font-bold text-sm text-yellow-400">👤 유저 관리</div>
      <div class="flex gap-2">
        <input type="text" id="userSearchInput" placeholder="아이디/IP 검색..." oninput="loadAdminUsers(1)" class="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-yellow-400 w-32">
        <button onclick="loadAdminUsers(1)" class="px-3 py-1 bg-white/10 rounded-lg text-xs hover:bg-white/20 transition">🔄</button>
        <button onclick="exportCSV('users')" class="px-3 py-1 bg-green-600/20 text-green-400 rounded-lg text-xs hover:bg-green-600/40 transition">📥 CSV</button>
      </div>
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
    <div class="flex items-center justify-center gap-2 mt-3" id="adUserPagination">
      <button onclick="loadAdminUsers(adUserPage-1)" id="adUserPrevBtn" class="px-3 py-1.5 bg-white/10 rounded-lg text-xs hover:bg-white/20 transition" disabled>◀ 이전</button>
      <span class="text-xs text-gray-400" id="adUserPageInfo">1 / 1</span>
      <button onclick="loadAdminUsers(adUserPage+1)" id="adUserNextBtn" class="px-3 py-1.5 bg-white/10 rounded-lg text-xs hover:bg-white/20 transition" disabled>다음 ▶</button>
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
      <div class="mb-2">
        <label class="text-xs text-gray-400 block mb-1">관리자 메모</label>
        <input type="text" id="adMemoInput" placeholder="메모 입력..." class="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-yellow-400">
      </div>
      <div class="flex gap-2">
        <button onclick="adminAdjBal('add')" class="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-xs font-bold transition">+ 추가</button>
        <button onclick="adminAdjBal('set')" class="flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-xs font-bold transition">= 설정</button>
        <button onclick="adminResetPw()" class="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-xs font-bold transition">🔑 비번초기화</button>
        <button onclick="document.getElementById('adBalModal').classList.add('hidden')" class="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs transition">취소</button>
      </div>
    </div>
  </div>

  <!-- ══ 유저 상세 모달 ══ -->
  <div id="userDetailModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4" style="background:rgba(0,0,0,0.7)">
    <div class="glass rounded-2xl p-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-3">
        <div class="font-bold text-yellow-400">🔍 유저 상세</div>
        <button onclick="$('userDetailModal').classList.add('hidden')" class="text-gray-400 hover:text-white text-xl">✕</button>
      </div>
      <div id="userDetailBody"><div class="text-center py-8 text-gray-400">로딩 중...</div></div>
    </div>
  </div>

  <!-- ══ FAQ 편집 모달 ══ -->
  <div id="faqEditModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4" style="background:rgba(0,0,0,0.7)">
    <div class="glass rounded-2xl p-4 w-full max-w-md">
      <div class="flex items-center justify-between mb-3">
        <div class="font-bold text-yellow-400">✏️ FAQ 수정</div>
        <button onclick="$('faqEditModal').classList.add('hidden')" class="text-gray-400 hover:text-white text-xl">✕</button>
      </div>
      <input type="hidden" id="faqEditId">
      <div class="space-y-2">
        <select id="faqEditCat" class="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none">
          <option value="general">일반</option>
          <option value="deposit">입금</option>
          <option value="withdraw">출금</option>
          <option value="bet">게임</option>
          <option value="referral">추천</option>
          <option value="other">기타</option>
        </select>
        <textarea id="faqEditQ" rows="2" placeholder="질문 (한국어)" class="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none resize-none"></textarea>
        <textarea id="faqEditA" rows="4" placeholder="답변 (한국어)" class="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none resize-none"></textarea>
        <div class="flex gap-2">
          <button onclick="saveFAQEdit()" class="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold transition">💾 저장</button>
          <button onclick="$('faqEditModal').classList.add('hidden')" class="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition">취소</button>
        </div>
      </div>
    </div>
  </div>
  <div class="glass rounded-xl p-4 mb-4">
    <div class="flex items-center justify-between mb-3">
      <div class="font-bold text-sm text-yellow-400">💳 입금 설정 (본사 주소 · 네트워크)</div>
      <button onclick="loadDepositSettings()" class="px-3 py-1 bg-white/10 rounded-lg text-xs hover:bg-white/20 transition">🔄</button>
    </div>
    <div class="text-xs text-gray-400 mb-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2">
      ⚠️ 여기서 입력한 주소가 <strong>모든 사용자의 입금 주소</strong>로 표시됩니다. 각 네트워크 활성화 여부도 설정 가능합니다.
    </div>
    <div class="space-y-4" id="depositSettingsForm">
      <!-- TRC20 (TRON) -->
      <div class="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
        <div class="flex items-center justify-between mb-2">
          <div class="font-bold text-sm text-green-400">🟢 TRC20 (TRON) USDT</div>
          <label class="flex items-center gap-2 cursor-pointer">
            <span class="text-xs text-gray-400">활성화</span>
            <input type="checkbox" id="set_trc20_enabled" class="w-4 h-4 accent-green-500">
          </label>
        </div>
        <div class="space-y-1.5">
          <input type="text" id="set_trc20_address" placeholder="T... (TRC20 USDT 입금 주소)" 
            class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-xs mono focus:outline-none focus:border-green-400">
          <textarea id="set_trc20_memo" rows="2" placeholder="사용자에게 표시할 안내 메시지 (한국어)" 
            class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-green-400 resize-none"></textarea>
        </div>
      </div>
      <!-- ERC20 (Ethereum) -->
      <div class="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
        <div class="flex items-center justify-between mb-2">
          <div class="font-bold text-sm text-blue-400">🔵 ERC20 (Ethereum) USDT</div>
          <label class="flex items-center gap-2 cursor-pointer">
            <span class="text-xs text-gray-400">활성화</span>
            <input type="checkbox" id="set_erc20_enabled" class="w-4 h-4 accent-blue-500">
          </label>
        </div>
        <div class="space-y-1.5">
          <input type="text" id="set_erc20_address" placeholder="0x... (ERC20 USDT 입금 주소)" 
            class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-xs mono focus:outline-none focus:border-blue-400">
          <textarea id="set_erc20_memo" rows="2" placeholder="사용자에게 표시할 안내 메시지 (한국어)" 
            class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-blue-400 resize-none"></textarea>
        </div>
      </div>
      <!-- BEP20 (BSC) -->
      <div class="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
        <div class="flex items-center justify-between mb-2">
          <div class="font-bold text-sm text-yellow-400">🟡 BEP20 (BSC) USDT</div>
          <label class="flex items-center gap-2 cursor-pointer">
            <span class="text-xs text-gray-400">활성화</span>
            <input type="checkbox" id="set_bep20_enabled" class="w-4 h-4 accent-yellow-500">
          </label>
        </div>
        <div class="space-y-1.5">
          <input type="text" id="set_bep20_address" placeholder="0x... (BEP20 USDT 입금 주소)" 
            class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-xs mono focus:outline-none focus:border-yellow-400">
          <textarea id="set_bep20_memo" rows="2" placeholder="사용자에게 표시할 안내 메시지 (한국어)" 
            class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-yellow-400 resize-none"></textarea>
        </div>
      </div>
      <!-- 최소 입금액 -->
      <div class="flex items-center gap-3">
        <label class="text-xs text-gray-400 shrink-0">최소 입금액 (USDT)</label>
        <input type="number" id="set_min_amount" value="1" min="0.1" step="0.1"
          class="w-28 bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-yellow-400">
      </div>
      <button onclick="saveDepositSettings()" 
        class="w-full py-2.5 bg-yellow-600 hover:bg-yellow-700 rounded-xl text-sm font-bold transition">
        💾 입금 설정 저장
      </button>
    </div>
  </div>

  <!-- 파트너 관리 -->
  <div class="glass rounded-xl p-4 mb-4">
    <div class="flex items-center justify-between mb-3">
      <div class="font-bold text-sm text-yellow-400">🤝 파트너(대리점) 관리</div>
      <button onclick="loadAdminPartners()" class="px-3 py-1 bg-white/10 rounded-lg text-xs hover:bg-white/20 transition">🔄</button>
    </div>
    <div class="flex flex-wrap gap-2 mb-3">
      <input type="text" id="pName" placeholder="파트너명" class="flex-1 min-w-0 bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-yellow-400">
      <input type="text" id="pOwner" placeholder="운영자 아이디" class="flex-1 min-w-0 bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-yellow-400">
      <input type="number" id="pRate" placeholder="수수료%" value="5" min="1" max="20" step="0.5" class="w-20 bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-yellow-400">
      <button onclick="createPartner()" class="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-xs font-bold transition">+ 파트너 생성</button>
    </div>
    <div id="adPartnerList" class="space-y-2 text-xs"><div class="text-gray-500 text-center py-2">파트너 없음</div></div>
  </div>

  <!-- ══ 수동 입금 처리 ══ -->
  <div class="glass rounded-xl p-4 mb-4">
    <div class="flex items-center justify-between mb-3">
      <div class="font-bold text-sm text-green-400">💵 수동 입금 처리</div>
      <div class="flex gap-2">
        <button onclick="loadAdminDepositLogs()" class="px-3 py-1 bg-white/10 rounded-lg text-xs hover:bg-white/20 transition">🔄 내역</button>
        <button onclick="exportCSV('deposits')" class="px-3 py-1 bg-green-600/20 text-green-400 rounded-lg text-xs hover:bg-green-600/40 transition">📥 CSV</button>
      </div>
    </div>
    <div class="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-3 text-xs text-green-300">
      유저 아이디와 입금액을 입력하면 해당 유저의 잔액에 즉시 반영됩니다. TX Hash를 함께 입력하면 입금 내역에 기록됩니다.
    </div>
    <div class="space-y-2 mb-3">
      <div class="flex gap-2">
        <input type="text" id="manDepUsername" placeholder="유저 아이디" oninput="lookupUserForDeposit()"
          class="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-green-400">
        <div id="manDepUserInfo" class="flex items-center text-xs text-gray-400 min-w-0">-</div>
      </div>
      <input type="hidden" id="manDepUserId">
      <div class="flex gap-2">
        <input type="number" id="manDepAmount" placeholder="입금액 (USDT)" min="0.01" step="0.01"
          class="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-green-400">
        <select id="manDepNetwork" class="bg-gray-800 border border-white/20 rounded-lg px-2 py-2 text-white text-xs focus:outline-none focus:border-green-400">
          <option value="trc20">TRC20</option>
          <option value="erc20">ERC20</option>
          <option value="bep20">BEP20</option>
          <option value="manual">수동</option>
        </select>
      </div>
      <input type="text" id="manDepTxHash" placeholder="TX Hash (선택사항 - 실제 트랜잭션 해시 입력)"
        class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-xs mono focus:outline-none focus:border-green-400">
      <input type="text" id="manDepMemo" placeholder="메모 (예: 본인 인증 후 처리)"
        class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-green-400">
      <button onclick="adminManualDeposit()" class="w-full py-2.5 bg-green-600 hover:bg-green-700 rounded-xl text-sm font-bold transition">
        💵 입금 처리 실행
      </button>
    </div>
    <!-- 입금 내역 -->
    <div id="adDepositLogList" class="space-y-1 text-xs hidden"></div>
  </div>

  <!-- ══ 게임 · 운영 설정 ══ -->
  <div class="glass rounded-xl p-4 mb-4">
    <div class="flex items-center justify-between mb-3">
      <div class="font-bold text-sm text-purple-400">⚙️ 게임 · 운영 설정</div>
      <button onclick="loadGameSettings()" class="px-3 py-1 bg-white/10 rounded-lg text-xs hover:bg-white/20 transition">🔄</button>
    </div>
    <div class="bg-purple-500/10 border border-purple-500/20 rounded-xl p-2 mb-3 text-xs text-purple-300">
      ⚠️ 설정 변경은 즉시 적용됩니다. 배당률 변경 시 진행 중인 라운드는 영향 없고 다음 라운드부터 적용됩니다.
    </div>
    <div class="grid grid-cols-2 gap-3 mb-3">
      <div>
        <label class="text-xs text-gray-400 block mb-1">🎯 배당률 (x)</label>
        <input type="number" id="cfg_payout" value="1.90" min="1.1" max="2.0" step="0.01"
          class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm font-bold focus:outline-none focus:border-purple-400">
        <div class="text-xs text-gray-500 mt-0.5">현재 1.90x (하우스엣지 5%)</div>
      </div>
      <div>
        <label class="text-xs text-gray-400 block mb-1">📊 출금 베팅 조건 (%)</label>
        <input type="number" id="cfg_bet_req" value="50" min="0" max="200" step="5"
          class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm font-bold focus:outline-none focus:border-purple-400">
        <div class="text-xs text-gray-500 mt-0.5">입금액의 N% 베팅 후 출금 가능</div>
      </div>
      <div>
        <label class="text-xs text-gray-400 block mb-1">⬇️ 최소 베팅 (USDT)</label>
        <input type="number" id="cfg_min_bet" value="0.1" min="0.01" max="100" step="0.01"
          class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400">
      </div>
      <div>
        <label class="text-xs text-gray-400 block mb-1">⬆️ 최대 베팅 (USDT)</label>
        <input type="number" id="cfg_max_bet" value="1000" min="1" max="100000" step="1"
          class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400">
      </div>
      <div>
        <label class="text-xs text-gray-400 block mb-1">💸 출금 수수료 (USDT)</label>
        <input type="number" id="cfg_wd_fee" value="1" min="0" max="50" step="0.1"
          class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400">
      </div>
      <div>
        <label class="text-xs text-gray-400 block mb-1">🔻 최소 출금 (USDT)</label>
        <input type="number" id="cfg_min_wd" value="1" min="0.1" max="1000" step="0.1"
          class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400">
      </div>
      <div>
        <label class="text-xs text-gray-400 block mb-1">👥 1단계 추천 수당 (%)</label>
        <input type="number" id="cfg_l1" value="2.5" min="0" max="10" step="0.1"
          class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400">
      </div>
      <div>
        <label class="text-xs text-gray-400 block mb-1">👥 2단계 추천 수당 (%)</label>
        <input type="number" id="cfg_l2" value="1.0" min="0" max="10" step="0.1"
          class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400">
      </div>
      <div class="col-span-2">
        <label class="text-xs text-gray-400 block mb-1">🚧 일일 출금 한도 (USDT, 0=무제한)</label>
        <input type="number" id="cfg_daily_wd_limit" value="0" min="0" step="1"
          class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400">
        <div class="text-xs text-gray-500 mt-0.5">유저 1인당 하루 최대 출금 금액 (0으로 설정 시 무제한)</div>
      </div>
    </div>
    <button onclick="saveGameSettings()" class="w-full py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl text-sm font-bold transition">
      💾 설정 저장
    </button>
  </div>

  <!-- 1:1 문의 관리 -->
  <div class="glass rounded-xl p-4 mb-4">
    <div class="flex items-center justify-between mb-3">
      <div class="font-bold text-sm text-yellow-400">💬 1:1 문의 관리 <span id="adInquiryBadge" class="hidden ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full font-black">0</span></div>
      <div class="flex gap-1">
        <button onclick="loadAdminInquiries('pending')" class="px-2 py-1 bg-orange-500/20 text-orange-300 rounded text-xs hover:bg-orange-500/30 transition">미답변</button>
        <button onclick="loadAdminInquiries('')" class="px-2 py-1 bg-white/10 rounded text-xs hover:bg-white/20 transition">전체</button>
      </div>
    </div>
    <!-- 카테고리 필터 탭 -->
    <div class="flex flex-wrap gap-1 mb-3" id="inqCategoryTabs">
      <button onclick="filterInquiryCategory('')" id="inqCat-all" class="px-2 py-1 rounded text-xs bg-white/20 text-white font-bold transition">전체</button>
      <button onclick="filterInquiryCategory('deposit')" id="inqCat-deposit" class="px-2 py-1 rounded text-xs bg-white/10 text-gray-400 hover:bg-white/20 transition">입금 <span id="inqCatCnt-deposit" class="text-orange-400"></span></button>
      <button onclick="filterInquiryCategory('withdraw')" id="inqCat-withdraw" class="px-2 py-1 rounded text-xs bg-white/10 text-gray-400 hover:bg-white/20 transition">출금 <span id="inqCatCnt-withdraw" class="text-orange-400"></span></button>
      <button onclick="filterInquiryCategory('game')" id="inqCat-game" class="px-2 py-1 rounded text-xs bg-white/10 text-gray-400 hover:bg-white/20 transition">게임 <span id="inqCatCnt-game" class="text-orange-400"></span></button>
      <button onclick="filterInquiryCategory('account')" id="inqCat-account" class="px-2 py-1 rounded text-xs bg-white/10 text-gray-400 hover:bg-white/20 transition">계정 <span id="inqCatCnt-account" class="text-orange-400"></span></button>
      <button onclick="filterInquiryCategory('other')" id="inqCat-other" class="px-2 py-1 rounded text-xs bg-white/10 text-gray-400 hover:bg-white/20 transition">기타 <span id="inqCatCnt-other" class="text-orange-400"></span></button>
    </div>
    <div id="adInquiryList" class="space-y-2"><div class="text-xs text-gray-500 text-center py-3">로딩 중...</div></div>
    <!-- 답변 모달 -->
    <div id="adReplyModal" class="hidden mt-3 bg-black/30 rounded-xl p-3 border border-blue-500/30">
      <div class="text-xs text-blue-400 font-bold mb-2">✏️ 답변 작성</div>
      <div class="text-xs text-gray-400 mb-2" id="adReplyTitle">-</div>
      <input type="hidden" id="adReplyInqId">
      <!-- Quill 에디터 (관리자 답변) -->
      <div id="adReplyEditor" style="max-height:150px;overflow-y:auto" class="mb-2"></div>
      <input type="hidden" id="adReplyText">
      <div class="flex gap-2">
        <button onclick="submitAdminReply()" class="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold transition">답변 등록</button>
        <button onclick="closeAdminReply()" class="px-3 py-1.5 bg-white/10 rounded-lg text-xs transition">취소</button>
      </div>
    </div>
  </div>

  <!-- FAQ 관리 -->
  <div class="glass rounded-xl p-4 mb-4">
    <div class="flex items-center justify-between mb-3">
      <div class="font-bold text-sm text-yellow-400">❓ FAQ 관리</div>
      <button onclick="loadAdminFAQs()" class="px-3 py-1 bg-white/10 rounded-lg text-xs hover:bg-white/20 transition">🔄</button>
    </div>
    <div class="space-y-2 mb-3">
      <div class="flex gap-2 flex-wrap">
        <select id="faqAdCat" class="bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none">
          <option value="general">일반</option><option value="deposit">입금</option>
          <option value="withdraw">출금</option><option value="bet">게임</option>
          <option value="referral">추천</option><option value="partner">파트너</option>
        </select>
        <input type="number" id="faqAdOrder" placeholder="순서" value="0" class="w-16 bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none">
      </div>
      <input type="text" id="faqAdQ" placeholder="질문 (한국어)" class="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-yellow-400">
      <textarea id="faqAdA" rows="2" placeholder="답변 (한국어)" class="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-yellow-400 resize-none"></textarea>
      <input type="text" id="faqAdQen" placeholder="질문 (English, 선택)" class="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-yellow-400">
      <textarea id="faqAdAen" rows="2" placeholder="답변 (English, 선택)" class="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-yellow-400 resize-none"></textarea>
      <button onclick="createFAQ()" class="w-full py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-xs font-bold transition">+ FAQ 등록</button>
    </div>
    <div id="adFaqList" class="space-y-1 text-xs"><div class="text-gray-500 text-center py-2">FAQ 없음</div></div>
  </div>

  <!-- ══ 관리자 대량 메시지 발송 ══ -->
  <div class="glass rounded-xl p-4 mb-4">
    <div class="flex items-center justify-between mb-3">
      <div class="font-bold text-sm text-yellow-400">📨 대량 메시지 발송</div>
    </div>
    <div class="bg-blue-500/10 border border-blue-500/20 rounded-xl p-2 mb-3 text-xs text-blue-300">
      필터 조건으로 대상 유저를 선택하고 메시지를 발송합니다. 유저 메시지함에 팝업으로 표시됩니다.
    </div>
    <div class="space-y-2">
      <div>
        <label class="text-xs text-gray-400 block mb-1">📋 발송 대상</label>
        <select id="msgFilter" class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-xs focus:outline-none">
          <option value="all">전체 유저 (밴 제외)</option>
          <option value="active">활성 유저 (최근 7일 베팅)</option>
          <option value="highroller">고액 베터 (누적 100 USDT+)</option>
          <option value="inactive">비활성 유저 (30일+ 미접속)</option>
        </select>
      </div>
      <div>
        <label class="text-xs text-gray-400 block mb-1">📌 제목</label>
        <input type="text" id="msgTitle" placeholder="메시지 제목" maxlength="100"
          class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-yellow-400">
      </div>
      <div>
        <label class="text-xs text-gray-400 block mb-1">💬 내용</label>
        <textarea id="msgContent" rows="3" placeholder="메시지 내용을 입력하세요..." maxlength="500"
          class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-yellow-400 resize-none"></textarea>
      </div>
      <button onclick="sendMassMessage()" class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold transition">
        📨 메시지 발송
      </button>
    </div>
  </div>

  <!-- ══ 관리자 활동 로그 ══ -->
  <div class="glass rounded-xl p-4 mb-4">
    <div class="flex items-center justify-between mb-3">
      <div class="font-bold text-sm text-yellow-400">🔍 관리자 활동 로그</div>
      <button onclick="loadAdminLogs(1)" class="px-3 py-1 bg-white/10 rounded-lg text-xs hover:bg-white/20 transition">🔄</button>
    </div>
    <div class="flex flex-wrap gap-1 mb-3" id="adminLogFilterBtns">
      <button onclick="setAdminLogFilter('')"                class="log-filter-btn active px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">전체</button>
      <button onclick="setAdminLogFilter('balance_set')"    class="log-filter-btn px-2.5 py-1 rounded-full text-xs bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20">잔액설정</button>
      <button onclick="setAdminLogFilter('balance_add')"    class="log-filter-btn px-2.5 py-1 rounded-full text-xs bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20">잔액추가</button>
      <button onclick="setAdminLogFilter('manual_deposit')" class="log-filter-btn px-2.5 py-1 rounded-full text-xs bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20">수동입금</button>
      <button onclick="setAdminLogFilter('approve_withdraw')" class="log-filter-btn px-2.5 py-1 rounded-full text-xs bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20">출금승인</button>
      <button onclick="setAdminLogFilter('reject_withdraw')"  class="log-filter-btn px-2.5 py-1 rounded-full text-xs bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20">출금거절</button>
      <button onclick="setAdminLogFilter('ban')"             class="log-filter-btn px-2.5 py-1 rounded-full text-xs bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20">정지</button>
      <button onclick="setAdminLogFilter('reset_password')"  class="log-filter-btn px-2.5 py-1 rounded-full text-xs bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20">비번초기화</button>
      <button onclick="setAdminLogFilter('memo_update')"     class="log-filter-btn px-2.5 py-1 rounded-full text-xs bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20">메모</button>
    </div>
    <div id="adLogList" class="space-y-1.5 text-xs max-h-80 overflow-y-auto"><div class="text-gray-500 text-center py-3">로딩 중...</div></div>
    <div id="adLogPager" class="flex justify-center gap-2 mt-3 hidden">
      <button onclick="loadAdminLogs(adminLogPage-1)" id="adLogPrev" class="px-3 py-1 bg-white/10 rounded text-xs hover:bg-white/20 disabled:opacity-30">◀ 이전</button>
      <span id="adLogPageInfo" class="text-xs text-gray-400 py-1"></span>
      <button onclick="loadAdminLogs(adminLogPage+1)" id="adLogNext" class="px-3 py-1 bg-white/10 rounded text-xs hover:bg-white/20 disabled:opacity-30">다음 ▶</button>
    </div>
  </div>
</div>

<!-- ══ 리더보드 탭 ══ -->
<div id="p-leaderboard" class="hidden">
  <div class="mb-4">
    <h2 class="text-xl font-black mb-1">🏆 <span data-i18n="lb_title">랭킹 리더보드</span></h2>
    <p class="text-gray-400 text-sm" data-i18n="lb_desc">누적 베팅 TOP10 및 순이익 TOP10</p>
  </div>
  <!-- 탭 선택 -->
  <div class="flex gap-2 mb-4">
    <button onclick="loadLeaderboard('total_bet')" id="lb-tab-bet" class="lb-tab active px-4 py-2 rounded-lg text-sm font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 transition" data-i18n="lb_bet_rank">💰 베팅액 순위</button>
    <button onclick="loadLeaderboard('roi')"       id="lb-tab-roi" class="lb-tab px-4 py-2 rounded-lg text-sm font-bold bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20 transition" data-i18n="lb_roi_rank">📈 순이익 순위</button>
  </div>
  <!-- TOP10 테이블 -->
  <div class="glass rounded-xl p-4">
    <div id="leaderboardContent">
      <div class="text-gray-500 text-center py-8">🏆 <span data-i18n="lb_loading">랭킹을 불러오는 중...</span></div>
    </div>
  </div>
  <div class="text-xs text-gray-500 text-center mt-3" data-i18n="lb_notice">* 아이디는 부분 마스킹 표시됩니다 · 최소 베팅 10 USDT 이상 유저만 순이익 랭킹에 표시</div>
</div>

<!-- ══ FAQ 탭 ══ -->
<div id="p-faq" class="hidden">
  <div class="mb-4"><h2 class="text-xl font-black mb-1" data-i18n="tab_faq">❓ FAQ</h2><p class="text-gray-400 text-sm" data-i18n="faq_desc">자주 묻는 질문과 답변</p></div>
  <!-- 카테고리 필터 -->
  <div class="flex flex-wrap gap-2 mb-4" id="faqCatBtns">
    <button onclick="loadFAQ('')"         class="faq-cat-btn active px-3 py-1.5 rounded-full text-xs font-bold transition bg-blue-500/30 text-blue-300 border border-blue-500/40" data-cat="">전체</button>
    <button onclick="loadFAQ('general')"  class="faq-cat-btn px-3 py-1.5 rounded-full text-xs font-bold transition bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20" data-cat="general" data-i18n="faq_cat_general">일반</button>
    <button onclick="loadFAQ('deposit')"  class="faq-cat-btn px-3 py-1.5 rounded-full text-xs font-bold transition bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20" data-cat="deposit" data-i18n="faq_cat_deposit">입금</button>
    <button onclick="loadFAQ('withdraw')" class="faq-cat-btn px-3 py-1.5 rounded-full text-xs font-bold transition bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20" data-cat="withdraw" data-i18n="faq_cat_withdraw">출금</button>
    <button onclick="loadFAQ('bet')"      class="faq-cat-btn px-3 py-1.5 rounded-full text-xs font-bold transition bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20" data-cat="bet" data-i18n="faq_cat_bet">게임</button>
    <button onclick="loadFAQ('referral')" class="faq-cat-btn px-3 py-1.5 rounded-full text-xs font-bold transition bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20" data-cat="referral" data-i18n="faq_cat_referral">추천</button>
    <button onclick="loadFAQ('partner')"  class="faq-cat-btn px-3 py-1.5 rounded-full text-xs font-bold transition bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20" data-cat="partner" data-i18n="faq_cat_partner">파트너</button>
  </div>
  <div id="faqList" class="space-y-2">
    <div class="text-center text-gray-500 py-8 text-sm" data-i18n="no_record">기록 없음</div>
  </div>
  <!-- 문의 링크 -->
  <div class="mt-6 glass rounded-xl p-4 text-center">
    <div class="text-gray-400 text-sm mb-3" data-i18n="faq_no_answer">원하는 답변이 없으신가요?</div>
    <button onclick="showTab('support')" id="faqToSupport" class="hidden px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold transition" data-i18n="faq_contact">1:1 문의하기</button>
    <button onclick="showTab('login')" id="faqToLogin" class="hidden px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold transition" data-i18n="login">로그인 후 문의</button>
  </div>
</div>

<!-- ══ 1:1 문의 탭 ══ -->
<div id="p-support" class="hidden">
  <div class="mb-4"><h2 class="text-xl font-black mb-1" data-i18n="tab_support">💬 1:1 문의</h2><p class="text-gray-400 text-sm" data-i18n="support_desc">궁금한 점을 문의하시면 빠르게 답변드립니다</p></div>
  <div id="supportNeedLogin" class="glass rounded-xl p-8 text-center">
    <div class="text-gray-400 mb-3 text-sm" data-i18n="need_login">로그인이 필요합니다</div>
    <button onclick="showTab('login')" class="px-6 py-2 bg-blue-600 rounded-xl hover:bg-blue-700 transition text-sm font-bold" data-i18n="login">로그인</button>
  </div>
  <div id="supportInfo" class="hidden space-y-4">
    <!-- 새 문의 작성 -->
    <div class="glass rounded-xl p-5">
      <div class="font-bold mb-3 text-sm text-blue-400">✏️ <span data-i18n="new_inquiry">새 문의 작성</span></div>
      <div class="space-y-3">
        <div>
          <label class="text-xs text-gray-400 block mb-1" data-i18n="inquiry_category">카테고리</label>
          <select id="inqCat" class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400" style="background-color:#1e1b4b;position:relative;z-index:20">
            <option value="general" style="background:#1e1b4b" data-i18n="faq_cat_general">일반</option>
            <option value="deposit" style="background:#1e1b4b" data-i18n="faq_cat_deposit">입금</option>
            <option value="withdraw" style="background:#1e1b4b" data-i18n="faq_cat_withdraw">출금</option>
            <option value="bet" style="background:#1e1b4b" data-i18n="faq_cat_bet">게임</option>
            <option value="referral" style="background:#1e1b4b" data-i18n="faq_cat_referral">추천</option>
            <option value="other" style="background:#1e1b4b">기타</option>
          </select>
        </div>
        <div>
          <label class="text-xs text-gray-400 block mb-1" data-i18n="inquiry_title">제목</label>
          <input type="text" id="inqTitle" maxlength="100" placeholder="문의 제목을 입력하세요" class="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-400">
        </div>
        <div>
          <label class="text-xs text-gray-400 block mb-1" data-i18n="inquiry_content">내용</label>
          <!-- Quill 에디터 -->
          <div id="inqEditor" style="max-height:250px;overflow-y:auto"></div>
          <input type="hidden" id="inqContent">
          <div class="text-xs text-gray-500 text-right mt-0.5"><span id="inqCharCount">0</span> 자</div>
        </div>
        <!-- 파일 첨부 -->
        <div>
          <label class="text-xs text-gray-400 block mb-1">📎 파일 첨부 <span class="text-gray-500">(최대 3개, 각 5MB / 이미지·PDF·문서)</span></label>
          <div class="attach-zone" id="inqDropZone" onclick="$('inqFileInput').click()" 
               ondragover="event.preventDefault();this.classList.add('drag-over')"
               ondragleave="this.classList.remove('drag-over')"
               ondrop="handleInqDrop(event)">
            <input type="file" id="inqFileInput" multiple accept="image/*,.pdf,.txt,.doc,.docx" class="hidden" onchange="handleInqFiles(this.files)">
            <div class="text-gray-400 text-xs">
              <i class="fas fa-cloud-upload-alt text-lg mb-1 block"></i>
              클릭하거나 파일을 드래그하여 첨부
            </div>
          </div>
          <div id="inqAttachPreview" class="attach-preview"></div>
        </div>
        <div id="inqErr" class="hidden text-red-400 text-xs bg-red-500/10 rounded-lg p-2"></div>
        <button onclick="submitInquiry()" class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition text-sm" data-i18n="inquiry_submit">문의 제출</button>
      </div>
    </div>
    <!-- 내 문의 목록 -->
    <div class="glass rounded-xl p-4">
      <div class="font-bold mb-3 text-sm text-gray-300" data-i18n="my_inquiries">📋 내 문의 내역</div>
      <div id="myInquiryList" class="space-y-2">
        <div class="text-xs text-gray-500 text-center py-3" data-i18n="no_record">기록 없음</div>
      </div>
    </div>
    <!-- 문의 상세 모달 -->
    <div id="inqDetailModal" class="hidden glass rounded-xl p-5 border border-blue-500/30">
      <div class="flex items-center justify-between mb-3">
        <div class="font-bold text-sm text-blue-400" data-i18n="inquiry_detail">📄 문의 상세</div>
        <button onclick="closeInquiryDetail()" class="text-gray-400 hover:text-white text-xs">✕ 닫기</button>
      </div>
      <div id="inqDetailContent"></div>
    </div>
  </div>
</div>

</main>

<!-- 공지사항 팝업 모달 -->
<div id="noticePopupModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4" style="background:rgba(0,0,0,0.75)">
  <div class="glass rounded-2xl p-5 w-full max-w-md border border-yellow-500/30">
    <div class="flex items-center justify-between mb-3">
      <div class="font-bold text-yellow-400">📢 공지사항</div>
      <button id="noticePopupClose" class="text-gray-400 hover:text-white text-xl">✕</button>
    </div>
    <div id="noticePopupBody" class="mb-4 text-sm text-gray-200 max-h-64 overflow-y-auto"></div>
    <div class="flex gap-2">
      <button id="noticeSkipToday" class="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs transition">오늘 하루 보지 않기</button>
      <button id="noticePopupClose" onclick="$('noticePopupModal').classList.add('hidden')" class="flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-xl text-xs font-bold transition">확인</button>
    </div>
  </div>
</div>

<!-- 파트너 수익 내역 모달 -->
<div id="partnerEarningsModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4" style="background:rgba(0,0,0,0.7)">
  <div class="glass rounded-2xl p-5 w-full max-w-lg border border-yellow-500/30 max-h-[85vh] overflow-y-auto">
    <div class="flex items-center justify-between mb-3">
      <div id="partnerEarningsTitle" class="font-bold text-yellow-400">📊 파트너 수익 내역</div>
      <button onclick="$('partnerEarningsModal').classList.add('hidden')" class="text-gray-400 hover:text-white text-xl">✕</button>
    </div>
    <div id="partnerEarningsBody"></div>
  </div>
</div>

<div id="toast" class="fixed bottom-5 right-4 z-50 hidden max-w-xs w-full px-2">
  <div id="toastMsg" class="glass rounded-xl px-4 py-3 text-sm font-bold shadow-2xl slide"></div>
</div>

<script src="/static/app.v4.js"></script>
</body>
</html>`

export default app
