#!/usr/bin/env python3
"""Package the site as a zip that can be uploaded to any web host.

Everything the pages actually need, and nothing else — no repo scaffolding, no
parked experiments, no build tooling. Unzip it and the contents of the folder are
what goes in the host's public directory.

Usage:  python3 tools/build-release.py [output.zip]
"""

import os
import re
import shutil
import sys
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FOLDER = "adorn-website"
DEFAULT_OUT = os.path.join(ROOT, "dist", FOLDER + ".zip")

# Only these ship. api/ and docs/ hold the parked Razorpay work, which nothing on
# the site calls; tools/ builds the preview and this zip. None of it belongs on a
# web host, and shipping it would only invite someone to upload a stray .js file
# to a server that cannot run it.
FILES = ["index.html", "css/style.css", "js/main.js", "assets/upi-qr.png"]
TREES = ["assets/products"]


def collect():
    """Every path that goes in the zip, checked to exist before we build."""
    paths = []
    for rel in FILES:
        full = os.path.join(ROOT, rel)
        if not os.path.exists(full):
            raise SystemExit("missing %s — refusing to ship an incomplete site" % rel)
        paths.append(rel)

    for tree in TREES:
        full = os.path.join(ROOT, tree)
        for name in sorted(os.listdir(full)):
            if name.startswith("."):
                continue
            paths.append(tree + "/" + name)
    return paths


def check_references(paths):
    """Every asset the markup and script point at must be in the zip.

    The whole promise of this file is that the download works when unzipped, so a
    reference to a file we did not pack is a build failure, not a warning.
    """
    shipped = set(paths)
    sources = {rel: open(os.path.join(ROOT, rel), encoding="utf-8").read()
               for rel in ("index.html", "js/main.js", "css/style.css")}

    # A real reference is a path ending in a file extension. Prose in the comments
    # mentions these folders too ("assets/products/<id>.jpg", "js/main.js."), so
    # matching a bare prefix flags sentences as broken links.
    ref_pattern = re.compile(
        r"(?:assets|css|js)/[A-Za-z0-9._/-]+\.(?:jpg|jpeg|png|webp|svg|css|js)")

    missing = []
    for rel, text in sources.items():
        for ref in ref_pattern.findall(text):
            if ref not in shipped:
                missing.append("%s → %s" % (rel, ref))

    if missing:
        raise SystemExit("these are referenced but would not be in the zip:\n  " +
                         "\n  ".join(sorted(set(missing))))


def build():
    paths = collect()
    check_references(paths)

    out = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_OUT
    os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
    if os.path.exists(out):
        os.remove(out)

    readme = os.path.join(ROOT, "tools", "release-readme.txt")

    total = 0
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.write(readme, FOLDER + "/README.txt")
        for rel in paths:
            zf.write(os.path.join(ROOT, rel), FOLDER + "/" + rel)
            total += os.path.getsize(os.path.join(ROOT, rel))

    print("files packed:  %d" % (len(paths) + 1))
    print("uncompressed:  %.2f MB" % (total / 1024 / 1024))
    print("zip size:      %.2f MB" % (os.path.getsize(out) / 1024 / 1024))
    print("written to:    %s" % out)
    return out


def unpack_for_test(dest):
    """Unzip a fresh build into dest, so tests run against the shipped bytes."""
    out = build()
    if os.path.exists(dest):
        shutil.rmtree(dest)
    os.makedirs(dest)
    with zipfile.ZipFile(out) as zf:
        zf.extractall(dest)
    return os.path.join(dest, FOLDER)


if __name__ == "__main__":
    build()
