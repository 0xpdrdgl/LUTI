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

// Titulo (nome exato da pasta) -> valor do campo Local, pra pastas cujo
// nome inclui a cidade do projeto.
const LOCAL_MAP = {
  'APARTAMENTO F A - São Paulo': 'São Paulo',
  'PROJETO EM RIBEIRAO PRETO': 'Ribeirão Preto',
  'RES. D  D (PARINTINS)': 'Parintins',
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

  // Uso: node scripts/importar-projetos-pasta.mjs [NomeDaPastaDeCategoria]
  // Sem argumento, processa todas as pastas de categoria encontradas.
  const somenteCategoria = process.argv[2]

  let categoryFolders = readdirSync(SRC_ROOT, { withFileTypes: true }).filter((d) => d.isDirectory())
  if (somenteCategoria) {
    categoryFolders = categoryFolders.filter((d) => d.name === somenteCategoria)
    console.log(`Filtrando só a pasta de categoria: ${somenteCategoria}\n`)
  }
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

      const slug = slugify(titulo)
      if (existsSync(path.join(CONTENT_DIR, slug, 'index.yaml'))) {
        console.log(`JA EXISTE, pulando: "${titulo}" -> ${slug}`)
        continue
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

      const local = LOCAL_MAP[titulo] ?? ''

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

  console.log('\nTotal de projetos criados nessa rodada:', allSlugs.length)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
