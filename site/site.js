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
