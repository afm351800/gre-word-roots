/* GRE Word Roots — reference app. No build tools; data comes from words.js (window.DECKS). */
(function () {
  "use strict";
  const DECKS = window.DECKS || [];
  const BY_SLUG = Object.fromEntries(DECKS.map(d => [d.slug, d]));
  const ALL = [];
  DECKS.forEach(d => d.words.forEach(w => ALL.push(Object.assign({ deck: d.name, slug: d.slug }, w))));
  ALL.sort((a, b) => a.w.localeCompare(b.w, "en", { sensitivity: "base" }));
  const norm = s => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const strip = s => (s || "").replace(/<[^>]+>/g, "");
  ALL.forEach(x => { x.k = norm(x.w); x.fk = norm(x.f); x.mk = norm(x.m); });

  const MARKS = [
    { id: "red", label: "Hard" },
    { id: "amber", label: "Shaky" },
    { id: "green", label: "Known" },
    { id: "blue", label: "Flag" },
  ];
  const STATUSES = [["todo", "To do"], ["progress", "Doing"], ["done", "Done"]];

  /* ---------- storage ---------- */
  const KEY = "gre-roots-v1";
  let store = { marks: {}, notes: {}, status: {} };
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s) store = Object.assign(store, s); } catch (e) {}
  if (!store.seeded) { // starting point the user described
    store.status["common-words-i"] = store.status["common-words-i"] || "done";
    store.status["common-words-ii"] = store.status["common-words-ii"] || "progress";
    store.seeded = true;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { toast("Couldn’t save on this device"); } }
  save();
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

  /* ---------- helpers ---------- */
  const app = document.getElementById("app");
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const icon = {
    search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
    chev: '<svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
    back: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
    note: '<svg class="has-note" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Has a note"><path d="M4 20h4L19 9l-4-4L4 16v4z"/></svg>',
  };
  function toast(msg) {
    const t = document.createElement("div"); t.className = "toast"; t.textContent = msg;
    document.body.appendChild(t); setTimeout(() => t.remove(), 1800);
  }
  function markCounts(words) {
    const c = { red: 0, amber: 0, green: 0, blue: 0 };
    words.forEach(w => { const m = store.marks[w.w]; if (m) c[m]++; });
    return c;
  }
  function bar(c, total) {
    const pct = n => (total ? (n / total) * 100 : 0).toFixed(2) + "%";
    return `<div class="bar" aria-hidden="true"><span class="g" style="width:${pct(c.green)}"></span><span class="a" style="width:${pct(c.amber)}"></span><span class="r" style="width:${pct(c.red)}"></span><span class="b" style="width:${pct(c.blue)}"></span></div>`;
  }

  /* ---------- routing ---------- */
  const ui = { q: "", mark: null, open: new Set() };
  let lastRoute = "";
  function route() {
    const h = location.hash.replace(/^#\/?/, "");
    const [path, query] = h.split("?");
    const parts = path.split("/").filter(Boolean);
    const key = parts.join("/");
    if (key !== lastRoute) { ui.mark = null; ui.open.clear(); if (!query) ui.q = ""; window.scrollTo(0, 0); }
    if (query) { const p = new URLSearchParams(query); ui.q = p.get("q") || ""; }
    lastRoute = key;
    if (parts[0] === "deck" && BY_SLUG[parts[1]]) return renderList(BY_SLUG[parts[1]]);
    if (parts[0] === "all") return renderList(null);
    renderHome();
  }
  window.addEventListener("hashchange", route);

  /* ---------- home ---------- */
  function renderHome() {
    document.title = "GRE Word Roots";
    const total = ALL.length;
    const c = markCounts(ALL);
    const done = DECKS.filter(d => store.status[d.slug] === "done").length;
    const prog = DECKS.filter(d => store.status[d.slug] === "progress").length;
    const doneWords = DECKS.filter(d => store.status[d.slug] === "done").reduce((s, d) => s + d.words.length, 0);
    const series = [];
    DECKS.forEach(d => { let s = series.find(x => x.name === d.series); if (!s) series.push(s = { name: d.series, decks: [] }); s.decks.push(d); });

    app.innerHTML = `
    <div class="wrap">
      <header class="home-head">
        <h1>GRE Word Roots</h1>
        <p class="sub">Every word from your flashcard decks, with where it comes from, the French equivalent and a way to remember it.</p>
      </header>
      <section class="summary" aria-label="Progress">
        <div class="stats">
          <div class="stat"><div class="n">${done}<span style="color:var(--muted);font-size:.6em">/${DECKS.length}</span></div><div class="l">decks done</div></div>
          <div class="stat"><div class="n">${prog}</div><div class="l">in progress</div></div>
          <div class="stat"><div class="n">${doneWords.toLocaleString("en")}<span style="color:var(--muted);font-size:.6em">/${total.toLocaleString("en")}</span></div><div class="l">words covered</div></div>
        </div>
        <div class="bar" aria-hidden="true"><span class="done" style="width:${(doneWords / total * 100).toFixed(2)}%"></span><span class="prog" style="width:${(DECKS.filter(d => store.status[d.slug] === "progress").reduce((s, d) => s + d.words.length, 0) / total * 100).toFixed(2)}%"></span></div>
        ${c.red + c.amber + c.green + c.blue ? `
        <div class="legend">
          ${MARKS.map(m => `<span><i class="c-${m.id}"></i>${m.label} ${c[m.id]}</span>`).join("")}
        </div>` : `<div class="legend">Mark words with a colour as you study and they’ll be counted here.</div>`}
      </section>
      <label class="search search-all" for="hq">${icon.search}
        <input id="hq" type="search" placeholder="Search all ${total.toLocaleString("en")} words" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search">
      </label>
      ${series.map(s => `
      <section class="series">
        <h2>${esc(s.name)} <small>${s.decks.reduce((n, d) => n + d.words.length, 0)} words</small></h2>
        <div class="decks">
          ${s.decks.map(d => {
            const st = store.status[d.slug] || "todo";
            const dc = markCounts(d.words);
            return `<div class="deck">
              <a href="#/deck/${d.slug}"><span class="dname">${esc(d.name)}</span><span class="dcount">${d.words.length} words</span></a>
              ${bar(dc, d.words.length)}
              <div class="status" role="group" aria-label="${esc(d.name)} status">
                ${STATUSES.map(([id, label]) => `<button type="button" data-slug="${d.slug}" data-status="${id}" aria-pressed="${st === id}">${label}</button>`).join("")}
              </div>
            </div>`;
          }).join("")}
        </div>
      </section>`).join("")}
      <a class="all-link" href="#/all">Browse all ${total.toLocaleString("en")} words A–Z</a>
      <section class="backup">
        <div>Your colours, notes and deck status are saved on this device. Export a backup now and then, and import it to move to another device.</div>
        <div class="row">
          <button class="btn" type="button" id="export">Export backup</button>
          <label class="btn" for="import">Import backup</label>
          <input type="file" id="import" accept="application/json,.json" hidden>
        </div>
      </section>
      <footer>Deck names and word lists mirror the GRE Vocabulary Flashcards app.</footer>
    </div>`;

    app.querySelectorAll(".status button").forEach(b => b.addEventListener("click", () => {
      store.status[b.dataset.slug] = b.dataset.status; save(); renderHome();
    }));
    const hq = document.getElementById("hq");
    hq.addEventListener("input", () => { if (hq.value.trim()) location.hash = "#/all?q=" + encodeURIComponent(hq.value); });
    document.getElementById("export").addEventListener("click", exportBackup);
    document.getElementById("import").addEventListener("change", importBackup);
  }

  function exportBackup() {
    const data = JSON.stringify({ app: "gre-word-roots", version: 1, exported: new Date().toISOString(), marks: store.marks, notes: store.notes, status: store.status }, null, 1);
    const blob = new Blob([data], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "gre-word-roots-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function importBackup(e) {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result);
        if (d.app !== "gre-word-roots") throw new Error("wrong file");
        Object.assign(store.marks, d.marks || {}); Object.assign(store.notes, d.notes || {}); Object.assign(store.status, d.status || {});
        save(); renderHome(); toast("Backup imported");
      } catch (err) { toast("That file isn’t a Word Roots backup"); }
    };
    r.readAsText(file);
  }

  /* ---------- deck / all list ---------- */
  let listDeck = null;
  function filtered() {
    const pool = listDeck ? ALL.filter(x => x.slug === listDeck.slug) : ALL;
    const q = norm(ui.q.trim());
    return pool.filter(x => {
      if (ui.mark === "none" && store.marks[x.w]) return false;
      if (ui.mark && ui.mark !== "none" && store.marks[x.w] !== ui.mark) return false;
      if (!q) return true;
      return x.k.includes(q) || x.fk.includes(q) || (q.length > 3 && x.mk.includes(q));
    });
  }

  function renderList(deck) {
    listDeck = deck;
    const title = deck ? deck.name : "All words";
    document.title = title + " · GRE Word Roots";
    app.innerHTML = `
    <div class="top"><div class="wrap">
      <div class="topbar"><a class="back" href="#/">${icon.back}Decks</a><h1>${esc(title)}</h1></div>
      <nav class="tabs" aria-label="Decks">
        <a class="tab" href="#/all" ${!deck ? 'aria-current="page"' : ""}>All</a>
        ${DECKS.map(d => `<a class="tab" href="#/deck/${d.slug}" ${deck && deck.slug === d.slug ? 'aria-current="page"' : ""}>${esc(d.name)}${store.status[d.slug] === "done" ? '<span class="st" title="Done"></span>' : ""}</a>`).join("")}
      </nav>
      <div class="searchrow">
        <label class="search" for="q">${icon.search}
          <input id="q" type="search" placeholder="Search English or French" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search" value="${esc(ui.q)}">
          <button class="clear" id="clear" type="button" aria-label="Clear search" ${ui.q ? "" : "hidden"}>×</button>
        </label>
      </div>
      <div class="filters" id="filters"></div>
    </div></div>
    <main class="wrap list" id="list"></main>`;

    const cur = app.querySelector('.tab[aria-current="page"]');
    if (cur) cur.scrollIntoView({ inline: "center", block: "nearest" });
    const q = document.getElementById("q"), clear = document.getElementById("clear");
    q.addEventListener("input", () => { ui.q = q.value; clear.hidden = !ui.q; drawList(); });
    clear.addEventListener("click", () => { q.value = ""; ui.q = ""; clear.hidden = true; drawList(); q.focus(); });
    if (ui.q) { q.focus(); q.setSelectionRange(ui.q.length, ui.q.length); }
    document.getElementById("list").addEventListener("click", onListClick);
    document.getElementById("list").addEventListener("input", onNoteInput);
    drawList();
  }

  function drawFilters(items) {
    const pool = listDeck ? listDeck.words : ALL;
    const c = markCounts(pool);
    const unmarked = pool.length - (c.red + c.amber + c.green + c.blue);
    const chips = [[null, "All", pool.length, ""]].concat(MARKS.map(m => [m.id, m.label, c[m.id], `<i class="c-${m.id}"></i>`]), [["none", "Unmarked", unmarked, '<i class="c-none"></i>']]);
    const allOpen = items.length && items.length <= 300 && items.every(x => ui.open.has(x.w));
    document.getElementById("filters").innerHTML =
      chips.map(([id, label, n, dot]) => `<button type="button" class="chip" data-mark="${id || ""}" aria-pressed="${ui.mark === id}">${dot}${label} ${n}</button>`).join("") +
      `<span class="meta"><span>${items.length} shown</span>${items.length <= 300 ? `<button class="link" id="toggleAll" type="button">${allOpen ? "Close all" : "Open all"}</button>` : ""}</span>`;
    document.querySelectorAll("#filters .chip").forEach(b => b.addEventListener("click", () => {
      const id = b.dataset.mark || null; ui.mark = ui.mark === id ? null : id; drawList();
    }));
    const ta = document.getElementById("toggleAll");
    if (ta) ta.addEventListener("click", () => {
      if (allOpen) items.forEach(x => ui.open.delete(x.w)); else items.forEach(x => ui.open.add(x.w));
      drawList();
    });
  }

  function entryHTML(x) {
    const open = ui.open.has(x.w);
    const mark = store.marks[x.w];
    return `<div class="entry${open ? " open" : ""}" data-w="${esc(x.w)}">
      <button class="row" type="button" aria-expanded="${open}">
        <span class="word">${esc(x.w)}</span>
        ${!listDeck ? `<span class="decktag">${esc(x.deck)}</span>` : ""}
        ${store.notes[x.w] ? icon.note : ""}
        <span class="mark ${mark || ""}" ${mark ? `title="${MARKS.find(m => m.id === mark).label}"` : ""}></span>
        ${icon.chev}
      </button>
      ${open ? panelHTML(x) : ""}
    </div>`;
  }
  function panelHTML(x) {
    const mark = store.marks[x.w];
    const id = "n-" + x.w.replace(/[^a-z0-9]/gi, "_");
    return `<div class="panel">
      <div class="def"><span class="pos">${esc(x.p)}</span><p>${x.m}</p>${x.x ? `<span class="flag">${esc(x.x)}</span>` : ""}</div>
      <div class="block"><div class="lbl">Etymology</div><div class="txt">${x.e}</div></div>
      <div class="block"><div class="lbl">French</div><div class="txt fr">${x.f}</div></div>
      <div class="block"><div class="lbl">Memory hook</div><div class="txt">${x.t}</div></div>
      <div class="block"><div class="lbl">Colour</div><div class="txt marks">
        ${MARKS.map(m => `<button type="button" class="mk" data-mark="${m.id}" aria-pressed="${mark === m.id}"><i class="c-${m.id}"></i>${m.label}</button>`).join("")}
      </div></div>
      <div class="block"><label class="lbl" for="${id}">My notes</label><div class="txt">
        <textarea class="note" id="${id}" placeholder="Your own example, link, mnemonic…">${esc(store.notes[x.w] || "")}</textarea>
        <div class="saved" aria-live="polite"></div>
      </div></div>
    </div>`;
  }

  function drawList() {
    const items = filtered();
    drawFilters(items);
    const list = document.getElementById("list");
    if (!items.length) {
      list.innerHTML = `<p class="empty">${ui.q ? `No word matches “${esc(ui.q)}”.` : "No words with this colour yet."}</p>`;
      return;
    }
    const groups = new Map();
    items.forEach(x => { const L = x.w[0].toUpperCase(); if (!groups.has(L)) groups.set(L, []); groups.get(L).push(x); });
    let html = "";
    groups.forEach((ws, L) => { html += `<section class="group"><h2 class="letter">${L}</h2><div class="entries">${ws.map(entryHTML).join("")}</div></section>`; });
    list.innerHTML = html;
  }

  const LOOKUP = new Map(ALL.map(x => [x.w, x]));
  function redrawEntry(el) {
    const x = LOOKUP.get(el.dataset.w);
    const tmp = document.createElement("div"); tmp.innerHTML = entryHTML(x);
    const fresh = tmp.firstElementChild; el.replaceWith(fresh); return fresh;
  }
  function onListClick(e) {
    const entry = e.target.closest(".entry"); if (!entry) return;
    const w = entry.dataset.w;
    if (e.target.closest(".row")) {
      ui.open.has(w) ? ui.open.delete(w) : ui.open.add(w);
      const fresh = redrawEntry(entry);
      fresh.querySelector(".row").focus({ preventScroll: true });
      const ta = document.getElementById("toggleAll");
      if (ta) { const items = filtered(); ta.textContent = items.every(x => ui.open.has(x.w)) ? "Close all" : "Open all"; }
      return;
    }
    const mk = e.target.closest(".mk");
    if (mk) {
      const id = mk.dataset.mark;
      if (store.marks[w] === id) delete store.marks[w]; else store.marks[w] = id;
      save();
      const note = entry.querySelector(".note"); const val = note ? note.value : null;
      const fresh = redrawEntry(entry);
      if (val !== null) fresh.querySelector(".note").value = val;
      drawFilters(filtered());
    }
  }
  let noteTimer = null;
  function onNoteInput(e) {
    if (!e.target.classList.contains("note")) return;
    const entry = e.target.closest(".entry"); const w = entry.dataset.w; const val = e.target.value;
    const s = entry.querySelector(".saved"); s.textContent = "";
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => {
      if (val.trim()) store.notes[w] = val; else delete store.notes[w];
      save(); s.textContent = "Saved";
      const row = entry.querySelector(".row"); const has = row.querySelector(".has-note");
      if (val.trim() && !has) row.querySelector(".mark").insertAdjacentHTML("beforebegin", icon.note);
      if (!val.trim() && has) has.remove();
    }, 400);
  }

  route();
})();
