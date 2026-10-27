<#
.SYNOPSIS
  Publicação idempotente e cautelosa do SalesFlow CRM no GitHub.
.EXAMPLE
  .\scripts\publicar-github.ps1 -GitHubUsuario juceliocoelho2022
.NOTES
  Executa alterações em seu Git local e (quando autorizado) em seu GitHub.
  Não acessa a organização Salesforce.
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidateNotNullOrEmpty()]
  [string]$GitHubUsuario,
  [ValidateSet('public', 'private')]
  [string]$Visibility = 'public',
  [string]$Repository = 'salesflow-crm'
)
$ErrorActionPreference = 'Stop'
Set-Location (Resolve-Path (Join-Path $PSScriptRoot '..'))

function Assert-LastExit([string]$step) {
  if ($LASTEXITCODE -ne 0) { throw "Falha em: $step (exit $LASTEXITCODE)" }
}

foreach ($command in @('git', 'gh', 'python')) {
  if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
    throw "Comando '$command' indisponível. Confira instalação e PATH."
  }
}

gh auth status
Assert-LastExit 'autenticação GitHub — execute gh auth login'
$authenticatedUser = (gh api user --jq .login).Trim()
Assert-LastExit 'consulta à conta autenticada'
if ($authenticatedUser -ne $GitHubUsuario) {
  throw "Conta logada é '$authenticatedUser', mas o parâmetro informou '$GitHubUsuario'. Corrija para evitar publicação na conta errada."
}

python scripts/validate.py
Assert-LastExit 'validação estrutural'

if (-not (Test-Path '.git')) {
  git init -b main
  Assert-LastExit 'git init'
}
$branch = (git branch --show-current).Trim()
if (-not $branch) {
  git checkout -B main
  Assert-LastExit 'criar branch main'
} elseif ($branch -ne 'main') {
  throw "Branch atual é '$branch'. Troque para 'main' antes de publicar (sem renomear branches automaticamente)."
}

$remotes = @(git remote)
Assert-LastExit 'consultar remotes'
$fullName = "$GitHubUsuario/$Repository"
$expectedHttps = "https://github.com/$fullName.git"
if ('origin' -in $remotes) {
  $origin = (git remote get-url origin).Trim()
  $expectedSsh = "git@github.com:$fullName.git"
  $expectedHttpsNoGit = "https://github.com/$fullName"
  if ($origin -ne $expectedHttps -and $origin -ne $expectedHttpsNoGit -and $origin -ne $expectedSsh) {
    throw "Remote origin não corresponde ao destino esperado: $origin"
  }
}

git add .
Assert-LastExit 'git add'
# Verifique TODOS os arquivos rastreados, inclusive de commits anteriores.
$tracked = @(git ls-files)
Assert-LastExit 'listar arquivos versionados'
foreach ($path in $tracked) {
  if ($path -match '(^|/)(\.env($|\.)|\.sf/|\.sfdx/|authFile\.json$)' -or $path -match '\.(pem|p12|pfx|key)$') {
    throw "Arquivo potencialmente sensível não deve ser versionado: $path"
  }
}
if (@(git status --porcelain).Count -gt 0) {
  git commit -m 'feat: bootstrap SalesFlow CRM Salesforce DX MVP'
  Assert-LastExit 'git commit — confira git user.name e git user.email'
}

if ('origin' -notin $remotes) {
  $existingNamesJson = gh repo list $GitHubUsuario --json nameWithOwner --limit 1000
  Assert-LastExit 'consultar repositórios disponíveis no GitHub'
  $existingRepos = @($existingNamesJson | ConvertFrom-Json)
  $exists = @($existingRepos | Where-Object { $_.nameWithOwner -eq $fullName }).Count -gt 0
  if ($exists) {
    git remote add origin $expectedHttps
    Assert-LastExit 'git remote add origin'
  } else {
    # Cria repositório remoto, mas só envia o commit no push abaixo.
    if ($Visibility -eq 'public') {
      gh repo create $fullName --public --source . --remote origin --description 'SalesFlow CRM | Salesforce DX, Apex, LWC, SOQL e automação de vendas'
    } else {
      gh repo create $fullName --private --source . --remote origin --description 'SalesFlow CRM | Salesforce DX, Apex, LWC, SOQL e automação de vendas'
    }
    Assert-LastExit 'gh repo create'
  }
}

git push -u origin main
Assert-LastExit 'git push'
Write-Host "Repositorio publicado: https://github.com/$fullName" -ForegroundColor Green
Write-Host 'Confira Actions: CI estático, sem deploy Salesforce.' -ForegroundColor Yellow
