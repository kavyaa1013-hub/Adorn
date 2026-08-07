# Product photos

Drop product photos in this folder. Each shop card already points at a filename here, so a photo
appears on the site the moment the file exists — no code changes needed.

## Filenames

The filename must match the product's `data-id` in `index.html`, with a `.jpg` extension:

| Product                     | Filename                  |
| --------------------------- | ------------------------- |
| Onyx Black Bedsheet Set     | `onyx-bedsheet.jpg` ✅     |
| Damas Bedsheet Set — Navy   | `damas-navy.jpg` ✅        |
| Damas Bedsheet Set — Ivory  | `damas-ivory.jpg` ✅       |
| Damas Bedsheet Set — Mocha  | `damas-mocha.jpg` ✅       |
| Damas Bedsheet Set — Khaki  | `damas-khaki.jpg` ✅       |
| Handloom Bedsheet Design 02 | `bedsheet-02.jpg`         |
| Handloom Bedsheet Design 03 | `bedsheet-03.jpg`         |
| Handloom Bedsheet Design 04 | `bedsheet-04.jpg`         |
| Handloom Bedsheet Design 05 | `bedsheet-05.jpg`         |
| Handloom Bedsheet Design 06 | `bedsheet-06.jpg`         |
| Handloom Carpet Design 01   | `carpet-01.jpg`           |
| Handloom Carpet Design 02   | `carpet-02.jpg`           |
| Handloom Carpet Design 03   | `carpet-03.jpg`           |
| Handloom Carpet Design 04   | `carpet-04.jpg`           |
| Handloom Carpet Design 05   | `carpet-05.jpg`           |

## Sizing

- **Aspect ratio:** roughly 4:3 landscape. Cards crop to fill, centred, so keep the product away
  from the extreme edges.
- **Dimensions:** 1200 × 900 px is plenty. Anything larger just slows the page down.
- **Format:** `.jpg` for photographs. If you'd rather use `.webp` or `.png`, update the `src` on
  that product's `<img>` in `index.html` to match.
- **Weight:** aim for under 300 KB each.

✅ = photo supplied. Any product without one falls back to a woven pattern.

## Extra angles

A product photographed from several angles gets a thumbnail strip on its card. Name the extra
shots with a `-2`, `-3`, `-4` suffix and add a matching `<button>` to that card's `.shop-gallery`
in `index.html`. The Onyx Black Bedsheet Set is the worked example:

```
onyx-bedsheet.jpg     main image — made-up bed
onyx-bedsheet-2.jpg   styled angle
onyx-bedsheet-3.jpg   flat sheet and pillows
onyx-bedsheet-4.jpg   fabric close-up
```

## A note on the Damas photos

The four Damas images are supplier catalogue shots and carry another company's
branding — an "mj Home" logo top-left and a "DAMAS CO." colour label top-right. They are
stored unaltered. Replace them with clean images before the site goes live.

## If a photo is missing

Nothing breaks. `js/main.js` removes any image that fails to load, and the CSS-drawn woven pattern
behind it stays visible — so a half-finished photoshoot never leaves holes in the grid.
