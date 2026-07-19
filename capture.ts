// Headless render -> frame.json for the print pipeline (rasterize.py).
// Both the live app and this capture drive the same buildScene, so the
// exported image can never drift from what the TUI shows.
//
// Usage: bun run capture.ts [revealed]   (default: all branches online)
import { createTestRenderer } from "@opentui/core/testing"
import { buildScene, SPINNER, WIN_W, type SceneState } from "./scene"
import { agents, layout } from "./config"

const revealed = process.argv[2] ? parseInt(process.argv[2], 10) : agents.length

const width = WIN_W + layout.windowPad * 2 + 6
const height = 60

const { renderer, renderOnce, captureSpans } = await createTestRenderer({
  width,
  height,
})

const state: SceneState = {
  revealed,
  spinner: 2,
  dots: 3,
  caret: true,
}
buildScene(renderer, state)
await renderOnce()

const frame = captureSpans()

function norm(c: any): [number, number, number, number] {
  // RGBA stores 0..1 floats
  return [
    Math.round((c.r ?? c.buffer?.[0] ?? 0) * 255),
    Math.round((c.g ?? c.buffer?.[1] ?? 0) * 255),
    Math.round((c.b ?? c.buffer?.[2] ?? 0) * 255),
    Math.round((c.a ?? c.buffer?.[3] ?? 1) * 255),
  ]
}

const out = {
  cols: frame.cols,
  rows: frame.rows,
  lines: frame.lines.map((ln) =>
    ln.spans.map((s) => ({
      text: s.text,
      fg: norm(s.fg),
      bg: norm(s.bg),
    })),
  ),
}

await Bun.write("frame.json", JSON.stringify(out))
console.log(`wrote frame.json (${frame.cols}x${frame.rows}, revealed=${revealed})`)
process.exit(0)
