# EMC Presentations

Event decks for [Entrepreneurs Meet](https://emcagliari.com), Cagliari.

Each deck is one self-contained directory of hand-written HTML with a single CSS
file, a single JS file and two Python helpers. No npm, no bundler, no CDN, no build
step. You present by double-clicking `index.html` on the laptop that's plugged into
the projector — with the network unplugged, if you like. That constraint is the whole
design: a deck that shipped keeps working forever, because nothing it depends on can
move underneath it.

```
emc-presentations/
├── _template/                # the engine + one example of every slide archetype
├── 2026-08-27-summer-party/  # a real deck, kept as a worked reference
├── docs/
└── .claude/skills/emc-deck/  # authoring guide for Claude Code
```

## New deck in 5 steps

```bash
cp -R _template 2026-09-24-september-meetup
cd 2026-09-24-september-meetup
```

1. **Name it.** Edit `<title>` in `index.html` and the `slide__head` text.
2. **Build the running order.** `index.html` ships one commented example of every
   slide archetype. Delete what you don't need, duplicate what you do. All slides
   live inside `#canvas`; leave the presenter chrome at the bottom of the file alone.
3. **Drop in assets.** Portraits and company logos → `img/speakers/`. Screenshots →
   `img/site/`. Video → `media/` (gitignored; H.264 + AAC, 1920×1080).
4. **Stamp and proof.**
   ```bash
   python3 stamp.py          # cache-bust CSS, JS and images
   python3 extract-copy.py   # writes copy.md — proof-read this, not the HTML
   ```
5. **Open it.** Double-click `index.html`. Press `?` for the keys, `O` for the
   overview grid. Test every video slide before the night.

## Presenting

| Key | |
|---|---|
| `→` `↓` `Space` `PageDn` | Next slide — also the clicker's forward button |
| `←` `↑` `PageUp` | Previous slide — also the clicker's back button |
| `Space` / `K` | Play or pause the video, on slides that have one |
| `F` / `F5` | Fullscreen |
| `B` or `.` | Blank to black — any key brings the slide back |
| `W` or `,` | Blank to white |
| `O` | Overview grid — click any slide to jump to it |
| `M` | Flip this slide between Fun and Pro |
| `1`–`9` | Jump to that slide |
| `Home` / `End` | First / last slide |
| `?` | Show or hide the key map |

`#7` in the URL deep-links to slide 7. The deck auto-rotates 90° on a portrait phone,
so you can hand someone your phone sideways and it just works.

## Authoring

The full guide is in [`.claude/skills/emc-deck/SKILL.md`](.claude/skills/emc-deck/SKILL.md),
and `_template/index.html` is the archetype catalogue — copy blocks out of it rather
than writing markup from memory.

Three rules matter more than the rest:

1. **px only.** The canvas is a fixed 1600×900 that `deck.js` scales with one CSS
   transform. A `vw`/`vh` anywhere inside it re-measures against the browser window
   instead, and the slide comes out a different shape on the projector.
2. **Relative paths only.** No absolute URLs, no CDN, no Google Fonts. Alcyone is
   vendored in `fonts/`.
3. **Don't remove the chrome.** `deck.js` needs `#progress`, `#canvas`, `#counter`,
   `#overview` and both `#navzones` zones. Drop one and the deck renders blank.

## Fun and Pro

Every deck can run in two brand registers, per slide, via `data-mode="fun|pro"` on
the `<section>`. `deck.css` is the source of truth for the tokens and mirrors
`emc/resources/css/app.css`.

| | Fun | Pro |
|---|---|---|
| Page | `#E4EDF0` Pale Sky | `#2A3340` Blue Slate |
| Ink | `#14264F` Indigo Ink | `#FFFFFF` |
| Accent | `#F0453E` Coral | `#8FA6BC` Steel |
| Highlight | `#F4B740` Amber | `#C6D3DE` Pale Steel |

A slide is entirely Fun or entirely Pro — never a blend. The one exception is the
`.duo` split, which sets both side by side deliberately.

## Scripts

| | When |
|---|---|
| `python3 stamp.py` | After editing `deck.css`/`deck.js`, or re-shooting an image that keeps its filename |
| `python3 extract-copy.py` | Whenever the copy changes — writes `copy.md` for proof-reading |

Both are stdlib-only and must be run **from inside the deck directory**.

## Assets

`media/` and `sources/` are gitignored. **Video is never committed** — it lives on the
presenting laptop and in whatever shared drive the organisers use. `sources/` is the
raw material presenters send over, kept next to the deck while it's being built.

## Updating the engine

Edit `_template/deck.css` or `_template/deck.js`, then copy the file forward into the
deck you're working on and re-run `stamp.py`. There is deliberately no shared include:
each deck is frozen at the engine version it shipped with, so re-opening a two-year-old
deck can never surprise you.

## Provenance

The engine and template are MIT. The brand assets and the Alcyone typeface are
Entrepreneurs Meet's and are **not** redistributable — keep this repository private.
