// Renders the cougarcs.agent screen from config + theme.
// Layout: COUGAR CS banner, a user prompt, the branches coming online, a branch
// fan-out (logos -> connectors -> labelled boxes), a "cougaring"
// cat status, and a blank input line. Transparent background throughout.
import { BoxRenderable, TextRenderable, RGBA, type CliRenderer } from "@opentui/core"
import { theme } from "./theme"
import { agents, copy, layout, tileRow, TILE_G, CAT_GLYPH } from "./config"
import { WORDMARK } from "./wordmark"
import {
  COUGAR_DRAPED_ASCII,
  MOON_ASCII,
  CLOUD_LARGE_ASCII,
  CLOUD_SMALL_ASCII,
} from "./sprite"

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
const BRANCH_H = TILE_G // rows per branch slot (the tiled head is TILE_G tall)
const LOGO_W = TILE_G + 1 // big tiled head (TILE_G wide) + a gap column
const CONN_W = 6 // connector column width
const BODY_W = WIN_W - 1 // everything but the title sits one column narrower
const BOX_W = BODY_W - LOGO_W - CONN_W

function txt(r: CliRenderer, content: string, fg: string | RGBA, opts: any = {}) {
  return new TextRenderable(r, { content, fg, ...opts })
}

function dots(state: SceneState): string {
  return ".".repeat(state.dots).padEnd(3)
}

export function buildScene(r: CliRenderer, state: SceneState) {
  const contentWidth = WIN_W + layout.windowPad * 2
  const root = new BoxRenderable(r, {
    flexDirection: "column",
    padding: 1,
    backgroundColor: TRANSPARENT,
    width: contentWidth,
  })
  r.root.add(root)

  // Native terminal content: no simulated title bar or window border.
  const content = new BoxRenderable(r, {
    flexDirection: "column",
    backgroundColor: TRANSPARENT,
    padding: layout.windowPad,
    width: contentWidth,
  })
  root.add(content)

  // ---- COUGAR CS wordmark banner ----
  const banner = new BoxRenderable(r, {
    flexDirection: "column",
    width: WIN_W,
    paddingTop: 1,
    paddingBottom: 1,
  })
  content.add(banner)
  for (const line of WORDMARK) banner.add(txt(r, line, theme.red))

  // ---- user prompt (right-aligned) ----
  const userRow = new BoxRenderable(r, {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: BODY_W,
    backgroundColor: "#1f1f1f", // dark gray bar; keeps white prompt text legible
  })
  content.add(userRow)
  userRow.add(txt(r, `${copy.user}  `, theme.text))
  userRow.add(txt(r, "›", theme.faint))

  content.add(txt(r, "", theme.dim, { height: 1 }))

  // ---- branch status line ----
  const botRow = new BoxRenderable(r, { flexDirection: "row", width: BODY_W })
  content.add(botRow)
  botRow.add(txt(r, "◆ ", theme.red))
  botRow.add(txt(r, copy.bot, theme.text))
  botRow.add(txt(r, dots(state), theme.dim))

  content.add(txt(r, "", theme.dim, { height: 1 }))

  // ---- branch fan-out: logos -> connectors -> labelled boxes ----
  const N = agents.length
  const branchRow = new BoxRenderable(r, {
    flexDirection: "row",
    alignItems: "flex-start",
    width: BODY_W,
  })
  content.add(branchRow)

  // left column: a trunk that tees right toward each icon centre
  const connCol = new BoxRenderable(r, { flexDirection: "column", width: CONN_W })
  for (let rr = 0; rr < N * BRANCH_H; rr++) {
    const i = Math.floor(rr / BRANCH_H)
    const isCenter = rr % BRANCH_H === Math.floor(BRANCH_H / 2)
    const online = i < state.revealed
    let s = ""
    const lastCenter = (N - 1) * BRANCH_H + Math.floor(BRANCH_H / 2)
    if (isCenter) s = (i === N - 1 ? "╰" : "├") + "───▶"
    else if (rr < lastCenter) s = "│" // trunk runs from the top row down to the last tee
    connCol.add(txt(r, s, online ? agents[i].accent : theme.faint))
  }

  // middle column: the big TILE_G x TILE_G tiled head per branch (TILE_G rows each)
  const logosCol = new BoxRenderable(r, { flexDirection: "column", width: LOGO_W })
  agents.forEach((a, i) => {
    const online = i < state.revealed
    for (let row = 0; row < TILE_G; row++) {
      logosCol.add(txt(r, tileRow(a, row), online ? a.accent : theme.faint))
    }
  })

  // right column: one bordered box per branch, centered in a BRANCH_H-row slot
  const boxesCol = new BoxRenderable(r, { flexDirection: "column", width: BOX_W })
  const boxMargin = Math.floor((BRANCH_H - BOX_H) / 2) // blank rows above/below box
  agents.forEach((a, i) => {
    const online = i < state.revealed
    const accent = online ? a.accent : theme.faint
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
      marginTop: boxMargin,
      marginBottom: boxMargin,
    })
    boxesCol.add(box)
    box.add(txt(r, a.task, accent))
  })

  // add in visual order: arrows, then icons, then boxes
  branchRow.add(connCol)
  branchRow.add(logosCol)
  branchRow.add(boxesCol)

  content.add(txt(r, "", theme.dim, { height: 1 }))

  // ---- cougaring tagline visor, right above the chat field ----
  content.add(new BoxRenderable(r, {
    border: ["top"],
    borderColor: theme.red,
    title: `  ${CAT_GLYPH}  ${copy.status} ${dots(state)} `,
    titleColor: theme.red,
    titleAlignment: "left",
    width: BODY_W,
  }))

  // ---- blank input line with blinking caret ----
  const promptRow = new BoxRenderable(r, { flexDirection: "row", width: BODY_W })
  content.add(promptRow)
  promptRow.add(txt(r, "❯ ", theme.red))
  promptRow.add(txt(r, state.caret ? "█" : " ", theme.text))

  // ---- bottom visor: a plain closing rule ----
  content.add(new BoxRenderable(r, {
    border: ["top"],
    borderColor: theme.red,
    width: BODY_W,
  }))

  // ---- BACK OF SHIRT: a CougarCS-ified Claude Code welcome screen ----
  buildBackSection(r, root, contentWidth)

  // ---- sponsor grid, below both shirt designs ----
  const WHITE = "#ffffff"
  const grid = new BoxRenderable(r, {
    flexDirection: "column",
    width: contentWidth,
  })
  root.add(grid)

  // Sponsor logos as an ASCII canvas: rounded boxes with circuit-style wires
  // (traces off every side ending in ○ pads) drawn together for full control.
  const SW = contentWidth
  const SH = 23
  const sc: string[][] = Array.from({ length: SH }, () => Array(SW).fill(" "))
  const scol: string[][] = Array.from({ length: SH }, () => Array(SW).fill(WHITE))
  const set = (x: number, y: number, ch: string) => {
    if (y >= 0 && y < SH && x >= 0 && x < SW) sc[y][x] = ch
  }
  const sbox = (x: number, y: number, w: number, h: number) => {
    set(x, y, "╭"); set(x + w - 1, y, "╮"); set(x, y + h - 1, "╰"); set(x + w - 1, y + h - 1, "╯")
    for (let i = 1; i < w - 1; i++) { set(x + i, y, "─"); set(x + i, y + h - 1, "─") }
    for (let j = 1; j < h - 1; j++) { set(x, y + j, "│"); set(x + w - 1, y + j, "│") }
  }
  const up = (x: number, y: number, n: number) => {
    set(x, y, "┬"); for (let i = 1; i <= n; i++) set(x, y - i, "│"); set(x, y - n - 1, "○")
  }
  const down = (x: number, y: number, n: number) => {
    set(x, y, "┴"); for (let i = 1; i <= n; i++) set(x, y + i, "│"); set(x, y + n + 1, "○")
  }
  const left = (x: number, y: number, n: number) => {
    set(x, y, "┤"); for (let i = 1; i <= n; i++) set(x - i, y, "─"); set(x - n - 1, y, "○")
  }
  const right = (x: number, y: number, n: number) => {
    set(x, y, "├"); for (let i = 1; i <= n; i++) set(x + i, y, "─"); set(x + n + 1, y, "○")
  }

  const BW = 19, BH = 5, ty = 3
  const top = [4, 26, 48]
  for (const x of top) sbox(x, ty, BW, BH)
  // top box 1
  up(top[0] + 3, ty, 2); up(top[0] + 9, ty, 1); up(top[0] + 14, ty, 2)
  left(top[0], ty + 1, 2); left(top[0], ty + 2, 3)
  down(top[0] + 5, ty + BH - 1, 1); down(top[0] + 12, ty + BH - 1, 1)
  // top box 2
  up(top[1] + 4, ty, 1); up(top[1] + 13, ty, 2)
  right(top[1] + BW - 1, ty + 1, 2); right(top[1] + BW - 1, ty + 2, 3)
  down(top[1] + 6, ty + BH - 1, 1); down(top[1] + 11, ty + BH - 1, 1)
  // top box 3
  up(top[2] + 4, ty, 2); up(top[2] + 10, ty, 1)
  right(top[2] + BW - 1, ty + 1, 3); right(top[2] + BW - 1, ty + 2, 2)
  down(top[2] + 7, ty + BH - 1, 1); down(top[2] + 13, ty + BH - 1, 1)

  const BW2 = 30, by = 13
  const bot = [4, 37]
  for (const x of bot) sbox(x, by, BW2, BH)
  up(bot[0] + 6, by, 1); up(bot[0] + 20, by, 1)
  left(bot[0], by + 1, 2); left(bot[0], by + 2, 3)
  down(bot[0] + 9, by + BH - 1, 1); down(bot[0] + 18, by + BH - 1, 2)
  up(bot[1] + 8, by, 1); up(bot[1] + 22, by, 1)
  right(bot[1] + BW2 - 1, by + 1, 3); right(bot[1] + BW2 - 1, by + 2, 2)
  down(bot[1] + 10, by + BH - 1, 2); down(bot[1] + 20, by + BH - 1, 1)

  // "SPONSORED BY:" centered in the gap between the two rows, letter-spaced and
  // red; nudge any letter that lands on a wire to an adjacent free cell.
  const spaced = "SPONSORED BY:".split("").join(" ")
  const labelY = 10
  const startX = Math.floor((SW - spaced.length) / 2)
  for (let i = 0; i < spaced.length; i++) {
    const ch = spaced[i]
    if (ch === " ") continue
    let x = startX + i
    if (sc[labelY][x] !== " ") {
      if (sc[labelY][x - 1] === " ") x -= 1
      else if (sc[labelY][x + 1] === " ") x += 1
    }
    sc[labelY][x] = ch
    scol[labelY][x] = theme.red
  }

  // render each row, grouping consecutive same-color cells into spans
  for (let y = 0; y < SH; y++) {
    const rowBox = new BoxRenderable(r, { flexDirection: "row", width: SW })
    grid.add(rowBox)
    let x = 0
    while (x < SW) {
      const col = scol[y][x]
      let run = ""
      while (x < SW && scol[y][x] === col) { run += sc[y][x]; x++ }
      rowBox.add(txt(r, run, col))
    }
  }

  return root
}

// The back design: header lines + a star/cloud scene with a moon-"C" and the
// cougar mascot, framed by dotted rules. Placeholder replica; refined later.
function buildBackSection(r: CliRenderer, root: BoxRenderable, contentWidth: number) {
  const W = contentWidth
  const GRAY_STAR = "#9a9a9a"
  const GRAY_CLOUD = "#5f5f5f"
  const GRAY_MOON = "#6f4feb" // web-dev purple
  const GRAY_DIM = "#8a8a8a"
  const TOP_RULE = "#05acf6" // info-sec blue
  const BOTTOM_RULE = "#10c054" // tutor green

  const back = new BoxRenderable(r, {
    flexDirection: "column",
    width: W,
    paddingTop: 4, // clear separation from the front design above
  })
  root.add(back)

  // header line 1: the shell prompt
  back.add(txt(r, "C:\\Users\\cougar>cougarcs", theme.text))
  // header line 2: welcome + version
  const welcome = new BoxRenderable(r, { flexDirection: "row", width: W })
  back.add(welcome)
  welcome.add(txt(r, "Welcome to CougarCS ", theme.red))
  welcome.add(txt(r, "v9.6.19", GRAY_DIM))

  back.add(txt(r, "", theme.dim, { height: 1 }))
  back.add(txt(r, "·".repeat(W), TOP_RULE)) // top rule: web-dev purple

  // ---- scene canvas ----
  const H = 16
  const chars: string[][] = Array.from({ length: H }, () => Array(W).fill(" "))
  const colors: string[][] = Array.from({ length: H }, () => Array(W).fill(""))
  // In sprite art: a space is transparent (shows the background through), while
  // "~" is an invisible blocker — it clears the cell (shows the shirt, draws
  // nothing) so you can hand-mask out background dots/stars behind a sprite.
  const BLANK = "~"
  const stamp = (art: string[], top: number, left: number, color: string) => {
    art.forEach((line, dy) => {
      for (let dx = 0; dx < line.length; dx++) {
        const ch = line[dx]
        const y = top + dy
        const x = left + dx
        if (ch === " " || y < 0 || y >= H || x < 0 || x >= W) continue
        if (ch === BLANK) {
          chars[y][x] = " "
          colors[y][x] = ""
        } else {
          chars[y][x] = ch
          colors[y][x] = color
        }
      }
    })
  }

  // stars
  const STARS: [number, number][] = [
    [1, 6], [2, 40], [3, 22], [5, 12], [6, 48], [8, 2], [10, 52], [11, 44],
  ]
  for (const [y, x] of STARS) stamp(["*"], y, x, GRAY_STAR)

  // clouds (shifted right)
  stamp(CLOUD_LARGE_ASCII, 0, 12, GRAY_CLOUD)
  stamp(CLOUD_SMALL_ASCII, 4, 36, GRAY_CLOUD)

  // moon-"C", top-right
  stamp(MOON_ASCII, 0, W - 16, GRAY_MOON)

  // bottom framing rule drawn INTO the canvas, so the cougar's legs can hang
  // below it (outside the "box"). Cat is stamped after, crossing/below the rule.
  const ruleY = 11
  for (let x = 0; x < W; x++) { chars[ruleY][x] = "·"; colors[ruleY][x] = BOTTOM_RULE }

  // mascot: the draped cougar, bottom-left — body rests on the rule, legs dangle
  // below it (replaces the Claude character). Drawn as a plain overlay so the
  // rule dots still show through the gaps between its legs, tail, and head.
  stamp(COUGAR_DRAPED_ASCII, 5, 3, theme.red)

  // render each canvas row, grouping consecutive same-color cells into spans
  for (let y = 0; y < H; y++) {
    const rowBox = new BoxRenderable(r, { flexDirection: "row", width: W })
    back.add(rowBox)
    let x = 0
    while (x < W) {
      const col = colors[y][x]
      let run = ""
      while (x < W && colors[y][x] === col) {
        run += chars[y][x]
        x++
      }
      rowBox.add(txt(r, run, col || GRAY_DIM))
    }
  }
}
