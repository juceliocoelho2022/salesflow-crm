# ADR-0001 — Utilizar objetos Salesforce padrão no MVP

**Status:** Aceita para v0.1.0  
**Data:** 2026-10-27

## Contexto

O objetivo inicial é comprovar Apex, LWC, SOQL e governança de metadados numa Developer Edition, com menor custo de configuração.

## Decisão

Utilizar `Account`, `Contact`, `Opportunity` e `Task`. Não criar objetos customizados nem armazenar dados comerciais em banco externo na v0.1.0.

## Consequências

- **Prós:** CRUD e páginas padrão disponíveis, início rápido, segurança nativa, menos metadados a manter.
- **Contras:** etapas e permissões dependem da org, uso limitado em equipes com necessidades específicas e pouca customização do modelo de domínio.
- **Mitigações:** tratamento explícito de permissões e estados da organização; futura camada de integração separada para Java/Spring Boot.
