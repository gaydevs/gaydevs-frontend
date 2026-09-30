# Spec Kit

Instalado da fonte oficial `github/spec-kit`, tag `v1.0.13`, commit
`f1a548a39dba4e5e8600de1d2e0d3ff0c468d2a9`, integração `generic`, scripts PowerShell.
CLI local nesta máquina: `.verification/spec-kit-venv/Scripts/specify.exe`.

Instalação reproduzível (Python 3.11+ e uv):

```sh
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@v1.0.13
specify version
```

O checkout já contém a configuração; não precisa executar init novamente.
Os comandos em `commands/` são instruções legíveis por qualquer agente ou gdev;
a integração generic não garante execução automática por um agente específico.
Os helpers exigem PowerShell 7 (`pwsh`), também disponível em Linux/macOS.
Os comandos de GitHub em `scripts/sdd/` usam Node.js 20+ e gh, sem SDK de agente.

Adaptações locais: constitution, templates em `templates/overrides/`, entrada
`speckit.specify`, bloqueio do gerador sequencial e gates nas instruções.
Não instalar extensão git para gerar IDs; o wrapper Issue → spec cuida disso.
Uma atualização/reinicialização pode sobrescrever adaptações: revise o diff,
reaplique-as e execute `node --test scripts/sdd/*.test.mjs` antes de adotar.
Não executar `taskstoissues`: tasks ficam em `tasks.md` nesta fase.

Fonte: https://github.com/github/spec-kit/tree/v1.0.13 (licença MIT).
