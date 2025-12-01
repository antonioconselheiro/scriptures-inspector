import { Component } from '@angular/core';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { Subject } from 'rxjs';
import { ParsedPatterns } from '../parsed-patterns';
import { DocumentStorage } from '../document-storage';

@Component({
  selector: 'app-dialog-patterns',
  imports: [],
  templateUrl: './dialog-patterns.html',
  styleUrl: './dialog-patterns.scss'
})
export class DialogPatterns extends ModalableDirective<{ lang: 'hebraic' | 'geez' | 'greek', patterns: ParsedPatterns }, boolean> {

  patterns!: ParsedPatterns;
  lang = 'hebraic';
  title: {
    [lang: string]: string
  } = {
    ['hebraic']: 'Hebraic',
    ['geez']: 'Ge\'əz',
    ['greek']: 'Greek'
  }
  override response = new Subject<boolean | void>();

  constructor(
    private literalsStorage: DocumentStorage
  ) {
    super();
  }

  override onInjectData(data: { lang: 'hebraic' | 'geez' | 'greek', patterns: ParsedPatterns }): void {
    this.patterns = data.patterns;
    this.lang = data.lang;
  }

  deletePattern(lang: 'hebraic' | 'geez' | 'greek', type: 'prefix' | 'suffix', index: number, key: string): void {
    if (lang === 'hebraic') {
      this.literalsStorage.deleteHebraicPattern(type, index);
      this.patterns[type].delete(key);
    } else if (lang === 'geez') {
      this.literalsStorage.deleteGeezPattern(type, index);
      this.patterns[type].delete(key);
    } else if (lang === 'greek') {
      this.literalsStorage.deleteGreekPattern(type, index);
      this.patterns[type].delete(key);
    }
  }
}
