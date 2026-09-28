import { Injectable } from '@angular/core';
import { CurrentChapter } from '@domain/current-chapter-model';
import { InterlinearTarget } from '@domain/interlinear-target-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { SourceVerse } from '@domain/source-verse-model';
import { Word } from '@domain/word-model';
import { SystemService } from '@shared/system/system-service';
import { ProjectDataService } from './project-data-service';

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
    const interlinearChapterIndex = interlinearTarget[originStructureSource].chapters.findIndex(chapter => chapter.chapter === current.chapter);

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
      .verses.findIndex(verse => verse.verse === translationVerse.verse);

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
    sourceLanguage: LanguageUnionType,
    interlinearTarget: InterlinearTarget,
    originSource: string,
    current: CurrentChapter,
    sourceVerse: SourceVerse,
    wordMatrix: Array<Word>,
    translationWordIndex: number,
    translationWord: string,
    interlinearValue: string
  ): void {
    let previousValue = '';

    for (let word of wordMatrix) {
      for (let segment of word.segments) {
        if (segment.index >= translationWordIndex) {

          if (segment.index == translationWordIndex) {
            previousValue = this.getInterlinearWordSegmentSerialized(
              sourceLanguage,
              interlinearTarget,
              originSource,
              current,
              sourceVerse,
              segment.index
            );

            this.saveInterlinearToBaseScripture(
              interlinearTarget,
              originSource,
              current,
              sourceVerse,
              translationWordIndex,
              translationWord,
              interlinearValue
            );
          } else {
            const currentValue = this.getInterlinearWordSegmentSerialized(
              sourceLanguage,
              interlinearTarget,
              originSource,
              current,
              sourceVerse,
              segment.index
            );

            this.saveInterlinearToBaseScripture(
              interlinearTarget,
              originSource,
              current,
              sourceVerse,
              segment.index,
              segment.word,
              previousValue
            );
            previousValue = currentValue;
          }
        }
      }
    }
  }

  returnOneWordToAllAssociationsToTheRight(
    sourceLanguage: LanguageUnionType,
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

    const values = segments.map(segment => this.getInterlinearWordSegmentSerialized(
      sourceLanguage,
      interlinearTarget,
      originSource,
      current,
      sourceVerse,
      segment.index
    ));

    segments.forEach((segment, i) => {
      this.saveInterlinearToBaseScripture(
        interlinearTarget,
        originSource,
        current,
        sourceVerse,
        segment.index,
        segment.word,
        values[i + 1] || ''
      );
    });
  }

  fillSequentiallyAllAssociationsToTheRight(
    sourceLanguage: LanguageUnionType,
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

    // starts from the clicked select value or, if empty, from the origin word at the same position
    let originStart = originValues.indexOf(interlinearValue);
    if (originStart === this.indexNotFound) {
      const clickedPosition = wordMatrix
        .flatMap(word => word.segments)
        .findIndex(segment => segment.index === translationWordIndex);
      originStart = Math.max(clickedPosition, 0);
    }

    const newValues = segments.map((_, i) => originValues[originStart + i] || '');
    const hasDefinitionToOverwrite = segments.some((segment, i) => {
      const currentValue = this.getInterlinearWordSegmentSerialized(
        sourceLanguage,
        interlinearTarget,
        originSource,
        current,
        sourceVerse,
        segment.index
      );

      return currentValue && currentValue !== newValues[i];
    });

    if (hasDefinitionToOverwrite && !confirm('Overwrite current definition?')) {
      return;
    }

    segments.forEach((segment, i) => {
      this.saveInterlinearToBaseScripture(
        interlinearTarget,
        originSource,
        current,
        sourceVerse,
        segment.index,
        segment.word,
        newValues[i]
      );
    });
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
    const indexes = this.getInterlinearToBaseScripture(
      interlinearTarget,
      originStructureSource,
      current,
      sourceVerse
    );

    if (indexes.interlinearChapterIndex === this.indexNotFound || indexes.interlinearVerseIndex === this.indexNotFound) {
      return '';
    }

    const interlinearWord = interlinearTarget[originStructureSource]
      .chapters[indexes.interlinearChapterIndex]
      .verses[indexes.interlinearVerseIndex]
      .words[wordIndex] || null;

    if (!interlinearWord) {
      return '';
    }

    return String(interlinearWord.originIndex % 7 + 1);
  }

  getInterlinearWordSegmentSerialized(
    language: LanguageUnionType,
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
