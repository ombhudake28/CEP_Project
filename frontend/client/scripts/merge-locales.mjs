// Adds the Prompt 2 translation keys to src/locales/<lang>/translation.json.
// Existing keys are never overwritten or removed. Safe to run more than once.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

function merge(base, add) {
  const out = { ...base };
  for (const [k, v] of Object.entries(add)) {
    if (!(k in out)) out[k] = v;
    else if (isObj(out[k]) && isObj(v)) out[k] = merge(out[k], v);
  }
  return out;
}

for (const lang of ['en', 'hi', 'mr']) {
  const addPath = path.join(here, 'locale-additions', `${lang}.json`);
  const target = path.join(here, '..', 'src', 'locales', lang, 'translation.json');
  const add = JSON.parse(fs.readFileSync(addPath, 'utf8'));
  const base = fs.existsSync(target) ? JSON.parse(fs.readFileSync(target, 'utf8')) : {};
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(merge(base, add), null, 2)}\n`);
  console.log(`merged ${lang} -> ${path.relative(process.cwd(), target)}`);
}
