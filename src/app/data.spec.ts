import 'zone.js';
import 'zone.js/testing';
import { TestBed } from '@angular/core/testing';
import { GematriaService } from './pages/inspector/gematria-service';
import { hebraics as baseB } from './pages/inspector/hebraics';
import { IterableString } from '@belomonte/iterable-string';

function demassoretificador(hebraic: string): string {
  return hebraic.replace(/[\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\s]/g, '');
}

describe('Falseamento gematrico do dado', () => {

   const bookMapAT: Record<string, string> = {
     'gn': 'Genesis', 'ex': 'Exodus', 'lv': 'Leviticus', 'nm': 'Numbers', 'dt': 'Deuteronomy',
     'js': 'Joshua', 'jz': 'Judges', 'rt': 'Ruth', '1sm': '1 Samuel', '2sm': '2 Samuel',
     '1rs': '1 Kings', '2rs': '2 Kings', '1cr': '1 Chronicles', '2cr': '2 Chronicles',
     'ed': 'Ezra', 'ne': 'Nehemiah', 'et': 'Esther', 'jo': 'Job', 'sl': 'Psalms',
     'pv': 'Proverbs', 'ec': 'Ecclesiastes', 'ct': 'Song of Solomon', 'is': 'Isaiah',
     'jr': 'Jeremiah', 'lm': 'Lamentations', 'ez': 'Ezekiel', 'dn': 'Daniel',
     'os': 'Hosea', 'jl': 'Joel', 'am': 'Amos', 'ob': 'Obadiah', 'jn': 'Jonah',
     'mq': 'Micah', 'na': 'Nahum', 'hc': 'Habakkuk', 'sf': 'Zephaniah', 'ag': 'Haggai',
     'zc': 'Zechariah', 'ml': 'Malachi',
   };

  let gematriaService: GematriaService;
  let gematriaA: any;

  beforeAll(async () => {
    gematriaA = await fetch('/gematrics-interlinear-he-bhs-en-kja.json')
      .then(r => r.json());
  }, 120000);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GematriaService]
    });
    gematriaService = TestBed.inject(GematriaService);
  });

  Object.keys(bookMapAT).forEach(sigla => {

    const fullName = bookMapAT[sigla];
    if (!['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy' ].includes(fullName)) {
      return;
    }

    it(`Deve comparar todas as gematrias do livro: ${fullName}`, () => {

      const bookA: any = Object.values((gematriaA as any)[fullName as any]);
      const bookB: any = (baseB as any)[sigla as any];

      expect(bookA).toBeTruthy();
      expect(bookB).toBeTruthy();

      for (let chapterIndex = 0; chapterIndex < bookA.length; chapterIndex++) {
        //  não tenho esses
        if (['Jonah', 'Hebrews', '3 John', 'Revelation'].includes(fullName) && chapterIndex === 0) {
          continue;
        }

        if (chapterIndex >= 6) {
          continue;
        }

        const chapterA = bookA[chapterIndex][0];
        const chapterB = bookB[chapterIndex];

        expect(chapterB).toBeTruthy();

        chapterA.verses.forEach((verseA: any, verseIndex: number) => {
          if (verseIndex !== 0) {
            return;
          }

          const verseTextB = chapterB[verseIndex]?.text;
          expect(verseTextB).toBeTruthy();

          if (verseTextB) {
            const iterable = new IterableString(demassoretificador(verseTextB));
            verseA.words.forEach((wordA: any, wordIndex: number) => {
              const expected = demassoretificador(wordA.hebrew).replace(/[׀]/g, '');
              const matcher = new RegExp(`^\s*${Array.from(expected).join('\\s*')}`);
              const wordB = iterable.addCursor(matcher);
              const gematriaB = gematriaService.toNumbers(wordB);

              expect(gematriaB)
                .withContext(`[${fullName} ${chapterIndex + 1}:${verseIndex + 1}], palavra ${wordIndex + 1} falhou: esperado ${expected}, (${wordA.gematria.simple}), obtido ${wordB} (${gematriaB})`)
                .toBe(wordA.gematria.simple);
            });
          }
        });
      }
    });
  });
});
