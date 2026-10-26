// Tiny static server for local preview, with folder index routing (/services/general-medicine/). Run: npm start
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, normalize } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT) || 4173;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.json': 'application/json' };

createServer(async (req, res) => {
  let path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([\\/])+/, '');
  if (path.startsWith('..')) { res.writeHead(403).end(); return; }
  let file = join(root, path);
  try {
    if ((await stat(file)).isDirectory()) {
      if (!req.url.split('?')[0].endsWith('/')) { res.writeHead(301, { Location: req.url + '/' }).end(); return; }
      file = join(file, 'index.html');
    }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
  }
}).listen(port, () => console.log(`http://localhost:${port}`));
