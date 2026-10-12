import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { verifyEndpointAuthorization, AuthorizationError } from './src/providers/serverAuthorization';
import { AuthSession } from './src/providers/authProvider';

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
 * 身份认证与会话解析辅助中间件 (Server-side Auth Simulation / Admin Token extraction)
 * 遵循铁律：所有 server endpoint 验证 identity, familyId, role, ownership, scope
 */
function extractSession(req: express.Request): AuthSession | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  try {
    const tokenPart = authHeader.replace(/^Bearer\s+/i, '');
    const decoded = JSON.parse(Buffer.from(tokenPart, 'base64').toString('utf-8'));
    return {
      uid: decoded.uid,
      role: decoded.role,
      familyId: decoded.familyId,
      deviceId: decoded.deviceId,
      participantPseudonym: decoded.participantPseudonym,
      scopes: decoded.scopes || []
    };
  } catch {
    return null;
  }
}

// Endpoint: 监护人拉取家庭数据 (需身份认证 + 家庭成员隔离)
app.get('/api/family/:familyId/summary', (req, res) => {
  try {
    const session = extractSession(req);
    const { familyId } = req.params;

    verifyEndpointAuthorization({
      session,
      targetFamilyId: familyId,
      actionType: 'READ'
    });

    res.json({
      success: true,
      familyId,
      message: 'Family data retrieved securely'
    });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      res.status(403).json({ success: false, code: err.code, error: err.message });
      return;
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Endpoint: 监护人更新 Caregiver 配置 (儿童端绝不可调用)
app.post('/api/family/:familyId/caregivers', (req, res) => {
  try {
    const session = extractSession(req);
    const { familyId } = req.params;

    verifyEndpointAuthorization({
      session,
      targetFamilyId: familyId,
      requiredRole: 'CAREGIVER',
      actionType: 'MUTATE_CAREGIVER'
    });

    res.json({
      success: true,
      message: 'Caregiver updated successfully by authorized caregiver'
    });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      res.status(403).json({ success: false, code: err.code, error: err.message });
      return;
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Endpoint: 监护人私密自省笔记读取 (Caregiver A 隔离 Caregiver B)
app.get('/api/family/:familyId/caregiver-notes/:ownerCaregiverId', (req, res) => {
  try {
    const session = extractSession(req);
    const { familyId, ownerCaregiverId } = req.params;

    verifyEndpointAuthorization({
      session,
      targetFamilyId: familyId,
      requiredRole: 'CAREGIVER',
      resourceOwnerId: ownerCaregiverId,
      actionType: 'READ'
    });

    res.json({
      success: true,
      ownerCaregiverId,
      notes: []
    });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      res.status(403).json({ success: false, code: err.code, error: err.message });
      return;
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Endpoint: 研究员导出聚合事件 (研究员不可读家庭私密原始数据)
app.get('/api/research/export', (req, res) => {
  try {
    const session = extractSession(req);

    verifyEndpointAuthorization({
      session,
      targetFamilyId: session?.familyId || '',
      requiredRole: ['RESEARCHER', 'CAREGIVER'],
      actionType: 'RESEARCH_EXPORT'
    });

    res.json({
      success: true,
      events: []
    });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      res.status(403).json({ success: false, code: err.code, error: err.message });
      return;
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
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
