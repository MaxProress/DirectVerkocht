/* ==========================================================================
   DIRECT VERKOCHT
   Geen frameworks, geen build step. Alles draait op standaard browser-API's.
   ========================================================================== */

(function () {
  "use strict";

  var stilleVoorkeur = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ------------------------------------------------------------------------
     1. Wordmark: elke letter los, zodat hij per letter kan wiebelen bij hover
     ------------------------------------------------------------------------ */

  document.querySelectorAll(".wordmark__line").forEach(function (regel) {
    var tekst = regel.textContent.trim();
    regel.textContent = "";

    Array.prototype.forEach.call(tekst, function (teken, i) {
      var span = document.createElement("span");
      span.className = "ltr";
      span.textContent = teken;
      // Kleine willekeurige starthoek, zodat het handgezet aanvoelt.
      span.style.transform = "rotate(" + (((i * 37) % 5) - 2) * 0.6 + "deg)";
      regel.appendChild(span);
    });

    // Schermlezers krijgen de hele regel, niet 24 losse letters.
    regel.setAttribute("aria-label", tekst);
  });


  /* ------------------------------------------------------------------------
     2. Reveal bij scrollen
     ------------------------------------------------------------------------ */

  var teOnthullen = document.querySelectorAll(
    ".cluster, .tape, .videoframe, .photo, .duo-text, .contact__title, .contact__sub, .bigbutton, .socials"
  );

  teOnthullen.forEach(function (el) {
    // Clusters hebben hun eigen reveal-overgang; de rest leent .reveal.
    if (!el.classList.contains("cluster")) el.classList.add("reveal");
  });

  // Elk stukje binnen een cluster wiegt in zijn eigen tempo, anders beweegt
  // het cluster als één stijf blok.
  document.querySelectorAll(".cluster .deco").forEach(function (el) {
    el.style.setProperty("--dur", (6 + Math.random() * 5).toFixed(1) + "s");
    el.style.animationDelay = "-" + (Math.random() * 5).toFixed(1) + "s";
  });

  if ("IntersectionObserver" in window) {
    var waarnemer = new IntersectionObserver(function (items) {
      items.forEach(function (item) {
        if (item.isIntersecting) {
          item.target.classList.add("is-in");
          waarnemer.unobserve(item.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    teOnthullen.forEach(function (el) { waarnemer.observe(el); });
  } else {
    teOnthullen.forEach(function (el) { el.classList.add("is-in"); });
  }


  /* ------------------------------------------------------------------------
     3. Collage-elementen laten meedrijven met de scroll
     ------------------------------------------------------------------------ */

  var drijvers = Array.prototype.slice.call(document.querySelectorAll(".cluster[data-drift]"));
  var wachtOpFrame = false;

  function verplaatsDeco() {
    var midden = window.innerHeight / 2;

    drijvers.forEach(function (el) {
      var vak = el.getBoundingClientRect();
      if (vak.bottom < -200 || vak.top > window.innerHeight + 200) return;

      var afstand = (vak.top + vak.height / 2) - midden;
      var kracht = parseFloat(el.dataset.drift) || 0;
      el.style.setProperty("--drift-y", (afstand * kracht * -0.12).toFixed(1) + "px");
    });

    wachtOpFrame = false;
  }

  function planVerplaatsing() {
    if (wachtOpFrame) return;
    wachtOpFrame = true;
    requestAnimationFrame(verplaatsDeco);
  }

  if (!stilleVoorkeur.matches && drijvers.length) {
    window.addEventListener("scroll", planVerplaatsing, { passive: true });
    window.addEventListener("resize", planVerplaatsing);
    verplaatsDeco();
  }


  /* ------------------------------------------------------------------------
     4. Slinger
     De slierten vallen bij het openen naar beneden en bewegen daarna
     vanzelf: elk scharnier wiegt in zijn eigen tempo, en er trekt af en
     toe een windvlaag doorheen. Ze reageren nergens op — geen cursor,
     geen klik — dus na de inval doet CSS al het werk.
     ------------------------------------------------------------------------ */

  var slingers = Array.prototype.slice.call(document.querySelectorAll(".slinger"));

  if (slingers.length) {
    // Vaste "toevalsgetallen": elke herlaadbeurt hangt het gordijn er
    // hetzelfde bij, wat bij het bijstellen een stuk prettiger werkt.
    var zaad = 20260110;
    function kans() {
      zaad = (zaad * 1664525 + 1013904223) % 4294967296;
      return zaad / 4294967296;
    }

    // Een dichte laag zetten we niet met de hand in de opmaak: data-aantal
    // op de slinger zegt hoeveel slierten er moeten komen.
    slingers.forEach(function (laag) {
      var aantal = parseInt(laag.dataset.aantal, 10);
      if (!aantal) return;

      var kort = parseFloat(laag.dataset.kort) || 70;
      var lang = parseFloat(laag.dataset.lang) || 95;

      for (var k = 0; k < aantal; k++) {
        var el = document.createElement("span");
        el.className = "sliert";
        // Gelijkmatig verdeeld, maar net niet op een rij.
        el.dataset.x = (-2 + (104 / (aantal - 1)) * k + (kans() - 0.5) * 2.6).toFixed(1);
        el.dataset.len = (kort + kans() * (lang - kort)).toFixed(0);
        el.dataset.tex = String(1 + Math.floor(kans() * 3));
        laag.appendChild(el);
      }
    });

    var slierten = Array.prototype.slice.call(document.querySelectorAll(".sliert"));

    slierten.forEach(function (el, i) {
      var x   = parseFloat(el.dataset.x) || 50;
      var len = parseFloat(el.dataset.len) || 45;
      var tex = el.dataset.tex || "1";

      // De achterste laag zit grotendeels achter de wordmark: daar is een
      // knik niet te zien en zijn drie scharnieren genoeg. Dat scheelt veel
      // rekenwerk bij een dicht gordijn. Vooraan hangen er maar zeven, dus
      // die mogen zeven scharnieren hebben voor een echt vloeiende bocht.
      var achter = !!el.closest(".slinger--achter");
      var scharnieren = achter ? 3 : 7;

      // Alleen de slierten vooraan krijgen de tweede golf: daar kijk je naar,
      // en het zijn er weinig genoeg om het te kunnen betalen.
      if (!achter) el.classList.add("sliert--vloeiend");

      var tempo = 4.6 + ((i * 37) % 11) * 0.48;

      el.style.setProperty("--x", x + "%");
      el.style.setProperty("--len", len + "svh");
      el.style.setProperty("--w", (11 + (i % 4) * 3) + "px");
      el.classList.add("sliert--t" + tex);
      el.style.setProperty("--tempo", tempo.toFixed(2) + "s");
      // Niet-passende periode: samen herhalen de twee golven zich pas na
      // minuten, dus je betrapt het patroon niet.
      el.style.setProperty("--tempo2", (tempo * 1.618 + 0.4).toFixed(2) + "s");
      el.style.setProperty("--fase", (-((i * 61) % 13) * 0.41).toFixed(2) + "s");
      el.style.setProperty("--fase2", (-((i * 47) % 17) * 0.33).toFixed(2) + "s");

      // Wind. Twee groepen met een verschillende omlooptijd: meestal trekt
      // er één vlaag voorbij, af en toe vallen ze samen en is het een harde.
      var windduur = i % 2 ? 23 : 17;
      el.style.setProperty("--windduur", windduur + "s");
      // Hoe verder naar rechts, hoe later de vlaag aankomt: zo waait hij
      // zichtbaar door de slinger heen in plaats van overal tegelijk.
      el.style.setProperty("--windfase", (-windduur * 0.22 * (1 - x / 100)).toFixed(2) + "s");
      el.style.setProperty("--vlaag", (2.4 + ((i * 19) % 5) * 0.45).toFixed(2) + "deg");
      // Niet allemaal tegelijk, maar ook niet keurig van links naar rechts.
      el.style.setProperty("--vertraging", (0.12 + ((i * 29) % 23) * 0.055).toFixed(2) + "s");
      // Niemand hangt kaarsrecht, maar ook niet te scheef: tachtig slierten
      // die allemaal uitwaaieren worden stro, geen gordijn.
      el.style.setProperty("--kantel", (((i * 53) % 7) - 3) * 0.35 + "deg");

      // De in elkaar hangende delen. Staan hier en niet in de opmaak, want
      // het is puur versiering en het scheelt tientallen keren dezelfde
      // nesting in index.html.
      var binnenste = el;
      for (var n = 1; n <= scharnieren; n++) {
        var diep = (n - 1) / (scharnieren - 1);   // 0 bovenaan, 1 bij de punt

        var deel = document.createElement("i");
        deel.className = "deel deel--" + n + (n === scharnieren ? " deel--eind" : "");
        if (n === 1) deel.style.height = (100 / scharnieren).toFixed(2) + "%";

        // Dieper = grotere slag en meer achterloop, zodat golf A als een
        // golf naar de punt toe loopt. Voor en achter even ingetogen: het
        // moet één gordijn zijn, geen twee lagen met een eigen karakter.
        var basis = 1.5;
        var groei = 2.3;
        deel.style.setProperty("--slag", (basis + diep * groei).toFixed(2) + "deg");
        deel.style.setProperty("--slag2", (1.3 + diep * 2.9).toFixed(2) + "deg");

        // Golf B loopt de andere kant op, van de punt naar boven. Waar de
        // twee elkaar tegenkomen buigt de sliert in een S.
        deel.style.animationDelay = [
          "calc(var(--fase, 0s) + var(--tempo, 5s) * " + (-0.45 * diep).toFixed(3) + ")",
          "calc(var(--fase2, 0s) + var(--tempo2, 8s) * " + (0.38 * diep).toFixed(3) + ")"
        ].join(", ");

        var blad = document.createElement("i");
        blad.className = "blad";
        // Dezelfde foto verdeeld over de delen.
        blad.style.setProperty("--rek", scharnieren * 100 + "%");
        blad.style.setProperty("--plek", (diep * 100).toFixed(1) + "%");

        deel.appendChild(blad);
        binnenste.appendChild(deel);
        binnenste = deel;
      }

      // Zodra de val klaar is de eindstand vastzetten: de val-animatie zit
      // op de sliert en zou bij het aflopen terugspringen.
      el.addEventListener("animationend", function bij(e) {
        if (e.animationName !== "sliert-valt") return;
        el.removeEventListener("animationend", bij);
        el.style.setProperty("--val", "0%");
        el.classList.add("is-neer");
      });
    });

    if (stilleVoorkeur.matches) {
      // Geen val, geen wiegen: ze hangen er meteen.
      slierten.forEach(function (el) { el.style.setProperty("--val", "0%"); });
    } else {
      // Eén frame wachten zodat de beginstand echt getekend is; anders
      // slaat de browser de val over.
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          slingers.forEach(function (s) { s.classList.add("is-los"); });
        });
      });
    }
  }


  /* ------------------------------------------------------------------------
     5. Video: iframe pas laden na een klik, zodat de pagina snel blijft
     ------------------------------------------------------------------------ */

  var frame = document.querySelector(".videoframe");

  if (frame) {
    var id = (frame.dataset.video || "").trim();
    var soort = (frame.dataset.type || "youtube").trim();
    var slot = frame.querySelector(".videoframe__slot");
    var plek = frame.querySelector(".videoframe__placeholder");

    if (id) {
      plek.querySelector("p").textContent = "Bekijk de video";
      plek.querySelector("small").remove();

      var knop = document.createElement("button");
      knop.type = "button";
      knop.className = "videoframe__trigger";
      knop.setAttribute("aria-label", "Video afspelen");
      Object.assign(knop.style, {
        position: "absolute", inset: "0", width: "100%", height: "100%",
        background: "transparent", border: "0", cursor: "pointer", zIndex: "2"
      });

      // YouTube levert een gratis poster-afbeelding; Vimeo niet.
      if (soort === "youtube") {
        slot.style.backgroundImage = 'url("https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg")';
        slot.style.backgroundSize = "cover";
        slot.style.backgroundPosition = "center";
        plek.style.background = "rgba(0, 0, 0, 0.35)";
      }

      knop.addEventListener("click", function () {
        var bron = soort === "vimeo"
          ? "https://player.vimeo.com/video/" + encodeURIComponent(id) + "?autoplay=1"
          : "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?autoplay=1&rel=0";

        var iframe = document.createElement("iframe");
        iframe.src = bron;
        iframe.title = "Direct Verkocht — video";
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;

        slot.innerHTML = "";
        slot.style.backgroundImage = "none";
        slot.appendChild(iframe);
      });

      slot.appendChild(knop);
    }
  }


  /* ------------------------------------------------------------------------
     6. Foto: placeholder tonen zolang duo.jpg er nog niet is
     ------------------------------------------------------------------------ */

  var foto = document.querySelector(".photo");

  if (foto) {
    var afbeelding = foto.querySelector("img");

    var markeerLeeg = function () { foto.classList.add("is-empty"); };

    if (afbeelding.complete) {
      if (!afbeelding.naturalWidth) markeerLeeg();
    } else {
      afbeelding.addEventListener("error", markeerLeeg);
    }
  }


  /* ------------------------------------------------------------------------
     7. Jaartal in de footer
     ------------------------------------------------------------------------ */

  var jaar = document.getElementById("jaar");
  if (jaar) jaar.textContent = new Date().getFullYear();

})();
