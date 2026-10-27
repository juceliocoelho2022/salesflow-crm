# Aplicar as melhorias profissionais no projeto já extraído

O pacote `SalesFlow-CRM-GitHub-Professional-Patch.zip` contém **apenas** arquivos de documentação, workflow, templates e script de publicação. Não substitui classes Apex, LWC, prévia ou dados da sua org.

## PowerShell no IntelliJ

```powershell
cd C:\Projetos\salesflow-crm
# Confirme que alterações locais foram preservadas
if (Test-Path .git) { git status --short }
$patch = Join-Path $env:USERPROFILE 'Downloads\SalesFlow-CRM-GitHub-Professional-Patch.zip'
Expand-Archive -Path $patch -DestinationPath 'C:\Projetos\salesflow-crm' -Force
python scripts/validate.py
gh auth status
.\scripts\publicar-github.ps1 -GitHubUsuario juceliocoelho2022
```

Se o browser salvou o ZIP em outra pasta, altere `$patch` para o caminho real. A opção `-Force` sobrescreve `README.md`, `.gitignore` e `scripts/publicar-github.ps1`; faça uma cópia antes se você já os personalizou.

Após o push, verifique `gh repo view --web` e a aba **Actions**. O CI é somente estático; para Apex/LWC é necessária validação na org.
