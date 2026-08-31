export const prerender = false

import type { APIRoute } from 'astro'
import sharp from 'sharp'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'
import { requireSession } from '../../lib/editarAuth'
import { getFile, putFile } from '../../lib/editarGithub'

const SLUG_RE = /^[a-z0-9-]+$/
const IMG_DIR = 'public/images/projetos'
const IMG_PUBLIC = '/images/projetos'

async function toWebp(file: File): Promise<Buffer> {
  const buffer = Buffer.from(await file.arrayBuffer())
  return sharp(buffer).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer()
}

export const POST: APIRoute = async ({ request }) => {
  const authFailure = requireSession(request, import.meta.env.EDITAR_SESSION_SECRET)
  if (authFailure) return authFailure

  const form = await request.formData().catch(() => null)
  if (!form) return new Response(JSON.stringify({ error: 'Dados inválidos.' }), { status: 400 })

  const slug = form.get('slug')
  if (typeof slug !== 'string' || !SLUG_RE.test(slug)) {
    return new Response(JSON.stringify({ error: 'Dados inválidos.' }), { status: 400 })
  }

  const titulo = form.get('titulo')
  const categoria = form.get('categoria')
  const ano = form.get('ano')
  const local = form.get('local')
  const resumo = form.get('resumo')
  const descricao = form.get('descricao')
  const destaque = form.get('destaque') === 'true'
  const capaFile = form.get('capa')
  const capaUrlRaw = form.get('capaUrl')
  const capaUrl = typeof capaUrlRaw === 'string' && capaUrlRaw.startsWith(`${IMG_PUBLIC}/`) ? capaUrlRaw : null
  const galeriaExistingRaw = form.get('galeriaExisting')
  const galeriaNewFiles = form.getAll('galeriaNew').filter((f): f is File => f instanceof File && f.size > 0)

  let galeriaExisting: string[] = []
  if (typeof galeriaExistingRaw === 'string') {
    try {
      galeriaExisting = JSON.parse(galeriaExistingRaw)
    } catch {
      return new Response(JSON.stringify({ error: 'Dados inválidos.' }), { status: 400 })
    }
  }

  let capaBuffer: Buffer | null = null
  if (capaFile instanceof File && capaFile.size > 0) {
    capaBuffer = await toWebp(capaFile)
  }
  const galeriaNewBuffers = await Promise.all(galeriaNewFiles.map(toWebp))
  const galeriaNewNames = galeriaNewBuffers.map((_, i) => `${slug}-galeria-${Date.now()}-${i}.webp`)

  const fieldUpdates: Record<string, unknown> = {}
  if (typeof titulo === 'string') fieldUpdates.titulo = titulo.trim()
  if (typeof categoria === 'string') fieldUpdates.categoria = categoria
  if (typeof ano === 'string' && ano !== '') fieldUpdates.ano = Number(ano)
  if (typeof local === 'string') fieldUpdates.local = local
  if (typeof resumo === 'string') fieldUpdates.resumo = resumo
  if (typeof descricao === 'string') fieldUpdates.descricao = descricao
  fieldUpdates.destaque = destaque

  const token = import.meta.env.GITHUB_EDIT_TOKEN
  if (!token) {
    return updateLocal({ slug, fieldUpdates, capaBuffer, capaUrl, galeriaExisting, galeriaNewBuffers, galeriaNewNames })
  }
  return updateGitHub({ slug, fieldUpdates, capaBuffer, capaUrl, galeriaExisting, galeriaNewBuffers, galeriaNewNames, token })
}

async function updateLocal({
  slug,
  fieldUpdates,
  capaBuffer,
  capaUrl,
  galeriaExisting,
  galeriaNewBuffers,
  galeriaNewNames,
}: {
  slug: string
  fieldUpdates: Record<string, unknown>
  capaBuffer: Buffer | null
  capaUrl: string | null
  galeriaExisting: string[]
  galeriaNewBuffers: Buffer[]
  galeriaNewNames: string[]
}) {
  const { readFile, writeFile, mkdir } = await import('node:fs/promises')
  const path = await import('node:path')

  const yamlPath = path.join(process.cwd(), 'content/projetos', slug, 'index.yaml')
  let currentData: Record<string, unknown>
  try {
    currentData = (parseYaml(await readFile(yamlPath, 'utf-8')) as Record<string, unknown>) ?? {}
  } catch {
    return new Response(JSON.stringify({ error: 'Projeto não encontrado localmente.' }), { status: 404 })
  }

  Object.assign(currentData, fieldUpdates)

  if (capaBuffer) {
    const capaName = `${slug}.webp`
    await mkdir(path.join(process.cwd(), IMG_DIR), { recursive: true })
    await writeFile(path.join(process.cwd(), IMG_DIR, capaName), capaBuffer)
    currentData.capa = `${IMG_PUBLIC}/${capaName}`
  } else if (capaUrl) {
    currentData.capa = capaUrl
  }

  const newUrls: string[] = []
  for (let i = 0; i < galeriaNewBuffers.length; i++) {
    await writeFile(path.join(process.cwd(), IMG_DIR, galeriaNewNames[i]), galeriaNewBuffers[i])
    newUrls.push(`${IMG_PUBLIC}/${galeriaNewNames[i]}`)
  }
  currentData.galeria = [...galeriaExisting, ...newUrls]

  await writeFile(yamlPath, stringifyYaml(currentData), 'utf-8')
  return new Response(JSON.stringify({ ok: true, projeto: currentData }), { status: 200 })
}

async function updateGitHub({
  slug,
  fieldUpdates,
  capaBuffer,
  capaUrl,
  galeriaExisting,
  galeriaNewBuffers,
  galeriaNewNames,
  token,
}: {
  slug: string
  fieldUpdates: Record<string, unknown>
  capaBuffer: Buffer | null
  capaUrl: string | null
  galeriaExisting: string[]
  galeriaNewBuffers: Buffer[]
  galeriaNewNames: string[]
  token: string
}) {
  const yamlPath = `content/projetos/${slug}/index.yaml`
  const current = await getFile(yamlPath, token)
  if (!current) {
    return new Response(JSON.stringify({ error: 'Projeto não encontrado no repositório.' }), { status: 404 })
  }
  const currentData = (parseYaml(Buffer.from(current.content, 'base64').toString('utf-8')) as Record<string, unknown>) ?? {}

  Object.assign(currentData, fieldUpdates)

  if (capaBuffer) {
    const capaName = `${slug}.webp`
    const repoPath = `${IMG_DIR}/${capaName}`
    const existing = await getFile(repoPath, token)
    const putRes = await putFile(repoPath, token, capaBuffer.toString('base64'), `Update capa for ${slug}`, existing?.sha)
    if (!putRes.ok) {
      const err = await putRes.text()
      return new Response(JSON.stringify({ error: `Falha ao salvar capa: ${err}` }), { status: 502 })
    }
    currentData.capa = `${IMG_PUBLIC}/${capaName}`
  } else if (capaUrl) {
    currentData.capa = capaUrl
  }

  const newUrls: string[] = []
  for (let i = 0; i < galeriaNewBuffers.length; i++) {
    const repoPath = `${IMG_DIR}/${galeriaNewNames[i]}`
    const putRes = await putFile(repoPath, token, galeriaNewBuffers[i].toString('base64'), `Add galeria image for ${slug}`)
    if (!putRes.ok) {
      const err = await putRes.text()
      return new Response(JSON.stringify({ error: `Falha ao salvar imagem da galeria: ${err}` }), { status: 502 })
    }
    newUrls.push(`${IMG_PUBLIC}/${galeriaNewNames[i]}`)
  }
  currentData.galeria = [...galeriaExisting, ...newUrls]

  const newContent = Buffer.from(stringifyYaml(currentData), 'utf-8').toString('base64')
  const putRes = await putFile(yamlPath, token, newContent, `Update project ${slug}`, current.sha)
  if (!putRes.ok) {
    const err = await putRes.text()
    return new Response(JSON.stringify({ error: `Falha ao salvar: ${err}` }), { status: 502 })
  }

  return new Response(JSON.stringify({ ok: true, projeto: currentData }), { status: 200 })
}
