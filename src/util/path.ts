import { fileURLToPath } from 'url';
import path from 'path';

export function __filename(meta: ImportMeta) {
  return fileURLToPath(meta.url);
}

export function __dirname(meta: ImportMeta) {
  return path.dirname(__filename(meta));
}
