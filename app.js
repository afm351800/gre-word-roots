/* GRE Word Roots — reference app + 13-day plan. No build tools; data comes from words.js (window.DECKS). */
(function () {
  "use strict";
  const DECKS = window.DECKS || [];
  const BY_SLUG = Object.fromEntries(DECKS.map(d => [d.slug, d]));
  const ALL = [];
  DECKS.forEach(d => d.words.forEach(w => ALL.push(Object.assign({ deck: d.name, slug: d.slug }, w))));
  ALL.sort((a, b) => a.w.localeCompare(b.w, "en", { sensitivity: "base" }));
  const LOOKUP = new Map(ALL.map(x => [x.w, x]));
  const norm = s => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  ALL.forEach(x => { x.k = norm(x.w); x.fk = norm(x.f); x.mk = norm(x.m); });

  const MARKS = [
    { id: "red", label: "Hard" },
    { id: "amber", label: "Shaky" },
    { id: "green", label: "Known" },
    { id: "blue", label: "Flag" },
  ];

  /* ---------- the plan ---------- */
  const TEST_DATE = "2026-11-07";
  const PLAN = [
    { date: "2026-10-25", learn: ["common-words-ii", "common-words-iii", "common-words-iv"], title: "Finish Common II · Common III–IV" },
    { date: "2026-10-26", learn: ["common-words-v", "common-words-vi", "common-words-vii"], title: "Common V–VII" },
    { date: "2026-10-27", learn: ["basic-i", "basic-ii"], title: "Basic I–II" },
    { date: "2026-10-28", learn: ["basic-iii", "basic-iv", "basic-v"], title: "Basic III–V" },
    { date: "2026-10-29", learn: ["basic-vi", "basic-vii"], title: "Basic VI–VII" },
    { date: "2026-10-30", learn: ["basic-viii", "basic-ix"], title: "Basic VIII–IX" },
    { date: "2026-10-31", learn: ["advanced-i", "advanced-ii", "advanced-iii"], title: "Advanced I–III" },
    { date: "2026-11-01", learn: ["advanced-iv", "advanced-v"], title: "Advanced IV–V" },
    { date: "2026-11-02", learn: ["advanced-vi", "advanced-vii"], title: "Advanced VI–VII" },
    { date: "2026-11-03", learn: ["advanced-viii", "advanced-ix"], title: "Advanced VIII–IX" },
    { date: "2026-11-04", learn: [], kind: "sweep1", title: "Final stretch · Sweep Common + Basic" },
    { date: "2026-11-05", learn: [], kind: "sweep2", title: "Final stretch · Sweep Advanced + traps" },
    { date: "2026-11-06", learn: [], kind: "taper", title: "Taper · light review only" },
    { date: TEST_DATE, learn: [], kind: "test", title: "Test day" },
  ];
  // Day each deck is first learned (index into PLAN, 1-based); Common Words I was mastered before the plan.
  const LEARN_DAY = { "common-words-i": 0 };
  PLAN.forEach((p, i) => p.learn.forEach(s => { LEARN_DAY[s] = i + 1; }));

  /* ---------- storage ---------- */
  const KEY = "gre-roots-v1";
  let store = { marks: {}, notes: {}, hidden: {}, rev: {}, days: {} };
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s) store = Object.assign(store, s); } catch (e) {}
  ["marks", "notes", "hidden", "rev", "days"].forEach(k => { store[k] = store[k] || {}; });
  if (!store.seed2) { // where Alexis already was in the flashcard app on 25 Oct
    BY_SLUG["common-words-i"].words.forEach(w => { if (!store.marks[w.w]) store.marks[w.w] = "green"; });
    ["apathetic", "banal", "dictatorial", "dogmatic", "eschew", "gainsay", "obscure", "rustic", "vociferous"].forEach(w => { if (!store.marks[w]) store.marks[w] = "green"; });
    ["gossamer", "platitude", "torpor"].forEach(w => { if (!store.marks[w]) store.marks[w] = "amber"; });
    store.seed2 = true;
  }
  delete store.status; delete store.seeded;
  function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { toast("Couldn’t save on this device"); } }
  save();
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

  /* ---------- dates ---------- */
  const pad = n => String(n).padStart(2, "0");
  function todayStr() {
    const q = new URLSearchParams(location.search).get("date");
    if (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) return q;
    const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  const TODAY = todayStr();
  const parseD = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const fmt = (s, opts) => parseD(s).toLocaleDateString("en-GB", opts || { weekday: "short", day: "numeric", month: "short" });
  const daysBetween = (a, b) => Math.round((parseD(b) - parseD(a)) / 86400000);
  function dayIndexOf(dateStr) { // 1..14 inside the plan; 0 before; 15 after
    if (dateStr < PLAN[0].date) return 0;
    const i = PLAN.findIndex(p => p.date === dateStr);
    return i >= 0 ? i + 1 : PLAN.length + 1;
  }
  const DAY = dayIndexOf(TODAY);

  /* ---------- word state ---------- */
  const isHidden = w => !!store.hidden[w];
  const isSorted = w => isHidden(w) || !!store.marks[w];
  const markOf = w => store.marks[w];

  function learnQueue(day) {
    const decks = DECKS.filter(d => LEARN_DAY[d.slug] !== undefined && LEARN_DAY[d.slug] <= Math.max(day, 1) && LEARN_DAY[d.slug] > 0);
    const out = [];
    decks.sort((a, b) => LEARN_DAY[a.slug] - LEARN_DAY[b.slug] || DECKS.indexOf(a) - DECKS.indexOf(b));
    decks.forEach(d => d.words.forEach(w => { if (!isSorted(w.w)) out.push(w.w); }));
    return out;
  }
  function reviewPool(day) {
    const p = PLAN[day - 1] || {};
    const kind = p.kind;
    const live = x => !isHidden(x.w);
    const learned = x => LEARN_DAY[x.slug] !== undefined && LEARN_DAY[x.slug] < day && isSorted(x.w);
    let pool;
    const weak = x => ["red", "amber", "blue"].includes(markOf(x.w));
    const isAdv = x => x.slug.startsWith("advanced");
    if (kind === "sweep1") pool = ALL.filter(x => live(x) && isSorted(x.w) && (!isAdv(x) || weak(x)));
    else if (kind === "sweep2") pool = ALL.filter(x => live(x) && isSorted(x.w) && (isAdv(x) || ["red", "blue"].includes(markOf(x.w)) || x.x));
    else if (kind === "taper") pool = ALL.filter(x => live(x) && ["red", "blue"].includes(markOf(x.w)));
    else if (kind === "test") pool = ALL.filter(x => live(x) && markOf(x.w) === "red").slice(0, 30);
    else if (day === 1) pool = ALL.filter(x => live(x) && (x.slug === "common-words-i" || (x.slug === "common-words-ii" && markOf(x.w))));
    else {
      const due = new Set(DECKS.filter(d => [day - 1, day - 3, day - 7].includes(LEARN_DAY[d.slug])).map(d => d.slug));
      pool = ALL.filter(x => live(x) && learned(x) && (
        (due.has(x.slug) && markOf(x.w) !== "green") || ["red", "blue"].includes(markOf(x.w))));
    }
    return pool.map(x => x.w);
  }
  const reviewQueue = day => reviewPool(day).filter(w => store.rev[w] !== TODAY);
  function counts(words) {
    const c = { hidden: 0, green: 0, amber: 0, red: 0, blue: 0, none: 0 };
    words.forEach(w => { const k = w.w || w; if (isHidden(k)) c.hidden++; else if (markOf(k)) c[markOf(k)]++; else c.none++; });
    return c;
  }

  /* ---------- helpers ---------- */
  const app = document.getElementById("app");
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const icon = {
    search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
    chev: '<svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
    back: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
    note: '<svg class="has-note" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Has a note"><path d="M4 20h4L19 9l-4-4L4 16v4z"/></svg>',
    check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>',
    close: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  };
  function toast(msg) {
    const t = document.createElement("div"); t.className = "toast"; t.textContent = msg;
    document.body.appendChild(t); setTimeout(() => t.remove(), 1800);
  }
  function stackBar(c, total, cls) {
    const pct = n => (total ? (n / total) * 100 : 0).toFixed(2) + "%";
    return `<div class="bar ${cls || ""}" aria-hidden="true"><span class="h" style="width:${pct(c.hidden)}"></span><span class="g" style="width:${pct(c.green)}"></span><span class="a" style="width:${pct(c.amber)}"></span><span class="r" style="width:${pct(c.red)}"></span><span class="b" style="width:${pct(c.blue)}"></span></div>`;
  }
  const nav = active => `<nav class="mainnav" aria-label="Sections"><a href="#/" ${active === "plan" ? 'aria-current="page"' : ""}>Plan</a><a href="#/decks" ${active === "decks" ? 'aria-current="page"' : ""}>Decks</a><a href="#/all" ${active === "all" ? 'aria-current="page"' : ""}>All words</a></nav>`;
  const mins = n => { if (n <= 0) return ""; const m = Math.max(5, Math.round(n / 5) * 5); return m < 60 ? `≈ ${m} min` : `≈ ${Math.floor(m / 60)} h${m % 60 ? " " + (m % 60) : ""}`; };

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
    if (parts[0] === "decks") return renderDecks();
    if (parts[0] === "session" && (parts[1] === "learn" || parts[1] === "review")) return renderSession(parts[1]);
    renderPlan();
  }
  window.addEventListener("hashchange", route);

  /* ---------- plan page ---------- */
  function dayState(i) { // i = 1..14
    const p = PLAN[i - 1]; const d = store.days[p.date] || {};
    return { learn: !!d.learn, review: !!d.review };
  }
  function renderPlan() {
    document.title = "GRE Word Roots";
    const left = daysBetween(TODAY, TEST_DATE);
    const c = counts(ALL);
    const total = ALL.length;
    const day = Math.min(Math.max(DAY, 1), PLAN.length);
    const p = PLAN[day - 1];
    const lq = learnQueue(day);
    const rq = reviewQueue(day);
    const rpool = reviewPool(day);
    const learnDone = lq.length === 0;
    const reviewDone = rq.length === 0;
    if (DAY >= 1 && DAY <= PLAN.length) {
      const prev = store.days[TODAY] || {};
      const nl = learnDone && (p.learn.length > 0 || prev.learn), nr = reviewDone && rpool.length > 0;
      if ((nl && !prev.learn) || (nr && !prev.review)) { store.days[TODAY] = { learn: prev.learn || nl, review: prev.review || nr }; save(); }
    }
    const catchUp = p.learn.length ? lq.filter(w => LEARN_DAY[LOOKUP.get(w).slug] < day).length : lq.length;
    const learnDecks = p.learn.map(s => BY_SLUG[s].name);
    const finals = {
      sweep1: "Every Common and Basic word you haven’t hidden, Known ones included, at speed, plus every weak word from Advanced.",
      sweep2: "Every Advanced word you haven’t hidden, plus all Hard and Flag words and every trap word (faux ami, 2nd meaning, look-alike).",
      taper: "Hard and Flag words only, once, in the morning. No new words. Stop by lunchtime.",
      test: "Over breakfast: your 30 hardest words, once. Then close the app.",
    };

    let todayHTML;
    if (DAY > PLAN.length) {
      todayHTML = `<section class="today"><h2>Test done</h2><p class="muted">Well done. Your notes and marks are still here if you need them.</p></section>`;
    } else {
      const label = DAY === 0 ? `Starts ${fmt(PLAN[0].date)}` : `Day ${day} of ${PLAN.length - 1}`;
      todayHTML = `
      <section class="today" aria-label="Today">
        <div class="today-head">
          <div><div class="eyebrow">${p.kind === "test" ? "Test day" : label} · ${fmt(p.date, { weekday: "long", day: "numeric", month: "long" })}</div>
          <h2>${esc(p.title)}</h2></div>
        </div>
        <div class="sessions">
          ${p.kind === "test" || p.kind === "taper" || (p.kind && learnDone) ? "" : `
          <a class="sess ${learnDone ? "done" : ""}" href="#/session/learn" ${learnDone ? 'aria-disabled="true"' : ""}>
            <div class="sess-top"><span class="num">1</span><span class="sess-name">Learn</span>${learnDone ? `<span class="tick">${icon.check}</span>` : ""}</div>
            <div class="sess-big">${learnDone ? "Done" : `${lq.length} <small>words to sort</small>`}</div>
            <div class="sess-sub">${learnDone ? (p.learn.length ? "All of today’s decks are sorted." : "Nothing new today.") :
              `${learnDecks.length ? esc(p.title) : "Words you didn’t get to"}${catchUp && p.learn.length ? ` + ${catchUp} catch-up` : ""} · ${mins(lq.length * 0.5)}`}</div>
          </a>`}
          <a class="sess ${reviewDone ? "done" : ""}" href="#/session/review" ${reviewDone ? 'aria-disabled="true"' : ""}>
            <div class="sess-top"><span class="num">${p.kind && (p.kind === "test" || p.kind === "taper" || learnDone) ? "1" : "2"}</span><span class="sess-name">${p.kind === "test" ? "Warm-up" : p.kind && p.kind.startsWith("sweep") ? "Sweep" : "Review"}</span>${reviewDone && rpool.length ? `<span class="tick">${icon.check}</span>` : ""}</div>
            <div class="sess-big">${reviewDone ? (rpool.length ? "Done" : "—") : `${rq.length} <small>words</small>`}</div>
            <div class="sess-sub">${reviewDone && !rpool.length ? "Nothing due today." :
              p.kind ? `${esc(finals[p.kind])} · ${mins(rq.length * (p.kind.startsWith("sweep") ? 0.15 : 0.3))}` : day === 1 ? `Quick check of Common Words I and the Common II words you’ve done. · ${mins(rq.length * 0.3)}` : `Words from ${dueText(day)} that aren’t Known yet, plus all Hard & Flag. · ${mins(rq.length * 0.3)}`}</div>
          </a>
        </div>
        ${p.kind && p.kind.startsWith("sweep") ? `<p class="hint"><b>Final stretch, the most intense days:</b> catch up first if anything is left, then the sweep. Go fast: if you know it in 2 seconds, Got it. Anything you hesitate on becomes Shaky or Hard. Then do two timed Verbal sections (about 1 h). About 3 hours in total.</p>` : ""}
        ${p.kind === "taper" ? `<p class="hint"><b>Taper:</b> 45 minutes max, then stop. Being fresh tomorrow is worth more than 50 extra words.</p>` : ""}
        ${!p.kind ? `<p class="hint"><b>How:</b> do Learn in the morning: hide what you already know, read the root and the French for the rest. Then drill the same decks in your flashcard app. Do Review in the evening. Aim for about 2–2½ hours in total.</p>` : ""}
      </section>`;
    }

    const sorted = total - c.none;
    app.innerHTML = `
    <div class="wrap">
      <header class="home-head">
        ${nav("plan")}
        <div class="countdown">
          <div><div class="eyebrow">GRE · ${fmt(TEST_DATE, { weekday: "long", day: "numeric", month: "long" })}</div>
          <h1>${left > 1 ? `${left} days to go` : left === 1 ? "Tomorrow" : left === 0 ? "Today. You’re ready." : "Test done"}</h1></div>
        </div>
      </header>
      ${todayHTML}
      <section class="card progress" aria-label="Progress">
        <div class="row-between"><h3>Progress</h3><span class="muted small">${sorted.toLocaleString("en")} of ${total.toLocaleString("en")} sorted</span></div>
        ${stackBar(c, total, "big")}
        <div class="legend">
          <span><i class="c-hidden"></i>Already knew ${c.hidden}</span>
          <span><i class="c-green"></i>Known ${c.green}</span>
          <span><i class="c-amber"></i>Shaky ${c.amber}</span>
          <span><i class="c-red"></i>Hard ${c.red}</span>
          <span><i class="c-blue"></i>Flag ${c.blue}</span>
          <span><i class="c-none"></i>Not sorted ${c.none}</span>
        </div>
      </section>
      <section class="card" aria-label="Plan">
        <h3>The plan</h3>
        <ol class="timeline">
          ${PLAN.map((q, i) => {
            const n = i + 1; const st = dayState(n);
            const isToday = q.date === TODAY; const past = q.date < TODAY;
            const lw = q.learn.reduce((s, sl) => s + BY_SLUG[sl].words.length, 0);
            const deckLeft = q.learn.reduce((s, sl) => s + BY_SLUG[sl].words.filter(w => !isSorted(w.w)).length, 0);
            const behind = past && deckLeft > 0;
            return `<li class="tl ${isToday ? "now" : ""} ${past ? "past" : ""} ${q.kind ? "k-" + q.kind : ""}">
              <div class="tl-date"><b>${fmt(q.date, { day: "numeric" })}</b><span>${fmt(q.date, { month: "short" })}</span><span>${fmt(q.date, { weekday: "short" })}</span></div>
              <div class="tl-body">
                <div class="tl-title">${esc(q.title)}${isToday ? ' <span class="pill">Today</span>' : ""}${behind ? ` <span class="pill warn">${deckLeft} left</span>` : ""}</div>
                <div class="tl-sub">${q.learn.length ? `${lw} new words · then review` : q.kind === "test" ? "15-min warm-up, ID, go" : q.kind === "taper" ? "Light · 45 min max" : "Most intense day · ≈ 3 h"}</div>
              </div>
              <div class="tl-marks">${q.kind === "test" ? "" : `<span class="dot ${!q.learn.length ? "na" : deckLeft === 0 ? "ok" : ""}" title="Learn">L</span>`}<span class="dot ${st.review ? "ok" : ""}" title="Review">R</span></div>
            </li>`;
          }).join("")}
        </ol>
      </section>
      <section class="card finals" aria-label="Last two days">
        <h3>The final stretch</h3>
        <p class="muted small" style="margin:0">Two hard days, then ease off. You go through every word one last time, then rest so it all sticks.</p>
        <div class="final"><div class="fd">Wed 4 Nov</div><div><b>Sweep 1 · about 3 h.</b> Catch up on anything you haven’t sorted, then a fast pass through every Common and Basic word you haven’t hidden, Known ones included. Hesitate, and it goes back to Shaky. Then two timed Verbal sections.</div></div>
        <div class="final"><div class="fd">Thu 5 Nov</div><div><b>Sweep 2 · about 3 h.</b> Every Advanced word you haven’t hidden, plus all Hard and Flag words and every trap word (faux ami, 2nd meaning, look-alike). Then two more timed Verbal sections. In bed on time.</div></div>
        <div class="final"><div class="fd">Fri 6 Nov</div><div><b>Taper · 45 min max, morning.</b> Hard and Flag words only, once. No new words. Afternoon: check your test centre, route and arrival time, and put the valid passport you registered with in your bag. Something relaxing in the evening.</div></div>
        <div class="final"><div class="fd">Sat 7 Nov</div><div><b>Test day · 15 min.</b> Your 30 hardest words over breakfast, once. Eat properly, arrive early, and trust the roots: when you don’t know a word, take it apart.</div></div>
      </section>
      <section class="backup">
        <div>Everything you mark is saved on this phone. Export a backup now and then.</div>
        <div class="row">
          <button class="btn" type="button" id="export">Export backup</button>
          <label class="btn" for="import">Import backup</label>
          <input type="file" id="import" accept="application/json,.json" hidden>
        </div>
      </section>
      <footer>Deck names and word lists mirror the GRE Vocabulary Flashcards app.</footer>
    </div>`;
    app.querySelectorAll('.sess[aria-disabled="true"]').forEach(a => a.addEventListener("click", e => e.preventDefault()));
    document.getElementById("export").addEventListener("click", exportBackup);
    document.getElementById("import").addEventListener("change", importBackup);
  }
  function dueText(day) {
    const names = DECKS.filter(d => [day - 1, day - 3, day - 7].includes(LEARN_DAY[d.slug])).map(d => d.name);
    if (!names.length) return "earlier decks";
    return names.length > 3 ? `${names.slice(0, 3).join(", ")} +${names.length - 3}` : names.join(", ");
  }

  /* ---------- decks page ---------- */
  function renderDecks() {
    document.title = "Decks · GRE Word Roots";
    const total = ALL.length;
    const series = [];
    DECKS.forEach(d => { let s = series.find(x => x.name === d.series); if (!s) series.push(s = { name: d.series, decks: [] }); s.decks.push(d); });
    app.innerHTML = `
    <div class="wrap">
      <header class="home-head">${nav("decks")}<h1>Decks</h1>
        <p class="sub">Every word with its root, the French equivalent and a way to remember it.</p></header>
      <label class="search search-all" for="hq">${icon.search}
        <input id="hq" type="search" placeholder="Search all ${total.toLocaleString("en")} words" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search">
      </label>
      ${series.map(s => `
      <section class="series">
        <h2>${esc(s.name)} <small>${s.decks.reduce((n, d) => n + d.words.length, 0)} words</small></h2>
        <div class="decks">
          ${s.decks.map(d => {
            const dc = counts(d.words); const sorted = d.words.length - dc.none;
            const ld = LEARN_DAY[d.slug]; const when = ld === 0 ? "Before the plan" : PLAN[ld - 1] ? fmt(PLAN[ld - 1].date) : "";
            return `<a class="deck" href="#/deck/${d.slug}">
              <div class="deck-top"><span class="dname">${esc(d.name)}</span>${sorted === d.words.length ? `<span class="tick">${icon.check}</span>` : ""}</div>
              ${stackBar(dc, d.words.length)}
              <div class="dmeta"><span>${sorted}/${d.words.length} sorted</span><span>${when}</span></div>
            </a>`;
          }).join("")}
        </div>
      </section>`).join("")}
      <footer>Deck names and word lists mirror the GRE Vocabulary Flashcards app.</footer>
    </div>`;
    const hq = document.getElementById("hq");
    hq.addEventListener("input", () => { if (hq.value.trim()) location.hash = "#/all?q=" + encodeURIComponent(hq.value); });
  }

  function exportBackup() {
    const data = JSON.stringify({ app: "gre-word-roots", version: 2, exported: new Date().toISOString(), marks: store.marks, notes: store.notes, hidden: store.hidden, rev: store.rev, days: store.days }, null, 1);
    const blob = new Blob([data], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "gre-word-roots-backup-" + TODAY + ".json";
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
        ["marks", "notes", "hidden", "rev", "days"].forEach(k => Object.assign(store[k], d[k] || {}));
        save(); route(); toast("Backup imported");
      } catch (err) { toast("That file isn’t a Word Roots backup"); }
    };
    r.readAsText(file);
  }

  /* ---------- sessions (card by card) ---------- */
  let sess = null;
  function seededShuffle(arr, seed) {
    let s = 0; for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { s = (s * 1103515245 + 12345) >>> 0; const j = s % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function renderSession(mode) {
    const day = Math.min(Math.max(DAY, 1), PLAN.length);
    if (!sess || sess.mode !== mode || sess.finished) {
      const q = mode === "learn" ? learnQueue(day) : seededShuffle(reviewQueue(day), TODAY);
      sess = { mode, queue: q, i: 0, revealed: false, history: [], tally: { hidden: 0, green: 0, amber: 0, red: 0, blue: 0 } };
    }
    document.title = (mode === "learn" ? "Learn" : "Review") + " · GRE Word Roots";
    drawCard();
  }
  function drawCard() {
    const s = sess;
    while (s.i < s.queue.length && s.mode === "learn" && isSorted(s.queue[s.i]) && !s.history.some(h => h.i === s.i)) s.i++;
    const total = s.queue.length;
    const pct = total ? (s.i / total) * 100 : 100;
    const top = `<div class="sess-bar"><div class="wrap sess-bar-in">
        <a class="iconbtn" href="#/" aria-label="End session">${icon.close}</a>
        <div class="sess-title">${s.mode === "learn" ? "Learn" : "Review"} <span class="muted">${Math.min(s.i + 1, total)} / ${total}</span></div>
        <button class="link" id="undo" type="button" ${s.history.length ? "" : "hidden"}>Undo</button>
      </div><div class="pbar"><span style="width:${pct.toFixed(1)}%"></span></div></div>`;
    if (s.i >= total) {
      const t = s.tally;
      const lines = [["hidden", "Already knew (hidden)"], ["green", "Known"], ["amber", "Shaky"], ["red", "Hard"], ["blue", "Flag"]].filter(([k]) => t[k]);
      app.innerHTML = top + `<main class="wrap done-screen">
        <h1>${total ? "Session done" : "Nothing to do here"}</h1>
        ${total ? `<ul class="tally">${lines.map(([k, l]) => `<li><i class="c-${k}"></i>${l}<b>${t[k]}</b></li>`).join("")}</ul>` : `<p class="muted">You’re up to date.</p>`}
        ${s.mode === "learn" && total ? `<p class="hint">Now drill today’s decks in your flashcard app. Come back this evening for Review.</p>` : ""}
        <div class="row"><a class="btn primary" href="#/">Back to plan</a>${s.mode === "learn" ? `<a class="btn" href="#/session/review">Start review</a>` : ""}</div>
      </main>`;
      s.finished = true;
      bindUndo();
      return;
    }
    const w = s.queue[s.i]; const x = LOOKUP.get(w);
    const mark = markOf(w);
    const front = `
      <div class="flash-top"><span class="decktag">${esc(x.deck)}</span>${mark ? `<span class="mark ${mark}"></span>` : ""}</div>
      <div class="flash-word">${esc(x.w)}</div>`;
    const back = s.revealed ? `
      <div class="flash-back">
        <div class="def"><span class="pos">${esc(x.p)}</span><p>${x.m}</p>${x.x ? `<span class="flag">${esc(x.x)}</span>` : ""}</div>
        <div class="block"><div class="lbl">Etymology</div><div class="txt">${x.e}</div></div>
        <div class="block"><div class="lbl">French</div><div class="txt fr">${x.f}</div></div>
        <div class="block"><div class="lbl">Memory hook</div><div class="txt">${x.t}</div></div>
        ${store.notes[w] ? `<div class="block"><div class="lbl">My notes</div><div class="txt">${esc(store.notes[w])}</div></div>` : ""}
      </div>` : `<p class="flash-hint">${s.mode === "learn" ? "Do you already know this word for sure?" : "Say the meaning out loud, then reveal."}</p>`;
    const actions = !s.revealed
      ? (s.mode === "learn"
        ? `<button class="act hide" data-act="hidden" type="button">Already know it<small>hide it</small></button><button class="act show" data-act="reveal" type="button">Not sure<small>show me</small></button>`
        : `<button class="act show wide" data-act="reveal" type="button">Show answer</button>`)
      : `<button class="act red" data-act="red" type="button">Hard</button><button class="act amber" data-act="amber" type="button">Shaky</button><button class="act green" data-act="green" type="button">${s.mode === "learn" ? "Knew it" : "Got it"}</button>`;
    app.innerHTML = top + `<main class="wrap flash-wrap"><article class="flash ${s.revealed ? "revealed" : ""}" id="card">${front}${back}</article></main>
      <div class="actions"><div class="wrap actions-in">${actions}</div></div>`;
    if (!s.revealed) document.getElementById("card").addEventListener("click", () => { s.revealed = true; drawCard(); });
    app.querySelectorAll(".act").forEach(b => b.addEventListener("click", () => act(b.dataset.act)));
    bindUndo();
  }
  function bindUndo() {
    const u = document.getElementById("undo"); if (!u) return;
    u.addEventListener("click", () => {
      if (!sess) return;
      const h = sess.history.pop(); if (!h) return;
      sess.finished = false;
      if (h.prevHidden) store.hidden[h.w] = true; else delete store.hidden[h.w];
      if (h.prevMark) store.marks[h.w] = h.prevMark; else delete store.marks[h.w];
      if (h.prevRev) store.rev[h.w] = h.prevRev; else delete store.rev[h.w];
      sess.tally[h.act]--; sess.i = h.i; sess.revealed = h.act !== "hidden"; save(); drawCard();
    });
  }
  function act(a) {
    const s = sess; const w = s.queue[s.i];
    if (a === "reveal") { s.revealed = true; drawCard(); return; }
    s.history.push({ i: s.i, w, act: a, prevHidden: !!store.hidden[w], prevMark: store.marks[w], prevRev: store.rev[w] });
    if (a === "hidden") store.hidden[w] = true; else { delete store.hidden[w]; store.marks[w] = a; }
    if (s.mode === "review") store.rev[w] = TODAY;
    s.tally[a]++; s.i++; s.revealed = false; save();
    window.scrollTo(0, 0); drawCard();
  }

  /* ---------- deck / all list ---------- */
  let listDeck = null;
  function filtered() {
    const pool = listDeck ? ALL.filter(x => x.slug === listDeck.slug) : ALL;
    const q = norm(ui.q.trim());
    return pool.filter(x => {
      const hid = isHidden(x.w);
      if (ui.mark === "hidden") { if (!hid) return false; }
      else {
        if (hid && !q) return false;
        if (ui.mark === "none" && markOf(x.w)) return false;
        if (ui.mark && ui.mark !== "none" && markOf(x.w) !== ui.mark) return false;
      }
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
      <div class="topbar"><a class="back" href="#/decks">${icon.back}Decks</a><h1>${esc(title)}</h1></div>
      <nav class="tabs" aria-label="Decks">
        <a class="tab" href="#/all" ${!deck ? 'aria-current="page"' : ""}>All</a>
        ${DECKS.map(d => `<a class="tab" href="#/deck/${d.slug}" ${deck && deck.slug === d.slug ? 'aria-current="page"' : ""}>${esc(d.name)}</a>`).join("")}
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
    const c = counts(pool);
    const chips = [[null, "All", pool.length - c.hidden, ""]]
      .concat(MARKS.map(m => [m.id, m.label, c[m.id], `<i class="c-${m.id}"></i>`]),
        [["none", "Not sorted", c.none, '<i class="c-none"></i>'], ["hidden", "Hidden", c.hidden, '<i class="c-hidden"></i>']]);
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
    const mark = markOf(x.w); const hid = isHidden(x.w);
    return `<div class="entry${open ? " open" : ""}${hid ? " is-hidden" : ""}" data-w="${esc(x.w)}">
      <button class="row" type="button" aria-expanded="${open}">
        <span class="word">${esc(x.w)}</span>
        ${!listDeck ? `<span class="decktag">${esc(x.deck)}</span>` : ""}
        ${store.notes[x.w] ? icon.note : ""}
        <span class="mark ${hid ? "hidden" : mark || ""}"></span>
        ${icon.chev}
      </button>
      ${open ? panelHTML(x) : ""}
    </div>`;
  }
  function panelHTML(x) {
    const mark = markOf(x.w); const hid = isHidden(x.w);
    const id = "n-" + x.w.replace(/[^a-z0-9]/gi, "_");
    return `<div class="panel">
      <div class="def"><span class="pos">${esc(x.p)}</span><p>${x.m}</p>${x.x ? `<span class="flag">${esc(x.x)}</span>` : ""}</div>
      <div class="block"><div class="lbl">Etymology</div><div class="txt">${x.e}</div></div>
      <div class="block"><div class="lbl">French</div><div class="txt fr">${x.f}</div></div>
      <div class="block"><div class="lbl">Memory hook</div><div class="txt">${x.t}</div></div>
      <div class="block"><div class="lbl">Colour</div><div class="txt marks">
        ${MARKS.map(m => `<button type="button" class="mk" data-mark="${m.id}" aria-pressed="${!hid && mark === m.id}"><i class="c-${m.id}"></i>${m.label}</button>`).join("")}
        <button type="button" class="mk" data-mark="hidden" aria-pressed="${hid}"><i class="c-hidden"></i>${hid ? "Hidden" : "Hide"}</button>
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
      list.innerHTML = `<p class="empty">${ui.q ? `No word matches “${esc(ui.q)}”.` : "No words here yet."}</p>`;
      return;
    }
    const groups = new Map();
    items.forEach(x => { const L = x.w[0].toUpperCase(); if (!groups.has(L)) groups.set(L, []); groups.get(L).push(x); });
    let html = "";
    groups.forEach((ws, L) => { html += `<section class="group"><h2 class="letter">${L}</h2><div class="entries">${ws.map(entryHTML).join("")}</div></section>`; });
    list.innerHTML = html;
  }
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
      if (id === "hidden") { if (store.hidden[w]) delete store.hidden[w]; else store.hidden[w] = true; }
      else { delete store.hidden[w]; if (store.marks[w] === id) delete store.marks[w]; else store.marks[w] = id; }
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
