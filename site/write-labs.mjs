import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { quiz, reveal, code, writePage, root } from "./lib.mjs";

const verify = path.resolve(root, "..", "lab-prep-verify");
const manifest = JSON.parse(readFileSync(path.join(verify, "results", "manifest.json"), "utf8"));

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function orderKey(file) {
  const n = file.replace(/\\/g, "/");
  if (n.endsWith("student-application.properties")) return "0";
  if (n.includes("/entity/") && n.endsWith("enum") === false && /enum /.test(readFileSync(file, "utf8").slice(0, 80)) === false && n.includes("Type") ) return "1" + path.basename(n);
  if (n.includes("/entity/") && readFileSync(file, "utf8").includes("public enum")) return "1" + path.basename(n);
  if (n.includes("/entity/")) return "2" + path.basename(n);
  if (n.includes("/repository/")) return "3" + path.basename(n);
  if (n.includes("/service/I")) return "4" + path.basename(n);
  if (n.includes("/service/")) return "5" + path.basename(n);
  if (n.includes("/control/")) return "6" + path.basename(n);
  return "9";
}

function solutionHtml(dirName) {
  const base = path.join(verify, dirName);
  const files = walk(base).filter((f) => {
    const n = f.replace(/\\/g, "/");
    if (n.endsWith("student-application.properties")) return true;
    if (!n.includes("/src/main/java/")) return false;
    if (n.endsWith("Application.java")) return false;
    return n.endsWith(".java");
  });
  files.sort((a, b) => orderKey(a).localeCompare(orderKey(b)));
  return files.map((f) => {
    let src = readFileSync(f, "utf8");
    if (f.endsWith(".properties")) {
      src = src.replace(/password=.*/g, "password=<the MAMP MySQL password>");
    }
    const lang = f.endsWith(".properties") ? "properties" : "java";
    const name = path.basename(f);
    const id = dirName + "-" + name.replace(/\W/g, "");
    return reveal(id, name, code(lang, src));
  }).join("\n");
}

function samples(dirName) {
  const lab = manifest.find((m) => m.dir === dirName);
  return Object.entries(lab.files).map(([name, info]) => {
    const pathName = name.charAt(0).toLowerCase() + name.slice(1);
    const many = name.endsWith("s") ? name : name + "s";
    const url = `http://localhost:8089${lab.context}/${pathName}/add-${pathName}`;
    return `<h3>${name}</h3><p><code>POST ${url}</code></p>${code("json", JSON.stringify(info.sample, null, 2))}
<p>Puis GET <code>http://localhost:8089${lab.context}/${pathName}/retrieve-all-${many.charAt(0).toLowerCase()}${many.slice(1)}</code>, GET avec un id, PUT <code>modify-${pathName}</code> avec l'id rempli, DELETE <code>remove-${pathName}/{id}</code>.</p>`;
  }).join("\n");
}

const timer = `<div class="timer-bar" data-timer data-minutes="60" data-marks="0,6,10,22,32,38,48,56">
  <p class="clock" aria-live="polite">60:00</p>
  <button type="button" data-start>Commencer</button>
  <button type="button" data-pause>Pause</button>
  <button type="button" data-reset>Remettre à zéro</button>
</div>`;

function steps(items) {
  return items.map((text, i) => `<label class="check"><input type="checkbox" data-step="s${i}"> ${text}</label>`).join("");
}

function box(title, rows) {
  const body = rows.map(([x, y, w, h, t]) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#f6fafc" stroke="#143652"/>` +
    `<text x="${x + w / 2}" y="${y + 22}" text-anchor="middle" font-size="14" fill="#17212b">${t}</text>`
  ).join("");
  return `<svg class="diagram" viewBox="0 0 680 180" role="img" aria-label="${title}">${body}</svg>`;
}

const schemaNote = `<p class="cite">MySQL n'était pas démarré quand ces pages ont été écrites. Cette liste suit la règle déjà vue dans tpfoyerdb : idChambre devient id_chambre, typeC devient typec. Les cinq projets compilent avec le JDK 21.</p>`;

const labs = [
  {
    file: "labs/lab-1-bibliotheque.html",
    title: "Lab 1 — Bibliothèque",
    dir: "ex1-bibliotheque",
    lock: false,
    lede: "Un vers plusieurs dans les deux sens, et plusieurs vers plusieurs dans les deux sens. Ouvre la solution quand tu bloques.",
    statement: `Travail à faire. Créer une application Spring Boot (Maven, Java 21) avec Spring Web, Spring Data JPA, MySQL Driver et Lombok. Base bibliodb, port 8089, context path /biblio.

Entités, package entity, Lombok sur chaque classe :
Bibliotheque (idBibliotheque Long généré, nom, adresse).
Livre (idLivre Long généré, titre, genre de type enum Genre { ROMAN, ESSAI, POESIE }, datePublication de type Date).
Auteur (idAuteur Long généré, nom, prenom).

Associations :
Une bibliothèque contient plusieurs livres. Bidirectionnelle. Le livre est le fils.
Un livre est écrit par plusieurs auteurs et un auteur écrit plusieurs livres. Bidirectionnelle. L'auteur est le fils.

Package repository, package service (interface + implémentation), package control. CRUD Postman pour chaque entité.`,
    diagram: box("Bibliotheque Livre Auteur", [
      [20, 40, 170, 70, "Bibliotheque"],
      [250, 40, 150, 90, "Livre"],
      [470, 40, 150, 70, "Auteur"],
    ]) + "<p>1 — * entre Bibliotheque et Livre. * — * entre Livre et Auteur. Livre et Auteur sont les fils.</p>",
    tables: `<ul>
<li>bibliotheque (id_bibliotheque, nom, adresse)</li>
<li>livre (id_livre, titre, genre, date_publication, bibliotheque_id_bibliotheque)</li>
<li>auteur (id_auteur, nom, prenom)</li>
<li>livre_auteurs (livres_id_livre, auteurs_id_auteur)</li>
</ul>`,
    steps: [
      "Projet Maven, Java 21, les quatre dépendances, SDK 21.",
      "application.properties : bibliodb, port 8089, /biblio, show-sql, update, la ligne Jackson.",
      "Enum Genre et les trois entités, sans association. Lancer. Trois tables.",
      "Associations. Livre est le fils des deux liens. Relancer. Quatre tables.",
      "Trois repositories. JpaRepository, le bon type d'id.",
      "Trois interfaces de service et trois implémentations.",
      "Trois controllers. Cinq mappings chacun.",
      "Postman : un CRUD complet sur Bibliotheque, puis Livre, puis Auteur.",
    ],
    hints: [
      "Le fils Livre porte @ManyToOne Bibliotheque bibliotheque. Bibliotheque porte @OneToMany(mappedBy = \"bibliotheque\") et @JsonIgnore.",
      "Le fils Auteur porte @ManyToMany(mappedBy = \"auteurs\") et @JsonIgnore. Livre porte @ManyToMany Set auteurs.",
      "genre est un enum STRING. datePublication est @Temporal DATE. La colonne de la date est date_publication.",
    ],
  },
  {
    file: "labs/lab-2-clinique.html",
    title: "Lab 2 — Clinique",
    dir: "ex2-clinique",
    lock: false,
    lede: "Un vers plusieurs dans les deux sens, et plusieurs vers plusieurs dans un seul sens. Le boolean disponible doit être dans le JSON.",
    statement: `Travail à faire. Même socle technique. Base cliniquedb, port 8089, context path /clinique.

Clinique (idClinique Long généré, nom, adresse).
Medecin (idMedecin Long généré, nom, prenom, specialite enum Specialite { CARDIO, PNEUMO, DERMATO }, disponible boolean).
Patient (idPatient Long généré, nom, prenom, cin Long).

Une clinique emploie plusieurs médecins. Bidirectionnelle. Le médecin est le fils.
Un médecin suit plusieurs patients, un patient peut être suivi par plusieurs médecins. Unidirectionnelle, seulement depuis Medecin.

Repository, service, controller, Postman.`,
    diagram: box("Clinique", [
      [20, 40, 160, 70, "Clinique"],
      [250, 40, 160, 100, "Medecin"],
      [480, 40, 150, 70, "Patient"],
    ]) + "<p>1 — * dans les deux sens. * — * seulement depuis Medecin. Pas de champ sur Patient.</p>",
    tables: `<ul>
<li>clinique (id_clinique, nom, adresse)</li>
<li>medecin (id_medecin, nom, prenom, specialite, disponible, clinique_id_clinique)</li>
<li>patient (id_patient, nom, prenom, cin)</li>
<li>medecin_patients (medecin_id_medecin, patients_id_patient)</li>
</ul>`,
    steps: [
      "Projet, properties, premier run vide.",
      "Enum et trois entités. Le boolean disponible est un boolean primitif, pas Boolean.",
      "Associations. Patient n'a pas de collection.",
      "Repositories, services, controllers.",
      "POST medecin avec disponible true ou false. Sans la ligne Jackson, un boolean absent répond 400.",
    ],
    hints: [
      "Pas de mappedBy sur patients. @ManyToMany Set Patient patients sur Medecin seulement. Cela crée une join table.",
      "Medecin est le fils de Clinique : @ManyToOne Clinique clinique, et @JsonIgnore sur la collection de Clinique.",
    ],
  },
  {
    file: "labs/lab-3-projets.html",
    title: "Lab 3 — Projets",
    dir: "ex3-projets",
    lock: false,
    lede: "Un vers un dans les deux sens, un id String, et un vers plusieurs dans un seul sens.",
    statement: `Travail à faire. Base projetsdb, port 8089, context path /projets.

Equipe (idEquipe Long généré, nomEquipe).
Projet (idProjet String, sans génération, nomProjet).
Developpeur (idDeveloppeur Long généré, nom, prenom).

Une équipe réalise un seul projet, un projet est réalisé par une seule équipe. Bidirectionnelle. Le projet est le fils.
Une équipe contient plusieurs développeurs. Unidirectionnelle, depuis Equipe.

Repository de Projet : JpaRepository avec String. Le POST envoie idProjet.`,
    diagram: box("Equipe Projet", [
      [30, 40, 160, 80, "Equipe"],
      [260, 40, 160, 70, "Projet"],
      [490, 40, 160, 70, "Developpeur"],
    ]) + "<p>1 — 1, Projet est le fils. 1 — * dans un seul sens vers Developpeur.</p>",
    tables: `<ul>
<li>equipe (id_equipe, nom_equipe, projet_id_projet)</li>
<li>projet (id_projet varchar, nom_projet)</li>
<li>developpeur (id_developpeur, nom, prenom)</li>
<li>equipe_developpeurs (equipe_id_equipe, developpeurs_id_developpeur). La colonne developpeurs est la clé primaire.</li>
</ul>`,
    steps: [
      "Trois entités. idProjet est un String avec @Id et sans @GeneratedValue.",
      "OneToOne : Equipe possède projet. Projet a mappedBy et @JsonIgnore.",
      "OneToMany sans mappedBy vers Developpeur. Une join table, pas une foreign key sur developpeur.",
      "POST projet avec un idProjet que tu choisis, par exemple P-2026-01.",
    ],
    hints: [
      "La clé étrangère projet_id_projet est sur equipe, parce que Equipe est le propriétaire du OneToOne.",
      "Developpeur n'a aucun champ d'association.",
    ],
  },
  {
    file: "labs/lab-4-evenements.html",
    title: "Lab 4 — Événements",
    dir: "ex4-evenements",
    lock: false,
    lede: "Plusieurs vers un dans un seul sens, et plusieurs vers plusieurs dans les deux sens. Pas de table de jointure pour le club.",
    statement: `Travail à faire. Base eventsdb, port 8089, context path /events.

Club (idClub Long généré, nomClub, adresse).
Evenement (idEvenement Long généré, titre, dateEvent Date).
Participant (idParticipant Long généré, nom, prenom).

Un événement appartient à un club. Unidirectionnelle, depuis Evenement. Club n'a pas de collection.
Un événement accueille plusieurs participants, un participant inscrit plusieurs événements. Bidirectionnelle. Le participant est le fils.`,
    diagram: box("Events", [
      [20, 40, 140, 70, "Club"],
      [230, 30, 180, 100, "Evenement"],
      [480, 40, 160, 70, "Participant"],
    ]) + "<p>* — 1 de Evenement vers Club, sans retour. * — * , Participant est le fils.</p>",
    tables: `<ul>
<li>club (id_club, nom_club, adresse)</li>
<li>evenement (id_evenement, titre, date_event, club_id_club)</li>
<li>participant (id_participant, nom, prenom)</li>
<li>evenement_participants (evenements_id_evenement, participants_id_participant)</li>
</ul>`,
    steps: [
      "Entités et la date. Pas d'enum dans ce sujet.",
      "@ManyToOne Club club sur Evenement. Rien sur Club.",
      "ManyToMany. Evenement possède participants. Participant est mappedBy et @JsonIgnore.",
      "Vérifier qu'il n'existe pas de join table club_evenements.",
    ],
    hints: [
      "Une flèche many-to-one seule ne crée pas de join table. La colonne est club_id_club.",
      "Le nom de la join table commence par l'entité propriétaire : evenement_participants.",
    ],
  },
  {
    file: "labs/lab-5-examen-blanc.html",
    title: "Lab 5 — Examen blanc",
    dir: "ex5-stages",
    lock: true,
    lede: "Lis le sujet. Lance le chrono. Les indices et la solution restent fermés jusqu'à 00:00.",
    statement: `Examen blanc. 60 minutes. Base stagesdb, port 8089, context path /stages. Trois entités, deux associations, repository, service, controller, un CRUD Postman.

Entreprise (idEntreprise Long généré, nom, adresse).
Offre (idOffre Long généré, titre, typeO enum TypeOffre { STAGE, ALTERNANCE, CDI }, dateDebut Date, publiee boolean).
Candidat (idCandidat Long généré, nom, prenom).

Une entreprise publie plusieurs offres. Bidirectionnelle. L'offre est le fils.
Une offre concerne plusieurs candidats, un candidat répond à plusieurs offres. Bidirectionnelle. Le candidat est le fils.

Le champ typeO se termine par une majuscule. Rappelle-toi la colonne de typeC dans tpfoyerdb.`,
    diagram: box("Stages", [
      [20, 40, 170, 70, "Entreprise"],
      [250, 30, 160, 110, "Offre"],
      [470, 40, 160, 70, "Candidat"],
    ]) + "<p>1 — * , Offre est le fils. * — * , Candidat est le fils.</p>",
    tables: `<ul>
<li>entreprise (id_entreprise, nom, adresse)</li>
<li>offre (id_offre, titre, typeo, date_debut, publiee, entreprise_id_entreprise)</li>
<li>candidat (id_candidat, nom, prenom)</li>
<li>offre_candidats (offres_id_offre, candidats_id_candidat)</li>
</ul>`,
    steps: [
      "Projet et properties, y compris la ligne Jackson, parce que publiee est un boolean primitif.",
      "Enum TypeOffre et les trois entités.",
      "Offre est le fils de Entreprise. Candidat est le fils de Offre.",
      "Repositories, services, controllers.",
      "Postman sur Offre avec typeO et publiee présents dans le JSON.",
      "phpMyAdmin : la colonne de l'enum est typeo, pas type_o.",
    ],
    hints: [
      "mappedBy sur Entreprise s'appelle entreprise, le nom du champ dans Offre. @JsonIgnore sur cette collection.",
      "mappedBy sur Candidat s'appelle candidats. La join table s'appelle offre_candidats.",
      "typeO n'a pas de lettre minuscule après le O. La colonne est typeo.",
    ],
  },
];

for (const lab of labs) {
  const hintBlock = lab.hints.map((h, i) => reveal(lab.dir + "h" + i, "Indice " + (i + 1), `<p>${h}</p>`)).join("");
  const locked = (html) => lab.lock ? `<p data-lock-note>S'ouvre quand le chrono arrive à 00:00.</p><div data-locked hidden>${html}</div>` : html;
  const body = `
<h1>${lab.title}</h1>
<p class="lede">${lab.lede}</p>
${timer}
<div class="plate"><h2>Énoncé</h2><p>${lab.statement.replace(/\n/g, "</p><p>")}</p></div>
${lab.diagram}
<h2>Checklist</h2>
${steps(lab.steps)}
<h2>Indices</h2>
${locked(hintBlock)}
<h2>Tables attendues</h2>
${locked(lab.tables + schemaNote)}
<h2>Postman</h2>
${locked(samples(lab.dir))}
<h2>Solution</h2>
<p>Même forme que le projet du cours. Tu tapes la version ci-dessous, avec le port 8089.</p>
${locked(solutionHtml(lab.dir))}
<h2>Grille</h2>
<label class="check"><input type="checkbox" data-step="g1"> L'application démarre, Tomcat sur 8089.</label>
<label class="check"><input type="checkbox" data-step="g2"> Les trois entités et l'enum, s'il y en a un, compilent.</label>
<label class="check"><input type="checkbox" data-step="g3"> Le fils a mappedBy et @JsonIgnore. L'autre côté possède le lien.</label>
<label class="check"><input type="checkbox" data-step="g4"> Les tables et colonnes correspondent à la liste.</label>
<label class="check"><input type="checkbox" data-step="g5"> Trois repositories sans corps de méthode.</label>
<label class="check"><input type="checkbox" data-step="g6"> Trois services, injection par constructeur, pas de new.</label>
<label class="check"><input type="checkbox" data-step="g7"> Trois controllers, cinq mappings, URL complète testée.</label>
${quiz(lab.dir + "q", "0", "Le fils a mappedBy et JsonIgnore. L'autre côté garde la clé ou la table de jointure.", "Sur le fils tu écris", [
  "mappedBy et JsonIgnore",
  "la clé étrangère, sans mappedBy",
  "un repository à la place de l'entité",
  "le context path dans les properties",
])}
`;
  writePage(lab.file, lab.title, body);
}

console.log("labs done");
