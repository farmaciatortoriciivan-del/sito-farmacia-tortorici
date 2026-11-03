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
    filtra: true, // anche qui solo notizie utili ai clienti, niente politica sanitaria o temi di categoria
  },
  {
    nome: "Farmacista33",
    dominio: /^https:\/\/(www\.)?farmacista33\.it\//,
    feed: ["https://www.farmacista33.it/feed/", "https://www.farmacista33.it/rss", "https://www.farmacista33.it/rss.xml", "https://www.farmacista33.it/feed", "https://www.farmacista33.it/?feed=rss2"],
    filtra: true, // testata per farmacisti: teniamo solo le notizie dedicate ai pazienti
  },
];

// Farmacista33 è una testata per farmacisti: pubblichiamo SOLO le notizie rivolte ai pazienti.
// Regola: almeno un tema da paziente e nessun tema professionale/di categoria.
const PAZIENTI = [/cittadin/i, /pazient/i, /campagn/i, /sintom/i, /prevenz/i, /vaccin/i, /screening/i, /consigl/i,
  /segnal/i, /malatti/i, /ictus/i, /cuore|cardi/i, /diabet|glicem/i, /allerg|asma/i, /influenz|raffreddor/i,
  /bambin|pediatr|neonat/i, /donn|gravidanz|menopaus/i, /anzian/i, /sonno|insonn/i, /aliment|dieta|nutriz/i,
  /sole|solar|abbronz/i, /pelle|derma/i, /dolor/i, /rischi/i, /giornata mondiale|settimana mondiale/i,
  /salute (di|del|della|dei|delle)/i, /come (curare|prevenire|riconoscere)/i, /effetti collateral|reazioni avvers/i,
  /integrator|vitamin/i, /colesterol|pression/i, /tumor|cancro/i, /osteopor|ossa/i, /memoria|demenz|alzheimer/i,
  /peso|obesit/i, /fumo|alcol/i, /occhi|vista/i, /denti|bocca/i, /intestin|stomaco|digest/i, /virus|infezion|batteri/i];
const PROFESSIONALI = [/contratt|ccnl/i, /sindacat|mobilitazion|sciopero/i, /farmacist[ie]\b/i, /\bmedici\b/i, /prescrizion|ricett[ae] (elettronic|dematerializz)/i,
  /remunerazion|convenzion|tariff/i, /normativ|decreto|legge|ddl|emendament|delibera/i, /mercato|vendite|fatturat|bilanc|ricavi/i,
  /aziend|industri|investiment/i, /federfarma|fofi|enpaf|assofarm|utifar|ordine de/i, /concors|laure|universit|tirocin/i,
  /formazion|ecm\b|webinar|corso|congress|convegn/i, /titolar|catene|retail|marketing|gestional|software/i,
  /distribuzion|grossist|dpc\b|gar[ae] d|appalt/i, /nomin|elezion|president|assemblea/i, /fiscal|tasse|\biva\b/i, /lavor|personale|stipend/i, /fornitur|approvvigion|scort/i, /professioni sanitarie|professionist|operatori sanitari/i,
  /\bveterinar/i, /medical\b|pharma\b|s\.p\.a|srl\b/i, /manovra|governo|ministr|parlament|regioni|asl\b|ssn\b/i, /farmaceutic/i];
const SEZIONI_ESCLUSE = /\/(lavoro|mercato|politica|normativa|professione|aziende|eventi|annunci)[-/]/i;
export const perPazienti = (testo, link = "") => {
  if (SEZIONI_ESCLUSE.test(link)) return false;
  const piu = PAZIENTI.filter((r) => r.test(testo)).length;
  const meno = PROFESSIONALI.filter((r) => r.test(testo)).length;
  return meno === 0 && piu >= 1;
};

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
    if (fonte.filtra && (SEZIONI_ESCLUSE.test(link) || PROFESSIONALI.some((r) => r.test(titolo)))) continue;
    const d = Date.parse(tag(it, "pubDate") || tag(it, "published") || tag(it, "updated") || tag(it, "dc:date"));
    out.push({ titolo, link, data: isNaN(d) ? null : new Date(d).toISOString(), categoria: tag(it, "category") || null, fonte: fonte.nome,
      sommario: tag(it, "description").slice(0, 200) });
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

// Workers AI (gratuito nei limiti giornalieri): per entrambe le testate decide quali titoli interessano un cliente comune.
// Se l'AI non è disponibile si usa la regola a parole, applicata al solo titolo.
const MODELLO = "@cf/meta/llama-3.1-8b-instruct";
export async function perClienti(env, notizie) {
  if (!notizie.length) return [];
  if (env && env.AI) {
    try {
      const elenco = notizie.map((n, i) => `${i + 1}. ${n.titolo}${n.sommario ? " — " + n.sommario : ""}`).join("\n");
      const r = await env.AI.run(MODELLO, {
        messages: [
          { role: "system", content: "Sei il redattore del sito di una farmacia di paese. Scegli SOLO le notizie che interessano a un cliente comune della farmacia (salute, malattie, prevenzione, consigli, farmaci dal punto di vista del paziente, alimentazione, benessere). ESCLUDI tutto ciò che interessa solo agli addetti ai lavori: aziende, forniture, mercato, politica sanitaria, contratti, professioni sanitarie, normative, congressi, ricerca di laboratorio senza ricadute pratiche per il paziente. Nel dubbio escludi. Rispondi solo con un array JSON dei numeri scelti, per esempio [2,5]. Se nessuna va bene rispondi []." },
          { role: "user", content: elenco },
        ],
        max_tokens: 60,
        temperature: 0,
      });
      const m = String((r && r.response) || "").match(/\[[\d,\s]*\]/);
      if (m) {
        const scelti = new Set(JSON.parse(m[0]));
        return notizie.filter((_, i) => scelti.has(i + 1));
      }
    } catch (e) { console.log("AI non disponibile:", e && e.message); }
  }
  return notizie.filter((n) => perPazienti(n.titolo, n.link));
}

async function leggi(fonte, env) {
  for (const url of fonte.feed) {
    try {
      const r = await fetch(url, {
        headers: { "user-agent": "Mozilla/5.0 (compatible; SitoFarmaciaTortorici/1.0)", accept: "application/rss+xml, application/atom+xml, application/xml, text/xml" },
        cf: { cacheTtl: TTL, cacheEverything: true },
      });
      if (!r.ok) continue;
      let n = parseFeed(await r.text(), fonte);
      if (fonte.filtra) n = await perClienti(env, n.slice(0, 20));
      if (n.length) return n;
    } catch (e) { /* prova l'indirizzo successivo */ }
  }
  return [];
}

export async function onRequest({ request, env, ctx }) {
  const cache = caches.default;
  const key = new Request(new URL("/api/notizie?v=5", request.url).toString());
  const hit = await cache.match(key);
  if (hit) return hit;

  const notizie = unisci(await Promise.all(FONTI.map((f) => leggi(f, env)))).map(({ sommario, ...n }) => n);
  const res = new Response(JSON.stringify({ fonti: FONTI.map((f) => f.nome), aggiornato: new Date().toISOString(), notizie }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": `public, max-age=${notizie.length ? TTL : 300}`,
    },
  });
  if (notizie.length) ctx.waitUntil(cache.put(key, res.clone()));
  return res;
}
