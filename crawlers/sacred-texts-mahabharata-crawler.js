const mahabharataMetadata = {
  1: {
    book: "Adi Parva",
    sections: Array.from({ length: 225 }, (_, i) => i + 1)
  },


  2: {
    book: "Sabha Parva",
    sections: Array.from({ length: 71 }, (_, i) => i + 1)
  },

  3: {
    book: "Vana Parva",
    sections: Array.from({ length: 299 }, (_, i) => i + 1)
  },

  4: {
    book: "Virata Parva",
    sections: Array.from({ length: 67 }, (_, i) => i + 1)
  },
  5: {
    book: "Udyoga Parva",
    sections: Array.from({ length: 197 }, (_, i) => i + 1)
  },

  6: {
    book: "Bhishma Parva",
    sections: Array.from({ length: 117 }, (_, i) => i + 1)
  },

  7: {
    book: "Drona Parva",
    sections: Array.from({ length: 173 }, (_, i) => i + 1)
  },

  8: {
    book: "Karna Parva",
    sections: Array.from({ length: 69 }, (_, i) => i + 1)
  },

  9: {
    book: 'Shalya Parva',
    sections: Array.from({ length: 64 }, (_, i) => i + 1)
  },
  10: {
    book: 'Sauptika Parva',
    sections: Array.from({ length: 18 }, (_, i) => i + 1)
  },
  11: {
    book: 'Stri Parva',
    sections: Array.from({ length: 27 }, (_, i) => i + 1)
  },
  12: {
    book: 'Santi Parva',
    sections: Array.from({ length: 353 }, (_, i) => i + 1)
  },
  13: {
    book: 'Anusasana Parva',
    sections: Array.from({ length: 154 }, (_, i) => i + 1)
  },
  14: {
    book: 'Aswamedha Parva',
    sections: Array.from({ length: 96 }, (_, i) => i + 1)
  },
  15: {
    book: 'Asramavasika Parva',
    sections: Array.from({ length: 47 }, (_, i) => i + 1)
  },
  16: {
    book: 'Mausala Parva',
    sections: Array.from({ length: 9 }, (_, i) => i + 1)
  },
  17: {
    book: 'Mahaprasthanika Parva',
    sections: Array.from({ length: 3 }, (_, i) => i + 1)
  },
  18: {
    book: 'Svargarohanika Parva',
    sections: Array.from({ length: 5 }, (_, i) => i + 1)
  }
};

const baseUrl = "https://www.sacred-texts.com/hin/mbs/mbs";
const delayMs = 10; // tempo entre requisições em ms
const maxRetries = Infinity; // tentativas por seção

// Converte HTML de uma seção em JSON de versos
function toJson(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const td = doc.querySelector('table tbody td'); // pega primeiro TD da tabela
  if (!td) return [];

  const verses = [];
  const htmlContent = td.innerHTML;

  // Regex para encontrar cada verso
  const verseRegex = /<font[^>]*>(\d+)<\/font>([\s\S]*?)(?=<font|$)/g;

  let match;
  while ((match = verseRegex.exec(htmlContent)) !== null) {
    const verseNumber = parseInt(match[1], 10);

    // Remove tags HTML, colchetes e espaços extras
    let text = match[2]
      .replace(/<br\s*\/?>/gi, '\n') // quebra de linha
      .replace(/<[^>]+>/g, '')       // remove outras tags
      .replace(/&nbsp;/g, '')
      .trim();

    verses.push({ verse: verseNumber, text });
  }

  return verses;
}

// Delay
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fetch com retry
async function fetchSection(book, section) {
  const url = `${baseUrl}${String(book).padStart(2, '0')}${String(section).padStart(3, '0')}.htm`;
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const text = await res.text(); // HTML bruto
      console.log(`✅ Fetched Book ${book} Section ${section}`);
      return text;
    } catch (err) {
      attempts++;
      console.warn(`⚠️ Retry ${attempts} for Book ${book} Section ${section}`);
      await sleep(3000);
    }
  }
}

// Crawler principal
async function crawlMahabharata() {
  for (const parvaKey in mahabharataMetadata) {
    const { sections } = mahabharataMetadata[parvaKey];

    for (let index1 = 0; index1 < sections.length; index1++) {
      const secNum = sections[index1];
      
      const html = await fetchSection(parvaKey, secNum);
      mahabharataMetadata[parvaKey].sections[index1] = toJson(html);

      await sleep(delayMs); 
    }
  }

  console.log("✅ Crawling finished");
  return mahabharataMetadata;
}

// Executa
crawlMahabharata(mahabharataMetadata).then(t => setTimeout(console.info(JSON.stringify(t))));