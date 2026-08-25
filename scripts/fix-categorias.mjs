// Diagnóstico + correção: categorias inválidas e imagens faltando
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const VALIDOS = ['interiores', 'mobiliario', 'residenciais', 'comercial'];
const base = join(process.cwd(), 'content', 'projetos');

const invalidos = [];
const semImagem = [];

for (const dir of readdirSync(base)) {
  const f = join(base, dir, 'index.yaml');
  if (!existsSync(f)) continue;
  const yaml = readFileSync(f, 'utf8');

  const catMatch = yaml.match(/^categoria: (.+)$/m);
  if (catMatch && !VALIDOS.includes(catMatch[1])) {
    invalidos.push([f, yaml, catMatch[1]]);
  }

  const capaMatch = yaml.match(/^capa: \/images\/projetos\/(.+)$/m);
  if (capaMatch && !existsSync(join(process.cwd(), 'public', 'images', 'projetos', capaMatch[1]))) {
    semImagem.push([dir, capaMatch[1]]);
  }
}

console.log('=== CATEGORIAS INVALIDAS:', invalidos.length);
invalidos.forEach(([f, , cat]) => console.log(' -', f.split('projetos')[1], '=>', cat));
console.log('=== IMAGENS FALTANDO:', semImagem.length);
semImagem.forEach(([slug, img]) => console.log(' -', slug, '->', img));

// Correção: residencial -> residenciais (unico caso invalido conhecido)
let corrigidos = 0;
for (const [f, yaml] of invalidos) {
  if (/^categoria: residencial$/m.test(yaml)) {
    writeFileSync(f, yaml.replace(/^categoria: residencial$/m, 'categoria: residenciais'));
    corrigidos++;
  }
}
console.log('=== CORRIGIDOS:', corrigidos);
