// The COUGARCS banner for the top-left header (solid full-block style).
// Bold single-height glyphs keep the identity distinct from Claude Code's
// boxed ANSI Shadow wordmark.
export const WORDMARK: string[] = [
  " ██████  ██████  ██    ██  ██████   █████  ██████   ██████ ███████ ",
  "██      ██    ██ ██    ██ ██       ██   ██ ██   ██ ██      ██      ",
  "██      ██    ██ ██    ██ ██   ███ ███████ ██████  ██      ███████ ",
  "██      ██    ██ ██    ██ ██    ██ ██   ██ ██   ██ ██           ██ ",
  " ██████  ██████   ██████   ██████  ██   ██ ██   ██  ██████ ███████ ",
]

export const WORDMARK_WIDTH = Math.max(...WORDMARK.map((l) => l.length))

// Retained for consumers that optionally render a two-tone wordmark.
export function isShadowChar(ch: string): boolean {
  return ch !== " " && ch !== "_"
}
