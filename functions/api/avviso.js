// Avviso email allo staff quando arriva una nuova recensione dal sito.
// Usa Cloudflare Email Routing (gratuito): serve il binding [[send_email]] "AVVISI" in wrangler.toml
// e l'indirizzo di destinazione verificato in Cloudflare > Email > Email Routing.
// Se il binding non c'è, non fa nulla (la recensione viene comunque salvata).
import { EmailMessage } from "cloudflare:email";

const MITTENTE = "avvisi@farmaciatortorici.com";
const DESTINATARIO = "farmaciatortorici@live.it";

const b64 = (s) => {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
};
const righe76 = (s) => s.replace(/.{1,76}/g, "$&\r\n");

export function componiAvviso({ nome, stelle, testo }) {
  const oggetto = `Nuova recensione da approvare (${"★".repeat(stelle)}) - ${nome}`;
  const corpo =
    `È arrivata una nuova recensione sul sito della farmacia.\n\n` +
    `Nome: ${nome}\nStelle: ${"★".repeat(stelle)}${"☆".repeat(5 - stelle)} (${stelle}/5)\n\n` +
    `«${testo}»\n\n` +
    `Non è ancora visibile. Per pubblicarla o eliminarla apri:\n` +
    `https://farmaciatortorici.com/admin.html\n`;
  return [
    `From: Sito Farmacia Tortorici <${MITTENTE}>`,
    `To: ${DESTINATARIO}`,
    `Subject: =?UTF-8?B?${b64(oggetto)}?=`,
    `Date: ${new Date().toUTCString().replace("GMT", "+0000")}`,
    `Message-ID: <${crypto.randomUUID()}@farmaciatortorici.com>`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    righe76(b64(corpo)),
  ].join("\r\n");
}

export async function inviaAvviso(env, recensione) {
  if (!env.AVVISI) return;
  try {
    await env.AVVISI.send(new EmailMessage(MITTENTE, DESTINATARIO, componiAvviso(recensione)));
  } catch (e) {
    console.log("Avviso email non inviato:", e && e.message);
  }
}
