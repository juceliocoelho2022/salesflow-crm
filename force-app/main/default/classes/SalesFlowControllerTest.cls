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
        List<TaskStatus> openStatuses = [
            SELECT ApiName FROM TaskStatus WHERE IsClosed = false
            ORDER BY IsDefault DESC, SortOrder ASC LIMIT 1
        ];
        System.assert(!openStatuses.isEmpty(), 'Organização sem status aberto de tarefa');
        insert new Task(Subject = 'Ligar para cliente', ActivityDate = Date.today().addDays(1),
                        Status = openStatuses[0].ApiName);
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
        List<Object> contacts = (List<Object>) data.get('contacts');
        System.assertEquals(1, contacts.size(), 'Contato não retornado pelo dashboard');
        System.assertEquals(1, tasks.size());
        System.assertEquals(150, data.get('boardLimit'));
        System.assert(!stages.isEmpty());
    }

    @IsTest
    static void searchesOpportunitiesOnServer() {
        Test.startTest();
        Map<String, Object> found = (Map<String, Object>) JSON.deserializeUntyped(
            SalesFlowController.searchOpportunities('Licenças', null, 1));
        Map<String, Object> missing = (Map<String, Object>) JSON.deserializeUntyped(
            SalesFlowController.searchOpportunities('Nome que não existe 999', null, 1));
        Test.stopTest();
        System.assertEquals(1, found.get('totalCount'));
        System.assertEquals(1, ((List<Object>)found.get('records')).size());
        System.assertEquals(0, missing.get('totalCount'));
        System.assertEquals(0, ((List<Object>)missing.get('records')).size());
    }

    @IsTest
    static void searchesWithStageAndCompanyName() {
        String stage = availableStages()[0];
        Test.startTest();
        Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(
            SalesFlowController.searchOpportunities('SalesFlow Teste', stage, 1));
        Test.stopTest();
        System.assertEquals(1, result.get('totalCount'));
    }

    @IsTest
    static void rejectsInvalidStageFilter() {
        try {
            SalesFlowController.searchOpportunities('', 'STAGE_XXXXX', 1);
            System.assert(false, 'Filtro inválido deveria falhar');
        } catch (AuraHandledException expected) {
            System.assert(true);
        }
    }

    @IsTest
    static void rejectsPageOutsideOffsetLimit() {
        try {
            SalesFlowController.searchOpportunities('', null, 102);
            System.assert(false, 'Limite de OFFSET deveria ser respeitado');
        } catch (AuraHandledException expected) {
            System.assert(true);
        }
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
    static void completesTaskUsingOrgStatus() {
        Task taskToClose = [SELECT Id FROM Task WHERE IsClosed = false LIMIT 1];
        Test.startTest();
        SalesFlowController.completeTask(taskToClose.Id);
        Test.stopTest();
        Task completed = [SELECT IsClosed FROM Task WHERE Id = :taskToClose.Id LIMIT 1];
        System.assertEquals(true, completed.IsClosed, 'A tarefa deveria estar concluída');
    }

    @IsTest
    static void rejectsTaskWithoutId() {
        try {
            SalesFlowController.completeTask(null);
            System.assert(false, 'Era esperado erro para tarefa ausente');
        } catch (AuraHandledException expected) {
            System.assert(true);
        }
    }

    /**
     * The service must translate a USER_MODE DML failure into a controlled
     * Lightning error. A deleted test record reliably exercises that branch
     * without changing real organization data.
     */
    @IsTest
    static void rejectsCompletionOfDeletedTask() {
        Task record = [SELECT Id FROM Task LIMIT 1];
        delete record;
        Boolean rejected = false;

        Test.startTest();
        try {
            SalesFlowController.completeTask(record.Id);
        } catch (AuraHandledException expected) {
            rejected = true;
        }
        Test.stopTest();

        System.assert(rejected, 'Concluir tarefa excluída deve retornar erro controlado');
    }

    @IsTest
    static void rejectsStageChangeOfDeletedOpportunity() {
        Opportunity record = [SELECT Id FROM Opportunity LIMIT 1];
        delete record;
        String validStage = availableStages()[0];
        Boolean rejected = false;

        Test.startTest();
        try {
            SalesFlowController.updateOpportunityStage(record.Id, validStage);
        } catch (AuraHandledException expected) {
            rejected = true;
        }
        Test.stopTest();

        System.assert(rejected, 'Alterar oportunidade excluída deve retornar erro controlado');
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
