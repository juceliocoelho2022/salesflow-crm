# Política de segurança

SalesFlow CRM é um projeto educacional e **não está homologado para uso produtivo**.

## Dados e credenciais

- Nunca adicione credenciais OAuth, URL com access token, arquivos de sessão, `.env`, `.sf/` ou `.sfdx/`.
- Não use registros reais de clientes em screenshots, dados de teste ou issues públicas.
- Execute `seed.apex` apenas em org de desenvolvimento: ele cria registros na org.
- Na org Salesforce, avalie permissões de objetos/campos, `with sharing`, `USER_MODE`, perfis e Permission Sets.
- OAuth para integração Java deve usar uma configuração de aplicativo aprovada na organização; ainda **não faz parte** do MVP.

## Reporte responsável

Não publique falhas exploráveis em issues públicas. O mantenedor deve habilitar **Private vulnerability reporting** em GitHub → Settings → Security → Code security and analysis; depois, use essa funcionalidade para relatos privados. Até lá, não compartilhe segredos ou dados de usuários.

## Estado atual

Não há pipeline autenticado no Salesforce, varredura de dependências Apex nem auditoria de produção neste MVP. A verificação no GitHub Actions é estática.
