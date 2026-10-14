(() => {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

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
     Filtro de proyectos
     --------------------------------------------------------------- */
  const filters = document.querySelectorAll("[data-filter]");
  const projects = document.querySelectorAll("[data-project-list] .project");
  const filterStatus = document.querySelector("[data-filter-status]");

  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.dataset.filter;
      filters.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      let shown = 0;
      projects.forEach((p) => {
        const match = value === "all" || p.dataset.areas.split(" ").includes(value);
        p.classList.toggle("is-filtered", !match);
        p.classList.remove("is-entering");
        if (match) {
          shown += 1;
          if (!reduceMotion.matches) {
            void p.offsetWidth; // reinicia la animación
            p.classList.add("is-entering");
          }
        }
      });
      filterStatus.textContent = `${shown} ${shown === 1 ? "proyecto" : "proyectos"}`;
    });
  });

  /* ---------------------------------------------------------------
     Vista previa que sigue al cursor (solo ratón)
     --------------------------------------------------------------- */
  const preview = document.querySelector("[data-preview]");
  let previewOn = false;
  let rafId = null;
  const pos = { x: 0, y: 0, tx: 0, ty: 0, tilt: 0 };

  const tick = () => {
    const dx = pos.tx - pos.x;
    pos.x += dx * 0.16;
    pos.y += (pos.ty - pos.y) * 0.16;
    pos.tilt += (Math.max(-6, Math.min(6, dx * 0.08)) - pos.tilt) * 0.12;
    preview.style.setProperty("--x", `${pos.x.toFixed(1)}px`);
    preview.style.setProperty("--y", `${pos.y.toFixed(1)}px`);
    preview.style.setProperty("--tilt", `${pos.tilt.toFixed(2)}deg`);
    rafId = requestAnimationFrame(tick);
  };

  const setTarget = (e) => {
    const w = preview.offsetWidth || 380;
    const h = preview.offsetHeight || 240;
    const gap = 28;
    let x = e.clientX + gap;
    if (x + w > window.innerWidth - 16) x = e.clientX - w - gap;
    let y = e.clientY - h / 2;
    y = Math.max(16, Math.min(window.innerHeight - h - 16, y));
    pos.tx = x;
    pos.ty = y;
  };

  const onEnter = (e) => {
    const media = e.currentTarget.querySelector(".project__media");
    if (!media) return;
    preview.replaceChildren(...Array.from(media.children, (n) => n.cloneNode(true)));
    setTarget(e);
    if (!preview.classList.contains("is-visible")) {
      pos.x = pos.tx;
      pos.y = pos.ty;
    }
    preview.classList.add("is-visible");
    if (rafId === null) rafId = requestAnimationFrame(tick);
  };

  const onLeave = () => {
    preview.classList.remove("is-visible");
    setTimeout(() => {
      if (!preview.classList.contains("is-visible") && rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }, 300);
  };

  const enablePreview = () => {
    const want = finePointer.matches && !reduceMotion.matches;
    if (want === previewOn) return;
    previewOn = want;
    root.classList.toggle("has-preview", want);
    projects.forEach((p) => {
      if (want) {
        p.addEventListener("mouseenter", onEnter);
        p.addEventListener("mousemove", setTarget);
        p.addEventListener("mouseleave", onLeave);
      } else {
        p.removeEventListener("mouseenter", onEnter);
        p.removeEventListener("mousemove", setTarget);
        p.removeEventListener("mouseleave", onLeave);
      }
    });
    if (!want) onLeave();
  };
  enablePreview();
  finePointer.addEventListener("change", enablePreview);
  reduceMotion.addEventListener("change", enablePreview);

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

  /* ---------------------------------------------------------------
     Scroll agrupado en un frame
     --------------------------------------------------------------- */
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
