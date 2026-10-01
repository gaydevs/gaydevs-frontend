import { api, config, issueNumber, main } from './core.mjs';
main(() => {
  const [action, number, blockerNumber] = process.argv.slice(2);
  if (!['add', 'remove'].includes(action)) throw new Error('Uso: dependency.mjs add|remove ISSUE BLOCKER (mesmo repo).');
  const endpoint = `repos/${config.repository}/issues/${issueNumber(number)}/dependencies/blocked_by`;
  const blocker = api(`repos/${config.repository}/issues/${issueNumber(blockerNumber)}`);
  if (blocker.pull_request || Number(number) === blocker.number) throw new Error('Dependência inválida.');
  const result = action === 'add' ? api(endpoint, { method: 'POST', body: { issue_id: blocker.id } }) : api(`${endpoint}/${blocker.id}`, { method: 'DELETE' });
  console.log(JSON.stringify(result));
});
