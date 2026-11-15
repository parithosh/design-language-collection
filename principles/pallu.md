# Pallu

Pallu is the warm, ceremonial theme from piecesoflife, inspired by saree textiles. Its motifs are temple and zari borders, mango (ambi) buti, a brocade emblem, and ikat bands, in rani, marigold, and peacock on ivory. Use it for personal, social, and celebratory projects. It reads like a printed magazine, so it is light only on purpose.

Load `dist/css/pallu.css`, then `assets/motifs/pallu/motifs.css` if you use the motifs. Inline `assets/motifs/pallu/sprite.svg` once per page to get the emblem (`<use href="#pl-emblem">`) and the ikat pattern (`fill="url(#pl-ikat)"`).

## Fabrics

A fabric is six seed colours: main, highlight, second, accent, paper, and ink. `lib/pallu.mjs` derives every other token from them. Each derived token keeps the same OKLCH relationship to its seed that it has in Rani, so every fabric feels like the same cloth. A readability guard then nudges colours until text passes WCAG.

| Fabric | `data-fabric` | Vibe |
|---|---|---|
| Rani Ikat | default | The original: rani silk, marigold thread, peacock on ivory. |
| Indigo Quilt | `indigo` | Deep and literary, like a lamp-lit evening. |
| Coastal Weave | `coastal` | Airy navy, sea glass and coral on sand. |
| Nordic Linen | `nordic` | Quiet slate and flax with a rust thread. |
| Meadow Tapestry | `meadow` | Forest green, ochre and heather: soft and outdoorsy. |
| Autumn Kilim | `kilim` | Warm oxblood, amber and terracotta on oat. |

## Customizer

The showcase site has the same customizer as piecesoflife's Admin → Appearance page ("The Loom"). Pick a fabric, adjust main, highlight, and second, and copy the resulting `:root` block. The engine reports any colour it had to adjust for readability. A project can also call it directly:

```js
import spec from "@parithosh/design/tokens/pallu.json" with { type: "json" };
import { resolve } from "@parithosh/design/pallu-engine";

const { tokens, adjustments } = resolve(spec, { fabric: "coastal", main: "#1b4d3e" });
const css = tokens.map(([name, value]) => `--${name}: ${value};`).join("");
```

`lib/pallu.mjs` is a line-for-line port of piecesoflife's `internal/theme`. It produced identical output for all six fabrics, the adversarial cases in its tests, and 3,000 random picks.

## Rules

1. **Ivory is the ground; rani carries the frame.** Navigation, headings, and primary buttons use `--rani`. Body text uses `--ink` (or `--read-ink` for long reading) on `--ivory`.
2. **Gold is thread, not text.** `--marigold` and `--zari` are borders, rules, active-tab marks, and chips. Marigold is readable on rani, not on ivory.
3. **Peacock is the second voice.** Eyebrow labels, ledger panels, and saved states use it.
4. **Sindoor for drop caps and the active editor**, and for errors.
5. **Three typefaces, three jobs.** Marcellus for display, Newsreader for reading (italic for captions and meta), and Mukta for UI, set uppercase 700 at small sizes for pills and buttons.
6. **Motifs frame the content and never sit behind text.** Use the temple border under the nav, a zari rule between sections, the mango buti as a low-opacity field, and an ikat band to open a chapter.
7. **Hard shadows.** Cards get `--pl-shadow` (a 14px offset in rani at 18% opacity), never a blur.
8. **Photos under colour.** A banner photo sits under the main colour with `background-blend-mode: multiply`. Multiply only darkens, so titles in `--on-rani` stay readable on any photo.

## Shared names

`--bg`, `--fg`, `--brand`, `--accent`, `--highlight`, `--signal`, and the other shared names map onto Pallu's own names. That lets a component written for Stone render in Pallu. See `shared` in `tokens/pallu.json`.
