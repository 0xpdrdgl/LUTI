import { readdirSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { stringify as stringifyYaml, parse as parseYaml } from 'yaml'

const REPO = 'C:/Users/User/Desktop/Portfolio_arquitetura'
const SRC_ROOT = path.join(REPO, 'Projetos')
const CONTENT_DIR = path.join(REPO, 'content/projetos')
const IMG_DIR = path.join(REPO, 'public/images/projetos')
const IMG_PUBLIC = '/images/projetos'

const CATEGORY_MAP = {
  Apartamentos: 'apartamento',
  Comercial: 'comercial',
  Residencial: 'residencial',
}

function slugify(input) {
  return (
    input
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'projeto'
  )
}

const IMAGE_EXT_RE = /\.(jpe?g|png|webp)(\.jpeg)?$/i

async function toWebp(filePath) {
  return sharp(filePath)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer()
}

async function main() {
  mkdirSync(IMG_DIR, { recursive: true })
  mkdirSync(CONTENT_DIR, { recursive: true })

  const categoryFolders = readdirSync(SRC_ROOT, { withFileTypes: true }).filter((d) => d.isDirectory())
  const allSlugs = []

  for (const catDir of categoryFolders) {
    const categoria = CATEGORY_MAP[catDir.name]
    if (!categoria) {
      console.log('AVISO: pasta de categoria desconhecida, pulando:', catDir.name)
      continue
    }
    const catPath = path.join(SRC_ROOT, catDir.name)
    const projectDirs = readdirSync(catPath, { withFileTypes: true }).filter((d) => d.isDirectory())

    for (const projDir of projectDirs) {
      const titulo = projDir.name
      const projPath = path.join(catPath, projDir.name)
      const files = readdirSync(projPath)
        .filter((f) => IMAGE_EXT_RE.test(f))
        .sort((a, b) => a.localeCompare(b, 'pt-BR'))

      if (files.length === 0) {
        console.log('AVISO: sem imagens, pulando:', titulo)
        continue
      }

      let slug = slugify(titulo)
      let n = 2
      while (existsSync(path.join(CONTENT_DIR, slug, 'index.yaml'))) {
        slug = `${slugify(titulo)}-${n++}`
      }

      console.log(`[${categoria}] "${titulo}" -> ${slug} (${files.length} imagens)`)

      const [capaFile, ...galeriaFiles] = files

      const capaBuffer = await toWebp(path.join(projPath, capaFile))
      const capaName = `${slug}.webp`
      writeFileSync(path.join(IMG_DIR, capaName), capaBuffer)

      const galeria = []
      for (let i = 0; i < galeriaFiles.length; i++) {
        const buf = await toWebp(path.join(projPath, galeriaFiles[i]))
        const name = `${slug}-galeria-${i + 1}.webp`
        writeFileSync(path.join(IMG_DIR, name), buf)
        galeria.push(`${IMG_PUBLIC}/${name}`)
      }

      const local = titulo === 'APARTAMENTO F A - São Paulo' ? 'São Paulo' : ''

      const data = {
        titulo,
        categoria,
        local,
        resumo: '',
        descricao: '',
        capa: `${IMG_PUBLIC}/${capaName}`,
        galeria,
        destaque: false,
      }

      mkdirSync(path.join(CONTENT_DIR, slug), { recursive: true })
      writeFileSync(path.join(CONTENT_DIR, slug, 'index.yaml'), stringifyYaml(data), 'utf-8')

      allSlugs.push(slug)
    }
  }

  if (allSlugs.length > 0) {
    const chosen = allSlugs[Math.floor(Math.random() * allSlugs.length)]
    const yamlPath = path.join(CONTENT_DIR, chosen, 'index.yaml')
    const parsed = parseYaml(readFileSync(yamlPath, 'utf-8'))
    parsed.destaque = true
    writeFileSync(yamlPath, stringifyYaml(parsed), 'utf-8')
    console.log('\nDestaque escolhido:', chosen)
  }

  console.log('\nTotal de projetos criados:', allSlugs.length)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
