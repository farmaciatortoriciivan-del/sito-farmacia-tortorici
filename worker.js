// Punto di ingresso del Worker: le pagine statiche arrivano da ./public,
// le richieste /api/* vanno alle funzioni delle recensioni.
import * as pubblico from "./functions/api/recensioni.js";
import * as admin from "./functions/api/admin/recensioni.js";
import * as notizie from "./functions/api/notizie.js";
import * as assistente from "./functions/api/assistente.js";

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
    if (pathname === "/api/notizie") return notizie.onRequest(c);
    if (pathname === "/api/assistente") return request.method === "POST" ? assistente.onRequestPost(c) : new Response("Metodo non consentito", { status: 405 });
    if (pathname.startsWith("/api/")) return new Response("Non trovato", { status: 404 });

    return env.ASSETS.fetch(request);
  },
};
