const books = [{
  book: 'MAT',
  finalName: "MAT",
  total: 28
},
{
  book: 'MRK',
  finalName: "MAR",
  total: 16
},
{
  book: 'LUK',
  finalName: "LUC",
  total: 24
},
{
  book: 'JHN',
  finalName: "JOA",
  total: 21
},
{
  book: 'ACT',
  finalName: "ATO",
  total: 28
},
{
  book: 'ROM',
  finalName: "ROM",
  total: 16
},
{
  book: '1CO',
  finalName: "1CO",
  total: 16
},
{
  book: '2CO',
  finalName: "2CO",
  total: 13
},
{
  book: 'GAL',
  finalName: "GAL",
  total: 6
},
{
  book: 'EPH',
  finalName: "EFE",
  total: 6
},
{
  book: 'PHP',
  finalName: "FIL",
  total: 4
},
{
  book: 'COL',
  finalName: "COL",
  total: 4
},
{
  book: '1TH',
  finalName: "1TS",
  total: 5
},
{
  book: '2TH',
  finalName: "2TS",
  total: 3
},
{
  book: '1TI',
  finalName: "1TM",
  total: 6
},
{
  book: '2TI',
  finalName: "2TM",
  total: 4
},
{
  book: 'TIT',
  finalName: "TIT",
  total: 3
},
{
  book: 'PHM',
  finalName: "FLM",
  total: 1
},
{
  book: 'HEB',
  finalName: "HEB",
  total: 13
},
{
  book: '1PE',
  finalName: "1PE",
  total: 5
},
{
  book: '2PE',
  finalName: "2PE",
  total: 3
},
{
  book: '1JN',
  finalName: "1JO",
  total: 5
},
{
  book: '2JN',
  finalName: "2JO",
  total: 1
},
{
  book: '3JN',
  finalName: "3JO",
  total: 1
},
{
  book: 'JUD',
  finalName: "JUD",
  total: 1
},
{
  book: 'JAS',
  finalName: "TIA",
  total: 5
},
{
  book: 'REV',
  finalName: "APO",
  total: 22
}];

const maxRetries = Infinity;
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fetch com retry
async function fetchSection(book, chapter) {
  const url = `https://www.bible.com/bible/3177/${book}.${chapter}`;
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

let verse = null;
async function loadChapter(book, chapter) {
  return fetchSection(book, chapter).then(text => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    let index = 0;
    return Promise.resolve(Array.from(doc.querySelectorAll('span[data-usfm]')).map(span => {
      const note = Array.from(span.querySelectorAll('[class^="ChapterContent_note"]') || []);
      if (note) {
        note.forEach(el => el.remove())
      }
      return span.innerText;
    }).filter(b => !!b.trim()).map(txt => {
      try {
        const [verseNo] = Array.from(txt.match(/^\d+/));
        const verseText = txt
          .replace(/^\d+/, '')
          .replace(/(« )/g, '«')
          .replace(/( »)/g, '»')
          .trim()
          .split(' ')
          .join(' ፡ ');

        verse = {
          verse: {
            start: verseNo,
            end: verseNo,
            index: index++
          },
          text: verseText
        }
      } catch (e) {
        verse.text += `\n${txt.replace(/^\d+/, '').trim()}`;
      }

      return verse;
    }));
  });
}

async function loadBook(book, totalChapters) {
  const chapters = [];

  for (let chapter = 1; chapter <= totalChapters; chapter++) {
    console.log(`📖 Loading ${book} ${chapter}/${totalChapters}`);
    try {
      const verses = await loadChapter(book, chapter);
      chapters.push(verses);

      await sleep(10);
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

    await sleep(10);
  }

  return bible;
}

crawlAllBooks().then(bible => {
  console.log('✅ Crawl finished');
  console.log(JSON.stringify(bible));
});
