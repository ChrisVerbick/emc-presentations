---
name: emc-deck
description: "Author or edit an Entrepreneurs Meet presentation deck in this repo — zero-dependency HTML that runs from file:// offline at the venue. Invoke when asked to create a new deck, add/edit/reorder slides, wire up speaker photos, screenshots or video, adjust the Fun/Pro treatment of a slide, or run the stamp and copy-extract scripts. Skip for the emcagliari.com Laravel site, the brand manual, and for slide work in Google Slides, Keynote or PowerPoint."
license: MIT
metadata:
  author: Chris Verbick <chris@businessdesigntools.com>
---

# EMC deck authoring

Every deck in this repo is one directory: hand-written HTML, one CSS file, one JS
file, two Python scripts. No npm, no bundler, no CDN, no framework. It is opened by
double-clicking `index.html` on the presenting laptop with the network unplugged.
That constraint is the design, not an accident — respect it and everything else here
follows.

## Starting a new deck

```bash
cp -R _template YYYY-MM-DD-event-slug
cd YYYY-MM-DD-event-slug
```

Then:

1. Edit `<title>` in `index.html`, and the `slide__head` text on every slide.
2. Build the running order. The template ships one commented example of each slide
   archetype — delete what you don't need, duplicate what you do.
3. Drop portraits and company logos into `img/speakers/`, screen captures into
   `img/site/`, video into `media/`.
4. `python3 stamp.py`
5. Open `index.html` in a browser. Press `?` for the controls.

Never edit `_template/` to fix one deck's problem. If a change belongs to every
future deck — a `deck.css` fix, a new component class — make it in `_template/` and
copy the file forward into the deck you are working on.

## Hard constraints

- **No dependencies, no build step.** Nothing is fetched at runtime. If you want a
  library, write the ten lines instead or drop the idea.
- **Must run from `file://` offline.** Every `href` and `src` is relative. No
  absolute paths, no `https://` assets, no Google Fonts — Alcyone is vendored in
  `fonts/` as four `.woff2` files.
- **The canvas is fixed at 1600×900.** `deck.js` scales the whole `#canvas` box with
  one CSS transform. Every size inside it is **px, em, ch or %** — never `vw`, `vh`,
  `vmin`, `vmax`, `svh` or `dvh`. A viewport unit re-measures against the browser
  window rather than the canvas, so the slide comes out a different shape on the
  venue projector than on your laptop. This is the most common way to break a deck.
- **Don't remove the chrome.** `deck.js` dereferences `#progress`, `#canvas`,
  `#counter`, `#overview` and both `#navzones .zone` elements without a null check.
  Drop any one and the deck throws on boot and renders blank. `#slideno` is guarded
  and optional; `#blank`, `#help`, `#hud` and `#stage` are styling only.
- **All slides live inside `#canvas`.** `deck.js` collects `.slide` document-wide, so
  a stray one anywhere in the file joins the running order. Park unused example
  slides in real `<!-- -->` comments, never in a hidden wrapper.

## Slide vocabulary

Every slide is one `<section>`:

```html
<section class="slide is-page" data-label="Overview caption" data-mode="fun">
```

| Attribute | Values | Effect |
|---|---|---|
| `class="slide"` | — | Deep band — `--band-deep`, white ink |
| `class="slide is-page"` | — | Light page — `--page`, `--ink` |
| `class="slide is-alt"` | — | Alt band — `--band-alt`, white ink |
| `data-label` | free text | Caption in the `O` overview grid. **Required** — `extract-copy.py` keys on it and skips sections without one. |
| `data-mode` | `fun` \| `pro` | Swaps the token block for this slide and mirrors it onto `<html>`, so the chrome follows. Defaults to `fun`. |
| `data-autoplay` | present | Plays the slide's video on entry |
| `style="padding:0"` | — | Full-bleed slides only — banner, showcase, video, raw image. Default padding is 80px. |

On any child element:

| Attribute | Values |
|---|---|
| `data-anim` | `fade` (up 16px) · `lift` (up 24px) · `rule` (scaleX from the left) · `left` · `right` · `blur` |
| `data-delay` | `1`–`8`, 0.09s per step. Stagger list items and grid cells; leave headings at 0. |

Animations run only on `[data-active]` and replay when you step back onto a slide.
They are suppressed under `prefers-reduced-motion`, in the overview thumbnails, and
in print.

## Layout conventions

- Slide flex direction is column. Position content with `justify-content` and `gap`
  in the section's inline `style`, not with margins.
- Running header `<div class="slide__head">` and footer `<div class="slide__foot">`
  on every slide **except** cover, closing, full-bleed and showcase slides.
- Corner mark `<img class="slide__mark" src="img/logomark-fun-{light|dark}.svg">` —
  `light` on `is-page`, `dark` on deep and `is-alt` bands.
- Constrain measure with `max-width` in `em` or `ch`, never a percentage of the canvas.
- Alternate the bands: page, band, page, band. Accents are punctuation — coral and
  amber together should never cover more than a tenth of a slide.
- One `<mark>` phrase per slide, maximum.

## Type scale

Fixed px, set in `:root` in `deck.css`. Use the variable, never a raw number.

| Token | Size | Use |
|---|---|---|
| `--fs-hero` | 96px | Cover headline, interstitial |
| `--fs-display` | 86px | Statement slide, closing |
| `--fs-h1` | 69px | Section divider, major heading |
| `--fs-h2` | 55px | Standard slide heading |
| `--fs-h3` | 44px | Dense slide heading |
| `--fs-h4` | 35px | `.qual` titles |
| `--fs-h5` | 28px | List items, quotes |
| `--fs-lead` | 22.5px | Lead paragraph |
| `--fs-body` | 18px | Body |
| `--fs-small` | 14.5px | Captions |
| `--fs-overline` | 13px | `.eyebrow`, running head and foot |

## Fun and Pro

Both token blocks are scoped to `[data-mode]`, **not** `:root`. That is what lets two
`.duo__half` panels on one slide run different modes off a single stylesheet.

| Token | Fun | Pro |
|---|---|---|
| `--page` | `#E4EDF0` Pale Sky | `#2A3340` Blue Slate |
| `--ink` | `#14264F` Indigo Ink | `#FFFFFF` |
| `--band-deep` | `#0C1832` | `#12161D` |
| `--band-alt` | `#0C1832` | `#1B222C` Recessed |
| `--card` / `--card-ink` | `#223B66` / `#FFFFFF` | `#FFFFFF` / `#12161D` |
| `--accent` | `#F0453E` Coral | `#8FA6BC` Steel |
| `--highlight` | `#F4B740` Amber | `#C6D3DE` Pale Steel |
| `--eyebrow` / `--eyebrow-dark` | `#0B5474` / `#F0453E` | `#8FA6BC` / `#8FA6BC` |
| `--hl-bg` / `--hl-ink` (`<mark>`) | Amber fill / ink | transparent / pale steel |
| `--cta-bg` / `--cta-ring` | Coral fill / none | transparent / 3px white ring |
| `--photo-frame` | none | `inset 0 0 0 1px #FFFFFF` |
| `--rule-w` (`.rule`) | `0px`, hidden | `28px` |

Pro's three structural tells: ghost CTAs, a 1px white frame on every photo, and a
visible rule under the eyebrow. Never blend the palettes — a slide is entirely Fun or
entirely Pro. When unsure, Fun.

Coral is never used for small text on the pale page; it fails contrast.

## Archetypes

`_template/index.html` is the catalogue and the single source of truth. Read it and
copy the block you need rather than writing markup from memory. It carries a
commented example of each:

cover · standard content slide · section divider · agenda/schedule (with the `.done`
pill) · statement · attribute grid `.quals` + `.stats` line · bullet/link list ·
speaker lead-in · speaker bio `.speaker` · showcase image `.showcase` (plus
`--bleed`, `--inset`) · showcase video · full-bleed raw image · browser screenshot
pair `.browser` · screenshot tile grid `.shots` · palette `.swatches` · duo split
`.duo` · logo reveal `.reveal` · glyph grid `.glyphs` · event banner `.banner` ·
standalone video `.video-wrap` · closing.

If a slide doesn't fit one of these, build it from inline flex plus the type tokens.
Only add a class to `deck.css` when the same shape has appeared three times.

Glyphs are **inlined `<svg><path>`**, not `<img>` — that is how each mark picks up
the current mode's accent from one neutral source.

## Assets

| Path | Contents | Git |
|---|---|---|
| `fonts/` | Alcyone Regular/Medium/SemiBold/Bold `.woff2` | committed, shared |
| `img/logomark-*.svg`, `img/wordmark-*.svg` | brand marks, per band and mode | committed, shared |
| `img/speakers/` | portraits, company logos | per-deck |
| `img/site/` | product screenshots, 1440×900 | per-deck |
| `media/` | video, H.264 + AAC, 1920×1080 | **gitignored — never commit video** |
| `sources/` | raw material presenters send over | gitignored, per-deck |

Wordmark by band: `wordmark-fun-dark.svg` on deep and alt bands,
`wordmark-fun-light.svg` on `is-page`, `wordmark-pro-white.svg` /
`wordmark-pro-slate.svg` in Pro.

Photographs: only real images from actual EMC gatherings — natural light, real
venues, unposed. Never stock, never staged handshakes, never AI-generated crowds.

## Scripts

Both run **from inside the deck directory**.

### `python3 stamp.py`

Appends `?v=<sha256[:8]>` to `deck.css`, `deck.js` and every `img/site/*` and
`img/speakers/*` reference, rewriting `index.html` in place. These are the files that
get regenerated under an unchanged name, so without it a browser serves a stale copy.

Run after editing `deck.css` or `deck.js`, re-shooting a screenshot, or swapping a
speaker photo for a different image at the same filename. Not needed after editing
slide markup alone.

### `python3 extract-copy.py`

Walks `index.html` and writes `copy.md` — every slide's text in running order,
labelled by `data-label`. This is the proof-reading artefact: read `copy.md`, not the
HTML, when checking wording. Regenerate after any copy change.

`copy.md` is generated output — edit the HTML, never the markdown. The script is
cwd-relative (`pathlib.Path('index.html')`), so running it from the repo root fails.
`EXCLUDE` filters slides by `data-label` prefix when a deck has streams worth
omitting, such as presenter bios.

## After the event — the Library build

The venue build is wrong for the web: full-size photography, a multi-megabyte film,
seventy-odd separate requests. `scripts/build-web-deck.mjs` collapses a deck into one
self-contained HTML file for the members' Library.

```bash
node scripts/build-web-deck.mjs <deck-directory>
  → dist/<deck>.deck.html
```

It drops every slide containing a `<video>`, re-encodes each raster to WebP capped at the
1600x900 canvas (nothing can render larger, so nothing larger is carried), and inlines the
CSS, JS, fonts and images as `data:` URIs. The summer party deck goes 23.6 MB across 72
files → 6.6 MB in one. The result still runs offline from `file://` — there is nothing
left for it to fetch — so it doubles as the archive copy.

The script fails loudly if any reference survives un-inlined, rather than shipping a deck
that would try to fetch from whatever origin it lands on.

Then publish it:

1. `/admin/library` → New → upload `dist/<deck>.deck.html`.
2. Tag it **`Events`** (type `library`). That one tag is the whole relationship between a
   deck and the event — it drives the `Event Library · EP nn` eyebrow and breadcrumb and
   the home page's Event Library band. There is no foreign key.
3. Leave **Members Only** on. It defaults to on.

The Library show page detects an `.html` file and renders it in a sandboxed 16:9 iframe
with a fullscreen button. Keyboard control works once the viewer clicks into the deck.

## Presenting

`?` shows the full key map. Worth knowing while authoring: `O` opens the overview
grid — live scaled clones of every slide, the fastest way to review pacing and band
alternation. `M` flips the current slide between Fun and Pro. `#7` in the URL
deep-links to slide 7. `B` blanks to black.

Video: entering a slide arms an 8-second readiness deadline and shows a plain "not
found" card if the file never produces a frame. Leaving a slide always stops its
video. Test every video slide before the event — that card exists because
discovering a missing file on stage is the failure this engine was built to prevent.

Print and PDF export work: `@media print` sets a 1600×900 page, drops the chrome and
pages every slide.
