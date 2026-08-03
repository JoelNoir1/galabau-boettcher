/* ==========================================================================
   Galabau Böttcher — Erweiterte Effekte (GSAP, optional)
   Reine Zusatzschicht: läuft nur, wenn GSAP + SplitText geladen sind UND der
   Nutzer keine reduzierte Bewegung eingestellt hat. Fällt sonst lautlos auf
   das bestehende CSS-Verhalten aus main.css/main.js zurück — keine Pflicht-
   funktionalität hängt von dieser Datei ab.
   ========================================================================== */
(function () {
  "use strict";

  const motionOK = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
  if (!motionOK) return;
  if (!window.gsap) return;

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const fineHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- 1. Hero: Konturlinien-Draw-in + Zeilen-Reveal der Headline ---------- */
  (function heroEntrance() {
    const hero = $(".hero");
    if (!hero) return;
    const svg = $(".hero__bg svg", hero);
    const h1 = $(".hero__content h1", hero);
    if (!svg && !h1) return;

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    if (svg) {
      const paths = $$("path", svg);
      paths.forEach((p) => {
        const len = p.getTotalLength();
        p.style.strokeDasharray = String(len);
        p.style.strokeDashoffset = String(len);
      });
      tl.to(paths, {
        strokeDashoffset: 0,
        duration: 1.8,
        ease: "power1.inOut",
        stagger: 0.05,
      }, 0);
    }

    if (h1 && window.SplitText) {
      // Erst jetzt (synchron, im selben Zug) die CSS-Entrance des H1 abschalten
      // und per SplitText übernehmen — kein Zeitfenster, in dem der Titel fehlt.
      h1.style.animation = "none";
      gsap.set(h1, { opacity: 1 });
      const split = SplitText.create(h1, { type: "lines", mask: "lines" });
      tl.from(split.lines, {
        yPercent: 110,
        duration: 0.85,
        stagger: 0.08,
      }, 0.15);
    }
  })();

  /* ---------- 2. Magnetische Buttons (nur primäre CTA je Sektion, Desktop) ---------- */
  if (fineHover) {
    const magnets = $$(".hero .btn--lime, .cta-band .btn--lime");
    magnets.forEach((btn) => {
      const xTo = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3.out" });
      const yTo = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3.out" });
      const strength = 0.35;
      const maxPull = 14;
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) * strength;
        const dy = (e.clientY - r.top - r.height / 2) * strength;
        xTo(Math.max(-maxPull, Math.min(maxPull, dx)));
        yTo(Math.max(-maxPull, Math.min(maxPull, dy)));
      });
      btn.addEventListener("mouseleave", () => {
        xTo(0);
        yTo(0);
      });
    });
  }

  /* ---------- 3. Cursor-Ring auf der Projektgalerie (Desktop) ---------- */
  if (fineHover) {
    const galleryLinks = $$(".project-card, .ref-media");
    if (galleryLinks.length) {
      const ring = document.createElement("div");
      ring.className = "gallery-cursor";
      ring.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M15.8 15.8L21 21"/></svg>';
      document.body.appendChild(ring);
      gsap.set(ring, { xPercent: -50, yPercent: -50 });

      const ringX = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3.out" });
      const ringY = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3.out" });
      let active = 0;

      const move = (e) => {
        ringX(e.clientX);
        ringY(e.clientY);
      };
      document.addEventListener("mousemove", move);

      galleryLinks.forEach((el) => {
        el.addEventListener("mouseenter", () => {
          active++;
          gsap.to(ring, { opacity: 1, scale: 1, duration: 0.25, ease: "power2.out" });
        });
        el.addEventListener("mouseleave", () => {
          active = Math.max(0, active - 1);
          if (active === 0) {
            gsap.to(ring, { opacity: 0, scale: 0.7, duration: 0.2, ease: "power2.in" });
          }
        });
      });
    }
  }
})();
