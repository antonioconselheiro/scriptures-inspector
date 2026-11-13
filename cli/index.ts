import { randomUUID } from 'node:crypto';
import { constants } from 'node:fs';
import { access, chmod, mkdir, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import stringWidth from 'string-width';
import { BookMetadataTarget } from '@domain/book-metadata-target-model';
import { BookTranslationTarget } from '@domain/book-translation-target-model';
import { InterlinearTarget } from '@domain/interlinear-target-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { languageList } from '@domain/language-list';
import { MorphemeType } from '@domain/morpheme-type';
import { Project } from '@domain/project-model';
import { ProjectStructureMetadata } from '@domain/project-structure-metadata-model';
import { SourceBook } from '@domain/source-book-model';
import { getProjectLanguageFn } from '@shared/language-metadata/get-project-language-fn';
import { getSourcePathFn } from '@shared/project/get-source-path-fn';
import { SystemService } from '@shared/system/system-service';
import { PatternsService } from '../src/app/pages/translator/patterns-service';
import { cleanUnusedLexical } from '../src/app/pages/translator/translation-editor/shared/project/clean-unused-lexical';
import { ProjectCustomTranslationService } from '../src/app/pages/translator/translation-editor/shared/project/project-custom-translation-service';
import { ProjectDataService } from '../src/app/pages/translator/translation-editor/shared/project/project-data-service';
import { ProjectMetadataService } from '../src/app/pages/translator/translation-editor/shared/project/project-metadata-service';
import { ProjectInterlinearService } from '../src/app/pages/translator/translation-editor/shared/project/project-interlinear-service';
import { metadataVerseMatches } from '../src/app/pages/translator/translation-editor/shared/project/metadata-verse-matches';
import { isPendingLexical } from '../src/app/pages/translator/translation-editor/shared/project/pending-lexical';
import { removeLexical } from '../src/app/pages/translator/translation-editor/shared/project/remove-lexical';
import { removeTranslationVariation, selectVariationText } from '../src/app/pages/translator/translation-editor/shared/project/translation-variations';

type Kind = 'metadata' | 'interlinear' | 'translation';
type Structure = ProjectStructureMetadata & { interlinearTarget?: string };
type Options = Record<string, string>;

const dataService = new ProjectDataService();
const systemService = new SystemService();
const metadataService = new ProjectMetadataService(dataService, systemService);
const translationService = new ProjectCustomTranslationService(dataService, systemService);
const interlinearService = new ProjectInterlinearService(dataService, systemService);
const patternService = new PatternsService();

function parseArgs(args: string[]): { command: string; options: Options; positional: string[] } {
  const command = args.shift() ?? 'help';
  const options: Options = {};
  const positional: string[] = [];
  const allowed = new Set(['project', 'target', 'book', 'chapter', 'verse', 'segment', 'variations', 'segments', 'origin']);
  while (args.length) {
    const arg = args.shift()!;
    if (!arg.startsWith('--')) {
      positional.push(arg);
      continue;
    }
    const key = arg.slice(2);
    if (!allowed.has(key) || key in options) throw new Error(`Unknown or repeated option: ${arg}`);
    const value = args.shift();
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${arg}`);
    options[key] = value;
  }
  return { command, options, positional };
}

function required(options: Options, name: string): string {
  const value = options[name];
  if (!value) throw new Error(`Missing --${name}`);
  return value;
}

function identifier(value: string, label: string): string {
  if (!/^[\p{L}\p{N}_.-]+$/u.test(value) || value === '.' || value === '..') {
    throw new Error(`Invalid ${label}: ${value}`);
  }
  return value;
}

function numberOption(options: Options, name: string): number {
  const text = required(options, name);
  if (!/^[1-9]\d*$/.test(text) || !Number.isSafeInteger(Number(text))) throw new Error(`Invalid --${name}: ${text}`);
  return Number(text);
}

async function json<T>(file: string): Promise<T> {
  let text: string;
  if (/^https?:\/\//i.test(file)) {
    const response = await fetch(file);
    if (!response.ok) throw new Error(`Cannot read ${file}: HTTP ${response.status}`);
    text = await response.text();
  } else {
    text = await readFile(file, 'utf8');
  }
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw new Error(`Invalid JSON in ${file}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function loadTarget<T>(file: string, empty: () => T): Promise<T> {
  try {
    return await json<T>(file);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return empty();
    throw error;
  }
}

async function save(file: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  const temp = `${file}.${randomUUID()}.tmp`;
  let mode = 0o666;
  let existing = false;
  try {
    mode = (await stat(file)).mode & 0o777;
    existing = true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
  try {
    await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx', mode });
    if (existing) await chmod(temp, mode);
    await rename(temp, file);
  } finally {
    await unlink(temp).catch(error => {
      if (error.code !== 'ENOENT') throw error;
    });
  }
}

function structures(project: Project): Structure[] {
  const result: Structure[] = [];
  const walk = (items: Structure[]): void => {
    for (const item of items) {
      result.push(item);
      if (item.interlinear) walk(item.interlinear);
    }
  };
  walk(project.structures);
  return result;
}

function targetProperty(kind: Kind): 'metadataTarget' | 'interlinearTarget' | 'customTranslationTarget' {
  return kind === 'metadata' ? 'metadataTarget' : kind === 'translation' ? 'customTranslationTarget' : 'interlinearTarget';
}

function resolveTarget(project: Project, value: string, kind: Kind): { target: string; source: string } {
  const prop = targetProperty(kind);
  const matches = structures(project).filter(item => item[prop] === value || (kind !== 'interlinear' && item.source === value && item[prop]));
  const pairs = [...new Map(matches.map(item => [`${item[prop]}\0${item.source}`, { target: item[prop]!, source: item.source }])).values()];
  if (pairs.length !== 1) throw new Error(pairs.length ? `Ambiguous ${kind} target: ${value}; use the target name` : `Unknown ${kind} target: ${value}`);
  identifier(pairs[0].target, 'target');
  return pairs[0];
}

function sourcePath(project: Project, source: string, name: string): string {
  if (source.startsWith('@')) {
    if (!/^@[\w.-]+\/[\w.-]+$/.test(source)) throw new Error(`Invalid source: ${source}`);
    const alias = source.slice(1).split('/')[0];
    if (!project.repositories?.[alias]) throw new Error(`Unknown repository: ${alias}`);
  } else {
    identifier(source, 'source');
  }
  const result = getSourcePathFn(project, source, name);
  if (!result) throw new Error(`Cannot resolve source: ${source}`);
  return result;
}

async function sourceData(project: Project, source: string, book: string): Promise<{ sourceBook: SourceBook; language: ReturnType<typeof getProjectLanguageFn> }> {
  const codex = await json<{ language: string }>(sourcePath(project, source, '_.codex'));
  if (!languageList.some(language => language === codex.language)) throw new Error(`Unsupported source language: ${codex.language}`);
  return {
    sourceBook: await json<SourceBook>(sourcePath(project, source, `${book}.json`)),
    language: getProjectLanguageFn(project, codex.language as LanguageUnionType)
  };
}

function findSourceVerse(source: SourceBook, chapter: number, verse: number): { chapterIndex: number; verseIndex: number; text: string } {
  const chapterIndex = source.chapters.findIndex(item => item?.chapter === chapter);
  const verseIndex = source.chapters[chapterIndex]?.verses.findIndex(item => item?.verse === verse) ?? -1;
  if (chapterIndex < 0 || verseIndex < 0) throw new Error(`Source verse not found: ${chapter}:${verse}`);
  return { chapterIndex, verseIndex, text: source.chapters[chapterIndex].verses[verseIndex].text };
}

function ids(options: Options): string[] {
  const values = required(options, 'variations').split(',');
  if (values.some(value => !value) || new Set(values).size !== values.length) throw new Error('Invalid --variations list');
  return values;
}

function expectPositionals(values: string[], count: number): void {
  if (values.length !== count) throw new Error(`Expected ${count} positional argument(s), got ${values.length}`);
}

function morpheme(value: string): MorphemeType {
  if (value !== 'root' && value !== 'prefix' && value !== 'suffix') throw new Error(`Invalid lexical type: ${value}`);
  return value;
}

function patternType(value: string): 'prefix' | 'suffix' | 'lexeme' {
  if (value !== 'prefix' && value !== 'suffix' && value !== 'lexeme') throw new Error(`Invalid pattern type: ${value}`);
  return value;
}

function output(value: unknown): void {
  console.log(JSON.stringify(value, null, 2));
}

function outputList(value: unknown, headers: string[], rows: Array<Array<string | number>>): void {
  if (!process.stdout.isTTY) {
    output(value);
    return;
  }
  const cells = rows.map(row => row.map(cell => String(cell).replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ')));
  const widths = headers.map((header, i) => cells.reduce((width, row) => Math.max(width, stringWidth(row[i] ?? '')), stringWidth(header)));
  const line = (row: string[]): string => row.map((cell, i) =>
    cell + ' '.repeat(widths[i] - stringWidth(cell))
  ).join('  ').trimEnd();
  console.log(line(headers));
  console.log(widths.map(width => '-'.repeat(width)).join('  '));
  for (const row of cells) console.log(line(row));
}

async function main(): Promise<void> {
  const { command, options, positional } = parseArgs(process.argv.slice(2));
  if (command === 'help' || command === '--help') {
    console.log('Scriptures Inspector CLI. See README.md for commands and options.');
    return;
  }
  const commandOptions: Record<string, string[]> = {
    open: [], 'list-books': [], 'list-sources': [], 'list-targets': [],
    'read-metadata': ['target', 'book', 'chapter', 'verse'],
    'read-interlinear': ['target', 'book', 'chapter', 'verse'],
    'list-variations': ['target', 'book'], 'add-variations': ['target', 'book'],
    'remove-variations': ['target', 'book', 'variations'],
    'read-translation': ['target', 'book', 'chapter', 'verse', 'variations'],
    'list-patterns': ['target', 'book'], 'set-pattern': ['target', 'book'],
    'remove-pattern': ['target', 'book'], 'list-lexicals': ['target', 'book'],
    'get-lexical': ['target', 'book'], 'set-lexical': ['target', 'book'],
    'remove-lexical': ['target', 'book'], 'clean-unused-lexical': ['target', 'book'],
    'read-lexical': ['target', 'book', 'chapter', 'verse'],
    'list-pending-lexicals': ['target', 'book', 'chapter'],
    'next-pending-lexical': ['target', 'book', 'chapter', 'verse', 'segment'],
    'previous-pending-lexical': ['target', 'book', 'chapter', 'verse', 'segment'],
    'set-word-of-god': ['target', 'book', 'chapter', 'verse', 'segments'],
    'remove-word-of-god': ['target', 'book', 'chapter', 'verse', 'segments'],
    'clean-word-of-god': ['target', 'book', 'chapter', 'verse'],
    'clean-verse-lexical': ['target', 'book', 'chapter', 'verse'],
    'clean-interlinear': ['target', 'book', 'chapter', 'verse', 'origin'],
    'clean-translation': ['target', 'book', 'chapter', 'verse'],
    'clean-translation-interlinear': ['target', 'book', 'chapter', 'verse'],
    'clean-translation-variation': ['target', 'book', 'chapter', 'verse', 'variations']
  };
  if (!Object.hasOwn(commandOptions, command)) throw new Error(`Unknown command: ${command}`);
  for (const option of Object.keys(options)) {
    if (option !== 'project' && !commandOptions[command].includes(option)) throw new Error(`Option --${option} is not valid for ${command}`);
  }
  const projectPath = path.resolve(options['project'] ?? '.', 'index.xenoglosproj');
  const project = { ...await json<Omit<Project, 'path'>>(projectPath), path: path.dirname(projectPath) };
  if (command === 'open') {
    expectPositionals(positional, 0);
    const executable = process.env['SCRIPTURES_INSPECTOR_GUI'];
    if (!executable) throw new Error('GUI executable not configured; use the installed scriptures-inspector launcher');
    await access(executable, constants.X_OK);
    const env = { ...process.env };
    delete env['ELECTRON_RUN_AS_NODE'];
    const child = spawn(executable, [projectPath], { detached: true, stdio: 'ignore', env });
    await new Promise<void>((resolve, reject) => {
      child.once('error', reject);
      child.once('spawn', resolve);
    });
    child.unref();
    return;
  }
  if (!project.target?.books || !Array.isArray(project.structures)) throw new Error('Invalid project: target books or structures are missing');
  if (command === 'list-books') {
    expectPositionals(positional, 0);
    const books = Object.entries(project.target.books).map(([key, value]) => ({ key, name: value.name }));
    outputList(books, ['KEY', 'NAME'], books.map(item => [item.key, item.name]));
    return;
  }
  if (command === 'list-sources') {
    expectPositionals(positional, 0);
    const sources = [...new Set([...structures(project).map(item => item.source), ...(project.translationViewer ?? []).map(item => item.translation)])];
    outputList(sources, ['SOURCE'], sources.map(source => [source]));
    return;
  }
  if (command === 'list-targets') {
    expectPositionals(positional, 0);
    const items = structures(project);
    const targets = Object.fromEntries((['metadata', 'interlinear', 'translation'] as const).map(kind => [kind, [...new Set(items.map(item => item[targetProperty(kind)]).filter((value): value is string => Boolean(value)))]]));
    outputList(targets, ['TYPE', 'TARGET'], Object.entries(targets).flatMap(([kind, values]) => values.map(value => [kind, value])));
    return;
  }
  const kind: Kind = ['read-interlinear', 'clean-interlinear'].includes(command) ? 'interlinear'
    : ['list-variations', 'add-variations', 'remove-variations', 'read-translation', 'clean-translation', 'clean-translation-interlinear', 'clean-translation-variation'].includes(command) ? 'translation' : 'metadata';
  const { target, source } = resolveTarget(project, required(options, 'target'), kind);
  const book = identifier(required(options, 'book'), 'book');
  if (!(book in project.target.books)) throw new Error(`Unknown target book: ${book}`);
  const file = path.join(project.path, 'targets', target, `${book}.json`);
  if (kind === 'translation') {
    const translation = await loadTarget<BookTranslationTarget>(file, () => ({ chapters: [], variations: {} }));
    if (command === 'list-variations') {
      expectPositionals(positional, 0);
      const variations = Object.entries(translation.variations).map(([id, value]) => ({ id, name: value.name }));
      outputList(variations, ['ID', 'NAME'], variations.map(item => [item.id, item.name]));
    } else if (command === 'add-variations') {
      expectPositionals(positional, 1);
      if (!positional[0].trim()) throw new Error('Variation name cannot be empty');
      const id = randomUUID();
      translation.variations[id] = { name: positional[0] };
      await save(file, translation);
      console.log(id);
    } else if (command === 'remove-variations') {
      expectPositionals(positional, 0);
      const selected = ids(options);
      for (const id of selected) if (!translation.variations[id]) throw new Error(`Unknown variation: ${id}`);
      for (const id of selected) removeTranslationVariation(translation, id);
      await save(file, translation);
      output({ removed: selected });
    } else {
      expectPositionals(positional, 0);
      const selected = options['variations'] ? ids(options) : [];
      for (const id of selected) if (!translation.variations[id]) throw new Error(`Unknown variation: ${id}`);
      const { sourceBook } = await sourceData(project, source, book);
      const index = findSourceVerse(sourceBook, numberOption(options, 'chapter'), numberOption(options, 'verse'));
      const verse = translation.chapters[index.chapterIndex]?.verses[index.verseIndex];
      if (!verse) throw new Error('Translation verse not found');
      if (command === 'clean-translation' || command === 'clean-translation-interlinear' || command === 'clean-translation-variation') {
        const current = { book, chapter: numberOption(options, 'chapter') };
        const sourceVerse = sourceBook.chapters[index.chapterIndex].verses[index.verseIndex];
        if (command === 'clean-translation') {
          translationService.cleanCustomTranslation(sourceBook, { value: verse.text }, translation, current, sourceVerse);
        } else if (command === 'clean-translation-interlinear') {
          translationService.cleanInterlinear(sourceBook, translation, current, sourceVerse);
        } else {
          const selectedIds = ids(options);
          for (const id of selectedIds) if (!translation.variations[id]) throw new Error(`Unknown variation: ${id}`);
          const pieces = translationService.splitCustomTranslation(verse);
          for (const id of selectedIds) {
            for (let i = 0; i < pieces.length; i++) translationService.updateVariationValue(current, i, verse.variations, id, '');
          }
        }
        await save(file, translation);
        output({ cleared: command });
      } else if (!selected.length) console.log(verse.text);
      else {
        const segments = translationService.splitCustomTranslation(verse);
        console.log(segments.map((segment, i) => {
          const variations = Object.fromEntries(selected.map(id => [id, verse.variations?.[id]?.[String(i)]?.value ?? '']));
          return selectVariationText(segment.segment, variations, selected) + (segment.hasTrailingSpace ? ' ' : '');
        }).join(''));
      }
    }
    return;
  }
  if (kind === 'interlinear') {
    expectPositionals(positional, 0);
    const interlinear = await loadTarget<InterlinearTarget>(file, () => ({}));
    const chapter = numberOption(options, 'chapter');
    const verse = numberOption(options, 'verse');
    if (command === 'clean-interlinear') {
      const origin = required(options, 'origin');
      if (!Object.hasOwn(interlinear, origin)) throw new Error(`Unknown interlinear origin: ${origin}`);
      const { sourceBook } = await sourceData(project, source, book);
      const index = findSourceVerse(sourceBook, chapter, verse);
      interlinearService.cleanTranslationInterlinear(interlinear, origin, { book, chapter }, sourceBook.chapters[index.chapterIndex].verses[index.verseIndex]);
      await save(file, interlinear);
      output({ cleared: command, origin });
      return;
    }
    const result = Object.fromEntries(Object.entries(interlinear).flatMap(([key, value]) => {
      const matches = value.chapters.filter(item => item?.chapter === chapter).flatMap(item => item.verses.filter(entry => entry?.verse === verse));
      return matches.length ? [[key, matches]] : [];
    }));
    output(result);
    return;
  }
  const metadata = await loadTarget<BookMetadataTarget>(file, () => ({ chapters: [], patterns: { prefix: [], suffix: [], lexeme: [] }, lexical: {} }));
  if (command === 'list-patterns') {
    expectPositionals(positional, 0);
    outputList(metadata.patterns, ['TYPE', 'PATTERN'], (['prefix', 'suffix', 'lexeme'] as const).flatMap(type => metadata.patterns[type].map(pattern => [type, pattern])));
    return;
  }
  if (command === 'list-lexicals') {
    expectPositionals(positional, 0);
    outputList(metadata.lexical, ['KEY', 'ROOT', 'PREFIX', 'SUFFIX'], Object.entries(metadata.lexical).map(([key, value]) => [key, value.value ?? '', value.prefix ?? '', value.suffix ?? '']));
    return;
  }
  const { sourceBook, language } = await sourceData(project, source, book);
  const normalize = language.normalizeFn ?? ((value: string) => value);
  if (['list-pending-lexicals', 'next-pending-lexical', 'previous-pending-lexical'].includes(command)) {
    expectPositionals(positional, 0);
    const chapter = numberOption(options, 'chapter');
    const chapterData = sourceBook.chapters.find(item => item?.chapter === chapter);
    if (!chapterData) throw new Error(`Source chapter not found: ${chapter}`);
    const patterns = metadataService.parsePattern(metadata.patterns, language);
    const fields = chapterData.verses.flatMap(verse =>
      dataService.splitIntoMatrix(language, patterns, verse.text).flatMap((word, wordIndex) =>
        word.segments.map(segment => {
          const lexical = dataService.getLexical(metadata, language, segment.word, segment.morpheme);
          return {
            verse: verse.verse,
            wordIndex,
            segmentIndex: segment.index,
            segment: segment.word,
            key: normalize(segment.word),
            morpheme: segment.morpheme,
            lexicalRule: lexical.config,
            pending: isPendingLexical(lexical.value)
          };
        })
      )
    );
    const pending = fields.filter(field => field.pending).map(({ pending: _pending, ...field }, index) => ({ number: index + 1, ...field }));
    const headers = ['#', 'VERSE', 'WORD', 'SEGMENT', 'TEXT', 'KEY', 'MORPHEME', 'RULE'];
    const row = (item: typeof pending[number]): Array<string | number> =>
      [item.number, item.verse, item.wordIndex, item.segmentIndex, item.segment, item.key, item.morpheme, item.lexicalRule];
    if (command === 'list-pending-lexicals') {
      outputList(pending, headers, pending.map(row));
    } else {
      const hasVerse = options['verse'] !== undefined;
      const hasSegment = options['segment'] !== undefined;
      if (hasVerse !== hasSegment) throw new Error('--verse and --segment must be supplied together');
      let anchor = -1;
      if (hasVerse) {
        const verse = numberOption(options, 'verse');
        const segment = required(options, 'segment');
        if (!/^(0|[1-9]\d*)$/.test(segment) || !Number.isSafeInteger(Number(segment))) throw new Error(`Invalid --segment: ${segment}`);
        anchor = fields.findIndex(field => field.verse === verse && field.segmentIndex === Number(segment));
        if (anchor < 0) throw new Error(`Source segment not found: ${chapter}:${verse} segment ${segment}`);
      }
      const direction = command === 'next-pending-lexical' ? 1 : -1;
      let selected = -1;
      let wrapped = false;
      if (pending.length) {
        const candidates = fields.map((field, index) => field.pending ? index : -1).filter(index => index >= 0);
        const relative = direction === 1 ? candidates.find(index => index > anchor) : [...candidates].reverse().find(index => index < anchor);
        wrapped = relative === undefined && hasVerse;
        selected = relative ?? (direction === 1 ? candidates[0] : candidates[candidates.length - 1]);
      }
      const position = selected < 0 ? 0 : fields.slice(0, selected + 1).filter(field => field.pending).length;
      const item = position ? pending[position - 1] : null;
      const result = { total: pending.length, position, wrapped, item };
      if (process.stdout.isTTY) console.log(`Pending: ${position}/${pending.length}${wrapped ? ' (wrapped)' : ''}`);
      outputList(result, headers, item ? [row(item)] : []);
    }
  } else if (command === 'read-metadata') {
    expectPositionals(positional, 0);
    const chapter = numberOption(options, 'chapter');
    const verse = numberOption(options, 'verse');
    findSourceVerse(sourceBook, chapter, verse);
    const verses = metadata.chapters.find(item => item?.chapter === chapter)?.verses ?? [];
    const entry = verses.find(item => metadataVerseMatches(item?.verse, verse));
    output(entry?.metadata ?? {});
  } else if (command === 'get-lexical') {
    expectPositionals(positional, 1);
    const key = normalize(positional[0]);
    if (!metadata.lexical[key]) throw new Error(`Lexical not found: ${key}`);
    output({ key, ...metadata.lexical[key] });
  } else if (command === 'set-pattern' || command === 'remove-pattern') {
    expectPositionals(positional, 2);
    const type = patternType(positional[1]);
    const word = normalize(positional[0]);
    if (!word) throw new Error('Pattern cannot be empty');
    if (command === 'set-pattern') patternService.addPattern(metadata.patterns, type, language, word);
    else {
      const index = metadata.patterns[type].indexOf(word);
      if (index < 0) throw new Error(`Pattern not found: ${word}`);
      patternService.deletePattern(metadata.patterns, type, index);
    }
    await save(file, metadata);
    output(metadata.patterns);
  } else if (command === 'set-lexical') {
    expectPositionals(positional, 3);
    if (!normalize(positional[0])) throw new Error('Lexical key cannot be empty');
    metadataService.updateLexical({ book }, metadata, language, positional[0], positional[2], morpheme(positional[1]));
    await save(file, metadata);
    output(metadata.lexical[normalize(positional[0])] ?? null);
  } else if (command === 'remove-lexical') {
    expectPositionals(positional, 2);
    const key = normalize(positional[0]);
    const type = morpheme(positional[1]);
    const entry = metadata.lexical[key];
    if (!entry || !((type === 'root' ? 'value' : type) in entry)) throw new Error(`Lexical not found: ${key} (${type})`);
    removeLexical(metadata, key, type);
    await save(file, metadata);
    output({ key, removed: type });
  } else if (command === 'read-lexical') {
    expectPositionals(positional, 0);
    const verse = findSourceVerse(sourceBook, numberOption(options, 'chapter'), numberOption(options, 'verse'));
    const parsed = metadataService.parsePattern(metadata.patterns, language);
    const words = dataService.splitIntoMatrix(language, parsed, verse.text);
    const segments = words.flatMap(word => word.segments.map(segment => ({ ...segment, lexical: dataService.getLexical(metadata, language, segment.word, segment.morpheme) })));
    if (process.stdout.isTTY && !process.env['NO_COLOR']) {
      const colors = ['211;1;1', '236;106;0', '206;203;0', '77;187;5', '1;146;165', '59;0;168', '206;1;179'];
      for (const segment of segments) {
        const color = colors[segment.index % colors.length];
        const word = `\x1b[38;2;${color}m${segment.word}\x1b[0m`;
        const lexical = segment.lexical.value ? `\x1b[38;2;${color}m${segment.lexical.value}\x1b[0m\t${segment.morpheme}` : '<empty>';
        console.log(`${word}\t${lexical}`);
      }
    } else output(segments);
  } else if (['set-word-of-god', 'remove-word-of-god', 'clean-word-of-god', 'clean-verse-lexical'].includes(command)) {
    expectPositionals(positional, 0);
    const chapter = numberOption(options, 'chapter');
    const verse = numberOption(options, 'verse');
    const index = findSourceVerse(sourceBook, chapter, verse);
    const sourceVerse = sourceBook.chapters[index.chapterIndex].verses[index.verseIndex];
    const current = { book, chapter };
    const words = dataService.splitIntoMatrix(language, metadataService.parsePattern(metadata.patterns, language), sourceVerse.text);
    if (command === 'clean-word-of-god') {
      metadataService.cleanWordOfGodFromVerse(metadata, current, verse);
    } else if (command === 'clean-verse-lexical') {
      metadataService.cleanLexical(current, metadata, words, language);
    } else {
      const raw = required(options, 'segments').split(',');
      if (raw.some(value => !/^(0|[1-9]\d*)$/.test(value) || !Number.isSafeInteger(Number(value))) || new Set(raw).size !== raw.length) throw new Error('Invalid --segments list');
      const allSegments = words.flatMap(word => word.segments);
      const selected = raw.map(value => {
        const segment = allSegments.find(item => item.index === Number(value));
        if (!segment) throw new Error(`Unknown segment index: ${value}`);
        return segment;
      });
      for (const segment of selected) metadataService.setAsWordOfGod(command === 'set-word-of-god', metadata, language, current, sourceVerse, index.verseIndex, { segments: [segment] });
    }
    await save(file, metadata);
    output({ updated: command });
  } else if (command === 'clean-unused-lexical') {
    expectPositionals(positional, 0);
    const removed = cleanUnusedLexical(metadata, sourceBook, language, dataService, metadataService);
    await save(file, metadata);
    output({ removed });
  }
}

main().catch(error => {
  console.error(`scriptures-inspector: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
