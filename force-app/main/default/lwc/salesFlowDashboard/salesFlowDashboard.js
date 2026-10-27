import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getDashboard from '@salesforce/apex/SalesFlowController.getDashboard';
import updateOpportunityStage from '@salesforce/apex/SalesFlowController.updateOpportunityStage';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const money = (value) => new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL', maximumFractionDigits: 0
}).format(value || 0);
const shortMoney = (value) => new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1
}).format(value || 0);
const asDate = (value) => value ? value.split('-').reverse().join('/') : 'Sem data';

export default class SalesFlowDashboard extends NavigationMixin(LightningElement) {
    dashboard;
    wiredResult;
    errorMessage;
    activeView = 'inicio';
    query = '';
    showForm = false;
    isSaving = false;

    @wire(getDashboard)
    loadDashboard(result) {
        this.wiredResult = result;
        if (result.data) {
            this.dashboard = JSON.parse(result.data);
            this.errorMessage = undefined;
        } else if (result.error) {
            this.errorMessage = result.error.body?.message || 'Falha ao carregar. Verifique o acesso aos objetos do Salesforce.';
        }
    }

    get isLoading() { return !this.dashboard && !this.errorMessage; }
    get isHome() { return this.activeView === 'inicio'; }
    get isAccounts() { return this.activeView === 'clientes'; }
    get isOpportunities() { return this.activeView === 'oportunidades'; }
    get isTasks() { return this.activeView === 'tarefas'; }
    get pageTitle() {
        return ({ inicio: 'Visão geral', clientes: 'Clientes', oportunidades: 'Oportunidades', tarefas: 'Tarefas' })[this.activeView];
    }
    get accountCount() { return this.dashboard?.accountsCount || 0; }
    get contactsCount() { return this.dashboard?.contactsCount || 0; }
    get opportunityCount() { return this.dashboard?.opportunitiesCount || 0; }
    get openPipeline() { return shortMoney(this.dashboard?.openPipeline); }
    get wonRevenue() { return shortMoney(this.dashboard?.wonRevenue); }
    get openTasksCount() { return this.dashboard?.tasks?.length || 0; }
    get hasOpportunities() { return this.filteredOpportunities.length > 0; }
    get hasAccounts() { return this.filteredAccounts.length > 0; }
    get hasTasks() { return this.dashboard?.tasks?.length > 0; }

    get filteredOpportunities() {
        const q = this.query.trim().toLocaleLowerCase('pt-BR');
        return (this.dashboard?.opportunities || []).filter((o) =>
            !q || `${o.name} ${o.accountName} ${o.stage}`.toLocaleLowerCase('pt-BR').includes(q));
    }
    get filteredAccounts() {
        const q = this.query.trim().toLocaleLowerCase('pt-BR');
        return (this.dashboard?.accounts || []).filter((a) =>
            !q || `${a.name} ${a.industry || ''}`.toLocaleLowerCase('pt-BR').includes(q));
    }
    get boardColumns() {
        const records = this.filteredOpportunities;
        return (this.dashboard?.stages || []).map((stage, index) => ({
            ...stage,
            key: stage.value,
            columnClass: `stage-col shade-${index % 5}`,
            formattedTotal: shortMoney(stage.totalAmount),
            cards: records.filter((o) => o.stage === stage.value).map((o) => ({
                ...o,
                formattedAmount: money(o.amount),
                formattedDate: asDate(o.closeDate),
                choices: (this.dashboard?.stages || [])
                    .filter((s) => s.value !== o.stage)
                    .map((s) => ({ value: s.value, label: s.label }))
            }))
        }));
    }
    get opportunityRows() {
        return this.filteredOpportunities.map((o) => ({
            ...o, formattedAmount: money(o.amount), formattedDate: asDate(o.closeDate)
        }));
    }
    get taskRows() {
        return (this.dashboard?.tasks || []).map((t) => ({
            ...t, formattedDate: asDate(t.dueDate)
        }));
    }
    get stageReport() {
        const stageList = (this.dashboard?.stages || []).filter((s) => s.count > 0);
        const max = Math.max(...stageList.map((s) => s.count), 1);
        return stageList.map((s) => ({
            ...s, formattedAmount: money(s.totalAmount),
            barStyle: `width: ${Math.max(4, Math.round((s.count / max) * 100))}%`
        }));
    }

    handleView(event) { this.activeView = event.currentTarget.dataset.view; }
    handleSearch(event) { this.query = event.target.value; }
    async handleRefresh() {
        if (this.wiredResult) {
            try { await refreshApex(this.wiredResult); }
            catch (e) { this.toast('Erro', e.body?.message || 'Não foi possível atualizar.', 'error'); }
        }
    }
    openOpportunityForm() { this.showForm = true; }
    closeOpportunityForm() { this.showForm = false; }
    handleCreated() {
        this.showForm = false;
        this.toast('Sucesso', 'Oportunidade criada com sucesso.', 'success');
        this.handleRefresh();
    }
    handleFormError(event) {
        this.toast('Falha ao salvar', event.detail?.message || 'Confira os campos e permissões.', 'error');
    }
    handleNewAccount() { this.openStandardObject('Account', 'new'); }
    handleNewTask() { this.openStandardObject('Task', 'new'); }
    handleRecord(event) {
        const recordId = event.currentTarget.dataset.id;
        const objectApiName = event.currentTarget.dataset.object;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage', attributes: { recordId, objectApiName, actionName: 'view' }
        });
    }
    openStandardObject(objectApiName, actionName) {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage', attributes: { objectApiName, actionName }
        });
    }
    async handleStageChange(event) {
        if (this.isSaving) return;
        const opportunityId = event.currentTarget.dataset.id;
        const newStage = event.detail.value;
        this.isSaving = true;
        try {
            await updateOpportunityStage({ opportunityId, newStage });
            await refreshApex(this.wiredResult);
            this.toast('Atualizado', 'Etapa da oportunidade alterada.', 'success');
        } catch (error) {
            this.toast('Não foi possível mover', error.body?.message || 'Erro ao atualizar etapa.', 'error');
        } finally {
            this.isSaving = false;
        }
    }
    toast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}
