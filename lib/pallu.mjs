// The Pallu theme engine, ported from piecesoflife's internal/theme (theme.go
// and color.go) so the build and the showcase customizer share one copy.
//
// A fabric is six seed colours. Every other colour token keeps the
// perceptual (OKLCH) relationship it has to its seed in the Rani palette, so
// Rani's seeds reproduce pallu.css exactly. Afterwards a readability guard
// nudges the three pickable colours (main, highlight, second) and the
// derived text tokens until text on and against them passes WCAG.
//
// Runs unchanged in Node and in the browser.

// ---- colour maths (sRGB channels in 0..1, OKLCH as {l, c, h}) -----------

const toLinear = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const toGamma = (v) => (v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055);
const channel8 = (v) => Math.round(Math.max(0, Math.min(1, v)) * 255);

export function parseHex(s) {
  if (typeof s !== "string" || !s.startsWith("#")) return null;
  let h = s.slice(1);
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (h.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(h)) return null;
  const v = parseInt(h, 16);
  return { r: ((v >> 16) & 0xff) / 255, g: ((v >> 8) & 0xff) / 255, b: (v & 0xff) / 255 };
}

export const validHex = (s) => parseHex(s) !== null;

function mustHex(s) {
  const c = parseHex(s);
  if (!c) throw new Error(`pallu: bad hex ${s}`);
  return c;
}

export const toHex = (c) =>
  "#" + [c.r, c.g, c.b].map((v) => channel8(v).toString(16).padStart(2, "0")).join("");

const triple = (c) => `${channel8(c.r)}, ${channel8(c.g)}, ${channel8(c.b)}`;

const luminance = (c) => 0.2126 * toLinear(c.r) + 0.7152 * toLinear(c.g) + 0.0722 * toLinear(c.b);

/** WCAG 2 contrast ratio between two sRGB colours (1..21). */
export function contrast(a, b) {
  let la = luminance(a);
  let lb = luminance(b);
  if (la < lb) [la, lb] = [lb, la];
  return (la + 0.05) / (lb + 0.05);
}

/** WCAG 2 contrast ratio between two hex colours. */
export const contrastHex = (a, b) => contrast(mustHex(a), mustHex(b));

function oklch(c) {
  const r = toLinear(c.r), g = toLinear(c.g), b = toLinear(c.b);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  let h = (Math.atan2(B, A) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: L, c: Math.hypot(A, B), h };
}

function unclamped(p) {
  const rad = (p.h * Math.PI) / 180;
  const A = p.c * Math.cos(rad), B = p.c * Math.sin(rad);
  let l = p.l + 0.3963377774 * A + 0.2158037573 * B;
  let m = p.l - 0.1055613458 * A - 0.0638541728 * B;
  let s = p.l - 0.0894841775 * A - 1.291485548 * B;
  l = l * l * l; m = m * m * m; s = s * s * s;
  return {
    r: toGamma(+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: toGamma(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: toGamma(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  };
}

function inGamut(c) {
  const eps = 0.5 / 255;
  return c.r >= -eps && c.r <= 1 + eps && c.g >= -eps && c.g <= 1 + eps && c.b >= -eps && c.b <= 1 + eps;
}

// Map into sRGB by reducing chroma, keeping hue and lightness.
function toRgb(p) {
  p = { ...p, l: Math.max(0, Math.min(1, p.l)) };
  const c = unclamped(p);
  if (inGamut(c)) return c;
  let lo = 0, hi = p.c;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(unclamped({ l: p.l, c: mid, h: p.h }))) lo = mid;
    else hi = mid;
  }
  return unclamped({ l: p.l, c: lo, h: p.h });
}

const quantize = (c) => mustHex(toHex(c));

// Move c's lightness until it reaches `min` contrast against bg, judged on
// the 8-bit colour that will be emitted.
function ensureContrast(c, bg, min, darker) {
  c = quantize(c);
  bg = quantize(bg);
  if (contrast(c, bg) >= min) return c;
  const p = oklch(c);
  for (let i = 0; i < 200; i++) {
    p.l += darker ? -0.005 : 0.005;
    if (p.l <= 0 || p.l >= 1) break;
    const out = quantize(toRgb(p));
    if (contrast(out, bg) >= min) return out;
  }
  return darker ? { r: 0, g: 0, b: 0 } : { r: 1, g: 1, b: 1 };
}

// Re-express Rani's (seed → token) relationship on a new seed.
function follow(newSeed, raniSeed, raniTok) {
  let c = raniTok.c;
  if (raniSeed.c > 1e-4) c = (newSeed.c * raniTok.c) / raniSeed.c;
  return { l: newSeed.l + (raniTok.l - raniSeed.l), c, h: newSeed.h + (raniTok.h - raniSeed.h) };
}

// Readability floors, each just under Rani's own ratio or at WCAG AA.
export const FLOORS = { text: 4.5, ledgerFg: 4.4, smallMeta: 4.3, quietTag: 3.0, washLight: 7.0 };

export const KNOBS = ["main", "highlight", "second"];

/**
 * Resolve a fabric plus optional knob overrides into Pallu's full token set.
 * @param {object} spec tokens/pallu.json
 * @param {{fabric?: string, main?: string, highlight?: string, second?: string}} [config]
 * @returns {{tokens: [string, string][], adjustments: {knob: string, picked: string, used: string}[], main: string}}
 */
export function resolve(spec, config = {}) {
  const fabricId = config.fabric || spec.fabrics[0].id;
  const fabric = spec.fabrics.find((f) => f.id === fabricId);
  if (!fabric) throw new Error(`unknown fabric "${fabricId}"`);
  const rani = spec.fabrics[0];

  const seeds = { ...fabric };
  const picked = {};
  for (const knob of KNOBS) {
    const v = config[knob];
    if (!v) continue;
    if (!validHex(v)) throw new Error(`invalid colour "${v}"`);
    seeds[knob] = picked[knob] = toHex(mustHex(v));
  }

  const paper = mustHex(seeds.paper);
  const ink = mustHex(seeds.ink);
  const raniOnRani = spec.derived.find(([n]) => n === "on-rani")[2];
  const onRani = toRgb(follow(oklch(paper), oklch(mustHex(rani.paper)), oklch(mustHex(raniOnRani))));
  const white = { r: 1, g: 1, b: 1 };

  let main = mustHex(seeds.main);
  main = ensureContrast(main, paper, FLOORS.text, true);
  main = ensureContrast(main, onRani, FLOORS.text, true);

  let second = mustHex(seeds.second);
  second = ensureContrast(second, paper, FLOORS.text, true);
  second = ensureContrast(second, white, FLOORS.text, true);

  let highlight = mustHex(seeds.highlight);
  for (let i = 0; i < 4; i++) {
    highlight = ensureContrast(highlight, main, FLOORS.text, false);
    highlight = ensureContrast(highlight, ink, FLOORS.text, false);
    highlight = ensureContrast(highlight, second, FLOORS.quietTag, false);
    if (contrast(highlight, main) >= FLOORS.text && contrast(highlight, ink) >= FLOORS.text) break;
  }

  let accent = mustHex(seeds.accent);
  accent = ensureContrast(accent, white, FLOORS.text, true);
  accent = ensureContrast(accent, paper, FLOORS.text, true);
  seeds.accent = toHex(accent);

  const resolved = { main, highlight, second };
  const adjustments = [];
  for (const knob of KNOBS) {
    if (picked[knob] && toHex(resolved[knob]) !== picked[knob]) {
      adjustments.push({ knob, picked: picked[knob], used: toHex(resolved[knob]) });
    }
  }
  seeds.main = toHex(main);
  seeds.highlight = toHex(highlight);
  seeds.second = toHex(second);

  const vals = new Map([
    ["rani", main],
    ["marigold", highlight],
    ["peacock", second],
    ["sindoor", accent],
    ["ivory", paper],
    ["ink", ink],
  ]);
  for (const [name, from, raniVal] of spec.derived) {
    vals.set(name, toRgb(follow(oklch(mustHex(seeds[from])), oklch(mustHex(rani[from])), oklch(mustHex(raniVal)))));
  }

  const fix = (name, bg, min, darker) => vals.set(name, ensureContrast(vals.get(name), bg, min, darker));
  fix("nav-muted", main, FLOORS.text, false);
  fix("on-peacock", second, FLOORS.text, false);
  fix("ledger-fg", second, FLOORS.ledgerFg, false);
  fix("ledger-wait", second, FLOORS.quietTag, false);
  fix("peacock-wash", { r: 0, g: 0, b: 0 }, FLOORS.washLight, false);
  fix("sindoor-wash", { r: 0, g: 0, b: 0 }, FLOORS.washLight, false);
  fix("peacock-ink", vals.get("peacock-wash"), FLOORS.text, true);
  fix("sindoor-ink", vals.get("sindoor-wash"), FLOORS.text, true);
  fix("zari-ink", vals.get("strip"), FLOORS.smallMeta, true);
  fix("ink-soft", paper, FLOORS.smallMeta, true);

  const tokens = [...vals].map(([n, c]) => [n, toHex(c)]);
  tokens.push(
    ["rani-rgb", triple(main)],
    ["marigold-rgb", triple(highlight)],
    ["ink-rgb", triple(ink)],
    ["pl-shadow", `14px 14px 0 rgba(${triple(main)}, 0.18)`],
  );
  return { tokens, adjustments, main: toHex(main) };
}
