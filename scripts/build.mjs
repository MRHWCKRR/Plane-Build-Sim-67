import { mkdir, cp, rm } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
for (const path of ['index.html', 'game.html', 'styles.css', 'app.js', 'game', 'assets']) {
  await cp(path, `dist/${path}`, { recursive: true });
}
console.log('Static site built in dist/');
