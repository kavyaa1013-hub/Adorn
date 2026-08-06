# Adorn — Handloom Bed Sheets &amp; Carpets

A static marketing website for **Adorn**, a handloom business selling bed sheets, carpets and home
textiles.

## Highlights

- **Brand intro animation** — on first load, the "Adorn" wordmark animates in over a soft pastel
  background before revealing the site (auto-dismisses after ~2.6s, or on click/keypress).
- **Palette** — white / pastel ivory &amp; blue backgrounds with dark navy blue and gold accents,
  matched to the brand logo's color scheme.
- **Sections** — hero, feature strip, collections (Bed Sheets, Carpets, Cushions &amp; Throws),
  dedicated Bed Sheets &amp; Carpets product sections, the shop, brand story/craftsmanship,
  testimonials slider, newsletter signup, and a contact form.
- **No build step** — plain HTML/CSS/JS, all visuals (weave/loom patterns) drawn with CSS/SVG so
  there are no external image dependencies.

## The shop

The **Shop Now** button (header, hero, and the Cushions collection card) reveals a store section
holding 8 products across the three categories, with:

- category filter chips (All / Bed Sheets / Carpets / Cushions &amp; Throws)
- add-to-bag on every card, a live count badge on the header cart icon, and a toast confirmation
- a slide-in cart drawer with per-item quantity steppers and a running total

There is no payment backend. **Request This Order** closes the drawer, writes the bag contents into
the contact form's message field, and scrolls the visitor there — so enquiries arrive by email.
To wire up real checkout later, replace that handler in `js/main.js` (search for `cartCheckout`).

Products live directly in `index.html` as `.shop-card` articles. Each one carries `data-id`,
`data-name`, `data-price` (integer rupees) and `data-category`, which is all the cart and filters
read — so adding a product is just copying a card and editing those attributes.

### Product photos

Every card points at `assets/products/<data-id>.jpg`. Drop a file with that name into
`assets/products/` and the photo appears — no code change needed. Until the file exists, `main.js`
removes the broken image and the CSS-drawn weave pattern behind it shows instead, so missing
photos never leave holes in the grid. See `assets/products/README.md` for the filename list and
sizing guidance (4:3 landscape, ~1200×900, under 300 KB).

## Structure

```
index.html        Markup for all sections
css/style.css     Styling, palette, animations, responsive layout
js/main.js        Intro animation control, nav toggle, scroll reveal, testimonial slider, forms
```

## Running locally

Just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Customizing

- Replace the `A` monogram in `.logo-mark` / the intro SVG with your actual logo file once available.
- Swap the CSS-drawn weave/carpet patterns in `css/style.css` (search for `pattern-`) with real
  product photography by replacing those elements with `<img>` tags.
- Update contact details, social links and copy directly in `index.html`.
