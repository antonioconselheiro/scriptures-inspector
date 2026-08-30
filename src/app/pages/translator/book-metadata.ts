export const bookMetadata: {
  [abrev: string]: {
    chapters: number,
    normal: string,
    gringo: string,
    testament: 'global' | 'old' | 'new',
    type?: Array<'letter' | 'rule' | 'history' | 'sapiential' | 'poesy' | 'prophecy' | 'pesher' | 'treasure'>,
    oldestLanguageFound?: 'aramaic' | 'hebraic' | 'geez' | 'syriac' | 'arabic' | 'latim' | 'greek' | 'copta' | 'sanskrit' | 'chinese' | 'avestico' | 'pahlavi' | 'sogdiano' | 'english';
    language: {
      aramaic?: boolean,
      hebraic?: boolean,
      geez?: boolean,
      syriac?: boolean,
      arabic?: boolean,
      latim?: boolean,
      greek?: boolean,
      copta?: boolean,
      sanskrit?: boolean,
      chinese?: boolean,
      uigur?: boolean,
      avestico?: boolean,
      pahlavi?: boolean,
      sogdiano?: boolean,
      english?: boolean
    },
    codex: {
      ocidental: boolean,
      septuaginta: boolean,
      essenes?: boolean,
      syriac?: boolean,
      copta?: boolean,
      sethian?: boolean,
      betaIsrael?: boolean,
      tewahedo: boolean,
      indian?: boolean,
      chinese?: boolean,
      persian?: boolean,
      bizantine?: boolean,
      helenism?: boolean,
      manicheist?: boolean,
      nestorian?: boolean,
      medievalArmenian?: boolean
    }
  }
} = {
  'TAD': {
    chapters: 0,
    normal: 'Testamento de Adão',
    gringo: 'Testament of Adam',
    testament: 'old',
    oldestLanguageFound: 'syriac',
    language: {
      syriac: true,
      greek: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: false,
      essenes: false,
      syriac: true,
      copta: false,
      helenism: true
    }
  },
  'TST': {
    chapters: 0,
    normal: 'Testamento de Sete',
    gringo: 'Testament of Set',
    testament: 'old',
    oldestLanguageFound: 'syriac',
    language: {
      syriac: true,
      greek: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: false,
      essenes: false,
      syriac: true,
      copta: false,
      helenism: true
    }
  },
  'GIG': {
    chapters: 0,
    normal: 'Livro dos Gigantes',
    gringo: 'Book of Giants',
    oldestLanguageFound: 'sogdiano',
    testament: 'old',
    language: {
      sogdiano: true,
      uigur: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: false,
      manicheist: true
    }
  },
  '1EN': {
    chapters: 0,
    normal: 'Enoque',
    gringo: 'Enoch',
    testament: 'old',
    oldestLanguageFound: 'geez',
    type: ['history', 'prophecy'],
    language: {
      hebraic: true,
      aramaic: true,
      geez: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: true,
      betaIsrael: true,
      essenes: true
    }
  },
  'TNO': {
    chapters: 0,
    normal: 'Testamento de Noé',
    gringo: 'Testament of Noah',
    testament: 'old',
    oldestLanguageFound: 'syriac',
    language: {
      syriac: true,
      greek: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: false,
      essenes: false,
      syriac: true,
      copta: false,
      helenism: true
    }
  },
  'MQS': { // 11Q, 11Q13
    chapters: 0,
    normal: 'Mequisedeque',
    gringo: 'Mechizedek',
    testament: 'old',
    oldestLanguageFound: 'hebraic',
    language: {
      hebraic: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: false,
      essenes: true
    }
  },
  'ASE': {
    chapters: 0,
    normal: 'Homilia de Abraão e Sara no Egito',
    gringo: 'Homily of Abraham and Sarah in Egypt',
    testament: 'old',
    type: [],
    codex: {
      ocidental: false,
      betaIsrael: true,
      septuaginta: false,
      tewahedo: false
    },
    language: {
      geez: true
    }
  },
  'GAB': { // 1Q20, pesquisar Gênesis eslavo de Abraão
    chapters: 0,
    normal: 'Gênesis de Abraão',
    gringo: 'Genesis of Abraham',
    testament: 'old',
    type: [],
    language: {
      hebraic: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: false,
      essenes: true
    }
  },
  'AAB': { // parece que a versão original é em eslavo e não em syriaco
    chapters: 0,
    normal: 'Apocalipse de Abraão',
    gringo: 'Apocalipse of Abraham',
    testament: 'old',
    type: [],
    language: {
      syriac: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: false,
      essenes: false,
      syriac: true
    }
  },
  'TAB': {
    chapters: 0,
    normal: 'Testamento de Abraão',
    gringo: 'Testament of Abraham',
    testament: 'old',
    oldestLanguageFound: 'greek',
    language: {
      copta: true,
      greek: true,
      geez: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: false,
      betaIsrael: true,
      essenes: false,
      copta: true,
      helenism: true
    }
  },
  'TIS': {
    chapters: 0,
    normal: 'Testamento de Isaque',
    gringo: 'Testament of Isaac',
    testament: 'old',
    type: [],
    language: {
      copta: true,
      greek: true,
      geez: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: false,
      betaIsrael: true,
      essenes: false,
      copta: true,
      helenism: true
    }
  },
  'TIR': {
    chapters: 0,
    normal: 'Testamento de Israel', // Testamento de Jacó
    gringo: 'Testament of Israel',
    testament: 'old',
    type: [],
    language: {
      copta: true,
      greek: true,
      geez: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: false,
      betaIsrael: true,
      essenes: false,
      copta: true,
      helenism: true
    }
  },
  'TLV': {
    chapters: 0,
    normal: 'Testamento de Levi',
    gringo: 'Testament of Levi',
    testament: 'old',
    type: [],
    oldestLanguageFound: 'aramaic',
    language: {
      aramaic: true,
      syriac: true,
      geez: true,
      greek: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: false,
      essenes: true,
      medievalArmenian: true,
      copta: true,
      helenism: true
    }
  },
  'TJS': {
    chapters: 0,
    normal: 'Testamento de José',
    gringo: 'Testament of Joseph',
    testament: 'old',
    oldestLanguageFound: 'greek',
    language: {
      greek: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: false,
      essenes: false,
      copta: true,
      helenism: true
    }
  },
  'TDP': { // DIVIDIR
    chapters: 0,
    normal: 'Testamento dos Doze Patriarcas',
    gringo: 'Testament of Twelve Patriarchs',
    testament: 'old',
    type: [],
    language: {
      copta: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: false,
      essenes: false,
      medievalArmenian: true,
      copta: true,
      helenism: true
    }
  },
  'JUB': {
    chapters: 0,
    normal: 'Jubileus de Moisés',
    gringo: 'Jubilee of Moses',
    testament: 'old',
    type: ['history', 'prophecy'],
    language: {
      geez: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: true,
      betaIsrael: true,
      essenes: true
    }
  },
  'AMS': {
    chapters: 0,
    normal: 'Assunção de Moisés', // testamento de moisés, apocalipse de moisés
    gringo: 'Ascension of Moses',
    testament: 'old',
    language: {
      greek: true,
      syriac: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: false,
      essenes: false
    }
  },
  'GEN': {
    chapters: 50,
    normal: 'Genesis',
    gringo: 'Genesis',
    testament: 'old',
    type: ['history', 'prophecy'],
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      ocidental: true,
      septuaginta: true,
      tewahedo: true,
      betaIsrael: true
    }
  },
  'EXO': {
    chapters: 40,
    normal: 'Exodo',
    gringo: 'Exodus',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      ocidental: true,
      septuaginta: true,
      tewahedo: true,
      betaIsrael: true
    }
  },
  'LEV': {
    chapters: 27,
    normal: 'Levitico',
    gringo: 'Leviticus',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      ocidental: true,
      septuaginta: true,
      tewahedo: true,
      betaIsrael: true
    }
  },
  'NUM': {
    chapters: 36,
    normal: 'Numeros',
    gringo: 'Numbers',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      ocidental: true,
      septuaginta: true,
      tewahedo: true,
      betaIsrael: true
    }
  },
  'DEU': {
    chapters: 34,
    normal: 'Deuteronomio',
    gringo: 'Deuteronomy',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      ocidental: true,
      septuaginta: true,
      tewahedo: true,
      betaIsrael: true
    }
  },
  'MMT': { // 4QMMT
    chapters: 0,
    normal: 'Miqsat Ma\'aseh ha-Torah',
    gringo: 'Miqsat Ma\'aseh ha-Torah',
    testament: 'old',
    language: {
      hebraic: true
    },
    codex: {
      essenes: true,
      ocidental: false,
      septuaginta: false,
      tewahedo: false
    }
  },
  'JOS': {
    chapters: 24,
    normal: 'Josue',
    gringo: 'Joshua',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      ocidental: true,
      septuaginta: true,
      tewahedo: true,
      betaIsrael: true
    }
  },
  'JUI': {
    chapters: 21,
    normal: 'Juizes',
    gringo: 'Judges',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      ocidental: true,
      septuaginta: true,
      tewahedo: true,
      betaIsrael: true
    }
  },
  'RUT': {
    chapters: 4,
    normal: 'Rute',
    gringo: 'Ruth',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      ocidental: true,
      septuaginta: true,
      tewahedo: true,
      betaIsrael: true
    }
  },
  '1SM': {
    chapters: 31,
    normal: '1 Samuel',
    gringo: '1 Samuel',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      ocidental: true,
      septuaginta: true,
      tewahedo: true,
      betaIsrael: true,
      essenes: true
    }
  },
  '2SM': {
    chapters: 24,
    normal: '2 Samuel',
    gringo: '2 Samuel',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      ocidental: true,
      septuaginta: true,
      tewahedo: true,
      betaIsrael: true
    }
  },
  '1RS': {
    chapters: 22,
    normal: '1 Reis',
    gringo: '1 Kings',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      ocidental: true,
      septuaginta: true,
      tewahedo: true,
      betaIsrael: true
    }
  },
  '2RS': {
    chapters: 25,
    normal: '2 Reis',
    gringo: '2 Kings',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      ocidental: true,
      septuaginta: true,
      tewahedo: true,
      betaIsrael: true
    }
  },
  '1CR': {
    chapters: 29,
    normal: '1 Cronicas',
    gringo: '1 Chronicles',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      ocidental: true,
      septuaginta: true,
      tewahedo: true,
      betaIsrael: true
    }
  },
  '2CR': {
    chapters: 36,
    normal: '2 Cronicas',
    gringo: '2 Chronicles',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      ocidental: true,
      septuaginta: true,
      tewahedo: true,
      betaIsrael: true
    }
  },
  '1EL': {
    chapters: 0,
    normal: 'Assunção de Elias',
    gringo: 'Ascension of Elijah',
    testament: 'old',
    language: {
      greek: true,
      syriac: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: false,
      essenes: false,
      helenism: true
    }
  },
  '2EL': { // 4Q541–545
    chapters: 0,
    normal: 'Apocalipse de Elias',
    gringo: 'Apocalipse of Elijah',
    testament: 'old',
    language: {
      hebraic: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: false,
      essenes: true
    }
  },
  '3EL': {
    chapters: 0,
    normal: 'Testamento de Elias',
    gringo: 'Testament of Elijah',
    testament: 'old',
    language: {
      greek: true,
      hebraic: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: false,
      essenes: false,
      helenism: true
    }
  },
  '1ED': {
    chapters: 0,
    normal: 'Esdras LXX',
    gringo: 'Ezra LXX',
    testament: 'old',
    language: {
      geez: true,
      greek: true,
    },
    codex: {
      ocidental: false,
      septuaginta: true,
      tewahedo: true,
      betaIsrael: true
    }
  },
  '2ED': {
    chapters: 10,
    normal: 'Esdras',
    gringo: 'Ezra',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      ocidental: true,
      septuaginta: true,
      tewahedo: true,
      betaIsrael: true
    }
  },
  '3ED': {
    chapters: 13,
    normal: 'Neemias',
    gringo: 'Nehemiah',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      ocidental: false,
      septuaginta: true,
      tewahedo: true,
      betaIsrael: true
    }
  },
  '4ED': {
    chapters: 0,
    normal: 'Apocalipse de Esdras',
    gringo: 'Apocalypse of Ezra',
    testament: 'old',
    language: {
      geez: true,
      greek: true
    },
    codex: {
      ocidental: false,
      septuaginta: true,
      tewahedo: true,
      betaIsrael: true
    }
  },
  'ZOR': { // 4Q371–372
    chapters: 0,
    normal: "Zorobabel",
    gringo: "Zorobabel",
    testament: "old",
    language: { hebraic: true },
    codex: { essenes: true, ocidental: false, septuaginta: false, tewahedo: false }
  },
  '1ET': {
    chapters: 10,
    normal: 'Ester',
    gringo: 'Esther',
    testament: 'old',
    language: {
      hebraic: true
    },
    codex: {
      ocidental: true,
      septuaginta: false,
      tewahedo: false,
      betaIsrael: false,
      essenes: false
    }
  },
  '2ET': {
    chapters: 6,
    normal: 'Ester LXX',
    gringo: 'Esther LXX',
    testament: 'old',
    language: {
      geez: true,
      greek: true
    },
    codex: {
      ocidental: false,
      septuaginta: true,
      tewahedo: true,
      betaIsrael: true,
      essenes: false
    }
  },
  'JOB': {
    chapters: 42,
    normal: 'Jó',
    gringo: 'Job',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      betaIsrael: true,
      ocidental: true,
      septuaginta: true,
      copta: true
    }
  },
  'TDV': {
    chapters: 0,
    normal: 'Testamento de Davi',
    gringo: 'Testament of David',
    testament: 'old',
    type: [],
    language: {
      greek: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: false,
      essenes: false,
      syriac: false,
      copta: true,
      helenism: true
    }
  },
  '1SL': {
    chapters: 150,
    normal: '1 Salmos',
    gringo: '1 Psalms',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      essenes: true,
      tewahedo: true,
      betaIsrael: true,
      ocidental: true,
      septuaginta: true,
      copta: true
    }
  },
  '2SL': {
    chapters: 1,
    normal: 'Salmos de Davi',
    gringo: 'Psalms of David',
    testament: 'old',
    language: {
      geez: true
    },
    codex: {
      tewahedo: true,
      betaIsrael: true,
      ocidental: false,
      septuaginta: false
    }
  },
  '3SL': {
    chapters: 0,
    normal: 'Salmos de Salomão',
    gringo: 'Psalms of Solomon',
    testament: 'old',
    oldestLanguageFound: 'greek',
    language: {
      greek: true
    },
    codex: {
      tewahedo: false,
      ocidental: false,
      septuaginta: false,
      essenes: false,
      syriac: false
    }
  },
  '4SL': { // 4Q448, 11QPs
    chapters: 0,
    normal: 'Salmos Essênios',
    gringo: 'Essenes Psalms',
    testament: 'old',
    language: {
      hebraic: true
    },
    codex: {
      essenes: true,
      tewahedo: false,
      ocidental: false,
      septuaginta: false,
      copta: false
    }
  },
  'PSL': { // 4QpPs
    chapters: 0,
    normal: 'Pesher dos Salmos',
    gringo: 'Pesher of Salmos',
    type: ['pesher'],
    testament: 'old',
    language: {
      hebraic: true
    },
    codex: {
      essenes: true,
      ocidental: false,
      septuaginta: false,
      tewahedo: false
    }
  },
  'ODS': {
    chapters: 42,
    normal: 'Odes de Salomão',
    gringo: 'Odes of Solomon',
    testament: 'old',
    oldestLanguageFound: 'syriac',
    language: {
      syriac: true,
      greek: true,
      copta: true
    },
    codex: {
      tewahedo: false,
      ocidental: false,
      septuaginta: false,
      essenes: false,
      copta: false,
      syriac: true
    }
  },
  'PRO': {
    chapters: 31,
    normal: 'Proverbios',
    gringo: 'Proverbs',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      betaIsrael: true,
      ocidental: true,
      septuaginta: true,
      copta: true
    }
  },
  'SSL': {
    chapters: 42,
    normal: 'Sabedoria de Salomão',
    gringo: 'Wisdom of Solomon',
    testament: 'old',
    language: {
      geez: true,
      greek: true,
      syriac: true
    },
    codex: {
      tewahedo: true,
      betaIsrael: true,
      ocidental: false,
      septuaginta: true,
      essenes: false
    }
  },
  'TSL': {
    chapters: 0,
    normal: 'Testamento de Salomão',
    gringo: 'Testament of Solomon',
    testament: 'old',
    type: [],
    language: {
      greek: true,
      arabic: true,
      latim: true,
      copta: true,
      syriac: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: false,
      essenes: false,
      syriac: true,
      copta: false,
      helenism: true
    }
  },
  'SES': { // 4Q417, 4Q418, 4Q419, Q4Instructions
    chapters: 0,
    normal: "Sabedoria dos Essênios",
    gringo: "Wisdom of Essenes",
    testament: "old",
    language: { hebraic: true },
    codex: { essenes: true, ocidental: false, septuaginta: false, tewahedo: false }
  },
  'ECL': {
    chapters: 12,
    normal: 'Eclesiastes',
    gringo: 'Ecclesiastes',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      betaIsrael: true,
      ocidental: true,
      septuaginta: true,
      copta: true
    }
  },
  'SIR': {
    chapters: 0,
    normal: 'Eclesiástico - Sirácida',
    gringo: 'Ecclesiasticus - Sirach',
    testament: 'old',
    oldestLanguageFound: 'hebraic',
    language: {
      hebraic: true,
      geez: true,
      greek: true
    },
    codex: {
      ocidental: false,
      septuaginta: true,
      tewahedo: true,
      betaIsrael: true,
      essenes: true,
      syriac: true
    }
  },
  'CAN': {
    chapters: 8,
    normal: 'Canticos',
    gringo: 'Song of Solomon',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      betaIsrael: true,
      ocidental: true,
      septuaginta: true,
      copta: true
    }
  },
  'NAB': {
    chapters: 0,
    normal: 'Oração de Nabonido',
    gringo: 'Prayer of Nabonidus',
    testament: 'old',
    language: {
      aramaic: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: false,
      essenes: true,
      syriac: false
    }
  },
  '1IS': {
    chapters: 66,
    normal: 'Isaias',
    gringo: 'Isaiah',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      essenes: true,
      tewahedo: true,
      betaIsrael: true,
      ocidental: true,
      septuaginta: true,
      copta: true
    }
  },
  '2IS': {
    chapters: 11,
    normal: 'Assunção de Isaias',
    gringo: 'Ascension of Isaiah',
    testament: 'old',
    language: {
      geez: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      betaIsrael: true,
      ocidental: false,
      septuaginta: false
    }
  },
  'PIS': { // 4QpIsa
    chapters: 0,
    normal: 'Pesher de Isaias',
    gringo: 'Pesher of Isaiah',
    testament: 'old',
    type: ['pesher'],
    language: {
      hebraic: true
    },
    codex: {
      essenes: true,
      ocidental: false,
      septuaginta: false,
      tewahedo: false
    }
  },
  '1BA': {
    chapters: 0,
    normal: '1 Baruque',
    gringo: '1 Baruc',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      essenes: false,
      tewahedo: true,
      betaIsrael: true,
      ocidental: false,
      septuaginta: true,
      copta: true
    }
  },
  '2BA': {
    chapters: 0,
    normal: 'Apocalipse Siríaco de Baruque',
    gringo: 'Syriac Apocalypse of Baruch',
    testament: 'old',
    language: {
      latim: true,
      syriac: true,
      greek: true
    },
    codex: {
      essenes: false,
      tewahedo: false,
      ocidental: false,
      septuaginta: false,
      syriac: true,
      copta: false
    }
  },
  '4BA': {
    chapters: 0,
    normal: '4 Baruque',
    gringo: '4 Baruc',
    testament: 'old',
    language: {
      geez: true
    },
    codex: {
      essenes: false,
      tewahedo: true,
      betaIsrael: true,
      ocidental: false,
      septuaginta: false,
      copta: false
    }
  },
  '1JE': {
    chapters: 52,
    normal: 'Jeremias',
    gringo: 'Jeremiah',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      aramaic: true, // 4QJer
      greek: true
    },
    codex: {
      essenes: true,
      tewahedo: true,
      betaIsrael: true,
      ocidental: true,
      septuaginta: true,
      copta: true
    }
  },
  '2JE': {
    chapters: 0,
    normal: 'Lamentações de Jeremias',
    gringo: 'Lamentations of Jeremiah',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      betaIsrael: true,
      ocidental: true,
      septuaginta: true,
      copta: true
    }
  },
  '3JE': {
    chapters: 0,
    normal: 'Carta de Jeremias',
    gringo: 'Letter of Jeremiah',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      betaIsrael: true,
      ocidental: true,
      septuaginta: true,
      copta: true
    }
  },
  'EZE': {
    chapters: 48,
    normal: 'Ezequiel',
    gringo: 'Ezekiel',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      betaIsrael: true,
      ocidental: true,
      septuaginta: true,
      copta: true
    }
  },
  '1DA': {
    chapters: 12,
    normal: 'Daniel',
    gringo: 'Daniel',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true,
      aramaic: true
    },
    codex: {
      essenes: true,
      tewahedo: true,
      betaIsrael: true,
      ocidental: true,
      septuaginta: true,
      copta: true
    }
  },
  '2DA': {
    chapters: 0,
    normal: '2 Daniel - Susana e os Anciãos',
    gringo: '2 Daniel - Susanna and the Elders',
    testament: 'old',
    language: {
      geez: true,
      greek: true
    },
    codex: {
      essenes: false,
      tewahedo: true,
      betaIsrael: true,
      ocidental: false,
      septuaginta: true,
      copta: true
    }
  },
  '3DA': {
    chapters: 0,
    normal: '3 Daniel - Bel e o Dragão',
    gringo: '3 Daniel - Bel and the Dragon',
    testament: 'old',
    language: {
      geez: true,
      greek: true
    },
    codex: {
      essenes: false,
      tewahedo: true,
      betaIsrael: true,
      ocidental: false,
      septuaginta: true,
      copta: true
    }
  },
  'OSE': {
    chapters: 14,
    normal: 'Oseias',
    gringo: 'Hosea',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      betaIsrael: true,
      ocidental: true,
      septuaginta: true,
      copta: true
    }
  },
  'POS': { // 4QpHos
    chapters: 0,
    normal: 'Pesher dos Oseias',
    gringo: 'Pesher of Hosea',
    type: ['pesher'],
    testament: 'old',
    language: {
      hebraic: true
    },
    codex: {
      essenes: true,
      ocidental: false,
      septuaginta: false,
      tewahedo: false
    }
  },
  'JOE': {
    chapters: 3,
    normal: 'Joel',
    gringo: 'Joel',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      betaIsrael: true,
      ocidental: true,
      septuaginta: true,
      copta: true
    }
  },
  'AMO': {
    chapters: 9,
    normal: 'Amos',
    gringo: 'Amos',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      betaIsrael: true,
      ocidental: true,
      septuaginta: true,
      copta: true
    }
  },
  'OBA': {
    chapters: 1,
    normal: 'Obadias',
    gringo: 'Obadiah',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      betaIsrael: true,
      ocidental: true,
      septuaginta: true,
      copta: true
    }
  },
  'JON': {
    chapters: 4,
    normal: 'Jonas',
    gringo: 'Jonah',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      betaIsrael: true,
      ocidental: true,
      septuaginta: true,
      copta: true
    }
  },
  'MIQ': {
    chapters: 7,
    normal: 'Miqueias',
    gringo: 'Micah',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      betaIsrael: true,
      ocidental: true,
      septuaginta: true,
      copta: true
    }
  },
  'PMQ': { // 4QpMic
    chapters: 0,
    normal: 'Pesher dos Miqueias',
    gringo: 'Pesher of Micah',
    type: ['pesher'],
    testament: 'old',
    language: {
      hebraic: true
    },
    codex: {
      essenes: true,
      ocidental: false,
      septuaginta: false,
      tewahedo: false
    }
  },
  'NAU': {
    chapters: 3,
    normal: 'Naum',
    gringo: 'Nahum',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      betaIsrael: true,
      ocidental: true,
      septuaginta: true,
      copta: true
    }
  },
  'PNA': { // 4QpNah
    chapters: 0,
    normal: 'Pesher dos Naum',
    gringo: 'Pesher of Nahum',
    type: ['pesher'],
    testament: 'old',
    language: {
      hebraic: true
    },
    codex: {
      essenes: true,
      ocidental: false,
      septuaginta: false,
      tewahedo: false
    }
  },
  'HAB': {
    chapters: 3,
    normal: 'Habacuque',
    gringo: 'Habakkuk',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      betaIsrael: true,
      ocidental: true,
      septuaginta: true,
      copta: true
    }
  },
  'PHB': { // 1QpHab
    chapters: 0,
    normal: 'Pesher dos Habacuque',
    gringo: 'Pesher of Habakkuk',
    type: ['pesher'],
    testament: 'old',
    language: {
      hebraic: true
    },
    codex: {
      essenes: true,
      ocidental: false,
      septuaginta: false,
      tewahedo: false
    }
  },
  'SOF': {
    chapters: 3,
    normal: 'Sofonias',
    gringo: 'Zephaniah',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      betaIsrael: true,
      ocidental: true,
      septuaginta: true,
      copta: true
    }
  },
  'PSF': { // 4QpZeph
    chapters: 0,
    normal: 'Pesher dos Sofonias',
    gringo: 'Pesher of Zephaniah',
    type: ['pesher'],
    testament: 'old',
    language: {
      hebraic: true
    },
    codex: {
      essenes: true,
      ocidental: false,
      septuaginta: false,
      tewahedo: false
    }
  },
  'AGE': {
    chapters: 2,
    normal: 'Ageu',
    gringo: 'Haggai',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      betaIsrael: true,
      ocidental: true,
      septuaginta: true,
      copta: true
    }
  },
  'ZAC': {
    chapters: 14,
    normal: 'Zacarias',
    gringo: 'Zechariah',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      betaIsrael: true,
      ocidental: true,
      septuaginta: true,
      copta: true
    }
  },
  'MAL': {
    chapters: 4,
    normal: 'Malaquias',
    gringo: 'Malachi',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      betaIsrael: true,
      ocidental: true,
      septuaginta: true,
      copta: true
    }
  },
  'PML': { // 4QpMal
    chapters: 0,
    normal: 'Pesher dos Malaquias',
    gringo: 'Pesher of Malachi',
    type: ['pesher'],
    testament: 'old',
    language: {
      hebraic: true
    },
    codex: {
      essenes: true,
      ocidental: false,
      septuaginta: false,
      tewahedo: false
    }
  },
  'TOB': {
    chapters: 0,
    normal: 'Tobias',
    gringo: 'Tobit',
    testament: 'old',
    language: {
      geez: true,
      aramaic: true,
      hebraic: true,
      greek: true
    },
    codex: {
      essenes: true,
      tewahedo: true,
      betaIsrael: true,
      ocidental: false,
      septuaginta: true,
      copta: true
    }
  },
  'JDT': {
    chapters: 0,
    normal: 'Judite',
    gringo: 'Judith',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codex: {
      essenes: true,
      tewahedo: true,
      betaIsrael: true,
      ocidental: false,
      septuaginta: true,
      copta: true
    }
  },
  'TAO': {
    chapters: 0,
    normal: 'Tao Te Ching',
    gringo: 'Tao Te Ching',
    testament: 'global',
    type: ['sapiential'],
    language: {
      chinese: true
    },
    codex: {
      essenes: false,
      tewahedo: false,
      ocidental: false,
      septuaginta: false,
      copta: false,
      sethian: false,
      chinese: true
    }
  },
  'BGV': {
    chapters: 0,
    normal: 'Bagava Gita - Canção Divina',
    gringo: 'Bhagavad Gita - Divine Song',
    testament: 'global',
    type: ['sapiential'],
    language: {
      sanskrit: true
    },
    codex: {
      essenes: false,
      tewahedo: false,
      ocidental: false,
      septuaginta: false,
      copta: false,
      sethian: false,
      indian: true
    }
  },
  '1TP': {
    chapters: 0,
    normal: '1 Tripitaka - Vinaya Pitaka',
    gringo: '1 Tripitaka - Vinaya Pitaka',
    testament: 'global',
    type: ['rule'],
    language: {
      sanskrit: true,
      chinese: true
    },
    codex: {
      essenes: false,
      tewahedo: false,
      ocidental: false,
      septuaginta: false,
      copta: false,
      sethian: false,
      indian: true,
      chinese: true
    }
  },
  '2TP': {
    chapters: 0,
    normal: '2 Tripitaka - Sutta Pitaka',
    gringo: '2 Tripitaka - Sutta Pitaka',
    testament: 'global',
    type: ['sapiential'],
    language: {
      sanskrit: true,
      chinese: true
    },
    codex: {
      essenes: false,
      tewahedo: false,
      ocidental: false,
      septuaginta: false,
      copta: false,
      sethian: false,
      indian: true,
      chinese: true
    }
  },
  '3TP': {
    chapters: 0,
    normal: '3 Tripitaka - Abhidhamma Pitaka',
    gringo: '3 Tripitaka - Abhidhamma Pitaka',
    testament: 'global',
    type: ['sapiential'],
    language: {
      sanskrit: true,
      chinese: true
    },
    codex: {
      essenes: false,
      tewahedo: false,
      ocidental: false,
      septuaginta: false,
      copta: false,
      sethian: false,
      indian: true,
      chinese: true
    }
  },
  'ZST': {
    chapters: 0,
    normal: 'Zostriano',
    gringo: 'Zostriano',
    testament: 'global',
    type: ['sapiential'],
    language: {
      copta: true
    },
    codex: {
      essenes: false,
      tewahedo: false,
      ocidental: false,
      septuaginta: false,
      copta: false,
      sethian: true
    }
  },
  'ZRT': {
    chapters: 0,
    normal: 'Avesta de Zoroastro',
    gringo: 'Avesta of Zarathustra',
    testament: 'global',
    type: ['sapiential'],
    language: {
      avestico: true,
      pahlavi: true
    },
    codex: {
      essenes: false,
      tewahedo: false,
      ocidental: false,
      septuaginta: false,
      copta: false,
      sethian: false,
      persian: true
    }
  },
  '1HR': {
    chapters: 0,
    normal: 'Tábua de Esmeralda',
    gringo: 'Emerald Tablet',
    testament: 'global',
    language: {
      arabic: true
    },
    codex: {
      essenes: false,
      tewahedo: false,
      ocidental: false,
      septuaginta: false,
      copta: false,
      sethian: false
    }
  },
  '2HR': {
    chapters: 17,
    normal: 'Corpus Hermeticum',
    gringo: 'Corpus Hermeticum',
    testament: 'global',
    type: ['sapiential'],
    oldestLanguageFound: 'greek',
    language: {
      greek: true
    },
    codex: {
      essenes: false,
      tewahedo: false,
      ocidental: false,
      septuaginta: false,
      copta: false,
      sethian: false
    }
  },
  'PIT': {
    chapters: 0,
    normal: 'Versos Dourados Pitagoras',
    gringo: 'Golden Verses of Pitagoras',
    testament: 'global',
    type: ['sapiential', 'poesy'],
    language: {
      greek: true
    },
    codex: {
      essenes: false,
      tewahedo: false,
      ocidental: false,
      septuaginta: false,
      copta: false,
      sethian: false,
      helenism: true
    }
  },
  'HRC': {
    chapters: 0,
    normal: 'Sobre a Natureza de Heráclito',
    gringo: 'On Nature of Heraclitus',
    testament: 'global',
    type: ['sapiential', 'poesy'],
    language: {
      greek: true
    },
    codex: {
      essenes: false,
      tewahedo: false,
      ocidental: false,
      septuaginta: false,
      copta: false,
      sethian: false
    }
  },
  'PLT': {
    chapters: 13,
    normal: 'Platão',
    gringo: 'Plato',
    testament: 'global',
    type: ['sapiential'],
    language: {
      greek: true
    },
    codex: {
      essenes: false,
      tewahedo: false,
      ocidental: false,
      septuaginta: false,
      copta: false,
      sethian: true
    }
  },

// A República (Politeia)
// Leis (Nomoi)
// O Político (Politikos)
// Sofista (Sophistes)
// Timeu (Timaeus)
// Parmênides (Parmenides)
// Fédon (Phaedo)
// Sofista (Sophistes) e Teeteto (Theaetetus)
// Banquete (Symposium)
// Fedro (Phaedrus)
// Mênon (Meno)
// Górgias (Gorgias)
// Protágoras (Protagoras)

  'CRI': {
    chapters: 0,
    normal: 'Sobre o Universo de Crisipo',
    gringo: 'On Universe of Crisipo',
    testament: 'global',
    type: ['sapiential'],
    language: {
      greek: true
    },
    codex: {
      essenes: false,
      tewahedo: false,
      ocidental: false,
      septuaginta: false,
      copta: false,
      sethian: false,
      helenism: true
    }
  },
  '1CI': {
    chapters: 0,
    normal: 'De Natura Deorum de Cícero',
    gringo: 'De Natura Deorum of Cicero',
    testament: 'global',
    type: ['sapiential'],
    language: {
      latim: true,
      greek: true
    },
    codex: {
      essenes: false,
      tewahedo: false,
      ocidental: false,
      septuaginta: false,
      copta: false,
      sethian: false,
      helenism: true
    }
  },
  '2CI': {
    chapters: 0,
    normal: 'Tusculanae Disputationes de Cícero',
    gringo: 'Tusculanae Disputationes of Cicero',
    testament: 'global',
    type: ['sapiential'],
    language: {
      latim: true,
      greek: true
    },
    codex: {
      essenes: false,
      tewahedo: false,
      ocidental: false,
      septuaginta: false,
      copta: false,
      sethian: false,
      helenism: true
    }
  },
  '1SE': {
    chapters: 0,
    normal: 'Epistulae Morales ad Lucilium de Seneca',
    gringo: 'Epistulae Morales ad Lucilium of Seneca',
    testament: 'global',
    type: ['sapiential'],
    language: {
      latim: true
    },
    codex: {
      essenes: false,
      tewahedo: false,
      ocidental: false,
      septuaginta: false,
      copta: false,
      sethian: false,
      helenism: true
    }
  },
  '2SE': {
    chapters: 0,
    normal: 'Naturales Quaestiones de Seneca',
    gringo: 'Naturales Quaestiones of Seneca',
    testament: 'global',
    type: ['sapiential'],
    language: {
      latim: true
    },
    codex: {
      essenes: false,
      tewahedo: false,
      ocidental: false,
      septuaginta: false,
      copta: false,
      sethian: false,
      helenism: true
    }
  },
  '1EP': {
    chapters: 0,
    normal: '1 Epicteto',
    gringo: '1 Epicteto',
    testament: 'global',
    type: ['sapiential'],
    language: {
      greek: true
    },
    codex: {
      essenes: false,
      tewahedo: false,
      ocidental: false,
      septuaginta: false,
      copta: false,
      sethian: false,
      helenism: true
    }
  },
  '2EP': {
    chapters: 0,
    normal: '2 Epicteto',
    gringo: '2 Epicteto',
    testament: 'global',
    type: ['sapiential'],
    language: {
      greek: true
    },
    codex: {
      essenes: false,
      tewahedo: false,
      ocidental: false,
      septuaginta: false,
      copta: false,
      sethian: false,
      helenism: true
    }
  },
  'ETO': {
    chapters: 0,
    normal: 'Anthologium de Estobeu',
    gringo: 'Anthologium of Estobeu',
    testament: 'global',
    type: ['sapiential'],
    language: {
      greek: true
    },
    codex: {
      essenes: false,
      tewahedo: false,
      ocidental: false,
      septuaginta: false,
      copta: false,
      sethian: false,
      helenism: true
    }
  },
  'RCM': { // 1QS
    chapters: 0,
    normal: "Regra da Comunidade",
    gringo: "Rule of the Community",
    testament: "old",
    language: { hebraic: true },
    codex: { essenes: true, ocidental: false, septuaginta: false, tewahedo: false }
  },
  'RCG': { // 1QSa
    chapters: 0,
    normal: "Regra da Congregação",
    gringo: "Rule of the Congregation",
    testament: "old",
    language: { hebraic: true },
    codex: { essenes: true, ocidental: false, septuaginta: false, tewahedo: false }
  },
  'RBE': { // 1QSb
    chapters: 0,
    normal: "Regra das Bênçãos",
    gringo: "Rule of Blessings",
    testament: "old",
    language: { hebraic: true },
    codex: { essenes: true, ocidental: false, septuaginta: false, tewahedo: false }
  },
  'HNG': { // 1QH
    chapters: 0,
    normal: "Hinos de Ação de Graças",
    gringo: "Thanksgiving Hymns",
    testament: "old",
    language: { hebraic: true },
    codex: { essenes: true, ocidental: false, septuaginta: false, tewahedo: false }
  },
  'DMC': { // CD
    chapters: 0,
    normal: "Documento de Damasco",
    gringo: "Damascus Document",
    testament: "old",
    language: { hebraic: true },
    codex: { essenes: true, ocidental: false, septuaginta: false, tewahedo: false }
  },
  'GLT': { // 1QM
    chapters: 0,
    normal: "A Guerra dos Filhos da Luz contra os Filhos das Trevas",
    gringo: "The War of the Sons of Light Against the Sons of Darkness",
    testament: "old",
    language: { hebraic: true },
    codex: { essenes: true, ocidental: false, septuaginta: false, tewahedo: false }
  },
  'TMP': { // 11QTemple
    chapters: 0,
    normal: "Rolo do Templo",
    gringo: "Temple Scroll",
    testament: "old",
    language: { hebraic: true },
    codex: { essenes: true, ocidental: false, septuaginta: false, tewahedo: false }
  },
  'CSS': { // 4Q400
    chapters: 0,
    normal: "Cânticos do Sacrifício do Sábado",
    gringo: "Songs of the Sabbath Sacrifice",
    testament: "old",
    language: { hebraic: true },
    codex: { essenes: true, ocidental: false, septuaginta: false, tewahedo: false }
  },
  'BEN': { // 4QBerakhot
    chapters: 0,
    normal: "Bênçãos",
    gringo: "Blessings",
    testament: "old",
    language: { hebraic: true },
    codex: { essenes: true, ocidental: false, septuaginta: false, tewahedo: false }
  },
  'OTO': { // 4QOtot
    chapters: 0,
    normal: "Otot - Sinais e Calendários",
    gringo: "Otot - Signs and Calendars",
    testament: "old",
    language: { hebraic: true },
    codex: { essenes: true, ocidental: false, septuaginta: false, tewahedo: false }
  },
  'CAD': { // 4Q503
    chapters: 0,
    normal: "Orações Calendáricas",
    gringo: "Calendrical Prayers",
    testament: "old",
    language: { hebraic: true },
    codex: { essenes: true, ocidental: false, septuaginta: false, tewahedo: false }
  },
  'PSC': { // 4QPesach
    chapters: 0,
    normal: "Páscoa",
    gringo: "Pesach",
    testament: "old",
    language: { hebraic: true },
    codex: { essenes: true, ocidental: false, septuaginta: false, tewahedo: false }
  },
  'HLI': { // 4Q251, 4Q252
    chapters: 0,
    normal: "Haláquico",
    gringo: "Halakhic",
    testament: "old",
    language: { hebraic: true },
    codex: { essenes: true, ocidental: false, septuaginta: false, tewahedo: false }
  },
  'HLA': { // 4Q159
    chapters: 0,
    normal: "Halacá",
    gringo: "Halakhah",
    testament: "old",
    language: { hebraic: true },
    codex: { essenes: true, ocidental: false, septuaginta: false, tewahedo: false }
  },
  'PCB': { // 3Q15
    chapters: 0,
    normal: "Pergaminho de Cobre",
    gringo: "Copper Scroll",
    testament: "old",
    type: [ "treasure" ],
    language: { hebraic: true },
    codex: { essenes: true, ocidental: false, septuaginta: false, tewahedo: false }
  },
  '1MA': {
    chapters: 0,
    normal: '1 Macabeus Grego',
    gringo: '1 Maccabees Greek',
    testament: 'old',
    type: ['history'],
    language: {
      greek: true
    },
    codex: {
      essenes: false,
      tewahedo: false,
      ocidental: false,
      septuaginta: true,
      copta: true
    }
  },
  '2MA': {
    chapters: 0,
    normal: '2 Macabeus Grego',
    gringo: '2 Maccabees Greek',
    testament: 'old',
    language: {
      greek: true
    },
    codex: {
      essenes: false,
      tewahedo: false,
      ocidental: false,
      septuaginta: true,
      copta: true
    }
  },
  '3MA': {
    chapters: 0,
    normal: '3 Macabeus Grego',
    gringo: '3 Maccabees Greek',
    testament: 'old',
    language: {
      greek: true
    },
    codex: {
      essenes: false,
      tewahedo: false,
      ocidental: false,
      septuaginta: true,
      copta: true
    }
  },
  '4MA': {
    chapters: 0,
    normal: '4 Macabeus Grego',
    gringo: '4 Maccabees Greek',
    testament: 'old',
    language: {
      greek: true
    },
    codex: {
      essenes: false,
      tewahedo: false,
      ocidental: false,
      septuaginta: true,
      copta: true
    }
  },
  '1ME': {
    chapters: 0,
    normal: '1 Macabeus Etíope',
    gringo: '1 Maccabees Ethiopian',
    testament: 'old',
    type: ['history'],
    language: {
      geez: true
    },
    codex: {
      essenes: false,
      tewahedo: true,
      betaIsrael: true,
      ocidental: false,
      septuaginta: false,
      copta: false
    }
  },
  '2ME': {
    chapters: 0,
    normal: '2 Macabeus Etíope',
    gringo: '2 Maccabees Ethiopian',
    testament: 'old',
    language: {
      geez: true
    },
    codex: {
      essenes: false,
      tewahedo: true,
      betaIsrael: true,
      ocidental: false,
      septuaginta: false,
      copta: false
    }
  },
  '3ME': {
    chapters: 0,
    normal: '3 Macabeus Etíope',
    gringo: '3 Maccabees Ethiopian',
    testament: 'old',
    language: {
      geez: true
    },
    codex: {
      essenes: false,
      tewahedo: true,
      betaIsrael: true,
      ocidental: false,
      septuaginta: false,
      copta: false
    }
  },
  'MAT': {
    chapters: 28,
    normal: 'Mateus',
    gringo: 'Matthew',
    testament: 'new',
    language: {
      geez: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  'MAR': {
    chapters: 16,
    normal: 'Marcos',
    gringo: 'Mark',
    testament: 'new',
    language: {
      geez: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  'LUC': {
    chapters: 24,
    normal: 'Lucas',
    gringo: 'Luke',
    testament: 'new',
    language: {
      geez: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  'JOA': {
    chapters: 21,
    normal: 'Joao',
    gringo: 'John',
    testament: 'new',
    language: {
      geez: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  'ATO': {
    chapters: 28,
    normal: 'Atos',
    gringo: 'Acts',
    testament: 'new',
    language: {
      geez: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  'PHR': {
    chapters: 0,
    normal: 'O Pastor de Hermas',
    gringo: 'Shepherd of Hermas',
    testament: 'new',
    language: {
      greek: true,
      copta: true
    },
    codex: {
      tewahedo: false,
      ocidental: false,
      septuaginta: false,
      essenes: false
    }
  },
  'ROM': {
    chapters: 16,
    normal: 'Romanos',
    gringo: 'Romans',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  '1CO': {
    chapters: 16,
    normal: '1 Corintios',
    gringo: '1 Corinthians',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  '2CO': {
    chapters: 13,
    normal: '2 Corintios',
    gringo: '2 Corinthians',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  '3CO': {
    chapters: 0,
    normal: '3 Corintios',
    gringo: '3 Corinthians',
    testament: 'new',
    type: ['letter'],
    oldestLanguageFound: 'greek',
    language: {
      geez: true,
      syriac: true,
      copta: true
    },
    codex: {
      tewahedo: true,
      ocidental: false,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  'GAL': {
    chapters: 6,
    normal: 'Galatas',
    gringo: 'Galatians',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  'EFE': {
    chapters: 6,
    normal: 'Efesios',
    gringo: 'Ephesians',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  'FIL': {
    chapters: 4,
    normal: 'Filipenses',
    gringo: 'Philippians',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  'COL': {
    chapters: 4,
    normal: 'Colossenses',
    gringo: 'Colossians',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  '1TS': {
    chapters: 5,
    normal: '1 Tessalonicenses',
    gringo: '1 Thessalonians',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  '2TS': {
    chapters: 3,
    normal: '2 Tessalonicenses',
    gringo: '2 Thessalonians',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  '1TM': {
    chapters: 6,
    normal: '1 Timoteo',
    gringo: '1 Timothy',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  '2TM': {
    chapters: 4,
    normal: '2 Timoteo',
    gringo: '2 Timothy',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  'TIT': {
    chapters: 3,
    normal: 'Tito',
    gringo: 'Titus',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  'FLM': {
    chapters: 1,
    normal: 'Filemom',
    gringo: 'Philemon',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  'HEB': {
    chapters: 13,
    normal: 'Hebreus',
    gringo: 'Hebrews',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  'LAD': {
    chapters: 0,
    normal: 'Laodicenses',
    gringo: 'Laodiceans',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  'TIA': {
    chapters: 5,
    normal: '1 Tiago',
    gringo: '1 James',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  '1PE': {
    chapters: 5,
    normal: '1 Pedro',
    gringo: '1 Peter',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  '2PE': {
    chapters: 3,
    normal: '2 Pedro',
    gringo: '2 Peter',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  '1JO': {
    chapters: 5,
    normal: '1 Joao',
    gringo: '1 John',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  '2JO': {
    chapters: 1,
    normal: '2 Joao',
    gringo: '2 John',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  '3JO': {
    chapters: 1,
    normal: '3 Joao',
    gringo: '3 John',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  'JUD': {
    chapters: 1,
    normal: 'Judas',
    gringo: 'Jude',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codex: {
      tewahedo: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  'JBG': {
    chapters: 0,
    normal: 'José filho de Bengorion',
    gringo: 'Josefas son of Bengorion',
    testament: 'new',
    language: {
      geez: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: true,
      essenes: false
    }
  },
  'SRT': {
    chapters: 0,
    normal: 'Sirate de Sião',
    gringo: 'Sirate Tsion',
    testament: 'new',
    language: {
      geez: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: true,
      essenes: false
    }
  },
  'TZA': {
    chapters: 0,
    normal: 'Tizaz',
    gringo: 'Tizaz',
    testament: 'new',
    language: {
      geez: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: true,
      essenes: false
    }
  },
  'GIT': {
    chapters: 0,
    normal: 'Gitseu',
    gringo: 'Gitsew',
    testament: 'new',
    language: {
      geez: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: true,
      essenes: false
    }
  },
  'ABS': {
    chapters: 0,
    normal: 'Abtilis',
    gringo: 'Abtilis',
    testament: 'new',
    language: {
      geez: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: true,
      essenes: false
    }
  },
  '1DO': {
    chapters: 0,
    normal: '1 Dominos',
    gringo: '1 Dominos',
    testament: 'new',
    language: {
      geez: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: true,
      essenes: false
    }
  },
  '2DO': {
    chapters: 0,
    normal: '2 Dominos',
    gringo: '2 Dominos',
    testament: 'new',
    language: {
      geez: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: true,
      essenes: false
    }
  },
  '1CM': {
    chapters: 0,
    normal: 'Corintios de Clemente',
    gringo: 'Corinthians of Clement',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true,
      syriac: true,
      copta: true
    },
    codex: {
      tewahedo: true,
      ocidental: false,
      septuaginta: false,
      essenes: false,
      copta: true,
      bizantine: true
    }
  },
  '2CM': {
    chapters: 0,
    normal: 'Homilia de Clemente',
    gringo: 'Homily of Clement',
    testament: 'new',
    type: ['letter'],
    language: {
      greek: true
    },
    codex: {
      tewahedo: false,
      ocidental: false,
      septuaginta: false,
      essenes: false,
      copta: false,
      bizantine: true
    }
  },
  '1PC': {
    chapters: 0,
    normal: 'Carta de Pedro a Clemente Árabe',
    gringo: 'Letter of Peter to Clement Arab',
    testament: 'new',
    language: {
      arabic: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: false,
      essenes: false
    }
  },
  '2PC': {
    chapters: 0,
    normal: 'Carta de Pedro a Clemente Etíope',
    gringo: 'Letter of Peter to Clement Ethiopian',
    testament: 'new',
    language: {
      geez: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: true,
      essenes: false
    }
  },
  'RL1': {
    chapters: 0,
    normal: 'Livro dos Rolos Árabe',
    gringo: 'Book of Rolls Arabic',
    testament: 'new',
    language: {
      arabic: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: false,
      essenes: false
    }
  },
  'RL2': {
    chapters: 0,
    normal: 'Livro dos Rolos Etíope',
    gringo: 'Book of Rolls Ethiopian',
    testament: 'new',
    language: {
      geez: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: true,
      essenes: false
    }
  },
  'DDS': {
    chapters: 0,
    normal: 'Didascália',
    gringo: 'Didascalia',
    testament: 'new',
    language: {
      geez: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: true,
      essenes: false
    }
  },
  'APO': {
    chapters: 22,
    normal: 'Apocalipse de João',
    gringo: 'Apocalypse of John',
    testament: 'new',
    type: ['prophecy'],
    language: {
      geez: true,
      greek: true
    },
    codex: {
      ocidental: true,
      septuaginta: false,
      tewahedo: true,
      essenes: false
    }
  },
  'SIB': {
    chapters: 12,
    normal: 'Oráculos Sibilinos',
    gringo: 'Sibylline Oracles',
    testament: 'new',
    type: ['prophecy'],
    language: {
      greek: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: false,
      essenes: false,
      helenism: true
    }
  },
  'NEW': {
    chapters: 0,
    normal: 'Apocalipse de Isaac Newton',
    gringo: 'Apocalipse of Isaac Newton',
    testament: 'new',
    type: ['pesher'],
    language: {
      english: true
    },
    codex: {
      ocidental: false,
      septuaginta: false,
      tewahedo: false,
      essenes: false
    }
  }
}
