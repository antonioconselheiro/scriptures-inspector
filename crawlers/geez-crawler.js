const books = [{
  book: 'MAT',
  total: 28
},
{
  book: 'MRK',
  total: 16
},
{
  book: 'LUK',
  total: 24
},
{
  book: 'JHN',
  total: 21
},
{
  book: 'ACT',
  total: 28
},
{
  book: 'ROM',
  total: 16
},
{
  book: '1CO',
  total: 16
},
{
  book: '2CO',
  total: 13
},
{
  book: 'GAL',
  total: 6
},
{
  book: 'EPH',
  total: 6
},
{
  book: 'PHP',
  total: 4
},
{
  book: 'COL',
  total: 4
},
{
  book: '1TH',
  total: 5
},
{
  book: '2TH',
  total: 3
},
{
  book: '1TI',
  total: 6
},
{
  book: '2TI',
  total: 4
},
{
  book: 'TIT',
  total: 3
},
{
  book: 'PHM',
  total: 1
},
{
  book: 'HEB',
  total: 13
},
{
  book: '1PE',
  total: 5
},
{
  book: '2PE',
  total: 3
},
{
  book: '1JN',
  total: 5
},
{
  book: '2JN',
  total: 1
},
{
  book: '3JN',
  total: 1
},
{
  book: 'JUD',
  total: 1
},
{
  book: 'JAS',
  total: 5
},
{
  book: 'REV',
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
      const text = await res.text(); // HTML bruto
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
      const [verseNo] = Array.from(txt.match(/^\d+/)),
        verseText = txt.replace(/^\d+/, '').trim();
      return {
        verse: {
          start: verseNo,
          end: verseNo,
          index: index++
        },
        text: verseText
      }
    }));
  });
}

async function loadBook(book, totalChapters) {
  const chapters = [];

  for (let chapter = 1; chapter <= totalChapters; chapter++) {
    console.log(`📖 Loading ${book} ${chapter}/${totalChapters}`);
    try {
      const verses = await loadChapter(book, chapter);
      chapters.push({
        chapter,
        verses
      });

      // pequeno delay entre capítulos
      await sleep(1000);
    } catch (err) {
      console.error(`❌ Failed loading ${book} ${chapter}`, err);
    }
  }

  return {
    book,
    chapters
  };
}

async function crawlAllBooks() {
  const bible = [];

  for (const { book, total } of books) {
    console.log(`📚 Starting book ${book}`);
    const bookData = await loadBook(book, total);
    bible.push(bookData);

    // delay entre livros (educado com o servidor)
    await sleep(3000);
  }

  return bible;
}

crawlAllBooks().then(bible => {
  console.log('✅ Crawl finished');
  console.log(JSON.stringify(bible));
});
