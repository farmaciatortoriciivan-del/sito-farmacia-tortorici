# Sito ufficiale — Farmacia Dott. Ivan Tortorici, Trabia (PA)

Sito statico (HTML/CSS/JS, nessun framework) ospitato su **Cloudflare Pages**, con un piccolo
archivio **Cloudflare D1** per le recensioni scritte dai clienti. Costo: 0 € (piano gratuito);
l'unica spesa è il dominio.

## Struttura

| Percorso | Cosa contiene |
|---|---|
| `public/` | Il sito pubblicato: `index.html`, `recensioni.html`, `privacy.html`, `cookie.html`, `admin.html`, stili, font, immagini |
| `public/facebook-data.js` | Post Facebook (generato automaticamente da Metricool, non modificare a mano) |
| `public/reviews-data.js` | Recensioni Google importate a mano |
| `worker.js`, `functions/api/` | Worker Cloudflare e API delle recensioni |
| `schema.sql` | Tabella delle recensioni nel database D1 |
| `wrangler.toml` | Configurazione Cloudflare |
| `strumenti/` | Script per aggiornare i post Facebook |
| `docs/` | Ricerca iniziale sulla farmacia |

## Pubblicazione

Il progetto è un **Cloudflare Worker** (`worker.js`) che serve i file di `public/` e le API in `functions/api/`.
È collegato al repository GitHub: ogni push su `main` viene pubblicato da solo.

- Database D1 `recensioni-farmacia` già creato (tabella da `schema.sql`), collegato in `wrangler.toml`.
- Segreti da impostare una volta in Cloudflare → *Workers & Pages* → `sito-farmacia-tortorici` → *Settings* → *Variables and Secrets*:
  - `ADMIN_PASSWORD` = password della pagina `/admin.html`
  - `IP_SALT` = una frase casuale qualsiasi
- Dominio: *Settings* → *Domains & Routes* → *Add* → *Custom domain*.

## Uso quotidiano

- **Approvare le recensioni**: apri `https://<dominio>/admin.html` dal telefono, inserisci la password,
  tocca *Approva* o *Elimina*.
- **Post Facebook**: si aggiornano da soli (Metricool → `public/facebook-data.js` → commit → Cloudflare ripubblica).
- **Orari**: in `public/index.html`, cerca `const ORARI` e modifica le fasce.

## Da completare

- [ ] Link diretto "scrivi recensione" di Google Business Profile (quando recuperi le credenziali).
- [ ] Far rileggere `privacy.html` e `cookie.html` a un consulente privacy.
