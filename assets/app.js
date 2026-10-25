(function () {
  const root = document.body;
  const page = location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll("pre code[data-lang]").forEach(function (el) {
    if (window.highlightBlock) window.highlightBlock(el);
    const pre = el.parentElement;
    if (!pre || pre.querySelector(".copy")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy";
    btn.textContent = "Copier";
    btn.addEventListener("click", function () {
      const text = el.textContent;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = "Copié";
          setTimeout(function () { btn.textContent = "Copier"; }, 1200);
        }, function () { fallback(text, btn); });
      } else fallback(text, btn);
    });
    pre.appendChild(btn);
  });

  function fallback(text, btn) {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); btn.textContent = "Copié"; } catch (e) { btn.textContent = "Sélectionne le code"; }
    ta.remove();
    setTimeout(function () { btn.textContent = "Copier"; }, 1200);
  }

  document.querySelectorAll("[data-reveal]").forEach(function (btn) {
    const id = btn.getAttribute("aria-controls");
    const panel = document.getElementById(id);
    if (!panel) return;
    const key = "labprep:reveal:" + page + ":" + id;
    function set(open) {
      panel.hidden = !open;
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? btn.getAttribute("data-hide") || "Cacher" : btn.getAttribute("data-show") || "Voir";
      try { localStorage.setItem(key, open ? "1" : "0"); } catch (e) {}
    }
    let saved = false;
    try { saved = localStorage.getItem(key) === "1"; } catch (e) {}
    set(saved);
    btn.addEventListener("click", function () { set(panel.hidden); });
  });

  document.querySelectorAll(".quiz").forEach(function (box) {
    const answer = box.getAttribute("data-answer");
    const why = box.getAttribute("data-why") || "";
    const id = box.getAttribute("data-id");
    const key = "labprep:quiz:" + page + ":" + id;
    const feedback = box.querySelector(".feedback");
    let saved = null;
    try { saved = localStorage.getItem(key); } catch (e) {}
    box.querySelectorAll("button").forEach(function (btn) {
      function mark(choice) {
        const good = choice === answer;
        box.querySelectorAll("button").forEach(function (b) {
          b.setAttribute("aria-pressed", b.getAttribute("data-i") === choice ? "true" : "false");
        });
        if (feedback) {
          feedback.hidden = false;
          feedback.className = "feedback " + (good ? "good" : "bad");
          feedback.textContent = (good ? "Oui. " : "Non. ") + why;
        }
        try { localStorage.setItem(key, choice); } catch (e) {}
        report();
      }
      btn.addEventListener("click", function () { mark(btn.getAttribute("data-i")); });
      if (saved !== null && btn.getAttribute("data-i") === saved) mark(saved);
    });
  });

  document.querySelectorAll(".check input").forEach(function (input) {
    const key = "labprep:check:" + page + ":" + input.getAttribute("data-step");
    try { input.checked = localStorage.getItem(key) === "1"; } catch (e) {}
    input.addEventListener("change", function () {
      try { localStorage.setItem(key, input.checked ? "1" : "0"); } catch (e) {}
      report();
    });
  });

  function report() {
    const checks = document.querySelectorAll(".check input");
    const quizzes = document.querySelectorAll(".quiz");
    let done = 0;
    let total = checks.length + quizzes.length;
    checks.forEach(function (c) { if (c.checked) done++; });
    quizzes.forEach(function (q) {
      try { if (localStorage.getItem("labprep:quiz:" + page + ":" + q.getAttribute("data-id"))) done++; } catch (e) {}
    });
    const bar = document.querySelector("[data-progress]");
    if (bar && total) {
      const pct = Math.round((done / total) * 100);
      bar.querySelector("span").style.width = pct + "%";
      const label = document.querySelector("[data-progress-label]");
      if (label) label.textContent = done + " sur " + total;
    }
    try {
      const map = JSON.parse(localStorage.getItem("labprep:pages") || "{}");
      map[page] = { done: done, total: total };
      localStorage.setItem("labprep:pages", JSON.stringify(map));
    } catch (e) {}
  }
  report();

  document.querySelectorAll("[data-timer]").forEach(function (box) {
    const minutes = Number(box.getAttribute("data-minutes") || "60");
    const marks = (box.getAttribute("data-marks") || "").split(",").filter(Boolean).map(Number);
    const clock = box.querySelector(".clock");
    const start = box.querySelector("[data-start]");
    const pause = box.querySelector("[data-pause]");
    const reset = box.querySelector("[data-reset]");
    let left = minutes * 60;
    let handle = null;
    function paint() {
      const m = Math.floor(left / 60);
      const s = left % 60;
      clock.textContent = String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
      const elapsed = minutes * 60 - left;
      let current = null;
      marks.forEach(function (mark) { if (elapsed >= mark * 60) current = mark; });
      document.querySelectorAll("[data-minute]").forEach(function (row) {
        row.classList.toggle("now", Number(row.getAttribute("data-minute")) === current);
      });
      const open = left === 0;
      document.querySelectorAll("[data-locked]").forEach(function (el) { el.hidden = !open; });
      document.querySelectorAll("[data-lock-note]").forEach(function (el) { el.hidden = open; });
    }
    function tick() {
      if (left > 0) left--;
      paint();
      if (left === 0) { clearInterval(handle); handle = null; }
    }
    if (start) start.addEventListener("click", function () {
      if (handle) return;
      handle = setInterval(tick, 1000);
      start.setAttribute("aria-pressed", "true");
    });
    if (pause) pause.addEventListener("click", function () {
      clearInterval(handle); handle = null;
      if (start) start.setAttribute("aria-pressed", "false");
    });
    if (reset) reset.addEventListener("click", function () {
      clearInterval(handle); handle = null;
      left = minutes * 60;
      if (start) start.setAttribute("aria-pressed", "false");
      paint();
    });
    paint();
  });

  const finder = document.querySelector("[data-finder]");
  if (finder) {
    finder.addEventListener("input", function () {
      const q = finder.value.trim().toLowerCase();
      document.querySelectorAll("[data-find]").forEach(function (row) {
        row.hidden = q.length > 0 && row.getAttribute("data-find").toLowerCase().indexOf(q) === -1;
      });
    });
  }

  const resetSite = document.querySelector("[data-reset-site]");
  if (resetSite) {
    resetSite.addEventListener("click", function () {
      if (!confirm("Effacer les réponses enregistrées sur cet ordinateur ?")) return;
      Object.keys(localStorage).forEach(function (k) {
        if (k.indexOf("labprep:") === 0) localStorage.removeItem(k);
      });
      location.reload();
    });
  }

  document.querySelectorAll("[data-hub]").forEach(function (node) {
    let map = {};
    try { map = JSON.parse(localStorage.getItem("labprep:pages") || "{}"); } catch (e) {}
    const file = node.getAttribute("data-hub");
    const rec = map[file];
    if (!rec || !rec.total) return;
    node.textContent = rec.done + "/" + rec.total;
  });

  document.querySelectorAll(".trace").forEach(function (list) {
    const items = Array.prototype.slice.call(list.querySelectorAll("li"));
    if (!items.length) return;
    let i = 0;
    function paint() {
      items.forEach(function (li, n) {
        li.classList.toggle("on", n === i);
        li.hidden = false;
      });
    }
    const bar = list.parentElement.querySelector(".steps");
    if (!bar) return;
    const prev = bar.querySelector("[data-prev]");
    const next = bar.querySelector("[data-next]");
    if (prev) prev.addEventListener("click", function () { i = Math.max(0, i - 1); paint(); });
    if (next) next.addEventListener("click", function () { i = Math.min(items.length - 1, i + 1); paint(); });
    paint();
  });

  root.addEventListener("keydown", function (e) {
    if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
    if (document.activeElement && /input|textarea|select/i.test(document.activeElement.tagName)) return;
    if (!finder) return;
    e.preventDefault();
    finder.focus();
  });
})();
