# Specs

Uma Issue de Feature sempre gera uma spec. Bug, Refactor e Tech Debt exigem spec
quando não triviais. Team Access, outros forms e Issues sem form ficam fora.

`#27` → `00027` → `specs/00027-passwordless-login/`.
O número tem no mínimo cinco dígitos, sem truncar números maiores.
Uma Issue/feature possui uma única spec, inclusive quando abrange frontend/backend.
Nunca reservar, incrementar ou trocar IDs para contornar conflitos.

Crie pela Issue: `node scripts/sdd/from-issue.mjs 27 --start`.
O comando cria somente o rascunho `spec.md`. Depois da aprovação humana,
elabore `plan.md`; após sua aprovação, `tasks.md` e implementação.
Ao retomar, consulte a Issue novamente e use a pasta/branch existente.
Os helpers resolvem o ID pela branch do worktree e exigem exatamente uma pasta
`specs/NNNNN-*`. Não crie ponteiro de feature ou snapshot local da Issue.
