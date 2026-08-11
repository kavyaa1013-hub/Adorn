# Adorn — Handloom Bed Sheets

A static marketing site and shop for **Adorn**, a handloom business in Panipat, Haryana selling
bed sheet sets in handloom cotton and premium satin.

Plain HTML, CSS and JavaScript. No build step, no framework, no package manager — open
`index.html` and it runs.

## Three pages, one file

`index.html` holds all three; `js/main.js` swaps between them, so nothing is scrolled past — each
view comes off the document entirely.

- **Landing** — the wordmark, one line of copy and **Shop Now**. Nothing else, and no scroll.
- **Shop** — the ten bed sheet sets, quick view, and add-to-bag with a slide-in cart drawer.
- **Checkout** — delivery details, order summary, and the UPI payment panel.

All three push history, so Back and Forward work and `#shop` is a shareable link that opens
straight into the store.

## Products

Each product is a `.shop-card` article in `index.html`. The cart and filters read only its data
attributes — `data-id`, `data-name`, `data-price` (integer rupees) and `data-category` — so adding
a product means copying a card and editing those.

Photos resolve by convention: a card with `data-id="satin-sky"` shows
`assets/products/satin-sky.jpg`. Drop the file in and it appears; until then `main.js` removes the
broken image and the CSS-drawn weave pattern behind it shows instead. See
`assets/products/README.md` for sizing.

> **Every price is the same placeholder, ₹4,999.** That is the owner's confirmed price for the
> Onyx set, reused across the range. It is not the real price for the other nine.

## Payment

UPI only. The customer pays from their own UPI app, enters the reference number, and the order
reaches the owner by email; the owner matches the payment by hand before dispatch.

`ADORN_PAYMENT` at the top of `js/main.js` holds the details. Emptying `upiId` makes the checkout
say payment is not set up rather than showing a placeholder someone might actually pay — do not
replace that with a dummy UPI ID.

Bank transfer is deliberately off: publishing an account number is the owner's decision, not a
default. Filling in the three `bank` fields turns it on.

There is no card option. Charging a card needs a licensed gateway account, which needs the
owner's KYC. The Razorpay groundwork is parked but unreferenced — `api/razorpay-order.js`,
`api/razorpay-verify.js` and `docs/razorpay-setup.md`.

## Layout

```
index.html               All markup, single page
css/style.css            Palette, type, layout, animation
js/main.js               Intro animation, reveals, shop, cart, checkout
assets/products/         Product photos
assets/upi-qr.png        The owner's UPI QR, shown at checkout
tools/build-preview.py   Bundles the site into one self-contained preview page
tools/build-release.py   Packages the site as a zip for uploading to a web host
```

## Running locally

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. Opening `index.html` directly works too.

## Packaging for a host

```bash
python3 tools/build-release.py
```

Writes `dist/adorn-website.zip` — the four site files plus the photos, and an owner-facing
`README.txt` explaining how to upload it. The script refuses to build if the markup or script
references an asset that would not be in the zip, so the download cannot ship half a site.
