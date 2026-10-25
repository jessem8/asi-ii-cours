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
    const choices = Array.from(box.querySelectorAll("button[data-i]"));
    const right = choices.find(function (b) { return b.getAttribute("data-i") === answer; });
    if (!right) return;
    if (feedback) {
      feedback.setAttribute("role", "status");
      feedback.setAttribute("aria-live", "polite");
    }

    function mark(choice, persist) {
      const good = choice === answer;
      choices.forEach(function (btn) {
        const selected = btn.getAttribute("data-i") === choice;
        btn.setAttribute("aria-pressed", selected ? "true" : "false");
        btn.dataset.state = selected ? (good ? "correct" : "incorrect") : "idle";
        if (!good && btn === right) btn.dataset.state = "answer";
      });
      if (feedback) {
        feedback.hidden = false;
        feedback.className = "feedback " + (good ? "good" : "bad");
        feedback.textContent = good
          ? "Correct. " + why
          : "Pas encore. Bonne réponse : " + right.textContent.trim() + ". " + why;
      }
      if (persist) {
        try { localStorage.setItem(key, choice); } catch (e) {}
        report();
      }
    }

    choices.forEach(function (btn) {
      btn.addEventListener("click", function () { mark(btn.getAttribute("data-i"), true); });
    });
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null && choices.some(function (b) { return b.getAttribute("data-i") === saved; })) mark(saved, false);
    } catch (e) {}
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
      try { if (localStorage.getItem("labprep:quiz:" + page + ":" + q.getAttribute("data-id")) === q.getAttribute("data-answer")) done++; } catch (e) {}
    });
    const bar = document.querySelector("[data-progress]");
    if (bar && total) {
      const pct = Math.round((done / total) * 100);
      bar.querySelector("span").style.width = pct + "%";
      bar.setAttribute("role", "progressbar");
      bar.setAttribute("aria-label", "Progression de la page");
      bar.setAttribute("aria-valuemin", "0");
      bar.setAttribute("aria-valuemax", String(total));
      bar.setAttribute("aria-valuenow", String(done));
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

  const rail = document.querySelector(".rail");
  if (rail) {
    rail.id = rail.id || "course-navigation";
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "nav-toggle";
    toggle.textContent = "Afficher le sommaire";
    toggle.setAttribute("aria-controls", rail.id);
    toggle.setAttribute("aria-expanded", "false");
    rail.parentNode.insertBefore(toggle, rail);
    root.classList.add("nav-ready");
    toggle.addEventListener("click", function () {
      const open = rail.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Masquer le sommaire" : "Afficher le sommaire";
    });
  }

  const dashboard = document.querySelector("[data-study-dashboard]");
  if (dashboard) {
    let progress = {};
    try { progress = JSON.parse(localStorage.getItem("labprep:pages") || "{}"); } catch (e) {}
    const items = Array.from(dashboard.querySelectorAll("[data-hub]"));
    let done = 0;
    let total = 0;
    let next = null;
    items.forEach(function (item) {
      const file = item.getAttribute("data-hub");
      const expected = Number(item.getAttribute("data-total") || "0");
      const record = progress[file] || {};
      const count = Math.max(0, Math.min(expected, Number(record.done) || 0));
      done += count;
      total += expected;
      item.textContent = count + " / " + expected;
      if (count === expected) item.classList.add("complete");
      else if (!next) next = item.closest("li").querySelector("a");
    });
    const summary = dashboard.querySelector("[data-study-summary]");
    if (summary) summary.textContent = done + " / " + total + " réponses validées";
    const bar = dashboard.querySelector("[data-study-bar]");
    if (bar) {
      bar.style.width = (total ? Math.round(done / total * 100) : 0) + "%";
    }
    const link = dashboard.querySelector("[data-next-lesson]");
    if (link) {
      link.href = next ? next.getAttribute("href") : "reference/battle-plan.html";
      link.textContent = next ? "Reprendre : " + next.textContent.trim() : "Tout est validé : réviser le plan";
    }
  }

  // Visual teaching components load relative to app.js so GitHub Pages subpaths work offline.
  const visualScript = document.createElement("script");
  visualScript.src = new URL("visual-learning.js", document.currentScript.src).href;
  document.body.appendChild(visualScript);

  root.addEventListener("keydown", function (e) {
    if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
    if (document.activeElement && /input|textarea|select/i.test(document.activeElement.tagName)) return;
    if (!finder) return;
    e.preventDefault();
    finder.focus();
  });
})();
