import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookMetadataTarget } from '@domain/book-metadata-target-model';
import { BookTranslationTarget } from '@domain/book-translation-target-model';
import { BookVerse } from '@domain/book-verse-model';
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
import { TranslationViewing } from '@domain/translation-viewing-model';
import { Word } from '@domain/word-model';
import { SystemService } from '@shared/system/system-service';
import { AddPatternContextMenu } from '../../add-pattern-context-menu/add-pattern-context-menu';
import { AddPatternContextMenuTrigger } from '../../add-pattern-context-menu/add-pattern-context-menu-trigger';
import { DefineFieldMorphemeRuleContextMenu } from '../../define-field-morpheme-rule-context-menu/define-field-morpheme-rule-context-menu';
import { DefineFieldMorphemeRuleContextMenuTrigger } from '../../define-field-morpheme-rule-context-menu/define-field-morpheme-rule-context-menu-trigger';
import { CustomTranslationComponent } from '../custom-translation/custom-translation-component';
import { InterlinearComponent } from '../interlinear/interlinear-component';
import { AbstractTranslatableDirective } from '../shared/abstract-translatable-directive';
import { FunctionProxyPipe } from '../shared/function-proxy-pipe';
import { LexicalPipe } from '../shared/lexical-pipe';
import { ProjectDataService } from '../shared/project/project-data-service';
import { ProjectMetadataService } from '../shared/project/project-metadata-service';
import { InterlinearToolsContextMenu } from '../../interlinear-tools-context-menu/interlinear-tools-context-menu';
import { PinRowDirective } from '../pin-row.directive';
import { getPresentationColor } from '../shared/scripture-presentation-core';
import { CheckboxRangeSelectionDirective } from '../shared/checkbox-range-selection.directive';
import { SegmentationChanges } from '../shared/segmentation-changes';

@Component({
  selector: 'app-scripture-metadata-component',
  imports: [
    LexicalPipe,
    FormsModule,
    FunctionProxyPipe,
    InterlinearComponent,
    CustomTranslationComponent,
    PinRowDirective,
    CheckboxRangeSelectionDirective,
    AddPatternContextMenuTrigger,
    DefineFieldMorphemeRuleContextMenuTrigger
  ],
  templateUrl: './scripture-metadata-component.html',
  styleUrl: './scripture-metadata-component.scss'
})
export class ScriptureMetadataComponent extends AbstractTranslatableDirective {

  @Input()
  title = 'Metadata';

  @Input({ required: true })
  project!: Project;
  
  @Input({ required: true })
  projectData: ProjectData = {};
  
  @Input({ required: true })
  structure!: ProjectStructureMetadata | ProjectStructureInterlinear;

  @Input({ required: true })
  codexMetadataRecord!: { [source: string]: Codex<LanguageUnionType> };

  @Input()
  sourceBookRecord: { readonly [source: string]: SourceBook | undefined } = {};

  @Input()
  wordList: Array<{ word: string; separator?: string; }> | null = null;
  
  @Input()
  wordMatrix: Array<Word> | null = null;

  @Input()
  pipeUpdaterController = 0;
  
  @Input({ required: true })
  sourceBook!: SourceBook;

  @Input({ required: true })
  sourceLanguage!: LanguageUnionType;

  @Input({ required: true })
  current!: CurrentChapter;

  @Input({ required: true })
  sourceVerse!: BookVerse<{ text: string; }>;

  @Input({ required: true })
  verseIndex!: number;

  @Input({ required: true })
  bookTarget!: BookMetadataTarget;

  @Input()
  customTranslation: BookTranslationTarget | undefined;

  @Input()
  viewingTranslationBookRecord: { [source: string]: TranslationViewing; } = {};

  @Input({ required: true })
  addPatternMenuRef!: AddPatternContextMenu;

  @Input({ required: true })
  defineMorphemeRef!: DefineFieldMorphemeRuleContextMenu;

  @Input({ required: true })
  interlinearToolsRef!: InterlinearToolsContextMenu;

  @Input()
  originToInterlinear?: Array<OriginToInterlinear>;

  minified = false;

  constructor(
    protected dataService: ProjectDataService,
    protected systemService: SystemService,
    protected metadataService: ProjectMetadataService,
    segmentationChanges: SegmentationChanges
  ) {
    super(segmentationChanges);
  }

  getTranslationVerseIndex(translationVerses: Array<BookVerse<{ text: string; }>>): number {
    return translationVerses.findIndex(verse => verse?.verse === this.sourceVerse.verse);
  }

  getColor(segmentIndex: number): string {
    return getPresentationColor(segmentIndex);
  }

  getInterlinearCorrespondingCurrentChapter(interlinear: ProjectStructureInterlinear): CurrentChapter {
    const mappedChapter = this.projectData[interlinear.interlinearTarget]?.[this.structure.source]
      ?.chapters?.find(chapter => chapter?.origin === this.current.chapter);

    return {
      ...this.current,
      chapter: mappedChapter?.chapter ?? this.current.chapter
    };
  }

  getInterlinearCorrespondingIndex(interlinear: ProjectStructureInterlinear): {
    chapter: number;
    verse: number;
  } {
    const mappedVerse = this.projectData[interlinear.interlinearTarget]?.[this.structure.source]
      ?.chapters?.find(chapter => chapter?.origin === this.current.chapter)
      ?.verses?.find(verse =>
        (verse?.originChapter === undefined || verse?.originChapter === this.current.chapter)
        && verse?.originVerse === this.sourceVerse.verse
      );
    const interlinearChapter = mappedVerse?.chapter ?? this.current.chapter;
    const interlinearVerse = mappedVerse?.verse ?? this.sourceVerse.verse;
    const bookInterlinearSource = this.sourceBookRecord[interlinear.source];
    if (!bookInterlinearSource) {
      return { chapter: -1, verse: -1 };
    }

    const correspondingChapterIndex = bookInterlinearSource.chapters.findIndex(chapter =>
      chapter?.chapter === interlinearChapter
    );
    const correspondingVerseIndex = correspondingChapterIndex < 0
      ? -1
      : bookInterlinearSource.chapters[correspondingChapterIndex]?.verses?.findIndex(verse =>
        verse?.verse === interlinearVerse
      ) ?? -1;

    return { chapter: correspondingChapterIndex, verse: correspondingVerseIndex };
  }

  splitIntoMatrix(patterns: ParsedPatterns, text: string): Array<Word> {
    return this.getWordMatrix(this.sourceLanguage, patterns, text);
  }

  //  word of God
  setAsWordOfGod(
    input: HTMLInputElement,
    wordMatrix: Array<Word>,
    wordIndex: number,
    selectedIndexes: number[]
  ): void {
    this.metadataService.removeUnusedMetadata(
      this.bookTarget,
      this.getLanguageAttributes(this.sourceLanguage),
      this.current,
      this.sourceVerse,
      this.verseIndex,
      wordMatrix,
      wordIndex
    );

    selectedIndexes.forEach(selectedIndex => {
      const word: Word = wordMatrix[selectedIndex];
      this.metadataService.setAsWordOfGod(
        input.checked,
        this.bookTarget,
        this.getLanguageAttributes(this.sourceLanguage),
        this.current,
        this.sourceVerse,
        this.verseIndex,
        word
      );
    });
  }

  getScriptureMetadataWordOfGod(
    wordMatrix: Array<Word>,
    wordIndex: number
  ): boolean {
    const word: Word = wordMatrix[wordIndex];
    return this.metadataService.getScriptureMetadataWordOfGod(
      this.bookTarget,
      this.getLanguageAttributes(this.sourceLanguage),
      this.current,
      this.sourceVerse.verse,
      word
    );
  }

  getOriginToInterlinear(): Array<OriginToInterlinear> {
    const currentOriginToInterlinear = {
      language: this.sourceLanguage,
      structure: this.structure,
      verse: this.sourceVerse
    };

    return [...(this.originToInterlinear || []), currentOriginToInterlinear];
  }

  getInterlinearTarget(): InterlinearTarget | undefined {
    if ('interlinearTarget' in this.structure) {
      return this.projectData[this.structure.interlinearTarget];
    }

    return undefined;
  }

  get hasInterlinearRelationship(): boolean {
    return 'interlinearTarget' in this.structure
      || Boolean(this.originToInterlinear?.length);
  }

  cleanWordOfGodFromVerse(): void {
    if (!confirm('Confirm clean words set as "word of God"?')) {
      return;
    }

    this.metadataService.cleanWordOfGodFromVerse(this.bookTarget, this.current, this.sourceVerse.verse);
  }
}
