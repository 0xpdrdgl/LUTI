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

export const POST = async (context: any) => {
  if (import.meta.env.PROD) {
    return new Response('Not found', { status: 404 });
  }

  const form = await context.request.formData();
  const file = form.get('file') as File | null;
  if (!file) return new Response('Sem arquivo', { status: 400 });

  const nome = ((form.get('nome') as string) || file.name).trim();
  const base = slugify(nome.replace(/\.[^.]+$/, '')) || `projeto-${Date.now()}`;
  const slug = base.slice(0, 60);

  const imgDir = path.join(process.cwd(), 'public', 'images', 'projetos');
  const contentDir = path.join(process.cwd(), 'content', 'projetos', slug);
  const arquivo = `${slug}.webp`;

  const existente = await fs
    .access(path.join(contentDir, 'index.yaml'))
    .then(() => true)
    .catch(() => false);

  if (existente) {
    return new Response(
      JSON.stringify({ slug, duplicado: true, titulo: nome }),
      { headers: { 'content-type': 'application/json' } },
    );
  }

  await fs.mkdir(imgDir, { recursive: true });
  await fs.mkdir(contentDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await sharp(buffer)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(path.join(imgDir, arquivo));

  const titulo = nome.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
  const tituloSafe = titulo.replace(/\\/g, '').replace(/"/g, "'");
  const ano = new Date().getFullYear();

  const yaml = `titulo: "${tituloSafe}"
categoria: interiores
ano: ${ano}
local: ''
resumo: ''
descricao: ''
capa: /images/projetos/${arquivo}
galeria: []
destaque: false
`;

  await fs.writeFile(path.join(contentDir, 'index.yaml'), yaml, 'utf8');

  return new Response(
    JSON.stringify({ slug, titulo: tituloSafe, capa: `/images/projetos/${arquivo}` }),
    { headers: { 'content-type': 'application/json' } },
  );
};
