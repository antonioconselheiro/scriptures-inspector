export const bibleMetadata: {
  [abrev: string]: {
    chapters: number,
    normal: string,
    gringo: string,
    testament: 'global' | 'old' | 'new',
    type?: Array<'letter' | 'rule' | 'history' | 'sapiential' | 'poesy' | 'prophecy' | 'pesher'>,
    language: {
      aramaic?: boolean,
      hebraic?: boolean,
      geez?: boolean,
      syriac?: boolean,
      latim?: boolean,
      greek?: boolean,
      copta?: boolean,
      sanskrit?: boolean,
      chinese?: boolean,
      avestico?: boolean,
      pahlavi?: boolean,
      english?: boolean
    },

    codice: {
      ocidental: boolean,
      septuaginta: boolean,
      essenes?: boolean,
      syriac?: boolean,
      copta?: boolean,
      sethian?: boolean,
      ethiopian: boolean,
      indian?: boolean,
      chinese?: boolean,
      persian?: boolean,
      bizantine?: boolean,
      helenism?: boolean
    }
  }
} = {
  'ENO': {
    chapters: 0,
    normal: 'Enoque',
    gringo: 'Enoch',
    testament: 'old',
    type: ['history', 'prophecy'],
    language: {
      aramaic: true,
      geez: true
    },
    codice: {
      ocidental: false,
      septuaginta: false,
      ethiopian: true,
      essenes: true
    }
  },
  'MQS': { // 11Q, 11Q13
    chapters: 0,
    normal: 'Mequisedeque',
    gringo: 'Mechizedek',
    testament: 'old',
    type: [],
    language: {
      hebraic: true
    },
    codice: {
      ocidental: false,
      septuaginta: false,
      ethiopian: false,
      essenes: true
    }
  },
  'GAB': { // 1Q20
    chapters: 0,
    normal: 'Gênesis de Abraão',
    gringo: 'Genesis of Abraham',
    testament: 'old',
    type: [],
    language: {
      hebraic: true
    },
    codice: {
      ocidental: false,
      septuaginta: false,
      ethiopian: false,
      essenes: true
    }
  },
  'AAB': {
    chapters: 0,
    normal: 'Apocalipse de Abraão',
    gringo: 'Apocalipse of Abraham',
    testament: 'old',
    type: [],
    language: {
      syriac: true
    },
    codice: {
      ocidental: false,
      septuaginta: false,
      ethiopian: false,
      essenes: false,
      syriac: true
    }
  },
  'TAB': {
    chapters: 0,
    normal: 'Testamento de Abraão',
    gringo: 'Testament of Abraham',
    testament: 'old',
    type: [],
    language: {
      greek: true,
      copta: true
    },
    codice: {
      ocidental: false,
      septuaginta: false,
      ethiopian: false,
      essenes: false,
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
    codice: {
      ocidental: false,
      septuaginta: false,
      ethiopian: true,
      essenes: true
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
    codice: {
      ocidental: true,
      septuaginta: true,
      ethiopian: true
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
    codice: {
      ocidental: true,
      septuaginta: true,
      ethiopian: true
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
    codice: {
      ocidental: true,
      septuaginta: true,
      ethiopian: true
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
    codice: {
      ocidental: true,
      septuaginta: true,
      ethiopian: true
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
    codice: {
      ocidental: true,
      septuaginta: true,
      ethiopian: true
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
    codice: {
      essenes: true,
      ocidental: false,
      septuaginta: false,
      ethiopian: false
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
    codice: {
      ocidental: true,
      septuaginta: true,
      ethiopian: true
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
    codice: {
      ocidental: true,
      septuaginta: true,
      ethiopian: true
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
    codice: {
      ocidental: true,
      septuaginta: true,
      ethiopian: true
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
    codice: {
      ocidental: true,
      septuaginta: true,
      ethiopian: true,
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
    codice: {
      ocidental: true,
      septuaginta: true,
      ethiopian: true
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
    codice: {
      ocidental: true,
      septuaginta: true,
      ethiopian: true
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
    codice: {
      ocidental: true,
      septuaginta: true,
      ethiopian: true
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
    codice: {
      ocidental: true,
      septuaginta: true,
      ethiopian: true
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
    codice: {
      ocidental: true,
      septuaginta: true,
      ethiopian: true
    }
  },
  '1ED': {
    chapters: 10,
    normal: 'Esdras',
    gringo: 'Ezra',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codice: {
      ocidental: true,
      septuaginta: true,
      ethiopian: true
    }
  },
  '2ED': {
    chapters: 13,
    normal: '2 Esdras - Neemias',
    gringo: '2 Esdras - Nehemiah',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codice: {
      ocidental: false,
      septuaginta: true,
      ethiopian: true
    }
  },
  '3ED': {
    chapters: 0,
    normal: '3 Esdras',
    gringo: '3 Ezra',
    testament: 'old',
    language: {
      geez: true,
      greek: true
    },
    codice: {
      ocidental: false,
      septuaginta: true,
      ethiopian: true
    }
  },
  '1ET': {
    chapters: 10,
    normal: 'Ester',
    gringo: 'Esther',
    testament: 'old',
    language: {
      geez: true,
      greek: true,
      hebraic: true
    },
    codice: {
      ocidental: true,
      septuaginta: true,
      ethiopian: true,
      essenes: false
    }
  },
  '2ET': {
    chapters: 6,
    normal: '2 Ester',
    gringo: '2 Esther',
    testament: 'old',
    language: {
      geez: true,
      greek: true
    },
    codice: {
      ocidental: false,
      septuaginta: true,
      ethiopian: true,
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
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: true,
      copta: true
    }
  },
  'SAL': {
    chapters: 150,
    normal: '1 Salmos',
    gringo: '1 Psalms',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codice: {
      essenes: true,
      ethiopian: true,
      ocidental: true,
      septuaginta: true,
      copta: true
    }
  },
  'SL2': { // 4Q448, 11QPs
    chapters: 0,
    normal: '2 Salmos',
    gringo: '2 Psalms',
    testament: 'old',
    language: {
      hebraic: true
    },
    codice: {
      essenes: true,
      ethiopian: false,
      ocidental: false,
      septuaginta: false,
      copta: false
    }
  },
  'SL3': {
    chapters: 0,
    normal: 'Salmos de Salomão',
    gringo: 'Psalms of Solomon',
    testament: 'old',
    language: {
      hebraic: true
    },
    codice: {
      ethiopian: false,
      ocidental: false,
      septuaginta: false,
      essenes: false,
      syriac: false
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
    codice: {
      essenes: true,
      ocidental: false,
      septuaginta: false,
      ethiopian: false
    }
  },
  'ODS': {
    chapters: 42,
    normal: 'Odes de Salomão',
    gringo: 'Odes of Solomon',
    testament: 'old',
    language: {
      syriac: true,
      greek: true,
      copta: true
    },
    codice: {
      ethiopian: false,
      ocidental: false,
      septuaginta: false,
      essenes: false,
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
    codice: {
      ethiopian: true,
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
    codice: {
      ethiopian: true,
      ocidental: false,
      septuaginta: true,
      essenes: false
    }
  },

  'SES': { // 4Q417, 4Q418, 4Q419, Q4Instructions
    chapters: 0,
    normal: "Sabedoria dos Essênios",
    gringo: "Wisdom of Essenes",
    testament: "old",
    language: { hebraic: true },
    codice: { essenes: true, ocidental: false, septuaginta: false, ethiopian: false }
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
    codice: {
      ethiopian: true,
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
    language: {
      geez: true,
      greek: true
    },
    codice: {
      ocidental: false,
      septuaginta: true,
      ethiopian: true,
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
    codice: {
      ethiopian: true,
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
    codice: {
      ocidental: false,
      septuaginta: false,
      ethiopian: false,
      essenes: true,
      syriac: false
    }
  },
  'ISA': {
    chapters: 66,
    normal: 'Isaias',
    gringo: 'Isaiah',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codice: {
      essenes: true,
      ethiopian: true,
      ocidental: true,
      septuaginta: true,
      copta: true
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
    codice: {
      essenes: true,
      ocidental: false,
      septuaginta: false,
      ethiopian: false
    }
  },
  'BAR': {
    chapters: 0,
    normal: 'Baruque',
    gringo: 'Baruc',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codice: {
      ethiopian: true,
      ocidental: false,
      septuaginta: true,
      copta: true
    }
  },
  'JE1': {
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
    codice: {
      essenes: true,
      ethiopian: true,
      ocidental: true,
      septuaginta: true,
      copta: true
    }
  },
  'JE2': {
    chapters: 5,
    normal: 'Lamentações de Jeremias',
    gringo: 'Lamentations of Jeremiah',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: true,
      copta: true
    }
  },
  'JE3': {
    chapters: 5,
    normal: 'Carta de Jeremias',
    gringo: 'Letter of Jeremiah',
    testament: 'old',
    language: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codice: {
      ethiopian: true,
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
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: true,
      copta: true
    }
  },
  'DA1': {
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
    codice: {
      essenes: true,
      ethiopian: true,
      ocidental: true,
      septuaginta: true,
      copta: true
    }
  },
  'DA2': {
    chapters: 0,
    normal: '2 Daniel - Susana e os Anciãos',
    gringo: '2 Daniel - Susanna and the Elders',
    testament: 'old',
    language: {
      geez: true,
      greek: true
    },
    codice: {
      essenes: false,
      ethiopian: true,
      ocidental: false,
      septuaginta: true,
      copta: true
    }
  },
  'DA3': {
    chapters: 0,
    normal: '3 Daniel - Bel e o Dragão',
    gringo: '3 Daniel - Bel and the Dragon',
    testament: 'old',
    language: {
      geez: true,
      greek: true
    },
    codice: {
      essenes: false,
      ethiopian: true,
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
    codice: {
      ethiopian: true,
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
    codice: {
      essenes: true,
      ocidental: false,
      septuaginta: false,
      ethiopian: false
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
    codice: {
      ethiopian: true,
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
    codice: {
      ethiopian: true,
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
    codice: {
      ethiopian: true,
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
    codice: {
      ethiopian: true,
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
    codice: {
      ethiopian: true,
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
    codice: {
      essenes: true,
      ocidental: false,
      septuaginta: false,
      ethiopian: false
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
    codice: {
      ethiopian: true,
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
    codice: {
      essenes: true,
      ocidental: false,
      septuaginta: false,
      ethiopian: false
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
    codice: {
      ethiopian: true,
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
    codice: {
      essenes: true,
      ocidental: false,
      septuaginta: false,
      ethiopian: false
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
    codice: {
      ethiopian: true,
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
    codice: {
      essenes: true,
      ocidental: false,
      septuaginta: false,
      ethiopian: false
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
    codice: {
      ethiopian: true,
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
    codice: {
      ethiopian: true,
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
    codice: {
      ethiopian: true,
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
    codice: {
      essenes: true,
      ocidental: false,
      septuaginta: false,
      ethiopian: false
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
    codice: {
      essenes: true,
      ethiopian: true,
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
    codice: {
      essenes: true,
      ethiopian: true,
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
    codice: {
      essenes: false,
      ethiopian: false,
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
    codice: {
      essenes: false,
      ethiopian: false,
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
    codice: {
      essenes: false,
      ethiopian: false,
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
    codice: {
      essenes: false,
      ethiopian: false,
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
    codice: {
      essenes: false,
      ethiopian: false,
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
    codice: {
      essenes: false,
      ethiopian: false,
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
    codice: {
      essenes: false,
      ethiopian: false,
      ocidental: false,
      septuaginta: false,
      copta: false,
      sethian: false,
      persian: true
    }
  },
  'HER': {
    chapters: 17,
    normal: 'Corpus Hermeticum',
    gringo: 'Corpus Hermeticum',
    testament: 'global',
    type: ['sapiential'],
    language: {
      greek: true,
      copta: true
    },
    codice: {
      essenes: false,
      ethiopian: false,
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
    codice: {
      essenes: false,
      ethiopian: false,
      ocidental: false,
      septuaginta: false,
      copta: false,
      sethian: false
    }
  },
  'NAT': {
    chapters: 0,
    normal: 'Sobre a Natureza de Heráclito',
    gringo: 'On Nature of Heraclitus',
    testament: 'global',
    type: ['sapiential', 'poesy'],
    language: {
      greek: true
    },
    codice: {
      essenes: false,
      ethiopian: false,
      ocidental: false,
      septuaginta: false,
      copta: false,
      sethian: false
    }
  },
  'CRI': {
    chapters: 0,
    normal: 'Sobre o Universo de Crisipo',
    gringo: 'On Universe of Crisipo',
    testament: 'global',
    type: ['sapiential'],
    language: {
      greek: true
    },
    codice: {
      essenes: false,
      ethiopian: false,
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
    codice: {
      essenes: false,
      ethiopian: false,
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
    codice: {
      essenes: false,
      ethiopian: false,
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
    codice: {
      essenes: false,
      ethiopian: false,
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
    codice: {
      essenes: false,
      ethiopian: false,
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
    codice: {
      essenes: false,
      ethiopian: false,
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
    codice: {
      essenes: false,
      ethiopian: false,
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
    codice: {
      essenes: false,
      ethiopian: false,
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
    codice: { essenes: true, ocidental: false, septuaginta: false, ethiopian: false }
  },
  'RCG': { // 1QSa
    chapters: 0,
    normal: "Regra da Congregação",
    gringo: "Rule of the Congregation",
    testament: "old",
    language: { hebraic: true },
    codice: { essenes: true, ocidental: false, septuaginta: false, ethiopian: false }
  },

  'RBE': { // 1QSb
    chapters: 0,
    normal: "Regra das Bênçãos",
    gringo: "Rule of Blessings",
    testament: "old",
    language: { hebraic: true },
    codice: { essenes: true, ocidental: false, septuaginta: false, ethiopian: false }
  },
  'HNG': { // 1QH
    chapters: 0,
    normal: "Hinos de Ação de Graças",
    gringo: "Thanksgiving Hymns",
    testament: "old",
    language: { hebraic: true },
    codice: { essenes: true, ocidental: false, septuaginta: false, ethiopian: false }
  },
  'DMC': { // CD
    chapters: 0,
    normal: "Documento de Damasco",
    gringo: "Damascus Document",
    testament: "old",
    language: { hebraic: true },
    codice: { essenes: true, ocidental: false, septuaginta: false, ethiopian: false }
  },

  'GLT': { // 1QM
    chapters: 0,
    normal: "A Guerra dos Filhos da Luz contra os Filhos das Trevas",
    gringo: "The War of the Sons of Light Against the Sons of Darkness",
    testament: "old",
    language: { hebraic: true },
    codice: { essenes: true, ocidental: false, septuaginta: false, ethiopian: false }
  },

  'TMP': { // 11QTemple
    chapters: 0,
    normal: "Rolo do Templo",
    gringo: "Temple Scroll",
    testament: "old",
    language: { hebraic: true },
    codice: { essenes: true, ocidental: false, septuaginta: false, ethiopian: false }
  },

  'CSS': { // 4Q400
    chapters: 0,
    normal: "Cânticos do Sacrifício do Sábado",
    gringo: "Songs of the Sabbath Sacrifice",
    testament: "old",
    language: { hebraic: true },
    codice: { essenes: true, ocidental: false, septuaginta: false, ethiopian: false }
  },

  'BEN': { // 4QBerakhot
    chapters: 0,
    normal: "Bênçãos",
    gringo: "Blessings",
    testament: "old",
    language: { hebraic: true },
    codice: { essenes: true, ocidental: false, septuaginta: false, ethiopian: false }
  },

  'OTO': { // 4QOtot
    chapters: 0,
    normal: "Otot - Sinais e Calendários",
    gringo: "Otot - Signs and Calendars",
    testament: "old",
    language: { hebraic: true },
    codice: { essenes: true, ocidental: false, septuaginta: false, ethiopian: false }
  },

  'CAD': { // 4Q503
    chapters: 0,
    normal: "Orações Calendáricas",
    gringo: "Calendrical Prayers",
    testament: "old",
    language: { hebraic: true },
    codice: { essenes: true, ocidental: false, septuaginta: false, ethiopian: false }
  },

  'PSC': { // 4QPesach
    chapters: 0,
    normal: "Páscoa",
    gringo: "Pesach",
    testament: "old",
    language: { hebraic: true },
    codice: { essenes: true, ocidental: false, septuaginta: false, ethiopian: false }
  },

  'HLI': { // 4Q251, 4Q252
    chapters: 0,
    normal: "Haláquico",
    gringo: "Halakhic",
    testament: "old",
    language: { hebraic: true },
    codice: { essenes: true, ocidental: false, septuaginta: false, ethiopian: false }
  },

  'HLA': { // 4Q159
    chapters: 0,
    normal: "Halacá",
    gringo: "Halakhah",
    testament: "old",
    language: { hebraic: true },
    codice: { essenes: true, ocidental: false, septuaginta: false, ethiopian: false }
  },

  '1MA': {
    chapters: 0,
    normal: '1 Macabeus',
    gringo: '1 Maccabees',
    testament: 'old',
    type: ['history'],
    language: {
      geez: true,
      greek: true
    },
    codice: {
      essenes: false,
      ethiopian: true,
      ocidental: false,
      septuaginta: true,
      copta: true
    }
  },
  '2MA': {
    chapters: 0,
    normal: '2 Macabeus',
    gringo: '2 Maccabees',
    testament: 'old',
    language: {
      geez: true,
      greek: true
    },
    codice: {
      essenes: false,
      ethiopian: true,
      ocidental: false,
      septuaginta: true,
      copta: true
    }
  },
  '3MA': {
    chapters: 0,
    normal: '3 Macabeus',
    gringo: '3 Maccabees',
    testament: 'old',
    language: {
      geez: true,
      greek: true
    },
    codice: {
      essenes: false,
      ethiopian: true,
      ocidental: false,
      septuaginta: true,
      copta: true
    }
  },
  '4MA': {
    chapters: 0,
    normal: '4 Macabeus',
    gringo: '4 Maccabees',
    testament: 'old',
    language: {
      geez: true,
      greek: true
    },
    codice: {
      essenes: false,
      ethiopian: true,
      ocidental: false,
      septuaginta: true,
      copta: true
    }
  },
  'mt': {
    chapters: 28,
    normal: 'Mateus',
    gringo: 'Matthew',
    testament: 'new',
    language: {
      geez: true,
      greek: true
    },
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  'mc': {
    chapters: 16,
    normal: 'Marcos',
    gringo: 'Mark',
    testament: 'new',
    language: {
      geez: true,
      greek: true
    },
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  'lc': {
    chapters: 24,
    normal: 'Lucas',
    gringo: 'Luke',
    testament: 'new',
    language: {
      geez: true,
      greek: true
    },
    codice: {
      ethiopian: true,
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
    codice: {
      ethiopian: true,
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
    codice: {
      ethiopian: true,
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
    codice: {
      ethiopian: false,
      ocidental: false,
      septuaginta: false,
      essenes: false
    }
  },
  'rm': {
    chapters: 16,
    normal: 'Romanos',
    gringo: 'Romans',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codice: {
      ethiopian: true,
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
    codice: {
      ethiopian: true,
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
    codice: {
      ethiopian: true,
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
    language: {
      geez: true,
      syriac: true,
      copta: true
    },
    codice: {
      ethiopian: true,
      ocidental: false,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  'gl': {
    chapters: 6,
    normal: 'Galatas',
    gringo: 'Galatians',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  'ef': {
    chapters: 6,
    normal: 'Efesios',
    gringo: 'Ephesians',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  'fp': {
    chapters: 4,
    normal: 'Filipenses',
    gringo: 'Philippians',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  'cl': {
    chapters: 4,
    normal: 'Colossenses',
    gringo: 'Colossians',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codice: {
      ethiopian: true,
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
    codice: {
      ethiopian: true,
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
    codice: {
      ethiopian: true,
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
    codice: {
      ethiopian: true,
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
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  'tt': {
    chapters: 3,
    normal: 'Tito',
    gringo: 'Titus',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  'fm': {
    chapters: 1,
    normal: 'Filemom',
    gringo: 'Philemon',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  'hb': {
    chapters: 13,
    normal: 'Hebreus',
    gringo: 'Hebrews',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codice: {
      ethiopian: true,
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
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  '1TG': {
    chapters: 5,
    normal: '1 Tiago',
    gringo: '1 James',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  '2TG': {
    chapters: 0,
    normal: '2 Tiago',
    gringo: '2 James',
    testament: 'new',
    type: ['letter'],
    language: {
      copta: true
    },
    codice: {
      ethiopian: false,
      ocidental: false,
      septuaginta: false,
      essenes: false,
      copta: false,
      sethian: true
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
    codice: {
      ethiopian: true,
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
    codice: {
      ethiopian: true,
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
    codice: {
      ethiopian: true,
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
    codice: {
      ethiopian: true,
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
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: false,
      essenes: false,
      copta: true
    }
  },
  'jd': {
    chapters: 1,
    normal: 'Judas',
    gringo: 'Jude',
    testament: 'new',
    type: ['letter'],
    language: {
      geez: true,
      greek: true
    },
    codice: {
      ethiopian: true,
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
    codice: {
      ocidental: false,
      septuaginta: false,
      ethiopian: true,
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
    codice: {
      ocidental: false,
      septuaginta: false,
      ethiopian: true,
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
    codice: {
      ocidental: false,
      septuaginta: false,
      ethiopian: true,
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
    codice: {
      ocidental: false,
      septuaginta: false,
      ethiopian: true,
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
    codice: {
      ocidental: false,
      septuaginta: false,
      ethiopian: true,
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
    codice: {
      ocidental: false,
      septuaginta: false,
      ethiopian: true,
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
    codice: {
      ocidental: false,
      septuaginta: false,
      ethiopian: true,
      essenes: false
    }
  },
  '1CM': {
    chapters: 0,
    normal: 'Livro de Clemente',
    gringo: 'Book of Clement',
    testament: 'new',
    language: {
      geez: true
    },
    codice: {
      ocidental: false,
      septuaginta: false,
      ethiopian: true,
      essenes: false
    }
  },
  '2CM': {
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
    codice: {
      ethiopian: true,
      ocidental: false,
      septuaginta: false,
      essenes: false,
      copta: true,
      bizantine: true
    }
  },
  '3CM': {
    chapters: 0,
    normal: 'Homilia de Clemente',
    gringo: 'Homily of Clement',
    testament: 'new',
    type: ['letter'],
    language: {
      greek: true
    },
    codice: {
      ethiopian: false,
      ocidental: false,
      septuaginta: false,
      essenes: false,
      copta: false,
      bizantine: true
    }
  },
  'dds': {
    chapters: 0,
    normal: 'Didascália',
    gringo: 'Didascalia',
    testament: 'new',
    language: {
      geez: true
    },
    codice: {
      ocidental: false,
      septuaginta: false,
      ethiopian: true,
      essenes: false
    }
  },
  'ap': {
    chapters: 22,
    normal: 'Apocalipse de João',
    gringo: 'Apocalipse of John',
    testament: 'new',
    type: ['prophecy'],
    language: {
      geez: true,
      greek: true
    },
    codice: {
      ocidental: true,
      septuaginta: false,
      ethiopian: true,
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
    codice: {
      ocidental: false,
      septuaginta: false,
      ethiopian: false,
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
    codice: {
      ocidental: false,
      septuaginta: false,
      ethiopian: false,
      essenes: false
    }
  }
}


/**
 * incluir pergaminho de cobre de quram
 * 
 * 

incluir literatura testamentaria:
Texto	Personagem / Autor Tradicional	Conteúdo principal	Idioma de preservação	Tradição / Contexto
Testamento de Abraão	Abraão	Últimas palavras, visão do céu, juízo, recompensa/punição	Grego (fragmentos), Cópcia (códices completos)	Judaísmo apocalíptico / helenístico
Testamento de Isaque	Isaque	Conselhos morais a Jacó e Esaú, bênçãos e previsões	Grego / Cópcia	Testamental patriarcal, judaísmo helenístico
Testamento de Jacó	Jacó	Exortações a seus filhos; previsões sobre as tribos de Israel	Grego / Cópcia	Testamental patriarcal, judaísmo helenístico
Testamento de Levi	Levi	Ênfase sacerdotal; instruções religiosas e éticas aos descendentes	Hebraico (fragmentos), Grego	Testamental patriarcal, judaísmo sacerdotal
Testamento de Judá / Simeão / Benjamim / Naphtali / Zebulon	Patriarcas menores	Conselhos éticos, instruções religiosas e profecias	Grego / Cópcia	Testamental patriarcal, judaísmo helenístico
Testamento de José	José do Egito	Conselhos éticos, visão profética do futuro de Israel	Grego / fragmentos	Literatura testamentária patriarcal, judaísmo helenístico
Testamento de Moisés (ou Assunção de Moisés)	Moisés	Últimas instruções, bênçãos, visões apocalípticas	Grego / fragmentos siríacos	Judaísmo apocalíptico, pós-bíblico
Testamento de Davi	Rei Davi	Últimos conselhos a Salomão; instruções sobre templo e justiça	Grego / fragmentos copta	Literatura apócrifa judaica / tradição sapiencial
Testamentos de Adão, Set e Noé	Patriarcas antediluvianos	Exortações éticas, instruções escatológicas, visões celestiais	Hebraico / Grego / Siríaco	Literatura apocalíptica e sapiencial, tradição do Segundo Templo



 * incluir textos platonicos:
 * 1. Filosofia política e ética

A República (Politeia) – Discussão sobre justiça, a natureza da cidade ideal e a teoria das formas; apresenta o mito da caverna.

Leis (Nomoi) – Último diálogo de Platão, sobre a criação de leis e regras para uma sociedade prática.

O Político (Politikos) – Debate sobre a natureza do governante ideal e a organização da cidade.

Sofista (Sophistes) – Explora o conceito de sofista e a distinção entre aparência e realidade.

2. Metafísica e epistemologia

Timeu (Timaeus) – Cosmologia e origem do universo; introduz a ideia de demiurgo (criador divino).

Parmênides (Parmenides) – Críticas à teoria das formas e discussão sobre unidade e multiplicidade.

Fédon (Phaedo) – Imortalidade da alma, vida após a morte e argumentos filosóficos sobre a alma.

Sofista (Sophistes) e Teeteto (Theaetetus) – Teorias do conhecimento e da realidade.

3. Amor e estética

Banquete (Symposium) – Reflexão sobre o amor (eros), beleza e o papel do desejo na filosofia.

Fedro (Phaedrus) – Amor, retórica, alma e a arte de escrever; também discute a imortalidade da alma.

4. Educação e dialética

Mênon (Meno) – A natureza da virtude e o conceito de conhecimento como reminiscência.

Górgias (Gorgias) – Debate sobre retórica, poder e ética.

Protágoras (Protagoras) – Discussão sobre virtude e se ela pode ser ensinada.
 */