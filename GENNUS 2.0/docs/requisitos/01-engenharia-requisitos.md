# Engenharia de Requisitos — ERP GENNUS 2.0

**Data da análise:** 2026-06-20  
**Padrão de organização:** inspirado em EES/SRS no estilo IEEE 830.  
**Objetivo:** transformar o escopo observado no projeto em requisitos claros, rastreáveis e verificáveis.

## 1. Propósito

Este documento descreve o que o ERP GENNUS 2.0 deve fazer, quais qualidades técnicas precisa ter e quais regras de negócio devem guiar a evolução do protótipo atual para um sistema persistente, seguro e multiempresa.

## 2. Âmbito do sistema

O GENNUS 2.0 deve apoiar micro e pequenas empresas no controle de produtos, estoque, vendas, clientes, funcionários, despesas e indicadores financeiros.

### Dentro do escopo

- Gestão de usuários e login.
- Gestão de clientes.
- Gestão de produtos.
- Controle de estoque.
- Registro de vendas.
- Gestão de funcionários.
- Gestão de despesas.
- Apuração de receita, despesas, margem e lucro.
- Dashboards e relatórios gerenciais.
- Configurações de empresa e perfil.

### Fora do escopo imediato

- Emissão fiscal oficial.
- Integração bancária real.
- Gateway de pagamento real.
- Controle contábil completo.
- BI avançado com data warehouse.

## 3. Classes de usuários

| Usuário | Descrição | Permissões esperadas |
|---|---|---|
| Administrador | Dono da empresa ou usuário master | Acessa tudo, gerencia usuários, configura empresa |
| Gestor | Responsável operacional/financeiro | Gerencia cadastros, vendas, despesas e relatórios |
| Operador | Pessoa de atendimento/venda | Registra vendas e consulta cadastros conforme permissão |
| Sistema | Rotinas automáticas | Calcula estoque, custos, KPIs, alertas e auditoria |

## 4. Requisitos Funcionais

| ID | Requisito Funcional | Prioridade | Critério de aceite |
|---|---|---:|---|
| RF-001 | O sistema deve permitir login com email e senha usando autenticação no backend. | Alta | Dado usuário ativo, ao informar credenciais válidas, a API retorna JWT e dados básicos do usuário. |
| RF-002 | O sistema deve permitir cadastro de empresa e usuário administrador. | Alta | Ao concluir cadastro, empresa e usuário admin são persistidos no banco e senha fica armazenada como hash. |
| RF-003 | O sistema deve permitir cadastrar, editar, listar e inativar clientes. | Alta | Clientes ficam associados à empresa logada e não aparecem para outra empresa. |
| RF-004 | O sistema deve permitir cadastrar, editar, listar, filtrar e inativar produtos. | Alta | Produto possui nome, categoria, unidade, custo, preço, estoque e status. |
| RF-005 | O sistema deve controlar estoque por movimentações de entrada, saída e ajuste. | Alta | Uma venda concluída gera saída de estoque; uma reposição gera entrada. |
| RF-006 | O sistema deve bloquear ou alertar venda quando o estoque disponível for insuficiente. | Alta | Ao registrar item com quantidade maior que estoque disponível, o sistema retorna erro ou exige permissão especial. |
| RF-007 | O sistema deve registrar venda com cliente, itens, quantidades, preços, canal, pagamento e status. | Alta | Venda gera cabeçalho e itens; total e custo são calculados automaticamente. |
| RF-008 | O sistema deve manter histórico de status do pedido/venda. | Média | Toda mudança de status gera registro com data, usuário e status anterior/novo. |
| RF-009 | O sistema deve permitir cadastro de funcionários CLT/PJ com salário, documento, status e benefícios. | Média | Funcionário ativo alimenta cálculo de folha/despesa. |
| RF-010 | O sistema deve permitir lançamento de despesas manuais. | Alta | Despesa manual possui categoria, descrição, valor, competência e usuário responsável. |
| RF-011 | O sistema deve calcular despesas automáticas de folha e custo de mercadorias vendidas. | Alta | Dashboard soma salários ativos e custo dos itens vendidos no período. |
| RF-012 | O sistema deve calcular receita bruta, despesa total, lucro líquido e margem. | Alta | Indicadores batem com vendas e despesas persistidas no banco para o período selecionado. |
| RF-013 | O sistema deve exibir dashboards por período. | Média | Usuário seleciona 7 dias, 30 dias, 90 dias ou 1 ano e vê KPIs atualizados. |
| RF-014 | O sistema deve exibir ranking de top itens. | Média | Ranking ordena produtos por quantidade vendida e faturamento. |
| RF-015 | O sistema deve permitir exportação de relatórios. | Baixa | Usuário exporta CSV/PDF dos dados filtrados. |
| RF-016 | O sistema deve permitir edição de perfil do usuário. | Média | Nome, telefone e senha podem ser atualizados com validação. |
| RF-017 | O sistema deve registrar eventos de auditoria. | Média | Ações críticas geram trilha com usuário, entidade, operação e data. |
| RF-018 | O sistema deve substituir persistência em `localStorage` por API e banco SQL. | Alta | Ao recarregar ou trocar de dispositivo, dados continuam disponíveis após login. |

## 5. Requisitos Não-Funcionais

| ID | Requisito Não-Funcional | Categoria | Prioridade | Critério de aceite |
|---|---|---|---:|---|
| RNF-001 | Senhas devem ser armazenadas somente com hash forte. | Segurança | Alta | Nenhuma senha em texto puro aparece no banco, localStorage ou logs. |
| RNF-002 | Rotas privadas devem exigir JWT válido. | Segurança | Alta | Requisições sem token recebem HTTP 401. |
| RNF-003 | Dados devem ser isolados por `empresa_id`. | Segurança/Multiempresa | Alta | Usuário de uma empresa não consulta dados de outra. |
| RNF-004 | O arquivo `.env` não deve ser versionado. | Segurança | Alta | Repositório contém `.env.example` e `.env` está no `.gitignore`. |
| RNF-005 | Operações financeiras devem usar `DECIMAL`, não ponto flutuante. | Confiabilidade | Alta | Valores monetários usam `DECIMAL(12,2)` ou equivalente. |
| RNF-006 | O sistema deve responder consultas operacionais em até 2 segundos em carga normal. | Performance | Média | Listagens paginadas respondem dentro do limite com índices adequados. |
| RNF-007 | O sistema deve ter backup diário do banco. | Recuperação | Alta | Política de backup documentada e testada em ambiente de homologação. |
| RNF-008 | O projeto deve possuir migrations versionadas. | Manutenibilidade | Alta | Banco pode ser recriado com scripts versionados. |
| RNF-009 | O frontend deve consumir apenas a API para dados de negócio. | Arquitetura | Alta | Não há gravação de clientes/produtos/vendas em `localStorage`. |
| RNF-010 | O código deve estar sem marcadores de conflito Git. | Qualidade | Alta | Busca por `<<<<<<<` e `>>>>>>>` retorna zero ocorrências. |
| RNF-011 | O sistema deve registrar logs sem dados sensíveis. | Observabilidade | Média | Logs não expõem senha, token ou segredo. |
| RNF-012 | O sistema deve ser responsivo para desktop e mobile. | Usabilidade | Média | Telas principais funcionam em larguras comuns de celular e desktop. |
| RNF-013 | Cálculos financeiros devem ser rastreáveis. | Auditoria | Média | Indicadores apontam origem: vendas, itens, despesas e folha. |

## 6. Regras de negócio

| ID | Regra | Descrição |
|---|---|---|
| RN-001 | Venda concluída baixa estoque | Ao concluir uma venda, cada item vendido gera movimentação de saída. |
| RN-002 | Produto inativo não deve ser vendido | Produto inativo pode aparecer em histórico, mas não em seleção de nova venda. |
| RN-003 | Cliente inativo não deve receber nova venda | Histórico permanece, mas nova venda deve exigir cliente ativo ou venda avulsa. |
| RN-004 | Custo da venda deve ser congelado | O custo usado no item de venda deve ser copiado no momento da venda para preservar histórico. |
| RN-005 | Despesa de folha depende de funcionário ativo | Funcionário ativo com salário informado compõe a despesa de folha do período. |
| RN-006 | CMV vem dos itens vendidos | Custo de mercadoria vendida deve vir de `quantidade * custo_unitario` de cada item. |
| RN-007 | Lucro líquido é receita menos despesas | Lucro líquido = total de vendas concluídas - CMV - folha - despesas manuais. |
| RN-008 | Multiempresa é obrigatório | Todo registro operacional pertence a uma empresa. |
| RN-009 | Exclusão física deve ser evitada em entidades históricas | Clientes, produtos e funcionários devem ser inativados quando já tiverem vínculo histórico. |
| RN-010 | Auditoria em ações críticas | Login, criação, edição, inativação, venda e ajuste de estoque devem gerar trilha. |

## 7. Interfaces externas

| Interface | Estado atual | Recomendação |
|---|---|---|
| Navegador | Telas HTML/JS estáticas | Manter UI, mas trocar `localStorage` por chamadas `fetch` à API |
| API | Apenas `/auth` | Expandir API por domínio |
| Banco | MySQL previsto | Criar schema e migrations |
| Chart.js | Usado em relatórios | Alimentar gráficos com endpoints agregados |
| Exportação | Botões visuais | Implementar CSV inicialmente, PDF depois |

## 8. Riscos de requisito

| Risco | Impacto | Mitigação |
|---|---|---|
| Regras financeiras espalhadas no frontend | Alto | Centralizar cálculo no backend |
| Dados simulados confundirem validação real | Médio | Separar claramente modo demo e modo produção |
| Conflitos Git publicados | Alto | Resolver antes de refatorar |
| Ausência de migrations | Alto | Criar `database/schema-gennus.sql` e migrations incrementais |
| Login duplicado frontend/backend | Alto | Remover login local e manter apenas backend |

## 9. Critérios de pronto do módulo ERP mínimo

Um MVP técnico aceitável deve cumprir:

1. Login backend com JWT.
2. Banco relacional criado por script.
3. CRUD real de clientes, produtos, funcionários e despesas.
4. Registro de venda real com itens.
5. Baixa de estoque transacional.
6. Dashboard calculado a partir do banco.
7. Nenhum dado operacional gravado em `localStorage`, exceto token/sessão com controle adequado.
8. Nenhum marcador de conflito Git no repositório.

