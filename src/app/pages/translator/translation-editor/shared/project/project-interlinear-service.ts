import { Injectable } from '@angular/core';
import { InterlinearTarget } from '@domain/interlinear-target-model';
import { BookMetadataTarget } from '@domain/book-metadata-target-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { SourceVerse } from '@domain/source-verse-model';
import { TranslationInterlinearVerse } from '@domain/translation-interlinear-verse-model';
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

  createInterlinearToBaseScriptureIfNotExists(
    interlinearTarget: InterlinearTarget,
    originStructureSource: string,
    current: CurrentChapter,
    sourceVerse: SourceVerse
  ): {
    interlinearChapterIndex: number,
    interlinearVerseIndex: number
  } {
    interlinearTarget[originStructureSource] = interlinearTarget[originStructureSource] || {};
    interlinearTarget[originStructureSource].chapters = interlinearTarget[originStructureSource].chapters || [];
    let interlinearChapterIndex = interlinearTarget[originStructureSource].chapters.findIndex(chapter => chapter.chapter === current.chapter);

    if (interlinearChapterIndex === this.indexNotFound) {
      //  TODO: encaixar na posição correta e não no final
      interlinearTarget[originStructureSource].chapters.push({
        origin: current.chapter,
        chapter: current.chapter,
        verses: []
      });

      interlinearChapterIndex = interlinearTarget[originStructureSource].chapters.length - 1;
    }

    interlinearTarget[originStructureSource]
      .chapters[interlinearChapterIndex].verses = interlinearTarget[originStructureSource]
      .chapters[interlinearChapterIndex].verses || [];

    let interlinearVerseIndex = interlinearTarget[originStructureSource].chapters[interlinearChapterIndex]
      .verses.findIndex(verse => verse.verse === sourceVerse.verse);

    if (interlinearVerseIndex === this.indexNotFound) {
      //  TODO: encaixar na posição correta e não no final
      interlinearTarget[originStructureSource].chapters[interlinearChapterIndex].verses.push({
        originChapter: current.chapter,
        chapter: current.chapter,
        verse: sourceVerse.verse,
        originVerse: sourceVerse.verse,
        words: []
      });
      interlinearVerseIndex = interlinearTarget[originStructureSource].chapters[interlinearChapterIndex].verses.length - 1;
    }

    return {
      interlinearChapterIndex,
      interlinearVerseIndex
    };
  }

  saveInterlinearToBaseScripture(
    interlinearTarget: InterlinearTarget,
    originStructureSource: string,
    current: CurrentChapter,
    sourceVerse: SourceVerse,
    translationWordIndex: number,
    translationWord: string,
    interlinearOptionValue: string
  ): void {
    const [scriptureWordIndexString, scriptureWord] = interlinearOptionValue.split('-');
    const scriptureWordIndex = Number(scriptureWordIndexString);

    const indexes = this.createInterlinearToBaseScriptureIfNotExists(interlinearTarget, originStructureSource, current, sourceVerse);
    const wordInterlinearAssociation = interlinearTarget[originStructureSource]
      .chapters[indexes.interlinearChapterIndex]
      .verses[indexes.interlinearVerseIndex];

    wordInterlinearAssociation.words[translationWordIndex] = {
      originIndex: scriptureWordIndex,
      originWord: scriptureWord,
      translationIndex: translationWordIndex,
      translationWord: translationWord
    };

    this.systemService.triggerSaveCurrentBookInterlinear(current);
  }

  getInterlinear(
    language: LanguageUnionType,
    bookTarget: BookMetadataTarget,
    interlinearTarget: InterlinearTarget,
    originStructureSource: string,
    current: CurrentChapter,
    translationVerse: SourceVerse,
    translationWordIndex: number
  ): string {
    let interlinear: TranslationInterlinearVerse | null = null;
    const chapterIndex = bookTarget.chapters.findIndex(chapter => chapter.chapter === current.chapter);
    if (chapterIndex === this.indexNotFound) {
      return '';
    }

    try {
      interlinear = bookTarget.chapters[chapterIndex] &&
        bookTarget.chapters[chapterIndex].verses[translationVerse.verse.index] &&
        bookTarget.chapters[chapterIndex].verses[translationVerse.verse.index][translationWordIndex];

      if (interlinear) {
        return this.dataService.castSegmentIntoMetadataIndex(language, interlinear.origin);
      }
    } catch (e) {
      console.error(e);
    }

    return '';
  }

  cleanTranslationInterlinear(
    bookTarget: BookMetadataTarget,
    interlinearTarget: InterlinearTarget,
    originStructureSource: string,
    current: CurrentChapter,
    translationVerse: SourceVerse
  ): void {
    const chapterIndex = bookTarget.chapters.findIndex(chapter => chapter.chapter === current.chapter);
    if (!bookTarget.chapters[chapterIndex]) {
      return;
    }

    if (bookTarget.chapters[chapterIndex].verses[translationVerse.verse.index]) {
      bookTarget.chapters[chapterIndex].verses[translationVerse.verse.index] = [];
    }

    this.systemService.triggerSaveCurrentBookInterlinear(current);
  }
}
