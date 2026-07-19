// Central palette. Swap this file to reskin the whole app.
export const theme = {
  // Cougar Red ramp
  red: "#c80f2e",
  redDeep: "#a90b25",
  redDark: "#940a21",
  redTower: "#840b1f",
  // surfaces
  bg: "#0b0b0c",
  panel: "#141518",
  hair: "#ffffff", // window / box borders (was gray -> white)
  // text (all non-red UI is white now)
  text: "#ffffff",
  dim: "#ffffff",
  faint: "#ffffff",
} as const

export type Theme = typeof theme
