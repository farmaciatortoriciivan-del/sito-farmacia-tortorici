-- Archivio recensioni (Cloudflare D1)
CREATE TABLE IF NOT EXISTS recensioni (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  nome      TEXT    NOT NULL,
  stelle    INTEGER NOT NULL CHECK (stelle BETWEEN 1 AND 5),
  testo     TEXT    NOT NULL,
  data      TEXT    NOT NULL,              -- ISO 8601
  stato     TEXT    NOT NULL DEFAULT 'in_attesa' CHECK (stato IN ('in_attesa','pubblicata')),
  ip_hash   TEXT,                          -- solo per limitare gli abusi, mai mostrato
  risposta  TEXT                           -- risposta automatica della farmacia, scritta all'approvazione
);
CREATE INDEX IF NOT EXISTS idx_recensioni_stato ON recensioni(stato, data);

-- Limite di messaggi all'assistente del sito (per indirizzo, per ora)
CREATE TABLE IF NOT EXISTS assistente_uso (
  ora TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  n INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (ora, ip_hash)
);

-- Statistiche di visita anonime (nessun IP salvato; "visitatore" è un'impronta che cambia ogni giorno)
CREATE TABLE IF NOT EXISTS visite (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  giorno      TEXT    NOT NULL,   -- AAAA-MM-GG, ora italiana
  ora         INTEGER NOT NULL,   -- 0-23
  tipo        TEXT    NOT NULL,   -- pagina | sezione | azione
  pagina      TEXT,
  voce        TEXT,               -- sezione vista o azione (telefono, whatsapp, indicazioni...)
  visitatore  TEXT    NOT NULL,
  provenienza TEXT,
  dispositivo TEXT,
  citta       TEXT,
  regione     TEXT,
  paese       TEXT,
  lat         REAL,               -- centro della città (approssimativo, dal collegamento internet)
  lon         REAL,
  lingua      TEXT
);
CREATE INDEX IF NOT EXISTS idx_visite_giorno ON visite(giorno, tipo);
CREATE TABLE IF NOT EXISTS stat_sale (giorno TEXT PRIMARY KEY, sale TEXT NOT NULL);
