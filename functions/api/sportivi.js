// Rubrica "Sport e salute": articoli per chi fa sport (allenamento, alimentazione, idratazione,
// prevenzione degli infortuni, recupero), dai feed RSS di riviste sportive italiane.
// Restituisce titolo, data, immagine, fonte e link: gli articoli si leggono sui siti delle riviste.
// Se una fonte non risponde viene saltata; ?diagnostica=1 mostra lo stato di ogni feed.
import { CATENE } from "./notizie.js";
import { anteprima } from "./anziani.js";

export const FONTI = [
  { nome: "Runner's World Italia", feed: "https://www.runnersworld.com/it/rss/all.xml/", dominio: /^https:\/\/www\.runnersworld\.com\/it\//, sito: "https://www.runnersworld.com/it/" },
  { nome: "Runlovers", feed: "https://www.runlovers.it/feed/", dominio: /^https:\/\/(www\.)?runlovers\.it\//, sito: "https://www.runlovers.it/" },
  { nome: "Correre", feed: "https://www.correre.it/feed/", dominio: /^https:\/\/(www\.)?correre\.it\//, sito: "https://www.correre.it/" },
  { nome: "The Running Club", feed: "https://www.therunningclub.it/feed", dominio: /^https:\/\/(www\.)?therunningclub\.it\//, sito: "https://www.therunningclub.it/" },
];
// domini delle immagini delle riviste (da aggiungere anche in img.js)
export const DOMINI_IMG = ["runnersworld.com", "menshealth.com", "hearstapps.com", "runlovers.it", "correre.it", "therunningclub.it", "nonsolofitness.it"];
const TTL = 3600;
const MAX = 4;
const MAX_GIORNI = 120;

const decode = (s) => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/<[^>]+>/g, " ")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&quot;/g, '"').replace(/&apos;|&#039;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
  .replace(/\s+/g, " ").trim();
const grezzo = (xml, name) => { const m = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i")); return m ? m[1] : ""; };

function leggi(xml, fonte) {
  const out = [];
  const limite = Date.now() - MAX_GIORNI * 864e5;
  for (const m of xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)) {
    const it = m[0];
    const titolo = decode(grezzo(it, "title"));
    const link = decode(grezzo(it, "link"));
    if (!titolo || !fonte.dominio.test(link)) continue;
    const d = Date.parse(decode(grezzo(it, "pubDate")));
    if (!isNaN(d) && d < limite) continue;
    const desc = grezzo(it, "description") + grezzo(it, "content:encoded");
    const img = (it.match(/<(?:media:content|media:thumbnail|enclosure)[^>]+url="([^"]+)"/i) || desc.match(/<img[^>]+src="([^"]+)"/i) || [])[1] || null;
    out.push({ titolo, link, fonte: fonte.nome, immagine: img && /^https:\/\//.test(img) ? img.replace(/&amp;/g, "&") : null,
      data: isNaN(d) ? null : new Date(d).toISOString(), sommario: decode(grezzo(it, "description")).slice(0, 220) });
  }
  return out;
}

// Filtri applicati SEMPRE (anche dopo la scelta dell'AI):
// fuori prodotti e recensioni, gare e campioni, cronaca, offerte; dentro solo temi di salute e attività fisica
const ESCLUDI = /classific|risultat|\bvinc|vittori|record|campion|campionat|maratona di [A-Z]|mercato|squalific|doping|arrest|mort[oai]\b|incident|tragedi|politic|offert|scont|black friday|codice promo|recension|\bprova\b|test\b|scarp|sneaker|smartwatch|sportwatch|orologio|gps|cuffie|auricolari|abbigliament|giacca|nuova [A-Z]|nuovo [A-Z]|adidas|nike|asics|brooks|hoka|saucony|mizuno|joma|kiprun|garmin|coros|suunto|polar|expedition|hub\b|evento|iscrizion|studiare|lavoro|carriera|sesso|gossip|celebrit/i;
const TEMI = /corr|runner|\bkm\b|programma|allen|eserciz|sport|attività fisica|camminat|palestra|fitness|muscol|recuper|idrat|acqua|aliment|nutri|dieta|proteine|carboidrat|integrator|vitamin|stretching|riscaldament|infortun|dolor|tendin|ginocchi|caviglia|schiena|crampi|sonno|cuore|pression|diabet|asma|respir|postur|squat|addominal|forza|resistenza|polifenol|benesser|salute/i;
const adatto = (a) => TEMI.test(a.titolo + " " + a.sommario) && !ESCLUDI.test(a.titolo);

async function scegli(env, articoli) {
  articoli = articoli.filter((a) => !CATENE.test(a.titolo + " " + a.sommario) && adatto(a));
  if (env && env.AI && articoli.length) {
    try {
      const elenco = articoli.map((a, i) => `${i + 1}. [${a.fonte}] ${a.titolo}${a.sommario ? " — " + a.sommario : ""}`).join("\n");
      const r = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        messages: [
          { role: "system", content: "Sei il redattore del sito di una farmacia di paese. Scegli SOLO gli articoli che danno consigli pratici di salute a chi fa sport o attività fisica (anche principianti e persone non più giovani): salute, allenamento sicuro, alimentazione e idratazione, integratori usati con buon senso, prevenzione e cura degli infortuni, recupero, sonno, riscaldamento e stretching, sport in caso di malattie come diabete, pressione alta o asma. ESCLUDI articoli che non parlano di sport o attività fisica (studio, lavoro, invecchiamento in generale), racconti di gare, atleti famosi e loro allenamenti, risultati e classifiche, cronaca sportiva, eventi, scarpe, orologi e altri prodotti, calciomercato, doping, prove e confronti di prodotti, offerte e sconti, pubblicità, gossip, diete estreme o promesse miracolose. Nel dubbio escludi. Rispondi solo con un array JSON dei numeri scelti, per esempio [1,4]. Se nessuno va bene rispondi []." },
          { role: "user", content: elenco },
        ],
        max_tokens: 80, temperature: 0,
      });
      const m = String((r && r.response) || "").match(/\[[\d,\s]*\]/);
      if (m) { const s = new Set(JSON.parse(m[0])); return articoli.filter((_, i) => s.has(i + 1)); }
    } catch (e) { /* regola di riserva */ }
  }
  return articoli;
}

async function feed(f) {
  try {
    const r = await fetch(f.feed, { headers: { "user-agent": "Mozilla/5.0 (compatible; SitoFarmaciaTortorici/1.0)", accept: "application/rss+xml, application/xml, text/xml" }, cf: { cacheTtl: TTL } });
    if (!r.ok) return { stato: r.status, articoli: [] };
    const a = leggi(await r.text(), f);
    return { stato: r.status, articoli: a.slice(0, 15) };
  } catch (e) { return { stato: "errore", articoli: [] }; }
}

export async function onRequest({ request, env, ctx }) {
  const url = new URL(request.url);
  const diag = url.searchParams.get("diagnostica") === "1";
  const cache = caches.default;
  const key = new Request(new URL("/api/sportivi?v=3", request.url).toString());
  if (!diag) { const hit = await cache.match(key); if (hit) return hit; }

  const ris = await Promise.all(FONTI.map(feed));
  const tutti = ris.flatMap((r) => r.articoli);
  let articoli = await scegli(env, tutti);
  articoli = articoli.sort((a, b) => (b.data || "").localeCompare(a.data || ""));
  const conta = {};
  articoli = articoli.filter((a) => (conta[a.fonte] = (conta[a.fonte] || 0) + 1) <= 2).slice(0, MAX).map(({ sommario, ...a }) => a);
  await Promise.all(articoli.map(async (a) => { a.immagine = (await anteprima(a.link)) || a.immagine; }));

  const corpo = { fonti: FONTI.map((f) => ({ nome: f.nome, sito: f.sito })), aggiornato: new Date().toISOString(), articoli };
  if (diag) corpo.diagnostica = FONTI.map((f, i) => ({ fonte: f.nome, stato: ris[i].stato, letti: ris[i].articoli.length, esempi: ris[i].articoli.slice(0, 3).map((a) => a.titolo) })).concat([{ scelti: articoli.length, su: tutti.length }]);
  const res = new Response(JSON.stringify(corpo), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": diag ? "no-store" : `public, max-age=${articoli.length ? TTL : 300}` },
  });
  if (!diag && articoli.length) ctx.waitUntil(cache.put(key, res.clone()));
  return res;
}
