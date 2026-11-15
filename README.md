# Design language

One place for parithosh's design language. Two themes share one set of token names, and a dependency-free build generates every output from them:

- **Stone**: the everyday theme for code, tools, docs, and sites. It takes its structure and type from [ethlabs.org](https://ethlabs.org) and its colours from Verdigris by Karan Sharma ([@mrkaran_](https://x.com/mrkaran_)). Limestone is the light mode and Slate the dark one.
- **Pallu**: the warm, saree-woven identity from [piecesoflife](https://github.com/parithosh/piecesoflife). It has six fabrics, the Loom customizer, and its motifs. It is light only.

Both themes answer to `--bg`, `--fg`, `--fg-muted`, `--brand`, `--accent`, `--highlight`, `--signal`, and the other shared names, so a project switches theme by swapping one stylesheet.

## Layout

```text
tokens/        source of truth: base.json (shared scales), stone.json, pallu.json
lib/pallu.mjs  Pallu's theme engine (fabric + 3 knobs → 43 tokens, with a WCAG guard), port of piecesoflife internal/theme
build.mjs      generates dist/ and checks it
dist/          generated and committed; never edit by hand
  css/         stone.css (light + dark), pallu.css (all six fabrics)
  tailwind/    Tailwind v4 themes
  json/        flat values for Go, scripts and Figma; contrast.json is the full contrast report
  ports/       ghostty, zed, nvim, vscode
assets/        fonts (OFL, self-hosted) and motifs (Stone hairlines, Pallu sprite/temple/zari/mango/ikat)
principles/    the rules for each theme, written for people and coding agents
site/          the showcase, built to GitHub Pages
```

## Build

Node 20 or newer, with no `npm install` needed.

```sh
node build.mjs           # regenerate dist/
node build.mjs --check   # fail if dist/ is stale, a contrast pair fails, or a Pallu fabric needs adjusting
node build.mjs --site    # also stage the showcase in _site/ (serve it with any static server)
```

To change a colour, edit `tokens/*.json`, run `node build.mjs`, and commit the tokens together with `dist/`. CI runs `--check` on every push and pull request.

## Use it in a project

Pin a tag. CDN links work once the repo is on GitHub.

**Plain HTML**

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/parithosh/design-language-collection@v1/dist/css/stone.css">
```

Stone follows the OS colour scheme. Set `<html data-mode="light">` or `data-mode="dark"` to force a mode. For Pallu, load `dist/css/pallu.css` and optionally `assets/motifs/pallu/motifs.css`, then set `<html data-fabric="indigo">` (or `coastal`, `nordic`, `meadow`, `kilim`) to change the fabric.

**Tailwind v4**

```sh
npm install github:parithosh/design-language-collection#v1
```

```css
@import "tailwindcss";
@import "@parithosh/design/tailwind/stone.css";
```

This gives you `bg-bg`, `text-fg`, `text-fg-muted`, `border-line`, `bg-accent`, `text-signal`, `font-display`, `font-mono`, `tracking-caps`, and the rest.

**Go and other servers, such as piecesoflife:** copy `dist/css/pallu.css`, `assets/fonts/`, and `assets/motifs/pallu/` into your static directory with a small sync step. Or read `dist/json/*.json` for raw values.

**Editors and terminals**

| Tool | Install |
|---|---|
| Ghostty | Copy `dist/ports/ghostty/stone-light` and `stone-dark` to `~/.config/ghostty/themes/`, then set `theme = light:stone-light,dark:stone-dark` |
| Zed | Copy `dist/ports/zed/stone.json` to `~/.config/zed/themes/`, then pick Stone Limestone or Stone Slate |
| Neovim | Add `dist/ports/nvim` to your runtimepath (for example with lazy.nvim's `dir =`), then run `:colorscheme stone`. It follows `background`. |
| VS Code | Copy or symlink `dist/ports/vscode` into `~/.vscode/extensions/parithosh.stone-theme`, restart, then pick Stone Limestone or Stone Slate |

**Coding agents:** point the project's `AGENTS.md` at `principles/stone.md` or `principles/pallu.md`.

## Credits

Stone's colours started from Verdigris by Karan Sharma, sampled from screenshots he shared, and were adjusted so every text pair passes WCAG AA. Stone's layout grammar follows ethlabs.org. Pallu and its theme engine come from piecesoflife. Fonts are Outfit, Commit Mono, Marcellus, Newsreader, and Mukta, all under the SIL Open Font License (see `assets/fonts/licenses/`).
