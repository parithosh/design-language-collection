// Shared helpers for the showcase pages: swatches, copy buttons, contrast tables.

export async function loadJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}

export function copyButtons(root = document) {
  root.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-copy]");
    if (!btn) return;
    const text = btn.dataset.copy || document.querySelector(btn.dataset.copyFrom)?.textContent || "";
    await navigator.clipboard?.writeText(text).catch(() => {});
    const label = btn.textContent;
    btn.textContent = "Copied";
    setTimeout(() => (btn.textContent = label), 1200);
  });
}

/** Render swatches: [[name, hex], ...] into el. */
export function swatches(el, pairs) {
  el.innerHTML = pairs
    .map(
      ([name, hex]) => `<button class="swatch" data-copy="${hex}" title="Copy ${hex}">
        <span class="chip" style="background:${hex}"></span>
        <span class="swatch-name">${name}</span><span class="swatch-hex">${hex}</span></button>`,
    )
    .join("");
}

/** Render contrast rows for one theme/variant into a <tbody>. */
export function contrastRows(tbody, rows) {
  tbody.innerHTML = rows
    .map(
      (r) => `<tr><td><span class="dot" style="background:${r.fgHex}"></span>${r.fg}</td>
        <td><span class="dot" style="background:${r.bgHex}"></span>${r.bg}</td>
        <td class="num">${r.ratio.toFixed(2)}</td><td class="num">${r.min}</td>
        <td>${r.pass ? "pass" : "FAIL"}</td></tr>`,
    )
    .join("");
}

// ---- dashboard preview: one line chart, one bar chart and one table, drawn in the
// current theme's --chart-1..5 colours. The numbers are example data.
const WEEKS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"];
const SERIES = [
  { name: "Readers", values: [320, 340, 410, 390, 460, 520, 500, 580, 640, 610, 700, 760] },
  { name: "Subscribers", values: [120, 130, 150, 170, 180, 210, 240, 250, 290, 320, 330, 370] },
  { name: "Replies", values: [40, 60, 55, 80, 70, 95, 90, 120, 110, 140, 150, 170] },
];
const SOURCES = [["Search", 1840], ["Newsletter", 1310], ["GitHub", 960], ["X", 620], ["Direct", 410]];
const ROWS = [
  ["piecesoflife", "Live", 4210, [3, 4, 4, 5, 6, 6, 7], "+18%"],
  ["design-language", "Live", 2380, [1, 2, 2, 3, 4, 5, 6], "+42%"],
  ["field-notes", "Draft", 940, [4, 4, 3, 4, 3, 3, 3], "−6%"],
  ["ethereum-tools", "Paused", 610, [5, 4, 3, 3, 2, 2, 1], "−21%"],
];
const fmt = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n));

function lineChart() {
  const W = 420, H = 170, L = 34, R = 78, T = 10, B = 22, max = 800;
  const x = (i) => L + (i * (W - L - R)) / (WEEKS.length - 1);
  const y = (v) => T + (1 - v / max) * (H - T - B);
  const grid = [0, 200, 400, 600, 800].map((v) => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" class="dash-grid"/><text x="${L - 6}" y="${y(v) + 3}" text-anchor="end">${v}</text>`).join("");
  const ticks = [0, 3, 6, 9, 11].map((i) => `<text x="${x(i)}" y="${H - 6}" text-anchor="middle">${WEEKS[i]}</text>`).join("");
  const lines = SERIES.map((s, k) => {
    const pts = s.values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
    const last = s.values.at(-1);
    return `<polyline points="${pts}" fill="none" style="stroke:var(--chart-${k + 1})" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="${x(11)}" cy="${y(last)}" r="3" style="fill:var(--chart-${k + 1})"/>
      <text x="${x(11) + 8}" y="${y(last) + 3}" class="dash-end" style="fill:var(--chart-${k + 1})">${s.name}</text>`;
  }).join("");
  return `<svg viewBox="0 0 ${W} ${H}" class="dash-svg" role="img" aria-label="Line chart of readers, subscribers and replies over twelve weeks">${grid}${ticks}${lines}</svg>`;
}

function barChart() {
  const max = SOURCES[0][1];
  return `<div class="dash-bars">${SOURCES.map(([name, v], i) => `
    <span class="dash-bar-label">${name}</span>
    <span class="dash-bar-track"><span class="dash-bar" style="width:${(v / max) * 100}%;background:var(--chart-${i === 0 ? 1 : 5})"></span></span>
    <span class="dash-num">${fmt(v)}</span>`).join("")}</div>`;
}

function spark(values, k) {
  const max = Math.max(...values), min = Math.min(...values);
  const pts = values.map((v, i) => `${(i * 60) / (values.length - 1)},${16 - ((v - min) / (max - min || 1)) * 14}`).join(" ");
  return `<svg viewBox="-1 0 62 18" class="dash-spark"><polyline points="${pts}" fill="none" style="stroke:var(--chart-${k})" stroke-width="1.5"/></svg>`;
}

function table() {
  const tone = { Live: "ok", Draft: "quiet", Paused: "bad" };
  return `<table class="dash-table"><thead><tr><th>Project</th><th>Status</th><th class="num">Visits</th><th>Trend</th><th class="num">Change</th></tr></thead><tbody>${ROWS.map(([p, s, v, t, c]) => `
    <tr><td>${p}</td><td><span class="dash-status dash-status--${tone[s]}">${s}</span></td><td class="num">${v.toLocaleString("en")}</td>
    <td>${spark(t, c.startsWith("+") ? 1 : 4)}</td><td class="num dash-${c.startsWith("+") ? "up" : "down"}">${c}</td></tr>`).join("")}</tbody></table>`;
}

/** Fill every .dash element with the dashboard preview. */
export function dashboards(root = document) {
  for (const el of root.querySelectorAll(".dash")) {
    el.innerHTML = `
      <div class="dash-panel dash-wide"><p class="dash-h">Weekly readers</p><p class="dash-big">760 <span class="dash-up">+8.6%</span></p>${lineChart()}</div>
      <div class="dash-panel"><p class="dash-h">Visits by source</p>${barChart()}</div>
      <div class="dash-panel dash-wide"><p class="dash-h">Projects</p><div class="table-wrap">${table()}</div></div>
      <p class="dash-note">Example data</p>`;
  }
}

// ---- editorial figures: lib/figures.mjs with placeholder data ----
import * as fig from "./lib/figures.mjs";

const t = (s) => (s < 60 ? `${+s.toFixed(s < 1 ? 2 : 1)} s` : s < 3600 ? `${+(s / 60).toFixed(1)} min` : `${+(s / 3600).toFixed(1)} h`);
const ITEMS = ["Item A", "Item B", "Item C", "Item D", "Item E", "Item F", "Item G", "Item H"];

/** Fill a [data-figures] element with every figure, using abstract example data. */
export function figures(root) {
  root.innerHTML = `
    <div class="fig fig-scroll" data-f="hero"></div>
    <div class="fig-cap fig"><h4>Fig. 1 — Hero</h4><p>One headline number as nested semicircles hanging from the rule, a second one ringed, and the changes that got there along a diagonal.</p></div>
    <hr class="fig-gap">
    <div class="fig fig-scroll" data-f="slope"></div>
    <div class="fig-cap fig"><h4>Fig. 2 — Every measure</h4><p>Before on the left, after on the right, on a log scale so seconds and days share one axis. Dotted means estimated; grey means unchanged.</p></div>
    <hr class="fig-gap">
    <div class="fig fig-scroll" data-f="frequency"></div>
    <div class="fig-cap fig"><h4>Fig. 3 — By how often it happens</h4><p>The outer circle is before and the filled circle is after, by area. A dashed circle is an estimate.</p></div>
    <hr class="fig-gap">
    <div class="fig-split fig">
      <div><div data-f="lollipop"></div><div class="fig-cap" style="grid-template-columns:1fr"><h4>Fig. 4 — Per item</h4><p>Hollow is before, filled is after, labelled with the change.</p></div></div>
      <ol class="fig-notes"><h4>For the next person</h4>
        <li>Lead with the result in one sentence, then the number that proves it.</li>
        <li>Say what changed and what did not, so nobody has to ask.</li>
        <li>Name the command to rerun it, such as <code>node build.mjs --check</code>.</li>
        <li>Mark estimates as estimates, in the chart and in the text.</li>
      </ol>
    </div>
    <hr class="fig-gap">
    <div class="fig fig-scroll" data-f="partition"></div>
    <div class="fig-cap fig"><h4>Fig. 5 — Where it came from</h4><p>Read it top to bottom: the whole, then split by cause, then by item. Width is the amount.</p></div>
    <hr class="fig-gap">
    <div class="fig fig-scroll" data-f="scatter"></div>
    <div class="fig-cap fig"><h4>Fig. 6 — Each item, before against after</h4><p>Points below the diagonal got faster; the dashed guides mark 2×, 5×, 10× and 50×. Ringed items were targeted directly.</p></div>
    <p class="dash-note">Example data</p>`;
  const at = (k) => root.querySelector(`[data-f="${k}"]`);
  fig.hero(at("hero"), {
    title: "Faster, lighter", meta: "A project · 24 changes · one week", unit: "s",
    big: { before: 1400, after: 430, label: "The headline measure" },
    small: { before: 44, after: 36, label: "A second measure" },
    list: ["#01 Shared cache", "#02 Scheduler", "#03 Fewer passes", "#04 Shared tables", "#05 Lazy loading", "#06 Smaller imports", "#07 Batching", "#08 Index tables", "#09 Shorter chains", "#10 Reuse", "#11 Cleanup", "#12 Cleanup, again"],
    last: "0 regressions",
  });
  fig.slope(at("slope"), {
    format: t,
    ticks: [{ value: 0.4, label: "" }, { value: 1, label: "1 s" }, { value: 10, label: "10 s" }, { value: 60, label: "1 min" }, { value: 600, label: "10 min" }, { value: 3600, label: "1 h" }, { value: 36000, label: "10 h" }, { value: 172800, label: "2 days" }],
    rows: [
      { label: "Measure A, total", before: 159000, after: 129000 },
      { label: "Measure B, wall clock", before: 47500, after: 21600, estimate: true },
      { label: "Measure C, summed", before: 23400, after: 11900 },
      { label: "Measure D", before: 4540, after: 1430 },
      { label: "Measure E", before: 1370, after: 425 },
      { label: "Measure F, worst case", before: 744, after: 37 },
      { label: "Measure G", before: 51, after: 27 },
      { label: "Measure H, typical", before: 3.2, after: 3.1 },
      { label: "Measure I, typical", before: 0.53, after: 0.5 },
    ],
  });
  fig.frequency(at("frequency"), {
    from: "More often", to: "Less often", format: t,
    items: [
      { when: "Dozens of times a day", title: "Quick check", before: 51, after: 27, note: "in the worst case", sub: "typical: unchanged" },
      { when: "A few times a day", title: "Single file", before: 744, after: 37, note: "in the worst case", sub: "typical: unchanged" },
      { when: "Once a commit", title: "Dependents", before: 8640, after: 3960, note: "after a core edit", sub: "estimate, not timed", estimate: true },
      { when: "Once a task", title: "Fresh setup", before: 4540, after: 1430, note: "to a working setup", sub: "16-core machine" },
      { when: "Once a week", title: "Full build", before: 159000, after: 129000, note: "cold, total", sub: "32-core machine" },
    ],
  });
  fig.lollipop(at("lollipop"), {
    unit: "GB", max: 16, step: 4,
    items: [[15.8, 12.5], [11.7, 6.2], [11.6, 6.5], [9.2, 5.5], [8.1, 0.4], [7.1, 4.3], [6.1, 4.3], [4.2, 2.9]].map(([before, after], i) => ({ label: ITEMS[i], before, after })),
  });
  fig.partition(at("partition"), {
    brace: "6 groups · 76% of the total", total: "The whole amount saved",
    groups: [
      { label: "Shared change, mostly #04", parts: [["Item A", 9], 8, 6, 5, 4, 3, 2, 2, 1] },
      { label: "#01", parts: [["Item C", 12], 5] },
      { label: "#08", parts: [["Item D", 12]] },
      { label: "#02", parts: [["Item E", 9]] },
      { label: "#05", parts: [4, 3] },
      { label: "#09", parts: [4] },
    ],
    rest: { label: "Everything else", value: 31 },
  });
  fig.scatter(at("scatter"), {
    unit: "s", legend: ["Before", "After", "Targeted"],
    items: [
      [4195, 1963], [4045, 1670], [2827, 1329], [1972, 936], [2090, 819], [1637, 807], [1246, 726], [1093, 610],
      [1695, 379, "#03"], [3764, 290, "#06"], [3913, 238, "#02"], [773, 169, "#03"], [2595, 76, "#05"], [1055, 14, "#07"],
    ].map(([before, after, flag], i) => ({ label: `Item ${String(i + 1).padStart(2, "0")}`, before, after, flag })),
  });
}
