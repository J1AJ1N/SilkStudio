import { cpSync, copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

copyFileSync(join(root, 'dist', 'index.html'), join(root, 'index.html'));

rmSync(join(root, 'assets'), { recursive: true, force: true });
mkdirSync(join(root, 'assets'), { recursive: true });
mkdirSync(join(root, 'people'), { recursive: true });

cpSync(join(root, 'dist', 'assets'), join(root, 'assets'), { recursive: true });
cpSync(join(root, 'dist', 'people'), join(root, 'people'), { recursive: true });
