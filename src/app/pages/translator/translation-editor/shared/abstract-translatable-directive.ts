import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { BookVerse } from '@domain/book-verse-model';
import { TranslationViewing } from '@domain/translation-viewing-model';
import { AbstractInspectorDiretive } from './abstract-inspector-directive';
import { SourceBook } from '@domain/source-book-model';

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
    return verses.findIndex(verse => verse.verse.start === this.sourceVerse.verse.start && verse.verse.end === this.sourceVerse.verse.end);
  }

  getTranslations(): Array<{
    source: string;
    name: string;
    verses: Readonly<BookVerse<{
      text: string;
    }>>[];
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
