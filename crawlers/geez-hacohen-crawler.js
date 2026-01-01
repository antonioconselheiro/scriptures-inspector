const books = [
  {
    book: 'Octateuch/Genesis',
    finalName: "GEN",
    total: 50
  },

  {
    book: 'Octateuch/Exodus',
    finalName: "EXO",
    total: 40
  },

  {
    book: 'Octateuch/Leviticus',
    finalName: "LEV",
    total: 27
  },

  {
    book: 'Octateuch/Numeri',
    finalName: "NUM",
    total: 36
  },

  {
    book: 'Octateuch/Deuteronomium',
    finalName: "DEU",
    total: 34
  },

  {
    book: 'Octateuch/Josua',
    finalName: "JOS",
    total: 24
  },

  {
    book: 'Octateuch/Judices',
    finalName: "JUI",
    total: 21
  },

  {
    book: 'Octateuch/Ruth',
    finalName: "RUT",
    total: 4
  },

  {
    book: 'Regum/RegI',
    finalName: "1SM",
    total: 31
  },

  {
    book: 'Regum/RegII',
    finalName: "2SM",
    total: 24
  },

  {
    book: 'Regum/RegIII',
    finalName: "1RS",
    total: 22
  },

  {
    book: 'Regum/RegIV',
    finalName: "2RS",
    total: 25
  },

  {
    book: 'Psalm/PsalmNrR',
    finalName: "1SL",
    total: 151
  },

  {
    book: 'Ecclesiastes/Ecc',
    finalName: "ECL",
    total: 12
  },

  {
    book: 'Cant/Cant',
    finalName: "CAN",
    total: 8
  },

  {
    book: 'Joel/Joel',
    finalName: "JOE",
    total: 4
  },

  {
    book: 'Amos/Amos',
    finalName: 'AMO',
    total: 9
  },
  {
    book: 'Obadia/Obadia',
    finalName: 'OBA',
    total: 1
  },
  {
    book: 'Jona/Jon',
    finalName: 'JON',
    total: 4
  },
  {
    book: 'Micha/Mic',
    finalName: 'MIQ',
    total: 7
  },
  {
    book: 'Nahum/Nah',
    finalName: 'NAU',
    total: 3
  },
  {
    book: 'Habakuk/Hab',
    finalName: 'HAB',
    total: 3
  },
  {
    book: 'Zephanja/Zep',
    finalName: 'SOF',
    total: 3
  },
  {
    book: 'Haggai/Hag',
    finalName: 'AGE',
    total: 2
  },
  {
    book: 'Sacharja/Sac',
    finalName: 'ZAC',
    total: 14
  },
  {
    book: 'Maleachi/Mal',
    finalName: 'MAL',
    total: 4
  },
];

const maxRetries = Infinity;
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fetch com retry
async function fetchSection(book, chapter) {
  const url = `https://www.tau.ac.il/~hacohen/${book}%20${chapter}.html`;
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const text = await res.text();
      console.log(`✅ Fetched Book ${book} Section ${chapter}`);
      return text;
    } catch (err) {
      attempts++;
      console.warn(`⚠️ Retry ${attempts} for Book ${book} Section ${chapter}`);
      await sleep(3000);
    }
  }
}

async function loadChapter(book, chapter) {
  if (book === 'Regum/RegIII' && chapter === 3) {
    const verses3a = await loadChapter(book, '3a');
    const verses3b = await loadChapter(book, '3b');
    return [...verses3a, ...verses3b];
  } else if (book === 'Obadia/Obadia' && typeof chapter === 'number') {
    return loadChapter(book, 'txt');
  }

  return fetchSection(book, chapter).then(text => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    const aLink = doc.querySelector('[href^="https://www.sacred-texts.com/"],[href^="http://www.sacred-texts.com/"]');
    const parent = aLink.parentElement.parentElement;

    aLink.remove();
    return parent.innerText.trim().split(/\s(?=\d+\s)/).map((part, index) => {
      const match = part.match(/^(\d+)\s+(.*)$/);

      if (!match) return null;

      const verseNumber = match[1];
      const verseText = match[2].trim();

      return {
        verse: {
          start: verseNumber,
          end: verseNumber,
          index: index
        },
        text: verseText
      };
    }).filter(Boolean);

  });
}

async function loadBook(book, totalChapters) {
  const chapters = [];

  for (let chapter = 1; chapter <= totalChapters; chapter++) {
    console.log(`📖 Loading ${book} ${chapter}/${totalChapters}`);
    try {
      const verses = await loadChapter(book, chapter);
      chapters.push(verses);

      await sleep(200);
    } catch (err) {
      console.error(`❌ Failed loading ${book} ${chapter}`, err);
      await sleep(3000);
      chapter--;
    }
  }

  return {
    chapters
  };
}

async function crawlAllBooks() {
  const bible = {};

  for (const { book, finalName, total } of books) {
    console.log(`📚 Starting book ${book}`);
    const bookData = await loadBook(book, total);
    bible[finalName] = bookData;

    await sleep(200);
  }

  return bible;
}

crawlAllBooks().then(bible => {
  console.log('✅ Crawl finished');
  console.log(JSON.stringify(bible));
});
