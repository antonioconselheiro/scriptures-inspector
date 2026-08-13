import { Injectable } from '@angular/core';
import { BookInterlinearTarget } from '@domain/book-interlinear-target-model';
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

  saveInterlinearToBaseScripture(
    bookTarget: BookMetadataTarget,
    interlinearTarget: BookInterlinearTarget,
    originStructureSource: string,
    current: CurrentChapter,
    sourceVerse: SourceVerse,
    translationVerse: SourceVerse,
    translationWordIndex: number,
    translationWord: string,
    interlinearOptionValue: string
  ): void {
    const [scriptureWordIndexString, scriptureWord] = interlinearOptionValue.split('-');
    const scriptureWordIndex = Number(scriptureWordIndexString);
    const scriptureVerseNumber = sourceVerse.verse;
    const interlinearVerseNumber = translationVerse.verse;
    const chapterIndex = bookTarget.chapters.findIndex(chapter => chapter.chapter === current.chapter);

    if (chapterIndex === this.indexNotFound || !bookTarget.chapters[chapterIndex]) {
      bookTarget.chapters[chapterIndex] = {
        chapter: current.chapter,
        verses: []
      };
    }

    if (!bookTarget.chapters[chapterIndex].verses[translationVerse.verse.index]) {
      bookTarget.chapters[chapterIndex].verses[translationVerse.verse.index] = [];
    }

    if (scriptureWordIndex === 0 && scriptureWord === undefined) {
      bookTarget.chapters[chapterIndex].verses[translationVerse.verse.index][translationWordIndex] = null;
    } else {
      bookTarget.chapters[chapterIndex].verses[translationVerse.verse.index][translationWordIndex] = {
        origin: {
          verse: scriptureVerseNumber,
          index: scriptureWordIndex,
          word: scriptureWord
        },

        translation: {
          verse: interlinearVerseNumber,
          index: translationWordIndex,
          word: translationWord
        }
      };
    }

    this.systemService.triggerSaveCurrentBookInterlinear(current);
  }

  getInterlinear(
    language: LanguageUnionType,
    bookTarget: BookMetadataTarget,
    interlinearTarget: BookInterlinearTarget,
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
    interlinearTarget: BookInterlinearTarget,
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
