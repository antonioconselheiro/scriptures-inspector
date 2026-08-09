import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { BookVerse } from '@domain/book-verse-model';
import { SourceBook } from '@domain/source-book-model';
import { TranslationViewing } from '@domain/translation-viewing-model';
import { AbstractInspectorDiretive } from './abstract-inspector-directive';

@Directive()
export abstract class AbstractTranslatableDirective extends AbstractInspectorDiretive {

  protected readonly indexNotFound = -1;

  @Input()
  abstract source: string;

  @Input()
  abstract sourceBook: SourceBook;

  @Input()
  abstract sourceVerse: BookVerse<{ text: string; }>;

  @Input()
  abstract viewingTranslationBookRecord: { readonly [source: string]: TranslationViewing; };

  @Output()
  removeTranslation = new EventEmitter<string>();

  protected getCurrentVerseIndex(verses: Readonly<Array<BookVerse<{ text: string; }>>>): number {
    return verses.findIndex(verse => {
      const verseStartNumber = verse.verse.start;
      const verseEndNumber = verse.verse.end;

      const sourceVerseStartNumber = this.sourceVerse.verse.start;
      const sourceVerseEndNumber = this.sourceVerse.verse.end;

      return sourceVerseStartNumber <= verseStartNumber && verseStartNumber <= sourceVerseEndNumber
          || sourceVerseStartNumber <= verseEndNumber && verseEndNumber <= sourceVerseEndNumber;
    });
  }

  getViewingTranslations(): Array<{
    source: string;
    name: string;
    verses: Array<BookVerse<{ text: string; }>>;
  }> {
    return Object.keys(this.viewingTranslationBookRecord).map(source => {
      const translationViewing = this.viewingTranslationBookRecord[source];
      if (translationViewing.associatedTo.includes(this.source)) {
        const chapterIndex = this.viewingTranslationBookRecord[source].chapters.findIndex(chapter => chapter.chapter === this.current.chapter);
        const name = this.viewingTranslationBookRecord[source].name;

        if (chapterIndex !== this.indexNotFound) {
          const verses = this.viewingTranslationBookRecord[source].chapters[chapterIndex].verses;

          return {
            source,
            name,
            verses
          }
        } else {
          return {
            source,
            name,
            verses: []
          }
        }
      }

      return null;
    }).filter(has => !!has);
  }

  removeTranslationViewing(source: string): void {
    this.removeTranslation.emit(source);
  }
}
