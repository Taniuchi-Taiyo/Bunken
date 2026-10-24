import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../bunken.html', import.meta.url), 'utf8');
const slice = (start, end) => {
  const from = html.indexOf(start);
  const to = html.indexOf(end, from);
  assert.notEqual(from, -1, `missing marker: ${start}`);
  assert.notEqual(to, -1, `missing marker: ${end}`);
  return html.slice(from, to);
};

// The app decodes HTML entities through the DOM. This dependency-free stub only handles
// plain text (with entities); markup such as <i> would need a real DOM, so fail loudly instead.
const decodeText = text => {
  assert.ok(!/<[a-z/!]/i.test(text), `smoke-test DOM stub cannot parse markup: ${text}`);
  const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return e.toLowerCase() in named ? named[e.toLowerCase()] : m;
  });
};
const fakeDocument = {
  createElement(tag) {
    const el = { _html: '' };
    Object.defineProperty(el, 'innerHTML', {
      get() { return this._html; },
      set(value) { this._html = String(value); }
    });
    Object.defineProperty(el, 'value', { get() { return decodeText(this._html); } });
    Object.defineProperty(el, 'content', {
      get() { return { nodeType: 11, childNodes: this._html ? [{ nodeType: 3, nodeValue: decodeText(this._html) }] : [] }; }
    });
    return el;
  }
};

const context = vm.createContext({
  console,
  S: { papers: [] },
  uid: () => 'test-id',
  document: fakeDocument,
  // i18n: the app's t() returns the Japanese source text, so the stub does the same
  t: (key, vars) => (vars ? key.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)) : key),
  plainText: value => String(value ?? '').replace(/<[^>]*>/g, ''),
  sanitizeText: (value, maxLen = 5000) => String(value ?? '').trim().slice(0, maxLen)
});

vm.runInContext([
  slice('/* ============================================================\n   BIBLIOGRAPHIC TEXT CLEANUP', '/* ============================================================\n   BIBTEX KEY'),
  slice('function bKey(', '/* ============================================================\n   BIBTEX PARSER'),
  slice('function splitBibEntries(', '/* ============================================================\n   CROSSREF FETCH'),
  slice('function normalizeDoi(', 'function findDoi(')
].join('\n'), context);

const parsed = vm.runInContext(`parseBibEntries(String.raw\`
@article{alpha2024,
  author = {{Research and Development Group} and Doe, Jane},
  title = {Water on {YSZ} with {H{2}O}},
  journal = {Surface & Science},
  year = 2024,
  doi = {https://doi.org/10.1000/ABC.1},
  abstract = {Not for normal export}
}
@inproceedings{beta2023,
  author = {Smith, John},
  title = {A second paper},
  booktitle = {Proceedings of Tests},
  year = {2023},
  pages = {1--4}
}\`)`, context);

assert.equal(parsed.length, 2);
assert.equal(parsed[0].bibtexKey, 'alpha2024');
// Protective braces are resolved to plain text on import; export re-protects the whole title.
assert.equal(parsed[0].title, 'Water on YSZ with H2O');
assert.deepEqual(Array.from(parsed[0].authors), ['Research and Development Group', 'Doe, Jane']);
assert.equal(parsed[1].booktitle, 'Proceedings of Tests');
assert.equal(parsed[1].pages, '1-4');

context.commentSource = `% @article{ignored, title = {Ignored}}\n@article{kept, title = {Kept}}`;
assert.equal(vm.runInContext('parseBibEntries(commentSource).length', context), 1);
// String concatenation with # is supported
context.concatSource = '@article{cat, title = "A " # "B"}';
assert.equal(vm.runInContext('parseBibEntries(concatSource)[0].title', context), 'A B');
// Malformed input is rejected
context.brokenSource = '@article{broken, title = {Never closed}';
assert.throws(() => vm.runInContext('parseBibEntries(brokenSource)', context));

context.paper = parsed[0];
const output = vm.runInContext('genBib(paper)', context);
assert.match(output, /title\s+= \{\{Water on YSZ with H2O\}\}/);
// A corporate author containing " and " must stay braced, or BibTeX would split it into three authors
assert.match(output, /author\s+= \{\{Research and Development Group\} and Doe, Jane\}/);
assert.match(output, /journal\s+= \{Surface \\& Science\}/);
assert.match(output, /doi\s+= \{10\.1000\/ABC\.1\}/);
assert.doesNotMatch(output, /abstract/i);
assert.doesNotMatch(output, /url\s+=/i);
assert.ok(output.endsWith('\n'));
// Page ranges are exported with an en-dash pair
assert.match(vm.runInContext('genBib(beta)', Object.assign(context, { beta: parsed[1] })), /pages\s+= \{1--4\}/);

context.roundTripSource = output;
const roundTrip = vm.runInContext('parseBibEntries(roundTripSource)[0]', context);
assert.equal(roundTrip.bibtexKey, 'alpha2024');
assert.equal(roundTrip.doi, '10.1000/ABC.1');
assert.equal(roundTrip.abstract, '');
context.roundTripPaper = roundTrip;
assert.equal(vm.runInContext('genBib(roundTripPaper)', context), output);

context.miscPaper = {
  type: 'misc', bibtexKey: 'report2024', title: 'A report', authors: [], year: 2024,
  publisher: 'Test Press', school: 'Test Institute', doi: '', arxivId: '', url: 'https://example.test/report'
};
const miscOutput = vm.runInContext('genBib(miscPaper)', context);
assert.match(miscOutput, /publisher\s+= \{Test Press\}/);
assert.match(miscOutput, /institution\s+= \{Test Institute\}/);

context.S.papers = [{ id: 'existing', bibtexKey: 'alpha2024', authors: [], title: '', year: 2024 }];
assert.equal(vm.runInContext("nextAvailableBibKey('alpha2024')", context), 'alpha2024a');

assert.equal(vm.runInContext("normalizeDoi('doi: 10.1000/test.)')", context), '10.1000/test');
assert.equal(vm.runInContext("normalizeArxivId('https://arxiv.org/pdf/2301.12345v2.pdf')", context), '2301.12345');

console.log('BibTeX smoke tests passed');
