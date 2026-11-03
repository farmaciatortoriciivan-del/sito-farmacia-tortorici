export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

export async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Password admin: se in Cloudflare è impostato il segreto ADMIN_PASSWORD vale quello,
// altrimenti vale la password predefinita, di cui qui c'è solo l'impronta (non reversibile).
const ADMIN_SALT = "6db8be823e07461054708de128c58e55";
const ADMIN_HASH = "5d3041a1cab40ef1a1508c2a8ef80230f20f1528c96d493774ff48efea5e421c";
export const DEFAULT_IP_SALT = "farmacia-tortorici-trabia";

// confronto a tempo costante della password admin
export async function isAdmin(request, env) {
  const got = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!got) return false;
  const [a, b] = env.ADMIN_PASSWORD
    ? await Promise.all([sha256(got), sha256(env.ADMIN_PASSWORD)])
    : [await sha256(ADMIN_SALT + got), ADMIN_HASH];
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0 && got.length > 0;
}
