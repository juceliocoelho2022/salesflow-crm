# SalesFlow CRM — v0.3.0: primeira etapa da arquitetura Enterprise

## Escopo desta entrega

Refatoração **incremental**, preservando contratos públicos Apex/LWC e o comportamento de negócio já validado na v0.2.0.

| Camada | Classe | Responsabilidade |
|---|---|---|
| UI | `salesFlowDashboard` (LWC) | Exibição e eventos do usuário |
| Controller (fachada) | `SalesFlowController` | Métodos `@AuraEnabled`; delegação para serviços |
| Service (novo) | `SalesFlowOpportunityService` | Validação de etapa e alteração de `Opportunity.StageName` |
| Service (novo) | `SalesFlowTaskService` | Consulta do status de conclusão e atualização de `Task` |
| Read model (legado, próxima etapa) | `SalesFlowController` | `getDashboard`, `searchOpportunities`, queries e DTOs |

A introdução de **Selector** e separação das consultas do Controller fica para a próxima entrega; não declarar a arquitetura como completamente segregada antes disso.

## Contratos preservados

- `SalesFlowController.updateOpportunityStage(Id opportunityId, String newStage)` — a UI continua chamando o mesmo método.
- `SalesFlowController.completeTask(Id taskId)` — a UI continua chamando o mesmo método.
- Erros de entrada e mensagens de exceção existentes são mantidos.
- Os serviços usam `with sharing` e gravações `update as user`, respeitando permissões.
- Não foram criados triggers, objetos customizados, migrações ou novos dados. Não é necessária mudança no LWC.

## Evidências anteriores desta branch

- v0.2.0 implantada com sucesso: deploy `0Afbm00000lOgRFCA0` (10/10 testes Apex).
- Dark Mode LWC implantado com sucesso: deploy `0Afbm00000lYBIvCAO` (10/10 testes Apex).
- Esta refatoração de serviço **ainda exige dry-run e testes Apex na org após o pull**.

## Atualizar no IntelliJ (sem ZIP)

```powershell
cd C:\Projetos\salesflow-crm
git status
git fetch origin
git switch --track origin/feature/salesflow-v0.3.0-service-layer
python scripts/validate.py
sf project deploy start --dry-run --source-dir force-app --target-org salesflow-dev --test-level RunSpecifiedTests --tests SalesFlowControllerTest --wait 20
```

Somente se `Status: Succeeded` e 10/10 testes aprovados, implantar **no ambiente de desenvolvimento**:

```powershell
sf project deploy start --source-dir force-app --target-org salesflow-dev --test-level RunSpecifiedTests --tests SalesFlowControllerTest --wait 20
```

Validar pela interface: consulta da oportunidade TechCorp, mudança de etapa válida e tarefa concluída. Sem necessidade de alterar dados verdadeiros.

## Próximos incrementos

1. Extrair consultas `SELECT` para uma camada Selector, mantendo `WITH USER_MODE`.
2. Acrescentar testes de permissão e situações de concorrência/erros.
3. Criar auditoria de mudanças de etapas com governança de dados e acesso.
4. Evoluir automações de tarefas e indicadores.
5. Implementar integração Java / Spring Boot em versão futura.

**Status:** alterações registradas em branch para revisão. GitHub Actions estático não substitui compilação Apex na organização Salesforce.
