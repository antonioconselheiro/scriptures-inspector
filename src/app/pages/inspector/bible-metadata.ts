export const bibleMetadata: {
  [abrev: string]: {
    chapters: number,
    normal: string,
    gringo: string,
    testament: 'old' | 'new',
    versions: {
      aramaic?: boolean,
      hebraic?: boolean,
      geez?: boolean,
      syriac?: boolean,
      greek?: boolean,
      copta?: boolean
    },
    codice: {
      ocidental: boolean,
      septuaginta: boolean,
      essenes?: boolean,
      syriac?: boolean,
      copta?: boolean,
      gnostic?: boolean,
      ethiopian: boolean
    }
  }
} = {
  'eno': {
    chapters: 0,
    normal: 'Enoque',
    gringo: 'Enoch',
    testament: 'old',
    versions: {
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
  'jub': {
    chapters: 0,
    normal: 'Jubileu',
    gringo: 'Jubilee',
    testament: 'old',
    versions: {
      geez: true
    },
    codice: {
      ocidental: false,
      septuaginta: false,
      ethiopian: true,
      essenes: true
    }
  },

  'gn': {
    chapters: 50,
    normal: 'Genesis',
    gringo: 'Genesis',
    testament: 'old',
    versions: {
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
  'exo': {
    chapters: 40,
    normal: 'Exodo',
    gringo: 'Exodus',
    testament: 'old',
    versions: {
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
  'lv': {
    chapters: 27,
    normal: 'Levitico',
    gringo: 'Leviticus',
    testament: 'old',
    versions: {
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
  'nm': {
    chapters: 36,
    normal: 'Numeros',
    gringo: 'Numbers',
    testament: 'old',
    versions: {
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
  'dt': {
    chapters: 34,
    normal: 'Deuteronomio',
    gringo: 'Deuteronomy',
    testament: 'old',
    versions: {
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
  'js': {
    chapters: 24,
    normal: 'Josue',
    gringo: 'Joshua',
    testament: 'old',
    versions: {
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
  'jz': {
    chapters: 21,
    normal: 'Juizes',
    gringo: 'Judges',
    testament: 'old',
    versions: {
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
  'rt': {
    chapters: 4,
    normal: 'Rute',
    gringo: 'Ruth',
    testament: 'old',
    versions: {
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
  '1sm': {
    chapters: 31,
    normal: '1 Samuel',
    gringo: '1 Samuel',
    testament: 'old',
    versions: {
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
  '2sm': {
    chapters: 24,
    normal: '2 Samuel',
    gringo: '2 Samuel',
    testament: 'old',
    versions: {
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
  '1rs': {
    chapters: 22,
    normal: '1 Reis',
    gringo: '1 Kings',
    testament: 'old',
    versions: {
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
  '2rs': {
    chapters: 25,
    normal: '2 Reis',
    gringo: '2 Kings',
    testament: 'old',
    versions: {
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
  '1cr': {
    chapters: 29,
    normal: '1 Cronicas',
    gringo: '1 Chronicles',
    testament: 'old',
    versions: {
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
  '2cr': {
    chapters: 36,
    normal: '2 Cronicas',
    gringo: '2 Chronicles',
    testament: 'old',
    versions: {
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
  'ed': {
    chapters: 10,
    normal: 'Esdras',
    gringo: 'Ezra',
    testament: 'old',
    versions: {
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
  'ne': {
    chapters: 13,
    normal: 'Neemias',
    gringo: 'Nehemiah',
    testament: 'old',
    versions: {
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
  '2ed': {
    chapters: 10,
    normal: '2 Esdras',
    gringo: '2 Ezra',
    testament: 'old',
    versions: {
      geez: true
    },
    codice: {
      ocidental: false,
      septuaginta: true,
      ethiopian: true
    }
  },

  'et': {
    chapters: 10,
    normal: 'Ester',
    gringo: 'Esther',
    testament: 'old',
    versions: {
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

  '2et': {
    chapters: 6,
    normal: '2 Ester',
    gringo: '2 Esther',
    testament: 'old',
    versions: {
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

  'jo': {
    chapters: 42,
    normal: 'Jó',
    gringo: 'Job',
    testament: 'old',
    versions: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: true,
      gnostic: true,
      copta: true
    }
  },
  'sl': {
    chapters: 150,
    normal: 'Salmos',
    gringo: 'Psalms',
    testament: 'old',
    versions: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: true,
      gnostic: true,
      copta: true
    }
  },
  'pv': {
    chapters: 31,
    normal: 'Proverbios',
    gringo: 'Proverbs',
    testament: 'old',
    versions: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: true,
      gnostic: true,
      copta: true
    }
  },
  'ec': {
    chapters: 12,
    normal: 'Eclesiastes',
    gringo: 'Ecclesiastes',
    testament: 'old',
    versions: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: true,
      gnostic: true,
      copta: true
    }
  },
  'ct': {
    chapters: 8,
    normal: 'Canticos',
    gringo: 'Song of Solomon',
    testament: 'old',
    versions: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: true,
      gnostic: true,
      copta: true
    }
  },
  'is': {
    chapters: 66,
    normal: 'Isaias',
    gringo: 'Isaiah',
    testament: 'old',
    versions: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codice: {
      essenes: true,
      ethiopian: true,
      ocidental: true,
      septuaginta: true,
      gnostic: true,
      copta: true
    }
  },
  'baruc': {
    chapters: 0,
    normal: 'Baruque',
    gringo: 'Baruc',
    testament: 'old',
    versions: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codice: {
      ethiopian: true,
      ocidental: false,
      septuaginta: true,
      gnostic: true,
      copta: true
    }
  },
  'jr': {
    chapters: 52,
    normal: 'Jeremias',
    gringo: 'Jeremiah',
    testament: 'old',
    versions: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: true,
      gnostic: true,
      copta: true
    }
  },
  'lm': {
    chapters: 5,
    normal: 'Lamentacoes',
    gringo: 'Lamentations',
    testament: 'old',
    versions: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: true,
      gnostic: true,
      copta: true
    }
  },
  'ez': {
    chapters: 48,
    normal: 'Ezequiel',
    gringo: 'Ezekiel',
    testament: 'old',
    versions: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: true,
      gnostic: true,
      copta: true
    }
  },
  'dn': {
    chapters: 12,
    normal: 'Daniel',
    gringo: 'Daniel',
    testament: 'old',
    versions: {
      geez: true,
      hebraic: true,
      greek: true,
      aramaic: true
    },
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: true,
      gnostic: true,
      copta: true
    }
  },
  'os': {
    chapters: 14,
    normal: 'Oseias',
    gringo: 'Hosea',
    testament: 'old',
    versions: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: true,
      gnostic: true,
      copta: true
    }
  },
  'jl': {
    chapters: 3,
    normal: 'Joel',
    gringo: 'Joel',
    testament: 'old',
    versions: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: true,
      gnostic: true,
      copta: true
    }
  },
  'am': {
    chapters: 9,
    normal: 'Amos',
    gringo: 'Amos',
    testament: 'old',
    versions: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: true,
      gnostic: true,
      copta: true
    }
  },
  'ob': {
    chapters: 1,
    normal: 'Obadias',
    gringo: 'Obadiah',
    testament: 'old',
    versions: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: true,
      gnostic: true,
      copta: true
    }
  },
  'jn': {
    chapters: 4,
    normal: 'Jonas',
    gringo: 'Jonah',
    testament: 'old',
    versions: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: true,
      gnostic: true,
      copta: true
    }
  },
  'mq': {
    chapters: 7,
    normal: 'Miqueias',
    gringo: 'Micah',
    testament: 'old',
    versions: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: true,
      gnostic: true,
      copta: true
    }
  },
  'na': {
    chapters: 3,
    normal: 'Naum',
    gringo: 'Nahum',
    testament: 'old',
    versions: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: true,
      gnostic: true,
      copta: true
    }
  },
  'hc': {
    chapters: 3,
    normal: 'Habacuque',
    gringo: 'Habakkuk',
    testament: 'old',
    versions: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: true,
      gnostic: true,
      copta: true
    }
  },
  'sf': {
    chapters: 3,
    normal: 'Sofonias',
    gringo: 'Zephaniah',
    testament: 'old',
    versions: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: true,
      gnostic: true,
      copta: true
    }
  },
  'ag': {
    chapters: 2,
    normal: 'Ageu',
    gringo: 'Haggai',
    testament: 'old',
    versions: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: true,
      gnostic: true,
      copta: true
    }
  },
  'zc': {
    chapters: 14,
    normal: 'Zacarias',
    gringo: 'Zechariah',
    testament: 'old',
    versions: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: true,
      gnostic: true,
      copta: true
    }
  },
  'ml': {
    chapters: 4,
    normal: 'Malaquias',
    gringo: 'Malachi',
    testament: 'old',
    versions: {
      geez: true,
      hebraic: true,
      greek: true
    },
    codice: {
      ethiopian: true,
      ocidental: true,
      septuaginta: true,
      gnostic: true,
      copta: true
    }
  },

  'mt': {
    chapters: 28,
    normal: 'Mateus',
    gringo: 'Matthew',
    testament: 'new',
    versions: {
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
    versions: {
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
    versions: {
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
  'joao': {
    chapters: 21,
    normal: 'Joao',
    gringo: 'John',
    testament: 'new',
    versions: {
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
  'atos': {
    chapters: 28,
    normal: 'Atos',
    gringo: 'Acts',
    testament: 'new',
    versions: {
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
  'rm': {
    chapters: 16,
    normal: 'Romanos',
    gringo: 'Romans',
    testament: 'new',
    versions: {
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
  '1co': {
    chapters: 16,
    normal: '1Corintios',
    gringo: '1 Corinthians',
    testament: 'new',
    versions: {
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
  '2co': {
    chapters: 13,
    normal: '2Corintios',
    gringo: '2 Corinthians',
    testament: 'new',
    versions: {
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
  'gl': {
    chapters: 6,
    normal: 'Galatas',
    gringo: 'Galatians',
    testament: 'new',
    versions: {
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
    versions: {
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
    versions: {
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
    versions: {
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
  '1ts': {
    chapters: 5,
    normal: '1 Tessalonicenses',
    gringo: '1 Thessalonians',
    testament: 'new',
    versions: {
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
  '2ts': {
    chapters: 3,
    normal: '2 Tessalonicenses',
    gringo: '2 Thessalonians',
    testament: 'new',
    versions: {
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
  '1tm': {
    chapters: 6,
    normal: '1 Timoteo',
    gringo: '1 Timothy',
    testament: 'new',
    versions: {
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
  '2tm': {
    chapters: 4,
    normal: '2 Timoteo',
    gringo: '2 Timothy',
    testament: 'new',
    versions: {
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
    versions: {
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
    versions: {
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
    versions: {
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
  'tg': {
    chapters: 5,
    normal: 'Tiago',
    gringo: 'James',
    testament: 'new',
    versions: {
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
  '1pe': {
    chapters: 5,
    normal: '1 Pedro',
    gringo: '1 Peter',
    testament: 'new',
    versions: {
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
  '2pe': {
    chapters: 3,
    normal: '2 Pedro',
    gringo: '2 Peter',
    testament: 'new',
    versions: {
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
  '1jo': {
    chapters: 5,
    normal: '1 Joao',
    gringo: '1 John',
    testament: 'new',
    versions: {
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
  '2jo': {
    chapters: 1,
    normal: '2 Joao',
    gringo: '2 John',
    testament: 'new',
    versions: {
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
  '3jo': {
    chapters: 1,
    normal: '3 Joao',
    gringo: '3 John',
    testament: 'new',
    versions: {
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
    versions: {
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

  'bensir': {
    chapters: 0,
    normal: 'Josué filho de Sirac',
    gringo: 'Josue son of Sirac',
    testament: 'new',
    versions: {
      geez: true
    },
    codice: {
      ocidental: false,
      septuaginta: false,
      ethiopian: true,
      essenes: false
    }
  },
  'benben': {
    chapters: 0,
    normal: 'José filho de Bengorion',
    gringo: 'Josefas son of Bengorion',
    testament: 'new',
    versions: {
      geez: true
    },
    codice: {
      ocidental: false,
      septuaginta: false,
      ethiopian: true,
      essenes: false
    }
  },
  'ss': {
    chapters: 0,
    normal: 'Sirate de Sião',
    gringo: 'Sirate Tsion',
    testament: 'new',
    versions: {
      geez: true
    },
    codice: {
      ocidental: false,
      septuaginta: false,
      ethiopian: true,
      essenes: false
    }
  },
  'tzaz': {
    chapters: 0,
    normal: 'Tizaz',
    gringo: 'Tizaz',
    testament: 'new',
    versions: {
      geez: true
    },
    codice: {
      ocidental: false,
      septuaginta: false,
      ethiopian: true,
      essenes: false
    }
  },
  'git': {
    chapters: 0,
    normal: 'Gitseu',
    gringo: 'Gitsew',
    testament: 'new',
    versions: {
      geez: true
    },
    codice: {
      ocidental: false,
      septuaginta: false,
      ethiopian: true,
      essenes: false
    }
  },
  'abs': {
    chapters: 0,
    normal: 'Abtilis',
    gringo: 'Abtilis',
    testament: 'new',
    versions: {
      geez: true
    },
    codice: {
      ocidental: false,
      septuaginta: false,
      ethiopian: true,
      essenes: false
    }
  },
  '1do': {
    chapters: 0,
    normal: '1 Dominos',
    gringo: '1 Dominos',
    testament: 'new',
    versions: {
      geez: true
    },
    codice: {
      ocidental: false,
      septuaginta: false,
      ethiopian: true,
      essenes: false
    }
  },
  '2do': {
    chapters: 0,
    normal: '2 Dominos',
    gringo: '2 Dominos',
    testament: 'new',
    versions: {
      geez: true
    },
    codice: {
      ocidental: false,
      septuaginta: false,
      ethiopian: true,
      essenes: false
    }
  },
  'clm': {
    chapters: 0,
    normal: 'Livro de Clemente',
    gringo: 'Book of Clement',
    testament: 'new',
    versions: {
      geez: true
    },
    codice: {
      ocidental: false,
      septuaginta: false,
      ethiopian: true,
      essenes: false
    }
  },
  'dds': {
    chapters: 0,
    normal: 'Didascália',
    gringo: 'Didascalia',
    testament: 'new',
    versions: {
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
    normal: 'Apocalipse',
    gringo: 'Apocalipse',
    testament: 'new',
    versions: {
      geez: true,
      greek: true
    },
    codice: {
      ocidental: true,
      septuaginta: false,
      ethiopian: true,
      essenes: false
    }
  }
}
