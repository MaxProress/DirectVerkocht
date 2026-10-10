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
     De slierten vallen bij het openen naar beneden, wiegen daarna rustig,
     en wijken voor de cursor. Elke sliert heeft een eigen veertje: de
     cursor zet een doelhoek, de sliert veert ernaartoe en schiet er een
     beetje overheen. Een klik geeft ze een duw.
     ------------------------------------------------------------------------ */

  var slinger = document.querySelector(".slinger");

  if (slinger) {
    var slierten = Array.prototype.slice.call(slinger.querySelectorAll(".sliert"));
    var hero = document.querySelector(".hero");

    slierten.forEach(function (el, i) {
      var x   = parseFloat(el.dataset.x) || 50;
      var len = parseFloat(el.dataset.len) || 45;
      var tex = el.dataset.tex || "1";

      el.style.setProperty("--x", x + "%");
      el.style.setProperty("--len", len + "svh");
      el.style.setProperty("--w", (11 + (i % 4) * 3) + "px");
      el.classList.add("sliert--t" + tex);
      el.style.setProperty("--tempo", (4.2 + (i % 5) * 0.7).toFixed(1) + "s");
      // Niet allemaal tegelijk: van links naar rechts, met wat ruis erin.
      el.style.setProperty("--vertraging", (0.15 + i * 0.045 + (i % 3) * 0.03).toFixed(2) + "s");

      // Zodra de val klaar is de eindstand vastzetten, want de wieg-animatie
      // vervangt de val-animatie en zou --val anders terugzetten.
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
        requestAnimationFrame(function () { slinger.classList.add("is-los"); });
      });

      var veren = slierten.map(function (el) {
        return { el: el, hoek: 0, snelheid: 0, doel: 0 };
      });

      var muisX = null, loopt = false;

      var meet = function () {
        return slierten.map(function (el) {
          var r = el.getBoundingClientRect();
          return r.left + r.width / 2;
        });
      };

      var middens = meet();
      window.addEventListener("resize", function () { middens = meet(); });

      hero.addEventListener("pointermove", function (e) {
        muisX = e.clientX;
        start();
      });

      hero.addEventListener("pointerleave", function () {
        muisX = null;
        start();           // nog even doorlopen tot ze weer stilhangen
      });

      hero.addEventListener("pointerdown", function (e) {
        var x = e.clientX;
        veren.forEach(function (v, i) {
          var afstand = middens[i] - x;
          var bereik = 260;
          if (Math.abs(afstand) > bereik) return;
          var kracht = (1 - Math.abs(afstand) / bereik);
          v.snelheid += (afstand >= 0 ? 1 : -1) * kracht * 9;
        });
        start();
      });

      function stap() {
        var rust = true;

        veren.forEach(function (v, i) {
          if (muisX === null) {
            v.doel = 0;
          } else {
            var afstand = middens[i] - muisX;
            var bereik = 220;
            if (Math.abs(afstand) > bereik) {
              v.doel = 0;
            } else {
              // Dichterbij = verder opzij, en altijd wég van de cursor.
              var kracht = 1 - Math.abs(afstand) / bereik;
              v.doel = (afstand >= 0 ? 1 : -1) * kracht * 14;
            }
          }

          v.snelheid += (v.doel - v.hoek) * 0.11;
          v.snelheid *= 0.87;
          v.hoek += v.snelheid;

          if (Math.abs(v.snelheid) > 0.01 || Math.abs(v.hoek - v.doel) > 0.01) rust = false;

          v.el.style.setProperty("--duw", v.hoek.toFixed(2) + "deg");
        });

        // Stoppen zodra alles stilhangt, ook als de muis nog op de hero
        // staat: elke nieuwe beweging start de lus toch weer.
        if (rust) { loopt = false; return; }
        requestAnimationFrame(stap);
      }

      function start() {
        if (loopt) return;
        loopt = true;
        requestAnimationFrame(stap);
      }
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
