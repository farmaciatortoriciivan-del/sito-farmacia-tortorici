-- Archivio recensioni (Cloudflare D1)
CREATE TABLE IF NOT EXISTS recensioni (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  nome      TEXT    NOT NULL,
  stelle    INTEGER NOT NULL CHECK (stelle BETWEEN 1 AND 5),
  testo     TEXT    NOT NULL,
  data      TEXT    NOT NULL,              -- ISO 8601
  stato     TEXT    NOT NULL DEFAULT 'in_attesa' CHECK (stato IN ('in_attesa','pubblicata')),
  ip_hash   TEXT                           -- solo per limitare gli abusi, mai mostrato
);
CREATE INDEX IF NOT EXISTS idx_recensioni_stato ON recensioni(stato, data);
