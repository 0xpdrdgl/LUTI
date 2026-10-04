export const prerender = false

import type { APIRoute } from 'astro'
import { requireSession } from '../../lib/editarAuth'
import { getDeploymentStateForCommit } from '../../lib/vercelDeploy'

export const GET: APIRoute = async ({ request, url }) => {
  const authFailure = requireSession(request, import.meta.env.EDITAR_SESSION_SECRET)
  if (authFailure) return authFailure

  const sha = url.searchParams.get('sha')
  if (!sha) return new Response(JSON.stringify({ error: 'Parâmetro "sha" obrigatório.' }), { status: 400 })

  const token = import.meta.env.VERCEL_API_TOKEN
  if (!token) return new Response(JSON.stringify({ state: 'UNKNOWN' }), { status: 200 })

  const state = await getDeploymentStateForCommit(sha, token)
  return new Response(JSON.stringify({ state }), { status: 200 })
}
