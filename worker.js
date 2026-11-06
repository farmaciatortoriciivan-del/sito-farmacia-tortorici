// Punto di ingresso del Worker: le pagine statiche arrivano da ./public,
// le richieste /api/* vanno alle funzioni delle recensioni.
import * as pubblico from "./functions/api/recensioni.js";
import * as admin from "./functions/api/admin/recensioni.js";
import * as notizie from "./functions/api/notizie.js";
import * as assistente from "./functions/api/assistente.js";
import * as turni from "./functions/api/turni.js";
import * as meteo from "./functions/api/meteo.js";
import * as animali from "./functions/api/animali.js";
import * as anziani from "./functions/api/anziani.js";
import * as img from "./functions/api/img.js";
import * as visita from "./functions/api/visita.js";
import * as statistiche from "./functions/api/admin/statistiche.js";

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    const c = { request, env, ctx };

    if (pathname === "/api/recensioni") {
      if (request.method === "GET") return pubblico.onRequestGet(c);
      if (request.method === "POST") return pubblico.onRequestPost(c);
      return new Response("Metodo non consentito", { status: 405 });
    }
    if (pathname === "/api/admin/recensioni") return admin.onRequest(c);
    if (pathname === "/api/admin/statistiche") return statistiche.onRequest(c);
    if (pathname === "/api/visita") return request.method === "POST" ? visita.onRequestPost(c) : new Response("Metodo non consentito", { status: 405 });
    if (pathname === "/api/notizie") return notizie.onRequest(c);
    if (pathname === "/api/animali") return animali.onRequest(c);
    if (pathname === "/api/anziani") return anziani.onRequest(c);
    if (pathname === "/api/img") return img.onRequest(c);
    if (pathname === "/api/meteo") return meteo.onRequest(c);
    if (pathname === "/api/turni") return turni.onRequestGet(c);
    if (pathname === "/api/assistente") return request.method === "POST" ? assistente.onRequestPost(c) : new Response("Metodo non consentito", { status: 405 });
    if (pathname.startsWith("/api/")) return new Response("Non trovato", { status: 404 });

    return env.ASSETS.fetch(request);
  },
  // ogni 30 minuti: rilegge i turni ufficiali delle farmacie
  async scheduled(event, env, ctx) {
    ctx.waitUntil(turni.aggiornaTurni(env));
    ctx.waitUntil(visita.pulisci(env).catch(() => {}));
  },
};
