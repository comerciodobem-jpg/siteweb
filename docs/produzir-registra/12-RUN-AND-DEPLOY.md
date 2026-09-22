# 12 — Executar, Testar e Publicar o Produzir Registra

## Visão

O site foi implementado como um **PWA estático, mobile-first e sem dependências de framework**. Isso permite validar toda a experiência operacional antes de conectar o backend definitivo do Óris 360.

A versão atual usa armazenamento local do navegador para demonstrar:
- login por perfil;
- registro individual de produção;
- leitor de código de barras quando o navegador suporta `BarcodeDetector`;
- busca e código manual como fallback;
- Produzido;
- Nosso Resultado;
- necessidades/urgências;
- Conferir exclusivo para gestor;
- divergência;
- movimentação demonstrativa de estoque somente após conferência;
- baixa de ficha técnica e alerta de insuficiência;
- funcionamento offline do shell;
- fila local de sincronização.

## Executar localmente

Na raiz do projeto:

```bash
python3 -m http.server 4173
```

Abra:

```text
http://localhost:4173
```

Outra opção é usar qualquer servidor HTTP estático.

> Não abra o `index.html` diretamente por `file://`. Câmera, módulos ES e Service Worker funcionam corretamente via HTTP/HTTPS.

## Testes

O projeto usa o test runner nativo do Node.

```bash
node --test
```

Ou:

```bash
npm test
```

## Perfis de demonstração

- João Produção — PIN `1111`
- Maria Produção — PIN `2222`
- Gestor Produção — PIN `9999`

Os PINs existem somente para a demonstração front-end. A integração real deverá reutilizar a autenticação oficial do Óris 360.

## Código de barras de demonstração

- Colorau 100 g — `7891000000011`
- Tempero Completo 300 g — `7891000000028`
- Sal de Parrilla Ervas Finas 500 g — `7891000000035`
- Alho Granulado 200 g — `7891000000042`

## Publicação na Vercel

O projeto não exige etapa de build.

Configuração sugerida:
- Framework Preset: **Other**
- Build Command: vazio
- Output Directory: `.`
- Install Command: vazio

O arquivo `vercel.json` já configura os headers necessários para `sw.js` e `manifest.webmanifest`.

## Produção real

Antes de usar com estoque real, substituir as camadas locais por integrações reais do Óris 360:

1. `src/session/session.js` → autenticação/usuários reais;
2. `src/data/demo-data.js` → API de Produtos/Ficha Técnica;
3. `src/storage/store.js` → API/banco central;
4. `src/offline/sync.js` → endpoint idempotente de sincronização;
5. `src/domain/review.js` → transação de conferência + estoque no backend;
6. indicadores → consultas consolidadas por empresa.

A regra arquitetural deve permanecer: **registro individual não movimenta estoque; conferência autorizada movimenta.**
