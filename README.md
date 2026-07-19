# cougarcs-tui

A terminal-aesthetic "cougarcs.agent" mockup for the CougarCS shirt design — a
Claude-Code-style chat where a prompt triggers the agent "deploying the four
branches," shown as the four CougarCS branch mascots rendered as **real font
glyphs** (not ASCII art) that light up one by one.

## The custom font

`patch_font.py` merges the four branch SVGs (`logos/`) into JetBrainsMono Nerd
Font Mono as Private Use Area glyphs, producing
`fonts/CougarCSIcons-Regular.ttf`:

Two sizes of each branch icon:

- **Single-cell** (one glyph per head), the subtle fallback:

  | Codepoint | Branch | Source SVG |
  |---|---|---|
  | `U+E900` | main | Property 1=Red |
  | `U+E901` | webdev (`</>` visor) | Property 1=Webdev Purpl |
  | `U+E902` | infosec (shades) | Property 1=InfoSec Blue |
  | `U+E903` | tutoring | CougarCS Head - Filled (White) |

- **Big 3×3 tiled** (nine glyphs per head, printed as three stacked rows), the
  current default in the scene. Each head's tiles run row-major from a base:
  main `U+E910`, webdev `U+E920`, infosec `U+E930`, tutoring `U+E940`. The tiles
  are made by clipping the scaled outline to each cell (clockwise clip rect +
  `intersect()` in `patch_font.py`).

Regenerate the font (needs FontForge):

```bash
fontforge -script patch_font.py
```

To see the glyphs in your own terminal live, install the font, then map the
codepoints to it (they sit at U+E900-E948, which also collide with stock Nerd
Font glyphs, so you must point that range at "CougarCS Icons"):

```bash
cp fonts/CougarCSIcons-Regular.ttf ~/.local/share/fonts/
fc-cache -f
```

**kitty** — add to `~/.config/kitty/kitty.conf`, then reload (`ctrl+shift+F5`)
or restart kitty:

```
symbol_map U+E900-U+E948 CougarCS Icons
```

This leaves your normal font untouched and only pulls those four glyphs from the
custom font.

## Run the live TUI

```bash
bun install
bun run index.ts   # q or esc to quit
```

## Render a print image

The image pipeline draws with the patched font directly, so it works even if
your terminal font isn't switched over. Both the live app and the capture drive
the same `buildScene`, so the image can't drift from the TUI.

```bash
bun run capture.ts        # all four branches online -> frame.json
bun run capture.ts 2      # mid-deploy: 2 of 4 online
python3 rasterize.py      # frame.json -> cougarcs-tui.png (transparent)
```

## Layout of the code (built for redesigns)

- `theme.ts` — every color. Swap to reskin.
- `config.ts` — the agents, the glyph codepoints, all copy, layout constants.
  Adding a branch is one array entry; the "four branches" copy derives the count.
- `scene.ts` — renders the config into the chat. `SceneState` drives the deploy
  animation (which icons are online, spinner, dots, caret).
- `index.ts` — live app + animation loop.
- `capture.ts` / `rasterize.py` — headless render -> PNG. `rasterize.py` mirrors
  a terminal's cell model (cell height = winAscent+winDescent, per-cell clipping,
  block chars filled as solid rects) so the PNG matches kitty.
- `patch_font.py` + `logos/` + `fonts/` — the custom-glyph toolchain.
- `wordmark.ts` — the top-left COUGAR CS banner (ANSI Shadow figlet block-letters,
  hand-editable). Regenerate with `figlet -f "ANSI Shadow" "COUGAR CS"`.
- `sprite.ts` — the little pixel-cougar mascot, a plain hand-editable pixel grid
  (`#` = filled, space = empty) packed into half-blocks. **Kept for later; not
  currently rendered** (the banner replaced it in the header).
- The window background is fully **transparent** (`RGBA.fromValues(0,0,0,0)` on
  `root`/`win` in `scene.ts`) so the terminal/shirt colour shows through. Best on
  a dark background — the dim UI text assumes it.
- `gen_sprite.py` — optional: re-traces a fresh mascot grid from `logos/main.svg`
  if you ever want to start over from the logo (`python3 gen_sprite.py 16`). Not
  needed for normal edits.

Never hand-edit the `.ttf`; regenerate it from the SVGs via `patch_font.py`.
