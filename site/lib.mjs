import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const NAV = [
  ["Cours", [
    ["lessons/01-boot-maven.html", "1. Spring Boot et Maven"],
    ["lessons/02-entites.html", "2. Entités"],
    ["lessons/03-lombok.html", "3. Lombok"],
    ["lessons/04-associations.html", "4. Associations"],
    ["lessons/05-jparepository.html", "5. JpaRepository"],
    ["lessons/06-injection.html", "6. Injection"],
    ["lessons/07-rest.html", "7. REST et Postman"],
  ]],
  ["Préparer", [
    ["index.html", "Par où commencer"],
    ["reference/battle-plan.html", "Plan des 60 minutes"],
    ["reference/cheat-sheet.html", "Fiche"],
    ["reference/shortcuts.html", "Raccourcis"],
    ["reference/flashcards.html", "Cartes"],
    ["reference/error-doctor.html", "Erreurs"],
    ["reference/glossary.html", "Mots du cours"],
  ]],
  ["S'entraîner", [
    ["labs/lab-1-bibliotheque.html", "Labo 1 Bibliothèque"],
    ["labs/lab-2-clinique.html", "Labo 2 Clinique"],
    ["labs/lab-3-projets.html", "Labo 3 Projets"],
    ["labs/lab-4-evenements.html", "Labo 4 Événements"],
    ["labs/lab-5-examen-blanc.html", "Labo 5 Examen blanc"],
  ]],
];

export function words(s) {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function attr(s) {
  return esc(s).replace(/"/g, "&quot;");
}

export const quizErrors = [];

export function quiz(id, answer, why, legend, options) {
  const counts = options.map(words);
  const n = counts[0];
  if (counts.some((c) => c !== n)) {
    quizErrors.push(`${id}: ${counts.join(",")} :: ${options.join(" | ")}`);
  }
  const buttons = options.map((o, i) => `<button type="button" data-i="${i}">${esc(o)}</button>`).join("");
  return `<fieldset class="quiz" data-id="${id}" data-answer="${answer}" data-why="${attr(why)}"><legend>${esc(legend)}</legend>${buttons}<p class="feedback" hidden></p></fieldset>`;
}

export function reveal(id, show, inner) {
  return `<p><button type="button" data-reveal data-show="${attr(show)}" data-hide="Cacher" aria-expanded="false" aria-controls="${id}">${esc(show)}</button></p><div id="${id}" hidden>${inner}</div>`;
}

export function code(lang, src) {
  return `<pre><code data-lang="${lang}">${esc(src.trim())}</code></pre>`;
}

export function writePage(file, title, body, extraScripts = []) {
  const dir = path.posix.dirname(file);
  const rel = (target) => path.posix.relative(dir, target);
  const links = NAV.map(([group, items]) => {
    const a = items.map(([href, label]) => {
      const current = href === file ? ' aria-current="page"' : "";
      return `<a href="${rel(href)}"${current}>${label}</a>`;
    }).join("");
    return `<p>${group}</p>${a}`;
  }).join("");
  const scripts = ["assets/highlight.js", "assets/app.js", ...extraScripts]
    .map((s) => `<script src="${rel(s)}"></script>`)
    .join("");
  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<link rel="stylesheet" href="${rel("assets/app.css")}">
</head>
<body>
<a class="skip" href="#content">Aller au contenu</a>
<header class="mast">
  <a class="brand" href="${rel("index.html")}">ASI II <span>le cours</span></a>
  <p class="hour">60 minutes, 3 entités, sur ta machine</p>
</header>
<div class="layout">
  <nav class="rail" aria-label="Cours">${links}</nav>
  <main id="content">
${body}
  </main>
</div>
${scripts}
</body>
</html>
`;
  const abs = path.join(root, file);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, html);
  console.log(file);
}
