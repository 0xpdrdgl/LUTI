import { createHmac, timingSafeEqual } from 'node:crypto'

const COOKIE_NAME = 'editar_session'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {}
  if (!header) return out
  for (const part of header.split(';')) {
    const idx = part.indexOf('=')
    if (idx === -1) continue
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim())
  }
  return out
}

export function isHttps(request: Request): boolean {
  return new URL(request.url).protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https'
}

export function makeSessionCookie(secret: string, secureFlag: boolean): string {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000 })).toString(
    'base64url'
  )
  const value = `${payload}.${sign(payload, secret)}`
  const attrs = [`${COOKIE_NAME}=${value}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${SESSION_MAX_AGE_SECONDS}`]
  if (secureFlag) attrs.push('Secure')
  return attrs.join('; ')
}

export function clearSessionCookie(secureFlag: boolean): string {
  const attrs = [`${COOKIE_NAME}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0']
  if (secureFlag) attrs.push('Secure')
  return attrs.join('; ')
}

export function hasValidSession(request: Request, secret: string | undefined): boolean {
  if (!secret) return false
  const raw = parseCookies(request.headers.get('cookie'))[COOKIE_NAME]
  if (!raw) return false
  const dot = raw.lastIndexOf('.')
  if (dot === -1) return false
  const payload = raw.slice(0, dot)
  const sig = raw.slice(dot + 1)
  const expected = sign(payload, secret)
  const sigBuf = Buffer.from(sig)
  const expBuf = Buffer.from(expected)
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return false
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'))
    return typeof data.exp === 'number' && data.exp > Date.now()
  } catch {
    return false
  }
}

export function requireSession(request: Request, secret: string | undefined): Response | null {
  if (!secret) {
    return new Response(JSON.stringify({ error: 'Recurso não configurado no servidor.' }), { status: 500 })
  }
  if (hasValidSession(request, secret)) return null
  return new Response(JSON.stringify({ error: 'Sessão expirada. Faça login novamente.' }), { status: 401 })
}
