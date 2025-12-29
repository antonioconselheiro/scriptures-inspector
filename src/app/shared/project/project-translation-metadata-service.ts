import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProjectTranslationMetadataService {

  splitIntoMatrix() {

  }

  onSelectInterlinearGeezToScripture(
    scriptureVerse: SourceVerse,
    geezVerse: SourceVerse,
    geezWordIndex: number,
    geezWord: string,
    interlinear: string,
    lang: 'hebraic' | 'greek'
  ): void {
    const [scriptureWordIndexString, scriptureWord] = interlinear.split('-');
    const scriptureWordIndex = Number(scriptureWordIndexString);
    const scriptureVerseNumber = Number(scriptureVerse.verse.start);
    const geezVerseNumber = Number(geezVerse.verse.start);
    let interlinearMetadata: { [book: string]: TranslationInterlinearVerse[][][] } = {};

    if (lang === 'hebraic' && this.isOldBookGuard(this.currentBook)) {
      interlinearMetadata = this.interlinearGeezHebraic;
    } else if (lang === 'greek' && this.isNewBookGuard(this.currentBook)) {
      interlinearMetadata = this.interlinearGeezGreek;
    } else {
      return;
    }

    if (!interlinearMetadata[this.currentBook]) {
      interlinearMetadata[this.currentBook] = [];
    }

    if (!interlinearMetadata[this.currentBook][this.currentChapter]) {
      interlinearMetadata[this.currentBook][this.currentChapter] = [];
    }

    if (!interlinearMetadata[this.currentBook][this.currentChapter][geezVerse.verse.index]) {
      interlinearMetadata[this.currentBook][this.currentChapter][geezVerse.verse.index] = [];
    }

    interlinearMetadata[this.currentBook][this.currentChapter][geezVerse.verse.index][geezWordIndex] = {
      origin: {
        verse: scriptureVerseNumber,
        index: scriptureWordIndex,
        word: scriptureWord
      },

      translation: {
        verse: geezVerseNumber,
        index: geezWordIndex,
        word: geezWord
      }
    };

    if (lang === 'hebraic') {
      this.interlinearGeezHebraic = this.documentStorage.saveInterlinearGeezHebraic(this.interlinearGeezHebraic);
    } else if (lang === 'greek') {
      this.interlinearGeezGreek = this.documentStorage.saveInterlinearGeezGreek(this.interlinearGeezGreek);
    }
  }

  getGeezInterlinear(geezVerse: SourceVerse, geezWordIndex: number): string {
    let interlinear: TranslationInterlinearVerse;

    try {
      if (this.isOldBookGuard(this.currentBook)) {
        interlinear = this.interlinearGeezHebraic[this.currentBook][this.currentChapter][geezVerse.verse.index][geezWordIndex];
      } else if (this.isNewBookGuard(this.currentBook)) {
        interlinear = this.interlinearGeezGreek[this.currentBook][this.currentChapter][geezVerse.verse.index][geezWordIndex];
      } else {
        return '';
      }

      if (interlinear) {
        return this.castSegmentIntoMetadataIndex(interlinear.origin);
      }
    } catch {

    }

    return '';
  }

  castSegmentIntoMetadataIndex() {

  }

    cleanGeezTranslationInterlinear(geezVerse: SourceVerse, lang: 'hebraic' | 'greek'): void {
      if (!confirm('clean interlinear association for this verse?')) {
        return;
      }
  
      let interlinearMetadata: { [book: string]: TranslationInterlinearVerse[][][] } = {};
  
      if (lang === 'hebraic' && this.isOldBookGuard(this.currentBook)) {
        interlinearMetadata = this.interlinearGeezHebraic;
      } else if (lang === 'greek' && this.isNewBookGuard(this.currentBook)) {
        interlinearMetadata = this.interlinearGeezGreek;
      } else {
        return;
      }
  
      if (
        !interlinearMetadata[this.currentBook] ||
        !interlinearMetadata[this.currentBook][this.currentChapter]
      ) {
        return;
      }
  
      if (interlinearMetadata[this.currentBook][this.currentChapter][geezVerse.verse.index]) {
        interlinearMetadata[this.currentBook][this.currentChapter][geezVerse.verse.index] = [];
      }
  
      if (lang === 'hebraic') {
        this.interlinearGeezHebraic = this.documentStorage.saveInterlinearGeezHebraic(this.interlinearGeezHebraic);
      } else if (lang === 'greek') {
        this.interlinearGeezGreek = this.documentStorage.saveInterlinearGeezGreek(this.interlinearGeezGreek);
      }
    }

}
