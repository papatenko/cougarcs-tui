// Content + shape. Redesigns happen here, not in scene.ts.
//
// The branch icons are REAL font glyphs living in the "CougarCS Icons" font
// (assets/fonts/CougarCSIcons-Regular.ttf), mapped into the Private Use Area.
// They are single characters, not ASCII art.

export const GLYPH = {
  main: "", // Property 1=Red      -> main branch
  webdev: "", // Property 1=Webdev </>
  infosec: "", // Property 1=InfoSec shades
  tutoring: "", // Head Filled (White) -> tutoring
} as const

// Big icons: each head is tiled across a TILE_G x TILE_G block of cells.
// Codepoints run row-major from each branch's base (see patch_font.py).
export const TILE_G = 5
// Bases spaced 0x20 apart: a 5x5 block is 25 glyphs, so 0x10 spacing would
// collide. Must match patch_font.py's TILES bases.
export const TILE_BASE = {
  main: 0xe910,
  webdev: 0xe930,
  infosec: 0xe950,
  tutoring: 0xe970,
} as const

export interface Agent {
  name: string // internal id (keys the glyph/tile mapping)
  label: string // display name shown on the branch box
  task: string // one-line description shown inside the box
  accent: string // branch color used by the live CougarCS website
  glyph: string // single-cell branch glyph (E900-E903)
  tileBase: number // base codepoint of the TILE_G x TILE_G big-icon block
}

export const agents: Agent[] = [
  { name: "main", label: "main", task: "running the show ...", accent: "#c80f2e", glyph: GLYPH.main, tileBase: TILE_BASE.main },
  { name: "webdev", label: "web-dev", task: "building websites ...", accent: "#6f4feb", glyph: GLYPH.webdev, tileBase: TILE_BASE.webdev },
  { name: "infosec", label: "info-sec", task: "securing members' data ...", accent: "#05acf6", glyph: GLYPH.infosec, tileBase: TILE_BASE.infosec },
  { name: "tutoring", label: "tutor", task: "p2p teaching with members ...", accent: "#10c054", glyph: GLYPH.tutoring, tileBase: TILE_BASE.tutoring },
]

// Nerd-font glyphs used as UI chrome (from the base JetBrainsMono NF, present in
// the patched CougarCS Icons font too, so both the live TUI and the PNG render them).
export const CAT_GLYPH = "=^..^=" // ASCII cat emoticon (the mascot; all glyphs in-font)
// The TILE_G glyphs making up printed row r (0 = top) of an agent's big icon.
export function tileRow(a: Agent, r: number): string {
  let s = ""
  for (let c = 0; c < TILE_G; c++) s += String.fromCodePoint(a.tileBase + r * TILE_G + c)
  return s
}

export const copy = {
  user: "ship the fall showcase!",
  bot: "got it! deploying branches",
  status: "prowling",
  wordmark: "C O U G A R C S",
}

export const layout = {
  windowWidth: 67, // wordmark is 67 cols wide
  windowPad: 2,
  iconGap: 3, // spaces between branch icons on the deploy row (0 = flush)
}

function numberWord(n: number): string {
  return ["zero", "one", "two", "three", "four", "five", "six"][n] ?? String(n)
}
