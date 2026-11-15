import { Injectable } from '@angular/core';
import { CurrentChapter } from '@domain/current-chapter-model';
import { InterlinearTarget } from '@domain/interlinear-target-model';
import { Language } from '@domain/language-model';
import { SourceVerse } from '@domain/source-verse-model';
import { Word } from '@domain/word-model';
import { SystemService } from '@shared/system/system-service';
import { ProjectDataService } from './project-data-service';
import { getInterlinearOriginIndex, getInterlinearPresentationColor } from '../scripture-presentation-core';
import { applyAssociationOperation, AssociationOperation } from '../association-operations';
import { WordSegment } from '@domain/word-segment-model';

@Injectable({
  providedIn: 'root'
})
export class ProjectInterlinearService {

  private readonly indexNotFound = -1;

  constructor(
    private dataService: ProjectDataService,
    private systemService: SystemService
  ) { }

  getInterlinearToBaseScripture(
    interlinearTarget: InterlinearTarget,
    originStructureSource: string,
    current: CurrentChapter,
    translationVerse: SourceVerse
  ): {
    interlinearChapterIndex: number,
    interlinearVerseIndex: number
  } {
    interlinearTarget[originStructureSource] = interlinearTarget[originStructureSource] || {};
    interlinearTarget[originStructureSource].chapters = interlinearTarget[originStructureSource].chapters || [];
    const interlinearChapterIndex = interlinearTarget[originStructureSource].chapters.findIndex(chapter =>
      chapter?.chapter === current.chapter
    );

    if (interlinearChapterIndex === this.indexNotFound) {
      return {
        interlinearChapterIndex: this.indexNotFound,
        interlinearVerseIndex: this.indexNotFound
      };
    }

    interlinearTarget[originStructureSource]
      .chapters[interlinearChapterIndex].verses = interlinearTarget[originStructureSource]
        .chapters[interlinearChapterIndex].verses || [];

    const interlinearVerseIndex = interlinearTarget[originStructureSource].chapters[interlinearChapterIndex]
      .verses?.findIndex(verse => verse?.verse === translationVerse.verse) ?? this.indexNotFound;

    return {
      interlinearChapterIndex,
      interlinearVerseIndex
    };
  }

  createInterlinearToBaseScriptureIfNotExists(
    interlinearTarget: InterlinearTarget,
    originStructureSource: string,
    current: CurrentChapter,
    translationVerse: SourceVerse
  ): {
    interlinearChapterIndex: number,
    interlinearVerseIndex: number
  } {
    const indexes = this.getInterlinearToBaseScripture(interlinearTarget, originStructureSource, current, translationVerse);

    if (indexes.interlinearChapterIndex === this.indexNotFound) {
      const chapters = interlinearTarget[originStructureSource].chapters;

      const newChapter = {
        origin: current.chapter,
        chapter: current.chapter,
        verses: []
      };

      const insertIndex = chapters.findIndex(
        chapter => chapter.chapter > current.chapter
      );

      if (insertIndex === this.indexNotFound) {
        chapters.push(newChapter);
        indexes.interlinearChapterIndex = chapters.length - 1;
      } else {
        chapters.splice(insertIndex, 0, newChapter);
        indexes.interlinearChapterIndex = insertIndex;
      }
    }

    if (indexes.interlinearVerseIndex === this.indexNotFound) {
      const verses = interlinearTarget[originStructureSource]
        .chapters[indexes.interlinearChapterIndex]
        .verses;

      const newVerse = {
        originChapter: current.chapter,
        chapter: current.chapter,
        verse: translationVerse.verse,
        originVerse: translationVerse.verse,
        words: []
      };

      const insertIndex = verses.findIndex(
        verse => verse.verse > translationVerse.verse
      );

      if (insertIndex === this.indexNotFound) {
        verses.push(newVerse);
        indexes.interlinearVerseIndex = verses.length - 1;
      } else {
        verses.splice(insertIndex, 0, newVerse);
        indexes.interlinearVerseIndex = insertIndex;
      }
    }

    return indexes;
  }

  moveOneWordToAllAssociationsToTheRight(
    sourceLanguage: Language,
    interlinearTarget: InterlinearTarget,
    originSource: string,
    current: CurrentChapter,
    sourceVerse: SourceVerse,
    wordMatrix: Array<Word>,
    translationWordIndex: number,
    translationWord: string,
    interlinearValue: string
  ): void {
    const segments = wordMatrix.flatMap(word => word.segments)
      .filter(segment => segment.index >= translationWordIndex);
    this.applyAssociationOperation(
      sourceLanguage, interlinearTarget, originSource, current, sourceVerse, segments,
      { kind: 'move', selectedValue: interlinearValue },
      segment => segment.index === translationWordIndex ? translationWord : segment.word
    );
  }

  returnOneWordToAllAssociationsToTheRight(
    sourceLanguage: Language,
    interlinearTarget: InterlinearTarget,
    originSource: string,
    current: CurrentChapter,
    sourceVerse: SourceVerse,
    wordMatrix: Array<Word>,
    translationWordIndex: number
  ): void {
    const segments = wordMatrix
      .flatMap(word => word.segments)
      .filter(segment => segment.index >= translationWordIndex);

    this.applyAssociationOperation(
      sourceLanguage, interlinearTarget, originSource, current, sourceVerse, segments, { kind: 'return' }
    );
  }

  fillSequentiallyAllAssociationsToTheRight(
    sourceLanguage: Language,
    interlinearTarget: InterlinearTarget,
    originSource: string,
    current: CurrentChapter,
    sourceVerse: SourceVerse,
    wordMatrix: Array<Word>,
    originWordMatrix: Array<Word>,
    translationWordIndex: number,
    interlinearValue: string
  ): void {
    const segments = wordMatrix
      .flatMap(word => word.segments)
      .filter(segment => segment.index >= translationWordIndex);
    const originValues = originWordMatrix
      .flatMap(word => word.segments)
      .map(segment => this.dataService.castSegmentIntoMetadataIndexSerialized(sourceLanguage, segment));

    const clickedPosition = wordMatrix.flatMap(word => word.segments)
      .findIndex(segment => segment.index === translationWordIndex);
    this.applyAssociationOperation(
      sourceLanguage, interlinearTarget, originSource, current, sourceVerse, segments,
      {
        kind: 'fill',
        selectedValue: interlinearValue,
        originValues,
        fallbackPosition: Math.max(clickedPosition, 0),
        confirmOverwrite: () => confirm('Overwrite current definition?')
      }
    );
  }

  private applyAssociationOperation(
    sourceLanguage: Language,
    interlinearTarget: InterlinearTarget,
    originSource: string,
    current: CurrentChapter,
    sourceVerse: SourceVerse,
    segments: WordSegment[],
    operation: AssociationOperation,
    translationWord: (segment: WordSegment) => string = segment => segment.word
  ): void {
    applyAssociationOperation({
      entries: segments,
      read: segment => this.getInterlinearWordSegmentSerialized(
        sourceLanguage, interlinearTarget, originSource, current, sourceVerse, segment.index
      ),
      write: (segment, value) => this.saveInterlinearToBaseScripture(
        interlinearTarget, originSource, current, sourceVerse, segment.index, translationWord(segment), value
      )
    }, operation);
  }

  saveInterlinearToBaseScripture(
    interlinearTarget: InterlinearTarget,
    originStructureSource: string,
    current: CurrentChapter,
    translationVerse: SourceVerse,
    translationWordIndex: number,
    translationWord: string,
    interlinearOptionValue: string
  ): void {
    const indexes = this.createInterlinearToBaseScriptureIfNotExists(interlinearTarget, originStructureSource, current, translationVerse);
    const wordInterlinearAssociation = interlinearTarget[originStructureSource]
      .chapters[indexes.interlinearChapterIndex]
      .verses[indexes.interlinearVerseIndex];

    if (interlinearOptionValue) {
      const [scriptureWordIndexString, scriptureWord] = interlinearOptionValue.split('-');
      const scriptureWordIndex = Number(scriptureWordIndexString);
  
      wordInterlinearAssociation.words[translationWordIndex] = {
        originIndex: scriptureWordIndex,
        originWord: scriptureWord,
        translationIndex: translationWordIndex,
        translationWord: translationWord
      };
    } else {
      delete wordInterlinearAssociation.words[translationWordIndex];
    }

    this.systemService.triggerSaveCurrentBookInterlinear(current);
  }

  getTranslationColor(
    interlinearTarget: InterlinearTarget,
    originStructureSource: string,
    current: CurrentChapter,
    sourceVerse: SourceVerse,
    wordIndex: number
  ) {
    return getInterlinearPresentationColor(
      interlinearTarget, originStructureSource, current, sourceVerse, wordIndex
    );
  }

  getOriginWordIndex(
    interlinearTarget: InterlinearTarget,
    originStructureSource: string,
    current: CurrentChapter,
    sourceVerse: SourceVerse,
    translationWordIndex: number
  ): number | null {
    return getInterlinearOriginIndex(
      interlinearTarget, originStructureSource, current, sourceVerse, translationWordIndex
    );
  }

  getOriginVerseReference(
    interlinearTarget: InterlinearTarget,
    originStructureSource: string,
    current: CurrentChapter,
    sourceVerse: SourceVerse
  ): { chapter: number; verse: number; } | null {
    const chapter = interlinearTarget[originStructureSource]?.chapters
      .find(item => item?.chapter === current.chapter);
    const verse = chapter?.verses?.find(item => item?.verse === sourceVerse.verse);

    if (!chapter || !verse || verse.originVerse === undefined) {
      return null;
    }

    return {
      chapter: verse.originChapter ?? chapter.origin,
      verse: verse.originVerse
    };
  }

  getInterlinearWordSegmentSerialized(
    language: Language,
    interlinearTarget: InterlinearTarget,
    originStructureSource: string,
    current: CurrentChapter,
    translationVerse: SourceVerse,
    translationWordIndex: number
  ): string {
    const indexes = this.getInterlinearToBaseScripture(interlinearTarget, originStructureSource, current, translationVerse);
    if (indexes.interlinearChapterIndex === this.indexNotFound || indexes.interlinearVerseIndex === this.indexNotFound) {
      return '';
    }

    try {
      const interlinearMetadata = interlinearTarget[originStructureSource] &&
        interlinearTarget[originStructureSource].chapters[indexes.interlinearChapterIndex] &&
        interlinearTarget[originStructureSource].chapters[indexes.interlinearChapterIndex].verses[indexes.interlinearVerseIndex] &&
        interlinearTarget[originStructureSource].chapters[indexes.interlinearChapterIndex].verses[indexes.interlinearVerseIndex].words[translationWordIndex] || null;

      if (interlinearMetadata) {
        return this.dataService.castInterlinearWordTargetIntoMetadataIndexSerialized(language, interlinearMetadata);
      }
    } catch (e) {
      console.error(e);
    }

    return '';
  }

  cleanTranslationInterlinear(
    interlinearTarget: InterlinearTarget,
    originStructureSource: string,
    current: CurrentChapter,
    translationVerse: SourceVerse
  ): void {
    const indexes = this.getInterlinearToBaseScripture(interlinearTarget, originStructureSource, current, translationVerse);
    if (indexes.interlinearChapterIndex === this.indexNotFound || indexes.interlinearVerseIndex === this.indexNotFound) {
      return;
    }

    const verse = interlinearTarget[originStructureSource] &&
      interlinearTarget[originStructureSource].chapters[indexes.interlinearChapterIndex] &&
      interlinearTarget[originStructureSource].chapters[indexes.interlinearChapterIndex].verses[indexes.interlinearVerseIndex];

    if (verse && verse.words) {
      verse.words = [];
    }

    this.systemService.triggerSaveCurrentBookInterlinear(current);
  }
}
