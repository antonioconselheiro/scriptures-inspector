import { Injectable } from '@angular/core';
import { BookInterlinearTarget } from '@domain/book-interlinear-target-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { SourceVerse } from '@domain/source-verse-model';
import { TranslationInterlinearVerse } from '@domain/translation-interlinear-verse-model';
import { SystemService } from '@shared/system/system-service';
import { ProjectDataService } from './project-data-service';
import { VerseNumberInterlinear } from '@domain/verse-number-interlinear-model';

@Injectable({
  providedIn: 'root'
})
export class ProjectInterlinearService {

  constructor(
    private projectService: ProjectDataService,
    private systemService: SystemService
  ) { }

  onSelectInterlinearToBaseScripture(
    interlinearTarget: BookInterlinearTarget,
    current: CurrentChapter,
    sourceVerse: SourceVerse,
    translationVerse: SourceVerse,
    translationWordIndex: number,
    translationWord: string,
    interlinearOptionValue: string
  ): void {
    const [scriptureWordIndexString, scriptureWord] = interlinearOptionValue.split('-');
    const scriptureWordIndex = Number(scriptureWordIndexString);
    const scriptureVerseNumber = Number(sourceVerse.verse.start);
    const geezVerseNumber = Number(translationVerse.verse.start);
    const chapterIndex = current.chapter - 1;

    if (!interlinearTarget.chapters[chapterIndex]) {
      interlinearTarget.chapters[chapterIndex] = {
        chapter: current.chapter,
        verses: []
      };
    }

    if (!interlinearTarget.chapters[chapterIndex].verses[translationVerse.verse.index]) {
      interlinearTarget.chapters[chapterIndex].verses[translationVerse.verse.index] = [];
    }

    if (scriptureWordIndex === 0 && scriptureWord === undefined) {
      interlinearTarget.chapters[chapterIndex].verses[translationVerse.verse.index][translationWordIndex] = null;
    } else {
      interlinearTarget.chapters[chapterIndex].verses[translationVerse.verse.index][translationWordIndex] = {
        origin: {
          verse: scriptureVerseNumber,
          index: scriptureWordIndex,
          word: scriptureWord
        },

        translation: {
          verse: geezVerseNumber,
          index: translationWordIndex,
          word: translationWord
        }
      };
    }

    this.systemService.triggerSaveCurrentBookInterlinear(current);
  }

  getInterlinear(
    language: LanguageUnionType,
    interlinearTarget: BookInterlinearTarget,
    current: CurrentChapter,
    translationVerse: SourceVerse,
    translationWordIndex: number
  ): string {
    let interlinear: TranslationInterlinearVerse | null = null;
    const chapterIndex = current.chapter - 1;

    try {
      interlinear = interlinearTarget.chapters[chapterIndex] &&
        interlinearTarget.chapters[chapterIndex].verses[translationVerse.verse.index] &&
        interlinearTarget.chapters[chapterIndex].verses[translationVerse.verse.index][translationWordIndex];

      if (interlinear) {
        return this.projectService.castSegmentIntoMetadataIndex(language, interlinear.origin);
      }
    } catch (e) {
      console.error(e);
    }

    return '';
  }

  cleanTranslationInterlinear(
    interlinearTarget: BookInterlinearTarget,
    current: CurrentChapter,
    translationVerse: SourceVerse
  ): void {
    const chapterIndex = current.chapter - 1;
    if (
      !interlinearTarget.chapters[chapterIndex]
    ) {
      return;
    }

    if (interlinearTarget.chapters[chapterIndex].verses[translationVerse.verse.index]) {
      interlinearTarget.chapters[chapterIndex].verses[translationVerse.verse.index] = [];
    }

    this.systemService.triggerSaveCurrentBookInterlinear(current);
  }
}
