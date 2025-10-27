import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslationBookVerse } from '../../domain/translation-book-verse.model';
import { Translation } from '../../domain/translation.model';
import { GematricsPipe } from './gematrics.pipe';
import { hebraics } from './hebraics';
import { LiteralsStorage } from './literals-storage';
import { LiteralsPipe } from './literals.pipe';
import { OldBook } from './old-book.enum';
import { PatternsParsed } from './patterns-parsed';
import { TranslationService } from './translation.service';
import { TransliterationPipe } from './transliteration-pipe';

@Component({
  selector: 'app-inspector',
  imports: [
    CommonModule,
    LiteralsPipe,
    GematricsPipe,
    TransliterationPipe,
    ReactiveFormsModule
  ],
  providers: [
    LiteralsStorage
  ],
  templateUrl: './inspector.html',
  styleUrl: './inspector.scss'
})
export class Inspector implements OnInit {

  readonly hebraics = hebraics;

  patterns: PatternsParsed = {
    prefix: [],
    suffix: []
  };

  translation: Translation | null = null;
  chapterTranslations: Array<TranslationBookVerse> = [];
  book: OldBook = OldBook.GN;
  chapter = 0;
  form: any;

  constructor(
    fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private literalsStorage: LiteralsStorage,
    private translationService: TranslationService
  ) {
    this.form = fb.group({
      value: ['', [Validators.required]],
      type: ['prefix', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.readPatterns();
    this.subscribeParams();
    this.subscribeTranslation();
  }

  private readPatterns(): void {
    this.patterns = this.literalsStorage.getPattern();
  }

  private subscribeParams(): void {
    this.activatedRoute.params.subscribe({
      next: params => {
        debugger;
        this.book = params['book'];
        this.chapter = Number(params['chapter']) - 1;
        this.updateChapterTranslation();
      }
    });
  }

  private subscribeTranslation(): void {
    this.activatedRoute.data.subscribe({
      next: params => {
        this.translation = params['translation'];
        this.updateChapterTranslation();
      }
    });
  }

  private updateChapterTranslation(): void {
    this.chapterTranslations = this.translationService.getChapter(this.translation, this.book, this.chapter);
    this.cd.detectChanges();
  }

  calcFieldSize(placeholder: string, value: string): number {
    if (value.length) {
      return Math.floor(value.length * 8);
    } else if (placeholder.length) {
      return Math.floor(placeholder.length * 5);
    }

    return 30;
  }

  updateLiteral(input: HTMLInputElement, hebraic: string): void {
    this.literalsStorage.addLiteral(hebraic, input.value);
    input.style.width = `${this.calcFieldSize(hebraic, input.value)}px`;
  }

  splitByPatterns(hebraic: string): string[] {
    let matchPrefix = '',
      matchSuffix = '';

    for (let prefix of this.patterns.prefix) {
      if (prefix.pattern.test(hebraic)) {
        matchPrefix = prefix.word;
        hebraic = hebraic.replace(prefix.pattern, '');
        break;
      }
    }

    for (let suffix of this.patterns.suffix) {
      if (suffix.pattern.test(hebraic)) {
        matchSuffix = suffix.word;
        hebraic = hebraic.replace(suffix.pattern, '');
        break;
      }
    }

    let words: string[] = [];
    if (matchPrefix && matchSuffix) {
      words = [matchPrefix, ...this.splitByPatterns(hebraic), matchSuffix];
    } else if (matchPrefix) {
      words = [matchPrefix, ...this.splitByPatterns(hebraic)];
    } else if (matchSuffix) {
      words = [...this.splitByPatterns(hebraic), matchSuffix];
    } else {
      words = [hebraic];
    }

    return words.filter(word => word);
  }

  onPatternFormSubmit(): void {
    if (this.form.valid) {
      const { type, value } = this.form.value;
      this.patterns = this.literalsStorage.addPattern(value, type);

      this.form.reset();
    } else {
      this.form.markAllAsTouched();
    }
  }

  deletePattern(type: "prefix" | "suffix", index: number): void {
    this.literalsStorage.deletePattern(type, index);
    this.patterns[type].splice(index, 1);
  }
}
