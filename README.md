# LUTI Arquitetura — Portfólio

Portfólio da arquiteta Luiza Tinoco (Manaus-AM), com CMS editável pela cliente e deploy contínuo na Vercel.

**Produção:** https://lutiarquitetura.vercel.app · **CMS:** https://lutiarquitetura.vercel.app/admin

## Stack

- [Astro 7](https://astro.build) — site estático com islands (React só no painel do CMS)
- [Keystatic](https://keystatic.com) — CMS git-based: editar = commit no repo = redeploy automático
- CSS puro com design tokens (sem Tailwind), fontes Playfair Display + Inter
- Adapter `@astrojs/vercel` para as rotas SSR do Keystatic

## Páginas

| Rota | Conteúdo |
|---|---|
| `/` | Hero full-screen, Projetos Recentes, Áreas de Atuação, Sobre a Autora, Faixa editorial, Processo, CTA |
| `/projetos` | Grid assimétrico com filtro por categoria + moodboard editorial |
| `/projetos/[slug]` | Detalhe do projeto (capa, galeria, descrição) — gerada por projeto no build |
| `/galeria` | Mosaico com todas as imagens dos projetos + lightbox com navegação e link pro projeto |
| `/sobre` | Hero editorial, Nossa Visão, CTA |
| `/contato` | Links diretos + formulário (Formspree) |
| `/admin` | Painel Keystatic (redirect para `/keystatic`) |

## Estrutura de conteúdo

```
content/
├── home/              # singleton: hero, áreas, processo, sobre, CTA, faixa editorial
├── site/              # singleton: marca, logo, copyright, links do footer
├── pagina-projetos/   # singleton: título, descrição, filtros, moodboard
├── pagina-sobre/      # singleton: título, textos, retrato, visão
├── pagina-contato/    # singleton: título, links diretos, formulário
└── projetos/          # coleção: um diretório por projeto (index.yaml + imagens)
```

Todas as imagens dos campos ficam em `public/images/`. Valores de imagem no YAML incluem o caminho público (ex.: `capa: /images/projetos/x.webp`).

## Comandos

```sh
pnpm install          # instalar dependências
pnpm dev              # dev server em localhost:4321 (CMS em modo local)
pnpm build            # build de produção + correção de CSS (fix-css-targets)
pnpm preview          # servir o build localmente
```

## CMS

- **Desenvolvimento:** storage local (escreve os YAMLs na pasta `content/`) — acesse `/admin`
- **Produção:** storage GitHub — editar e salvar cria um commit no repo, e a Vercel redeploya sozinha

Requer as variáveis de ambiente (configuradas na Vercel):

```
KEYSTATIC_GITHUB_CLIENT_ID
KEYSTATIC_GITHUB_CLIENT_SECRET
KEYSTATIC_SECRET
PUBLIC_KEYSTATIC_GITHUB_APP_SLUG
```

> Quem edita precisa de conta GitHub com write access no repositório.

## Notas técnicas

- **Imagens:** convertidas para WebP (q82, máx. 1600px) — use `scripts/convert-webp.mjs` para converter arquivos manualmente; uploads novos pelo admin entram no formato original
- **`/importar`:** página de bulk import (só existe no dev) — arrasta N imagens e cria N projetos com placeholders, pra seeding rápido
- **`scripts/fix-css-targets.mjs`:** converte media queries em range syntax (`width <= 48rem`) de volta para `max-width` clássico no pós-build — navegadores antigos ignoravam a sintaxe nova e perdiam todo o layout mobile
- **Design system:** ver `DESIGN.md` (tokens, tipografia, componentes) · contexto de produto em `PRODUCT.md`
