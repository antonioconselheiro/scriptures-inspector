const fs = require('fs');

const path = '../../ethiopian-geez-literature/Works/';
const crawlingData = [
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
    path: '1001-2000/LIT1374Bookof.xml'
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
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "application/xml");

  const chapters = Array.from(xmlDoc.querySelector('body').querySelectorAll('ab')).map(ab => {
    const list = [];
    let index = 0;
    const title = ab.querySelector('title');
    const titleContent = title?.innerText.trim();
    const verses = ab.querySelectorAll(' > l[n]');

    if (title && titleContent && !/^\d+$/.test(titleContent)) {
      list.push({
        verse: {
          start: "0",
          end: "0",
          index: index++
        },
        text: title.innerText
      });
    }

    verses.forEach(verse => {
      list.push({
        verse: {
          start: verse.getAttribute('n'),
          end: verse.getAttribute('n'),
          index: index++
        },
        text: verse.innerText
      });
    });
  });

  books[metadata.finalKey] = { chapters };
});

fs.writeFileSync('mashafa-qeddus.json', JSON.stringify(books));
