import { Injectable } from '@angular/core';
import { SourceVerse } from '@domain/source-verse-model';
import { TranslationInterlinearVerse } from '@domain/translation-interlinear-verse-model';
import { ProjectService } from './project-service';
import { TranslationInterlinear } from '@domain/translation-interlinear-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { SystemService } from '@shared/system/system-service';
import { Language } from '@domain/language-model';

@Injectable({
  providedIn: 'root'
})
export class ProjectTranslationMetadataService {

  constructor(
    private projectService: ProjectService,
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

    if (!translation.codex[current.book]) {
      translation.codex[current.book] = {
        chapters: []
      };
    }

    if (!translation.codex[current.book].chapters[current.chapter]) {
      translation.codex[current.book].chapters[current.chapter] = [];
    }

    if (!translation.codex[current.book].chapters[current.chapter][translationVerse.verse.index]) {
      translation.codex[current.book].chapters[current.chapter][translationVerse.verse.index] = [];
    }

    translation.codex[current.book].chapters[current.chapter][translationVerse.verse.index][translationWordIndex] = {
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
    lang: Language,
    translation: TranslationInterlinear,
    current: CurrentChapter,
    translationVerse: SourceVerse,
    translationWordIndex: number
  ): string {
    let interlinear: TranslationInterlinearVerse;

    try {
      interlinear = translation.codex[current.book].chapters[current.chapter][translationVerse.verse.index][translationWordIndex];

      if (interlinear) {
        return this.projectService.castSegmentIntoMetadataIndex(lang, interlinear.origin);
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
      !translation.codex[current.book] ||
      !translation.codex[current.book].chapters[current.chapter]
    ) {
      return;
    }

    if (translation.codex[current.book].chapters[current.chapter][translationVerse.verse.index]) {
      translation.codex[current.book].chapters[current.chapter][translationVerse.verse.index] = [];
    }

    this.systemService.autoSaveCurrentProject();
  }

}
