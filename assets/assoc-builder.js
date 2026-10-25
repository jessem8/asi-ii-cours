/* Association builder. Naming follows the schema measured on tpfoyerdb. */
(function () {
  const form = document.getElementById("assoc");
  const out = document.getElementById("assoc-out");
  if (!form || !out) return;

  function snake(name) {
    let s = "";
    for (let i = 0; i < name.length; i++) {
      const before = name[i - 1];
      const cur = name[i];
      const after = name[i + 1];
      if (
        before && after &&
        before === before.toLowerCase() && before !== before.toUpperCase() &&
        cur !== cur.toLowerCase() &&
        after === after.toLowerCase() && after !== after.toUpperCase()
      ) s += "_";
      s += cur.toLowerCase();
    }
    return s;
  }

  function camel(className) {
    return className.charAt(0).toLowerCase() + className.slice(1);
  }

  function plural(field) {
    return field.endsWith("s") ? field : field + "s";
  }

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  }

  function paint() {
    const a = form.a.value.trim() || "Universite";
    const b = form.b.value.trim() || "Foyer";
    const ida = form.ida.value.trim() || "id" + a;
    const idb = form.idb.value.trim() || "id" + b;
    const kind = form.kind.value;
    const dir = form.dir.value;
    const fils = form.fils.value;
    const ta = snake(a);
    const tb = snake(b);
    const colA = snake(ida);
    const colB = snake(idb);
    const fa = camel(a);
    const fb = camel(b);
    const pas = plural(fa);
    const pbs = plural(fb);

    let codeA = "";
    let codeB = "";
    let tables = [];
    let note = "";

    function oneToOne(owner, child, ownerId, childId, ownerTable, childTable, ownerField, childField) {
      codeA = owner === a
        ? "@OneToOne\nprivate " + child + " " + childField + ";"
        : "@OneToOne(mappedBy = \"" + childField + "\")\n@JsonIgnore\nprivate " + owner + " " + ownerField + ";";
      codeB = owner === b
        ? "@OneToOne\nprivate " + child + " " + childField + ";"
        : "@OneToOne(mappedBy = \"" + childField + "\")\n@JsonIgnore\nprivate " + owner + " " + ownerField + ";";
      const fk = childField + "_" + (child === a ? colA : colB);
      tables.push(ownerTable + "." + fk + "  →  " + (child === a ? ta : tb));
      note = "Le côté propriétaire garde la clé étrangère et le côté inverse déclare mappedBy. @JsonIgnore évite ici la récursion JSON. Sauvegarde les données avant de modifier le schéma.";
    }

    if (kind === "oto" && dir === "bi") {
      const owner = fils === "a" ? b : a;
      const child = fils === "a" ? a : b;
      const ownerField = camel(owner);
      const childField = camel(child);
      oneToOne(owner, child, fils === "a" ? idb : ida, fils === "a" ? ida : idb, snake(owner), snake(child), ownerField, childField);
    } else if (kind === "oto" && dir !== "bi") {
      const owner = dir === "uni-a" ? a : b;
      const child = owner === a ? b : a;
      const childField = camel(child);
      const ownerTable = snake(owner);
      const fk = childField + "_" + snake(owner === a ? idb : ida);
      if (owner === a) {
        codeA = "@OneToOne\nprivate " + b + " " + childField + ";";
        codeB = "/* pas de champ. " + b + " ne connaît pas " + a + ". */";
      } else {
        codeB = "@OneToOne\nprivate " + a + " " + camel(a) + ";";
        codeA = "/* pas de champ. " + a + " ne connaît pas " + b + ". */";
      }
      tables.push(ownerTable + "." + fk);
      note = "OneToOne dans un seul sens. Une seule classe a le champ. Pas de mappedBy, pas de @JsonIgnore.";
    } else if (kind === "otm" && dir === "bi") {
      const many = fils === "a" ? a : b;
      const one = many === a ? b : a;
      const manyFieldOnOne = plural(camel(many));
      const oneFieldOnMany = camel(one);
      const manyTable = snake(many);
      const fk = oneFieldOnMany + "_" + snake(one === a ? ida : idb);
      if (one === a) {
        codeA = "@OneToMany(mappedBy = \"" + oneFieldOnMany + "\")\n@JsonIgnore\nprivate Set<" + many + "> " + manyFieldOnOne + ";";
        codeB = "@ManyToOne\nprivate " + one + " " + oneFieldOnMany + ";";
      } else {
        codeB = "@OneToMany(mappedBy = \"" + oneFieldOnMany + "\")\n@JsonIgnore\nprivate Set<" + many + "> " + manyFieldOnOne + ";";
        codeA = "@ManyToOne\nprivate " + one + " " + oneFieldOnMany + ";";
      }
      tables.push(manyTable + "." + fk + "  →  " + snake(one));
      note = "Le côté plusieurs possède @ManyToOne et la clé étrangère. La collection du côté un contient mappedBy et, dans cet exemple, @JsonIgnore. Pas de table de jointure.";
    } else if (kind === "otm" && dir !== "bi") {
      const one = dir === "uni-a" ? a : b;
      const many = one === a ? b : a;
      const field = plural(camel(many));
      const join = snake(one) + "_" + field;
      const ownerCol = snake(one) + "_" + snake(one === a ? ida : idb);
      const manyCol = field + "_" + snake(many === a ? ida : idb);
      if (one === a) {
        codeA = "@OneToMany\nprivate Set<" + many + "> " + field + ";";
        codeB = "/* pas de champ vers " + a + ". */";
      } else {
        codeB = "@OneToMany\nprivate Set<" + many + "> " + field + ";";
        codeA = "/* pas de champ vers " + b + ". */";
      }
      tables.push(join + " (" + ownerCol + ", " + manyCol + " primary key)");
      note = "OneToMany sans mappedBy crée une table de jointure. La colonne de la liste est la clé primaire : un " + many + " appartient à un seul " + one + ".";
    } else if (kind === "mto") {
      const many = dir === "uni-b" ? b : a;
      const one = many === a ? b : a;
      const field = camel(one);
      const fk = field + "_" + snake(one === a ? ida : idb);
      if (many === a) {
        codeA = "@ManyToOne\nprivate " + one + " " + field + ";";
        codeB = "/* pas de liste. */";
      } else {
        codeB = "@ManyToOne\nprivate " + one + " " + field + ";";
        codeA = "/* pas de liste. */";
      }
      tables.push(snake(many) + "." + fk + "  →  " + snake(one));
      note = "ManyToOne dans un seul sens. Une clé étrangère sur la table du côté plusieurs. Pas de table de jointure.";
    } else if (kind === "mtm" && dir === "bi") {
      const owner = fils === "a" ? b : a;
      const child = owner === a ? b : a;
      const ownerField = plural(camel(child));
      const childField = plural(camel(owner));
      const join = snake(owner) + "_" + ownerField;
      const childCol = ownerField + "_" + snake(child === a ? ida : idb);
      const ownerCol = childField + "_" + snake(owner === a ? ida : idb);
      if (owner === a) {
        codeA = "@ManyToMany\nprivate Set<" + child + "> " + ownerField + ";";
        codeB = "@ManyToMany(mappedBy = \"" + ownerField + "\")\n@JsonIgnore\nprivate Set<" + owner + "> " + childField + ";";
      } else {
        codeB = "@ManyToMany\nprivate Set<" + child + "> " + ownerField + ";";
        codeA = "@ManyToMany(mappedBy = \"" + ownerField + "\")\n@JsonIgnore\nprivate Set<" + owner + "> " + childField + ";";
      }
      tables.push(join + " (" + ownerCol + ", " + childCol + ")");
      note = "Le côté inverse a mappedBy et, dans cet exemple, @JsonIgnore. La table de jointure appartient au côté propriétaire.";
    } else if (kind === "mtm") {
      const owner = dir === "uni-a" ? a : b;
      const other = owner === a ? b : a;
      const field = plural(camel(other));
      const join = snake(owner) + "_" + field;
      const ownerCol = snake(owner) + "_" + snake(owner === a ? ida : idb);
      const otherCol = field + "_" + snake(other === a ? ida : idb);
      if (owner === a) {
        codeA = "@ManyToMany\nprivate Set<" + other + "> " + field + ";";
        codeB = "/* pas de champ en retour. */";
      } else {
        codeB = "@ManyToMany\nprivate Set<" + other + "> " + field + ";";
        codeA = "/* pas de champ en retour. */";
      }
      tables.push(join + " (" + ownerCol + ", " + otherCol + ")");
      note = "ManyToMany dans un seul sens. Un seul @ManyToMany, une table de jointure, pas de mappedBy.";
    }

    out.innerHTML =
      "<h3>" + esc(a) + "</h3><pre><code data-lang=\"java\">" + esc(codeA) + "</code></pre>" +
      "<h3>" + esc(b) + "</h3><pre><code data-lang=\"java\">" + esc(codeB) + "</code></pre>" +
      "<h3>Ce que Hibernate crée</h3><ul>" +
      tables.map(function (t) { return "<li><code>" + esc(t) + "</code></li>"; }).join("") +
      "</ul><p>" + esc(note) + "</p>" +
      "<p class=\"cite\">Règle vue dans tpfoyerdb : un _ apparaît quand une majuscule est au milieu du nom. idChambre devient id_chambre. typeC devient typec, car le C est à la fin.</p>";
    out.querySelectorAll("code[data-lang]").forEach(function (el) {
      if (window.highlightBlock) window.highlightBlock(el);
    });
  }

  form.addEventListener("input", paint);
  form.addEventListener("change", paint);
  document.querySelectorAll("[data-preset]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const p = JSON.parse(btn.getAttribute("data-preset"));
      Object.keys(p).forEach(function (k) {
        const el = form.elements.namedItem(k);
        if (el) el.value = p[k];
      });
      paint();
    });
  });
  paint();
})();
