# Publicação profissional no GitHub (Windows + IntelliJ)

Repositório planejado: `juceliocoelho2022/salesflow-crm`.

## 1 — Verificações iniciais

```powershell
cd C:\Projetos\salesflow-crm
git --version
gh --version
gh auth status
python scripts/validate.py
git status --short
```

O comando `winget` **não é necessário** se `git` e `gh` já estão instalados.

## 2 — Autenticação no GitHub

Se `gh auth status` indicar sessão ausente, rode `gh auth login` e autentique sua própria conta pelo navegador. Não cole tokens no terminal ou em tickets.

## 3 — Publicação automática

```powershell
.\scripts\publicar-github.ps1 -GitHubUsuario juceliocoelho2022
```

- O script faz commit local, cria repositório público via `gh` e envia `main`.
- Se já existir `origin`, ele **não sobrescreve silenciosamente** um remoto diferente.
- O script não altera sua organização Salesforce nem executa Apex.
- Se houver Git com histórico prévio, confira antes o nome da branch e o remote.

## 4 — Verificar o repositório

```powershell
git status
git remote -v
git branch --show-current
git log --oneline -3
gh repo view --web
```

Abra **Actions** e aguarde a checagem estática. Status verde significa apenas que as validações locais passaram no runner, **não** que Salesforce foi implantado.

## 5 — Configurações recomendadas no GitHub

- **About**: descrição do produto, tecnologias e tópicos `salesforce`, `apex`, `lwc`, `crm`, `soql`, `salesforce-dx`, `portfolio`.
- **Features**: Issues e Discussions se fizer sentido.
- **Settings → Branches**: proteger `main` e exigir PR/CI quando possível para o seu plano e tipo de repositório.
- **Settings → Security**: habilitar verificação de segredos e alertas disponíveis; preferir reporte privado de vulnerabilidades.
- **README**: após deploy, substituir conceitos visuais por capturas reais e incluir métricas de testes e link de demonstração.
- **Releases**: publicar `v0.1.0` somente depois de comprovar implantação e testes Apex.

## 6 — Próximo desenvolvimento

```powershell
git checkout -b feature/salesforce-deploy-validation
# Realizar alterações e validação
git add .
git commit -m "fix: ajustar deploy Salesforce"
git push -u origin feature/salesforce-deploy-validation
gh pr create --base main --fill
```

Depois do merge, sincronize `main` com `git switch main; git pull --ff-only`.

## Erros comuns

- `gh: command not found`: CLI ausente ou terminal precisa reiniciar.
- `winget: ... não reconhecido`: irrelevante se `gh --version` funciona.
- `Author identity unknown`: configure `git config --global user.name` e `git config --global user.email` com seus próprios dados.
- `remote origin already exists`: confira `git remote -v` antes de tentar alterar URL.
- `NonSourceTrackedOrgError` em `sf project deploy preview`: a org não rastreia alterações; use validação `sf project deploy start --dry-run` em vez do comando de preview.
