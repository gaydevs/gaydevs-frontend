# Implantação SDD — fase 1

Auditoria: 2026-09-30. Registro: [Issue #8](https://github.com/gaydevs/gaydevs-platform/issues/8).
Escopo aprovado: [SDD_PLAN.md](../SDD_PLAN.md), limitado à primeira fase.

## Confirmado no GitHub via gh

- Repo canônico: `gaydevs/gaydevs-platform`; o remoto antigo `gaydevs-frontend`
  redireciona para o mesmo ID (`1388307090`). Conta auditada: `luvittor`, admin.
- Branch default: main. main e develop já têm proteção clássica com uma aprovação;
  admins não são obrigados a segui-la e resolução de conversas não é exigida.
  Não há rulesets. Nenhuma proteção foi alterada nesta rodada.
- Team Access existente preservado byte a byte; equipe `gdevs-team` existe.
- Tipos nativos existentes: Task, Bug e Feature. Refactor e Tech Debt **não foram
  criados**: API recusou por falta do escopo `admin:org`.
- Priority nativo já existe (ID `47412460`), com High, Medium, Low e Urgent,
  visível à organização. Não foi alterado. Scripts aceitam somente High/Medium/Low.
- Consultas reais de campos e dependências funcionaram. Issues anteriores #3,
  #6 e #7 estavam fechadas, sem valores nesses campos/dependências consultados.
- A Issue administrativa #8 foi criada como Task para rastrear o bootstrap;
  não é Feature de produto nem exemplo de entrada no fluxo SDD.
- Token disponível: repo, read:org, workflow, gist. Faltam project e admin:org.
  A leitura de Projects foi recusada; existência/configuração do board não pôde
  ser verificada. Não se assume que o Project inexista.

## Preparado no checkpoint local

- Quatro Issue Forms com tipos nativos e marcador de origem; preservado Team Access.
  Refactor/Tech Debt dependem da criação dos tipos remotos para funcionar plenamente.
- Spec Kit 1.0.13 oficial, integração generic, constitution, templates locais,
  instruções de gates humanos e estrutura specs/. Não há spec de produto criada.
- Scripts Node.js/gh para consulta, início, Priority, dependências e Status inicial.
  Sem Project configurado, início exige exceção explícita `--without-project`.
- Documentação de gdevs e AGENTS.md independentes de fornecedor de IA.
- O gerador sequencial foi substituído por entrada que exige Issue existente;
  IDs nunca são reservados nem alterados por colisão.

Este checkpoint não foi enviado/mergeado. Os forms só aparecem no GitHub após
integração na branch default. O início de trabalho exige infraestrutura presente
em origin/develop e checkout limpo; até a integração, o preflight interrompe.
main contém a reorganização em monorepo e outras mudanças ausentes de develop.
A branch administrativa `techdebt/00008-sdd-foundation` partiu do main atual para
preservar essa estrutura; é a exceção de bootstrap, não o padrão de novas Issues.

## Limitações e retomada

O Project, seus Status, visibilidade privada, permissões (organização Read,
gdevs-team Write, admins Admin), exposição de Priority e auto-add **não estão
confirmados/configurados por esta implantação**. `projectNumber` fica null em
`.github/sdd.json` para impedir operação contra um board presumido.

Para desbloquear, o titular autentica gh com `gh auth refresh -s project,admin:org`.
Depois consultar o estado atual, criar apenas os tipos faltantes, ajustar Priority
ao plano preservando valores em uso e criar/configurar ou reutilizar o Project.
Registrar seu número em `.github/sdd.json` e verificar com leitura via API.

Auto-add nativo deve incluir somente os quatro tipos de desenvolvimento e excluir
Team Access/outros/sem tipo. Como GitHub não oferece identidade imutável de form no
body, os scripts também exigem o marcador correspondente. Validar o filtro antes
de ativar; se a automação nativa não suportar a seleção, usar adição explícita via
`status.mjs NUMERO Backlog`. Esse fallback só funciona após acesso ao Project.
Nenhum workflow inativo ou secret fictício foi criado para simular automação.

## Validação desta rodada

- Testes unitários e de CLI isolada: IDs, quatro tipos, exclusões, trivialidade,
  leitura/priority, blockers, falha de API, checkout sujo e duplicação de branch.
- Leitura real de Issue/campos/dependências via gh e recusa de Team Access.
- Parse dos cinco forms YAML, scripts PowerShell e arquivos JSON; resolução do
  template override pelo CLI oficial; diff de preservação e whitespace.
- Operações de Project não puderam ser validadas ao vivo por falta de escopo.
  Nenhuma Feature foi implementada; frontend/backend/deploy não foram alterados.

## Próxima rodada

1. Resolver permissões acima e concluir tipos, Priority, Project e auto-add pendentes.
2. Publicar/integrar o checkpoint por PR, conciliando main/develop; ativar forms
   na default e tooling na base develop, com validação real ponta a ponta.
3. Configurar rulesets/proteções finais de develop/main, inclusive revisão por
   outro gdev, conversas resolvidas, restrições de push e controle de admin em main.
4. Implantar fluxo completo de release develop → main, identificação das Issues
   entregues, fechamento/Done apenas após produção e verificação do deploy.
5. Implantar automações finais PR → Project (Review, Ready for Release, Done).
