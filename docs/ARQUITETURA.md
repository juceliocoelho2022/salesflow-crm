# Arquitetura técnica — SalesFlow CRM v0.1.0

## Visão C4 simplificada

**Usuário interno da organização Salesforce** utiliza Lightning Experience → **salesFlowDashboard (LWC)** → **SalesFlowController (Apex)** → **Salesforce standard objects** (`Account`, `Contact`, `Opportunity`, `Task`).

A prévia `preview/` é um recurso de apresentação isolado, sem autenticação, API ou dados Salesforce.

## Camada de aplicação

| Responsabilidade | Implementação |
| --- | --- |
| Apresentação | LWC `salesFlowDashboard` com layout responsivo e HTML/SLDS |
| Agregação de leitura | `SalesFlowController.getDashboard()` serializa DTOs no JSON retornado ao LWC |
| Escrita controlada | `updateOpportunityStage()` valida etapa e escreve em `USER_MODE` |
| Criação de oportunidade | `lightning-record-edit-form`, padrão do Salesforce |
| Criação de clientes/tarefas | Navegação para ações padrão de criação |
| Persistência | SObjects padrão do Salesforce, sem base externa |
| Autorização | Salesforce profiles/permission sets, CRUD, FLS, sharing |

### Por que `getDashboard()` retorna JSON?

Apex não suporta de forma confiável classes internas como tipos de retorno expostos diretamente a métodos de LWC. A classe Apex serializa suas DTOs internas para uma `String` JSON, que é desserializada no JavaScript. Isso mantém o exemplo pequeno; uma versão posterior pode migrar para DTOs Apex públicas de nível superior.

## Regras de negócio existentes

- `Opportunity.StageName` deve existir entre os valores de picklist ativos. A UI oferece apenas etapas válidas definidas na organização.
- O valor do pipeline representa oportunidades **não encerradas** (`IsClosed = false`).
- A receita ganha representa oportunidades `IsWon = true`.
- Tarefas exibidas são as não concluídas (`IsClosed = false`).
- Indicadores são globais sobre todos os registros visíveis ao usuário; o quadro traz apenas 150 oportunidades recentes.

## Decisões e trade-offs

1. **Sem objetos personalizados:** simplifica deploy inicial, favorece aprendizagem de fundamentos.
2. **Sem paginação real:** limite de 150 evita sobrecarregar a UI, mas não é adequado a grandes carteiras comerciais.
3. **Sem camada de cache customizado:** `@AuraEnabled(cacheable=true)` com `refreshApex` após mutação é suficiente para MVP.
4. **Ações de criação padrão:** diminuem manutenção e respeitam regras da organização.
5. **Sem camada Java no MVP:** uma futura API de integração será adicionada separadamente, com External Client App, OAuth e identidade dedicada.

## Evolução necessária para grande escala

- Dividir classes em Selector, Service, DTO e Controller; testes de serviços isolados.
- Paginação por cursor/keyset e SOQL seletivo, em vez de carregar todos os registros.
- Operações em massa para mudanças de etapa, controle de concorrência, retries e idempotência.
- Suporte a múltiplas moedas e limites de API.
- Instrumentação de integrações: correlação, logs, falhas, limites transacionais e DLQ conforme arquitetura escolhida.
- Testes de integração e pipelines de validação contra uma scratch org ou sandbox, com credenciais seguras.

## Critérios de aceitação

- `sf project deploy start` conclui sem erros em Developer Edition compatível.
- Classe Apex testada com sucesso e cobertura documentada na organização.
- LWC aparece no Lightning App Builder e renderiza sem mensagens de erro.
- Oportunidade criada e etapa alterada persistem após atualização.
- Usuário sem permissões vê bloqueio de acesso, não dados indevidos.

**Nota:** critérios acima precisam de validação numa organização Salesforce; não devem ser tratados como concluídos apenas pela existência do código.
