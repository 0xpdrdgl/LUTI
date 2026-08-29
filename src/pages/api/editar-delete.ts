export const prerender = false

import type { APIRoute } from 'astro'
import { parse as parseYaml } from 'yaml'
import { requireSession } from '../../lib/editarAuth'
import { getFile, deleteFile } from '../../lib/editarGithub'

const SLUG_RE = /^[a-z0-9-]+$/

export const POST: APIRoute = async ({ request }) => {
  const authFailure = requireSession(request, import.meta.env.EDITAR_SESSION_SECRET)
  if (authFailure) return authFailure

  const body = await request.json().catch(() => null)
  const slug = body?.slug
  const confirm = body?.confirm

  if (typeof slug !== 'string' || !SLUG_RE.test(slug)) {
    return new Response(JSON.stringify({ error: 'Dados inválidos.' }), { status: 400 })
  }
  if (confirm !== slug) {
    return new Response(JSON.stringify({ error: 'Confirmação não corresponde ao identificador do projeto.' }), {
      status: 400,
    })
  }

  const token = import.meta.env.GITHUB_EDIT_TOKEN
  if (!token) return deleteLocal(slug)
  return deleteGitHub(slug, token)
}

async function deleteLocal(slug: string) {
  const { readFile, unlink, rm } = await import('node:fs/promises')
  const path = await import('node:path')

  const yamlPath = path.join(process.cwd(), 'content/projetos', slug, 'index.yaml')
  let data: any
  try {
    data = parseYaml(await readFile(yamlPath, 'utf-8'))
  } catch {
    return new Response(JSON.stringify({ error: 'Projeto não encontrado localmente.' }), { status: 404 })
  }

  const images: string[] = [data.capa, ...(data.galeria ?? [])].filter(Boolean)
  for (const img of images) {
    await unlink(path.join(process.cwd(), 'public', img)).catch(() => {})
  }

  await rm(path.join(process.cwd(), 'content/projetos', slug), { recursive: true, force: true })

  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}

async function deleteGitHub(slug: string, token: string) {
  const yamlPath = `content/projetos/${slug}/index.yaml`
  const current = await getFile(yamlPath, token)
  if (!current) {
    return new Response(JSON.stringify({ error: 'Projeto não encontrado no repositório.' }), { status: 404 })
  }
  const data = parseYaml(Buffer.from(current.content, 'base64').toString('utf-8')) as any

  const images: string[] = [data.capa, ...(data.galeria ?? [])].filter(Boolean)
  for (const img of images) {
    const file = await getFile(`public${img}`, token)
    if (file) {
      await deleteFile(`public${img}`, token, file.sha, `Delete image for ${slug}`)
    }
  }

  const delRes = await deleteFile(yamlPath, token, current.sha, `Delete project ${slug}`)
  if (!delRes.ok) {
    const err = await delRes.text()
    return new Response(JSON.stringify({ error: `Falha ao excluir: ${err}` }), { status: 502 })
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
