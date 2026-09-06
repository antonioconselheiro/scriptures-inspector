import { Injectable } from '@angular/core';
import { BookChapterVerseMetadata } from '@domain/book-chapter-verse-metadata-model';
import { BookIndexes } from '@domain/book-indexes-model';
import { BookMetadataTarget } from '@domain/book-metadata-target-model';
import { BookTranslationTargetMetadata } from '@domain/book-translation-target-metadata-model';
import { BookTranslationTarget } from '@domain/book-translation-target-model';
import { BookVerse } from '@domain/book-verse-model';
import { BookVerseTranslationTarget } from '@domain/book-verse-translation-target-model';
import { BookVerseTranslationTargetVariation } from '@domain/book-verse-translation-target-variation-model';
import { BookVerseTranslationTargetVariations } from '@domain/book-verse-translation-target-variations-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { InterlinearBookTarget } from '@domain/interlinear-book-target-model';
import { Language } from '@domain/language-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { SourceBook } from '@domain/source-book-model';
import { SourceVerse } from '@domain/source-verse-model';
import { TranslationWordSegment } from '@domain/word-fragment-model';
import { SystemService } from '@shared/system/system-service';
import { ProjectDataService } from './project-data-service';

@Injectable({
  providedIn: 'root'
})
export class ProjectCustomTranslationService {

  private readonly indexNotFound = -1;

  constructor(
    private dataService: ProjectDataService,
    private systemService: SystemService
  ) { }

  getTranslationIndexes(
    sourceBook: SourceBook,
    current: CurrentChapter,
    sourceVerse: SourceVerse
  ): BookIndexes {
    const chapterIndex = sourceBook.chapters.findIndex(chapter => chapter.chapter === current.chapter);
    const verseIndex = sourceBook.chapters[chapterIndex].verses.findIndex(verse => verse.verse === sourceVerse.verse);
    return {
      chapterIndex,
      verseIndex
    };
  }

  private createCustomTranslationStructureIfNotExists(
    sourceBook: SourceBook,
    sourceVerse: SourceVerse,
    customTranslation: BookTranslationTarget,
    current: CurrentChapter
  ): Array<BookTranslationTargetMetadata> {
    const { chapterIndex, verseIndex } = this.getTranslationIndexes(sourceBook, current, sourceVerse);

    if (!customTranslation.chapters[chapterIndex]) {
      customTranslation.chapters[chapterIndex] = {
        chapter: current.chapter,
        verses: []
      };
    }

    if (!customTranslation.chapters[chapterIndex].verses[verseIndex]) {
      customTranslation.chapters[chapterIndex].verses[verseIndex] = this.factoryCustomTranslationVerse(sourceVerse);
    }

    const metadata = customTranslation.chapters[chapterIndex].verses[verseIndex].metadata || [];
    customTranslation.chapters[chapterIndex].verses[verseIndex].metadata = metadata;

    return metadata;
  }

  private derivateTranslationToCustom(
    sourceBook: SourceBook,
    sourceVerse: SourceVerse,
    sourceLanguage: Language,
    parsedBookMetadata: ParsedBookMetadata,
    customTranslation: BookTranslationTarget,
    current: CurrentChapter
  ): void {
    const { chapterIndex, verseIndex } = this.getTranslationIndexes(sourceBook, current, sourceVerse);
    this.createCustomTranslationStructureIfNotExists(sourceBook, sourceVerse, customTranslation, current);
    
    if (chapterIndex !== this.indexNotFound) {
      const customVerse = customTranslation.chapters[chapterIndex].verses[verseIndex];
      const lexicalList: Array<string> = [];
      const wordMatrix = this.dataService
        .splitIntoMatrix(sourceLanguage, parsedBookMetadata.patterns, sourceVerse.text);

      wordMatrix.forEach(word => {
        word.segments.forEach(segment => {
          lexicalList.push(this.dataService.getLexical(parsedBookMetadata, sourceLanguage, segment.word, segment.morpheme).value);
        });
      });
  
      customVerse.text = lexicalList.join(' ').replace(/ {2,}/g, ' ');
      customVerse.metadata = lexicalList.map(lexical => { return { size: lexical.length, value: '' } });
  
      this.systemService.triggerSaveCurrentBookTranslations(current);
    }
  }

  private derivateInterlinearToCustom(
    sourceBook: SourceBook,
    sourceVerse: SourceVerse,
    sourceLanguage: Language,
    translationLanguage: LanguageUnionType,
    parsedBookMetadata: ParsedBookMetadata,
    customTranslation: BookTranslationTarget,
    current: CurrentChapter
  ): void {
    const { chapterIndex, verseIndex } = this.getTranslationIndexes(sourceBook, current, sourceVerse);
    const metadata = this.createCustomTranslationStructureIfNotExists(sourceBook, sourceVerse, customTranslation, current);

    if (chapterIndex !== this.indexNotFound) {
      const customTranslationObj = customTranslation.chapters[chapterIndex].verses[verseIndex];
      const customTranslationSplitted = this.splitCustomTranslation(customTranslationObj);
      const wordMatrix = this.dataService
        .splitIntoMatrix(sourceLanguage, parsedBookMetadata.patterns, sourceVerse.text);

      wordMatrix.forEach(word => {
        word.segments.forEach(segment => {
          const { value } = this.dataService.getLexical(parsedBookMetadata, sourceLanguage, segment.word, segment.morpheme);

          if (customTranslationSplitted[segment.index].segment === value) {
            metadata[segment.index].value = this.dataService.castSegmentIntoMetadataIndexSerialized(translationLanguage, segment);
          }
        });
      });
  
      this.systemService.triggerSaveCurrentBookTranslations(current);
    }
  }

  splitCustomTranslation(customTranslationObj: BookVerse<{
    text: string;
    metadata: Array<BookTranslationTargetMetadata>;
  }>): Array<TranslationWordSegment> {
    const sentenceList: Array<TranslationWordSegment> = [];
    let start = 0;
    customTranslationObj.metadata.forEach(metadata => {
      const fragment = customTranslationObj.text.slice(start, start + metadata.size);
      const sentence: TranslationWordSegment = {
        segment: fragment
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
      sentenceList.push({ segment: finalSentence });
    }

    return sentenceList;
  }

  splitCustomTranslationWithVariations(
    customTranslation: BookTranslationTarget,
    indexes: BookIndexes
  ): {
    original: Array<TranslationWordSegment>,
    variations: Record<string, Array<TranslationWordSegment>>
  } {
    const customTranslationObj = customTranslation.chapters[indexes.chapterIndex]?.verses[indexes.verseIndex];
    if (!customTranslationObj) {
      return { original: [], variations: {} };
    }

    const original = this.splitCustomTranslation(customTranslationObj);
    const variations: Record<string, Array<TranslationWordSegment>> = {};
    Object.keys(customTranslation.variations).forEach(variationKey => {
      const variationConfig = customTranslationObj.variations[variationKey];
      if (variationConfig) {
        const metadataVariation = structuredClone(customTranslationObj.metadata);
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
    sourceBook: SourceBook,
    sourceVerse: SourceVerse,
    sourceLanguage: Language,
    translationLanguage: LanguageUnionType,
    parsedBookMetadata: ParsedBookMetadata,
    customTranslation: BookTranslationTarget,
    current: CurrentChapter,
  ): Promise<void> {
    return new Promise((resolve) => {
      this.derivateTranslationToCustom(sourceBook, sourceVerse, sourceLanguage, parsedBookMetadata, customTranslation, current);
      setTimeout(() => {
        this.derivateInterlinearToCustom(
          sourceBook,
          sourceVerse,
          sourceLanguage,
          translationLanguage,
          parsedBookMetadata,
          customTranslation,
          current
        );
        resolve();
      });
    });
  }

  getCustomTranslationVerse(
    sourceBook: SourceBook,
    customTranslation: BookTranslationTarget, current: CurrentChapter, sourceVerse: SourceVerse
  ): { text: string } | null {
    const { chapterIndex, verseIndex } = this.getTranslationIndexes(sourceBook, current, sourceVerse);

    return customTranslation.chapters[chapterIndex] &&
      customTranslation.chapters[chapterIndex].verses[verseIndex] || null;
  }

  updateCustomTranslation(
    sourceBook: SourceBook,
    sourceVerse: SourceVerse,
    input: HTMLInputElement,
    customTranslation: BookTranslationTarget,
    current: CurrentChapter
  ): void {
    const { chapterIndex, verseIndex } = this.getTranslationIndexes(sourceBook, current, sourceVerse);
    this.createCustomTranslationStructureIfNotExists(sourceBook, sourceVerse, customTranslation, current);
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
    sourceBook: SourceBook,
    input: HTMLInputElement,
    customTranslation: BookTranslationTarget,
    current: CurrentChapter,
    sourceVerse: SourceVerse
  ): void {
    const { chapterIndex, verseIndex } = this.getTranslationIndexes(sourceBook, current, sourceVerse);
    input.value = '';
    if (chapterIndex === this.indexNotFound) {
      return;
    }

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
    sourceBook: SourceBook,
    customTranslation: BookTranslationTarget,
    interlinear: InterlinearBookTarget | undefined,
    current: CurrentChapter,
    sourceVerse: SourceVerse,
    wordIndex: number
  ): string {
    const { chapterIndex, verseIndex } = this.getTranslationIndexes(sourceBook, current, sourceVerse);

    if (
      chapterIndex === this.indexNotFound ||
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

      const interlinearSegmentOrigin = interlinear
        .chapters[chapterIndex]
        .verses[verseIndex]
        .words[Number(translationWordIndex)] || null;
      if (!interlinearSegmentOrigin) {
        return '';
      } else {
        return String(interlinearSegmentOrigin.originIndex % 7 + 1);
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
    sourceBook: SourceBook,
    translationLanguage: LanguageUnionType,
    bookMetadata: BookMetadataTarget,
    customTranslation: BookTranslationTarget,
    interlinear: InterlinearBookTarget | undefined,
    current: CurrentChapter,
    sourceVerse: SourceVerse,
    wordIndex: number
  ): boolean {
    const { chapterIndex, verseIndex } = this.getTranslationIndexes(sourceBook, current, sourceVerse);

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

      const interlinearChapter = interlinear.chapters[chapterIndex];
      if (!interlinearChapter) {
        return false;
      }

      const interlinearSegmentOrigin = interlinearChapter.verses[verseIndex].words[Number(translationWordIndex)] || null;
      if (!interlinearSegmentOrigin) {
        return false;
      }

      scriptureChapterMetadata = bookMetadata.chapters[chapterIndex].verses || [];
      customTranslationMetadataKey = this.dataService.castInterlinearWordTargetIntoMetadataIndexSerialized(translationLanguage, interlinearSegmentOrigin);
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
    sourceBook: SourceBook,
    customTranslation: BookTranslationTarget,
    current: CurrentChapter,
    sourceVerse: SourceVerse,
    wordSpanIndex: number
  ): string {
    const { chapterIndex, verseIndex } = this.getTranslationIndexes(sourceBook, current, sourceVerse);

    if (chapterIndex !== this.indexNotFound) {
      const verses = customTranslation.chapters[chapterIndex].verses;
      if (verses && verses[verseIndex] && verses[verseIndex].metadata) {
        const metadata = verses[verseIndex].metadata;
        return metadata && metadata[wordSpanIndex]?.value || '';
      }
    }

    return '';
  }

  saveCustomTranslationInterlinearMetadata(
    sourceBook: SourceBook,
    sourceVerse: SourceVerse,
    customTranslation: BookTranslationTarget,
    current: CurrentChapter,
    value: string,
    wordIndex: number
  ): void {
    const metadata = this.createCustomTranslationStructureIfNotExists(sourceBook, sourceVerse, customTranslation, current);
    if (metadata[wordIndex]) {
      metadata[wordIndex].value = value;
    } else {
      metadata[wordIndex] = { value, size: 0 };
    }

    this.systemService.triggerSaveCurrentBookTranslations(current);
  }

  getScriptureMetadataWordOfGodOverriding(
    sourceBook: SourceBook,
    translationLanguage: LanguageUnionType,
    bookMetadata: BookMetadataTarget,
    customTranslation: BookTranslationTarget,
    interlinear: InterlinearBookTarget | undefined,
    current: CurrentChapter,
    sourceVerse: SourceVerse,
    wordSpanIndex: number
  ): { checked: boolean, readonly: boolean } {
    const isWordOfGod = this.isWordOfGod(
      sourceBook,
      translationLanguage,
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

    const { chapterIndex, verseIndex } = this.getTranslationIndexes(sourceBook, current, sourceVerse);
    if (chapterIndex === this.indexNotFound) {
      return {
        checked: false,
        readonly: false
      };
    }

    const verses = customTranslation.chapters[chapterIndex].verses;
    if (verses && verses[verseIndex] && verses[verseIndex].metadata) {
      const metadata = verses[verseIndex].metadata;
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
    sourceBook: SourceBook,
    sourceVerse: SourceVerse,
    customTranslation: BookTranslationTarget,
    current: CurrentChapter,
    value: boolean,
    wordIndex: number
  ): void {
    const metadata = this.createCustomTranslationStructureIfNotExists(sourceBook, sourceVerse, customTranslation, current);
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
          if (chapterVerse && chapterVerse.variations) {
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
    sourceBook: SourceBook,
    customTranslation: BookTranslationTarget,
    current: CurrentChapter,
    sourceVerse: SourceVerse
  ): void {
    const { chapterIndex, verseIndex } = this.getTranslationIndexes(sourceBook, current, sourceVerse);

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
}
