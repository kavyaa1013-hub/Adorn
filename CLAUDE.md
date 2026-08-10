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
js/main.js               Intro animation, reveals, shop, cart, forms
assets/products/         Product photos (see the README in there)
tools/build-preview.py   Bundles the preview
```

## Payment

UPI, no gateway and no server. The customer pays from their own UPI app and sends the order
through with the reference; the owner matches it by hand before dispatch.

**Set `ADORN_PAYMENT` at the top of `js/main.js`** — `upiId`, `whatsapp` (country code, no `+`)
and `orderEmail`. Until `upiId` is filled in, the checkout says payment is not set up rather than
showing a placeholder someone might actually pay; that guard is deliberate, do not swap it for a
dummy UPI ID. `assets/upi-qr.png` is shown if present and silently dropped if not, the same way
product photos work.

The panel is rendered from `window.ADORN_PAYMENT` at render time, not captured at load, so the
details can be filled in without touching anything else.

## Three pages, one file

`index.html` holds all three and `main.js` swaps between them — nothing is scrolled past, each
view comes off the document:

- **Landing** (`#landing`) — the wordmark, a line of copy and **Shop Now**, and nothing else. No
  nav, and measured scroll overflow is 0px. `#shop`, `#contact` and the footer all carry `hidden`.
- **Shop** (`#shop`) — `showShop()` hides the landing, reveals the shop, contact form and footer,
  and scrolls to the top. `showLanding()` reverses it, and the logo (`#homeLink`) calls it.
- **Checkout** (`#checkout`) — `showCheckout()`, reached from the bag. Delivery details, the order
  summary and the UPI panel. Validates name, 10-digit phone, email, address, 6-digit PIN and the
  UPI reference, then hands the whole order to WhatsApp (or email) prefilled.

All three push history, so Back and Forward move between them and `#shop` is a shareable link that
opens straight into the store. A fresh load on `#checkout` goes to the shop instead — the bag does
not survive a refresh, so there would be nothing to pay for.

The deep-link call is the last statement in `main.js`, immediately before the closing `})()`, and
it has to stay there: `showShop()` reaches into the range chooser and the cart, both declared
further down the file. It has twice been inserted after the first `renderCart();` in the file by a
careless search-and-replace, which lands it *inside* `changeQty()` where it never runs. Watch for
that — `renderCart();` appears three times.

A feature strip, two range detail sections, a craft story, a newsletter block, a collections grid
and a testimonials block used to live here. All removed at the owner's request — don't bring any
of them back.

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

**Every price on the site is the same placeholder, ₹4,999.** The owner asked for one common
price rather than an enquiry route, and that figure is their own confirmed price for the Onyx set
reused across the range. It is not a real price for the other nine — replace `data-price` per
product as soon as the real figures arrive.

A card may carry `data-specs`, a `|`-separated list shown as bullets in the quick view. Only the
Pearl White has them so far, taken off the supplier's spec sheet; cards without the attribute show
no bullet list. Do not put a blanket list back in the markup — the previous one claimed "natural
fibres, no synthetic blends" of a range that is mostly **polysatin**, which is polyester. The hero,
page description, category blurb, footer and quick-view note were all corrected for the same
reason. Adorn sells handloom cotton *and* satin; copy must not claim otherwise.

The `data-placeholder` machinery (no price, "Coming soon" pill, Enquire routing to the contact
form) still works and is documented here, but nothing currently uses it.

The shop opens on a chooser of two ranges — Bed Sheets and Carpets — and picking
one swaps in just that range's cards. `main.js` derives everything from the cards themselves: each
tile's count line, an empty state for a range with nothing in it, and a narrower centred grid when
a range holds one or two pieces. So adding a product is a matter of editing `index.html` alone.

A `data-shop-open` trigger may name a range (`data-shop-open="carpets"`) to jump straight into it;
without a value it opens the chooser.

Carpets has no products, so the range shows its "Coming soon" state; adding a `.shop-card` with
`data-category="carpets"` is all it takes to bring the grid back.

The only invented copy left on the page is the four statistics in the craft story (25+ years,
120+ artisans, 18 villages, 10k+ homes). The owner has not confirmed them.

## Visual work

There are no product photos for most of the range, so visuals are drawn in CSS. Each range has
its own set, and a card picks one by class: `.weave-1`–`8` for bed linen. `.pattern-*` covers the
larger section grounds. Keep it that way rather than reaching for stock imagery. The carpet set
(`.rug-*`) was removed along with the carpet placeholders — real carpets will arrive with photos,
as the Damas sets did.

Build these from gradients that actually tile. `repeating-conic-gradient` and
`repeating-radial-gradient` fan out from a single point, so they render as one wedge or one set of
rings across the card rather than a motif — use `background-size` with a plain `radial-gradient`
for dot and leaf fields instead.
