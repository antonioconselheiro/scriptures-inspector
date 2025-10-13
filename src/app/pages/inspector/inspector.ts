import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { hebraics } from './hebraics';
import { OldBook } from './old-book.enum';
import { LiteralsPipe } from './literals.pipe';
import { GematricsPipe } from './gematrics.pipe';
import { LiteralsStorage } from './literals-storage';

@Component({
  selector: 'app-inspector',
  imports: [
    LiteralsPipe,
    GematricsPipe
  ],
  providers: [
    LiteralsStorage
  ],
  templateUrl: './inspector.html',
  styleUrl: './inspector.scss'
})
export class Inspector implements OnInit {
  
  readonly hebraics = hebraics;

  translation = '';
  book: OldBook = OldBook.GN;
  chapter = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private literalsStorage: LiteralsStorage
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe({
      next: params => {
        this.translation = params['translation'];
        this.book = params['book'];
        this.chapter = Number(params['chapter']);
      }
    });
  }

  updateLiteral(event: Event, hebraic: string): void {
    const literal = (event.target as HTMLInputElement).value;
    this.literalsStorage.addLiteral(hebraic, literal);
  }
}
