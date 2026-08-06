# Adorn — working notes

Static marketing site + shop for a handloom business (bed sheets, carpets, home textiles).
Plain HTML/CSS/JS, no build step, no framework, no package manager.

## Publish a preview after every change

The owner wants to *see* each change, not read about it. After any edit that alters the page,
rebuild and republish the live preview before replying:

```bash
python3 tools/build-preview.py <scratchpad>/adorn-preview.html
```

Then publish that file with the Artifact tool. **Always republish the same file path** so the
preview keeps its existing URL — the owner returns to the same link.

`tools/build-preview.py` folds the stylesheet, script, webfonts and product photos into one
self-contained page, because the preview host enforces a strict CSP (no external assets, no
relative paths). `tools/fonts-inline.css` is generated — Cormorant Garamond and Jost as woff2
data URIs. The live site itself still loads those fonts from Google Fonts normally.

## Layout

```
index.html               All markup, single page
css/style.css            Palette, type, layout, animation
js/main.js               Intro animation, nav, reveals, shop, cart, forms
assets/products/         Product photos (see the README in there)
tools/build-preview.py   Bundles the preview
```

## Palette and type

White/pastel grounds (`--ivory`, `--pastel-blue`, `--pastel-rose`) with dark navy `#1b2a4a` and
gold `#cda449` from the logo. Cormorant Garamond for headings, Jost for body. All tokens are
custom properties at the top of `css/style.css` — change them there, not at call sites.

## Products

Each product is a `.shop-card` article in `index.html`. The cart and filters read only its
data attributes: `data-id`, `data-name`, `data-price` (integer rupees), `data-category`
(`bedsheets` | `carpets` | `cushions`). Photos resolve by convention from `data-id`:
`assets/products/<data-id>.jpg`. A missing photo is removed by `main.js` and the CSS weave
pattern underneath shows instead — never a broken image.

**Every product in the shop is real.** The eight invented placeholders were removed once the
owner supplied a genuine product — do not reintroduce filler products with invented prices.

Never invent a price. Ask the owner.

`main.js` adapts the shop to however many products exist: category chips hide when that category
is empty, the whole filter bar hides when only one category is represented, and a range of one or
two pieces is centred rather than stranded across four columns. So adding or removing a product
is a matter of editing `index.html` alone.

Copy elsewhere on the page is still placeholder marketing text the owner has not confirmed —
the hero and story statistics, the testimonials, and the colour-swatch names in the Bed Sheets
and Carpets sections.

## Visual work

There are no product photos for most of the range, so visuals are drawn in CSS (`.weave-*`,
`.pattern-*`). Keep it that way rather than reaching for stock imagery.
