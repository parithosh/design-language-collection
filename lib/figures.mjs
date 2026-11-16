// Editorial figures shared by every theme. Each function fills an element with
// one figure drawn from the --fig-* colours in assets/figures/figures.css,
// which default to the family's shared tokens, so the same figure follows
// Stone's mode or Pallu's fabric. No dependencies; runs in the browser.
//
//   hero        big title, nested before/after semicircles, a ringed stat and an angled list
//   slope       before → after for many measures on a log scale
//   frequency   nested before/after circles laid out along a "how often" axis
//   lollipop    before → after per item, as hollow and filled dots on a stem
//   partition   a total, split by cause, then by item (an icicle)
//   scatter     before vs after on log–log axes, with "n× faster" guides

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const caps = (s) => esc(String(s).toUpperCase());
const lg = Math.log10;
const n = (x) => +x.toFixed(1);
const svg = (w, h, body, label) =>
  `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">${body}</svg>`;

/** Percentage change with a real minus sign, e.g. "−19%". */
export const change = (before, after) => {
  const p = Math.round(((after - before) / before) * 100);
  return (p < 0 ? "−" : "+") + Math.abs(p) + "%";
};

/** Format a value with an optional unit: 1234 → "1,234", 0.53 → "0.53". */
export const num = (v, unit = "") => {
  const s = v >= 100 ? Math.round(v).toLocaleString("en") : v >= 10 ? n(v).toString() : +v.toFixed(2) + "";
  return unit ? `${s} ${unit}` : s;
};

// Spread label positions so they keep `gap` apart, staying inside [lo, hi].
function spread(ys, gap, lo, hi) {
  const order = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  for (let k = 0; k < order.length; k++) {
    order[k].y = Math.max(order[k].y, lo, k ? order[k - 1].y + gap : -Infinity);
  }
  for (let k = order.length - 1; k >= 0; k--) {
    order[k].y = Math.min(order[k].y, k < order.length - 1 ? order[k + 1].y - gap : hi);
  }
  const out = [];
  for (const o of order) out[o.i] = o.y;
  return out;
}

/**
 * @param {HTMLElement} el
 * @param {{title: string, meta: string, unit?: string,
 *   big: {before: number, after: number, label: string},
 *   small: {before: number, after: number, label: string},
 *   list: string[], last?: string}} d
 */
export function hero(el, d) {
  const W = 960, H = 540, ruleY = 200, cx = 480, R = 230, r = (R * d.big.after) / d.big.before;
  const u = d.unit || "";
  const s = d.small, sx = 140, sy = 382, sR = 96, sr = sR * Math.sqrt(s.after / s.before);
  const x0 = 700, x1 = 790, y0 = 150, y1 = 535, slope = (x1 - x0) / (y1 - y0);
  const items = [...d.list.map((t) => [t, false]), ...(d.last ? [[d.last, true]] : [])];
  const body = `
    <text class="t-title" x="36" y="128" font-size="104">${esc(d.title)}</text>
    <text class="t-caps" x="42" y="172">${caps(d.meta)}</text>
    <polyline class="s-ink" points="36,${ruleY} 920,${ruleY} 920,12"/>
    <path class="s-ink" d="M${cx - R},${ruleY} A${R} ${R} 0 0 0 ${cx + R},${ruleY}"/>
    <path class="s-hi" d="M${n(cx - r)},${ruleY} A${n(r)} ${n(r)} 0 0 0 ${n(cx + r)},${ruleY}"/>
    <line class="s-hi" x1="${cx}" y1="${ruleY + R - 4}" x2="${cx}" y2="${n(ruleY + r + 6)}"/>
    <polyline class="s-hi" points="${cx - 6},${n(ruleY + r + 16)} ${cx},${n(ruleY + r + 6)} ${cx + 6},${n(ruleY + r + 16)}"/>
    <text class="t-b t-hi" x="${cx - 12}" y="${n(ruleY + r + 28)}" text-anchor="end" font-size="26">${esc(num(d.big.after, u))}</text>
    <text class="t-b" x="${cx - 12}" y="${ruleY + R - 8}" text-anchor="end" font-size="26">${esc(num(d.big.before, u))}</text>
    <text class="t-b t-hi" x="${cx + 18}" y="${n(ruleY + (R + r) / 2 + 8)}" font-size="28">${change(d.big.before, d.big.after)}</text>
    <text class="t-caps" x="${cx}" y="${ruleY + R + 38}" text-anchor="middle">${caps(d.big.label)}</text>
    <circle class="s-ink" cx="${sx}" cy="${sy}" r="${sR}"/>
    <circle class="s-hi" cx="${sx}" cy="${sy}" r="${n(sr)}"/>
    <text class="t-caps" x="${sx}" y="${sy - 40}" text-anchor="middle" font-size="11">${caps(s.label)}</text>
    <text class="t-b" x="${sx}" y="${sy - 4}" text-anchor="middle" font-size="24">${esc(num(s.before, u))}</text>
    <polyline class="s-hi" points="${sx},${sy + 6} ${sx},${sy + 24} ${sx - 6},${sy + 32} ${sx},${sy + 24} ${sx + 6},${sy + 32}"/>
    <text class="t-b t-hi" x="${sx + 16}" y="${sy + 26}" font-size="13">${change(s.before, s.after)}</text>
    <text class="t-b t-hi" x="${sx}" y="${sy + 58}" text-anchor="middle" font-size="24">${esc(num(s.after, u))}</text>
    <line class="s-ink" x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}"/>
    ${items
      .map(([t, hi], i) => {
        const y = 230 + i * 22;
        return `<text class="t-caps${hi ? " t-hi" : ""}" x="${n(x0 + (y - y0) * slope - 22)}" y="${y}" font-size="12">${caps(t)}</text>`;
      })
      .join("")}`;
  el.innerHTML = svg(W, H, body, `${d.title}: ${d.big.label} from ${num(d.big.before, u)} to ${num(d.big.after, u)}`);
}

/**
 * @param {HTMLElement} el
 * @param {{rows: {label: string, before: number, after: number, estimate?: boolean}[],
 *   ticks: {value: number, label: string}[], format?: (v: number) => string}} d
 */
export function slope(el, d) {
  const W = 960, H = 560, L = 400, R = 660, top = 40, bot = 490;
  const f = d.format || ((v) => num(v));
  const lo = lg(d.ticks[0].value), hi = lg(d.ticks.at(-1).value);
  const y = (v) => bot - ((lg(v) - lo) / (hi - lo)) * (bot - top);
  const quiet = (r) => Math.abs(r.after / r.before - 1) < 0.07;
  const left = spread(d.rows.map((r) => y(r.before)), 24, top, bot);
  const right = spread(d.rows.map((r) => y(r.after)), 24, top, bot);
  const grid = d.ticks
    .map((t) => `<line class="s-grid" x1="${L}" x2="${R}" y1="${n(y(t.value))}" y2="${n(y(t.value))}"/>
      <text class="t-caps t-mu" x="${(L + R) / 2}" y="${n(y(t.value) - 6)}" text-anchor="middle" font-size="10">${caps(t.label)}</text>`)
    .join("");
  const rows = d.rows
    .map((r, i) => {
      const q = quiet(r), yb = y(r.before), ya = y(r.after);
      const tone = q ? " t-mu" : "";
      const lead = Math.abs(right[i] - ya) > 3 ? `<line class="s-grid" x1="${R + 4}" y1="${n(ya)}" x2="${R + 12}" y2="${n(right[i] - 4)}"/>` : "";
      return `
      <line class="${q ? "s-mu" : "s-ink"}${r.estimate ? " dot" : ""}" x1="${L}" y1="${n(yb)}" x2="${R}" y2="${n(ya)}" stroke-width="${q ? 1 : 1.6}"/>
      <circle class="${q ? "f-mu" : "f-ink"}" cx="${L}" cy="${n(yb)}" r="4"/>
      <circle class="${q ? "f-mu" : "f-hi"}" cx="${R}" cy="${n(ya)}" r="5"/>
      <text class="${tone.trim()}" x="${L - 16}" y="${n(left[i] + 5)}" text-anchor="end" font-size="15">${esc(r.label)} <tspan class="t-b">${esc(f(r.before))}</tspan></text>
      ${lead}
      <text x="${R + 16}" y="${n(right[i] + 5)}" font-size="15"><tspan class="t-b${q ? " t-mu" : " t-hi"}">${esc(f(r.after))}</tspan><tspan class="t-mu"> ${q ? "unchanged" : change(r.before, r.after)}</tspan></text>`;
    })
    .join("");
  const body = `${grid}
    <line class="s-ink" x1="${L}" x2="${L}" y1="${top - 10}" y2="${bot + 12}"/>
    <line class="s-ink" x1="${R}" x2="${R}" y1="${top - 10}" y2="${bot + 12}"/>
    ${rows}
    <text class="t-caps" x="${L}" y="${bot + 44}" text-anchor="middle">BEFORE</text>
    <text class="t-caps t-hi" x="${R}" y="${bot + 44}" text-anchor="middle">AFTER</text>`;
  el.innerHTML = svg(W, H, body, "Slope chart of measures before and after, on a log scale");
}

/**
 * @param {HTMLElement} el
 * @param {{from: string, to: string, unit?: string, items: {when: string, title: string, before: number, after: number,
 *   note?: string, sub?: string, estimate?: boolean}[], format?: (v: number) => string}} d
 */
export function frequency(el, d) {
  const W = 960, H = 430, x0 = 40, x1 = 920, cy = 228, R = 68;
  const f = d.format || ((v) => num(v, d.unit));
  const col = (x1 - x0) / d.items.length;
  const cols = d.items
    .map((it, i) => {
      const cx = n(x0 + (i + 0.5) * col), r = R * Math.sqrt(it.after / it.before);
      const est = !!it.estimate;
      return `
      <line class="s-ink" x1="${cx}" x2="${cx}" y1="50" y2="62"/>
      <text class="t-caps t-mu" x="${cx}" y="92" text-anchor="middle" font-size="10" letter-spacing="0.1em">${caps(it.when)}</text>
      <text class="t-caps t-b" x="${cx}" y="124" text-anchor="middle" font-size="12">${caps(it.title)}</text>
      <circle class="s-ink${est ? " dash" : ""}" cx="${cx}" cy="${cy}" r="${R}"/>
      <circle class="${est ? "f-mu" : "f-hi"}" cx="${cx}" cy="${n(cy + R - r)}" r="${n(r)}"/>
      <text x="${cx}" y="336" text-anchor="middle" font-size="22"><tspan class="t-b">${esc(f(it.before))}</tspan> → <tspan class="t-b ${est ? "t-mu" : "t-hi"}">${esc(f(it.after))}</tspan></text>
      <text class="t-b ${est ? "t-mu" : "t-hi"}" x="${cx}" y="362" text-anchor="middle" font-size="15">${change(it.before, it.after)}</text>
      ${it.note ? `<text x="${cx}" y="390" text-anchor="middle" font-size="14">${esc(it.note)}</text>` : ""}
      ${it.sub ? `<text class="t-mu" x="${cx}" y="410" text-anchor="middle" font-size="13">${esc(it.sub)}</text>` : ""}`;
    })
    .join("");
  const body = `
    <text class="t-caps" x="${x0}" y="34" font-size="12">${caps(d.from)}</text>
    <text class="t-caps" x="${x1}" y="34" text-anchor="end" font-size="12">${caps(d.to)}</text>
    <line class="s-ink" x1="${x0}" x2="${x1}" y1="50" y2="50"/>
    <polyline class="s-ink" points="${x1 - 10},44 ${x1},50 ${x1 - 10},56"/>
    ${cols}`;
  el.innerHTML = svg(W, H, body, `Before and after, ordered from ${d.from.toLowerCase()} to ${d.to.toLowerCase()}`);
}

/**
 * @param {HTMLElement} el
 * @param {{unit: string, max: number, step: number, items: {label: string, before: number, after: number}[]}} d
 */
export function lollipop(el, d) {
  const W = 560, H = 340, L = 64, R = 540, top = 24, bot = 250;
  const y = (v) => bot - (v / d.max) * (bot - top);
  const dx = (R - L - 30) / d.items.length;
  let grid = "";
  for (let v = 0; v <= d.max; v += d.step) {
    grid += `<line class="s-grid" x1="${L}" x2="${R}" y1="${n(y(v))}" y2="${n(y(v))}"/>
      <text class="t-caps t-mu" x="${L - 12}" y="${n(y(v) + 4)}" text-anchor="end" font-size="10">${v} ${caps(d.unit)}</text>`;
  }
  const items = d.items
    .map((it, i) => {
      const x = n(L + 30 + i * dx), yb = n(y(it.before)), ya = n(y(it.after));
      return `<line class="s-ink" x1="${x}" x2="${x}" y1="${yb}" y2="${ya}"/>
        <circle class="s-ink f-bg" cx="${x}" cy="${yb}" r="5"/>
        <circle class="f-hi" cx="${x}" cy="${ya}" r="5.5"/>
        <text class="t-hi" x="${x + 9}" y="${ya + 4}" font-size="11">${change(it.before, it.after)}</text>
        <text x="${x - 6}" y="${bot + 20}" font-size="12" transform="rotate(35 ${x - 6} ${bot + 20})">${esc(it.label)}</text>`;
    })
    .join("");
  el.innerHTML = svg(W, H, grid + items, `Lollipop chart of ${d.items.length} items before and after`);
}

/**
 * @param {HTMLElement} el
 * @param {{total: string, brace: string, groups: {label: string, parts: (number | [string, number])[]}[], rest: {label: string, value: number}}} d
 */
export function partition(el, d) {
  const parts = (g) => g.parts.map((p) => (Array.isArray(p) ? p : ["", p]));
  const sum = (g) => parts(g).reduce((s, [, v]) => s + v, 0);
  const grouped = d.groups.reduce((s, g) => s + sum(g), 0);
  const all = grouped + d.rest.value;
  el.innerHTML = `
    <div class="fp">
      <div class="fp-brace" style="width:${n((grouped / all) * 100)}%"><span>${caps(d.brace)}</span></div>
      <div class="fp-row fp-total">${esc(d.total)}</div>
      <div class="fp-row">${d.groups.map((g) => `<div class="fp-g" style="flex-grow:${sum(g)}">${sum(g) / all > 0.05 ? esc(g.label) : ""}</div>`).join("")}<div class="fp-rest" style="flex-grow:${d.rest.value}">${esc(d.rest.label)}</div></div>
      <div class="fp-row">${d.groups
        .map((g) => `<div class="fp-sub" style="flex-grow:${sum(g)}">${parts(g)
          .map(([label, v]) => `<div class="fp-p" style="flex-grow:${v}">${v / all > 0.08 ? esc(label) : ""}</div>`)
          .join("")}</div>`)
        .join("")}<div class="fp-rest" style="flex-grow:${d.rest.value}"></div></div>
    </div>`;
}

/**
 * @param {HTMLElement} el
 * @param {{unit: string, items: {label: string, before: number, after: number, flag?: string}[], legend?: [string, string, string]}} d
 */
export function scatter(el, d) {
  const W = 960, H = 600, x0 = 90, x1 = 540, y0 = 40, y1 = 490, dec = (x1 - x0) / 3;
  const X = (v) => n(x0 + (lg(v) - 1) * dec), Y = (v) => n(y1 - (lg(v) - 1) * dec);
  const [lb, la, lf] = d.legend || ["Before", "After", "Flagged"];
  let grid = `<rect class="s-grid" x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="none"/>`;
  for (const v of [10, 100, 1000, 10000]) {
    if (v > 10 && v < 10000) grid += `<line class="s-grid" x1="${X(v)}" x2="${X(v)}" y1="${y0}" y2="${y1}"/><line class="s-grid" x1="${x0}" x2="${x1}" y1="${Y(v)}" y2="${Y(v)}"/>`;
    grid += `<text class="t-caps t-mu" x="${X(v)}" y="${y1 + 24}" text-anchor="middle" font-size="11">${num(v)} ${caps(d.unit)}</text>
      <text class="t-caps t-mu" x="${x0 - 10}" y="${Y(v) + 4}" text-anchor="end" font-size="11">${num(v)} ${caps(d.unit)}</text>`;
  }
  const guides = [2, 5, 10, 50]
    .map((k) => `<line class="s-mu dash" x1="${X(10 * k)}" y1="${Y(10)}" x2="${X(10000)}" y2="${Y(10000 / k)}" stroke-width="0.8"/>
      <text class="t-caps t-mu" x="${X(10000) - 8}" y="${Y(10000 / k) + 24}" text-anchor="end" font-size="10" transform="rotate(-45 ${X(10000) - 8} ${Y(10000 / k) + 24})">${k === 2 ? "2× faster" : k + "×"}</text>`)
    .join("");
  const sorted = [...d.items].sort((a, b) => Y(a.after) - Y(b.after));
  const ly = spread(sorted.map((it) => Y(it.after)), 22, y0 + 40, y1 + 40);
  const dots = d.items
    .map((it) => `<line class="s-ink dot" x1="${X(it.before)}" x2="${X(it.before)}" y1="${Y(it.before)}" y2="${Y(it.after)}"/>
      <circle class="f-ink" cx="${X(it.before)}" cy="${Y(it.before)}" r="3.5"/>
      <circle class="f-hi" cx="${X(it.before)}" cy="${Y(it.after)}" r="4.5"/>
      ${it.flag ? `<circle class="s-hi" cx="${X(it.before)}" cy="${Y(it.after)}" r="10"/>` : ""}`)
    .join("");
  const list = sorted
    .map((it, i) => {
      const sp = it.before / it.after, ya = Y(it.after);
      return `<polyline class="s-grid" points="${X(it.before) + (it.flag ? 11 : 6)},${ya} 572,${ya} 592,${n(ly[i] - 4)}"/>
        <text x="600" y="${n(ly[i])}" font-size="15"><tspan class="t-b">${esc(it.label)}</tspan><tspan class="t-mu"> ${num(it.before)} → ${num(it.after)} ${esc(d.unit)} </tspan><tspan class="t-b${it.flag ? " t-hi" : ""}">${sp >= 10 ? Math.round(sp) : sp.toFixed(1)}×</tspan>${it.flag ? `<tspan class="t-mu"> ${esc(it.flag)}</tspan>` : ""}</text>`;
    })
    .join("");
  const body = `${grid}${guides}
    <line class="s-ink" x1="${X(10)}" y1="${Y(10)}" x2="${X(10000)}" y2="${Y(10000)}"/>
    <text class="t-caps" x="${X(250)}" y="${Y(250) - 10}" text-anchor="middle" font-size="11" transform="rotate(-45 ${X(250)} ${Y(250) - 10})">NO CHANGE</text>
    ${dots}
    <circle class="f-ink" cx="${x0 + 22}" cy="${y0 + 22}" r="4"/><text class="t-caps" x="${x0 + 34}" y="${y0 + 26}" font-size="11">${caps(lb)}</text>
    <circle class="f-hi" cx="${x0 + 130}" cy="${y0 + 22}" r="4.5"/><text class="t-caps" x="${x0 + 142}" y="${y0 + 26}" font-size="11">${caps(la)}</text>
    <circle class="f-hi" cx="${x0 + 232}" cy="${y0 + 22}" r="4.5"/><circle class="s-hi" cx="${x0 + 232}" cy="${y0 + 22}" r="10"/><text class="t-caps" x="${x0 + 250}" y="${y0 + 26}" font-size="11">${caps(lf)}</text>
    <text class="t-caps" x="${(x0 + x1) / 2}" y="${y1 + 60}" text-anchor="middle" font-size="12">${caps(lb)}</text>
    <text class="t-caps" x="30" y="${(y0 + y1) / 2}" text-anchor="middle" font-size="12" transform="rotate(-90 30 ${(y0 + y1) / 2})">${caps(la)}</text>
    <text class="t-caps t-mu" x="600" y="${y0 + 6}" font-size="11">ITEM · BEFORE → AFTER · SPEEDUP</text>
    ${list}`;
  el.innerHTML = svg(W, H, body, "Scatter of items before and after on log–log axes");
}
