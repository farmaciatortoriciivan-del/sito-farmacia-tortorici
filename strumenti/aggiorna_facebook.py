#!/usr/bin/env python3
"""Converte le righe dei post Facebook esportate da Metricool
(metriche FBPO02 data, FBPO03 testo, FBPO05 immagine, FBPO06 link, FBPO07 tipo, FBPO16 visualizzazioni)
nel file facebook-data.js letto dal sito.

Uso: python3 strumenti/aggiorna_facebook.py strumenti/facebook-rows.json public/facebook-data.js [strumenti/facebook-followers.json]
(il terzo file, facoltativo, sono le righe Metricool della metrica FBEV17 = follower della pagina)
"""
import json, re, sys
from datetime import datetime, timezone

src, dst = sys.argv[1], sys.argv[2]
import os
# follower: terzo argomento, altrimenti strumenti/facebook-followers.json accanto allo script
fol_src = sys.argv[3] if len(sys.argv) > 3 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "facebook-followers.json")
if not os.path.exists(fol_src):
    fol_src = None
# se non ci sono dati nuovi, conserva il numero di follower già pubblicato
old_fol = None
if os.path.exists(dst):
    m = re.search(r"window\.FB_FOLLOWERS = (\{.*?\});", open(dst, encoding="utf-8").read())
    old_fol = m.group(1) if m else None
rows = json.load(open(src, encoding="utf-8"))

from urllib.parse import urlparse, parse_qs

def immagine(u):
    """Anteprima del post: l'indirizzo originale di Facebook (fbcdn) dentro il link di Metricool."""
    if not u:
        return None
    tg = parse_qs(urlparse(u).query).get("tg")
    u = tg[0] if tg else u
    host = urlparse(u).netloc
    return u if u.startswith("https://") and host.endswith(".fbcdn.net") else None

posts = []
for r in rows:
    date, text, img, link, kind = r[0], (r[1] or "").strip(), r[2], r[3], r[4]
    # togli hashtag finali e link di condivisione dal testo mostrato
    clean = re.sub(r"https?://\S+", "", text)
    clean = re.sub(r"(\s*#\w+)+\s*#?\s*$", "", clean).strip()
    share = re.search(r"https://www\.facebook\.com/share/v/\S+", text)
    foto = immagine(img)
    if not clean and not foto:
        continue  # niente testo e niente immagine: non c'è nulla da mostrare
    p = {
        "data": datetime.strptime(date, "%Y%m%d%H%M%S").strftime("%Y-%m-%d"),
        "testo": clean,
        "tipo": "video" if (kind == "video" or share) else kind,
        "link": share.group(0) if share else link,
    }
    if foto:
        p["immagine"] = foto
    posts.append(p)

posts.sort(key=lambda p: p["data"], reverse=True)
stamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%MZ")
with open(dst, "w", encoding="utf-8") as f:
    f.write(f"/* Generato automaticamente da Metricool ({stamp}). Non modificare a mano. */\n")
    f.write("window.FB_POSTS = ")
    json.dump(posts, f, ensure_ascii=False, indent=1)
    f.write(";\n")
    if fol_src:
        frows = [r for r in json.load(open(fol_src, encoding="utf-8")) if r and r[0] not in (None, "")]
        if frows:
            frows.sort(key=lambda r: r[1])
            n, d = frows[-1]
            f.write("window.FB_FOLLOWERS = ")
            json.dump({"numero": int(float(n)), "data": datetime.strptime(d, "%Y%m%d").strftime("%Y-%m-%d")}, f)
            f.write(";\n")
            old_fol = None
    if old_fol:
        f.write("window.FB_FOLLOWERS = " + old_fol + ";\n")
print(f"{len(posts)} post scritti in {dst}")
