import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const root = path.dirname(fileURLToPath(import.meta.url));
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml', '.json':'application/json; charset=utf-8', '.txt':'text/plain; charset=utf-8', '.woff2':'font/woff2' };
export function createServer() {
  return http.createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const requested = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
      const filename = path.resolve(root, requested);
      const relative = path.relative(root, filename);
      const allowed = requested === 'index.html' || /^(src|assets)\//.test(requested);
      if (!allowed || relative.startsWith('..') || path.isAbsolute(relative) || ! (await stat(filename)).isFile()) {
        res.writeHead(404); res.end('Não encontrado'); return;
      }
      res.writeHead(200, { 'Content-Type': mime[path.extname(filename)] || 'application/octet-stream', 'Cache-Control':'no-cache', 'X-Content-Type-Options':'nosniff' });
      res.end(await readFile(filename));
    } catch { res.writeHead(404); res.end('Não encontrado'); }
  });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4173);
  createServer().listen(port, '127.0.0.1', () => console.log(`Água Alerta disponível em http://localhost:${port}`));
}
