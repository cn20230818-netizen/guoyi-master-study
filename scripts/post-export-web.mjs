import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const dist = resolve(root, 'dist');
const copies = [
  ['web-static/privacy-policy.html', 'dist/privacy-policy.html'],
  ['web-static/support.html', 'dist/support.html'],
];

for (const [source, target] of copies) {
  const sourcePath = resolve(root, source);
  const targetPath = resolve(root, target);
  await mkdir(dirname(targetPath), { recursive: true });
  await copyFile(sourcePath, targetPath);
}

const indexPath = resolve(dist, 'index.html');
const indexHtml = await readFile(indexPath, 'utf8');
const githubPagesHtml = indexHtml.replace(
  /((?:href|src)=["'])\/(?!\/)/g,
  '$1./',
);

await writeFile(indexPath, githubPagesHtml);
await writeFile(resolve(dist, '404.html'), githubPagesHtml);
await writeFile(resolve(dist, '.nojekyll'), '');

console.log('Prepared dist/ for GitHub Pages deployment.');
