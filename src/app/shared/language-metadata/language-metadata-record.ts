import { transliterate as hebrewTransliterateFn } from "hebrew-transliteration";
import { Language } from "../../domain/language-model";
import { LanguageUnionType } from "../../domain/language-union-type";
import { demassoretifierFn } from "./demassoretifier-fn";
import { transliterate } from 'transliteration';
import { hebrewGematriaFn } from "./hebrew-gematria-fn";
import { massoretifierFn } from "./massoretifier-fn";
import { paleoHebrewSpellingFn } from "./paleo-hebrew-spelling-fn";

export const languageMetadataRecord: {
  [lang in LanguageUnionType]: Language
} = {
  'aramaic': {
    name: 'Aramaic',
    label: 'aramaic',
    direction: 'rtl',
    transliteration: (aramaic) => transliterate(aramaic)
  },
  'hebrew': {
    name: 'Hebraic',
    label: 'hebraic',
    direction: 'rtl',
    transliteration: (hebrew) => hebrewTransliterateFn(hebrew),
    wordSeparator: ['־', '׀', ' '],
    numerology: [
      {
        name: 'gematria',
        label: 'gematria',
        calc: (text: string) => hebrewGematriaFn(text)
      }
    ],
    alternativeSpelling: [
      {
        name: 'hypothetical paleo',
        label: 'hypothetical-paleo',
        parse: (text: string) => paleoHebrewSpellingFn(text)
      }
    ],
    normalizeFn: (text: string) => demassoretifierFn(text),
    prefetchMatcherFn: (text: string) => massoretifierFn(text),
    externalDictionaryLink: 'https://hebraico.pro.br/r/bibliainterlinear/texto.asp?g=1%2C2&gb=1e2%2C2&s=GENESIS&p=1&sa=s'
  },
  'geez': {
    name: 'Ge\'əz',
    label: 'geez',
    transliteration: (geez) => transliterate(geez),
    wordSeparator: ['፡', ' '],
    externalDictionaryLink: 'https://www.geezexperience.com/index.php'
  },
  'syriac': {
    name: 'Syriac',
    label: 'syriac',
    transliteration: (syriac) => transliterate(syriac),
    direction: 'rtl'
  },
  'arabic': {
    name: 'Arabic',
    label: 'arabic',
    transliteration: (arabic) => transliterate(arabic),
    direction: 'rtl'
  },
  'latim': {
    name: 'Latim',
    label: 'latim',
    transliteration: (latim) => transliterate(latim)
  },
  'greek': {
    name: 'Greek',
    label: 'greek',
    transliteration: (greek) => transliterate(greek)
  },
  'copta': {
    name: 'Copta',
    label: 'copta',
    transliteration: (copta) => transliterate(copta)
  },
  'sanskrit': {
    name: 'Sanskrit',
    label: 'sanskrit',
    transliteration: (sanskrit) => transliterate(sanskrit)
  },
  'chinese': {
    name: 'Chinese',
    label: 'chinese',
    transliteration: (chinese) => transliterate(chinese)
  },
  'avestico': {
    name: 'Avestico',
    label: 'avestico',
    direction: 'rtl',
    transliteration: (avestico) => transliterate(avestico)
  },
  'pahlavi': {
    name: 'Pahlavi',
    label: 'pahlavi',
    direction: 'rtl',
    transliteration: (pahlavi) => transliterate(pahlavi)
  }
};
