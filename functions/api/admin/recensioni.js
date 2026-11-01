// /api/admin/recensioni  (serve l'intestazione Authorization: Bearer <ADMIN_PASSWORD>)
//   GET  -> tutte le recensioni (in attesa e pubblicate)
//   POST {id, azione: "approva" | "nascondi" | "elimina"}
import { json, isAdmin } from "../_util.js";

export async function onRequest({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ errore: "Password errata." }, 401);

  if (request.method === "GET") {
    const { results } = await env.DB.prepare(
      "SELECT id, nome, stelle, testo, data, stato FROM recensioni ORDER BY stato = 'pubblicata', data DESC LIMIT 1000"
    ).all();
    return json(results);
  }

  if (request.method === "POST") {
    let body;
    try { body = await request.json(); } catch { return json({ errore: "Richiesta non valida." }, 400); }
    const id = Number(body.id);
    if (!Number.isInteger(id)) return json({ errore: "Id non valido." }, 400);
    if (body.azione === "approva")
      await env.DB.prepare("UPDATE recensioni SET stato = 'pubblicata' WHERE id = ?").bind(id).run();
    else if (body.azione === "nascondi")
      await env.DB.prepare("UPDATE recensioni SET stato = 'in_attesa' WHERE id = ?").bind(id).run();
    else if (body.azione === "elimina")
      await env.DB.prepare("DELETE FROM recensioni WHERE id = ?").bind(id).run();
    else return json({ errore: "Azione sconosciuta." }, 400);
    return json({ ok: true });
  }

  return json({ errore: "Metodo non consentito." }, 405);
}
