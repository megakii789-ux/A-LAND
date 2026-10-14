import { describe, it, expect, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as vm from 'vm';
import { onRequest as onHealthRequest } from '../../functions/api/health';
import { onRequest as onCatchAllApiRequest } from '../../functions/api/[[path]]';

describe('Gate D3, D4 & D6: Cloudflare Pages Static & Functions Security Adapter', () => {
  it('D6-01: GET /api/health Pages Function returns 200 OK with local-only-verified and ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED', async () => {
    const req = new Request('https://preview.qingyu-island-preview.pages.dev/api/health', {
      method: 'GET',
    });
    const res = await onHealthRequest({ request: req });

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('application/json');
    expect(res.headers.get('Cache-Control')).toContain('no-store');
    expect(res.headers.get('X-Release-Gate-Status')).toBe('ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED');

    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.mode).toBe('local-only-verified');
    expect(body.releaseApprovalStatus).toBe('ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED');
    expect(body.remoteRelayEnabled).toBe(false);
    expect(body.cloudSyncEnabled).toBe(false);
  });

  it('D6-01: POST /api/health Pages Function rejects non-GET requests with 405 JSON (never HTML)', async () => {
    const req = new Request('https://preview.qingyu-island-preview.pages.dev/api/health', {
      method: 'POST',
    });
    const res = await onHealthRequest({ request: req });

    expect(res.status).toBe(405);
    expect(res.headers.get('Content-Type')).toContain('application/json');
    const body = await res.json();
    expect(body.code).toBe('METHOD_NOT_ALLOWED');
  });

  it('D6-01: All /api/* business routes (GET & POST) enforce unified Fail-Closed HTTP 503 JSON contract including mode="local-only-verified"', async () => {
    const endpoints = [
      { url: 'https://preview.qingyu-island-preview.pages.dev/api/caregiver/sync', method: 'POST' },
      { url: 'https://preview.qingyu-island-preview.pages.dev/api/caregiver/sync', method: 'GET' },
      { url: 'https://preview.qingyu-island-preview.pages.dev/api/hug/relay', method: 'POST' },
      { url: 'https://preview.qingyu-island-preview.pages.dev/api/family/101/caregiver-notes', method: 'GET' },
      { url: 'https://preview.qingyu-island-preview.pages.dev/api/nonexistent', method: 'GET' },
    ];

    for (const ep of endpoints) {
      const req = new Request(ep.url, { method: ep.method });
      const res = await onCatchAllApiRequest({ request: req });

      expect(res.status).toBe(503);
      expect(res.headers.get('Content-Type')).toContain('application/json');
      expect(res.headers.get('Cache-Control')).toContain('no-store');
      expect(res.headers.get('X-A-Land-Fail-Closed')).toBe('true');
      expect(res.headers.get('X-Release-Gate-Status')).toBe('ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED');

      const text = await res.text();
      expect(text).not.toContain('<!doctype html>');
      const data = JSON.parse(text);
      expect(data.success).toBe(false);
      expect(data.code).toBe('API_DISABLED_PENDING_VERIFIED_AUTH');
      expect(data.error).toBe('CLOUD_API_DISABLED');
      expect(data.mode).toBe('local-only-verified');
      expect(data.remoteRelayEnabled).toBe(false);
      expect(data.cloudSyncEnabled).toBe(false);
      expect(data.releaseApprovalStatus).toBe('ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED');
    }
  });

  it('public/_routes.json routes /api/* exclusively to Cloudflare Pages Functions', () => {
    const routesPath = path.resolve(process.cwd(), 'public/_routes.json');
    expect(fs.existsSync(routesPath)).toBe(true);
    const routes = JSON.parse(fs.readFileSync(routesPath, 'utf-8'));
    expect(routes.version).toBe(1);
    expect(routes.include).toContain('/api/*');
  });

  it('D6-02: Rollback whitelist revokes unsafe f8c74019 baseline and rollback script enforces clean worktree + full quality gate', () => {
    const whitelistPath = path.resolve(process.cwd(), 'scripts/rollback-whitelist.json');
    expect(fs.existsSync(whitelistPath)).toBe(true);
    const whitelist = JSON.parse(fs.readFileSync(whitelistPath, 'utf-8'));
    expect(whitelist.policy).toBe('FAIL_CLOSED_WHITELIST_ONLY');

    const revokedShas = (whitelist.revokedUnsafeTargets || []).map((item: { sha: string }) => item.sha);
    expect(revokedShas).toContain('f8c7401907b3fe5831c343b995b777254fdfe45d');

    const approvedShas = (whitelist.approvedSafeTargets || []).map((item: string | { sha: string }) =>
      typeof item === 'string' ? item : item.sha,
    );
    expect(approvedShas).not.toContain('f8c7401907b3fe5831c343b995b777254fdfe45d');

    const rollbackScriptPath = path.resolve(process.cwd(), 'scripts/rollback-preview.sh');
    const scriptContent = fs.readFileSync(rollbackScriptPath, 'utf-8');
    // Must not default TARGET_SHA to f8c74019
    expect(scriptContent).not.toContain('TARGET_SHA="f8c74019');
    // Must check working tree cleanliness before rollback
    expect(scriptContent).toContain('status --porcelain');
    // Must re-run quality gate before pushing
    expect(scriptContent).toContain('tsc --noEmit');
    expect(scriptContent).toContain('vitest run');
    expect(scriptContent).toContain('vite build');
  });

  it('D6-04: public/_headers and public/version.json enforce no-store on SW/HTML and carry real commit provenance', () => {
    const headersPath = path.resolve(process.cwd(), 'public/_headers');
    expect(fs.existsSync(headersPath)).toBe(true);
    const headersContent = fs.readFileSync(headersPath, 'utf-8');
    expect(headersContent).toContain('X-Release-Gate-Status: ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED');
    expect(headersContent).toContain('X-Content-Type-Options: nosniff');
    expect(headersContent).toContain('/sw.js');

    const versionPath = path.resolve(process.cwd(), 'public/version.json');
    expect(fs.existsSync(versionPath)).toBe(true);
    const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf-8'));
    expect(versionData.releaseGateStatus).toBe('ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED');
    expect(versionData.releaseApprovalStatus).toBe('ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED');
    expect(versionData.contentAuditGate).toBe('FAIL_CLOSED_PENDING_AUDIT');
    expect(versionData.buildStatus).toBe('VERIFIED_QUALITY_GATE_PASSED');
    expect(versionData.commitSha).toMatch(/^[0-9a-f]{40}$/i);
    expect(versionData.deploymentTimestamp).toBeTruthy();
    expect(versionData.rollbackPolicy).toBe('WHITELIST_ONLY_F8C74019_REVOKED');
    expect(versionData.rollbackTargetSha).not.toBe('f8c7401907b3fe5831c343b995b777254fdfe45d');
    expect(versionData.remoteRelayEnabled).toBe(false);
    expect(versionData.cloudSyncEnabled).toBe(false);
    expect(versionData.branch).toBe('preview');
  });

  it('D6-03: public/sw.js disables private preview HTML offline cache and blocks offline restoration after Access session expiry', async () => {
    const swPath = path.resolve(process.cwd(), 'public/sw.js');
    const swContent = fs.readFileSync(swPath, 'utf-8');
    expect(swContent).toContain('sunny-island-preview-no-html-cache-v3');
    expect(swContent).toContain('PRECACHE_DISABLED_IN_PRIVATE_PREVIEW = true');
    expect(swContent).toContain('PRIVATE_PREVIEW_REAUTH_REQUIRED');

    // Simulate the Service Worker runtime environment to test:
    // Authenticated visit -> Page loaded -> Access session expires -> Browser offline -> Re-enter
    const listeners: Record<string, Function> = {};
    const storedCacheEntries = new Map<string, Response>();
    const deletedCaches: string[] = [];

    const mockCache = {
      addAll: vi.fn(async () => {}),
      put: vi.fn(async (req: Request, res: Response) => {
        storedCacheEntries.set(req.url, res);
      }),
    };

    const mockCaches = {
      open: vi.fn(async () => mockCache),
      keys: vi.fn(async () => ['sunny-island-app-shell-v2', 'sunny-island-preview-no-html-cache-v3']),
      delete: vi.fn(async (key: string) => {
        deletedCaches.push(key);
        storedCacheEntries.clear();
        return true;
      }),
      match: vi.fn(async (req: Request | string) => {
        const key = typeof req === 'string' ? req : req.url;
        return storedCacheEntries.get(key) || undefined;
      }),
    };

    let currentFetchImpl: (input: Request, init?: RequestInit) => Promise<Response> = async () =>
      new Response('<!doctype html><html><body>Authorized App</body></html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });

    const sandbox = {
      self: {
        location: { origin: 'https://preview.qingyu-island-preview.pages.dev' },
        skipWaiting: vi.fn(),
        clients: { claim: vi.fn() },
        addEventListener: (type: string, handler: Function) => {
          listeners[type] = handler;
        },
      },
      caches: mockCaches,
      fetch: (req: Request, init?: RequestInit) => currentFetchImpl(req, init),
      URL,
      Response,
    };

    vm.createContext(sandbox);
    vm.runInContext(swContent, sandbox);

    expect(typeof listeners.fetch).toBe('function');

    // Step 1: Authenticated navigation visit to /
    let capturedResponsePromise: Promise<Response> | null = null;
    listeners.fetch({
      request: {
        method: 'GET',
        mode: 'navigate',
        url: 'https://preview.qingyu-island-preview.pages.dev/',
        headers: { get: (h: string) => (h.toLowerCase() === 'accept' ? 'text/html' : null) },
      },
      respondWith: (p: Promise<Response>) => {
        capturedResponsePromise = p;
      },
    });

    const authedRes = await capturedResponsePromise!;
    expect(authedRes.status).toBe(200);
    // Crucial D6-03 invariant: HTML navigation must NEVER be written to CacheStorage
    expect(mockCache.put).not.toHaveBeenCalled();
    expect(storedCacheEntries.size).toBe(0);

    // Step 2: Access session expires (server responds with 302 redirect to Cloudflare Access login)
    currentFetchImpl = async () =>
      new Response(null, {
        status: 302,
        headers: { Location: 'https://qingyu-island.cloudflareaccess.com/cdn-cgi/access/login' },
      });

    listeners.fetch({
      request: {
        method: 'GET',
        mode: 'navigate',
        url: 'https://preview.qingyu-island-preview.pages.dev/',
        headers: { get: (h: string) => (h.toLowerCase() === 'accept' ? 'text/html' : null) },
      },
      respondWith: (p: Promise<Response>) => {
        capturedResponsePromise = p;
      },
    });
    const expiredRes = await capturedResponsePromise!;
    expect(expiredRes.status).toBe(302);
    expect(deletedCaches.length).toBeGreaterThan(0);

    // Step 3: Browser goes offline and user attempts to re-enter the app
    currentFetchImpl = async () => {
      throw new TypeError('Failed to fetch (offline)');
    };

    listeners.fetch({
      request: {
        method: 'GET',
        mode: 'navigate',
        url: 'https://preview.qingyu-island-preview.pages.dev/',
        headers: { get: (h: string) => (h.toLowerCase() === 'accept' ? 'text/html' : null) },
      },
      respondWith: (p: Promise<Response>) => {
        capturedResponsePromise = p;
      },
    });

    const offlineReenterRes = await capturedResponsePromise!;
    expect(offlineReenterRes.status).toBe(503);
    expect(offlineReenterRes.headers.get('X-A-Land-SW-Gate')).toBe('PRIVATE_PREVIEW_REAUTH_REQUIRED');
    expect(offlineReenterRes.headers.get('Cache-Control')).toContain('no-store');
    const offlineHtml = await offlineReenterRes.text();
    expect(offlineHtml).toContain('需重新验证访问权限');
    expect(offlineHtml).not.toContain('Authorized App');
  });
});

