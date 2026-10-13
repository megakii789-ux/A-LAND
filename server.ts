import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Server-side Gemini API initialization (Optional background support)
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

/**
// Health check endpoint (Safe, no sensitive data)
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    mode: 'local-safe',
    timestamp: new Date().toISOString()
  });
});

/**
 * SEC-01: 不可信身份令牌关闭与服务端 Fail Closed 守卫
 * 铁律：
 * 1. 严禁解析客户端自行 Base64 编码的 JSON 作为可信身份。
 * 2. 在配置可信的正式 Auth Provider (如生产级服务端 Firebase Admin JWT 验签) 之前，
 *    所有 /api 私有接口采取 Fail Closed，默认返回 HTTP 503。
 * 3. 绝不泄露任何儿童或家庭私密数据。
 * 4. 匿名请求、伪造 Base64 Bearer、伪造 CAREGIVER、跨家庭请求均不得进入业务处理。
 */
app.all('/api/*', (req, res) => {
  res.status(503).json({
    success: false,
    code: 'API_DISABLED_PENDING_VERIFIED_AUTH',
    error: 'Cloud API is disabled pending verified production authentication provider. No family or child data is served.',
    data: null
  });
});


// Vite middleware for dev
async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
