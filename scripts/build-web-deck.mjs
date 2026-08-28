#!/usr/bin/env node
/**
 * Web build: a deck as one self-contained HTML file.
 *
 * The venue build is tuned for a projector and a laptop with no network — full-size
 * photography, a multi-megabyte film, seventy-odd separate files. None of that suits
 * an embedded viewer in the members' Library, so this collapses a deck directory into
 * a single file:
 *
 *   - video slides are dropped (the film is the speaker's, and it dwarfs everything else)
 *   - every raster is re-encoded to WebP, capped at the 1600x900 authoring canvas
 *   - CSS, JS, fonts and images are inlined as data: URIs
 *
 * The summer party deck goes from 23.6 MB across 72 files to 6.6 MB in one, which you
 * upload to a Library item. It still runs offline from file://, the same promise the
 * venue build makes — there is simply nothing left for it to fetch.
 *
 *   node scripts/build-web-deck.mjs 2026-08-27-summer-party
 */
import sharp from 'sharp';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_DIR = path.join(ROOT, 'dist');

/**
 * The authoring canvas is a fixed 1600x900 and nothing reflows, so no image can ever
 * render larger than that box — a full-bleed photograph fills it exactly and everything
 * else is smaller. Fitting inside the canvas rather than inside a 1600 square is what
 * makes portraits honest: a 1200x1800 bio shot renders in a 3:4 slot at most 600x900,
 * so a 1600-square cap would carry three times the pixels it can ever show.
 *
 * Sources are never upscaled.
 */
const CANVAS = { width: 1600, height: 900 };

/** Matches scripts/optimize-images.mjs in the emc repo — tuned for this photography. */
const WEBP = { quality: 72 };

const MIME = {
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
    '.webp': 'image/webp',
};

const RASTER = new Set(['.jpg', '.jpeg', '.png']);

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
const mb = (n) => `${(n / 1048576).toFixed(1)} MB`;

/**
 * Strip every <section class="slide"> that carries a <video>, plus the .video-missing
 * card that sits beside it. Done on the raw string rather than a DOM: the deck is
 * hand-written HTML with one section per slide and no nesting, and pulling in a parser
 * to walk a flat list would be the only dependency this script didn't need.
 */
function dropVideoSlides(html) {
    let dropped = 0;
    const out = html.replace(/[ \t]*<section class="slide[\s\S]*?<\/section>\n?/g, (section) =>
        /<video[\s>]/.test(section) ? (dropped++, '') : section
    );
    return { html: out, dropped };
}

/** Every asset path referenced by the HTML, minus the cache-busting stamp. */
function assetRefs(text) {
    const refs = new Set();
    for (const m of text.matchAll(/(?:src|href)="([^"#:]+?)(?:\?v=[0-9a-f]+)?"/g)) {
        if (m[1] !== 'deck.css' && m[1] !== 'deck.js') refs.add(m[1]);
    }
    for (const m of text.matchAll(/url\('([^']+)'\)/g)) refs.add(m[1]);
    return refs;
}

/**
 * Encode one asset to a data: URI. Rasters go through sharp; everything else — SVG,
 * woff2 — is already as small as it is going to get and passes through untouched.
 */
async function inline(deckDir, rel) {
    const abs = path.join(deckDir, rel);
    const ext = path.extname(rel).toLowerCase();
    const before = (await stat(abs)).size;

    if (RASTER.has(ext)) {
        const buf = await sharp(abs)
            .resize({ ...CANVAS, fit: 'inside', withoutEnlargement: true })
            .webp(WEBP)
            .toBuffer();
        return { uri: `data:image/webp;base64,${buf.toString('base64')}`, before, after: buf.length };
    }

    const buf = await readFile(abs);
    const mime = MIME[ext] ?? 'application/octet-stream';
    return { uri: `data:${mime};base64,${buf.toString('base64')}`, before, after: buf.length };
}

/** Swap every reference to `rel` — HTML attribute or CSS url() — for its data: URI. */
function replaceRef(text, rel, uri) {
    const esc = rel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text
        .replace(new RegExp(`(src|href)="${esc}(\\?v=[0-9a-f]+)?"`, 'g'), (_, attr) => `${attr}="${uri}"`)
        .replace(new RegExp(`url\\('${esc}'\\)`, 'g'), `url('${uri}')`);
}

const slug = process.argv[2];
if (!slug) {
    console.error('usage: node scripts/build-web-deck.mjs <deck-directory>');
    process.exit(1);
}

const deckDir = path.join(ROOT, slug);
let html = await readFile(path.join(deckDir, 'index.html'), 'utf8');
// deck.css carries its own url() references — the four Alcyone faces and the banner
// art. They have to be rewritten here, before the stylesheet is folded into the page,
// or they resolve against the Library's origin and 404.
let css = await readFile(path.join(deckDir, 'deck.css'), 'utf8');
const js = await readFile(path.join(deckDir, 'deck.js'), 'utf8');

const sourceSize = Buffer.byteLength(html) + Buffer.byteLength(css) + Buffer.byteLength(js);

console.log(`\nWeb deck — ${slug}\n`);

const slidesBefore = (html.match(/<section class="slide/g) ?? []).length;
({ html } = ((r) => (console.log(`  slides: ${slidesBefore} → ${slidesBefore - r.dropped}  (${r.dropped} video)`), r))(
    dropVideoSlides(html)
));

const refs = [...assetRefs(html), ...assetRefs(css)].filter((v, i, a) => a.indexOf(v) === i);
let before = sourceSize;
let after = sourceSize;

for (const rel of refs.sort()) {
    const r = await inline(deckDir, rel);
    before += r.before;
    after += r.after;
    html = replaceRef(html, rel, r.uri);
    css = replaceRef(css, rel, r.uri);
}
console.log(`  assets: ${refs.length} inlined`);

// Fold the stylesheet and the script into the document. Nothing is left to fetch.
html = html
    .replace(/<link rel="stylesheet" href="deck\.css[^"]*">/, `<style>\n${css}\n</style>`)
    .replace(/<script src="deck\.js[^"]*"><\/script>/, `<script>\n${js}\n</script>`);

if (/(?:src|href)="(?!data:)[^"#]/.test(html.replace(/<!--[\s\S]*?-->/g, ''))) {
    console.error('\n  ERROR: a reference survived un-inlined — the deck would fetch it at runtime.');
    for (const m of html.replace(/<!--[\s\S]*?-->/g, '').matchAll(/(?:src|href)="((?!data:)[^"#][^"]*)"/g)) {
        console.error(`    ${m[1]}`);
    }
    process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });
const out = path.join(OUT_DIR, `${slug}.deck.html`);
await writeFile(out, html);

const final = (await stat(out)).size;
console.log(`\n  ${mb(before)} across ${refs.length + 3} files  →  ${mb(final)} in one`);
console.log(`  (assets ${mb(before - sourceSize)} → ${mb(after - sourceSize)}, +33% base64)\n`);
console.log(`  → dist/${slug}.deck.html  (${kb(final)})\n`);
