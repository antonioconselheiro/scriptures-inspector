const geezes = {
  'gn': [],
  'ex': [],
  'lv': [],
  'nm': [],
  'dt': [],
  'js': [],
  'jz': [],
  'rt': [],
  '1sm': [],
  '2sm': [],
  '1rs': [],
  '2rs': [],
  '1cr': [],
  '2cr': [],
  'ed': [],
  'ne': [],
  'et': [],
  'jo': [],
  'sl': [],
  'pv': [],
  'ec': [],
  'ct': [],
  'is': [],
  'jr': [],
  'lm': [],
  'ez': [],
  'dn': [],
  'os': [],
  'jl': [],
  'am': [],
  'ob': [],
  'jn': [],
  'mq': [],
  'na': [],
  'hc': [],
  'sf': [],
  'ag': [],
  'zc': [],
  'ml': [],
  'mt': [],
  'mc': [],
  'lc': [],
  'joao': [],
  'atos': [],
  'rm': [],
  '1co': [],
  '2co': [],
  'gl': [],
  'ef': [],
  'fp': [],
  'cl': [],
  '1ts': [],
  '2ts': [],
  '1tm': [],
  '2tm': [],
  'tt': [],
  'fm': [],
  'hb': [],
  'tg': [],
  '1pe': [],
  '2pe': [],
  '1jo': [],
  '2jo': [],
  '3jo': [],
  'jd': [],
  'ap': []
}

async function sleep(n = 200) {
  return new Promise(resolve => setTimeout(resolve, n));
}

async function getBookChapter(book, chapter) {
  await sleep();
  let data;
  try {
    data = await fetch(`http://bible.geezexperience.com/server/list_api.php?language=tigrinya&book=${book}&chapter=${chapter}`)
      .then(res => res.json());
  } catch (e) {
    console.error(e);
    await sleep(3000);
    return getBookChapter(book, chapter);
  }

  return data.map(verse => {
    return {
      verse: {
        start: verse.noStart,
        end: verse.noEnd
      },
      text: verse.article
    }
  });
}

async function getBook(book) {
  let chapter = 0, result = [], chapters = [];

  while (true) {
    chapter++;
    result = await getBookChapter(book, chapter);
    if (!result || result.length === 0) break;
    chapters.push(result);
  }

  return chapters;
}

async function runGeezCrawler() {
  const keys = Object.keys(geezes);
  for (let i = 0; i < keys.length; i++) {
    let book = await getBook(i + 1);
    geezes[keys[i]].push(book);
  }

  console.info('crawling complete');
  console.info(JSON.stringify(geezes));
}

runGeezCrawler();