# SalesFlow CRM v0.2.0 — notas de entrega

Esta versão evolui o MVP Salesforce DX com foco em CRM operacional e evidências para recrutadores.

### Mudanças
- Consulta Apex `searchOpportunities` com filtros por nome (oportunidade/conta), etapa e paginação no servidor, usando parâmetros SOQL e `WITH USER_MODE`.
- Tela LWC Oportunidades com pesquisa assíncrona, debounce, prevenção de resposta desatualizada, estados de carregamento/erro, paginação de 20 itens e aviso para o limite de OFFSET.
- Tela de contatos recentes, conclusão de tarefas pendentes e novos testes Apex.
- Prévia local com dados fictícios, contatos e filtro de etapa (sem conexão com o CRM real).

### Limites
- O painel Kanban continua limitado às 150 oportunidades recentes; KPIs são calculados separadamente.
- A paginação de Oportunidades está limitada pelo `OFFSET` do Salesforce (até 2.000); a próxima evolução pode adotar keyset pagination.
- Sem teste Apex/deploy concluído em uma org real até esta entrega. O CI apenas valida estrutura, XML e JavaScript da prévia.

### Passos para quem usa o IntelliJ

```powershell
cd C:\Projetos\salesflow-crm
python scripts/validate.py
sf org list
sf project deploy start --dry-run --source-dir force-app --target-org salesflow-dev --test-level RunSpecifiedTests --tests SalesFlowControllerTest --wait 20
# Somente depois de conferir a org e obter dry-run Succeeded:
sf project deploy start --source-dir force-app --target-org salesflow-dev --wait 20
sf org assign permset --name SalesFlow_User --target-org salesflow-dev
sf apex run test --tests SalesFlowControllerTest --target-org salesflow-dev --result-format human --code-coverage --wait 20
```

**Segurança:** mantenha tokens, senhas, autenticações e configurações `.sf/` fora do Git. Dados reais de clientes não devem aparecer em screenshots públicos.
