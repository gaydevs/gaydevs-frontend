# Fluxo de trabalho

Issue → spec (o quê) → plan (como) → tasks (execução) → código → PR para develop
→ release para main → produção. Cada gdev escolhe seu agente; IA é opcional e
altamente recomendável. O processo também funciona executando os comandos manualmente.

1. Crie a Issue na interface com o form correto ou peça ao agente. Feature exige
   spec; Bug, Refactor e Tech Debt exigem quando não triviais. Team Access, outros
   forms e Issues sem form ficam fora. Os forms SDD têm um marcador no body e tipo
   nativo correspondente; ambos são exigidos pelos scripts.
2. Consulte `node scripts/sdd/issue.mjs 27`: body, tipo, labels, responsáveis,
   comentários, Priority e relações blocked by / blocking vêm do GitHub atual.
   `node scripts/sdd/from-issue.mjs 27` também permite consultar Issues bloqueadas,
   sem alterar arquivos, branches ou Project. Blockers impedem início, não leitura.
3. Inicie com `node scripts/sdd/from-issue.mjs 27 --start`. O checkout deve estar
   limpo. O comando verifica blockers, busca `origin/develop`, cria branch e
   rascunho da spec, atualiza Project e comenta a Issue. Não publica a branch.
   Se falhar após criar a branch, inspecione os efeitos e retome; não recrie IDs.
4. `#27` vira `00027`. Branches: `feat/00027-slug`, `fix/00027-slug`,
   `refactor/00027-slug`, `techdebt/00027-slug`. Uma pasta `specs/00027-slug/`
   atende frontend e backend. Ao retomar, use a pasta existente e atualize
   `.specify/feature.json` com `{"feature_directory":"specs/00027-slug"}`.
5. Sintetize a spec; o rascunho não é uma spec pronta. Um gdev aprova spec antes
   do plan e plan antes das tasks/implementação. Registre a aprovação e sua origem
   nos artefatos. Tasks ficam em `tasks.md`, sem Issues automáticas por task.
6. PR para `develop`: resumo, testes, critérios de aceite, riscos relevantes,
   `Spec: 00027` e `Refs #27`. Revisão de outro gdev é obrigatória no processo.
   Não encerre a Issue na integração em develop.

O board previsto é **gaydevs project**, privado da organização. Status:
Backlog → Specifying → Ready → In Progress → Review → Ready for Release → Done.
Confira no [registro da implantação](sdd-implementation.md) quais recursos estão
ativos. Na rotina, agente/scripts devem atualizar o board via gh; arrastar cards
é uma exceção. Não há automação final de PR/release nesta fase.

```sh
node scripts/sdd/priority.mjs 27 Medium
node scripts/sdd/dependency.mjs add 27 12    # 27 blocked by 12
node scripts/sdd/dependency.mjs remove 27 12
node scripts/sdd/status.mjs 27 Ready --human-approved
node scripts/sdd/status.mjs 27 "In Progress" --human-approved
```

`--human-approved` declara aprovação recebida; não a concede nem a verifica em
um sistema de identidade. Blockers abertos impedem início/Ready/In Progress.
O agente não deve usar a opção sem evidência humana. Um trabalho trivial não
precisa dos gates de spec/plan; sua classificação e início precisam estar acordados.

Com Project indisponível, `--without-project` permite iniciar com aviso explícito
de sincronização pendente. Não equivale a card criado. Depois sincronize via
`status.mjs`; para um rascunho use `Specifying`.

`main` representa produção. O processo previsto reserva promoção/merge ao admin
e considera Done somente após entrega em produção e encerramento da Issue.
As proteções finais e o fluxo completo de release ainda não foram implantados.
O deploy existente roda em pushes de main/master que alterem frontend ou o
workflow de deploy, além de disparo manual; nem todo merge dispara deploy.
