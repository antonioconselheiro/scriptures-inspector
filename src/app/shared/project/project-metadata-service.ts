import { Injectable } from '@angular/core';
import { CurrentVerseIndex } from '@domain/current-verse-index-model';
import { Language } from '@domain/language-model';
import { ParsedPatterns } from '@domain/parsed-patterns';
import { PatternsSerialized } from '@domain/patterns-serialized';
import { ProjectData } from '@domain/project-data-model';
import { ScriptureVerseMetadataWord } from '@domain/scripture-verse-metadata-word-model';
import { SourceVerse } from '@domain/source-verse-model';
import { WordSegment } from '@domain/word-segment-model';
import { SystemService } from '@shared/system/system-service';
import { ProjectService } from './project-service';

@Injectable({
  providedIn: 'root'
})
export class ProjectMetadataService {

  constructor(
    private projectService: ProjectService,
    private systemService: SystemService
  ) { }

  createIfNotExistsWordMetadata(
    data: ProjectData,
    current: CurrentVerseIndex,
    verse: SourceVerse,
    segments: Array<WordSegment> = []
  ): {
    [key: string]: ScriptureVerseMetadataWord;
  } {
    if (!data.metadata[current.book]) {
      data.metadata[current.book] = {
        chapters: [],
        patterns: {
          prefix: [],
          suffix: []
        },
        lexical: {}
      };
    }

    if (!data.metadata[current.book].chapters[current.chapter]) {
      data.metadata[current.book].chapters[current.chapter] = [];
    }

    if (!data.metadata[current.book].chapters[current.chapter][current.verseIndex]) {
      data.metadata[current.book].chapters[current.chapter][current.verseIndex] = {
        verse: verse.verse,
        metadata: {}
      }
    }

    const metadata = data.metadata[current.book].chapters[current.chapter][current.verseIndex].metadata || {};
    data.metadata[current.book].chapters[current.chapter][current.verseIndex].metadata = metadata;

    segments.forEach(segment => {
      const key = this.projectService.castSegmentIntoMetadataIndex(data, segment);
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
    data: ProjectData,
    current: CurrentVerseIndex,
    segment: { index: number; word: string; }
  ): '' | 'godname' | 'keyword' | 'character' | 'amount' {
    if (
      !data.metadata[current.book] ||
      !data.metadata[current.book].chapters[current.chapter] ||
      !data.metadata[current.book].chapters[current.chapter][current.verseIndex]
    ) {
      return '';
    }

    const metadata = data.metadata[current.book].chapters[current.chapter][current.verseIndex].metadata;
    if (!metadata) {
      return '';
    }

    const metadataKey = this.projectService.castSegmentIntoMetadataIndex(data, segment)
    if (!metadata[metadataKey]) {
      return '';
    }

    return metadata[metadataKey].kind;
  }

  updateScripturesMetadata(
    data: ProjectData,
    current: CurrentVerseIndex,
    kind: string,
    verse: SourceVerse,
    segment: { index: number; word: string; }
  ): void {
    const wordMetadata = this.createIfNotExistsWordMetadata(data, current, verse, [segment]);
    const metadataIndex = this.projectService.castSegmentIntoMetadataIndex(data, segment);

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
    data: ProjectData,
    current: CurrentVerseIndex
  ): void {
    if (
      !data.metadata[current.book] ||
      !data.metadata[current.book].chapters[current.chapter] ||
      !data.metadata[current.book].chapters[current.chapter][current.verseIndex]
    ) {
      return;
    }

    const metadata = data.metadata[current.book].chapters[current.chapter][current.verseIndex].metadata;
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
    data: ProjectData,
    current: CurrentVerseIndex,
    verse: SourceVerse,
    segments: Array<WordSegment>
  ): void {
    const wordMetadata = this.createIfNotExistsWordMetadata(data, current, verse, segments);
    segments.forEach(segment => {
      const key = this.projectService.castSegmentIntoMetadataIndex(data, segment);
      if (checked) {
        wordMetadata[key].isWordOfGod = true;
      } else {
        delete wordMetadata[key].isWordOfGod;
      }
    });

    this.systemService.autoSaveCurrentProject();
  }

  getScriptureMetadataWordOfGod(
    project: ProjectData,
    current: CurrentVerseIndex,
    segments: Array<WordSegment>
  ): boolean {
    if (
      !project.metadata[current.book] ||
      !project.metadata[current.book].chapters ||
      !project.metadata[current.book].chapters[current.chapter] ||
      !project.metadata[current.book].chapters[current.chapter][current.verseIndex]
    ) {
      return false;
    }

    const metadata = project.metadata[current.book].chapters[current.chapter][current.verseIndex].metadata;
    if (!metadata || !segments[0]) {
      return false;
    }

    const segment = this.projectService.castSegmentIntoMetadataIndex(project, segments[0]);
    const data = metadata[segment];
    if (!data) {
      return false;
    }

    return data.isWordOfGod || false;
  }

  //
  updateLexical(
    project: ProjectData,
    book: string,
    word: string,
    lexicalValue: string
  ): void {
    project.metadata[book].lexical[word] = lexicalValue;
    this.systemService.autoSaveCurrentProject();
  }

  getLexical(
    project: ProjectData,
    book: string,
    word: string,
  ): string {
    return project.metadata[book].lexical[word] || '';
  }

  cleanLexicalInterlinear(
    project: ProjectData,
    book: string,
    eachWord: Array<Array<{ index: number; word: string; }>>
  ): void {
    eachWord.forEach(eachSegment => {
      eachSegment.forEach(segment => {
        delete project.metadata[book].lexical[segment.word];
      });
    });

    this.systemService.autoSaveCurrentProject();
  }

  //
  isWordSegmentMetadataGuard(value: string): value is 'godname' | 'keyword' | 'character' | 'amount' {
    return ['godname', 'keyword', 'character', 'amount'].includes(value);
  }

  cleanWordOfGodFromVerse(data: ProjectData, current: CurrentVerseIndex): void {
    if (
      !data.metadata[current.book] ||
      !data.metadata[current.book].chapters[current.chapter] ||
      !data.metadata[current.book].chapters[current.chapter][current.verseIndex]
    ) {
      return;
    }


    const metadata = data.metadata[current.book].chapters[current.chapter][current.verseIndex].metadata;
    if (!metadata) {
      return;
    }

    Object.keys(metadata).forEach(key => {
      delete metadata[key].isWordOfGod;
    });

    this.systemService.autoSaveCurrentProject();
  }

  parsePattern(serialized: PatternsSerialized, lang: Language): ParsedPatterns {
    const normalizedFn = lang.normalizeFn ? lang.normalizeFn : (t: string) => t;
    let prefix = new Map<string, RegExp>(serialized.prefix.map(pattern => [pattern, new RegExp(`^${normalizedFn(pattern)}`, 'u')]));
    let suffix = new Map<string, RegExp>(serialized.suffix.map(pattern => [pattern, new RegExp(`${normalizedFn(pattern)}$`, 'u')]));

    return { prefix, suffix }
  }


}
