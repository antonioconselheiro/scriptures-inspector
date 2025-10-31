import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ScriptureVerse } from '../../domain/scripture-verse-model';
import { TranslationBookVerse } from '../../domain/translation-book-verse-model';
import { Translation } from '../../domain/translation-model';
import { geezes } from './geezes';
import { GematricsPipe } from './gematrics-pipe';
import { hebraics } from './hebraics';
import { LiteralizatePipe } from './literalizate-pipe';
import { LiteralsPatternsService } from './literals-patterns-service';
import { LiteralsPipe } from './literals-pipe';
import { LiteralsStorage } from './literals-storage';
import { OldBook } from './old-book-enum';
import { PaleoPipe } from './paleo-pipe';
import { PatternsParsed } from './patterns-parsed';
import { TranslationService } from './translation-service';
import { TransliterationPipe } from './transliteration-pipe';
import { VersePipe } from './verse-pipe';

@Component({
  selector: 'app-inspector',
  imports: [
    CommonModule,
    PaleoPipe,
    VersePipe,
    GematricsPipe,
    LiteralsPipe,
    LiteralizatePipe,
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
  readonly geezes = geezes;

  hebraicPatterns: PatternsParsed = {
    prefix: [],
    suffix: []
  };

  geezPatterns: PatternsParsed = {
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
    private translationService: TranslationService,
    private literalsPatternsService: LiteralsPatternsService
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
    this.hebraicPatterns = this.literalsStorage.getHebraicPattern();
  }

  private subscribeParams(): void {
    this.activatedRoute.params.subscribe({
      next: params => {
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

  //  FIXME: está lógica poderá ser removida quando o JSON de geez, hebraico e grego forem fundidos em um único JSON
  getCorrespondingGeezVerse(hebraicVerse: ScriptureVerse): ScriptureVerse {
    for (let index = 0; index < this.geezes[this.book][this.chapter].length; index++) {
      if (
        this.geezes[this.book][this.chapter][index].verse.start === hebraicVerse.verse.start ||
        hebraicVerse.verse.end === this.geezes[this.book][this.chapter][index].verse.end
      ) {
        return this.geezes[this.book][this.chapter][index];
      }
    }

    throw new Error('geez corresponding not found');
  }

  calcFieldSize(placeholder: string, value: string): number {
    if (value.length) {
      return Math.floor(value.length * 8.5);
    } else if (placeholder.length) {
      return Math.floor(placeholder.length * 5);
    }

    return 30;
  }

  splitByPatterns(word: string, lang: 'hebraic' | 'geez' | 'greek'): string[] {
    return this.literalsPatternsService.splitByPatterns(lang === 'hebraic' ? this.hebraicPatterns : this.hebraicPatterns, word);
  }

  updateLiteral(input: HTMLInputElement, word: string, lang: 'hebraic' | 'geez' | 'greek'): void {
    lang === 'hebraic' ?
      this.literalsStorage.addHebraicLiteral(word, input.value) :
      this.literalsStorage.addGeezLiteral(word, input.value);

    input.style.width = `${this.calcFieldSize(word, input.value)}px`;
  }

  onPatternFormSubmit(): void {
    if (this.form.valid) {
      const { type, value } = this.form.value;
      this.hebraicPatterns = this.literalsStorage.addHebraicPattern(value, type);

      this.form.reset();
    } else {
      this.form.markAllAsTouched();
    }
  }

  deletePattern(type: "prefix" | "suffix", index: number): void {
    this.literalsStorage.deleteHebraicPattern(type, index);
    this.hebraicPatterns[type].splice(index, 1);
  }
}
