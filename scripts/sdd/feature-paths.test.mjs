import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { sandbox, ok, pwsh, snapshot } from './sandbox/index.mjs';

const fixtures = [];
const owner = cwd => fixtures.find(s => cwd.startsWith(s.base + path.sep));
const git = (cwd, ...args) => ok(owner(cwd).run('git', args, cwd));
function helper(cwd, name = 'check-prerequisites', args = ['-Json', '-PathsOnly'], env = {}) {
  return owner(cwd).helper(name, args, env, cwd);
}
const resolved = (cwd, env) => JSON.parse(ok(helper(cwd, undefined, undefined, env)));
function run(command, args, cwd) {
  assert.equal(command, pwsh);
  const projectRoot = path.resolve(path.dirname(args[2]), '../../..');
  return owner(cwd).helper(path.basename(args[2], '.ps1'), args.slice(3), {}, cwd, projectRoot);
}
function fixture(t) {
  const s = sandbox(t, { specs: ['00027-alpha', '00028-beta', '123456-large'] });
  fixtures.push(s);
  const infra = () => snapshot(path.join(s.repo, '.specify')).filter(([name]) => !/^(feature\.json|context)([\\/]|$)/.test(name));
  const before = infra();
  s.beforeCleanup.push(() => assert.deepEqual(infra(), before));
  return s;
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
  const s = fixture(t);
  const work = JSON.parse(ok(s.cli('from-issue', [29, '--start', '--without-project'])));
  assert.equal(s.git('branch', '--show-current'), work.branch);
  assert.equal(s.git('rev-parse', 'HEAD'), s.git('rev-parse', 'origin/develop'));
  assert.equal(resolved(s.repo).FEATURE_DIR, path.join(s.repo, work.directory));
  ok(s.helper('setup-plan', ['-Json']));
  ok(s.helper('setup-tasks', ['-Json']));
  s.noPointer();
});
