# Design System — LUTI Arquitetura

Editorial sereno para portfólio de arquitetura. Fonte da verdade: design Figma da cliente (arquivo `lutiarquitetura`). Identidade preservada — não introduzir novas cores ou fontes sem origem no Figma.

## Visual Theme

Editorial-mínimo com tom editorial de revista de arquitetura. Superfícies claras neutras, tipografia serifada de display, imagens grandes com legenda tipográfica. Assimetria deliberada (grids 12 colunas com spans desiguais). Zero sombras decorativas — profundidade vem de camadas tonais (ex.: bloco #F2F2F2 deslocado atrás de retratos) e bordas 1px.

## Color Palette

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#FAFAFA` | Fundo do site |
| `--surface` | `#F2F2F2` | Seções alternadas (Sobre, Visão, Footer), cards |
| `--ink` | `#0C0C0C` | Títulos, textos de destaque, ícones, logo (preto suave) |
| `--body-color` | `#3D3D3D` | Texto corrente |
| `--muted` | `#6E6E6E` | Labels secundários, meta-informações |
| `--accent` | `#D6D6D6` | Bordas 1px, divisores, placeholders |
| Bloco decorativo | `#DBDBDB` | Blocos de colagem/moodboard (uso pontual) |
| Overlay hero | `rgba(12, 12, 12, 0.31)` | Escurecimento sobre foto do hero |
| Overlay card | `rgba(12, 12, 12, 0.2)` | Hover de cards de projeto |

Contraste: texto corrente `#3D3D3D` sobre `#FAFAFA` ≈ 10.4:1 ✓. Nunca usar `--accent` para texto corrente — só bordas/ornamento.

## Typography

| Papel | Fonte | Estilo |
|---|---|---|
| Display | Playfair Display 400 (500 em destaques) | H1 64px/lh 1.09/ls −0.02em; H2 32px/lh 1.3; card title 24px/lh 1.33. Itálico 400 para palavras de ênfase ("respira.") |
| Texto | Inter 300 | Corrente 16–18px/lh 1.6/ls 0.01em |
| Label | Inter 500, 12px, uppercase, ls 0.15em | Botões, categorias, meta (`--label`) |

Regras: máx. 2 famílias. Quebras de linha de título seguem o Figma (`<br>` explícito + `nowrap` no trecho). `text-wrap: balance` em h1–h3 quando sem quebra explícita.

## Components

- **Header**: fixo, `rgba(250,250,250,.9)` + blur 6px, borda inferior `rgba(214,214,214,.3)`. Logo Playfair 24px (ou imagem), nav em labels 12px com underline no ativo (`aria-current`).
- **Footer**: `--surface`, borda superior `--accent`, 3 colunas (marca / copyright / links), labels 12px.
- **Botão outline**: transparente, borda 1px `rgba(255,255,255,.5)` (sobre foto) ou `#737373` (sobre claro), padding 12–16px 24–32px, label uppercase. Hover: fundo `--ink`, texto `--bg`.
- **Link sublinhado**: label uppercase com `border-bottom` 1px `--ink`, padding-bottom 8px.
- **Link com seta**: label + ícone 16px, gap anima 1rem→1.5rem no hover.
- **Card de projeto**: imagem `object-fit: cover`, legenda abaixo (categoria label `--muted` + título Playfair 24px). Hover: `scale(1.03)` na imagem, 500ms.
- **Card overlay (home)**: overlay `rgba(12,12,12,.2)` com fade 300ms no hover/focus.
- **Formulário**: inputs transparentes, borda 1px `--accent`, placeholder `--accent`, foco `--muted`. Labels uppercase 12px.
- **Ícones em quadrado**: 48×48, borda `--accent`, ícone 24px `--ink`; hover inverte para `--ink`/`--bg`.

## Layout

- Container: `max-width: 70rem` (1120px) centralizado; seções full-bleed usam `80rem`.
- Grid: 12 colunas, gap 32px. Assimetrias canônicas: texto col 2/span 5 + imagem col 8/span 5 (Sobre); card grande span 8 + retrato span 4 com offset-top 128px (Projetos).
- Ritmo vertical: seções `padding-block: 8rem` (128px); hero de página `4rem` após header.
- Header fixo: `main` recebe `padding-top: 6.125rem` exceto home (`fullBleed`).
- Mobile (<64rem): grids colapsam para coluna única, offsets zerados, paddings 1.5rem inline / 5rem block.

## Motion

Base (emil-design-eng): só `transform`/`opacity`; ease-out `cubic-bezier(0.23, 1, 0.32, 1)`; UI <300ms; hover de imagem 400–500ms; `:active` `scale(0.97)`; `@media (prefers-reduced-motion: reduce)` obrigatório; hovers gated por `@media (hover: hover)`.
