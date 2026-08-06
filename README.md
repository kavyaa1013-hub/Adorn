# Adorn — Handloom Bed Sheets &amp; Carpets

A static marketing website for **Adorn**, a handloom business selling bed sheets, carpets and home
textiles.

## Highlights

- **Brand intro animation** — on first load, the "Adorn" wordmark animates in over a soft pastel
  background before revealing the site (auto-dismisses after ~2.6s, or on click/keypress).
- **Palette** — white / pastel ivory &amp; blue backgrounds with dark navy blue and gold accents,
  matched to the brand logo's color scheme.
- **Sections** — hero, feature strip, collections (Bed Sheets, Carpets, Cushions &amp; Throws),
  dedicated Bed Sheets &amp; Carpets product sections, brand story/craftsmanship, testimonials
  slider, newsletter signup, and a contact form.
- **No build step** — plain HTML/CSS/JS, all visuals (weave/loom patterns) drawn with CSS/SVG so
  there are no external image dependencies.

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
