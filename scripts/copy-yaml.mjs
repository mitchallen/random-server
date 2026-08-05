// Copy the swagger *.yaml files from src/ to dist/, mirroring the directory
// layout. Replaces `copyfiles -u 1 "src/**/*.yaml" dist`, which is unmaintained
// and pulled in glob@7 + inflight — two npm deprecation warnings on every
// install for a job Node's own fs.cpSync does natively.
import { cpSync, statSync } from 'node:fs';

cpSync('src', 'dist', {
    recursive: true,
    // Directories must pass the filter for their contents to be visited.
    filter: (src) => statSync(src).isDirectory() || src.endsWith('.yaml'),
});
