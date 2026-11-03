/* Assistente del sito — Farmacia Tortorici
   Finestra di chat che risponde alle domande pratiche (orari, servizi, prenotazioni, turni).
   Le risposte arrivano da /api/assistente. La conversazione resta solo in questa scheda del browser. */
(function () {
  if (window.__assistente) return; window.__assistente = true;

  var LANG = window.LINGUA || "it";
  var WA = "https://wa.me/393315250555";
  var T = {
    it: {
      apri: "Hai una domanda? Chiedi a noi", titolo: "Farmacia Tortorici", sotto: "Assistente automatico · risponde subito",
      ciao: "Ciao! 👋 Sono l'assistente della Farmacia Tortorici. Posso aiutarti con orari, servizi, prenotazioni e farmacie di turno. Cosa ti serve?",
      bolla: "Ciao! Posso aiutarti? 👋", chiudi: "Chiudi", invia: "Invia", scrivi: "Scrivi la tua domanda…",
      nota: "Risposte automatiche: per consigli sulla salute parla con il farmacista.",
      rapide: ["Siete aperti adesso?", "Come prenoto l'Holter?", "Farmacia di turno", "Dove vi trovo?"],
      errore: "Al momento non riesco a rispondere. Scrivici su WhatsApp o chiamaci: ti aiutiamo noi.",
      troppi: "Hai scritto molti messaggi in poco tempo. Riprova tra un po', oppure scrivici su WhatsApp.",
      nuova: "Nuova conversazione",
      az: { whatsapp: "Scrivici su WhatsApp", chiama: "Chiama 091 814 6207", turni: "Farmacie di turno", mappa: "Come arrivare", prenota: "Prenota", canale: "Segui il canale", recensione: "Lascia una recensione" }
    },
    en: {
      apri: "Got a question? Ask us", titolo: "Farmacia Tortorici", sotto: "Automatic assistant · instant replies",
      ciao: "Hi! 👋 I'm Farmacia Tortorici's assistant. I can help with opening hours, services, bookings and on-duty pharmacies. What do you need?",
      bolla: "Hi! Can I help? 👋", chiudi: "Close", invia: "Send", scrivi: "Type your question…",
      nota: "Automatic replies: for health advice, please talk to the pharmacist.",
      rapide: ["Are you open now?", "How do I book a Holter?", "On-duty pharmacy", "Where are you?"],
      errore: "I can't reply right now. Message us on WhatsApp or give us a call: we'll help you.",
      troppi: "You've sent a lot of messages in a short time. Please try again later, or message us on WhatsApp.",
      nuova: "New conversation",
      az: { whatsapp: "Message us on WhatsApp", chiama: "Call +39 091 814 6207", turni: "On-duty pharmacies", mappa: "Directions", prenota: "Book", canale: "Follow the channel", recensione: "Leave a review" }
    },
    de: {
      apri: "Haben Sie eine Frage? Fragen Sie uns", titolo: "Farmacia Tortorici", sotto: "Automatischer Assistent · antwortet sofort",
      ciao: "Hallo! 👋 Ich bin der Assistent der Farmacia Tortorici. Ich helfe Ihnen bei Öffnungszeiten, Leistungen, Terminen und Notdienstapotheken. Was brauchen Sie?",
      bolla: "Hallo! Kann ich helfen? 👋", chiudi: "Schließen", invia: "Senden", scrivi: "Ihre Frage…",
      nota: "Automatische Antworten: Für Gesundheitsfragen sprechen Sie bitte mit dem Apotheker.",
      rapide: ["Haben Sie jetzt geöffnet?", "Wie buche ich einen Holter?", "Notdienstapotheke", "Wo finde ich Sie?"],
      errore: "Ich kann gerade nicht antworten. Schreiben Sie uns auf WhatsApp oder rufen Sie uns an: Wir helfen Ihnen.",
      troppi: "Sie haben in kurzer Zeit viele Nachrichten gesendet. Bitte versuchen Sie es später oder schreiben Sie uns auf WhatsApp.",
      nuova: "Neues Gespräch",
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
  var root = document.createElement("div");
  root.className = "ast";
  root.innerHTML =
    '<button type="button" class="ast-launch" aria-expanded="false" aria-controls="ast-panel" aria-label="' + esc(T.apri) + '">' +
      '<span class="ast-ring" aria-hidden="true"></span>' +
      svg('<path d="M21 12a8.5 8.5 0 0 1-12.4 7.5L3 21l1.5-5.6A8.5 8.5 0 1 1 21 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01" stroke-width="2.6"/>', "ast-i-chat") +
      svg('<path d="M6 6l12 12M18 6L6 18"/>', "ast-i-x") +
    "</button>" +
    '<div class="ast-bolla" role="status"><button type="button" class="ast-bolla-x" aria-label="' + esc(T.chiudi) + '">×</button><span>' + esc(T.bolla) + "</span></div>" +
    '<section class="ast-panel" id="ast-panel" role="dialog" aria-modal="false" aria-label="' + esc(T.titolo + " · " + T.sotto) + '" hidden>' +
      '<header class="ast-head">' +
        '<span class="ast-av"><img src="img/logo-croce.png" alt="" width="30" height="30"></span>' +
        '<span class="ast-ht"><strong>' + esc(T.titolo) + '</strong><small><i class="ast-dot"></i>' + esc(T.sotto) + "</small></span>" +
        '<button type="button" class="ast-new" title="' + esc(T.nuova) + '" aria-label="' + esc(T.nuova) + '">' + svg('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>') + "</button>" +
        '<button type="button" class="ast-close" aria-label="' + esc(T.chiudi) + '">' + svg('<path d="M6 6l12 12M18 6L6 18"/>') + "</button>" +
      "</header>" +
      '<div class="ast-msgs" aria-live="polite"></div>' +
      '<form class="ast-form">' +
        '<textarea rows="1" maxlength="500" placeholder="' + esc(T.scrivi) + '" aria-label="' + esc(T.scrivi) + '"></textarea>' +
        '<button type="submit" class="ast-send" aria-label="' + esc(T.invia) + '" disabled>' + svg('<path d="M5 12h14M13 6l6 6-6 6"/>') + "</button>" +
      "</form>" +
      '<p class="ast-nota">' + esc(T.nota) + "</p>" +
    "</section>";
  document.body.appendChild(root);

  var launch = root.querySelector(".ast-launch"), panel = root.querySelector(".ast-panel"),
      msgs = root.querySelector(".ast-msgs"), form = root.querySelector(".ast-form"),
      input = form.querySelector("textarea"), send = form.querySelector(".ast-send"),
      bolla = root.querySelector(".ast-bolla");
  var occupato = false;

  function salva() { try { sessionStorage.setItem(KEY, JSON.stringify(storia.slice(-20))); } catch (e) {} }
  function giu() { msgs.scrollTo({ top: msgs.scrollHeight, behavior: RIDOTTO ? "auto" : "smooth" }); }

  function azioniHtml(az) {
    return (az || []).filter(function (a) { return LINK[a]; }).map(function (a) {
      var ext = /^https?:/.test(LINK[a]);
      return '<a class="ast-az" data-az="' + a + '" href="' + LINK[a] + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" + svg(ICONE[a]) + "<span>" + esc(T.az[a]) + "</span></a>";
    }).join("");
  }

  function bollaMsg(ruolo, testo, azioni, anima) {
    var el = document.createElement("div");
    el.className = "ast-m ast-" + (ruolo === "utente" ? "u" : "b") + (anima && !RIDOTTO ? " ast-in" : "");
    var corpo = '<div class="ast-txt"></div>';
    el.innerHTML = (ruolo === "utente" ? "" : '<span class="ast-mav"><img src="img/logo-croce.png" alt="" width="20" height="20"></span>') +
      '<div class="ast-bub">' + corpo + '<div class="ast-azs"></div></div>';
    msgs.appendChild(el);
    var txt = el.querySelector(".ast-txt"), azs = el.querySelector(".ast-azs");
    var finale = function () { azs.innerHTML = azioniHtml(azioni); if (azioni && azioni.length && !RIDOTTO) azs.classList.add("ast-pop"); giu(); };
    if (ruolo === "utente" || !anima || RIDOTTO) { txt.textContent = testo; finale(); giu(); return; }
    // le parole compaiono una dopo l'altra
    var parole = testo.split(/(\s+)/), i = 0;
    (function passo() {
      i = Math.min(parole.length, i + 2);
      txt.textContent = parole.slice(0, i).join("");
      if (i % 8 === 0) giu();
      if (i < parole.length) setTimeout(passo, 28); else finale();
    })();
  }

  function rapide() {
    if (storia.length) return;
    var w = document.createElement("div");
    w.className = "ast-chips";
    w.innerHTML = T.rapide.map(function (q, i) { return '<button type="button" style="--d:' + (i * 70) + 'ms">' + esc(q) + "</button>"; }).join("");
    msgs.appendChild(w);
    w.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) chiedi(b.textContent); });
  }

  function disegna() {
    msgs.innerHTML = "";
    bollaMsg("assistente", T.ciao, null, false);
    storia.forEach(function (m) { bollaMsg(m.ruolo, m.testo, m.azioni, false); });
    rapide();
    giu();
  }

  function scrivendo() {
    var el = document.createElement("div");
    el.className = "ast-m ast-b ast-typing" + (RIDOTTO ? "" : " ast-in");
    el.innerHTML = '<span class="ast-mav"><img src="img/logo-croce.png" alt="" width="20" height="20"></span><div class="ast-bub"><span class="ast-dots"><i></i><i></i><i></i></span></div>';
    msgs.appendChild(el); giu();
    return el;
  }

  function chiedi(testo) {
    testo = String(testo || "").trim().slice(0, 500);
    if (!testo || occupato) return;
    occupato = true; send.disabled = true;
    var ch = msgs.querySelector(".ast-chips"); if (ch) ch.remove();
    storia.push({ ruolo: "utente", testo: testo }); salva();
    bollaMsg("utente", testo, null, true);
    input.value = ""; cresci();
    var dots = scrivendo(), t0 = Date.now();
    fetch("/api/assistente", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ lingua: LANG, messaggi: storia.map(function (m) { return { ruolo: m.ruolo, testo: m.testo }; }) })
    }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { s: r.status, d: d }; }); })
      .catch(function () { return { s: 0, d: {} }; })
      .then(function (res) {
        var attesa = Math.max(0, 700 - (Date.now() - t0));
        setTimeout(function () {
          dots.remove();
          var testoR, az;
          if (res.s === 200 && res.d.testo) { testoR = res.d.testo; az = res.d.azioni || []; }
          else { testoR = res.s === 429 ? T.troppi : T.errore; az = ["whatsapp", "chiama"]; }
          storia.push({ ruolo: "assistente", testo: testoR, azioni: az }); salva();
          bollaMsg("assistente", testoR, az, true);
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
    if (!msgs.childElementCount) disegna();
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
  root.querySelector(".ast-new").addEventListener("click", function () { if (occupato) return; storia = []; salva(); disegna(); input.focus(); });
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
