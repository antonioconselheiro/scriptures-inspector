const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const cli = path.join(root, 'cli/dist/index.mjs');
const bible = path.join(root, 'projects/bible');
let project;

beforeEach(() => {
  project = fs.mkdtempSync(path.join(os.tmpdir(), 'scriptures-cli-test-'));
  const projectConfig = JSON.parse(fs.readFileSync(path.join(bible, 'index.xenoglosproj'), 'utf8'));
  fs.writeFileSync(path.join(project, 'index.xenoglosproj'), JSON.stringify(projectConfig));
  for (const relative of [
    'sources/hebrew-stuttgartensia/_.codex',
    'sources/hebrew-stuttgartensia/GEN.json',
    'sources/greek-septuagint/_.codex',
    'sources/greek-septuagint/GEN.json',
    'sources/geez-mashafa-qeddus/_.codex',
    'sources/geez-mashafa-qeddus/GEN.json',
    'targets/geez-mashafa-qeddus-custom-portuguese-metadata/GEN.json',
    'targets/hebrew-stuttgartensia-portuguese-metadata/GEN.json',
    'targets/hebrew-stuttgartensia-custom-portuguese-translation/GEN.json',
    'targets/greek-septuagint-hebrew-stuttgartensia-interlinear/GEN.json'
  ]) {
    const destination = path.join(project, relative);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.join(bible, relative), destination);
  }
});

afterEach(() => fs.rmSync(project, { recursive: true, force: true }));

function run(...args) {
  return spawnSync(process.execPath, [cli, ...args], { cwd: project, encoding: 'utf8' });
}

function success(...args) {
  const result = run(...args);
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

const target = ['--target', 'hebrew-stuttgartensia', '--book', 'GEN'];
const verse = ['--chapter', '1', '--verse', '1'];

test('lists project resources and resolves project directory', () => {
  const books = JSON.parse(success('list-books'));
  assert.deepEqual(books[0], { key: 'GEN', name: 'Gênesis' });
  assert.ok(JSON.parse(success('list-sources')).includes('hebrew-stuttgartensia'));
  const targets = JSON.parse(success('list-targets', '--project', project));
  assert.ok(targets.metadata.includes('hebrew-stuttgartensia-portuguese-metadata'));
  assert.ok(targets.translation.includes('hebrew-stuttgartensia-custom-portuguese-translation'));
  assert.ok(targets.interlinear.includes('greek-septuagint-hebrew-stuttgartensia-interlinear'));
});

test('reads original metadata, interlinear and editor lexical segmentation', () => {
  const metadata = JSON.parse(success('read-metadata', ...target, ...verse));
  assert.equal(metadata['3-אלהים'].isWordOfGod, true);
  const explicit = JSON.parse(success('read-metadata', '--target', 'hebrew-stuttgartensia-portuguese-metadata', '--book', 'GEN', ...verse));
  assert.deepEqual(explicit, metadata);
  const interlinear = JSON.parse(success('read-interlinear', '--target', 'greek-septuagint-hebrew-stuttgartensia-interlinear', '--book', 'GEN', ...verse));
  assert.equal(interlinear['hebrew-stuttgartensia'][0].verse, 1);
  const lexical = JSON.parse(success('read-lexical', ...target, ...verse));
  assert.deepEqual(lexical.slice(0, 3).map(item => [item.word, item.morpheme, item.lexical.value]), [
    ['בְּ', 'prefix', 'em|no(a)'], ['רֵאשִׁ֖ית', 'root', 'princípio'], ['בָּרָ֣א', 'root', 'criar']
  ]);
});

test('lists and navigates pending lexical occurrences using editor lexical rules', () => {
  const sourceFile = path.join(project, 'sources/geez-mashafa-qeddus/GEN.json');
  const sourceBook = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
  sourceBook.chapters = [{ chapter: 1, verses: sourceBook.chapters[0].verses.slice(0, 4) }];
  fs.writeFileSync(sourceFile, JSON.stringify(sourceBook));
  const args = ['--target', 'geez-mashafa-qeddus', '--book', 'GEN', '--chapter', '1'];
  const list = JSON.parse(success('list-pending-lexicals', ...args));
  const expected = sourceBook.chapters[0].verses.flatMap(verse =>
    JSON.parse(success('read-lexical', ...args, '--verse', String(verse.verse)))
      .filter(segment => !segment.lexical.value.trim())
      .map(segment => [verse.verse, segment.index, segment.word, segment.morpheme, segment.lexical.config])
  );
  assert.deepEqual(list.map(item => [item.verse, item.segmentIndex, item.segment, item.morpheme, item.lexicalRule]), expected);
  assert.ok(list.some(item => item.verse === 2 && item.segment === 'ጽልመ'));
  assert.ok(list.some(item => item.verse === 4 && item.segment === 'ጽልመ'));
  const next = JSON.parse(success('next-pending-lexical', ...args));
  assert.equal(next.position, 1);
  assert.equal(next.total, list.length);
  assert.deepEqual(next.item, list[0]);
  const previous = JSON.parse(success('previous-pending-lexical', ...args));
  assert.deepEqual(previous.item, list.at(-1));
  assert.equal(previous.wrapped, false);
  const after = JSON.parse(success('next-pending-lexical', ...args, '--verse', String(list[0].verse), '--segment', String(list[0].segmentIndex)));
  assert.deepEqual(after.item, list[1]);
  const wrapped = JSON.parse(success('next-pending-lexical', ...args, '--verse', String(list.at(-1).verse), '--segment', String(list.at(-1).segmentIndex)));
  assert.equal(wrapped.wrapped, true);
  assert.deepEqual(wrapped.item, list[0]);
  success('set-lexical', list[0].key, list[0].lexicalRule, 'filled', ...args.slice(0, 4));
  const afterFilled = JSON.parse(success('next-pending-lexical', ...args, '--verse', String(list[0].verse), '--segment', String(list[0].segmentIndex)));
  assert.deepEqual(afterFilled.item.segment, list[1].segment);
  assert.notEqual(run('next-pending-lexical', ...args, '--verse', '2').status, 0);
  assert.notEqual(run('next-pending-lexical', ...args, '--verse', '2', '--segment', '9999').status, 0);
  assert.notEqual(run('list-pending-lexicals', ...args.slice(0, 4), '--chapter', '999').status, 0);
});

test('empty chapter pending list and whitespace-only lexical values', () => {
  const sourceFile = path.join(project, 'sources/hebrew-stuttgartensia/GEN.json');
  const source = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
  source.chapters = [{ chapter: 1, verses: [{ verse: 1, text: 'בָּרָ֣א' }] }];
  fs.writeFileSync(sourceFile, JSON.stringify(source));
  const args = [...target, '--chapter', '1'];
  const read = JSON.parse(success('read-lexical', ...args, '--verse', '1'));
  for (const segment of read) success('set-lexical', segment.word, segment.lexical.config, 'filled', ...target);
  assert.deepEqual(JSON.parse(success('list-pending-lexicals', ...args)), []);
  assert.deepEqual(JSON.parse(success('next-pending-lexical', ...args)), { total: 0, position: 0, wrapped: false, item: null });
  success('set-lexical', read[0].word, read[0].lexical.config, '  ', ...target);
  const pending = JSON.parse(success('list-pending-lexicals', ...args));
  assert.equal(pending[0].segment, read[0].word);
});

test('pending lexical rule follows the editor fallback for prefix segments', () => {
  const file = path.join(project, 'targets/hebrew-stuttgartensia-portuguese-metadata/GEN.json');
  const metadata = JSON.parse(fs.readFileSync(file, 'utf8'));
  metadata.lexical['ב'] = { value: '   ' };
  fs.writeFileSync(file, JSON.stringify(metadata));
  const pending = JSON.parse(success('list-pending-lexicals', ...target, '--chapter', '1'));
  const entry = pending.find(item => item.verse === 1 && item.segmentIndex === 0);
  assert.equal(entry.key, 'ב');
  assert.equal(entry.morpheme, 'prefix');
  assert.equal(entry.lexicalRule, 'root');
  success('set-lexical', entry.key, entry.lexicalRule, 'in', ...target);
  assert.ok(!JSON.parse(success('list-pending-lexicals', ...target, '--chapter', '1')).some(item => item.verse === 1 && item.segmentIndex === 0));
});

test('renders list commands as tables on a terminal and preserves redirected JSON', () => {
  const quote = value => `'${value.replace(/'/g, "'\\''")}'`;
  for (const [command, options, headers] of [
    ['list-books', [], ['KEY', 'NAME']],
    ['list-sources', [], ['SOURCE']],
    ['list-targets', [], ['TYPE', 'TARGET']],
    ['list-patterns', target, ['TYPE', 'PATTERN']],
    ['list-lexicals', target, ['KEY', 'ROOT', 'PREFIX', 'SUFFIX']],
    ['list-variations', target, ['ID', 'NAME']],
    ['list-pending-lexicals', ['--target', 'geez-mashafa-qeddus', '--book', 'GEN', '--chapter', '1'], ['VERSE', 'SEGMENT', 'MORPHEME']]
  ]) {
    const args = [process.execPath, cli, command, '--project', project, ...options];
    const terminal = spawnSync('script', ['-q', '-e', '-c', args.map(quote).join(' '), '/dev/null'], { encoding: 'utf8' });
    assert.equal(terminal.status, 0, terminal.stderr);
    for (const header of headers) assert.ok(terminal.stdout.includes(header), `${command}: ${header}`);
    assert.match(terminal.stdout, /-{2,}/);
    assert.doesNotThrow(() => JSON.parse(success(command, ...options)));
  }
});

test('colors lexical values and displays empty lexical values without a morpheme', () => {
  const quote = value => `'${value.replace(/'/g, "'\\''")}'`;
  const args = [process.execPath, cli, 'read-lexical', '--project', project, '--target', 'geez-mashafa-qeddus', '--book', 'GEN', '--chapter', '1', '--verse', '2'];
  const env = { ...process.env };
  delete env.NO_COLOR;
  const result = spawnSync('script', ['-q', '-e', '-c', args.map(quote).join(' '), '/dev/null'], { encoding: 'utf8', env });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /\x1b\[38;2;[\d;]+mወ\x1b\[0m\t\x1b\[38;2;[\d;]+me\x1b\[0m\tprefix/);
  assert.match(result.stdout, /\x1b\[38;2;[\d;]+mጽልመ\x1b\[0m\t<empty>\r?\n/);
});

test('marks and clears selected segments and existing serialized verse metadata', () => {
  const file = path.join(project, 'targets/hebrew-stuttgartensia-portuguese-metadata/GEN.json');
  const initial = JSON.parse(fs.readFileSync(file, 'utf8'));
  initial.chapters[0].verses[0].metadata['3-אלהים'].extra = 'preserve';
  fs.writeFileSync(file, JSON.stringify(initial));
  success('set-word-of-god', ...target, ...verse, '--segments', '0,1');
  let metadata = JSON.parse(success('read-metadata', ...target, ...verse));
  assert.equal(metadata['0-ב'].isWordOfGod, true);
  assert.equal(metadata['1-ראשית'].isWordOfGod, true);
  assert.equal(metadata['3-אלהים'].extra, 'preserve');
  const snapshot = fs.readFileSync(file, 'utf8');
  assert.notEqual(run('set-word-of-god', ...target, ...verse, '--segments', '0,9999').status, 0);
  assert.equal(fs.readFileSync(file, 'utf8'), snapshot);
  success('remove-word-of-god', ...target, ...verse, '--segments', '0,3');
  metadata = JSON.parse(success('read-metadata', ...target, ...verse));
  assert.equal(metadata['0-ב'].isWordOfGod, undefined);
  assert.equal(metadata['3-אלהים'].extra, 'preserve');
  assert.equal(metadata['1-ראשית'].isWordOfGod, true);
  success('clean-word-of-god', ...target, ...verse);
  metadata = JSON.parse(success('read-metadata', ...target, ...verse));
  assert.equal(metadata['1-ראשית'].isWordOfGod, undefined);
  assert.equal(metadata['3-אלהים'].extra, 'preserve');
});

test('clears verse lexical entries using normalized keys', () => {
  assert.equal(JSON.parse(success('get-lexical', 'ברא', ...target)).value, 'criar');
  success('clean-verse-lexical', ...target, ...verse);
  assert.notEqual(run('get-lexical', 'ברא', ...target).status, 0);
});

test('clears one interlinear origin and verse', () => {
  const args = ['--target', 'greek-septuagint-hebrew-stuttgartensia-interlinear', '--book', 'GEN'];
  const source = ['--origin', 'hebrew-stuttgartensia', '--chapter', '1', '--verse', '2'];
  const before = JSON.parse(success('read-interlinear', ...args, '--chapter', '1', '--verse', '2'));
  assert.ok(before['hebrew-stuttgartensia'][0].words.length);
  success('clean-interlinear', ...args, ...source);
  assert.deepEqual(JSON.parse(success('read-interlinear', ...args, '--chapter', '1', '--verse', '2'))['hebrew-stuttgartensia'][0].words, []);
});

test('clears translation links, verse variation overrides and translation independently', () => {
  const file = path.join(project, 'targets/hebrew-stuttgartensia-custom-portuguese-translation/GEN.json');
  const id = '1389d4a7-688a-473d-89bb-372656f9a73b';
  success('clean-translation-variation', ...target, ...verse, '--variations', id);
  let book = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.ok(book.variations[id]);
  assert.deepEqual(book.chapters[0].verses[0].variations[id], {});
  assert.ok(book.chapters[0].verses[0].variations['4e5f9b02-385c-4192-bde4-1b5739dc797c']['4']);
  success('clean-translation-interlinear', ...target, ...verse);
  book = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.ok(book.chapters[0].verses[0].metadata.every(item => item.value === ''));
  assert.ok(book.chapters[0].verses[0].text);
  success('clean-translation', ...target, ...verse);
  book = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.equal(book.chapters[0].verses[0].text, '');
  assert.deepEqual(book.chapters[0].verses[0].metadata, []);
  assert.deepEqual(book.chapters[0].verses[0].variations, {});
});

test('finds sparse numeric metadata verses by their identifiers', () => {
  const file = path.join(project, 'targets/hebrew-stuttgartensia-portuguese-metadata/GEN.json');
  const metadata = JSON.parse(fs.readFileSync(file, 'utf8'));
  metadata.chapters = [{ chapter: 1, verses: [{ verse: 2, metadata: { marked: { isWordOfGod: true } } }] }];
  fs.writeFileSync(file, JSON.stringify(metadata));
  assert.deepEqual(JSON.parse(success('read-metadata', ...target, ...verse)), {});
  assert.equal(JSON.parse(success('read-metadata', ...target, '--chapter', '1', '--verse', '2')).marked.isWordOfGod, true);
});

test('combines variations, persists additions and removes verse overrides', () => {
  const one = '1389d4a7-688a-473d-89bb-372656f9a73b';
  const two = '4e5f9b02-385c-4192-bde4-1b5739dc797c';
  assert.equal(success('read-translation', ...target, ...verse), 'No princípio criou Divos AZ os céus e AZ a terra.');
  assert.equal(success('read-translation', ...target, ...verse, '--variations', `${one},${two}`), 'No princípio criou Deus ➜ os céus e ➜ a terra.');
  const transliteration = 'fc5ca031-196a-4f7e-aca5-808369ed3b93';
  assert.equal(success('read-translation', ...target, ...verse, '--variations', `${one},${transliteration}`), 'No princípio criou Elohim AZ os céus e AZ a terra.');
  assert.equal(success('read-translation', ...target, ...verse, '--variations', `${transliteration},${one}`), 'No princípio criou Deus AZ os céus e AZ a terra.');
  assert.ok(JSON.parse(success('list-variations', ...target)).some(item => item.id === one));
  const id = success('add-variations', 'My variation', ...target);
  assert.match(id, /^[\da-f-]{36}$/);
  assert.ok(JSON.parse(success('list-variations', ...target)).some(item => item.id === id && item.name === 'My variation'));
  assert.deepEqual(JSON.parse(success('remove-variations', ...target, '--variations', `${one},${id}`)).removed, [one, id]);
  const saved = JSON.parse(fs.readFileSync(path.join(project, 'targets/hebrew-stuttgartensia-custom-portuguese-translation/GEN.json')));
  assert.equal(saved.variations[one], undefined);
  assert.equal(saved.chapters[0].verses[0].variations[one], undefined);
  assert.ok(saved.variations[two]);
});

test('open passes the absolute project path to the GUI without Node mode', async () => {
  const executable = path.join(project, 'fake-gui');
  const capture = path.join(project, 'opened');
  fs.writeFileSync(executable, '#!/bin/sh\nprintf "%s\\n%s\\n" "$1" "${ELECTRON_RUN_AS_NODE-unset}" > "$CAPTURE"\n', { mode: 0o755 });
  const result = spawnSync(process.execPath, [cli, 'open'], {
    cwd: project,
    encoding: 'utf8',
    env: { ...process.env, SCRIPTURES_INSPECTOR_GUI: executable, ELECTRON_RUN_AS_NODE: '1', CAPTURE: capture }
  });
  assert.equal(result.status, 0, result.stderr);
  for (let i = 0; i < 50 && !fs.existsSync(capture); i++) await new Promise(resolve => setTimeout(resolve, 20));
  assert.deepEqual(fs.readFileSync(capture, 'utf8').trim().split('\n'), [path.join(project, 'index.xenoglosproj'), 'unset']);
});

test('si package alias runs the same launcher and rejects an existing conflicting file', () => {
  const app = path.join(project, 'app');
  const resources = path.join(app, 'resources');
  const bin = path.join(project, 'bin');
  fs.mkdirSync(resources, { recursive: true });
  fs.mkdirSync(bin);
  fs.copyFileSync(path.join(root, 'packaging/linux/scriptures-inspector'), path.join(resources, 'scriptures-inspector'));
  fs.chmodSync(path.join(resources, 'scriptures-inspector'), 0o755);
  fs.writeFileSync(path.join(app, 'Scriptures Inspector'), '#!/bin/sh\nshift\nexec "$NODE" "$CLI" "$@"\n', { mode: 0o755 });
  fs.symlinkSync(path.join(resources, 'scriptures-inspector'), path.join(bin, 'scriptures-inspector'));
  const install = fs.readFileSync(path.join(root, 'packaging/debian/postinst'), 'utf8')
    .split('\nmime_dir=')[0].replaceAll('/usr/bin/si', path.join(bin, 'si'));
  assert.equal(spawnSync('sh', ['-c', install]).status, 0);
  const env = { ...process.env, NODE: process.execPath, CLI: cli };
  const long = spawnSync(path.join(bin, 'scriptures-inspector'), ['list-books'], { cwd: project, env, encoding: 'utf8' });
  const short = spawnSync(path.join(bin, 'si'), ['list-books'], { cwd: project, env, encoding: 'utf8' });
  assert.equal(short.status, 0, short.stderr);
  assert.equal(short.stdout, long.stdout);
  fs.unlinkSync(path.join(bin, 'si'));
  fs.writeFileSync(path.join(bin, 'si'), 'keep');
  const conflict = spawnSync('sh', ['-c', install], { encoding: 'utf8' });
  assert.notEqual(conflict.status, 0);
  assert.match(conflict.stderr, /already exists/);
  assert.equal(fs.readFileSync(path.join(bin, 'si'), 'utf8'), 'keep');
});

test('patterns and lexicals use normalization and persist changes', () => {
  success('set-pattern', 'בָּרָ֣א', 'lexeme', ...target);
  assert.ok(JSON.parse(success('list-patterns', ...target)).lexeme.includes('ברא'));
  success('remove-pattern', 'בָּרָ֣א', 'lexeme', ...target);
  assert.ok(!JSON.parse(success('list-patterns', ...target)).lexeme.includes('ברא'));
  success('set-lexical', 'בָּרָ֣א', 'root', 'create', ...target);
  success('set-lexical', 'בָּרָ֣א', 'prefix', 'prefix value', ...target);
  assert.equal(JSON.parse(success('get-lexical', 'ברא', ...target)).value, 'create');
  assert.equal(JSON.parse(success('list-lexicals', ...target))['ברא'].prefix, 'prefix value');
  success('remove-lexical', 'ברא', 'root', ...target);
  assert.equal(JSON.parse(success('get-lexical', 'ברא', ...target)).value, 'prefix value');
  success('remove-lexical', 'ברא', 'prefix', ...target);
  assert.equal(JSON.parse(success('get-lexical', 'ברא', ...target)).prefix, undefined);
});

test('clean-unused-lexical applies the shared editor rule to the entire book', () => {
  success('set-lexical', 'UNUSEDTEST', 'root', 'unused', ...target);
  const removed = JSON.parse(success('clean-unused-lexical', ...target)).removed;
  assert.ok(removed.includes('UNUSEDTEST'));
  assert.ok(!removed.includes('ברא'));
  assert.notEqual(run('get-lexical', 'UNUSEDTEST', ...target).status, 0);
});

test('reports invalid input and malformed targets without modifying data', () => {
  const translationFile = path.join(project, 'targets/hebrew-stuttgartensia-custom-portuguese-translation/GEN.json');
  const before = fs.readFileSync(translationFile, 'utf8');
  assert.notEqual(run('remove-variations', ...target, '--variations', '1389d4a7-688a-473d-89bb-372656f9a73b,unknown').status, 0);
  assert.equal(fs.readFileSync(translationFile, 'utf8'), before);
  for (const args of [
    ['read-translation', ...target, ...verse, '--variations', 'unknown'],
    ['remove-variations', ...target, '--variations', 'unknown'],
    ['set-pattern', 'foo', 'invalid', ...target],
    ['set-lexical', 'foo', 'invalid', 'bar', ...target],
    ['read-lexical', ...target, '--chapter', '0', '--verse', '1'],
    ['list-books', '--verse', '1'],
    ['list-books', '--book', '../bad'],
    ['not-a-command']
  ]) {
    const result = run(...args);
    assert.notEqual(result.status, 0, args.join(' '));
    assert.match(result.stderr, /scriptures-inspector:/);
  }
  const file = path.join(project, 'targets/hebrew-stuttgartensia-portuguese-metadata/GEN.json');
  fs.writeFileSync(file, '{broken');
  const result = run('list-patterns', ...target);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Invalid JSON/);
  assert.equal(fs.readFileSync(file, 'utf8'), '{broken');
});

test('creates missing targets and preserves existing file permissions', () => {
  const file = path.join(project, 'targets/hebrew-stuttgartensia-portuguese-metadata/GEN.json');
  fs.unlinkSync(file);
  assert.deepEqual(JSON.parse(success('list-patterns', ...target)), { prefix: [], suffix: [], lexeme: [] });
  success('set-lexical', 'ברא', 'root', 'create', ...target);
  fs.chmodSync(file, 0o640);
  success('set-lexical', 'ברא', 'root', 'new value', ...target);
  assert.equal(fs.statSync(file).mode & 0o777, 0o640);
});
