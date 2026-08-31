import { Component, OnInit } from '@angular/core';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { BookMetadataAttributes } from '@domain/book-metadata-attributes-model';
import { Book } from '@domain/book-model';
import { BookVerse } from '@domain/book-verse-model';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { Subject } from 'rxjs';
import { ProjectDataService } from '../translation-editor/shared/project/project-data-service';
import { SourceBook } from '@domain/source-book-model';
import { ProjectMetadataService } from '../translation-editor/shared/project/project-metadata-service';
import { Language } from '@domain/language-model';

@Component({
  selector: 'app-lexical-dictionary-dialog',
  imports: [],
  templateUrl: './lexical-dictionary-dialog.html',
  styleUrl: './lexical-dictionary-dialog.scss'
})
export class LexicalDictionaryDialog extends ModalableDirective<{
  bookMetadata: Book<BookMetadataAttributes, any>,
  bookSource: Readonly<Book<object, BookVerse<{ text: string; }>>>;
  language: Language
}, boolean> implements OnInit {

  bookSource: SourceBook | null = null;
  bookMetadata: Book<BookMetadataAttributes, any> | null = null;
  language: Language | null = null;
  lexicals: Array<{ key: string; rule: 'common' | 'prefix' | 'suffix'; value: string; }> = [];

  override response = new Subject<boolean | void>();

  constructor(
    private dataService: ProjectDataService,
    private metadataService: ProjectMetadataService
  ) {
    super();
  }

  override onInjectData(book: {
    bookMetadata: Book<BookMetadataAttributes, any>,
    bookSource: SourceBook;
    language: Language
  }): void {
    this.bookMetadata = book.bookMetadata;
    this.bookSource = book.bookSource;
    this.language = book.language;
  }

  ngOnInit(): void {
    this.lexicals = this.getLexicalDictionary();
  }

  getLexicalDictionary(): Array<{ key: string; rule: 'common' | 'prefix' | 'suffix'; value: string; }> {
    if (this.bookMetadata) {
      return Object.entries(this.bookMetadata.lexical).map(([key, value]) => {
        const entries: Array<{ key: string; rule: 'common' | 'prefix' | 'suffix'; value: string; }> = [];

        if (value.prefix) {
          entries.push({
            key,
            value: value.prefix,
            rule: 'prefix'
          });
        }

        if (value.suffix) {
          entries.push({
            key,
            value: value.suffix,
            rule: 'suffix'
          });
        }

        if (value.value) {
          entries.push({
            key,
            value: value.value,
            rule: 'common'
          });
        }

        return entries;
      }).flat(1);
    }

    return [];
  }

  deleteLexical(key: string, rule: 'common' | 'prefix' | 'suffix'): void {
    if (this.bookMetadata) {
      if (rule === 'common') {
        if (this.bookMetadata.lexical[key].prefix) {
          this.bookMetadata.lexical[key].value = this.bookMetadata.lexical[key].prefix;
        } else if (this.bookMetadata.lexical[key].suffix) {
          this.bookMetadata.lexical[key].value = this.bookMetadata.lexical[key].suffix;
        } else {
          delete this.bookMetadata.lexical[key];
        }
      } else if (rule === 'prefix') {
        delete this.bookMetadata.lexical[key].prefix;
      } else if (rule === 'suffix') {
        delete this.bookMetadata.lexical[key].suffix;
      }
    }

    this.lexicals = this.getLexicalDictionary();
  }

  cleanUnusedLexical(): void {
    const clean = confirm('This operation will remove all unused lexicals in this book, confirm?');
    if (clean && this.bookMetadata && this.bookSource && this.language) {
      const bookMetadata = this.bookMetadata;
      const bookSource = this.bookSource;
      const language = this.language;
      const normalizeFn = language.normalizeFn ? language.normalizeFn : (t: string) => t;

      const lexicalFoundInText: { [lexical: string]: number } = {};
      Object.keys(bookMetadata.lexical).map(lexical => { lexicalFoundInText[lexical] = 0; });

      bookSource.chapters.forEach(chapter => {
        chapter.verses.forEach(verse => {
          const parsedPatterns = this.metadataService.parsePattern(bookMetadata.patterns, language);
          const parsedBook: ParsedBookMetadata = {
            lexical: bookMetadata.lexical,
            patterns: parsedPatterns
          };

          const wordMatrix = this.dataService.splitIntoMatrix(language, parsedBook.patterns, verse.text);
          wordMatrix.forEach(word => {
            word.segments.forEach(segment => {
              const wordSegment = normalizeFn(segment.word);

              if (wordSegment in lexicalFoundInText) {
                lexicalFoundInText[wordSegment]++;
              }
            })
          });
        });
      });

      Object.keys(lexicalFoundInText).forEach(lexical => {
        if (!lexicalFoundInText[lexical]) {
          delete bookMetadata.lexical[lexical];
          this.lexicals[this.lexicals.findIndex(value => value.key === lexical)];
        }
      });
    }
  }
}
