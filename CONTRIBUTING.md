# Contribuir

gdevs podem usar qualquer agente de IA (altamente recomendável, mas opcional).
Pré-requisitos: Git, Node.js 20+, GitHub CLI e PowerShell 7 para os helpers do Spec Kit.

```sh
gh auth login
gh auth status
gh repo set-default gaydevs/gaydevs-platform
gh auth refresh -s project
```

Crie uma Issue pelo form Feature, Bug, Refactor ou Tech Debt, na interface ou
por agente seguindo [AGENTS.md](AGENTS.md). Defina Priority e dependências nativas.

```sh
node scripts/sdd/from-issue.mjs 27         # consultar, sem alterar
node scripts/sdd/from-issue.mjs 27 --start # iniciar após verificar contexto
```

Feature sempre exige spec; Bug/Refactor/Tech Debt triviais aceitam `--trivial`.
Aprovar spec → elaborar plan → aprovar plan → tasks → código. Não pular gates.
PRs de trabalho apontam para `develop`, com `Refs #27` (não `Closes #27`).
Solicite revisão de outro gdev. Consulte o [fluxo](docs/development-workflow.md)
e o [estado desta implantação](docs/sdd-implementation.md) antes de iniciar.

Validação do tooling: `node --test scripts/sdd/*.test.mjs`.
Comandos do frontend permanecem no [README](README.md).
