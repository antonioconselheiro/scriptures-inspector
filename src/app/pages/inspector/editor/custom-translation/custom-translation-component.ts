import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrentChapter } from '@domain/current-chapter-model';
import { CustomTranslation } from '@domain/custom-translation-model';
import { CustomTranslationVerse } from '@domain/custom-translation-verse-model';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { SourceBook } from '@domain/source-book-model';
import { SourceVerse } from '@domain/source-verse-model';
import { TranslationInterlinear } from '@domain/translation-interlinear-model';
import { WordSegment } from '@domain/word-segment-model';
import { AbstractInspectorDiretive } from '../shared/abstract-inspector-directive';
import { ProjectCustomTranslationService } from '../shared/project/project-custom-translation-service';
import { ProjectDataService } from '../shared/project/project-data-service';
import { ProjectMetadataService } from '../shared/project/project-metadata-service';
import { ProjectData2 } from '@domain/project-data-2-model';
import { KeyTranslation } from '@domain/key-translation-type';

@Component({
  selector: 'app-custom-translation-component',
  imports: [
    FormsModule
  ],
  templateUrl: './custom-translation-component.html',
  styleUrl: './custom-translation-component.scss'
})
export class CustomTranslationComponent extends AbstractInspectorDiretive {

  //  se está propriedade for inclusa, então é considerada uma tradução de uma tradução,
  // se não a tradução considera apenas o escrito original na propriedade 'data'
  @Input()
  interlinear?: TranslationInterlinear;

  @Input()
  current!: CurrentChapter;

  @Input()
  parsedBook!: ParsedBookMetadata;

  @Input()
  sourceBook!: SourceBook;

  @Input()
  target!: string;

  @Input()
  sourceVerse!: SourceVerse;

  @Input()
  eachWord!: Array<Array<{ index: number; word: string; }>>;

  @Input()
  customTranslation!: KeyTranslation;

  @Input()
  projectData!: ProjectData2;

  pipeUpdaterController = 0;

  constructor(
    private projectService: ProjectDataService,
    protected projectMetadataService: ProjectMetadataService,
    private projectCustomTranslationService: ProjectCustomTranslationService
  ) {
    super();
  }

  splitTextBySpacesAndPunctuation(value: string, pipeUpdaterController: number): string[] {
    pipeUpdaterController;
    return [...value.matchAll(/(\s*)(\S+?)(\.{3}|…|[.!?]+)?(?=\s|$)/g)]
      .flatMap(m => m[3] ? [`${m[1]}${m[2]}`, m[3]] : [`${m[1]}${m[2]}`])
      .map(m => m.trim());
  }

  derivateAllToCustom(): void {
    const current = confirm('overwrite verse translation and interlineares?');
    if (current) {
      this.projectCustomTranslationService.derivateAllToCustom(this.data, this.parsedBook, this.customTranslation, this.current, this.sourceVerse);
    }
  }

  updateCustomTranslation(input: HTMLInputElement): void {
    this.projectCustomTranslationService.updateCustomTranslation(input, this.projectData[this.customTranslation], this.current, this.sourceVerse);
  }

  getCustomTranslationVerse(): CustomTranslationVerse | null {
    return this.projectCustomTranslationService.getCustomTranslationVerse(
      this.projectData[this.customTranslation], this.current, this.sourceVerse
    );
  }

  cleanCustomTranslation(input: HTMLInputElement): void {
    if (!confirm('clean custom translation on this verse?')) {
      return;
    }

    this.projectCustomTranslationService.cleanCustomTranslation(input, this.projectData[this.customTranslation], this.current, this.sourceVerse);
    this.pipeUpdaterController++;
  }

  getCustomTranslationColor(
    wordIndex: number
  ): string {
    return this.projectCustomTranslationService.getCustomTranslationColor(
      this.customTranslation, this.current, this.sourceVerse, wordIndex
    );
  }

  getCustomTranslationStyleRole(
    wordIndex: number
  ): string {
    return this.projectCustomTranslationService.getCustomTranslationStyleRole(
      this.data, this.interlinear, this.customTranslation, this.current, this.sourceVerse, wordIndex
    );
  }

  getCustomTranslationInterlinearValue(
    wordIndex: number
  ): string {
    return this.projectCustomTranslationService.getCustomTranslationInterlinearValue(
      this.customTranslation, this.current, this.sourceVerse, wordIndex
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
    return this.projectService.castSegmentIntoMetadataIndex(this.data.lang.source, segment);
  }

  cleanInterlinear(): void {
    this.projectCustomTranslationService.cleanInterlinear(this.customTranslation, this.current, this.sourceVerse);
    this.pipeUpdaterController++;
  }
}
