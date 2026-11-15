# Stone

Stone is the everyday theme for code, tools, docs, and personal sites. It takes its layout and type from ethlabs.org and its colours from Verdigris by Karan Sharma ([@mrkaran_](https://x.com/mrkaran_)). It has two modes: Limestone (light) and Slate (dark).

Load `dist/css/stone.css`. It follows the OS colour scheme. Set `data-mode="light"` or `data-mode="dark"` on `<html>` to force a mode.

## Rules

1. **Calm by default.** Most of a page is `--fg` on `--bg`. Secondary text uses `--fg-muted`. No gradients, glows, or tinted panels.
2. **One signal per view.** `--signal` marks the single thing that must stand out, such as an invitation, a destructive action, or an error. If two things compete, neither gets signal.
3. **Patina for interaction.** Links, focus rings, the cursor, and selected states use `--accent`. Copper (`--highlight`) is for types, numbers, and small labels, never for links.
4. **Hairlines, not boxes.** Separate sections with a `--rule-hairline` or `--rule-thin` line in `--line` or `--fg`. Use a surface (`--surface` plus a `--line` ring) only for things that are real objects: windows, code panes, menus.
5. **One large geometric motif per page at most.** Draw it with hairlines in `--fg`, such as a ruled horizon, a circle, or a long diagonal (see `assets/motifs/stone/hairlines.svg`). Keep it away from text.
6. **Type.** Outfit everywhere: 600 for the wordmark and headings, 300 to 400 for body, and uppercase 300 with `--tracking-caps` for navigation and section labels. Commit Mono for code, paths, and terminal output. Use at most four sizes on a page.
7. **Space on a 4px scale.** Use `--space-*`. Leave generous margins; ethlabs.org's page margin is about 5% of the width.
8. **Square-ish corners.** Use `--radius-sm` for chips and `--radius-md` for panes. Nothing round except avatars and the circle motif.
9. **Contrast is checked, not eyeballed.** Every text token passes WCAG AA (4.5:1) on `--bg` and `--surface` in both modes. `node build.mjs --check` enforces it. If you add a pairing, add it to `tokens/stone.json`.

## Tokens

| Token | Use |
|---|---|
| `--bg`, `--surface`, `--sunken` | Page, panes and sidebars, wells and inputs |
| `--line`, `--line-strong` | Hairlines, borders |
| `--fg`, `--fg-muted` | Text, secondary text |
| `--brand`, `--on-brand` | Wordmark and solid primary buttons (ink in Stone) |
| `--accent`, `--on-accent` | Links, focus, selection, cursor |
| `--highlight` | Copper: types, numbers, small labels |
| `--signal` | The one thing that must stand out |
| `--success`, `--warning`, `--info` | Status text, always next to a word |
| `--ansi-0` … `--ansi-15`, `--syntax-*` | Terminal and code colours |

## For agents

When you build UI in a project that uses Stone, load `dist/css/stone.css` and use only these tokens. Do not write hex values. Follow the rules above, especially one signal per view and hairlines instead of cards.
