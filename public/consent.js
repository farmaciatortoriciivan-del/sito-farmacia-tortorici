/* Consenso cookie — Farmacia Tortorici
   Il sito usa solo cookie tecnici. I contenuti esterni (Google Maps, video Facebook)
   vengono caricati SOLO dopo il consenso ("esterni").
   Il consenso è salvato nel browser per 6 mesi. */
(function () {
  var KEY = "ft-consenso";
  var DURATA = 182 * 24 * 3600 * 1000;
  // Sul sito pubblico (http/https) e non nell'anteprima su claude.ai
  var PUBBLICO = /^https?:$/.test(location.protocol) && !/claude/i.test(location.hostname);

  function leggi() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || "null");
      if (v && Date.now() - v.t < DURATA) return v.esterni ? "si" : "no";
    } catch (e) {}
    return null;
  }
  function scrivi(si) {
    try { localStorage.setItem(KEY, JSON.stringify({ esterni: !!si, t: Date.now() })); } catch (e) {}
    applica();
    document.dispatchEvent(new Event("consenso"));
  }

  window.Consenso = {
    pubblico: PUBBLICO,
    esterni: function () { return PUBBLICO && leggi() === "si"; },
    accetta: function () { scrivi(true); chiudi(); },
    rifiuta: function () { scrivi(false); chiudi(); },
    apri: apri
  };

  function applica() {
    var ok = window.Consenso.esterni();
    document.querySelectorAll("iframe[data-consent-src]").forEach(function (f) {
      if (ok) { if (!f.src) f.src = f.getAttribute("data-consent-src"); f.hidden = false; }
      var ph = f.parentNode.querySelector(".map-ph");
      if (ph) ph.hidden = ok;
    });
    document.querySelectorAll("[data-consent-accept],[data-consent-note]").forEach(function (b) { b.hidden = !PUBBLICO || ok; });
  }

  var banner;
  function apri() {
    if (!PUBBLICO) return;
    if (banner) { banner.hidden = false; return; }
    banner = document.createElement("div");
    banner.className = "cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Preferenze cookie");
    banner.innerHTML =
      '<button type="button" class="cb-x" aria-label="Chiudi e rifiuta">×</button>' +
      '<p><strong>Cookie</strong> Usiamo solo cookie tecnici. Con il tuo consenso mostriamo anche la mappa di Google, che usa cookie di terze parti. ' +
      '<a href="cookie.html">Cookie policy</a></p>' +
      '<div class="cb-actions"><button type="button" class="btn btn-ghost cb-no">Rifiuta</button>' +
      '<button type="button" class="btn btn-primary cb-si">Accetta</button></div>';
    document.body.appendChild(banner);
    banner.querySelector(".cb-si").onclick = window.Consenso.accetta;
    banner.querySelector(".cb-no").onclick = window.Consenso.rifiuta;
    banner.querySelector(".cb-x").onclick = window.Consenso.rifiuta;
  }
  function chiudi() { if (banner) banner.hidden = true; }

  function avvia() {
    applica();
    document.querySelectorAll("[data-consent-accept]").forEach(function (b) { b.onclick = window.Consenso.accetta; });
    document.querySelectorAll("[data-cookie-prefs]").forEach(function (b) {
      if (!PUBBLICO) { b.hidden = true; return; }
      b.onclick = apri;
    });
    if (PUBBLICO && leggi() === null) apri();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", avvia);
  else avvia();
})();
