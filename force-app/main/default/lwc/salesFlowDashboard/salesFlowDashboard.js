import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getDashboard from '@salesforce/apex/SalesFlowController.getDashboard';
import updateOpportunityStage from '@salesforce/apex/SalesFlowController.updateOpportunityStage';
import completeTask from '@salesforce/apex/SalesFlowController.completeTask';
import searchOpportunities from '@salesforce/apex/SalesFlowController.searchOpportunities';
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
    // Default to dark mode for the SalesFlow workspace; keep the user's preference locally.
    isDark = true;

    connectedCallback() {
        try {
            this.isDark = window.localStorage.getItem('salesflow.crm.theme') !== 'light';
        } catch (error) {
            // Restricted browser storage must not prevent the dashboard from rendering.
            this.isDark = true;
        }
    }

    get themeClass() { return this.isDark ? 'salesflow theme-dark' : 'salesflow'; }
    get themeToggleLabel() { return this.isDark ? 'Modo claro' : 'Modo escuro'; }
    get themeIcon() { return this.isDark ? '☀' : '☾'; }

    handleThemeToggle() {
        this.isDark = !this.isDark;
        try {
            window.localStorage.setItem('salesflow.crm.theme', this.isDark ? 'dark' : 'light');
        } catch (error) {
            // The switch works in memory even if storage is unavailable.
        }
    }

    dashboard;
    wiredResult;
    errorMessage;
    activeView = 'inicio';
    query = '';
    showForm = false;
    isSaving = false;
    stageFilter = '';
    opportunityPage = 1;
    readonlyPageSize = 20;
    searchResult = { records: [], totalCount: 0, pageSize: 20 };
    isSearching = false;
    searchError;
    searchRequestId = 0;
    searchTimer;

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
    get isContacts() { return this.activeView === 'contatos'; }
    get isOpportunities() { return this.activeView === 'oportunidades'; }
    get isTasks() { return this.activeView === 'tarefas'; }
    get pageTitle() {
        return ({ inicio: 'Visão geral', clientes: 'Clientes', contatos: 'Contatos', oportunidades: 'Oportunidades', tarefas: 'Tarefas' })[this.activeView];
    }
    get accountCount() { return this.dashboard?.accountsCount || 0; }
    get contactsCount() { return this.dashboard?.contactsCount || 0; }
    get opportunityCount() { return this.dashboard?.opportunitiesCount || 0; }
    get openPipeline() { return shortMoney(this.dashboard?.openPipeline); }
    get wonRevenue() { return shortMoney(this.dashboard?.wonRevenue); }
    get openTasksCount() { return this.dashboard?.tasks?.length || 0; }
    get hasOpportunities() { return this.filteredOpportunities.length > 0; }
    get hasSearchResults() { return this.searchResult.records.length > 0; }
    get searchResultTotal() { return this.searchResult.totalCount || 0; }
    get paginationLimitNotice() { return this.searchResultTotal > 2020; }
    get hasAccounts() { return this.filteredAccounts.length > 0; }
    get hasContacts() { return this.filteredContacts.length > 0; }
    get hasTasks() { return this.dashboard?.tasks?.length > 0; }

    get stageOptions() {
        return [{ label: 'Todas as etapas', value: '' },
            ...(this.dashboard?.stages || []).map((stage) => ({ label: stage.label, value: stage.value }))];
    }
    get filteredContacts() {
        const q = this.query.trim().toLocaleLowerCase('pt-BR');
        return (this.dashboard?.contacts || []).filter((contact) =>
            !q || `${contact.name} ${contact.accountName} ${contact.email || ''} ${contact.phone || ''}`
                .toLocaleLowerCase('pt-BR').includes(q));
    }
    get filteredOpportunities() {
        const q = this.query.trim().toLocaleLowerCase('pt-BR');
        // Dashboard Kanban searches its 150-card snapshot. The opportunity listing
        // separately uses Apex searchOpportunities for server-side filtering.
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
    get pageCount() { return Math.max(1, Math.min(101, Math.ceil(this.searchResultTotal / this.readonlyPageSize))); }
    get pageLabel() { return `Página ${Math.min(this.opportunityPage, this.pageCount)} de ${this.pageCount}`; }
    get previousDisabled() { return this.opportunityPage <= 1; }
    get nextDisabled() { return this.opportunityPage >= this.pageCount; }
    get paginatedOpportunityRows() {
        return this.searchResult.records.map((o) => ({
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

    handleView(event) {
        this.activeView = event.currentTarget.dataset.view;
        this.opportunityPage = 1;
        if (this.isOpportunities) this.loadOpportunities();
    }
    handleSearch(event) {
        this.query = event.target.value;
        this.opportunityPage = 1;
        if (this.isOpportunities) {
            clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => this.loadOpportunities(), 350);
        }
    }
    handleStageFilter(event) {
        this.stageFilter = event.detail.value;
        this.opportunityPage = 1;
        this.loadOpportunities();
    }
    handlePreviousPage() {
        if (this.opportunityPage > 1) { this.opportunityPage -= 1; this.loadOpportunities(); }
    }
    handleNextPage() {
        if (this.opportunityPage < this.pageCount) { this.opportunityPage += 1; this.loadOpportunities(); }
    }
    async loadOpportunities() {
        const requestId = ++this.searchRequestId;
        this.isSearching = true;
        this.searchError = undefined;
        try {
            const json = await searchOpportunities({
                searchTerm: this.query,
                stageFilter: this.stageFilter,
                pageNumber: this.opportunityPage
            });
            // A slower, older response must not overwrite a newer search.
            if (requestId === this.searchRequestId) this.searchResult = JSON.parse(json);
        } catch (error) {
            if (requestId === this.searchRequestId) {
                this.searchError = error.body?.message || 'A pesquisa não pôde ser concluída.';
                this.searchResult = { records: [], totalCount: 0, pageSize: 20 };
            }
        } finally {
            if (requestId === this.searchRequestId) this.isSearching = false;
        }
    }
    async handleRefresh() {
        if (this.wiredResult) {
            try { await refreshApex(this.wiredResult); if (this.isOpportunities) await this.loadOpportunities(); }
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
    handleNewContact() { this.openStandardObject('Contact', 'new'); }
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
    async handleCompleteTask(event) {
        if (this.isSaving) return;
        const taskId = event.currentTarget.dataset.id;
        this.isSaving = true;
        try {
            await completeTask({ taskId });
            await refreshApex(this.wiredResult);
            this.toast('Tarefa concluída', 'A atividade foi atualizada no Salesforce.', 'success');
        } catch (error) {
            this.toast('Falha ao concluir', error.body?.message || 'Verifique as permissões da tarefa.', 'error');
        } finally {
            this.isSaving = false;
        }
    }
    async handleStageChange(event) {
        if (this.isSaving) return;
        const opportunityId = event.currentTarget.dataset.id;
        const newStage = event.detail.value;
        this.isSaving = true;
        try {
            await updateOpportunityStage({ opportunityId, newStage });
            await refreshApex(this.wiredResult);
            if (this.isOpportunities) await this.loadOpportunities();
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
