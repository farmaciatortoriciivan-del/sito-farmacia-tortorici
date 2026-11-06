// Statistiche per l'area riservata (stessa password delle recensioni)
import { json, isAdmin } from "../_util.js";
import { assicuraTabelle } from "../visita.js";

export async function onRequest({ request, env }) {
  if (request.method !== "GET") return new Response("Metodo non consentito", { status: 405 });
  if (!(await isAdmin(request, env))) return json({ errore: "non_autorizzato" }, 401);
  await assicuraTabelle(env);
  const url = new URL(request.url);
  const giorni = Math.min(400, Math.max(1, parseInt(url.searchParams.get("giorni") || "30", 10) || 30));
  const dal = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(new Date(Date.now() - (giorni - 1) * 86400000));
  const q = (sql) => env.DB.prepare(sql).bind(dal);
  const V = "COUNT(DISTINCT giorno || visitatore)"; // visitatori diversi (contati per giorno)
  const r = await env.DB.batch([
    q(`SELECT ${V} AS visitatori, COUNT(*) AS pagine FROM visite WHERE giorno >= ? AND tipo = 'pagina'`),
    q(`SELECT giorno, ${V} AS visitatori, COUNT(*) AS pagine FROM visite WHERE giorno >= ? AND tipo = 'pagina' GROUP BY giorno ORDER BY giorno`),
    q(`SELECT citta, regione, paese, ROUND(AVG(lat), 2) AS lat, ROUND(AVG(lon), 2) AS lon, ${V} AS n FROM visite WHERE giorno >= ? AND tipo = 'pagina' GROUP BY citta, regione, paese ORDER BY n DESC LIMIT 60`),
    q(`SELECT provenienza AS nome, ${V} AS n FROM visite WHERE giorno >= ? AND tipo = 'pagina' AND provenienza IS NOT NULL GROUP BY provenienza ORDER BY n DESC LIMIT 12`),
    q(`SELECT dispositivo AS nome, ${V} AS n FROM visite WHERE giorno >= ? AND tipo = 'pagina' GROUP BY dispositivo ORDER BY n DESC`),
    q(`SELECT voce AS nome, ${V} AS n FROM visite WHERE giorno >= ? AND tipo = 'sezione' GROUP BY voce ORDER BY n DESC`),
    q(`SELECT voce AS nome, COUNT(*) AS n FROM visite WHERE giorno >= ? AND tipo = 'azione' GROUP BY voce ORDER BY n DESC`),
    q(`SELECT ora, COUNT(*) AS n FROM visite WHERE giorno >= ? AND tipo = 'pagina' GROUP BY ora ORDER BY ora`),
    q(`SELECT pagina AS nome, COUNT(*) AS n FROM visite WHERE giorno >= ? AND tipo = 'pagina' GROUP BY pagina ORDER BY n DESC`),
  ]);
  const [tot, perGiorno, citta, prov, disp, sezioni, azioni, ore, pagine] = r.map((x) => x.results);
  return json({ giorni, dal, totale: tot[0], perGiorno, citta, provenienza: prov, dispositivi: disp, sezioni, azioni, ore, pagine });
}
