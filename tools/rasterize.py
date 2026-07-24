#!/usr/bin/env python3
"""frame.json -> PNG, drawn the way a terminal (kitty) lays out cells so the
big tiled branch glyphs stay seamless. Transparent background.

Key point: a terminal cell is winAscent+winDescent tall (NOT the em), and each
glyph is clipped to its own cell. We reproduce both so the print image matches
what kitty renders."""
import json, os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT = os.path.join(ROOT, "assets", "fonts", "CougarCSIcons-Regular.ttf")

# JetBrainsMono / CougarCS Icons vertical metrics (font units, em=1000)
EM = 1000
WIN_ASC = 1020
WIN_DESC = 300
CELL_UNITS = WIN_ASC + WIN_DESC  # 1320 : one terminal line

CELL_H = 54                       # px per cell (row height)
# size the font so the win-cell maps to CELL_H px
FONT_PX = int(round(CELL_H * EM / CELL_UNITS))
font = ImageFont.truetype(FONT, FONT_PX)
cw = int(round(font.getlength("0")))                 # monospace advance, px
baseline = int(round(CELL_H * WIN_ASC / CELL_UNITS))  # baseline from cell top

frame = json.load(open(os.path.join(ROOT, "frame.json")))
cols, rows = frame["cols"], frame["rows"]
W, H = cw * cols, CELL_H * rows
img = Image.new("RGBA", (W, H), (0, 0, 0, 0))

# Block-drawing chars: a real terminal tiles these to fill the whole cell, but
# PIL draws the glyph ink (often < cell width), leaving seams. Fill them as
# solid rects instead so half-block sprites come out seamless.
BLOCK_RECTS = {
    "█": (0.0, 0.0, 1.0, 1.0),
    "▀": (0.0, 0.0, 1.0, 0.5),
    "▄": (0.0, 0.5, 1.0, 1.0),
    "▌": (0.0, 0.0, 0.5, 1.0),
    "▐": (0.5, 0.0, 1.0, 1.0),
}

def draw_cell(ch, fg, bg):
    """Render one character clipped to a single cell tile."""
    tile = Image.new("RGBA", (cw, CELL_H), bg if bg[3] else (0, 0, 0, 0))
    d = ImageDraw.Draw(tile)
    rect = BLOCK_RECTS.get(ch)
    if rect:
        x0, y0, x1, y1 = rect
        d.rectangle([x0 * cw, y0 * CELL_H, x1 * cw, y1 * CELL_H], fill=fg)
    else:
        d.text((0, baseline), ch, font=font, fill=fg, anchor="ls")
    return tile

for ri, line in enumerate(frame["lines"]):
    x = 0
    for span in line:
        fg = tuple(span["fg"])
        bg = tuple(span["bg"])
        for ch in span["text"]:
            tile = draw_cell(ch, fg, bg)
            img.alpha_composite(tile, (x * cw, ri * CELL_H))
            x += 1

# trim fully transparent margins, then pad a little
bbox = img.getbbox()
if bbox:
    img = img.crop(bbox)
pad = 28
out = Image.new("RGBA", (img.width + pad * 2, img.height + pad * 2), (0, 0, 0, 0))
out.alpha_composite(img, (pad, pad))
OUT_DIR = os.path.join(ROOT, "renders")
os.makedirs(OUT_DIR, exist_ok=True)
out.save(os.path.join(OUT_DIR, "cougarcs-tui.png"))
print(f"wrote renders/cougarcs-tui.png ({out.width}x{out.height})")
