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
fol_src = sys.argv[3] if len(sys.argv) > 3 else None
rows = json.load(open(src, encoding="utf-8"))

posts = []
for r in rows:
    date, text, _img, link, kind = r[0], (r[1] or "").strip(), r[2], r[3], r[4]
    if not text:
        continue
    # togli hashtag finali e link di condivisione dal testo mostrato
    clean = re.sub(r"https?://\S+", "", text)
    clean = re.sub(r"(\s*#\w+)+\s*#?\s*$", "", clean).strip()
    share = re.search(r"https://www\.facebook\.com/share/v/\S+", text)
    posts.append({
        "data": datetime.strptime(date, "%Y%m%d%H%M%S").strftime("%Y-%m-%d"),
        "testo": clean,
        "tipo": "video" if (kind == "video" or share) else kind,
        "link": share.group(0) if share else link,
    })

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
print(f"{len(posts)} post scritti in {dst}")
