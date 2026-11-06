import { Directive, Input } from '@angular/core';
import { BookVerse } from '@domain/book-verse-model';
import { Language } from '@domain/language-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { ParsedPatterns } from '@domain/parsed-patterns-model';
import { ProjectStructureMetadata } from '@domain/project-structure-metadata-model';
import { SourceBook } from '@domain/source-book-model';
import { TranslationViewing } from '@domain/translation-viewing-model';
import { Word } from '@domain/word-model';
import { SystemService } from '@shared/system/system-service';
import { AbstractInspectorDiretive } from './abstract-inspector-directive';
import { ProjectDataService } from './project/project-data-service';

@Directive()
export abstract class AbstractTranslatableDirective extends AbstractInspectorDiretive {

  private wordListCache?: {
    language: Language;
    text: string;
    words: Array<{ word: string; separator?: string; }>;
  };

  private readonly wordMatrixCache: Array<{
    language: Language;
    patterns: ParsedPatterns;
    text: string;
    words: Array<Word>;
  }> = [];

  protected readonly indexNotFound = -1;

  @Input()
  abstract structure: ProjectStructureMetadata;

  @Input()
  abstract sourceBook: SourceBook;

  @Input()
  abstract sourceVerse: BookVerse<{ text: string; }>;

  @Input()
  abstract viewingTranslationBookRecord: { [source: string]: TranslationViewing; };

  protected abstract systemService: SystemService;
  protected abstract dataService: ProjectDataService;

  splitByLanguageWordSeparator(languageName: LanguageUnionType, text: string): Array<{
    word: string;
    separator?: string;
  }> {
    const language = this.languageMetadataRecord[languageName];
    if (this.wordListCache?.language !== language || this.wordListCache.text !== text) {
      this.wordListCache = {
        language,
        text,
        words: this.dataService.splitByLanguageWordSeparator(language, text)
      };
    }

    return this.wordListCache.words;
  }

  protected getWordMatrix(
    languageName: LanguageUnionType,
    patterns: ParsedPatterns,
    text: string
  ): Array<Word> {
    const language = this.getLanguageAttributes(languageName);
    const cachedIndex = this.wordMatrixCache.findIndex(cached =>
      cached.language === language
      && cached.patterns === patterns
      && cached.text === text
    );
    const cached = this.wordMatrixCache[cachedIndex];
    if (cachedIndex >= 0 && cached) {
      this.wordMatrixCache.splice(cachedIndex, 1);
      this.wordMatrixCache.push(cached);
      return cached.words;
    }

    const words = this.dataService.splitIntoMatrix(language, patterns, text);
    this.wordMatrixCache.push({ language, patterns, text, words });
    if (this.wordMatrixCache.length > 8) {
      this.wordMatrixCache.shift();
    }

    return words;
  }

  getViewingTranslations(): Array<{
    source: string;
    name: string;
    verses: Array<BookVerse<{ text: string; }>>;
  }> {
    return Object.keys(this.viewingTranslationBookRecord).map(source => {
      const translationViewing = this.viewingTranslationBookRecord[source];
      if (translationViewing.associatedTo.includes(this.structure.source)) {
        const chapters = this.viewingTranslationBookRecord[source].chapters;
        const name = this.viewingTranslationBookRecord[source].name;

        if (!chapters) {
          return {
            source,
            name,
            verses: []
          }
        }

        const chapterIndex = chapters.findIndex(chapter => chapter.chapter === this.current.chapter);
        if (chapterIndex !== this.indexNotFound) {
          const verses = chapters[chapterIndex].verses;

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

  onRemoveTranslation(source: string): void {
    if (confirm('Confirm removing this translation viewing?')) {
      delete this.viewingTranslationBookRecord[source];

      if (this.viewingTranslationBookRecord[source]) {
        const indexOf = this.viewingTranslationBookRecord[source].associatedTo.indexOf(this.structure.source);
        if (indexOf !== this.indexNotFound) {
          this.viewingTranslationBookRecord[source].associatedTo.splice(indexOf, 1);
        }

        if (this.viewingTranslationBookRecord[source].associatedTo.length === 0) {
          delete this.viewingTranslationBookRecord[source];
        }
      }

      if (this.project.translationViewer) {
        const translationIndex = this.project.translationViewer.findIndex(item => item.translation === source);
        if (this.project.translationViewer[translationIndex]) {
          this.project.translationViewer[translationIndex].associatedTo = this.project
            .translationViewer[translationIndex]
            .associatedTo
            .filter(item => item !== this.structure.source);

          if (this.project.translationViewer[translationIndex].associatedTo.length === 0) {
            this.project.translationViewer.splice(translationIndex, 1);
          }
        }
      }

      this.systemService.triggerSaveCurrentProject();
    }
  }
}
