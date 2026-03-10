import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distLibDir = path.join(rootDir, 'dist', 'lib');

const sourcePackageJson = JSON.parse(await readFile(path.join(rootDir, 'package.json'), 'utf8'));

const packageJson = {
  name: sourcePackageJson.name,
  version: sourcePackageJson.version,
  description: sourcePackageJson.description,
  license: sourcePackageJson.license,
  author: sourcePackageJson.author,
  repository: sourcePackageJson.repository,
  keywords: sourcePackageJson.keywords,
  engines: sourcePackageJson.engines,
  type: sourcePackageJson.type,
  main: './index.cjs',
  module: './index.js',
  types: './index.d.ts',
  exports: {
    '.': {
      types: './index.d.ts',
      import: './index.js',
      require: './index.cjs',
    },
  },
};

await mkdir(distLibDir, { recursive: true });
await writeFile(path.join(distLibDir, 'package.json'), `${JSON.stringify(packageJson, null, 2)}\n`);
await copyFile(path.join(rootDir, 'README.md'), path.join(distLibDir, 'README.md'));
await copyFile(path.join(rootDir, 'LICENSE'), path.join(distLibDir, 'LICENSE'));
