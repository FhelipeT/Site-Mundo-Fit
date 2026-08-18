# Mundo Fit da Manu 💜

Site pessoal de treinos, feito para ser usado no celular como um app de
academia: abre, vê o treino do dia, vê os exercícios, séries e o GIF de
demonstração. Simples assim.

100% HTML, CSS e JavaScript puro — sem framework, sem backend, sem banco
de dados. Funciona direto no navegador e pode ser hospedado de graça no
GitHub Pages.

## Estrutura do projeto

```
mundo-fit-da-manu/
│
├── index.html          → estrutura da página (tela inicial + tela de treino)
├── style.css            → todo o visual (cores, tipografia, layout, animações)
├── script.js             → dados dos treinos, navegação e "treino concluído"
├── manifest.json         → configuração do PWA (instalar na tela de início)
├── service-worker.js     → cache para o app funcionar offline
│
├── assets/
│   ├── icons/            → ícone do app (svg + png em vários tamanhos)
│   ├── images/           → reservado para imagens gerais do site
│   └── exercises/        → GIFs de demonstração de cada exercício
│
└── README.md
```

## Editando os treinos

Todos os dados de treino (dias, exercícios, séries e repetições) ficam
no topo do arquivo `script.js`, dentro da constante `WEEK`. Para ajustar
algo, edite direto ali — cada exercício é criado com a função `ex(nome,
séries, nome-do-arquivo-do-gif)`.

## Botão "Hoje"

No cabeçalho existe um botão **Hoje** que leva direto para o treino do dia
atual, recalculando a data no momento do toque (nunca depende de um valor
guardado desde a abertura da página).

## Calendário sempre atualizado

A semana e o dia atual são sempre calculados a partir da data local do
aparelho — não existem datas fixas no código. Se a pessoa deixar o site
aberto passando da meia-noite, ou o celular voltar de segundo plano num
dia diferente, o destaque do dia atual se atualiza sozinho (sem precisar
recarregar a página).

## "Treino concluído"

O botão **✓ Marcar treino como concluído** salva o progresso no
`localStorage` do navegador, por data. Ou seja, o progresso fica salvo
naquele aparelho/navegador específico — não existe conta, login nem
sincronização entre aparelhos.

## Personalização visual

As cores, fontes e espaçamentos estão centralizados em variáveis CSS no
topo do `style.css` (seção `:root`). É o primeiro lugar para mexer se
quiser ajustar a paleta de cores ou trocar as fontes.
