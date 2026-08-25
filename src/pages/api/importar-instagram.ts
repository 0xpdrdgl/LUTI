import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

export const prerender = false;

const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

async function gerarComGemini(
  legenda: string,
  model: string,
  apiKey: string,
): Promise<{ titulo: string | null; descricao: string | null; categoria: string | null } | { rateLimited: true } | null> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `A seguir, a legenda de um post de Instagram de um escritório de arquitetura.\n\n"""\n${legenda.slice(0, 3000)}\n"""\n\nGere um objeto JSON com: {"titulo": "nome curto do projeto (máximo 5 palavras)", "descricao": "descrição elegante do projeto em 1-2 frases, sem hashtags, emojis ou menções a rede social", "categoria": "residencial" ou "interiores" ou "comercial" ou "mobiliario"}. Use apenas uma das categorias listadas.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            responseMimeType: 'application/json',
          },
        }),
        signal: AbortSignal.timeout(60000),
      },
    );
    if (res.status === 429) return { rateLimited: true };
    if (!res.ok) return null;
    const data = await res.json();
    const bruto = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    const parsed = JSON.parse(bruto);
    return {
      titulo: typeof parsed.titulo === 'string' ? parsed.titulo : null,
      descricao: typeof parsed.descricao === 'string' ? parsed.descricao : null,
      categoria: ['residencial', 'interiores', 'comercial', 'mobiliario'].includes(
        parsed.categoria,
      )
        ? parsed.categoria
        : null,
    };
  } catch {
    return null;
  }
}

export const POST = async (context: any) => {
  if (import.meta.env.PROD) {
    return new Response('Not found', { status: 404 });
  }

  const body = await context.request.json();
  const post = body?.post;
  if (!post?.imagem) {
    return new Response(
      JSON.stringify({ erro: 'Post sem imagem' }),
      { status: 400, headers: { 'content-type': 'application/json' } },
    );
  }

  const legenda: string = post.legenda ?? '';
  const usarGemini: boolean = !!body.usarGemini;
  const geminiModel: string = body.geminiModel || 'gemini-2.5-flash';
  const geminiKey: string = body.geminiKey || '';

  let titulo = '';
  let descricao = legenda
    .replace(/#\w+/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\n{2,}/g, '\n')
    .trim();
  let categoria = 'interiores';
  let usouLLM = false;

  if (usarGemini && geminiKey) {
    const gerado = await gerarComGemini(legenda, geminiModel, geminiKey);
    if (gerado && 'rateLimited' in gerado) {
      return new Response(
        JSON.stringify({ rateLimited: true }),
        { status: 429, headers: { 'content-type': 'application/json' } },
      );
    }
    if (gerado) {
      usouLLM = true;
      titulo = gerado.titulo ?? '';
      descricao = gerado.descricao ?? descricao;
      if (gerado.categoria) categoria = gerado.categoria;
    }
  }

  if (!titulo) {
    const primeiraLinha = legenda.split('\n').find((l) => l.trim()) ?? '';
    titulo = primeiraLinha.replace(/#\w+/g, '').trim().slice(0, 60);
  }
  if (!titulo) titulo = `Projeto ${new Date().getFullYear()}`;

  let slug = slugify(titulo).slice(0, 60) || `projeto-${Date.now()}`;
  const contentDir = path.join(process.cwd(), 'content', 'projetos', slug);
  let existente = await fs
    .access(path.join(contentDir, 'index.yaml'))
    .then(() => true)
    .catch(() => false);
  let sufixo = 2;
  while (existente) {
    slug = `${slugify(titulo).slice(0, 55)}-${sufixo}`;
    existente = await fs
      .access(
        path.join(process.cwd(), 'content', 'projetos', slug, 'index.yaml'),
      )
      .then(() => true)
      .catch(() => false);
    sufixo++;
    if (sufixo > 20) break;
  }

  const imgDir = path.join(process.cwd(), 'public', 'images', 'projetos');
  const finalContentDir = path.join(process.cwd(), 'content', 'projetos', slug);
  const arquivo = `${slug}.webp`;

  let buffer: Buffer;
  try {
    const imgRes = await fetch(post.imagem, {
      signal: AbortSignal.timeout(60000),
    });
    if (!imgRes.ok) throw new Error(`download ${imgRes.status}`);
    buffer = Buffer.from(await imgRes.arrayBuffer());
  } catch {
    return new Response(
      JSON.stringify({ erro: 'Falha ao baixar a imagem do post' }),
      { status: 502, headers: { 'content-type': 'application/json' } },
    );
  }

  await fs.mkdir(imgDir, { recursive: true });
  await fs.mkdir(finalContentDir, { recursive: true });
  await sharp(buffer)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(path.join(imgDir, arquivo));

  const tituloSafe = titulo.replace(/\\/g, '').replace(/"/g, "'");
  const descSafe = descricao.replace(/\\/g, '').replace(/"/g, "'");
  const ano = post.timestamp ? new Date(post.timestamp).getFullYear() : new Date().getFullYear();

  const yaml = `titulo: "${tituloSafe}"
categoria: ${categoria}
ano: ${ano}
local: ''
resumo: ''
descricao: >-
  ${descSafe.replace(/\n/g, '\n  ')}
capa: /images/projetos/${arquivo}
galeria: []
destaque: false
`;

  await fs.writeFile(path.join(finalContentDir, 'index.yaml'), yaml, 'utf8');

  return new Response(
    JSON.stringify({
      slug,
      titulo: tituloSafe,
      categoria,
      usouLLM,
      capa: `/images/projetos/${arquivo}`,
    }),
    { headers: { 'content-type': 'application/json' } },
  );
};
