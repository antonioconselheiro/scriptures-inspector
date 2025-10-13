import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { hebraics } from './hebraics';
import { OldBook } from './old-book.enum';
import { LiteralsPipe } from './literals.pipe';
import { GematricsPipe } from './gematrics.pipe';
import { LiteralsStorage } from './literals-storage';
import { Translation } from '../../domain/translation.model';
import { TranslationService } from './translation.service';
import { TranslationBookVerse } from '../../domain/translation-book-verse.model';
import { TransliterationPipe } from './transliteration-pipe';

@Component({
  selector: 'app-inspector',
  imports: [
    LiteralsPipe,
    GematricsPipe,
    TransliterationPipe
  ],
  providers: [
    LiteralsStorage
  ],
  templateUrl: './inspector.html',
  styleUrl: './inspector.scss'
})
export class Inspector implements OnInit {
  
  readonly hebraics = hebraics;

  translation: Translation | null = null;
  chapterTranslations: Array<TranslationBookVerse> = [];
  book: OldBook = OldBook.GN;
  chapter = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private literalsStorage: LiteralsStorage,
    private translationService: TranslationService
  ) { }

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
}
