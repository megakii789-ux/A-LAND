import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { onRequest as onHealthRequest } from '../../functions/api/health';
import { onRequest as onCatchAllApiRequest } from '../../functions/api/[[path]]';

describe('Gate D3 & D4: Cloudflare Pages Static & Functions Security Adapter', () => {
  it('GET /api/health Pages Function returns 200 OK with local-only-verified and ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED', async () => {
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

  it('POST /api/health Pages Function rejects non-GET requests with 405 JSON (never HTML)', async () => {
    const req = new Request('https://preview.qingyu-island-preview.pages.dev/api/health', {
      method: 'POST',
    });
    const res = await onHealthRequest({ request: req });

    expect(res.status).toBe(405);
    expect(res.headers.get('Content-Type')).toContain('application/json');
    const body = await res.json();
    expect(body.code).toBe('METHOD_NOT_ALLOWED');
  });

  it('All /api/* business routes enforce Fail-Closed HTTP 503 JSON and never fall back to SPA index.html', async () => {
    const endpoints = [
      { url: 'https://preview.qingyu-island-preview.pages.dev/api/caregiver/sync', method: 'POST' },
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

      const text = await res.text();
      expect(text).not.toContain('<!doctype html>');
      const data = JSON.parse(text);
      expect(data.success).toBe(false);
      expect(data.code).toBe('API_DISABLED_PENDING_VERIFIED_AUTH');
      expect(data.error).toBe('CLOUD_API_DISABLED');
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

  it('public/_headers and public/version.json enforce no-store on SW/HTML and carry ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED', () => {
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
    expect(versionData.remoteRelayEnabled).toBe(false);
    expect(versionData.cloudSyncEnabled).toBe(false);
    expect(versionData.branch).toBe('preview');
  });

  it('public/sw.js excludes /cdn-cgi/ Cloudflare Access endpoints and supports cache cleanup on rollback/update', () => {
    const swPath = path.resolve(process.cwd(), 'public/sw.js');
    const swContent = fs.readFileSync(swPath, 'utf-8');
    expect(swContent).toContain('sunny-island-app-shell-v2');
    expect(swContent).toContain('/\\/cdn-cgi\\//');
    expect(swContent).toContain('CLEAR_OLD_CACHES');
  });
});
