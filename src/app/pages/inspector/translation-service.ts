import { Injectable } from '@angular/core';
import { TranslationBookVerse } from './domain/translation-book-verse-model';
import { Translation } from './domain/translation-model';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  getChapter(translation: Translation | null, book: string, chapter: number): Array<TranslationBookVerse> {
    if (!translation) {
      return [];
    }

    const bookContent = translation.content.find(content => content.key === book);
    if (!bookContent) {
      return [];
    }

    return bookContent.content[chapter];
  }

  getVerse() {
    // precisa pegar o versiculo compativel não por index, mas por start e end
  }
}
