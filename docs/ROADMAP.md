# Roadmap de evolução — SalesFlow CRM

## v0.1.0 — MVP Salesforce (presente)

- [x] Estrutura Salesforce DX
- [x] Dashboard LWC e visualização do funil
- [x] KPIs em Apex/USER_MODE
- [x] Visão de clientes, oportunidades e tarefas
- [x] Atualização de etapa e formulário de oportunidade
- [x] Testes Apex escritos
- [x] Prévia HTML navegável e CI estático
- [ ] Deploy executado numa org real
- [ ] Testes Apex executados numa org real
- [ ] Captura de telas da aplicação instalada

## v0.2.0 — CRM operacional

- [ ] Relacionar contatos e contas com navegação aprimorada
- [ ] Filtros server-side e paginação de oportunidades
- [ ] Busca server-side e ordenação
- [ ] Atualização/criação de tarefas com status validado
- [ ] Dashboard com métricas por período e métricas multicurrency
- [ ] Testes de permissão e sem dados

## v0.3.0 — Arquitetura enterprise

- [ ] Camadas Selector, Service e Controller e DTOs próprias
- [ ] Permissões granularizadas por perfil de negócio
- [ ] Testes Jest LWC, Apex e validação em scratch org
- [ ] CI de validação Salesforce autenticada por mecanismo seguro
- [ ] Tratamento de limites e erros com telemetria

## v0.4.0 — Integração Java / Spring Boot

- [ ] API Java 21 Spring Boot com contrato OpenAPI
- [ ] External Client App + OAuth 2.0
- [ ] Sincronização de clientes e oportunidades com idempotência
- [ ] Tratamento de retry, rate limiting e dead-letter
- [ ] Containers para infraestrutura auxiliar quando necessário

## v1.0.0 — Demonstração enterprise

- [ ] Painel de métricas com avaliação de performance
- [ ] Testes E2E e de segurança
- [ ] Documentação de arquitetura e de decisões (ADRs)
- [ ] Deploy e demonstração gravada do Salesforce real
