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

## Resolução de feature sem estado global — adaptação local

Auditoria em 2026-10-01 contra o commit fixado acima: `common.ps1` e
`setup-plan.ps1` eram idênticos ao upstream (normalizando quebras de linha).
`setup-tasks.ps1` e `check-prerequisites.ps1` só diferiam nos nomes de comandos
renderizados para `/speckit.*`. O ponteiro `feature.json`, a função
`Save-FeatureJson` e a persistência do override vinham do upstream. A escrita
desse ponteiro por `from-issue.mjs`, os snapshots `.specify/context/` e as
instruções para atualizar o ponteiro eram adaptações nossas.

O resolver de `common.ps1` agora usa, nesta ordem:

1. `SPECIFY_FEATURE_DIRECTORY`, apenas no ambiente do processo da execução:
   caminho existente, absoluto ou relativo à raiz do projeto; sem qualquer
   escrita de contexto em arquivo, configuração Git ou ambiente persistente.
2. Branch Git real obtida por `git -C REPO_ROOT symbolic-ref --quiet --short HEAD`:
   `feat/fix/refactor/techdebt/NNNNN-slug`, buscando exatamente uma pasta
   `specs/NNNNN-*` pelo ID. O slug da pasta pode diferir do slug da branch.

IDs têm no mínimo cinco dígitos, como o formatter de Issues; números maiores
que 99999 não são truncados. Branch não SDD, detached HEAD/ausência de Git sem
override, pasta inexistente e múltiplas correspondências causam erro explícito.
`SPECIFY_FEATURE` é recusado mesmo quando há override de diretório. Nenhum
resíduo de `feature.json` ou `context/` é lido/atualizado; ambos continuam ignorados
para evitar publicação acidental. Nenhum cache substituto foi introduzido.

Os objetos e campos de saída permanecem compatíveis com `setup-plan`,
`setup-tasks` e `check-prerequisites`: `FEATURE_DIR`, caminhos absolutos dos
artefatos, `BRANCH`, `AVAILABLE_DOCS` e conteúdo dos templates. `BRANCH` representa
a branch real, ficando vazio em detached HEAD/sem Git com override explícito.
`-PathsOnly` dispensa documentos, mas exige diretório resolvido válido.
`-NoPersist` permanece aceito como no-op por compatibilidade; a resolução nunca
persiste, independentemente do antigo `SPECIFY_FEATURE_NO_PERSIST`.
`SPECIFY_INIT_DIR` continua sendo um override explícito da raiz do projeto.

`setup-plan` não cria mais uma pasta de feature ausente; apenas prepara plan.md
na pasta resolvida. `setup-tasks` e a pilha de templates permanecem preservados.
Os comandos plan/tasks usam seus respectivos helpers; implement, analyze,
clarify, checklist e converge usam check-prerequisites. Constitution não depende
de feature atual; specify continua entrando por Issue e taskstoissues segue
desabilitado. As extensões opcionais git/agent-context não estão instaladas;
instalá-las exige revisar suas premissas sobre contexto e persistência.

`from-issue` cria branch/rascunho, sincroniza Project e comenta a Issue, sem salvar
ponteiro ou snapshot. Consulte `issue.mjs NUMERO` para reler Issue, comentários,
Priority e dependências quando precisar de contexto remoto atual.

Validação: `node --test scripts/sdd/*.test.mjs` inclui Git e PowerShell 7 reais,
branches, worktrees temporários e API simulada para from-issue. Não instala
Pester; usa `pwsh` (ou `PWSH_BIN`), com fallback padrão do PowerShell 7 no Windows.
Os testes não criam Features reais nem fazem chamadas de escrita ao GitHub.
Uma reinstalação do upstream pode restaurar o resolver antigo: preserve esta
adaptação e execute a suíte antes de aceitar atualização da infraestrutura.

O harness local em `scripts/sdd/sandbox/` não altera os helpers upstream:
executa os seis helpers instalados em fixtures descartáveis, com Git real,
gh fake obrigatório e guards de rede. Detalhes, contratos exercitados e limites
da comprovação estão em [sdd-sandbox.md](../docs/sdd-sandbox.md).

Adaptação de encoding: `common.ps1` define stdout como UTF-8 sem BOM.
Isso preserva o JSON e o texto Unicode quando o terminal Windows usa páginas
OEM/ANSI: nas páginas 437/850, a seta do template era convertida em SUB (0x1A),
invalidando o JSON; em 1252 havia perda silenciosa de caracteres. A sandbox
também explicita UTF-8 no launcher. A regressão executa o helper real após
selecionar 437, 850, 1252 e 65001 e exige igualdade integral do conteúdo.
