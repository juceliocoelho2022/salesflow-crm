/**
 * @description SalesFlow CRM read model + permitted opportunity stage transitions.
 * Uses standard Salesforce objects: Account, Contact, Opportunity, Task.
 * All queries and DML execute in USER_MODE (CRUD, FLS and sharing).
 * The opportunity board shows at most 150 recently modified records while KPIs
 * are calculated separately over all records visible to the current user.
 */
public with sharing class SalesFlowController {
    private static final Integer OPPORTUNITY_LIMIT = 150;
    private static final Integer ACCOUNT_LIMIT = 30;
    private static final Integer TASK_LIMIT = 30;

    @AuraEnabled(cacheable=true)
    public static String getDashboard() {
        DashboardData data = new DashboardData();
        data.accountsCount = [SELECT COUNT() FROM Account WITH USER_MODE];
        data.contactsCount = [SELECT COUNT() FROM Contact WITH USER_MODE];
        data.opportunitiesCount = [SELECT COUNT() FROM Opportunity WITH USER_MODE];
        data.openPipeline = calculateAmount(false);
        data.wonRevenue = calculateAmount(true);
        data.boardLimit = OPPORTUNITY_LIMIT;

        Map<String, StageData> summariesByStage = new Map<String, StageData>();
        for (Schema.PicklistEntry entry : Opportunity.StageName.getDescribe().getPicklistValues()) {
            if (entry.isActive()) {
                StageData stage = new StageData();
                stage.value = entry.getValue();
                stage.label = entry.getLabel();
                stage.count = 0;
                stage.totalAmount = 0;
                data.stages.add(stage);
                summariesByStage.put(stage.value, stage);
            }
        }

        for (AggregateResult result : [
            SELECT StageName stageValue, COUNT(Id) recordCount, SUM(Amount) amountSum
            FROM Opportunity WITH USER_MODE GROUP BY StageName
        ]) {
            String value = (String) result.get('stageValue');
            if (summariesByStage.containsKey(value)) {
                StageData stage = summariesByStage.get(value);
                stage.count = (Integer) result.get('recordCount');
                Decimal amount = (Decimal) result.get('amountSum');
                stage.totalAmount = amount == null ? 0 : amount;
            }
        }

        for (Opportunity record : [
            SELECT Id, Name, StageName, Amount, CloseDate, IsClosed, IsWon,
                   AccountId, Account.Name
            FROM Opportunity WITH USER_MODE
            ORDER BY LastModifiedDate DESC LIMIT :OPPORTUNITY_LIMIT
        ]) {
            OpportunityData item = new OpportunityData();
            item.id = record.Id;
            item.name = record.Name;
            item.stage = record.StageName;
            item.amount = record.Amount == null ? 0 : record.Amount;
            item.closeDate = record.CloseDate;
            item.accountName = record.Account == null ? 'Sem cliente' : record.Account.Name;
            item.accountId = record.AccountId;
            item.closed = record.IsClosed;
            item.won = record.IsWon;
            data.opportunities.add(item);
        }

        for (Account record : [
            SELECT Id, Name, Industry, Phone
            FROM Account WITH USER_MODE ORDER BY LastModifiedDate DESC LIMIT :ACCOUNT_LIMIT
        ]) {
            AccountData item = new AccountData();
            item.id = record.Id;
            item.name = record.Name;
            item.industry = record.Industry;
            item.phone = record.Phone;
            data.accounts.add(item);
        }

        for (Task record : [
            SELECT Id, Subject, ActivityDate, Status, IsClosed
            FROM Task WHERE IsClosed = false WITH USER_MODE
            ORDER BY ActivityDate ASC NULLS LAST LIMIT :TASK_LIMIT
        ]) {
            TaskData item = new TaskData();
            item.id = record.Id;
            item.subject = record.Subject;
            item.dueDate = record.ActivityDate;
            item.status = record.Status;
            data.tasks.add(item);
        }
        return JSON.serialize(data);
    }

    private static Decimal calculateAmount(Boolean wonOnly) {
        AggregateResult[] results;
        if (wonOnly) {
            results = [SELECT SUM(Amount) total FROM Opportunity
                       WHERE IsWon = true WITH USER_MODE];
        } else {
            results = [SELECT SUM(Amount) total FROM Opportunity
                       WHERE IsClosed = false WITH USER_MODE];
        }
        if (results.isEmpty() || results[0].get('total') == null) return 0;
        return (Decimal) results[0].get('total');
    }

    @AuraEnabled
    public static void updateOpportunityStage(Id opportunityId, String newStage) {
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
        if (!allowed) throw new AuraHandledException('Etapa inválida ou indisponível.');
        Opportunity record = new Opportunity(Id = opportunityId, StageName = newStage);
        try {
            update as user record;
        } catch (DmlException error) {
            throw new AuraHandledException('Não foi possível alterar a etapa. Verifique suas permissões e as regras da oportunidade.');
        }
    }

    public class DashboardData {
        @AuraEnabled public Integer accountsCount { get; set; }
        @AuraEnabled public Integer contactsCount { get; set; }
        @AuraEnabled public Integer opportunitiesCount { get; set; }
        @AuraEnabled public Decimal openPipeline { get; set; }
        @AuraEnabled public Decimal wonRevenue { get; set; }
        @AuraEnabled public Integer boardLimit { get; set; }
        @AuraEnabled public List<StageData> stages { get; set; }
        @AuraEnabled public List<OpportunityData> opportunities { get; set; }
        @AuraEnabled public List<AccountData> accounts { get; set; }
        @AuraEnabled public List<TaskData> tasks { get; set; }
        public DashboardData() {
            stages = new List<StageData>();
            opportunities = new List<OpportunityData>();
            accounts = new List<AccountData>();
            tasks = new List<TaskData>();
        }
    }
    public class StageData {
        @AuraEnabled public String value { get; set; }
        @AuraEnabled public String label { get; set; }
        @AuraEnabled public Integer count { get; set; }
        @AuraEnabled public Decimal totalAmount { get; set; }
    }
    public class OpportunityData {
        @AuraEnabled public Id id { get; set; }
        @AuraEnabled public String name { get; set; }
        @AuraEnabled public Id accountId { get; set; }
        @AuraEnabled public String accountName { get; set; }
        @AuraEnabled public String stage { get; set; }
        @AuraEnabled public Decimal amount { get; set; }
        @AuraEnabled public Date closeDate { get; set; }
        @AuraEnabled public Boolean closed { get; set; }
        @AuraEnabled public Boolean won { get; set; }
    }
    public class AccountData {
        @AuraEnabled public Id id { get; set; }
        @AuraEnabled public String name { get; set; }
        @AuraEnabled public String industry { get; set; }
        @AuraEnabled public String phone { get; set; }
    }
    public class TaskData {
        @AuraEnabled public Id id { get; set; }
        @AuraEnabled public String subject { get; set; }
        @AuraEnabled public Date dueDate { get; set; }
        @AuraEnabled public String status { get; set; }
    }
}
