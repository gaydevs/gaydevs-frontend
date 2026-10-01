# Objetivo

Adotar **Spec Driven Development (SDD)** no `gaydevs/gaydevs-platform`, usando o GitHub como sistema central de gestão do trabalho.

```text
GitHub Issue
    ↓
GitHub Project
    ↓
Spec Kit
    ↓
spec.md
    ↓
plan.md
    ↓
tasks.md
    ↓
implementação
    ↓
PR → develop
    ↓
Ready for Release
    ↓
PR develop → main
    ↓
produção / Done
```

Responsabilidades:

- **Issue** = card, demanda inicial e ID central.
- **Project** = backlog, status, prioridade e visão do trabalho.
- **Spec Kit** = processo SDD.
- **gh** = automação entre repo, Issues, Project, branches e PRs.
- **Git** = versionamento e fluxo de entrega.
- **Agente de IA** = opcional e intercambiável.

O processo deve funcionar com qualquer agente escolhido pelo gdev.

---

# 1. Terminologia

Usar consistentemente:

- **gdev** = uma pessoa que contribui;
- **gdevs** = pessoas que contribuem;
- gdevs-team = time dos gdevs dentro da organização gaydevs;
- **gaydevs** = organização/comunidade;
- **gaydevs-platform** = repositório da plataforma.

Evitar usar genericamente `dev` ou `developer` na documentação destinada aos gdevs.

---

# 2. GitHub Issues

Toda atividade relevante começa por uma Issue.

Criar templates/forms para:

- Feature
- Bug
- Refactor
- Tech Debt
- Team Access

## Conceitos

**Feature**
Novo comportamento ou capacidade.

**Bug**
Comportamento existente incorreto.

**Refactor**
Mudança interna intencional sem alteração relevante do comportamento externo.

**Tech Debt**
Problema técnico acumulado que precisa ser tratado, podendo envolver refactor, testes, dependências, arquitetura, observabilidade etc.

**Team Access**
Entrada de um gdev no time; não participa do fluxo SDD.

Qualquer outro template de Issue ou Issue sem template não entra no fluxo

---

# 3. Quando gerar spec

```text
Feature     → sempre
Bug         → quando não trivial
Refactor    → quando não trivial
Tech Debt   → quando não trivial
Team Access → nunca
Outros Templates -> nunca
Sem Templates -> nunca
```

Trabalhos triviais podem seguir diretamente pela Issue e PR.

---

# 4. ID central

O número da Issue é o ID central.

Converter para cinco dígitos:

```text
Issue #27
→ 00027
```

Exemplo:

```text
Issue #27
Spec 00027

specs/00027-passwordless-login/
├── spec.md
├── plan.md
└── tasks.md
```

A Issue deve existir **antes** da spec ou branch.

Nunca reservar IDs manualmente.

---

# 5. GitHub Project

Criar um Project privado da organização:

```text
gaydevs project
```

O Project poderá acompanhar múltiplos repos da organização no futuro.

Permissões:

```text
membros da organização gaydevs
→ Read

gdevs-team
→ Write

admins
→ Admin
```

Todos da organização podem acompanhar.

Os gdevs do `gdevs-team` e agentes autenticados com suas permissões podem atualizar cards.

---

# 6. Issue e card são vinculados

Ao adicionar uma Issue ao Project, o item do board representa a própria Issue.

Não criar uma segunda entidade manual para representar o trabalho.

A Issue continua sendo a origem de:

- título;
- descrição;
- tipo;
- relações;
- responsáveis;
- comentários;
- estado open/closed.

O Project acrescenta a visão de planejamento.

## Priority

Preferir `Priority` como **Issue Field da organização**, com:

```text
High
Medium
Low
```

Assim o valor acompanha a Issue e pode ser alterado tanto pela Issue quanto pelo Project.

## Status

`Status` pertence ao fluxo do Project.

---

# 7. Board

Usar:

```text
Backlog
↓
Specifying
↓
Ready
↓
In Progress
↓
Review
↓
Ready for Release
↓
Done
```

## Backlog

Registrado, ainda não iniciado.

## Specifying

`spec.md` e/ou `plan.md` em elaboração.

## Ready

Spec e plan aprovados e prontos para implementação.

## In Progress

Implementação em andamento.

## Review

PR para `develop` aguardando revisão por pares.

## Ready for Release

PR da feature já foi aprovado e integrado em `develop`, mas ainda não está em produção.

## Done

Trabalho chegou a `main`, foi publicado quando aplicável e a Issue foi encerrada.

---

# 8. Dependências

Usar relações nativas de Issues:

```text
blocked by
blocking
```

Exemplo:

```text
Enquetes
blocked by
Login passwordless
```

Não criar campo customizado para dependências.

O agente deve consultar as dependências antes de iniciar uma Issue.

Uma Issue com blockers abertos não deve normalmente avançar para `Ready` ou `In Progress`.

O Project pode continuar exibindo a Issue no backlog e o GitHub sinalizará que ela está bloqueada.

Dependências também devem ser manipuláveis por `gh`.

---

# 9. Movimentação dos cards

Na rotina normal, o gdev não deve precisar arrastar cards manualmente.

O agente, scripts e automações nativas devem manter o Status sincronizado.

```text
Issue criada
→ Backlog

spec iniciada
→ Specifying

spec + plan aprovados
→ Ready

implementação iniciada
→ In Progress

PR para develop aberto
→ Review

PR para develop mergeado
→ Ready for Release

PR para main mergeado
→ Done
```

Movimentação manual continua permitida como exceção.

---

# 10. Issue criada pela interface

Um gdev pode:

1. abrir `New Issue`;
2. escolher o template;
3. preencher as informações;
4. criar a Issue;
5. pedir ao agente:

```text
Leia a Issue #27 e comece.
```

O agente consulta o GitHub via `gh` e continua o fluxo.

---

# 11. Issue criada pelo agente

Um gdev também pode pedir:

```text
Crie uma Feature para login passwordless.
```

O agente deve:

1. consultar o repo e o Project;
2. criar a Issue com tipo/template adequado;
3. adicionar ao Project;
4. definir os campos iniciais;
5. obter o número atribuído pelo GitHub;
6. gerar o ID de cinco dígitos;
7. continuar o SDD.

Depois de criada, não há diferença entre uma Issue criada pela interface e uma criada pelo agente.

---

# 12. Spec Kit

Instalar na raiz:

```text
gaydevs-platform/
├── frontend/
├── backend/
├── specs/
├── .specify/
└── ...
```

Uma feature possui uma única spec, mesmo quando envolve:

```text
frontend/
backend/
```

Não separar specs de frontend e backend.

---

# 13. Constitution

Definir uma constitution curta:

- SDD como processo padrão;
- Feature exige spec;
- uma feature = uma spec;
- Issue é a origem do ID;
- requisitos devem ser verificáveis;
- critérios de aceite são obrigatórios;
- alterações de escopo atualizam a spec;
- decisões técnicas ficam no `plan.md`;
- frontend e backend podem pertencer à mesma spec;
- processo agnóstico de agente;
- gates humanos obrigatórios;
- agentes devem manter GitHub e Project sincronizados;
- dependências entre Issues devem ser respeitadas.

---

# 14. `spec.md`

Define **o que** deve existir.

Pode incluir:

- problema;
- objetivo;
- contexto;
- comportamento;
- fluxos;
- requisitos;
- regras;
- erros;
- restrições;
- critérios de aceite;
- questões em aberto.

Não antecipar desnecessariamente implementação.

## Gate

O gdev revisa e aprova a spec antes do plan.

---

# 15. `plan.md`

Define **como** implementar a spec aprovada.

Pode incluir:

- frontend;
- backend;
- API;
- banco;
- modelos;
- autenticação;
- autorização;
- segurança;
- arquitetura;
- dependências;
- migrations;
- testes;
- deploy;
- infraestrutura.

## Gate

O gdev revisa e aprova o plan antes da implementação.

---

# 16. `tasks.md`

Decompõe o plan em trabalho executável.

Exemplo:

```text
- criar migration
- criar endpoint
- implementar token
- criar tela
- integrar frontend/API
- adicionar testes
```

Inicialmente as tasks permanecem em `tasks.md`.

Não criar automaticamente uma Issue para cada task.

---

# 17. Branches

Convenções:

```text
feat/00027-passwordless-login
fix/00031-chrome-background
refactor/00035-member-service
techdebt/00041-update-dependencies
```

Todas derivam do número da Issue.

---

# 18. Fluxo Git

```text
feat/fix/refactor/techdebt
          ↓
       develop
          ↓
        main
          ↓
      produção
```

## `develop`

Branch de integração.

PR para `develop`:

- obrigatório;
- sem push direto na rotina normal;
- exige aprovação de pelo menos outro gdev com permissão adequada;
- autor não deve aprovar o próprio PR;
- conversas/revisões pendentes devem ser resolvidas antes do merge.

## `main`

Representa produção.

PR para `main`:

- parte normalmente de `develop`;
- somente admin pode aprovar/efetivar o merge;
- merge em `main` dispara o deploy automático já existente;
- push direto deve ser restringido.

Configurar branch protection/rules adequadas para garantir o fluxo.

---

# 19. PR da feature

Uma feature normalmente abre:

```text
branch da feature
→ develop
```

O PR deve referenciar:

```text
Spec: 00027
Refs #27
```

Não usar `Closes #27` nesse PR, porque a feature ainda não chegou a produção.

O PR deve incluir de forma objetiva:

- resumo;
- testes;
- critérios de aceite relevantes;
- riscos quando existirem.

Quando o PR é aberto:

```text
In Progress → Review
```

Quando é mergeado em `develop`:

```text
Review → Ready for Release
```

---

# 20. Release para `main`

O admin realiza:

```text
develop
→ PR
→ main
```

O merge em `main` representa publicação em produção.

Depois da entrada em `main`, o processo deve:

- fechar as Issues entregues;
- atualizar os cards para `Done`;
- executar o deploy automático quando aplicável.

O agente ou automação pode ajudar a identificar quais Issues do release devem ser encerradas.

---

# 21. GitHub CLI

Qualquer agente deve saber trabalhar com o repo via `gh`.

Verificações básicas:

```bash
gh --version
gh auth status
gh repo set-default gaydevs/gaydevs-platform
```

Para Projects:

```bash
gh auth refresh -s project
```

O agente deve consultar o estado real do GitHub antes de fazer alterações.

Não assumir Issue, branch, PR, dependência ou Status apenas pelo contexto da conversa.

---

# 22. Automação Issue → Spec

Criar comando/script agnóstico de agente.

Conceitualmente:

```text
from-issue 27
```

Ele deve obter pelo `gh`:

- número;
- título;
- body;
- tipo;
- labels;
- responsável;
- comentários relevantes;
- URL;
- blockers;
- Issues bloqueadas.

Esses dados alimentam a criação da spec.

A Issue não deve ser simplesmente copiada para `spec.md`.

---

# 23. Automação esperada

Ao começar:

```text
Issue #27
↓
00027
↓
verificar blockers
↓
Project → Specifying
↓
criar branch
↓
criar spec
↓
comentar Issue com branch/spec
↓
gate humano
```

Após aprovação:

```text
plan
↓
gate humano
↓
tasks
↓
In Progress
↓
implementação
↓
PR
```

O agente deve cuidar das transições de Status sempre que possuir permissão.

---

# 24. Auto-add ao Project

Adicionar automaticamente ao Project Issues de:

- Feature;
- Bug;
- Refactor;
- Tech Debt.

Qualquer outro tipo de issue (ex Team Access), ou issue sem tipo, fica fora do board de desenvolvimento.

Caso alguma limitação da automação nativa impeça o auto-add, o agente deve adicionar explicitamente a Issue ao Project via `gh`.

---

# 25. GitHub Project multi-repo

O Project pertence à organização `gaydevs`.

No futuro poderá incluir:

```text
gaydevs-platform
gaydevs-mobile
gaydevs-infra
...
```

O mesmo processo e board poderão acompanhar vários repos.

---

# 26. Regras para agentes

Qualquer agente deve:

1. usar o GitHub atual como fonte de verdade;
2. consultar `gh` antes de agir;
3. respeitar Issue → ID → spec → branch;
4. verificar blockers;
5. atualizar o Project;
6. respeitar os gates humanos;
7. não implementar escopo não aprovado silenciosamente;
8. manter Issue, spec, branch e PR rastreáveis;
9. não depender de características exclusivas de um agente específico.

---

# 27. O que exige decisão humana

Não automatizar silenciosamente:

```text
aprovação do spec.md
aprovação do plan.md
review do PR para develop
aprovação/merge do PR para main
```

---

# 28. Documentação para gdevs

A documentação de onboarding deve ser **curta e direta ao ponto**.

Não duplicar este plano inteiro no HOWTO.

Criar:

```text
README.md
CONTRIBUTING.md
docs/development-workflow.md
```

## README

Apenas apresentar o repo e apontar para como contribuir.

## CONTRIBUTING.md

Resumo operacional necessário para começar.

## `docs/development-workflow.md`

HOWTO curto explicando:

```text
Issue
→ Spec
→ Plan
→ Tasks
→ código
→ develop
→ main
→ produção
```

Deve explicar explicitamente:

- qualquer gdev pode usar o agente de IA que preferir;
- agente de IA não é obrigatório (mas altamente recomendável);
- Issue pode ser criada pela interface ou pelo agente;
- número da Issue vira ID da spec;
- Project é o board;
- gdev normalmente não precisa movimentar cards;
- agente deve atualizar o card via `gh`;
- dependências usam `blocked by / blocking`;
- `spec.md` = o quê;
- `plan.md` = como;
- `tasks.md` = execução;
- PR para `develop` exige review de outro gdev;
- `main` é produção;
- merge em `main` é controlado por admin;
- `main` dispara deploy automático;
- Issue só fica Done quando entregue em produção.

O HOWTO deve permitir que um gdev entenda o fluxo em poucos minutos.

---

# 29. Experiência desejada

## Pela interface

```text
1. gdev cria Issue pelo template
2. recebe #27
3. pede ao agente:
   "Leia a Issue #27 e comece"
4. agente consulta GitHub
5. cria Spec 00027
6. gdev aprova spec
7. gdev aprova plan
8. agente implementa
9. outro gdev revisa PR
10. merge em develop
11. admin promove develop para main
12. produção / Done
```

## Pelo agente

```text
1. gdev pede para criar uma Feature
2. agente cria Issue
3. GitHub gera #27
4. agente adiciona ao Project
5. agente inicia Spec 00027
6. segue exatamente o mesmo fluxo
```

---

# 30. Princípio final

Um gdev deve poder simplesmente dizer:

```text
Leia a Issue #27 e comece.
```

O agente deve descobrir pelo próprio `gaydevs-platform`:

- como acessar GitHub;
- como trabalhar com o Project;
- como verificar dependências;
- como gerar o ID;
- como criar branch/spec;
- quando pedir aprovação;
- quando alterar Status;
- como abrir PR;
- como seguir até `develop`;
- quando o trabalho estará realmente `Done`.

O processo também deve permanecer totalmente utilizável por gdevs sem agente de IA.
