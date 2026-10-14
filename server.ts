import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApiApp() {
  const app = express();

  app.use(express.json({ limit: '16kb' }));

  // Health check endpoint (returns 200 OK with explicit local-only mode status)
  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      mode: 'local-only-verified',
      releaseApprovalStatus: 'ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED',
      remoteRelayEnabled: false,
      cloudSyncEnabled: false,
      timestamp: new Date().toISOString()
    });
  });

  // SEC-01 & SEC-02: 禁用所有未配置真实 Firebase Admin SDK 验签的云端同步与通知 API。
  // 严禁信任客户端传入的 familyId 或未签名 token。默认 Fail-Closed 返回 503。
  app.all('/api/*', (_req, res) => {
    res.status(503).json({
      success: false,
      code: 'API_DISABLED_PENDING_VERIFIED_AUTH',
      error: 'CLOUD_API_DISABLED',
      mode: 'local-only-verified',
      releaseApprovalStatus: 'ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED',
      message: '当前版本为本地高安全运行模式，云端同步与远程通知接口已强制关闭（Fail-Closed）。',
      data: null
    });
  });

  return app;
}

async function startServer() {
  const app = createApiApp();
  const PORT = Number(process.env.PORT) || 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
