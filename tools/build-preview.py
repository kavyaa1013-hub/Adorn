#!/usr/bin/env python3
"""Bundle the site into one self-contained file for publishing as a live preview.

The preview host serves a single page with a strict CSP: no external stylesheets,
fonts, scripts or images, and no relative asset paths. So everything the page needs
gets folded inline — the stylesheet, the script, the webfonts, and every product
photo as a data URI.

Usage:  python3 tools/build-preview.py [output.html]
"""

import base64
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_OUT = os.path.join(ROOT, "preview", "adorn-preview.html")

TITLE = "Adorn — Handloom Bed Sheets &amp; Carpets (Live Preview)"

MIME = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}


def read(*parts):
    with open(os.path.join(ROOT, *parts), encoding="utf-8") as fh:
        return fh.read()


def build():
    html = read("index.html")
    css = read("css", "style.css")
    js = read("js", "main.js")
    fonts = read("tools", "fonts-inline.css")

    match = re.search(r"<body>(.*)</body>", html, re.S)
    if not match:
        raise SystemExit("could not find <body> in index.html")
    body = match.group(1)

    # The script is inlined at the end instead of linked.
    body = body.replace('<script src="js/main.js"></script>', "")

    # Fold in product photos. Any product without a file keeps its relative path,
    # fails to load in the preview, and main.js falls back to the woven pattern —
    # exactly what the real site does.
    photo_dir = os.path.join(ROOT, "assets", "products")
    inlined = 0
    for name in sorted(os.listdir(photo_dir)):
        ext = os.path.splitext(name)[1].lower()
        if ext not in MIME:
            continue
        rel = "assets/products/" + name
        if rel not in body:
            continue
        with open(os.path.join(photo_dir, name), "rb") as fh:
            data = base64.b64encode(fh.read()).decode()
        body = body.replace(rel, "data:%s;base64,%s" % (MIME[ext], data))
        inlined += 1

    # The host supplies the document skeleton, so the markup must not carry its own.
    # Only the markup is checked — the same character sequences inside a CSS or JS
    # comment are inert, and tripping on those would be a false alarm.
    for tag in ("<html", "<head>", "<body", "</body>", "</html>"):
        if tag in body:
            raise SystemExit("preview markup must not contain %s — the host supplies it" % tag)

    # The checkout builds the UPI QR from JavaScript, so its path is in the script
    # rather than the markup — it has to be folded in there or the preview shows no QR.
    qr = os.path.join(ROOT, "assets", "upi-qr.png")
    if "assets/upi-qr.png" in js:
        if os.path.exists(qr):
            with open(qr, "rb") as fh:
                js = js.replace(
                    "assets/upi-qr.png",
                    "data:image/png;base64," + base64.b64encode(fh.read()).decode(),
                )
            inlined += 1
        else:
            print("note: no assets/upi-qr.png — the checkout will show no QR")

    page = "<title>%s</title>\n<style>\n%s\n%s\n</style>\n%s\n<script>\n%s\n</script>\n" % (
        TITLE, fonts, css, body, js
    )

    out = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_OUT
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as fh:
        fh.write(page)

    missing = body.count("assets/products/")
    print("photos inlined:   %d" % inlined)
    print("awaiting photos:  %d (these fall back to woven patterns)" % missing)
    print("size:             %.2f MB" % (len(page.encode()) / 1024 / 1024))
    print("written to:       %s" % out)
    return out


if __name__ == "__main__":
    build()
