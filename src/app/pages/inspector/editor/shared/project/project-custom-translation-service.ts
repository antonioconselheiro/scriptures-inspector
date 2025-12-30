import { Injectable } from '@angular/core';
import { CodexBookChapterVerseMetadata } from '@domain/codex-book-chapter-verse-metadata-model';
import { CodexBookVerse } from '@domain/codex-book-verse-model';
import { Codex } from '@domain/codex-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { CustomTranslation } from '@domain/custom-translation-model';
import { CustomTranslationVerse } from '@domain/custom-translation-verse-model';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { ProjectData } from '@domain/project-data-model';
import { SourceVerse } from '@domain/source-verse-model';
import { TranslationInterlinear } from '@domain/translation-interlinear-model';
import { TranslationInterlinearVerse } from '@domain/translation-interlinear-verse-model';
import { SystemService } from '@shared/system/system-service';
import { ProjectService } from './project-service';

@Injectable({
  providedIn: 'root'
})
export class ProjectCustomTranslationService {

  constructor(
    private projectService: ProjectService,
    private systemService: SystemService
  ) { }

  private createCustomTranslationStructureIfNotExists(
    customTranslation: CustomTranslation,
    current: CurrentChapter,
    sourceVerse: SourceVerse
  ): string[] {
    if (!customTranslation[current.book]) {
      customTranslation[current.book] = {
        chapters: []
      };
    }

    if (!customTranslation[current.book].chapters[current.chapter]) {
      customTranslation[current.book].chapters[current.chapter] = [];
    }

    if (!customTranslation[current.book].chapters[current.chapter][sourceVerse.verse.index]) {
      customTranslation[current.book].chapters[current.chapter][sourceVerse.verse.index] = {
        ...sourceVerse
      };
    }

    const metadata = customTranslation[current.book].chapters[current.chapter][sourceVerse.verse.index].metadata || [];
    customTranslation[current.book].chapters[current.chapter][sourceVerse.verse.index].metadata = metadata;

    return metadata;
  }

  private derivateTranslationToCustom(
    data: ProjectData,
    parsedBookMetadata: ParsedBookMetadata,
    customTranslation: CustomTranslation,
    current: CurrentChapter,
    sourceVerse: SourceVerse
  ): void {
    this.createCustomTranslationStructureIfNotExists(customTranslation, current, sourceVerse);
    customTranslation[current.book].chapters[current.chapter][sourceVerse.verse.index].text = this.projectService.splitIntoMatrix(parsedBookMetadata, sourceVerse.text)
      .flat()
      .map(word => this.projectService.getLexical(data, current.book, word.word))
      .join(' ');

    this.systemService.autoSaveCurrentProject();
  }

  private derivateInterlinearToCustom(
    data: ProjectData,
    parsedBookMetadata: ParsedBookMetadata,
    customTranslation: CustomTranslation,
    current: CurrentChapter,
    sourceVerse: SourceVerse
  ): void {
    const metadata = this.createCustomTranslationStructureIfNotExists(customTranslation, current, sourceVerse);
    metadata.splice(0, metadata.length);
    const custom = customTranslation[current.book].chapters[current.chapter][sourceVerse.verse.index].text.split(' ');
    this.projectService.splitIntoMatrix(parsedBookMetadata, sourceVerse.text).flat().forEach(segment => {
      if (custom[segment.index] === this.projectService.getLexical(data, current.book,segment.word)) {
        metadata.push(this.projectService.castSegmentIntoMetadataIndex(data.lang.source, segment));
      }
    });

    this.systemService.autoSaveCurrentProject();
  }

  derivateAllToCustom(
    data: ProjectData,
    parsedBookMetadata: ParsedBookMetadata,
    customTranslation: CustomTranslation,
    current: CurrentChapter,
    sourceVerse: SourceVerse
  ): void {
    this.derivateTranslationToCustom(data, parsedBookMetadata, customTranslation, current, sourceVerse);
    setTimeout(() => this.derivateInterlinearToCustom(data, parsedBookMetadata, customTranslation, current, sourceVerse));
  }

  getCustomTranslationVerse(
    customTranslation: CustomTranslation, current: CurrentChapter, sourceVerse: SourceVerse
  ): CustomTranslationVerse | null {
    return customTranslation[current.book] &&
      customTranslation[current.book].chapters[current.chapter] &&
      customTranslation[current.book].chapters[current.chapter][sourceVerse.verse.index] || null;
  }

  updateCustomTranslation(
    input: HTMLInputElement,
    customTranslation: CustomTranslation,
    current: CurrentChapter,
    sourceVerse: SourceVerse
  ): void {
    this.createCustomTranslationStructureIfNotExists(customTranslation, current, sourceVerse);
    const chapter = customTranslation[current.book].chapters[current.chapter];

    if (chapter[sourceVerse.verse.index]) {
      if (input.value) {
        chapter[sourceVerse.verse.index].text = input.value;
      } else {
        chapter[sourceVerse.verse.index] = {
          ...sourceVerse,
          text: ''
        };
      }
    } else {
      chapter[sourceVerse.verse.index] = {
        ...sourceVerse,
        text: input.value
      };
    }

    this.systemService.autoSaveCurrentProject();
  }

  cleanCustomTranslation(
    input: HTMLInputElement,
    customTranslation: CustomTranslation,
    current: CurrentChapter,
    sourceVerse: SourceVerse
  ): void {
    input.value = '';

    if (
      !customTranslation[current.book] ||
      !customTranslation[current.book].chapters[current.chapter] ||
      !customTranslation[current.book].chapters[current.chapter][sourceVerse.verse.index]
    ) {
      return;
    }

    customTranslation[current.book].chapters[current.chapter][sourceVerse.verse.index] = {
      ...sourceVerse,
      metadata: [],
      text: ''
    };

    this.systemService.autoSaveCurrentProject();
  }

  getCustomTranslationColor(
    customTranslation: CustomTranslation,
    current: CurrentChapter,
    sourceVerse: SourceVerse,
    wordIndex: number
  ): string {
    if (
      !customTranslation[current.book] ||
      !customTranslation[current.book].chapters[current.chapter] ||
      !customTranslation[current.book].chapters[current.chapter][sourceVerse.verse.index]
    ) {
      return '';
    }

    const translationMetadata = customTranslation[current.book].chapters[current.chapter][sourceVerse.verse.index].metadata;
    if (!translationMetadata) {
      return '';
    }

    const matches = translationMetadata[wordIndex] && translationMetadata[wordIndex].match(/^\d+/);
    if (matches) {
      return String(Number(Array.from(matches)[0]) % 7 + 1);
    }

    return '';
  }

  getCustomTranslationStyleRole(
    data: ProjectData,
    translation: TranslationInterlinear | undefined,
    customTranslation: CustomTranslation,
    current: CurrentChapter,
    sourceVerse: SourceVerse,
    wordIndex: number
  ): string {
    let verseMetadata: CodexBookVerse<CodexBookChapterVerseMetadata> | null, customTranslationMetadataKey = '';

    if (translation) {
      let interlinearMetadata: Codex<object, Array<TranslationInterlinearVerse>> = {};
      let scriptureChapterMetadata: CodexBookVerse<CodexBookChapterVerseMetadata>[] = [];

      const translationMetadata = customTranslation[current.book] &&
        customTranslation[current.book].chapters[current.chapter] &&
        customTranslation[current.book].chapters[current.chapter][sourceVerse.verse.index]?.metadata?.[wordIndex] || '';

      scriptureChapterMetadata = data.metadata[current.book] && data.metadata[current.book].chapters[current.chapter] || [];
      interlinearMetadata = translation.codex;

      const [translationWordIndex] = Array.from(translationMetadata.match(/^\d+/) || ['']);
      if (!translationWordIndex) {
        return '';
      }

      const scriptureSegmentOrigin = interlinearMetadata[current.book].chapters[current.chapter][sourceVerse.verse.index][Number(translationWordIndex)]?.origin || null;
      if (!scriptureSegmentOrigin) {
        return '';
      }

      customTranslationMetadataKey = this.projectService.castSegmentIntoMetadataIndex(data.lang.source, scriptureSegmentOrigin);
      verseMetadata = scriptureChapterMetadata && scriptureChapterMetadata[sourceVerse.verse.index];
    } else {
      const scriptureChapterMetadata = data.metadata[current.book] && data.metadata[current.book].chapters[current.chapter] || [];
      verseMetadata = scriptureChapterMetadata[sourceVerse.verse.index] || null;
      const translationChapterMetadata = customTranslation[current.book].chapters[current.chapter] || [];
      customTranslationMetadataKey = ((translationChapterMetadata[sourceVerse.verse.index]?.metadata || [])?.[wordIndex] || '');
    }

    if (!verseMetadata || !customTranslationMetadataKey) {
      return '';
    }

    const metadata = verseMetadata.metadata || {};
    const dataObj = metadata[customTranslationMetadataKey];
    if (!dataObj) {
      return '';
    }

    return [dataObj.kind, dataObj.isWordOfGod ? 'godsaid' : ''].filter(t => t).map(d => `meta${d}`).join(' ');
  }

  getCustomTranslationInterlinearValue(
    customTranslation: CustomTranslation,
    current: CurrentChapter,
    sourceVerse: SourceVerse,
    wordIndex: number
  ): string {
    const chapter = customTranslation[current.book].chapters[current.chapter];
    if (chapter && chapter[sourceVerse.verse.index] && chapter[sourceVerse.verse.index].metadata) {
      const metadata = chapter[sourceVerse.verse.index].metadata;
      return metadata && metadata[wordIndex] || '';
    }

    return '';
  }

  saveCustomTranslationInterlinearMetadata(
    customTranslation: CustomTranslation,
    current: CurrentChapter,
    sourceVerse: SourceVerse,
    value: string,
    wordIndex: number
  ): void {
    const metadata = this.createCustomTranslationStructureIfNotExists(customTranslation, current, sourceVerse);
    metadata[wordIndex] = value;

    this.systemService.autoSaveCurrentProject();
  }

  cleanInterlinear(
    customTranslation: CustomTranslation,
    current: CurrentChapter,
    sourceVerse: SourceVerse
  ): void {
    if (
      !customTranslation[current.book] ||
      !customTranslation[current.book].chapters[current.chapter] ||
      !customTranslation[current.book].chapters[current.chapter][sourceVerse.verse.index]
    ) {
      return;
    }

    delete customTranslation[current.book].chapters[current.chapter][sourceVerse.verse.index].metadata;
  }
}
