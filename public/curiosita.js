/* "Lo sapevi?" — ogni giorno una scoperta o un'invenzione nata dal lavoro di un farmacista.
   La curiosità cambia ogni giorno (stessa per tutti); con il pulsante se ne può leggere un'altra. */
(function () {
  var box = document.getElementById("curiosita");
  if (!box) return;
  var L = window.LINGUA || "it";

  // [emoji, anno, titolo IT, testo IT, titolo EN, testo EN, titolo DE, testo DE]
  var C = [
    ["🥤", "1886", "La Coca-Cola",
      "Fu inventata ad Atlanta da John Stith Pemberton, un farmacista: all'inizio la vendeva nella farmacia come bevanda tonica, alla spina.",
      "Coca-Cola", "It was invented in Atlanta by John Stith Pemberton, a pharmacist: at first it was sold at the pharmacy soda fountain as a tonic drink.",
      "Coca-Cola", "Sie wurde in Atlanta vom Apotheker John Stith Pemberton erfunden und zunächst am Getränkeausschank der Apotheke als Stärkungsgetränk verkauft."],
    ["🥤", "1893", "La Pepsi",
      "Nacque nella farmacia di Caleb Bradham a New Bern, in North Carolina, con il nome di \"Brad's Drink\". Dal 1898 si chiamò Pepsi-Cola.",
      "Pepsi", "It was born in Caleb Bradham's pharmacy in New Bern, North Carolina, as \"Brad's Drink\". From 1898 it was called Pepsi-Cola.",
      "Pepsi", "Sie entstand in der Apotheke von Caleb Bradham in New Bern (North Carolina) als „Brad's Drink“. Ab 1898 hieß sie Pepsi-Cola."],
    ["🥤", "1885", "Il Dr Pepper",
      "Lo creò Charles Alderton, farmacista a Waco, in Texas, mescolando gli aromi del bancone delle bibite della sua farmacia.",
      "Dr Pepper", "It was created by Charles Alderton, a pharmacist in Waco, Texas, by mixing the flavours of his pharmacy's soda fountain.",
      "Dr Pepper", "Charles Alderton, Apotheker in Waco (Texas), mischte ihn aus den Aromen am Getränkeausschank seiner Apotheke."],
    ["🍺", "1876", "La root beer",
      "Il farmacista di Philadelphia Charles Elmer Hires rese famosa la root beer, una bibita analcolica alle radici e alle erbe.",
      "Root beer", "Philadelphia pharmacist Charles Elmer Hires made root beer famous: a soft drink made from roots and herbs.",
      "Root Beer", "Der Apotheker Charles Elmer Hires aus Philadelphia machte Root Beer berühmt, ein alkoholfreies Getränk aus Wurzeln und Kräutern."],
    ["🫚", "1866", "Il ginger ale Vernors",
      "James Vernor, farmacista di Detroit, creò uno dei primi ginger ale americani, ancora oggi in commercio.",
      "Vernors ginger ale", "James Vernor, a Detroit pharmacist, created one of the first American ginger ales, still sold today.",
      "Vernors Ginger Ale", "James Vernor, Apotheker in Detroit, schuf eines der ersten amerikanischen Ginger Ales, das es bis heute gibt."],
    ["💊", "1804", "La morfina",
      "Il giovane garzone di farmacia tedesco Friedrich Sertürner isolò la morfina dall'oppio: fu il primo principio attivo estratto da una pianta.",
      "Morphine", "Young German pharmacy apprentice Friedrich Sertürner isolated morphine from opium: the first active ingredient ever extracted from a plant.",
      "Morphin", "Der junge Apothekergehilfe Friedrich Sertürner isolierte Morphin aus Opium: der erste aus einer Pflanze gewonnene Wirkstoff."],
    ["🌿", "1820", "Il chinino",
      "I farmacisti francesi Pierre-Joseph Pelletier e Joseph Caventou estrassero il chinino dalla corteccia di china: per oltre un secolo fu il rimedio principale contro la malaria.",
      "Quinine", "French pharmacists Pierre-Joseph Pelletier and Joseph Caventou extracted quinine from cinchona bark: for over a century it was the main remedy against malaria.",
      "Chinin", "Die französischen Apotheker Pierre-Joseph Pelletier und Joseph Caventou gewannen Chinin aus Chinarinde, über ein Jahrhundert das wichtigste Mittel gegen Malaria."],
    ["🍃", "1817", "Il nome \"clorofilla\"",
      "Sono stati ancora Pelletier e Caventou, farmacisti a Parigi, a isolare il pigmento verde delle foglie e a chiamarlo clorofilla.",
      "The name \"chlorophyll\"", "Again Pelletier and Caventou, pharmacists in Paris, isolated the green pigment of leaves and named it chlorophyll.",
      "Der Name „Chlorophyll“", "Wieder waren es Pelletier und Caventou, Apotheker in Paris, die den grünen Blattfarbstoff isolierten und Chlorophyll nannten."],
    ["☕", "1819", "La caffeina",
      "Friedlieb Ferdinand Runge, che si era formato come farmacista, isolò la caffeina dai chicchi di caffè: glielo aveva suggerito il poeta Goethe in persona.",
      "Caffeine", "Friedlieb Ferdinand Runge, who had trained as a pharmacist, isolated caffeine from coffee beans: the poet Goethe himself had suggested it.",
      "Koffein", "Friedlieb Ferdinand Runge, gelernter Apotheker, isolierte Koffein aus Kaffeebohnen – auf Anregung von Goethe persönlich."],
    ["💧", "1832", "La codeina",
      "Il farmacista e chimico francese Pierre Robiquet scoprì la codeina, ancora oggi usata in alcuni sciroppi per la tosse su ricetta.",
      "Codeine", "French pharmacist and chemist Pierre Robiquet discovered codeine, still used today in some prescription cough syrups.",
      "Codein", "Der französische Apotheker und Chemiker Pierre Robiquet entdeckte Codein, das bis heute in manchen verschreibungspflichtigen Hustensäften steckt."],
    ["👁️", "1831", "L'atropina",
      "Il farmacista tedesco Heinrich Mein isolò l'atropina dalla belladonna: oggi si usa, per esempio, per dilatare la pupilla durante le visite oculistiche.",
      "Atropine", "German pharmacist Heinrich Mein isolated atropine from deadly nightshade: today it is used, for example, to dilate the pupil during eye exams.",
      "Atropin", "Der deutsche Apotheker Heinrich Mein isolierte Atropin aus der Tollkirsche; heute weitet es zum Beispiel beim Augenarzt die Pupille."],
    ["🫁", "1772", "L'ossigeno",
      "Il farmacista svedese Carl Wilhelm Scheele scoprì l'ossigeno lavorando nel retrobottega della sua farmacia, chiamandolo \"aria di fuoco\".",
      "Oxygen", "Swedish pharmacist Carl Wilhelm Scheele discovered oxygen while working in the back room of his pharmacy, calling it \"fire air\".",
      "Sauerstoff", "Der schwedische Apotheker Carl Wilhelm Scheele entdeckte im Hinterzimmer seiner Apotheke den Sauerstoff und nannte ihn „Feuerluft“."],
    ["🧪", "1774", "Il cloro",
      "Sempre Carl Wilhelm Scheele, farmacista svedese, produsse per primo il cloro, oggi usato per rendere potabile l'acqua.",
      "Chlorine", "Carl Wilhelm Scheele, the Swedish pharmacist, was also the first to produce chlorine, now used to make water safe to drink.",
      "Chlor", "Ebenfalls Carl Wilhelm Scheele stellte als Erster Chlor her, das heute zur Trinkwasseraufbereitung dient."],
    ["🧴", "1779", "La glicerina",
      "Scheele scoprì anche la glicerina, oggi presente in creme, saponi, sciroppi e supposte.",
      "Glycerine", "Scheele also discovered glycerine, now found in creams, soaps, syrups and suppositories.",
      "Glycerin", "Scheele entdeckte auch das Glycerin, das heute in Cremes, Seifen, Säften und Zäpfchen steckt."],
    ["⚛️", "1789", "L'uranio",
      "Il farmacista tedesco Martin Heinrich Klaproth scoprì l'uranio e gli diede il nome del pianeta Urano, scoperto pochi anni prima.",
      "Uranium", "German pharmacist Martin Heinrich Klaproth discovered uranium and named it after the planet Uranus, discovered a few years earlier.",
      "Uran", "Der deutsche Apotheker Martin Heinrich Klaproth entdeckte das Uran und benannte es nach dem wenige Jahre zuvor entdeckten Planeten Uranus."],
    ["🌊", "1826", "Il bromo",
      "Antoine-Jérôme Balard, giovane farmacista di Montpellier, scoprì il bromo studiando l'acqua delle saline.",
      "Bromine", "Antoine-Jérôme Balard, a young pharmacist in Montpellier, discovered bromine while studying water from salt pans.",
      "Brom", "Antoine-Jérôme Balard, junger Apotheker in Montpellier, entdeckte das Brom bei der Untersuchung von Salinenwasser."],
    ["🟣", "1811", "Lo iodio",
      "Bernard Courtois, formatosi in una farmacia, scoprì lo iodio nelle ceneri delle alghe marine: oggi è fondamentale per la tiroide e come disinfettante.",
      "Iodine", "Bernard Courtois, who trained in a pharmacy, discovered iodine in seaweed ash: today it is vital for the thyroid and used as a disinfectant.",
      "Jod", "Bernard Courtois, in einer Apotheke ausgebildet, entdeckte Jod in Seetangasche; heute ist es wichtig für die Schilddrüse und als Desinfektionsmittel."],
    ["✨", "1797", "Il cromo",
      "Louis-Nicolas Vauquelin, che aveva iniziato come garzone di farmacia, scoprì il cromo, l'elemento che rende lucide le cromature.",
      "Chromium", "Louis-Nicolas Vauquelin, who started out as a pharmacy apprentice, discovered chromium, the element behind shiny chrome plating.",
      "Chrom", "Louis-Nicolas Vauquelin, der als Apothekerlehrling begann, entdeckte das Chrom, das Verchromungen glänzen lässt."],
    ["🏅", "1886", "Il fluoro (e un Nobel)",
      "Henri Moissan, diplomato in farmacia, riuscì a isolare il fluoro: per questo vinse il Premio Nobel per la chimica nel 1906.",
      "Fluorine (and a Nobel Prize)", "Henri Moissan, a pharmacy graduate, managed to isolate fluorine and won the 1906 Nobel Prize in Chemistry for it.",
      "Fluor (und ein Nobelpreis)", "Henri Moissan, ausgebildeter Apotheker, isolierte das Fluor und erhielt dafür 1906 den Nobelpreis für Chemie."],
    ["💊", "1897", "L'aspirina",
      "Felix Hoffmann, che aveva studiato farmacia, sintetizzò in forma pura e stabile l'acido acetilsalicilico, poi venduto come Aspirina.",
      "Aspirin", "Felix Hoffmann, who had studied pharmacy, synthesised acetylsalicylic acid in a pure, stable form, later sold as Aspirin.",
      "Aspirin", "Felix Hoffmann, studierter Apotheker, stellte Acetylsalicylsäure in reiner, stabiler Form her – später als Aspirin verkauft."],
    ["🍰", "1837", "La crema senza uova e il lievito in polvere",
      "Il farmacista inglese Alfred Bird inventò una crema pasticcera senza uova per la moglie, allergica. Pochi anni dopo, nel 1843, creò anche il lievito in polvere.",
      "Egg-free custard and baking powder", "English pharmacist Alfred Bird invented an egg-free custard for his wife, who was allergic to eggs. In 1843 he also created baking powder.",
      "Eifreier Pudding und Backpulver", "Der englische Apotheker Alfred Bird erfand für seine allergische Frau einen Pudding ohne Eier. 1843 schuf er außerdem ein Backpulver."],
    ["🥔", "1700s", "La patata in Francia",
      "Il farmacista militare Antoine-Augustin Parmentier convinse i francesi a mangiare le patate, allora guardate con sospetto. Un piatto porta ancora il suo nome: l'hachis Parmentier.",
      "Potatoes in France", "Army pharmacist Antoine-Augustin Parmentier persuaded the French to eat potatoes, then viewed with suspicion. A dish still bears his name: hachis Parmentier.",
      "Die Kartoffel in Frankreich", "Der Militärapotheker Antoine-Augustin Parmentier brachte die Franzosen dazu, Kartoffeln zu essen. Ein Gericht trägt noch seinen Namen: Hachis Parmentier."],
    ["📏", "1768", "La scala Baumé",
      "Il farmacista francese Antoine Baumé inventò un sistema per misurare la densità dei liquidi, usato ancora oggi per sciroppi, vini e mosti.",
      "The Baumé scale", "French pharmacist Antoine Baumé invented a way to measure the density of liquids, still used today for syrups, wines and musts.",
      "Die Baumé-Skala", "Der französische Apotheker Antoine Baumé erfand eine Skala zur Messung der Dichte von Flüssigkeiten, noch heute für Sirupe, Weine und Moste genutzt."],
    ["🤧", "1890s", "Il balsamo per il raffreddore",
      "Lunsford Richardson, farmacista a Greensboro (USA), preparò un unguento al mentolo e canfora per i raffreddori: è il celebre Vicks VapoRub.",
      "The cold rub", "Lunsford Richardson, a pharmacist in Greensboro (USA), made a menthol and camphor ointment for colds: the famous Vicks VapoRub.",
      "Der Erkältungsbalsam", "Lunsford Richardson, Apotheker in Greensboro (USA), mischte eine Salbe mit Menthol und Kampfer gegen Erkältungen: das bekannte Vicks VapoRub."],
    ["🩹", "1882", "Il cerotto medicato",
      "Il farmacista di Amburgo Paul Carl Beiersdorf brevettò un cerotto medicato: da lì nacque l'azienda Beiersdorf.",
      "The medicated plaster", "Hamburg pharmacist Paul Carl Beiersdorf patented a medicated plaster: that was the start of the Beiersdorf company.",
      "Das medizinische Pflaster", "Der Hamburger Apotheker Paul Carl Beiersdorf ließ ein medizinisches Pflaster patentieren – der Beginn der Firma Beiersdorf."],
    ["🧴", "1911", "La crema Nivea",
      "Il farmacista Oscar Troplowitz lanciò la crema Nivea, nel classico barattolo: il nome viene dal latino \"nivea\", bianca come la neve.",
      "Nivea cream", "Pharmacist Oscar Troplowitz launched Nivea cream: the name comes from the Latin \"nivea\", snow-white.",
      "Nivea-Creme", "Der Apotheker Oscar Troplowitz brachte die Nivea-Creme heraus; der Name kommt vom lateinischen „nivea“, schneeweiß."],
    ["🍼", "1867", "La farina lattea",
      "Henri Nestlé, che si era formato come farmacista, creò a Vevey una farina lattea per i neonati che non potevano essere allattati: così nacque la Nestlé.",
      "Infant cereal", "Henri Nestlé, who had trained as a pharmacist, created an infant cereal in Vevey for babies who could not be breastfed: that was the birth of Nestlé.",
      "Kindermehl", "Henri Nestlé, gelernter Apotheker, entwickelte in Vevey ein Kindermehl für Säuglinge, die nicht gestillt werden konnten – so entstand Nestlé."],
    ["🍬", "1904", "Le pastiglie Valda",
      "Il farmacista francese Henri Canonne creò le famose pastiglie gommose verdi per la gola.",
      "Valda pastilles", "French pharmacist Henri Canonne created the famous green gum pastilles for the throat.",
      "Valda-Pastillen", "Der französische Apotheker Henri Canonne schuf die bekannten grünen Halspastillen."],
    ["🎣", "1865", "Le pastiglie per i pescatori",
      "James Lofthouse, farmacista di Fleetwood in Inghilterra, preparò pastiglie al mentolo per i pescatori nei mari freddi del Nord: sono le Fisherman's Friend.",
      "Lozenges for fishermen", "James Lofthouse, a pharmacist in Fleetwood, England, made menthol lozenges for fishermen in the cold northern seas: Fisherman's Friend.",
      "Pastillen für Fischer", "James Lofthouse, Apotheker in Fleetwood (England), machte Mentholpastillen für Fischer auf den kalten Nordmeeren: Fisherman's Friend."],
    ["🍶", "1837", "La salsa Worcestershire",
      "John Lea e William Perrins, farmacisti a Worcester, in Inghilterra, misero in commercio la salsa che porta il nome della loro città.",
      "Worcestershire sauce", "John Lea and William Perrins, pharmacists in Worcester, England, launched the sauce named after their town.",
      "Worcestershiresauce", "John Lea und William Perrins, Apotheker in Worcester (England), brachten die nach ihrer Stadt benannte Sauce heraus."],
    ["⚖️", "1790s", "Una legge della chimica",
      "Il farmacista francese Joseph Proust scoprì che ogni composto chimico contiene sempre gli stessi elementi nelle stesse proporzioni: la \"legge di Proust\".",
      "A law of chemistry", "French pharmacist Joseph Proust discovered that a chemical compound always contains the same elements in the same proportions: \"Proust's law\".",
      "Ein Gesetz der Chemie", "Der französische Apotheker Joseph Proust entdeckte, dass eine Verbindung stets dieselben Elemente im selben Verhältnis enthält: das „Gesetz von Proust“."],
    ["🇮🇹", "1904", "Il Borotalco",
      "Nasce a Firenze dall'azienda Manetti & Roberts, fondata insieme al farmacista inglese Henry Roberts, che aveva aperto una farmacia in città.",
      "Borotalco", "It was born in Florence from the Manetti & Roberts company, co-founded by English pharmacist Henry Roberts, who had opened a pharmacy in the city.",
      "Borotalco", "Es entstand in Florenz bei Manetti & Roberts, mitbegründet vom englischen Apotheker Henry Roberts, der dort eine Apotheke eröffnet hatte."]
  ];

  var S = {
    it: { eyebrow: "Lo sapevi?", titolo: "Farmacisti geniali", lead: "Ogni giorno una scoperta o un'invenzione nata dal lavoro di un farmacista. Alcune ti sorprenderanno!", oggi: "La curiosità di oggi", altra: "Scoprine un'altra", anno: "Anno" },
    en: { eyebrow: "Did you know?", titolo: "Brilliant pharmacists", lead: "Every day a discovery or invention that came from a pharmacist's work. Some will surprise you!", oggi: "Today's fun fact", altra: "Show me another", anno: "Year" },
    de: { eyebrow: "Wussten Sie schon?", titolo: "Geniale Apotheker", lead: "Jeden Tag eine Entdeckung oder Erfindung aus der Arbeit eines Apothekers. Manche werden Sie überraschen!", oggi: "Die Kuriosität des Tages", altra: "Noch eine zeigen", anno: "Jahr" }
  }[L] || null;
  if (!S) return;
  var k = { it: 2, en: 4, de: 6 }[L];

  var g = Math.floor((Date.now() + 3600e3) / 864e5);
  var i = g % C.length, oggi = i;
  var card = box.querySelector(".cu-card");

  function mostra(anima) {
    var c = C[i];
    var lbl = i === oggi ? S.oggi : "";
    card.innerHTML =
      '<div class="cu-ic" aria-hidden="true">' + c[0] + "</div>" +
      '<div class="cu-txt">' + (lbl ? '<span class="cu-lbl">' + lbl + "</span>" : "") +
      '<h3>' + esc(c[k]) + ' <span class="cu-anno">' + esc(annoTxt(c[1])) + "</span></h3>" +
      "<p>" + esc(c[k + 1]) + "</p></div>";
    if (anima) { card.classList.remove("cu-gira"); void card.offsetWidth; card.classList.add("cu-gira"); }
  }
  var AN = { "1700s": { it: "Settecento", en: "1700s", de: "18. Jh." }, "1790s": { it: "fine Settecento", en: "1790s", de: "um 1795" }, "1890s": { it: "fine Ottocento", en: "1890s", de: "um 1895" } };
  function annoTxt(a) { return AN[a] ? AN[a][L] : a; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (x) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[x]; }); }

  box.querySelector(".cu-eyebrow").textContent = S.eyebrow;
  box.querySelector(".cu-titolo").textContent = S.titolo;
  box.querySelector(".cu-lead").textContent = S.lead;
  var b = box.querySelector(".cu-altra");
  b.querySelector("span").textContent = S.altra;
  b.addEventListener("click", function () { i = (i + 1) % C.length; mostra(true); });
  mostra(false);
  box.hidden = false;
})();
