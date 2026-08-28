# Slide Template Prompts

Two prompts for generating EMC-branded presentation templates. All values come from
the brand manual (`public/brand-manual/index.html`) — if a value here ever disagrees
with the repo tokens (`resources/css/app.css`, `tailwind.config.js`), the repo wins.

Both produce **two separate decks** — one Fun, one Pro. The manual forbids mixing
modes in a single artifact.

---

## 1. Gemini → Google Slides

Gemini's Slides side panel can't edit the theme or masters, so the palette and font
setup is a one-time manual step.

### Step 0 — do once by hand

In a new 16:9 presentation: **Slide → Edit theme**, set the theme fonts to **Inter**,
and under **Theme colours** set:

| Slot | Fun deck | Pro deck |
|---|---|---|
| Background / Light 1 | `#E4EDF0` | `#2A3340` |
| Text / Dark 1 | `#14264F` | `#FFFFFF` |
| Dark 2 | `#0C1832` | `#12161D` |
| Light 2 | `#223B66` | `#1B222C` |
| Accent 1 | `#F0453E` | `#8FA6BC` |
| Accent 2 | `#F4B740` | `#C6D3DE` |
| Accent 3 | `#0B5474` | `#FFFFFF` |

Build the Fun deck and the Pro deck as two separate files. Then paste the prompt below
into the Gemini side panel.

### The prompt

```
You are filling in a 16:9 presentation template for "Entrepreneurs Meet" (EMC), a
non-profit entrepreneur community in Cagliari, Sardinia. The theme colours and fonts
are already set — use the theme's colours and the Inter font family only. Do not
introduce any colour or font that isn't listed here.

Build 13 slides. Each one is a reusable template: real EMC-flavoured placeholder copy
that someone can overwrite, laid out per the rules below. Work slide by slide and
tell me what you placed on each.

This deck runs in ONE brand mode throughout — I'll tell you which:
  FUN mode "Coral & Indigo" — warm, candid, the public default. Pale-sky page
  (#E4EDF0), indigo ink and dark bands (#14264F, deepest #0C1832), cards in card-
  indigo (#223B66), coral accents (#F0453E), amber highlighter (#F4B740), and
  cerulean (#0B5474) for eyebrows on light bands. Coral is never used for small text
  on the pale page — it fails contrast.
  PRO mode "Blue Slate" — composed, for partners and institutions. Slate page
  (#2A3340), recessed bands and cards (#1B222C), deepest #12161D, all ink white,
  steel accents (#8FA6BC), pale-steel highlight (#C6D3DE). Pro has three structural
  tells Fun does not get: CTA buttons are ghost pills (no fill, 3px white ring),
  every photo takes a 1px white frame, and cards on dark bands are white.

Never blend the two palettes. If I haven't said which mode, use Fun.

TYPE — Inter only, one family across every size. No second font "for variety".
  Hero      64pt Bold, tight leading, slightly negative tracking
  Display   54pt Bold
  H1        42pt Bold
  H2        34pt Bold
  H3        26pt Bold
  Lead      18pt Medium
  Body      14pt Regular, line spacing 1.6, keep lines short
  Small     11pt Medium
  Overline  10pt Bold, UPPERCASE, wide letter-spacing (about 2px)
Weights in use: 400 body, 500 labels and captions, 600 emphasis, 700 all headings,
CTAs and stats.

THE RECIPE — almost every slide is the same four moves, in this order:
  1 Eyebrow — overline size, Bold, uppercase, wide tracking. Cerulean on light bands
    and coral on dark bands in Fun; white in Pro, with a 2px rule beneath it.
  2 Heading — Bold, tight leading, at the size the slide deserves.
  3 Lead paragraph, then body. Keep the measure narrow.
  4 Caption — Medium, uppercase, slight tracking, 60% opacity ink.

SHAPES — exactly three corner radii and nothing else: fully rounded pills for
anything interactive (buttons, tags), 12px for cards and photos, 24px for large
panels. No shadows, no gradients, no outlines, no effects.

RHYTHM — alternate the slide backgrounds: light page, dark band, light page, and so
on. Accents are punctuation: coral and amber together should never cover more than a
tenth of a slide.

PHOTOS — insert a plain 12px-radius rectangle in a neutral brand surface as a
placeholder, and write inside it exactly what belongs there. The rule: only real
photographs from actual EMC gatherings — natural light, real venues, unposed people
mid-conversation or mid-laugh. Never stock imagery, never staged handshakes, never
AI-generated crowds. Any text sitting on a photo needs a 72% dark scrim behind it.
Every photo gets a micro-caption in the caption style: VENUE OR EVENT · MONTH YEAR.

CTAs — always a verb plus a destination, ending in an arrow: "Come to Your First
Event →", "Join the Community →", "Read the Report →". Uppercase, slightly tracked,
in a pill. Fun: solid indigo fill. Pro: ghost with the 3px white ring. Never use
urgency language — no "Don't miss out", no "Last chance".

THE 13 SLIDES
 1  Cover — dark band. Space reserved top-left for the wordmark, hero headline,
    one-line subtitle, "Cagliari · Sardinia" and a date at the bottom.
 2  Section divider — dark band, an oversized section number sitting at about 10%
    opacity behind an H1 section title.
 3  Agenda — light page, numbered list, one line per item, generous spacing.
 4  Statement — light page, one Display-size claim of twelve words or fewer, with a
    single phrase carrying the amber highlighter (Fun) or pale-steel emphasis (Pro).
    One highlighted phrase per slide, maximum.
 5  Big number — one stat at hero size, one line of meaning beneath it, nothing else.
 6  Stat row — three stats across the slide: "200+ Members", "15+ Nationalities",
    "22+ Events". Numbers at H2 Bold, labels at Small.
 7  Three pillar cards — each card has a thin rule across its top, an H3 title, and
    three or four lines of body.
 8  Split — copy on the left half, media placeholder on the right, vertically centred.
 9  Full-bleed photo — placeholder edge to edge, 72% scrim, headline and micro-
    caption over it.
10  Pull quote — dark band, quote at H2 Bold with real quotation marks, attribution
    beneath at Small in the accent colour.
11  Data table — header row in the overline style at 55% ink over a single full-ink
    rule. No vertical rules, no zebra striping.
12  Spotlight — portrait placeholder left; name, what they build, and one honest
    quote on the right.
13  Closing CTA — dark band, an H1 invitation, one CTA pill, wordmark, website.

VOICE — write every line of placeholder copy this way:
Written by humans, for one human at a time. Members are "interesting humans", never
"users", "attendees" or "stakeholders". Be honest about the hard parts — impostor
syndrome, cash flow, self-doubt named out loud alongside the wins. Stay invitational:
every section ends with an open door, nobody is qualified in or out. Root it in the
actual place — Cagliari, the Blue Zone, the aperitivo, the sea fifteen minutes from
the city centre. Specifics beat adjectives; "vibrant ecosystem of synergies" is the
failure state. Short sentences land the point.
  Fun taglines: "Jump in. The water's warm." / "Good people. Good ideas. Paradise."
  Pro taglines: "More than networking. A movement." / "Where good ideas and good
  people find each other."
  True facts you can use: 200+ members, 15+ nationalities, 22+ events across 16
  venues, 30+ guest entrepreneurs, a community founded in Cagliari, Sardinia.

Start with slide 1 and work through to 13.
```

**Caveat:** without Apps Script nothing lands in the slide *masters* — these are 13
real slides you duplicate, not layouts under Insert → New slide.

---

## 2. Claude Design → HTML slide template set

```
Build a set of presentation slide templates for "Entrepreneurs Meet" (EMC), a
non-profit entrepreneur community in Cagliari, Sardinia.

Format: a single self-contained HTML page. Each slide is a 16:9 section
(aspect-ratio 16/9, max-width 1280px, stacked vertically with a gap so the whole set
reads as a specimen sheet). Arrow keys / scroll navigation is enough — this is a
template set to be reviewed and reused, not a live deck runtime. No external
requests: inline all CSS, no CDN, no remote fonts.

Deliver BOTH brand modes in one page, toggled by `data-mode="fun" | "pro"` on the
root, with every colour driven by CSS custom properties so the toggle re-dresses
everything with zero per-element overrides. Within any single slide the mode is
absolute — the two palettes never appear in the same artifact.

── TOKENS (define exactly these; never write a raw hex in a rule) ──
[data-mode="fun"]   Coral & Indigo — warm, candid, the public default
  --page      #E4EDF0   pale sky
  --ink       #14264F   indigo — body text, dark bands, CTAs, overlays
  --band-deep #0C1832
  --card      #223B66
  --accent    #F0453E   coral — accents, eyebrows on dark, glyphs
  --highlight #F4B740   amber highlighter, one phrase per slide maximum
  --eyebrow   #0B5474   cerulean, for eyebrows on light bands only

[data-mode="pro"]   Blue Slate — composed, for partners and institutions
  --page      #2A3340
  --band-alt  #1B222C
  --band-deep #12161D
  --ink       #FFFFFF
  --accent    #8FA6BC   steel
  --highlight #C6D3DE   pale steel
Pro structural tells that Fun does not get: CTAs are ghost pills with a 3px white
ring, every photo takes a 1px white frame, cards on dark bands are white, section
eyebrows carry a 2px rule that draws left→right.

Tints come from alpha over the base (`rgb(from var(--ink) r g b / 0.6)`), never from
new hexes. Muted text never drops below 60% alpha. Body text is always ink on page —
AA or better. Coral is never used for small text on the pale-sky page.

Distribution: slides alternate light page → dark band → light page. Coral and amber
together stay under a tenth of any composition.

── TYPE ──
Alcyone is the brand typeface: `font-family: 'Alcyone', sans-serif` with Inter as the
substitute where Alcyone isn't loadable. Use system-ui/Inter here and keep the
Alcyone-first stack in the CSS so dropping the woff2 in later just works. ONE family
across every size — the warmth comes from colour, copy and photography, not from a
second font.
Weights: 400 body · 500 labels/captions · 600 emphasis · 700 headings/CTAs/stats ·
400 italic for editorial asides only, never whole paragraphs.
Fluid scale, all `clamp()` from a 360px to a 1280px viewport, each step with its own
optical line-height and tracking:
  --fs-hero     69→96px   lh 1     ls −0.03em
  --fs-display  57→86px   lh 1.04
  --fs-h1       48→69px   lh 1.08→0.95
  --fs-h2       40→55px   lh 1.12
  --fs-h3       33→44px   lh 1.2
  --fs-h4       28→35px   lh 1.25
  --fs-h5       23→28px   lh 1.3
  --fs-lead     19→22.5px lh 1.4
  --fs-body     16→18px   lh 1.6
  --fs-small    13→14.5px lh 1.45
  --fs-overline 12→13px   ls 0.08em
Hierarchy recipe on almost every slide, in order: eyebrow (overline, Bold, uppercase,
2px tracking) → heading (Bold, tight leading) → lead + body (measure under 38em) →
caption (Medium, uppercase, 0.5px tracking, 60% ink).

── SHAPES ──
Exactly three radii: pill 30px (buttons, toggles, tags), 12px (cards, photos),
24px (large panels). No shadows, no gradients, no glow, no borders beyond the ones
specified.

── MOTION (entrance language only — nothing loops, nothing fidgets) ──
One easing curve everywhere: cubic-bezier(0.22, 1, 0.36, 1). Durations 0.45–0.65s.
Groups stagger 80–120ms per child via animation-delay.
  fade-up    0.55s, 16px rise — the default; hero children on load
  lift-up    0.5s, 24px rise — cards and stats (fill-mode: both, so hover states go
             on an inner wrapper, never on the animated element itself)
  rule-draw  0.45s, scaleX from left — rules and underlines, ~80ms after their card
  slide-left / slide-right  0.6s, 32px — split layouts, media 80ms behind copy
  blur-in    0.65s, 3px blur → focus — reserved for community quotes
Under `prefers-reduced-motion: reduce`, every entrance renders in its final state
instantly. This is a contract, not a nicety.

── PHOTOGRAPHY ──
Use CSS-only placeholders (flat brand surfaces at 12px radius) labelled with the brief:
real photographs from actual EMC gatherings, natural light, real venues, unposed,
people mid-conversation or mid-laugh. Crowded frames are good frames in Fun; wider,
calmer compositions in Pro. Never stock, never staged handshakes, never AI crowd
shots. Text over a photo requires the mode's scrim at 72%. Every photo carries a
micro-caption — VENUE · MONTH YEAR, uppercase, 0.5px tracking, 60% ink — with the
photographer credited on the opposite edge when known.

── THE SLIDES (build each in both modes) ──
 1  Cover — dark band, wordmark, hero headline, subtitle, place + date
 2  Section divider — oversized ghost numeral at 10% ink behind the section title
 3  Agenda / index — numbered, one line each
 4  Statement — one Display-size claim, ≤12 words, one phrase carrying the amber
    highlighter swash (Fun) or pale-steel emphasis (Pro)
 5  Big number — a single stat at hero size with one line of meaning, nothing else
 6  Stat row — three stats, Bold H2 numbers, Small labels at 80%
 7  Three pillar cards — each topped by a 1px rule that draws in from the left
 8  Split — copy left, media right, slide-left/slide-right paired
 9  Full-bleed photo — 72% scrim, headline and micro-caption over it
10  Pull quote — blur-in entrance, quote at H2, attribution in the accent colour
11  Data table — overline header row at 55% ink over a 1px full-ink rule; no vertical
    rules, no zebra fill
12  Spotlight — portrait, name, what they build, one honest quote
13  Closing CTA — dark band, invitation headline, one CTA pill, wordmark, URL

── CTAs ──
A verb with a destination, ending in an arrow: "Come to Your First Event →",
"Join the Community →", "Offer Your Venue →". Uppercase, 1px tracking. A CTA keeps
its name through the whole flow. Fun: solid pill. Pro: ghost pill with the 3px ring.
Never "Don't miss out" / "Last chance" / urgency theatre.

── VOICE FOR EVERY LINE OF PLACEHOLDER COPY ──
Written by humans, for one human at a time. Members are "interesting humans", never
"users" or "attendees" — no corporate plural, no "stakeholders". Honest about the
hard parts: impostor syndrome, cash flow, self-doubt, named out loud alongside the
wins. Invitational — every section ends with an open door, nobody is qualified in or
out. Rooted in place: Cagliari, the Blue Zone, the aperitivo, the sea fifteen minutes
from the centre. Specifics beat adjectives; "vibrant ecosystem of synergies" is the
failure state. Short sentences land the point.
Fun taglines: "Jump in. The water's warm." / "Good people. Good ideas. Paradise."
Pro taglines: "More than networking. A movement." /
"Where good ideas and good people find each other."
Real facts available for placeholders: 200+ members, 15+ nationalities, 22+ events
across 16 venues, 30+ guest entrepreneurs.

If a slide type can't be assembled from these parts, question the slide before
questioning the parts.
```

---

## Logo assets

Neither prompt embeds the wordmark — both reference it by placement rule. The decks
in this repo carry their own copies in `<deck>/img/`, vendored from the logo kit that
`scripts/build-logo-kit.mjs` generates in the emc repo:

| Mode · band | File |
|---|---|
| Fun · light page | `wordmark-fun-light.svg` |
| Fun · dark band | `wordmark-fun-dark.svg` |
| Pro · slate page & bands | `wordmark-pro-slate.svg` |
| Pro · white / print | `wordmark-pro-white.svg` |

Clear space is one cap-height of the "E" on all four sides. Minimum width 200px
digital — below that use the logomark, `logomark-fun-{light,dark}.svg`, which is also
what `.slide__mark` puts in the slide corner.
