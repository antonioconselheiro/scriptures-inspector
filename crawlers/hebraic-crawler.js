const livros = [
  { sigla: 'GEN', capitulos: 50 },
  { sigla: 'EXO', capitulos: 40 },
  { sigla: 'LEV', capitulos: 27 },
  { sigla: 'NUM', capitulos: 36 },
  { sigla: 'DEU', capitulos: 34 },
  { sigla: 'JOS', capitulos: 24 },
  { sigla: 'JDG', capitulos: 21 },
  { sigla: '1SA', capitulos: 31 },
  { sigla: '2SA', capitulos: 24 },
  { sigla: '1KI', capitulos: 22 },
  { sigla: '2KI', capitulos: 25 },
  { sigla: '1CH', capitulos: 29 },
  { sigla: '2CH', capitulos: 36 },
  { sigla: 'ISA', capitulos: 66 },
  { sigla: 'JER', capitulos: 52 },
  { sigla: 'EZK', capitulos: 48 },
  { sigla: 'HOS', capitulos: 14 },
  { sigla: 'JOL', capitulos: 3 },
  { sigla: 'AMO', capitulos: 9 },
  { sigla: 'OBA', capitulos: 1 },
  { sigla: 'JON', capitulos: 4 },
  { sigla: 'MIC', capitulos: 7 },
  { sigla: 'NAM', capitulos: 3 },
  { sigla: 'HAB', capitulos: 3 },
  { sigla: 'ZEP', capitulos: 3 },
  { sigla: 'HAG', capitulos: 2 },
  { sigla: 'ZEC', capitulos: 14 },
  { sigla: 'MAL', capitulos: 3 },
  { sigla: 'PSA', capitulos: 150 },
  { sigla: 'PRO', capitulos: 31 },
  { sigla: 'JOB', capitulos: 42 },
  { sigla: 'SNG', capitulos: 8 },
  { sigla: 'RUT', capitulos: 4 },
  { sigla: 'LAM', capitulos: 5 },
  { sigla: 'ECC', capitulos: 12 },
  { sigla: 'EST', capitulos: 10 },
  { sigla: 'DAN', capitulos: 12 },
  { sigla: 'EZR', capitulos: 10 },
  { sigla: 'NEH', capitulos: 13 },
];

async function sleep(n){
  return new Promise(resolve => setTimeout(resolve, n))
}

// Função de fetch com retry contínuo
async function fetchWithRetry(url, delay = 2000) {
  while (true) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Accept": "application/json, text/plain, */*",
          "Accept-Language": "pt-BR,pt;q=0.7",
          "Authorization": "Bearer anonymous",
          "Sec-CH-UA-Mobile": "?0",
          "Sec-CH-UA-Platform": '"Linux"',
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "cross-site",
          "Sec-GPC": "1",
          "X-API-Key": "896f6f87-fc95-4605-b782-804b99b83800",
          "X-Brand": "DIEBIBEL"
        }
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn(`Erro ao buscar ${url}. Tentando novamente em ${delay}ms...`, error);
      await new Promise(res => setTimeout(res, delay));
    }
  }
}

function convertBibleJson(inputJson) {
    const result = [];

    if (!inputJson?.data?.chapter?.content) {
        return result;
    }

    const chapterContent = inputJson.data.chapter.content;

    chapterContent.forEach(paragraph => {
        if (paragraph.type === 'paragraph' && Array.isArray(paragraph.content)) {
            let verseObj = null;

            paragraph.content.forEach(item => {
                if (item.type === 'verse-number') {
                    if (verseObj) {
                        result.push(verseObj); // adiciona ao resultado final
                    }
                    verseObj = {
                        verse: {
                            start: item.content,
                            end: item.content,
                            index: parseInt(item.content) - 1
                        },
                        text: ''
                    };
                } else if (item.type === 'verse-text') {
                    if (verseObj) {
                        verseObj.text = item.content.trim();
                    }
                }
            });

            // Adiciona o último versículo do parágrafo
            if (verseObj) {
                result.push(verseObj);
            }
        }
    });

    return result;
}

window.bibleData = {};
async function fetchBibleContent() {

  for (const livro of livros) {
    const sigla = livro.sigla;
    bibleData[sigla] = [];

    for (let cap = 1; cap <= livro.capitulos; cap++) {
      const url = `https://api.ibep-prod.com/bibles/9f3cb709f9bded60-01/chapters/${sigla}.${cap}/with-study-content`
      
      const data = await fetchWithRetry(url);
      bibleData[sigla].push(convertBibleJson(data));
      
      console.log(`✔ Livro ${sigla}, capítulo ${cap} carregado.`);
      await sleep(10);
    }
  }

  // Salvar ou exibir o JSON final
  console.log(JSON.stringify(bibleData));
  return bibleData;
}

fetchBibleContent();
