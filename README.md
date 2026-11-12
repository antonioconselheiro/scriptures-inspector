# Scriptures Inspector

Zacarias 4:6
⁶ E respondeu-me, dizendo: Esta é a palavra do Senhor a Zorobabel, dizendo: Não por força nem por violência, mas sim pelo meu Espírito, diz o Senhor dos Exércitos.

https://antonioconselheiro.github.io/scriptures-inspector/

## Navegação

O painel **Codex Navigation** fica visível por padrão no canto inferior esquerdo e
pode ser movido ou ocultado pelo menu **View**. No editor de tradução, o campo de
verso acompanha a rolagem e permite ir diretamente a um verso do capítulo aberto.
Para abrir outro livro ou capítulo, selecione-o e use **Go**; o verso informado
também será usado no destino.
Para abrir uma apresentação sem os controles de edição, use **View > Preview Current**.
O Holy Viewer inicia com o capítulo inteiro, cores **Prismatic** e léxicos visíveis;
o ícone de configuração permite escolher um
verso, intervalo ou capítulo e quais dados interlineares, traduções personalizadas,
ortografia, transliteração e numerologia serão exibidos, além de escolher entre
o modo **Word of God**, que destaca as marcações correspondentes, e o modo
**Prismatic**, que exibe as cores de associação interlinear.
O diálogo também permite ativar o tooltip nativo (atributo HTML `title`) com o
léxico ao passar o mouse sobre segmentos do texto original.
As variações selecionadas são aplicadas à tradução personalizada; se várias
alterarem o mesmo trecho, prevalece a última selecionada. Traduções de referência
do editor não são exibidas na prévia.

## Coleções de artefatos

Com um projeto aberto, use **File > Artifact Collections** para criar uma coleção.
Depois, em **File > Import Artifact Images**, selecione imagens PNG, escolha a
coleção e organize as imagens antes de importá-las e salvar a ordem.
Na navegação de coleções, os índices de artefatos começam em **0**.

## Arquivos de projeto

Os arquivos `.xenoglosproj` são documentos JSON. O pacote Debian registra a extensão
como `application/vnd.scriptures-inspector.xenoglosproj+json` e associa-a ao ícone do
Scriptures Inspector.

## Manutenção
Para abrir a tela do container no host deve executar o `.devcontainer/bdeforeDevcontainer.sh`.
Se der errado, tente executar o `.devcontainer/auth.sh` dentro do container, se continuar não iniciando, tente rodar o `npm run dev:electron` trocando o usuário node pelo usuário root, depois se der certo volte o usuário node.