# Product photos

Drop product photos in this folder. Each shop card already points at a filename here, so a photo
appears on the site the moment the file exists — no code changes needed.

## Filenames

The filename must match the product's `data-id` in `index.html`, with a `.jpg` extension:

| Product                     | Filename                  |
| --------------------------- | ------------------------- |
| Indigo Jaal Bed Sheet       | `indigo-jaal.jpg`         |
| Saffron Stripe Sheet Set    | `saffron-stripe.jpg`      |
| Ivory Chanderi Duvet Cover  | `ivory-chanderi.jpg`      |
| Mughal Trellis Carpet       | `mughal-trellis.jpg`      |
| Sundown Kilim Durrie        | `sundown-kilim.jpg`       |
| Pearl Durrie Runner         | `pearl-durrie.jpg`        |
| Terracotta Bloom Cushions   | `terracotta-bloom.jpg`    |
| Handloom Wool Throw         | `wool-throw.jpg`          |

## Sizing

- **Aspect ratio:** roughly 4:3 landscape. Cards crop to fill, centred, so keep the product away
  from the extreme edges.
- **Dimensions:** 1200 × 900 px is plenty. Anything larger just slows the page down.
- **Format:** `.jpg` for photographs. If you'd rather use `.webp` or `.png`, update the `src` on
  that product's `<img>` in `index.html` to match.
- **Weight:** aim for under 300 KB each.

## If a photo is missing

Nothing breaks. `js/main.js` removes any image that fails to load, and the CSS-drawn woven pattern
behind it stays visible — so a half-finished photoshoot never leaves holes in the grid.
