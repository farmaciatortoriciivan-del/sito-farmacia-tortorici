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
