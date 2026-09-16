# -*- coding: utf-8 -*-
"""
Bild-Pipeline für die Galabau-Böttcher-Website.

Erzeugt aus den Originalen in content/originale/ optimierte Web-Bilder
in assets/img/ (AVIF + WebP + JPEG-Fallback, mehrere Breiten, quadratische
Instagram-Kacheln), bereitet das Logo auf (Motiv-Zuschnitt) und generiert
Favicons sowie das Open-Graph-Bild.

Aufruf aus dem Projektstamm:  python tools/optimize-images.py
Benötigt: Pillow >= 11 (mit AVIF/WebP-Support)
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "content" / "originale"
OUT = ROOT / "assets" / "img"
OUT.mkdir(parents=True, exist_ok=True)

# Markenfarben (aus dem Logo extrahiert)
FOREST = (26, 58, 45)        # #1A3A2D
FOREST_DEEP = (18, 41, 31)   # #12291F
LIME = (151, 171, 41)        # #97AB29
PETROL = (37, 75, 102)       # #254B66
CREAM = (236, 239, 213)      # #ECEFD5

# Quellfotos -> URL-taugliche Namen
PHOTOS = {
    "1.jpg": "dachpflege",
    "ZAUNBAU1.jpg": "zaunbau",
    "termin sichern.jpg": "zaun-anfrage",
    "rueckbau-nebengebaeude.jpg": "abriss-rueckbau",
    "pflaster-wegebau-neu.png": "pflaster-wegebau",
    "erd-baggerarbeiten-neu.jpg": "erd-baggerarbeiten",
    "entwaesserung-sanierung-neu.jpg": "entwaesserung-sanierung",
    "abriss-rueckbau-neu.jpg": "abriss-rueckbau-neu",
    "gruenpflege-neu.jpg": "gruenpflege",
    "vorher-nachher-vorher.jpg": "vorher",
    "vorher-nachher-nachher.jpg": "nachher",
    # Zweiter Vorher/Nachher-Vergleich (Import aus Desktop "für claude": 1.jpeg / 3.jpeg).
    # Beide Originale sind 3:4 - gleiche Ausgabegroessen, dadurch deckungsgleiche Ausschnitte.
    "vorher-nachher-2-vorher.jpg": "vorher-2",
    "vorher-nachher-2-nachher.jpg": "nachher-2",
}
WIDTHS = [480, 800, 1200]
SQUARE = 600
# Nur diese Motive brauchen quadratische Kacheln (Instagram-Grid)
SQUARE_SLUGS = {"dachpflege", "zaunbau", "zaun-anfrage", "abriss-rueckbau"}
# Fotos ohne EXIF-Flag, die physisch gedreht vorliegen (Wert = Pillow-Transpose)
# Hinweis: gruenpflege-neu.jpg stand hier faelschlich mit ROTATE_270 und wurde
# dadurch um 90 Grad gekippt ausgeliefert. Das Original liegt bereits korrekt
# im Hochformat vor und braucht keine manuelle Drehung.
ROTATE: dict[str, Image.Transpose] = {}

report = []


def load(name: str) -> Image.Image:
    im = Image.open(SRC / name)
    im = ImageOps.exif_transpose(im)  # EXIF-Drehung einbrennen
    if name in ROTATE:
        im = im.transpose(ROTATE[name])  # manuelle Drehung, falls kein EXIF-Flag
    return im.convert("RGB")


def save_all(im: Image.Image, stem: str) -> None:
    im.save(OUT / f"{stem}.avif", "AVIF", quality=55)
    im.save(OUT / f"{stem}.webp", "WEBP", quality=74, method=6)
    im.save(OUT / f"{stem}.jpg", "JPEG", quality=80, optimize=True, progressive=True)
    kb = (OUT / f"{stem}.avif").stat().st_size // 1024
    report.append(f"  {stem}.(avif|webp|jpg)  {im.width}x{im.height}  (avif {kb} KB)")


def responsive(name: str, slug: str) -> None:
    im = load(name)
    report.append(f"{name}  ->  {slug}  (Original {im.width}x{im.height})")
    for w in WIDTHS:
        h = round(im.height * w / im.width)
        save_all(im.resize((w, h), Image.LANCZOS), f"{slug}-{w}")
    # Quadratische Kachel (Instagram-Grid), Mittenausschnitt
    if slug in SQUARE_SLUGS:
        s = min(im.size)
        left, top = (im.width - s) // 2, (im.height - s) // 2
        sq = im.crop((left, top, left + s, top + s)).resize((SQUARE, SQUARE), Image.LANCZOS)
        save_all(sq, f"{slug}-sq-{SQUARE}")


# Instagram-Posts mit eingebranntem Werbetext: Schriftzug oben, Claim bzw.
# Logo-Wasserzeichen unten. Dazwischen liegt jeweils ein textfreies Band mit
# dem eigentlichen Motiv - genau das wird fuer die Website ausgeschnitten.
# (left, top, right, bottom) als Anteil der Bildkanten.
# Ersetzen, sobald die Originalfotos ohne Overlay vorliegen.
INSTA_CROPS = {
    # Datei, Ziel-Slug, Ausschnitt, Ausgabebreiten
    ("termin sichern.jpg", "zaunbau-clean"): ((0.08, 0.32, 0.70, 0.68), (480, 800)),
    ("ZAUNBAU1.jpg", "zaunbau-dsm"): ((0.00, 0.495, 0.55, 0.855), (480, 800, 1200)),
    ("1.jpg", "dachpflege-clean"): ((0.02, 0.30, 0.80, 0.82), (480, 800, 1200)),
}


def insta_crops() -> None:
    for (name, slug), (box, breiten) in INSTA_CROPS.items():
        im = load(name)
        l, o, r, u = box
        im = im.crop((round(im.width * l), round(im.height * o),
                      round(im.width * r), round(im.height * u)))
        report.append(f"{name}  ->  {slug}  (textfreier Ausschnitt {im.width}x{im.height})")
        for w in breiten:
            h = round(im.height * w / im.width)
            save_all(im.resize((w, h), Image.LANCZOS), f"{slug}-{w}")


def logo() -> tuple[Image.Image, tuple[int, int, int]]:
    im = load("logo.png.jpeg")
    if im.height > im.width:  # Sicherheitsnetz, falls EXIF fehlt
        im = im.rotate(-90, expand=True)
    report.append(f"logo.png.jpeg  ->  {im.width}x{im.height} nach EXIF-Korrektur")
    bg = im.getpixel((20, 20))  # exakter Hintergrundton für OG-Bild

    # Motiv-Zuschnitt (Kreise + Swoosh), relativ zu 1600x800 vermessen
    box = (
        round(im.width * 0.2656), round(im.height * 0.200),
        round(im.width * 0.7344), round(im.height * 0.669),
    )
    mark = im.crop(box)
    # Grosse Variante fuer den Markenblock im Hero: Originalausschnitt in
    # voller Aufloesung, weder skaliert noch bearbeitet.
    mark.save(OUT / "logo-mark-hd.webp", "WEBP", quality=92, method=6)
    report.append(f"  logo-mark-hd.webp  {mark.width}x{mark.height} (unskaliert)")
    mark = mark.resize((640, round(mark.height * 640 / mark.width)), Image.LANCZOS)
    mark.save(OUT / "logo-mark.png", "PNG", optimize=True)
    mark.save(OUT / "logo-mark.webp", "WEBP", quality=88, method=6)
    report.append(f"  logo-mark.png/webp  {mark.width}x{mark.height}")

    # Header-Variante: wird mit 82x41 CSS-Pixeln dargestellt, 200px Breite deckt
    # auch 2x-Displays ab. Spart im kritischen Ladepfad gegenueber logo-mark.webp.
    small = mark.resize((200, round(mark.height * 200 / mark.width)), Image.LANCZOS)
    small.save(OUT / "logo-mark-200.webp", "WEBP", quality=88, method=6)
    report.append(f"  logo-mark-200.webp  {small.width}x{small.height}")

    # Komplettes Banner als Referenz
    full = im.resize((1200, round(im.height * 1200 / im.width)), Image.LANCZOS)
    full.save(OUT / "logo-full-1200.jpg", "JPEG", quality=85, optimize=True)
    report.append(f"  logo-full-1200.jpg  {full.width}x{full.height}")
    return mark, bg


def favicons() -> None:
    """Vereinfachtes Signet: drei Kreise auf abgerundetem Waldgrün-Quadrat."""
    S = 1024
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((0, 0, S, S), radius=int(S * 0.22), fill=FOREST + (255,))

    def circle(cx: float, r: float, color) -> None:
        d.ellipse((S * cx - r, S * 0.46 - r, S * cx + r, S * 0.46 + r), fill=color + (255,))

    circle(0.28, S * 0.135, LIME)
    circle(0.72, S * 0.135, LIME)
    circle(0.50, S * 0.165, PETROL)
    # Swoosh-Linie
    d.rounded_rectangle((S * 0.26, S * 0.72, S * 0.74, S * 0.745), radius=int(S * 0.0125), fill=LIME + (255,))

    for size, name in ((32, "favicon-32.png"), (192, "favicon-192.png"), (180, "apple-touch-icon.png")):
        img.resize((size, size), Image.LANCZOS).save(OUT / name, "PNG", optimize=True)
    # Klassisches favicon.ico im Stamm (16/32/48)
    ico = img.resize((48, 48), Image.LANCZOS)
    ico.save(ROOT / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    report.append("  favicon-32/192, apple-touch-icon, favicon.ico")


def og_image(mark: Image.Image, bg: tuple[int, int, int]) -> None:
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), bg)
    d = ImageDraw.Draw(img)

    m = mark.resize((460, round(mark.height * 460 / mark.width)), Image.LANCZOS)
    img.paste(m, ((W - m.width) // 2, 92))

    def font(px: int, weight: int) -> ImageFont.FreeTypeFont:
        f = ImageFont.truetype(str(ROOT / "tools" / "Manrope-var.ttf"), px)
        try:
            f.set_variation_by_axes([weight])
        except Exception:
            pass
        return f

    d.line((W / 2 - 90, 388, W / 2 + 90, 388), fill=LIME, width=4)
    d.text((W / 2, 452), "Garten- & Landschaftsbau Böttcher",
           font=font(56, 800), fill=CREAM, anchor="mm")
    d.text((W / 2, 522), "Pflaster · Zaunbau · Erdarbeiten · Grünpflege — Kyffhäuserkreis",
           font=font(28, 500), fill=(198, 215, 122), anchor="mm")
    img.save(OUT / "og-image.jpg", "JPEG", quality=86, optimize=True, progressive=True)
    report.append(f"  og-image.jpg  {W}x{H}")


def main() -> None:
    mark, bg = logo()
    for name, slug in PHOTOS.items():
        responsive(name, slug)
    insta_crops()
    favicons()
    og_image(mark, bg)
    print("\n".join(report))
    print(f"\nFertig. Ausgaben in {OUT}")


if __name__ == "__main__":
    main()
