// The COUGAR CS banner for the top-left header (ANSI Shadow figlet style).
//
// EDIT ME BY HAND. It's plain terminal text with a built-in stepped shadow
// (the ╗ ╝ ║ ═ glyphs). What you see here is exactly what prints. Keep the lines
// as-is or regenerate with: figlet -f "ANSI Shadow" "COUGAR CS".
export const WORDMARK: string[] = [
  " ██████╗ ██████╗ ██╗   ██╗ ██████╗  █████╗ ██████╗      ██████╗███████╗",
  "██╔════╝██╔═══██╗██║   ██║██╔════╝ ██╔══██╗██╔══██╗    ██╔════╝██╔════╝",
  "██║     ██║   ██║██║   ██║██║  ███╗███████║██████╔╝    ██║     ███████╗",
  "██║     ██║   ██║██║   ██║██║   ██║██╔══██║██╔══██╗    ██║     ╚════██║",
  "╚██████╗╚██████╔╝╚██████╔╝╚██████╔╝██║  ██║██║  ██║    ╚██████╗███████║",
  " ╚═════╝ ╚═════╝  ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝     ╚═════╝╚══════╝",
]

export const WORDMARK_WIDTH = Math.max(...WORDMARK.map((l) => l.length))

// Which characters are the "shadow" of the figlet (everything that isn't the
// solid █ fill). Used for optional two-tone coloring.
export function isShadowChar(ch: string): boolean {
  return ch !== " " && ch !== "█"
}
