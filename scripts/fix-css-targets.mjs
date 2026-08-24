// Converte media queries em range syntax (width <= X) de volta para
// max-width/min-width classico — navegadores pre-2022 nao suportam range.
// Roda apos o `astro build` (ver package.json).
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const roots = [join(process.cwd(), 'dist', 'client'), join(process.cwd(), '.vercel', 'output', 'static')];

function walk(dir, files = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const f of entries) {
    const p = join(dir, f.name);
    if (f.isDirectory()) walk(p, files);
    else if (f.name.endsWith('.css')) files.push(p);
  }
  return files;
}

const UNITS = '([\\d.]+)(rem|px|em|vw|vh|ch)';
const rewrites = [
  [new RegExp(`width\\s*<=\\s*${UNITS}`, 'g'), 'max-width:$1$2'],
  [new RegExp(`width\\s*>=\\s*${UNITS}`, 'g'), 'min-width:$1$2'],
  [new RegExp(`${UNITS}\\s*<=\\s*width`, 'g'), 'min-width:$1$2'],
  [new RegExp(`${UNITS}\\s*>=\\s*width`, 'g'), 'max-width:$1$2'],
];

let alterados = 0;
for (const root of roots) {
  for (const file of walk(root)) {
    const original = readFileSync(file, 'utf8');
    let css = original;
    for (const [re, rep] of rewrites) css = css.replace(re, rep);
    if (css !== original) {
      writeFileSync(file, css);
      alterados++;
    }
  }
}

console.log(`[fix-css-targets] ${alterados} arquivo(s) CSS convertido(s) pra sintaxe classica`);
