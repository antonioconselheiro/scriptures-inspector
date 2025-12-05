const fs = require('fs');
const path = require('path');

// Verifica se o caminho foi passado
if (process.argv.length < 3) {
    console.error("Uso: node split-json.js <arquivo.json>");
    process.exit(1);
}

const inputPath = process.argv[2];

// Verifica se o arquivo existe
if (!fs.existsSync(inputPath)) {
    console.error("Arquivo não encontrado:", inputPath);
    process.exit(1);
}

// Lê o arquivo
let jsonData;
try {
    const content = fs.readFileSync(inputPath, 'utf8');
    jsonData = JSON.parse(content);
} catch (err) {
    console.error("Erro ao ler ou interpretar o JSON:", err.message);
    process.exit(1);
}

// Verifica se é um objeto
if (typeof jsonData !== 'object' || Array.isArray(jsonData)) {
    console.error("O JSON deve ser um objeto com propriedades no topo.");
    process.exit(1);
}

const baseDir = path.dirname(inputPath);

Object.keys(jsonData).forEach(key => {
    const outputFile = path.join(baseDir, `${key}.json`);
    const data = JSON.stringify(jsonData[key]);

    fs.writeFileSync(outputFile, data, 'utf8');
    console.log(`Arquivo criado: ${outputFile}`);
});

console.log("Finalizado!");