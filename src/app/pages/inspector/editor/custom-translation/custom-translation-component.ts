import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookInterlinearTarget } from '@domain/book-interlinear-target-model';
import { BookMetadataAttributes } from '@domain/book-metadata-attributes-model';
import { Book } from '@domain/book-model';
import { BookTranslationTargetMetadata } from '@domain/book-translation-target-metadata-model';
import { BookTranslationTarget } from '@domain/book-translation-target-model';
import { BookVerse } from '@domain/book-verse-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { SourceBook } from '@domain/source-book-model';
import { SourceVerse } from '@domain/source-verse-model';
import { WordFragment } from '@domain/word-fragment-model';
import { WordSegment } from '@domain/word-segment-model';
import { SystemService } from '@shared/system/system-service';
import { AbstractInspectorDiretive } from '../shared/abstract-inspector-directive';
import { ProjectCustomTranslationService } from '../shared/project/project-custom-translation-service';
import { ProjectDataService } from '../shared/project/project-data-service';
import { ProjectMetadataService } from '../shared/project/project-metadata-service';

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
  translationSourceLanguage!: LanguageUnionType;

  @Input()
  current!: CurrentChapter;

  @Input()
  parsedBook!: ParsedBookMetadata;

  @Input()
  sourceBook!: SourceBook;

  @Input()
  sourceVerse!: SourceVerse;

  @Input()
  eachWord!: Array<Array<{ index: number; word: string; }>>;

  @Input()
  customTranslation!: BookTranslationTarget;

  minified = false;

  pipeUpdaterController = 0;

  constructor(
    private projectService: ProjectDataService,
    protected projectMetadataService: ProjectMetadataService,
    private projectCustomTranslationService: ProjectCustomTranslationService,
    private systemService: SystemService
  ) {
    super();
  }

  splitCustomTranslation(
    customTranslationObj: BookVerse<{
      text: string;
      metadata: Array<BookTranslationTargetMetadata>;
    }> | undefined,
    pipeUpdaterController: number
  ): Array<WordFragment> {
    pipeUpdaterController;
    if (!customTranslationObj) {
      return [];
    }

    return this.projectCustomTranslationService.splitCustomTranslation(customTranslationObj);
  }

  onChangeWordSpan(verse: {
    text: string;
    metadata: Array<BookTranslationTargetMetadata>;
  }, index: number, wordSpanEl: { value: string }): void {
    const sizeNumber = Number(wordSpanEl.value);
    verse.metadata[index].size = sizeNumber;

    this.systemService.triggerSaveCurrentBookTranslations(this.current);
  }

  derivateAllToCustom(): void {
    const current = confirm('overwrite verse translation and interlineares?');
    if (current) {
      this.projectCustomTranslationService.derivateAllToCustom(
        this.translationSourceLanguage,
        this.parsedBook,
        this.customTranslation,
        this.current,
        this.languageMetadataRecord[this.translationSourceLanguage],
        this.sourceVerse
      );
    }
  }

  updateCustomTranslation(input: HTMLInputElement): void {
    this.projectCustomTranslationService.updateCustomTranslation(
      input, this.customTranslation, this.current, this.sourceVerse
    );
  }

  getCustomTranslationVerse(): { text: string } | null {
    return this.projectCustomTranslationService.getCustomTranslationVerse(
      this.customTranslation, this.current, this.sourceVerse
    );
  }

  cleanCustomTranslation(input: HTMLInputElement): void {
    if (!confirm('clean custom translation on this verse?')) {
      return;
    }

    this.projectCustomTranslationService.cleanCustomTranslation(
      input, this.customTranslation, this.current, this.sourceVerse
    );
    this.pipeUpdaterController++;
  }

  cleanCustomTranslationVariation(
    variation: { id: string; name: string; },
    chapterVariations: Record<string, Record<string, string>>,
    splittedCustomTranslation: WordFragment[]
  ): void {
    if (!confirm(`clean variation "${variation.name}" on this verse?`)) {
      return;
    }

    for (let index = 0; index < splittedCustomTranslation.length; index++) {
      this.updateVariationValue(chapterVariations, variation.id, index, '');
    }
    this.pipeUpdaterController++;
  }

  getCustomTranslationColor(
    wordIndex: number
  ): string {
    return this.projectCustomTranslationService.getCustomTranslationColor(
      this.customTranslation, this.interlinear, this.current, this.sourceVerse, wordIndex
    );
  }

  getCustomTranslationStyleRole(
    wordIndex: number
  ): string {
    return this.projectCustomTranslationService.getCustomTranslationStyleRole(
      this.translationSourceLanguage,
      this.bookTarget,
      this.customTranslation,
      this.interlinear,
      this.current,
      this.sourceVerse,
      wordIndex
    );
  }

  getCustomTranslationInterlinearValue(
    wordSpanIndex: number
  ): string {
    return this.projectCustomTranslationService.getCustomTranslationInterlinearValue(
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

  getVariationValue(chapterVariations: Record<string, Record<string, string>>, variationId: string, scriptureWordSpanIndex: number): string {
    return this.projectCustomTranslationService.getVariationValue(
      this.customTranslation,
      this.current,
      this.sourceVerse,
      scriptureWordSpanIndex,
      chapterVariations,
      variationId
    );
  }

  getVariationDataListOptions(interlinearValue: string, variationId: string): Array<string> {
    const chapters = this.customTranslation.chapters;
    const suggestions = new Array<string>();

    if (interlinearValue) {
      const value = interlinearValue.replace(/^\d+\-/, '');
      chapters.forEach(chapter => {
        chapter.forEach(verse => {
          if (verse.variations) {
            const variationsRecord = verse.variations[variationId] || {};
            Object.keys(variationsRecord).forEach(key => {
              const thermValue = key.replace(/^\d+\-/, '');
              if (thermValue === value) {
                suggestions.push(variationsRecord[key]);
              }
            });
          }
        });
      });
    }

    return suggestions;
  }

  updateVariationValue(
    chapterVariations: Record<string, Record<string, string>>,
    variationId: string,
    scriptureWordSpanIndex: number,
    value: string,
  ): void {
    this.projectCustomTranslationService.updateVariationValue(
      this.customTranslation,
      this.current,
      this.sourceVerse,
      scriptureWordSpanIndex,
      chapterVariations,
      variationId,
      value
    );
  }

  saveCustomTranslationInterlinearMetadata(
    value: string,
    wordIndex: number
  ): void {
    this.projectCustomTranslationService.saveCustomTranslationInterlinearMetadata(
      this.customTranslation, this.current, this.sourceVerse, value, wordIndex
    );
  }

  castSegmentIntoMetadataIndex(segment: WordSegment): string {
    return this.projectService.castSegmentIntoMetadataIndex(this.translationSourceLanguage, segment);
  }

  cleanInterlinear(): void {
    this.projectCustomTranslationService.cleanInterlinear(this.customTranslation, this.current, this.sourceVerse);
    this.pipeUpdaterController++;
  }
}
