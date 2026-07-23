import { test } from "node:test"
import { deepEqual, doesNotMatch, equal, ok } from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { agents, copy } from "./config.ts"
import { WORDMARK, WORDMARK_WIDTH } from "./wordmark.ts"

const expectedBranches = [
  { name: "main", label: "main", accent: "#c80f2e", task: "running the show ..." },
  { name: "webdev", label: "web-dev", accent: "#6f4feb", task: "building websites ..." },
  { name: "infosec", label: "info-sec", accent: "#05acf6", task: "securing members' data ..." },
  { name: "tutoring", label: "tutor", accent: "#10c054", task: "p2p teaching with members ..." },
]

test("uses the official color and approved copy for each CougarCS branch", () => {
  const actual = agents.map((agent) => ({
    name: agent.name,
    label: agent.label,
    accent: (agent as typeof agent & { accent?: string }).accent,
    task: agent.task,
  }))
  deepEqual(actual, expectedBranches)
})

test("uses branch-focused copy instead of deploying agents", () => {
  equal(copy.bot, "got it! deploying branches")
})

test("uses a compact non-boxed wordmark", () => {
  ok(WORDMARK_WIDTH >= 24)
  doesNotMatch(WORDMARK.join("\n"), /[╔╗╚╝]/)
})

test("scene has no simulated terminal window chrome", async () => {
  const scene = await readFile(new URL("./scene.ts", import.meta.url), "utf8")
  doesNotMatch(scene, /WIN_TITLE|WIN_BUTTONS/)
  doesNotMatch(scene, /borderColor:\s*theme\.hair/)
  ok(scene.includes("online ? a.accent : theme.faint"))
})
