# Operação no Salesforce — ambiente de desenvolvimento

## Pré-requisitos

- Salesforce CLI autenticado: `sf org list` deve listar `salesflow-dev`.
- Confirmar a **org de desenvolvimento** de destino e o usuário conectado.
- Permissões para Apex, LWC e os objetos padrão (`Account`, `Contact`, `Opportunity`, `Task`).

## Validação antes da instalação

A organização utilizada pode não oferecer Source Tracking. O comando `sf project deploy preview` pode mostrar `NonSourceTrackedOrgError` nesse caso: isso **não comprova erro no pacote**.

```powershell
sf org display --target-org salesflow-dev
sf project deploy start --dry-run --source-dir force-app --target-org salesflow-dev --test-level RunLocalTests --wait 20
```

Confirme a org de destino antes de comandos que alteram dados. Em caso de erro na validação, guarde apenas o texto do erro sem tokens nem IDs de sessão.

## Instalação após validação

```powershell
sf project deploy start --source-dir force-app --target-org salesflow-dev --wait 20
sf org assign permset --name SalesFlow_User --target-org salesflow-dev
sf apex run test --tests SalesFlowControllerTest --target-org salesflow-dev --result-format human --wait 20
```

`SalesFlow_User` concede **acesso à classe Apex**, não permissões irrestritas aos dados.

## Página Lightning

1. Salesforce → engrenagem → Setup → Lightning App Builder.
2. New → App Page → SalesFlow CRM.
3. Selecione layout de uma coluna e adicione **SalesFlow CRM Dashboard**.
4. Save, Activate e disponibilize a página na navegação da aplicação de estudo.
5. Verifique KPIs, funil e ações com dados fictícios na org de desenvolvimento.

## Dados de demonstração (opcional)

```powershell
sf apex run --file scripts/apex/seed.apex --target-org salesflow-dev
```

**Atenção**: esse comando grava dados reais na org, ainda que fictícios. Não execute em produção, sandbox compartilhada sem consentimento ou org que contenha dados de clientes.

## Evidências que devem ser registradas

- Resultado do deploy e testes, sem tokens ou identificadores sensíveis.
- Captura do App Builder e dashboard instalado.
- Cenário de criação e mudança de estágio persistida após recarregar a página.
- Restrições de acesso em contexto de permissões limitadas.
- Cobertura Apex verificada e reportada sem inventar números.

## Limitações conhecidas

- SOQL em `USER_MODE` pode exigir ajustes nas permissões de campos conforme a org.
- Estágios dependem da configuração de `Opportunity.StageName` da org.
- MVP exibe até 150 oportunidades recentes e não pagina.
- Valores monetários no LWC presumem BRL e não são adequados a multicurrency sem adaptação.
- Prévia HTML não autentica nem consome Salesforce.
