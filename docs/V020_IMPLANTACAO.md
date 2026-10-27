# SalesFlow CRM v0.2.0 — Implantação e verificação

## Estado de qualidade

- Verificação de estrutura, metadados XML e JavaScript: realizada localmente.
- Prévia HTML: demonstração com dados fictícios no navegador; não depende do Salesforce.
- Validação de compilação Apex, LWC e testes dentro da organização: **pendente**.

## Antes do deploy

1. No IntelliJ/PowerShell, rode `git status` e confira o diff da feature branch.
2. Verifique `sf org list` e o alias `salesflow-dev`. Confirme que é a org de desenvolvimento, não produção.
3. Execute a validação local: `python scripts/validate.py`.
4. Como a org do projeto não tem source tracking, não use `sf project deploy preview`.

## Validação de metadados (sem gravar)

```powershell
sf project deploy start --dry-run --source-dir force-app --target-org salesflow-dev --test-level RunSpecifiedTests --tests SalesFlowControllerTest --wait 20
```

Se o comando reportar erros, não faça deploy definitivo. Corrija as linhas apontadas e repita a validação.

## Deploy e concessão mínima de acesso

```powershell
sf project deploy start --source-dir force-app --target-org salesflow-dev --wait 20
sf org assign permset --name SalesFlow_User --target-org salesflow-dev
sf apex run test --tests SalesFlowControllerTest --target-org salesflow-dev --code-coverage --result-format human --wait 20
```

A `SalesFlow_User` permite acessar a classe Apex; não garante permissões de objeto/campo para Account, Contact, Opportunity e Task.

## Checklist funcional

- [ ] Criar página no Lightning App Builder e incluir `salesFlowDashboard`.
- [ ] Dashboard carrega com conta habilitada para leitura nos quatro objetos.
- [ ] Contatos aparecem na lista; busca e navegação funcionam.
- [ ] Filtro por etapa pesquisa todas as oportunidades visíveis ao usuário no Salesforce (não somente os cartões recentes).
- [ ] Paginação no servidor avança e retrocede em lotes de 20; filtros e pesquisa reiniciam na página 1.
- [ ] Uma tarefa pendente torna-se concluída; confirmar no Salesforce.
- [ ] Nenhum erro de console ou de FLS/permissão.

## Publicar resultado

Registre logs sanitizados, print da página Salesforce instalada e resultado dos testes em uma issue/PR. Não publique refresh tokens, chaves ou dados reais de clientes.

## Atenção aos limites de negócio

- Apenas a listagem de **Oportunidades** tem consulta e paginação no servidor. O kanban mantém 150 itens recentes; contatos e contas 30 cada.
- `OFFSET` permite até 2.000, portanto o cliente limita a 101 páginas com 20 registros; refine a busca para chegar a itens anteriores.
- `WITH USER_MODE` aplica regras de acesso por usuário; sem FLS/CRUD adequados a consulta pode falhar, não ignorar as permissões.
- O teste Apex e o deploy dependem da sua organização `salesflow-dev`, não rodam nesta prévia.
