/* Versione inglese del sito — Farmacia Tortorici
   Il sito è scritto in italiano (lingua predefinita). Con il pulsante EN in alto
   i testi vengono sostituiti con la traduzione qui sotto; la scelta resta salvata nel browser.
   Se un testo italiano viene modificato e non ha ancora la traduzione, resta in italiano.
   I contenuti scritti da altri (post Facebook, recensioni, notizie) restano in originale. */
(function () {
  var KEY = "ft-lingua";
  var q = (location.search.match(/[?&]lang=(it|en)\b/) || [])[1];
  var lang = q || (function () { try { return localStorage.getItem(KEY); } catch (e) { return null; } })() || "it";
  if (q) { try { localStorage.setItem(KEY, q); } catch (e) {} }
  window.LINGUA = lang;

  function cambia(l) {
    try { localStorage.setItem(KEY, l); } catch (e) {}
    location.href = location.pathname + (l === "en" ? "?lang=en" : "?lang=it") + location.hash;
  }

  function aggiungiPulsante() {
    var cta = document.querySelector(".nav-cta");
    if (!cta || document.getElementById("lang-btn")) return;
    var b = document.createElement("button");
    b.type = "button"; b.id = "lang-btn"; b.className = "lang-btn";
    b.textContent = lang === "en" ? "IT" : "EN";
    b.setAttribute("aria-label", lang === "en" ? "Passa all'italiano" : "Switch to English");
    b.setAttribute("lang", lang === "en" ? "it" : "en");
    b.onclick = function () { cambia(lang === "en" ? "it" : "en"); };
    var burger = cta.querySelector(".burger");
    cta.insertBefore(b, burger || null);
  }

  if (lang !== "en") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", aggiungiPulsante);
    else aggiungiPulsante();
    return;
  }

  document.documentElement.lang = "en";
  document.documentElement.classList.add("i18n-wait");
  setTimeout(function () { document.documentElement.classList.remove("i18n-wait"); }, 1500);

  var D = {
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
    "Assistenza a domicilio": "Home assistance",
    "Parcheggio facile": "Easy parking",
    "Accesso per persone con disabilità": "Accessible for people with disabilities",
    "Tocca per la foto vera": "Tap for the real photo",
    "Tocca per il fumetto": "Tap for the cartoon",
    "Mostra la foto vera del team": "Show the real photo of the team",
    "Mostra il fumetto del team": "Show the cartoon of the team",
    "Il nostro team, sempre al tuo fianco": "Our team, always by your side",
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
    "In convenzione con il SSN con la ricetta del medico di base, oppure anche senza ricetta, a pagamento. Prenoti in farmacia, al telefono o su WhatsApp.": "Covered by the Italian NHS with a prescription from your GP, or also without a prescription for a fee. Book at the pharmacy, by phone or on WhatsApp.",
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
    "Chi non può venire in farmacia non resta solo: chiamaci o scrivici su WhatsApp e ti assistiamo direttamente a casa, gratuitamente.": "If you can't come to the pharmacy, you're not on your own: call us or message us on WhatsApp and we'll assist you at home, free of charge.",
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
    "Tocca un pulsante: si apre WhatsApp con il messaggio già scritto. Ti rispondiamo noi.": "Tap a button: WhatsApp opens with the message already written. We'll get back to you.",
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
    "Con la ricetta del medico di base è in convenzione con il Servizio Sanitario Nazionale; si può fare anche senza ricetta, a pagamento. Prenoti chiamando lo 091 814 6207 o scrivendo su WhatsApp al 331 525 0555.": "With a prescription from your GP it is covered by the Italian National Health Service; you can also have it without a prescription, for a fee. Book by calling 091 814 6207 or on WhatsApp at 331 525 0555.",
    "Fate anche l'ECG?": "Do you also do ECGs?",
    "Sì: in farmacia facciamo l'elettrocardiogramma e la misurazione della pressione. Chiamaci per sapere i tempi.": "Yes: we do electrocardiograms and blood pressure measurement at the pharmacy. Call us to check availability.",
    "L'assistenza a domicilio ha un costo?": "Is there a charge for home assistance?",
    "No, è gratuita. Chiamaci o scrivici su WhatsApp al 331 525 0555 e ti assistiamo direttamente a casa.": "No, it's free. Call us or message us on WhatsApp at 331 525 0555 and we'll assist you at home.",
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

  var GIORNI = { "lunedì": "Monday", "martedì": "Tuesday", "mercoledì": "Wednesday", "giovedì": "Thursday", "venerdì": "Friday", "sabato": "Saturday", "domenica": "Sunday" };
  var MESI = { gen: "Jan", feb: "Feb", mar: "Mar", apr: "Apr", mag: "May", giu: "Jun", lug: "Jul", ago: "Aug", set: "Sep", ott: "Oct", nov: "Nov", dic: "Dec" };
  var ora = function (h, m) { return h + ":" + m; };
  var R = [
    [/^Oggi, (\S+)$/, function (_, g) { return "Today, " + (GIORNI[g] || g); }],
    [/^Aperto ora · chiude alle (\d\d)\.(\d\d)$/, function (_, h, m) { return "Open now · closes at " + ora(h, m); }],
    [/^Chiuso ora · riapre (\S+) alle (\d\d)\.(\d\d)$/, function (_, g, h, m) { return "Closed now · reopens " + (g === "domani" ? "tomorrow" : "on " + (GIORNI[g] || g)) + " at " + ora(h, m); }],
    [/^Chiuso ora$/, function () { return "Closed now"; }],
    [/^(\d+) recensioni Google$/, function (_, n) { return n + " Google reviews"; }],
    [/^(\d+) recensioni su Google$/, function (_, n) { return n + " reviews on Google"; }],
    [/^(\d) stelle su 5$/, function (_, n) { return n + " out of 5 stars"; }],
    [/^(\d) stelle$/, function (_, n) { return n + " stars"; }],
    [/^Altre (\d+) persone hanno lasciato solo una valutazione senza commento: sono incluse nella media\.$/, function (_, n) { return "Another " + n + " people left a rating without a comment: they are included in the average."; }],
    [/^(\d{1,2}) (gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic)( \d{4})?$/, function (_, g, m, y) { return MESI[m] + " " + g + (y ? "," + y : ""); }],
    [/^(\d{1,2}) (gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic)\.?$/, function (_, g, m) { return MESI[m] + " " + g; }]
  ];

  function traduci(s) {
    var k = s.replace(/\s+/g, " ").trim();
    if (!k) return null;
    if (Object.prototype.hasOwnProperty.call(D, k)) return D[k];
    for (var i = 0; i < R.length; i++) if (R[i][0].test(k)) return k.replace(R[i][0], R[i][1]);
    return null;
  }

  var ATTR = ["alt", "aria-label", "placeholder", "title"];
  var SALTA = "script,style,#fb-feed .fb-post strong,#fb-feed .fb-body,#news-list strong,blockquote,.rv-text,.r-text,q";

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
    d.textContent = "This page is available in Italian only. For any questions, please contact us.";
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
