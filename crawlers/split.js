const fs = require('fs');
const path = require('path');

// Caminho do arquivo de entrada
const inputFile = path.join(__dirname, 'index.json');

// Pasta onde os arquivos separados serão criados
const outputDir = path.join(__dirname, '.');

// Cria a pasta de saída se não existir
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Lê o JSON do arquivo
const rawData = fs.readFileSync(inputFile, 'utf-8');
const jsonData = JSON.parse(rawData);

// Para cada propriedade do JSON, cria um arquivo separado
for (const key in jsonData) {
  if (jsonData.hasOwnProperty(key)) {
    const outputFilePath = path.join(outputDir, `${key}.json`);
    fs.writeFileSync(outputFilePath, JSON.stringify(jsonData[key], null, 2), 'utf-8');
    console.log(`Arquivo criado: ${outputFilePath}`);
  }
}

console.log('Todos os arquivos foram gerados com sucesso!');