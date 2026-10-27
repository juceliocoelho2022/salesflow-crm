@IsTest
private class SalesFlowControllerTest {
    private static List<String> availableStages() {
        List<String> values = new List<String>();
        for (Schema.PicklistEntry entry : Opportunity.StageName.getDescribe().getPicklistValues()) {
            if (entry.isActive()) values.add(entry.getValue());
        }
        return values;
    }

    @TestSetup
    static void setupRecords() {
        Account account = new Account(Name = 'SalesFlow Teste LTDA', Phone = '11999999999');
        insert account;
        Contact contact = new Contact(LastName = 'Contato de Teste', AccountId = account.Id);
        insert contact;
        String stage = availableStages()[0];
        insert new Opportunity(
            Name = 'Licenças de software', AccountId = account.Id, StageName = stage,
            CloseDate = Date.today().addDays(21), Amount = 5000
        );
        insert new Task(Subject = 'Ligar para cliente', ActivityDate = Date.today().addDays(1),
                        Status = 'Not Started', Priority = 'Normal');
    }

    @IsTest
    static void loadsDashboardFromRealRecords() {
        Test.startTest();
        Map<String, Object> data = (Map<String, Object>) JSON.deserializeUntyped(
            SalesFlowController.getDashboard());
        Test.stopTest();
        System.assertEquals(1, data.get('accountsCount'), 'Conta não contabilizada');
        System.assertEquals(1, data.get('contactsCount'), 'Contato não contabilizado');
        System.assertEquals(1, data.get('opportunitiesCount'), 'Oportunidade não contabilizada');
        List<Object> opportunities = (List<Object>) data.get('opportunities');
        List<Object> tasks = (List<Object>) data.get('tasks');
        List<Object> stages = (List<Object>) data.get('stages');
        System.assertEquals(1, opportunities.size());
        Map<String, Object> first = (Map<String, Object>) opportunities[0];
        System.assertEquals('SalesFlow Teste LTDA', first.get('accountName'));
        System.assertEquals(1, tasks.size());
        System.assertEquals(150, data.get('boardLimit'));
        System.assert(!stages.isEmpty());
    }

    @IsTest
    static void allowsStageUpdateForValidStages() {
        Opportunity record = [SELECT Id FROM Opportunity LIMIT 1];
        List<String> stages = availableStages();
        Test.startTest();
        SalesFlowController.updateOpportunityStage(record.Id, stages[stages.size() - 1]);
        Test.stopTest();
        Opportunity updated = [SELECT StageName FROM Opportunity WHERE Id = :record.Id LIMIT 1];
        System.assertEquals(stages[stages.size() - 1], updated.StageName);
    }

    @IsTest
    static void blocksInvalidStage() {
        Opportunity record = [SELECT Id FROM Opportunity LIMIT 1];
        try {
            SalesFlowController.updateOpportunityStage(record.Id, 'ETAPA_INEXISTENTE');
            System.assert(false, 'Era esperado erro para etapa inválida');
        } catch (AuraHandledException expected) {
            System.assert(true);
        }
    }

    @IsTest
    static void blocksBlankStage() {
        try {
            SalesFlowController.updateOpportunityStage(null, null);
            System.assert(false, 'Era esperado erro para argumentos ausentes');
        } catch (AuraHandledException expected) {
            System.assert(true);
        }
    }
}
