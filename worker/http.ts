export const json = (value: unknown, status = 200) => Response.json(value, {status, headers: {'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer'}});
export const canEdit = (request: Request, env: Env) => !!request.headers.get('oai-authenticated-user-id') && [env.EDITOR_EMAIL,...(env.ADMIN_EMAILS||'').split(',')].map(email=>email?.trim().toLowerCase()).filter(Boolean).includes(request.headers.get('oai-authenticated-user-email')?.toLowerCase()||'');
export async function readBytes(request: Request, limit: number) {
  if (Number(request.headers.get('content-length') || 0) > limit) throw new RangeError('Request too large');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Empty request');
  const chunks: Uint8Array[] = []; let length = 0;
  while (true) { const {done, value} = await reader.read(); if (done) break; length += value.byteLength; if (length > limit) {await reader.cancel(); throw new RangeError('Request too large');} chunks.push(value); }
  const bytes = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) {bytes.set(chunk, offset); offset += chunk.length;}
  return bytes;
}
