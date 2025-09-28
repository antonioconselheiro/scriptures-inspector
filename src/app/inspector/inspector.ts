import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { hebraics } from './hebraics';
import { OldBook } from './old-book.enum';

@Component({
  selector: 'app-inspector',
  imports: [],
  templateUrl: './inspector.html',
  styleUrl: './inspector.scss'
})
export class Inspector implements OnInit {
  
  readonly hebraics = hebraics;

  translation = '';
  book: OldBook = OldBook.GN;
  chapter = 0;
  verse = 0;

  constructor(
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe({
      next: params => {
        this.translation = params['translation'];
        this.book = params['book'];
        this.chapter = Number(params['chapter']);
        this.verse = Number(params['verse']);
      }
    });
  }
}
