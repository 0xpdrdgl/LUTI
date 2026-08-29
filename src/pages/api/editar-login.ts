export const prerender = false

import type { APIRoute } from 'astro'
import { makeSessionCookie, isHttps } from '../../lib/editarAuth'

export const POST: APIRoute = async ({ request }) => {
  const password = import.meta.env.EDITAR_PASSWORD
  const secret = import.meta.env.EDITAR_SESSION_SECRET

  if (!password || !secret) {
    return new Response(JSON.stringify({ error: 'Recurso não configurado no servidor.' }), { status: 500 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body.password !== 'string' || body.password !== password) {
    return new Response(JSON.stringify({ error: 'Senha incorreta.' }), { status: 401 })
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Set-Cookie': makeSessionCookie(secret, isHttps(request)), 'Content-Type': 'application/json' },
  })
}
