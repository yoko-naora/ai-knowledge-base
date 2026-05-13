"""Generate a hero collage from prompt images — 2172×724, matching the user photo dimensions."""
import random, os, glob
from PIL import Image

IMG_DIR = r"C:\Users\jding\kb-site\prompts\images"
OUT = r"C:\Users\jding\kb-site\hero-collage.png"
TARGET_W, TARGET_H = 2172, 724
COLS, ROWS = 4, 2
GAP = 4

# Gather image paths
paths = glob.glob(os.path.join(IMG_DIR, "*.*"))
valid = []
for p in paths:
    ext = os.path.splitext(p)[1].lower()
    if ext in (".jpg", ".jpeg", ".png", ".webp"):
        valid.append(p)

if len(valid) < COLS * ROWS:
    raise RuntimeError(f"Need at least {COLS*ROWS} images, found {len(valid)}")

# Pick diverse images (avoid clustering from same author)
random.seed(42)
random.shuffle(valid)
picked = valid[:COLS * ROWS]

# Cell dimensions
cell_w = (TARGET_W - GAP * (COLS + 1)) // COLS
cell_h = (TARGET_H - GAP * (ROWS + 1)) // ROWS

canvas = Image.new("RGB", (TARGET_W, TARGET_H), (26, 24, 20))  # --ink color bg

for idx, path in enumerate(picked):
    row = idx // COLS
    col = idx % COLS
    x = GAP + col * (cell_w + GAP)
    y = GAP + row * (cell_h + GAP)

    img = Image.open(path).convert("RGB")
    # Crop to cell aspect ratio from center
    target_ratio = cell_w / cell_h
    img_ratio = img.width / img.height
    if img_ratio > target_ratio:
        new_w = int(img.height * target_ratio)
        left = (img.width - new_w) // 2
        img = img.crop((left, 0, left + new_w, img.height))
    else:
        new_h = int(img.width / target_ratio)
        top = (img.height - new_h) // 2
        img = img.crop((0, top, img.width, top + new_h))

    img = img.resize((cell_w, cell_h), Image.LANCZOS)

    # Subtle rounded corner via paste mask (skip for simplicity — sharp edges fit the design)
    canvas.paste(img, (x, y))

canvas.save(OUT, "PNG", optimize=True)
# Also save a compressed WebP-like quality JPEG
import io
buf = io.BytesIO()
canvas.save(buf, "JPEG", quality=75, optimize=True)
with open(OUT.replace(".png", ".jpg"), "wb") as f:
    f.write(buf.getvalue())
sz_kb = len(buf.getvalue()) / 1024
print(f"Saved {OUT}  ({TARGET_W}×{TARGET_H})")
print(f"Saved hero-collage.jpg  ({TARGET_W}×{TARGET_H}, {sz_kb:.0f} KB)")
