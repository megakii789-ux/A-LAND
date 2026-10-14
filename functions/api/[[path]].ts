/**
 * Cloudflare Pages Catch-All Function: /api/*
 * Gate D3 & SEC-01/SEC-02: Enforces Fail-Closed HTTP 503 for all unverified cloud APIs.
 * Prevents SPA fallback from serving index.html for /api/* routes.
 */

export interface PagesFunctionContext {
  request: Request;
  env?: Record<string, unknown>;
  params?: Record<string, string | string[]>;
}

const FAIL_CLOSED_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-A-Land-Fail-Closed': 'true',
  'X-Release-Gate-Status': 'ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED',
};

export async function onRequest(_context: PagesFunctionContext): Promise<Response> {
  const payload = {
    success: false,
    code: 'API_DISABLED_PENDING_VERIFIED_AUTH',
    error: 'CLOUD_API_DISABLED',
    mode: 'local-only-verified',
    releaseApprovalStatus: 'ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED',
    remoteRelayEnabled: false,
    cloudSyncEnabled: false,
    message: '当前版本为本地高安全运行模式，云端同步与远程通知接口已强制关闭（Fail-Closed）。',
    data: null,
  };

  return new Response(JSON.stringify(payload), {
    status: 503,
    headers: FAIL_CLOSED_HEADERS,
  });
}
