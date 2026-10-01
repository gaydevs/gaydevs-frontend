import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { root } from './core.mjs';

const windowsPwsh = 'C:/Program Files/PowerShell/7/pwsh.exe';
const pwsh = process.env.PWSH_BIN || (process.platform === 'win32' && existsSync(windowsPwsh) ? windowsPwsh : 'pwsh');
function envFor(overrides = {}) {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (/^(SPECIFY_|GIT_|NODE_OPTIONS$)/i.test(key)) delete env[key];
  }
  return { ...env, ...overrides };
}
function run(command, args, cwd, env = envFor()) {
  const result = spawnSync(command, args, { cwd, env, encoding: 'utf8' });
  assert.ifError(result.error);
  return result;
}
function ok(result) {
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout.trim();
}
const git = (cwd, ...args) => ok(run('git', args, cwd));
function helper(cwd, name = 'check-prerequisites', args = ['-Json', '-PathsOnly'], env = {}) {
  return run(pwsh, ['-NoProfile', '-File', path.join(cwd, '.specify/scripts/powershell', `${name}.ps1`), ...args], cwd, envFor(env));
}
const resolved = (cwd, env) => JSON.parse(ok(helper(cwd, undefined, undefined, env)));
function infraSnapshot(directory, relative = '') {
  return readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap(entry => {
    if (!relative && ['feature.json', 'context'].includes(entry.name)) return [];
    const name = path.join(relative, entry.name);
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? [[name, 'directory'], ...infraSnapshot(file, name)] : [[name, readFileSync(file).toString('base64')]];
  });
}
function fixture(t) {
  const base = mkdtempSync(path.join(tmpdir(), 'gdevs-sdd-paths-'));
  const repo = path.join(base, 'repo with spaces');
  mkdirSync(repo);
  // Fresh repository: no user checkout, credentials, GitHub writes or real Issues.
  cpSync(path.join(root, '.specify'), path.join(repo, '.specify'), {
    recursive: true,
    filter: source => !['feature.json', 'context'].includes(path.basename(source)),
  });
  cpSync(path.join(root, 'scripts/sdd'), path.join(repo, 'scripts/sdd'), { recursive: true });
  cpSync(path.join(root, '.github/sdd.json'), path.join(repo, '.github/sdd.json'), { recursive: true });
  for (const name of ['00027-alpha', '00028-beta', '123456-large']) {
    mkdirSync(path.join(repo, 'specs', name), { recursive: true });
    writeFileSync(path.join(repo, 'specs', name, 'spec.md'), '# Technical test fixture\n');
  }
  git(repo, 'init', '-b', 'develop');
  git(repo, 'config', 'user.name', 'SDD test');
  git(repo, 'config', 'user.email', 'sdd-test@example.invalid');
  git(repo, 'config', 'commit.gpgsign', 'false');
  git(repo, 'config', 'core.hooksPath', path.join(base, 'no-hooks'));
  git(repo, 'add', '.');
  git(repo, 'commit', '-m', 'technical fixtures');
  const infrastructure = infraSnapshot(path.join(repo, '.specify'));
  t.after(() => {
    // Only remove the exact temporary root created above, including its worktrees.
    const target = path.resolve(base);
    assert.equal(path.dirname(target), path.resolve(tmpdir()));
    assert.match(path.basename(target), /^gdevs-sdd-paths-/);
    try {
      // Detect any replacement global cache or modification of shared infra.
      assert.deepEqual(infraSnapshot(path.join(repo, '.specify')), infrastructure);
    } finally {
      rmSync(target, { recursive: true, force: true, maxRetries: 3 });
    }
  });
  return { repo, base };
}
function switchTo(repo, branch) { git(repo, 'switch', '-c', branch); }
function noPointer(repo) {
  assert.equal(existsSync(path.join(repo, '.specify/feature.json')), false);
  assert.equal(existsSync(path.join(repo, '.specify/context')), false);
}

test('Git real: quatro prefixos, ID independente do slug e IDs sem truncamento', t => {
  const { repo } = fixture(t);
  for (const prefix of ['feat', 'fix', 'refactor', 'techdebt']) {
    const branch = `${prefix}/00027-different-slug`;
    switchTo(repo, branch);
    const value = resolved(repo);
    assert.equal(value.BRANCH, branch);
    assert.equal(value.FEATURE_DIR, path.join(repo, 'specs/00027-alpha'));
  }
  switchTo(repo, 'techdebt/123456-large');
  assert.equal(resolved(repo).FEATURE_DIR, path.join(repo, 'specs/123456-large'));
  noPointer(repo);
  assert.equal(git(repo, 'status', '--porcelain'), '');
});

test('trocar branches ignora ponteiro inválido e snapshots antigos sem alterá-los', t => {
  const { repo } = fixture(t);
  const pointer = path.join(repo, '.specify/feature.json');
  const cache = path.join(repo, '.specify/context/00027.json');
  writeFileSync(pointer, 'invalid JSON');
  mkdirSync(path.dirname(cache));
  writeFileSync(cache, '{"state":"obsolete"}');
  switchTo(repo, 'feat/00027-alpha');
  assert.equal(resolved(repo).FEATURE_DIR, path.join(repo, 'specs/00027-alpha'));
  switchTo(repo, 'fix/00028-beta');
  assert.equal(resolved(repo).FEATURE_DIR, path.join(repo, 'specs/00028-beta'));
  git(repo, 'switch', 'feat/00027-alpha');
  assert.equal(resolved(repo).FEATURE_DIR, path.join(repo, 'specs/00027-alpha'));
  assert.equal(readFileSync(pointer, 'utf8'), 'invalid JSON');
  assert.equal(readFileSync(cache, 'utf8'), '{"state":"obsolete"}');
  assert.equal(git(repo, 'status', '--porcelain'), '');
});

test('worktrees independentes resolvem seu próprio HEAD e diretório', t => {
  const { repo, base } = fixture(t);
  const second = path.join(base, 'second worktree');
  switchTo(repo, 'feat/00027-alpha');
  git(repo, 'worktree', 'add', '-b', 'refactor/00028-beta', second, 'develop');
  for (let i = 0; i < 2; i++) {
    assert.equal(resolved(repo).FEATURE_DIR, path.join(repo, 'specs/00027-alpha'));
    assert.equal(resolved(second).FEATURE_DIR, path.join(second, 'specs/00028-beta'));
  }
  noPointer(repo);
  noPointer(second);
});

test('branch inválida, detached HEAD, spec ausente e ambiguidade falham claramente', t => {
  const { repo } = fixture(t);
  for (const branch of ['develop', 'feat/27-short', 'feat/00000-zero', 'fix/000027-extra-zero']) {
    if (branch !== 'develop') switchTo(repo, branch);
    const result = helper(repo);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /not an SDD branch|Invalid SDD Issue ID/);
  }
  git(repo, 'switch', '--detach');
  assert.match(helper(repo).stderr, /detached HEAD/);
  switchTo(repo, 'techdebt/00099-missing');
  for (const name of ['check-prerequisites', 'setup-plan', 'setup-tasks']) {
    const result = helper(repo, name, ['-Json']);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /No spec directory for Issue 00099/);
  }
  assert.equal(readdirSync(path.join(repo, 'specs')).some(n => n.startsWith('00099-')), false);
  switchTo(repo, 'feat/00027-alpha');
  mkdirSync(path.join(repo, 'specs/00027-duplicate'));
  const ambiguous = helper(repo);
  assert.notEqual(ambiguous.status, 0);
  assert.match(ambiguous.stderr, /Ambiguous.*00027-alpha.*00027-duplicate/);
});

test('override relativo/absoluto vale só para o processo e não persiste nem com helpers de escrita', t => {
  const { repo } = fixture(t);
  switchTo(repo, 'feat/00027-alpha');
  const beta = path.join(repo, 'specs/00028-beta');
  for (const override of ['specs/00028-beta', beta]) {
    assert.equal(resolved(repo, { SPECIFY_FEATURE_DIRECTORY: override }).FEATURE_DIR, beta);
    assert.equal(resolved(repo).FEATURE_DIR, path.join(repo, 'specs/00027-alpha'));
  }
  const env = { SPECIFY_FEATURE_DIRECTORY: 'specs/00028-beta' };
  const plan = JSON.parse(ok(helper(repo, 'setup-plan', ['-Json'], env)));
  assert.equal(plan.FEATURE_DIR, beta);
  assert.equal(existsSync(path.join(repo, 'specs/00027-alpha/plan.md')), false);
  ok(helper(repo, 'setup-tasks', ['-Json'], env));
  writeFileSync(path.join(beta, 'tasks.md'), '# Tasks\n');
  ok(helper(repo, 'check-prerequisites', ['-Json', '-RequireSpec', '-RequireTasks'], env));
  assert.equal(resolved(repo).FEATURE_DIR, path.join(repo, 'specs/00027-alpha'));
  noPointer(repo);
  assert.equal(git(repo, 'status', '--porcelain').split('\n').length, 2);
  const invalid = helper(repo, undefined, undefined, { SPECIFY_FEATURE_DIRECTORY: 'specs/missing' });
  assert.notEqual(invalid.status, 0);
  assert.match(invalid.stderr, /must point to an existing directory/);
  git(repo, 'switch', '--detach');
  assert.equal(resolved(repo, env).FEATURE_DIR, beta);
});

test('SPECIFY_FEATURE legado é recusado mesmo com override válido', t => {
  const { repo } = fixture(t);
  switchTo(repo, 'feat/00027-alpha');
  for (const name of ['check-prerequisites', 'setup-plan', 'setup-tasks']) {
    const result = helper(repo, name, ['-Json'], {
      SPECIFY_FEATURE: '00028-beta', SPECIFY_FEATURE_DIRECTORY: 'specs/00027-alpha',
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /SPECIFY_FEATURE is not supported.*SDD branch.*SPECIFY_FEATURE_DIRECTORY/);
  }
  noPointer(repo);
  assert.equal(git(repo, 'status', '--porcelain'), '');
});

test('override sem Git e SPECIFY_INIT_DIR explícito preservam o projeto selecionado', t => {
  const { repo, base } = fixture(t);
  const standalone = path.join(base, 'standalone project');
  cpSync(path.join(repo, '.specify'), path.join(standalone, '.specify'), { recursive: true });
  cpSync(path.join(repo, 'specs'), path.join(standalone, 'specs'), { recursive: true });
  assert.notEqual(helper(standalone).status, 0);
  const value = resolved(standalone, { SPECIFY_FEATURE_DIRECTORY: 'specs/00028-beta' });
  assert.equal(value.FEATURE_DIR, path.join(standalone, 'specs/00028-beta'));
  assert.equal(value.BRANCH, '');
  switchTo(repo, 'fix/00027-alpha');
  const selected = resolved(standalone, { SPECIFY_INIT_DIR: repo });
  assert.equal(selected.FEATURE_DIR, path.join(repo, 'specs/00027-alpha'));
  assert.equal(selected.BRANCH, 'fix/00027-alpha');
  const fromSubdirectory = JSON.parse(ok(run(pwsh, ['-NoProfile', '-File',
    path.join(repo, '.specify/scripts/powershell/check-prerequisites.ps1'), '-Json', '-PathsOnly'],
  path.join(repo, 'specs/00027-alpha'))));
  assert.equal(fromSubdirectory.FEATURE_DIR, selected.FEATURE_DIR);
  noPointer(standalone);
  noPointer(repo);
});

test('contratos plan/tasks/implement/analyze/clarify/checklist/converge funcionam pela branch', t => {
  const { repo } = fixture(t);
  switchTo(repo, 'feat/00027-alpha');
  const dir = path.join(repo, 'specs/00027-alpha');
  const plan = JSON.parse(ok(helper(repo, 'setup-plan', ['-Json'])));
  assert.equal(plan.FEATURE_SPEC, path.join(dir, 'spec.md'));
  assert.equal(plan.IMPL_PLAN, path.join(dir, 'plan.md'));
  assert.match(readFileSync(plan.IMPL_PLAN, 'utf8'), /Aprovação|aprovação/);
  writeFileSync(plan.IMPL_PLAN, '# Existing plan must be preserved\n');
  ok(helper(repo, 'setup-plan', ['-Json']));
  assert.equal(readFileSync(plan.IMPL_PLAN, 'utf8'), '# Existing plan must be preserved\n');
  const tasks = JSON.parse(ok(helper(repo, 'setup-tasks', ['-Json'])));
  assert.equal(tasks.FEATURE_DIR, dir);
  assert.ok(tasks.TASKS_TEMPLATE_CONTENT);
  assert.ok(path.isAbsolute(tasks.TASKS_TEMPLATE));
  assert.equal(existsSync(path.join(dir, 'tasks.md')), false);
  assert.notEqual(helper(repo, 'check-prerequisites', ['-Json', '-RequireTasks']).status, 0);
  writeFileSync(path.join(dir, 'tasks.md'), '# Technical tasks\n');
  for (const args of [
    ['-Json', '-PathsOnly'],
    ['-Json', '-RequireTasks', '-IncludeTasks'],
    ['-Json', '-RequireSpec', '-RequireTasks', '-IncludeTasks'],
    ['-Json', '-Template', 'checklist-template'],
  ]) {
    const value = JSON.parse(ok(helper(repo, 'check-prerequisites', args)));
    assert.equal(value.FEATURE_DIR, dir);
    if (args.includes('-IncludeTasks')) assert.ok(value.AVAILABLE_DOCS.includes('tasks.md'));
    if (args.includes('-Template')) assert.ok(value.TEMPLATE_CONTENT);
  }
  noPointer(repo);
});

test('from-issue com Git real cria branch/spec consumíveis pelos helpers, sem cache', t => {
  const { repo, base } = fixture(t);
  const remote = path.join(base, 'remote.git');
  git(repo, 'clone', '--bare', repo, remote);
  git(repo, 'remote', 'add', 'origin', 'https://github.com/gaydevs/gaydevs-platform.git');
  const shim = path.join(base, 'gh-fixture.cjs');
  writeFileSync(shim, `
const cp = require('node:child_process');
const original = cp.spawnSync;
cp.spawnSync = (command, args, options) => {
  if (command === 'git') {
    // Redirect only network operations to a local bare remote. All Git commands
    // execute for real; remote get-url still reads the canonical fixture URL.
    const transport = ${JSON.stringify(`url.${remote.replaceAll('\\', '/')}.insteadOf=https://github.com/gaydevs/gaydevs-platform.git`)};
    return original(command, ['fetch', 'ls-remote'].includes(args[0]) ? ['-c', transport, ...args] : args, options);
  }
  const endpoint = args[1];
  const ok = value => ({status:0, stdout:JSON.stringify(value), stderr:''});
  if (endpoint === 'repos/gaydevs/gaydevs-platform') return ok({id:123});
  if (endpoint.endsWith('/issues/29')) return ok({number:29,node_id:'fixture',state:'open',title:'Technical fixture',type:{name:'Tech Debt'},body:'<!-- gaydevs-sdd:Tech Debt -->',html_url:'https://github.com/gaydevs/gaydevs-platform/issues/29'});
  if (args.includes('--slurp')) return ok([[]]);
  if (endpoint.endsWith('/comments') && args.includes('POST')) return ok({id:1});
  return {status:1,stdout:'',stderr:'Unexpected fixture API call: '+endpoint};
};
require('node:module').syncBuiltinESMExports();
`);
  const result = run(process.execPath, ['--require', shim, 'scripts/sdd/from-issue.mjs', '29', '--start', '--without-project'], repo);
  const work = JSON.parse(ok(result));
  assert.equal(git(repo, 'branch', '--show-current'), work.branch);
  assert.equal(git(repo, 'rev-parse', 'HEAD'), git(repo, 'rev-parse', 'origin/develop'));
  assert.equal(resolved(repo).FEATURE_DIR, path.join(repo, work.directory));
  ok(helper(repo, 'setup-plan', ['-Json']));
  ok(helper(repo, 'setup-tasks', ['-Json']));
  noPointer(repo);
});
