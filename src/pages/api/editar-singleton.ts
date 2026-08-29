export const prerender = false

import type { APIRoute } from 'astro'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'
import { requireSession } from '../../lib/editarAuth'
import { extFromMime } from '../../lib/editarMedia'
import { isSingletonName, SINGLETON_YAML_PATH, SINGLETON_IMAGE_FIELDS, type SingletonName } from '../../lib/editarSingleton'
import { getFile, putFile } from '../../lib/editarGithub'

type ImageUpload = { field: string; buffer: Buffer; ext: string }

export const POST: APIRoute = async ({ request }) => {
  const authFailure = requireSession(request, import.meta.env.EDITAR_SESSION_SECRET)
  if (authFailure) return authFailure

  const form = await request.formData().catch(() => null)
  if (!form) {
    return new Response(JSON.stringify({ error: 'Dados inválidos.' }), { status: 400 })
  }

  const singletonRaw = form.get('singleton')
  const fieldsRaw = form.get('fields')

  if (!isSingletonName(singletonRaw)) {
    return new Response(JSON.stringify({ error: 'Página inválida.' }), { status: 400 })
  }
  if (typeof fieldsRaw !== 'string') {
    return new Response(JSON.stringify({ error: 'Dados inválidos.' }), { status: 400 })
  }
  let fields: Record<string, unknown>
  try {
    fields = JSON.parse(fieldsRaw)
  } catch {
    return new Response(JSON.stringify({ error: 'Dados inválidos.' }), { status: 400 })
  }

  const imageFieldNames = Object.keys(SINGLETON_IMAGE_FIELDS[singletonRaw])
  const uploads: ImageUpload[] = []
  const removals: string[] = []
  for (const field of imageFieldNames) {
    const file = form.get(`image__${field}`)
    if (file instanceof File && file.size > 0) {
      const ext = extFromMime(file.type)
      if (!ext) {
        return new Response(JSON.stringify({ error: 'Formato de imagem não suportado.' }), { status: 400 })
      }
      uploads.push({ field, buffer: Buffer.from(await file.arrayBuffer()), ext })
    } else if (form.get(`removeImage__${field}`) === 'true') {
      removals.push(field)
    }
  }

  const token = import.meta.env.GITHUB_EDIT_TOKEN
  if (!token) return updateLocal(singletonRaw, fields, uploads, removals)
  return updateGitHub(singletonRaw, fields, uploads, removals, token)
}

async function updateLocal(
  singleton: SingletonName,
  fields: Record<string, unknown>,
  uploads: ImageUpload[],
  removals: string[]
) {
  const { readFile, writeFile, unlink, mkdir } = await import('node:fs/promises')
  const path = await import('node:path')

  const yamlPath = path.join(process.cwd(), SINGLETON_YAML_PATH[singleton])
  let currentData: Record<string, unknown> = {}
  try {
    currentData = (parseYaml(await readFile(yamlPath, 'utf-8')) as Record<string, unknown>) ?? {}
  } catch {
    // no existing file yet
  }

  Object.assign(currentData, fields)

  const imageConfig = SINGLETON_IMAGE_FIELDS[singleton]
  for (const upload of uploads) {
    const config = imageConfig[upload.field]
    const filename = `${singleton}-${upload.field}${upload.ext}`
    await mkdir(path.join(process.cwd(), config.dir), { recursive: true })
    await writeFile(path.join(process.cwd(), config.dir, filename), upload.buffer)
    currentData[upload.field] = `${config.publicPath}/${filename}`
  }
  for (const field of removals) {
    const current = currentData[field]
    if (typeof current === 'string' && current) {
      await unlink(path.join(process.cwd(), 'public', current)).catch(() => {})
    }
    delete currentData[field]
  }

  await mkdir(path.dirname(yamlPath), { recursive: true })
  await writeFile(yamlPath, stringifyYaml(currentData), 'utf-8')
  return new Response(JSON.stringify({ ok: true, data: currentData }), { status: 200 })
}

async function updateGitHub(
  singleton: SingletonName,
  fields: Record<string, unknown>,
  uploads: ImageUpload[],
  removals: string[],
  token: string
) {
  const yamlPath = SINGLETON_YAML_PATH[singleton]
  const current = await getFile(yamlPath, token)
  let currentData: Record<string, unknown> = {}
  if (current) {
    currentData = (parseYaml(Buffer.from(current.content, 'base64').toString('utf-8')) as Record<string, unknown>) ?? {}
  }

  Object.assign(currentData, fields)

  const imageConfig = SINGLETON_IMAGE_FIELDS[singleton]
  for (const upload of uploads) {
    const config = imageConfig[upload.field]
    const filename = `${singleton}-${upload.field}${upload.ext}`
    const repoPath = `${config.dir}/${filename}`
    const existing = await getFile(repoPath, token)
    const putImgRes = await putFile(
      repoPath,
      token,
      upload.buffer.toString('base64'),
      `Update ${singleton}.${upload.field} image`,
      existing?.sha
    )
    if (!putImgRes.ok) {
      const err = await putImgRes.text()
      return new Response(JSON.stringify({ error: `Falha ao salvar imagem: ${err}` }), { status: 502 })
    }
    currentData[upload.field] = `${config.publicPath}/${filename}`
  }
  for (const field of removals) {
    delete currentData[field]
  }

  const newContent = Buffer.from(stringifyYaml(currentData), 'utf-8').toString('base64')
  const putRes = await putFile(yamlPath, token, newContent, `Update ${singleton}`, current?.sha)
  if (!putRes.ok) {
    const err = await putRes.text()
    return new Response(JSON.stringify({ error: `Falha ao salvar: ${err}` }), { status: 502 })
  }

  return new Response(JSON.stringify({ ok: true, data: currentData }), { status: 200 })
}
