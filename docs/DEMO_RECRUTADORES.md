# Roteiro de demonstração técnica para recrutadores

**Duração sugerida:** 5 a 8 minutos. Use uma org de estudo, com dados fictícios, e compartilhe a tela sem mostrar credenciais.

## História de negócio

> Uma pequena equipe comercial precisa acompanhar clientes, oportunidades, funil, receita em aberto e tarefas numa única visão.

## Demonstração

1. **Contexto (30s):** apresente o README, a arquitetura e a finalidade do MVP.
2. **Dashboard (1min):** mostre KPIs de contas, contatos, oportunidades, pipeline e receita ganha.
3. **Oportunidades (1–2min):** cadastre uma oportunidade, mova uma etapa, atualize a página e confirme persistência no Salesforce.
4. **Apex + SOQL (1min):** abra `SalesFlowController.cls`; explique `WITH USER_MODE`, `with sharing` e a validação de estágio.
5. **Testes (1min):** execute `SalesFlowControllerTest` e informe **somente resultados reais**.
6. **Engenharia (1min):** mostre GitHub Actions, PRs, branches, documentação e decisões de segurança.
7. **Evolução (30s):** explique paginação, testes Jest LWC e integração Java 21 / Spring Boot via REST + OAuth.

## Perguntas que o projeto responde

- **Por que Apex?** Executar lógica de negócios junto à plataforma, respeitando limites de execução e contexto de segurança.
- **Por que LWC?** Componentes integrados ao Lightning e consumo de Apex.
- **Como garantir acesso?** Sharing, CRUD/FLS e modo usuário.
- **Como escalar?** Paginação, consultas seletivas, serviços desacoplados e integração assíncrona conforme necessidade.
- **Qual parte é apenas mock?** `preview/`, visualização independente com dados fictícios. Não chamar de backend Salesforce.

## Antes de gravar ou publicar screenshots

- [ ] Dashboard realmente instalado na org
- [ ] Testes Apex reais executados
- [ ] Nenhuma credencial, token ou dado pessoal na gravação
- [ ] Capturas claramente identificadas: mockup vs. tela real
- [ ] README com evidências e limitações atualizadas
