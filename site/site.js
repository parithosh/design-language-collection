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
