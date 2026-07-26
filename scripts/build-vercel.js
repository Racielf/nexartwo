const fs = require('fs');
const path = require('path');
const { writeEnvFile } = require('./generate-env');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

for (const file of ['index.html', 'projects.html', 'manifest.json', 'test_logo.png']) {
  copyRecursive(path.join(root, file), path.join(dist, file));
}

for (const dir of ['css', 'js']) {
  copyRecursive(path.join(root, dir), path.join(dist, dir));
}

writeEnvFile(path.join(root, 'js', 'env.js'));
writeEnvFile(path.join(dist, 'js', 'env.js'));

console.log('Built static Vercel output in dist');
