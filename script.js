// mikey site - theme + lang toggles, ET clock, scroll reveals, faq, copy handle

const lang = localStorage.getItem("mikey-lang") || "en";
let theme = localStorage.getItem("mikey-theme");
if (!theme) {
  theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setTheme(t) {
  theme = t;
  localStorage.setItem("mikey-theme", t);
  document.body.classList.toggle("dark", t === "dark");
}

function setLang(l) {
  localStorage.setItem("mikey-lang", l);
  document.documentElement.lang = l === "cn" ? "zh-CN" : "en";
  document.body.classList.toggle("lang-cn", l === "cn");
  document.querySelectorAll("[data-en][data-cn]").forEach((el) => {
    const v = el.dataset[l];
    if (v) el.textContent = v;
  });
  // toggle button shows the *other* language
  document.querySelectorAll("[data-lang]").forEach((b) => {
    b.textContent = l === "cn" ? "EN" : "中文";
  });
  current = l;
}

let current = lang;

// ET clock
function tick() {
  const f = new Intl.DateTimeFormat(current === "cn" ? "zh-CN" : "en-CA", {
    timeZone: "America/Toronto",
    hour: "2-digit", minute: "2-digit", hour12: false
  });
  const t = f.format(new Date()) + " ET";
  document.querySelectorAll("[data-time]").forEach((el) => (el.textContent = t));
}

// scroll reveals
function initReveals() {
  const items = document.querySelectorAll(".reveal");
  if (reduced || !("IntersectionObserver" in window)) {
    items.forEach((i) => i.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  // stagger items that share a parent grid
  document.querySelectorAll(".cards-3, .travel__grid, .setup-grid, .gallery, .about__facts, .stats").forEach((grid) => {
    grid.querySelectorAll(".reveal").forEach((el, i) => el.style.setProperty("--d", `${i * 70}ms`));
  });

  items.forEach((i) => io.observe(i));
}

// active nav link
function initNavSpy() {
  const links = [...document.querySelectorAll(".nav__links a")];
  const map = {};
  links.forEach((a) => {
    const id = a.getAttribute("href").slice(1);
    const sec = document.getElementById(id);
    if (sec) map[id] = a;
  });
  if (!("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((l) => l.classList.remove("is-active"));
      map[e.target.id]?.classList.add("is-active");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  Object.values(map).forEach((a) => {
    const sec = document.getElementById(a.getAttribute("href").slice(1));
    if (sec) io.observe(sec);
  });
}

// faq accordion
function initFaq() {
  document.querySelectorAll(".faq__q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      const panel = btn.nextElementSibling;
      btn.setAttribute("aria-expanded", String(!open));
      panel.style.maxHeight = open ? "0px" : panel.scrollHeight + "px";
    });
  });
}

// toast + copy
let toastTimer;
function toast(msg) {
  let t = document.querySelector(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2000);
}

// clicks: toggles + copy
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-theme]")) {
    setTheme(theme === "dark" ? "light" : "dark");
    return;
  }
  if (e.target.closest("[data-lang]")) {
    setLang(current === "cn" ? "en" : "cn");
    tick();
    return;
  }
  const copyBtn = e.target.closest("[data-copy]");
  if (copyBtn) {
    const txt = copyBtn.dataset.copy;
    navigator.clipboard?.writeText(txt).catch(() => {});
    toast(current === "cn" ? "已复制用户名" : "Handle copied");
  }
});

// boot
setTheme(theme);
setLang(lang);
tick();
setInterval(tick, 1000 * 20);
initReveals();
initNavSpy();
initFaq();
