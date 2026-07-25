(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* —— Logomarca inline (não depende de path quebrado) —— */
  function brandMarkSvg(gradId) {
    return (
      '<svg viewBox="0 0 64 64" width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      "<defs>" +
      '<linearGradient id="' +
      gradId +
      '" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">' +
      '<stop stop-color="#0E2433"/>' +
      '<stop offset="0.55" stop-color="#157A8C"/>' +
      '<stop offset="1" stop-color="#1A9AA8"/>' +
      "</linearGradient>" +
      "</defs>" +
      '<rect width="64" height="64" rx="16" fill="url(#' +
      gradId +
      ')"/>' +
      '<path fill="#FFFFFF" d="M18 34.5 32 22l14 12.5V46a3 3 0 0 1-3 3H21a3 3 0 0 1-3-3V34.5Z"/>' +
      '<path fill="#0E2433" opacity="0.18" d="M28 49h8v-9a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v9Z"/>' +
      '<path fill="none" stroke="#F0A202" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" d="M14 18c8-6 18-6 28 1"/>' +
      '<path fill="#F0A202" d="M40.2 14.4 48.5 19l-6.8 5.2 1.2-4.6 4.1-.8-6.8-4.4Z"/>' +
      "</svg>"
    );
  }

  document.querySelectorAll("[data-brand-mark]").forEach((el, index) => {
    const gradId = "smBrandGrad" + index;
    el.innerHTML = brandMarkSvg(gradId);
    el.setAttribute("aria-hidden", "true");
  });

  /* —— Menu —— */
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector("#nav-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      menu.classList.toggle("is-open", !open);
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        menu.classList.remove("is-open");
      });
    });
  }

  /* —— Reveal on scroll —— */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* —— Tabs —— */
  document.querySelectorAll("[data-tabs]").forEach((root) => {
    const buttons = Array.from(root.querySelectorAll('[role="tab"]'));
    const panels = Array.from(root.querySelectorAll('[role="tabpanel"]'));

    function activate(id) {
      buttons.forEach((btn) => {
        const on = btn.dataset.tab === id;
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-selected", String(on));
        btn.tabIndex = on ? 0 : -1;
      });
      panels.forEach((panel) => {
        const on = panel.dataset.panel === id;
        panel.classList.toggle("is-active", on);
        panel.hidden = !on;
      });
    }

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => activate(btn.dataset.tab));
      btn.addEventListener("keydown", (event) => {
        const index = buttons.indexOf(btn);
        let next = index;
        if (event.key === "ArrowRight") next = (index + 1) % buttons.length;
        if (event.key === "ArrowLeft") next = (index - 1 + buttons.length) % buttons.length;
        if (next !== index) {
          event.preventDefault();
          buttons[next].focus();
          activate(buttons[next].dataset.tab);
        }
      });
    });
  });

  /* —— Carousels —— */
  function initCarousel(root) {
    const track = root.querySelector(".carousel__track");
    const slides = Array.from(root.querySelectorAll(".carousel__slide"));
    const prev = root.querySelector("[data-carousel-prev]");
    const next = root.querySelector("[data-carousel-next]");
    const dotsWrap = root.querySelector("[data-carousel-dots]");
    if (!track || slides.length === 0) return;

    let index = slides.findIndex((slide) => slide.classList.contains("is-active"));
    if (index < 0) index = 0;
    let timer = null;
    const autoplay = root.dataset.carousel === "gallery" && !reduceMotion;

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel__dot" + (i === index ? " is-active" : "");
      dot.setAttribute("aria-label", "Ir para slide " + (i + 1));
      dot.addEventListener("click", () => goTo(i));
      dotsWrap?.appendChild(dot);
    });

    const dots = Array.from(dotsWrap?.querySelectorAll(".carousel__dot") || []);

    function render() {
      track.style.transform = "translateX(-" + index * 100 + "%)";
      slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      render();
      restart();
    }

    function restart() {
      if (!autoplay) return;
      clearInterval(timer);
      timer = setInterval(() => goTo(index + 1), 5200);
    }

    prev?.addEventListener("click", () => goTo(index - 1));
    next?.addEventListener("click", () => goTo(index + 1));

    let startX = 0;
    track.addEventListener(
      "touchstart",
      (event) => {
        startX = event.changedTouches[0].clientX;
      },
      { passive: true }
    );
    track.addEventListener(
      "touchend",
      (event) => {
        const delta = event.changedTouches[0].clientX - startX;
        if (Math.abs(delta) < 40) return;
        goTo(delta < 0 ? index + 1 : index - 1);
      },
      { passive: true }
    );

    root.addEventListener("mouseenter", () => clearInterval(timer));
    root.addEventListener("mouseleave", restart);
    root.addEventListener("focusin", () => clearInterval(timer));
    root.addEventListener("focusout", restart);

    render();
    restart();
  }

  document.querySelectorAll("[data-carousel]").forEach(initCarousel);

  /* —— Opções / resumo —— */
  const optionsRoot = document.querySelector("[data-options]");
  if (optionsRoot) {
    const checks = optionsRoot.querySelectorAll("[data-extra]");
    const list = optionsRoot.querySelector("[data-options-list]");
    const empty = optionsRoot.querySelector("[data-options-empty]");
    const cta = optionsRoot.querySelector("[data-options-cta]");

    function syncOptions() {
      const selected = Array.from(checks)
        .filter((input) => input.checked)
        .map((input) => input.value);

      if (!list || !empty) return;

      list.innerHTML = "";
      if (selected.length === 0) {
        empty.hidden = false;
        list.hidden = true;
      } else {
        empty.hidden = true;
        list.hidden = false;
        selected.forEach((label) => {
          const li = document.createElement("li");
          li.textContent = label;
          list.appendChild(li);
        });
      }

      if (cta) {
        const params = new URLSearchParams();
        if (selected.length) params.set("extras", selected.join("|"));
        const base = "/cadastro/";
        cta.href = params.toString() ? base + "?" + params.toString() : base;
      }
    }

    checks.forEach((input) => input.addEventListener("change", syncOptions));
    syncOptions();
  }

  /* —— Cobertura —— */
  const coverage = document.querySelector("[data-coverage]");
  if (coverage) {
    const chips = coverage.querySelectorAll("[data-region]");
    const cities = coverage.querySelectorAll(".coverage__cities li");

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => c.classList.remove("is-active"));
        chip.classList.add("is-active");
        const region = chip.dataset.region;
        cities.forEach((city) => {
          const match = region === "todas" || city.dataset.regions === region;
          city.classList.toggle("is-dimmed", !match);
          city.classList.toggle("is-hot", match && region !== "todas");
        });
      });
    });
  }

  /* —— FAQ: um aberto por vez —— */
  const faq = document.querySelector("[data-faq]");
  if (faq) {
    const items = faq.querySelectorAll("details");
    items.forEach((item) => {
      item.addEventListener("toggle", () => {
        if (!item.open) return;
        items.forEach((other) => {
          if (other !== item) other.open = false;
        });
      });
    });
  }

  /* —— Voltar ao topo —— */
  const toTop = document.querySelector("[data-to-top]");
  if (toTop) {
    const onScroll = () => {
      toTop.hidden = window.scrollY < 480;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* —— Hero video —— */
  const heroMedia = document.querySelector(".hero__media");
  const heroVideo = document.querySelector("[data-hero-video]");
  if (heroMedia && heroVideo) {
    if (reduceMotion) {
      heroVideo.removeAttribute("autoplay");
      heroVideo.pause();
    } else {
      const markReady = () => heroMedia.classList.add("is-video-ready");
      heroVideo.addEventListener("loadeddata", markReady, { once: true });
      heroVideo.addEventListener("canplay", markReady, { once: true });
      heroVideo.addEventListener("error", () => {
        heroMedia.classList.remove("is-video-ready");
      });
      const playPromise = heroVideo.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => heroMedia.classList.remove("is-video-ready"));
      }
    }
  }

  /* —— Antes e depois —— */
  document.querySelectorAll("[data-before-after]").forEach((root) => {
    const frame = root.querySelector(".ba__frame");
    const beforeWrap = root.querySelector("[data-ba-before]");
    const handle = root.querySelector("[data-ba-handle]");
    const range = root.querySelector("[data-ba-range]");
    const beforeImg = root.querySelector(".ba__img--before");
    if (!frame || !beforeWrap || !range) return;

    function syncFrameWidth() {
      if (beforeImg) {
        beforeImg.style.width = frame.offsetWidth + "px";
      }
    }

    function setPosition(percent) {
      const value = Math.max(0, Math.min(100, percent));
      beforeWrap.style.width = value + "%";
      if (handle) handle.style.left = value + "%";
      range.value = String(Math.round(value));
      range.setAttribute("aria-valuenow", String(Math.round(value)));
    }

    function pointerToPercent(clientX) {
      const rect = frame.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    }

    range.addEventListener("input", () => setPosition(Number(range.value)));

    let dragging = false;
    frame.addEventListener("pointerdown", (event) => {
      dragging = true;
      frame.setPointerCapture(event.pointerId);
      setPosition(pointerToPercent(event.clientX));
    });
    frame.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      setPosition(pointerToPercent(event.clientX));
    });
    frame.addEventListener("pointerup", () => {
      dragging = false;
    });
    frame.addEventListener("pointercancel", () => {
      dragging = false;
    });

    syncFrameWidth();
    setPosition(Number(range.value) || 50);
    window.addEventListener("resize", () => {
      syncFrameWidth();
      setPosition(Number(range.value) || 50);
    });
  });

  /* —— Formulário de contato rápido —— */
  const contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    const feedback = contactForm.querySelector("[data-contact-feedback]");
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(contactForm);
      const payload = {
        nome: String(data.get("nome") || "").trim(),
        telefone: String(data.get("telefone") || "").trim(),
        email: String(data.get("email") || "").trim(),
        mensagem: String(data.get("mensagem") || "").trim(),
      };

      if (!payload.nome || !payload.telefone || !payload.mensagem) {
        if (feedback) {
          feedback.hidden = false;
          feedback.classList.add("is-error");
          feedback.textContent = "Preencha nome, telefone e mensagem.";
        }
        return;
      }

      if (feedback) {
        feedback.hidden = false;
        feedback.classList.remove("is-error");
        feedback.textContent = "Enviando…";
      }

      try {
        const response = await fetch("/api/contato", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(json.message || "Não foi possível enviar.");
        }

        if (feedback) {
          feedback.classList.remove("is-error");
          feedback.textContent =
            "Mensagem enviada! Nossa equipe responde em breve.";
        }
        contactForm.reset();
      } catch (error) {
        if (feedback) {
          feedback.classList.add("is-error");
          feedback.textContent =
            (error && error.message) ||
            "API indisponível. Use o WhatsApp ao lado ou suba o servidor.";
        }
      }
    });
  }

  /* —— Ano no rodapé —— */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
})();
