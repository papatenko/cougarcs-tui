// Renders the cougarcs.agent screen from config + theme.
// Layout: window buttons, COUGAR CS banner, a user prompt, the bot deploying
// agents, a branch fan-out (logos -> connectors -> labelled boxes), a "cougaring"
// cat status, and a blank input line. Transparent background throughout.
import { BoxRenderable, TextRenderable, RGBA, type CliRenderer } from "@opentui/core"
import { theme } from "./theme"
import { agents, copy, layout, tileRow, TILE_G, CAT_GLYPH, WIN_BUTTONS, WIN_TITLE } from "./config"
import { WORDMARK } from "./wordmark"
// sprite.ts (the pixel-cougar mascot) is kept for later use, not rendered here.

// Fully transparent fill: the terminal / shirt colour shows through.
const TRANSPARENT = RGBA.fromValues(0, 0, 0, 0)

export const SPINNER = ["", "", "", "", "", "", "", "", "", ""]

export interface SceneState {
  revealed: number // how many branches have "come online" (0..agents.length)
  spinner: number // spinner frame index
  dots: number // trailing dot count (0..3)
  caret: boolean // prompt caret visible
}

export const WIN_W = layout.windowWidth

// Branch fan-out geometry
const BOX_H = 3 // each branch box is 3 rows tall (border, content, border)
const LOGO_W = TILE_G + 1 // big tiled head (TILE_G wide) + a gap column
const CONN_W = 6 // connector column width
const BOX_W = WIN_W - LOGO_W - CONN_W

function txt(r: CliRenderer, content: string, fg: string | RGBA, opts: any = {}) {
  return new TextRenderable(r, { content, fg, ...opts })
}

function dots(state: SceneState): string {
  return ".".repeat(state.dots).padEnd(3)
}

export function buildScene(r: CliRenderer, state: SceneState) {
  const root = new BoxRenderable(r, {
    flexDirection: "column",
    padding: 1,
    backgroundColor: TRANSPARENT,
    width: WIN_W + layout.windowPad * 2 + 2,
  })
  r.root.add(root)

  const winWidth = WIN_W + layout.windowPad * 2 + 2

  // ---- title bar OUTSIDE the window: "cougarminal.exe" (left) + controls (right) ----
  const titleBar = new BoxRenderable(r, {
    flexDirection: "row",
    justifyContent: "space-between",
    width: winWidth,
    paddingBottom: 1,
  })
  root.add(titleBar)
  titleBar.add(txt(r, WIN_TITLE, theme.dim))
  titleBar.add(txt(r, WIN_BUTTONS, theme.dim))

  const win = new BoxRenderable(r, {
    flexDirection: "column",
    borderStyle: "rounded",
    border: true,
    borderColor: theme.hair,
    backgroundColor: TRANSPARENT,
    padding: layout.windowPad,
    width: winWidth,
  })
  root.add(win)

  // ---- COUGAR CS wordmark banner ----
  const banner = new BoxRenderable(r, {
    flexDirection: "column",
    width: WIN_W,
    paddingTop: 1,
    paddingBottom: 1,
  })
  win.add(banner)
  for (const line of WORDMARK) banner.add(txt(r, line, theme.red))

  // ---- user prompt (right-aligned) ----
  const userRow = new BoxRenderable(r, {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: WIN_W,
  })
  win.add(userRow)
  userRow.add(txt(r, `${copy.user}  `, theme.text))
  userRow.add(txt(r, "›", theme.faint))

  win.add(txt(r, "", theme.dim, { height: 1 }))

  // ---- bot line: "got it, deploying agents…" ----
  const botRow = new BoxRenderable(r, { flexDirection: "row", width: WIN_W })
  win.add(botRow)
  botRow.add(txt(r, "▌ ", theme.red))
  botRow.add(txt(r, copy.bot, theme.text))
  botRow.add(txt(r, dots(state), theme.dim))

  win.add(txt(r, "", theme.dim, { height: 1 }))

  // ---- branch fan-out: logos -> connectors -> labelled boxes ----
  const N = agents.length
  const branchRow = new BoxRenderable(r, {
    flexDirection: "row",
    alignItems: "flex-start",
    width: WIN_W,
  })
  win.add(branchRow)

  // left column: the big TILE_G x TILE_G tiled head per branch (3 rows each)
  const logosCol = new BoxRenderable(r, { flexDirection: "column", width: LOGO_W })
  branchRow.add(logosCol)
  agents.forEach((a, i) => {
    const online = i < state.revealed
    for (let row = 0; row < TILE_G; row++) {
      logosCol.add(txt(r, tileRow(a, row), online ? theme.red : theme.faint))
    }
  })

  // middle column: a trunk that tees to each box centre
  const connCol = new BoxRenderable(r, { flexDirection: "column", width: CONN_W })
  branchRow.add(connCol)
  for (let rr = 0; rr < N * BOX_H; rr++) {
    const i = Math.floor(rr / BOX_H)
    const isCenter = rr % BOX_H === 1
    const online = i < state.revealed
    let s = ""
    if (isCenter) s = (i === N - 1 ? "╰" : "├") + "──▶"
    else if (rr > 1 && rr < N * BOX_H - BOX_H + 1) s = "│"
    connCol.add(txt(r, s, online ? theme.red : theme.faint))
  }

  // right column: one bordered box per branch (transparent fill)
  const boxesCol = new BoxRenderable(r, { flexDirection: "column", width: BOX_W })
  branchRow.add(boxesCol)
  agents.forEach((a, i) => {
    const online = i < state.revealed
    const accent = online ? theme.red : theme.faint
    const box = new BoxRenderable(r, {
      flexDirection: "column",
      borderStyle: "rounded",
      border: true,
      borderColor: accent,
      backgroundColor: TRANSPARENT,
      title: ` ${a.label} `,
      titleColor: accent,
      height: BOX_H,
      width: BOX_W,
      paddingLeft: 1,
    })
    boxesCol.add(box)
    box.add(txt(r, a.task, online ? theme.text : theme.faint))
  })

  win.add(txt(r, "", theme.dim, { height: 1 }))

  // ---- "cougaring" cat status ----
  const catRow = new BoxRenderable(r, { flexDirection: "row", width: WIN_W })
  win.add(catRow)
  catRow.add(txt(r, `${CAT_GLYPH}  `, theme.red))
  catRow.add(txt(r, copy.cougaring, theme.red))
  catRow.add(txt(r, dots(state), theme.red))

  win.add(txt(r, "", theme.dim, { height: 1 }))

  // ---- blank input line with blinking caret ----
  const promptRow = new BoxRenderable(r, { flexDirection: "row", width: WIN_W })
  win.add(promptRow)
  promptRow.add(txt(r, "❯ ", theme.red))
  promptRow.add(txt(r, state.caret ? "█" : " ", theme.text))

  // ---- grid of rectangles below the window: row of 3, then row of 2 ----
  const WHITE = "#ffffff"
  const GRID_GAP = 2
  const CELL_H = 4
  function gridRow(count: number) {
    const row = new BoxRenderable(r, { flexDirection: "row", width: winWidth, gap: GRID_GAP })
    for (let i = 0; i < count; i++) {
      row.add(new BoxRenderable(r, {
        borderStyle: "rounded",
        border: true,
        borderColor: WHITE,
        backgroundColor: TRANSPARENT,
        flexGrow: 1,
        height: CELL_H,
      }))
    }
    return row
  }
  const grid = new BoxRenderable(r, {
    flexDirection: "column",
    width: winWidth,
    paddingTop: 1,
    gap: GRID_GAP,
  })
  root.add(grid)
  const sponsorLabel = new BoxRenderable(r, {
    flexDirection: "row",
    justifyContent: "center",
    width: winWidth,
    paddingBottom: 1,
  })
  grid.add(sponsorLabel)
  sponsorLabel.add(txt(r, "SPONSORED BY:", WHITE))
  grid.add(gridRow(3))
  grid.add(gridRow(2))

  return root
}
