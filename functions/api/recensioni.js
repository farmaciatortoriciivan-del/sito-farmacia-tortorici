// /api/recensioni
//   GET  -> recensioni pubblicate
//   POST -> nuova recensione (resta "in_attesa" finché lo staff non la approva)
import { json, sha256, DEFAULT_IP_SALT } from "./_util.js";
import { inviaAvviso } from "./avviso.js";
import { rispondiSeManca } from "./risposta.js";

export async function onRequestGet({ env, ctx }) {
  const { results } = await env.DB.prepare(
    "SELECT id, nome, stelle, testo, data, risposta FROM recensioni WHERE stato = 'pubblicata' ORDER BY data DESC LIMIT 500"
  ).all();
  // recensioni pubblicate senza risposta (per esempio quelle approvate prima): la scriviamo ora, poche alla volta
  const mancano = results.filter((r) => !r.risposta).slice(0, 3);
  if (mancano.length && ctx) ctx.waitUntil(Promise.all(mancano.map((r) => rispondiSeManca(env, r.id).catch(() => {}))));
  for (const r of results) delete r.id;
  return new Response(JSON.stringify(results), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=60" },
  });
}

export async function onRequestPost({ request, env, ctx }) {
  let body;
  try { body = await request.json(); } catch { return json({ errore: "Richiesta non valida." }, 400); }

  // campo trappola per i bot: se compilato fingiamo successo
  if (body.sito) return json({ ok: true });

  const nome = String(body.nome || "").trim().replace(/\s+/g, " ");
  const testo = String(body.testo || "").trim();
  const stelle = Number(body.stelle);
  if (!Number.isInteger(stelle) || stelle < 1 || stelle > 5) return json({ errore: "Scegli da 1 a 5 stelle." }, 400);
  if (nome.length < 2 || nome.length > 40) return json({ errore: "Scrivi il tuo nome (2-40 caratteri)." }, 400);
  if (testo.length < 10 || testo.length > 600) return json({ errore: "La recensione deve avere tra 10 e 600 caratteri." }, 400);
  if (body.consenso !== true) return json({ errore: "Serve il consenso alla pubblicazione." }, 400);
  if (/https?:\/\/|www\./i.test(testo)) return json({ errore: "Per favore non inserire link." }, 400);

  // massimo 3 recensioni al giorno dallo stesso indirizzo
  const ip = request.headers.get("cf-connecting-ip") || "";
  const ipHash = await sha256(ip + (env.IP_SALT || DEFAULT_IP_SALT));
  const ieri = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { n } = await env.DB.prepare("SELECT COUNT(*) AS n FROM recensioni WHERE ip_hash = ? AND data > ?")
    .bind(ipHash, ieri).first();
  if (n >= 3) return json({ errore: "Hai già inviato diverse recensioni oggi. Riprova domani." }, 429);

  await env.DB.prepare("INSERT INTO recensioni (nome, stelle, testo, data, ip_hash) VALUES (?, ?, ?, ?, ?)")
    .bind(nome, stelle, testo, new Date().toISOString(), ipHash).run();
  // avviso email allo staff, senza far aspettare il cliente
  const avviso = inviaAvviso(env, { nome, stelle, testo });
  if (ctx && ctx.waitUntil) ctx.waitUntil(avviso); else await avviso;
  return json({ ok: true }, 201);
}
