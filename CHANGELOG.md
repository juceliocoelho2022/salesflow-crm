# Changelog

O projeto segue o padrão [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e planeja adotar [SemVer](https://semver.org/lang/pt-BR/).

## [Unreleased]

- Deploy e testes Apex em Salesforce real permanecem pendentes.

## [0.2.0] — 2026-10-27

### Adicionado
- Visão de contatos no componente LWC com busca, abertura e criação por ação padrão Salesforce.
- Lista de contatos retornados por Apex (até 30 registros recentes).
- Busca no servidor Salesforce por nome da oportunidade ou da conta com SOQL vinculado (`WITH USER_MODE`).
- Filtro de etapa no servidor e paginação SOQL de 20 registros por página (`LIMIT`/`OFFSET`).
- Conclusão de tarefas através de Apex no modo usuário com status fechado obtido dinamicamente da organização.
- Testes Apex adicionais: contatos, busca por oportunidade/cliente, filtros, limites de paginação, conclusão de tarefas e validação de argumentos.
- Prévia local com menu e cadastro de contatos, além de filtro por etapa na lista de oportunidades.

### Limitações
- Busca/paginação no servidor vale para a lista de oportunidades; o kanban continua limitado aos 150 registros recentes (o que reduz custo e volume de resposta).
- `OFFSET` Salesforce é limitado a 2.000 linhas. Para mais páginas, será preciso implementar paginação por cursor/keyset.
- Organização Salesforce real, testes Apex e deploy não foram validados por esta entrega.


### Documentação / engenharia
- Guia de GitHub, operação Salesforce, demo para recrutadores, contribuições e segurança.
- Templates de issues/PR, validação estrutural e verificação básica de arquivos sensíveis no CI.
- Scripts de publicação com validações prévias e fluxo de primeiro push.

## [0.1.0] — 2026-10-27

### Adicionado
- Salesforce DX com `SalesFlowController` e testes Apex escritos.
- Lightning Web Component do dashboard e funil comercial.
- Visão de contas, tarefas e oportunidades com objetos Salesforce padrão.
- Prévia independente em HTML/CSS/JavaScript com dados fictícios.
- Documentação de arquitetura, roadmap e mockup visual.

### Ainda pendente de comprovação
- Deploy efetivo numa org Salesforce, execução dos testes Apex e validação visual do LWC instalado.
