import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookInterlinearTarget } from '@domain/book-interlinear-target-model';
import { BookTranslationTarget } from '@domain/book-translation-target-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { Language } from '@domain/language-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { ParsedPatterns } from '@domain/parsed-patterns';
import { SourceBook } from '@domain/source-book-model';
import { SourceVerse } from '@domain/source-verse-model';
import { TargetTranslationMetadataDetail } from '@domain/target-translation-metadata-detail-model';
import { Word } from '@domain/word-model';
import { WordSegment } from '@domain/word-segment-model';
import { AddPatternContextMenu } from '../../add-pattern-context-menu/add-pattern-context-menu';
import { AddPatternContextMenuTrigger } from '../../add-pattern-context-menu/add-pattern-context-menu-trigger';
import { CustomTranslationComponent } from '../custom-translation/custom-translation-component';
import { AbstractInspectorDiretive } from '../shared/abstract-inspector-directive';
import { FunctionProxyPipe } from '../shared/function-proxy-pipe';
import { LexicalPipe } from '../shared/lexical-pipe';
import { ProjectDataService } from '../shared/project/project-data-service';
import { ProjectInterlinearService } from '../shared/project/project-interlinear-service';
import { ProjectMetadataService } from '../shared/project/project-metadata-service';

@Component({
  selector: 'app-interlinear-component',
  imports: [
    FormsModule,
    LexicalPipe,
    FunctionProxyPipe,
    CustomTranslationComponent,
    AddPatternContextMenuTrigger,
    CommonModule
  ],
  templateUrl: './interlinear-component.html',
  styleUrl: './interlinear-component.scss'
})
export class InterlinearComponent extends AbstractInspectorDiretive {

  @Input()
  current!: CurrentChapter;

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
  parsedBook!: ParsedBookMetadata;

  @Input()
  sourceVerse!: SourceVerse;

  @Input()
  bookTarget!: BookInterlinearTarget;

  @Input()
  customTranslation: BookTranslationTarget | undefined;

  @Input()
  variations: Array<TargetTranslationMetadataDetail> = [];

  @Input()
  addPatternMenuRef!: AddPatternContextMenu;

  minified = false;

  private readonly indexNotFound = -1;

  constructor(
    private dataService: ProjectDataService,
    protected metadataService: ProjectMetadataService,
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

  splitIntoMatrix(language: Language, patterns: ParsedPatterns, sourceVerse: SourceVerse): Array<Word> {
    return this.dataService.splitIntoMatrix(language, patterns, sourceVerse.text);
  }

  splitByLanguageWordSeparator(languageName: LanguageUnionType, text: string): Array<{
    word: string;
    separator?: string;
  }> {
    const language = this.languageMetadataRecord[languageName];
    return this.dataService.splitByLanguageWordSeparator(language, text);
  }

  onChangeInterlinearToBaseScripture(
    translationWordIndex: number,
    translationWord: string,
    interlinearValue: string
  ): void {
    if (!interlinearValue && confirm('Advance one word to all associations to the right?')) {
      const wordMatrix = this.splitIntoMatrix(this.languageMetadataRecord[this.sourceLanguage], this.parsedBook.patterns, this.sourceVerse);
      let previousValue = '';
      for (let word of wordMatrix) {
        for (let segment of word.segments) {
          if (segment.index >= translationWordIndex) {
  
            if (segment.index == translationWordIndex) {
              previousValue = this.getInterlinear(segment.index);
  
              this.interlinearService.saveInterlinearToBaseScripture(
                this.bookTarget,
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
      this.bookTarget, this.current, this.sourceVerse
    );
  }
}
