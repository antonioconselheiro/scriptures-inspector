import { Injectable } from '@angular/core';
import { BookChapterVerseMetadata } from '@domain/book-chapter-verse-metadata-model';
import { BookInterlinearTarget } from '@domain/book-interlinear-target-model';
import { BookMetadataTarget } from '@domain/book-metadata-target-model';
import { BookTranslationTarget } from '@domain/book-translation-target-model';
import { BookVerse } from '@domain/book-verse-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { CustomTranslationVerse } from '@domain/custom-translation-verse-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { SourceVerse } from '@domain/source-verse-model';
import { SystemService } from '@shared/system/system-service';
import { ProjectDataService } from './project-data-service';

@Injectable({
  providedIn: 'root'
})
export class ProjectCustomTranslationService {

  constructor(
    private projectService: ProjectDataService,
    private systemService: SystemService
  ) { }

  private createCustomTranslationStructureIfNotExists(
    customTranslation: BookTranslationTarget,
    current: CurrentChapter,
    sourceVerse: SourceVerse
  ): string[] {
    if (!customTranslation.chapters[current.chapter]) {
      customTranslation.chapters[current.chapter] = [];
    }

    if (!customTranslation.chapters[current.chapter][sourceVerse.verse.index]) {
      customTranslation.chapters[current.chapter][sourceVerse.verse.index] = {
        ...sourceVerse
      };
    }

    const metadata = customTranslation.chapters[current.chapter][sourceVerse.verse.index].metadata || [];
    customTranslation.chapters[current.chapter][sourceVerse.verse.index].metadata = metadata;

    return metadata;
  }

  private derivateTranslationToCustom(
    parsedBookMetadata: ParsedBookMetadata,
    customTranslation: BookTranslationTarget,
    current: CurrentChapter,
    sourceVerse: SourceVerse
  ): void {
    this.createCustomTranslationStructureIfNotExists(customTranslation, current, sourceVerse);
    customTranslation.chapters[current.chapter][sourceVerse.verse.index].text = this.projectService.splitIntoMatrix(parsedBookMetadata, sourceVerse.text)
      .flat()
      .map(word => this.projectService.getLexical(parsedBookMetadata, word.word))
      .join(' ');

    this.systemService.triggerSaveCurrentBook(current);
  }

  private derivateInterlinearToCustom(
    translationSourceLanguage: LanguageUnionType,
    parsedBookMetadata: ParsedBookMetadata,
    customTranslation: BookTranslationTarget,
    current: CurrentChapter,
    sourceVerse: SourceVerse
  ): void {
    const metadata = this.createCustomTranslationStructureIfNotExists(customTranslation, current, sourceVerse);
    metadata.splice(0, metadata.length);
    const custom = customTranslation.chapters[current.chapter][sourceVerse.verse.index].text.split(' ');
    this.projectService.splitIntoMatrix(parsedBookMetadata, sourceVerse.text).flat().forEach(segment => {
      if (custom[segment.index] === this.projectService.getLexical(parsedBookMetadata, segment.word)) {
        metadata.push(this.projectService.castSegmentIntoMetadataIndex(translationSourceLanguage, segment));
      }
    });

    this.systemService.triggerSaveCurrentBook(current);
  }

  derivateAllToCustom(
    translationSourceLanguage: LanguageUnionType,
    parsedBookMetadata: ParsedBookMetadata,
    customTranslation: BookTranslationTarget,
    current: CurrentChapter,
    sourceVerse: SourceVerse
  ): void {
    this.derivateTranslationToCustom(parsedBookMetadata, customTranslation, current, sourceVerse);
    setTimeout(() => this.derivateInterlinearToCustom(translationSourceLanguage, parsedBookMetadata, customTranslation, current, sourceVerse));
  }

  getCustomTranslationVerse(
    customTranslation: BookTranslationTarget, current: CurrentChapter, sourceVerse: SourceVerse
  ): CustomTranslationVerse | null {
    return customTranslation.chapters[current.chapter] &&
      customTranslation.chapters[current.chapter][sourceVerse.verse.index] || null;
  }

  updateCustomTranslation(
    input: HTMLInputElement,
    customTranslation: BookTranslationTarget,
    current: CurrentChapter,
    sourceVerse: SourceVerse
  ): void {
    this.createCustomTranslationStructureIfNotExists(customTranslation, current, sourceVerse);
    const chapter = customTranslation.chapters[current.chapter];

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

    this.systemService.triggerSaveCurrentBook(current);
  }

  cleanCustomTranslation(
    input: HTMLInputElement,
    customTranslation: BookTranslationTarget,
    current: CurrentChapter,
    sourceVerse: SourceVerse
  ): void {
    input.value = '';

    if (
      !customTranslation.chapters[current.chapter] ||
      !customTranslation.chapters[current.chapter][sourceVerse.verse.index]
    ) {
      return;
    }

    customTranslation.chapters[current.chapter][sourceVerse.verse.index] = {
      ...sourceVerse,
      metadata: [],
      text: ''
    };

    this.systemService.triggerSaveCurrentBook(current);
  }

  getCustomTranslationColor(
    customTranslation: BookTranslationTarget,
    current: CurrentChapter,
    sourceVerse: SourceVerse,
    wordIndex: number
  ): string {
    if (
      !customTranslation.chapters[current.chapter] ||
      !customTranslation.chapters[current.chapter][sourceVerse.verse.index]
    ) {
      return '';
    }

    const translationMetadata = customTranslation.chapters[current.chapter][sourceVerse.verse.index].metadata;
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
    translationSourceLanguage: LanguageUnionType,
    bookMetadata: BookMetadataTarget,
    translation: BookInterlinearTarget | undefined,
    customTranslation: BookTranslationTarget,
    current: CurrentChapter,
    sourceVerse: SourceVerse,
    wordIndex: number
  ): string {
    let verseMetadata: BookVerse<BookChapterVerseMetadata> | null, customTranslationMetadataKey = '';

    if (translation) {
      let scriptureChapterMetadata: BookVerse<BookChapterVerseMetadata>[] = [];

      const translationMetadata = customTranslation.chapters[current.chapter] &&
        customTranslation.chapters[current.chapter][sourceVerse.verse.index]?.metadata?.[wordIndex] || '';

      scriptureChapterMetadata = bookMetadata.chapters[current.chapter] || [];

      const [translationWordIndex] = Array.from(translationMetadata.match(/^\d+/) || ['']);
      if (!translationWordIndex) {
        return '';
      }

      const scriptureSegmentOrigin = translation.chapters[current.chapter][sourceVerse.verse.index][Number(translationWordIndex)]?.origin || null;
      if (!scriptureSegmentOrigin) {
        return '';
      }

      customTranslationMetadataKey = this.projectService.castSegmentIntoMetadataIndex(translationSourceLanguage, scriptureSegmentOrigin);
      verseMetadata = scriptureChapterMetadata && scriptureChapterMetadata[sourceVerse.verse.index];
    } else {
      const scriptureChapterMetadata = bookMetadata.chapters[current.chapter] || [];
      verseMetadata = scriptureChapterMetadata[sourceVerse.verse.index] || null;
      const translationChapterMetadata = customTranslation.chapters[current.chapter] || [];
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
    customTranslation: BookTranslationTarget,
    current: CurrentChapter,
    sourceVerse: SourceVerse,
    wordIndex: number
  ): string {
    const chapter = customTranslation.chapters[current.chapter];
    if (chapter && chapter[sourceVerse.verse.index] && chapter[sourceVerse.verse.index].metadata) {
      const metadata = chapter[sourceVerse.verse.index].metadata;
      return metadata && metadata[wordIndex] || '';
    }

    return '';
  }

  saveCustomTranslationInterlinearMetadata(
    customTranslation: BookTranslationTarget,
    current: CurrentChapter,
    sourceVerse: SourceVerse,
    value: string,
    wordIndex: number
  ): void {
    const metadata = this.createCustomTranslationStructureIfNotExists(customTranslation, current, sourceVerse);
    metadata[wordIndex] = value;

    this.systemService.triggerSaveCurrentBook(current);
  }

  cleanInterlinear(
    customTranslation: BookTranslationTarget,
    current: CurrentChapter,
    sourceVerse: SourceVerse
  ): void {
    if (
      !customTranslation.chapters[current.chapter] ||
      !customTranslation.chapters[current.chapter][sourceVerse.verse.index]
    ) {
      return;
    }

    delete customTranslation.chapters[current.chapter][sourceVerse.verse.index].metadata;
  }
}
