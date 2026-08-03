import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookInterlinearTarget } from '@domain/book-interlinear-target-model';
import { BookMetadataAttributes } from '@domain/book-metadata-attributes-model';
import { Book } from '@domain/book-model';
import { BookTranslationTargetMetadata } from '@domain/book-translation-target-metadata-model';
import { BookTranslationTarget } from '@domain/book-translation-target-model';
import { BookVerseTranslationTargetVariation } from '@domain/book-verse-translation-target-variation-model';
import { BookVerseTranslationTargetVariations } from '@domain/book-verse-translation-target-variations-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { CurrentVerseIndex } from '@domain/current-verse-index-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { SourceBook } from '@domain/source-book-model';
import { SourceVerse } from '@domain/source-verse-model';
import { TranslationWordSegment } from '@domain/word-fragment-model';
import { WordSegment } from '@domain/word-segment-model';
import { AbstractInspectorDiretive } from '../shared/abstract-inspector-directive';
import { ProjectCustomTranslationService } from '../shared/project/project-custom-translation-service';
import { ProjectDataService } from '../shared/project/project-data-service';
import { ProjectMetadataService } from '../shared/project/project-metadata-service';
import { Word } from '@domain/word-model';

@Component({
  selector: 'app-custom-translation-component',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './custom-translation-component.html',
  styleUrl: './custom-translation-component.scss'
})
export class CustomTranslationComponent extends AbstractInspectorDiretive {

  @Input()
  bookTarget!: Book<BookMetadataAttributes, any>;

  //  se está propriedade for inclusa, então é considerada uma tradução de uma tradução,
  // se não a tradução considera apenas o escrito original na propriedade 'data'
  @Input()
  interlinear?: BookInterlinearTarget;

  @Input()
  translationLanguage!: LanguageUnionType;

  @Input()
  current!: CurrentChapter;

  @Input()
  parsedBook!: ParsedBookMetadata;

  @Input()
  sourceBook!: SourceBook;

  @Input()
  sourceVerse!: SourceVerse;

  @Input()
  wordMatrix!: Array<Word>;

  @Input()
  customTranslation!: BookTranslationTarget;

  minified = false;

  pipeUpdaterController = 0;

  constructor(
    private cdr: ChangeDetectorRef,
    private dataService: ProjectDataService,
    protected metadataService: ProjectMetadataService,
    private customTranslationService: ProjectCustomTranslationService
  ) {
    super();
  }

  getChapterIndex(current: CurrentChapter, chapters: Array<{ chapter: number; }>): number {
    return chapters.findIndex(chapter => chapter.chapter === current.chapter);
  }

  splitCustomTranslationWithVariations(
    customTranslation: BookTranslationTarget,
    chapter: number,
    verseIndex: number,
    pipeUpdaterController: number
  ): {
    original: Array<TranslationWordSegment>,
    variations: Record<string, Array<TranslationWordSegment>>
  } {
    pipeUpdaterController;
    return this.customTranslationService.splitCustomTranslationWithVariations(customTranslation, chapter, verseIndex);
  }

  onChangeWordSpan(
    verse: { text: string; metadata: Array<BookTranslationTargetMetadata>; } | undefined,
    index: number,
    wordSpanEl: { value: string }
  ): void {
    this.customTranslationService.onChangeWordSpan(this.current, verse, index, wordSpanEl);
  }

  derivateAllToCustom(): void {
    const current = confirm('overwrite verse translation and interlineares?');
    if (current) {
      this.customTranslationService.derivateAllToCustom(
        this.sourceBook,
        this.sourceVerse,
        this.languageMetadataRecord[this.translationLanguage],
        this.translationLanguage,
        this.parsedBook,
        this.customTranslation,
        this.current,
      ).then(() => this.cdr.detectChanges());
    }
  }

  updateCustomTranslation(input: HTMLInputElement): void {
    this.customTranslationService.updateCustomTranslation(
      this.sourceBook, this.sourceVerse, input, this.customTranslation, this.current
    );
  }

  getCustomTranslationVerse(): { text: string } | null {
    return this.customTranslationService.getCustomTranslationVerse(
      this.customTranslation, this.current, this.sourceVerse
    );
  }

  cleanCustomTranslation(input: HTMLInputElement): void {
    if (!confirm('clean custom translation on this verse?')) {
      return;
    }

    this.customTranslationService.cleanCustomTranslation(
      input, this.customTranslation, this.current, this.sourceVerse
    );
    this.pipeUpdaterController++;
  }

  cleanCustomTranslationVariation(
    variation: { id: string; name: string; },
    chapterVariations: BookVerseTranslationTargetVariations,
    splittedCustomTranslation: TranslationWordSegment[]
  ): void {
    if (!confirm(`clean variation "${variation.name}" on this verse?`)) {
      return;
    }

    for (let index = 0; index < splittedCustomTranslation.length; index++) {
      this.updateVariationValue(chapterVariations, variation.id, index, '');
    }
    this.pipeUpdaterController++;
  }

  isPunctuation(color: string, word: string): '' | null {
    return !color && /^\p{General_Category=Punctuation}+$/u.test(word) ? '' : null;
  }

  getCustomTranslationColor(
    wordIndex: number
  ): string {
    return this.customTranslationService.getCustomTranslationColor(
      this.customTranslation, this.interlinear, this.current, this.sourceVerse, wordIndex
    );
  }

  getCurrent(currentIndex: number): CurrentVerseIndex {
    return { ...this.current, verseIndex: currentIndex };
  }

  isCustomTranslationWordOfGod(wordIndex: number): boolean {
    const isWordOfGod = this.customTranslationService.isWordOfGod(
      this.translationLanguage,
      this.bookTarget,
      this.customTranslation,
      this.interlinear,
      this.current,
      this.sourceVerse,
      wordIndex
    );

    if (isWordOfGod) {
      return true;
    }

    const isWordOfGodOverriding = this.customTranslationService.getScriptureMetadataWordOfGodOverriding(
      this.translationLanguage,
      this.bookTarget,
      this.customTranslation,
      this.interlinear,
      this.current,
      this.sourceVerse,
      wordIndex
    );

    return isWordOfGodOverriding.checked || false;
  }

  getScriptureMetadataWordOfGodOverriding(
    wordSpanIndex: number
  ): { checked: boolean, readonly: boolean } {
    return this.customTranslationService.getScriptureMetadataWordOfGodOverriding(
      this.translationLanguage,
      this.bookTarget,
      this.customTranslation,
      this.interlinear,
      this.current,
      this.sourceVerse,
      wordSpanIndex
    );
  }
  
  setAsWordOfGodOverriding(
    value: boolean,
    wordIndex: number
  ): void {
    return this.customTranslationService.setAsWordOfGodOverriding(
      this.sourceBook,
      this.sourceVerse,
      this.customTranslation,
      this.current,
      value,
      wordIndex
    );
  }

  getCustomTranslationInterlinearValue(
    wordSpanIndex: number
  ): string {
    return this.customTranslationService.getCustomTranslationInterlinearValue(
      this.customTranslation, this.current, this.sourceVerse, wordSpanIndex
    );
  }

  getVariations(): Array<{ id: string; name: string; }> {
    return Object.keys(this.customTranslation.variations || {}).map(key => {
      const variation = this.customTranslation.variations[key];
      return {
        id: key,
        ...variation
      }
    });
  }

  getVariation(
    chapterVariations: BookVerseTranslationTargetVariations,
    variationId: string,
    scriptureWordSpanIndex: number
  ): BookVerseTranslationTargetVariation | undefined {
    return this.customTranslationService.getVariation(
      scriptureWordSpanIndex,
      chapterVariations,
      variationId
    );
  }

  getDataListId(variation: {
    id: string;
    name: string;
  }, index: number): string {
    return `datalist-${this.current.book}-${this.current.chapter}-${this.sourceVerse.verse.start}-${this.sourceVerse.verse.end}-${variation.id}-${index}`;
  }

  getVariationDataListOptions(interlinearValue: string, variationId: string): Array<string> {
    return this.customTranslationService.getVariationDataListOptions(this.customTranslation, interlinearValue, variationId);
  }

  updateVariationValue(
    chapterVariations: BookVerseTranslationTargetVariations,
    variationId: string,
    translationWordSpanIndex: number,
    value: string,
  ): void {
    this.customTranslationService.updateVariationValue(
      this.current,
      translationWordSpanIndex,
      chapterVariations,
      variationId,
      value
    );
  }

  saveCustomTranslationInterlinearMetadata(
    value: string,
    wordIndex: number
  ): void {
    this.customTranslationService.saveCustomTranslationInterlinearMetadata(
      this.sourceBook, this.sourceVerse, this.customTranslation, this.current, value, wordIndex
    );
  }

  castSegmentIntoMetadataIndex(segment: WordSegment): string {
    return this.dataService.castSegmentIntoMetadataIndex(this.translationLanguage, segment);
  }

  cleanInterlinear(): void {
    this.customTranslationService.cleanInterlinear(this.customTranslation, this.current, this.sourceVerse);
    this.pipeUpdaterController++;
  }
}
