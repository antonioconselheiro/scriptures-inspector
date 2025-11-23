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
  let gematriaA: any; // carregado via fetch — evita out-of-memory

  // 🔥 CARREGA O ARQUIVO GIGANTE ANTES DOS TESTES
  beforeAll(async () => {
    console.log('Carregando Base A (interlinear)...');
    gematriaA = await fetch('/gematrics-interlinear-he-bhs-en-kja.json')
      .then(r => r.json());
    console.log('Base A carregada.');
  }, 120000); // timeout maior só para garantir

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GematriaService]
    });
    gematriaService = TestBed.inject(GematriaService);
  });

  // 🔥 percorre APENAS O AT
  Object.keys(bookMapAT).forEach(sigla => {

    const fullName = bookMapAT[sigla];

    it(`Deve comparar todas as gematrias do livro: ${fullName}`, () => {

      const bookA: any = (gematriaA as any)[fullName as any];
      const bookB: any = (baseB as any)[sigla as any];

      expect(bookA).toBeTruthy();
      expect(bookB).toBeTruthy();

      for (let chapterIndex = 0; chapterIndex < bookA.length; chapterIndex++) {

        const chapterA = bookA[chapterIndex];
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
              .toBe(
                wordA.gematria.simple,
                `Diferença detectada em ${fullName} cap ${chapterIndex+1}, verso ${verseIndex+1}, palavra ${wordIndex+1}`
              );
          });
        });
      }
    });

  });

});
