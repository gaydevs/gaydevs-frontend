import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../../', import.meta.url));
const directory = path.join(root, 'scripts/sdd');
const tests = readdirSync(directory)
  .filter(name => name.endsWith('.test.mjs'))
  .sort()
  .map(name => path.join('scripts/sdd', name));

const result = spawnSync(process.execPath, ['--test', ...tests, ...process.argv.slice(2)], {
  cwd: root,
  stdio: 'inherit',
  shell: false,
});

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
