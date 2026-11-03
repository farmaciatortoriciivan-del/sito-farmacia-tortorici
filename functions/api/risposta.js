// Risposta automatica della farmacia alle recensioni approvate: un ringraziamento affettuoso e personale.
// Viene scritta una sola volta (al momento dell'approvazione) e salvata nel database.
const FIRMA = "Il team della Farmacia Tortorici";

function riserva(nome, stelle) {
  const n = String(nome || "").trim().split(/\s+/)[0] || "";
  const a = n ? `, ${n},` : "";
  if (stelle >= 4) return `Grazie di cuore${a} per le tue belle parole! Ci fa davvero piacere sapere che da noi ti senti a casa. Ti aspettiamo presto in farmacia, sempre con un sorriso. ${FIRMA}`;
  return `Grazie di cuore${a} per averci lasciato la tua opinione. Ci dispiace se qualcosa non è andato come speravi: passa a trovarci o scrivici, ci teniamo a fare meglio per te. ${FIRMA}`;
}

export async function scriviRisposta(env, r) {
  const sistema = `Sei il team della Farmacia Dott. Ivan Tortorici di Trabia (Palermo) e rispondi pubblicamente a una recensione lasciata sul sito.
Scrivi una risposta breve (2-3 frasi, massimo 60 parole), calda, affettuosa e sincera, nella stessa lingua della recensione.
- Ringrazia per nome la persona (usa solo il nome che ha scritto, senza cognome).
- Riprendi in modo naturale una cosa concreta che ha scritto, senza ripeterla parola per parola.
- Se la valutazione è bassa (1-3 stelle): ringrazia comunque, scusati con garbo e invita a passare in farmacia o a scriverci per rimediare. Non discutere.
- Non inventare fatti, servizi, nomi del personale, promesse o sconti. Niente consigli medici.
- Niente emoji eccessive (al massimo una), niente hashtag, niente virgolette.
- Chiudi con la firma: "${FIRMA}".
Rispondi SOLO con il testo della risposta.`;
  const utente = `Nome: ${r.nome}\nStelle: ${r.stelle} su 5\nRecensione: ${r.testo}`;
  for (const modello of ["@cf/meta/llama-3.3-70b-instruct-fp8-fast", "@cf/meta/llama-3.1-8b-instruct-fast"]) {
    try {
      const out = await env.AI.run(modello, { messages: [{ role: "system", content: sistema }, { role: "user", content: utente }], max_tokens: 200, temperature: 0.6 });
      let t = String((out && out.response) || "").trim().replace(/^["«“]+|["»”]+$/g, "").trim();
      if (t.length > 40 && t.length < 600) {
        if (!t.includes("Farmacia Tortorici")) t += " " + FIRMA;
        return t;
      }
    } catch (e) { /* prova il modello successivo */ }
  }
  return riserva(r.nome, r.stelle);
}

// Scrive e salva la risposta se manca
export async function rispondiSeManca(env, id) {
  const r = await env.DB.prepare("SELECT id, nome, stelle, testo, risposta FROM recensioni WHERE id = ?").bind(id).first();
  if (!r || r.risposta) return r && r.risposta;
  const t = await scriviRisposta(env, r);
  await env.DB.prepare("UPDATE recensioni SET risposta = ? WHERE id = ? AND risposta IS NULL").bind(t, id).run();
  return t;
}
