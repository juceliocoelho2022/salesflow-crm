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
- Service Layer validada por dry-run (`0Afbm00000lXzUgCAK`) e implantada na Developer Edition (`0Afbm00000lXxO2CAK`), com 12/12 testes Apex aprovados em ambas as execuções.

## Cobertura Apex — correção de regressão

Na validação inicial da refatoração (deploy `0Afbm00000lXzw6CAC`) os **10 testes passaram**, mas a implantação simulada falhou porque `SalesFlowTaskService` alcançou somente **63,636%** de cobertura, abaixo dos 75% exigidos por classe no modo `RunSpecifiedTests`.

A classe de testes agora contém **dois casos adicionais** para exercer o tratamento de `DmlException` via registros de teste excluídos:

- `rejectsCompletionOfDeletedTask`: serviço de tarefas deve traduzir falha DML para erro controlado.
- `rejectsStageChangeOfDeletedOpportunity`: serviço de oportunidades deve traduzir falha DML para erro controlado.

**Confirmado em 28/10/2026:** dry-run e deploy real finalizaram com `Status: Succeeded` e 12/12 testes aprovados. A cobertura exata por classe não aparece nos logs compartilhados; não atribuir percentuais não verificados.

## Atualizar no IntelliJ (sem ZIP)

```powershell
cd C:\Projetos\salesflow-crm
git status
git fetch origin
git switch --track origin/feature/salesflow-v0.3.0-service-layer
python scripts/validate.py
sf project deploy start --dry-run --source-dir force-app --target-org salesflow-dev --test-level RunSpecifiedTests --tests SalesFlowControllerTest --wait 20
```

Para futuras reimplantações, após `Status: Succeeded` e 12 testes aprovados, implantar **no ambiente de desenvolvimento**:

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

**Status em 28/10/2026:** mudanças implantadas com sucesso na Developer Edition, 12/12 testes Apex aprovados; testes funcionais da interface ainda pendentes. PR permanece aberto para revisão.
