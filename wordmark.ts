// The COUGAR CS banner for the top-left header (Star Wars FIGlet style).
// Wide, open letterforms keep the identity distinct from Claude Code's boxed
// ANSI Shadow wordmark. Regenerate with: figlet -f starwars -w 200 "COUGAR CS".
export const WORDMARK: string[] = [
  "  ______   ______    __    __    _______      ___      .______           ______     _______.",
  " /      | /  __  \\  |  |  |  |  /  _____|    /   \\     |   _  \\         /      |   /       |",
  "|  ,----'|  |  |  | |  |  |  | |  |  __     /  ^  \\    |  |_)  |       |  ,----'  |   (----`",
  "|  |     |  |  |  | |  |  |  | |  | |_ |   /  /_\\  \\   |      /        |  |        \\   \\",
  "|  `----.|  `--'  | |  `--'  | |  |__| |  /  _____  \\  |  |\\  \\----.   |  `----.----)   |",
  " \\______| \\______/   \\______/   \\______| /__/     \\__\\ | _| `._____|    \\______|_______/",
]

export const WORDMARK_WIDTH = Math.max(...WORDMARK.map((l) => l.length))

// Retained for consumers that optionally render a two-tone wordmark.
export function isShadowChar(ch: string): boolean {
  return ch !== " " && ch !== "_"
}
