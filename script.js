const state = {
  lang: localStorage.getItem("mikey-lang") || "en",
  theme: localStorage.getItem("mikey-theme") || "dark"
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setTheme(theme) {
  state.theme = theme;
  localStorage.setItem("mikey-theme", theme);
  document.body.classList.toggle("light", theme === "light");
  document.querySelectorAll("[data-theme]").forEach((b) => {
    b.textContent = theme === "light" ? "Dark" : "Light";
    b.setAttribute("aria-label", theme === "light" ? "Switch to dark mode" : "Switch to light mode");
  });
}

function setLanguage(lang) {
  state.lang = lang;
  localStorage.setItem("mikey-lang", lang);
  document.documentElement.lang = lang === "cn" ? "zh-CN" : "en";
  document.body.classList.toggle("lang-cn", lang === "cn");
  document.querySelectorAll("[data-en][data-cn]").forEach((el) => {
    const v = el.dataset[lang];
    if (v) el.textContent = v;
  });
  document.querySelectorAll("[data-lang]").forEach((b) => {
    b.textContent = lang === "cn" ? "EN" : "中文";
    b.setAttribute("aria-label", lang === "cn" ? "Switch to English" : "切换到中文");
  });
}

function tick() {
  const fmt = new Intl.DateTimeFormat(state.lang === "cn" ? "zh-CN" : "en-CA", {
    timeZone: "America/Toronto",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
  });
  const t = `${fmt.format(new Date())} ET`;
  document.querySelectorAll("[data-time]").forEach((el) => { el.textContent = t; });
}

// stagger reveals per section
function revealContent() {
  document.querySelectorAll(
    ".content-grid, .list-stack, .photo-story, .traits-grid, .athlete-grid, .page-index, .link-rows, .device-list"
  ).forEach((section) => {
    section.querySelectorAll(".reveal").forEach((el, i) => {
      el.style.setProperty("--stagger", `${i * 75}ms`);
    });
  });

  const items = document.querySelectorAll(".reveal");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((i) => i.classList.add("visible"));
    return;
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("visible");
      obs.unobserve(e.target);
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });

  items.forEach((i) => obs.observe(i));
}

function watchImages() {
  document.querySelectorAll("img").forEach((img) => {
    const done = () => img.classList.add("image-loaded");
    if (img.complete) done();
    else {
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    }
  });
}

// digital text scramble — runs after element is already visible
function scramble(el, delay = 0) {
  if (prefersReducedMotion || !el) return;

  // digital / technical charset — no normal letters, just symbols and digits
  const digits = "0123456789";
  const syms   = "01_|/\\[]{}#!?≡";
  const chars  = digits + syms;

  const original = el.textContent;
  const preserved = new Set([" ", "\n", ".", ",", "·", "。", "！", "、", "：", "&"]);

  window.setTimeout(() => {
    let frame = 0;
    const total = 36; // ~600ms at 60fps

    // each character gets a random lock-in frame for organic feel
    const lockAt = Array.from({ length: original.length }, (_, i) => {
      const base = (i / original.length) * (total * 0.85);
      return base + Math.random() * (total * 0.18);
    });

    const run = () => {
      let out = "";
      for (let i = 0; i < original.length; i++) {
        const c = original[i];
        if (preserved.has(c)) { out += c; continue; }
        out += (frame >= lockAt[i]) ? c : chars[Math.floor(Math.random() * chars.length)];
      }
      el.textContent = out;
      if (frame < total) { frame++; requestAnimationFrame(run); }
      else el.textContent = original;
    };
    requestAnimationFrame(run);
  }, delay);
}

// toast notification
function showToast(msg) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("visible");
  clearTimeout(toast._t);
  toast._t = window.setTimeout(() => toast.classList.remove("visible"), 2200);
}

function copyText(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.cssText = "position:fixed;opacity:0;pointer-events:none;";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  ta.remove();
}

// custom cursor
function initCursor() {
  if (window.matchMedia("(hover: none)").matches) return;
  if (prefersReducedMotion) return;

  const ring = document.createElement("div");
  ring.className = "cursor-ring";
  const dot = document.createElement("div");
  dot.className = "cursor-dot";
  document.body.appendChild(ring);
  document.body.appendChild(dot);

  let mx = -200, my = -200, rx = -200, ry = -200;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate(${mx - 2}px, ${my - 2}px)`;
  });

  (function loop() {
    rx += (mx - rx) * 0.09;
    ry += (my - ry) * 0.09;
    ring.style.transform = `translate(${rx - 17}px, ${ry - 17}px)`;
    requestAnimationFrame(loop);
  })();

  document.addEventListener("mouseover", (e) => {
    const over = e.target.closest("a, button");
    document.body.classList.toggle("cursor-active", !!over);
  });
}

// page wipe transition
function shouldTransition(e, link) {
  if (!link || e.defaultPrevented) return false;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
  if (link.target && link.target !== "_self") return false;
  const url = new URL(link.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  if (url.pathname === window.location.pathname && url.hash) return false;
  return url.pathname.endsWith(".html") || link.hasAttribute("data-enter") || url.pathname === "/";
}

function transitionTo(href) {
  if (prefersReducedMotion) { window.location.href = href; return; }
  const wipe = document.createElement("div");
  wipe.className = "page-wipe";
  document.body.appendChild(wipe);
  void wipe.offsetWidth;
  wipe.classList.add("page-wipe--in");
  window.setTimeout(() => { window.location.href = href; }, 920);
}

// cover loader counter
function runCounter() {
  const el = document.querySelector(".intro-loader__counter");
  if (!el) return;
  if (prefersReducedMotion) { el.textContent = "100"; return; }
  const start = performance.now();
  const dur = 1000;
  const step = (now) => {
    const p = Math.min(1, (now - start) / dur);
    el.textContent = String(Math.floor(p * 100)).padStart(3, "0");
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = "100";
  };
  requestAnimationFrame(step);
}

function finishIntro() {
  if (!document.body.classList.contains("cover-page")) return;
  const loader = document.querySelector(".intro-loader");
  if (prefersReducedMotion) {
    document.body.classList.add("intro-done");
    loader?.remove();
    return;
  }
  runCounter();
  window.setTimeout(() => document.body.classList.add("intro-done"), 1020);
  window.setTimeout(() => loader?.remove(), 1760);
}

// click handler
document.addEventListener("click", (e) => {
  // copy button
  const copyBtn = e.target.closest("[data-copy]");
  if (copyBtn) {
    e.preventDefault();
    copyText(copyBtn.dataset.copy);
    showToast("Username copied");
    return;
  }

  const langBtn = e.target.closest("[data-lang]");
  if (langBtn) { setLanguage(state.lang === "en" ? "cn" : "en"); tick(); return; }

  const themeBtn = e.target.closest("[data-theme]");
  if (themeBtn) { setTheme(state.theme === "dark" ? "light" : "dark"); return; }

  const link = e.target.closest("a[href]");
  if (!shouldTransition(e, link)) return;
  e.preventDefault();
  transitionTo(link.href);
});

// boot
setTheme(state.theme);
setLanguage(state.lang);
tick();
window.setInterval(tick, 1000);
watchImages();
revealContent();
finishIntro();
initCursor();

requestAnimationFrame(() => {
  // brief hold before revealing content — makes it feel deliberate
  window.setTimeout(() => {
    document.body.classList.add("page-ready");

    // scramble after h1 fadeIn completes
    const heroH1 = document.querySelector(".page-hero h1");
    if (heroH1) scramble(heroH1, 650);

    // cover h1 scramble after clip-path wipe finishes
    const coverH1 = document.querySelector(".cover h1");
    if (coverH1) scramble(coverH1, 2150);
  }, 80);
});
