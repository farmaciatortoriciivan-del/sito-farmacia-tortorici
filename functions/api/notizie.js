// Rubrica "Attualità sanitaria": titoli da Quotidiano Sanità e Farmacista33 (feed RSS/Atom pubblici).
// Il Worker legge i feed lato server, tiene il risultato in cache per 30 minuti
// e restituisce solo titolo, data, link e fonte: gli articoli si leggono sui siti delle testate.
const TTL = 1800; // secondi
const MAX = 6;

const FONTI = [
  {
    nome: "Quotidiano Sanità",
    dominio: /^https:\/\/(www\.)?quotidianosanita\.it\//,
    feed: ["https://www.quotidianosanita.it/feed/", "https://www.quotidianosanita.it/?feed=rss2"],
    filtra: false,
  },
  {
    nome: "Farmacista33",
    dominio: /^https:\/\/(www\.)?farmacista33\.it\//,
    feed: ["https://www.farmacista33.it/feed/", "https://www.farmacista33.it/rss", "https://www.farmacista33.it/rss.xml", "https://www.farmacista33.it/feed", "https://www.farmacista33.it/?feed=rss2"],
    filtra: true, // testata per farmacisti: teniamo solo le notizie utili ai clienti
  },
];

// Selezione per i clienti della farmacia: temi di salute sì, temi di categoria/professionali no.
const UTILI = /salut|prevenz|vaccin|influenz|farmac[io]|medicin|integrator|vitamin|dieta|alimenta|nutriz|pelle|derma|sole|solar|allerg|asma|diabet|glicem|pression|cuore|cardi|colesterol|bambin|pediatr|neonat|gravidanz|anzian|sonno|antibiot|screening|tumor|cancro|virus|covid|infezion|ricetta|carenz|studio|ricerca|sintom|dolore|osse|osteopor|memoria|demenz|alzheimer|obesit|peso|sport|fumo|alcol|stress|ansia|depress|occhi|vista|denti|orale|intestin|stomaco|fegato|reni|tiroid|ormon|menopaus|holter|ecg|telemedicin|consigli|benesser|igiene|cura/i;
const PROFESSIONALI = /contratt|ccnl|sindacat|concors|laure|universit|titolar|bilanc|fatturat|mercato|distribuzion|grossist|ordine dei|fofi|enpaf|federfarma|assofarm|utifar|assemblea|congress|convention|nomin|elezion|fusion|acquisizion|catene|retail|marketing|gestional|software|fiscal|tasse|iva\b|remunerazion|convenzione farmaceutica|dpc|gara|appalt|aziend|industria|investiment|borsa|ricavi|personale|stipend|tirocin|formazion|ecm\b|webinar|annunci/i;
const utile = (t) => UTILI.test(t) && !PROFESSIONALI.test(t);

const decode = (s) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&apos;|&#039;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return m ? decode(m[1]) : "";
};

// Legge sia RSS (<item>) sia Atom (<entry>)
export function parseFeed(xml, fonte) {
  const out = [];
  for (const m of xml.matchAll(/<(item|entry)[\s>][\s\S]*?<\/\1>/gi)) {
    const it = m[0];
    const titolo = tag(it, "title");
    let link = tag(it, "link");
    if (!link) { const h = it.match(/<link[^>]*href="([^"]+)"/i); link = h ? h[1].replace(/&amp;/g, "&") : ""; }
    if (!titolo || !fonte.dominio.test(link)) continue;
    const testo = titolo + " " + tag(it, "description") + " " + tag(it, "summary") + " " + tag(it, "category");
    if (fonte.filtra && !utile(testo)) continue;
    const d = Date.parse(tag(it, "pubDate") || tag(it, "published") || tag(it, "updated") || tag(it, "dc:date"));
    out.push({ titolo, link, data: isNaN(d) ? null : new Date(d).toISOString(), categoria: tag(it, "category") || null, fonte: fonte.nome });
  }
  return out;
}

// Alterna le fonti (più recenti prima) fino a MAX notizie
export function unisci(liste) {
  const ordinate = liste.map((l) => [...l].sort((a, b) => (b.data || "").localeCompare(a.data || "")));
  const out = [];
  for (let i = 0; out.length < MAX && ordinate.some((l) => l[i]); i++)
    for (const l of ordinate) if (l[i] && out.length < MAX) out.push(l[i]);
  return out;
}

async function leggi(fonte) {
  for (const url of fonte.feed) {
    try {
      const r = await fetch(url, {
        headers: { "user-agent": "Mozilla/5.0 (compatible; SitoFarmaciaTortorici/1.0)", accept: "application/rss+xml, application/atom+xml, application/xml, text/xml" },
        cf: { cacheTtl: TTL, cacheEverything: true },
      });
      if (!r.ok) continue;
      const n = parseFeed(await r.text(), fonte);
      if (n.length) return n;
    } catch (e) { /* prova l'indirizzo successivo */ }
  }
  return [];
}

export async function onRequest({ request, ctx }) {
  const cache = caches.default;
  const key = new Request(new URL("/api/notizie?v=2", request.url).toString());
  const hit = await cache.match(key);
  if (hit) return hit;

  const notizie = unisci(await Promise.all(FONTI.map(leggi)));
  const res = new Response(JSON.stringify({ fonti: FONTI.map((f) => f.nome), aggiornato: new Date().toISOString(), notizie }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": `public, max-age=${notizie.length ? TTL : 300}`,
    },
  });
  if (notizie.length) ctx.waitUntil(cache.put(key, res.clone()));
  return res;
}
