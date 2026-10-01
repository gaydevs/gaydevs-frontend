import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const root = fileURLToPath(new URL('../../', import.meta.url));
export const config = JSON.parse(readFileSync(path.join(root, '.github/sdd.json'), 'utf8'));
const windowsGh = 'C:/Program Files/GitHub CLI/gh.exe';
export const ghBinary = process.env.GH_BIN || (process.platform === 'win32' && existsSync(windowsGh) ? windowsGh : 'gh');
export function run(command, args, input) {
  const result = spawnSync(command, args, { cwd: root, input, encoding: 'utf8', shell: false });
  if (result.error || result.status !== 0) throw new Error(result.error?.message || result.stderr || `${command} failed (${result.status})`);
  return result.stdout.trim();
}
export const git = (...args) => run('git', args);
export function api(endpoint, { method = 'GET', body, paginate = false } = {}) {
  const args = ['api', endpoint, '-X', method, '-H', 'X-GitHub-Api-Version: 2026-03-10'];
  if (paginate) args.push('--paginate', '--slurp');
  if (body !== undefined) args.push('--input', '-');
  const value = JSON.parse(run(ghBinary, args, body === undefined ? undefined : JSON.stringify(body)) || 'null');
  return paginate ? value.flat() : value;
}
export function graphql(query, variables = {}) {
  const response = api('graphql', { method: 'POST', body: { query, variables } });
  if (response.errors) throw new Error(JSON.stringify(response.errors));
  return response.data;
}
export function issueNumber(value) {
  if (!/^[1-9]\d*$/.test(String(value)) || !Number.isSafeInteger(Number(value))) throw new Error('Informe um número positivo de Issue.');
  return Number(value);
}
export function sddIdentity(issue, { trivial = false, requireOpen = true } = {}) {
  const type = issue.type?.name;
  const prefix = config.types[type];
  // The form marker also allows agents to create an equivalent issue through the API.
  if (!prefix || !issue.body?.includes(`<!-- gaydevs-sdd:${type} -->`)) throw new Error('Issue fora do SDD: exige tipo nativo e marcador do form correspondente.');
  if (issue.pull_request) throw new Error('O número pertence a um PR.');
  if (requireOpen && issue.state !== 'open') throw new Error('A Issue precisa estar aberta para iniciar trabalho.');
  if (trivial && type === 'Feature') throw new Error('Feature sempre exige spec.');
  const id = String(issueNumber(issue.number)).padStart(5, '0');
  const slug = issue.title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70).replace(/-$/, '') || 'issue';
  return { id, type, branch: `${prefix}/${id}-${slug}`, directory: `specs/${id}-${slug}`, needsSpec: !trivial };
}
export function identity(issue, trivial = false) {
  return sddIdentity(issue, { trivial });
}
export function readIssue(number) {
  const endpoint = `repos/${config.repository}/issues/${issueNumber(number)}`;
  const issue = api(endpoint);
  return {
    issue,
    comments: api(`${endpoint}/comments?per_page=100`, { paginate: true }),
    fields: api(`${endpoint}/issue-field-values?per_page=100`, { paginate: true }),
    blockedBy: api(`${endpoint}/dependencies/blocked_by?per_page=100`, { paginate: true }),
    blocking: api(`${endpoint}/dependencies/blocking?per_page=100`, { paginate: true }),
  };
}
export function assertUnblocked(context) {
  const open = context.blockedBy.filter(issue => issue.state === 'open');
  if (open.length) throw new Error(`Blockers abertos: ${open.map(issue => issue.html_url).join(', ')}`);
}
export function project() {
  if (!config.projectNumber) throw new Error('Project ainda não configurado em .github/sdd.json.');
  const data = graphql(`query($org:String!,$number:Int!){organization(login:$org){projectV2(number:$number){id title fields(first:100){nodes{... on ProjectV2SingleSelectField{id name options{id name}}}}}}}`, { org: config.organization, number: config.projectNumber });
  const value = data.organization?.projectV2;
  if (!value || value.title !== config.projectTitle) throw new Error('Project configurado não encontrado ou título divergente.');
  return value;
}
export function setStatus(issue, status, board = project()) {
  if (!config.statuses.includes(status)) throw new Error('Status desconhecido.');
  const field = board.fields.nodes.find(field => field.name === 'Status');
  const option = field?.options.find(option => option.name === status);
  if (!option) throw new Error(`Status ${status} não configurado no Project.`);
  const added = graphql(`mutation($project:ID!,$issue:ID!){addProjectV2ItemById(input:{projectId:$project,contentId:$issue}){item{id}}}`, { project: board.id, issue: issue.node_id });
  graphql(`mutation($project:ID!,$item:ID!,$field:ID!,$option:String!){updateProjectV2ItemFieldValue(input:{projectId:$project,itemId:$item,fieldId:$field,value:{singleSelectOptionId:$option}}){projectV2Item{id}}}`, { project: board.id, item: added.addProjectV2ItemById.item.id, field: field.id, option: option.id });
}
export function closeNotPlanned(issue) {
  if (issue.state === 'closed' && issue.state_reason === 'not_planned') return issue;
  return api(`repos/${config.repository}/issues/${issueNumber(issue.number)}`, {
    method: 'PATCH',
    body: { state: 'closed', state_reason: 'not_planned' },
  });
}
export function main(fn) { try { fn(); } catch (error) { console.error(error.message); process.exitCode = 1; } }
