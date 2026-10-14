(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------------------------------------------------------------
     Cabecera: fondo al hacer scroll y se oculta al bajar
     --------------------------------------------------------------- */
  const header = document.querySelector("[data-header]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navList = document.querySelector("[data-nav-list]");
  let lastY = window.scrollY;

  const onScrollHeader = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 24);
    const navOpen = navList.classList.contains("is-open");
    const goingDown = y > lastY && y > 480;
    header.classList.toggle("is-hidden", goingDown && !navOpen);
    lastY = y;
  };

  /* Menú móvil */
  const setNav = (open) => {
    navList.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.querySelector(".site-nav__toggle-label").textContent = open ? "Cerrar" : "Menú";
    if (open) header.classList.add("is-scrolled");
  };
  navToggle.addEventListener("click", () => setNav(!navList.classList.contains("is-open")));
  navList.addEventListener("click", (e) => { if (e.target.closest("a")) setNav(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navList.classList.contains("is-open")) {
      setNav(false);
      navToggle.focus();
    }
  });

  /* ---------------------------------------------------------------
     Cifras de la portada: cuentan desde 0 al cargar
     --------------------------------------------------------------- */
  const counters = document.querySelectorAll("[data-count]");
  if (!reduceMotion.matches) {
    counters.forEach((el) => { el.textContent = "0"; });
    setTimeout(() => {
      const start = performance.now();
      const duration = 1400;
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        counters.forEach((el) => {
          el.textContent = String(Math.round(Number(el.dataset.count) * eased));
        });
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 1000);
  }

  /* ---------------------------------------------------------------
     Barras de crecimiento: se completan al entrar en pantalla
     --------------------------------------------------------------- */
  const growth = document.querySelector("[data-growth]");
  if (growth) {
    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      growth.classList.add("is-in");
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            growth.classList.add("is-in");
            io.disconnect();
          }
        });
      }, { threshold: 0.4 });
      io.observe(growth);
    }
  }

  /* ---------------------------------------------------------------
     Línea de la trayectoria ligada al scroll
     --------------------------------------------------------------- */
  const timeline = document.querySelector("[data-timeline]");
  const timelineItems = timeline ? timeline.querySelectorAll(".timeline__item") : [];

  const onScrollTimeline = () => {
    if (!timeline) return;
    const mark = window.innerHeight * 0.6;
    const r = timeline.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (mark - r.top) / r.height));
    timeline.style.setProperty("--progress", p.toFixed(3));
    timelineItems.forEach((item) => {
      item.classList.toggle("is-reached", item.getBoundingClientRect().top + 8 < mark);
    });
  };

  /* Scroll agrupado en un frame */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      onScrollHeader();
      onScrollTimeline();
      ticking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------
     Copiar correo
     --------------------------------------------------------------- */
  const copyBtn = document.querySelector("[data-copy]");
  const copyStatus = document.querySelector("[data-copy-status]");
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

  /* Año del pie */
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();
