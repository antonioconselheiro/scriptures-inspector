import 'zone.js';
import 'zone.js/testing';
import { TestBed } from '@angular/core/testing';
import { GematriaService } from './pages/inspector/gematria-service';
import { hebraics as baseB } from './pages/inspector/hebraics';

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
        const chapterA = bookA[chapterIndex][0];
        const chapterB = bookB[chapterIndex];

        expect(chapterB).toBeTruthy();

        chapterA.verses.forEach((verseA: any, verseIndex: number) => {

          const verseTextB = chapterB[verseIndex]?.text;
          expect(verseTextB).toBeTruthy();

          const words = verseTextB
            .split(' ')
            .filter((w: string) => w.trim() !== '');

          const processedB = words.map((word: string, index: number) => ({
            number: index + 1,
            hebrew: word,
            gematria: gematriaService.toNumbers(word)
          }));

          expect(processedB.length).toBe(verseA.words.length);

          verseA.words.forEach((wordA: any, wordIndex: number) => {
            const wordB = processedB[wordIndex];

            expect(wordB.gematria.simple)
              .withContext(`[${fullName} ${chapterIndex + 1}:${verseIndex + 1}], palavra ${wordIndex + 1} falhou: esperado ${wordA.gematria.simple}, obtido ${wordB.gematria.simple}`)
              .toBe(wordA.gematria.simple);
          });
        });
      }
    });

  });

});
