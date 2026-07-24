#!/usr/bin/env fontforge -script
# Merge CougarCS branch SVG icons into JetBrainsMono Nerd Font Mono as PUA glyphs.
# Output: a new font family so we never clobber the system font.
import fontforge, psMat, os

BASE = os.path.expanduser(
    "~/.local/share/fonts/TTF/JetBrainsMonoNerdFontMono-Regular.ttf")
ICONS = "/home/jkondratenko/Nextcloud/Resources/Design/Icons"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "fonts", "CougarCSIcons-Regular.ttf")

# codepoint -> (glyph name, svg filename)
GLYPHS = {
    0xE900: ("cougar-main",     "Property 1=Red.svg"),
    0xE901: ("cougar-webdev",   "Property 1=Webdev Purpl.svg"),
    0xE902: ("cougar-infosec",  "Property 1=InfoSec Blue.svg"),
    0xE903: ("cougar-tutoring", "CougarCS Head - Filled (White).svg"),
}

font = fontforge.open(BASE)
em = font.em
adv = font["A"].width           # monospace advance
ascent = font.ascent
print("em=%d advance=%d ascent=%d descent=%d" % (em, adv, ascent, font.descent))

# Fit the icon inside ONE monospace cell (both height and advance width),
# centered, so it never bleeds into neighbouring characters.
TARGET_H = int(em * 0.86)       # max height (cap-ish, a touch taller)
MAX_W    = adv * 0.94           # keep inside the advance with a hair of padding
VCENTER  = int(em * 0.36)       # vertical centre of the glyph above baseline

for cp, (name, fn) in GLYPHS.items():
    path = os.path.join(ICONS, fn)
    g = font.createChar(cp, name)
    g.clear()
    g.importOutlines(path, simplify=True, correctdir=True)
    g.removeOverlap()
    g.correctDirection()
    xmin, ymin, xmax, ymax = g.boundingBox()
    h = ymax - ymin
    if h <= 0:
        print("!! %s empty" % name); continue
    w = xmax - xmin
    s = min(TARGET_H / float(h), MAX_W / float(w))  # fit both dims in one cell
    g.transform(psMat.scale(s))                     # uniform scale
    xmin, ymin, xmax, ymax = g.boundingBox()
    dx = (adv - (xmax - xmin)) / 2.0 - xmin         # center horizontally
    dy = VCENTER - (ymin + ymax) / 2.0              # center vertically
    g.transform(psMat.translate(dx, dy))
    g.width = adv
    g.round()
    print("  %04X %-16s bbox=(%d,%d,%d,%d) w=%d"
          % (cp, name, *[int(v) for v in g.boundingBox()], g.width))

# ---------------------------------------------------------------------------
# BIG icons: each head tiled across a G x G block of cells, one glyph per tile.
# The single-cell glyphs above (E900-E903) are left untouched as a fallback.
# Tile codepoints (row-major, r=0 is the TOP printed row):
#   main E910+, webdev E920+, infosec E930+, tutoring E940+
# ---------------------------------------------------------------------------
G = 5
cellW = adv
# The terminal CELL height is winAscent+winDescent, NOT the em. Tiling on the em
# leaves blank padding bands between rows (visible seams). Tile on the true cell
# pitch so the head is continuous across rows.
winAsc = font.os2_winascent      # 1020
winDesc = font.os2_windescent    # 300
cellH = winAsc + winDesc         # 1320 : one terminal line
# cell occupies glyph-y [-winDesc, winAsc]. Overscan the clip a touch so rows
# overlap by a hair and no antialiased seam survives.
OV = 24
CLIP_LO = -winDesc - OV
CLIP_HI = winAsc + OV
# Bases spaced 0x20 apart: G*G = 25 glyphs per branch. Must match config.ts.
TILES = {
    0xE910: ("Property 1=Red.svg", "main"),
    0xE930: ("Property 1=Webdev Purpl.svg", "webdev"),
    0xE950: ("Property 1=InfoSec Blue.svg", "infosec"),
    0xE970: ("CougarCS Head - Filled (White).svg", "tutoring"),
}
FILL = 0.98  # how much of the block the head fills (preserve aspect)

def add_rect(glyph, x0, y0, x1, y1):
    # Clockwise winding so intersect() treats it as a clip, not a hole.
    lyr = glyph.foreground
    c = fontforge.contour(lyr.is_quadratic)
    c.moveTo(x0, y0); c.lineTo(x0, y1); c.lineTo(x1, y1); c.lineTo(x1, y0)
    c.closed = True
    lyr += c
    glyph.foreground = lyr

for base, (fn, label) in TILES.items():
    path = os.path.join(ICONS, fn)
    blockW, blockH = G * cellW, G * cellH
    for r in range(G):
        for c in range(G):
            cp = base + r * G + c
            g = font.createChar(cp, "cougar-%s-%d%d" % (label, r, c))
            g.clear()
            g.importOutlines(path, simplify=True, correctdir=True)
            g.removeOverlap()
            g.correctDirection()
            xmin, ymin, xmax, ymax = g.boundingBox()
            w0, h0 = xmax - xmin, ymax - ymin
            s = min(blockW / w0, blockH / h0) * FILL
            g.transform(psMat.scale(s))
            xmin, ymin, xmax, ymax = g.boundingBox()
            # center the head in the full block (block origin at 0,0)
            tx = (blockW - (xmax - xmin)) / 2.0 - xmin
            ty = (blockH - (ymax - ymin)) / 2.0 - ymin
            g.transform(psMat.translate(tx, ty))
            # shift the wanted tile so its cell lands in this glyph's cell box.
            # block-y 0 maps to font-y -winDesc; cell r spans (G-1-r)*cellH up.
            dx = -c * cellW
            dy = -winDesc - (G - 1 - r) * cellH
            g.transform(psMat.translate(dx, dy))
            # clip to the cell (with a hair of vertical overscan) via intersect
            add_rect(g, 0, CLIP_LO, cellW, CLIP_HI)
            g.intersect()
            g.width = adv
            g.round()
    print("  %04X-%04X cougar-%s tiled %dx%d" % (base, base + G * G - 1, label, G, G))

# Give it a fully UNIQUE name so fontconfig/kitty never confuse it with the
# stock JetBrainsMono Nerd Font. We only need it to supply the 4 icon glyphs
# via kitty's symbol_map, so a distinct name is all that matters.
NAME = "CougarCS Icons"
font.familyname = NAME
font.fontname   = "CougarCSIcons-Regular"
font.fullname   = NAME + " Regular"
# Overwrite every name-table record that still says "JetBrainsMono ...".
for lang, key, _ in list(font.sfnt_names):
    if key in ("Family", "Fullname", "UniqueID", "PostScriptName",
               "Preferred Family", "Compatible Full", "SubFamily",
               "Preferred Styles"):
        font.appendSFNTName(lang, key, {
            "Family": NAME,
            "Preferred Family": NAME,
            "Compatible Full": NAME + " Regular",
            "Fullname": NAME + " Regular",
            "SubFamily": "Regular",
            "Preferred Styles": "Regular",
            "UniqueID": "CougarCSIcons-Regular",
            "PostScriptName": "CougarCSIcons-Regular",
        }[key])
font.generate(OUT)
print("wrote", OUT, "as family:", NAME)
