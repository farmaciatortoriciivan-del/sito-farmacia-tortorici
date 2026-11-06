/* Farmacia di turno più vicina — Farmacia Tortorici
   Al tocco del pulsante chiede la posizione al telefono (con il suo avviso di permesso),
   legge le farmacie di turno di oggi nella zona e le ordina per distanza.
   La posizione resta sul telefono: la distanza si calcola qui, non viene inviata né salvata. */
(function () {
  var box = document.querySelector(".turni"), az = box && box.querySelector(".turni-actions");
  if (!az) return;
  var L = window.LINGUA || "it";
  var T = {
    it: { btn: "📍 La più vicina a te", cerco: "Cerco le farmacie di turno di oggi…", titolo: "Farmacie di turno oggi",
      con: "Dalla più vicina a te (distanza in linea d'aria, circa).", senza: "Non abbiamo la tua posizione: ecco le farmacie di turno di oggi nella zona.",
      priv: "La tua posizione resta sul tuo telefono: non viene inviata né salvata.", km: "a circa {d} km", chiama: "Chiama", vai: "Indicazioni",
      nessuno: "Oggi non riusciamo a leggere i turni: consulta il sito ufficiale dell'Ordine dei Farmacisti.", chiudi: "Chiudi" },
    scn: { btn: "📍 Chidda cchiù vicina a tia", cerco: "Circamu li farmacìi di turnu d'oji…", titolo: "Farmacìi di turnu oji",
      con: "Di chidda cchiù vicina a tia (distanza a linia d'aria, cchiossà o menu).", senza: "Nun sapemu unni si': chisti sunnu li farmacìi di turnu d'oji nta la zona.",
      priv: "Unni si' resta nta lu to telefonu: nun si manna e nun si sarva.", km: "a cchiossà o menu {d} km", chiama: "Chiama", vai: "Strata",
      nessuno: "Oji nun riniscemu a lèggiri li turni: talìa lu situ ufficiali di l'Ordini dî Farmacisti.", chiudi: "Chiudi" },
    en: { btn: "📍 Nearest to you", cerco: "Looking for today's on-duty pharmacies…", titolo: "On-duty pharmacies today",
      con: "Nearest first (straight-line distance, approximate).", senza: "We don't have your location: here are today's on-duty pharmacies in the area.",
      priv: "Your location stays on your phone: it is not sent or stored.", km: "about {d} km away", chiama: "Call", vai: "Directions",
      nessuno: "We can't read today's rota: please check the official Pharmacists' Association website.", chiudi: "Close" },
    de: { btn: "📍 Die nächste zu Ihnen", cerco: "Suche die heutigen Notdienstapotheken…", titolo: "Notdienstapotheken heute",
      con: "Die nächste zuerst (Luftlinie, ungefähr).", senza: "Ihr Standort ist nicht verfügbar: hier die heutigen Notdienstapotheken in der Umgebung.",
      priv: "Ihr Standort bleibt auf Ihrem Telefon: er wird weder gesendet noch gespeichert.", km: "ca. {d} km entfernt", chiama: "Anrufen", vai: "Route",
      nessuno: "Der heutige Notdienst kann nicht gelesen werden: bitte die offizielle Seite der Apothekerkammer prüfen.", chiudi: "Schließen" },
    es: { btn: "📍 La más cercana a ti", cerco: "Buscando las farmacias de guardia de hoy…", titolo: "Farmacias de guardia hoy",
      con: "De la más cercana a ti (distancia en línea recta, aproximada).", senza: "No tenemos tu ubicación: estas son las farmacias de guardia de hoy en la zona.",
      priv: "Tu ubicación se queda en tu teléfono: no se envía ni se guarda.", km: "a unos {d} km", chiama: "Llamar", vai: "Cómo llegar",
      nessuno: "Hoy no podemos leer las guardias: consulta la web oficial del Colegio de Farmacéuticos.", chiudi: "Cerrar" },
    zh: { btn: "📍 离你最近的", cerco: "正在查找今天的值班药房…", titolo: "今天的值班药房",
      con: "按距离从近到远排列（直线距离，约数）。", senza: "没有你的位置：以下是本地区今天的值班药房。",
      priv: "你的位置只留在你的手机上：不会被发送或保存。", km: "约 {d} 公里", chiama: "打电话", vai: "路线",
      nessuno: "今天无法读取值班信息：请查看药剂师协会官方网站。", chiudi: "关闭" }
  }[L] || null;
  if (!T) return;
  var UFF = "https://www.ordinefarmacistipalermo.it/turno.asp?c=48";

  var btn = document.createElement("button");
  btn.type = "button"; btn.className = "btn btn-light"; btn.textContent = T.btn;
  az.insertBefore(btn, az.firstChild);
  var out = document.createElement("div");
  out.className = "tv"; out.hidden = true; out.setAttribute("aria-live", "polite");
  box.appendChild(out);

  // "3331299204" -> "333 129 9204", "091 8146207" -> "091 814 6207"
  function bello(t) {
    var d = String(t || "").split(/[-–\/]/)[0].replace(/[^\d]/g, "");
    if (/^3\d{9}$/.test(d)) return d.slice(0, 3) + " " + d.slice(3, 6) + " " + d.slice(6);
    if (/^0\d{8,10}$/.test(d)) { var k = /^0[26]|^091/.test(d) ? (d.charAt(1) === "9" ? 3 : 2) : 4; return d.slice(0, k) + " " + d.slice(k, k + 3) + " " + d.slice(k + 3); }
    return String(t || "").split(/[-–\/]/)[0].trim();
  }
  function esc(s) { return String(s || "").replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function km(a, b) {
    var R = 6371, r = Math.PI / 180, dLa = (b[0] - a[0]) * r, dLo = (b[1] - a[1]) * r;
    var x = Math.sin(dLa / 2) * Math.sin(dLa / 2) + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLo / 2) * Math.sin(dLo / 2);
    return 2 * R * Math.asin(Math.sqrt(x));
  }
  function posizione() {
    return new Promise(function (ok) {
      if (!navigator.geolocation) return ok(null);
      navigator.geolocation.getCurrentPosition(function (p) { ok([p.coords.latitude, p.coords.longitude]); }, function () { ok(null); },
        { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 });
    });
  }
  function mostra(d, pos) {
    var f = (d && d.farmacie) || [];
    if (!f.length) { out.innerHTML = '<p>' + esc(T.nessuno) + ' <a href="' + UFF + '" target="_blank" rel="noopener">ordinefarmacistipalermo.it</a></p>'; return; }
    f.forEach(function (x) { x.dist = pos ? km(pos, [x.lat, x.lon]) : null; });
    if (pos) f.sort(function (a, b) { return a.dist - b.dist; });
    out.innerHTML = '<div class="tv-top"><h3>' + esc(T.titolo) + '</h3><button type="button" class="tv-x" aria-label="' + esc(T.chiudi) + '">×</button></div>' +
      '<p class="tv-nota">' + esc(pos ? T.con : T.senza) + "</p>" +
      '<ol class="tv-lista">' + f.slice(0, 8).map(function (x, i) {
        var tel = String(x.telefono || "").split(/[-–\/]/)[0].replace(/[^\d+]/g, ""); // se ce ne sono due, il primo
        var dest = encodeURIComponent(x.farmacia + ", " + x.indirizzo);
        var d = x.dist == null ? "" : '<span class="tv-km">' + esc(T.km.replace("{d}", x.dist < 1 ? "1" : Math.round(x.dist))) + "</span>";
        return '<li class="' + (pos && i === 0 ? "tv-prima" : "") + '"><div><b>' + esc(x.farmacia) + "</b>" + d +
          '<small>' + esc(x.indirizzo) + (x.tipo ? " · " + esc(x.tipo) : "") + "</small></div>" +
          '<div class="tv-az">' + (tel ? '<a class="btn btn-light" href="tel:' + (tel.charAt(0) === "+" ? tel : "+39" + tel) + '">📞 ' + esc(T.chiama) + "</a>" : "") +
          '<a class="btn btn-ghost" href="https://www.google.com/maps/dir/?api=1&destination=' + dest + '" target="_blank" rel="noopener">🧭 ' + esc(T.vai) + "</a>" +
          (tel ? '<a class="tv-tel" href="tel:' + (tel.charAt(0) === "+" ? tel : "+39" + tel) + '">📞 ' + esc(bello(x.telefono)) + "</a>" : "") + "</div></li>";
      }).join("") + "</ol>" +
      '<p class="tv-priv">🔒 ' + esc(T.priv) + "</p>";
    out.querySelector(".tv-x").onclick = function () { out.hidden = true; btn.focus(); };
  }

  btn.addEventListener("click", function () {
    out.hidden = false;
    out.innerHTML = '<p class="tv-nota">' + esc(T.cerco) + "</p>";
    btn.disabled = true;
    if (window.ftStat) window.ftStat({ tipo: "azione", voce: "vicina" });
    Promise.all([
      fetch("/api/turni-vicine", { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      posizione()
    ]).then(function (r) { mostra(r[0], r[1]); btn.disabled = false; out.scrollIntoView({ behavior: "smooth", block: "nearest" }); });
  });
})();
