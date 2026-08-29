export const prerender = false

import type { APIRoute } from 'astro'
import { clearSessionCookie, isHttps } from '../../lib/editarAuth'

export const POST: APIRoute = async ({ request }) => {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Set-Cookie': clearSessionCookie(isHttps(request)), 'Content-Type': 'application/json' },
  })
}
