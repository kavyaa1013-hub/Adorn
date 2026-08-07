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

Dark charcoal marble. The ground is `--marble` (`#2a2e34`), cool and faintly blue-biased, carrying
low-contrast veining and a broad tonal drift so it reads as stone rather than flat paint;
`--marble-alt` bands the alternating sections. Cards and panels sit on `--surface` / `--surface-2`,
divided by `--line` / `--line-strong` rather than borders mixed by hand. Type is `--ink` on
`--ink-soft`, and gold `#cda449` carries the accents — it glows against charcoal, so it needs less
of it than the old pale palette did. Navy `#1b2a4a` still bands the feature strip, newsletter and
footer, reading distinctly bluer than the marble. Cormorant Garamond for headings, Jost for body.
All tokens are custom properties at the top of `css/style.css` — change them there, not at call
sites.

Two traps this theme sets:

- `--ink-soft` is a *light* grey. Any element that keeps a near-white ground (the `.tag` and
  `.shop-status` pills, `.pm-close`) needs dark text — use `--navy` there, not `--ink-soft`.
- Decorative grounds are pale strokes on a dark base. A fill mixed from the old cream palette
  will glare; mix against `--surface` instead.

## Products

Each product is a `.shop-card` article in `index.html`. The cart and filters read only its
data attributes: `data-id`, `data-name`, `data-price` (integer rupees), `data-category`
(`bedsheets` | `carpets`). Photos resolve by convention from `data-id`:
`assets/products/<data-id>.jpg`. A missing photo is removed by `main.js` and the CSS weave
pattern underneath shows instead — never a broken image.

The **Onyx Black Bedsheet Set** is the only product with a confirmed price, so it is the only
one that can go in the bag. The four **Damas** colourways are real and photographed but priced
`data-placeholder` until the owner supplies figures — they show "Price on request" and route to
the enquiry form, and carry no "Coming soon" pill since they are not forthcoming, just unpriced.
Their photos are supplier catalogue shots still carrying another company's branding; see
`assets/products/README.md`.

Otherwise: The other cards are slots the
owner asked for, marked `data-placeholder`: they carry no price, show "Coming soon" and "Price on
request", and route to the enquiry form instead of the cart. Turn one into a real product by
filling in `data-name`/`data-price`, dropping a photo at `assets/products/<data-id>.jpg`, swapping
the Enquire button for `<button class="btn-cart" data-add>Add to Bag</button>`, and deleting the
`data-placeholder` attribute.

Never invent a price, and never give a placeholder one — ask the owner.

The shop opens on a chooser of two ranges — Bed Sheets and Carpets — and picking
one swaps in just that range's cards. `main.js` derives everything from the cards themselves: each
tile's count line, an empty state for a range with nothing in it, and a narrower centred grid when
a range holds one or two pieces. So adding a product is a matter of editing `index.html` alone.

A `data-shop-open` trigger may name a range (`data-shop-open="carpets"`) to jump straight into it;
without a value it opens the chooser.

Copy elsewhere on the page is still placeholder marketing text the owner has not confirmed —
the hero and story statistics, the testimonials, and the colour-swatch names in the Bed Sheets
and Carpets sections.

## Visual work

There are no product photos for most of the range, so visuals are drawn in CSS. Each range has
its own set, and a card picks one by class: `.weave-1`–`8` for bed linen and `.rug-1`–`5` for
carpets. `.pattern-*` covers the larger section grounds. Keep it that way rather than reaching
for stock imagery.

Build these from gradients that actually tile. `repeating-conic-gradient` and
`repeating-radial-gradient` fan out from a single point, so they render as one wedge or one set of
rings across the card rather than a motif — use `background-size` with a plain `radial-gradient`
for dot and leaf fields instead.
