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
| `functions/api/` | API delle recensioni (Cloudflare Pages Functions) |
| `schema.sql` | Tabella delle recensioni nel database D1 |
| `wrangler.toml` | Configurazione Cloudflare |
| `strumenti/` | Script per aggiornare i post Facebook |
| `docs/` | Ricerca iniziale sulla farmacia |

## Pubblicazione (una volta sola)

1. **GitHub**: carica questa cartella in un repository (es. `sito-farmacia-tortorici`, anche privato).
2. **Cloudflare** → *Workers & Pages* → *Create* → *Pages* → *Connect to Git* → scegli il repository.
   - Framework preset: **None**
   - Build command: *(vuoto)*
   - Build output directory: **public**
3. **Database recensioni**: Cloudflare → *Storage & Databases* → *D1* → *Create* → nome `recensioni-farmacia`.
   Apri la console del database e incolla il contenuto di `schema.sql`, poi *Execute*.
4. Nel progetto Pages → *Settings* → *Bindings* → *Add* → **D1 database**: nome variabile `DB`, database `recensioni-farmacia`.
5. *Settings* → *Variables and Secrets* → aggiungi come **Secret**:
   - `ADMIN_PASSWORD` = la password per gestire le recensioni (lunga, da non condividere)
   - `IP_SALT` = una frase casuale qualsiasi
6. *Deployments* → *Retry deployment* (per applicare binding e segreti).
7. **Dominio**: progetto Pages → *Custom domains* → *Set up a domain* → `farmaciatortorici.it` (o quello scelto)
   e segui le istruzioni (di solito cambiare i nameserver presso il registrar).

## Uso quotidiano

- **Approvare le recensioni**: apri `https://<dominio>/admin.html` dal telefono, inserisci la password,
  tocca *Approva* o *Elimina*.
- **Post Facebook**: si aggiornano da soli (Metricool → `public/facebook-data.js` → commit → Cloudflare ripubblica).
- **Orari**: in `public/index.html`, cerca `const ORARI` e modifica le fasce.

## Da completare

- [ ] Link diretto "scrivi recensione" di Google Business Profile (quando recuperi le credenziali).
- [ ] Far rileggere `privacy.html` e `cookie.html` a un consulente privacy.
