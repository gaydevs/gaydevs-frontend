# Implantação SDD — Rodadas 2A e 2B

Estado da Rodada 2B: proteções clássicas complementadas em 2026-09-30 e governança
administrativa transferida para `gdevs-admins` em 2026-10-01;
integração do checkpoint e ativação de CODEOWNERS em main pendentes dos gates
humanos descritos ao final. O registro da Rodada 2A abaixo é histórico.

Auditoria ao vivo: 2026-09-30, via gh 2.101.0 e interface do GitHub.
Registro administrativo: [Issue #8](https://github.com/gaydevs/gaydevs-platform/issues/8).
Plano: [SDD_PLAN.md](../SDD_PLAN.md). Rodada 2A autorizada pelo gdev nesta sessão;
isso não constitui aprovação de spec, plan, PR ou release de produto.

## Estado confirmado

- Repo canônico: `gaydevs/gaydevs-platform`, ID `1388307090`. O remoto antigo
  `gaydevs-frontend` redireciona para ele; o default do gh neste checkout é o canônico.
- Conta `luvittor`: admin do repo e owner da organização. Escopos `project` e
  `admin:org` obtidos e confirmados; nenhum token foi gravado no repo.
- PR [#9](https://github.com/gaydevs/gaydevs-platform/pull/9) mergeado em develop.
  Branch `techdebt/00008-sdd-foundation` sincronizada com develop no commit
  `772ae49`, preservando os commits anteriores. O checkpoint SDD ainda não está
  integrado em develop; main ainda contém apenas o form Team Access.
- Issue #8 permanece aberta como Task administrativa de bootstrap, fora do
  auto-add por tipo. Nenhuma Feature real, spec de produto ou branch nova foi criada.

## Organização e Project

[**gaydevs project — #1**](https://github.com/orgs/gaydevs/projects/1), privado,
pertence à organização `gaydevs` e está vinculado ao repo. A organização não tinha
Projects na consulta anterior à criação. View `SDD` em formato board.

Acesso persistido e relido na interface:

- membros da organização: **Read** como base role deste Project;
- `gdevs-team`: **Write**, configurado via gh;
- owners/admins da organização: **Admin** por herança nativa; owner atual: `luvittor`.

A API pública consultada não expõe base role nem a lista completa de permissões
no objeto ProjectV2. A verificação desses papéis usa a página Manage access;
privacidade, equipe vinculada e `viewerCanUpdate` também foram relidos via gh.
Não houve teste autenticado com uma segunda conta de membro comum.

Tipos nativos habilitados: Feature, Bug, **Refactor** e **Tech Debt**. Os dois
últimos foram criados nesta rodada. Task existente foi preservado; Team Access
continua usando o form original sem tipo, preservado byte a byte.

Priority é o **Issue Field da organização** `47412460`, visível aos membros,
com **High → Medium → Low**. Os IDs dessas opções foram preservados. Urgent foi
removido somente após listar todos os repos/Issues e reler seus valores: não
havia uso dessa opção. O Project expõe o mesmo campo (`isIssueField: true`),
sem criar uma prioridade independente.

Status, na ordem configurada:

`Backlog → Specifying → Ready → In Progress → Review → Ready for Release → Done`

Número, IDs do Project, Status/opções, Priority/opções, tipos, equipe e workflows
estão em [`.github/sdd.json`](../.github/sdd.json). São um registro auditado;
configuração local não substitui releitura do GitHub. Os scripts continuam
resolvendo o Project/Status pelo número e nomes no estado remoto.

## Auto-add e fallback

Workflow nativo **Auto-add to project** habilitado para `gaydevs-platform`:

```text
is:issue type:Feature,Bug,Refactor,"Tech Debt"
```

Filtro salvo e relido na interface; habilitação relida via gh. A inclusão foi
observada nos quatro tipos usando fixtures técnicas. Task e sem tipo ficaram
fora após atualizações e nova leitura; Team Access atual é sem tipo. `is:issue`
exclui PRs. Outros tipos não pertencem à lista positiva.

Somente dois workflows estão ativos:

- Auto-add to project: filtro acima;
- Item added to project: define **Backlog**.

Foram desativados os defaults Auto-add sub-issues, Auto-close issue, Item closed,
Pull request linked to issue e Pull request merged, para não introduzir entradas
fora do filtro ou antecipar automações finais de PR/release.

A inclusão é assíncrona: a fixture Feature demorou além da primeira janela de
verificação, mas apareceu na releitura. Para uma Issue nova elegível, se o card
não aparecer ou o workflow estiver indisponível, o fallback explícito é:

```sh
node scripts/sdd/status.mjs NUMERO Backlog
```

Consultar primeiro o card para não resetar um trabalho em andamento. O script
exige tipo nativo e marcador correspondente do form, e reutiliza o mesmo item
quando ele já existe. O filtro nativo seleciona por tipo; não autentica a origem
do form nem exige o marcador. Auto-add também não remove cards já adicionados
quando o tipo muda. Esses casos precisam de revisão explícita. A regra atual
cobre somente este repo; futuros repos exigem configurar e validar sua entrada.

## Validação ao vivo e local

Fixtures [#10](https://github.com/gaydevs/gaydevs-platform/issues/10) e
[#11](https://github.com/gaydevs/gaydevs-platform/issues/11) usadas exclusivamente
para QA da configuração, restauradas a Tech Debt, encerradas e com cards Done
arquivados ao final. Não são demandas de produto.

- Auto-add dos quatro tipos; exclusão de Task e sem tipo; Team Access #7 fora
  do board e recusado pelo script; nenhuma Issue de produto criada.
- Item contém o node ID da própria Issue; adição repetida não duplicou o card.
- High, Low e Medium escritos por `priority.mjs` e relidos na Issue e no card.
- Status escritos e relidos via gh; Backlog/Specifying também exercitados pelo
  CLI `status.mjs`. Done validado após encerrar a fixture.
- `dependency.mjs` adicionou #10 blocked by #11; leitura confirmou também
  #11 blocking #10. Ready e In Progress foram recusados com blocker aberto.
  Relação removida pelo script e ausência relida nos dois sentidos.
- `node --test scripts/sdd/*.test.mjs`: 12 testes passaram.
- Configurações remotas relidas após alterações; JSON e diff local conferidos.

`status.mjs` preserva o limite desta implantação: Backlog, Specifying, Ready e
In Progress. Os sete Status são manipuláveis pela API gh; os exercícios de QA
não representam aprovação humana nem implantação das transições finais.
A configuração de permissões permite o uso por gdevs com Write e token `project`;
o teste real de escrita foi feito com a conta admin disponível.

## Rodada 2B — integração e proteções

Escopo autorizado por `luvittor` em 2026-09-30 nesta sessão: complementar as
proteções existentes, publicar/integrar o checkpoint por PR, validar a entrada
SDD a partir de develop e preparar a promoção administrativa. Essa autorização
não equivale a review de outro gdev, aprovação de PR ou autorização para ignorar
os gates humanos. A Issue #8 permanece aberta como registro administrativo;
seu texto original descreve a fase 1.

Auditoria de entrada via gh: checkout limpo e publicado em `8a1927f`, quatro
commits à frente de develop e nenhum atrás. `develop` em `198b176`, `main` em
`da1f4f0`, default main, nenhum PR aberto e PR #9 já mergeado. Os 55 arquivos
do checkpoint SDD ainda não estavam em develop. Nenhuma Feature foi criada.

Foram complementadas as duas proteções clássicas existentes, preservando os
IDs `BPR_kwDOUr_iks4E_l-4` (develop) e `BPR_kwDOUr_iks4E_hxw` (main). As alterações
foram relidas pela API após cada gravação. Não foram criadas rulesets sobrepostas.

| Controle | develop | main |
| --- | --- | --- |
| PR e aprovação obrigatória | 1 de outro gdev com Write | 1 e code owner habilitado; ativação depende de CODEOWNERS na base |
| Invalidar aprovação quando o diff mudar | Sim | Sim |
| Conversas resolvidas | Obrigatório | Obrigatório |
| Aplicar também aos admins | Sim | Sim |
| Bypass explícito de PR | Nenhum | Nenhum |
| Atualização/merge | Gdevs com permissão, cumprindo o PR | Team `gdevs-admins`; admins mantêm acesso nativo, cumprindo o PR |
| Descartar reviews | Permissão padrão do GitHub | Team `gdevs-admins` |
| Force push / exclusão | Bloqueados | Bloqueados |
| Histórico linear obrigatório | Não | Não |
| Checks obrigatórios | Nenhum | Nenhum |

PR e review obrigatórios restringem push direto também para admins. O GitHub
impede autoaprovação nativamente. Não foi exigido o deploy como check de PR:
ele executa depois do push e somente para os caminhos já configurados.
O merge commit continua permitido para preservar o histórico.

### Aprovação administrativa e limites

`.github/CODEOWNERS` usa `* @gaydevs/gdevs-admins`. O team Visible tem acesso
Admin explícito ao repo. A exigência de code owner está ligada somente em
main; develop continua permitindo review de outro gdev com Write.
O GitHub usa o CODEOWNERS da **branch base**, portanto a aprovação administrativa
não está tecnicamente garantida até esse arquivo chegar a main. O primeiro PR
que o instala exige conferência humana da aprovação administrativa. A restrição
de merge em main já está ativa. Reviews de outros gdevs continuam permitidos;
após o bootstrap não substituem o code owner obrigatório.

Enquanto houver apenas um membro em `gdevs-admins`, outro gdev precisa abrir o
PR `develop → main` para que esse membro possa aprová-lo. Não criar a promoção
pela conta do único code owner e depois dispensar seu review.
A branch de origem normalmente deve ser develop, mas não existe filtro de head
branch nessa proteção clássica: essa conferência fica com o admin. A composição
administrativa passa a ser gerenciada no team, sem editar CODEOWNERS ou as listas
por mudança de membro. O team deve permanecer Visible e com Admin no repo.
Admins externos ao team mantêm acesso nativo de atualização, mas não substituem
a aprovação de um membro do team quando CODEOWNERS estiver na base. Administradores ainda
podem editar as próprias configurações; não existe garantia contra essa ação.

O repo é público e a organização usa Free: proteções clássicas estão disponíveis.
A API de rulesets do repo retornou lista vazia, inclusive com herança; a API de
rulesets da organização retornou 403 exigindo GitHub Team. Nenhum upgrade foi
feito. A primeira falha de gh nesta sessão foi de rede do sandbox; a consulta
com acesso de rede confirmou autenticação válida e os escopos necessários.

### Integração e verificações pendentes de review humano

Validação local da Rodada 2B: os 12 testes de `node --test scripts/sdd/*.test.mjs`
passaram, e `git diff --check` não encontrou erros. O diff de frontend/backend
e do workflow de deploy contra origin/main permaneceu vazio. A releitura GraphQL
confirmou os mesmos dois IDs de proteção e zero permissões de bypass de PR.

O [PR #12](https://github.com/gaydevs/gaydevs-platform/pull/12) foi publicado de
`techdebt/00008-sdd-foundation` para develop, incluindo o commit `ad1f81f` da 2B.
A releitura ao vivo confirmou `MERGEABLE`, `BLOCKED`, `REVIEW_REQUIRED` e nenhuma
review: não há conflito de merge, mas o gate de aprovação está bloqueando o PR
mesmo para a conta admin/autora. A API de erros de CODEOWNERS na branch do PR
retornou `errors: []`. Isso valida o arquivo publicado, não sua ativação em main.

O workflow de deploy em main e na branch do PR tem o mesmo blob
`610f6678f38197b440e4e6875052710695864480`. Os workflows finais de Project seguem
desativados; apenas Auto-add e Item added estão ativos. A comparação ao vivo de
develop com main retornou zero arquivos diferentes antes da integração do #12;
não foi criado um PR vazio de promoção para simular uma validação de release.
As proteções de main foram relidas, mas o comportamento de uma promoção real e
o início SDD em origin/develop continuam pendentes. A Rodada 2B não está concluída.

O checkpoint deve entrar por esse PR, com
`Refs #8`, review de outro gdev e **Create a merge commit**. Não recriar o PR #9,
não fazer squash/rebase do checkpoint e não fechar a Issue #8 nessa integração.

Enquanto esse PR não for integrado, origin/develop não contém os scripts nem os
templates SDD. Não declarar `from-issue --start` validado nessa base. Após o merge,
executar em checkout isolado de origin/develop com uma fixture técnica Tech Debt,
consultando primeiro Issue/dependências e respeitando o número atribuído pelo
GitHub; verificar branch derivada de develop, rascunho único, contexto remoto
relido e Status. Não esperar ponteiro ou snapshot local de contexto.
Não implementar uma Feature nem aprovar spec/plan durante essa verificação.

Depois, outro gdev abre a promoção `develop → main`, com `Refs #8`; um membro
de `gdevs-admins` aprova e o merge é realizado por admin. Os forms só aparecem na
interface de New Issue depois de chegarem à default main. Reler CODEOWNERS,
proteções e estado do PR antes de
considerar esse gate validado. Nenhuma aprovação/merge foi automatizada.

### Governança administrativa — 2026-10-01

Correção autorizada por `luvittor` nesta sessão, sem merge do PR #12. A auditoria
encontrou somente `gdevs-team` (Write); não existia team administrativo equivalente.
Foi criado [gdevs-admins](https://github.com/orgs/gaydevs/teams/gdevs-admins), ID
`19830724`, node ID `T_kwDOE-iGEc4BLpfE`, Visible (`privacy: closed` na API).
`luvittor` é o membro inicial ativo, com papel maintainer atribuído na criação.
O team recebeu Admin explícito no repo; `gdevs-team` manteve Write.

As listas de atualização e descarte de reviews de main passaram de `luvittor`
para `gdevs-admins`, com listas de usuários vazias. Os demais gates foram
preservados. A referência pessoal anterior em CODEOWNERS foi substituída pelo
team no mesmo PR #12. Os registros de auditoria da conta acima são históricos.
Esta mudança concede Admin no repositório, não o papel de owner da organização.

Validação ao vivo via REST/GraphQL: team Visible, membership ativa, Admin no repo
e Write de `gdevs-team` confirmados. Comparação dos snapshots antes/depois mostrou
develop idêntica e main alterada somente nas listas de usuários/teams de atualização
e descarte de reviews; todos os outros gates e zero bypass foram preservados.
Os 12 testes SDD passaram e `git diff --check` passou. Frontend, backend, deploy,
`.specify/feature.json` e `.specify/context` não foram alterados naquela correção
de governança; a dependência desses mecanismos foi removida na correção abaixo.

### Contexto local pela branch — 2026-10-01

Correção arquitetural autorizada nesta sessão, no mesmo PR #12 e sem merge.
O resolver compartilhado do Spec Kit passou a usar a branch Git deste worktree,
extrair o ID SDD e exigir exatamente uma pasta `specs/NNNNN-*`. Branch inválida,
spec ausente e ambiguidade falham claramente. `SPECIFY_FEATURE_DIRECTORY` pode
selecionar uma pasta existente somente no ambiente da execução; não é gravado
em arquivo, cache, configuração Git ou ambiente persistente. `SPECIFY_FEATURE`
é recusado explicitamente, orientando usar a branch SDD ou o override de diretório.

`from-issue` deixou de gravar `.specify/feature.json` e `.specify/context/NNNNN.json`.
Resíduos antigos permanecem ignorados e nunca participam da resolução, mesmo
com JSON inválido ou dados obsoletos. Não foi criado um substituto global. Issue,
comentários, Priority e dependências devem ser relidos por `issue.mjs` via gh.
A auditoria não encontrou outro ponteiro de feature no fluxo instalado; os
manifests/registries são configurações de instalação/projeto. As extensões
opcionais git/agent-context não estão instaladas. Origem upstream, adaptações e
limites estão documentados em [UPSTREAM.md](../.specify/UPSTREAM.md).

Validação: **22 testes passaram** em `node --test scripts/sdd/*.test.mjs`, incluindo:

- Os quatro prefixos de branch, troca entre duas features e worktrees independentes.
- Erros de branch inválida, detached HEAD sem override, spec ausente e ambiguidade.
- Override relativo/absoluto efêmero, execução sem Git com override e rejeição de
  SPECIFY_FEATURE mesmo combinado com override válido.
- Resíduos legados inalterados, ausência de cache substituto e infraestrutura
  compartilhada sem alterações durante a resolução.
- `from-issue` com Git real e remoto bare local, `setup-plan`, `setup-tasks` e
  contratos de `check-prerequisites` usados por implement/analyze/clarify/checklist/converge.
- Todos os testes SDD anteriores, com a expectativa do ponteiro removida.

Os testes usam repositórios/worktrees temporários, Git e PowerShell 7 reais e API
GitHub simulada para a fixture de from-issue. Nenhuma Feature real foi criada.
Frontend, backend e deploy permanecem intactos. Isso não substitui a validação
ao vivo após integrar o PR #12 em origin/develop; essa integração segue pendente
de review humano. Trabalhos simultâneos em branches diferentes exigem worktrees
separados, porque processos no mesmo checkout continuam compartilhando o HEAD Git.

### Deploy e separação da Rodada 2C

O workflow `.github/workflows/deploy.yml` foi preservado. Na auditoria, o último
[deploy](https://github.com/gaydevs/gaydevs-platform/actions/runs/36479654739)
de main, commit `da1f4f0`, estava concluído com sucesso. O gatilho segue sendo
push em main/master com alteração de `frontend/**` ou do próprio workflow,
além de workflow_dispatch. Uma promoção só de infraestrutura SDD não dispara
esse deploy automaticamente. Nenhum deploy manual foi disparado nesta rodada.

A formulação anterior deste registro atribuía automações/release completos à
2B. O recorte autorizado os reserva à **2C**: PR → Project (Review, Ready for
Release, Done), fechamento de Issues após produção, automação completa de
release, teste final com Feature real e remoção de SDD_PLAN.md. Esses itens não
foram implementados. Frontend/backend e adaptações do Spec Kit foram preservados.

Referências das capacidades nativas:
[proteções](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches),
[CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
e [reviews](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-proposed-changes-in-a-pull-request).
