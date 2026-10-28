/**
 * @description Opportunity business actions for SalesFlow.
 * Validates active stages and performs DML in USER_MODE.
 * Not exposed directly to Lightning; call via SalesFlowController.
 */
public with sharing class SalesFlowOpportunityService {
    public static void updateStage(Id opportunityId, String newStage) {
        if (opportunityId == null || String.isBlank(newStage)) {
            throw new AuraHandledException('Oportunidade e etapa são obrigatórias.');
        }

        Boolean allowed = false;
        for (Schema.PicklistEntry entry : Opportunity.StageName.getDescribe().getPicklistValues()) {
            if (entry.isActive() && entry.getValue() == newStage) {
                allowed = true;
                break;
            }
        }
        if (!allowed) {
            throw new AuraHandledException('Etapa inválida ou indisponível.');
        }

        Opportunity record = new Opportunity(Id = opportunityId, StageName = newStage);
        try {
            update as user record;
        } catch (DmlException error) {
            throw new AuraHandledException(
                'Não foi possível alterar a etapa. Verifique suas permissões e as regras da oportunidade.'
            );
        }
    }
}
