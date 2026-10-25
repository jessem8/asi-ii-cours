(function () {
  const deck = document.getElementById("deck");
  if (!deck) return;
  let cards = [];
  try { cards = JSON.parse(deck.getAttribute("data-cards")); } catch (e) { return; }
  const face = document.getElementById("face");
  const meta = document.getElementById("card-meta");
  const key = "labprep:leitner";
  let state = {};
  try { state = JSON.parse(localStorage.getItem(key) || "{}"); } catch (e) {}
  cards.forEach(function (c) { if (!state[c.id]) state[c.id] = 1; });
  let order = [];
  let index = 0;
  let shown = false;

  function due() {
    return cards.slice().sort(function (a, b) { return state[a.id] - state[b.id]; });
  }
  function counts() {
    const n = [0, 0, 0, 0];
    cards.forEach(function (c) { n[state[c.id]]++; });
    meta.textContent = "Boîte 1 : " + n[1] + "    Boîte 2 : " + n[2] + "    Boîte 3 : " + n[3];
  }
  function show() {
    order = due();
    const card = order[index] || order[0];
    if (!card) return;
    shown = false;
    face.classList.remove("show");
    face.querySelector(".front").textContent = card.front;
    face.querySelector(".back").textContent = card.back;
    counts();
  }
  face.addEventListener("click", function () {
    shown = !shown;
    face.classList.toggle("show", shown);
  });
  face.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); face.click(); }
  });
  document.getElementById("again").addEventListener("click", function () {
    const card = order[index];
    state[card.id] = 1;
    localStorage.setItem(key, JSON.stringify(state));
    index = (index + 1) % cards.length;
    show();
  });
  document.getElementById("knew").addEventListener("click", function () {
    const card = order[index];
    state[card.id] = Math.min(3, state[card.id] + 1);
    localStorage.setItem(key, JSON.stringify(state));
    index = (index + 1) % cards.length;
    show();
  });
  show();
})();
