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
    { date: "2026-10-27", learn: ["basic-i", "basic-ii", "basic-iii", "gregmat-i"], title: "Basic I–III · GregMat I" },
    { date: "2026-10-28", learn: ["basic-iv", "basic-v", "basic-vi", "gregmat-ii"], title: "Basic IV–VI · GregMat II" },
    { date: "2026-10-29", learn: ["basic-vii", "basic-viii", "gregmat-iii"], title: "Basic VII–VIII · GregMat III" },
    { date: "2026-10-30", learn: ["basic-ix", "advanced-i", "gregmat-iv"], title: "Basic IX · Advanced I · GregMat IV" },
    { date: "2026-10-31", learn: ["advanced-ii", "advanced-iii", "gregmat-v"], title: "Advanced II–III · GregMat V" },
    { date: "2026-11-01", learn: ["advanced-iv", "advanced-v", "gregmat-vi"], title: "Advanced IV–V · GregMat VI" },
    { date: "2026-11-02", learn: ["advanced-vi", "advanced-vii", "gregmat-vii"], title: "Advanced VI–VII · GregMat VII" },
    { date: "2026-11-03", learn: ["advanced-viii", "advanced-ix", "gregmat-viii"], title: "Advanced VIII–IX · GregMat VIII" },
    { date: "2026-11-04", learn: [], kind: "sweep1", title: "Final stretch · Sweep Common + Basic + GregMat I–IV" },
    { date: "2026-11-05", learn: [], kind: "sweep2", title: "Final stretch · Sweep Advanced + GregMat V–VIII + traps" },
    { date: "2026-11-06", learn: [], kind: "taper", title: "Taper · light review only" },
    { date: TEST_DATE, learn: [], kind: "test", title: "Test day" },
  ];
  // Day each deck is first learned (index into PLAN, 1-based); Common Words I was mastered before the plan.
  const LEARN_DAY = { "common-words-i": 0 };
  PLAN.forEach((p, i) => p.learn.forEach(s => { LEARN_DAY[s] = i + 1; }));

  /* Quant, verbal-skills and essay work for each day (GregMat / Prep Swift / ETS), shown under Learn + Review. */
  const EXTRA = {
    "2026-10-25": { q: "Prep Swift, Arithmetic: take Tickbox Quiz #1 and #2 first. If you pass (Quiz #1: 26 of 28), skip that column and only rewatch what you missed. If not, watch the column, then retake.", v: "Watch TC and SE Session 1: Study Plans → 1 Month Study Plan V2.0 → Week 1 → “Week 1 – Day 1” → What to Watch → VERBAL → the first option, “Text Completion and Sentence Equivalence (TC and SE) Session 1”. Then do its homework, which sits right below the video." },
    "2026-10-26": { q: "Prep Swift: Arithmetic column 3 (Tickbox #3) and Algebra column 1 (Tickbox #4). Quiz first, videos only if needed.", v: "Watch TC and SE Session 2: Study Plans → 1 Month Study Plan V2.0 → Week 1 → “Week 1 – Day 2” → What to Watch → VERBAL → the first option, “Text Completion and Sentence Equivalence (TC and SE) Session 2”. Then do its homework, which sits right below the video.", e: "Essay prep, 15 min: Study Plans → The “I’m Overwhelmed” Plan → Module 2 → Part 2 → WRITING → “Planning Our Response 1”. Just watch it." },
    "2026-10-27": { q: "Prep Swift: Algebra columns 2 and 3 (Tickbox #5 and #6).", v: "Watch TC and SE Session 3: Study Plans → 1 Month Study Plan V2.0 → Week 1 → “Week 1 – Day 3” → What to Watch → VERBAL → the first option, “Text Completion and Sentence Equivalence (TC and SE) Session 3”. Then do its homework, which sits right below the video.", e: "Essay prep, 15 min: Overwhelmed Plan → Module 2 → Part 3 → WRITING → “Planning Our Response 2”." },
    "2026-10-28": { q: "Prep Swift: Coordinate Geometry, all three columns (Tickbox #7, #8, #9). Only 31 short videos in total.", v: "Watch TC and SE Session 4: Study Plans → 1 Month Study Plan V2.0 → Week 1 → “Week 1 – Day 4” → What to Watch → VERBAL → the first option, “Text Completion and Sentence Equivalence (TC and SE) Session 4”. Then do its homework, which sits right below the video.", e: "Watch the Issue essay lessons: Classes → Recorded Classes → the “GRE Writing” series (start with the Issue essay step-by-step video, then one feedback video). No writing yet." },
    "2026-10-29": { q: "Prep Swift: Geometry columns 1 and 2 (Tickbox #10 and #11).", v: "Watch TC and SE Session 5: Study Plans → 1 Month Study Plan V2.0 → Week 1 → “Week 1 – Day 5” → What to Watch → VERBAL → the first option, “Text Completion and Sentence Equivalence (TC and SE) Session 5”. Then do its homework, which sits right below the video.", e: "Essay prep, 15 min: Overwhelmed Plan → Module 2 → Part 4 → WRITING → “Planning Our Response 3”." },
    "2026-10-30": { q: "Prep Swift: Geometry column 3 (Tickbox #12) and Data Analysis column 1 (Tickbox #13).", v: "Watch TC and SE Session 6: Study Plans → 1 Month Study Plan V2.0 → Week 1 → “Week 1 – Day 6” → What to Watch → VERBAL → the first option, “Text Completion and Sentence Equivalence (TC and SE) Session 6”. Then do its homework, which sits right below the video.", e: "Essay prep, 20 min: next video in Classes → Recorded Classes → “GRE Writing”. Then write a 5-line outline (no essay) for any prompt in Practice → Write Essay." },
    "2026-10-31": { q: "Prep Swift: Data Analysis columns 2 and 3 (Tickbox #14 and #15).", v: "Diagnostic: ETS PowerPrep 1, Verbal and Quant only, timed, skip the essay (about 1½ h). Then review every mistake and list your weak topics." },
    "2026-11-01": { q: "Prep Swift: Quantitative Strategy column 1 (Making Deductions to Piece by Piece, about 1 h 20 at normal speed).", v: "GregMat: Reading Strategy Sessions 1 and 2 and their homework.", e: "Essay #1: Practice → Write Essay → Random Prompt (30:00 timer is built in). Use the structure from the GRE Writing video. Save it, paste it to me for a score and feedback." },
    "2026-11-02": { q: "Prep Swift: Quantitative Strategy column 2 (Simplifying QC to Calculating Extremes II).", v: "Reading Strategy Sessions 3 and 4 and their homework." },
    "2026-11-03": { q: "Prep Swift: Quantitative Strategy column 3 (Have a System to Sufficient Information Problems).", v: "Reading Strategy Sessions 5 and 6 and their homework.", e: "Essay #2, 30 minutes, timed. Apply the feedback from #1." },
    "2026-11-04": { q: "Full timed ETS PowerPrep 2, Verbal and Quant (about 1½ h). It replaces the two timed Verbal sections of today’s sweep. Review every mistake.", v: "" },
    "2026-11-05": { q: "Redo only the quant topics you missed in PowerPrep 2 (the Tickbox quiz or videos for them). 45 minutes max.", v: "", e: "Essay #3, 30 minutes, timed." },
    "2026-11-06": { q: "20 minutes: reread your list of quant mistakes and formulas. Nothing new.", v: "", e: "Reread your best essay’s outline. No new writing." },
  };
  const QSTD = " THEN, every day: about 50 practice problems (Practice → Quant Problems, filter on today’s topic, mix easy and hard) and 4 timed quizzes (Quizzes → Mock Quant Tests). Write every mistake in a list.";
  const QDATES = ["2026-10-25","2026-10-26","2026-10-27","2026-10-28","2026-10-29","2026-10-30","2026-11-01","2026-11-02","2026-11-03"];
  const XKEYS = [["q", "Quant"], ["v", "Verbal (TC & SE strategy)"], ["e", "Essay"]];

  /* ---------- daily timetable ---------- */
  const APPS = {
    "2026-10-25": "Shortlist of schools and programmes. Open an account on each school’s application site.",
    "2026-10-26": "Programme table: school, programme, deadline, GRE rule, recommenders needed, essays required.",
    "2026-10-27": "Recommenders: write and send your request to each person (who, what, deadline, your CV and key points).",
    "2026-10-28": "What a master’s statement needs: read 3–4 examples and what each programme asks for. Write the checklist.",
    "2026-10-29": "The two Stanford stories (MS&E: why industry and systems; Bioengineering: why the bio side). One page each, rough.",
    "2026-10-30": "The core story: the thread that links Bain, your studies and what you want next. Half a page, rough.",
    "2026-10-31": "Mock day: skip applications, or 20 minutes of tidying only.",
    "2026-11-01": "Drafting: first full draft of the statement, ignoring quality.",
    "2026-11-02": "Drafting: second pass on the statement. Chase any recommender who has not answered.",
    "2026-11-03": "Drafting: Stanford-specific version. Send me what you have for feedback.",
    "2026-11-05": "30 minutes only: list what remains to do after the test. Then stop.",
  };
  function scheduleFor(date, p) {
    const wd = new Date(date + "T12:00:00").getDay();
    const A = [0, 1, 3, 5].includes(wd);
    const wk1 = date <= "2026-10-31";
    const theme = APPS[date] || "Statement and recommenders: the next concrete step.";
    const apps = ["Applications", theme];
    const mock = date === "2026-10-31" ? "ETS PowerPrep 1" : date === "2026-11-04" ? "ETS PowerPrep 2" : "";
    const quant = mock ? ["Mock: " + mock, "Do it at the time of day of your booked test slot, with the real breaks. Shift the other blocks around it. Review every mistake afterwards."] : ["Quant", "Prep Swift only for topics you fail, then 50 problems and 4 timed quizzes. See “Also today” below."];
    const verbal = ["Verbal skills + essay", "GregMat session video and its homework, essay work. See “Also today” below and “Where things are”."];
    if (p.kind === "test") return { name: "Test day", rows: [["Breakfast", "Warm-up", "Your 30 hardest words, once. Then close the app."], ["", "Test", "Passport, early arrival, water, trust the roots."]] };
    if (p.kind === "taper") return { name: "Taper day", rows: [
      ["09:00–09:45", "Hard & Flag words", "Once through, then stop."], ["10:30–11:15", "Easy bike or walk", "Move, no gym effort."],
      ["14:00–14:20", "Quant", "Reread your list of mistakes and formulas."], ["15:00–15:15", "Essay", "Reread your best outline."],
      ["16:00–17:00", "Logistics", "Test centre route and arrival time, passport in your bag."], ["Evening", "Relax", "Dinner, something light, bed early."]] };
    const learnRow = p.kind === "sweep1" ? ["Sweep 1", "Catch up, then every Common, Basic and GregMat I–IV word at speed."] : p.kind === "sweep2" ? ["Sweep 2", "Advanced, GregMat V–VIII, Hard, Flag and trap words."] : ["Vocab · Learn", "Today’s decks in this app, then drill them in your flashcard app."];
    const reviewRow = ["Vocab · Review", p.kind && p.kind.startsWith("sweep") ? "Hard and Flag words, last pass." : "Words from earlier days that aren’t Known yet."];
    const row = (t, r) => [t].concat(r);
    if (date === "2026-10-25") return { name: "Today", rows: [
      row("13:00–15:30", learnRow), row("15:30–16:15", ["Bike", "30–40 minutes."]), row("16:15–17:15", quant), row("17:15–18:30", verbal),
      row("18:30–19:30", apps), row("19:30–20:00", ["Dinner", ""]), row("20:00–20:30", reviewRow)] };
    if (A) return { name: "Day A", rows: [
      row("08:00–10:00", ["Gym", "Cardio and stretches. 15 min there, 1 h, 15 min back, 30 min shower."]),
      row("10:00–12:30", learnRow), row("12:30–13:30", ["Lunch", "Away from the screen."]), row("13:30–16:00", quant),
      row("16:00–16:45", ["Bike", "30–40 minutes."]), row("16:45–18:15", verbal), row("18:15–18:30", ["Break", ""]),
      row("18:30–" + (wk1 ? "19:30" : "20:00"), apps), row("20:00–20:30", reviewRow)] };
    return { name: "Day B", rows: [
      row("08:30–11:00", learnRow), row("11:15–13:45", quant), row("13:45–14:45", ["Lunch", "Away from the screen."]),
      row("14:45–15:15", reviewRow), row("15:15–16:45", verbal), row("16:45–17:30", ["Bike", "30–40 minutes."]),
      row("17:30–18:30", apps), row("18:30–20:30", ["Gym", "Strength. 15 min there, 1 h, 15 min back, 30 min shower."])] };
  }

  function whereHTML() {
    return `<details class="card sched"><summary><h3>Where things are on GregMat</h3></summary>
      <ol class="srows">
        <li><span class="st">Sessions</span><div><b>Verbal skills session</b><div class="sd">Top menu Study Plans → 1 Month Study Plan V2.0 → Week 1 → “Week 1 – Day N” → What to Watch → VERBAL. Use the first option each time (the plain “TC and SE Session N”). Ignore the 2024 versions: one series is enough. Session N = Day N there.</div></div></li>
        <li><span class="st">Homework</span><div><b>Verbal homework</b><div class="sd">Open the session video. The homework problems load right below the video (“Homework due before Session N+1”). Only do the homework of the series you chose.</div></div></li>
        <li><span class="st">Later sessions</span><div><b>Reading and other strategy</b><div class="sd">Classes → Recorded Classes → “Verbal Strategy” series. Quant strategy: “Quantitative Strategy” series.</div></div></li>
        <li><span class="st">Essay lessons</span><div><b>How to write it</b><div class="sd">Study Plans → The “I’m Overwhelmed” Plan → Module 2 → Parts 2, 3, 4 → WRITING: “Planning Our Response 1, 2, 3”. More in Classes → Recorded Classes → “GRE Writing”. The GRE now has ONE essay (Analyze an Issue), so skip Argument.</div></div></li><li><span class="st">Vocab tips</span><div><b>How to learn words</b><div class="sd">Classes → Must See Recordings → “How to Properly Do the Vocab Mountain”. Your own app and flashcards replace the Mountain, but the method (spaced repeat, reread forgotten words) is the same.</div></div></li>
        <li><span class="st">Essay practice</span><div><b>Write it</b><div class="sd">Practice → Write Essay. Random Prompt, 30:00 timer built in, your essays go to “My Saved Essays”.</div></div></li>
        <li><span class="st">Quant</span><div><b>Problems and quizzes</b><div class="sd">Practice → Quant Problems (603). Quizzes → Mock Quant Tests (timed sections). Quizzes → Mock Verbal Tests. Practice → Verbal Problems.</div></div></li>
        <li><span class="st">Prep Swift</span><div><b>Quant videos and tickbox quizzes</b><div class="sd">Switch to PrepSwift with the tab at the top left of the site.</div></div></li>
      </ol></details>`;
  }
  function schedHTML(date, p, open) {
    const s = scheduleFor(date, p);
    return `<details class="card sched" ${open ? "open" : ""}><summary><h3>Timetable · ${s.name}</h3></summary>
      <ol class="srows">${s.rows.map(r => `<li><span class="st">${esc(r[0])}</span><div><b>${esc(r[1])}</b>${r[2] ? `<div class="sd">${esc(r[2])}</div>` : ""}</div></li>`).join("")}</ol>
      <p class="muted small" style="margin:0">Gym alternates: Day A has it in the morning, Day B in the evening. Mon, Wed, Fri, Sun are Day A; Tue, Thu, Sat are Day B.</p></details>`;
  }

  /* ---------- storage ---------- */
  const KEY = "gre-roots-v1";
  let store = { marks: {}, notes: {}, hidden: {}, rev: {}, days: {}, ts: {}, prac: {} };
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s) store = Object.assign(store, s); } catch (e) {}
  ["marks", "notes", "hidden", "rev", "days", "ts", "prac"].forEach(k => { store[k] = store[k] || {}; });
  if (!store.seed2) { // where Alexis already was in the flashcard app on 25 Oct
    BY_SLUG["common-words-i"].words.forEach(w => { if (!store.marks[w.w]) store.marks[w.w] = "green"; });
    ["apathetic", "banal", "dictatorial", "dogmatic", "eschew", "gainsay", "obscure", "rustic", "vociferous"].forEach(w => { if (!store.marks[w]) store.marks[w] = "green"; });
    ["gossamer", "platitude", "torpor"].forEach(w => { if (!store.marks[w]) store.marks[w] = "amber"; });
    store.seed2 = true;
  }
  delete store.status; delete store.seeded;
  /* Change tracking: every word gets a timestamp when its mark, hidden flag or note changes,
     so two devices can be merged without one overwriting the other. */
  const sigOf = w => JSON.stringify([store.marks[w] || null, store.notes[w] || null, !!store.hidden[w]]);
  const EMPTY_SIG = JSON.stringify([null, null, false]);
  let sigs = {};
  const wordsWithData = () => new Set([...Object.keys(store.marks), ...Object.keys(store.notes), ...Object.keys(store.hidden)]);
  function snapAll() { sigs = {}; wordsWithData().forEach(w => { sigs[w] = sigOf(w); }); }
  function stampChanges() {
    const now = Date.now();
    new Set([...Object.keys(sigs), ...wordsWithData()]).forEach(w => {
      const cur = sigOf(w), prev = sigs[w] || EMPTY_SIG;
      if (cur !== prev) store.ts[w] = now;
      if (cur === EMPTY_SIG) delete sigs[w]; else sigs[w] = cur;
    });
  }
  snapAll();
  function save(opts) {
    stampChanges();
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { toast("Couldn’t save on this device"); }
    if (!opts || !opts.quiet) scheduleSync();
  }
  save({ quiet: true });
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
    const isAdv = x => x.slug.startsWith("advanced") || /^gregmat-(v|vi|vii|viii)$/.test(x.slug);
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

  /* ---------- memory hooks: the original plus alternates, cycled with a button ---------- */
  const HK = "gre-roots-hk";
  const hkLoad = () => { try { return JSON.parse(localStorage.getItem(HK)) || {}; } catch (e) { return {}; } };
  const hkSave = o => { try { localStorage.setItem(HK, JSON.stringify(o)); } catch (e) {} };
  const hooksOf = x => [x.t].concat(x.h || []);
  function hookBlock(x) {
    const hs = hooksOf(x); const i = (hkLoad()[x.w] || 0) % hs.length;
    return `<div class="block hkblock" data-w="${esc(x.w)}"><div class="lbl">Memory hook${hs.length > 1 ? ` <button type="button" class="hkbtn" aria-label="Show another memory hook">↻ Another <span>${i + 1}/${hs.length}</span></button>` : ""}</div><div class="txt">${hs[i]}</div></div>`;
  }
  document.addEventListener("click", e => {
    const b = e.target.closest(".hkbtn"); if (!b) return;
    e.stopPropagation();
    const blk = b.closest(".hkblock"); const w = blk.dataset.w; const x = LOOKUP.get(w); if (!x) return;
    const hs = hooksOf(x); const st = hkLoad(); const i = ((st[w] || 0) + 1) % hs.length;
    st[w] = i; hkSave(st);
    blk.querySelector(".txt").innerHTML = hs[i]; b.querySelector("span").textContent = (i + 1) + "/" + hs.length;
  }, true);

  /* ---------- helpers ---------- */
  const app = document.getElementById("app");
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const icon = {
    search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
    chev: '<svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
    back: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
    note: '<svg class="has-note" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Has a note"><path d="M4 20h4L19 9l-4-4L4 16v4z"/></svg>',
    check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>',
    caret: '<svg class="caret" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
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
  const nav = active => `<nav class="mainnav" aria-label="Sections"><a href="#/" ${active === "plan" ? 'aria-current="page"' : ""}>Plan</a><a href="#/decks" ${active === "decks" ? 'aria-current="page"' : ""}>Decks</a><a href="#/practice" ${active === "practice" ? 'aria-current="page"' : ""}>Practice</a><a href="#/all" ${active === "all" ? 'aria-current="page"' : ""}>All words</a><a class="syncchip" href="#/sync" data-state="${syncState.state}" ${active === "sync" ? 'aria-current="page"' : ""}>${chipText()}</a></nav>`;
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
    if (parts[0] === "sync") return renderSync();
    if (parts[0] === "practice") return renderPractice();
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
      sweep1: "Every Common, Basic and GregMat I–IV word you haven’t hidden, Known ones included, at speed, plus every weak word from Advanced and GregMat V–VIII.",
      sweep2: "Every Advanced and GregMat V–VIII word you haven’t hidden, plus all Hard and Flag words and every trap word (faux ami, 2nd meaning, look-alike).",
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
        ${EXTRA[p.date] ? skillsHTML(p.date) : ""}
        ${p.date === TODAY ? schedHTML(p.date, p, true) : ""}
        ${whereHTML()}
        ${p.kind && p.kind.startsWith("sweep") ? `<p class="hint"><b>Final stretch, the most intense days:</b> catch up first if anything is left, then the sweep. Go fast: if you know it in 2 seconds, Got it. Anything you hesitate on becomes Shaky or Hard. Then do two timed Verbal sections (about 1 h), or the full PowerPrep 2 on Wed 4. About 3–3½ hours in total.</p>` : ""}
        ${p.kind === "taper" ? `<p class="hint"><b>Taper:</b> 45 minutes max, then stop. Being fresh tomorrow is worth more than 50 extra words.</p>` : ""}
        ${!p.kind ? `<p class="hint"><b>How:</b> do Learn in the morning: hide what you already know, read the root and the French for the rest. Then drill the same decks in your flashcard app. Do Review in the evening. Learn + Review take about 2½–3 hours; the Quant / Verbal skills / Essay block adds about 3 hours. The timetable below shows where each block goes.</p>` : ""}
      </section>`;
    }

    const sorted = total - c.none;
    app.innerHTML = `
    <div class="wrap plan">
      <header class="home-head">
        ${nav("plan")}
        <div class="countdown">
          <div><div class="eyebrow">GRE · ${fmt(TEST_DATE, { weekday: "long", day: "numeric", month: "long" })}</div>
          <h1>${left > 1 ? `${left} days to go` : left === 1 ? "Tomorrow" : left === 0 ? "Today. You’re ready." : "Test done"}</h1></div>
        </div>
      </header>
      <div class="plan-cols"><div class="plan-main">
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
      <section class="card finals" aria-label="Last two days">
        <h3>The final stretch</h3>
        <p class="muted small" style="margin:0">Two hard days, then ease off. You go through every word one last time, then rest so it all sticks.</p>
        <div class="final"><div class="fd">Wed 4 Nov</div><div><b>Sweep 1 · about 3 h.</b> Catch up on anything you haven’t sorted, then a fast pass through every Common, Basic and GregMat I–IV word you haven’t hidden, Known ones included. Hesitate, and it goes back to Shaky. Then the full timed ETS PowerPrep 2 (Verbal + Quant).</div></div>
        <div class="final"><div class="fd">Thu 5 Nov</div><div><b>Sweep 2 · about 3 h.</b> Every Advanced and GregMat V–VIII word you haven’t hidden, plus all Hard and Flag words and every trap word (faux ami, 2nd meaning, look-alike). Then two more timed Verbal sections. In bed on time.</div></div>
        <div class="final"><div class="fd">Fri 6 Nov</div><div><b>Taper · 45 min max, morning.</b> Hard and Flag words only, once. No new words. Afternoon: check your test centre, route and arrival time, and put the valid passport you registered with in your bag. Something relaxing in the evening.</div></div>
        <div class="final"><div class="fd">Sat 7 Nov</div><div><b>Test day · 15 min.</b> Your 30 hardest words over breakfast, once. Eat properly, arrive early, and trust the roots: when you don’t know a word, take it apart.</div></div>
      </section>
      </div>
      <div class="plan-side">
      <section class="card plan-card" aria-label="Plan">
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
      <section class="card" aria-label="Typical days"><h3>Typical days</h3>
        ${schedHTML("2026-11-02", PLAN[8], false).replace("Timetable · Day A","Day A").replace("<details class=\"card sched\"","<details class=\"sched inner\"")}
        ${schedHTML("2026-11-03", PLAN[9], false).replace("Timetable · Day B","Day B").replace("<details class=\"card sched\"","<details class=\"sched inner\"")}
      </section>
      </div></div>
      <section class="backup">
        <div>Everything you mark is saved on this device. Turn on <a href="#/sync">Sync</a> to keep your laptop and phone identical and backed up online. You can also export a file.</div>
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
  function skillsHTML(date) {
    const ex = Object.assign({}, EXTRA[date]); if (QDATES.includes(date) && ex.q) ex.q += QSTD;
    const done = (store.days[date] && store.days[date].x) || {};
    const titles = { q: "Quant", v: "Verbal: TC & SE strategy (not vocab)", e: "Essay" };
    return XKEYS.filter(([k]) => ex[k]).map(([k]) => `
      <div class="card xcard"><div class="xrow"><button type="button" class="xtick" data-date="${date}" data-k="${k}" aria-pressed="${!!done[k]}" aria-label="Mark ${titles[k]} done"><span>${icon.check}</span></button>
      <div><h3 style="margin:0 0 4px">${titles[k]}</h3><div class="xtxt">${esc(ex[k])}</div></div></div></div>`).join("");
  }
  function onXTick(e) {
    const b = e.target.closest(".xtick"); if (!b) return;
    const d = b.dataset.date, k = b.dataset.k;
    const cur = store.days[d] || {}; const x = Object.assign({}, cur.x || {});
    if (x[k]) delete x[k]; else x[k] = 1;
    store.days[d] = Object.assign({}, cur, { x }); save();
    b.setAttribute("aria-pressed", String(!!x[k]));
  }
  document.addEventListener("click", onXTick);

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
    const data = JSON.stringify({ app: "gre-word-roots", version: 2, exported: new Date().toISOString(), marks: store.marks, notes: store.notes, hidden: store.hidden, rev: store.rev, days: store.days, prac: store.prac }, null, 1);
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
        ["marks", "notes", "hidden", "rev", "days", "prac"].forEach(k => Object.assign(store[k], d[k] || {}));
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
        ${hookBlock(x)}
        ${store.notes[w] ? `<div class="block"><div class="lbl">My notes</div><div class="txt">${esc(store.notes[w])}</div></div>` : ""}
      </div>` : `<p class="flash-hint">${s.mode === "learn" ? "Do you already know this word for sure?" : "Say the meaning out loud, then reveal."}</p>`;
    const actions = !s.revealed
      ? (s.mode === "learn"
        ? `<button class="act hide" data-act="hidden" type="button">Already know it<small>hide it <kbd>H</kbd></small></button><button class="act show" data-act="reveal" type="button">Not sure<small>show me <kbd>Space</kbd></small></button>`
        : `<button class="act show wide" data-act="reveal" type="button">Show answer <kbd>Space</kbd></button>`)
      : `<button class="act red" data-act="red" type="button">Hard<small class="k"><kbd>1</kbd></small></button><button class="act amber" data-act="amber" type="button">Shaky<small class="k"><kbd>2</kbd></small></button><button class="act green" data-act="green" type="button">${s.mode === "learn" ? "Knew it" : "Got it"}<small class="k"><kbd>3</kbd></small></button>`;
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

  /* ---------- practice: pick decks + colours, guess the meaning from three choices ---------- */
  /* Scores live in store.prac only. They never touch the Hard / Shaky / Known marks. */
  const PMAX = 6;                          // 6 = memorised. Right answer +1, wrong answer −2 (guessing at random drifts down).
  const PSEL = "gre-roots-prac-sel";
  const COMMON = DECKS.filter(d => d.series === "Common Words").map(d => d.slug);
  let psel = { decks: COMMON.slice(), marks: ["red"], order: "weak" };
  try { const s = JSON.parse(localStorage.getItem(PSEL)); if (s && Array.isArray(s.decks) && Array.isArray(s.marks)) psel = Object.assign(psel, s); } catch (e) {}
  psel.decks = psel.decks.filter(s => BY_SLUG[s]);
  const psave = () => { try { localStorage.setItem(PSEL, JSON.stringify(psel)); } catch (e) {} };
  const PSTAT = [["red", "Hard"], ["amber", "Shaky"], ["green", "Known"], ["blue", "Flag"], ["none", "Not sorted"], ["hidden", "Hidden"]];
  const pracStatus = w => isHidden(w) ? "hidden" : (markOf(w) || "none");
  const poolWords = () => { const d = new Set(psel.decks), m = new Set(psel.marks); return ALL.filter(x => d.has(x.slug) && m.has(pracStatus(x.w))); };
  const pscore = w => (store.prac[w] ? store.prac[w].s : 0);
  const showMeter = w => !isHidden(w) && (markOf(w) === "red" || !!store.prac[w]);
  const numeral = d => d.name.slice(d.series.length + 1);
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  let pr = { run: null };

  /* the small red → green marker: how close a word is to memorised */
  function meterHTML(w) {
    const p = store.prac[w]; const s = p ? p.s : 0; const pct = (s / PMAX) * 100;
    const tip = p ? `Practice ${s} of ${PMAX} · ${p.n} ${p.n === 1 ? "try" : "tries"}` : "Not practised yet";
    return `<span class="meter${p ? "" : " fresh"}" role="img" aria-label="${tip}" title="${tip}"><b style="width:${pct.toFixed(1)}%"></b><i style="left:${pct.toFixed(1)}%;border-color:hsl(${Math.round(pct * 1.2)} 65% 45%)"></i></span>`;
  }

  function deckSummary() {
    const sel = new Set(psel.decks); if (!sel.size) return "No decks";
    const parts = [];
    const groups = {}; DECKS.forEach(d => (groups[d.series] = groups[d.series] || []).push(d));
    Object.keys(groups).forEach(sn => {
      const ds = groups[sn]; const idx = ds.map((d, i) => sel.has(d.slug) ? i : -1).filter(i => i >= 0);
      if (!idx.length) return;
      if (idx.length === ds.length) { parts.push(sn + " (all)"); return; }
      const runs = []; let a = idx[0], b = idx[0];
      for (let k = 1; k < idx.length; k++) { if (idx[k] === b + 1) b = idx[k]; else { runs.push([a, b]); a = b = idx[k]; } }
      runs.push([a, b]);
      parts.push(sn + " " + runs.map(([x, y]) => x === y ? numeral(ds[x]) : numeral(ds[x]) + "–" + numeral(ds[y])).join(", "));
    });
    const txt = parts.join(" · ");
    return parts.length > 2 || txt.length > 34 ? `${sel.size} decks` : txt;
  }
  function markSummary() {
    const sel = PSTAT.filter(([id]) => psel.marks.includes(id)).map(([, l]) => l);
    return !sel.length ? "None" : sel.length === PSTAT.length ? "Everything" : sel.join(", ");
  }

  function renderPractice() {
    document.title = "Practice · GRE Word Roots";
    if (pr.run) return drawRun();
    const series = [];
    DECKS.forEach(d => { let s = series.find(x => x.name === d.series); if (!s) series.push(s = { name: d.series, decks: [] }); s.decks.push(d); });
    const picker = (id, label) => `<div class="picker"><div class="plabel" id="pl-${id}">${label}</div>
      <button type="button" class="pbtn" id="pb-${id}" aria-expanded="false" aria-controls="pp-${id}" aria-labelledby="pl-${id} pv-${id}"><span class="pval" id="pv-${id}"></span>${icon.caret}</button></div>`;
    app.innerHTML = `
    <div class="wrap">
      <header class="home-head">${nav("practice")}<h1>Practice</h1>
        <p class="sub">Choose what to drill, then guess each word’s meaning from three choices. Your Hard, Shaky and Known stickers never change here; each word just gets a small marker showing how close it is to memorised.</p></header>
      <section class="card pracsetup">
        <div class="pickers" id="pickers">
          ${picker("decks", "Decks")}${picker("marks", "Difficulty")}
          <div class="ppanel" id="pp-decks" hidden>
            <div class="ptools"><button type="button" class="link" data-act="all">Select all</button><button type="button" class="link" data-act="none">Clear</button><button type="button" class="link pdone" data-act="close">Done</button></div>
            ${series.map(s => `<div class="pseries"><label class="pchip head" data-series="${esc(s.name)}"><input type="checkbox" data-series="${esc(s.name)}"><span>${esc(s.name)}</span></label>
              <div class="pdecks">${s.decks.map(d => `<label class="pchip pdeck" data-slug="${d.slug}"><input type="checkbox" data-slug="${d.slug}"><span class="pn">${esc(numeral(d))}</span><small></small></label>`).join("")}</div></div>`).join("")}
          </div>
          <div class="ppanel" id="pp-marks" hidden>
            <div class="ptools"><button type="button" class="link" data-act="mall">Select all</button><button type="button" class="link" data-act="mnone">Clear</button><button type="button" class="link pdone" data-act="close">Done</button></div>
            <div class="pmarks">${PSTAT.map(([id, l]) => `<label class="pchip pmark" data-mark="${id}"><input type="checkbox" data-mark="${id}"><i class="c-${id}"></i><span>${l}</span><small></small></label>`).join("")}</div>
          </div>
        </div>
        <div class="porder"><span class="plabel">Order</span>
          <button type="button" class="chip" data-order="weak">Weakest first</button><button type="button" class="chip" data-order="random">Random</button></div>
        <div class="pinfo" id="pinfo" aria-live="polite"></div>
        <button class="btn primary pstart" id="pstart" type="button">Start practice</button>
        <p class="muted small" style="margin:0">Right answer: marker moves one step towards green. Wrong answer: it drops two. At ${PMAX} the word counts as memorised. Nothing else changes.</p>
      </section>
      <footer>Practice progress syncs with the rest of your marks.</footer>
    </div>`;
    paintPractice();
    const pk = document.getElementById("pickers");
    pk.addEventListener("click", e => {
      const b = e.target.closest(".pbtn"); const act = e.target.closest("[data-act]");
      if (b) { const id = b.id.slice(3); const open = b.getAttribute("aria-expanded") !== "true"; closePanels(); if (open) { b.setAttribute("aria-expanded", "true"); document.getElementById("pp-" + id).hidden = false; } return; }
      if (act) {
        const a = act.dataset.act;
        if (a === "close") closePanels();
        else if (a === "all") psel.decks = DECKS.map(d => d.slug);
        else if (a === "none") psel.decks = [];
        else if (a === "mall") psel.marks = PSTAT.map(([id]) => id);
        else if (a === "mnone") psel.marks = [];
        if (a !== "close") { psave(); paintPractice(); }
      }
    });
    pk.addEventListener("change", e => {
      const t = e.target; if (t.type !== "checkbox") return;
      if (t.dataset.slug) { const s = new Set(psel.decks); t.checked ? s.add(t.dataset.slug) : s.delete(t.dataset.slug); psel.decks = DECKS.filter(d => s.has(d.slug)).map(d => d.slug); }
      else if (t.dataset.series) { const s = new Set(psel.decks); DECKS.filter(d => d.series === t.dataset.series).forEach(d => t.checked ? s.add(d.slug) : s.delete(d.slug)); psel.decks = DECKS.filter(d => s.has(d.slug)).map(d => d.slug); }
      else if (t.dataset.mark) { const s = new Set(psel.marks); t.checked ? s.add(t.dataset.mark) : s.delete(t.dataset.mark); psel.marks = PSTAT.filter(([id]) => s.has(id)).map(([id]) => id); }
      psave(); paintPractice();
    });
    app.querySelector(".porder").addEventListener("click", e => { const b = e.target.closest("[data-order]"); if (!b) return; psel.order = b.dataset.order; psave(); paintPractice(); });
    document.getElementById("pstart").addEventListener("click", () => { const p = poolWords(); if (p.length) startRun(p.map(x => x.w)); });
  }
  function closePanels() {
    document.querySelectorAll(".ppanel").forEach(p => { p.hidden = true; });
    document.querySelectorAll(".pbtn").forEach(b => b.setAttribute("aria-expanded", "false"));
  }
  document.addEventListener("click", e => { const pk = document.getElementById("pickers"); if (pk && !pk.contains(e.target)) closePanels(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closePanels(); });

  function paintPractice() {
    const dsel = new Set(psel.decks), msel = new Set(psel.marks);
    document.getElementById("pv-decks").textContent = deckSummary();
    document.getElementById("pv-marks").textContent = markSummary();
    document.getElementById("pb-decks").title = psel.decks.length + " decks selected";
    DECKS.forEach(d => {
      const el = app.querySelector(`.pdeck[data-slug="${d.slug}"]`); if (!el) return;
      const n = d.words.filter(w => msel.has(pracStatus(w.w))).length;
      el.querySelector("small").textContent = n; el.classList.toggle("on", dsel.has(d.slug)); el.classList.toggle("zero", !n);
      el.querySelector("input").checked = dsel.has(d.slug);
    });
    app.querySelectorAll(".pchip.head").forEach(l => {
      const ds = DECKS.filter(d => d.series === l.dataset.series); const k = ds.filter(d => dsel.has(d.slug)).length;
      const inp = l.querySelector("input"); inp.checked = k === ds.length; inp.indeterminate = k > 0 && k < ds.length;
      l.classList.toggle("on", k === ds.length); l.classList.toggle("some", k > 0 && k < ds.length);
    });
    PSTAT.forEach(([id]) => {
      const el = app.querySelector(`.pmark[data-mark="${id}"]`);
      const n = ALL.filter(x => dsel.has(x.slug) && pracStatus(x.w) === id).length;
      el.querySelector("small").textContent = n; el.classList.toggle("on", msel.has(id)); el.querySelector("input").checked = msel.has(id);
    });
    app.querySelectorAll(".porder .chip").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.order === psel.order)));
    const pool = poolWords(); const n = pool.length;
    const full = pool.filter(x => pscore(x.w) >= PMAX).length, fresh = pool.filter(x => !store.prac[x.w]).length;
    document.getElementById("pinfo").innerHTML = n
      ? `<b>${n} word${n === 1 ? "" : "s"}</b> · ${Math.ceil(n / 3)} round${Math.ceil(n / 3) === 1 ? "" : "s"} of 3<span class="muted"> · ${full} memorised · ${fresh} not practised yet</span>`
      : `<span class="muted">No words match. Pick other decks or difficulties.</span>`;
    document.getElementById("pstart").disabled = !n;
  }

  /* ---------- a run: three words per screen, three definitions each ---------- */
  const posKey = p => (p || "").toLowerCase().split(/[^a-z]+/)[0] || "x";
  const POS_POOL = {}; ALL.forEach(x => (POS_POOL[posKey(x.p)] = POS_POOL[posKey(x.p)] || []).push(x));
  function makeQuestion(w) {
    const x = LOOKUP.get(w); const pool = (POS_POOL[posKey(x.p)] || []).length > 8 ? POS_POOL[posKey(x.p)] : ALL;
    const used = new Set([x.m]); const ds = []; let guard = 0;
    while (ds.length < 2 && guard++ < 400) { const c = pool[Math.floor(Math.random() * pool.length)]; if (c.w === x.w || used.has(c.m)) continue; used.add(c.m); ds.push(c); }
    return { w, picked: null, opts: shuffle([{ t: x.m, ok: true }].concat(ds.map(c => ({ t: c.m, ok: false })))) };
  }
  function startRun(words) {
    let q = shuffle(words);
    if (psel.order === "weak") q = q.map((w, i) => [w, i]).sort((a, b) => pscore(a[0]) - pscore(b[0]) || a[1] - b[1]).map(a => a[0]);
    pr.run = { queue: q, page: 0, cur: null, right: 0, missed: [], total: q.length };
    window.scrollTo(0, 0); drawRun();
  }
  function qHTML(q, i) {
    const x = LOOKUP.get(q.w); const mk = isHidden(q.w) ? "hidden" : (markOf(q.w) || "");
    const done = q.picked !== null; const right = done && q.opts[q.picked].ok;
    return `<article class="q${done ? " answered" : ""}" data-i="${i}">
      <div class="qhead"><div class="qwordline"><span class="qword">${esc(x.w)}</span><span class="pos">${esc(x.p)}</span></div>
        <div class="qmeta"><span class="decktag">${esc(x.deck)}</span>${meterHTML(x.w)}<span class="mark ${mk}" title="Your sticker, unchanged"></span></div></div>
      <div class="qopts" role="group" aria-label="Meaning of ${esc(x.w)}">${q.opts.map((o, j) =>
        `<button type="button" class="opt${done ? (o.ok ? " ok" : q.picked === j ? " bad" : " dim") : ""}" data-o="${j}" aria-pressed="${q.picked === j}"><span class="ol">${j + 1}</span><span class="ot">${o.t}</span></button>`).join("")}</div>
      ${done ? `<div class="qfb ${right ? "good" : "miss"}"><b>${right ? "Correct" : "Not quite"}</b> · <span class="fr">${x.f}</span><br>${x.t}</div>` : ""}
    </article>`;
  }
  function drawRun() {
    const r = pr.run;
    if (r.page * 3 >= r.total) return drawResults();
    if (!r.cur) r.cur = r.queue.slice(r.page * 3, r.page * 3 + 3).map(makeQuestion);
    const from = r.page * 3 + 1, to = Math.min(r.total, r.page * 3 + 3);
    app.innerHTML = `
      <div class="sess-bar"><div class="wrap sess-bar-in">
        <button class="iconbtn" id="pquit" type="button" aria-label="End practice">${icon.close}</button>
        <div class="sess-title">Practice <span class="muted">${from}${to > from ? "–" + to : ""} / ${r.total}</span></div>
        <span class="muted small" id="pright"></span>
      </div><div class="pbar"><span style="width:${((r.page * 3) / r.total * 100).toFixed(1)}%"></span></div></div>
      <main class="wrap prun" id="prun">${r.cur.map(qHTML).join("")}</main>
      <div class="actions"><div class="wrap actions-in"><button class="act show wide" id="pnext" type="button"></button></div></div>`;
    paintRunChrome();
    document.getElementById("pquit").addEventListener("click", () => { pr.run = null; renderPractice(); window.scrollTo(0, 0); });
    document.getElementById("pnext").addEventListener("click", nextPage);
    document.getElementById("prun").addEventListener("click", e => {
      const b = e.target.closest(".opt"); if (!b) return;
      answer(+b.closest(".q").dataset.i, +b.dataset.o);
    });
  }
  function paintRunChrome() {
    const r = pr.run; const done = r.cur.every(q => q.picked !== null); const last = (r.page + 1) * 3 >= r.total;
    document.getElementById("pright").textContent = `${r.right} right`;
    const n = document.getElementById("pnext"); n.disabled = !done;
    n.innerHTML = done ? `${last ? "See results" : "Next"} <kbd>Space</kbd>` : "Answer all to continue";
  }
  function answer(qi, oi) {
    const r = pr.run; const q = r.cur[qi]; if (!q || q.picked !== null) return;
    q.picked = oi; const ok = q.opts[oi].ok;
    const p = store.prac[q.w] || { s: 0, n: 0 };
    store.prac[q.w] = { s: ok ? Math.min(PMAX, p.s + 1) : Math.max(0, p.s - 2), n: p.n + 1, t: Date.now() };
    if (ok) r.right++; else if (!r.missed.includes(q.w)) r.missed.push(q.w);
    save();
    const el = document.querySelector(`.q[data-i="${qi}"]`); if (el) el.outerHTML = qHTML(q, qi);
    paintRunChrome();
  }
  function nextPage() {
    const r = pr.run; if (!r || !r.cur || !r.cur.every(q => q.picked !== null)) return;
    r.page++; r.cur = null; window.scrollTo(0, 0); drawRun();
  }
  function drawResults() {
    const r = pr.run; const miss = r.missed.length;
    app.innerHTML = `
      <div class="sess-bar"><div class="wrap sess-bar-in"><button class="iconbtn" id="pquit" type="button" aria-label="Close">${icon.close}</button><div class="sess-title">Practice done</div></div><div class="pbar"><span style="width:100%"></span></div></div>
      <main class="wrap done-screen">
        <h1>${r.right} of ${r.total}</h1>
        <p class="muted" style="margin:0">${miss ? `${miss} word${miss === 1 ? "" : "s"} to look at again. Their markers moved back; your stickers did not change.` : "Clean sweep. Every marker moved towards green."}</p>
        ${miss ? `<ul class="tally missed">${r.missed.map(w => `<li><b class="mw">${esc(w)}</b><span class="md">${LOOKUP.get(w).m}</span>${meterHTML(w)}</li>`).join("")}</ul>` : ""}
        <div class="row"><button class="btn primary" id="pagain" type="button">Practice again</button>${miss ? `<button class="btn" id="pmiss" type="button">Only the ${miss} I missed</button>` : ""}<button class="btn" id="pback" type="button">Change selection</button></div>
      </main>`;
    const back = () => { pr.run = null; renderPractice(); window.scrollTo(0, 0); };
    document.getElementById("pquit").addEventListener("click", back);
    document.getElementById("pback").addEventListener("click", back);
    document.getElementById("pagain").addEventListener("click", () => { const p = poolWords(); if (p.length) startRun(p.map(x => x.w)); else back(); });
    const m = document.getElementById("pmiss"); if (m) m.addEventListener("click", () => startRun(r.missed.slice()));
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
        ${showMeter(x.w) ? meterHTML(x.w) : ""}
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
      ${hookBlock(x)}
      ${store.prac[x.w] ? `<div class="block"><div class="lbl">Practice</div><div class="txt pracline">${meterHTML(x.w)}<span>${store.prac[x.w].s} of ${PMAX} · ${store.prac[x.w].n} ${store.prac[x.w].n === 1 ? "try" : "tries"}</span></div></div>` : ""}
      <div class="block"><div class="lbl">Colour</div><div class="txt marks">
        ${MARKS.map(m => `<button type="button" class="mk" data-mark="${m.id}" aria-pressed="${!hid && mark === m.id}"><i class="c-${m.id}"></i>${m.label}</button>`).join("")}
        <button type="button" class="mk" data-mark="hidden" aria-pressed="${hid}"><i class="c-hidden"></i>${hid ? "Hidden" : "Hide"}</button>
      </div></div>
      <div class="block full"><label class="lbl" for="${id}">My notes</label><div class="txt">
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

  /* ---------- sync with a private GitHub data repo ---------- */
  const SKEY = "gre-roots-sync";
  const DATA_FILE = "progress.json";
  let cfg = {}; try { cfg = JSON.parse(localStorage.getItem(SKEY)) || {}; } catch (e) {}
  const syncState = { state: cfg.token ? "idle" : "off", last: cfg.last || 0, msg: "" };
  let syncing = false, syncAgain = false, syncTimer = null;
  const b64enc = str => btoa(unescape(encodeURIComponent(str)));
  const b64dec = str => decodeURIComponent(escape(atob(str.replace(/\s/g, ""))));
  const canon = o => JSON.stringify(o, (k, v) => (v && typeof v === "object" && !Array.isArray(v)) ? Object.keys(v).sort().reduce((a, key) => (a[key] = v[key], a), {}) : v);
  const payload = () => ({ app: "gre-word-roots", version: 3, marks: store.marks, notes: store.notes, hidden: store.hidden, rev: store.rev, days: store.days, ts: store.ts, prac: store.prac });
  function saveCfg() { try { localStorage.setItem(SKEY, JSON.stringify(cfg)); } catch (e) {} }
  function ago(t) {
    const m = Math.round((Date.now() - t) / 60000);
    return m < 1 ? "just now" : m < 60 ? m + " min ago" : m < 1440 ? Math.round(m / 60) + " h ago" : Math.round(m / 1440) + " d ago";
  }
  function chipText() {
    return ({ off: "Sync off", busy: "Syncing…", err: "Sync problem", idle: syncState.last ? "Synced " + ago(syncState.last) : "Sync on" })[syncState.state];
  }
  function paintSync() {
    document.querySelectorAll(".syncchip").forEach(el => { el.textContent = chipText(); el.dataset.state = syncState.state; });
    const st = document.getElementById("syncStatus");
    if (st) st.textContent = syncState.state === "err" ? syncState.msg : chipText();
  }
  function mergeRemote(r) {
    let changed = false;
    const rt = r.ts || {}, rm = r.marks || {}, rn = r.notes || {}, rh = r.hidden || {}, rr = r.rev || {};
    new Set([...Object.keys(rt), ...Object.keys(rm), ...Object.keys(rn), ...Object.keys(rh)]).forEach(w => {
      const lt = store.ts[w] === undefined ? -1 : store.ts[w], t = rt[w] === undefined ? -1 : rt[w];
      if (t > lt) {
        if (rm[w]) store.marks[w] = rm[w]; else delete store.marks[w];
        if (rn[w]) store.notes[w] = rn[w]; else delete store.notes[w];
        if (rh[w]) store.hidden[w] = true; else delete store.hidden[w];
        store.ts[w] = t; changed = true;
      }
    });
    Object.keys(rr).forEach(w => { if (!store.rev[w] || rr[w] > store.rev[w]) { store.rev[w] = rr[w]; changed = true; } });
    const rp = r.prac || {}; // practice scores: newest attempt per word wins
    Object.keys(rp).forEach(w => { const l = store.prac[w]; if (rp[w] && (!l || (rp[w].t || 0) > (l.t || 0))) { store.prac[w] = rp[w]; changed = true; } });
    Object.keys(r.days || {}).forEach(d => {
      const a = store.days[d] || {}, b = r.days[d] || {};
      const m = { learn: !!(a.learn || b.learn), review: !!(a.review || b.review) };
      const x = Object.assign({}, b.x || {}, a.x || {}); if (Object.keys(x).length) m.x = x;
      if (canon(m) !== canon({ learn: !!a.learn, review: !!a.review, x: a.x && Object.keys(a.x).length ? a.x : undefined })) { store.days[d] = m; changed = true; }
    });
    return changed;
  }
  async function gh(method, body) {
    const res = await fetch(`https://api.github.com/repos/${cfg.repo}/contents/${DATA_FILE}` + (method === "GET" ? "?t=" + Date.now() : ""), {
      method, cache: "no-store", body: body ? JSON.stringify(body) : undefined,
      headers: { Authorization: "Bearer " + cfg.token, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    });
    return res;
  }
  async function syncNow(opts) {
    if (!cfg.token || !cfg.repo) return;
    if (syncing) { syncAgain = true; return; }
    if (!navigator.onLine) { syncState.state = "idle"; paintSync(); return; }
    syncing = true; syncState.state = "busy"; paintSync();
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        const res = await gh("GET");
        let sha = null, remote = null;
        if (res.status === 200) { const j = await res.json(); sha = j.sha; remote = JSON.parse(b64dec(j.content)); }
        else if (res.status !== 404) {
          throw new Error(res.status === 401 ? "GitHub rejected the token. Make a new one and reconnect." : res.status === 403 ? "GitHub refused (token lacks access, or rate limit)." : res.status === 404 ? "" : "GitHub error " + res.status);
        }
        const pulled = remote ? mergeRemote(remote) : false;
        if (pulled) { snapAll(); save({ quiet: true }); }
        const body = canon(payload());
        if (remote && canon(Object.assign({}, remote, { version: 3 })) === body) { syncState.last = Date.now(); if (pulled) onPulled(); break; }
        const put = await gh("PUT", { message: "sync " + new Date().toISOString(), content: b64enc(JSON.stringify(payload())), sha: sha || undefined });
        if (put.status === 200 || put.status === 201) { syncState.last = Date.now(); if (pulled) onPulled(); break; }
        if (put.status === 409 || put.status === 422) continue; // someone else wrote in between: pull again and retry
        throw new Error(put.status === 404 ? "Repo not found, or the token has no access to it." : put.status === 403 ? "The token needs Contents: Read and write on that repo." : "GitHub error " + put.status);
      }
      if (syncState.last) { cfg.last = syncState.last; saveCfg(); }
      syncState.state = "idle";
    } catch (err) {
      syncState.state = (err instanceof TypeError) ? "idle" : "err"; // TypeError = offline / network
      syncState.msg = err.message || "Sync failed";
    }
    syncing = false; paintSync();
    if (syncAgain) { syncAgain = false; syncNow(); }
  }
  function onPulled() {
    const h = location.hash;
    if (h.startsWith("#/session") || (h.startsWith("#/practice") && pr.run) || (document.activeElement && document.activeElement.tagName === "TEXTAREA")) return;
    route(); toast("Updated from your other device");
  }
  function scheduleSync() { if (!cfg.token) return; clearTimeout(syncTimer); syncTimer = setTimeout(syncNow, 2500); }
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") syncNow(); });
  window.addEventListener("online", () => syncNow());
  setInterval(() => { if (document.visibilityState === "visible") { syncNow(); paintSync(); } }, 90000);

  function renderSync() {
    document.title = "Sync · GRE Word Roots";
    const on = !!cfg.token;
    app.innerHTML = `
    <div class="wrap narrow">
      <header class="home-head">${nav("sync")}
        <h1>Sync</h1>
        <p class="sub">Keeps your marks, notes and hidden words identical on every device, and backed up in a private GitHub repo of your own.</p></header>
      <section class="card">
        <div class="row-between"><h3>Status</h3><span class="syncchip big" data-state="${syncState.state}"></span></div>
        <div class="muted small" id="syncStatus"></div>
        ${on ? `<div class="muted small">Repo: <b>${esc(cfg.repo)}</b></div>` : ""}
        <form id="syncForm" class="form" autocomplete="off">
          <label>Data repo<input id="sRepo" name="repo" placeholder="afm351800/gre-progress" value="${esc(cfg.repo || "afm351800/gre-progress")}" spellcheck="false" autocapitalize="off"></label>
          <label>Access token<input id="sTok" name="tok" type="password" placeholder="${on ? "•••••• saved on this device" : "github_pat_…"}" spellcheck="false" autocapitalize="off"></label>
          <div class="btnrow">
            <button class="btn primary" type="submit">${on ? "Update & sync" : "Connect & sync"}</button>
            ${on ? `<button class="btn" type="button" id="sNow">Sync now</button><button class="btn" type="button" id="sOff">Disconnect this device</button>` : ""}
          </div>
        </form>
      </section>
      <section class="card">
        <h3>Set up, once (about 5 minutes, on your laptop)</h3>
        <ol class="steps">
          <li><b>Create the data repo.</b> <a href="https://github.com/new" target="_blank" rel="noopener">github.com/new</a> → name it <code>gre-progress</code> → choose <b>Private</b> → tick “Add a README” → Create. It stays empty apart from one file, <code>progress.json</code>, which the app writes for you.</li>
          <li><b>Create the key.</b> <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">github.com/settings/personal-access-tokens/new</a> → name <code>word-roots</code> → expiration 90 days → <b>Only select repositories</b> → pick <code>gre-progress</code> → <b>Repository permissions → Contents → Read and write</b> → Generate token. Copy it now: GitHub shows it only once.</li>
          <li><b>Connect the laptop.</b> Paste the repo name and the token above → Connect & sync.</li>
          <li><b>Connect the phone.</b> Open this page on the phone, paste the same token. On a Mac and iPhone with the same Apple ID, copy on the Mac and paste on the iPhone directly (Universal Clipboard). Both devices then merge automatically.</li>
        </ol>
        <p class="muted small" style="margin:0">The token can only touch that one repo. It is stored on each device in this app’s own storage, never in the code. If you lose it or suspect a leak, delete it in GitHub settings and make a new one.</p>
      </section>
      <section class="card">
        <h3>How it behaves</h3>
        <ul class="steps plain">
          <li>Syncs when you open the app, after each change (a couple of seconds later), when you come back to the tab, and every 90 seconds.</li>
          <li>Merging is per word: if you mark the same word on both devices, the most recent change wins. Nothing else is overwritten.</li>
          <li>Works offline: changes are kept on the device and pushed when you’re back online.</li>
          <li>Every sync is a commit in your data repo, so GitHub also keeps the full history.</li>
        </ul>
      </section>
    </div>`;
    paintSync();
    document.getElementById("syncForm").addEventListener("submit", async e => {
      e.preventDefault();
      const repo = document.getElementById("sRepo").value.trim().replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "").replace(/\/$/, "");
      const tok = document.getElementById("sTok").value.trim() || cfg.token;
      if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) return toast("Repo should look like owner/name");
      if (!tok) return toast("Paste the access token");
      cfg = { repo, token: tok, last: cfg.last || 0 }; saveCfg();
      await syncNow(); renderSync();
      if (syncState.state !== "err") toast("Connected");
    });
    const n = document.getElementById("sNow"); if (n) n.addEventListener("click", async () => { await syncNow(); paintSync(); });
    const o = document.getElementById("sOff"); if (o) o.addEventListener("click", () => { cfg = {}; saveCfg(); syncState.state = "off"; syncState.last = 0; renderSync(); toast("Sync turned off on this device"); });
  }

  /* ---------- keyboard (laptop) ---------- */
  document.addEventListener("keydown", e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target, typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
    if (location.hash.startsWith("#/session") && sess && !sess.finished && !typing) {
      const k = e.key.toLowerCase();
      if (sess.i >= sess.queue.length) return;
      if (!sess.revealed) {
        if (k === " " || k === "enter" || k === "arrowright") { e.preventDefault(); act("reveal"); }
        else if (k === "h" && sess.mode === "learn") act("hidden");
      } else {
        if (k === "1") act("red"); else if (k === "2") act("amber"); else if (k === "3") act("green");
      }
      if (k === "backspace" || k === "u") { const u = document.getElementById("undo"); if (u && !u.hidden) u.click(); }
      return;
    }
    if (location.hash.startsWith("#/practice") && pr.run && pr.run.cur && !typing) {
      const r = pr.run, k = e.key;
      if (/^[1-3]$/.test(k)) { const qi = r.cur.findIndex(q => q.picked === null); if (qi >= 0) { e.preventDefault(); answer(qi, +k - 1); } }
      else if ((k === " " || k === "Enter" || k === "ArrowRight") && r.cur.every(q => q.picked !== null)) { e.preventDefault(); nextPage(); }
      return;
    }
    if (e.key === "/" && !typing) {
      const q = document.getElementById("q") || document.getElementById("hq");
      if (q) { e.preventDefault(); q.focus(); q.select(); }
    }
  });

  syncNow();
  route();
})();
