export const prerender = false

import type { APIRoute } from 'astro'
import sharp from 'sharp'
import { stringify as stringifyYaml } from 'yaml'
import { requireSession } from '../../lib/editarAuth'
import { slugify } from '../../lib/editarMedia'
import { getFile, putFile } from '../../lib/editarGithub'

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

  const titulo = form.get('titulo')
  const categoria = form.get('categoria')
  const ano = form.get('ano')
  const local = form.get('local')
  const resumo = form.get('resumo')
  const descricao = form.get('descricao')
  const destaque = form.get('destaque') === 'true'
  const capaFile = form.get('capa')
  const galeriaFiles = form.getAll('galeria').filter((f): f is File => f instanceof File && f.size > 0)

  if (typeof titulo !== 'string' || !titulo.trim()) {
    return new Response(JSON.stringify({ error: 'Informe um título para o projeto.' }), { status: 400 })
  }
  if (!(capaFile instanceof File) || capaFile.size === 0) {
    return new Response(JSON.stringify({ error: 'Selecione uma imagem de capa.' }), { status: 400 })
  }

  const baseSlug = slugify(titulo)
  const capaBuffer = await toWebp(capaFile)
  const galeriaBuffers = await Promise.all(galeriaFiles.map(toWebp))

  const data = {
    titulo: titulo.trim(),
    categoria: typeof categoria === 'string' && categoria ? categoria : 'interiores',
    ano: typeof ano === 'string' && ano ? Number(ano) : new Date().getFullYear(),
    local: typeof local === 'string' ? local : '',
    resumo: typeof resumo === 'string' ? resumo : '',
    descricao: typeof descricao === 'string' ? descricao : '',
    capa: '',
    galeria: [] as string[],
    destaque,
  }

  const token = import.meta.env.GITHUB_EDIT_TOKEN
  if (!token) return createLocal(baseSlug, data, capaBuffer, galeriaBuffers)
  return createGitHub(baseSlug, data, capaBuffer, galeriaBuffers, token)
}

async function createLocal(
  baseSlug: string,
  data: Record<string, unknown>,
  capaBuffer: Buffer,
  galeriaBuffers: Buffer[]
) {
  const { writeFile, mkdir, access } = await import('node:fs/promises')
  const path = await import('node:path')

  let slug = baseSlug
  let n = 2
  while (true) {
    try {
      await access(path.join(process.cwd(), 'content/projetos', slug, 'index.yaml'))
      slug = `${baseSlug}-${n++}`
    } catch {
      break
    }
  }

  await mkdir(path.join(process.cwd(), IMG_DIR), { recursive: true })
  const capaName = `${slug}.webp`
  await writeFile(path.join(process.cwd(), IMG_DIR, capaName), capaBuffer)
  data.capa = `${IMG_PUBLIC}/${capaName}`

  const galeria: string[] = []
  for (let i = 0; i < galeriaBuffers.length; i++) {
    const name = `${slug}-galeria-${i + 1}.webp`
    await writeFile(path.join(process.cwd(), IMG_DIR, name), galeriaBuffers[i])
    galeria.push(`${IMG_PUBLIC}/${name}`)
  }
  data.galeria = galeria

  const contentDir = path.join(process.cwd(), 'content/projetos', slug)
  await mkdir(contentDir, { recursive: true })
  await writeFile(path.join(contentDir, 'index.yaml'), stringifyYaml(data), 'utf-8')

  return new Response(JSON.stringify({ ok: true, slug, projeto: data }), { status: 200 })
}

async function createGitHub(
  baseSlug: string,
  data: Record<string, unknown>,
  capaBuffer: Buffer,
  galeriaBuffers: Buffer[],
  token: string
) {
  let slug = baseSlug
  let n = 2
  while (await getFile(`content/projetos/${slug}/index.yaml`, token)) {
    slug = `${baseSlug}-${n++}`
  }

  const capaName = `${slug}.webp`
  const putCapaRes = await putFile(`${IMG_DIR}/${capaName}`, token, capaBuffer.toString('base64'), `Add capa for ${slug}`)
  if (!putCapaRes.ok) {
    const err = await putCapaRes.text()
    return new Response(JSON.stringify({ error: `Falha ao salvar capa: ${err}` }), { status: 502 })
  }
  data.capa = `${IMG_PUBLIC}/${capaName}`

  const galeria: string[] = []
  for (let i = 0; i < galeriaBuffers.length; i++) {
    const name = `${slug}-galeria-${i + 1}.webp`
    const putRes = await putFile(`${IMG_DIR}/${name}`, token, galeriaBuffers[i].toString('base64'), `Add galeria image for ${slug}`)
    if (!putRes.ok) {
      const err = await putRes.text()
      return new Response(JSON.stringify({ error: `Falha ao salvar imagem da galeria: ${err}` }), { status: 502 })
    }
    galeria.push(`${IMG_PUBLIC}/${name}`)
  }
  data.galeria = galeria

  const yamlContent = Buffer.from(stringifyYaml(data), 'utf-8').toString('base64')
  const putYamlRes = await putFile(`content/projetos/${slug}/index.yaml`, token, yamlContent, `Add project ${slug}`)
  if (!putYamlRes.ok) {
    const err = await putYamlRes.text()
    return new Response(JSON.stringify({ error: `Falha ao salvar projeto: ${err}` }), { status: 502 })
  }

  return new Response(JSON.stringify({ ok: true, slug, projeto: data }), { status: 200 })
}
