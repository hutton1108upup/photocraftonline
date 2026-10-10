import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const rootFiles = new Set(['.gitignore', '.gitattributes', 'package.json', 'package-lock.json', 'site.config.json', 'wrangler.jsonc', 'README.md', 'THIRD-PARTY-NOTICES.md', '启动本地预览.cmd']);
const scripts = new Set(['render.mjs', 'server.mjs', 'build.mjs', 'check.mjs', 'check-production.mjs', 'audit-upload.mjs']);
const allowed = file => rootFiles.has(file) || file.startsWith('src/') || file.startsWith('public/') || file.startsWith('docs/') || file.startsWith('.github/workflows/') || (file.startsWith('scripts/') && scripts.has(file.slice(8)));
const excludedRoots = new Set(['node_modules', '.git', '.local', '.wrangler', 'dist']);
const secretPath = /(?:^|\/)(?:\.env(?:\..*)?|\.dev\.vars(?:\..*)?|credentials[^/]*|[^/]*\.(?:pem|key|p12|pfx))$/i;
const detectors = [
  ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['github-token', /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/],
  ['stripe-secret', /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{20,}\b/],
  ['google-api-key', /\bAIza[0-9A-Za-z_-]{30,}\b/],
  ['aws-access-key', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ['credential-value', /(?:api[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret|password|private[_-]?key)\s*[=:]\s*["'][A-Za-z0-9+/=_-]{24,}["']/i],
];

async function walk(directory, prefix = '') {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (!prefix && excludedRoots.has(entry.name)) continue;
    if (entry.isSymbolicLink()) throw new Error(`Symlink needs explicit review: ${prefix}${entry.name}`);
    if (entry.isDirectory()) files.push(...await walk(path.join(directory, entry.name), `${prefix}${entry.name}/`));
    else files.push(`${prefix}${entry.name}`);
  }
  return files;
}

const staged = process.argv.includes('--staged');
const files = staged
  ? execFileSync('git', ['diff', '--cached', '--name-only', '-z', '--diff-filter=ACMR'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean)
  : await walk(root);
if (staged && !files.length) throw new Error('No staged files; cannot claim a staged secret scan passed.');
const report = { mode: staged ? 'staged' : 'working-tree', upload: [], excluded: [], findings: [], totalBytes: 0 };
for (const file of files.sort()) {
  if (!allowed(file)) {
    report.excluded.push(file);
    if (staged) report.findings.push({ file, reason: 'outside-upload-allowlist' });
    continue;
  }
  if (secretPath.test(file)) { report.findings.push({ file, reason: 'credential-file' }); continue; }
  const body = staged ? execFileSync('git', ['show', `:${file}`], { cwd: root, maxBuffer: 32 * 1024 * 1024 }) : await readFile(path.join(root, file));
  report.totalBytes += body.length;
  report.upload.push({ file, bytes: body.length });
  if (body.length > 100 * 1024 * 1024) report.findings.push({ file, reason: 'github-file-size' });
  if (file.startsWith('public/') && body.length > 25 * 1024 * 1024) report.findings.push({ file, reason: 'cloudflare-asset-size' });
  if (!body.subarray(0, 4096).includes(0) && /\.(?:mjs|js|json|jsonc|md|html|css|yml|yaml|cmd|txt)$/.test(file)) {
    const text = body.toString('utf8');
    for (const [reason, regex] of detectors) {
      const match = regex.exec(text);
      if (match) report.findings.push({ file, reason, line: text.slice(0, match.index).split('\n').length });
    }
  }
}
await mkdir(path.join(root, '.local'), { recursive: true });
await writeFile(path.join(root, '.local', staged ? 'staged-upload-audit.json' : 'upload-audit.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ mode: report.mode, uploadFiles: report.upload.length, excludedFiles: report.excluded.length, totalBytes: report.totalBytes, findings: report.findings }, null, 2));
if (report.findings.length) process.exitCode = 1;
