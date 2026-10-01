import { readIssue, main } from './core.mjs';
main(() => console.log(JSON.stringify(readIssue(process.argv[2]), null, 2)));
