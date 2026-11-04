/* Versioni inglese e tedesca del sito — Farmacia Tortorici
   Il sito è scritto in italiano (lingua predefinita). Con il menu IT/EN/DE in alto
   i testi vengono sostituiti con le traduzioni qui sotto; la scelta resta salvata nel browser.
   Se un testo italiano viene modificato e non ha ancora la traduzione, resta in italiano.
   I contenuti scritti da altri (post Facebook, recensioni, notizie) restano in originale. */
(function () {
  var KEY = "ft-lingua";
  var q = (location.search.match(/[?&]lang=(it|en|de)\b/) || [])[1];
  var lang = q || (function () { try { return localStorage.getItem(KEY); } catch (e) { return null; } })() || "it";
  if (!/^(it|en|de)$/.test(lang)) lang = "it";
  if (q) { try { localStorage.setItem(KEY, q); } catch (e) {} }
  window.LINGUA = lang;

  function cambia(l) {
    try { localStorage.setItem(KEY, l); } catch (e) {}
    location.href = location.pathname + "?lang=" + l + location.hash;
  }

  var BANDIERE = {
    it: '<svg viewBox="0 0 3 2" aria-hidden="true"><rect width="1" height="2" fill="#009246"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#ce2b37"/></svg>',
    en: '<svg viewBox="0 0 60 30" aria-hidden="true"><clipPath id="ukc_X"><path d="M30,15h30v15zv15h-30zh-30v-15zv-15h30z"/></clipPath><path d="M0,0v30h60v-30z" fill="#012169"/><path d="M0,0 60,30M60,0 0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 60,30M60,0 0,30" clip-path="url(#ukc_X)" stroke="#C8102E" stroke-width="4"/><path d="M30,0v30M0,15h60" stroke="#fff" stroke-width="10"/><path d="M30,0v30M0,15h60" stroke="#C8102E" stroke-width="6"/></svg>',
    de: '<svg viewBox="0 0 5 3" aria-hidden="true"><rect width="5" height="1" fill="#000"/><rect y="1" width="5" height="1" fill="#dd0000"/><rect y="2" width="5" height="1" fill="#ffce00"/></svg>'
  };
  var nBand = 0;
  function bandiera(l) { nBand++; return '<span class="lang-flag lang-flag-' + l + '">' + BANDIERE[l].replace(/ukc_X/g, "ukc" + nBand) + "</span>"; }

  function aggiungiPulsante() {
    var cta = document.querySelector(".nav-cta");
    if (!cta || document.getElementById("lang-btn")) return;
    var LINGUE = [["it", "IT", "Italiano"], ["en", "EN", "English"], ["de", "DE", "Deutsch"]];
    var w = document.createElement("div");
    w.className = "lang-dd";
    var cur = LINGUE.filter(function (o) { return o[0] === lang; })[0];
    w.innerHTML =
      '<button type="button" id="lang-btn" class="lang-btn lang-b-' + lang + '" aria-haspopup="listbox" aria-expanded="false" aria-label="Lingua · Language · Sprache">' +
        bandiera(lang) + '<span class="lang-cod">' + cur[1] + '</span><svg class="lang-chev" viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      "</button>" +
      '<ul class="lang-menu" role="listbox" hidden>' + LINGUE.map(function (o) {
        return '<li role="option" lang="' + o[0] + '" data-l="' + o[0] + '" tabindex="0" aria-selected="' + (o[0] === lang) + '" class="lang-op lang-op-' + o[0] + '">' +
          bandiera(o[0]) + "<b>" + o[1] + "</b><span>" + o[2] + "</span>" + (o[0] === lang ? '<i aria-hidden="true">✓</i>' : "") + "</li>";
      }).join("") + "</ul>";
    var b = w.querySelector("button"), m = w.querySelector("ul");
    function apri(x) { m.hidden = !x; b.setAttribute("aria-expanded", x); if (x) { var c = m.querySelector('[aria-selected="true"]'); if (c) c.focus(); } }
    b.addEventListener("click", function (e) { e.stopPropagation(); apri(m.hidden); });
    m.addEventListener("click", function (e) { var li = e.target.closest("li[data-l]"); if (!li) return; apri(false); if (li.dataset.l !== lang) cambia(li.dataset.l); });
    m.addEventListener("keydown", function (e) {
      var li = e.target.closest("li[data-l]"); if (!li) return;
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); li.click(); }
      if (e.key === "ArrowDown" && li.nextElementSibling) { e.preventDefault(); li.nextElementSibling.focus(); }
      if (e.key === "ArrowUp" && li.previousElementSibling) { e.preventDefault(); li.previousElementSibling.focus(); }
    });
    document.addEventListener("click", function (e) { if (!m.hidden && !w.contains(e.target)) apri(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !m.hidden) { apri(false); b.focus(); } });
    var burger = cta.querySelector(".burger");
    cta.insertBefore(w, burger || null);
  }


  if (lang === "it") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", aggiungiPulsante);
    else aggiungiPulsante();
    return;
  }

  document.documentElement.lang = lang;
  document.documentElement.classList.add("i18n-wait");
  setTimeout(function () { document.documentElement.classList.remove("i18n-wait"); }, 1500);

  var EN = {
    // --- intestazione, menu, piè di pagina (tutte le pagine)
    "Vai al contenuto": "Skip to content",
    "Trabia · dal cuore del paese": "Trabia · in the heart of town",
    "Chi siamo": "About us",
    "Servizi": "Services",
    "Novità": "News",
    "Recensioni": "Reviews",
    "Prenota": "Book",
    "Contatti": "Contact",
    "Farmacia Tortorici, torna all'inizio": "Farmacia Tortorici, back to top",
    "Scrivici su WhatsApp": "Message us on WhatsApp",
    "Apri menu": "Open menu",
    "← Torna alla home": "← Back to home",
    "Navigazione": "Navigation",
    "Telefono": "Phone",
    "Indirizzo · Indicazioni": "Address · Directions",
    "Titolare e direttore responsabile: Dott. Ivan Tortorici, iscritto all'Ordine dei Farmacisti della Provincia di Palermo, n. 2352": "Owner and director: Dr. Ivan Tortorici, registered with the Order of Pharmacists of the Province of Palermo, no. 2352",
    "Farmacia Dott. Ivan Tortorici · P.IVA 01488560820": "Farmacia Dott. Ivan Tortorici · VAT no. 01488560820",
    "Preferenze cookie": "Cookie preferences",
    "Le informazioni presenti in questo sito hanno carattere informativo e non sostituiscono il parere del medico o del farmacista.": "The information on this website is for general guidance only and does not replace the advice of a doctor or pharmacist.",
    "Usiamo solo cookie tecnici. Con il tuo consenso mostriamo anche la mappa di Google, che usa cookie di terze parti.": "We only use technical cookies. With your consent we also show the Google map, which uses third-party cookies.",
    "Rifiuta": "Decline",
    "Accetta": "Accept",
    "Chiudi e rifiuta": "Close and decline",
    "Canale WhatsApp": "WhatsApp channel",

    // --- hero
    "Venerdì 6/11": "Friday 6 Nov",
    "Incontro su sport e nutrizione": "Talk on sport and nutrition",
    "Prenota il calendario 2027": "Book the 2027 calendar",
    "La tua salute,": "Your health,",
    "buone mani": "good hands",
    "Da tanti anni la Farmacia del Dott. Ivan Tortorici è un punto di riferimento per le famiglie di Trabia: consiglio professionale, servizi di prevenzione e un assortimento curato per ogni esigenza.": "For many years Dr. Ivan Tortorici's pharmacy has been a trusted point of reference for the families of Trabia: professional advice, prevention services and a carefully chosen range of products for every need.",
    "Chiama ora": "Call now",
    "Prenota su WhatsApp": "Book on WhatsApp",
    "Iscriviti al canale": "Join the channel",
    "Assistenza a domicilio": "Home assistance",
    "Parcheggio facile": "Easy parking",
    "Accesso per persone con disabilità": "Accessible for people with disabilities",
    "Tocca per la foto vera": "Tap for the real photo",
    "Tocca per il fumetto": "Tap for the cartoon",
    "Mostra la foto vera del team": "Show the real photo of the team",
    "Mostra il fumetto del team": "Show the cartoon of the team",
    "Il nostro team, sempre al tuo fianco": "Our team, always by your side",
    "Risposta della farmacia": "Reply from the pharmacy",
    "Lo staff della Farmacia Tortorici di Trabia, illustrato in stile animazione": "The staff of Farmacia Tortorici in Trabia, drawn in animation style",
    "Foto dello staff della Farmacia Tortorici di Trabia": "Photo of the staff of Farmacia Tortorici in Trabia",
    "Orario di oggi": "Today's opening hours",
    "Oggi": "Today",
    "I nostri punti di forza": "Our strengths",
    "Accessibile a tutti": "Accessible to everyone",
    "Holter in convenzione": "Holter covered by the NHS",
    "Consiglio personalizzato": "Personal advice",

    // --- evento
    "Evento · Venerdì 6 novembre": "Event · Friday 6 November",
    "Illustrazione: un dito con una goccia di sangue": "Illustration: a finger with a drop of blood",
    "Gratis": "Free",
    "Giornata della salute · Mercoledì 11 novembre": "Health day · Wednesday 11 November",
    "Emoglobina glicata gratuita": "Free HbA1c (glycated haemoglobin) test",
    "Mercoledì 11 novembre, in farmacia, puoi fare": "On Wednesday 11 November, at the pharmacy, you can have a",
    "gratuitamente": "free",
    "l'esame dell'emoglobina glicata.": "glycated haemoglobin test.",
    "L'emoglobina glicata (HbA1c) indica la media della glicemia degli ultimi 2-3 mesi: è un esame utile per la prevenzione e per tenere sotto controllo il diabete. Basta una goccia di sangue dal dito.": "Glycated haemoglobin (HbA1c) shows your average blood sugar over the last 2–3 months: a useful test for prevention and for keeping diabetes under control. All it takes is a drop of blood from your finger.",
    "Mercoledì 11 novembre, mattina e pomeriggio": "Wednesday 11 November, morning and afternoon",
    "Farmacia Tortorici, Via Ettore Maiorana 27, Trabia": "Farmacia Tortorici, Via Ettore Maiorana 27, Trabia",
    "Costo": "Cost",
    "Gratuito, su prenotazione": "Free, booking required",
    "Mercoledì 11/11": "Wednesday 11/11",
    "Emoglobina glicata gratis": "Free HbA1c test",
    "Allenamento, nutrizione ed integrazione": "Training, nutrition and supplements",
    "Sei uno sportivo? Oppure vuoi curare la tua alimentazione per iniziare a fare sport? Questo incontro è per te.": "Are you into sport? Or would you like to improve your diet to start exercising? This talk is for you.",
    "Il": "",
    "Dott. Valerio Papa": "Dr. Valerio Papa",
    ", biologo nutrizionista ed Enervit nutrition specialist, ti darà strategie e consigli pratici per gestire al meglio l'energia, il recupero e la performance sportiva.": ", nutritionist biologist and Enervit nutrition specialist, will share strategies and practical tips to manage your energy, recovery and sports performance.",
    "La partecipazione è gratuita e non prevede vendita di prodotti.": "Attendance is free and no products will be sold.",
    "Quando": "When",
    "Venerdì 6 novembre, dalle ore 18.00": "Friday 6 November, from 6 pm",
    "Dove": "Where",
    "Ambulatorio medico accanto alla farmacia, Via Ettore Maiorana 26, Trabia": "Medical clinic next to the pharmacy, Via Ettore Maiorana 26, Trabia",
    "Prenotazioni": "Bookings",
    "Chiama e prenota": "Call to book",
    "Evento svolto": "Past event",
    "Evento della Farmacia Tortorici svolto in data venerdì 6 novembre 2026": "Farmacia Tortorici event held on Friday 6 November 2026",
    "Evento della Farmacia Tortorici svolto in data mercoledì 11 novembre 2026": "Farmacia Tortorici event held on Wednesday 11 November 2026",
    "Locandina dell'incontro Enervit: Allenamento, nutrizione ed integrazione. Venerdì 6 novembre dalle ore 18.00 presso la Farmacia Tortorici. Relatore Dott. Valerio Papa": "Poster of the Enervit talk: Training, nutrition and supplements. Friday 6 November from 6 pm at Farmacia Tortorici. Speaker Dr. Valerio Papa",

    // --- calendario
    "Novità · Calendario 2027": "New · 2027 calendar",
    "Il nostro calendario 2027 ti aspetta!": "Our 2027 calendar is waiting for you!",
    "Ci siamo fumettizzati per te: il nostro calendario di qualità con tante utili informazioni e spazio per scrivere appunti e ricorrenze. Prenota la tua copia e ritirala in farmacia.": "We turned ourselves into cartoons for you: our quality calendar, full of useful information with space for your notes and special dates. Book your copy and pick it up at the pharmacy.",
    "Chiama": "Call",
    "Anteprima del calendario 2027 della Farmacia Tortorici, pagina di gennaio": "Preview of the Farmacia Tortorici 2027 calendar, January page",

    // --- chi siamo
    "Molto apprezzata dai clienti": "Highly rated by customers",
    "per competenza e cortesia": "for expertise and kindness",
    "Attenti alle tue esigenze.": "Attentive to your needs.",
    "Crediamo in un rapporto diretto con chi entra: ascoltare, consigliare, seguire nel tempo.": "We believe in a direct relationship with everyone who walks in: listening, advising and following up over time.",
    "Da tanti anni ampliamo i nostri servizi mantenendo la stessa idea di partenza: ogni persona ha esigenze diverse. Per questo selezioniamo con attenzione alimenti speciali, dermocosmesi, prodotti ortopedici e veterinari, e offriamo controlli e screening direttamente in farmacia.": "For many years we have been expanding our services while keeping the same idea we started with: every person has different needs. That is why we carefully select special foods, skincare, orthopaedic and veterinary products, and offer check-ups and screening right here in the pharmacy.",
    "Siamo facilmente raggiungibili, con comodo parcheggio e accesso agevole per le persone con disabilità. E se non puoi venire in farmacia, ti assistiamo a domicilio.": "We are easy to reach, with convenient parking and easy access for people with disabilities. And if you can't come to the pharmacy, we'll assist you at home.",
    "— Dott. Ivan Tortorici e lo staff": "— Dr. Ivan Tortorici and the staff",
    "Sigillo della Farmacia Dott. Ivan Tortorici, Trabia (PA)": "Seal of Farmacia Dott. Ivan Tortorici, Trabia (PA)",

    // --- servizi
    "Cosa possiamo fare per te": "What we can do for you",
    "Oltre alla dispensazione di farmaci con e senza ricetta, offriamo servizi pensati per semplificarti la vita.": "Besides prescription and over-the-counter medicines, we offer services designed to make your life easier.",
    "Convenzionato SSN": "Covered by the NHS",
    "Holter cardiaco e pressorio": "Heart and blood pressure Holter",
    "In convenzione con il SSN con la ricetta del medico di base, oppure anche senza ricetta, a pagamento. Prenoti in farmacia, al telefono o": "Covered by the Italian NHS with a prescription from your GP, or also without a prescription for a fee. Book at the pharmacy, by phone or",
    "su WhatsApp": "on WhatsApp",
    "Screening in farmacia": "Screening at the pharmacy",
    "Quadro lipidico completo, emoglobina glicata, glicemia, PSA e vitamina D con una goccia di sangue dal dito: indolore e in pochi minuti.": "Full lipid profile, HbA1c, blood glucose, PSA and vitamin D from a single drop of blood from your fingertip: painless and in just a few minutes.",
    "SOF test gratuito": "Free FOB test",
    "Hai tra 50 e 69 anni? Ritira in farmacia, quando vuoi e senza attese, il kit gratuito per lo screening del colon-retto.": "Are you between 50 and 69? Pick up the free bowel cancer screening kit at the pharmacy, whenever you like and without waiting.",
    "Giornate della salute": "Health days",
    "Screening per la prevenzione con specialisti in farmacia: esame per la densità ossea, screening senologico, consulenze dermocosmetiche personalizzate, consigli alimentari. Su prenotazione.": "Prevention screening with specialists at the pharmacy: bone density test, breast screening, personalised skincare consultations, dietary advice. By appointment.",
    "Pressione ed ECG": "Blood pressure and ECG",
    "Misurazione della pressione arteriosa ed elettrocardiogramma in farmacia, rapidi e vicino a casa.": "Blood pressure measurement and electrocardiogram at the pharmacy, quick and close to home.",
    "Foratura dei lobi": "Ear piercing",
    "In modo indolore e in ambiente igienicamente sicuro, con materiali ipoallergenici e molto gradevoli.": "Painless and in a hygienically safe environment, with hypoallergenic and very attractive materials.",
    "Assistenza a domicilio gratuita": "Free home assistance",
    "Chi non può venire in farmacia non resta solo: chiamaci o": "If you can't come to the pharmacy, you're not on your own: call us or",
    "scrivici su WhatsApp": "message us on WhatsApp",
    "e ti assistiamo direttamente a casa, gratuitamente.": "and we'll assist you at home, free of charge.",
    "Alimenti": "Special foods",
    "Alimenti speciali per intolleranze, celiachia ed esigenze particolari, disponibili o ordinabili.": "Special foods for intolerances, coeliac disease and particular needs, in stock or available to order.",
    "Dermocosmesi": "Skincare",
    "Prodotti selezionati per la cura della pelle, del viso e del corpo, con il consiglio giusto per te.": "Selected products for skin, face and body care, with the right advice for you.",
    "Prodotti ortopedici": "Orthopaedic products",
    "Tutori e ausili ortopedici per il benessere e il recupero di ogni giorno.": "Braces and orthopaedic aids for everyday wellbeing and recovery.",
    "Prodotti per sportivi": "Sports products",
    "Prodotti per chi fa sport, con il consiglio giusto per te.": "Products for people who play sport, with the right advice for you.",
    "Veterinaria": "Veterinary",
    "Farmaci, alimenti e prodotti per la salute dei tuoi animali, anche su ricetta veterinaria.": "Medicines, food and health products for your pets, including with a veterinary prescription.",
    "Devi pagare un ticket per visita ospedaliera?": "Need to pay a hospital appointment fee?",
    "Questo ed altro da noi.": "You can do this and more with us.",

    // --- prenota
    "Prenota in un tocco": "Book with one tap",
    "Cosa ti serve oggi?": "What do you need today?",
    "Tocca un pulsante: si apre": "Tap a button:",
    "con il messaggio già scritto. Ti rispondiamo noi.": "opens with the message already written. We'll get back to you.",
    "Prenota l'Holter": "Book a Holter",
    "Con la ricetta del medico (SSN) o anche senza, a pagamento.": "With a doctor's prescription (NHS) or without one, for a fee.",
    "Scrivici su WhatsApp →": "Message us on WhatsApp →",
    "Prenota uno screening": "Book a screening",
    "Colesterolo, glicata, glicemia, PSA, vitamina D.": "Cholesterol, HbA1c, blood glucose, PSA, vitamin D.",
    "Ti assistiamo a casa, gratuitamente.": "We assist you at home, free of charge.",
    "Chiedi un prodotto": "Ask about a product",
    "Ti diciamo se è disponibile.": "We'll tell you if it's available.",

    // --- canale WhatsApp
    "Community · Canale WhatsApp": "Community · WhatsApp channel",
    "Segui il canale Farmacia Tortorici Trabia": "Follow the Farmacia Tortorici Trabia channel",
    "È gratis e non serve salvare il nostro numero: le novità della farmacia ti arrivano direttamente su WhatsApp, come su una bacheca sempre a portata di mano.": "It's free and you don't need to save our number: the pharmacy's news comes straight to your WhatsApp, like a notice board always at hand.",
    "Di cosa parla": "What it's about",
    "Giornate della salute e screening": "Health days and screening",
    "Eventi e incontri in farmacia": "Events and talks at the pharmacy",
    "Avvisi su orari e chiusure": "Notices about opening hours and closures",
    "Novità e consigli per la salute": "News and health tips",
    "Segui il canale": "Follow the channel",
    "Si apre WhatsApp: tocca «Segui».": "WhatsApp opens: tap “Follow”.",
    "Cos'è un canale WhatsApp?": "What is a WhatsApp channel?",
    "Solo i nostri aggiornamenti.": "Only our updates.",
    "Non è un gruppo: niente chat e niente messaggi da altri iscritti.": "It isn't a group: no chat and no messages from other followers.",
    "Il tuo numero resta privato.": "Your number stays private.",
    "Né noi né gli altri iscritti possiamo vederlo.": "Neither we nor other followers can see it.",
    "Smetti quando vuoi.": "Stop whenever you like.",
    "Basta un tocco su «Non seguire più».": "Just tap “Unfollow”.",

    // --- facebook e social
    "Novità e video": "News and videos",
    "Dalla nostra pagina Facebook": "From our Facebook page",
    "Gli ultimi post della nostra pagina, aggiornati in automatico.": "The latest posts from our page, updated automatically.",
    "persone ci seguono su Facebook": "people follow us on Facebook",
    "Seguici su Facebook": "Follow us on Facebook",
    "Seguici su TikTok": "Follow us on TikTok",
    "Seguici su Instagram": "Follow us on Instagram",
    "Guarda il video →": "Watch the video →",
    "Leggi su Facebook →": "Read on Facebook →",
    "Segui la nostra pagina Facebook per le ultime novità.": "Follow our Facebook page for the latest news.",

    // --- notizie
    "Attualità sanitaria": "Health news",
    "Notizie dal mondo della salute": "News from the world of health",
    "Le ultime notizie da Quotidiano Sanità e Farmacista33, scelte per te e aggiornate in automatico.": "The latest news from Quotidiano Sanità and Farmacista33 (in Italian), chosen for you and updated automatically.",
    "Fonti:": "Sources:",
    "e": "and",
    ". Gli articoli si aprono sul sito della testata.": ". Articles open on the publisher's website.",
    "Leggi →": "Read →",

    // --- recensioni (home)
    "Cosa dicono di noi": "What people say about us",
    "Dalle recensioni su Google.": "From our Google reviews.",
    "Leggi tutte le recensioni": "Read all reviews",
    "Lascia una recensione": "Leave a review",

    // --- domande frequenti
    "Domande frequenti": "FAQ",
    "Hai un dubbio?": "Got a question?",
    "Per tutto il resto, chiamaci o scrivici.": "For anything else, call or message us.",
    "Come prenoto l'Holter cardiaco o pressorio?": "How do I book a heart or blood pressure Holter?",
    "Con la ricetta del medico di base è in convenzione con il Servizio Sanitario Nazionale; si può fare anche senza ricetta, a pagamento. Prenoti chiamando lo 091 814 6207 o": "With a prescription from your GP it is covered by the Italian National Health Service; you can also have it without a prescription, for a fee. Book by calling 091 814 6207 or",
    "scrivendo su WhatsApp al 331 525 0555": "by messaging us on WhatsApp at 331 525 0555",
    "Fate anche l'ECG?": "Do you also do ECGs?",
    "Sì: in farmacia facciamo l'elettrocardiogramma e la misurazione della pressione. Chiamaci per sapere i tempi.": "Yes: we do electrocardiograms and blood pressure measurement at the pharmacy. Call us to check availability.",
    "L'assistenza a domicilio ha un costo?": "Is there a charge for home assistance?",
    "No, è gratuita. Chiamaci o": "No, it's free. Call us or",
    "scrivici su WhatsApp al 331 525 0555": "message us on WhatsApp at 331 525 0555",
    "e ti assistiamo direttamente a casa.": "and we'll assist you at home.",
    "Serve la prenotazione per il controllo del colesterolo?": "Do I need to book a cholesterol test?",
    "No, puoi passare quando vuoi. Con una goccia di sangue dal dito facciamo anche emoglobina glicata, glicemia, PSA e vitamina D.": "No, you can drop in whenever you like. From a drop of blood from your fingertip we also test HbA1c, blood glucose, PSA and vitamin D.",
    "Chi può ritirare il kit SOF test?": "Who can pick up the FOB test kit?",
    "Chi ha tra 50 e 69 anni può ritirarlo gratuitamente in farmacia, quando vuole e senza attese.": "Anyone aged 50 to 69 can pick it up free of charge at the pharmacy, whenever they like and without waiting.",
    "Siete aperti la domenica?": "Are you open on Sundays?",
    "Sì: la domenica dalle 9.00 alle 13.00. Dal lunedì al venerdì 8.30–13.00 e 16.15–19.45, il sabato 8.30–13.00 e 16.15–19.30.": "Yes: on Sundays from 9:00 to 13:00. Monday to Friday 8:30–13:00 and 16:15–19:45, Saturday 8:30–13:00 and 16:15–19:30.",
    "Di notte o nei festivi a chi mi rivolgo?": "Who do I contact at night or on public holidays?",
    "Alla farmacia di turno, con servizio a chiamata solo per farmaci urgenti. Il calendario dei turni è esposto sulle bacheche di tutte le farmacie.": "The on-duty pharmacy, with an on-call service for urgent medicines only. The duty rota is posted on the notice boards of all pharmacies.",

    // --- Trabia, orari, contatti
    "Nel cuore del nostro paese.": "In the heart of our town.",
    "Ci trovi in Via Ettore Maiorana 27, facilmente raggiungibili e con comodo parcheggio.": "You'll find us at Via Ettore Maiorana 27, easy to reach and with convenient parking.",
    "Orari e come arrivare": "Opening hours and directions",
    "Veduta aerea di Trabia con il castello sul mare": "Aerial view of Trabia with the castle by the sea",
    "Orari e contatti": "Opening hours and contact",
    "Vieni a trovarci": "Come and see us",
    "Via Ettore Maiorana 27. Parcheggio facile e accesso per persone con disabilità.": "Via Ettore Maiorana 27. Easy parking and access for people with disabilities.",
    "Orario di apertura": "Opening hours",
    "Orari settimanali": "Weekly opening hours",
    "Lunedì": "Monday", "Martedì": "Tuesday", "Mercoledì": "Wednesday", "Giovedì": "Thursday",
    "Venerdì": "Friday", "Sabato": "Saturday", "Domenica": "Sunday",
    "Chiuso": "Closed",
    "Nei giorni festivi e nei turni gli orari possono variare. Gli avvisi aggiornati sono sulla nostra bacheca.": "Opening hours may vary on public holidays and duty days. Up-to-date notices are on our notice board.",
    "Indicazioni stradali": "Get directions",
    "Mostra la mappa qui": "Show the map here",
    "La mappa è fornita da Google e usa cookie di terze parti.": "The map is provided by Google and uses third-party cookies.",
    "Mappa: Farmacia Tortorici, Via Ettore Maiorana 27, Trabia": "Map: Farmacia Tortorici, Via Ettore Maiorana 27, Trabia",
    "Cerchi la farmacia di turno?": "Looking for the on-duty pharmacy?",
    "Di notte e nei festivi il servizio a chiamata, solo per farmaci urgenti, è garantito a rotazione dalle farmacie della zona. Il calendario dei turni è esposto sulle bacheche di tutte le farmacie.": "At night and on public holidays, an on-call service for urgent medicines only is provided on a rota by local pharmacies. The duty rota is posted on the notice boards of all pharmacies.",
    "Chiamaci": "Call us",
    "Farmacie di turno · sito ufficiale": "On-duty pharmacies · official website",
    "Vedi le farmacie di turno sul sito ufficiale dell'Ordine dei Farmacisti di Palermo →": "See the on-duty pharmacies on the official website of the Palermo Order of Pharmacists →",

    // --- pagina recensioni
    "Le vostre": "Your",
    "parole": "words",
    "Grazie a tutti i clienti che hanno lasciato un'opinione sulla nostra farmacia. Qui trovi le recensioni pubblicate su Google, così come sono state scritte.": "Thank you to all the customers who have shared their opinion of our pharmacy. Here you'll find the reviews published on Google, exactly as they were written (in Italian).",
    "Ti siamo stati utili?": "Did we help you?",
    "Raccontaci la tua esperienza: aiuta altre famiglie di Trabia a conoscerci. Bastano 30 secondi.": "Tell us about your experience: it helps other families in Trabia get to know us. It only takes 30 seconds.",
    "Scegli le stelle e scrivi due parole": "Choose the stars and write a few words",
    "Lo staff la legge e la pubblica qui sul sito": "Our staff read it and publish it here on the website",
    "Preferisci Google? Lascia la recensione su Google →": "Prefer Google? Leave your review on Google →",
    "Il tuo voto": "Your rating",
    "Tocca una stella": "Tap a star",
    "Il tuo nome": "Your name",
    "La tua recensione": "Your review",
    "Acconsento alla pubblicazione del nome e della recensione su questo sito. Non inserire dati sulla tua salute.": "I agree to my name and review being published on this website. Please do not include any information about your health.",
    "Invia la recensione": "Send review",
    "Invio…": "Sending…",
    "Puoi lasciare la tua recensione su": "You can leave your review on",
    "Grazie!": "Thank you!",
    "Abbiamo ricevuto la tua recensione. Sarà visibile qui dopo la verifica dello staff.": "We've received your review. It will appear here once our staff have checked it.",
    "Da approvare": "Awaiting approval",
    "Personale gentile e preparato": "Kind, knowledgeable staff",
    "Tanto assortimento": "Wide range of products",
    "Consigli su misura": "Tailored advice",
    "Reparto cosmesi": "Cosmetics department",
    "Leggi tutte le recensioni su Google": "Read all reviews on Google",
    "Lascia la tua recensione": "Leave your review",
    "1 stella": "1 star",
    "Es. Maria R.": "e.g. Maria R.",
    "Com'è andata? Cosa ti è piaciuto?": "How did it go? What did you like?",
    "Recensioni da approvare": "Reviews awaiting approval",
    "Distribuzione delle valutazioni": "Rating breakdown",
    "Recensione dal sito": "Review from our website",
    "Eccellente": "Excellent", "Buona": "Good", "Nella media": "Average", "Scarsa": "Poor", "Pessima": "Terrible",
    "Scegli da 1 a 5 stelle.": "Choose from 1 to 5 stars.",
    "Scrivi il tuo nome (anche solo nome e iniziale del cognome).": "Write your name (first name and surname initial is fine).",
    "Scrivi almeno qualche parola sulla tua esperienza.": "Write at least a few words about your experience.",
    "Per pubblicarla serve il tuo consenso.": "We need your consent to publish it.",
    "Non siamo riusciti a inviarla. Riprova tra poco.": "We couldn't send it. Please try again shortly.",
    "Scrivi il tuo nome (2-40 caratteri).": "Write your name (2–40 characters).",
    "La recensione deve avere tra 10 e 600 caratteri.": "Your review must be between 10 and 600 characters.",
    "Serve il consenso alla pubblicazione.": "Consent to publication is required.",
    "Per favore non inserire link.": "Please don't include links.",
    "Hai già inviato diverse recensioni oggi. Riprova domani.": "You've already sent several reviews today. Please try again tomorrow.",

    // --- pagine legali (solo titoli e voci comuni)
    "Privacy · Farmacia Tortorici": "Privacy · Farmacia Tortorici",
    "Cookie · Farmacia Tortorici": "Cookies · Farmacia Tortorici",
    "Recensioni · Farmacia Tortorici": "Reviews · Farmacia Tortorici",

    // --- titolo e descrizione della home
    "Farmacia Dott. Ivan Tortorici a Trabia (PA), Via Ettore Maiorana 27. Holter in convenzione, screening, dermocosmesi, veterinaria, assistenza a domicilio gratuita. Tel. 091 814 6207.": "Farmacia Dott. Ivan Tortorici in Trabia (PA), Via Ettore Maiorana 27. NHS-covered Holter monitoring, screening, skincare, veterinary products, free home assistance. Tel. +39 091 814 6207.",
    "Le recensioni dei clienti della Farmacia Dott. Ivan Tortorici a Trabia (PA).": "Customer reviews of Farmacia Dott. Ivan Tortorici in Trabia (PA)."
  };

  var DE = {
   "Vai al contenuto": "Zum Inhalt springen",
   "Trabia · dal cuore del paese": "Trabia · im Herzen des Ortes",
   "Chi siamo": "Über uns",
   "Servizi": "Leistungen",
   "Novità": "News",
   "Recensioni": "Bewertungen",
   "Prenota": "Buchen",
   "Contatti": "Kontakt",
   "Farmacia Tortorici, torna all'inizio": "Farmacia Tortorici, zurück zum Anfang",
   "Scrivici su WhatsApp": "Schreiben Sie uns auf WhatsApp",
   "Apri menu": "Menü öffnen",
   "← Torna alla home": "← Zurück zur Startseite",
   "Navigazione": "Navigation",
   "Telefono": "Telefon",
   "Indirizzo · Indicazioni": "Adresse · Anfahrt",
   "Titolare e direttore responsabile: Dott. Ivan Tortorici, iscritto all'Ordine dei Farmacisti della Provincia di Palermo, n. 2352": "Inhaber und verantwortlicher Leiter: Dr. Ivan Tortorici, eingetragen in der Apothekerkammer der Provinz Palermo, Nr. 2352",
   "Farmacia Dott. Ivan Tortorici · P.IVA 01488560820": "Farmacia Dott. Ivan Tortorici · USt-IdNr. 01488560820",
   "Preferenze cookie": "Cookie-Einstellungen",
   "Le informazioni presenti in questo sito hanno carattere informativo e non sostituiscono il parere del medico o del farmacista.": "Die Informationen auf dieser Website dienen nur der allgemeinen Orientierung und ersetzen nicht den Rat eines Arztes oder Apothekers.",
   "Usiamo solo cookie tecnici. Con il tuo consenso mostriamo anche la mappa di Google, che usa cookie di terze parti.": "Wir verwenden nur technische Cookies. Mit Ihrer Zustimmung zeigen wir auch die Google-Karte an, die Cookies von Drittanbietern verwendet.",
   "Rifiuta": "Ablehnen",
   "Accetta": "Akzeptieren",
   "Chiudi e rifiuta": "Schließen und ablehnen",
   "Canale WhatsApp": "WhatsApp-Kanal",
   "Venerdì 6/11": "Fr. 6.11.",
   "Incontro su sport e nutrizione": "Vortrag über Sport und Ernährung",
   "Prenota il calendario 2027": "Den Kalender 2027 reservieren",
   "La tua salute,": "Ihre Gesundheit,",
   "buone mani": "guten Händen",
   "Da tanti anni la Farmacia del Dott. Ivan Tortorici è un punto di riferimento per le famiglie di Trabia: consiglio professionale, servizi di prevenzione e un assortimento curato per ogni esigenza.": "Seit vielen Jahren ist die Apotheke von Dr. Ivan Tortorici eine feste Anlaufstelle für die Familien in Trabia: fachkundige Beratung, Vorsorgeleistungen und ein sorgfältig ausgewähltes Sortiment für jeden Bedarf.",
   "Chiama ora": "Jetzt anrufen",
   "Prenota su WhatsApp": "Auf WhatsApp buchen",
   "Iscriviti al canale": "Dem Kanal beitreten",
   "Assistenza a domicilio": "Betreuung zu Hause",
   "Parcheggio facile": "Einfaches Parken",
   "Accesso per persone con disabilità": "Barrierefreier Zugang",
   "Tocca per la foto vera": "Tippen für das echte Foto",
   "Tocca per il fumetto": "Tippen für den Comic",
   "Mostra la foto vera del team": "Echtes Foto des Teams zeigen",
   "Mostra il fumetto del team": "Comic des Teams zeigen",
   "Il nostro team, sempre al tuo fianco": "Unser Team, immer an Ihrer Seite",
   "Risposta della farmacia": "Antwort der Apotheke",
   "Lo staff della Farmacia Tortorici di Trabia, illustrato in stile animazione": "Das Team der Farmacia Tortorici in Trabia, im Animationsstil gezeichnet",
   "Foto dello staff della Farmacia Tortorici di Trabia": "Foto des Teams der Farmacia Tortorici in Trabia",
   "Orario di oggi": "Heutige Öffnungszeiten",
   "Oggi": "Heute",
   "I nostri punti di forza": "Unsere Stärken",
   "Accessibile a tutti": "Für alle zugänglich",
   "Holter in convenzione": "Holter mit Kassenleistung",
   "Consiglio personalizzato": "Persönliche Beratung",
   "Evento · Venerdì 6 novembre": "Veranstaltung · Freitag, 6. November",
   "Illustrazione: un dito con una goccia di sangue": "Illustration: ein Finger mit einem Blutstropfen",
   "Gratis": "Gratis",
   "Giornata della salute · Mercoledì 11 novembre": "Gesundheitstag · Mittwoch, 11. November",
   "Emoglobina glicata gratuita": "Kostenloser HbA1c-Test",
   "Mercoledì 11 novembre, in farmacia, puoi fare": "Am Mittwoch, 11. November, können Sie in der Apotheke",
   "gratuitamente": "kostenlos",
   "l'esame dell'emoglobina glicata.": "Ihren HbA1c-Wert (Langzeitblutzucker) messen lassen.",
   "L'emoglobina glicata (HbA1c) indica la media della glicemia degli ultimi 2-3 mesi: è un esame utile per la prevenzione e per tenere sotto controllo il diabete. Basta una goccia di sangue dal dito.": "Der HbA1c-Wert zeigt den durchschnittlichen Blutzucker der letzten 2–3 Monate: ein nützlicher Test zur Vorbeugung und zur Kontrolle von Diabetes. Es genügt ein Blutstropfen aus dem Finger.",
   "Mercoledì 11 novembre, mattina e pomeriggio": "Mittwoch, 11. November, vormittags und nachmittags",
   "Farmacia Tortorici, Via Ettore Maiorana 27, Trabia": "Farmacia Tortorici, Via Ettore Maiorana 27, Trabia",
   "Costo": "Kosten",
   "Gratuito, su prenotazione": "Kostenlos, mit Anmeldung",
   "Mercoledì 11/11": "Mittwoch 11.11.",
   "Emoglobina glicata gratis": "HbA1c-Test gratis",
   "Allenamento, nutrizione ed integrazione": "Training, Ernährung und Nahrungsergänzung",
   "Sei uno sportivo? Oppure vuoi curare la tua alimentazione per iniziare a fare sport? Questo incontro è per te.": "Treiben Sie Sport? Oder möchten Sie Ihre Ernährung verbessern, um mit dem Sport anzufangen? Dieser Vortrag ist für Sie.",
   "Il": "",
   "Dott. Valerio Papa": "Dr. Valerio Papa",
   ", biologo nutrizionista ed Enervit nutrition specialist, ti darà strategie e consigli pratici per gestire al meglio l'energia, il recupero e la performance sportiva.": ", Ernährungsbiologe und Enervit Nutrition Specialist, gibt Ihnen Strategien und praktische Tipps, um Energie, Erholung und sportliche Leistung optimal zu steuern.",
   "La partecipazione è gratuita e non prevede vendita di prodotti.": "Die Teilnahme ist kostenlos, es werden keine Produkte verkauft.",
   "Quando": "Wann",
   "Venerdì 6 novembre, dalle ore 18.00": "Freitag, 6. November, ab 18 Uhr",
   "Dove": "Wo",
   "Ambulatorio medico accanto alla farmacia, Via Ettore Maiorana 26, Trabia": "Arztpraxis neben der Apotheke, Via Ettore Maiorana 26, Trabia",
   "Prenotazioni": "Anmeldung",
   "Chiama e prenota": "Anrufen und anmelden",
   "Evento svolto": "Vergangene Veranstaltung",
   "Evento della Farmacia Tortorici svolto in data venerdì 6 novembre 2026": "Veranstaltung der Farmacia Tortorici am Freitag, 6. November 2026",
   "Evento della Farmacia Tortorici svolto in data mercoledì 11 novembre 2026": "Veranstaltung der Farmacia Tortorici am Mittwoch, 11. November 2026",
   "Locandina dell'incontro Enervit: Allenamento, nutrizione ed integrazione. Venerdì 6 novembre dalle ore 18.00 presso la Farmacia Tortorici. Relatore Dott. Valerio Papa": "Plakat des Enervit-Vortrags: Training, Ernährung und Nahrungsergänzung. Freitag, 6. November ab 18 Uhr in der Farmacia Tortorici. Referent Dr. Valerio Papa",
   "Novità · Calendario 2027": "Neu · Kalender 2027",
   "Il nostro calendario 2027 ti aspetta!": "Unser Kalender 2027 wartet auf Sie!",
   "Ci siamo fumettizzati per te: il nostro calendario di qualità con tante utili informazioni e spazio per scrivere appunti e ricorrenze. Prenota la tua copia e ritirala in farmacia.": "Wir haben uns für Sie in Comicfiguren verwandelt: unser hochwertiger Kalender mit vielen nützlichen Informationen und Platz für Notizen und Jahrestage. Reservieren Sie Ihr Exemplar und holen Sie es in der Apotheke ab.",
   "Chiama": "Anrufen",
   "Anteprima del calendario 2027 della Farmacia Tortorici, pagina di gennaio": "Vorschau des Kalenders 2027 der Farmacia Tortorici, Januarseite",
   "Molto apprezzata dai clienti": "Von Kunden sehr geschätzt",
   "per competenza e cortesia": "für Kompetenz und Freundlichkeit",
   "Attenti alle tue esigenze.": "Wir achten auf Ihre Bedürfnisse.",
   "Crediamo in un rapporto diretto con chi entra: ascoltare, consigliare, seguire nel tempo.": "Wir glauben an eine direkte Beziehung zu allen, die zu uns kommen: zuhören, beraten und langfristig begleiten.",
   "Da tanti anni ampliamo i nostri servizi mantenendo la stessa idea di partenza: ogni persona ha esigenze diverse. Per questo selezioniamo con attenzione alimenti speciali, dermocosmesi, prodotti ortopedici e veterinari, e offriamo controlli e screening direttamente in farmacia.": "Seit vielen Jahren erweitern wir unsere Leistungen und bleiben dabei unserer Grundidee treu: Jeder Mensch hat andere Bedürfnisse. Deshalb wählen wir Spezialnahrung, Hautpflege, orthopädische und tierärztliche Produkte sorgfältig aus und bieten Kontrollen und Screenings direkt in der Apotheke an.",
   "Siamo facilmente raggiungibili, con comodo parcheggio e accesso agevole per le persone con disabilità. E se non puoi venire in farmacia, ti assistiamo a domicilio.": "Wir sind leicht erreichbar, mit bequemen Parkplätzen und barrierefreiem Zugang für Menschen mit Behinderung. Und wenn Sie nicht in die Apotheke kommen können, betreuen wir Sie zu Hause.",
   "— Dott. Ivan Tortorici e lo staff": "— Dr. Ivan Tortorici und das Team",
   "Sigillo della Farmacia Dott. Ivan Tortorici, Trabia (PA)": "Siegel der Farmacia Dott. Ivan Tortorici, Trabia (PA)",
   "Cosa possiamo fare per te": "Was wir für Sie tun können",
   "Oltre alla dispensazione di farmaci con e senza ricetta, offriamo servizi pensati per semplificarti la vita.": "Neben verschreibungspflichtigen und rezeptfreien Arzneimitteln bieten wir Leistungen, die Ihnen das Leben erleichtern.",
   "Convenzionato SSN": "Kassenleistung",
   "Holter cardiaco e pressorio": "Langzeit-EKG und Langzeit-Blutdruckmessung (Holter)",
   "In convenzione con il SSN con la ricetta del medico di base, oppure anche senza ricetta, a pagamento. Prenoti in farmacia, al telefono o": "Mit Rezept Ihres Hausarztes als Leistung des italienischen Gesundheitsdienstes, oder auch ohne Rezept gegen Bezahlung. Buchung in der Apotheke, telefonisch oder",
   "su WhatsApp": "über WhatsApp",
   "Screening in farmacia": "Screening in der Apotheke",
   "Quadro lipidico completo, emoglobina glicata, glicemia, PSA e vitamina D con una goccia di sangue dal dito: indolore e in pochi minuti.": "Vollständiges Lipidprofil, HbA1c, Blutzucker, PSA und Vitamin D aus einem Tropfen Blut aus der Fingerkuppe: schmerzlos und in wenigen Minuten.",
   "SOF test gratuito": "Kostenloser Stuhltest",
   "Hai tra 50 e 69 anni? Ritira in farmacia, quando vuoi e senza attese, il kit gratuito per lo screening del colon-retto.": "Sind Sie zwischen 50 und 69 Jahre alt? Holen Sie das kostenlose Testset zur Darmkrebsvorsorge jederzeit und ohne Wartezeit in der Apotheke ab.",
   "Giornate della salute": "Gesundheitstage",
   "Screening per la prevenzione con specialisti in farmacia: esame per la densità ossea, screening senologico, consulenze dermocosmetiche personalizzate, consigli alimentari. Su prenotazione.": "Vorsorge-Screenings mit Fachärzten in der Apotheke: Knochendichtemessung, Brustkrebs-Screening, persönliche Hautpflegeberatung, Ernährungsberatung. Nach Terminvereinbarung.",
   "Pressione ed ECG": "Blutdruck und EKG",
   "Misurazione della pressione arteriosa ed elettrocardiogramma in farmacia, rapidi e vicino a casa.": "Blutdruckmessung und Elektrokardiogramm in der Apotheke, schnell und in Ihrer Nähe.",
   "Foratura dei lobi": "Ohrlochstechen",
   "In modo indolore e in ambiente igienicamente sicuro, con materiali ipoallergenici e molto gradevoli.": "Schmerzfrei und in hygienisch sicherer Umgebung, mit hypoallergenen und sehr schönen Materialien.",
   "Assistenza a domicilio gratuita": "Kostenlose Betreuung zu Hause",
   "Chi non può venire in farmacia non resta solo: chiamaci o": "Wer nicht in die Apotheke kommen kann, ist nicht allein: Rufen Sie uns an oder",
   "scrivici su WhatsApp": "schreiben Sie uns auf WhatsApp",
   "e ti assistiamo direttamente a casa, gratuitamente.": "– wir betreuen Sie kostenlos direkt zu Hause.",
   "Alimenti": "Spezialnahrung",
   "Alimenti speciali per intolleranze, celiachia ed esigenze particolari, disponibili o ordinabili.": "Spezialnahrung bei Unverträglichkeiten, Zöliakie und besonderen Bedürfnissen, vorrätig oder bestellbar.",
   "Dermocosmesi": "Hautpflege",
   "Prodotti selezionati per la cura della pelle, del viso e del corpo, con il consiglio giusto per te.": "Ausgewählte Produkte für die Pflege von Haut, Gesicht und Körper, mit der passenden Beratung für Sie.",
   "Prodotti ortopedici": "Orthopädische Produkte",
   "Tutori e ausili ortopedici per il benessere e il recupero di ogni giorno.": "Bandagen und orthopädische Hilfsmittel für Wohlbefinden und Erholung im Alltag.",
   "Prodotti per sportivi": "Sportprodukte",
   "Prodotti per chi fa sport, con il consiglio giusto per te.": "Produkte für Sportlerinnen und Sportler, mit der passenden Beratung für Sie.",
   "Veterinaria": "Tiergesundheit",
   "Farmaci, alimenti e prodotti per la salute dei tuoi animali, anche su ricetta veterinaria.": "Arzneimittel, Futter und Gesundheitsprodukte für Ihre Haustiere, auch mit tierärztlichem Rezept.",
   "Devi pagare un ticket per visita ospedaliera?": "Müssen Sie eine Krankenhausgebühr (Ticket) bezahlen?",
   "Questo ed altro da noi.": "Das und mehr bei uns.",
   "Prenota in un tocco": "Mit einem Tippen buchen",
   "Cosa ti serve oggi?": "Was brauchen Sie heute?",
   "Tocca un pulsante: si apre": "Tippen Sie auf eine Schaltfläche:",
   "con il messaggio già scritto. Ti rispondiamo noi.": "öffnet sich mit der bereits geschriebenen Nachricht. Wir antworten Ihnen.",
   "Prenota l'Holter": "Holter buchen",
   "Con la ricetta del medico (SSN) o anche senza, a pagamento.": "Mit ärztlichem Rezept (Kassenleistung) oder auch ohne, gegen Bezahlung.",
   "Scrivici su WhatsApp →": "Schreiben Sie uns auf WhatsApp →",
   "Prenota uno screening": "Screening buchen",
   "Colesterolo, glicata, glicemia, PSA, vitamina D.": "Cholesterin, HbA1c, Blutzucker, PSA, Vitamin D.",
   "Ti assistiamo a casa, gratuitamente.": "Wir betreuen Sie kostenlos zu Hause.",
   "Chiedi un prodotto": "Nach einem Produkt fragen",
   "Ti diciamo se è disponibile.": "Wir sagen Ihnen, ob es verfügbar ist.",
   "Community · Canale WhatsApp": "Community · WhatsApp-Kanal",
   "Segui il canale Farmacia Tortorici Trabia": "Folgen Sie dem Kanal Farmacia Tortorici Trabia",
   "È gratis e non serve salvare il nostro numero: le novità della farmacia ti arrivano direttamente su WhatsApp, come su una bacheca sempre a portata di mano.": "Es ist kostenlos und Sie müssen unsere Nummer nicht speichern: Die Neuigkeiten der Apotheke kommen direkt auf WhatsApp, wie an einem Schwarzen Brett, das Sie immer dabeihaben.",
   "Di cosa parla": "Worum es geht",
   "Giornate della salute e screening": "Gesundheitstage und Screenings",
   "Eventi e incontri in farmacia": "Veranstaltungen und Vorträge in der Apotheke",
   "Avvisi su orari e chiusure": "Hinweise zu Öffnungszeiten und Schließungen",
   "Novità e consigli per la salute": "Neuigkeiten und Gesundheitstipps",
   "Segui il canale": "Kanal folgen",
   "Si apre WhatsApp: tocca «Segui».": "WhatsApp öffnet sich: Tippen Sie auf „Folgen“.",
   "Cos'è un canale WhatsApp?": "Was ist ein WhatsApp-Kanal?",
   "Solo i nostri aggiornamenti.": "Nur unsere Neuigkeiten.",
   "Non è un gruppo: niente chat e niente messaggi da altri iscritti.": "Es ist keine Gruppe: kein Chat und keine Nachrichten von anderen Abonnenten.",
   "Il tuo numero resta privato.": "Ihre Nummer bleibt privat.",
   "Né noi né gli altri iscritti possiamo vederlo.": "Weder wir noch andere Abonnenten können sie sehen.",
   "Smetti quando vuoi.": "Jederzeit beenden.",
   "Basta un tocco su «Non seguire più».": "Ein Tippen auf „Nicht mehr folgen“ genügt.",
   "Novità e video": "Neuigkeiten und Videos",
   "Dalla nostra pagina Facebook": "Von unserer Facebook-Seite",
   "Gli ultimi post della nostra pagina, aggiornati in automatico.": "Die neuesten Beiträge unserer Seite, automatisch aktualisiert.",
   "persone ci seguono su Facebook": "Personen folgen uns auf Facebook",
   "Seguici su Facebook": "Folgen Sie uns auf Facebook",
   "Seguici su TikTok": "Folgen Sie uns auf TikTok",
   "Seguici su Instagram": "Folgen Sie uns auf Instagram",
   "Guarda il video →": "Video ansehen →",
   "Leggi su Facebook →": "Auf Facebook lesen →",
   "Segui la nostra pagina Facebook per le ultime novità.": "Folgen Sie unserer Facebook-Seite für die neuesten Nachrichten.",
   "Attualità sanitaria": "Gesundheitsnachrichten",
   "Notizie dal mondo della salute": "Nachrichten aus der Welt der Gesundheit",
   "Le ultime notizie da Quotidiano Sanità e Farmacista33, scelte per te e aggiornate in automatico.": "Die neuesten Nachrichten von Quotidiano Sanità und Farmacista33 (auf Italienisch), für Sie ausgewählt und automatisch aktualisiert.",
   "Fonti:": "Quellen:",
   "e": "und",
   ". Gli articoli si aprono sul sito della testata.": ". Die Artikel öffnen sich auf der Website der Zeitung.",
   "Leggi →": "Lesen →",
   "Cosa dicono di noi": "Was man über uns sagt",
   "Dalle recensioni su Google.": "Aus unseren Google-Bewertungen.",
   "Leggi tutte le recensioni": "Alle Bewertungen lesen",
   "Lascia una recensione": "Bewertung abgeben",
   "Domande frequenti": "Häufige Fragen",
   "Hai un dubbio?": "Haben Sie eine Frage?",
   "Per tutto il resto, chiamaci o scrivici.": "Für alles andere rufen Sie uns an oder schreiben Sie uns.",
   "Come prenoto l'Holter cardiaco o pressorio?": "Wie buche ich ein Langzeit-EKG oder eine Langzeit-Blutdruckmessung?",
   "Con la ricetta del medico di base è in convenzione con il Servizio Sanitario Nazionale; si può fare anche senza ricetta, a pagamento. Prenoti chiamando lo 091 814 6207 o": "Mit Rezept Ihres Hausarztes ist es eine Leistung des italienischen Gesundheitsdienstes; es ist auch ohne Rezept gegen Bezahlung möglich. Buchung telefonisch unter 091 814 6207 oder",
   "scrivendo su WhatsApp al 331 525 0555": "per WhatsApp an 331 525 0555",
   "Fate anche l'ECG?": "Machen Sie auch EKGs?",
   "Sì: in farmacia facciamo l'elettrocardiogramma e la misurazione della pressione. Chiamaci per sapere i tempi.": "Ja: In der Apotheke machen wir Elektrokardiogramme und Blutdruckmessungen. Rufen Sie uns an, um die Termine zu erfahren.",
   "L'assistenza a domicilio ha un costo?": "Kostet die Betreuung zu Hause etwas?",
   "No, è gratuita. Chiamaci o": "Nein, sie ist kostenlos. Rufen Sie uns an oder",
   "scrivici su WhatsApp al 331 525 0555": "schreiben Sie uns auf WhatsApp an 331 525 0555",
   "e ti assistiamo direttamente a casa.": "– wir betreuen Sie direkt zu Hause.",
   "Serve la prenotazione per il controllo del colesterolo?": "Muss ich die Cholesterinmessung buchen?",
   "No, puoi passare quando vuoi. Con una goccia di sangue dal dito facciamo anche emoglobina glicata, glicemia, PSA e vitamina D.": "Nein, Sie können jederzeit vorbeikommen. Aus einem Tropfen Blut aus der Fingerkuppe messen wir auch HbA1c, Blutzucker, PSA und Vitamin D.",
   "Chi può ritirare il kit SOF test?": "Wer kann das Stuhltest-Set abholen?",
   "Chi ha tra 50 e 69 anni può ritirarlo gratuitamente in farmacia, quando vuole e senza attese.": "Alle zwischen 50 und 69 Jahren können es kostenlos in der Apotheke abholen, jederzeit und ohne Wartezeit.",
   "Siete aperti la domenica?": "Haben Sie sonntags geöffnet?",
   "Sì: la domenica dalle 9.00 alle 13.00. Dal lunedì al venerdì 8.30–13.00 e 16.15–19.45, il sabato 8.30–13.00 e 16.15–19.30.": "Ja: sonntags von 9:00 bis 13:00 Uhr. Montag bis Freitag 8:30–13:00 und 16:15–19:45 Uhr, Samstag 8:30–13:00 und 16:15–19:30 Uhr.",
   "Di notte o nei festivi a chi mi rivolgo?": "An wen wende ich mich nachts oder an Feiertagen?",
   "Alla farmacia di turno, con servizio a chiamata solo per farmaci urgenti. Il calendario dei turni è esposto sulle bacheche di tutte le farmacie.": "An die Notdienstapotheke, mit Rufbereitschaft nur für dringende Arzneimittel. Der Notdienstplan hängt an den Aushängen aller Apotheken.",
   "Nel cuore del nostro paese.": "Im Herzen unseres Ortes.",
   "Ci trovi in Via Ettore Maiorana 27, facilmente raggiungibili e con comodo parcheggio.": "Sie finden uns in der Via Ettore Maiorana 27, leicht erreichbar und mit bequemen Parkplätzen.",
   "Orari e come arrivare": "Öffnungszeiten und Anfahrt",
   "Veduta aerea di Trabia con il castello sul mare": "Luftaufnahme von Trabia mit der Burg am Meer",
   "Orari e contatti": "Öffnungszeiten und Kontakt",
   "Vieni a trovarci": "Besuchen Sie uns",
   "Via Ettore Maiorana 27. Parcheggio facile e accesso per persone con disabilità.": "Via Ettore Maiorana 27. Einfaches Parken und barrierefreier Zugang.",
   "Orario di apertura": "Öffnungszeiten",
   "Orari settimanali": "Wöchentliche Öffnungszeiten",
   "Lunedì": "Montag",
   "Martedì": "Dienstag",
   "Mercoledì": "Mittwoch",
   "Giovedì": "Donnerstag",
   "Venerdì": "Freitag",
   "Sabato": "Samstag",
   "Domenica": "Sonntag",
   "Chiuso": "Geschlossen",
   "Nei giorni festivi e nei turni gli orari possono variare. Gli avvisi aggiornati sono sulla nostra bacheca.": "An Feiertagen und Notdiensttagen können die Öffnungszeiten abweichen. Aktuelle Hinweise finden Sie an unserem Aushang.",
   "Indicazioni stradali": "Route berechnen",
   "Mostra la mappa qui": "Karte hier anzeigen",
   "La mappa è fornita da Google e usa cookie di terze parti.": "Die Karte wird von Google bereitgestellt und verwendet Cookies von Drittanbietern.",
   "Mappa: Farmacia Tortorici, Via Ettore Maiorana 27, Trabia": "Karte: Farmacia Tortorici, Via Ettore Maiorana 27, Trabia",
   "Cerchi la farmacia di turno?": "Suchen Sie die Notdienstapotheke?",
   "Di notte e nei festivi il servizio a chiamata, solo per farmaci urgenti, è garantito a rotazione dalle farmacie della zona. Il calendario dei turni è esposto sulle bacheche di tutte le farmacie.": "Nachts und an Feiertagen wird ein Rufbereitschaftsdienst nur für dringende Arzneimittel abwechselnd von den Apotheken der Umgebung angeboten. Der Notdienstplan hängt an den Aushängen aller Apotheken.",
   "Chiamaci": "Rufen Sie uns an",
   "Farmacie di turno · sito ufficiale": "Notdienstapotheken · offizielle Website",
   "Vedi le farmacie di turno sul sito ufficiale dell'Ordine dei Farmacisti di Palermo →": "Notdienstapotheken auf der offiziellen Website der Apothekerkammer Palermo ansehen →",
   "Le vostre": "Ihre",
   "parole": "Worte",
   "Grazie a tutti i clienti che hanno lasciato un'opinione sulla nostra farmacia. Qui trovi le recensioni pubblicate su Google, così come sono state scritte.": "Danke an alle Kundinnen und Kunden, die ihre Meinung über unsere Apotheke geteilt haben. Hier finden Sie die auf Google veröffentlichten Bewertungen, so wie sie geschrieben wurden (auf Italienisch).",
   "Ti siamo stati utili?": "Konnten wir Ihnen helfen?",
   "Raccontaci la tua esperienza: aiuta altre famiglie di Trabia a conoscerci. Bastano 30 secondi.": "Erzählen Sie uns von Ihrer Erfahrung: So lernen uns auch andere Familien in Trabia kennen. Es dauert nur 30 Sekunden.",
   "Scegli le stelle e scrivi due parole": "Sterne wählen und ein paar Worte schreiben",
   "Lo staff la legge e la pubblica qui sul sito": "Unser Team liest sie und veröffentlicht sie hier auf der Website",
   "Preferisci Google? Lascia la recensione su Google →": "Lieber Google? Bewertung auf Google abgeben →",
   "Il tuo voto": "Ihre Wertung",
   "Tocca una stella": "Tippen Sie auf einen Stern",
   "Il tuo nome": "Ihr Name",
   "La tua recensione": "Ihre Bewertung",
   "Acconsento alla pubblicazione del nome e della recensione su questo sito. Non inserire dati sulla tua salute.": "Ich bin damit einverstanden, dass mein Name und meine Bewertung auf dieser Website veröffentlicht werden. Bitte keine Angaben zu Ihrer Gesundheit machen.",
   "Invia la recensione": "Bewertung senden",
   "Invio…": "Wird gesendet…",
   "Puoi lasciare la tua recensione su": "Sie können Ihre Bewertung hinterlassen auf",
   "Grazie!": "Danke!",
   "Abbiamo ricevuto la tua recensione. Sarà visibile qui dopo la verifica dello staff.": "Wir haben Ihre Bewertung erhalten. Sie erscheint hier, sobald unser Team sie geprüft hat.",
   "Da approvare": "Zur Freigabe",
   "Personale gentile e preparato": "Freundliches, kompetentes Personal",
   "Tanto assortimento": "Große Auswahl",
   "Consigli su misura": "Individuelle Beratung",
   "Reparto cosmesi": "Kosmetikabteilung",
   "Leggi tutte le recensioni su Google": "Alle Bewertungen auf Google lesen",
   "Lascia la tua recensione": "Ihre Bewertung abgeben",
   "1 stella": "1 Stern",
   "Es. Maria R.": "z. B. Maria R.",
   "Com'è andata? Cosa ti è piaciuto?": "Wie war es? Was hat Ihnen gefallen?",
   "Recensioni da approvare": "Bewertungen zur Freigabe",
   "Distribuzione delle valutazioni": "Verteilung der Bewertungen",
   "Recensione dal sito": "Bewertung von unserer Website",
   "Eccellente": "Ausgezeichnet",
   "Buona": "Gut",
   "Nella media": "Durchschnittlich",
   "Scarsa": "Schlecht",
   "Pessima": "Sehr schlecht",
   "Scegli da 1 a 5 stelle.": "Wählen Sie 1 bis 5 Sterne.",
   "Scrivi il tuo nome (anche solo nome e iniziale del cognome).": "Schreiben Sie Ihren Namen (Vorname und Anfangsbuchstabe des Nachnamens genügen).",
   "Scrivi almeno qualche parola sulla tua esperienza.": "Schreiben Sie wenigstens ein paar Worte über Ihre Erfahrung.",
   "Per pubblicarla serve il tuo consenso.": "Zur Veröffentlichung brauchen wir Ihre Zustimmung.",
   "Non siamo riusciti a inviarla. Riprova tra poco.": "Senden fehlgeschlagen. Bitte versuchen Sie es gleich noch einmal.",
   "Scrivi il tuo nome (2-40 caratteri).": "Schreiben Sie Ihren Namen (2–40 Zeichen).",
   "La recensione deve avere tra 10 e 600 caratteri.": "Die Bewertung muss zwischen 10 und 600 Zeichen lang sein.",
   "Serve il consenso alla pubblicazione.": "Die Zustimmung zur Veröffentlichung ist erforderlich.",
   "Per favore non inserire link.": "Bitte keine Links einfügen.",
   "Hai già inviato diverse recensioni oggi. Riprova domani.": "Sie haben heute schon mehrere Bewertungen gesendet. Bitte versuchen Sie es morgen noch einmal.",
   "Privacy · Farmacia Tortorici": "Datenschutz · Farmacia Tortorici",
   "Cookie · Farmacia Tortorici": "Cookies · Farmacia Tortorici",
   "Recensioni · Farmacia Tortorici": "Bewertungen · Farmacia Tortorici",
   "Farmacia Dott. Ivan Tortorici a Trabia (PA), Via Ettore Maiorana 27. Holter in convenzione, screening, dermocosmesi, veterinaria, assistenza a domicilio gratuita. Tel. 091 814 6207.": "Farmacia Dott. Ivan Tortorici in Trabia (PA), Via Ettore Maiorana 27. Holter als Kassenleistung, Screenings, Hautpflege, Tiergesundheit, kostenlose Betreuung zu Hause. Tel. +39 091 814 6207.",
   "Le recensioni dei clienti della Farmacia Dott. Ivan Tortorici a Trabia (PA).": "Kundenbewertungen der Farmacia Dott. Ivan Tortorici in Trabia (PA)."
  };
  var D = lang === "de" ? DE : EN;

  var L = {
    en: { giorni: { "lunedì": "Monday", "martedì": "Tuesday", "mercoledì": "Wednesday", "giovedì": "Thursday", "venerdì": "Friday", "sabato": "Saturday", "domenica": "Sunday" },
          mesi: { gen: "Jan", feb: "Feb", mar: "Mar", apr: "Apr", mag: "May", giu: "Jun", lug: "Jul", ago: "Aug", set: "Sep", ott: "Oct", nov: "Nov", dic: "Dec" },
          oggi: "Today, ", aperto: "Open now · closes at ", chiuso: "Closed now", riapre: "Closed now · reopens ", domani: "tomorrow", il: "on ", alle: " at ",
          recG: " Google reviews", recSuG: " reviews on Google", stelleSu5: function (n) { return n + " out of 5 stars"; }, stelle: " stars",
          altre: function (n) { return "Another " + n + " people left a rating without a comment: they are included in the average."; },
          data: function (g, m, y) { return m + " " + g + (y ? "," + y : ""); },
          soloIt: "This page is available in Italian only. For any questions, please contact us." },
    de: { giorni: { "lunedì": "Montag", "martedì": "Dienstag", "mercoledì": "Mittwoch", "giovedì": "Donnerstag", "venerdì": "Freitag", "sabato": "Samstag", "domenica": "Sonntag" },
          mesi: { gen: "Jan.", feb: "Feb.", mar: "März", apr: "Apr.", mag: "Mai", giu: "Juni", lug: "Juli", ago: "Aug.", set: "Sept.", ott: "Okt.", nov: "Nov.", dic: "Dez." },
          oggi: "Heute, ", aperto: "Jetzt geöffnet · schließt um ", chiuso: "Jetzt geschlossen", riapre: "Jetzt geschlossen · öffnet ", domani: "morgen", il: "am ", alle: " um ",
          recG: " Google-Bewertungen", recSuG: " Bewertungen auf Google", stelleSu5: function (n) { return n + " von 5 Sternen"; }, stelle: " Sterne",
          altre: function (n) { return "Weitere " + n + " Personen haben nur eine Wertung ohne Kommentar abgegeben: Sie sind im Durchschnitt enthalten."; },
          data: function (g, m, y) { return g + ". " + m + (y || ""); },
          soloIt: "Diese Seite ist nur auf Italienisch verfügbar. Bei Fragen kontaktieren Sie uns bitte." }
  }[lang];
  var GIORNI = L.giorni, MESI = L.mesi;
  var ora = function (h, m) { return h + ":" + m; };
  var R = [
    [/^Oggi, (\S+)$/, function (_, g) { return L.oggi + (GIORNI[g] || g); }],
    [/^Aperto ora · chiude alle (\d\d)\.(\d\d)$/, function (_, h, m) { return L.aperto + ora(h, m); }],
    [/^Chiuso ora · riapre (\S+) alle (\d\d)\.(\d\d)$/, function (_, g, h, m) { return L.riapre + (g === "domani" ? L.domani : g === "oggi" ? (lang === "de" ? "heute" : "today") : L.il + (GIORNI[g] || g)) + L.alle + ora(h, m); }],
    [/^Chiuso ora$/, function () { return L.chiuso; }],
    [/^(\d+) recensioni Google$/, function (_, n) { return n + L.recG; }],
    [/^(\d+) recensioni su Google$/, function (_, n) { return n + L.recSuG; }],
    [/^(\d) stelle su 5$/, function (_, n) { return L.stelleSu5(n); }],
    [/^(\d) stelle$/, function (_, n) { return n + L.stelle; }],
    [/^Altre (\d+) persone hanno lasciato solo una valutazione senza commento: sono incluse nella media\.$/, function (_, n) { return L.altre(n); }],
    [/^(\d{1,2}) (gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic)( \d{4})?$/, function (_, g, m, y) { return L.data(g, MESI[m], y); }],
    [/^(\d{1,2}) (gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic)\.?$/, function (_, g, m) { return L.data(g, MESI[m]); }]
  ];

  function traduci(s) {
    var k = s.replace(/\s+/g, " ").trim();
    if (!k) return null;
    if (Object.prototype.hasOwnProperty.call(D, k)) return D[k];
    for (var i = 0; i < R.length; i++) if (R[i][0].test(k)) return k.replace(R[i][0], R[i][1]);
    return null;
  }

  var ATTR = ["alt", "aria-label", "placeholder", "title"];
  var SALTA = ".lang-dd,.ast,#meteo,#curiosita,script,style,#fb-feed .fb-post strong,#fb-feed .fb-body,#news-list strong,blockquote,.rv-text,.r-text,q";

  function nodo(n) {
    if (n.nodeType === 3) {
      var p = n.parentElement;
      if (!p || p.closest(SALTA)) return;
      var t = traduci(n.nodeValue);
      if (t !== null && t !== n.nodeValue.trim()) {
        var pre = n.nodeValue.match(/^\s*/)[0], post = n.nodeValue.match(/\s*$/)[0];
        n.nodeValue = pre + t + (t ? post : "");
      }
    } else if (n.nodeType === 1) {
      if (n.matches && n.matches("script,style")) return;
      for (var i = 0; i < ATTR.length; i++) {
        var v = n.getAttribute && n.getAttribute(ATTR[i]);
        if (v) { var tv = traduci(v); if (tv !== null && tv !== v) n.setAttribute(ATTR[i], tv); }
      }
      var w = document.createTreeWalker(n, 5, null), x;
      while ((x = w.nextNode())) if (x !== n) nodo(x);
    }
  }

  function legale() {
    if (!/\/(privacy|cookie)\.html$/.test(location.pathname)) return;
    var m = document.querySelector("main");
    if (!m || document.getElementById("only-it")) return;
    var d = document.createElement("p");
    d.id = "only-it"; d.className = "only-it";
    d.textContent = L.soloIt;
    m.insertBefore(d, m.firstChild);
  }

  function avvia() {
    var t = traduci(document.title); if (t) document.title = t;
    var md = document.querySelector('meta[name="description"]');
    if (md) { var td = traduci(md.content); if (td) md.content = td; }
    legale();
    nodo(document.body);
    aggiungiPulsante();
    new MutationObserver(function (ms) {
      ms.forEach(function (m) {
        if (m.type === "characterData") nodo(m.target);
        else if (m.type === "attributes") nodo(m.target);
        else m.addedNodes.forEach(nodo);
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTR });
    document.documentElement.classList.remove("i18n-wait");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", avvia);
  else avvia();
})();
