// Live cougarcs.agent TUI. Run: bun run index.ts   (q or esc to quit)
//
// NOTE: the branch icons only appear if your terminal maps U+E900-E903 to the
// "CougarCS Icons" font. In kitty: symbol_map U+E900-U+E903 CougarCS Icons
// (see README).
import { createCliRenderer } from "@opentui/core"
import { buildScene, type SceneState } from "./scene"
import { agents } from "./config"

const renderer = await createCliRenderer({ exitOnCtrlC: true })

// Static: dots always "...", caret always solid (no blink).
const state: SceneState = { revealed: 0, spinner: 0, dots: 3, caret: true }
let root = buildScene(renderer, state)

function rebuild() {
  renderer.root.remove(root)
  root.destroyRecursively?.() ?? root.destroy?.()
  root = buildScene(renderer, state)
}

// Deploy the branches one by one, then hold.
const deploy = setInterval(() => {
  if (state.revealed < agents.length) {
    state.revealed++
    rebuild()
  } else {
    clearInterval(deploy)
  }
}, 650)

renderer.keyInput.on("keypress", (key: any) => {
  const name = key?.name ?? key
  if (name === "q" || name === "escape") {
    clearInterval(deploy)
    renderer.stop?.()
    process.exit(0)
  }
})
