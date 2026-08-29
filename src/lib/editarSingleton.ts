export type SingletonName = 'site' | 'home' | 'paginaProjetos' | 'paginaContato' | 'paginaSobre'

export const SINGLETON_YAML_PATH: Record<SingletonName, string> = {
  site: 'content/site/index.yaml',
  home: 'content/home/index.yaml',
  paginaProjetos: 'content/pagina-projetos/index.yaml',
  paginaContato: 'content/pagina-contato/index.yaml',
  paginaSobre: 'content/pagina-sobre/index.yaml',
}

export interface ImageFieldConfig {
  dir: string
  publicPath: string
}

// Each singleton can have zero or more image fields; keyed by field name so
// a page with multiple images (e.g. home's heroImagem + sobreFoto) works.
export const SINGLETON_IMAGE_FIELDS: Record<SingletonName, Record<string, ImageFieldConfig>> = {
  site: {
    logo: { dir: 'public/images', publicPath: '/images' },
  },
  home: {
    heroImagem: { dir: 'public/images', publicPath: '/images' },
    sobreFoto: { dir: 'public/images', publicPath: '/images' },
  },
  paginaProjetos: {
    moodboardImagem1: { dir: 'public/images/projetos', publicPath: '/images/projetos' },
    moodboardImagem2: { dir: 'public/images/projetos', publicPath: '/images/projetos' },
  },
  paginaContato: {},
  paginaSobre: {
    retrato: { dir: 'public/images', publicPath: '/images' },
  },
}

const NAMES: SingletonName[] = ['site', 'home', 'paginaProjetos', 'paginaContato', 'paginaSobre']

export function isSingletonName(value: unknown): value is SingletonName {
  return typeof value === 'string' && (NAMES as string[]).includes(value)
}
