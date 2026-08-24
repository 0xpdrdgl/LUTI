import sharp from 'sharp';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const files = [];
function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.toLowerCase().endsWith('.png') && !f.includes('favicon')) files.push(p);
  }
}
walk('public/images');

let before = 0, after = 0;
for (const f of files) {
  const out = f.replace(/\.png/i, '.webp');
  const info = await sharp(f).webp({ quality: 82 }).toFile(out);
  const s1 = statSync(f).size, s2 = info.size;
  before += s1; after += s2;
  console.log(f.split('images')[1], Math.round(s1 / 1024) + 'KB ->', Math.round(s2 / 1024) + 'KB');
}
console.log('---');
console.log('TOTAL:', Math.round((before / 1024 / 1024) * 10) / 10, 'MB ->', Math.round((after / 1024 / 1024) * 10) / 10, 'MB');
