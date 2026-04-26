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
import { WordSegment } from '@domain/word-segment-model';
import { SystemService } from '@shared/system/system-service';
import { ProjectDataService } from './project-data-service';

@Injectable({
  providedIn: 'root'
})
export class ProjectMetadataService {

  constructor(
    private projectService: ProjectDataService,
    private systemService: SystemService
  ) { }

  createIfNotExistsWordMetadata(
    bookMetadata: BookMetadataTarget,
    sourceLanguage: LanguageUnionType,
    current: CurrentVerseIndex,
    verse: SourceVerse,
    segments: Array<WordSegment> = []
  ): {
    [key: string]: ScriptureVerseMetadataWord;
  } {
    if (!bookMetadata.chapters[current.chapter]) {
      bookMetadata.chapters[current.chapter] = [];
    }

    if (!bookMetadata.chapters[current.chapter][current.verseIndex]) {
      bookMetadata.chapters[current.chapter][current.verseIndex] = {
        verse: verse.verse,
        metadata: {}
      }
    }

    const metadata = bookMetadata.chapters[current.chapter][current.verseIndex].metadata || {};
    bookMetadata.chapters[current.chapter][current.verseIndex].metadata = metadata;

    segments.forEach(segment => {
      const key = this.projectService.castSegmentIntoMetadataIndex(sourceLanguage, segment);
      if (!metadata[key]) {
        metadata[key] = {
          kind: '',
          segment: segment.word
        };
      }
    });

    return metadata;
  }

  //  source text metadata methods
  getScriptureMetadataDefinedKind(
    bookMetadata: BookMetadataTarget,
    sourceLanguage: LanguageUnionType,
    current: CurrentVerseIndex,
    segment: { index: number; word: string; }
  ): '' | 'godname' | 'keyword' | 'character' | 'amount' {
    if (
      !bookMetadata.chapters[current.chapter] ||
      !bookMetadata.chapters[current.chapter][current.verseIndex]
    ) {
      return '';
    }

    const metadata = bookMetadata.chapters[current.chapter][current.verseIndex].metadata;
    if (!metadata) {
      return '';
    }

    const metadataKey = this.projectService.castSegmentIntoMetadataIndex(sourceLanguage, segment)
    if (!metadata[metadataKey]) {
      return '';
    }

    return metadata[metadataKey].kind;
  }

  updateScripturesMetadata(
    bookMetadata: BookMetadataTarget,
    sourceLanguage: LanguageUnionType,
    current: CurrentVerseIndex,
    kind: string,
    verse: SourceVerse,
    segment: { index: number; word: string; }
  ): void {
    const wordMetadata = this.createIfNotExistsWordMetadata(bookMetadata, sourceLanguage, current, verse, [segment]);
    const metadataIndex = this.projectService.castSegmentIntoMetadataIndex(sourceLanguage, segment);

    if (this.isWordSegmentMetadataGuard(kind)) {
      wordMetadata[metadataIndex].kind = kind;
    } else {
      if (wordMetadata[metadataIndex].isWordOfGod) {
        wordMetadata[metadataIndex].kind = '';
      } else {
        delete wordMetadata[metadataIndex];
      }
    }

    this.systemService.triggerSaveCurrentBookMetadata(current);
  }

  cleanScriptureMetadata(
    bookMetadata: BookMetadataTarget,
    current: CurrentVerseIndex
  ): void {
    if (
      !bookMetadata.chapters[current.chapter] ||
      !bookMetadata.chapters[current.chapter][current.verseIndex]
    ) {
      return;
    }

    const metadata = bookMetadata.chapters[current.chapter][current.verseIndex].metadata;
    if (!metadata) {
      return;
    }

    Object.keys(metadata).forEach(key => {
      metadata[key].kind = '';
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
    segments: Array<WordSegment>
  ): void {
    const wordMetadata = this.createIfNotExistsWordMetadata(bookMetadata, sourceLanguage, current, verse, segments);
    segments.forEach(segment => {
      const key = this.projectService.castSegmentIntoMetadataIndex(sourceLanguage, segment);
      if (checked) {
        wordMetadata[key].isWordOfGod = true;
      } else {
        delete wordMetadata[key].isWordOfGod;
      }
    });

    this.systemService.triggerSaveCurrentBookMetadata(current);
  }

  getScriptureMetadataWordOfGod(
    bookMetadata: BookMetadataTarget,
    sourceLanguage: LanguageUnionType,
    current: CurrentVerseIndex,
    segments: Array<WordSegment>
  ): boolean {
    if (
      !bookMetadata.chapters ||
      !bookMetadata.chapters[current.chapter] ||
      !bookMetadata.chapters[current.chapter][current.verseIndex]
    ) {
      return false;
    }

    const metadata = bookMetadata.chapters[current.chapter][current.verseIndex].metadata;
    if (!metadata || !segments[0]) {
      return false;
    }

    const segment = this.projectService.castSegmentIntoMetadataIndex(sourceLanguage, segments[0]);
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
    eachWord: Array<Array<{ index: number; word: string; }>>
  ): void {
    eachWord.forEach(eachSegment => {
      eachSegment.forEach(segment => {
        delete bookMetadata.lexical[segment.word];
      });
    });

    this.systemService.triggerSaveCurrentBookMetadata(current);
  }

  //
  isWordSegmentMetadataGuard(value: string): value is 'godname' | 'keyword' | 'character' | 'amount' {
    return ['godname', 'keyword', 'character', 'amount'].includes(value);
  }

  cleanWordOfGodFromVerse(
    bookMetadata: BookMetadataTarget,
    current: CurrentVerseIndex
  ): void {
    if (
      !bookMetadata.chapters[current.chapter] ||
      !bookMetadata.chapters[current.chapter][current.verseIndex]
    ) {
      return;
    }


    const metadata = bookMetadata.chapters[current.chapter][current.verseIndex].metadata;
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
