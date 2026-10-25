/* Offline highlighter for Java, properties, JSON, and SQL. */
(function () {
  const JAVA = new Set(
    "package import public private protected class interface enum extends implements return new if else for while static final void boolean int long double float byte short char true false null this super try catch throw throws @Override".split(" ")
  );

  function esc(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function java(src) {
    const re = /(\/\*[\s\S]*?\*\/|\/\/.*$|"(?:\\.|[^"\\])*"|@[A-Za-z_][\w.]*|\b[A-Za-z_][\w]*\b|\b\d+\b)/gm;
    let out = "";
    let i = 0;
    src.replace(re, function (m, _g, off) {
      out += esc(src.slice(i, off));
      if (m.startsWith("//") || m.startsWith("/*")) out += '<span class="cm">' + esc(m) + "</span>";
      else if (m.startsWith('"')) out += '<span class="str">' + esc(m) + "</span>";
      else if (m.startsWith("@")) out += '<span class="ann">' + esc(m) + "</span>";
      else if (/^\d/.test(m)) out += '<span class="num">' + esc(m) + "</span>";
      else if (JAVA.has(m)) out += '<span class="kw">' + esc(m) + "</span>";
      else out += esc(m);
      i = off + m.length;
      return m;
    });
    out += esc(src.slice(i));
    return out;
  }

  function props(src) {
    return src
      .split("\n")
      .map(function (line) {
        if (/^\s*#/.test(line)) return '<span class="cm">' + esc(line) + "</span>";
        const eq = line.indexOf("=");
        if (eq === -1) return esc(line);
        return '<span class="kw">' + esc(line.slice(0, eq)) + "</span>" + esc(line.slice(eq));
      })
      .join("\n");
  }

  function json(src) {
    return esc(src).replace(
      /(&quot;(?:[^&]|&(?!quot;))*&quot;)(\s*:)?|\b(true|false|null)\b|\b\d+\b/g,
      function (m, str, colon, kw) {
        if (str && colon) return '<span class="kw">' + str + "</span>" + colon;
        if (str) return '<span class="str">' + str + "</span>";
        if (kw) return '<span class="kw">' + kw + "</span>";
        return '<span class="num">' + m + "</span>";
      }
    );
  }

  function sql(src) {
    const words = new Set("create table primary key foreign references not null varchar bigint int date constraint engine alter drop insert into values select from where".split(" "));
    return esc(src).replace(/\b[A-Za-z_]+\b/g, function (w) {
      return words.has(w.toLowerCase()) ? '<span class="kw">' + w + "</span>" : w;
    });
  }

  const map = { java: java, properties: props, json: json, sql: sql };

  window.highlightBlock = function (el) {
    const lang = el.getAttribute("data-lang") || "java";
    const fn = map[lang] || function (s) { return esc(s); };
    el.innerHTML = fn(el.textContent.replace(/\n$/, ""));
  };
})();
