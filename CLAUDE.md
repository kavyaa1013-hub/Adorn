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

UPI only. The customer pays from their own UPI app, enters the reference, and the order reaches
the owner by email; the owner matches the payment by hand before dispatch.

**The card option was removed at the owner's request.** It could not be made to work safely: a
card can only be charged through a licensed gateway, that needs a Razorpay account, and the
account needs the owner's KYC. Rather than leave a dead or fake card form on a live shop, the
checkout is UPI only.

The Razorpay work is parked, not deleted — `api/razorpay-order.js`, `api/razorpay-verify.js` and
`docs/razorpay-setup.md`. Nothing on the site references them. If the card option comes back,
the rule that made them necessary still holds: **never charge an amount the browser supplied.**
`razorpay-order.js` keeps its own price list for exactly that reason, and it must be brought back
in step with `index.html` before use.

`ADORN_PAYMENT` at the top of `js/main.js` holds the real details: UPI `6239073929-2@axl`,
orders to `adorn.2026@gmail.com`. The panel is rendered from `window.ADORN_PAYMENT` at render
time, not captured at load.

Checkout hands the order off **by email only**. WhatsApp was removed at the owner's request; the
number still appears in the contact section as a way to reach them, but nothing routes an order
through it.

The guard around it stays: if `upiId` is ever emptied, the checkout says payment is not set up
rather than showing a placeholder someone might actually pay. Do not swap that for a dummy UPI ID.

`assets/upi-qr.png` is the owner's PhonePe QR, cropped only — never recolour or regenerate a
payment QR. It is white-on-black as PhonePe produced it, so `.pay-qr` gives it a dark frame rather
than the usual white one. `tools/build-preview.py` folds it into the preview from the *script*,
since the path lives in `main.js` rather than the markup.

**Bank transfer is deliberately off.** The owner sent a cancelled cheque, so the account number
and IFSC are known, but publishing an account number on a public page is their decision to make,
not a default. `ADORN_PAYMENT.bank` is empty and the panel omits the section entirely; filling in
those three fields turns it on. The cheque image itself is not in this repo and must not be —
it carries a signature and full account details.

## Three pages, one file

`index.html` holds all three and `main.js` swaps between them — nothing is scrolled past, each
view comes off the document:

- **Landing** (`#landing`) — the wordmark, a line of copy and **Shop Now**, and nothing else. No
  nav, and measured scroll overflow is 0px. `#shop`, `#contact` and the footer all carry `hidden`.
- **Shop** (`#shop`) — `showShop()` hides the landing, reveals the shop, contact form and footer,
  and scrolls to the top. `showLanding()` reverses it, and the logo (`#homeLink`) calls it.
- **Checkout** (`#checkout`) — `showCheckout()`, reached from the bag. Delivery details, the order
  summary and the UPI panel. Validates name, 10-digit phone, email, address, 6-digit PIN and the
  UPI reference, then opens a prefilled email to the owner.

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

Bed Sheets is the only range. The chooser machinery is still there but `showRanges()` skips it
whenever fewer than two ranges hold products, going straight to the one range and hiding the
"All ranges" link — a chooser of one is not a choice. Add a second entry to `CATEGORY_NAMES`, a
matching `.category-tile`, and cards with that `data-category`, and the chooser returns on its own.

Carpets were removed at the owner's request, along with the tile, the copy and the contact form's
"Carpet Order" subject. `main.js` still derives each tile's count line, an empty state for a range
with nothing in it, and a narrower centred grid for one or two pieces, so adding a product remains
a matter of editing `index.html` alone.

Contact details are the owner's real ones: Barsat Road, Noorwala, Panipat, Haryana 132103,
`adorn.2026@gmail.com`, +91 70825 24499. No invented contact information remains, and the social
row was removed rather than left pointing at `#`.

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
