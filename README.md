# Scriptures Inspector

Zacarias 4:6
⁶ E respondeu-me, dizendo: Esta é a palavra do Senhor a Zorobabel, dizendo: Não por força nem por violência, mas sim pelo meu Espírito, diz o Senhor dos Exércitos.

https://antonioconselheiro.github.io/scriptures-inspector/

## Arquivos de projeto

Os arquivos `.xenoglosproj` são documentos JSON. O pacote Debian registra a extensão
como `application/vnd.scriptures-inspector.xenoglosproj+json` e associa-a ao ícone do
Scriptures Inspector. Ao abrir um desses arquivos pelo gerenciador de arquivos, o
aplicativo carrega o projeto diretamente, sem passar pela tela de seleção.

O tipo MIME é metadado do sistema operacional, não um campo embutido no documento
JSON.

## Manutenção
Para abrir a tela do container no host deve executar o `.devcontainer/bdeforeDevcontainer.sh`.
Se der errado, tente executar o `.devcontainer/auth.sh` dentro do container, se continuar não iniciando, tente rodar o `npm run dev:electron` trocando o usuário node pelo usuário root, depois se der certo volte o usuário node.