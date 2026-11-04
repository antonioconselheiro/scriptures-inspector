import { BookMetadataTarget } from '@domain/book-metadata-target-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { Word } from '@domain/word-model';
import { SystemService } from '@shared/system/system-service';
import { ProjectDataService } from './project-data-service';
import { ProjectMetadataService } from './project-metadata-service';

describe('ProjectMetadataService', () => {
  let dataService: jasmine.SpyObj<ProjectDataService>;
  let metadataService: ProjectMetadataService;

  beforeEach(() => {
    dataService = jasmine.createSpyObj<ProjectDataService>(
      'ProjectDataService',
      ['castSegmentIntoMetadataIndexSerialized']
    );
    dataService.castSegmentIntoMetadataIndexSerialized.and.callFake((_language, segment) =>
      `${segment.index}-${segment.word}`
    );

    const systemService = jasmine.createSpyObj<SystemService>(
      'SystemService',
      ['triggerSaveCurrentBookMetadata']
    );
    metadataService = new ProjectMetadataService(dataService, systemService);
  });

  it('recognizes word-of-God metadata on any segment of a word', () => {
    const verses: BookMetadataTarget['chapters'][number]['verses'] = [];
    verses[4] = {
      verse: 1,
      metadata: {
        '1-second': { segment: 'second', isWordOfGod: true }
      }
    };
    const bookMetadata = {
      patterns: { prefix: [], suffix: [], lexeme: [] },
      lexical: {},
      chapters: [{
        chapter: 1,
        verses
      }]
    } as BookMetadataTarget;
    const current: CurrentChapter = { book: 'GEN', chapter: 1 };
    const word: Word = {
      segments: [
        { index: 0, word: 'first', morpheme: 'prefix' },
        { index: 1, word: 'second', morpheme: 'root' }
      ]
    };

    expect(metadataService.getScriptureMetadataWordOfGod(
      bookMetadata,
      'geez',
      current,
      1,
      word
    )).toBeTrue();
  });

  it('updates the matching verse record instead of relying on its array index', () => {
    const verses: BookMetadataTarget['chapters'][number]['verses'] = [];
    verses[4] = { verse: 1, metadata: {} };
    const bookMetadata = {
      patterns: { prefix: [], suffix: [], lexeme: [] },
      lexical: {},
      chapters: [{ chapter: 1, verses }]
    } as BookMetadataTarget;
    const current: CurrentChapter = { book: 'GEN', chapter: 1 };
    const sourceVerse = { verse: 1, text: 'word' };
    const word: Word = {
      segments: [{ index: 0, word: 'word', morpheme: 'root' }]
    };

    metadataService.setAsWordOfGod(
      true,
      bookMetadata,
      'geez',
      current,
      sourceVerse,
      0,
      word
    );

    expect(verses.length).toBe(5);
    expect(metadataService.getScriptureMetadataWordOfGod(
      bookMetadata,
      'geez',
      current,
      sourceVerse.verse,
      word
    )).toBeTrue();
  });

  it('cleans word-of-God metadata from the matching verse record', () => {
    const verses: BookMetadataTarget['chapters'][number]['verses'] = [];
    verses[4] = {
      verse: 1,
      metadata: {
        '0-word': { segment: 'word', isWordOfGod: true }
      }
    };
    const bookMetadata = {
      patterns: { prefix: [], suffix: [], lexeme: [] },
      lexical: {},
      chapters: [{ chapter: 1, verses }]
    } as BookMetadataTarget;

    metadataService.cleanWordOfGodFromVerse(
      bookMetadata,
      { book: 'GEN', chapter: 1 },
      1
    );

    expect(verses[4].metadata?.['0-word'].isWordOfGod).toBeUndefined();
  });
});
