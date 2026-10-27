# SalesFlow CRM — Tema Dark (v0.3.0, implementação inicial)

## Escopo

- Modo **Dark** é o padrão no componente LWC `salesFlowDashboard`.
- Botão no cabeçalho permite alternar entre **Modo claro** e **Modo escuro** sem recarregar ou alterar registros.
- Preferência é salva no `localStorage` do navegador sob a chave `salesflow.crm.theme` (isolada por namespace quando Lightning Web Security está habilitado).
- Em navegadores que bloqueiam armazenamento, a alternância funciona na sessão atual, sem persistência.
- O CSS foi limitado ao componente do SalesFlow. **As páginas e a barra de navegação do próprio Salesforce seguem o tema da organização**.
- O modo escuro nativo do Salesforce pode ser habilitado pelo administrador em temas SLDS 2, quando disponível para a organização.
- A visualização local em `preview/index.html` permanece independente deste tema LWC.

## Verificação antes de implantar (IntelliJ, PowerShell)

```powershell
git fetch origin
git switch --track origin/feature/salesflow-v0.3.0-dark-mode
python scripts/validate.py
sf project deploy start --dry-run --source-dir force-app --target-org salesflow-dev --test-level RunSpecifiedTests --tests SalesFlowControllerTest --wait 20
```

Somente após o `dry-run` ser bem-sucedido, implantar no ambiente de desenvolvimento:

```powershell
sf project deploy start --source-dir force-app --target-org salesflow-dev --test-level RunSpecifiedTests --tests SalesFlowControllerTest --wait 20
sf org open --target-org salesflow-dev
```

## Checklist visual

1. Abra a guia **SalesFlow CRM**, não o Lightning App Builder.
2. Confirme o fundo escuro inicial e o botão **Modo claro** no cabeçalho.
3. Clique em **Modo claro**; o fundo deve ficar claro, com botão **Modo escuro**.
4. Atualize a página; a preferência deve permanecer.
5. Retorne a **Modo escuro** e confirme contraste em indicadores, Kanban, contatos, oportunidades, tabelas e modal de cadastro.
6. Teste em resolução menor e registre anomalias.
7. Não publique capturas com tokens ou dados comerciais verdadeiros.

## Limitações

O uso de `lightning-input-field`, `lightning-button` e outros componentes base segue o tema SLDS da organização. Quando o Salesforce usa um tema claro, algumas partes internas desses componentes podem continuar claras mesmo com o SalesFlow escuro. Não usamos seletores para invadir o DOM interno de componentes base. Para uma interface inteira escura, priorize também o Dark Mode nativo com SLDS 2, se disponível.

**Status:** mudança registrada no GitHub; o deploy e os testes funcionais desta versão ainda exigem execução na organização Salesforce.
