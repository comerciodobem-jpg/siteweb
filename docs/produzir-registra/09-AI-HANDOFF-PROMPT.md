# 09 — Prompt de Handoff para outro Agente de IA

Você está trabalhando no projeto **Produzir Registra**, pertencente ao ecossistema **Óris 360**.

Antes de propor ou implementar qualquer coisa:

1. leia `AGENTS.md`;
2. leia todos os arquivos de `docs/produzir-registra/`;
3. leia `08-DECISION-LOG.md` com atenção;
4. trate itens em “Questões abertas” como realmente abertos;
5. não ressuscite decisões antigas substituídas.

## Intenção

O sistema deve permitir que cada funcionário registre rapidamente o que produziu, preservando produtividade individual e rastreabilidade, sem permitir que erros individuais alterem diretamente o estoque oficial.

A solução é uma arquitetura em duas etapas:

```
DECLARAÇÃO DO COLABORADOR
→ AGUARDANDO CONFERÊNCIA
→ CONFERÊNCIA AUTORIZADA
→ MOVIMENTO OFICIAL DE ESTOQUE
```

## Experiência do colaborador

```
Produziu fisicamente
→ escaneou código de barras
→ produto identificado
→ informou quantidade
→ registrou
```

Não crie ordem de produção obrigatória.

## Experiência do gestor

```
abre Conferir
→ vê registros consolidados
→ abre composição individual
→ informa/confirma quantidade física
→ sistema calcula divergência
→ aprova
→ estoque recebe quantidade aprovada
```

## Áreas

Colaborador:
- Registrar;
- Produzido;
- Nosso Resultado.

Gestor:
- as mesmas;
- Conferir.

## Regras inegociáveis

- branco, azul e cinza como identidade;
- scanner como entrada principal;
- autoria vem da sessão;
- registro não altera estoque;
- conferência altera estoque;
- declarado nunca é sobrescrito;
- divergência é preservada;
- necessidade não bloqueia produção livre;
- meta não existe por padrão;
- sem ranking público;
- sem estoque reservado;
- saldo oficial não negativo;
- idempotência em ações críticas;
- offline deve ser recuperável.

## Antes de codificar

Mapeie:
- stack real do repositório;
- autenticação;
- banco;
- APIs existentes;
- padrões de UI;
- multiempresa;
- permissões;
- estoque;
- produtos;
- ficha técnica.

Não invente nomes de tabela/endpoint como fatos existentes. Os nomes deste documento são sugestões de domínio.

## Critério de sucesso

Um funcionário da produção deve conseguir aprender o fluxo sem treinamento formal.

Um gestor deve conseguir responder:
- quem registrou;
- quanto declarou;
- quanto foi conferido;
- quanto entrou no estoque;
- onde houve divergência;
- qual necessidade está aberta;
- quanto falta.

## Proibição sem nova aprovação

Não implemente:
- PCP completo;
- ordem obrigatória;
- início/fim obrigatório;
- ranking;
- autoaprovação;
- edição silenciosa;
- custos/preços no app operacional.

Use `07-ACCEPTANCE-CRITERIA.md` como contrato de testes.
