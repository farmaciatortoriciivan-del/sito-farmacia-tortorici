// /api/assistente — assistente automatico del sito (risponde alle domande pratiche dei clienti).
// Usa Workers AI di Cloudflare (gratuito nei limiti giornalieri). Nessun dato viene salvato:
// si conta solo quanti messaggi arrivano da ogni indirizzo (in forma cifrata) per evitare abusi.
import { json, sha256, DEFAULT_IP_SALT } from "./_util.js";

const MODELLI = ["@cf/meta/llama-3.3-70b-instruct-fp8-fast", "@cf/meta/llama-3.1-8b-instruct-fast"];
const LIMITE_ORA = 40; // messaggi per indirizzo all'ora

// Orari: tenerli allineati con const ORARI in public/index.html
const ORARI = {
  1: [["08:30", "13:00"], ["16:15", "19:45"]], 2: [["08:30", "13:00"], ["16:15", "19:45"]],
  3: [["08:30", "13:00"], ["16:15", "19:45"]], 4: [["08:30", "13:00"], ["16:15", "19:45"]],
  5: [["08:30", "13:00"], ["16:15", "19:45"]], 6: [["08:30", "13:00"], ["16:15", "19:30"]],
  0: [["09:00", "13:00"]],
};
const GIORNI = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];

function adessoRoma() {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", weekday: "short", hour12: false,
  }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday);
  return { wd, hm: `${p.hour === "24" ? "00" : p.hour}:${p.minute}`, data: `${p.day}/${p.month}/${p.year}` };
}

export function statoApertura(now = adessoRoma()) {
  const fasce = ORARI[now.wd] || [];
  const aperto = fasce.find(([a, b]) => now.hm >= a && now.hm < b);
  if (aperto) return `APERTA in questo momento (chiude alle ${aperto[1]}).`;
  for (let k = 0; k < 8; k++) {
    const d = (now.wd + k) % 7;
    const f = (ORARI[d] || []).find(([a]) => k > 0 || a > now.hm);
    if (f) return `CHIUSA in questo momento. Riapre ${k === 0 ? "oggi" : k === 1 ? "domani" : GIORNI[d]} alle ${f[0]}.`;
  }
  return "CHIUSA in questo momento.";
}

function istruzioni(lingua) {
  const now = adessoRoma();
  const lang = { en: "English", de: "German (use the formal 'Sie')" }[lingua] || "Italian";
  return `Sei l'assistente automatico del sito della Farmacia Dott. Ivan Tortorici di Trabia (Palermo). Aiuti i clienti con domande pratiche, in modo cordiale, chiaro e breve (massimo 3-4 frasi). Rispondi nella lingua del cliente; se non è chiara usa: ${lang}.

ADESSO: ${GIORNI[now.wd]} ${now.data}, ore ${now.hm} (ora italiana). La farmacia è ${statoApertura(now)}

INFORMAZIONI (usa SOLO queste, non inventare nulla):
- Indirizzo: Via Ettore Maiorana 27, 90019 Trabia (PA). Facilmente raggiungibile, comodo parcheggio, accesso agevole per persone con disabilità.
- Telefono 091 814 6207. WhatsApp 331 525 0555. Email farmaciatortorici@gmail.com.
- Orari: lunedì-venerdì 8:30-13:00 e 16:15-19:45; sabato 8:30-13:00 e 16:15-19:30; domenica 9:00-13:00. Nei festivi e nei turni gli orari possono variare: gli avvisi sono sulla bacheca della farmacia.
- Farmacia di turno (notte e festivi): servizio a chiamata solo per farmaci urgenti, a rotazione tra le farmacie della zona. Il calendario è sulle bacheche di tutte le farmacie e sul sito ufficiale dell'Ordine dei Farmacisti di Palermo.
- Holter cardiaco e pressorio: in convenzione SSN con la ricetta del medico di base, oppure senza ricetta a pagamento. Si prenota in farmacia, al telefono o su WhatsApp.
- Pressione ed ECG (elettrocardiogramma) in farmacia.
- Screening con una goccia di sangue dal dito: quadro lipidico/colesterolo, emoglobina glicata, glicemia, PSA, vitamina D. Per il colesterolo non serve prenotare.
- SOF test (screening colon-retto) gratuito per chi ha 50-69 anni: si ritira in farmacia senza attese.
- Giornate della salute con specialisti, su prenotazione: esame della densità ossea, screening senologico, consulenze dermocosmetiche, consigli alimentari.
- Foratura dei lobi: indolore, in ambiente igienicamente sicuro, materiali ipoallergenici.
- Assistenza a domicilio gratuita per chi non può venire in farmacia (chiamare o scrivere su WhatsApp).
- Prodotti: farmaci con e senza ricetta, alimenti speciali (intolleranze, celiachia), dermocosmesi, prodotti ortopedici, prodotti per sportivi, veterinaria (anche su ricetta veterinaria).
- Pagamenti pagoPA (per esempio ticket per visite ospedaliere).
- Calendario 2027 della farmacia: si prenota e si ritira in farmacia.
- Canale WhatsApp "Farmacia Tortorici Trabia": gratuito, novità, giornate della salute, avvisi.
- Recensioni: si possono lasciare nella pagina recensioni del sito.
- Disponibilità e prezzi dei singoli prodotti: non li conosci, invita a chiedere su WhatsApp o al telefono.

REGOLE IMPORTANTI:
- Non dare consigli medici, diagnosi, dosaggi o indicazioni su quali farmaci prendere: invita gentilmente a parlarne con il farmacista (in farmacia, al telefono o su WhatsApp) o con il proprio medico.
- In caso di emergenza o sintomi gravi: chiamare subito il 112.
- Non chiedere e non commentare dati personali sulla salute.
- Se non sai una cosa, dillo e proponi di contattare la farmacia. Non inventare mai orari, prezzi, servizi o disponibilità.
- Non parlare di altre farmacie o catene. Non dire che modello sei né come funzioni: sei semplicemente l'assistente automatico della farmacia.
- Scrivi testo semplice, senza elenchi lunghi e senza markdown.

AZIONI: alla fine della risposta puoi aggiungere, se utili, uno o due di questi codici (il sito li mostra come pulsanti): [[whatsapp]] [[chiama]] [[turni]] [[mappa]] [[prenota]] [[canale]] [[recensione]]`;
}

const AZIONI = ["whatsapp", "chiama", "turni", "mappa", "prenota", "canale", "recensione"];
export function separaAzioni(testo) {
  const azioni = [];
  const pulito = String(testo || "")
    .replace(/\[\[\s*([a-z]+)\s*\]\]/gi, (_, a) => { a = a.toLowerCase(); if (AZIONI.includes(a) && !azioni.includes(a)) azioni.push(a); return ""; })
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return { testo: pulito, azioni: azioni.slice(0, 3) };
}

async function contaUso(request, env) {
  try {
    const ip = request.headers.get("cf-connecting-ip") || "";
    const ipHash = await sha256(ip + (env.IP_SALT || DEFAULT_IP_SALT) + "assistente");
    const ora = new Date().toISOString().slice(0, 13);
    const r = await env.DB.prepare(
      "INSERT INTO assistente_uso (ora, ip_hash, n) VALUES (?, ?, 1) ON CONFLICT(ora, ip_hash) DO UPDATE SET n = n + 1 RETURNING n"
    ).bind(ora, ipHash).first();
    // pulizia delle ore vecchie, ogni tanto
    if (Math.random() < 0.02) await env.DB.prepare("DELETE FROM assistente_uso WHERE ora < ?").bind(new Date(Date.now() - 2 * 864e5).toISOString().slice(0, 13)).run();
    return r ? r.n : 0;
  } catch (e) { return 0; }
}

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return json({ errore: "Richiesta non valida." }, 400); }
  const lingua = ["it", "en", "de"].includes(body.lingua) ? body.lingua : "it";
  const storia = (Array.isArray(body.messaggi) ? body.messaggi : [])
    .filter((m) => m && (m.ruolo === "utente" || m.ruolo === "assistente") && typeof m.testo === "string" && m.testo.trim())
    .slice(-10)
    .map((m) => ({ role: m.ruolo === "utente" ? "user" : "assistant", content: m.testo.trim().slice(0, 600) }));
  if (!storia.length || storia[storia.length - 1].role !== "user") return json({ errore: "Scrivi una domanda." }, 400);

  if (!env.AI) return json({ errore: "non_disponibile" }, 503);
  if ((await contaUso(request, env)) > LIMITE_ORA) return json({ errore: "troppi" }, 429);

  const messages = [{ role: "system", content: istruzioni(lingua) }, ...storia];
  for (const modello of MODELLI) {
    try {
      const r = await env.AI.run(modello, { messages, max_tokens: 350, temperature: 0.3 });
      const out = separaAzioni(r && r.response);
      if (out.testo) return json(out);
    } catch (e) {
      console.log("assistente: modello non disponibile", modello, e && e.message);
    }
  }
  return json({ errore: "non_disponibile" }, 503);
}
