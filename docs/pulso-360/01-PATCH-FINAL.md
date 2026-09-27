# Pulso 360 — Patch Final de Implementação

## 1. Períodos

### Hoje
Do início do dia local da empresa até agora. Mostrar totais atuais e acontecimentos do dia.

### Semana
Mostrar total semanal e gráfico obrigatório por dia da semana.

### Mês
Do dia 1 até agora. Mostrar total acumulado e evolução diária.

Todos os períodos usam o timezone do tenant.

## 2. Resultado bruto — sem despesas

O cartão financeiro do Pulso mostra somente:

- Vendas/Receita;
- CMV/CPV;
- Lucro bruto;
- Margem bruta.

Não exibir despesas operacionais, folha, aluguel, energia, combustível ou resultado líquido.

## 3. Fontes oficiais

- Pedidos/Vendas → módulo Pedidos/Vendas.
- Produção → Produziu Registra.
- Visitas → Tarefas/Missões/Visitas.
- Prospecções → domínio de Prospecção.
- Tarefas → motor oficial de Tarefas/Missões.
- Entregas → Entrega Registra.
- Pessoas → Colaboradores + eventos oficiais.
- Diário do Pulso → stream/auditoria de eventos dos módulos.

Nunca duplicar cadastro nem estado de negócio.

## 4. Envelope comum de evento

Cada evento do Diário deve possuir:

- id;
- tenant_id;
- occurred_at;
- event_type;
- severity: info | attention | action_required;
- ator/colaborador quando houver;
- assunto e id do registro de origem;
- relações: cliente/prospecto/pedido/tarefa/entrega/produto;
- mídia/foto quando houver;
- localização quando aplicável;
- métricas;
- deep-link para o módulo de origem.

O feed deve ser idempotente por event_id.

## 5. Eventos mínimos

### Pedidos
- pedido criado;
- pedido faturado quando relevante;
- venda consolidada;
- primeira venda de prospecto convertido.

### Produção
- produção registrada;
- conferida/aprovada quando aplicável;
- divergência relevante;
- meta/urgência relevante.

### Visitas/Prospecções
- visita iniciada;
- foto/evidência registrada;
- visita concluída;
- nova prospecção sem cliente cadastrado;
- retorno agendado;
- prospecto convertido em cliente.

### Tarefas/Missões
- tarefa atribuída quando relevante;
- iniciada;
- concluída;
- atrasada;
- tarefa automática criada por outro módulo.

### Entregas
- entrega concluída;
- entrega parcial;
- divergência/falta/avaria;
- tarefa administrativa criada a partir da entrega parcial.

## 6. Níveis de relevância

- **info**: acontecimento normal.
- **attention**: merece ser visto.
- **action_required**: exige ação humana.

Nem todo evento do Diário gera notificação push.

## 7. Visto/OK

Visto/OK significa apenas ciência do usuário.

Não pode:
- aprovar produção;
- concluir tarefa;
- resolver entrega parcial;
- alterar pedido;
- substituir ação do módulo de origem.

A ciência é individual por usuário.

## 8. Revisão do dia

Registra que o usuário revisou o dia.

Não fecha módulos, não muda status e não impede eventos posteriores. Se houver eventos novos depois da revisão, a UI pode sinalizar novos acontecimentos.

## 9. Nova Tarefa pelo Pulso

Usar o mesmo motor oficial de Tarefas.

Campos mínimos:
- título;
- data;
- horário quando aplicável;
- tipo: Visita, Ligação, E-mail ou Outro;
- cliente quando aplicável;
- responsável;
- detalhes;
- origem automática quando iniciada por evento do Pulso.

Salvar pelo Pulso deve criar tarefa real no módulo Tarefas e gerar evento correspondente no Diário.

## 10. Entrega parcial → tarefa administrativa

Entrega parcial pode gerar automaticamente tarefa para o administrativo, vinculada ao pedido e cliente, contendo:

- pedido;
- cliente;
- NF se houver;
- entregador;
- data/hora;
- itens/caixas faltantes;
- quantidade e valor da pendência;
- motivo;
- fotos/evidências;
- link para pedido;
- link para comprovante/termo.

Concluir a tarefa nunca altera nem apaga o registro original da entrega parcial.

## 11. Nova Prospecção sem cliente

O vendedor pode registrar visita a comércio ainda não cadastrado.

Campos mínimos:
- identificação/nome do comércio;
- foto;
- localização;
- observação;
- resultado;
- retorno previsto opcional;
- vendedor automático.

Nasce como Prospecto. A conversão posterior em Cliente preserva histórico, foto e localização.

## 12. Visão por pessoa

Consolidar somente dados autorizados:
- atividades;
- visitas/prospecções;
- tarefas;
- produção;
- pedidos/vendas quando comercial;
- entregas quando entregador;
- última atividade relevante.

Não criar ranking público de funcionários.

## 13. Permissões

Toda consulta valida no servidor:
1. usuário autenticado;
2. tenant da sessão;
3. perfil/permissão;
4. escopo autorizado.

Permissões sugeridas:
- pulso.view;
- pulso.view_financial_gross;
- pulso.view_people;
- pulso.acknowledge;
- pulso.daily_review;
- tasks.create_from_pulso;
- prospects.create_from_pulso.

Nunca aceitar tenant_id do cliente como prova de autorização.

## 14. Endpoints agregadores

### GET /api/pulso/summary?period=today|week|month
Retorna período, vendas, resultado bruto, produção, visitas, prospecções, tarefas, entregas, pessoas ativas e séries de gráfico.

### GET /api/pulso/events
Feed paginado com filtros opcionais por período, tipo, severidade e colaborador.

### POST /api/pulso/events/:eventId/ack
Registra ciência do usuário atual.

### POST /api/pulso/daily-review
Registra revisão do dia.

### GET /api/pulso/people/:colaboradorId
Visão consolidada autorizada da pessoa.

Tarefa e Prospecção devem usar serviços oficiais desses domínios, não uma escrita exclusiva do Pulso.

## 15. Tempo real

Requisitos:
- isolamento por tenant;
- idempotência;
- reconexão automática;
- recuperação de lacuna por cursor/last_event_id;
- atualização incremental do Diário;
- revalidação dos agregados afetados;
- nunca contar evento duas vezes.

## 16. Performance e resiliência

- primeiro conteúdo útil em condição normal <= 2 s;
- skeleton/estado de carregamento;
- erro de um card não derruba a Home;
- feed paginado;
- thumbnails de fotos;
- estados: carregando, vazio, sucesso, erro e sem permissão;
- nunca abrir tela totalmente branca por erro de API/script.

## 17. Critérios de aceite

A implementação só é concluída quando:

1. reproduz o HTML V2 sem redesign;
2. abre em Hoje;
3. Hoje/Semana/Mês alteram todos os dados;
4. Semana compara dias;
5. Mês mostra acumulado e evolução diária;
6. Pedidos vêm da fonte oficial;
7. Resultado bruto contém apenas Vendas, CMV/CPV, Lucro e Margem;
8. Produção vem do Produziu Registra;
9. fotos/evidências de visitas aparecem quando autorizadas;
10. Prospecção funciona sem cadastro completo;
11. Tarefas vêm do motor oficial;
12. Nova Tarefa pelo Pulso cria tarefa real;
13. entrega parcial gera tarefa vinculada quando configurado;
14. Entregas vêm do Entrega Registra;
15. Pessoas não criam base paralela;
16. Diário funciona em tempo real;
17. cada evento possui deep-link;
18. Visto/OK não altera o negócio;
19. revisão do dia não fecha operações;
20. permissões/tenant são validados server-side;
21. reconexão não duplica contagens;
22. falha parcial não causa tela branca;
23. mobile/desktop preservam a UX aprovada;
24. nenhuma despesa aparece no resultado bruto;
25. Pulso nunca é fonte primária de dados.

## Regra final

**Não reinterpretar o Pulso 360 na implementação. O protótipo V2 é a referência visual aprovada e este documento é o contrato funcional e de integração.**
