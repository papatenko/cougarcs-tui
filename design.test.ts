import { test } from "node:test"
import { deepEqual, doesNotMatch, equal, ok } from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { agents, copy } from "./config.ts"
import { WORDMARK, WORDMARK_WIDTH } from "./wordmark.ts"

const expectedBranches = [
  { name: "main", label: "CougarCS", accent: "#c80f2e", task: "running the show" },
  { name: "webdev", label: "Web Dev.", accent: "#6f4feb", task: "building websites" },
  { name: "infosec", label: "Info. Sec", accent: "#05acf6", task: "protecting our data" },
  { name: "tutoring", label: "Tutoring", accent: "#10c054", task: "peer teaching with students" },
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
  equal(copy.bot, "bringing every branch online")
})

test("uses a wide non-shadow wordmark", () => {
  ok(WORDMARK_WIDTH >= 88)
  doesNotMatch(WORDMARK.join("\n"), /[╔╗╚╝]/)
})

test("scene has no simulated terminal window chrome", async () => {
  const scene = await readFile(new URL("./scene.ts", import.meta.url), "utf8")
  doesNotMatch(scene, /WIN_TITLE|WIN_BUTTONS/)
  doesNotMatch(scene, /borderColor:\s*theme\.hair/)
  ok(scene.includes("online ? a.accent : theme.faint"))
})
