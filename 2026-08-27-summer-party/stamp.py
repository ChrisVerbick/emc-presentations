#!/usr/bin/env python3
"""Stamp deck.css, deck.js and the img/site captures with a content hash.

These are the files regenerated in place under an unchanged name,
so a browser will happily serve a stale copy after an update. Run after editing
the CSS/JS or re-shooting any screenshot.
"""
import hashlib, pathlib, re

d = pathlib.Path(__file__).parent
h = lambda rel: hashlib.sha256((d / rel).read_bytes()).hexdigest()[:8]
p = d / 'index.html'
s = p.read_text()

s = re.sub(r'href="deck\.css[^"]*"', f'href="deck.css?v={h("deck.css")}"', s)
s = re.sub(r'src="deck\.js[^"]*"',  f'src="deck.js?v={h("deck.js")}"', s)

def stamp(m):
    rel = m.group(1)
    return f'src="{rel}?v={h(rel)}"' if (d / rel).exists() else m.group(0)

# Speaker images too: they get renumbered in place, so the same filename can
# carry different content — the worst case for a cached copy.
s, n = re.subn(r'src="(img/(?:site|speakers)/[^"?]+)(?:\?v=[0-9a-f]+)?"', stamp, s)
p.write_text(s)
print(f'  stamped deck.css, deck.js and {n} screenshots')
