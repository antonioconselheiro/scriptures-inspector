import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookMetadataTarget } from '@domain/book-metadata-target-model';
import { BookTranslationTarget } from '@domain/book-translation-target-model';
import { Codex } from '@domain/codex-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { InterlinearTarget } from '@domain/interlinear-target-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { OriginToInterlinear } from '@domain/origin-to-interlinear-model';
import { ParsedPatterns } from '@domain/parsed-patterns-model';
import { ProjectData } from '@domain/project-data-model';
import { Project } from '@domain/project-model';
import { ProjectStructureInterlinear } from '@domain/project-structure-interlinear-model';
import { ProjectStructureMetadata } from '@domain/project-structure-metadata-model';
import { SourceBook } from '@domain/source-book-model';
import { SourceVerse } from '@domain/source-verse-model';
import { TargetTranslationMetadataDetail } from '@domain/target-translation-metadata-detail-model';
import { TranslationViewing } from '@domain/translation-viewing-model';
import { Word } from '@domain/word-model';
import { WordSegment } from '@domain/word-segment-model';
import { SystemService } from '@shared/system/system-service';
import { AddPatternContextMenu } from '../../add-pattern-context-menu/add-pattern-context-menu';
import { DefineFieldMorphemeRuleContextMenu } from '../../define-field-morpheme-rule-context-menu/define-field-morpheme-rule-context-menu';
import { ScriptureMetadataComponent } from '../scripture-metadata/scripture-metadata-component';
import { AbstractTranslatableDirective } from '../shared/abstract-translatable-directive';
import { LexicalPipe } from '../shared/lexical-pipe';
import { ProjectDataService } from '../shared/project/project-data-service';
import { ProjectInterlinearService } from '../shared/project/project-interlinear-service';
import { ProjectMetadataService } from '../shared/project/project-metadata-service';

@Component({
  selector: 'app-interlinear-component',
  imports: [
    CommonModule,
    FormsModule,
    LexicalPipe,
    forwardRef(() => ScriptureMetadataComponent)
  ],
  templateUrl: './interlinear-component.html',
  styleUrl: './interlinear-component.scss'
})
export class InterlinearComponent extends AbstractTranslatableDirective {

  @Input({ required: true })
  project!: Project;

  @Input({ required: true })
  projectData!: ProjectData;

  @Input({ required: true })
  structure!: ProjectStructureInterlinear;

  @Input({ required: true })
  codexMetadataRecord!: { [source: string]: Codex<LanguageUnionType> };

  @Input()
  sourceBookRecord: { readonly [source: string]: SourceBook | undefined } = {};

  @Input({ required: true })
  verseIndex!: number;

  @Input({ required: true })
  current!: CurrentChapter;

  @Input({ required: true })
  sourceLanguage!: LanguageUnionType;

  @Input()
  pipeUpdaterController = 0;

  @Input()
  originToInterlinear: Array<OriginToInterlinear> = [];

  @Input({ required: true })
  sourceBook!: SourceBook;

  @Input({ required: true })
  sourceVerse!: SourceVerse;

  @Input({ required: true })
  bookTarget!: BookMetadataTarget;
  
  @Input({ required: true })
  interlinearTarget!: InterlinearTarget;

  @Input()
  customTranslation: BookTranslationTarget | undefined;

  @Input()
  viewingTranslationBookRecord: { [source: string]: TranslationViewing; } = {};

  @Input()
  variations: Array<TargetTranslationMetadataDetail> = [];

  @Input({ required: true })
  addPatternMenuRef!: AddPatternContextMenu;

  @Input({ required: true })
  defineMorphemeRef!: DefineFieldMorphemeRuleContextMenu;

  minified = false;

  constructor(
    protected dataService: ProjectDataService,
    protected metadataService: ProjectMetadataService,
    protected systemService: SystemService,
    private interlinearService: ProjectInterlinearService
  ) {
    super();
  }

  getTranslationColor(originStructure: ProjectStructureMetadata | ProjectStructureInterlinear, wordIndex: number): string {
    return this.interlinearService.getTranslationColor(
      this.interlinearTarget,
      originStructure.source,
      this.current,
      this.sourceVerse,
      wordIndex
    );
  }

  splitIntoMatrix(language: LanguageUnionType, patterns: ParsedPatterns, sourceVerse: SourceVerse): Array<Word> {
    return this.dataService.splitIntoMatrix(this.languageMetadataRecord[language], patterns, sourceVerse.text);
  }

  onChangeInterlinearToBaseScripture(
    originStructure: ProjectStructureMetadata | ProjectStructureInterlinear,
    translationWordIndex: number,
    translationWord: string,
    interlinearValue: string
  ): void {
    if (!interlinearValue && confirm('Advance one word to all associations to the right?')) {
      const parsedBook = this.parseBook(this.bookTarget, this.sourceLanguage);
      const wordMatrix = this.splitIntoMatrix(this.sourceLanguage, parsedBook.patterns, this.sourceVerse);
      this.interlinearService.advanceOneWordToAllAssociationsToTheRight(
        this.sourceLanguage,
        this.interlinearTarget,
        originStructure.source,
        this.current,
        this.sourceVerse,
        wordMatrix,
        translationWordIndex,
        translationWord,
        interlinearValue
      );

      setTimeout(() => this.pipeUpdaterController++);
    } else {
      this.interlinearService.saveInterlinearToBaseScripture(
        this.interlinearTarget,
        originStructure.source,
        this.current,
        this.sourceVerse,
        translationWordIndex,
        translationWord,
        interlinearValue
      );
    }
  }

  getInterlinearWordSegmentSerialized(originStructure: ProjectStructureMetadata | ProjectStructureInterlinear, wordIndex: number): string {
    return this.interlinearService.getInterlinearWordSegmentSerialized(
      this.sourceLanguage,
      this.interlinearTarget,
      originStructure.source,
      this.current,
      this.sourceVerse,
      wordIndex
    );
  }

  castSegmentIntoMetadataIndex(segment: WordSegment) {
    return this.dataService.castSegmentIntoMetadataIndexSerialized(this.sourceLanguage, segment);
  }

  cleanTranslationInterlinear(originStructure: ProjectStructureMetadata | ProjectStructureInterlinear): void {
    if (!confirm('clean interlinear association for this verse?')) {
      return;
    }

    this.interlinearService.cleanTranslationInterlinear(
      this.interlinearTarget, originStructure.source, this.current, this.sourceVerse
    );
  }
}
