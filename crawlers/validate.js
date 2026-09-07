// ---------------------------------------------------
//  Coloque na pasta para validar a estrutura dos arquivos JSON
// ---------------------------------------------------

const fs = require("fs");
const path = require("path");

const pasta = __dirname;

// Pega somente arquivos com extensão .json
const arquivos = fs
  .readdirSync(pasta, { withFileTypes: true })
  .filter(
    (item) =>
      item.isFile() &&
      path.extname(item.name).toLowerCase() === ".json"
  )
  .map((item) => item.name);

if (arquivos.length === 0) {
  console.log("Nenhum arquivo JSON encontrado.");
  process.exit(0);
}

console.log(`Encontrados ${arquivos.length} arquivo(s) JSON.\n`);

let totalWarnings = 0;

for (const nomeArquivo of arquivos) {
  const caminhoArquivo = path.join(pasta, nomeArquivo);

  console.log(`========================================`);
  console.log(`Validando: ${nomeArquivo}`);
  console.log(`========================================`);

  let dados;

  try {
    const conteudo = fs.readFileSync(caminhoArquivo, "utf8");
    dados = JSON.parse(conteudo);
  } catch (erro) {
    console.warn(`[WARNING] ${nomeArquivo}: JSON inválido.`);
    console.warn(`          ${erro.message}\n`);
    totalWarnings++;
    continue;
  }

  if (!Array.isArray(dados.chapters)) {
    console.warn(
      `[WARNING] ${nomeArquivo}: propriedade "chapters" não é um array.`
    );
    totalWarnings++;
    continue;
  }

  let warningsArquivo = 0;

  // Validação dos capítulos
  for (let i = 0; i < dados.chapters.length; i++) {
    const capitulo = dados.chapters[i];

    if (typeof capitulo.chapter !== "number") {
      console.warn(
        `[WARNING] ${nomeArquivo}: posição ${i} possui capítulo inválido.`
      );
      warningsArquivo++;
      totalWarnings++;
      continue;
    }

    if (i > 0) {
      const capituloAnterior = dados.chapters[i - 1].chapter;
      const capituloEsperado = capituloAnterior + 1;

      if (capitulo.chapter !== capituloEsperado) {
        console.warn(
          `[WARNING] ${nomeArquivo}: sequência de capítulos inválida.`
        );
        console.warn(
          `          Esperado: capítulo ${capituloEsperado}, encontrado: capítulo ${capitulo}`
        );

        warningsArquivo++;
        totalWarnings++;
      }
    }

    // Validação dos versículos
    if (!Array.isArray(capitulo.verses)) {
      console.warn(
        `[WARNING] ${nomeArquivo}: capítulo ${capitulo.chapter} não possui "verses" como array.`
      );
      warningsArquivo++;
      totalWarnings++;
      continue;
    }

    for (let j = 0; j < capitulo.verses.length; j++) {
      const verso = capitulo.verses[j];

      if (typeof verso.verse !== "number") {
        console.warn(
          `[WARNING] ${nomeArquivo}: capítulo ${capitulo.chapter}, posição ${j} possui versículo inválido.`
        );
        warningsArquivo++;
        totalWarnings++;
        continue;
      }

      if (j > 0) {
        const versoAnterior = capitulo.verses[j - 1].verse;
        const versoEsperado = versoAnterior + 1;

        if (verso.verse !== versoEsperado) {
          console.warn(
            `[WARNING] ${nomeArquivo}: sequência de versículos inválida.`
          );
          console.warn(
            `          Capítulo: ${capitulo.chapter}`
          );
          console.warn(
            `          Esperado: versículo ${versoEsperado}, encontrado: versículo ${verso.verse}`
          );

          warningsArquivo++;
          totalWarnings++;
        }
      }
    }
  }

  if (warningsArquivo === 0) {
    // console.log("OK: nenhuma quebra de sequência encontrada.\n");
  } else {
    console.log(
      `\nTotal de warnings neste arquivo: ${warningsArquivo}\n`
    );
  }
}

console.log(`========================================`);
console.log(`VALIDAÇÃO FINALIZADA`);
console.log(`========================================`);
console.log(`Arquivos analisados: ${arquivos.length}`);
console.log(`Total de warnings: ${totalWarnings}`);

if (totalWarnings === 0) {
  console.log("Tudo certo! Nenhuma inconsistência encontrada.");
} else {
  console.log("Foram encontradas inconsistências.");
}