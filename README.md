# Óris 360 — Base de Conhecimento do Projeto

Este repositório funciona como base estruturada de conhecimento e também contém a implementação do **Produzir Registra**.

## Produzir Registra — aplicação

O Produzir Registra é a interface operacional da Produção no Óris 360. A experiência principal é:

```
produziu fisicamente
→ escaneou o produto
→ informou a quantidade
→ registrou
→ aguardou conferência
→ gestor validou
→ estoque oficial foi movimentado
```

A aplicação é um **PWA mobile-first**, com identidade visual branca, azul e cinza, suporte a leitura de código de barras quando disponível, operação offline/local, histórico, resultados, necessidades/urgências e conferência exclusiva por perfil.

### Executar

```bash
python3 -m http.server 4173
```

Depois abra `http://localhost:4173`.

### Testar

```bash
node --test
```

### Perfis de demonstração

- João Produção — PIN `1111`
- Maria Produção — PIN `2222`
- Gestor Produção — PIN `9999`

### Documentação de execução

Leia [12-RUN-AND-DEPLOY.md](docs/produzir-registra/12-RUN-AND-DEPLOY.md).

## Base de conhecimento

**Comece por:** [docs/produzir-registra/00-START-HERE.md](docs/produzir-registra/00-START-HERE.md)

### Leitura recomendada para agentes de IA

1. [AGENTS.md](AGENTS.md)
2. [00-START-HERE.md](docs/produzir-registra/00-START-HERE.md)
3. [01-MASTER-SPEC.md](docs/produzir-registra/01-MASTER-SPEC.md)
4. [02-UX-AND-SCREENS.md](docs/produzir-registra/02-UX-AND-SCREENS.md)
5. [03-DOMAIN-AND-DATA.md](docs/produzir-registra/03-DOMAIN-AND-DATA.md)
6. [04-FLOWS-AND-BUSINESS-RULES.md](docs/produzir-registra/04-FLOWS-AND-BUSINESS-RULES.md)
7. [05-ORIS360-INTEGRATION.md](docs/produzir-registra/05-ORIS360-INTEGRATION.md)
8. [06-OFFLINE-SECURITY-AUDIT.md](docs/produzir-registra/06-OFFLINE-SECURITY-AUDIT.md)
9. [07-ACCEPTANCE-CRITERIA.md](docs/produzir-registra/07-ACCEPTANCE-CRITERIA.md)
10. [08-DECISION-LOG.md](docs/produzir-registra/08-DECISION-LOG.md)
11. [09-AI-HANDOFF-PROMPT.md](docs/produzir-registra/09-AI-HANDOFF-PROMPT.md)
12. [10-CONVERSATION-KNOWLEDGE-MAP.md](docs/produzir-registra/10-CONVERSATION-KNOWLEDGE-MAP.md)
13. [11-SOURCE-TRACEABILITY.md](docs/produzir-registra/11-SOURCE-TRACEABILITY.md)
14. [12-RUN-AND-DEPLOY.md](docs/produzir-registra/12-RUN-AND-DEPLOY.md)
15. [Design consolidado](docs/superpowers/specs/2026-09-22-produzir-registra-design.md)
16. [Plano de implementação](docs/superpowers/plans/2026-09-22-produzir-registra-site.md)
17. [QA e revisão de design](docs/produzir-registra/13-QA-AND-DESIGN-REVIEW.md)

A arquitetura conceitual em forma de teia está em [knowledge-graph.mmd](docs/produzir-registra/diagrams/knowledge-graph.mmd).
