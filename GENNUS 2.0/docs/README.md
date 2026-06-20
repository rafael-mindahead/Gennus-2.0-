# Documentação Arquitetural — ERP GENNUS 2.0

Este pacote contém documentação técnica pronta para colocar no repositório do projeto.

## Ordem recomendada de leitura

1. [`00-inventario-tecnico.md`](00-inventario-tecnico.md) — mostra o que existe hoje no projeto.
2. [`01-engenharia-requisitos.md`](01-engenharia-requisitos.md) — lista requisitos funcionais, não-funcionais e regras de negócio.
3. [`02-bpmn-processos.md`](02-bpmn-processos.md) — descreve os fluxos de negócio em estilo BPMN textual.
4. [`03-arquitetura-banco-dados.md`](03-arquitetura-banco-dados.md) — propõe o modelo relacional.
5. [`04-matriz-rastreabilidade.md`](04-matriz-rastreabilidade.md) — conecta requisitos, processos, tabelas e telas.
6. [`05-roadmap-tecnico.md`](05-roadmap-tecnico.md) — sugere a ordem de evolução técnica.
7. [`06-dicionario-linguagem-humana.md`](06-dicionario-linguagem-humana.md) — traduz termos técnicos com analogias.

## Arquivo SQL

O schema inicial está em:

- [`../database/schema-gennus.sql`](../database/schema-gennus.sql)

## Resumo executivo

O projeto GENNUS 2.0 já tem boa cobertura visual de módulos ERP, mas ainda depende de dados locais/simulados. A recomendação central é migrar dados de negócio para MySQL, expor regras por API backend, proteger rotas com JWT e manter todas as entidades operacionais vinculadas a `empresa_id`.

## Próximo passo recomendado

Antes de implementar novas telas, resolva conflitos Git e remova dados sensíveis do repositório. Depois, aplique o schema SQL e comece a migração tela por tela, iniciando por autenticação, clientes e produtos.
