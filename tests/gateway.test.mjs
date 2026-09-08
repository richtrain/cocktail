import test from 'node:test';
import assert from 'node:assert/strict';
import { gateway } from '../lib/gateway.js';
const origin = 'https://cocktail.example';
test('rejects foreign writes before forwarding', async () => {
  const response = await gateway(new Request(origin + '/api/score', { method: 'POST', headers: { origin: 'https://other.example' }, body: '{}' }));
  assert.equal(response.status, 403);
});
test('forwards only game cookie and preserves new player cookie', async t => {
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    assert.equal(url, 'https://cocktail-curling.wjdtmfdkss.chatgpt.site/api/me');
    assert.equal(init.headers.get('cookie'), 'cc_player=12345678-1234-1234-1234-123456789012');
    return Response.json({ best: 50 }, { headers: { 'set-cookie': 'cc_player=12345678-1234-1234-1234-123456789012; Path=/; HttpOnly; Secure; SameSite=Lax' } });
  });
  const response = await gateway(new Request(origin + '/api/me', { headers: { cookie: 'unrelated=secret; cc_player=12345678-1234-1234-1234-123456789012' } }));
  assert.equal((await response.json()).best, 50);
  assert.match(response.headers.get('set-cookie'), /HttpOnly/);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});
test('preserves score body and upstream status for valid writes', async t => {
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    assert.equal(init.body, '{"score":50}');
    assert.equal(init.headers.get('origin'), 'https://cocktail-curling.wjdtmfdkss.chatgpt.site');
    return Response.json({ error: 'duplicate' }, { status: 409 });
  });
  const response = await gateway(new Request(origin + '/api/score', { method: 'POST', headers: { origin }, body: '{"score":50}' }));
  assert.equal(response.status, 409);
});
test('rejects arbitrary destinations and oversized bodies', async () => {
  assert.equal((await gateway(new Request(origin + '/api/anything'))).status, 404);
  assert.equal((await gateway(new Request(origin + '/api/score', { method: 'POST', headers: { origin }, body: 'x'.repeat(2049) }))).status, 413);
});
test('fails cleanly if ranking backend is unreachable', async t => {
  t.mock.method(globalThis, 'fetch', async () => { throw Error('offline'); });
  assert.equal((await gateway(new Request(origin + '/api/ranking'))).status, 503);
});
