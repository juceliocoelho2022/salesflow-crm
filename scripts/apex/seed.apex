// EXECUTE SOMENTE EM Developer Edition ou scratch org DE TESTES.
// Popula 6 contas e oportunidades de exemplo uma única vez.
// Execução: sf apex run --file scripts/apex/seed.apex --target-org salesflow-dev
// Reexecução não duplica os registros enquanto a conta âncora existir.
Integer existing = [SELECT COUNT() FROM Account WHERE Name = 'SF Demo - TechCorp'];
if (existing > 0) {
    System.debug('Dados de demonstração já existem. Seed ignorado.');
} else {
    List<Account> accounts = new List<Account>{
        new Account(Name='SF Demo - TechCorp', Industry='Technology'),
        new Account(Name='SF Demo - Banco Horizonte', Industry='Banking'),
        new Account(Name='SF Demo - Grupo Alfa', Industry='Consulting'),
        new Account(Name='SF Demo - InovaTech', Industry='Technology'),
        new Account(Name='SF Demo - AgroSoluções', Industry='Agriculture'),
        new Account(Name='SF Demo - EduTech', Industry='Education')
    };
    insert accounts;
    insert new List<Contact>{
        new Contact(FirstName='Ana',LastName='Silva',AccountId=accounts[0].Id),
        new Contact(FirstName='Carlos',LastName='Santos',AccountId=accounts[1].Id)
    };
    List<String> availableStages = new List<String>();
    for (Schema.PicklistEntry stage : Opportunity.StageName.getDescribe().getPicklistValues()) {
        if (stage.isActive()) availableStages.add(stage.getValue());
    }
    System.assert(!availableStages.isEmpty(), 'Nenhuma etapa ativa em Opportunity.');
    List<Opportunity> opportunities = new List<Opportunity>();
    List<String> names = new List<String>{'Implantação CRM','Integração bancária','Portal corporativo','Plataforma cloud','Automação comercial','Analytics educacional'};
    List<Decimal> amounts = new List<Decimal>{80000,350000,280000,120000,170000,220000};
    for (Integer i = 0; i < names.size(); i++) {
        opportunities.add(new Opportunity(
            Name='SF Demo - ' + names[i], AccountId=accounts[i].Id,
            StageName=availableStages[Math.mod(i,availableStages.size())],
            CloseDate=Date.today().addDays((i+1)*7), Amount=amounts[i]
        ));
    }
    insert opportunities;
    // Status may vary in customized organizations; omit Task to keep seed portable.
    System.debug('SalesFlow seed criado: ' + accounts.size() + ' contas e ' + opportunities.size() + ' oportunidades.');
}
