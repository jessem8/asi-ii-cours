(function () {
  "use strict";
  const source = document.currentScript && document.currentScript.src;
  if (source) {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = new URL("visual-learning.css", source).href;
    document.head.appendChild(css);
  }

  const main = document.querySelector("main");
  const locationKey = window.location.pathname.split("/").pop();
  if (!main || !locationKey) return;

  const journeys = {
    "01-boot-maven.html": {
      title: "Du clic Spring Web au serveur",
      intro: "Clique une étape pour voir ce que Spring Boot prépare pour toi.",
      nodes: [
        ["Spring Initializr", "Tu coches Spring Web, Spring Data JPA, MySQL Driver et Lombok. Ce sont les briques de ton projet.", "Choisir les dépendances"],
        ["pom.xml", "Maven enregistre les dépendances. En Boot 4, Spring Web utilise spring-boot-starter-webmvc.", "Les dépendances sont déclarées"],
        ["Maven", "Maven télécharge les bibliothèques nécessaires. Pas besoin de copier les JAR un à un.", "Résoudre et télécharger"],
        ["Application", "Tu lances la classe principale. Spring Boot configure le serveur Tomcat embarqué et démarre sur le port 8089.", "L'application démarre"]
      ],
      takeaway: "Le pom.xml décrit les dépendances. Maven les installe. Spring Boot démarre le serveur."
    },
    "02-entites.html": {
      title: "Une classe Java devient une table",
      intro: "Une entité n'est pas encore une table. Hibernate lit les annotations pour faire le lien.",
      nodes: [
        ["Classe Java", "Bloc est une classe. @Entity indique que ses objets peuvent être persistés par JPA.", "public class Bloc"],
        ["Annotations", "@Id définit l'identifiant. @GeneratedValue(IDENTITY) permet à MySQL de le générer.", "@Entity  @Id  @GeneratedValue"],
        ["Hibernate", "Hibernate traduit le mapping vers le schéma SQL configuré. Les noms des colonnes dépendent de la stratégie de nommage.", "Mapping objet ↔ relationnel"],
        ["Table MySQL", "Une ligne correspond à un Bloc enregistré. L'identifiant est unique. Le schéma suit la configuration du projet.", "bloc(id_bloc, nom_bloc, ...)"]
      ],
      takeaway: "Classe = objet Java. Table = stockage SQL. JPA/Hibernate font la traduction."
    },
    "03-lombok.html": {
      title: "Ce que Lombok écrit à ta place",
      intro: "Clique sur les annotations. Comprends pourquoi @Data n'est pas l'équivalent exact des quatre annotations du TP.",
      nodes: [
        ["@Getter / @Setter", "Génèrent les méthodes pour lire et modifier les champs. Par exemple getNomBloc() et setNomBloc(...).", "Accéder aux champs"],
        ["@NoArgsConstructor", "Génère un constructeur sans argument. JPA en a besoin pour instancier une entité.", "new Bloc()"],
        ["@AllArgsConstructor", "Génère un constructeur avec un paramètre par champ non statique, contrairement à @Data.", "new Bloc(id, nom, ...)"],
        ["@Data", "Génère getters, setters, toString, equals/hashCode et un constructeur pour les champs requis. Sur des entités liées dans les deux sens, ces méthodes peuvent poser problème.", "Pas un raccourci sûr pour JPA"]
      ],
      takeaway: "Pour les entités du TP, utilise les quatre annotations prévues par le cours."
    },
    "05-jparepository.html": {
      title: "Choisis une action, suis la requête SQL",
      intro: "JpaRepository fournit déjà les opérations classiques. Clique pour découvrir l'effet de chaque méthode.",
      nodes: [
        ["findAll()", "Demande toutes les lignes de la table Bloc et retourne une liste de Blocs.", "SELECT ... FROM bloc"],
        ["findById(id)", "Cherche une ligne précise et retourne un Optional. S'il n'y a rien, cet Optional est vide.", "SELECT ... WHERE id = ?"],
        ["save(bloc)", "Demande une insertion ou une mise à jour selon l'état de l'entité et le contexte de persistance.", "INSERT ou UPDATE"],
        ["deleteById(id)", "Demande la suppression de l'entité correspondant à cet identifiant.", "DELETE ... WHERE id = ?"]
      ],
      takeaway: "Ton interface étend JpaRepository<Bloc, Long>. Spring Data fournit l'implémentation."
    },
    "06-injection.html": {
      title: "Comment les objets travaillent ensemble",
      intro: "Le controller et le service ne doivent pas fabriquer eux-mêmes leurs dépendances.",
      nodes: [
        ["Controller", "Reçoit la requête HTTP. Il demande un IBlocService, pas un new BlocServiceImpl().", "@RestController"],
        ["Service", "Contient la logique métier. Spring crée BlocServiceImpl grâce à @Service.", "@Service"],
        ["Repository", "Le service utilise BlocRepository, injecté par le constructeur généré par @AllArgsConstructor.", "BlocRepository"],
        ["MySQL", "Le repository passe par JPA/Hibernate pour lire ou enregistrer les données.", "Tables SQL"]
      ],
      takeaway: "Injection = Spring fournit les objets nécessaires. Appel HTTP et création des dépendances sont deux mécanismes distincts."
    },
    "07-rest.html": {
      title: "Suivre un appel REST de bout en bout",
      intro: "L'adresse choisit une méthode du controller. Ensuite les couches coopèrent.",
      nodes: [
        ["Postman", "Envoie GET http://localhost:8089/tpfoyer/bloc/retrieve-all-blocs.", "Requête HTTP"],
        ["Controller", "@GetMapping reçoit le GET sur la route construite avec context-path et @RequestMapping.", "getBlocs()"],
        ["Service", "Le controller appelle blocService.retrieveAllBlocs().", "Logique métier"],
        ["Repository", "Le service appelle blocRepository.findAll() et Hibernate interroge MySQL.", "SQL, puis JSON en retour"]
      ],
      takeaway: "Requête : Postman → Controller → Service → Repository → Base. La réponse revient dans l'autre sens."
    }
  };

  function node(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function add(parent, tag, cls, text) {
    const e = node(tag, cls, text);
    parent.appendChild(e);
    return e;
  }
  function mount(panel) {
    const marker = main.querySelector("[data-progress]");
    if (marker) marker.insertAdjacentElement("afterend", panel);
    else {
      const lede = main.querySelector(".lede");
      if (lede) lede.insertAdjacentElement("afterend", panel);
      else main.prepend(panel);
    }
  }

  function journeyView(data) {
    const section = node("section", "vl-panel vl-journey");
    section.setAttribute("aria-label", data.title);
    add(section, "p", "vl-kicker", "Schéma interactif");
    add(section, "h2", "", data.title);
    add(section, "p", "vl-intro", data.intro);
    const trail = add(section, "div", "vl-trail");
    trail.setAttribute("role", "group");
    trail.setAttribute("aria-label", "Étapes du schéma");
    const details = add(section, "div", "vl-details");
    details.setAttribute("aria-live", "polite");
    const takeaway = add(section, "p", "vl-takeaway", data.takeaway);
    let current = 0;
    const controls = [];
    function show(i) {
      current = i;
      controls.forEach(function (btn, k) {
        btn.setAttribute("aria-pressed", k === i ? "true" : "false");
        btn.querySelector(".vl-index").textContent = String(k + 1);
      });
      details.replaceChildren();
      add(details, "p", "vl-count", "ÉTAPE " + (i + 1) + " SUR " + data.nodes.length);
      add(details, "h3", "", data.nodes[i][0]);
      add(details, "p", "", data.nodes[i][1]);
      add(details, "code", "vl-example", data.nodes[i][2]);
    }
    data.nodes.forEach(function (step, i) {
      const b = node("button", "vl-node");
      b.type = "button";
      b.setAttribute("aria-pressed", "false");
      add(b, "span", "vl-index", String(i + 1));
      add(b, "span", "vl-node-title", step[0]);
      b.addEventListener("click", function () { show(i); });
      trail.appendChild(b);
      controls.push(b);
    });
    show(0);
    mount(section);
  }

  const cases = [
    {
      title: "1 vers 1", short: "Universite et Foyer", a: "Universite", b: "Foyer", left: "1", right: "1",
      relation: "Une université est liée à un foyer dans cet exemple.",
      codeA: "@OneToOne\nprivate Foyer foyer;",
      codeB: "@OneToOne(mappedBy = \"foyer\")\n@JsonIgnore\nprivate Universite universite;",
      tables: [["universite", ["id_universite (PK)", "foyer_id_foyer (FK)"]], ["foyer", ["id_foyer (PK)"]]],
      owner: "Universite", inverse: "Foyer", fk: "universite.foyer_id_foyer",
      explanation: "Universite possède le champ foyer et la clé étrangère. Foyer est le côté inverse avec mappedBy = \"foyer\"."
    },
    {
      title: "1 vers N", short: "Foyer et Bloc", a: "Foyer", b: "Bloc", left: "1", right: "N",
      relation: "Un foyer contient plusieurs blocs. Chaque bloc pointe vers un foyer.",
      codeA: "@OneToMany(mappedBy = \"foyer\")\n@JsonIgnore\nprivate Set<Bloc> blocs;",
      codeB: "@ManyToOne\nprivate Foyer foyer;",
      tables: [["foyer", ["id_foyer (PK)"]], ["bloc", ["id_bloc (PK)", "foyer_id_foyer (FK)"]]],
      owner: "Bloc", inverse: "Foyer", fk: "bloc.foyer_id_foyer",
      explanation: "Attention au piège : ici Bloc possède la clé étrangère avec @ManyToOne. Foyer est le côté inverse qui déclare mappedBy."
    },
    {
      title: "1 vers N, un seul sens", short: "Chambre et Reservation", a: "Chambre", b: "Reservation", left: "1", right: "N",
      relation: "Une chambre connaît ses réservations, mais la classe Reservation n'a pas de champ chambre.",
      codeA: "@OneToMany\nprivate Set<Reservation> reservations;",
      codeB: "// Aucun champ Chambre\n// sur Reservation",
      tables: [["chambre", ["id_chambre (PK)"]], ["chambre_reservations", ["chambre_id_chambre (FK)", "reservations_id_reservation (FK)"]], ["reservation", ["id_reservation (PK)"]]],
      owner: "Chambre", inverse: "aucun côté inverse", fk: "table de jointure chambre_reservations",
      explanation: "Sans mappedBy et sans @JoinColumn explicite, le mapping JPA unidirectionnel @OneToMany utilise une table de jointure. Nomme-la explicitement si tu veux un nom garanti."
    },
    {
      title: "N vers N", short: "Reservation et Etudiant", a: "Reservation", b: "Etudiant", left: "N", right: "N",
      relation: "Une réservation peut concerner plusieurs étudiants ; un étudiant peut figurer dans plusieurs réservations.",
      codeA: "@ManyToMany\nprivate Set<Etudiant> etudiants;",
      codeB: "@ManyToMany(mappedBy = \"etudiants\")\n@JsonIgnore\nprivate Set<Reservation> reservations;",
      tables: [["reservation", ["id_reservation (PK)"]], ["reservation_etudiants", ["reservation_id_reservation (FK)", "etudiants_id_etudiant (FK)"]], ["etudiant", ["id_etudiant (PK)"]]],
      owner: "Reservation", inverse: "Etudiant", fk: "table de jointure reservation_etudiants",
      explanation: "Reservation est le côté propriétaire. La table de jointure fait le lien entre les deux tables, sans placer directement une clé étrangère dans chaque entité."
    }
  ];


  // Complete the eight combinations: four cardinalities × two possible directions.
  cases[0].kind="11"; cases[0].dir="bi";
  cases[1].kind="1n"; cases[1].dir="bi";
  cases[2].kind="1n"; cases[2].dir="uni";
  cases[3].kind="nn"; cases[3].dir="bi";
  cases.push(
    {
      kind:"11",dir:"uni",title:"1 vers 1",a:"Universite",b:"Foyer",left:"1",right:"1",
      relation:"Universite connaît Foyer, mais Foyer ne référence pas Universite.",
      codeA:"@OneToOne\nprivate Foyer foyer;",codeB:"// Pas de champ Universite",
      tables:[["universite",["id_universite (PK)","foyer_id_foyer (FK)"]],["foyer",["id_foyer (PK)"]]],
      owner:"Universite",inverse:"aucun",fk:"universite.foyer_id_foyer",
      explanation:"Un seul sens : Universite porte le champ et la clé étrangère. Pas de mappedBy."
    },
    {
      kind:"n1",dir:"uni",title:"N vers 1",a:"Bloc",b:"Foyer",left:"N",right:"1",
      relation:"Chaque Bloc connaît son Foyer ; Foyer ne connaît pas sa liste de blocs.",
      codeA:"@ManyToOne\nprivate Foyer foyer;",codeB:"// Pas de collection de Bloc",
      tables:[["bloc",["id_bloc (PK)","foyer_id_foyer (FK)"]],["foyer",["id_foyer (PK)"]]],
      owner:"Bloc",inverse:"aucun",fk:"bloc.foyer_id_foyer",
      explanation:"@ManyToOne fonctionne seul : la clé étrangère est dans la table bloc. Pas de mappedBy."
    },
    {
      kind:"n1",dir:"bi",title:"N vers 1",a:"Bloc",b:"Foyer",left:"N",right:"1",
      relation:"Bloc connaît Foyer et Foyer connaît la liste de ses blocs.",
      codeA:"@ManyToOne\nprivate Foyer foyer;",
      codeB:'@OneToMany(mappedBy = "foyer")\n@JsonIgnore\nprivate Set<Bloc> blocs;',
      tables:[["bloc",["id_bloc (PK)","foyer_id_foyer (FK)"]],["foyer",["id_foyer (PK)"]]],
      owner:"Bloc",inverse:"Foyer",fk:"bloc.foyer_id_foyer",
      explanation:"Même lien que 1:N bidirectionnel, vu depuis le côté plusieurs. Bloc possède la clé étrangère ; Foyer porte mappedBy."
    },
    {
      kind:"nn",dir:"uni",title:"N vers N",a:"Reservation",b:"Etudiant",left:"N",right:"N",
      relation:"Reservation connaît ses étudiants, mais Etudiant n'a pas de champ vers Reservation.",
      codeA:"@ManyToMany\nprivate Set<Etudiant> etudiants;",codeB:"// Pas de liste Reservation",
      tables:[["reservation",["id_reservation (PK)"]],["reservation_etudiants",["reservation_id_reservation (FK)","etudiants_id_etudiant (FK)"]],["etudiant",["id_etudiant (PK)"]]],
      owner:"Reservation",inverse:"aucun",fk:"table de jointure reservation_etudiants",
      explanation:"Une seule classe contient @ManyToMany. Hibernate utilise une table de jointure. Pas de mappedBy."
    }
  );
  function relationSVG(c) {
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 680 186");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", c.a + " (" + c.left + ") lié à " + c.b + " (" + c.right + ")");
    function shape(tag, attrs, value) {
      const e = document.createElementNS(NS, tag);
      Object.keys(attrs).forEach(function (key) { e.setAttribute(key, String(attrs[key])); });
      if (value !== undefined) e.textContent = value;
      svg.appendChild(e);
      return e;
    }
    shape("rect", {x:15,y:35,width:238,height:120,rx:13,fill:"#e3f0fa",stroke:"#6c9ab8","stroke-width":1.5});
    shape("rect", {x:427,y:35,width:238,height:120,rx:13,fill:"#e2f3ed",stroke:"#77a995","stroke-width":1.5});
    shape("text", {x:134,y:81,"text-anchor":"middle","font-size":22,"font-weight":700,fill:"#143652"}, c.a);
    shape("text", {x:134,y:108,"text-anchor":"middle","font-size":13,fill:"#42617a"}, "Entité Java");
    shape("text", {x:546,y:81,"text-anchor":"middle","font-size":22,"font-weight":700,fill:"#1d5c45"}, c.b);
    shape("text", {x:546,y:108,"text-anchor":"middle","font-size":13,fill:"#3a705f"}, "Entité Java");
    shape("line", {x1:253,y1:95,x2:427,y2:95,stroke:"#476d83","stroke-width":3});
    shape("text", {x:341,y:142,"text-anchor":"middle","font-size":14,fill:"#143652"}, c.dir==="uni"?"A → B":"A ↔ B");
    shape("rect", {x:276,y:70,width:130,height:49,rx:24,fill:"#fff",stroke:"#b4cbd9"});
    shape("text", {x:341,y:101,"text-anchor":"middle","font-size":18,"font-weight":700,fill:"#143652"}, c.left + " : " + c.right);
    shape("text", {x:340,y:25,"text-anchor":"middle","font-size":13,fill:"#4c6171"}, "Cardinalités");
    return svg;
  }
  function relationView() {
    const section = node("section", "vl-panel vl-relations");
    section.setAttribute("aria-label", "Explorer les associations JPA");
    add(section, "p", "vl-kicker", "Laboratoire visuel interactif");
    add(section, "h2", "", "4 cardinalités × 2 directions");
    add(section, "p", "vl-intro", "1:N dit combien. Un seul sens dit qui connaît qui. Teste les huit combinaisons, puis inspecte le Java et le SQL.");
    const tabs = add(section, "div", "vl-tabs");
    tabs.setAttribute("role", "group");
    tabs.setAttribute("aria-label", "Choisir un type d'association");
    const directionbar = add(section, "div", "vl-modes");
    directionbar.setAttribute("role", "group");
    directionbar.setAttribute("aria-label", "Sens de la relation");
    const modebar = add(section, "div", "vl-modes");
    modebar.setAttribute("role", "group");
    modebar.setAttribute("aria-label", "Afficher les objets ou la base");
    const display = add(section, "div", "vl-display");
    const explanation = add(section, "div", "vl-details");
    explanation.setAttribute("aria-live", "polite");
    const codebox = add(section, "div", "vl-codegrid");
    const challenge = add(section, "div", "vl-challenge");
    let selected = 0;
    let kind = "11";
    let direction = "uni";
    let mode = "java";
    const buttons = [];
    const dirs = [];
    const modes = [];
    const cardHeader = add(challenge, "h3", "", "Vérifie ta compréhension");
    add(challenge, "p", "", "Où se trouve la clé étrangère ou la table de jointure ?");
    const options = add(challenge, "div", "vl-challenge-options");
    const response = add(challenge, "p", "vl-answer");
    response.setAttribute("aria-live", "polite");

    function render() {
      selected = cases.findIndex(function (x) { return x.kind === kind && x.dir === direction; });
      if (selected < 0) throw Error("Missing JPA configuration: " + kind + " " + direction);
      const c = cases[selected];
      buttons.forEach(function (b){ b.setAttribute("aria-pressed", b.dataset.kind === kind ? "true" : "false"); });
      dirs.forEach(function (b){ b.setAttribute("aria-pressed", b.dataset.direction === direction ? "true" : "false"); });
      modes.forEach(function (b){ b.setAttribute("aria-pressed", b.dataset.mode === mode ? "true" : "false"); });
      display.replaceChildren();
      add(display, "p", "vl-caption", c.relation);
      if (mode === "java") {
        const drawing = add(display, "div", "vl-diagram");
        drawing.appendChild(relationSVG(c));
        add(display, "p", "vl-caption", "1 et N indiquent la cardinalité. A → B ou A ↔ B indique les références Java, et non le côté qui stocke la clé étrangère.");
      } else {
        const board = add(display, "div", "vl-db");
        add(board, "p", "vl-small-label", "Schéma SQL simplifié. Les noms exacts dépendent du naming Hibernate.");
        const row = add(board, "div", "vl-db-row");
        c.tables.forEach(function(t){
          const tbl = add(row, "div", "vl-table");
          add(tbl, "strong", "", t[0]);
          t[1].forEach(function(column){
            const col = add(tbl, "span", column.indexOf("(FK)") > 0 ? "vl-fk" : "", column);
          });
        });
      }
      explanation.replaceChildren();
      add(explanation, "h3", "", "Qui possède la relation ?");
      add(explanation, "p", "", c.explanation);
      add(explanation, "p", "vl-owner", "Propriétaire : " + c.owner + "  |  Côté inverse : " + c.inverse);
      codebox.replaceChildren();
      [[c.a,c.codeA],[c.b,c.codeB]].forEach(function(item){
        const panel=add(codebox,"div","vl-code-card");
        add(panel,"strong","",item[0]+".java");
        add(panel,"pre","",item[1]);
      });
      options.replaceChildren();
      response.textContent="";
      const possible = [c.a.toLowerCase(), c.b.toLowerCase(), "une table de jointure"];
      const answer = c.fk.indexOf("table de jointure") === 0 ? 2 : (c.fk.toLowerCase().indexOf(c.a.toLowerCase()+".")===0 ? 0 : 1);
      possible.forEach(function(x,i){
        const btn=add(options,"button","",i===2 ? "Table de jointure" : "Table " + x);
        btn.type="button";
        btn.addEventListener("click",function(){
          response.textContent=(i===answer?"Correct. ":"Pas tout à fait. ")+ "Réponse : "+c.fk+".";
          response.className="vl-answer "+(i===answer?"vl-good":"vl-bad");
          Array.from(options.children).forEach(function(b,n){b.setAttribute("aria-pressed",n===i?"true":"false");});
        });
      });
    }
    [["11","1 : 1"],["1n","1 : N"],["n1","N : 1"],["nn","N : N"]].forEach(function(pair){
      const btn=add(tabs,"button","",pair[1]);
      btn.type="button"; btn.dataset.kind=pair[0];
      btn.addEventListener("click",function(){kind=pair[0];render();});
      buttons.push(btn);
    });
    [["uni","Un seul sens →"],["bi","Deux sens ↔"]].forEach(function(pair){
      const btn=add(directionbar,"button","",pair[1]);
      btn.type="button"; btn.dataset.direction=pair[0];
      btn.addEventListener("click",function(){direction=pair[0];render();});
      dirs.push(btn);
    });
    [["java","Objets Java"],["sql","Tables MySQL"]].forEach(function(pair){
      const btn=add(modebar,"button","",pair[1]);
      btn.type="button";
      btn.dataset.mode=pair[0];
      btn.addEventListener("click",function(){mode=pair[0];render();});
      modes.push(btn);
    });
    render();
    mount(section);
  }


  // Purely illustrative, offline HTTP playground. Does not make fetch() requests.
  function miniPostman() {
    const firstQuiz=main.querySelector(".quiz"); if(!firstQuiz)return;
    const panel=node("section","vl-panel");
    add(panel,"p","vl-kicker","Entraînement hors ligne");
    add(panel,"h2","","Mini-Postman : choisis une méthode");
    add(panel,"p","vl-intro","Simulation fictive : aucun appel au serveur, aucune modification de MySQL. Les exemples illustrent les routes du cours.");
    const actions=add(panel,"div","vl-tabs");
    const result=add(panel,"div","vl-details");
    result.setAttribute("aria-live","polite");
    const casesHttp=[
      ["GET tout","GET","/retrieve-all-blocs","Sans corps","200 OK\n[{\"idBloc\":1,\"nomBloc\":\"A\"}]"],
      ["GET id","GET","/retrieve-bloc/1","ID dans l'URL","200 OK\n{\"idBloc\":1,\"nomBloc\":\"A\"}"],
      ["POST","POST","/add-bloc",'{"nomBloc":"B","capaciteBloc":50}',"200 OK (méthode du TP)\n{\"idBloc\":2,\"nomBloc\":\"B\"}"],
      ["PUT","PUT","/modify-bloc",'{"idBloc":1,"nomBloc":"B"}',"200 OK (méthode du TP)\n{\"idBloc\":1,\"nomBloc\":\"B\"}"],
      ["DELETE","DELETE","/remove-bloc/1","ID dans l'URL","200 OK (méthode du TP, sans corps)"]
    ];
    const btns=[];
    function paint(i){
      btns.forEach(function(b,n){b.setAttribute("aria-pressed",i===n?"true":"false")});
      const x=casesHttp[i];result.replaceChildren();
      add(result,"h3","","Requête");
      add(result,"code","vl-example",x[1]+" http://localhost:8089/tpfoyer/bloc"+x[2]);
      add(result,"p","","Corps : "+x[3]);
      add(result,"h3","","Réponse illustrative");
      add(result,"pre","",x[4]);
    }
    casesHttp.forEach(function(x,i){
      const b=add(actions,"button","",x[0]);b.type="button";
      b.addEventListener("click",function(){paint(i)});btns.push(b);
    });
    paint(0);firstQuiz.parentElement.insertBefore(panel,firstQuiz);
  }

  if (locationKey === "04-associations.html") relationView();
  else if (journeys[locationKey]) journeyView(journeys[locationKey]);
  if (locationKey === "07-rest.html") miniPostman();
})();