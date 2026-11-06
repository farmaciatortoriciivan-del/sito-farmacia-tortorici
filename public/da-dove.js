/* Domanda facoltativa "Da quale paese ci visiti?" — Farmacia Tortorici
   Compare una sola volta (poi il browser ricorda che hai risposto o chiuso).
   La risposta è anonima e finisce solo nel conteggio delle statistiche. */
(function () {
  var dopo = document.querySelector(".turni");
  if (!dopo || !window.ftStat) return; // senza statistiche (es. "Non tracciare" attivo) non chiediamo nulla
  var KEY = "ft-dadove";
  try { if (localStorage.getItem(KEY)) return; } catch (e) { return; }
  var L = window.LINGUA || "it";
  var T = {
    it: { t: "Ci aiuti a conoscerti?", d: "Da quale paese ci visiti? Rispondere è facoltativo e anonimo.", no: "Preferisco non rispondere", ok: "Grazie! 💚",
      sicilia: "Altro paese della Sicilia", italia: "Altra regione d'Italia", estero: "Dall'estero" },
    scn: { t: "N'aiuti a canùsciriti?", d: "Di quali paisi ni visiti? Arrispunniri nun è obbligatoriu e nuddu sapi cu si'.", no: "Nun vogghiu arrispunniri", ok: "Grazzi! 💚",
      sicilia: "Àutru paisi dâ Sicilia", italia: "Àutra riggiuni d'Italia", estero: "Di l'èsteru" },
    en: { t: "Help us get to know you?", d: "Which town are you visiting from? Answering is optional and anonymous.", no: "I'd rather not say", ok: "Thank you! 💚",
      sicilia: "Another town in Sicily", italia: "Elsewhere in Italy", estero: "From abroad" },
    de: { t: "Helfen Sie uns, Sie kennenzulernen?", d: "Aus welchem Ort besuchen Sie uns? Die Antwort ist freiwillig und anonym.", no: "Keine Angabe", ok: "Danke! 💚",
      sicilia: "Anderer Ort in Sizilien", italia: "Andere Region Italiens", estero: "Aus dem Ausland" },
    es: { t: "¿Nos ayudas a conocerte?", d: "¿Desde qué pueblo nos visitas? Responder es opcional y anónimo.", no: "Prefiero no responder", ok: "¡Gracias! 💚",
      sicilia: "Otro pueblo de Sicilia", italia: "Otra región de Italia", estero: "Desde el extranjero" },
    zh: { t: "帮我们了解你？", d: "你从哪个城镇访问我们？回答是自愿且匿名的。", no: "不想回答", ok: "谢谢！💚",
      sicilia: "西西里其他城镇", italia: "意大利其他地区", estero: "国外" }
  }[L] || null;
  if (!T) return;
  var SCELTE = [["trabia", "Trabia"], ["san-nicola", "San Nicola l'Arena"], ["termini", "Termini Imerese"], ["altavilla", "Altavilla Milicia"],
    ["casteldaccia", "Casteldaccia"], ["bagheria", "Bagheria"], ["caccamo", "Caccamo"], ["palermo", "Palermo"],
    ["sicilia", T.sicilia], ["italia", T.italia], ["estero", T.estero]];

  var s = document.createElement("div");
  s.className = "dadove";
  s.innerHTML = '<div><h3>' + T.t + "</h3><p>" + T.d + '</p></div><div class="dadove-scelte">' +
    SCELTE.map(function (c) { return '<button type="button" data-v="' + c[0] + '">' + c[1] + "</button>"; }).join("") +
    '</div><button type="button" class="dadove-no">' + T.no + "</button>";
  dopo.parentNode.insertBefore(s, dopo.nextSibling);

  function fatto(msg) {
    try { localStorage.setItem(KEY, "1"); } catch (e) {}
    if (msg) { s.innerHTML = '<p class="dadove-ok">' + msg + "</p>"; setTimeout(function () { s.remove(); }, 2500); } else s.remove();
  }
  s.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.classList.contains("dadove-no")) return fatto("");
    window.ftStat({ tipo: "paese", voce: b.getAttribute("data-v") });
    fatto(T.ok);
  });
})();
