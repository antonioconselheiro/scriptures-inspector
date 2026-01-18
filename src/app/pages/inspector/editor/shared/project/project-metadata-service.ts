import { Injectable } from '@angular/core';
import { CurrentVerseIndex } from '@domain/current-verse-index-model';
import { Language } from '@domain/language-model';
import { ParsedPatterns } from '@domain/parsed-patterns';
import { PatternsSerialized } from '@domain/patterns-serialized';
import { ProjectData2 } from '@domain/project-data-2-model';
import { ProjectStructureMetadataEditor } from '@domain/project-structure-metadata-editor-model';
import { ScriptureVerseMetadataWord } from '@domain/scripture-verse-metadata-word-model';
import { SourceVerse } from '@domain/source-verse-model';
import { WordSegment } from '@domain/word-segment-model';
import { SystemService } from '@shared/system/system-service';
import { ProjectDataService } from './project-data-service';
import { KeyMetadata } from '@domain/key-metadata-type';
import { BookMetadata } from '@domain/book-metadata-model';
import { LanguageUnionType } from '@domain/language-union-type';

@Injectable({
  providedIn: 'root'
})
export class ProjectMetadataService {

  constructor(
    private projectService: ProjectDataService,
    private systemService: SystemService
  ) { }

  createIfNotExistsWordMetadata(
    data: BookMetadata,
    sourceLanguage: LanguageUnionType,
    current: CurrentVerseIndex,
    verse: SourceVerse,
    segments: Array<WordSegment> = []
  ): {
    [key: string]: ScriptureVerseMetadataWord;
  } {
    //  TODO: isso não pode ficar aqui, a criação da estrutura base do metadata precisa vir antes da inserção dele via url,
    //  a criação aqui não poderá ser enxergada no contexto onde será salvo as alterações
    // if (!data[editor.target]) {
    //   data[editor.target] = {
    //     chapters: [],
    //     patterns: {
    //       prefix: [],
    //       suffix: []
    //     },
    //     lexical: {}
    //   };
    // }

    if (!data.chapters[current.chapter]) {
      data.chapters[current.chapter] = [];
    }

    if (!data.chapters[current.chapter][current.verseIndex]) {
      data.chapters[current.chapter][current.verseIndex] = {
        verse: verse.verse,
        metadata: {}
      }
    }

    const metadata = data.chapters[current.chapter][current.verseIndex].metadata || {};
    data.chapters[current.chapter][current.verseIndex].metadata = metadata;

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
    bookMetadata: BookMetadata,
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
    bookMetadata: BookMetadata,
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

    this.systemService.autoSaveCurrentProject();
  }

  cleanScriptureMetadata(
    data: BookMetadata,
    current: CurrentVerseIndex
  ): void {
    if (
      !data.chapters[current.chapter] ||
      !data.chapters[current.chapter][current.verseIndex]
    ) {
      return;
    }

    const metadata = data.chapters[current.chapter][current.verseIndex].metadata;
    if (!metadata) {
      return;
    }

    Object.keys(metadata).forEach(key => {
      metadata[key].kind = '';
    });

    this.systemService.autoSaveCurrentProject();
  }

  // word of God methods
  setAsWordOfGod(
    checked: boolean,
    bookMetadata: BookMetadata,
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

    this.systemService.autoSaveCurrentProject();
  }

  getScriptureMetadataWordOfGod(
    bookMetadata: BookMetadata,
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
    bookMetadata: BookMetadata,
    word: string,
    lexicalValue: string
  ): void {
    bookMetadata.lexical[word] = lexicalValue;
    this.systemService.autoSaveCurrentProject();
  }

  getLexical(
    data: { lexical: Record<string, string> },
    word: string
  ): string {
    return this.projectService.getLexical(data, word);
  }

  cleanLexicalInterlinear(
    bookMetadata: BookMetadata,
    eachWord: Array<Array<{ index: number; word: string; }>>
  ): void {
    eachWord.forEach(eachSegment => {
      eachSegment.forEach(segment => {
        delete bookMetadata.lexical[segment.word];
      });
    });

    this.systemService.autoSaveCurrentProject();
  }

  //
  isWordSegmentMetadataGuard(value: string): value is 'godname' | 'keyword' | 'character' | 'amount' {
    return ['godname', 'keyword', 'character', 'amount'].includes(value);
  }

  cleanWordOfGodFromVerse(
    bookMetadata: BookMetadata,
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

    this.systemService.autoSaveCurrentProject();
  }

  parsePattern(serialized: PatternsSerialized, language: Language): ParsedPatterns {
    const normalizedFn = language.normalizeFn ? language.normalizeFn : (t: string) => t;
    let prefix = new Map<string, RegExp>(serialized.prefix.map(pattern => [pattern, new RegExp(`^${normalizedFn(pattern)}`, 'u')]));
    let suffix = new Map<string, RegExp>(serialized.suffix.map(pattern => [pattern, new RegExp(`${normalizedFn(pattern)}$`, 'u')]));

    return { prefix, suffix }
  }


}
