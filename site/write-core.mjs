import { quiz, code, writePage } from "./lib.mjs";

const props = `spring.datasource.url=jdbc:mysql://localhost:3306/labdb?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=<le mot de passe MySQL de MAMP>
spring.jpa.show-sql=true
spring.jpa.hibernate.ddl-auto=update
spring.jackson.deserialization.fail-on-null-for-primitives=false
server.port=8089
server.servlet.context-path=/lab`;

const hour = [
  [0, "Créer le projet", "IntelliJ, Spring Boot, Maven, Java 21. Coche Spring Web, Spring Data JPA, MySQL Driver, Lombok."],
  [6, "Properties et premier lancement", "Colle application.properties. SDK 21. Lance. La console dit Started et Tomcat sur 8089."],
  [10, "Les trois entités", "Package entity. @Entity, les quatre annotations Lombok, @Id. Enum et dates si le sujet en a."],
  [22, "Les associations", "Le fils a mappedBy et @JsonIgnore. Lance. Lis les create table. Compte les tables dans phpMyAdmin."],
  [32, "Les repositories", "Package repository. Une interface par entité. Pas de méthode dedans."],
  [38, "Les services", "Une interface et une classe @Service @AllArgsConstructor. Le repository est un champ. Pas de new."],
  [48, "Les controllers", "Package control. Cinq adresses par entité."],
  [56, "Postman", "Un CRUD complet sur la première entité. Puis les deux autres, mêmes adresses, autres noms."],
];

function timetable() {
  const rows = hour.map(([m, title, detail]) =>
    `<tr data-minute="${m}"><td>${String(m).padStart(2, "0")}</td><td>${title}</td><td>${detail}</td></tr>`
  ).join("");
  return `<table><thead><tr><th>Min</th><th>Tu fais</th><th>C'est bon quand</th></tr></thead><tbody>${rows}</tbody></table>`;
}

const timer = `<div class="timer-bar" data-timer data-minutes="60" data-marks="0,6,10,22,32,38,48,56">
  <p class="clock" aria-live="polite">60:00</p>
  <button type="button" data-start>Commencer</button>
  <button type="button" data-pause>Pause</button>
  <button type="button" data-reset>Remettre à zéro</button>
</div>`;

writePage("index.html", "Par où commencer", `
<h1>Par où commencer</h1>
<p class="lede">Suis les leçons dans l'ordre du cours. Chaque leçon est courte. Les questions sont en bas de la page.</p>
<ol>
  <li><a href="lessons/01-boot-maven.html">Spring Boot et Maven</a> — créer le projet et le lancer.</li>
  <li><a href="lessons/02-entites.html">Entités</a> — la classe qui devient une table.</li>
  <li><a href="lessons/03-lombok.html">Lombok</a> — les getters sans les écrire.</li>
  <li><a href="lessons/04-associations.html">Associations</a> — qui est le fils, quelle table est créée.</li>
  <li><a href="lessons/05-jparepository.html">JpaRepository</a> — l'interface vide.</li>
  <li><a href="lessons/06-injection.html">Injection</a> — Spring crée les objets, tu n'écris pas new.</li>
  <li><a href="lessons/07-rest.html">REST et Postman</a> — l'adresse et les cinq méthodes.</li>
</ol>
<h2>Quand les 7 leçons sont faites</h2>
<p>Lis le <a href="reference/battle-plan.html">plan des 60 minutes</a>. Garde la <a href="reference/cheat-sheet.html">fiche</a> ouverte. Fais le <a href="labs/lab-1-bibliotheque.html">labo 1</a> avec la solution visible. Puis le <a href="labs/lab-5-examen-blanc.html">labo 5</a> sans les indices.</p>
<p>Le labo de demain dure 60 minutes. Il y a 3 entités reliées. Il utilise tout le cours jusqu'à REST. Pas les méthodes findBy, pas JPQL.</p>
<p><button type="button" data-reset-site>Effacer mes réponses</button></p>
`);

writePage("reference/battle-plan.html", "Plan des 60 minutes", `
<h1>Plan des 60 minutes</h1>
<p class="lede">Tu finis une entité jusqu'au controller. Ensuite tu copies la classe et tu changes le nom. Tu ne réfléchis pas trois fois au même fichier.</p>
${timer}
${timetable()}
<h2>Avant de t'asseoir</h2>
<label class="check"><input type="checkbox" data-step="mamp"> MAMP est démarré. MySQL est vert.</label>
<label class="check"><input type="checkbox" data-step="jdk"> Project Structure, SDK 21.</label>
<label class="check"><input type="checkbox" data-step="lombok"> Annotation Processing est coché.</label>
<h2>Pour aller plus vite</h2>
<p>Termine la première entité, son repository, son service et son controller. Dans la vue Project, sélectionne la classe et appuie sur F5, Copy Class. Puis Ctrl+R pour remplacer l'ancien nom.</p>
<p>Les associations se codent sur les entités, après les trois classes. Si tu te trompes et que les tables existent déjà, supprime la base. <code>update</code> n'efface pas les colonnes.</p>
`);

writePage("reference/cheat-sheet.html", "Fiche", `
<h1>Fiche</h1>
<p class="lede">Les fichiers que tu tapes demain. La case cherche un mot. La touche / met le curseur dedans.</p>
<p><label>Chercher <input class="search" data-finder type="search" placeholder="mappedBy, port, Postman"></label></p>
<section class="plate" data-find="properties port base jackson">
  <h2>application.properties</h2>
  ${code("properties", props)}
  <p>Change <code>labdb</code> et <code>/lab</code> selon le sujet. Le mot de passe est celui de MySQL dans MAMP. Le slide avec un mot de passe vide ne marche pas ici.</p>
</section>
<section class="plate" data-find="entité lombok id enum">
  <h2>Entité</h2>
  ${code("java", `@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Livre {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idLivre;
    private String titre;
}`)}
  <p>Pas de <code>@Data</code>. Un id String a <code>@Id</code> et pas de <code>@GeneratedValue</code>.</p>
</section>
<section class="plate" data-find="association fils mappedby jsonignore">
  <h2>Association</h2>
  <p>Le fils a <code>mappedBy</code> et <code>@JsonIgnore</code>.</p>
  ${code("java", `// Bibliotheque
@OneToMany(mappedBy = "bibliotheque")
@JsonIgnore
private Set<Livre> livres;

// Livre, le fils
@ManyToOne
private Bibliotheque bibliotheque;`)}
  <p><code>idChambre</code> devient <code>id_chambre</code>. <code>typeC</code> devient <code>typec</code>.</p>
</section>
<section class="plate" data-find="repository jparepository">
  <h2>Repository</h2>
  ${code("java", `@Repository
public interface LivreRepository extends JpaRepository<Livre, Long> {
}`)}
</section>
<section class="plate" data-find="service injection">
  <h2>Service</h2>
  ${code("java", `@Service
@AllArgsConstructor
public class LivreServiceImpl implements ILivreService {
    LivreRepository livreRepository;

    public List<Livre> retrieveAllLivres() {
        return livreRepository.findAll();
    }

    public Livre retrieveLivre(Long livreId) {
        return livreRepository.findById(livreId).get();
    }

    public Livre addLivre(Livre livre) {
        return livreRepository.save(livre);
    }

    public void removeLivre(Long livreId) {
        livreRepository.deleteById(livreId);
    }

    public Livre modifyLivre(Livre livre) {
        return livreRepository.save(livre);
    }
}`)}
</section>
<section class="plate" data-find="controller rest postman">
  <h2>Controller</h2>
  ${code("java", `@RestController
@AllArgsConstructor
@RequestMapping("/livre")
public class LivreRestController {
    ILivreService livreService;

    @GetMapping("/retrieve-all-livres")
    public List<Livre> getLivres() {
        return livreService.retrieveAllLivres();
    }

    @PostMapping("/add-livre")
    public Livre addLivre(@RequestBody Livre body) {
        return livreService.addLivre(body);
    }
}`)}
  <p>Adresse complète : <code>http://localhost:8089/lab/livre/retrieve-all-livres</code></p>
</section>
`);

const shortcuts = [
  ["Alt+Insert", "Générer un constructeur ou des getters"],
  ["Alt+Enter", "Le correctif proposé par IntelliJ"],
  ["Ctrl+Alt+O", "Ranger les imports"],
  ["Shift+F10", "Relancer la dernière exécution"],
  ["Ctrl+Shift+F10", "Lancer la classe sous le curseur"],
  ["Ctrl+F2", "Arrêter l'application"],
  ["F5", "Copier la classe, dans la vue Project"],
  ["Shift+F6", "Renommer"],
  ["Ctrl+R", "Remplacer dans le fichier"],
  ["Ctrl+Shift+R", "Remplacer dans tout le projet"],
  ["Ctrl+Alt+L", "Reformater"],
  ["Ctrl+Alt+Shift+S", "Project Structure, le JDK"],
  ["Ctrl+Alt+S", "Settings"],
  ["F2", "Erreur suivante"],
  ["Shift+Shift", "Chercher partout"],
  ["Ctrl+N", "Aller à une classe"],
  ["Ctrl+E", "Fichiers récents"],
  ["Ctrl+B", "Aller à la déclaration"],
  ["Alt+1", "Vue Project"],
  ["Ctrl+Space", "Complétion"],
  ["Ctrl+D", "Dupliquer la ligne"],
  ["Ctrl+Y", "Supprimer la ligne"],
  ["Ctrl+/", "Commenter la ligne"],
];

writePage("reference/shortcuts.html", "Raccourcis", `
<h1>Raccourcis</h1>
<p class="lede">Raccourcis Windows par défaut d'IntelliJ. Si une touche ne fait rien : Settings, Keymap, Windows.</p>
<p><label>Chercher <input class="search" data-finder type="search" placeholder="lancer, renommer"></label></p>
<table>
  <thead><tr><th>Touches</th><th>À quoi ça sert demain</th></tr></thead>
  <tbody>
    ${shortcuts.map(([k, v]) => `<tr data-find="${k} ${v}"><td><code>${k}</code></td><td>${v}</td></tr>`).join("")}
  </tbody>
</table>
<p>Les Live Templates, seulement si le professeur les autorise. Sinon tu tapes le code.</p>
`);

const cards = [
  ["@Id est obligatoire sur la clé.", "Sans @Id, l'entité ne démarre pas."],
  ["IDENTITY veut dire que MySQL choisit le numéro.", "C'est pour les id Long."],
  ["Un id String n'a pas @GeneratedValue.", "Tu envoies l'id dans le JSON."],
  ["EnumType.STRING garde le nom, pas un chiffre.", "DOUBLE reste le mot DOUBLE."],
  ["typeC devient la colonne typec.", "La majuscule est à la fin, pas de _."],
  ["idChambre devient id_chambre.", "La majuscule est au milieu."],
  ["Pas de @Data sur une entité liée dans les deux sens.", "toString tourne en boucle."],
  ["Les quatre annotations Lombok.", "Getter, Setter, AllArgsConstructor, NoArgsConstructor."],
  ["Le fils a mappedBy et @JsonIgnore.", "L'autre classe garde la clé ou la jointure."],
  ["Un vers plusieurs dans les deux sens n'a pas de table de jointure.", "La clé est sur la table du fils."],
  ["OneToMany sans mappedBy crée une table de jointure.", "Exemple : chambre_reservations."],
  ["ManyToOne seul crée une clé étrangère.", "Pas de table de jointure."],
  ["update n'efface pas une colonne.", "Tu supprimes la base, puis tu relances."],
  ["Le repository est une interface vide.", "Spring écrit la classe au démarrage."],
  ["Le deuxième type de JpaRepository est le type de l'id.", "Long, ou String pour Reservation."],
  ["save ajoute ou modifie.", "Selon que l'id existe déjà."],
  ["findById(id).get() sur un id absent donne 500.", "C'est le code du cours."],
  ["@Service @AllArgsConstructor remplit le repository.", "Tu n'écris pas new."],
  ["Le controller demande l'interface du service.", "IBlocService, pas BlocServiceImpl."],
  ["@Qualifier seulement s'il y a deux implémentations.", "Avec une seule, tu n'en mets pas."],
  ["L'adresse a quatre morceaux.", "port, context path, classe, méthode."],
  ["@PathVariable reprend le nom entre accolades.", "bloc-id, même si l'argument s'appelle id."],
  ["@RequestBody est pour POST et PUT.", "GET et DELETE mettent l'id dans l'adresse."],
  ["Un boolean absent peut donner 400.", "Ajoute la ligne Jackson, ou envoie true ou false."],
  ["Spring Web en Boot 4 écrit starter-webmvc.", "Tu ne le renommes pas."],
  ["Communications link failure : MySQL est arrêté.", "Démarre MAMP."],
  ["Port 8089 already in use : une autre appli tourne.", "Ctrl+F2 sur l'autre projet."],
  ["Le context path du TP est celui des properties.", "Les URL du cours utilisent /tpfoyer."],
];

writePage("reference/flashcards.html", "Cartes", `
<h1>Cartes</h1>
<p class="lede">Clique la carte pour la retourner. Je savais l'envoie plus loin. Encore la remet au début.</p>
<p id="card-meta" class="due"></p>
<div id="deck" hidden data-cards='${JSON.stringify(cards.map(([front, back], i) => ({ id: "c" + i, front, back }))).replace(/'/g, "&#39;")}'></div>
<div class="cards">
  <div id="face" class="card-face" tabindex="0" role="button" aria-label="Retourner la carte">
    <p class="front"></p>
    <p class="back"></p>
  </div>
</div>
<p>
  <button type="button" id="again">Encore</button>
  <button type="button" id="knew">Je savais</button>
</p>
`, ["assets/flashcards.js"]);

const errors = [
  ["Communications link failure", "MySQL n'est pas démarré", "Démarre MAMP, attends que MySQL soit vert, relance."],
  ["Port 8089 was already in use", "Une autre application utilise le port", "Arrête l'autre projet avec Ctrl+F2."],
  ["Cannot map null into type boolean", "Erreur 400", "Ajoute la ligne Jackson, ou envoie true ou false dans le JSON."],
  ["NoSuchElementException", "Erreur 500", "findById(id).get() et cet id n'existe pas. Vérifie le numéro dans l'adresse."],
  ["StackOverflowError", "Le JSON tourne en boucle", "Mets @JsonIgnore sur le côté mappedBy."],
  ["HHH90000033", "@Temporal est déprécié", "C'est un avertissement. L'application marche. Tu gardes l'annotation."],
  ["cannot find symbol getNom", "Lombok n'a pas généré la méthode", "Coche Annotation Processing. Installe le plugin Lombok. Rebuild."],
  ["colonne qui reste", "Tu as enlevé un champ en Java et la colonne est encore là", "update n'efface pas. Supprime la base et relance."],
  ["404 Not Found", "L'adresse est fausse", "Vérifie le port, le context path, @RequestMapping et le nom de la méthode."],
  ["Access denied for user", "Mauvais mot de passe MySQL", "Utilise le mot de passe MAMP. Le mot de passe vide du slide ne marche pas ici."],
];

writePage("reference/error-doctor.html", "Erreurs", `
<h1>Erreurs</h1>
<p class="lede">Colle un morceau du message. La ligne qui correspond reste.</p>
<p><label>Chercher <input class="search" data-finder type="search" placeholder="Colle l'erreur"></label></p>
<table>
  <thead><tr><th>Tu vois</th><th>Ça veut dire</th><th>Tu fais</th></tr></thead>
  <tbody>
    ${errors.map(([a, b, c]) => `<tr data-find="${a} ${b} ${c}"><td>${a}</td><td>${b}</td><td>${c}</td></tr>`).join("")}
  </tbody>
</table>
`);

const glossary = [
  ["Entité", "La classe Java qui devient une table. @Entity sur la classe, @Id sur la clé."],
  ["Fils", "Le côté que le professeur désigne. Dans le code, c'est le côté mappedBy."],
  ["mappedBy", "Dit : l'autre classe garde le lien. Ce côté ne crée pas sa propre clé étrangère."],
  ["Couplage fort", "Ta classe fait new sur l'autre classe. Si l'autre change, la tienne doit changer."],
  ["Couplage faible", "Ta classe demande une interface. Spring fournit l'objet."],
  ["Injection", "Spring passe un objet à un autre. Ici, par le constructeur de Lombok."],
  ["Bean", "Un objet créé par Spring. @Service en marque un."],
  ["Repository", "L'interface vide qui lit et écrit une table."],
  ["Service", "La classe qui appelle le repository. Le controller appelle le service."],
  ["Controller", "La classe qui reçoit l'appel HTTP et renvoie le JSON."],
  ["Context path", "Le morceau d'adresse juste après le port. Exemple : /tpfoyer."],
  ["Table de jointure", "Une table qui ne sert qu'à relier deux entités."],
  ["ddl-auto=update", "Crée les tables et les colonnes qui manquent. N'efface rien."],
];

writePage("reference/glossary.html", "Mots du cours", `
<h1>Mots du cours</h1>
<p class="lede">Les mots des slides, avec une phrase simple.</p>
<p><label>Chercher <input class="search" data-finder type="search" placeholder="fils, bean"></label></p>
<table>
  <thead><tr><th>Mot</th><th>Ça veut dire</th></tr></thead>
  <tbody>
    ${glossary.map(([a, b]) => `<tr data-find="${a} ${b}"><td>${a}</td><td>${b}</td></tr>`).join("")}
  </tbody>
</table>
<p>${quiz("g1", "1", "Le fils est le côté mappedBy.", "Foyer est le fils de Universite. Sur Foyer tu mets", [
  "OneToOne sans mappedBy",
  "OneToOne avec mappedBy",
  "ManyToOne avec mappedBy",
])}</p>
`);

console.log("pages de base ok");
