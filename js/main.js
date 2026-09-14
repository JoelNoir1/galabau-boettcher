/* ==========================================================================
   Galabau Böttcher — Interaktionen
   Vanilla JS, keine Abhängigkeiten. Alle Effekte respektieren
   prefers-reduced-motion.
   ========================================================================== */
(function () {
  "use strict";

  const motionOK = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /* ---------- Header: Zustand beim Scrollen ---------- */
  const header = $(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile Navigation ---------- */
  const navToggle = $(".nav-toggle");
  const mobileNav = $(".mobile-nav");
  if (navToggle && mobileNav) {
    const focusables = () =>
      $$("a[href], button:not([disabled])", mobileNav).concat([navToggle]);

    const setOpen = (open) => {
      document.body.classList.toggle("nav-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      mobileNav.setAttribute("aria-hidden", String(!open));
      if (open) {
        const first = $("a", mobileNav);
        if (first) first.focus({ preventScroll: true });
      } else {
        navToggle.focus({ preventScroll: true });
      }
    };

    navToggle.addEventListener("click", () =>
      setOpen(!document.body.classList.contains("nav-open"))
    );

    mobileNav.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", (e) => {
      if (!document.body.classList.contains("nav-open")) return;
      if (e.key === "Escape") { setOpen(false); return; }
      if (e.key !== "Tab") return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    });
  }

  /* ---------- Scroll-Reveals (gestaffelt) ---------- */
  const reveals = $$(".reveal");
  if (reveals.length && "IntersectionObserver" in window && motionOK) {
    $$("[data-reveal-group]").forEach((group) => {
      $$(".reveal", group).forEach((el, i) => {
        el.style.setProperty("--reveal-delay", `${Math.min(i * 90, 450)}ms`);
      });
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );
    reveals.forEach((el) => {
      // Curtain-Bilder werden erst JETZT (aktiv, nur in diesem sicher laufenden
      // Zweig) versteckt — bleiben also sichtbar, falls dieser Code nie läuft.
      if (el.classList.contains("reveal--curtain")) el.classList.add("curtain-armed");
      io.observe(el);
    });
    // Sicherheitsnetz: Sollte der Observer aus irgendeinem Grund nie feuern
    // (z. B. Tab im Hintergrund, Browser-Eigenheit), Bilder spätestens nach
    // 2,5s trotzdem einblenden statt dauerhaft versteckt zu lassen.
    setTimeout(() => {
      $$(".reveal--curtain.curtain-armed:not(.in)").forEach((el) => el.classList.add("in"));
    }, 2500);
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Zahlen-Animation ---------- */
  const counters = $$("[data-count-to]");
  if (counters.length) {
    const run = (el) => {
      const target = parseInt(el.dataset.countTo, 10) || 0;
      const suffix = el.dataset.suffix || "";
      if (!motionOK) { el.textContent = target + suffix; return; }
      const dur = 1700;
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
          });
        },
        { threshold: 0.5 }
      );
      counters.forEach((el) => io.observe(el));
    } else {
      counters.forEach(run);
    }
  }

  /* ---------- Ablauf-Timeline: Fortschrittslinie ---------- */
  const timeline = $(".timeline");
  if (timeline && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { timeline.classList.add("in-view"); io.disconnect(); }
        });
      },
      { threshold: 0.25 }
    );
    io.observe(timeline);
  }

  /* ---------- Bewertungs-Slider: Punkte (mobil) ---------- */
  const tstTrack = $(".tst-track");
  const tstDots = $(".tst-dots");
  if (tstTrack && tstDots) {
    const cards = $$(".tst", tstTrack);
    cards.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `Bewertung ${i + 1} anzeigen`);
      if (i === 0) b.classList.add("active");
      b.addEventListener("click", () => {
        cards[i].scrollIntoView({ behavior: motionOK ? "smooth" : "auto", block: "nearest", inline: "center" });
      });
      tstDots.appendChild(b);
    });
    const dots = $$("button", tstDots);
    let raf = 0;
    tstTrack.addEventListener(
      "scroll",
      () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const mid = tstTrack.scrollLeft + tstTrack.clientWidth / 2;
          let best = 0;
          cards.forEach((c, i) => {
            const center = c.offsetLeft + c.offsetWidth / 2;
            if (Math.abs(center - mid) < Math.abs(cards[best].offsetLeft + cards[best].offsetWidth / 2 - mid)) best = i;
          });
          dots.forEach((d, i) => d.classList.toggle("active", i === best));
        });
      },
      { passive: true }
    );
  }

  /* ---------- Vorher/Nachher-Slider ---------- */
  $$("[data-ba]").forEach((ba) => {
    const handle = $(".ba__handle", ba);
    if (!handle) return;

    const set = (percent) => {
      const p = Math.max(4, Math.min(96, percent));
      ba.style.setProperty("--pos", p + "%");
      handle.setAttribute("aria-valuenow", String(Math.round(p)));
    };

    const fromEvent = (e) => {
      const rect = ba.getBoundingClientRect();
      set(((e.clientX - rect.left) / rect.width) * 100);
    };

    ba.addEventListener("pointerdown", (e) => {
      ba.classList.add("ba--interacted"); // stoppt den Auto-Sweep, sobald der Nutzer selbst zieht
      ba.setPointerCapture(e.pointerId);
      fromEvent(e);
      const move = (ev) => fromEvent(ev);
      const up = () => {
        ba.removeEventListener("pointermove", move);
        ba.removeEventListener("pointerup", up);
        ba.removeEventListener("pointercancel", up);
      };
      ba.addEventListener("pointermove", move);
      ba.addEventListener("pointerup", up);
      ba.addEventListener("pointercancel", up);
    });

    handle.addEventListener("keydown", (e) => {
      const now = parseFloat(getComputedStyle(ba).getPropertyValue("--pos")) || 50;
      const stepMap = { ArrowLeft: -3, ArrowRight: 3, Home: -100, End: 100 };
      if (e.key in stepMap) {
        e.preventDefault();
        ba.classList.add("ba--interacted");
        set(now + stepMap[e.key]);
      }
    });
  });

  /* ---------- Lightbox-Galerie ---------- */
  const lightbox = $("#lightbox");
  if (lightbox) {
    const img = $("img", lightbox);
    const caption = $("figcaption", lightbox);
    const items = $$("[data-lightbox]");
    let group = [];
    let index = 0;

    const show = (i) => {
      index = (i + group.length) % group.length;
      const link = group[index];
      img.src = link.getAttribute("href");
      img.alt = link.dataset.alt || "";
      caption.textContent = link.dataset.caption || "";
      const multi = group.length > 1;
      $(".lightbox__nav--prev", lightbox).hidden = !multi;
      $(".lightbox__nav--next", lightbox).hidden = !multi;
    };

    items.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        group = items.filter((l) => l.dataset.lightbox === link.dataset.lightbox);
        show(group.indexOf(link));
        lightbox.showModal();
      });
    });

    /* Animiertes Schließen: läuft über alle drei Schließwege (Button, Backdrop-Klick,
       Escape), damit der Fade/Scale-Übergang aus main.css auch beim Schließen greift. */
    const closeAnimated = () => {
      if (!lightbox.open || lightbox.classList.contains("is-closing")) return;
      if (!motionOK) { lightbox.close(); return; }
      lightbox.classList.add("is-closing");
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        lightbox.classList.remove("is-closing");
        lightbox.close();
      };
      lightbox.addEventListener("transitionend", finish, { once: true });
      setTimeout(finish, 350); // Sicherheitsnetz, falls transitionend ausbleibt
    };

    $(".lightbox__close", lightbox).addEventListener("click", closeAnimated);
    $(".lightbox__nav--prev", lightbox).addEventListener("click", () => show(index - 1));
    $(".lightbox__nav--next", lightbox).addEventListener("click", () => show(index + 1));
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeAnimated();
    });
    lightbox.addEventListener("cancel", (e) => {
      e.preventDefault();
      closeAnimated();
    });
    lightbox.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    });
    lightbox.addEventListener("close", () => { img.removeAttribute("src"); });
  }

  /* ---------- Google Maps: Zwei-Klick-Lösung (DSGVO) ---------- */
  const mapBtn = $("#map-load");
  if (mapBtn) {
    mapBtn.addEventListener("click", () => {
      const consent = $(".map-consent");
      const iframe = document.createElement("iframe");
      iframe.className = "map-frame";
      iframe.src =
        "https://www.google.com/maps?q=" +
        encodeURIComponent("Garten- & Landschaftsbau Böttcher, Wippertalstraße 20, 99707 Kyffhäuserkreis") +
        "&output=embed&hl=de";
      iframe.title = "Google Maps: Anfahrt zu Garten- & Landschaftsbau Böttcher";
      iframe.setAttribute("loading", "lazy");
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
      consent.replaceWith(iframe);
    });
  }

  /* ---------- Jahr im Footer ---------- */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
