import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const root = path.dirname(fileURLToPath(import.meta.url));
const production = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '127.0.0.1';
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('INVALID_PORT');

app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (production) {
    res.setHeader('Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; " +
      "font-src 'self'; media-src 'self' blob:; connect-src 'self'; object-src 'none'; " +
      "base-uri 'self'; form-action 'self'; frame-ancestors 'self'");
  }
  next();
});
app.get('/healthz', (_req, res) => res.json({ status: 'ok', mode: 'LOCAL_REVIEW', remoteSupport: false }));

/**
 * No base64-auth simulation in a listening HTTP server.
 * A verified identity provider AND server-owned membership lookup are required
 * before these routes may be implemented. Client-supplied claims are never trust.
 */
app.use('/api', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.status(503).json({
    success: false, code: 'API_DISABLED_PENDING_VERIFIED_AUTH',
    error: 'Cloud services are not configured in this local review build.'
  });
});
async function start() {
  if (production) {
    app.use(express.static(path.join(root, 'dist'), { index: false, dotfiles: 'deny',
      setHeaders: (res, filename) => {
        if (filename.endsWith('sw.js') || filename.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
      } }));
    app.get('*', (_req, res) => res.sendFile(path.join(root, 'dist/index.html')));
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  }
  app.listen(port, host, () => console.log(`Qingyu LOCAL_REVIEW: http://${host}:${port}`));
}
start().catch(error => { console.error(error); process.exitCode = 1; });
