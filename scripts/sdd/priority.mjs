import { api, config, issueNumber, main } from './core.mjs';
main(() => {
  const [number, value] = process.argv.slice(2);
  if (!['High', 'Medium', 'Low'].includes(value)) throw new Error('Priority: High, Medium ou Low.');
  console.log(JSON.stringify(api(`repos/${config.repository}/issues/${issueNumber(number)}/issue-field-values`, { method: 'POST', body: { issue_field_values: [{ field_id: config.priorityFieldId, value }] } }), null, 2));
});
