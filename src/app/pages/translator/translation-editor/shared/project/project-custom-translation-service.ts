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
import { BookVerseTranslationTargetVariation } from '@domain/book-verse-translation-target-variation-model';

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
    const chapter = current.chapter - 1;
    if (!customTranslation.chapters[chapter]) {
      customTranslation.chapters[chapter] = {
        chapter: current.chapter,
        verses: []
      };
    }

    if (!customTranslation.chapters[chapter].verses[verseIndex]) {
      customTranslation.chapters[chapter].verses[verseIndex] = this.factoryCustomTranslationVerse(sourceVerse);
    }

    const metadata = customTranslation.chapters[chapter].verses[verseIndex].metadata || [];
    customTranslation.chapters[chapter].verses[verseIndex].metadata = metadata;

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
    const chapterIndex = current.chapter - 1;
    const customVerse = customTranslation.chapters[chapterIndex].verses[verseIndex];
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
    const chapterIndex = current.chapter - 1;
    const customTranslationObj = customTranslation.chapters[chapterIndex].verses[verseIndex];
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

  splitCustomTranslationWithVariations(
    customTranslation: BookTranslationTarget,
    chapter: number,
    verseIndex: number
  ): {
    original: Array<WordFragment>,
    variations: Record<string, Array<WordFragment>>
  } {
    const customTranslationObj = customTranslation.chapters[chapter]?.verses[verseIndex];
    if (!customTranslationObj) {
      return { original: [], variations: {} };
    }

    const original = this.splitCustomTranslation(customTranslationObj);
    const variations: Record<string, Array<WordFragment>> = {};
    Object.keys(customTranslation.variations).forEach(variationKey => {
      const variationConfig = customTranslationObj.variations[variationKey];
      if (variationConfig) {
        const metadataVariation = structuredClone(customTranslationObj.metadata);
        Object.keys(variationConfig).forEach(key => {
          const sizeOverride = variationConfig[key].size;
          if (sizeOverride) {
            metadataVariation[Number(key)].size = sizeOverride;
          }
        });

        variations[variationKey] = this.splitCustomTranslation({ ...customTranslationObj, metadata: metadataVariation });
      } else {
        variations[variationKey] = original;
      }
    });

    return { original, variations };
  }

  onChangeWordSpan(
    current: CurrentChapter,  
    verse: { text: string; metadata: Array<BookTranslationTargetMetadata>; } | undefined,
    index: number,
    wordSpanEl: { value: string }
  ): void {
    if (!verse) {
      return;
    }

    let sizeNumber = Number(wordSpanEl.value);
    if (sizeNumber === 0) {
      if (verse.metadata[index]) {
        if (confirm('remove?')) {
          verse.metadata.splice(index, 1);
          this.systemService.triggerSaveCurrentBookTranslations(current);
          return;
        }
      }
    }

    if (!verse.metadata[index]) {
      verse.metadata[index] = { size: sizeNumber, value: '' };
    } else {
      verse.metadata[index].size = sizeNumber;
    }

    this.systemService.triggerSaveCurrentBookTranslations(current);
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
    const chapterIndex = current.chapter - 1;
    return customTranslation.chapters[chapterIndex] &&
      customTranslation.chapters[chapterIndex].verses[verseIndex] || null;
  }

  updateCustomTranslation(
    input: HTMLInputElement,
    customTranslation: BookTranslationTarget,
    current: CurrentChapter,
    sourceVerse: SourceVerse
  ): void {
    const verseIndex = this.getVerseIndex(sourceVerse);
    const chapterIndex = current.chapter - 1;
    this.createCustomTranslationStructureIfNotExists(customTranslation, current, sourceVerse);
    const chapter = customTranslation.chapters[chapterIndex];

    if (chapter.verses[verseIndex]) {
      if (input.value) {
        chapter.verses[verseIndex].text = input.value;
      } else {
        chapter.verses[verseIndex] = this.factoryCustomTranslationVerse(sourceVerse);
      }
    } else {
      chapter.verses[verseIndex] = this.factoryCustomTranslationVerse(sourceVerse);
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
    const chapterIndex = current.chapter - 1;
    input.value = '';

    if (
      !customTranslation.chapters[chapterIndex] ||
      !customTranslation.chapters[chapterIndex].verses[verseIndex]
    ) {
      return;
    }

    customTranslation.chapters[chapterIndex].verses[verseIndex] = this.factoryCustomTranslationVerse(sourceVerse);
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
    const chapterIndex = current.chapter - 1;

    if (
      !customTranslation.chapters[chapterIndex] ||
      !customTranslation.chapters[chapterIndex].verses[verseIndex]
    ) {
      return '';
    }

    const translationMetadata = customTranslation.chapters[chapterIndex].verses[verseIndex]?.metadata;
    if (!translationMetadata) {
      return '';
    }

    if (interlinear) {
      const translationMetadataValue = translationMetadata[wordIndex]?.value || '';
      const [translationWordIndex] = Array.from(translationMetadataValue.match(/^\d+/) || ['']);
      if (!translationWordIndex) {
        return '';
      }

      const interlinearSegmentOrigin = interlinear.chapters[chapterIndex].verses[verseIndex][Number(translationWordIndex)]?.origin || null;
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

  isWordOfGod(
    translationSourceLanguage: LanguageUnionType,
    bookMetadata: BookMetadataTarget,
    customTranslation: BookTranslationTarget,
    interlinear: BookInterlinearTarget | undefined,
    current: CurrentChapter,
    sourceVerse: SourceVerse,
    wordIndex: number
  ): boolean {
    const verseIndex = this.getVerseIndex(sourceVerse);
    const chapterIndex = current.chapter - 1;
    let verseMetadata: BookVerse<BookChapterVerseMetadata> | null,
      customTranslationMetadataKey = '',
      scriptureChapterMetadata: BookVerse<BookChapterVerseMetadata>[] = [];

    if (interlinear) {
      const translationMetadata = customTranslation.chapters[chapterIndex] &&
        customTranslation.chapters[chapterIndex].verses[verseIndex]?.metadata?.[wordIndex]?.value || '';

      const [translationWordIndex] = Array.from(translationMetadata.match(/^\d+/) || ['']);
      if (!translationWordIndex) {
        return false;
      }

      const interlinearSegmentOrigin = interlinear.chapters[chapterIndex].verses[verseIndex][Number(translationWordIndex)]?.origin || null;
      if (!interlinearSegmentOrigin) {
        return false;
      }

      scriptureChapterMetadata = bookMetadata.chapters[chapterIndex].verses || [];
      customTranslationMetadataKey = this.projectService.castSegmentIntoMetadataIndex(translationSourceLanguage, interlinearSegmentOrigin);
      verseMetadata = scriptureChapterMetadata && scriptureChapterMetadata[verseIndex];
    } else {
      scriptureChapterMetadata = bookMetadata.chapters[chapterIndex].verses || [];
      verseMetadata = scriptureChapterMetadata[verseIndex] || null;
      const translationChapterMetadata = customTranslation.chapters[chapterIndex].verses || [];
      customTranslationMetadataKey = ((translationChapterMetadata[verseIndex]?.metadata || [])?.[wordIndex]?.value || '');
    }

    if (!verseMetadata || !customTranslationMetadataKey) {
      return false;
    }

    const metadata = verseMetadata.metadata || {};
    const dataObj = metadata[customTranslationMetadataKey];
    if (!dataObj) {
      return false;
    }

    return dataObj.isWordOfGod || false;
  }

  getCustomTranslationInterlinearValue(
    customTranslation: BookTranslationTarget,
    current: CurrentChapter,
    sourceVerse: SourceVerse,
    wordSpanIndex: number
  ): string {
    const verseIndex = this.getVerseIndex(sourceVerse);
    const chapterIndex = current.chapter - 1;
    const chapter = customTranslation.chapters[chapterIndex].verses;
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

  getScriptureMetadataWordOfGodOverriding(
    translationSourceLanguage: LanguageUnionType,
    bookMetadata: BookMetadataTarget,
    customTranslation: BookTranslationTarget,
    interlinear: BookInterlinearTarget | undefined,
    current: CurrentChapter,
    sourceVerse: SourceVerse,
    wordSpanIndex: number
  ): { checked: boolean, readonly: boolean } {
    const isWordOfGod = this.isWordOfGod(
      translationSourceLanguage,
      bookMetadata,
      customTranslation,
      interlinear,
      current,
      sourceVerse,
      wordSpanIndex
    );

    if (isWordOfGod) {
      return {
        checked: true,
        readonly: true
      };
    }

    const verseIndex = this.getVerseIndex(sourceVerse);
    const chapterIndex = current.chapter - 1;
    const chapter = customTranslation.chapters[chapterIndex].verses;
    if (chapter && chapter[verseIndex] && chapter[verseIndex].metadata) {
      const metadata = chapter[verseIndex].metadata;
      return {
        checked: metadata && metadata[wordSpanIndex]?.isWordOfGod || false,
        readonly: false
      };
    }

    return {
      checked: false,
      readonly: false
    };
  }

  setAsWordOfGodOverriding(
    customTranslation: BookTranslationTarget,
    current: CurrentChapter,
    sourceVerse: SourceVerse,
    value: boolean,
    wordIndex: number
  ): void {
    const metadata = this.createCustomTranslationStructureIfNotExists(customTranslation, current, sourceVerse);
    if (metadata[wordIndex]) {
      if (value) {
        metadata[wordIndex].isWordOfGod = true;
      } else {
        delete metadata[wordIndex].isWordOfGod;
      }
    } else if (value) {
      metadata[wordIndex] = {
        value: '',
        size: 0,
        isWordOfGod: true
      };
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

  getVariation(
    translationWordSpanIndex: number,
    chapterVariations: BookVerseTranslationTargetVariations,
    variationId: string
  ): BookVerseTranslationTargetVariation | undefined {
    const translationWordSpanIndexString = String(translationWordSpanIndex);
    return chapterVariations[variationId] && chapterVariations[variationId][translationWordSpanIndexString];
  }

  getVariationDataListOptions(customTranslation: BookTranslationTarget, interlinearValue: string, variationId: string): Array<string> {
    const bookChapters = customTranslation.chapters;
    const suggestions = new Set<string>();

    if (interlinearValue) {
      const value = interlinearValue.replace(/^\d+\-/, '');
      bookChapters.forEach(chapter => {
        chapter.verses.forEach(chapterVerse => {
          if (chapterVerse.variations) {
            const variationsRecord = chapterVerse.variations[variationId] || {};
            Object.keys(variationsRecord).forEach(key => {
              const metadata = chapterVerse.metadata[Number(key)];
              if (metadata && metadata.value) {
                const thermValue = metadata.value.replace(/^\d+\-/, '');
                if (thermValue === value) {
                  suggestions.add(variationsRecord[key].value);
                }
              }

            });
          }
        });
      });
    }

    return Array.from(suggestions);
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
      delete chapterVariations[variationId][translationWordSpanIndexString].size;
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
    const chapterIndex = current.chapter - 1;

    if (
      !customTranslation.chapters[chapterIndex] ||
      !customTranslation.chapters[chapterIndex].verses[verseIndex]
    ) {
      return;
    }

    customTranslation.chapters[chapterIndex].verses[verseIndex].metadata.forEach(metadata => {
      metadata.value = '';
    });
  }

  getVerseIndex(sourceVerse: SourceVerse): number {
    return typeof sourceVerse.verse === 'number' ? sourceVerse.verse : sourceVerse.verse.index;
  }
}
