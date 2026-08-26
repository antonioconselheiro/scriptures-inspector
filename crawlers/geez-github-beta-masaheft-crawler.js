const fs = require('fs');
const { JSDOM } = require('jsdom');

//  Canônicos para Beta Israel, pendentes
// --------------------
// Testamento de Abraão
// Testamento de Isaac
// Testamento de Jacó

//  Canônicos para a tradição de Tawahedo, pendentes
// --------------------
//  Josippon                                            LIT2598Yosipp.xml (conteúdo parcial)
// Serʿatä Seyon (Estatutos/Ordem de Sião)                                       
// Gessew / Gitsew (Exposição / Cânones Apostólicos)                             
// Qälämentos / Clemente (Clemente Etíope)              2001-3000/LIT2680ClemPeter.xml
// Mäṣḥafä Kidan I / Dominos I (Livro do Pacto I)                                
// Mäṣḥafä Kidan II / Dominos II (Livro do Pacto II)                             
// Didesqelya / Didascalia (Didascália Etíope)                                   

//  Autoridade apostólica, pendentes
// --------------------
// Senodos: Melkite Index                    2001-3000/LIT2672SenodosInMe.xml
// Apostolic Canons after Ascension          2001-3000/LIT2673CanonsAscension.xml
// Apostolic canons                          2001-3000/LIT2675AC81.xml
// Canons of SS. Matthew and Simon           2001-3000/LIT2640CanonsMattSimon.xml
// Canons of S. Simon the Canaanite          2001-3000/LIT2639CanonsSimon1.xml
// Canons of S. Simon the Canaanite (2)      2001-3000/LIT2671CanonsSimon2.xml

//  Histórico
// --------------------
// Kebra Nagasta                             1001-2000/LIT1709Kebran.xml

// Apocrifos
// --------------------
//  Testamento de Adão: LIT2457Testam.xml
//  Asunção de Isaias: LIT1671Isaiah.xml

const path = '../../ethiopian-geez-literature/Works/';
const crawlingData = [
  {
    finalKey: 'JUB',
    path: '1001-2000/LIT1697Jubilees.xml'
  },
  {
    finalKey: 'GEN',
    path: '1001-2000/LIT1546Genesi.xml'
  },
  {
    finalKey: 'EXO',
    path: '1001-2000/LIT1367Exodus.xml'
  },
  {
    finalKey: 'LEV',
    path: '1001-2000/LIT1793Leviti.xml'
  },
  {
    finalKey: 'NUM',
    path: '2001-3000/LIT2075Number.xml'
  },
  {
    finalKey: 'DEU',
    path: '2001-3000/LIT2637Deuteronomy.xml'
  },
  {
    finalKey: 'JOS',
    path: '1001-2000/LIT1696Joshua.xml'
  },
  {
    finalKey: 'JUI',
    path: '1001-2000/LIT1700Judges.xml'
  },
  {
    finalKey: 'RUT',
    path: '2001-3000/LIT2229RuthBo.xml'
  },
  {
    finalKey: '1SM',
    path: '2001-3000/LIT2697Sam.xml'
  },
  {
    finalKey: '2SM',
    path: '2001-3000/LIT2698Sam.xml'
  },
  {
    finalKey: '1RS',
    path: '2001-3000/LIT2699Kings.xml'
  },
  {
    finalKey: '2RS',
    path: '2001-3000/LIT2700Kings.xml'
  },
  {
    finalKey: '1CR',
    path: '3001-4000/LIT3499Chroni.xml'
  },
  {
    finalKey: '2CR',
    path: '3001-4000/LIT3500Chroni.xml'
  },
  {
    finalKey: '1ED',
    path: '3001-4000/LIT3581Bookof.xml'
  },
  {
    finalKey: '2ED',
    path: '1001-2000/LIT1377Bookof.xml'
  },
  {
    finalKey: '3ED',
    path: '1001-2000/LIT1374Bookof.xml'
  },
  {
    finalKey: '4ED',
    path: '1001-2000/LIT1376Apocal.xml'
  },
  {
    finalKey: '1ET',
    path: '1001-2000/LIT1362Esther.xml'
  },
  {
    finalKey: 'JOB',
    path: '1001-2000/LIT1688Job.xml'
  },
  {
    finalKey: '1SL',
    path: '1001-2000/LIT2000Mazmur.xml'
  },
  {
    finalKey: 'ECL',
    path: '1001-2000/LIT1320Eccles.xml'
  },
  {
    finalKey: 'PRO1',
    path: '2001-3000/LIT2396Tagsas.xml'
  },
  {
    finalKey: 'PRO2',
    path: '3001-4000/LIT3927Messale.xml'
  },
  {
    finalKey: 'SSL',
    path: '2001-3000/LIT2516Wisdom.xml'
  },
  {
    finalKey: 'CAN',
    path: '2001-3000/LIT2362Songof.xml'
  },
  {
    finalKey: 'ISA',
    path: '1001-2000/LIT1672Isaiah.xml'
  },
  {
    finalKey: '1JE',
    path: '1001-2000/LIT1685Bookof.xml'
  },
  {
    finalKey: '2JE',
    path: '1001-2000/LIT1753Lament.xml'
  },
  {
    finalKey: '1BA',
    path: '1001-2000/LIT1202Bookof.xml'
  },
  {
    finalKey: '4BA',
    path: '2001-3000/LIT2167Parali.xml'
  },
  {
    finalKey: 'EZE',
    path: '5001-6000/LIT5802EzekII.xml'
  },
  {
    finalKey: '1DA',
    path: '3001-4000/LIT3529Daniel.xml'
  },
  {
    finalKey: 'OSE',
    path: '3001-4000/LIT3144Hosea.xml'
  },
  {
    finalKey: 'JOE',
    path: '1001-2000/LIT1689Joel.xml'
  },
  {
    finalKey: 'AMO',
    path: '3001-4000/LIT3145Amos.xml'
  },
  {
    finalKey: 'OBA',
    path: '3001-4000/LIT3147Obadiah.xml'
  },
  {
    finalKey: 'JON',
    path: '1001-2000/LIT1694Jonah.xml'
  },
  {
    finalKey: 'MIQ',
    path: '3001-4000/LIT3146Micah.xml'
  },
  {
    finalKey: 'NAU',
    path: '2001-3000/LIT2057Bookof.xml'
  },
  {
    finalKey: 'HAB',
    path: '1001-2000/LIT1567Bookof.xml'
  },
  {
    finalKey: 'SOF',
    path: '3001-4000/LIT3148Zephan.xml'
  },
  {
    finalKey: 'AGE',
    path: '3001-4000/LIT3149Haggai.xml'
  },
  {
    finalKey: 'ZAC',
    path: '3001-4000/LIT3150Zechar.xml'
  },
  {
    finalKey: 'MAL',
    path: '3001-4000/LIT3151Malachi.xml'
  },
  {
    finalKey: 'SIR',
    path: '2001-3000/LIT2358Sirach.xml'
  },
  {
    finalKey: 'TOB',
    path: '2001-3000/LIT2473TobitB.xml'
  },
  {
    finalKey: 'JDT',
    path: '1001-2000/LIT1701Judith.xml'
  },
  {
    finalKey: '1ME',
    path: '1001-2000/LIT1819Maccab.xml'
  },
  {
    finalKey: '2ME',
    path: '5001-6000/LIT5840SecondEthioMaccabees.xml'
  },
  {
    finalKey: '3ME',
    path: '5001-6000/LIT5839ThirdEthioMaccabees.xml'
  },
  {
    finalKey: 'MAT',
    path: '2001-3000/LIT2709Matthew.xml'
  },
  {
    finalKey: 'MAR',
    path: '2001-3000/LIT2711Mark.xml'
  },
  {
    finalKey: 'LUC',
    path: '2001-3000/LIT2713Luke.xml'
  },
  {
    finalKey: 'JOA',
    path: '2001-3000/LIT2715John.xml'
  },
  {
    finalKey: 'ATO',
    path: '1001-2000/LIT1019Actsof.xml'
  },
  {
    finalKey: 'ABS1',
    path: '2001-3000/LIT2677ACABt1.xml'
  },
  {
    finalKey: 'ABS2',
    path: '2001-3000/LIT2679ACAbt2.xml'
  },
  {
    finalKey: 'TZA',
    path: '2001-3000/LIT2670AC56.xml'
  },
  {
    finalKey: 'ROM',
    path: '3001-4000/LIT3515Epistle.xml'
  },
  {
    finalKey: '1CO',
    path: '3001-4000/LIT3516Epistle.xml'
  },
  {
    finalKey: '2CO',
    path: '3001-4000/LIT3517Epistle.xml'
  },
  {
    finalKey: 'GAL',
    path: '3001-4000/LIT3518Epistle.xml'
  },
  {
    finalKey: 'EFE',
    path: '3001-4000/LIT3519Epistle.xml'
  },
  {
    finalKey: 'FIL',
    path: '3001-4000/LIT3520Epistle.xml'
  },
  {
    finalKey: 'COL',
    path: '3001-4000/LIT3521Epistle.xml'
  },
  {
    finalKey: '1TS',
    path: '3001-4000/LIT3522Epistle.xml'
  },
  {
    finalKey: '2TS',
    path: '3001-4000/LIT3523Epistle.xml'
  },
  {
    finalKey: '1TM',
    path: '3001-4000/LIT3525Epistle.xml'
  },
  {
    finalKey: '2TM',
    path: '3001-4000/LIT3526Epistle.xml'
  },
  {
    finalKey: 'TIT',
    path: '3001-4000/LIT3527Epistle.xml'
  },
  {
    finalKey: 'FLM',
    path: '3001-4000/LIT3528Epistle.xml'
  },
  {
    finalKey: 'HEB',
    path: '3001-4000/LIT3524Epistle.xml'
  },
  {
    finalKey: 'TIA',
    path: '3001-4000/LIT3512Epistle.xml'
  },
  {
    finalKey: '1PE',
    path: '3001-4000/LIT3507Epistle.xml'
  },
  {
    finalKey: '2PE',
    path: '3001-4000/LIT3508Epistle.xml'
  },
  {
    finalKey: '1JO',
    path: '3001-4000/LIT3509Epistle.xml'
  },
  {
    finalKey: '2JO',
    path: '3001-4000/LIT3510Epistle.xml'
  },
  {
    finalKey: '3JO',
    path: '3001-4000/LIT3511Epistle.xml'
  },
  {
    finalKey: 'JUD',
    path: '3001-4000/LIT3513Epistle.xml'
  },
  {
    finalKey: 'APO',
    path: '3001-4000/LIT3179Revela.xml'
  }
];

const books = {};
crawlingData.forEach(metadata => {
  const file = `${path}${metadata.path}`;
  const xmlContent = fs.readFileSync(file, 'utf8');
  const dom = new JSDOM(xmlContent, { contentType: 'text/xml' });
  const xmlDoc = dom.window.document;

  const chapters = [];
  const chapterEls = xmlDoc.querySelectorAll('body :is([subtype="chapter"], [subtype="Psalmus"])[n]');
  if (!chapterEls.length) {
    const els = xmlDoc.querySelectorAll('body l[n="1"]');
    if (els.length === 1) {
      els[0].setAttribute('n', '1');
    } else {
      throw new Error(`No chapter found in ${metadata.path}`);  
    }
  }

  chapterEls.forEach(chapterEl => {
    let chapterNumber = chapterEl ? Number(chapterEl.getAttribute('n')) : null;
    if (chapterNumber === null) {
      throw new Error(`No chapter found in ${metadata.path}`);  
    }
  
    if (isNaN(chapterNumber)) {
      throw new Error(`Chapter identified as Not a Number in ${metadata.path}`);
    }
  
    const verses = Array.from(chapterEl.querySelectorAll(':has( l)')).map(ab => {
      const list = [];
      const versesEl = ab.querySelectorAll('l');
  
      let title = null;
      Array.from(versesEl).forEach(verse => {
        const content = verse.textContent.trim().replace(/\s+/g, ' ');
        if (verse.hasAttribute('n')) {
          const verseData = {
            verse: verse.getAttribute('n'),
            text: verse.textContent.trim().replace(/\s+/g, ' ')
          };
  
          if (title) {
            verseData.title = title;
            title = null;
          }
  
          list.push(verseData);
        } else if (content) {
          title = content;
        }
      });
  
      return list;
    });
  
    chapters.push({
      chapter: chapterNumber,
      verses
    });
  });

  books[metadata.finalKey] = { chapters };
});

fs.writeFileSync('mashafa-qeddus.json', JSON.stringify(books));
