import { Component, OnInit } from '@angular/core';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { Subject } from 'rxjs';
import { DocumentStorage } from '../document-storage';

@Component({
  selector: 'app-dialog-lexical-dictionary',
  imports: [],
  templateUrl: './dialog-lexical-dictionary.html',
  styleUrl: './dialog-lexical-dictionary.scss'
})
export class DialogDictionary extends ModalableDirective<{ lang: 'hebraic' | 'geez' | 'greek' }, boolean> implements OnInit {

  lang = 'hebraic';
  override response = new Subject<boolean | void>();
  dictionary: Array<{ key: string; value: string; }> = [];

  constructor(
    private literalsStorage: DocumentStorage
  ) {
    super();
  }

  override onInjectData(data: { lang: 'hebraic' | 'geez' | 'greek' }): void {
    this.lang = data.lang;
  }

  ngOnInit(): void {
    this.dictionary = this.getLexicalDictionary();
  }

  getLexicalDictionary(): Array<{ key: string; value: string; }> {
    let lexical: Record<string, string> = {};

    if (this.lang === 'hebraic') {
      lexical = this.literalsStorage.getHebraicLexical();
    } else if (this.lang === 'greek') {
      lexical = this.literalsStorage.getGreekLexical();
    } else {
      lexical = this.literalsStorage.getGeezLexical();
    }

    return Object.entries(lexical).map(([key, value]) => ({
      key,
      value
    }));
  }

  deleteFromDictionary(key: string): void {
    if (this.lang === 'hebraic') {
      this.literalsStorage.removeHebraicLexical(key);
    } else if (this.lang === 'greek') {
      this.literalsStorage.removeGreekLexical(key);
    } else if (this.lang === 'geez') {
      this.literalsStorage.removeGeezLexical(key);
    }
    this.dictionary = this.getLexicalDictionary();
  }
}
