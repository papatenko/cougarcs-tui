// Pixel-cougar sprites.
//
// EDIT ME BY HAND. In the block sprites each character is a pixel you can see:
//   █ full   ▀ top half   ▄ bottom half   (space) = empty
// Every row must stay the same width. What you draw here is exactly what prints.
// (Tip: copy an existing █/▀/▄ from a nearby row instead of typing the glyph.)

// The CougarCS logo head — currently rendered as the mascot on the back design.
export const SPRITE_MAIN: string[] = [
  "███▄        ▄███",
  "█████▄▄▄▄▄▄█████",
  "▀██████████████▀",
  " ██████████████ ",
  " ███ ▀████▀ ███ ",
  " ▀███▄████▄███▀ ",
  "  ▀███▀▀▀▀███▀  ",
  "    ███▄▄███    ",
  "     ▀████▀     ",
]
export const SPRITE_MAIN_WIDTH = 16

// ---------------------------------------------------------------------------
// DRAFTS — full-body cougar poses, from the three reference photos.
// Not wired into the scene yet; here to be reviewed and picked from.
// Sized to sit on the back design alongside the moon + clouds (that canvas is
// ~69 x 14 cells), so nothing here exceeds 22 wide / 7 tall.
// ---------------------------------------------------------------------------

// --- Block art (half-block, same style as SPRITE_MAIN) ---

// Standing side profile, head left, tail up at the rear.  (ref: young cougar)
export const COUGAR_STAND_BLOCK: string[] = [
  "                 ▄▄ ",
  "  ▄▄            ██  ",
  " ████▄▄▄▄▄▄▄▄▄▄██   ",
  " ███████████████    ",
  " ▀██████████████    ",
  "  ██  ██    ██ ██   ",
  "  ▀▀  ▀▀    ▀▀ ▀▀   ",
]
export const COUGAR_STAND_BLOCK_WIDTH = 20

// Prowling downhill: head low at the left, haunches high, tail curled up.
// (ref: cougar stalking down the snowy rock)
export const COUGAR_PROWL_BLOCK: string[] = [
  "                 ▄▄▄",
  "              ▄██▀  ",
  "         ▄▄▄████    ",
  "   ▄▄▄███████████   ",
  " ▄███████████████   ",
  " ██▀ ▀██▀   ▀██▀    ",
  " ▀▀   ▀▀     ▀▀     ",
]
export const COUGAR_PROWL_BLOCK_WIDTH = 20

// Mid-leap, body stretched, tail streaming back.  (ref: cougar pouncing)
export const COUGAR_LEAP_BLOCK: string[] = [
  "   ▄▄            ▄▄▄",
  "  ████▄▄▄▄▄▄▄▄▄██▀  ",
  "▄▄███████████████   ",
  "  ████████████████  ",
  " ▀▀ ▀██▀    ▀██▀▀   ",
]
export const COUGAR_LEAP_BLOCK_WIDTH = 20

// --- ASCII art ---
// String.raw keeps backslashes literal, so the source reads like the render.
const art = (s: string): string[] => s.split("\n").slice(1, -1)

// Standing side profile.
export const COUGAR_STAND_ASCII: string[] = art(String.raw`
    /\_/\
   ( o.o )-----.
    >   <       \
   /  |  |   |   \
  (__|  |___|  |__)
`)
export const COUGAR_STAND_ASCII_WIDTH = 19

// Prowling, head low, tail up.
export const COUGAR_PROWL_ASCII: string[] = art(String.raw`
        z
      z
         z
       z         (')
      /\_/\       ) )
     ( -.- )__--./ )
    _/          |_/
   (__|__|__|__)^
`)
export const COUGAR_PROWL_ASCII_WIDTH = 21

// Same prowl pose, body untouched — only the tail changed, laying down and
// trailing straight out behind instead of curling up over the back.
export const COUGAR_PROWL_TAIL_DOWN_ASCII: string[] = art(String.raw`
        z
      z
         z
       z
      /\_/\
     ( -.- )__--.__
    _/          |\ \___.
   (__|__|__|__)^ \_____)
`)
export const COUGAR_PROWL_TAIL_DOWN_ASCII_WIDTH = 23

// Mid-leap.
export const COUGAR_LEAP_ASCII: string[] = art(String.raw`
    /\_/\         ___
 __( o.o )_______/   /
/    |   |       \_/
|   /     \
'--'       '--'
`)
export const COUGAR_LEAP_ASCII_WIDTH = 22

// Walking side profile with a long upswept tail, traced from the line-art
// reference: head left, long level back, four planted paws.
export const COUGAR_WALK_ASCII: string[] = art(String.raw`
                              ,--.
     /\_/\               __,-'    |
    ( o.o )_____________/         '
     )   (
    /     \____________
   |   |         |    |
  (_) (_)       (_)  (_)
`)
export const COUGAR_WALK_ASCII_WIDTH = 35

// Draped/lounging over an edge (ref: cougar asleep over a log). Keeps the Z's;
// body lies horizontal, legs dangle below with a leftward curve, tail trails off
// the right rear. Meant to sit at the bottom so the legs hang past the frame.
export const COUGAR_DRAPED_ASCII: string[] = art(String.raw`
        z
      z
         z
       z
      /\_/\ __---.__.
     ( -.- )        ''-+
    _/           _.._   )
   (  |_____|  |_)   \  \
   / /      /  /      |  |
   (#-)     (#-)     /  /
                    (==)
`)
export const COUGAR_DRAPED_ASCII_WIDTH = 37

// ---------------------------------------------------------------------------
// Night scenery for the back design — used by the back section in scene.ts.
// ---------------------------------------------------------------------------

// A textured crescent moon: a horn at the top-right, the thick body sweeping
// down the left, tailing off to the bottom-right. Opens right, reads as a "C".
export const MOON_ASCII: string[] = [
  "      _=+-    ",
  "    ##+       ",
  "   +**        ",
  "  +#*         ",
  "  ##*         ",
  "  %*+**       ",
  "   ##**++: =- ",
  "     ==--=+  ",
]
export const MOON_ASCII_WIDTH = 14

export const CLOUD_LARGE_ASCII: string[] = [
  "      .--.      ",
  "   .-(    ).    ",
  "  (___.__)__)   ",
]
export const CLOUD_LARGE_ASCII_WIDTH = 16

export const CLOUD_SMALL_ASCII: string[] = [
  "    .-.     ",
  "  .(   ).   ",
  " (__.__)_)   ",
]
export const CLOUD_SMALL_ASCII_WIDTH = 13
