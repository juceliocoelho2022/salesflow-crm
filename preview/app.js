/* SalesFlow CRM — prévia 100% local, sem conexão com Salesforce. */
(() => {
  'use strict';
  const stages = ['Prospecção', 'Qualificação', 'Proposta', 'Negociação', 'Fechamento'];
  const colors = ['#1885ed', '#64b7f4', '#8e76e9', '#ee8aa5', '#4fcf92'];
  const accountsSeed = [
    { id: 1, name: 'TechCorp', sector: 'Tecnologia', phone: '(11) 3000-1001' },
    { id: 2, name: 'Banco Horizonte', sector: 'Financeiro', phone: '(11) 3000-1002' },
    { id: 3, name: 'Grupo Alfa', sector: 'Serviços', phone: '(11) 3000-1003' },
    { id: 4, name: 'Mineradora XYZ', sector: 'Indústria', phone: '(11) 3000-1004' },
    { id: 5, name: 'PetroVale', sector: 'Energia', phone: '(11) 3000-1005' },
    { id: 6, name: 'InovaTech', sector: 'Consultoria', phone: '(11) 3000-1006' },
    { id: 7, name: 'Varejo Mais', sector: 'Comércio', phone: '(11) 3000-1007' },
    { id: 8, name: 'EduTech', sector: 'Educação', phone: '(11) 3000-1008' },
    { id: 9, name: 'AgroSoluções', sector: 'Agronegócio', phone: '(11) 3000-1009' },
    { id: 10, name: 'Construtora Horizonte', sector: 'Construção', phone: '(11) 3000-1010' },
    { id: 11, name: 'Global Services', sector: 'Cloud', phone: '(11) 3000-1011' },
    { id: 12, name: 'Rede Saúde Brasil', sector: 'Saúde', phone: '(11) 3000-1012' }
  ];
  const oppSeed = [
    ['CRM Enterprise', 1, 80000, 0, '2026-11-30'], ['Consultoria Cloud', 6, 120000, 0, '2026-11-28'],
    ['Solução Financeira', 2, 350000, 1, '2026-11-12'], ['E-commerce B2B', 7, 180000, 1, '2026-11-15'],
    ['Transformação Digital', 3, 280000, 2, '2026-11-05'], ['Plataforma Educação', 8, 220000, 2, '2026-11-18'],
    ['CRM Corporativo', 4, 250000, 3, '2026-11-10'], ['Automação Comercial', 9, 170000, 3, '2026-11-18'],
    ['Licenças e Implantação', 5, 450000, 4, '2026-10-25'], ['Solução de Obras', 10, 230000, 4, '2026-10-28'],
    ['Migração Cloud', 11, 220000, 0, '2026-11-10'], ['Gestão Hospitalar', 12, 180000, 2, '2026-12-03']
  ].map((r,i) => ({ id:i+1, name:r[0], accountId:r[1], amount:r[2], stage:r[3], closeDate:r[4] }));
  const contactsSeed = [
    { id:1, name:'Ana Silva', accountId:1, email:'ana@example.com',phone:'(11) 90000-0001' },
    { id:2, name:'Carlos Souza', accountId:2, email:'carlos@example.com',phone:'(11) 90000-0002' },
    { id:3, name:'Bruna Costa', accountId:8, email:'bruna@example.com',phone:'(11) 90000-0003' }
  ];
  const taskSeed = [
    { id:1, name:'Enviar proposta comercial', accountId:3, due:'2026-10-27', completed:false },
    { id:2, name:'Preparar apresentação', accountId:1, due:'2026-10-27', completed:false },
    { id:3, name:'Acompanhar retorno', accountId:7, due:'2026-10-28', completed:false },
    { id:4, name:'Reunião de alinhamento', accountId:2, due:'2026-11-03', completed:false }
  ];
  const getSaved = (key, fallback) => {
    try { const value = JSON.parse(localStorage.getItem(key)); return Array.isArray(value) ? value : fallback; }
    catch { return fallback; }
  };
  let accounts = getSaved('salesflow.demo.accounts.v1', accountsSeed);
  let opps = getSaved('salesflow.demo.opps.v1', oppSeed);
  let tasks = getSaved('salesflow.demo.tasks.v1', taskSeed);
  let contacts = getSaved('salesflow.demo.contacts.v2', contactsSeed);
  let view = 'dashboard'; let search = ''; let modalType = 'opportunity'; let stageFilter = ''; 
  const $ = (selector) => document.querySelector(selector);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const money = (value) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(value || 0);
  const compact = (value) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',notation:'compact',maximumFractionDigits:1}).format(value || 0);
  const date = (value) => value ? value.split('-').reverse().join('/') : '—';
  const accountName = (id) => accounts.find((a) => Number(a.id) === Number(id))?.name || 'Sem cliente';
  const save = () => {
    try { localStorage.setItem('salesflow.demo.accounts.v1',JSON.stringify(accounts));localStorage.setItem('salesflow.demo.opps.v1',JSON.stringify(opps));localStorage.setItem('salesflow.demo.tasks.v1',JSON.stringify(tasks));localStorage.setItem('salesflow.demo.contacts.v2',JSON.stringify(contacts)); }
    catch { /* Some browsers disallow localStorage for file:// pages. Demo still works in memory. */ }
  };
  const filteredOpps = () => opps.filter((o) => (stageFilter === '' || Number(stageFilter) === o.stage) && (`${o.name} ${accountName(o.accountId)} ${stages[o.stage]}`).toLocaleLowerCase('pt-BR').includes(search));
  const filteredContacts = () => contacts.filter((c) => `${c.name} ${accountName(c.accountId)} ${c.email || ''} ${c.phone || ''}`.toLocaleLowerCase('pt-BR').includes(search));
  const filteredAccounts = () => accounts.filter((a) => `${a.name} ${a.sector}`.toLocaleLowerCase('pt-BR').includes(search));
  const filteredTasks = () => tasks.filter((t) => `${t.name} ${accountName(t.accountId)}`.toLocaleLowerCase('pt-BR').includes(search));
  const totalFor = (stage) => opps.filter((o)=>o.stage===stage).reduce((sum,o)=>sum+o.amount,0);
  const countFor = (stage) => opps.filter((o)=>o.stage===stage).length;
  let toastTimer;
  function toast(message) { const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2800); }
  function renderStats() {
    $('#statAccounts').textContent = accounts.length;
    $('#statOpps').textContent = opps.length;
    $('#statPipeline').textContent = compact(opps.filter(o=>o.stage<4).reduce((s,o)=>s+o.amount,0));
    $('#statWon').textContent = compact(totalFor(4));
  }
  function renderBoard() {
    $('#board').innerHTML = stages.map((name,index)=>{
      const cards=filteredOpps().filter(o=>o.stage===index).map(o=>`<article class="opp-card"><b title="${esc(o.name)}">${esc(accountName(o.accountId))}</b><p title="${esc(o.name)}">${esc(o.name)}</p><strong>${money(o.amount)}</strong><div class="opp-footer"><span>◷ ${date(o.closeDate)}</span><label><span class="sr-only">Alterar etapa</span><select data-stage-for="${o.id}" aria-label="Alterar etapa de ${esc(o.name)}">${stages.map((s,i)=>`<option value="${i}" ${i===o.stage?'selected':''}>${esc(s)}</option>`).join('')}</select></label></div></article>`).join('');
      return `<div class="column stage${index}"><div class="column-head"><strong>${esc(name)}</strong><span class="count">${countFor(index)}</span><small>${compact(totalFor(index))}</small></div>${cards || '<div class="empty">Nenhum negócio</div>'}</div>`;
    }).join('');
  }
  function renderBars() {
    const max=Math.max(...stages.map((_,i)=>totalFor(i)),1);
    $('#bars').innerHTML=stages.map((name,index)=>`<div class="bar-item"><div class="bar-label"><span>${esc(name)}</span><span>${compact(totalFor(index))}</span></div><div class="bar-track"><div class="bar-fill" style="width:${(totalFor(index)/max)*100}%"></div></div></div>`).join('');
  }
  function renderDonut() {
    const total=opps.length||1;let start=0;const stops=[];
    stages.forEach((_,index)=>{const end=start+(countFor(index)/total)*100;stops.push(`${colors[index]} ${start}% ${end}%`);start=end;});
    $('#donut').style.background=`conic-gradient(${stops.join(',')})`;
    $('#donutTotal').textContent=opps.length;
    $('#legend').innerHTML=stages.map((name,index)=>`<div class="legend-item"><div class="legend-name"><span class="color-dot" style="background:${colors[index]}"></span><span>${esc(name)}</span></div><b>${countFor(index)}</b></div>`).join('');
  }
  function renderQuickTasks() {
    const pending=filteredTasks().filter(t=>!t.completed).slice(0,4);
    $('#quickTasks').innerHTML=pending.map(t=>`<div class="task-list-item"><input type="checkbox" data-complete="${t.id}" aria-label="Concluir ${esc(t.name)}"><div class="task-detail"><b>${esc(t.name)}</b><small>${esc(accountName(t.accountId))}</small></div><div class="task-date">${date(t.due)}</div></div>`).join('') || '<p class="empty">Nenhuma tarefa pendente.</p>';
  }
  function renderRecords() {
    const isAccounts=view==='accounts',isContacts=view==='contacts',isTasks=view==='tasks';
    $('#recordTitle').textContent=isAccounts?'Clientes cadastrados':isContacts?'Contatos dos clientes':isTasks?'Atividades comerciais':view==='reports'?'Relatório detalhado de oportunidades':'Oportunidades recentes';
    $('#recordSubtitle').textContent=isAccounts?`${filteredAccounts().length} contas no modo demo`:isContacts?`${filteredContacts().length} contatos no modo demo`:isTasks?`${filteredTasks().length} atividades no modo demo`:`${filteredOpps().length} negócios no modo demo`;
    let columns,rows;
    if(isAccounts){columns=['Cliente','Setor','Telefone'];rows=filteredAccounts().map(a=>[a.name,a.sector,a.phone]);}
    else if(isContacts){columns=['Contato','Cliente','E-mail','Telefone'];rows=filteredContacts().map(c=>[c.name,accountName(c.accountId),c.email,c.phone]);}
    else if(isTasks){columns=['Atividade','Cliente','Prazo','Status'];rows=filteredTasks().map(t=>[t.name,accountName(t.accountId),date(t.due),t.completed?'Concluída':'Pendente']);}
    else {columns=['Oportunidade','Cliente','Valor','Etapa','Fechamento'];rows=filteredOpps().map(o=>[o.name,accountName(o.accountId),money(o.amount),stages[o.stage],date(o.closeDate)]);}
    $('#recordsTable thead').innerHTML=`<tr>${columns.map(c=>`<th>${esc(c)}</th>`).join('')}</tr>`;
    $('#recordsTable tbody').innerHTML=rows.map(r=>`<tr>${r.map((c,i)=>`<td>${i===3&&!isTasks&&!isAccounts&&!isContacts?`<span class="table-pill">${esc(c)}</span>`:esc(c)}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${columns.length}" class="empty">Sem resultados para a pesquisa.</td></tr>`;
    return {columns,rows};
  }
  function render() {
    renderStats();renderBoard();renderBars();renderDonut();renderQuickTasks();renderRecords();
    const titles={contacts:['Contatos','Acompanhe os profissionais de cada cliente.'],dashboard:['Visão Geral','Tudo que importa para acelerar suas vendas.'],accounts:['Clientes','Gerencie empresas e relacionamentos comerciais.'],opportunities:['Oportunidades','Acompanhe a jornada do negócio.'],tasks:['Tarefas','Priorize suas ações comerciais.'],reports:['Relatórios','Visão detalhada das oportunidades e resultados.']};
    $('#pageTitle').textContent=titles[view][0];$('#pageDescription').textContent=titles[view][1];$('#breadcrumb').textContent=titles[view][0].toUpperCase();
    $('#menu').querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
    $('#stageFilterWrap').hidden = view !== 'opportunities';
    const home=view==='dashboard';$('#stats').hidden=!home;$('#boardPanel').hidden=!home;$('#bottom').hidden=!home;
  }
  function openCreate(type) {
    modalType=type;$('#modalTitle').textContent=type==='account'?'Novo cliente':type==='contact'?'Novo contato':'Nova oportunidade';
    $('#formFields').innerHTML=type==='contact'?`<div class="form-body"><label>Nome completo<input name="name" maxlength="120" required placeholder="Ex.: Ana Silva"></label><label>Cliente<select name="accountId" required>${accounts.map(a=>`<option value="${a.id}">${esc(a.name)}</option>`).join('')}</select></label><label>E-mail<input name="email" type="email" maxlength="200"></label><label>Telefone<input name="phone" maxlength="35"></label></div>`:type==='account'? `<div class="form-body"><label>Nome da empresa<input name="name" maxlength="120" required placeholder="Ex.: Exemplo Tecnologia"></label><label>Setor<input name="sector" maxlength="80" placeholder="Ex.: Tecnologia"></label><label>Telefone<input name="phone" maxlength="35" placeholder="Ex.: (11) 3333-3333"></label></div>`:`<div class="form-body"><label>Oportunidade<input name="name" maxlength="120" required placeholder="Ex.: Contrato de consultoria"></label><label>Cliente<select name="accountId" required>${accounts.map(a=>`<option value="${a.id}">${esc(a.name)}</option>`).join('')}</select></label><label>Valor (R$)<input type="number" name="amount" min="0" step="0.01" required></label><label>Etapa<select name="stage">${stages.map((s,i)=>`<option value="${i}">${esc(s)}</option>`).join('')}</select></label><label>Previsão de fechamento<input type="date" name="closeDate" required value="2026-11-30"></label></div>`;
    $('#createModal').showModal();$('#formFields input')?.focus();
  }
  $('#menu').addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(b){view=b.dataset.view;render();}});
  $('#search').addEventListener('input',e=>{search=e.target.value.trim().toLocaleLowerCase('pt-BR');render();});
  $('#newAccount').addEventListener('click',()=>openCreate('account'));
  $('#newContact').addEventListener('click',()=>openCreate('contact'));
  $('#stageFilter').innerHTML='<option value="">Todas as etapas</option>'+stages.map((name,i)=>`<option value="${i}">${esc(name)}</option>`).join('');
  $('#stageFilter').addEventListener('change',e=>{stageFilter=e.target.value;render();});
  $('#newOpportunity').addEventListener('click',()=>openCreate('opportunity'));
  $('#closeModal').addEventListener('click',()=>$('#createModal').close());
  $('#cancelModal').addEventListener('click',()=>$('#createModal').close());
  $('#seeTasks').addEventListener('click',()=>{view='tasks';render();});
  $('#board').addEventListener('change',e=>{if(e.target.matches('[data-stage-for]')){const o=opps.find(x=>x.id===Number(e.target.dataset.stageFor));if(o){o.stage=Number(e.target.value);save();render();toast('Etapa alterada na demonstração local.');}}});
  $('#quickTasks').addEventListener('change',e=>{if(e.target.matches('[data-complete]')){const t=tasks.find(x=>x.id===Number(e.target.dataset.complete));if(t){t.completed=e.target.checked;save();render();toast('Atividade concluída no modo demo.');}}});
  $('#createForm').addEventListener('submit',e=>{e.preventDefault();const v=Object.fromEntries(new FormData(e.currentTarget).entries());if(modalType==='account'){accounts.unshift({id:Math.max(0,...accounts.map(a=>a.id))+1,name:v.name.trim(),sector:v.sector.trim(),phone:v.phone.trim()});}else if(modalType==='contact'){contacts.unshift({id:Math.max(0,...contacts.map(c=>c.id))+1,name:v.name.trim(),accountId:Number(v.accountId),email:v.email.trim(),phone:v.phone.trim()});}else{opps.unshift({id:Math.max(0,...opps.map(o=>o.id))+1,name:v.name.trim(),accountId:Number(v.accountId),amount:Number(v.amount),stage:Number(v.stage),closeDate:v.closeDate});}save();$('#createModal').close();render();toast('Registro criado na demonstração local.');});
  $('#exportCsv').addEventListener('click',()=>{const {columns,rows}=renderRecords();const csv='\ufeff'+[columns,...rows].map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(';')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download='salesflow-demo-'+view+'.csv';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);toast('CSV gerado a partir dos dados fictícios.');});
  // Tema isolado da demonstração. Nunca altera registros ou credenciais Salesforce.
  const themeButton = $('#themeToggle');
  const applyTheme = (dark) => {
    document.body.classList.toggle('theme-dark', dark);
    themeButton.textContent = dark ? '☀ Modo claro' : '☾ Modo escuro';
    themeButton.setAttribute('aria-label', dark ? 'Modo claro' : 'Modo escuro');
    themeButton.setAttribute('aria-pressed', String(dark));
  };
  let dark = true;
  try { dark = localStorage.getItem('salesflow.demo.theme') !== 'light'; }
  catch { /* Sem armazenamento: permanece escuro nesta sessão. */ }
  applyTheme(dark);
  themeButton.addEventListener('click', () => {
    dark = !dark;
    applyTheme(dark);
    try { localStorage.setItem('salesflow.demo.theme', dark ? 'dark' : 'light'); }
    catch { /* Alternância continua funcional, ainda que temporária. */ }
  });

  render();
})();
