import { Injectable } from '@angular/core';
import { CurrentChapter } from '@domain/current-chapter-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { SourceVerse } from '@domain/source-verse-model';
import { TranslationInterlinear } from '@domain/translation-interlinear-model';
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
    translation: TranslationInterlinear,
    current: CurrentChapter,
    sourceVerse: SourceVerse,
    translationVerse: SourceVerse,
    translationWordIndex: number,
    translationWord: string,
    interlinear: string
  ): void {
    const [scriptureWordIndexString, scriptureWord] = interlinear.split('-');
    const scriptureWordIndex = Number(scriptureWordIndexString);
    const scriptureVerseNumber = Number(sourceVerse.verse.start);
    const geezVerseNumber = Number(translationVerse.verse.start);

    if (!translation.target[current.book]) {
      translation.target[current.book] = {
        chapters: []
      };
    }

    if (!translation.target[current.book].chapters[current.chapter]) {
      translation.target[current.book].chapters[current.chapter] = [];
    }

    if (!translation.target[current.book].chapters[current.chapter][translationVerse.verse.index]) {
      translation.target[current.book].chapters[current.chapter][translationVerse.verse.index] = [];
    }

    translation.target[current.book].chapters[current.chapter][translationVerse.verse.index][translationWordIndex] = {
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
    translation: TranslationInterlinear,
    current: CurrentChapter,
    translationVerse: SourceVerse,
    translationWordIndex: number
  ): string {
    let interlinear: TranslationInterlinearVerse;

    try {
      interlinear = translation.target[current.book].chapters[current.chapter][translationVerse.verse.index][translationWordIndex];

      if (interlinear) {
        return this.projectService.castSegmentIntoMetadataIndex(language, interlinear.origin);
      }
    } catch {

    }

    return '';
  }

  cleanTranslationInterlinear(
    translation: TranslationInterlinear,
    current: CurrentChapter,
    translationVerse: SourceVerse
  ): void {
    if (
      !translation.target[current.book] ||
      !translation.target[current.book].chapters[current.chapter]
    ) {
      return;
    }

    if (translation.target[current.book].chapters[current.chapter][translationVerse.verse.index]) {
      translation.target[current.book].chapters[current.chapter][translationVerse.verse.index] = [];
    }

    this.systemService.autoSaveCurrentProject();
  }

}
