# 13 — QA e Revisão de Design do Produzir Registra

**Data:** 22/09/2026  
**Escopo:** PWA demonstrativo da branch `feat/produzir-registra-site`

## Resultado executivo

A implementação cobre o fluxo aprovado do Produzir Registra e preserva a regra central do projeto:

> o colaborador registra individualmente, mas somente a conferência autorizada movimenta o estoque oficial.

A revisão não encontrou bloqueadores lógicos nos fluxos automatizados cobertos pelos testes. O protótipo continua sendo uma demonstração local: autenticação, dados, sincronização e estoque real ainda precisam ser conectados ao backend oficial do Óris 360 antes de uso produtivo.

## Verificação automatizada

- `node --test`: **27 testes aprovados, 0 falhas**.
- `node --check`: **19 módulos de origem + service worker sem erro de sintaxe**.
- Smoke HTTP: `index.html`, `src/app.js` e `manifest.webmanifest` responderam corretamente por servidor HTTP estático.
- Hashes Git blob dos arquivos locais foram comparados com os blobs gravados na branch do GitHub durante a publicação da implementação.

## Jornadas revisadas

### Colaborador

1. entra com identidade própria;
2. acessa Registrar;
3. usa câmera quando suportada, digita código ou busca produto;
4. informa quantidade;
5. pode converter caixa + unidade solta;
6. registra;
7. vê o registro como aguardando conferência;
8. acompanha Produzido e Nosso Resultado;
9. visualiza necessidades/urgências sem ser obrigado a abrir ordem de produção.

### Gestor / Conferente

1. recebe a aba Conferir por permissão;
2. vê pendências agrupadas por produto;
3. abre a composição por colaborador;
4. informa a quantidade física;
5. vê a divergência antes de confirmar;
6. confirma a produção;
7. o sistema preserva declarado e conferido separadamente;
8. a quantidade conferida gera a entrada demonstrativa de produto acabado;
9. a Ficha Técnica gera consumo de componentes;
10. insuficiências não levam o estoque de matéria-prima abaixo de zero e ficam registradas.

## Revisão visual e de experiência

### Hierarquia

- O scanner é o elemento dominante da área Registrar.
- A ação principal usa azul e possui maior peso visual.
- Informações secundárias ficam em cards de baixo contraste.
- Urgência usa vermelho de forma localizada, sem dominar o aplicativo inteiro.

### Cores

- Branco, azul e cinza formam a identidade principal.
- Verde: confirmado/sucesso.
- Laranja: atenção/offline.
- Vermelho: urgente/divergência/erro.

### Tipografia e espaçamento

- Fonte do sistema para rapidez e legibilidade.
- Títulos possuem escala clara e contraste com textos auxiliares.
- Cards usam espaçamento consistente, cantos arredondados e áreas de toque amplas.

### Responsividade

- Mobile-first.
- Até 620 px: controles e grids se reorganizam para tela estreita.
- A partir de 860 px: a navegação muda para uma lateral fixa e o conteúdo aproveita a área de desktop/tablet.

### Acessibilidade operacional

- `header`, `main` e `nav` semânticos.
- Botões com foco visível.
- Campos possuem `label`.
- Estados importantes usam texto além de cor.
- Controles principais trabalham com altura mínima próxima de 48 px.
- O scanner possui fallback manual quando a câmera/BarcodeDetector não estiver disponível.

## Revisão de regras de negócio

Confirmado na implementação:

- não existe ordem de produção obrigatória;
- não existe etapa obrigatória “iniciar produção” ou “finalizar produção”;
- autoria vem da sessão;
- operador não recebe a rota Conferir;
- registro inicial não movimenta estoque;
- conferência preserva o valor declarado;
- divergência não é apagada;
- toque/retry é protegido por chave de idempotência nas rotinas de domínio;
- necessidade não impede produção livre;
- não existe ranking público de funcionários;
- matéria-prima não recebe saldo negativo.

## Correção feita durante a revisão

Foi identificado que o indicador “Já conferido” da tela Nosso Resultado poderia somar revisões de períodos anteriores enquanto o número ao lado representava “Registrado neste mês”.

A correção adicionou agregação de conferências por Hoje/Semana/Mês e passou a usar somente o total confirmado do mês nesse bloco. Um teste foi escrito antes da correção e validado em ciclo vermelho → verde.

## Limitações conhecidas desta rodada

### Browser visual automatizado

O ambiente de execução bloqueou a navegação do Chromium para o servidor local (`ERR_BLOCKED_BY_ADMINISTRATOR` em tentativas de automação). Por isso, esta rodada não afirma validação visual pixel a pixel em navegador real.

### Câmera física

A API de scanner e o fallback estão implementados e testados por capacidade, mas a câmera precisa ser testada em um telefone real/preview HTTPS.

### Backend real

O protótipo usa `localStorage` e dados de demonstração. Antes de produção:
- autenticação deve vir do Óris 360;
- produtos e fichas técnicas devem vir da base real;
- registro e conferência precisam de endpoints idempotentes;
- estoque deve ser movimentado em transação no backend;
- offline precisa sincronizar com confirmação do servidor.

## Próxima validação recomendada

Depois de gerar uma URL HTTPS de preview:
1. testar em Android e iPhone;
2. testar permissão de câmera;
3. fazer registro offline e reconexão;
4. fazer conferência com divergência;
5. validar instalação PWA;
6. conferir responsividade em 390 px, tablet e desktop.
