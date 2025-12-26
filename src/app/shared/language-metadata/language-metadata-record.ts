import { Language } from "../../domain/language-model";
import { transliterate as hebrewTransliterateFn } from "hebrew-transliteration";
import { languageUnion } from "../../domain/language-union";
import { geezTransliterateFn } from "./geez-transliterate-fn";
import { hebrewGematriaFn } from "./hebrew-gematria-fn";
import { paleoHebrewSpellingFn } from "./paleo-hebrew-spelling-fn";

export const languageMetadataRecord: {
  [lang in languageUnion]: Language
} = {
  'aramaic': {
    name: 'Aramaic',
    label: 'aramaic',
    direction: 'rtl'
  },
  'hebraic': {
    name: 'Hebraic',
    label: 'hebraic',
    direction: 'rtl',
    transliteration: (hebrew) => hebrewTransliterateFn(hebrew),
    numerology: [
      {
        name: 'Gematria',
        label: 'gematria',
        calc: (text: string) => hebrewGematriaFn(text)
      }
    ],
    alternativeSpelling: [
      {
        name: 'Hypothetical Paleo',
        label: 'hypothetical-paleo',
        parse: (text: string) => paleoHebrewSpellingFn(text)
      }
    ],
    externalDictionaryLink: 'https://hebraico.pro.br/r/bibliainterlinear/texto.asp?g=1%2C2&gb=1e2%2C2&s=GENESIS&p=1&sa=s'
  },
  'geez': {
    name: 'Ge\'əz',
    label: 'geez',
    transliteration: (geez) => geezTransliterateFn(geez),
    externalDictionaryLink: 'https://www.geezexperience.com/index.php'
  },
  'syriac': {
    name: 'Syriac',
    label: 'syriac',
    direction: 'rtl'
  },
  'arabic': {
    name: 'Arabic',
    label: 'arabic',
    direction: 'rtl'
  },
  'latim': {
    name: 'Latim',
    label: 'latim'
  },
  'greek': {
    name: 'Greek',
    label: 'greek'
  },
  'copta': {
    name: 'Copta',
    label: 'copta'
  },
  'sanskrit': {
    name: 'Sanskrit',
    label: 'sanskrit'
  },
  'chinese': {
    name: 'Chinese',
    label: 'chinese'
  },
  'avestico': {
    name: 'Avestico',
    label: 'avestico',
    direction: 'rtl'
  },
  'pahlavi': {
    name: 'Pahlavi',
    label: 'pahlavi',
    direction: 'rtl'
  },
  'english': {
    name: 'English',
    label: 'english'
  },
  'portuguese': {
    name: 'Portuguese',
    label: 'portuguese'
  }
};