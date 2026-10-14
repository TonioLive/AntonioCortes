(() => {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const motion = !reduceMotion;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  /* ---------------------------------------------------------------
     Cabecera y menú
     --------------------------------------------------------------- */
  const header = $("[data-header]");
  const navToggle = $("[data-nav-toggle]");
  const navList = $("[data-nav-list]");
  let lastY = window.scrollY;

  const setNav = (open) => {
    navList.classList.toggle("is-open", open);
    header.classList.toggle("is-open", open);
    root.classList.toggle("is-locked", open);
    navToggle.setAttribute("aria-expanded", String(open));
    $(".site-nav__toggle-label", navToggle).textContent = open ? "Cerrar" : "Menú";
    if (open) header.classList.remove("is-hidden");
  };
  navToggle.addEventListener("click", () => setNav(!navList.classList.contains("is-open")));
  navList.addEventListener("click", (e) => { if (e.target.closest("a")) setNav(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navList.classList.contains("is-open")) {
      setNav(false);
      navToggle.focus();
    }
  });
  window.matchMedia("(min-width: 761px)").addEventListener("change", (e) => { if (e.matches) setNav(false); });

  /* ---------------------------------------------------------------
     Contadores
     --------------------------------------------------------------- */
  const countUp = (els, duration = 1500) => {
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      els.forEach((el) => { el.textContent = fmt(Math.round(Number(el.dataset.count) * eased)); });
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const heroCounters = $$("[data-hero] [data-count]");
  const viewCounters = $$("[data-count]").filter((el) => !el.closest("[data-hero]") && !el.closest("[data-app]"));
  if (motion) {
    $$("[data-count]").forEach((el) => { el.textContent = "0"; });
    setTimeout(() => countUp(heroCounters), 1000);
  }

  /* ---------------------------------------------------------------
     Revelados al entrar en pantalla
     --------------------------------------------------------------- */
  // Los elementos recortados con clip-path no se detectan solos: se vigila
  // su contenedor y se revelan todos los que dependen de él.
  const triggers = new Map();
  const addTrigger = (trigger, el) => {
    if (!triggers.has(trigger)) triggers.set(trigger, []);
    triggers.get(trigger).push(el);
  };

  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const targets = triggers.get(entry.target) || [];
      targets.forEach((el) => {
        el.classList.add("is-in");
        const nums = el.matches("[data-count]") ? [el] : $$("[data-count]", el).filter((n) => viewCounters.includes(n));
        if (motion && nums.length) countUp(nums, 1700);
      });
      revealIO.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

  $$("[data-reveal], [data-growth]").forEach((el) => {
    const trigger = el.matches('[data-reveal="media"]') ? el.parentElement : el;
    addTrigger(trigger, el);
  });
  viewCounters.filter((n) => !n.closest("[data-reveal]")).forEach((n) => addTrigger(n, n));
  triggers.forEach((_, trigger) => revealIO.observe(trigger));

  /* ---------------------------------------------------------------
     Recreaciones animadas: ERP, reservas y pedidos
     Solo se mueven mientras están a la vista
     --------------------------------------------------------------- */
  const loops = new Map();
  const startLoop = (el, fn, every) => {
    if (loops.has(el)) return;
    fn();
    loops.set(el, setInterval(fn, every));
  };
  const stopLoop = (el) => { clearInterval(loops.get(el)); loops.delete(el); };

  // ERP
  const app = $("[data-app]");
  if (app) {
    const items = $$(".app__side li", app);
    const flip = $("[data-flip] .pill", app);
    let idx = 0;
    let started = false;
    const tick = () => {
      items.forEach((li) => li.classList.remove("is-active"));
      idx = (idx + 1) % items.length;
      items[idx].classList.add("is-active");
      if (flip) {
        const ok = idx % 3 === 0;
        flip.classList.toggle("is-ok", ok);
        flip.textContent = ok ? "Cobrado" : "Pendiente";
      }
    };
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        app.classList.add("is-live");
        if (!started) {
          started = true;
          if (motion) countUp($$("[data-count]", app), 1600);
        }
        if (motion) startLoop(app, tick, 1700);
      } else {
        stopLoop(app);
      }
    }, { threshold: 0.3 }).observe(app);
  }

  // Reservas
  const booking = $("[data-booking]");
  if (booking && motion) {
    const types = $$(".booking__types li", booking);
    const slots = $$(".booking__slots li", booking);
    let t = 0;
    const setSlot = (li, full) => {
      li.classList.toggle("is-full", full);
      $("span", li).textContent = full ? "Completo" : "Libre";
    };
    slots.forEach((li) => setSlot(li, false));
    const cycle = () => {
      types.forEach((li, i) => li.classList.toggle("is-active", i === t));
      slots.forEach((li) => setSlot(li, false));
      slots.forEach((li, i) => setTimeout(() => setSlot(li, true), 500 + i * 550));
      t = (t + 1) % types.length;
    };
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) startLoop(booking, cycle, 3600);
      else stopLoop(booking);
    }, { threshold: 0.3 }).observe(booking);
  }

  // Pedidos
  const feed = $(".shop__feed");
  if (feed && motion) {
    const shop = feed.closest(".shop");
    const push = () => {
      const last = feed.lastElementChild;
      last.classList.remove("is-new");
      void last.offsetWidth;
      feed.prepend(last);
      last.classList.add("is-new");
    };
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) startLoop(shop, push, 2200);
      else stopLoop(shop);
    }, { threshold: 0.3 }).observe(shop);
  }

  /* ---------------------------------------------------------------
     Efectos ligados al scroll
     --------------------------------------------------------------- */
  const progressHost = header;
  const parallax = $("[data-parallax]");
  const hero = $("[data-hero]");
  const shots = $$("[data-scroll-shot]");
  const timeline = $("[data-timeline]");
  const timelineItems = timeline ? $$(".timeline__item", timeline) : [];

  const onScroll = () => {
    const y = window.scrollY;
    const vh = window.innerHeight;

    // Cabecera
    header.classList.toggle("is-scrolled", y > 24);
    const navOpen = navList.classList.contains("is-open");
    header.classList.toggle("is-hidden", y > lastY && y > 480 && !navOpen);
    lastY = y;
    const max = document.documentElement.scrollHeight - vh;
    progressHost.style.setProperty("--scroll", max > 0 ? (y / max).toFixed(4) : "0");

    if (!motion) return;

    // Foto de portada
    if (parallax && y < hero.offsetHeight) {
      parallax.style.setProperty("--py", `${(y * 0.12).toFixed(1)}px`);
    }

    // Webs que se recorren solas
    shots.forEach((view) => {
      const r = view.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const img = view.firstElementChild;
      const range = img.offsetHeight - view.clientHeight;
      if (range <= 0) return;
      const p = clamp((vh - r.top) / (vh + r.height), 0, 1);
      const eased = clamp((p - 0.18) / 0.64, 0, 1);
      view.style.setProperty("--shot", `${(-eased * range).toFixed(1)}px`);
    });

    // Trayectoria
    if (timeline) {
      const mark = vh * 0.6;
      const r = timeline.getBoundingClientRect();
      if (r.bottom > -50 && r.top < vh + 50) {
        timeline.style.setProperty("--progress", clamp((mark - r.top) / r.height, 0, 1).toFixed(3));
        timelineItems.forEach((item) => item.classList.toggle("is-reached", item.getBoundingClientRect().top + 8 < mark));
      }
    }
  };

  let ticking = false;
  const requestTick = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScroll(); ticking = false; });
  };
  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick, { passive: true });
  window.addEventListener("load", requestTick);
  shots.forEach((view) => view.firstElementChild.addEventListener("load", requestTick));
  onScroll();

  // Sin animaciones, la trayectoria se ve completa
  if (!motion && timeline) {
    timeline.style.setProperty("--progress", "1");
    timelineItems.forEach((item) => item.classList.add("is-reached"));
  }

  /* ---------------------------------------------------------------
     Ratón: foco de luz, inclinación y botones magnéticos
     --------------------------------------------------------------- */
  if (motion && finePointer) {
    if (hero) {
      hero.addEventListener("pointermove", (e) => {
        const r = hero.getBoundingClientRect();
        hero.style.setProperty("--mx", `${e.clientX - r.left}px`);
        hero.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
      hero.addEventListener("pointerenter", () => hero.classList.add("is-pointer"));
      hero.addEventListener("pointerleave", () => hero.classList.remove("is-pointer"));
    }

    $$("[data-tilt]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.classList.add("is-tilting");
        el.style.setProperty("--ry", `${(px * 6).toFixed(2)}deg`);
        el.style.setProperty("--rx", `${(-py * 5).toFixed(2)}deg`);
      });
      el.addEventListener("pointerleave", () => {
        el.classList.remove("is-tilting");
        el.style.setProperty("--ry", "0deg");
        el.style.setProperty("--rx", "0deg");
      });
    });

    $$("[data-magnetic]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${clamp(dx * 0.25, -10, 10)}px, ${clamp(dy * 0.35, -8, 8)}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------------------------------------------------------------
     Carruseles en móvil: barra de progreso
     --------------------------------------------------------------- */
  $$("[data-carousel]").forEach((track) => {
    const hint = track.nextElementSibling;
    const bar = hint && hint.matches(".swipe-hint") ? $("[data-carousel-progress]", hint) : null;
    if (!bar) return;
    const update = () => {
      const p = track.scrollWidth > track.clientWidth
        ? (track.scrollLeft + track.clientWidth) / track.scrollWidth
        : 1;
      bar.style.setProperty("--p", p.toFixed(3));
    };
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
  });

  /* ---------------------------------------------------------------
     Botonera fija en móvil: aparece tras la portada y se oculta en contacto
     --------------------------------------------------------------- */
  const dock = $("[data-dock]");
  const contact = $("[data-contact]");
  if (dock && hero && contact) {
    let heroVisible = true;
    let contactVisible = false;
    const sync = () => dock.classList.toggle("is-visible", !heroVisible && !contactVisible);
    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; sync(); }, { rootMargin: "-40% 0px 0px 0px" }).observe(hero);
    new IntersectionObserver(([e]) => { contactVisible = e.isIntersecting; sync(); }, { threshold: 0.1 }).observe(contact);
  }

  /* ---------------------------------------------------------------
     Copiar correo y año
     --------------------------------------------------------------- */
  const copyBtn = $("[data-copy]");
  const copyStatus = $("[data-copy-status]");
  if (copyBtn && navigator.clipboard) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(copyBtn.dataset.copy);
        copyStatus.textContent = "Correo copiado";
      } catch {
        copyStatus.textContent = "No se pudo copiar. Selecciona el correo y cópialo a mano.";
      }
      clearTimeout(copyBtn._t);
      copyBtn._t = setTimeout(() => { copyStatus.textContent = ""; }, 2500);
    });
  } else if (copyBtn) {
    copyBtn.hidden = true;
  }

  const year = $("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();
