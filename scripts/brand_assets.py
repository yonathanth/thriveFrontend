"""
Builds the site's brand images.

  python scripts/brand_assets.py icons [path/to/logo.png]
      Favicons, PWA icons, apple-touch icon, the social share image (og-image.png)
      and public/logo.png, from the logo. Without a path, uses public/logo-source.png,
      or draws a text placeholder if that is missing too.

  python scripts/brand_assets.py placeholders
      Placeholder photos under public/images/ (hero, facilities, story, staff).
      Each is labelled with its file name and size, so it is obvious what to replace.
      Existing files are left alone unless --force is given.

Needs Pillow (pip install pillow).
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"

PRIMARY = (59, 140, 255)  # #3B8CFF, the site accent (blue theme)
BLACK = (0, 0, 0)
SURFACE = (20, 22, 15)
NAME = "THRIVE GYM"


def font(size: int, bold: bool = True) -> ImageFont.ImageFont:
    candidates = (
        ["arialbd.ttf", "Arial Bold.ttf", "DejaVuSans-Bold.ttf"]
        if bold
        else ["arial.ttf", "Arial.ttf", "DejaVuSans.ttf"]
    )
    for name in candidates:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def centered(draw: ImageDraw.ImageDraw, box, text, fnt, fill):
    x0, y0, x1, y1 = box
    l, t, r, b = draw.textbbox((0, 0), text, font=fnt)
    draw.text((x0 + (x1 - x0 - (r - l)) / 2 - l, y0 + (y1 - y0 - (b - t)) / 2 - t), text, font=fnt, fill=fill)


# --------------------------------------------------------------------------- logo / icons

def placeholder_logo(size=1024) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, size, size], fill=BLACK + (255,))
    pad = size // 10
    d.rectangle([pad, pad, size - pad, size - pad], outline=PRIMARY, width=size // 28)
    centered(d, (0, 0, size, size * 0.78), "T", font(int(size * 0.55)), PRIMARY)
    centered(d, (0, size * 0.62, size, size * 0.86), "THRIVE", font(int(size * 0.12)), (255, 255, 255))
    return img


def load_logo(path: Path | None) -> Image.Image:
    if path and path.exists():
        return Image.open(path).convert("RGBA")
    src = PUBLIC / "logo-source.png"
    if src.exists():
        return Image.open(src).convert("RGBA")
    print("No logo given; using a text placeholder. Re-run with the real logo later.")
    return placeholder_logo()


def trim(img: Image.Image) -> Image.Image:
    box = img.getbbox()
    return img.crop(box) if box else img


def square_icon(logo: Image.Image, size: int, bg=(255, 255, 255), pad_ratio=0.12) -> Image.Image:
    """The logo centred on a square, for favicons and app icons. White suits this logo."""
    canvas = Image.new("RGBA", (size, size), bg + (255,))
    inner = int(size * (1 - 2 * pad_ratio))
    mark = trim(logo).copy()
    mark.thumbnail((inner, inner), Image.LANCZOS)
    canvas.alpha_composite(mark, ((size - mark.width) // 2, (size - mark.height) // 2))
    return canvas


def og_image(logo: Image.Image) -> Image.Image:
    """1200x630 social share card: the logo over a darkened gym photo, plus hours and place."""
    w, h = 1200, 630
    img = Image.new("RGBA", (w, h), BLACK + (255,))
    photo_path = PUBLIC / "images" / "hero.jpg"
    if photo_path.exists():
        from PIL import ImageOps, ImageEnhance
        photo = ImageOps.fit(Image.open(photo_path).convert("RGB"), (w, h), Image.LANCZOS)
        photo = ImageEnhance.Brightness(photo).enhance(0.45)
        img.paste(photo.convert("RGBA"), (0, 0))
    # Darken towards the bottom so the text reads.
    shade = Image.new("L", (1, h))
    for y in range(h):
        shade.putpixel((0, y), int(40 + 170 * (y / h) ** 1.4))
    img.alpha_composite(Image.merge("RGBA", (
        Image.new("L", (w, h), 0), Image.new("L", (w, h), 0), Image.new("L", (w, h), 0),
        shade.resize((w, h)),
    )))

    mark = trim(logo).copy()
    mark.thumbnail((640, 300), Image.LANCZOS)
    img.alpha_composite(mark, ((w - mark.width) // 2, 70))

    d = ImageDraw.Draw(img)
    centered(d, (0, 400, w, 470), "Community-focused gym in Haile Garment, Addis Ababa", font(34), (255, 255, 255))
    centered(d, (0, 470, w, 520), "Open every day  ·  6 AM – 9 PM  ·  091 070 4845", font(26, bold=False), (200, 200, 200))
    d.rectangle([0, h - 16, w, h], fill=PRIMARY)
    return img


def build_icons(path: Path | None):
    logo = load_logo(path)
    fav = PUBLIC / "favicon"
    fav.mkdir(parents=True, exist_ok=True)

    # Display copy of the logo: big enough for retina screens, small enough to load fast.
    display = trim(logo).copy()
    display.thumbnail((640, 640), Image.LANCZOS)
    display.save(PUBLIC / "logo.png", optimize=True)
    for size, name in [
        (16, "favicon-16x16.png"),
        (32, "favicon-32x32.png"),
        (180, "apple-touch-icon.png"),
        (192, "android-chrome-192x192.png"),
        (512, "android-chrome-512x512.png"),
    ]:
        square_icon(logo, size, pad_ratio=0.03 if size <= 32 else 0.1).convert("RGB").save(fav / name)
    # Maskable icon: content inside the 80% safe zone.
    square_icon(logo, 512, pad_ratio=0.2).convert("RGB").save(fav / "maskable-512x512.png")

    ico = square_icon(logo, 256, pad_ratio=0.03).convert("RGBA")
    ico.save(fav / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    ico.save(ROOT / "app" / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])

    og_image(logo).convert("RGB").save(PUBLIC / "og-image.png", optimize=True)
    print("Icons, logo.png and og-image.png written.")


# --------------------------------------------------------------------------- placeholders

PLACEHOLDERS = [
    ("hero.jpg", 1920, 1080, "HOME HERO PHOTO"),
    ("page-hero.jpg", 1920, 1080, "PAGE HERO PHOTO"),
    ("facility-1.jpg", 900, 1200, "FACILITY PHOTO 1"),
    ("facility-2.jpg", 900, 1200, "FACILITY PHOTO 2"),
    ("facility-3.jpg", 900, 1200, "FACILITY PHOTO 3"),
    ("facility-4.jpg", 900, 1200, "FACILITY PHOTO 4"),
    ("story.jpg", 1600, 900, "OUR STORY PHOTO"),
    ("staff-1.jpg", 600, 800, "STAFF PHOTO 1"),
    ("staff-2.jpg", 600, 800, "STAFF PHOTO 2"),
    ("staff-3.jpg", 600, 800, "STAFF PHOTO 3"),
    ("staff-4.jpg", 600, 800, "STAFF PHOTO 4"),
]


def placeholder(w: int, h: int, label: str, filename: str) -> Image.Image:
    """A moody black-and-white stand-in: a soft light falling across dark, with grain,
    so the page reads like the real design until a photo replaces it."""
    import random

    rnd = random.Random(filename)
    # Light source position varies per file so the set does not look identical.
    lx, ly = w * rnd.uniform(0.25, 0.75), h * rnd.uniform(0.1, 0.4)
    reach = max(w, h) * rnd.uniform(0.7, 1.0)

    small = Image.new("L", (max(1, w // 8), max(1, h // 8)))
    sp = small.load()
    sw, sh = small.size
    for y in range(sh):
        for x in range(sw):
            dx, dy = (x * 8 - lx) / reach, (y * 8 - ly) / reach
            d = (dx * dx + dy * dy) ** 0.5
            v = max(0.0, 1.0 - d) ** 1.8
            sp[x, y] = int(14 + 110 * v)
    img = small.resize((w, h), Image.BICUBIC)

    grain = Image.effect_noise((w, h), 18).point(lambda v: v - 128 + 128)
    img = Image.blend(img, grain, 0.06)

    d = ImageDraw.Draw(img)
    mono = font(max(12, w // 70), bold=False)
    pad = max(16, w // 40)
    text = f"PLACEHOLDER  /  {filename}  /  {w}x{h}"
    _, t, _, b = d.textbbox((0, 0), text, font=mono)
    d.text((pad, h - pad - (b - t)), text, font=mono, fill=110)
    return img.convert("RGB")


def build_placeholders(force: bool):
    out = PUBLIC / "images"
    out.mkdir(parents=True, exist_ok=True)
    for filename, w, h, label in PLACEHOLDERS:
        target = out / filename
        if target.exists() and not force:
            continue
        placeholder(w, h, label, filename).save(target, quality=82, optimize=True)
        print("wrote", target.relative_to(ROOT))


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args or args[0] not in ("icons", "placeholders"):
        print(__doc__)
        sys.exit(1)
    if args[0] == "icons":
        build_icons(Path(args[1]) if len(args) > 1 else None)
    else:
        build_placeholders("--force" in args)
