import { main, readIssue, identity, assertUnblocked, setStatus } from './core.mjs';
main(() => {
  const [number, status] = process.argv.slice(2);
  const context = readIssue(number);
  identity(context.issue);
  if (!['Backlog', 'Specifying', 'Ready', 'In Progress'].includes(status)) throw new Error('Esta fase opera apenas Backlog, Specifying, Ready e In Progress.');
  if (['Ready', 'In Progress'].includes(status)) {
    assertUnblocked(context);
    if (!process.argv.includes('--human-approved')) throw new Error('Confirme os gates humanos com --human-approved; o agente não pode conceder aprovação.');
  }
  setStatus(context.issue, status);
  console.log(`Issue #${number}: ${status}`);
});
