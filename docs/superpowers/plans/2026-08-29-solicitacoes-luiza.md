# Solicitações da Cliente (Luiza) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar os ajustes de conteúdo e layout pedidos pela cliente (Luiza Tinoco) no site LUTI Arquitetura — home, página Sobre, fonte de títulos e novas fotos — mantendo tudo editável tanto pelo Keystatic (`/keystatic`) quanto pelo painel custom (`/editar`).

**Architecture:** Site Astro com conteúdo em YAML (`content/`) lido via `@keystatic/core/reader`, definido em `keystatic.config.ts`. Cada singleton também tem uma tela espelho em `src/pages/editar/*.astro` que salva no mesmo YAML via `POST /api/editar-singleton` (endpoint já genérico — não precisa mudar). Qualquer campo novo precisa ser adicionado nos 3 lugares: schema do Keystatic, formulário do `/editar`, e o arquivo YAML de conteúdo.

**Tech Stack:** Astro 7, Keystatic (`@keystatic/core`), YAML, TypeScript, CSS puro (sem framework).

**Spec:** Pedidos da cliente repassados via WhatsApp (ver histórico da conversa) — resumidos e confirmados por ela nesta mensagem: "1 - remover o texto recentes da home, deixar apenas Projetos. 2 - incluir alguma frase em baixo do titulo que a atuação é no brasil todo. 3 - Áreas de Atuação remover design de mobiliario, deixar apenas residencial, apartamento e comercial, adicione Projeto executivo completo e marcenaria completo. 4 - texto sobre a autora, use como base o texto grande enviado por ela para criar algo para essa parte. 5 é pr usar helvetica em h1, mas ainda vou sibir a fonte. 6 - a foto de oculos vai na home e a de blazer branco vai em sobre. Nossa visao pode remover a sessao. a parte grifada coloque, mas coloque com nome placeholder (Mudar nome aqui). veja quais sao as etapas de um projeto executivo de arquitetura e coloque, depois ela ajusta. Lembrando que tudo deve ser editavel via keystetic [e /editar]."

## Global Constraints

- Tudo que for texto/imagem editável deve ter campo correspondente no Keystatic (`keystatic.config.ts`) **e** no formulário `/editar` correspondente (`src/pages/editar/*.astro`) — nunca só em um dos dois.
- Não mexer em `src/pages/importar.astro` nem nos endpoints do importador — fora de escopo.
- Não mudar as categorias de projeto do CMS (`projetos.categoria`, `paginaProjetos.filtros`) — a mudança de "Áreas de Atuação" é só o texto de marketing da home, não afeta o filtro de projetos.
- Novas fotos: converter para `.webp` e sobrescrever os arquivos já referenciados em `content/home/index.yaml` (`sobreFoto`) e `content/pagina-sobre/index.yaml` (`retrato`) — não trocar os nomes/paths, só o conteúdo do arquivo.
- Fonte Helvetica é só para `<h1>` (título de hero de cada página) — `<h2>`/`<h3>` continuam com `var(--font-display)` (Playfair Display). A cliente ainda vai subir o arquivo da fonte real; por enquanto usar stack de sistema (`Helvetica Neue`/`Helvetica`/`Arial`).
- Todo texto novo escrito aqui (bio, etapas do processo, descrições de área) é rascunho — a cliente vai revisar e ajustar depois pelo `/editar` ou Keystatic. Não é preciso confirmação prévia adicional pra colocar esse rascunho no ar.

---

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `keystatic.config.ts` | Schema: adicionar `home.projetosNota`, `home.depoimentosTitulo`, `home.depoimentos[]`; remover `paginaSobre.visaoLabel/visaoTitulo/visaoQuote` |
| `content/home/index.yaml` | Conteúdo: nota de "todo o Brasil", nova Áreas de Atuação, bio nova, etapas do processo, depoimento |
| `content/pagina-sobre/index.yaml` | Conteúdo: remover chaves `visao*` |
| `src/pages/index.astro` | Home: título "Projetos" + nota, seção Depoimentos nova |
| `src/pages/sobre.astro` | Remover bloco "Nossa Visão" (manter botão de contato) |
| `src/pages/editar/home.astro` | Formulário: campo `projetosNota`, seção "Depoimentos" (array nome/relação/texto) |
| `src/pages/editar/pagina-sobre.astro` | Formulário: remover seção "Visão" |
| `src/styles/global.css` | Nova variável `--font-h1` |
| `src/pages/index.astro`, `sobre.astro`, `contato.astro`, `projetos.astro` | Trocar `font-family` do `h1` de `var(--font-display)` para `var(--font-h1)` |
| `public/images/sobreFoto.webp` | Sobrescrever com a foto de óculos |
| `public/images/sobre-retrato.webp` | Sobrescrever com a foto de blazer branco |

---

## Task 1: Home — título "Projetos" + nota de atuação nacional

**Files:**
- Modify: `keystatic.config.ts:80-141` (schema do singleton `home`)
- Modify: `content/home/index.yaml`
- Modify: `src/pages/index.astro:46-64` (markup + CSS da seção `.projetos`)
- Modify: `src/pages/editar/home.astro:22-51` (seção Hero/Projetos do formulário — na verdade a seção "Projetos" não existe ainda no editar/home.astro, será criada)

**Interfaces:**
- Produces: campo `home.projetosNota` (string), consumido em `index.astro`.

- [ ] **Step 1: Adicionar `projetosNota` ao schema do Keystatic**

Em `keystatic.config.ts`, dentro do schema do singleton `home` (logo antes de `sobreTitulo:`), adicionar:

```ts
projetosNota: fields.text({
  label: 'Projetos — observação (ex.: atuação em todo o Brasil)',
}),
```

- [ ] **Step 2: Adicionar o valor no YAML**

Em `content/home/index.yaml`, logo após `heroBotaoHref: /projetos`, adicionar:

```yaml
projetosNota: Projetos em todo o Brasil, com atendimento presencial em Manaus-AM.
```

- [ ] **Step 3: Atualizar o markup da home**

Em `src/pages/index.astro`, trocar o bloco (linhas 46–50):

```astro
  <section id="projetos" class="projetos">
    <div class="section-header" data-reveal>
      <h2>Projetos Recentes</h2>
      <a href="/projetos" class="label ver-todos">VER TODOS</a>
    </div>
```

por:

```astro
  <section id="projetos" class="projetos">
    <div class="section-header" data-reveal>
      <div>
        <h2>Projetos</h2>
        {home?.projetosNota && <p class="projetos-nota">{home.projetosNota}</p>}
      </div>
      <a href="/projetos" class="label ver-todos">VER TODOS</a>
    </div>
```

- [ ] **Step 4: Adicionar CSS de `.projetos-nota`**

No `<style>` de `src/pages/index.astro`, logo depois da regra `.ver-todos:hover`, adicionar:

```css
  .projetos-nota {
    margin-top: 0.5rem;
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--muted);
  }
```

- [ ] **Step 5: Adicionar o campo no `/editar`**

Em `src/pages/editar/home.astro`, a seção Hero (linhas 22–51) hoje só tem `heroImagem`, `heroTitulo`, `heroBotaoLabel/Href`. Adicionar um novo campo logo depois do `div.editar-field-row` do botão (depois da linha 50, antes de `</section>`):

```astro
        <div class="editar-field">
          <label class="editar-label" for="f-projetosNota">Projetos — observação (ex.: atuação em todo o Brasil)</label>
          <input id="f-projetosNota" class="editar-input" type="text" value={home.projetosNota ?? ''} />
        </div>
```

E no `<script>` do mesmo arquivo, dentro do objeto `fields` do `saveBtn` click handler, adicionar a linha `projetosNota: val('f-projetosNota'),` logo após `heroBotaoHref: val('f-heroBotaoHref'),`.

- [ ] **Step 6: Verificar**

Rodar `astro dev --background`, abrir `/` e `/editar/home`, confirmar que o título mudou pra "Projetos" e a nota aparece abaixo. Rodar `astro dev stop` ao terminar.

- [ ] **Step 7: Commit**

```bash
git add keystatic.config.ts content/home/index.yaml src/pages/index.astro src/pages/editar/home.astro
git commit -m "feat: renomeia secao Projetos Recentes e adiciona nota de atuacao nacional"
```

---

## Task 2: Home — Áreas de Atuação (remover mobiliário/interiores, adicionar Apartamento + 2 serviços)

**Files:**
- Modify: `content/home/index.yaml` (só conteúdo — schema e `/editar` de `areas` já são genéricos, nenhuma mudança de código necessária)

**Interfaces:**
- Consumes: schema `home.areas[]` (`titulo`, `descricao`) já existente — sem mudança de schema.

- [ ] **Step 1: Substituir a lista `areas` em `content/home/index.yaml`**

Trocar o bloco atual:

```yaml
areas:
  - titulo: Residencial
    descricao: >-
      Casas e apartamentos projetados a partir do modo de viver de cada família
      — nada de soluções de catálogo.
  - titulo: Interiores
    descricao: >-
      Interiores que unem estética e função, da seleção de materiais ao projeto
      luminotécnico.
  - titulo: Design de Mobiliário
    descricao: >-
      Peças sob medida, desenhadas para cada projeto e produzidas com
      marcenarias parceiras.
  - titulo: Comercial
    descricao: Espaços de trabalho e comércio com identidade própria e fluidez de uso.
```

por:

```yaml
areas:
  - titulo: Residencial
    descricao: >-
      Casas projetadas a partir do modo de viver de cada família — nada de
      soluções de catálogo.
  - titulo: Apartamento
    descricao: >-
      Projetos de interiores para apartamentos, unindo estética e função da
      seleção de materiais ao projeto luminotécnico.
  - titulo: Comercial
    descricao: Espaços de trabalho e comércio com identidade própria e fluidez de uso.
  - titulo: Projeto Executivo Completo
    descricao: >-
      Documentação técnica completa, da concepção ao detalhamento, pronta para
      a execução da obra.
  - titulo: Marcenaria Completo
    descricao: >-
      Projeto e detalhamento de mobiliário sob medida, produzido com
      marcenarias parceiras.
```

- [ ] **Step 2: Verificar**

Abrir `/` e conferir que "Áreas de Atuação" lista os 5 itens na ordem certa, numerados 01–05.

- [ ] **Step 3: Commit**

```bash
git add content/home/index.yaml
git commit -m "content: atualiza areas de atuacao (residencial/apartamento/comercial + servicos)"
```

---

## Task 3: Home — bio da "Sobre a Autora" + troca de foto (óculos)

**Files:**
- Modify: `content/home/index.yaml`
- Modify: `public/images/sobreFoto.webp` (sobrescrever)

**Interfaces:**
- Consumes: `home.sobreParagrafos[]`, `home.sobreFoto` — schema já existente, sem mudança de código.

- [ ] **Step 1: Reescrever `sobreParagrafos` em `content/home/index.yaml`**

Trocar:

```yaml
sobreParagrafos:
  - >-
    Acreditamos que a arquitetura deve ir além da forma; ela deve ser a
    materialização do abrigo, um reflexo íntimo de quem o habita. Cada projeto é
    concebido como uma narrativa visual, onde proporção, luz e materialidade
    convergem para criar espaços de quietude e pertencimento.
  - >-
    Com uma abordagem editorial e um cuidado meticuloso aos detalhes, nosso
    escritório busca o equilíbrio perfeito entre o rigor técnico e a
    sensibilidade humana, rejeitando o excesso em favor de uma sofisticação
    atemporal.
```

por (rascunho baseado no currículo enviado pela cliente — ela ajusta depois):

```yaml
sobreParagrafos:
  - >-
    Formada em Arquitetura e Urbanismo pela Universidade Federal do Amazonas
    (UFAM), Luiza Tinoco constrói seu trabalho no encontro entre
    funcionalidade, identidade e sensibilidade estética — traduzindo a
    essência de cada projeto em soluções cuidadosas, coerentes e visualmente
    marcantes.
  - >-
    Sua trajetória já soma reconhecimentos como Arquiteta Destaque Club&Casa
    (2022, 2023, 2024 e 2026) e Arquiteta Destaque CASACOR São Paulo (2025),
    além de um projeto publicado na Revista Club&Casa Regional.
  - >-
    Com especial afinidade pela arquitetura de interiores e pelo
    acompanhamento de obra, acredita que a qualidade de um espaço está tanto
    no conceito quanto na maneira como materiais, proporções, luz e mobiliário
    se articulam no resultado final.
```

- [ ] **Step 2: Converter e salvar a nova foto**

A foto de óculos enviada pela cliente está em
`C:\Users\User\.claude\uploads\55f0ca31-3cf2-4b8a-9d6c-69430a685dc6\36a4922c-image.jpg`.
Rodar (na raiz do projeto, com `sharp` já instalado como dependência):

```bash
node -e "
const sharp = require('sharp');
sharp('C:/Users/User/.claude/uploads/55f0ca31-3cf2-4b8a-9d6c-69430a685dc6/36a4922c-image.jpg')
  .resize({ width: 1200, withoutEnlargement: true })
  .webp({ quality: 85 })
  .toFile('public/images/sobreFoto.webp')
  .then(() => console.log('ok'));
"
```

- [ ] **Step 3: Verificar**

Abrir `/` e conferir que a seção "Sobre a Autora" mostra o novo texto e a nova foto.

- [ ] **Step 4: Commit**

```bash
git add content/home/index.yaml public/images/sobreFoto.webp
git commit -m "content: atualiza bio da autora e foto da secao Sobre a Autora"
```

---

## Task 4: Home — etapas do Projeto Executivo (seção "Processo")

**Files:**
- Modify: `content/home/index.yaml`

**Interfaces:**
- Consumes: `home.processoTitulo`, `home.processo[]` (`titulo`, `descricao`) — schema já existente.

- [ ] **Step 1: Substituir `processoTitulo` e `processo` em `content/home/index.yaml`**

Trocar:

```yaml
processoTitulo: Como trabalhamos
processo:
  - titulo: Briefing
    descricao: >-
      Escuta profunda: entendemos a rotina, os desejos e as necessidades de quem
      vai habitar o espaço.
  - titulo: Conceito
    descricao: >-
      Pesquisa e partido de projeto: a narrativa que vai guiar todas as
      decisões, do layout aos materiais.
  - titulo: Projeto
    descricao: >-
      Desenvolvimento completo - plantas, perspectivas, especificação de
      materiais e mobiliário.
```

por (rascunho das etapas de um projeto executivo de arquitetura — a cliente ajusta depois, conforme pedido):

```yaml
processoTitulo: Etapas do Projeto Executivo
processo:
  - titulo: Briefing
    descricao: >-
      Levantamento do programa de necessidades e do modo de viver de quem vai
      habitar o espaço.
  - titulo: Estudo Preliminar
    descricao: >-
      Primeiras soluções de layout, volumetria e partido, alinhando a ideia
      geral do projeto.
  - titulo: Anteprojeto
    descricao: >-
      Detalhamento do layout aprovado, com plantas, cortes e especificação
      inicial de materiais.
  - titulo: Projeto Executivo
    descricao: >-
      Documentação técnica completa para execução: plantas cotadas,
      detalhamentos e compatibilização com projetos complementares.
  - titulo: Projeto de Marcenaria
    descricao: >-
      Detalhamento técnico do mobiliário sob medida, pronto para produção com
      marcenarias parceiras.
  - titulo: Acompanhamento de Obra
    descricao: >-
      Visitas técnicas e suporte à execução, garantindo fidelidade ao projeto
      até a entrega final.
```

- [ ] **Step 2: Verificar**

Abrir `/#processo` e conferir os 6 passos.

- [ ] **Step 3: Commit**

```bash
git add content/home/index.yaml
git commit -m "content: reescreve etapas do processo como etapas do projeto executivo"
```

---

## Task 5: Home — seção de Depoimentos (schema + conteúdo + render + /editar)

**Files:**
- Modify: `keystatic.config.ts:80-141`
- Modify: `content/home/index.yaml`
- Modify: `src/pages/index.astro` (nova seção `<section class="depoimentos">`)
- Modify: `src/pages/editar/home.astro` (nova seção "Depoimentos" no formulário)

**Interfaces:**
- Produces: `home.depoimentosTitulo` (string), `home.depoimentos[]` (`{ nome, relacao, texto }`), consumidos em `index.astro`.

- [ ] **Step 1: Adicionar o schema no Keystatic**

Em `keystatic.config.ts`, dentro do schema do singleton `home`, logo depois do campo `processo` (depois do fechamento de `),` na linha 135, antes de `faixaFrase:`), adicionar:

```ts
        depoimentosTitulo: fields.text({ label: 'Depoimentos — título da seção' }),
        depoimentos: fields.array(
          fields.object({
            nome: fields.text({ label: 'Nome' }),
            relacao: fields.text({ label: 'Relação (ex.: Cliente, Ex-estagiária)' }),
            texto: fields.text({ label: 'Depoimento', multiline: true }),
          }),
          {
            label: 'Depoimentos',
            itemLabel: (props) => props.fields.nome.value || 'Depoimento',
          },
        ),
```

- [ ] **Step 2: Adicionar o conteúdo em `content/home/index.yaml`**

Logo depois do bloco `processo:` (antes de `faixaFrase:`), adicionar:

```yaml
depoimentosTitulo: Depoimentos
depoimentos:
  - nome: Mudar nome aqui
    relacao: Ex-estagiária
    texto: >-
      Às minhas mentoras na jornada que precedeu a minha carreira, Jaque e
      Luiza, que sempre tiraram as dúvidas mais simples e nunca me negaram
      nenhum aprendizado. Vocês são grandes exemplos das profissionais que
      almejo ser.
```

- [ ] **Step 3: Renderizar a seção em `src/pages/index.astro`**

Adicionar a nova seção logo depois de `</section>` do `id="processo"` (depois da linha 139) e antes da seção `.cta`:

```astro
  {(home?.depoimentos ?? []).length > 0 && (
    <section class="depoimentos" data-reveal>
      <div class="depoimentos-inner">
        <h2 class="label depoimentos-titulo">{home?.depoimentosTitulo}</h2>
        <div class="depoimentos-grid">
          {
            (home?.depoimentos ?? []).map((dep) => (
              <blockquote class="depoimento">
                <p>&ldquo;{dep.texto}&rdquo;</p>
                <footer>
                  <span class="depoimento-nome">{dep.nome}</span>
                  {dep.relacao && <span class="depoimento-relacao"> — {dep.relacao}</span>}
                </footer>
              </blockquote>
            ))
          }
        </div>
      </div>
    </section>
  )}
```

E no `<style>` do mesmo arquivo, adicionar (perto das regras `.processo`):

```css
  /* Depoimentos */
  .depoimentos {
    background: var(--surface);
    padding: 8rem 5rem;
  }

  .depoimentos-inner {
    max-width: 80rem;
    margin-inline: auto;
  }

  .depoimentos-titulo {
    color: var(--muted);
  }

  .depoimentos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2.5rem;
    margin-top: 3rem;
  }

  .depoimento {
    margin: 0;
    padding: 0.5rem 0 0.5rem 1.5rem;
    border-left: 1px solid var(--accent);
  }

  .depoimento p {
    font-size: 1.0625rem;
    line-height: 1.6;
    color: var(--body-color);
  }

  .depoimento footer {
    margin-top: 1rem;
    font-size: 0.875rem;
    color: var(--muted);
  }

  .depoimento-nome {
    color: var(--ink);
    font-weight: 500;
  }

  @media (max-width: 64rem) {
    .depoimentos {
      padding: 5rem 1.5rem;
    }
  }
```

- [ ] **Step 4: Adicionar o formulário no `/editar`**

Em `src/pages/editar/home.astro`, adicionar uma nova `<section class="editar-section">` logo depois da seção "Processo de trabalho" (depois da linha 161, antes da seção "Faixa editorial"):

```astro
      <section class="editar-section">
        <h2>Depoimentos</h2>
        <div class="editar-field">
          <label class="editar-label" for="f-depoimentosTitulo">Título da seção</label>
          <input id="f-depoimentosTitulo" class="editar-input" type="text" value={home.depoimentosTitulo ?? ''} />
        </div>
        <div id="depoimentos-list" class="editar-array-list">
          {(home.depoimentos ?? []).map((dep: any) => (
            <div class="editar-array-row editar-array-row-multi" draggable="true">
              <span class="editar-drag-handle" title="Arraste para reordenar">⠿</span>
              <div class="editar-array-row-fields">
                <input class="editar-input" type="text" placeholder="Nome" value={dep.nome ?? ''} data-key="nome" />
                <input class="editar-input" type="text" placeholder="Relação (ex.: Cliente, Ex-estagiária)" value={dep.relacao ?? ''} data-key="relacao" />
                <textarea class="editar-textarea" placeholder="Depoimento" data-key="texto">{dep.texto ?? ''}</textarea>
              </div>
              <button type="button" class="editar-array-remove">Remover</button>
            </div>
          ))}
        </div>
        <button type="button" id="depoimentos-add" class="editar-array-add">+ Adicionar depoimento</button>
      </section>
```

No `<script>` do mesmo arquivo:

1. Adicionar `enableDragReorder(document.getElementById('depoimentos-list') as HTMLDivElement, '.editar-array-row')` logo depois da linha de `processo-list`.
2. Adicionar o listener do botão de adicionar, logo depois do bloco `processo-add`:

```ts
  document.getElementById('depoimentos-add')?.addEventListener('click', () => {
    document.getElementById('depoimentos-list')?.appendChild(
      makeObjectRow([
        { key: 'nome', type: 'text', placeholder: 'Nome' },
        { key: 'relacao', type: 'text', placeholder: 'Relação (ex.: Cliente, Ex-estagiária)' },
        { key: 'texto', type: 'textarea', placeholder: 'Depoimento' },
      ])
    )
  })
```

3. No objeto `fields` dentro do `saveBtn` click handler, adicionar logo após `processo: readObjectArray('processo-list', ['titulo', 'descricao']),`:

```ts
        depoimentosTitulo: val('f-depoimentosTitulo'),
        depoimentos: readObjectArray('depoimentos-list', ['nome', 'relacao', 'texto']),
```

- [ ] **Step 5: Verificar**

Abrir `/` e conferir a seção "Depoimentos" com o depoimento da ex-estagiária (nome "Mudar nome aqui"). Abrir `/editar/home`, conferir que a seção "Depoimentos" aparece, e testar "+ Adicionar depoimento" e "Salvar alterações".

- [ ] **Step 6: Commit**

```bash
git add keystatic.config.ts content/home/index.yaml src/pages/index.astro src/pages/editar/home.astro
git commit -m "feat: adiciona secao de depoimentos na home (keystatic + editar)"
```

---

## Task 6: Página Sobre — remover "Nossa Visão" e trocar retrato (blazer branco)

**Files:**
- Modify: `keystatic.config.ts:216-234` (schema do singleton `paginaSobre`)
- Modify: `content/pagina-sobre/index.yaml`
- Modify: `src/pages/sobre.astro`
- Modify: `src/pages/editar/pagina-sobre.astro`
- Modify: `public/images/sobre-retrato.webp` (sobrescrever)

**Interfaces:**
- Removes: `paginaSobre.visaoLabel`, `paginaSobre.visaoTitulo`, `paginaSobre.visaoQuote`.

- [ ] **Step 1: Remover os campos do schema**

Em `keystatic.config.ts`, no schema de `paginaSobre`, remover as 3 linhas:

```ts
        visaoLabel: fields.text({ label: 'Visão — label' }),
        visaoTitulo: fields.text({ label: 'Visão — título', multiline: true }),
        visaoQuote: fields.text({ label: 'Visão — citação', multiline: true }),
```

(o schema termina em `retrato: fields.image({...}),` seguido direto de `},`)

- [ ] **Step 2: Remover as chaves do YAML**

Em `content/pagina-sobre/index.yaml`, remover as últimas 3 linhas (`visaoLabel`, `visaoTitulo`, `visaoQuote`).

- [ ] **Step 3: Remover o bloco "Nossa Visão" do markup, mantendo o botão de contato**

Em `src/pages/sobre.astro`, trocar o bloco (linhas 33–52):

```astro
  <section class="visao">
    <div class="visao-grid" data-reveal>
      <div class="visao-titulo">
        <span class="label visao-label">{pagina?.visaoLabel}</span>
        <h2 class="visao-titulo-texto">{pagina?.visaoTitulo}</h2>
      </div>
      <blockquote class="visao-quote">
        <p>{pagina?.visaoQuote}</p>
      </blockquote>
    </div>

    <div class="visao-cta" data-reveal>
      <a href="/contato" class="label sobre-cta">
        ENTRAR EM CONTATO
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M1 6h9M6.5 2 10.5 6 6.5 10" stroke="currentColor"></path>
        </svg>
      </a>
    </div>
  </section>
```

por:

```astro
  <section class="visao">
    <div class="visao-cta" data-reveal>
      <a href="/contato" class="label sobre-cta">
        ENTRAR EM CONTATO
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M1 6h9M6.5 2 10.5 6 6.5 10" stroke="currentColor"></path>
        </svg>
      </a>
    </div>
  </section>
```

No `<style>` do mesmo arquivo, remover as regras `.visao-grid`, `.visao-titulo`, `.visao-label`, `.visao-titulo-texto`, `.visao-quote`, `.visao-quote p` (linhas 143–182) e o trecho de `.visao-quote` dentro do media query (linhas 240–242). Manter `.visao`, `.visao-cta`, `.sobre-cta*`.

- [ ] **Step 4: Remover a seção "Visão" do `/editar`**

Em `src/pages/editar/pagina-sobre.astro`, remover o bloco (linhas 59–73):

```astro
      <section class="editar-section">
        <h2>Visão</h2>
        <div class="editar-field">
          <label class="editar-label" for="f-visaoLabel">Label</label>
          <input id="f-visaoLabel" class="editar-input" type="text" value={pagina.visaoLabel ?? ''} />
        </div>
        <div class="editar-field">
          <label class="editar-label" for="f-visaoTitulo">Título</label>
          <textarea id="f-visaoTitulo" class="editar-textarea">{pagina.visaoTitulo ?? ''}</textarea>
        </div>
        <div class="editar-field">
          <label class="editar-label" for="f-visaoQuote">Citação</label>
          <textarea id="f-visaoQuote" class="editar-textarea">{pagina.visaoQuote ?? ''}</textarea>
        </div>
      </section>
```

E no `<script>`, remover as 3 linhas do objeto `fields`:

```ts
        visaoLabel: val('f-visaoLabel'),
        visaoTitulo: val('f-visaoTitulo'),
        visaoQuote: val('f-visaoQuote'),
```

- [ ] **Step 5: Converter e salvar a nova foto (blazer branco)**

A foto está em
`C:\Users\User\.claude\uploads\55f0ca31-3cf2-4b8a-9d6c-69430a685dc6\f6206d4b-image.jpg`.

```bash
node -e "
const sharp = require('sharp');
sharp('C:/Users/User/.claude/uploads/55f0ca31-3cf2-4b8a-9d6c-69430a685dc6/f6206d4b-image.jpg')
  .resize({ width: 1400, withoutEnlargement: true })
  .webp({ quality: 85 })
  .toFile('public/images/sobre-retrato.webp')
  .then(() => console.log('ok'));
"
```

- [ ] **Step 6: Verificar**

Abrir `/sobre`, confirmar que a seção "Nossa Visão" sumiu, o botão "ENTRAR EM CONTATO" continua visível, e a foto é a do blazer branco. Abrir `/editar/pagina-sobre` e confirmar que a seção "Visão" sumiu do formulário e salvar funciona.

- [ ] **Step 7: Commit**

```bash
git add keystatic.config.ts content/pagina-sobre/index.yaml src/pages/sobre.astro src/pages/editar/pagina-sobre.astro public/images/sobre-retrato.webp
git commit -m "feat: remove secao Nossa Visao da pagina Sobre e troca retrato"
```

---

## Task 7: Fonte Helvetica nos títulos `<h1>`

**Files:**
- Modify: `src/styles/global.css:1-17`
- Modify: `src/pages/index.astro:185-194`
- Modify: `src/pages/sobre.astro:74-80`
- Modify: `src/pages/contato.astro:158-165`
- Modify: `src/pages/projetos.astro:183-189`

- [ ] **Step 1: Adicionar a variável `--font-h1`**

Em `src/styles/global.css`, dentro de `:root`, logo depois de `--font-sans: 'Inter', system-ui, sans-serif;`, adicionar:

```css
  --font-h1: 'Helvetica Neue', Helvetica, Arial, sans-serif;
```

- [ ] **Step 2: Trocar o `font-family` de cada regra de `h1`**

Em cada um dos 4 arquivos abaixo, trocar `font-family: var(--font-display);` por `font-family: var(--font-h1);` **apenas** na regra do `h1` (não mexer nas regras de `h2`/`h3`):

- `src/pages/index.astro` → regra `.hero-content h1`
- `src/pages/sobre.astro` → regra `.hero-texto h1`
- `src/pages/contato.astro` → regra `.contato-info h1`
- `src/pages/projetos.astro` → regra `.hero h1`

- [ ] **Step 3: Verificar**

Abrir `/`, `/sobre`, `/contato`, `/projetos` e confirmar visualmente que só o título principal (h1) de cada página mudou de fonte; subtítulos (h2/h3) continuam em Playfair Display.

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css src/pages/index.astro src/pages/sobre.astro src/pages/contato.astro src/pages/projetos.astro
git commit -m "style: usa Helvetica nos titulos h1 (fonte definitiva a subir depois)"
```

---

## Self-Review Notes

- **Cobertura:** itens 1–8 do resumo enviado à cliente estão cobertos: (1) Task 1, (2) Task 1, (3) Task 2, (4) Task 3, (5) Task 7, (6-fotos) Tasks 3 e 6, (6-visão) Task 6, (6-depoimento) Task 5, (6-etapas) Task 4.
- **Editável nos dois lugares:** todo campo novo (`projetosNota`, `depoimentos[]`) tem schema no Keystatic (Tasks 1 e 5) e formulário correspondente em `/editar` (Tasks 1 e 5); campos removidos (`visao*`) saem dos dois lugares (Task 6).
- **Sem placeholders de código:** todos os steps têm o YAML/TSX/CSS exato a escrever.
