// Dependency-free check of the UI translation layer in bunken.html.
//
// The app uses the Japanese source text as the translation key: t('日本語') returns the
// text as-is in Japanese and looks it up in I18N_EN for English. Editing a Japanese string
// without updating the dictionary would therefore silently fall back to Japanese in the
// English UI. This test makes that mistake loud.
//
//   node tests/i18n-smoke.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../bunken.html', import.meta.url), 'utf8');
const JP = /[\u3040-\u30ff\u4e00-\u9fff\uff00-\uffef]/;
const T_LITERAL = /(?<![\w$.])t\('((?:[^'\\\n]|\\.)*)'/g;
const decodeLiteral = body => vm.runInNewContext(`'${body}'`);
const between = (start, end) => {
  const from = html.indexOf(start);
  const to = html.indexOf(end, from);
  assert.ok(from !== -1 && to !== -1, `missing marker: ${start} .. ${end}`);
  return { from, to, text: html.slice(from, to) };
};

// ---- 1. the dictionary --------------------------------------------------------------------
const dictBlock = between('const I18N_EN = {', '\nfunction detectLang');
const dictionary = vm.runInNewContext(`(${dictBlock.text.slice('const I18N_EN = '.length).replace(/;\s*$/, '')})`);

// ---- 2. every key the app can ask for ----------------------------------------------------
const scriptStart = html.indexOf('<script>');
// comments are ignored (the I18N header comment contains a t('…') usage example)
const script = html.slice(scriptStart).replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' ')).replace(/^\s*\/\/.*$/gm, '');
const used = new Set();
for (const [, body] of script.matchAll(T_LITERAL)) used.add(decodeLiteral(body));
for (const [, value] of html.matchAll(/data-i18n(?:-[\w-]+)?="([^"]*)"/g)) used.add(value);

// t() must always get a literal key, otherwise this test cannot see it.
// The one exception is applyStaticI18n(), which translates the data-i18n attributes (checked above).
const dynamic = script.split('\n').filter(line =>
  /(?<![\w$.])t\((?!')/.test(line) && !/^\s*function t\(/.test(line) && !line.includes("getAttribute('data-i18n"));
assert.deepEqual(dynamic, [], `t() called with a non-literal key:\n${dynamic.join('\n')}`);

const missing = [...used].filter(key => !Object.hasOwn(dictionary, key));
assert.deepEqual(missing, [], `Missing English translation for:\n${missing.join('\n')}`);

const unused = Object.keys(dictionary).filter(key => !used.has(key));
assert.deepEqual(unused, [], `Dictionary keys that no longer match any t() call (stale or edited source text):\n${unused.join('\n')}`);

// ---- 3. quality of each translation ----------------------------------------------------
const placeholders = text => [...text.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();
for (const [key, value] of Object.entries(dictionary)) {
  assert.equal(typeof value, 'string', `not a string: ${key}`);
  assert.ok(value.trim() !== '', `empty translation: ${key}`);
  assert.ok(!JP.test(value), `Japanese left in the English text: ${value}`);
  assert.deepEqual(placeholders(value), placeholders(key), `placeholders differ: ${key} -> ${value}`);
  // translations are inserted into innerHTML and into double-quoted attributes
  assert.ok(!/[<>"&]/.test(value), `unsafe character in English text (use “ ” and 'and'): ${value}`);
}

// ---- 4. no new untranslated Japanese in the UI code --------------------------------------
// Allowed: the dictionary itself, the AI-oriented Markdown export (kept in Japanese on
// purpose), log output, comments, a regex that lists Japanese brackets, the language buttons.
const markdown = between('function mdScalar(', 'function setMarkdownOutput(');
const bodyStart = html.indexOf('<body>');
const lineOffsets = [];
let offset = 0;
for (const line of html.split('\n')) { lineOffsets.push(offset); offset += line.length + 1; }
const leaks = [];
html.split('\n').forEach((line, i) => {
  if (!JP.test(line.replace(/＋/g, ''))) return;                             // ＋ is a symbol, not text
  const pos = lineOffsets[i];
  if (pos < bodyStart) return;                                              // <title> in <head>
  if (pos >= dictBlock.from && pos < dictBlock.to) return;                  // the dictionary
  if (pos >= markdown.from && pos < markdown.to) return;                    // Markdown export
  if (/^\s*(\/\/|\/\*|\*)/.test(line) || line.includes('console.')) return;
  if (line.includes('「」『』')) return;                                      // regex of brackets
  if (line.includes('data-lang="ja"')) return;                              // 日本語 language button
  const stripped = line.replace(T_LITERAL, 't(@').replace(/data-i18n(?:-[\w-]+)?="[^"]*"/g, '').replace(/＋/g, '');
  const inStaticHtml = pos < scriptStart;
  // In the static HTML the visible default text stays Japanese, but the element must be marked
  if (inStaticHtml ? !line.includes('data-i18n') : JP.test(stripped)) leaks.push(`${i + 1}: ${line.trim().slice(0, 140)}`);
});
assert.deepEqual(leaks, [], `Japanese text outside t() / data-i18n:\n${leaks.join('\n')}`);

// ---- 5. nothing may shadow the global t() ------------------------------------------------
// A local variable or parameter named `t` hides the translation function in that scope, and any
// t('…') call there would throw at runtime. Use another name (tag, text, tab, …).
const shadowing = script.split('\n').filter(line =>
  /\b(?:const|let|var)\s+t\b(?!\s*,?\s*\()/.test(line) ||
  /(?<![\w$.])t\s*=>/.test(line) ||
  /\(\s*t\s*\)\s*=>/.test(line) ||
  /\bfunction\s*\w*\s*\([^)]*(?<![\w$.])t\s*[,)]/.test(line) && !/^\s*function t\(/.test(line) ||
  /\bcatch\s*\(\s*t\s*\)/.test(line));
assert.deepEqual(shadowing, [], `a local named "t" would shadow the translation function:\n${shadowing.join('\n')}`);

// ---- 6. English plurals: “{n} paper(s)” follows the number ---------------------------------
{
  const fn = between('function t(key, vars) {', '\nfunction applyStaticI18n').text;
  const ctx = vm.createContext({ LANG: 'en', I18N_EN: { 'x': 'Added {n} paper(s)', 'y': '{a} group(s), {b} paper(s)', 'z': 'Added {n} supplementary file(s)' } });
  vm.runInContext(fn, ctx);
  const tr = (k, v) => vm.runInContext(`t(${JSON.stringify(k)}, ${JSON.stringify(v)})`, ctx);
  assert.equal(tr('x', { n: 1 }), 'Added 1 paper');
  assert.equal(tr('x', { n: 0 }), 'Added 0 papers');
  assert.equal(tr('x', { n: 3 }), 'Added 3 papers');
  assert.equal(tr('y', { a: 1, b: 2 }), '1 group, 2 papers');
  assert.equal(tr('z', { n: 1 }), 'Added 1 supplementary file');
  vm.runInContext("LANG = 'ja'", ctx);
  assert.equal(tr('文献 {n} 件', { n: 1 }), '文献 1 件');
}

console.log(`i18n smoke tests passed (${used.size} keys, ${Object.keys(dictionary).length} translations)`);
