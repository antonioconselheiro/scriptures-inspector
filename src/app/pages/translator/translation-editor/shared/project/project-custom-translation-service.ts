import { Injectable } from '@angular/core';
import { BookChapterVerseMetadata } from '@domain/book-chapter-verse-metadata-model';
import { BookInterlinearTarget } from '@domain/book-interlinear-target-model';
import { BookMetadataTarget } from '@domain/book-metadata-target-model';
import { BookTranslationTargetMetadata } from '@domain/book-translation-target-metadata-model';
import { BookTranslationTarget } from '@domain/book-translation-target-model';
import { BookVerse } from '@domain/book-verse-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { Language } from '@domain/language-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { SourceVerse } from '@domain/source-verse-model';
import { WordFragment } from '@domain/word-fragment-model';
import { SystemService } from '@shared/system/system-service';
import { ProjectDataService } from './project-data-service';
import { BookVerseTranslationTarget } from '@domain/book-verse-translation-target-model';
import { BookVerseTranslationTargetVariations } from '@domain/book-verse-translation-target-variations-model';

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
  ): Array<BookTranslationTargetMetadata> {
    const verseIndex = this.getVerseIndex(sourceVerse);
    if (!customTranslation.chapters[current.chapter]) {
      customTranslation.chapters[current.chapter] = [];
    }

    if (!customTranslation.chapters[current.chapter][verseIndex]) {
      customTranslation.chapters[current.chapter][verseIndex] = this.factoryCustomTranslationVerse(sourceVerse);
    }

    const metadata = customTranslation.chapters[current.chapter][verseIndex].metadata || [];
    customTranslation.chapters[current.chapter][verseIndex].metadata = metadata;

    return metadata;
  }

  private derivateTranslationToCustom(
    parsedBookMetadata: ParsedBookMetadata,
    customTranslation: BookTranslationTarget,
    current: CurrentChapter,
    sourceLanguage: Language,
    sourceVerse: SourceVerse
  ): void {
    this.createCustomTranslationStructureIfNotExists(customTranslation, current, sourceVerse);
    const verseIndex = this.getVerseIndex(sourceVerse);
    const customVerse = customTranslation.chapters[current.chapter][verseIndex];
    const lexicalList = this.projectService
      .splitIntoMatrix(parsedBookMetadata, sourceVerse.text)
      .flat()
      .map(word => this.projectService.getLexical(parsedBookMetadata, sourceLanguage, word.word))

    customVerse.text = lexicalList.join(' ').replace(/ {2,}/g, ' ');
    customVerse.metadata = lexicalList.map(lexical => { return { size: lexical.length, value: '' } });

    this.systemService.triggerSaveCurrentBookTranslations(current);
  }

  private derivateInterlinearToCustom(
    translationSourceLanguage: LanguageUnionType,
    parsedBookMetadata: ParsedBookMetadata,
    customTranslation: BookTranslationTarget,
    current: CurrentChapter,
    sourceLanguage: Language,
    sourceVerse: SourceVerse
  ): void {
    const verseIndex = this.getVerseIndex(sourceVerse);
    const metadata = this.createCustomTranslationStructureIfNotExists(customTranslation, current, sourceVerse);
    const customTranslationObj = customTranslation.chapters[current.chapter][verseIndex];
    const customTranslationSplitted = this.splitCustomTranslation(customTranslationObj);

    this.projectService
      .splitIntoMatrix(parsedBookMetadata, sourceVerse.text)
      .flat()
      .forEach(segment => {
        if (customTranslationSplitted[segment.index].fragment === this.projectService.getLexical(parsedBookMetadata, sourceLanguage, segment.word)) {
          metadata[segment.index].value = this.projectService.castSegmentIntoMetadataIndex(translationSourceLanguage, segment);
        }
      });

    this.systemService.triggerSaveCurrentBookTranslations(current);
  }

  
  splitCustomTranslation(customTranslationObj: BookVerse<{
    text: string;
    metadata: Array<BookTranslationTargetMetadata>;
  }>): Array<WordFragment> {
    const sentenceList: Array<WordFragment> = [];
    let start = 0;
    customTranslationObj.metadata.forEach(metadata => {
      const fragment = customTranslationObj.text.slice(start, start + metadata.size);
      const sentence: WordFragment = {
        fragment
      };

      sentenceList.push(sentence);
      start += metadata.size;

      const [startSpaces] = customTranslationObj.text.slice(start).match(/^[ ]*/) || [''];
      if (startSpaces.length) {
        sentence.hasTrailingSpace = true;
      }
      start += startSpaces.length;
    });

    const finalSentence = customTranslationObj.text.slice(start).trim();
    if (finalSentence.length) {
      sentenceList.push({ fragment: finalSentence });
    }

    return sentenceList;
  }

  derivateAllToCustom(
    translationSourceLanguage: LanguageUnionType,
    parsedBookMetadata: ParsedBookMetadata,
    customTranslation: BookTranslationTarget,
    current: CurrentChapter,
    sourceLanguage: Language,
    sourceVerse: SourceVerse
  ): void {
    this.derivateTranslationToCustom(parsedBookMetadata, customTranslation, current, sourceLanguage, sourceVerse);
    setTimeout(() => this.derivateInterlinearToCustom(
      translationSourceLanguage,
      parsedBookMetadata,
      customTranslation,
      current,
      sourceLanguage,
      sourceVerse
    ));
  }

  getCustomTranslationVerse(
    customTranslation: BookTranslationTarget, current: CurrentChapter, sourceVerse: SourceVerse
  ): { text: string } | null {
    const verseIndex = this.getVerseIndex(sourceVerse);
    return customTranslation.chapters[current.chapter] &&
      customTranslation.chapters[current.chapter][verseIndex] || null;
  }

  updateCustomTranslation(
    input: HTMLInputElement,
    customTranslation: BookTranslationTarget,
    current: CurrentChapter,
    sourceVerse: SourceVerse
  ): void {
    const verseIndex = this.getVerseIndex(sourceVerse);
    this.createCustomTranslationStructureIfNotExists(customTranslation, current, sourceVerse);
    const chapter = customTranslation.chapters[current.chapter];

    if (chapter[verseIndex]) {
      if (input.value) {
        chapter[verseIndex].text = input.value;
      } else {
        chapter[verseIndex] = this.factoryCustomTranslationVerse(sourceVerse);
      }
    } else {
      chapter[verseIndex] = this.factoryCustomTranslationVerse(sourceVerse);
    }

    this.systemService.triggerSaveCurrentBookTranslations(current);
  }

  cleanCustomTranslation(
    input: HTMLInputElement,
    customTranslation: BookTranslationTarget,
    current: CurrentChapter,
    sourceVerse: SourceVerse
  ): void {
    const verseIndex = this.getVerseIndex(sourceVerse);
    input.value = '';

    if (
      !customTranslation.chapters[current.chapter] ||
      !customTranslation.chapters[current.chapter][verseIndex]
    ) {
      return;
    }

    customTranslation.chapters[current.chapter][verseIndex] = this.factoryCustomTranslationVerse(sourceVerse);
    this.systemService.triggerSaveCurrentBookTranslations(current);
  }

  factoryCustomTranslationVerse(sourceVerse: SourceVerse): BookVerseTranslationTarget {
    return {
      ...sourceVerse,
      variations: {},
      metadata: [],
      text: ''
    }
  }

  
  getCustomTranslationColor(
    customTranslation: BookTranslationTarget,
    interlinear: BookInterlinearTarget | undefined,
    current: CurrentChapter,
    sourceVerse: SourceVerse,
    wordIndex: number
  ): string {
    const verseIndex = this.getVerseIndex(sourceVerse);

    if (
      !customTranslation.chapters[current.chapter] ||
      !customTranslation.chapters[current.chapter][verseIndex]
    ) {
      return '';
    }

    const translationMetadata = customTranslation.chapters[current.chapter][verseIndex]?.metadata;
    if (!translationMetadata) {
      return '';
    }

    if (interlinear) {
      const translationMetadataValue = translationMetadata[wordIndex]?.value || '';
      const [translationWordIndex] = Array.from(translationMetadataValue.match(/^\d+/) || ['']);
      if (!translationWordIndex) {
        return '';
      }

      const interlinearSegmentOrigin = interlinear.chapters[current.chapter][verseIndex][Number(translationWordIndex)]?.origin || null;
      if (!interlinearSegmentOrigin) {
        return '';
      } else {
        return String(interlinearSegmentOrigin.index % 7 + 1);
      }
    } else {
      const matches = translationMetadata[wordIndex]?.value.match(/^\d+/);
      if (matches) {
        return String(Number(Array.from(matches)[0]) % 7 + 1);
      }
    }

    return '';
  }

  getCustomTranslationStyleRole(
    translationSourceLanguage: LanguageUnionType,
    bookMetadata: BookMetadataTarget,
    customTranslation: BookTranslationTarget,
    interlinear: BookInterlinearTarget | undefined,
    current: CurrentChapter,
    sourceVerse: SourceVerse,
    wordIndex: number
  ): string {
    const verseIndex = this.getVerseIndex(sourceVerse);
    let verseMetadata: BookVerse<BookChapterVerseMetadata> | null,
      customTranslationMetadataKey = '',
      scriptureChapterMetadata: BookVerse<BookChapterVerseMetadata>[] = [];

    if (interlinear) {
      const translationMetadata = customTranslation.chapters[current.chapter] &&
        customTranslation.chapters[current.chapter][verseIndex]?.metadata?.[wordIndex]?.value || '';

      const [translationWordIndex] = Array.from(translationMetadata.match(/^\d+/) || ['']);
      if (!translationWordIndex) {
        return '';
      }

      const interlinearSegmentOrigin = interlinear.chapters[current.chapter][verseIndex][Number(translationWordIndex)]?.origin || null;
      if (!interlinearSegmentOrigin) {
        return '';
      }

      scriptureChapterMetadata = bookMetadata.chapters[current.chapter] || [];
      customTranslationMetadataKey = this.projectService.castSegmentIntoMetadataIndex(translationSourceLanguage, interlinearSegmentOrigin);
      verseMetadata = scriptureChapterMetadata && scriptureChapterMetadata[verseIndex];
    } else {
      scriptureChapterMetadata = bookMetadata.chapters[current.chapter] || [];
      verseMetadata = scriptureChapterMetadata[verseIndex] || null;
      const translationChapterMetadata = customTranslation.chapters[current.chapter] || [];
      customTranslationMetadataKey = ((translationChapterMetadata[verseIndex]?.metadata || [])?.[wordIndex]?.value || '');
    }

    if (!verseMetadata || !customTranslationMetadataKey) {
      return '';
    }

    const metadata = verseMetadata.metadata || {};
    const dataObj = metadata[customTranslationMetadataKey];
    if (!dataObj) {
      return '';
    }

    return dataObj.isWordOfGod ? 'godsaid' : '';
  }

  getCustomTranslationInterlinearValue(
    customTranslation: BookTranslationTarget,
    current: CurrentChapter,
    sourceVerse: SourceVerse,
    wordSpanIndex: number
  ): string {
    const verseIndex = this.getVerseIndex(sourceVerse);
    const chapter = customTranslation.chapters[current.chapter];
    if (chapter && chapter[verseIndex] && chapter[verseIndex].metadata) {
      const metadata = chapter[verseIndex].metadata;
      return metadata && metadata[wordSpanIndex]?.value || '';
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
    if (metadata[wordIndex]) {
      metadata[wordIndex].value = value;
    } else {
      metadata[wordIndex] = { value, size: 0 };
    }

    this.systemService.triggerSaveCurrentBookTranslations(current);
  }

  getVariationSize(
    customTranslation: BookTranslationTarget,
    current: CurrentChapter,
    sourceVerse: SourceVerse,
    scriptureWordSpanIndex: number,
    chapterVariations: BookVerseTranslationTargetVariations,
    variationId: string
  ): `${number}` | '' {
    const scripture = this.getCustomTranslationInterlinearValue(
      customTranslation, current, sourceVerse, scriptureWordSpanIndex
    );

    const size = chapterVariations[variationId] && chapterVariations[variationId][scripture]?.size || '';
    return String(size) as `${number}` | '';
  }

  getVariationValue(
    translationWordSpanIndex: number,
    chapterVariations: BookVerseTranslationTargetVariations,
    variationId: string
  ): string {
    const translationWordSpanIndexString = String(translationWordSpanIndex);
    return chapterVariations[variationId] && chapterVariations[variationId][translationWordSpanIndexString]?.value || '';
  }

  updateVariationSize(
    current: CurrentChapter,
    translationWordSpanIndex: number,
    chapterVariations: BookVerseTranslationTargetVariations,
    variationId: string,
    sizeValue: `${number}` | ''
  ): void {
    const translationWordSpanIndexString = String(translationWordSpanIndex);
    if (!chapterVariations[variationId]) {
      chapterVariations[variationId] = {};
    }

    if (sizeValue.length) {
      if (chapterVariations[variationId][translationWordSpanIndexString]) {
        chapterVariations[variationId][translationWordSpanIndexString].size = Number(sizeValue);
      } else {
        chapterVariations[variationId][translationWordSpanIndexString] = { size: Number(sizeValue), value: '' };
      }
    } else {
      delete chapterVariations[variationId][translationWordSpanIndexString];
    }

    this.systemService.triggerSaveCurrentBookTranslations(current);
  }

  updateVariationValue(
    current: CurrentChapter,
    translationWordSpanIndex: number,
    chapterVariations: BookVerseTranslationTargetVariations,
    variationId: string,
    value: string
  ): void {
    const translationWordSpanIndexString = String(translationWordSpanIndex);
    if (!chapterVariations[variationId]) {
      chapterVariations[variationId] = {};
    }

    if (value.length) {
      if (chapterVariations[variationId][translationWordSpanIndexString]) {
        chapterVariations[variationId][translationWordSpanIndexString].value = value;
      } else {
        chapterVariations[variationId][translationWordSpanIndexString] = { value };
      }
    } else {
      delete chapterVariations[variationId][translationWordSpanIndexString];
    }

    this.systemService.triggerSaveCurrentBookTranslations(current);
  }

  cleanInterlinear(
    customTranslation: BookTranslationTarget,
    current: CurrentChapter,
    sourceVerse: SourceVerse
  ): void {
    const verseIndex = this.getVerseIndex(sourceVerse);
    if (
      !customTranslation.chapters[current.chapter] ||
      !customTranslation.chapters[current.chapter][verseIndex]
    ) {
      return;
    }

    customTranslation.chapters[current.chapter][verseIndex].metadata.forEach(metadata => {
      metadata.value = '';
    });
  }

  getVerseIndex(sourceVerse: SourceVerse): number {
    return typeof sourceVerse.verse === 'number' ? sourceVerse.verse : sourceVerse.verse.index;
  }
}
