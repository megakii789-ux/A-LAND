/**
 * Cloudflare Pages Function: GET /api/health
 * Gate D3: Static deployment health check returning explicit local-first mode
 * and ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED status.
 */

export interface PagesFunctionContext {
  request: Request;
  env?: Record<string, unknown>;
  params?: Record<string, string | string[]>;
}

const SECURITY_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-Release-Gate-Status': 'ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED',
};

export async function onRequest(context: PagesFunctionContext): Promise<Response> {
  if (context.request.method !== 'GET' && context.request.method !== 'HEAD') {
    return new Response(
      JSON.stringify({
        success: false,
        code: 'METHOD_NOT_ALLOWED',
        error: 'ONLY_GET_ALLOWED_ON_HEALTH',
        message: '健康检查端点仅支持 GET 请求。',
        data: null,
      }),
      {
        status: 405,
        headers: {
          ...SECURITY_HEADERS,
          Allow: 'GET, HEAD',
        },
      }
    );
  }

  const payload = {
    status: 'ok',
    mode: 'local-only-verified',
    deploymentTarget: 'cloudflare-pages-static',
    releaseApprovalStatus: 'ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED',
    remoteRelayEnabled: false,
    cloudSyncEnabled: false,
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: SECURITY_HEADERS,
  });
}
