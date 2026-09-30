import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { root } from './core.mjs';

// Isolated checkout and a process shim: no real GitHub writes or user Git changes.
// The shim validates the CLI/API boundary, including pagination and failure handling.
function fixture(options = {}) {
  const dir = mkdtempSync(path.join(tmpdir(), 'gaydevs-sdd-'));
  cpSync(path.join(root, 'scripts/sdd'), path.join(dir, 'scripts/sdd'), { recursive: true });
  cpSync(path.join(root, '.github/sdd.json'), path.join(dir, '.github/sdd.json'), { recursive: true });
  if (options.project) {
    const config = JSON.parse(readFileSync(path.join(dir, '.github/sdd.json')));
    config.projectNumber = 1;
    writeFileSync(path.join(dir, '.github/sdd.json'), JSON.stringify(config));
  }
  cpSync(path.join(root, '.specify/templates/overrides'), path.join(dir, '.specify/templates/overrides'), { recursive: true });
  mkdirSync(path.join(dir, 'specs'));
  writeFileSync(path.join(dir, 'options.json'), JSON.stringify(options));
  const shim = path.join(dir, 'shim.cjs');
  writeFileSync(shim, `
const fs = require('node:fs');
const cp = require('node:child_process');
const path = require('node:path');
const options = JSON.parse(fs.readFileSync(path.join(__dirname, 'options.json')));
cp.spawnSync = (command, args, spawnOptions) => {
  fs.appendFileSync(path.join(__dirname, 'calls.jsonl'), JSON.stringify({command,args,input:spawnOptions.input})+'\\n');
  const ok = stdout => ({status:0, stdout:typeof stdout === 'string'?stdout:JSON.stringify(stdout), stderr:''});
  if (command === 'git') {
    if (args[0] === 'status') return ok(options.dirty ? ' M changed' : '');
    if (args[0] === 'remote') return ok('https://github.com/gaydevs/gaydevs-platform.git');
    if (args[0] === 'branch') return ok(options.branchExists ? 'feat/00027-existing' : '');
    return ok('');
  }
  const endpoint = args[1];
  if (endpoint === 'graphql') {
    const body = JSON.parse(spawnOptions.input);
    if (body.query.includes('query(')) return ok({data:{organization:{projectV2:{id:'P_1',title:'gaydevs project',fields:{nodes:[{id:'F_1',name:'Status',options:[{id:'O_1',name:'Specifying'}]}]}}}}});
    if (body.query.includes('addProjectV2ItemById')) return ok({data:{addProjectV2ItemById:{item:{id:'ITEM_1'}}}});
    if (body.query.includes('updateProjectV2ItemFieldValue')) return ok({data:{updateProjectV2ItemFieldValue:{projectV2Item:{id:'ITEM_1'}}}});
  }
  if (options.apiFailure && endpoint.includes('blocked_by')) return {status:1,stdout:'',stderr:'HTTP 403'};
  if (endpoint === 'repos/gaydevs/gaydevs-platform') return ok({id:123});
  if (endpoint.endsWith('/issues/27')) return ok({number:27,node_id:'I_test',state:'open',title:'Login',type:{name:'Feature'},body:'<!-- gaydevs-sdd:Feature -->',html_url:'https://github.com/gaydevs/gaydevs-platform/issues/27'});
  if (endpoint.includes('blocked_by')) return ok([options.blocked ? [{state:'open',html_url:'blocker'}] : []]);
  if (endpoint.includes('issue-field-values')) return ok([[{issue_field_name:'Priority',single_select_option:{name:'High'}}]]);
  if (args.includes('--slurp')) return ok([[]]);
  if (endpoint.endsWith('/comments') && args.includes('POST')) return ok({id:1});
  return {status:1,stdout:'',stderr:'Unexpected endpoint: '+endpoint};
};
require('node:module').syncBuiltinESMExports();
`);
  return {
    dir,
    run: (...args) => spawnSync(process.execPath, ['--require', shim, path.join(dir, 'scripts/sdd/from-issue.mjs'), '27', ...args], { cwd: dir, encoding: 'utf8' }),
    calls: () => readFileSync(path.join(dir, 'calls.jsonl'), 'utf8').trim().split('\n').map(JSON.parse),
  };
}

test('consulta é somente leitura e inclui prioridade nativa', () => {
  const f = fixture();
  const result = f.run();
  assert.equal(result.status, 0, result.stderr);
  const value = JSON.parse(result.stdout);
  assert.equal(value.id, '00027');
  assert.equal(value.context.fields[0].single_select_option.name, 'High');
  assert.ok(f.calls().every(call => !call.args.includes('POST') && call.command !== 'git'));
});
test('início cria apenas spec e ponteiro; comenta após preparar trabalho', () => {
  const f = fixture();
  const result = f.run('--start', '--without-project');
  assert.equal(result.status, 0, result.stderr);
  assert.ok(existsSync(path.join(f.dir, 'specs/00027-login/spec.md')));
  assert.equal(existsSync(path.join(f.dir, 'specs/00027-login/plan.md')), false);
  const pointer = JSON.parse(readFileSync(path.join(f.dir, '.specify/feature.json')));
  assert.equal(pointer.feature_directory, 'specs/00027-login');
  assert.ok(f.calls().some(call => call.args.includes('POST')));
  assert.match(result.stderr, /pendente/);
});
test('blocker e erro de API impedem qualquer mutação', () => {
  for (const options of [{ blocked: true }, { apiFailure: true }]) {
    const f = fixture(options);
    const result = f.run('--start', '--without-project');
    assert.notEqual(result.status, 0);
    assert.ok(f.calls().every(call => !call.args.includes('POST') && !call.args.includes('switch')));
  }
});
test('checkout sujo e branch duplicada são recusados sem sobrescrever', () => {
  for (const options of [{ dirty: true }, { branchExists: true }]) {
    const f = fixture(options);
    const result = f.run('--start', '--without-project');
    assert.notEqual(result.status, 0);
    assert.ok(f.calls().every(call => !call.args.includes('switch') && !call.args.includes('POST')));
  }
});
test('Project configurado recebe a própria Issue e Status Specifying', () => {
  const f = fixture({ project: true });
  const result = f.run('--start');
  assert.equal(result.status, 0, result.stderr);
  const requests = f.calls().filter(call => call.args[1] === 'graphql').map(call => JSON.parse(call.input));
  assert.deepEqual(requests[1].variables, { project: 'P_1', issue: 'I_test' });
  assert.deepEqual(requests[2].variables, { project: 'P_1', item: 'ITEM_1', field: 'F_1', option: 'O_1' });
});
