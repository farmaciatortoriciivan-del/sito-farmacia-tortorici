/* Meteo e salute — Farmacia Tortorici
   Mostra le previsioni per Trabia (da /api/meteo) con consigli generali su come vestirsi
   e sulle precauzioni per la salute. I consigli sono calcolati con regole semplici dai dati del giorno. */
(function () {
  var box = document.getElementById("meteo");
  if (!box) return;
  var L = (window.LINGUA || "it");
  var T = {
    it: {
      eyebrow: "Meteo e salute", titolo: "Che tempo fa a Trabia",
      lead: "Le previsioni dei prossimi giorni, con qualche consiglio su come vestirsi e su come proteggere la salute.",
      adesso: "Adesso", percepita: "percepita", umidita: "umidità", vento: "vento", uv: "UV", pioggia: "pioggia",
      oggi: "Oggi", domani: "Domani",
      vestiti: "Come vestirsi oggi", salute: "Salute: le precauzioni di oggi",
      fonte: "Previsioni per Trabia da Open-Meteo, aggiornate ogni 30 minuti. Consigli generali: per un consiglio personalizzato chiedi al farmacista.",
      cod: { 0: "Sereno", 1: "Poco nuvoloso", 2: "Parzialmente nuvoloso", 3: "Nuvoloso", 45: "Nebbia", 51: "Pioviggine", 61: "Pioggia", 65: "Pioggia forte", 71: "Neve", 80: "Rovesci", 95: "Temporale" },
      v: {
        caldo: "Abiti leggeri e chiari, in cotone o lino, cappello e occhiali da sole.",
        tiepido: "Abbigliamento leggero: maglietta o camicia a maniche corte.",
        mite: "Maniche lunghe leggere; una felpa o un cardigan per la sera.",
        fresco: "Giacca leggera o maglione: meglio vestirsi a strati.",
        freddo: "Cappotto o giaccone, sciarpa e qualcosa per coprire la testa.",
        strati: "Forte differenza tra giorno e sera ({d}°): vestiti a strati.",
        ombrello: "Pioggia probabile ({p}%): porta l'ombrello o un impermeabile.",
        vento: "Vento sostenuto (fino a {v} km/h): meglio una giacca antivento."
      },
      s: {
        uvAlto: "Raggi UV alti (indice {u}): crema solare SPF 50, evita il sole tra le 11 e le 16, proteggi bambini e anziani.",
        uvMedio: "Raggi UV moderati (indice {u}): se stai all'aperto a lungo usa una crema solare SPF 30.",
        caldo: "Caldo intenso: bevi acqua spesso anche senza sete, mangia frutta e verdura ed evita le ore più calde. Chi prende farmaci per pressione o cuore chieda consiglio al farmacista.",
        freddo: "Temperature basse: proteggi naso e gola e attenzione agli sbalzi di temperatura tra casa e fuori.",
        influenza: "È stagione di raffreddori e influenza: lava spesso le mani e arieggia gli ambienti.",
        umido: "Umidità alta: chi soffre di dolori articolari o di problemi respiratori può sentirne di più gli effetti.",
        ventoSecco: "Con il vento gli occhi si seccano facilmente: le lacrime artificiali possono aiutare.",
        pollini: "Pollini {n} in aumento: chi soffre di allergia tenga a portata di mano i farmaci consigliati dal medico e chieda al farmacista.",
        aria: "Qualità dell'aria scadente: chi soffre di asma o problemi respiratori limiti gli sforzi all'aperto.",
        base: "Bevi almeno 1,5-2 litri di acqua al giorno e fai una passeggiata all'aria aperta."
      },
      pol: { grass: "delle graminacee", olive: "dell'olivo", birch: "della betulla", alder: "dell'ontano", mugwort: "dell'artemisia", ragweed: "dell'ambrosia" },
      giorni: ["dom", "lun", "mar", "mer", "gio", "ven", "sab"]
    },
    scn: {
      eyebrow: "Tempu e saluti", titolo: "Chi tempu fa a Trabbia",
      lead: "Lu tempu dî prossimi jorna, cu quarchi cunsigghiu supra comu vistìrisi e comu tèniri bona la saluti.",
      adesso: "Ora", percepita: "comu si senti", umidita: "umidità", vento: "ventu", uv: "UV", pioggia: "chiuvuta",
      oggi: "Oji", domani: "Dumani",
      vestiti: "Comu vistìrisi oji", salute: "Saluti: l'accorgimenti d'oji",
      fonte: "Tempu pi Trabbia di Open-Meteo, aggiurnatu ogni 30 minuti. Cunsigghi ginirali: pi un cunsigghiu fattu pi tia addumanna ô farmacista.",
      cod: { 0: "Serenu", 1: "Quasi serenu", 2: "Mezzu nuvulusu", 3: "Nuvulusu", 45: "Negghia", 51: "Stizziddìa", 61: "Chiovi", 65: "Chiovi forti", 71: "Nivi", 80: "Acquazzuni", 95: "Timpurali" },
      v: {
        caldo: "Robba lèggia e chiara, di cuttuni o linu, cappeddu e occhiali dû suli.",
        tiepido: "Robba lèggia: maglietta o cammisa a manichi curti.",
        mite: "Manichi longhi lèggi; na felpa o un golfinu pâ sira.",
        fresco: "Giacchetta lèggia o maglioni: megghiu vistìrisi a strati.",
        freddo: "Cappottu o giacconi, sciarpa e quarchi cosa pi cummigghiari la testa.",
        strati: "Granni diffirenza tra jornu e sira ({d}°): vestiti a strati.",
        ombrello: "Pò chiòviri ({p}%): pìgghiati lu paracqua o l'impirmiàbbili.",
        vento: "Ventu forti (finu a {v} km/h): megghiu na giacca contru lu ventu."
      },
      s: {
        uvAlto: "Raggi UV àuti (ìndici {u}): crema dû suli SPF 50, nun stari ô suli tra li 11 e li 16, prutiggi picciriddi e anziani.",
        uvMedio: "Raggi UV mudirati (ìndici {u}): si stai fora assai, usa na crema dû suli SPF 30.",
        caldo: "Càudu forti: vivi acqua spissu puru senza siti, mancia frutta e virdura e nun nesciri nta l'uri cchiù càudi. Cu pigghia farmaci pi la prissioni o pô cori addumannassi ô farmacista.",
        freddo: "Friddu: prutiggi nasu e gula e attentu ê sbalzi di timpiratura tra dintra e fora.",
        influenza: "È tempu di raffriddori e nfruenza: làvati spissu li manu e arìa li stanzi.",
        umido: "Umidità àuta: cu havi duluri ê junturi o prubblemi di rispiru la pò sèntiri cchiù assai.",
        ventoSecco: "Cu lu ventu l'occhi s'asciùcanu fàcili: li làcrimi artificiali ponnu aiutari.",
        pollini: "Pòllini {n} ca àumentanu: cu soffri d'allergìa tinissi a purtata di manu li farmaci ca ci cunsigghiau lu mèdicu e addumannassi ô farmacista.",
        aria: "Ària nun bona: cu soffri d'asma o di prubblemi di rispiru nun si stancassi troppu fora.",
        base: "Vivi armenu 1,5-2 litri d'acqua ô jornu e fatti na passiata a l'ària aperta."
      },
      pol: { grass: "dî graminaceî", olive: "di l'àulivu", birch: "dâ bètula", alder: "di l'àlanu", mugwort: "di l'erba bianca", ragweed: "di l'ambrosia" },
      giorni: ["dum", "lun", "mar", "mer", "jov", "ven", "sàb"]
    },
    en: {
      eyebrow: "Weather & health", titolo: "Weather in Trabia",
      lead: "The forecast for the next few days, with some tips on what to wear and how to look after your health.",
      adesso: "Now", percepita: "feels like", umidita: "humidity", vento: "wind", uv: "UV", pioggia: "rain",
      oggi: "Today", domani: "Tomorrow",
      vestiti: "What to wear today", salute: "Health: today's precautions",
      fonte: "Forecast for Trabia from Open-Meteo, updated every 30 minutes. General advice: for personal advice, ask the pharmacist.",
      cod: { 0: "Clear", 1: "Mostly clear", 2: "Partly cloudy", 3: "Cloudy", 45: "Fog", 51: "Drizzle", 61: "Rain", 65: "Heavy rain", 71: "Snow", 80: "Showers", 95: "Thunderstorm" },
      v: {
        caldo: "Light, light-coloured clothes in cotton or linen, a hat and sunglasses.",
        tiepido: "Light clothing: a T-shirt or short-sleeved shirt.",
        mite: "Light long sleeves; a sweatshirt or cardigan for the evening.",
        fresco: "A light jacket or jumper: layers are best.",
        freddo: "A coat, a scarf and something to cover your head.",
        strati: "Big difference between day and evening ({d}°): dress in layers.",
        ombrello: "Rain likely ({p}%): take an umbrella or a raincoat.",
        vento: "Strong wind (up to {v} km/h): a windproof jacket is a good idea."
      },
      s: {
        uvAlto: "High UV (index {u}): SPF 50 sunscreen, avoid the sun between 11am and 4pm, protect children and older people.",
        uvMedio: "Moderate UV (index {u}): if you're outdoors for long, use SPF 30 sunscreen.",
        caldo: "Intense heat: drink water often even if you're not thirsty, eat fruit and vegetables and avoid the hottest hours. If you take medicines for blood pressure or your heart, ask the pharmacist.",
        freddo: "Low temperatures: protect your nose and throat and watch out for sudden changes between indoors and outdoors.",
        influenza: "It's cold and flu season: wash your hands often and air your rooms.",
        umido: "High humidity: people with joint pain or breathing problems may feel it more.",
        ventoSecco: "Wind dries the eyes easily: artificial tears can help.",
        pollini: "{n} pollen rising: if you have allergies, keep the medicines your doctor recommended at hand and ask the pharmacist.",
        aria: "Poor air quality: people with asthma or breathing problems should limit outdoor exercise.",
        base: "Drink at least 1.5–2 litres of water a day and take a walk outdoors."
      },
      pol: { grass: "Grass", olive: "Olive", birch: "Birch", alder: "Alder", mugwort: "Mugwort", ragweed: "Ragweed" },
      giorni: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    },
    de: {
      eyebrow: "Wetter & Gesundheit", titolo: "Das Wetter in Trabia",
      lead: "Die Vorhersage für die nächsten Tage, mit Tipps zur passenden Kleidung und zum Schutz Ihrer Gesundheit.",
      adesso: "Jetzt", percepita: "gefühlt", umidita: "Luftfeuchte", vento: "Wind", uv: "UV", pioggia: "Regen",
      oggi: "Heute", domani: "Morgen",
      vestiti: "Was heute anziehen", salute: "Gesundheit: Vorsorge für heute",
      fonte: "Vorhersage für Trabia von Open-Meteo, alle 30 Minuten aktualisiert. Allgemeine Hinweise: Für eine persönliche Beratung fragen Sie den Apotheker.",
      cod: { 0: "Klar", 1: "Überwiegend klar", 2: "Teilweise bewölkt", 3: "Bewölkt", 45: "Nebel", 51: "Nieselregen", 61: "Regen", 65: "Starkregen", 71: "Schnee", 80: "Schauer", 95: "Gewitter" },
      v: {
        caldo: "Leichte, helle Kleidung aus Baumwolle oder Leinen, Hut und Sonnenbrille.",
        tiepido: "Leichte Kleidung: T-Shirt oder kurzärmeliges Hemd.",
        mite: "Leichte lange Ärmel; ein Pullover oder eine Strickjacke für den Abend.",
        fresco: "Leichte Jacke oder Pullover: am besten mehrere Schichten.",
        freddo: "Mantel, Schal und eine Kopfbedeckung.",
        strati: "Großer Unterschied zwischen Tag und Abend ({d}°): Zwiebelprinzip.",
        ombrello: "Regen wahrscheinlich ({p} %): Regenschirm oder Regenjacke mitnehmen.",
        vento: "Starker Wind (bis {v} km/h): eine winddichte Jacke ist sinnvoll."
      },
      s: {
        uvAlto: "Hohe UV-Strahlung (Index {u}): Sonnencreme LSF 50, Sonne zwischen 11 und 16 Uhr meiden, Kinder und ältere Menschen schützen.",
        uvMedio: "Mäßige UV-Strahlung (Index {u}): bei längerem Aufenthalt im Freien Sonnencreme LSF 30 verwenden.",
        caldo: "Große Hitze: oft Wasser trinken, auch ohne Durst, Obst und Gemüse essen und die heißesten Stunden meiden. Wer Medikamente für Blutdruck oder Herz nimmt, fragt bitte den Apotheker.",
        freddo: "Niedrige Temperaturen: Nase und Hals schützen und auf Temperaturwechsel zwischen drinnen und draußen achten.",
        influenza: "Erkältungs- und Grippezeit: häufig Hände waschen und Räume lüften.",
        umido: "Hohe Luftfeuchtigkeit: Menschen mit Gelenkschmerzen oder Atemproblemen spüren sie oft stärker.",
        ventoSecco: "Wind trocknet die Augen leicht aus: künstliche Tränen können helfen.",
        pollini: "{n}pollen nehmen zu: Allergiker sollten die vom Arzt empfohlenen Medikamente griffbereit haben und den Apotheker fragen.",
        aria: "Schlechte Luftqualität: Menschen mit Asthma oder Atemproblemen sollten Anstrengung im Freien begrenzen.",
        base: "Trinken Sie mindestens 1,5–2 Liter Wasser am Tag und gehen Sie an der frischen Luft spazieren."
      },
      pol: { grass: "Gräser", olive: "Oliven", birch: "Birken", alder: "Erlen", mugwort: "Beifuß", ragweed: "Ambrosia" },
      giorni: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
    }
  }[L] || null;
  if (!T) return;

  function gruppo(c) {
    if (c === 0) return 0; if (c === 1) return 1; if (c === 2) return 2; if (c === 3) return 3;
    if (c === 45 || c === 48) return 45; if (c >= 51 && c <= 57) return 51;
    if (c === 65 || c === 67 || c === 82) return 65; if (c >= 61 && c <= 67) return 61;
    if ((c >= 71 && c <= 77) || c === 85 || c === 86) return 71; if (c === 80 || c === 81) return 80;
    if (c >= 95) return 95; return 3;
  }
  function icona(c, giorno) {
    var g = gruppo(c);
    if (!giorno && (g === 0 || g === 1)) return g === 0 ? "🌙" : "☁️";
    return { 0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️", 45: "🌫️", 51: "🌦️", 61: "🌧️", 65: "🌧️", 71: "❄️", 80: "🌦️", 95: "⛈️" }[g];
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function n(x) { return L === "en" ? String(x) : String(x).replace(".", ","); }
  function f(s, o) { return s.replace(/\{(\w)\}/g, function (_, k) { return o[k]; }); }

  function consigli(d, x) {
    var v = [], s = [];
    var t = d.percMax;
    v.push(t >= 30 ? T.v.caldo : t >= 24 ? T.v.tiepido : t >= 18 ? T.v.mite : t >= 11 ? T.v.fresco : T.v.freddo);
    if (d.max - d.min >= 9) v.push(f(T.v.strati, { d: d.max - d.min }));
    if (d.pioggia >= 50) v.push(f(T.v.ombrello, { p: d.pioggia }));
    if (d.vento >= 35) v.push(f(T.v.vento, { v: d.vento }));

    if (d.uv >= 6) s.push(f(T.s.uvAlto, { u: n(d.uv) }));
    else if (d.uv >= 3) s.push(f(T.s.uvMedio, { u: n(d.uv) }));
    if (d.percMax >= 32) s.push(T.s.caldo);
    if (d.min <= 9) s.push(T.s.freddo);
    var mese = new Date().getMonth() + 1;
    if (mese >= 10 || mese <= 3) s.push(T.s.influenza);
    var pol = Object.keys(x.pollini || {}).filter(function (k) { return x.pollini[k] >= (k === "ragweed" ? 10 : 20); });
    if (pol.length) s.push(f(T.s.pollini, { n: pol.map(function (k) { return T.pol[k]; }).join(", ") }));
    if (x.aria && x.aria.aqi >= 60) s.push(T.s.aria);
    if (d.vento >= 35 && x.adesso.umidita < 50) s.push(T.s.ventoSecco);
    if (x.adesso.umidita >= 85 && s.length < 4) s.push(T.s.umido);
    if (!s.length) s.push(T.s.base);
    return { v: v.slice(0, 4), s: s.slice(0, 4) };
  }

  function giornoNome(iso, i) {
    if (i === 0) return T.oggi; if (i === 1) return T.domani;
    var d = new Date(iso + "T12:00:00");
    return T.giorni[d.getDay()] + " " + d.getDate();
  }

  function mostra(x) {
    var oggi = x.giorni[0], a = x.adesso, c = consigli(oggi, x);
    box.querySelector(".mt-eyebrow").textContent = T.eyebrow;
    box.querySelector(".mt-titolo").textContent = T.titolo;
    box.querySelector(".mt-lead").textContent = T.lead;
    box.querySelector(".mt-fonte").innerHTML = esc(T.fonte).replace("Open-Meteo", '<a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a>');
    var ora = '<div class="mt-ora">' +
      '<div class="mt-ora-top"><span class="mt-ic-big" aria-hidden="true">' + icona(a.codice, a.giorno) + "</span>" +
      '<div><div class="mt-label">' + esc(T.adesso) + '</div><div class="mt-temp">' + a.temp + "°</div>" +
      '<div class="mt-desc">' + esc(T.cod[gruppo(a.codice)]) + "</div></div></div>" +
      '<ul class="mt-dati">' +
      "<li><span>" + esc(T.percepita) + "</span><b>" + a.percepita + "°</b></li>" +
      "<li><span>" + esc(T.umidita) + "</span><b>" + a.umidita + "%</b></li>" +
      "<li><span>" + esc(T.vento) + "</span><b>" + a.vento + " km/h</b></li>" +
      "<li><span>" + esc(T.uv) + "</span><b>" + n(oggi.uv) + "</b></li>" +
      "</ul></div>";
    var giorni = '<ol class="mt-giorni">' + x.giorni.map(function (d, i) {
      return '<li class="' + (i === 0 ? "mt-g-oggi" : "") + '"><span class="mt-g-n">' + esc(giornoNome(d.data, i)) + "</span>" +
        '<span class="mt-g-ic" aria-hidden="true">' + icona(d.codice, true) + "</span>" +
        '<span class="mt-g-d">' + esc(T.cod[gruppo(d.codice)]) + "</span>" +
        '<span class="mt-g-t"><b>' + d.max + "°</b> " + d.min + "°</span>" +
        '<span class="mt-g-p" title="' + esc(T.pioggia) + '">💧 ' + d.pioggia + "%</span></li>";
    }).join("") + "</ol>";
    var lista = function (arr) { return "<ul>" + arr.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>"; };
    var cons = '<div class="mt-cons">' +
      '<div class="mt-c mt-c-v"><h3><span aria-hidden="true">🧥</span>' + esc(T.vestiti) + "</h3>" + lista(c.v) + "</div>" +
      '<div class="mt-c mt-c-s"><h3><span aria-hidden="true">💚</span>' + esc(T.salute) + "</h3>" + lista(c.s) + "</div></div>";
    box.querySelector(".mt-corpo").innerHTML = '<div class="mt-top">' + ora + giorni + "</div>" + cons;
    box.hidden = false;
  }

  fetch("/api/meteo").then(function (r) { return r.ok ? r.json() : null; }).then(function (x) {
    if (x && x.giorni && x.giorni.length) mostra(x);
  }).catch(function () {});
})();
