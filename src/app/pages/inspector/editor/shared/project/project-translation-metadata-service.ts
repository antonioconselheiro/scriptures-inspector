import { Injectable } from '@angular/core';
import { BookInterlinear } from '@domain/book-interlinear-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { SourceVerse } from '@domain/source-verse-model';
import { TranslationInterlinearVerse } from '@domain/translation-interlinear-verse-model';
import { SystemService } from '@shared/system/system-service';
import { ProjectDataService } from './project-data-service';

@Injectable({
  providedIn: 'root'
})
export class ProjectTranslationMetadataService {

  constructor(
    private projectService: ProjectDataService,
    private systemService: SystemService
  ) { }

  onSelectInterlinearGeezToScripture(
    interlinearTarget: BookInterlinear,
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

    //  TODO: mover created if not exists para o resolver
    // if (!interlinear.target[current.book]) {
    //   interlinear.target[current.book] = {
    //     chapters: []
    //   };
    // }

    if (!interlinearTarget.chapters[current.chapter]) {
      interlinearTarget.chapters[current.chapter] = [];
    }

    if (!interlinearTarget.chapters[current.chapter][translationVerse.verse.index]) {
      interlinearTarget.chapters[current.chapter][translationVerse.verse.index] = [];
    }

    interlinearTarget.chapters[current.chapter][translationVerse.verse.index][translationWordIndex] = {
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

    this.systemService.autoSaveCurrentProject();
  }

  getInterlinear(
    language: LanguageUnionType,
    interlinearTarget: BookInterlinear,
    current: CurrentChapter,
    translationVerse: SourceVerse,
    translationWordIndex: number
  ): string {
    let interlinear: TranslationInterlinearVerse;

    try {
      interlinear = interlinearTarget.chapters[current.chapter][translationVerse.verse.index][translationWordIndex];

      if (interlinear) {
        return this.projectService.castSegmentIntoMetadataIndex(language, interlinear.origin);
      }
    } catch {

    }

    return '';
  }

  cleanTranslationInterlinear(
    interlinearTarget: BookInterlinear,
    current: CurrentChapter,
    translationVerse: SourceVerse
  ): void {
    if (
      !interlinearTarget.chapters[current.chapter]
    ) {
      return;
    }

    if (interlinearTarget.chapters[current.chapter][translationVerse.verse.index]) {
      interlinearTarget.chapters[current.chapter][translationVerse.verse.index] = [];
    }

    this.systemService.autoSaveCurrentProject();
  }

}
