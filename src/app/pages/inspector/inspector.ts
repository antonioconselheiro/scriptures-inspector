import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslationBookVerse } from '../../domain/translation-book-verse.model';
import { Translation } from '../../domain/translation.model';
import { GematricsPipe } from './gematrics.pipe';
import { hebraics } from './hebraics';
import { LiteralsStorage } from './literals-storage';
import { LiteralsPipe } from './literals.pipe';
import { OldBook } from './old-book.enum';
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

  patterns: Record<string, string> = {};
  translation: Translation | null = null;
  chapterTranslations: Array<TranslationBookVerse> = [];
  book: OldBook = OldBook.GN;
  chapter = 0;
  form: any;

  constructor(
    fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private literalsStorage: LiteralsStorage,
    private translationService: TranslationService
  ) {
    this.form = fb.group({
      pattern: ['', [Validators.required]],
      value: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.subscribeParams();
    this.subscribeTranslation();
  }

  private subscribeParams(): void {
    this.activatedRoute.params.subscribe({
      next: params => {
        this.book = params['book'];
        this.chapter = Number(params['chapter']) - 1;
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
  }

  updateLiteral(event: Event, hebraic: string): void {
    const literal = (event.target as HTMLInputElement).value;
    this.literalsStorage.addLiteral(hebraic, literal);
  }

  onPatternFormSubmit(): void {
    if (this.form.valid) {
      const { pattern, value } = this.form.value;
      this.literalsStorage.addPattern(pattern, value);
      this.patterns[pattern] = value;
      this.form.reset();
    } else {
      this.form.markAllAsTouched();
    }
  }

  deletePattern(pattern: string): void {
    this.literalsStorage.deletePattern(pattern);
    delete this.patterns[pattern];
  }
}
