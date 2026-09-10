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

const context = vm.createContext({
  console,
  S: { papers: [] },
  uid: () => 'test-id',
  plainText: value => String(value ?? '').replace(/<[^>]*>/g, ''),
  sanitizeText: (value, maxLen = 5000) => String(value ?? '').trim().slice(0, maxLen)
});

vm.runInContext([
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
assert.equal(parsed[0].title, 'Water on {YSZ} with {H{2}O}');
assert.deepEqual(Array.from(parsed[0].authors), ['{Research and Development Group}', 'Doe, Jane']);
assert.equal(parsed[1].booktitle, 'Proceedings of Tests');

context.commentSource = `% @article{ignored, title = {Ignored}}\n@article{kept, title = {Kept}}`;
assert.equal(vm.runInContext('parseBibEntries(commentSource).length', context), 1);
context.concatSource = '@article{bad, title = "A " # "B"}';
assert.throws(() => vm.runInContext('parseBibEntries(concatSource)', context), /値連結/);

context.paper = parsed[0];
const output = vm.runInContext('genBib(paper)', context);
assert.match(output, /title\s+= \{\{Water on \{YSZ\}/);
assert.match(output, /journal\s+= \{Surface \\& Science\}/);
assert.match(output, /doi\s+= \{10\.1000\/ABC\.1\}/);
assert.doesNotMatch(output, /abstract/i);
assert.doesNotMatch(output, /url\s+=/i);
assert.ok(output.endsWith('\n'));

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
