# Constitution — gaydevs-platform

Versão 1.0.0 · ratificada em 2026-09-30 para a fase inicial autorizada.

1. SDD é o processo padrão. Toda Feature exige spec; Bug, Refactor e Tech Debt
   exigem spec quando não triviais. Team Access e entradas fora desses forms ficam fora.
2. A Issue deve existir antes da branch/spec. Seu número, preenchido até cinco
   dígitos, é o ID central. Nunca reservar IDs ou renumerar por colisão.
3. Uma feature = uma spec, mesmo envolvendo frontend e backend.
4. Requisitos verificáveis e critérios de aceite são obrigatórios.
5. `spec.md` define o quê; decisões técnicas ficam em `plan.md`; `tasks.md`
   decompõe a execução, sem criar automaticamente novas Issues.
6. Alterações de escopo atualizam a spec e exigem nova aprovação do que mudou.
7. Um gdev aprova a spec antes do plan e o plan antes das tasks/implementação.
   Agentes não aprovam seus próprios artefatos nem inventam evidência de aprovação.
8. O processo é agnóstico de agente e utilizável sem IA. GitHub real, consultado
   por gh, é a fonte de verdade para Issue, tipo, prioridade, dependências e Status.
9. Respeitar blocked by / blocking. Blockers abertos impedem normalmente Ready
   e In Progress; nossos scripts interrompem o início até sua resolução.
10. Agentes mantêm Issue, branch, spec e Project rastreáveis e sincronizados quando
    possuem permissão; falhas de acesso devem ser informadas, nunca ocultadas.
11. Revisão de outro gdev para PR → develop e aprovação/merge de admin para main
    são gates humanos. A implantação final das proteções/releases fica para a fase 2.
12. Done só após entrega em main/produção quando aplicável e encerramento da Issue.
    Rejected e Canceled encerram a Issue como Not planned: Rejected para demandas
    analisadas e recusadas, Canceled para demandas aceitas/iniciadas e depois
    interrompidas.

Governança: esta constitution prevalece sobre defaults do Spec Kit. Mudanças
exigem revisão humana; não atribuir aprovação com base apenas em execução de script.
