import { quiz, reveal, code, writePage } from "./lib.mjs";

const progress = `<p data-progress-label>0 sur 0</p><div class="progress-line" data-progress><span></span></div>`;

function next(href, label) {
  return `<p><a class="btn" href="${href}">Leçon suivante : ${label}</a></p>`;
}

writePage("lessons/01-boot-maven.html", "1. Spring Boot et Maven", `
<h1>1. Spring Boot et Maven</h1>
<p class="lede">Cette leçon sert à créer le projet et à le lancer une fois, avant d'écrire une entité.</p>
<p class="cite">Introduction, puis Spring Boot et Maven. Les slides parlent de JDK 17 et d'une vieille version de Boot. Dans IntelliJ aujourd'hui, tu prends Java 21 et Spring Boot 4. C'est normal.</p>
${progress}
<h2>À quoi sert Spring Boot</h2>
<p>Sans Boot, tu installes Tomcat toi-même et tu ajoutes les jars un par un. Avec Boot, le projet démarre tout seul quand tu lances la classe principale. Le serveur est dedans.</p>
<h2>Créer le projet dans IntelliJ</h2>
<ol>
  <li>File, New, Project, Spring Boot.</li>
  <li>Maven, Java, Jar, JDK 21.</li>
  <li>Group : <code>tn.esprit</code>. Le nom du projet est celui du sujet.</li>
  <li>Coche Spring Web, Spring Data JPA, MySQL Driver, Lombok.</li>
  <li>Après la création : File, Project Structure, SDK 21.</li>
</ol>
<p>Spring Web écrit <code>spring-boot-starter-webmvc</code> dans le pom. Tu ne changes pas ce nom.</p>
<h2>Le fichier application.properties</h2>
<p>MAMP doit être démarré, MySQL vert, avant de lancer l'application.</p>
${code("properties", `spring.datasource.url=jdbc:mysql://localhost:3306/labdb?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=<le mot de passe MySQL de MAMP>
spring.jpa.show-sql=true
spring.jpa.hibernate.ddl-auto=update
spring.jackson.deserialization.fail-on-null-for-primitives=false
server.port=8089
server.servlet.context-path=/lab`)}
<p><code>createDatabaseIfNotExist=true</code> crée la base. <code>update</code> crée les tables manquantes. Il n'efface pas les anciennes colonnes. <code>show-sql=true</code> affiche le SQL dans la console.</p>
<p>Le premier lancement, sans entité, est bon quand tu lis <code>Started</code> et Tomcat sur le port 8089.</p>
${quiz("b1", "1", "La case Spring Web, avec Boot 4, écrit spring-boot-starter-webmvc.", "Après avoir coché Spring Web, le pom contient", [
  "spring-boot-starter-webmvc",
  "une installation manuelle de Tomcat",
  "rien, il faut ajouter le jar toi-même",
])}
${quiz("b2", "0", "Le projet doit utiliser le JDK 21, même si une autre version est installée.", "Quel JDK le projet doit utiliser ?", [
  "JDK 21, dans Project Structure",
  "JDK 17, parce que le slide le dit",
  "la version affichée par java -version",
])}
${quiz("b3", "2", "Connection refused veut dire que MySQL n'écoute pas. Démarre MAMP.", "La console dit Communications link failure, Connection refused. Tu", [
  "changes le port 8089 en 3306",
  "supprimes la dépendance MySQL",
  "démarres MAMP et tu relances",
])}
${next("02-entites.html", "Entités")}
`);

writePage("lessons/02-entites.html", "2. Entités", `
<h1>2. Entités</h1>
<p class="lede">Une entité est une classe Java. Au démarrage, Hibernate en fait une table.</p>
<p class="cite">Spring Data JPA, Entités. @Entity sur la classe. @Id sur la clé. @GeneratedValue est facultatif.</p>
${progress}
<h2>La plus petite entité</h2>
${code("java", `@Entity
public class Bloc {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idBloc;
    private String nomBloc;
    private Long capaciteBloc;
}`)}
<p><code>@Entity</code> est obligatoire. <code>@Id</code> est obligatoire. <code>IDENTITY</code> veut dire que MySQL choisit le numéro.</p>
<p>Si la clé est un <code>String</code>, comme <code>idReservation</code>, tu mets seulement <code>@Id</code>. Tu envoies la valeur toi-même dans le JSON.</p>
<h2>Enum et date</h2>
${code("java", `@Enumerated(EnumType.STRING)
private TypeChambre typeC;

@Temporal(TemporalType.DATE)
private Date dateNaissance;`)}
<p><code>STRING</code> enregistre le mot <code>DOUBLE</code>, pas le chiffre 0 ou 1.</p>
<p>Le nom de la colonne : une majuscule au milieu du mot devient <code>_</code>. <code>idChambre</code> devient <code>id_chambre</code>. <code>typeC</code> devient <code>typec</code>, parce que le C est à la fin. C'est ce qu'on a vu dans ta base <code>tpfoyerdb</code>.</p>
<p>Boot 4 affiche un avertissement sur <code>@Temporal</code>. L'application démarre quand même. Tu gardes l'annotation du cours.</p>
${quiz("e1", "1", "Sans @Id, l'entité n'a pas de clé. Le démarrage échoue.", "Tu enlèves @Id et tu lances. Que se passe-t-il ?", [
  "La table est créée sans clé",
  "Le démarrage échoue",
  "MySQL invente une clé tout seul",
])}
${quiz("e2", "0", "EnumType.STRING garde le nom de la constante.", "TypeChambre.DOUBLE avec EnumType.STRING est enregistré comme", [
  "le texte DOUBLE",
  "le chiffre 1",
  "une nouvelle table",
])}
${quiz("e3", "1", "Le C est à la fin, donc pas de _. MySQL met le nom en minuscules.", "Le champ typeC devient la colonne", [
  "type_c",
  "typec",
  "typeC",
])}
${quiz("e4", "2", "La majuscule est au milieu, donc un _ est ajouté.", "idChambre devient", [
  "idchambre",
  "chambre_id",
  "id_chambre",
])}
${next("03-lombok.html", "Lombok")}
`);

writePage("lessons/03-lombok.html", "3. Lombok", `
<h1>3. Lombok</h1>
<p class="lede">Lombok écrit les getters, les setters et les constructeurs. Tu ne les tapes pas.</p>
<p class="cite">Chapitre Lombok. Sur chaque entité : Getter, Setter, AllArgsConstructor, NoArgsConstructor.</p>
${progress}
${code("java", `@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Bloc {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idBloc;
    private String nomBloc;
}`)}
<p>Ces quatre annotations vont sur chaque entité du TP.</p>
<p>Tu n'utilises pas <code>@Data</code>. Avec une association dans les deux sens, <code>@Data</code> fait une boucle dans <code>toString</code>.</p>
<p>Si IntelliJ dit <code>cannot find symbol getNom</code>, Lombok n'a pas généré la méthode. Va dans Settings, Build, Compiler, Annotation Processors, et coche Enable annotation processing. Le plugin Lombok doit être installé.</p>
${quiz("l1", "0", "Le cours met ces quatre annotations, pas @Data.", "Sur une entité du TP, tu mets", [
  "Getter, Setter, AllArgsConstructor, NoArgsConstructor",
  "Data seulement",
  "rien, Java écrit les getters tout seul",
])}
${quiz("l2", "1", "@Data génère toString. Avec un lien dans les deux sens, toString ne s'arrête pas.", "Pourquoi on évite @Data sur ces entités ?", [
  "Boot 4 a supprimé @Data",
  "toString tourne en boucle avec les associations",
  "MySQL refuse Lombok",
])}
${quiz("l3", "2", "Les méthodes Lombok n'existent que si le traitement des annotations est activé.", "getNomBloc est introuvable. Tu", [
  "écris le getter à la main et tu enlèves Lombok",
  "changes le nom du champ",
  "actives Annotation Processing et tu rebuild",
])}
${next("04-associations.html", "Associations")}
`);

writePage("lessons/04-associations.html", "4. Associations", `
<h1>4. Associations</h1>
<p class="lede">Le sujet dit qui est le fils. Le fils reçoit <code>mappedBy</code> et <code>@JsonIgnore</code>. L'autre classe garde le lien.</p>
<p class="cite">Associations. Dans le compte rendu : Foyer est le fils de Universite. Etudiant est le fils de Reservation.</p>
${progress}
<h2>Les quatre cas du cours</h2>
<p><strong>Un vers un, dans les deux sens.</strong> Universite possède <code>foyer</code>. Foyer a <code>mappedBy = "foyer"</code> et <code>@JsonIgnore</code>. La clé <code>foyer_id_foyer</code> est dans la table <code>universite</code>.</p>
${code("java", `// Universite, le propriétaire
@OneToOne
private Foyer foyer;

// Foyer, le fils
@OneToOne(mappedBy = "foyer")
@JsonIgnore
private Universite universite;`)}
<p><strong>Un vers plusieurs, dans les deux sens.</strong> Bloc est le fils. Il a <code>@ManyToOne</code>. La clé étrangère est dans la table <code>bloc</code>. Pas de table de jointure.</p>
${code("java", `// Foyer
@OneToMany(mappedBy = "foyer")
@JsonIgnore
private Set<Bloc> blocs;

// Bloc, le fils
@ManyToOne
private Foyer foyer;`)}
<p><strong>Un vers plusieurs, dans un seul sens.</strong> Chambre a une liste de Reservation. Reservation n'a pas de champ vers Chambre. Hibernate crée la table <code>chambre_reservations</code>.</p>
${code("java", `// Chambre seulement
@OneToMany
private Set<Reservation> reservations;`)}
<p><strong>Plusieurs vers plusieurs, dans les deux sens.</strong> Etudiant est le fils. Reservation possède la liste. La table de jointure s'appelle <code>reservation_etudiants</code>.</p>
${code("java", `// Reservation, le propriétaire
@ManyToMany
private Set<Etudiant> etudiants;

// Etudiant, le fils
@ManyToMany(mappedBy = "etudiants")
@JsonIgnore
private Set<Reservation> reservations;`)}
<p>L'import de <code>@JsonIgnore</code> est <code>com.fasterxml.jackson.annotation.JsonIgnore</code>. Sans lui, un GET ne finit jamais : le JSON tourne en boucle.</p>
<p>Si tu changes une association alors que les tables existent déjà, supprime la base dans phpMyAdmin. <code>update</code> ajoute des colonnes. Il n'enlève pas les anciennes.</p>
<div class="plate">
  <h2>Essaie toi-même</h2>
  <p>Choisis un exemple du cours, ou change les noms. Lis les deux classes et le nom de la table.</p>
  <div class="presets">
    <button type="button" data-preset='{"a":"Universite","b":"Foyer","ida":"idUniversite","idb":"idFoyer","kind":"oto","dir":"bi","fils":"b"}'>Universite et Foyer</button>
    <button type="button" data-preset='{"a":"Foyer","b":"Bloc","ida":"idFoyer","idb":"idBloc","kind":"otm","dir":"bi","fils":"b"}'>Foyer et Bloc</button>
    <button type="button" data-preset='{"a":"Chambre","b":"Reservation","ida":"idChambre","idb":"idReservation","kind":"otm","dir":"uni-a","fils":"b"}'>Chambre et Reservation</button>
    <button type="button" data-preset='{"a":"Reservation","b":"Etudiant","ida":"idReservation","idb":"idEtudiant","kind":"mtm","dir":"bi","fils":"b"}'>Reservation et Etudiant</button>
  </div>
  <form id="assoc" class="builder">
    <div class="row2">
      <label>Première classe <input name="a" value="Universite"></label>
      <label>Deuxième classe <input name="b" value="Foyer"></label>
      <label>Id de la première <input name="ida" value="idUniversite"></label>
      <label>Id de la deuxième <input name="idb" value="idFoyer"></label>
    </div>
    <label>Lien
      <select name="kind">
        <option value="oto">Un vers un</option>
        <option value="otm">Un vers plusieurs</option>
        <option value="mto">Plusieurs vers un</option>
        <option value="mtm">Plusieurs vers plusieurs</option>
      </select>
    </label>
    <label>Sens
      <select name="dir">
        <option value="bi">Dans les deux sens</option>
        <option value="uni-a">Seulement la première classe garde le lien</option>
        <option value="uni-b">Seulement la deuxième classe garde le lien</option>
      </select>
    </label>
    <label>Qui est le fils
      <select name="fils">
        <option value="b">La deuxième classe est le fils</option>
        <option value="a">La première classe est le fils</option>
      </select>
    </label>
  </form>
  <div id="assoc-out"></div>
</div>
${quiz("a1", "1", "Foyer est le fils. Universite garde la clé foyer_id_foyer.", "Universite 1—1 Foyer, Foyer est le fils. La clé étrangère est", [
  "dans la table foyer",
  "dans la table universite",
  "dans une table de jointure",
])}
${quiz("a2", "0", "Le fils Bloc a @ManyToOne. Foyer a mappedBy.", "Foyer 1—* Bloc, Bloc est le fils. Sur Bloc tu écris", [
  "@ManyToOne Foyer",
  "@OneToMany sans mappedBy",
  "rien, le fils n'a pas de champ",
])}
${quiz("a3", "2", "Sans mappedBy, @OneToMany crée chambre_reservations.", "Chambre a une liste de Reservation, et Reservation n'a pas de champ retour. Hibernate crée", [
  "une clé dans la table chambre",
  "une clé dans la table reservation",
  "la table chambre_reservations",
])}
${quiz("a4", "1", "@JsonIgnore va sur le fils, le côté mappedBy.", "Reservation *—* Etudiant, Etudiant est le fils. @JsonIgnore est sur", [
  "Reservation",
  "Etudiant",
  "le repository",
])}
${next("05-jparepository.html", "JpaRepository")}
`, ["assets/assoc-builder.js"]);

writePage("lessons/05-jparepository.html", "5. JpaRepository", `
<h1>5. JpaRepository</h1>
<p class="lede">Tu écris une interface vide. Spring écrit la classe au démarrage. Tu n'écris pas le SQL.</p>
<p class="cite">JpaRepository. Le travail à faire : le package repository, une interface par entité, après les associations.</p>
${progress}
${code("java", `package tn.esprit.tpfoyer.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.tpfoyer.entity.Bloc;

@Repository
public interface BlocRepository extends JpaRepository<Bloc, Long> {
}`)}
<p><code>Bloc</code> est l'entité. <code>Long</code> est le type de <code>idBloc</code>. Pour Reservation, le deuxième type est <code>String</code>, parce que <code>idReservation</code> est un String.</p>
<p>Ces méthodes existent déjà. Tu les appelles depuis le service :</p>
<ul>
  <li><code>findAll()</code> lit toutes les lignes.</li>
  <li><code>findById(id)</code> lit une ligne. Le cours appelle <code>.get()</code> dessus.</li>
  <li><code>save(bloc)</code> ajoute si l'id est nouveau, et modifie si l'id existe déjà.</li>
  <li><code>deleteById(id)</code> supprime la ligne.</li>
</ul>
<p><code>findByNom</code> et JPQL arrivent dans une séance plus tard. Tu ne les ajoutes pas demain.</p>
<p>Si l'id n'existe pas, <code>findById(id).get()</code> plante. Postman affiche une erreur 500. C'est le comportement du code du cours.</p>
${quiz("r1", "0", "Tu livres une interface. Spring crée la classe.", "Dans le package repository, tu commits", [
  "des interfaces vides",
  "une classe pleine de SQL par entité",
  "un seul repository pour toutes les entités",
])}
${quiz("r2", "1", "L'id de Reservation est un String.", "ReservationRepository étend JpaRepository de Reservation et de", [
  "Long",
  "String",
  "Date",
])}
${quiz("r3", "0", "save ajoute ou modifie selon l'id.", "addBloc et modifyBloc appellent", [
  "la méthode save",
  "deux méthodes différentes",
  "deleteById puis findAll",
])}
${quiz("r4", "2", "get() sur un Optional vide lance une exception. Postman reçoit 500.", "findById(99).get() et 99 n'existe pas. Postman affiche", [
  "200 et un objet vide",
  "201 et une nouvelle ligne",
  "une erreur 500",
])}
${next("06-injection.html", "Injection")}
`);

writePage("lessons/06-injection.html", "6. Injection", `
<h1>6. Injection</h1>
<p class="lede">Ta classe ne fait pas <code>new</code>. Spring crée les objets et les passe aux autres.</p>
<p class="cite">Injection des dépendances. Couplage fort : ta classe construit l'autre avec new. Couplage faible : elle demande une interface, Spring fournit l'objet.</p>
${progress}
<p>Avant Spring, un service écrivait <code>new BlocRepository()</code>. Si le repository change, le service doit changer aussi. C'est le couplage fort du cours.</p>
<p>Avec Spring, tu déclares le champ. Spring le remplit.</p>
${code("java", `@Service
@AllArgsConstructor
public class BlocServiceImpl implements IBlocService {
    BlocRepository blocRepository;

    public List<Bloc> retrieveAllBlocs() {
        return blocRepository.findAll();
    }
}`)}
<p><code>@Service</code> dit à Spring de créer cet objet. <code>@AllArgsConstructor</code> est le constructeur. Spring voit ce constructeur et met le repository dedans.</p>
<p>Le controller fait la même chose, mais son champ est l'interface <code>IBlocService</code>, pas la classe <code>BlocServiceImpl</code>.</p>
${reveal("iq", "Quand utiliser @Qualifier ?", "<p>Seulement si deux classes implémentent la même interface et que les deux ont @Service. Avec une seule classe, tu n'ajoutes ni @Qualifier ni @Primary.</p>")}
${quiz("i1", "1", "Spring crée le repository et le donne au service.", "Qui remplit le champ blocRepository ?", [
  "un new dans le service",
  "Spring, parce que la classe a @Service",
  "phpMyAdmin",
])}
${quiz("i2", "0", "Le controller dépend de l'interface.", "Le champ du controller a pour type", [
  "IBlocService",
  "BlocServiceImpl",
  "BlocRepository",
])}
${quiz("i3", "2", "Sans @Service, Spring ne crée pas l'objet. L'injection échoue au démarrage.", "Tu oublies @Service sur l'implémentation. Au démarrage", [
  "la table n'est pas créée",
  "Postman renvoie une liste vide",
  "Spring ne trouve pas le service",
])}
${quiz("i4", "1", "new sur une classe concrète est le couplage fort du slide.", "Quel code est un couplage fort ?", [
  "un champ rempli par Spring",
  "new DaoImpl() dans la classe qui l'utilise",
  "une interface sans méthode",
])}
${next("07-rest.html", "REST et Postman")}
`);

writePage("lessons/07-rest.html", "7. REST et Postman", `
<h1>7. REST et Postman</h1>
<p class="lede">Le controller reçoit l'appel HTTP et appelle le service. L'adresse est faite de quatre morceaux.</p>
<p class="cite">WS REST. Une page du PDF met le context path /foyer. Les URL du chapitre utilisent /tpfoyer. Tu suis application.properties.</p>
${progress}
<h2>Les quatre morceaux</h2>
<p><code>http://localhost:8089/tpfoyer/bloc/retrieve-all-blocs</code></p>
<ul>
  <li><code>8089</code> est le port.</li>
  <li><code>/tpfoyer</code> est le context path.</li>
  <li><code>/bloc</code> est <code>@RequestMapping</code> sur la classe.</li>
  <li><code>/retrieve-all-blocs</code> est <code>@GetMapping</code> sur la méthode.</li>
</ul>
<p>Si un morceau manque, Postman répond 404 alors que l'application tourne.</p>
${code("java", `@RestController
@AllArgsConstructor
@RequestMapping("/bloc")
public class BlocRestController {
    IBlocService blocService;

    @GetMapping("/retrieve-all-blocs")
    public List<Bloc> getBlocs() {
        return blocService.retrieveAllBlocs();
    }

    @GetMapping("/retrieve-bloc/{bloc-id}")
    public Bloc retrieveBloc(@PathVariable("bloc-id") Long id) {
        return blocService.retrieveBloc(id);
    }

    @PostMapping("/add-bloc")
    public Bloc addBloc(@RequestBody Bloc b) {
        return blocService.addBloc(b);
    }

    @DeleteMapping("/remove-bloc/{bloc-id}")
    public void removeBloc(@PathVariable("bloc-id") Long id) {
        blocService.removeBloc(id);
    }

    @PutMapping("/modify-bloc")
    public Bloc modifyBloc(@RequestBody Bloc b) {
        return blocService.modifyBloc(b);
    }
}`)}
<p>GET et DELETE mettent l'id dans l'adresse. POST et PUT mettent l'objet dans le corps. Le nom dans <code>@PathVariable</code> est le nom entre accolades, ici <code>bloc-id</code>. L'argument Java peut s'appeler <code>id</code>.</p>
<h2>Le JSON</h2>
${code("json", `{
  "idBloc": null,
  "nomBloc": "A",
  "capaciteBloc": 100
}`)}
<p>Les noms sont ceux des champs Java : <code>nomBloc</code>, pas <code>nom_bloc</code>.</p>
<p>Un <code>boolean</code> primitif absent donne une erreur 400 sur Boot 4, sauf si la ligne Jackson est dans <code>application.properties</code>. Envoie <code>true</code> ou <code>false</code>.</p>
<p>Il n'y a pas de cascade dans ce TP. Tu crées chaque entité avec son propre POST.</p>
<h2>Les quatre couches, maintenant que tu les as vues</h2>
<ol>
  <li>Postman appelle l'adresse.</li>
  <li>Le controller reçoit l'appel et appelle le service.</li>
  <li>Le service appelle le repository. Spring a mis le repository dans le service.</li>
  <li>Le repository lit ou écrit la table. Hibernate montre le SQL dans la console.</li>
</ol>
${quiz("s1", "1", "Port, context path, classe, méthode.", "L'adresse de la liste des blocs se termine par", [
  "/retrieve-all-blocs juste après le port",
  "/tpfoyer/bloc/retrieve-all-blocs",
  "/bloc/tpfoyer/retrieve-all-blocs",
])}
${quiz("s2", "0", "Le nom dans l'annotation est celui des accolades.", "Pour le chemin bloc-id, tu écris", [
  "PathVariable avec le nom bloc-id",
  "PathVariable avec le nom id",
  "RequestBody sur l'argument",
])}
${quiz("s3", "2", "POST et PUT portent l'objet. GET et DELETE portent l'id dans l'adresse.", "@RequestBody est sur", [
  "la méthode retrieve-all",
  "la méthode remove",
  "les méthodes add et modify",
])}
${quiz("s4", "1", "Un boolean primitif manquant est refusé par Jackson 3.", "Tu envoies une Reservation sans estValide, et la ligne Jackson n'est pas là. Postman affiche", [
  "200",
  "400",
  "404",
])}
<p><a class="btn" href="../reference/battle-plan.html">Plan des 60 minutes</a></p>
`);

console.log("leçons ok");
