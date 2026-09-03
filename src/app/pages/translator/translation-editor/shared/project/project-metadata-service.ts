import { Injectable } from '@angular/core';
import { BookMetadataAttributes } from '@domain/book-metadata-attributes-model';
import { BookMetadataTarget } from '@domain/book-metadata-target-model';
import { Book } from '@domain/book-model';
import { CurrentBook } from '@domain/current-book-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { Language } from '@domain/language-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { ParsedPatterns } from '@domain/parsed-patterns-model';
import { PatternsSerialized } from '@domain/patterns-serialized-model';
import { ScriptureVerseMetadataWord } from '@domain/scripture-verse-metadata-word-model';
import { SourceVerse } from '@domain/source-verse-model';
import { Word } from '@domain/word-model';
import { languageMetadataRecord } from '@shared/language-metadata/language-metadata-record';
import { SystemService } from '@shared/system/system-service';
import { ProjectDataService } from './project-data-service';

@Injectable({
  providedIn: 'root'
})
export class ProjectMetadataService {

  private readonly indexNotFound = -1;

  constructor(
    private dataService: ProjectDataService,
    private systemService: SystemService
  ) { }

  createWordMetadataIfNotExists(
    bookMetadata: BookMetadataTarget,
    sourceLanguage: LanguageUnionType,
    current: CurrentChapter,
    verse: SourceVerse,
    verseIndex: number,
    word: Word
  ): {
    [key: string]: ScriptureVerseMetadataWord;
  } {
    const chapterIndex = bookMetadata.chapters.findIndex(chapter => chapter.chapter === current.chapter);
    if (chapterIndex === this.indexNotFound || !bookMetadata.chapters[chapterIndex]) {
      bookMetadata.chapters[chapterIndex] = {
        chapter: current.chapter,
        verses: []
      };
    }

    if (!bookMetadata.chapters[chapterIndex].verses[verseIndex]) {
      bookMetadata.chapters[chapterIndex].verses[verseIndex] = {
        verse: verse.verse,
        metadata: {}
      }
    }

    const metadata = bookMetadata.chapters[chapterIndex].verses[verseIndex].metadata || {};
    bookMetadata.chapters[chapterIndex].verses[verseIndex].metadata = metadata;

    word.segments.forEach(segment => {
      const key = this.dataService.castSegmentIntoMetadataIndexSerialized(sourceLanguage, segment);
      if (!metadata[key]) {
        metadata[key] = {
          segment: segment.word
        };
      }
    });

    return metadata;
  }

  removeUnusedMetadata(
    bookMetadata: BookMetadataTarget,
    sourceLanguage: LanguageUnionType,
    current: CurrentChapter,
    verse: SourceVerse,
    verseIndex: number,
    wordMatrix: Array<Word>,
    wordIndex: number
  ): void {
    const language = languageMetadataRecord[sourceLanguage];
    const wordMetadata = this.createWordMetadataIfNotExists(bookMetadata, sourceLanguage, current, verse, verseIndex, wordMatrix[wordIndex]);
    const keys: Array<string> = [];

    wordMatrix.forEach(word => {
      word.segments.forEach(segment => {
        keys.push(`${segment.index}-${language.normalizeFn && language.normalizeFn(segment.word) || segment.word}`);
      });
    });

    Object.keys(wordMetadata).forEach(key => {
      if (!keys.includes(key)) {
        delete wordMetadata[key];
      }
    });

    this.systemService.triggerSaveCurrentBookMetadata(current);
  }

  // word of God methods
  setAsWordOfGod(
    checked: boolean,
    bookMetadata: BookMetadataTarget,
    sourceLanguage: LanguageUnionType,
    current: CurrentChapter,
    verse: SourceVerse,
    verseIndex: number,
    word: Word
  ): void {
    const wordMetadata = this.createWordMetadataIfNotExists(bookMetadata, sourceLanguage, current, verse, verseIndex, word);
    word.segments.forEach(segment => {
      const key = this.dataService.castSegmentIntoMetadataIndexSerialized(sourceLanguage, segment);
      if (checked) {
        wordMetadata[key].isWordOfGod = true;
      } else {
        delete wordMetadata[key];
      }
    });

    this.systemService.triggerSaveCurrentBookMetadata(current);
  }

  getScriptureMetadataWordOfGod(
    bookMetadata: BookMetadataTarget,
    sourceLanguage: LanguageUnionType,
    current: CurrentChapter,
    verseIndex: number,
    word: Word
  ): boolean {
    const chapterIndex = bookMetadata.chapters.findIndex(chapter => chapter.chapter === current.chapter);

    if (
      !bookMetadata.chapters ||
      chapterIndex === this.indexNotFound ||
      !bookMetadata.chapters[chapterIndex] ||
      !bookMetadata.chapters[chapterIndex].verses[verseIndex]
    ) {
      return false;
    }

    const metadata = bookMetadata.chapters[chapterIndex].verses[verseIndex].metadata;
    if (!metadata || !word.segments[0]) {
      return false;
    }

    const segment = this.dataService.castSegmentIntoMetadataIndexSerialized(sourceLanguage, word.segments[0]);
    const segmentData = metadata[segment];
    if (!segmentData) {
      return false;
    }

    return segmentData.isWordOfGod || false;
  }

  //
  updateLexical(
    current: CurrentBook,
    bookMetadata: Book<BookMetadataAttributes, any>,
    language: Language,
    word: string,
    lexicalValue: string,
    morphemeConfigured: 'common' | 'prefix' | 'suffix'
  ): void {
    const normalizeFn = language.normalizeFn ? language.normalizeFn : (word: string) => word;
    const normalizedKey = normalizeFn(word);

    if (morphemeConfigured === 'common') {
      if (!bookMetadata.lexical[normalizedKey]) {
        if (lexicalValue.length) {
          bookMetadata.lexical[normalizedKey] = { value: lexicalValue };
        }
      } else {
        if (lexicalValue.length) {
          bookMetadata.lexical[normalizedKey].value = lexicalValue;
        } else {
          delete bookMetadata.lexical[normalizedKey].value;
          if (Object.keys(bookMetadata.lexical[normalizedKey]).length === 0) {
            delete bookMetadata.lexical[normalizedKey];
          }
        }
      }
    } else if (morphemeConfigured === 'prefix') {
      if (!bookMetadata.lexical[normalizedKey]) {
        bookMetadata.lexical[normalizedKey] = { prefix: lexicalValue };
      } else {
        bookMetadata.lexical[normalizedKey].prefix = lexicalValue;
      }
    } else if (morphemeConfigured === 'suffix') {
      if (!bookMetadata.lexical[normalizedKey]) {
        bookMetadata.lexical[normalizedKey] = { suffix: lexicalValue };
      } else {
        bookMetadata.lexical[normalizedKey].suffix = lexicalValue;
      }
    }

    this.systemService.triggerSaveCurrentBookMetadata(current);
  }

  cleanLexical(
    current: CurrentBook,
    bookMetadata: Book<BookMetadataAttributes, any>,
    wordMatrix: Array<Word>
  ): void {
    wordMatrix.forEach(word => {
      word.segments.forEach(segment => {
        delete bookMetadata.lexical[segment.word];
      });
    });

    this.systemService.triggerSaveCurrentBookMetadata(current);
  }

  cleanWordOfGodFromVerse(
    bookMetadata: BookMetadataTarget,
    current: CurrentChapter,
    verseIndex: number
  ): void {
    const chapterIndex = bookMetadata.chapters.findIndex(chapter => chapter.chapter === current.chapter);

    if (
      chapterIndex === this.indexNotFound ||
      !bookMetadata.chapters[chapterIndex] ||
      !bookMetadata.chapters[chapterIndex].verses[verseIndex]
    ) {
      return;
    }

    const metadata = bookMetadata.chapters[chapterIndex].verses[verseIndex].metadata;
    if (!metadata) {
      return;
    }

    Object.keys(metadata).forEach(key => {
      delete metadata[key].isWordOfGod;
    });

    this.systemService.triggerSaveCurrentBookMetadata(current);
  }

  parsePattern(serialized: PatternsSerialized, language: Language): ParsedPatterns {
    const prefetchMatcherFn = language.prefetchMatcherFn ? language.prefetchMatcherFn : (t: string) => t;
    const prefix = new Map<string, RegExp>(serialized.prefix.map(pattern => [pattern, new RegExp(`^${prefetchMatcherFn(pattern)}`, 'u')]));
    const suffix = new Map<string, RegExp>(serialized.suffix.map(pattern => [pattern, new RegExp(`${prefetchMatcherFn(pattern)}$`, 'u')]));
    const lexeme = new Map<string, RegExp>(serialized.lexeme.map(pattern => [pattern, new RegExp(`^${prefetchMatcherFn(pattern)}$`, 'u')]));

    return { prefix, suffix, lexeme }
  }
}
