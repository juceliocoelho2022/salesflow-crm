# Roadmap de evolução — SalesFlow CRM

## v0.1.0 — MVP Salesforce (base)

- [x] Estrutura Salesforce DX
- [x] Dashboard LWC e visualização do funil
- [x] KPIs em Apex/USER_MODE
- [x] Visão de clientes, oportunidades e tarefas
- [x] Atualização de etapa e formulário de oportunidade
- [x] Testes Apex escritos
- [x] Prévia HTML navegável e CI estático
- [x] Deploy executado em Salesforce Developer Edition (27/10/2026)
- [x] 10/10 testes Apex aprovados em deploy real
- [ ] Captura de telas da aplicação instalada

## v0.2.0 — CRM operacional (implantada e validada)

- [x] Consultar contatos relacionados a contas com busca e navegação no LWC
- [x] Filtro por etapa e paginação SOQL no servidor para listagem de oportunidades (20 por página)
- [x] Filtro de etapa, pesquisa por oportunidade/conta e paginação server-side SOQL
- [x] Busca server-side com ordenação por modificação e Id
- [x] Conclusão de tarefas com Apex e status fechado configurado pela org
- [ ] Paginação por cursor/keyset para superar o limite de OFFSET 2.000
- [ ] Atualização e criação de tarefas sem navegação para tela padrão
- [ ] Dashboard com métricas por período e métricas multicurrency
- [ ] Testes de permissão e sem dados

## v0.3.0 — Arquitetura enterprise (em desenvolvimento)

- [x] Dark Mode no LWC e prévia local, com CI aprovado e deploy Salesforce
- [x] Services de oportunidades e tarefas extraídos do Controller (código em branch; testes Salesforce pendentes)

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
