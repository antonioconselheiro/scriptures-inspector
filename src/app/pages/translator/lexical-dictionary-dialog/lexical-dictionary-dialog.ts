import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { BookMetadataAttributes } from '@domain/book-metadata-attributes-model';
import { Book } from '@domain/book-model';
import { BookVerse } from '@domain/book-verse-model';
import { CurrentBook } from '@domain/current-book-model';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { Subject } from 'rxjs';
import { ProjectDataService } from '../translation-editor/shared/project/project-data-service';
import { SourceBook } from '@domain/source-book-model';
import { ProjectMetadataService } from '../translation-editor/shared/project/project-metadata-service';
import { Language } from '@domain/language-model';
import { MorphemeType } from '@domain/morpheme-type';
import { SortField } from './sort-field-type';
import { SortOrder } from './sort-order-type';

@Component({
  selector: 'app-lexical-dictionary-dialog',
  imports: [FormsModule],
  templateUrl: './lexical-dictionary-dialog.html',
  styleUrl: './lexical-dictionary-dialog.scss'
})
export class LexicalDictionaryDialog extends ModalableDirective<{
  bookMetadata: Book<BookMetadataAttributes, any>,
  bookSource: Readonly<Book<object, BookVerse<{ text: string; }>>>;
  language: Language;
  currentBook: CurrentBook;
}, boolean> implements OnInit {

  @Input() bookSource: SourceBook | null = null;
  @Input() bookMetadata: Book<BookMetadataAttributes, any> | null = null;
  @Input() language: Language | null = null;
  @Input() currentBook: CurrentBook | null = null;
  lexicals: Array<{ key: string; rule: MorphemeType; value: string; }> = [];
  sortBy: SortField = 'insertion';
  sortOrder: SortOrder = 'insertion-asc';

  readonly sortOrderOptions: Record<SortField, Array<{ value: SortOrder; label: string; }>> = {
    insertion: [
      { value: 'insertion-asc', label: 'Insertion order' },
      { value: 'insertion-desc', label: 'Reverse insertion order' }
    ],
    word: [
      { value: 'alphabetical-asc', label: 'Alphabetical (A–Z)' },
      { value: 'alphabetical-desc', label: 'Alphabetical (Z–A)' },
      { value: 'length-asc', label: 'Shortest first' },
      { value: 'length-desc', label: 'Longest first' }
    ],
    lexical: [
      { value: 'alphabetical-asc', label: 'Alphabetical (A–Z)' },
      { value: 'alphabetical-desc', label: 'Alphabetical (Z–A)' },
      { value: 'length-asc', label: 'Shortest first' },
      { value: 'length-desc', label: 'Longest first' }
    ],
    rule: [
      { value: 'prefix-first', label: 'Prefix first' },
      { value: 'root-first', label: 'Root first' },
      { value: 'suffix-first', label: 'Suffix first' }
    ]
  };

  override response = new Subject<boolean | void>();
  private readonly collator = new Intl.Collator(undefined, {
    usage: 'sort',
    sensitivity: 'base',
    numeric: true
  });

  constructor(
    private dataService: ProjectDataService,
    private metadataService: ProjectMetadataService
  ) {
    super();
  }

  override onInjectData(book: {
    bookMetadata: Book<BookMetadataAttributes, any>,
    bookSource: SourceBook;
    language: Language;
    currentBook: CurrentBook;
  }): void {
    this.bookMetadata = book.bookMetadata;
    this.bookSource = book.bookSource;
    this.language = book.language;
    this.currentBook = book.currentBook;
  }

  ngOnInit(): void {
    this.sortLexicals();
  }

  onSortByChange(sortBy: SortField): void {
    this.sortBy = sortBy;
    this.sortOrder = sortBy === 'insertion'
      ? 'insertion-asc'
      : sortBy === 'rule'
        ? 'prefix-first'
        : 'alphabetical-asc';
    this.sortLexicals();
  }

  sortLexicals(): void {
    const lexicals = this.getLexicalDictionary();

    if (this.sortBy === 'insertion') {
      this.lexicals = this.sortOrder === 'insertion-desc' ? lexicals.reverse() : lexicals;
      return;
    }

    const ruleOrder: Record<MorphemeType, number> = {
      prefix: 0,
      root: 1,
      suffix: 2
    };

    if (this.sortBy === 'rule') {
      const priority = this.sortOrder === 'root-first'
        ? { root: 0, prefix: 1, suffix: 2 }
        : this.sortOrder === 'suffix-first'
          ? { suffix: 0, prefix: 1, root: 2 }
          : { prefix: 0, root: 1, suffix: 2 };

      this.lexicals = lexicals.sort((a, b) =>
        priority[a.rule] - priority[b.rule] || ruleOrder[a.rule] - ruleOrder[b.rule]
      );
      return;
    }

    const valueFor = (lexical: typeof this.lexicals[number]): string =>
      this.sortBy === 'word' ? lexical.key : lexical.value;
    const descending = this.sortOrder === 'alphabetical-desc';
    const byLength = this.sortOrder === 'length-asc' || this.sortOrder === 'length-desc';
    const lengthDirection = this.sortOrder === 'length-desc' ? -1 : 1;

    this.lexicals = lexicals.sort((a, b) => {
      const aValue = valueFor(a);
      const bValue = valueFor(b);
      if (byLength) {
        const lengthDifference = Array.from(aValue).length - Array.from(bValue).length;
        if (lengthDifference) {
          return lengthDifference * lengthDirection;
        }
      }

      const alphabeticalDifference = this.collator.compare(
        this.alphabeticCharactersOnly(aValue),
        this.alphabeticCharactersOnly(bValue)
      );
      return descending ? -alphabeticalDifference : alphabeticalDifference;
    });
  }

  private alphabeticCharactersOnly(value: string): string {
    return value.normalize('NFC').replace(/[^\p{L}]/gu, '');
  }

  getLexicalDictionary(): Array<{ key: string; rule: MorphemeType; value: string; }> {
    if (this.bookMetadata) {
      return Object.entries(this.bookMetadata.lexical).map(([key, value]) => {
        const entries: Array<{ key: string; rule: MorphemeType; value: string; }> = [];

        if (value.value) {
          entries.push({
            key,
            value: value.value,
            rule: 'root'
          });
        }

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

        return entries;
      }).flat(1);
    }

    return [];
  }

  transliterateWord(word: string): string {
    return this.language?.transliteration?.(word) ?? '';
  }

  updateLexical(lexical: typeof this.lexicals[number], input: HTMLInputElement): void {
    if (!this.bookMetadata || !this.language || !this.currentBook) {
      return;
    }

    this.metadataService.updateLexical(
      this.currentBook,
      this.bookMetadata,
      this.language,
      lexical.key,
      input.value,
      lexical.rule
    );
    lexical.value = input.value;
  }

  deleteLexical(key: string, rule: MorphemeType): void {
    if (this.bookMetadata) {
      if (rule === 'root') {
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

    this.sortLexicals();
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
        }
      });

      this.sortLexicals();
    }
  }
}
