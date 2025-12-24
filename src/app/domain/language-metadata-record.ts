import { Language } from "../pages/inspector/domain/language-model";
import { languageUnion } from "./language-union";

export const languageMetadataRecord: {
  [lang in languageUnion]: Language
} = {
  'aramaic': {
    name: 'Aramaic',
    label: 'aramaic'
  },
  'hebraic': {
    name: 'Hebraic',
    label: 'hebraic'
  },
  'geez': {
    name: 'Ge\'əz',
    label: 'geez'
  },
  'syriac': {
    name: 'Syriac',
    label: 'syriac'
  },
  'arabic': {
    name: 'Arabic',
    label: 'arabic'
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
    label: 'avestico'
  },
  'pahlavi': {
    name: 'Pahlavi',
    label: 'pahlavi'
  },
  'english': {
    name: 'English',
    label: 'english'
  },
  'portuguese': {
    name: 'Portuguese',
    label: 'portuguese'
  },
};