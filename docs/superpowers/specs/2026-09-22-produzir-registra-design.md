# Produzir Registra — Design Consolidado

**Data:** 2026-09-22  
**Escopo:** documentação de produto e arquitetura conceitual  
**Status:** especificação para revisão do usuário antes de implementação

## Propósito

Construir uma camada operacional de produção do Óris 360 em que cada colaborador registre o que realmente produziu com poucos passos, enquanto um conferente autorizado protege a confiabilidade do estoque.

## Design selecionado

### Registro individual + conferência separada

O operador registra:
`barcode + quantidade + identidade da sessão`.

O registro não movimenta estoque.

O conferente valida o total físico.

Somente a quantidade aprovada gera estoque e consumos de ficha técnica.

## Por que este design

Ele resolve simultaneamente:
- simplicidade no chão da fábrica;
- produtividade individual;
- rastreabilidade;
- proteção do estoque;
- necessidades urgentes sem PCP obrigatório.

## Componentes

- app mobile Produzir Registra;
- cadastro de Produtos;
- Ficha Técnica;
- Matéria-Prima e Insumos;
- Estoque;
- serviço de Production Records;
- serviço/tela de Conferência;
- Necessidades de Produção;
- Indicadores;
- Auditoria.

## Interfaces de usuário

Operador:
- Registrar;
- Produzido;
- Nosso Resultado.

Gestor:
- mesmas áreas;
- Conferir.

## Fluxo

```
realidade física
→ registro individual
→ pendência de conferência
→ validação física
→ movimento oficial
→ histórico/indicadores
```

## Decisões de UX

- mobile-first;
- scanner como protagonista;
- branco/azul/cinza;
- mensagens motivacionais;
- sem formulários longos;
- sem ordem obrigatória.

## Limites

Não inclui:
- implementação de backend;
- escolha definitiva de stack;
- código de banco;
- telas administrativas completas;
- política final para múltiplas necessidades do mesmo produto.

## Critério de aprovação

A especificação estará pronta para virar plano técnico quando o usuário confirmar que:
- o fluxo representa a fábrica;
- as áreas/telas estão corretas;
- as questões abertas no Decision Log podem ser resolvidas ou postergadas.
