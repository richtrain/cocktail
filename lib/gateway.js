// Fixed, public backend owned by this game. No arbitrary proxy destinations.
const UPSTREAM = 'https://cocktail-curling.wjdtmfdkss.chatgpt.site';
const routes = { '/api/me': 'GET', '/api/ranking': 'GET', '/api/run': 'POST', '/api/score': 'POST' };
const json = (error, status) => Response.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } });
export async function gateway(request) {
  const url = new URL(request.url);
  if (!routes[url.pathname]) return json('요청을 찾을 수 없어요.', 404);
  if (routes[url.pathname] !== request.method) return json('허용되지 않는 요청이에요.', 405);
  // Preserve same-origin write protection at the new public entrypoint.
  if (request.method === 'POST' && request.headers.get('origin') !== url.origin) return json('잘못된 요청이에요.', 403);
  let body;
  if (request.method === 'POST') {
    if (Number(request.headers.get('content-length') || 0) > 2048) return json('요청이 너무 커요.', 413);
    body = await request.text();
    if (new TextEncoder().encode(body).length > 2048) return json('요청이 너무 커요.', 413);
  }
  const headers = new Headers({ accept: 'application/json' });
  const player = (request.headers.get('cookie') || '').match(/(?:^|;\s*)cc_player=([a-f0-9-]{36})(?:;|$)/);
  if (player) headers.set('cookie', 'cc_player=' + player[1]);
  if (request.method === 'POST') {
    headers.set('origin', UPSTREAM);
    headers.set('content-type', 'application/json');
  }
  try {
    const upstream = await fetch(UPSTREAM + url.pathname, { method: request.method, headers, body, redirect: 'error', signal: AbortSignal.timeout(8000) });
    if (!(upstream.headers.get('content-type') || '').includes('application/json')) return json('점수 서버에 연결하지 못했어요.', 503);
    const responseHeaders = new Headers({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    const cookie = upstream.headers.get('set-cookie');
    if (cookie?.startsWith('cc_player=')) responseHeaders.set('set-cookie', cookie);
    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch {
    return json('연결이 불안정해요. 잠시 후 다시 시도해 주세요.', 503);
  }
}
