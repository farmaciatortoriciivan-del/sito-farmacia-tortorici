// /api/assistente — assistente automatico del sito (risponde alle domande pratiche dei clienti).
// Usa Workers AI di Cloudflare (gratuito nei limiti giornalieri). Nessun dato viene salvato:
// si conta solo quanti messaggi arrivano da ogni indirizzo (in forma cifrata) per evitare abusi.
import { json, sha256, DEFAULT_IP_SALT } from "./_util.js";
import { turniTrabia, tabellaTurni, TEL_TURNO_TORTORICI } from "./turni.js";

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

function istruzioni(lingua, turni) {
  const now = adessoRoma();
  const lang = { en: "English", de: "German (use the formal 'Sie')", es: "Spanish (use 'tú')", zh: "Simplified Chinese" }[lingua] || "Italian";
  return `Ti chiami Valeriana e sei l'assistente automatico del sito della Farmacia Dott. Ivan Tortorici di Trabia (Palermo). Aiuti i clienti con domande pratiche e, per i piccoli disturbi, con semplici consigli di buon senso, invitando sempre a un consulto con il farmacista. Rispondi in modo cordiale, chiaro e professionale (di solito 3-5 frasi). Rispondi nella lingua del cliente; se non è chiara usa: ${lang}.

ADESSO: ${GIORNI[now.wd]} ${now.data}, ore ${now.hm} (ora italiana). La farmacia è ${statoApertura(now)}

INFORMAZIONI (usa SOLO queste, non inventare nulla):
- Indirizzo: Via Ettore Maiorana 27, 90019 Trabia (PA). Facilmente raggiungibile, comodo parcheggio, accesso agevole per persone con disabilità.
- Telefono 091 814 6207. WhatsApp 331 525 0555. Email farmaciatortorici@gmail.com.
- Orari: lunedì-venerdì 8:30-13:00 e 16:15-19:45; sabato 8:30-13:00 e 16:15-19:30; domenica 9:00-13:00. Nei festivi e nei turni gli orari possono variare: gli avvisi sono sulla bacheca della farmacia.
- Farmacia di turno (notte e festivi): servizio a chiamata solo per farmaci urgenti, a rotazione tra le farmacie della zona. Il calendario è sulle bacheche di tutte le farmacie e sul sito ufficiale dell'Ordine dei Farmacisti di Palermo.
- Farmacie di Trabia: Farmacia Tortorici (Via Ettore Maiorana 27) e le altre indicate nei turni ufficiali qui sotto.

TURNI UFFICIALI (dal sito dell'Ordine dei Farmacisti di Palermo, letti il ${turni && turni.letto ? turni.letto.slice(0, 10) : "?"}; Farmacia Tortorici Ivan è la nostra farmacia):
${turni && turni.settimane ? turni.settimane.flatMap((w) => (w.turni || []).map((t) => `- dal ${t.dal || w.dal} al ${t.al || w.al}: ${t.farmacia}, ${t.indirizzo}, tel. ${t.telefono} (${t.tipo})`)).join("\n") || "(non disponibili in questo momento)" : "(non disponibili in questo momento)"}
Quando ti chiedono la farmacia di turno a Trabia: usa SOLO questi dati per dire quale farmacia è di turno oggi (o nel giorno chiesto), con nome e indirizzo se presenti. Se dai dati non si capisce con certezza, dillo chiaramente e rimanda al sito ufficiale con [[turni]]. Ricorda sempre che di notte il servizio è a chiamata solo per farmaci urgenti. Non inventare mai turni.
NUMERO PER IL TURNO DELLA FARMACIA TORTORICI: quando la Farmacia Tortorici è di turno (oggi o nel giorno chiesto), per il servizio di turno si chiama il cellulare 333 129 9204: scrivilo SEMPRE per intero nella risposta, ad esempio "Per il turno chiama il 333 129 9204". Per tutto il resto (orari normali, informazioni, prenotazioni) il numero resta lo 091 814 6207.
- Holter cardiaco e pressorio: in convenzione SSN con la ricetta del medico di base, oppure senza ricetta a pagamento. Si prenota in farmacia, al telefono o su WhatsApp.
- Pressione ed ECG (elettrocardiogramma) in farmacia.
- Screening con una goccia di sangue dal dito: quadro lipidico/colesterolo, emoglobina glicata (gratuita), glicemia, PSA, vitamina D. Per il colesterolo non serve prenotare.
- Bilancia multifunzione: peso e misurazione impedenziometrica per la stima della massa grassa, con lettura della saturazione di ossigeno e della pressione.
- Bilancia per neonati: si può venire in farmacia a pesare il bambino.
- Raccolta punti Enervit per gli sportivi: chi compra prodotti Enervit o EnerZona in farmacia riceve una tessera; a ogni acquisto un timbro, con 10 timbri la tessera è completa e si riceve un premio (per sapere quale, chiedere in farmacia).
- Screening audiometrico: controllo semplice e veloce dell'udito in farmacia, su prenotazione (WhatsApp o telefono). Proponi [[prenota]] o [[whatsapp]].
- SOF test (screening colon-retto) gratuito per chi ha 50-69 anni: si ritira in farmacia senza attese.
- Giornate della salute con specialisti, su prenotazione: esame della densità ossea, screening senologico, consulenze dermocosmetiche, consigli alimentari.
- Foratura dei lobi: indolore, in ambiente igienicamente sicuro, materiali ipoallergenici.
- Assistenza a domicilio gratuita per chi non può venire in farmacia (chiamare o scrivere su WhatsApp).
- Prodotti: farmaci con e senza ricetta, alimenti speciali (intolleranze, celiachia), dermocosmesi, prodotti ortopedici, prodotti per sportivi, veterinaria (anche su ricetta veterinaria).
- Pagamenti pagoPA (per esempio ticket per visite ospedaliere).
- Calendario 2027 della farmacia: si prenota e si ritira in farmacia.
- Mercoledì 11 novembre 2026, mattina e pomeriggio: giornata con l'esame dell'emoglobina glicata GRATUITO in farmacia, su prenotazione (su WhatsApp o al telefono). Basta una goccia di sangue dal dito. Se ne parli aggiungi [[whatsapp]].
- Canale WhatsApp "Farmacia Tortorici Trabia": gratuito, novità, giornate della salute, avvisi.
- Recensioni: si possono lasciare nella pagina recensioni del sito.
- Disponibilità e prezzi dei singoli prodotti: non li conosci, invita a chiedere su WhatsApp o al telefono.

REGOLE IMPORTANTI:
CONSIGLI SULLA SALUTE (con moderazione):
- Per i piccoli disturbi comuni (raffreddore, mal di gola, tosse, febbre leggera, mal di testa, digestione difficile, stitichezza, punture di insetti, scottature solari, pelle secca, insonnia lieve, stanchezza) puoi suggerire solo semplici rimedi della nonna e accorgimenti di buon senso: per esempio riposo, bere molta acqua, latte caldo con miele, suffumigi, gargarismi con acqua tiepida e sale, tisane, brodo caldo, impacchi freschi, alimentazione leggera, arieggiare la stanza.
- NON consigliare MAI farmaci, principi attivi, integratori, dosi o marchi, nemmeno di libera vendita, e non dire quale farmaco prendere. Se te lo chiedono, spiega con gentilezza che per scegliere il prodotto giusto serve il consiglio del farmacista, che conosce la persona e i farmaci che già usa.
- Invita sempre, con calore, a un consulto con il farmacista (in farmacia, al telefono o su WhatsApp): il farmacista potrà consigliare il rimedio più adatto e, se serve, indirizzare al medico o allo specialista giusto per il problema. Aggiungi [[whatsapp]] o [[chiama]].
- Non fare diagnosi e non commentare terapie prescritte dal medico.
- Se i sintomi sono forti, durano più di qualche giorno, peggiorano, o riguardano neonati, bambini piccoli, donne in gravidanza o anziani fragili: consiglia di sentire subito il farmacista o il medico.
- In caso di emergenza o sintomi gravi: chiamare subito il 112.
- Chiedi solo le informazioni strettamente necessarie per il consiglio; non chiedere nome, documenti o dati personali.
- Se non sai una cosa, dillo e proponi di contattare la farmacia. Non inventare mai orari, prezzi, servizi o disponibilità.
- Non parlare di catene di farmacie; altre farmacie nominale solo per indicare i turni ufficiali. Non dire che modello sei né come funzioni: sei semplicemente Valeriana, l'assistente automatico della farmacia.
- Scrivi testo semplice, senza elenchi lunghi e senza markdown.

AZIONI: alla fine della risposta puoi aggiungere, se utili, uno o due di questi codici (il sito li mostra come pulsanti): [[whatsapp]] [[chiama]] [[turni]] [[mappa]] [[prenota]] [[canale]] [[recensione]]`;
}

// riga aggiunta quando oggi è di turno la Farmacia Tortorici (numero: TEL_TURNO_TORTORICI in turni.js)
const TEL_TURNO = {
  it: "Oggi è di turno la Farmacia Tortorici: per il turno chiama il {n}.",
  scn: "Oji è di turnu la Farmacìa Tortorici: pô turnu chiama ô {n}.",
  en: "Farmacia Tortorici is on duty today: for the on-duty service call {n}.",
  de: "Heute hat die Farmacia Tortorici Notdienst: für den Notdienst rufen Sie {n} an.",
  es: "Hoy está de guardia la Farmacia Tortorici: para la guardia llama al {n}.",
  zh: "今天 Tortorici 药房值班：值班服务请拨打 {n}。",
};
const TESTI_TURNI = {
  it: { con: "Ecco le farmacie di turno a Trabia, secondo il calendario ufficiale:", nota: "Di notte e nei festivi il servizio è a chiamata, solo per farmaci urgenti.",
        senza: "Il sito ufficiale dell'Ordine dei Farmacisti di Palermo non ha ancora pubblicato i turni di Trabia per questo periodo. Il calendario dei turni è esposto sulle bacheche di tutte le farmacie: chiamaci e ti diciamo subito quale farmacia è di turno." },
  en: { con: "Here are the on-duty pharmacies in Trabia, from the official rota:", nota: "At night and on public holidays there is an on-call service for urgent medicines only.",
        senza: "The official website of the Palermo Order of Pharmacists hasn't published Trabia's rota for this period yet. The rota is posted on the notice boards of all pharmacies: call us and we'll tell you straight away which pharmacy is on duty." },
  de: { con: "Hier sind die Notdienstapotheken in Trabia laut offiziellem Plan:", nota: "Nachts und an Feiertagen gibt es einen Rufbereitschaftsdienst nur für dringende Arzneimittel.",
        senza: "Die offizielle Website der Apothekerkammer Palermo hat den Notdienstplan für Trabia für diesen Zeitraum noch nicht veröffentlicht. Der Plan hängt an den Aushängen aller Apotheken: Rufen Sie uns an, wir sagen Ihnen sofort, welche Apotheke Dienst hat." },
  es: { con: "Estas son las farmacias de guardia en Trabia, según el calendario oficial:", nota: "De noche y en festivos el servicio es a demanda, solo para medicamentos urgentes.",
        senza: "La web oficial del Colegio de Farmacéuticos de Palermo todavía no ha publicado las guardias de Trabia para este periodo. El calendario está expuesto en los tablones de todas las farmacias: llámanos y te decimos enseguida qué farmacia está de guardia." },
  zh: { con: "根据官方值班表，特拉比亚的值班药房如下：", nota: "夜间和节假日仅为急需药品提供电话呼叫服务。",
        senza: "巴勒莫药剂师协会官方网站尚未公布特拉比亚这段时间的值班表。值班表张贴在所有药房的公告栏上：请致电我们，我们会马上告诉您哪家药房值班。" },
};

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

export async function onRequestPost({ request, env, ctx }) {
  let body;
  try { body = await request.json(); } catch { return json({ errore: "Richiesta non valida." }, 400); }
  const lingua = ["it", "en", "de", "es", "zh"].includes(body.lingua) ? body.lingua : "it";
  const storia = (Array.isArray(body.messaggi) ? body.messaggi : [])
    .filter((m) => m && (m.ruolo === "utente" || m.ruolo === "assistente") && typeof m.testo === "string" && m.testo.trim())
    .slice(-10)
    .map((m) => ({ role: m.ruolo === "utente" ? "user" : "assistant", content: m.testo.trim().slice(0, 600) }));
  if (!storia.length || storia[storia.length - 1].role !== "user") return json({ errore: "Scrivi una domanda." }, 400);

  if (!env.AI) return json({ errore: "non_disponibile" }, 503);
  if ((await contaUso(request, env)) > LIMITE_ORA) return json({ errore: "troppi" }, 429);

  // Domande sui turni: risposta precisa con la tabella ufficiale (senza passare dal modello)
  const ultima = storia[storia.length - 1].content;
  if (/\bturn[oi]\b|di guardia|farmacia aperta (di|la) notte|on[- ]?duty|night pharmac|notdienst|bereitschaft|de guardia|farmacia de turno|值班|夜间药房/i.test(ultima)) {
    let tab = [];
    try { tab = await tabellaTurni(env, ctx); } catch (e) {}
    const L = TESTI_TURNI[lingua];
    // se oggi è di turno la Farmacia Tortorici, il numero da chiamare per il turno è il cellulare
    const oggi = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(new Date());
    const noi = tab.some((r) => /tortorici/i.test(r.farmacia || "") && r.dal <= oggi && oggi <= r.al);
    const tel = noi ? "\n" + (TEL_TURNO[lingua] || TEL_TURNO.it).replace("{n}", TEL_TURNO_TORTORICI.replace(/(\d{3})(\d{4})$/, "$1 $2")) : "";
    if (tab.length) return json({ testo: L.con + tel + "\n" + L.nota, azioni: noi ? ["turni"] : ["turni", "chiama"], tabella: tab.map(({ dal, al, farmacia, indirizzo, telefono, tipo }) => ({ dal, al, farmacia, indirizzo, telefono, tipo })) });
    return json({ testo: L.senza, azioni: ["chiama", "turni"] });
  }

  let turni = null;
  if (/turno|turni|notte|nott|festiv|domenica|aperta ora|duty|night|notdienst|nacht/i.test(storia.map((m) => m.content).join(" "))) {
    try { turni = await turniTrabia(env, ctx); } catch (e) {}
  }
  const messages = [{ role: "system", content: istruzioni(lingua, turni) }, ...storia];
  for (const modello of MODELLI) {
    try {
      const r = await env.AI.run(modello, { messages, max_tokens: 600, temperature: 0.3 });
      const out = separaAzioni(r && r.response);
      if (out.testo) return json(out);
    } catch (e) {
      console.log("assistente: modello non disponibile", modello, e && e.message);
    }
  }
  return json({ errore: "non_disponibile" }, 503);
}
