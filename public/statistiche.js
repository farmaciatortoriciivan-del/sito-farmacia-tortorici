/* Statistiche di visita anonime — Farmacia Tortorici
   Nessun cookie e nessun dato personale: manda solo quale pagina e quali sezioni
   vengono viste, da dove arriva la visita (Google, Facebook, QR...) e i tocchi su
   Chiama / WhatsApp / Indicazioni. Rispetta "Do Not Track" e il Global Privacy Control. */
(function () {
  if (navigator.webdriver || navigator.doNotTrack === "1" || navigator.globalPrivacyControl) return;
  var pagina = location.pathname;
  function invia(d) {
    d.pagina = pagina;
    var s = JSON.stringify(d);
    try { if (navigator.sendBeacon && navigator.sendBeacon("/api/visita", s)) return; } catch (e) {}
    try { fetch("/api/visita", { method: "POST", body: s, keepalive: true }); } catch (e) {}
  }

  window.ftStat = invia; // usato da altri script (es. farmacia di turno più vicina, domanda sul paese)

  var q = new URLSearchParams(location.search), ref = "";
  try { ref = document.referrer ? new URL(document.referrer).hostname : ""; } catch (e) {}
  invia({ tipo: "pagina", ref: ref, da: q.get("da") || q.get("utm_source") || "", lingua: window.LINGUA || document.documentElement.lang || "" });

  // sezioni viste (una volta per visita): conta quando almeno il 40% è sullo schermo
  if ("IntersectionObserver" in window) {
    var viste = {};
    var io = new IntersectionObserver(function (voci) {
      voci.forEach(function (e) {
        if (!e.isIntersecting) return;
        var min = Math.min(e.boundingClientRect.height, window.innerHeight) * 0.4;
        if (e.intersectionRect.height < min) return;
        var id = e.target.getAttribute("data-stat");
        if (viste[id]) return;
        viste[id] = 1; io.unobserve(e.target);
        invia({ tipo: "sezione", voce: id });
      });
    }, { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.6, 0.8, 1] });
    var el = document.querySelectorAll("section[id], .turni");
    for (var i = 0; i < el.length; i++) {
      el[i].setAttribute("data-stat", el[i].id || "turni");
      io.observe(el[i]);
    }
  }

  // tocchi su contatti e indicazioni
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var h = a.getAttribute("href");
    var v = /^tel:/.test(h) ? "telefono" : /wa\.me|whatsapp/.test(h) ? "whatsapp" : /^mailto:/.test(h) ? "email"
      : /google\.[a-z.]+\/maps|maps\.app\.goo\.gl|maps\.google|goo\.gl\/maps|maps\.apple/.test(h) ? "indicazioni"
      : /facebook\.com|fb\.me/.test(h) ? "facebook" : "";
    if (v) invia({ tipo: "azione", voce: v });
  }, true);
})();
