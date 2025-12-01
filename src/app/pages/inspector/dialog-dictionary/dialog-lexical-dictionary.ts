import { Component } from '@angular/core';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { Subject } from 'rxjs';
import { DocumentStorage } from '../document-storage';

@Component({
  selector: 'app-dialog-lexical-dictionary',
  imports: [],
  templateUrl: './dialog-lexical-dictionary.html',
  styleUrl: './dialog-lexical-dictionary.scss'
})
export class DialogDictionary extends ModalableDirective<{ lang: 'hebraic' | 'geez' | 'greek' }, boolean> {

  lang = 'hebraic';
  override response = new Subject<boolean | void>();

  constructor(
    private literalsStorage: DocumentStorage
  ) {
    super();
  }

  override onInjectData(data: { lang: 'hebraic' | 'geez' | 'greek' }): void {
    this.lang = data.lang;
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
}
