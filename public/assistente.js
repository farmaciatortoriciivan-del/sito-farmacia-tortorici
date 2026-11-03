/* Assistente del sito — Farmacia Tortorici
   Finestra di chat che risponde alle domande pratiche (orari, servizi, prenotazioni, turni).
   Le risposte arrivano da /api/assistente. La conversazione resta solo in questa scheda del browser. */
(function () {
  if (window.__assistente) return; window.__assistente = true;

  var LANG = window.LINGUA || "it";
  var WA = "https://wa.me/393315250555";
  var T = {
    it: {
      apri: "Hai una domanda? Chiedi a noi", corto: "Chiedi a noi", titolo: "Farmacia Tortorici", sotto: "Assistente automatico · risponde subito",
      benv: "Ciao! 👋", benv2: "Come possiamo aiutarti oggi?", oggi: "Oggi", scrive: "sta scrivendo…", bollaT: "Hai bisogno di aiuto?",
      ciao: "Ciao! 👋 Sono l'assistente della Farmacia Tortorici. Posso aiutarti con orari, servizi, prenotazioni e farmacie di turno. Cosa ti serve?",
      bolla: "Ciao! Posso aiutarti? 👋", chiudi: "Chiudi", invia: "Invia", scrivi: "Scrivi la tua domanda…",
      nota: "Risposte automatiche: per consigli sulla salute parla con il farmacista.",
      rapide: ["Siete aperti adesso?", "Come prenoto l'Holter?", "Farmacia di turno", "Dove vi trovo?"],
      errore: "Al momento non riesco a rispondere. Scrivici su WhatsApp o chiamaci: ti aiutiamo noi.",
      troppi: "Hai scritto molti messaggi in poco tempo. Riprova tra un po', oppure scrivici su WhatsApp.",
      nuova: "Nuova conversazione", questa: "Questa settimana", prossima: "Prossima settimana",
      az: { whatsapp: "Scrivici su WhatsApp", chiama: "Chiama 091 814 6207", turni: "Farmacie di turno", mappa: "Come arrivare", prenota: "Prenota", canale: "Segui il canale", recensione: "Lascia una recensione" }
    },
    en: {
      apri: "Got a question? Ask us", corto: "Ask us", titolo: "Farmacia Tortorici", sotto: "Automatic assistant · instant replies",
      benv: "Hi there! 👋", benv2: "How can we help you today?", oggi: "Today", scrive: "typing…", bollaT: "Need any help?",
      ciao: "Hi! 👋 I'm Farmacia Tortorici's assistant. I can help with opening hours, services, bookings and on-duty pharmacies. What do you need?",
      bolla: "Hi! Can I help? 👋", chiudi: "Close", invia: "Send", scrivi: "Type your question…",
      nota: "Automatic replies: for health advice, please talk to the pharmacist.",
      rapide: ["Are you open now?", "How do I book a Holter?", "On-duty pharmacy", "Where are you?"],
      errore: "I can't reply right now. Message us on WhatsApp or give us a call: we'll help you.",
      troppi: "You've sent a lot of messages in a short time. Please try again later, or message us on WhatsApp.",
      nuova: "New conversation", questa: "This week", prossima: "Next week",
      az: { whatsapp: "Message us on WhatsApp", chiama: "Call +39 091 814 6207", turni: "On-duty pharmacies", mappa: "Directions", prenota: "Book", canale: "Follow the channel", recensione: "Leave a review" }
    },
    de: {
      apri: "Haben Sie eine Frage? Fragen Sie uns", corto: "Fragen Sie uns", titolo: "Farmacia Tortorici", sotto: "Automatischer Assistent · antwortet sofort",
      benv: "Hallo! 👋", benv2: "Wie können wir Ihnen heute helfen?", oggi: "Heute", scrive: "schreibt…", bollaT: "Brauchen Sie Hilfe?",
      ciao: "Hallo! 👋 Ich bin der Assistent der Farmacia Tortorici. Ich helfe Ihnen bei Öffnungszeiten, Leistungen, Terminen und Notdienstapotheken. Was brauchen Sie?",
      bolla: "Hallo! Kann ich helfen? 👋", chiudi: "Schließen", invia: "Senden", scrivi: "Ihre Frage…",
      nota: "Automatische Antworten: Für Gesundheitsfragen sprechen Sie bitte mit dem Apotheker.",
      rapide: ["Haben Sie jetzt geöffnet?", "Wie buche ich einen Holter?", "Notdienstapotheke", "Wo finde ich Sie?"],
      errore: "Ich kann gerade nicht antworten. Schreiben Sie uns auf WhatsApp oder rufen Sie uns an: Wir helfen Ihnen.",
      troppi: "Sie haben in kurzer Zeit viele Nachrichten gesendet. Bitte versuchen Sie es später oder schreiben Sie uns auf WhatsApp.",
      nuova: "Neues Gespräch", questa: "Diese Woche", prossima: "Nächste Woche",
      az: { whatsapp: "Auf WhatsApp schreiben", chiama: "+39 091 814 6207 anrufen", turni: "Notdienstapotheken", mappa: "Anfahrt", prenota: "Buchen", canale: "Kanal folgen", recensione: "Bewertung abgeben" }
    }
  }[LANG] || null;
  if (!T) return;

  var LINK = {
    whatsapp: WA, chiama: "tel:+390918146207",
    turni: "https://www.ordinefarmacistipalermo.it/turni.provincia.asp",
    mappa: "https://www.google.com/maps/dir/?api=1&destination=Farmacia%20Tortorici%2C%20Via%20Ettore%20Maiorana%2027%2C%20Trabia",
    prenota: "index.html#prenota", canale: "https://whatsapp.com/channel/0029VbDXlZKFy72CVSyoRg3o",
    recensione: "recensioni.html#scrivi"
  };
  var ICONE = {
    whatsapp: '<path d="M3 21l1.6-4.8A8.5 8.5 0 1 1 8 19.6z"/>',
    chiama: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    turni: '<path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><circle cx="12" cy="12" r="4"/>',
    mappa: '<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    prenota: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    canale: '<path d="M3 11l18-8-8 18-2-8z"/>',
    recensione: '<path d="M12 2l3 6.5 7 .8-5.2 4.8 1.4 7L12 17.6 5.8 21.1l1.4-7L2 9.3l7-.8z"/>'
  };
  var RIDOTTO = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var KEY = "ft-assistente";
  var storia = [];
  try { storia = JSON.parse(sessionStorage.getItem(KEY) || "[]"); } catch (e) {}
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var svg = function (p, cls) { return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + "</svg>"; };

  // ---------- struttura
  var LOGO = '<img src="img/logo-croce.png" alt="" width="30" height="30">';
  var QICONE = [
    '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    '<path d="M12 21s-7-4.4-9.3-9A5.4 5.4 0 0 1 12 6a5.4 5.4 0 0 1 9.3 6c-.5 1-1.1 1.9-1.8 2.8"/><path d="M3 13h4l2-3 3 6 2-3h7"/>',
    '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    '<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'
  ];
  var root = document.createElement("div");
  root.className = "ast";
  root.innerHTML =
    '<button type="button" class="ast-launch" aria-expanded="false" aria-controls="ast-panel" aria-label="' + esc(T.apri) + '">' +
      '<span class="ast-l-av">' + LOGO + '</span><span class="ast-l-txt">' + esc(T.corto) + '</span>' +
      '<span class="ast-l-x">' + svg('<path d="M6 6l12 12M18 6L6 18"/>') + '</span>' +
    "</button>" +
    '<div class="ast-bolla" role="status"><button type="button" class="ast-bolla-x" aria-label="' + esc(T.chiudi) + '">×</button>' +
      '<picture><source srcset="img/team-banner.webp" type="image/webp"><img src="img/team-banner.jpg" alt="" width="36" height="36"></picture>' +
      '<p style="margin:0"><b>' + esc(T.bollaT) + '</b><span>' + esc(T.bolla) + '</span></p></div>' +
    '<section class="ast-panel" id="ast-panel" role="dialog" aria-modal="false" aria-label="' + esc(T.titolo + " · " + T.sotto) + '" hidden>' +
      '<header class="ast-head">' +
        '<span class="ast-h-av">' + LOGO + '</span>' +
        '<span class="ast-h-t"><strong>' + esc(T.titolo) + '</strong><small>' + esc(T.sotto) + "</small></span>" +
        '<button type="button" class="ast-h-b ast-new" title="' + esc(T.nuova) + '" aria-label="' + esc(T.nuova) + '">' + svg('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>') + "</button>" +
        '<button type="button" class="ast-h-b ast-close" aria-label="' + esc(T.chiudi) + '">' + svg('<path d="M6 9l6 6 6-6"/>') + "</button>" +
      "</header>" +
      '<div class="ast-scroll">' +
        '<div class="ast-hero">' +
          '<div class="ast-banner"><picture><source srcset="img/team-banner.webp" type="image/webp"><img src="img/team-banner.jpg" alt="" width="640" height="433"></picture>' +
          '<div class="ast-banner-t"><b>' + esc(T.benv) + '</b><span>' + esc(T.benv2) + '</span></div></div>' +
          '<div class="ast-quick">' + T.rapide.map(function (q, i) {
            return '<button type="button" class="ast-q" style="animation-delay:' + (120 + i * 70) + 'ms"><i>' + svg(QICONE[i]) + "</i><span>" + esc(q) + "</span></button>";
          }).join("") + "</div>" +
        "</div>" +
        '<div class="ast-msgs" aria-live="polite"></div>' +
      "</div>" +
      '<form class="ast-form"><div class="ast-box">' +
        '<textarea rows="1" maxlength="500" placeholder="' + esc(T.scrivi) + '" aria-label="' + esc(T.scrivi) + '"></textarea>' +
        '<button type="submit" class="ast-send" aria-label="' + esc(T.invia) + '" disabled>' + svg('<path d="M5 12h14M13 6l6 6-6 6"/>') + "</button>" +
      "</div></form>" +
      '<p class="ast-nota">' + esc(T.nota) + "</p>" +
    "</section>";
  document.body.appendChild(root);

  var launch = root.querySelector(".ast-launch"), panel = root.querySelector(".ast-panel"),
      scroll = root.querySelector(".ast-scroll"), msgs = root.querySelector(".ast-msgs"),
      form = root.querySelector(".ast-form"), input = form.querySelector("textarea"),
      send = form.querySelector(".ast-send"), bolla = root.querySelector(".ast-bolla");
  var occupato = false;

  function salva() { try { sessionStorage.setItem(KEY, JSON.stringify(storia.slice(-20))); } catch (e) {} }
  function giu() { scroll.scrollTo({ top: scroll.scrollHeight, behavior: RIDOTTO ? "auto" : "smooth" }); }
  function adesso() { var d = new Date(); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); }

  function azioniHtml(az) {
    return (az || []).filter(function (a) { return LINK[a]; }).map(function (a) {
      var ext = /^https?:/.test(LINK[a]);
      return '<a class="ast-az" data-az="' + a + '" href="' + LINK[a] + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" + svg(ICONE[a]) + "<span>" + esc(T.az[a]) + "</span></a>";
    }).join("");
  }

  function tabellaHtml(tab) {
    if (!tab || !tab.length) return "";
    var oggi = new Date().toISOString().slice(0, 10);
    var fmt = function (d) { return new Date(d + "T12:00:00").toLocaleDateString(LANG === "de" ? "de-DE" : LANG === "en" ? "en-GB" : "it-IT", { day: "numeric", month: "short" }); };
    return '<div class="ast-tab">' + tab.map(function (r, i) {
      var ora = r.dal <= oggi && r.al >= oggi;
      var prossimoLun = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
      var etichetta = ora ? T.questa : (r.dal <= prossimoLun && r.al >= prossimoLun) ? T.prossima : "";
      var tel = String(r.telefono || "").replace(/[^\d+]/g, "");
      return '<div class="ast-tr' + (ora ? " ast-ora-ok" : "") + '">' +
        '<div class="ast-per">' + (etichetta ? "<b>" + esc(etichetta) + "</b> · " : "") + esc(fmt(r.dal)) + " – " + esc(fmt(r.al)) + "</div>" +
        '<div class="ast-far">' + esc(r.farmacia) + "</div>" +
        (r.indirizzo ? '<div class="ast-ind">' + esc(r.indirizzo) + "</div>" : "") +
        '<div class="ast-riga">' + (tel ? '<a href="tel:' + (tel[0] === "+" ? tel : "+39" + tel) + '">' + svg(ICONE.chiama) + esc(r.telefono) + "</a>" : "") +
        (r.tipo ? "<em>" + esc(r.tipo) + "</em>" : "") + "</div></div>";
    }).join("") + "</div>";
  }

  function bollaMsg(ruolo, testo, azioni, anima, ora, tabella) {
    var el = document.createElement("div");
    var bot = ruolo !== "utente";
    el.className = "ast-m ast-" + (bot ? "b" : "u") + (anima && !RIDOTTO ? " ast-in" : "");
    el.innerHTML = (bot ? '<span class="ast-mav">' + LOGO + "</span>" : "") +
      '<div class="ast-col"><div class="ast-bub"></div>' + tabellaHtml(tabella) + '<div class="ast-azs"></div>' + (ora ? '<span class="ast-ora">' + esc(ora) + "</span>" : "") + "</div>";
    msgs.appendChild(el);
    var txt = el.querySelector(".ast-bub"), azs = el.querySelector(".ast-azs");
    var finale = function () { azs.innerHTML = azioniHtml(azioni); if (azioni && azioni.length && !RIDOTTO) azs.classList.add("ast-pop"); giu(); };
    if (!bot || !anima || RIDOTTO) { txt.textContent = testo; finale(); return; }
    var parole = testo.split(/(\s+)/), i = 0;
    (function passo() {
      i = Math.min(parole.length, i + 2);
      txt.textContent = parole.slice(0, i).join("");
      if (i % 10 === 0) giu();
      if (i < parole.length) setTimeout(passo, 26); else finale();
    })();
  }

  function disegna() {
    msgs.innerHTML = "";
    if (storia.length) {
      var sep = document.createElement("div"); sep.className = "ast-sep"; sep.textContent = T.oggi; msgs.appendChild(sep);
    }
    storia.forEach(function (m) { bollaMsg(m.ruolo, m.testo, m.azioni, false, m.ora, m.tabella); });
    scroll.scrollTop = storia.length ? scroll.scrollHeight : 0;
  }

  function scrivendo() {
    var el = document.createElement("div");
    el.className = "ast-m ast-b ast-typing" + (RIDOTTO ? "" : " ast-in");
    el.innerHTML = '<span class="ast-mav">' + LOGO + '</span><div class="ast-col"><div class="ast-bub"><span class="ast-dots"><i></i><i></i><i></i></span><small>' + esc(T.scrive) + "</small></div></div>";
    msgs.appendChild(el); giu();
    return el;
  }

  function chiedi(testo) {
    testo = String(testo || "").trim().slice(0, 500);
    if (!testo || occupato) return;
    occupato = true; send.disabled = true;
    if (!storia.length) { var sep = document.createElement("div"); sep.className = "ast-sep"; sep.textContent = T.oggi; msgs.appendChild(sep); }
    var ora = adesso();
    storia.push({ ruolo: "utente", testo: testo, ora: ora }); salva();
    bollaMsg("utente", testo, null, true, ora);
    input.value = ""; cresci();
    var dots = scrivendo(), t0 = Date.now();
    fetch("/api/assistente", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ lingua: LANG, messaggi: storia.map(function (m) { return { ruolo: m.ruolo, testo: m.testo }; }) })
    }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { s: r.status, d: d }; }); })
      .catch(function () { return { s: 0, d: {} }; })
      .then(function (res) {
        var attesa = Math.max(0, 900 - (Date.now() - t0));
        setTimeout(function () {
          dots.remove();
          var testoR, az, tab = null;
          if (res.s === 200 && res.d.testo) { testoR = res.d.testo; az = res.d.azioni || []; tab = res.d.tabella || null; }
          else { testoR = res.s === 429 ? T.troppi : T.errore; az = ["whatsapp", "chiama"]; }
          var o = adesso();
          storia.push({ ruolo: "assistente", testo: testoR, azioni: az, ora: o, tabella: tab }); salva();
          bollaMsg("assistente", testoR, az, true, o, tab);
          occupato = false; send.disabled = !input.value.trim();
        }, attesa);
      });
  }

  function cresci() { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 110) + "px"; }

  function apri() {
    panel.hidden = false;
    requestAnimationFrame(function () { root.classList.add("ast-open"); });
    launch.setAttribute("aria-expanded", "true");
    nascondiBolla();
    if (!panel.dataset.pronto) { panel.dataset.pronto = 1; disegna(); }
    setTimeout(function () { if (matchMedia("(min-width: 561px)").matches) input.focus(); giu(); }, 220);
    document.documentElement.classList.add("ast-aperto");
  }
  function chiudi() {
    root.classList.remove("ast-open");
    launch.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("ast-aperto");
    setTimeout(function () { if (!root.classList.contains("ast-open")) panel.hidden = true; }, RIDOTTO ? 0 : 260);
    launch.focus();
  }
  function nascondiBolla() { bolla.classList.remove("ast-show"); try { sessionStorage.setItem("ft-ast-bolla", "1"); } catch (e) {} }

  launch.addEventListener("click", function () { root.classList.contains("ast-open") ? chiudi() : apri(); });
  root.querySelector(".ast-close").addEventListener("click", chiudi);
  root.querySelector(".ast-new").addEventListener("click", function () { if (occupato) return; storia = []; salva(); disegna(); scroll.scrollTo({ top: 0, behavior: "smooth" }); input.focus(); });
  root.querySelector(".ast-quick").addEventListener("click", function (e) { var b = e.target.closest(".ast-q"); if (b) chiedi(b.textContent); });
  bolla.addEventListener("click", function (e) { if (e.target.closest(".ast-bolla-x")) nascondiBolla(); else apri(); });
  input.addEventListener("input", function () { cresci(); send.disabled = occupato || !input.value.trim(); });
  input.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); chiedi(input.value); } });
  form.addEventListener("submit", function (e) { e.preventDefault(); chiedi(input.value); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && root.classList.contains("ast-open")) chiudi(); });
  msgs.addEventListener("click", function (e) {
    var a = e.target.closest('.ast-az[data-az="prenota"],.ast-az[data-az="recensione"]');
    if (!a) return;
    var dest = a.getAttribute("href"), qui = location.pathname.replace(/\/$/, "/index.html").split("/").pop() || "index.html";
    if (dest.split("#")[0] === qui) { e.preventDefault(); chiudi(); var t = document.getElementById(dest.split("#")[1]); if (t) t.scrollIntoView({ behavior: "smooth" }); }
  });

  // fumetto di benvenuto, una volta per visita
  var vista = false; try { vista = sessionStorage.getItem("ft-ast-bolla") === "1"; } catch (e) {}
  if (!vista) setTimeout(function () { if (!root.classList.contains("ast-open")) { bolla.classList.add("ast-show"); setTimeout(nascondiBolla, 9000); } }, 3500);
})();
