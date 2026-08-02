import { Injectable } from '@angular/core';
import { BookMetadataAttributes } from '@domain/book-metadata-attributes-model';
import { BookMetadataTarget } from '@domain/book-metadata-target-model';
import { Book } from '@domain/book-model';
import { CurrentBook } from '@domain/current-book-model';
import { CurrentVerseIndex } from '@domain/current-verse-index-model';
import { Language } from '@domain/language-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { ParsedPatterns } from '@domain/parsed-patterns';
import { PatternsSerialized } from '@domain/patterns-serialized';
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
    private projectService: ProjectDataService,
    private systemService: SystemService
  ) { }

  createIfNotExistsWordMetadata(
    bookMetadata: BookMetadataTarget,
    sourceLanguage: LanguageUnionType,
    current: CurrentVerseIndex,
    verse: SourceVerse,
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

    if (!bookMetadata.chapters[chapterIndex].verses[current.verseIndex]) {
      bookMetadata.chapters[chapterIndex].verses[current.verseIndex] = {
        verse: verse.verse,
        metadata: {}
      }
    }

    const metadata = bookMetadata.chapters[chapterIndex].verses[current.verseIndex].metadata || {};
    bookMetadata.chapters[chapterIndex].verses[current.verseIndex].metadata = metadata;

    word.segments.forEach(segment => {
      const key = this.projectService.castSegmentIntoMetadataIndex(sourceLanguage, segment);
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
    current: CurrentVerseIndex,
    verse: SourceVerse,
    wordMatrix: Array<Word>,
    wordIndex: number
  ): void {
    const language = languageMetadataRecord[sourceLanguage];
    const wordMetadata = this.createIfNotExistsWordMetadata(bookMetadata, sourceLanguage, current, verse, wordMatrix[wordIndex]);
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
    current: CurrentVerseIndex,
    verse: SourceVerse,
    word: Word
  ): void {
    const wordMetadata = this.createIfNotExistsWordMetadata(bookMetadata, sourceLanguage, current, verse, word);
    word.segments.forEach(segment => {
      const key = this.projectService.castSegmentIntoMetadataIndex(sourceLanguage, segment);
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
    current: CurrentVerseIndex,
    word: Word
  ): boolean {
    const chapterIndex = bookMetadata.chapters.findIndex(chapter => chapter.chapter === current.chapter);

    if (
      !bookMetadata.chapters ||
      chapterIndex === this.indexNotFound ||
      !bookMetadata.chapters[chapterIndex] ||
      !bookMetadata.chapters[chapterIndex].verses[current.verseIndex]
    ) {
      return false;
    }

    const metadata = bookMetadata.chapters[chapterIndex].verses[current.verseIndex].metadata;
    if (!metadata || !word.segments[0]) {
      return false;
    }

    const segment = this.projectService.castSegmentIntoMetadataIndex(sourceLanguage, word.segments[0]);
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
    lexicalValue: string
  ): void {
    const normalizeFn = language.normalizeFn ? language.normalizeFn : (word: string) => word;
    bookMetadata.lexical[normalizeFn(word)] = lexicalValue;
    this.systemService.triggerSaveCurrentBookMetadata(current);
  }

  getLexical(
    data: Book<BookMetadataAttributes, any>,
    sourceLanguage: Language,
    word: string
  ): string {
    return this.projectService.getLexical(data, sourceLanguage, word);
  }

  cleanLexicalInterlinear(
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
    current: CurrentVerseIndex
  ): void {
    const chapterIndex = bookMetadata.chapters.findIndex(chapter => chapter.chapter === current.chapter);

    if (
      chapterIndex === this.indexNotFound ||
      !bookMetadata.chapters[chapterIndex] ||
      !bookMetadata.chapters[chapterIndex].verses[current.verseIndex]
    ) {
      return;
    }

    const metadata = bookMetadata.chapters[chapterIndex].verses[current.verseIndex].metadata;
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
