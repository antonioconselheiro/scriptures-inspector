import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookInterlinearTarget } from '@domain/book-interlinear-target-model';
import { BookMetadataTarget } from '@domain/book-metadata-target-model';
import { BookTranslationTarget } from '@domain/book-translation-target-model';
import { Codex } from '@domain/codex-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { ParsedPatterns } from '@domain/parsed-patterns';
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
import { CustomTranslationComponent } from '../custom-translation/custom-translation-component';
import { ScriptureMetadataComponent } from '../scripture-metadata/scripture-metadata-component';
import { AbstractTranslatableDirective } from '../shared/abstract-translatable-directive';
import { LexicalPipe } from '../shared/lexical-pipe';
import { ProjectDataService } from '../shared/project/project-data-service';
import { ProjectInterlinearService } from '../shared/project/project-interlinear-service';
import { ProjectMetadataService } from '../shared/project/project-metadata-service';

@Component({
  selector: 'app-interlinear-component',
  imports: [
    FormsModule,
    LexicalPipe,
    ScriptureMetadataComponent,
    CustomTranslationComponent,
    CommonModule
  ],
  templateUrl: './interlinear-component.html',
  styleUrl: './interlinear-component.scss'
})
export class InterlinearComponent extends AbstractTranslatableDirective {

  @Input()
  project!: Project;

  @Input()
  projectData!: ProjectData;

  @Input()
  structure!: ProjectStructureInterlinear;

  @Input()
  originStructure!: ProjectStructureMetadata | ProjectStructureInterlinear;

  @Input()
  codexMetadataRecord!: { [source: string]: Codex<LanguageUnionType> };

  @Input()
  sourceBookRecord: { readonly [source: string]: SourceBook | undefined } = {};

  @Input()
  current!: CurrentChapter;

  @Input()
  originLanguage!: LanguageUnionType;

  @Input()
  sourceLanguage!: LanguageUnionType;

  @Input()
  pipeUpdaterController = 0;

  @Input()
  parsedOriginBook!: ParsedBookMetadata;

  @Input()
  originVerse!: SourceVerse;

  @Input()
  sourceBook!: SourceBook;

  @Input()
  sourceVerse!: SourceVerse;

  @Input()
  bookTarget!: BookMetadataTarget;
  
  @Input()
  interlinearTarget!: BookInterlinearTarget;

  @Input()
  customTranslation: BookTranslationTarget | undefined;

  @Input()
  viewingTranslationBookRecord: { [source: string]: TranslationViewing; } = {};

  @Input()
  variations: Array<TargetTranslationMetadataDetail> = [];

  @Input()
  addPatternMenuRef!: AddPatternContextMenu;

  minified = false;

  constructor(
    protected dataService: ProjectDataService,
    protected metadataService: ProjectMetadataService,
    protected systemService: SystemService,
    private interlinearService: ProjectInterlinearService
  ) {
    super();
  }

  getTranslationColor(wordIndex: number): string {
    const chapterIndex = this.bookTarget.chapters.findIndex(chapter => chapter.chapter === this.current.chapter);
    if (chapterIndex === this.indexNotFound) {
      return '0';
    }

    const map = this.bookTarget.chapters[chapterIndex]?.verses &&
      this.bookTarget.chapters[chapterIndex].verses[this.sourceVerse.verse.index] &&
      this.bookTarget.chapters[chapterIndex].verses[this.sourceVerse.verse.index][wordIndex] || null;

    if (!map) {
      return '0';
    }

    return String(map.origin.index % 7 + 1);
  }

  splitIntoMatrix(language: LanguageUnionType, patterns: ParsedPatterns, sourceVerse: SourceVerse): Array<Word> {
    return this.dataService.splitIntoMatrix(this.languageMetadataRecord[language], patterns, sourceVerse.text);
  }

  onChangeInterlinearToBaseScripture(
    translationWordIndex: number,
    translationWord: string,
    interlinearValue: string
  ): void {
    if (!interlinearValue && confirm('Advance one word to all associations to the right?')) {
      const parsedBook = this.parseBook(this.bookTarget, this.sourceLanguage);
      const wordMatrix = this.splitIntoMatrix(this.sourceLanguage, parsedBook.patterns, this.sourceVerse);
      let previousValue = '';
      for (let word of wordMatrix) {
        for (let segment of word.segments) {
          if (segment.index >= translationWordIndex) {
  
            if (segment.index == translationWordIndex) {
              previousValue = this.getInterlinear(segment.index);
  
              this.interlinearService.saveInterlinearToBaseScripture(
                this.bookTarget,
                this.interlinearTarget,
                this.originStructure.source,
                this.current,
                this.sourceVerse,
                this.sourceVerse,
                translationWordIndex,
                translationWord,
                interlinearValue
              );
            } else {
              const currentValue = this.getInterlinear(segment.index);
  
              this.interlinearService.saveInterlinearToBaseScripture(
                this.bookTarget,
                this.interlinearTarget,
                this.originStructure.source,
                this.current,
                this.sourceVerse,
                this.sourceVerse,
                segment.index,
                segment.word,
                previousValue
              );
              previousValue = currentValue;
            }
          }
        }
      }

      setTimeout(() => this.pipeUpdaterController++);
    } else {
      this.interlinearService.saveInterlinearToBaseScripture(
        this.bookTarget,
        this.interlinearTarget,
        this.originStructure.source,
        this.current,
        this.sourceVerse,
        this.sourceVerse,
        translationWordIndex,
        translationWord,
        interlinearValue
      );
    }
  }

  getInterlinear(wordIndex: number): string {
    return this.interlinearService.getInterlinear(
      this.sourceLanguage,
      this.bookTarget,
      this.interlinearTarget,
      this.originStructure.source,
      this.current,
      this.sourceVerse,
      wordIndex
    );
  }

  castSegmentIntoMetadataIndex(segment: WordSegment) {
    return this.dataService.castSegmentIntoMetadataIndex(this.sourceLanguage, segment);
  }

  cleanTranslationInterlinear() {
    if (!confirm('clean interlinear association for this verse?')) {
      return;
    }

    this.interlinearService.cleanTranslationInterlinear(
      this.bookTarget, this.interlinearTarget, this.originStructure.source, this.current, this.sourceVerse
    );
  }
}
