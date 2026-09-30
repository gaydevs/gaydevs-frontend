# Implantação SDD — Rodada 2A

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

## Preparado para a Rodada 2B

1. Publicar/integrar o checkpoint SDD por PR para develop, com `Refs #8` e review
   de outro gdev. O PR #9 de reconciliação já foi concluído: não recriá-lo.
2. Disponibilizar forms na default e tooling na base develop com os gates
   humanos. Até a integração do tooling, `from-issue --start` recusa novas
   branches porque origin/develop ainda não contém a infraestrutura SDD.
3. Configurar rulesets/proteções finais de develop/main. Não há rulesets na
   consulta desta rodada; as proteções clássicas existentes não foram alteradas.
4. Implantar o fluxo completo develop → main, entrega/fechamento de Issues,
   Done após produção quando aplicável e verificação do deploy.
5. Implantar automações finais PR → Project (Review, Ready for Release, Done),
   respeitando revisão e aprovação/merge humanos.

Nenhuma proteção, release ou automação final de PR foi implantada nesta rodada.
Frontend/backend/deploy e adaptações do Spec Kit não foram alterados.
`SDD_PLAN.md` permanece no repo.
