# Como contribuir — SalesFlow CRM

## Fluxo de trabalho

1. Abra uma **Issue** com objetivo e critérios de aceitação antes de mudanças maiores.
2. Crie uma branch a partir de `main`: `feature/descricao`, `fix/descricao`, `docs/descricao` ou `chore/descricao`.
3. Faça commits pequenos seguindo **Conventional Commits** (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).
4. Rode `python scripts/validate.py`; para alterações Apex/LWC execute a validação e os testes numa **org de desenvolvimento**, nunca em produção.
5. Abra Pull Request usando o template. O merge será por **squash**, com pelo menos uma revisão quando houver colaboradores.

## Convenções

- Apex: usar `with sharing` quando adequado, impor CRUD/FLS com `USER_MODE` e evitar SOQL/DML em loops.
- LWC: acessibilidade, tratamento de erros e comunicação explícita com Apex.
- Segurança: jamais subir `.sf/`, `.sfdx/`, `.env`, tokens, dados pessoais e credenciais.
- Documentação: atualize `README.md`, `CHANGELOG.md` e `docs/` quando o comportamento mudar.
- Testes: valide os cenários positivos, negativos, limites e permissões. O CI atual verifica **estrutura e JavaScript estático**, não executa testes Apex.

## Branches e releases

- `main`: código compartilhado e rastreável. Protegê-la quando o repositório estiver configurado.
- `feature/*`: pequenas entregas, sempre via PR.
- `develop`: **opcional**; só criar se houver necessidade de uma branch de integração de longo prazo.
- Tags `vX.Y.Z`: criar depois de validar a release no ambiente Salesforce e documentar a evidência.

Consulte o guia de [publicação e branches](docs/GITHUB_PUBLICACAO.md).
