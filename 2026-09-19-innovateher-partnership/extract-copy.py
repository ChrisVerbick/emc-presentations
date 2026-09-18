import re, html, pathlib
from html.parser import HTMLParser

SRC = pathlib.Path('index.html').read_text()
SRC_NC = re.sub(r'<!--.*?-->', lambda m: '\n' * m.group(0).count('\n'), SRC, flags=re.S)

# Bilingual deck: copy is <span lang="en">…</span><span lang="it">…</span> pairs (leaf
# spans, never nested), and each slide has data-label-<lang>. One pass per language,
# with the other language's spans stripped before parsing.
LANGS = {'en': ('copy.md', 'Innovate\u200aHer partnership — deck copy (EN)'),
         'it': ('copy.it.md', 'Partnership Innovate\u200aHer — copia del deck (IT)')}

def source_for(lang):
    other = [l for l in LANGS if l != lang]
    src = SRC_NC
    for o in other:
        src = re.sub(r'<span lang="%s">.*?</span>' % o, '', src, flags=re.S)
    return src

clean = lambda t: re.sub(r'\s+', ' ', html.unescape(t)).strip()

TEXT_BLOCK = {'h1','h2','h3','h4','p','li','span','b'}
PAIR_BLOCK = re.compile(r'\b(glyph-card|shot|swatch)\b')
SKIP_CLASS = re.compile(r'\b(slide__head|video-hint|video-missing|shot__frame|speaker__photo|done)\b')
VOID = {'br','img','source','input','hr','meta','link','path','polygon','use'}

class Walk(HTMLParser):
    """Every tag gets a frame. Frames that aren't blocks are transparent: their text
    folds into the nearest block ancestor. Without a frame per tag, a plain inner
    </div> popped an outer block div early and split its parts apart."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out, self.stack, self.skip = [], [], 0
    def _block(self):
        for f in reversed(self.stack):
            if f['emit']: return f
        return None
    def handle_starttag(self, tag, attrs):
        if tag in VOID:
            if tag == 'br':
                b = self._block()
                if b: b['buf'].append('\n')
            return
        cls = dict(attrs).get('class', '')
        if self.skip or SKIP_CLASS.search(cls):
            self.skip += 1; return
        emit = tag in TEXT_BLOCK or bool(PAIR_BLOCK.search(cls))
        self.stack.append({'tag': tag, 'cls': cls, 'buf': [], 'kids': [], 'emit': emit,
                           'pair': bool(PAIR_BLOCK.search(cls)),
                           'foot': any('slide__foot' in f['cls'] for f in self.stack) or 'slide__foot' in cls})
    def handle_endtag(self, tag):
        if tag in VOID: return
        if self.skip:
            self.skip -= 1; return
        if not self.stack: return
        f = self.stack.pop()
        if not f['emit']:
            if f['buf']:
                b = self._block()
                if b: b['buf'].append(''.join(f['buf']))
                else:
                    t = clean(''.join(f['buf']))
                    if t: self.out.append(('p', f['cls'], t, f['foot']))
            for k in f['kids']:
                b = self._block()
                (b['kids'] if b else None) and b['kids'].append(k)
            return
        txt = ' — '.join(f['kids']) if f['pair'] and f['kids'] else clean(''.join(f['buf']))
        if not txt: return
        parent = self._block()
        if parent:
            parent['buf'].append(' ' + txt + ' '); parent['kids'].append(txt)
        else:
            self.out.append((f['tag'], f['cls'], txt, f['foot']))
    def handle_data(self, d):
        if self.skip: return
        b = self._block()
        if b:
            b['buf'].append(d)
        elif clean(d):
            # No block ancestor: emit now, in document order. Buffering it onto the
            # enclosing layout div deferred it past any child block that closed first.
            cls = self.stack[-1]['cls'] if self.stack else ''
            foot = any('slide__foot' in f['cls'] for f in self.stack)
            self.out.append(('p', cls, clean(d), foot))

EXCLUDE = re.compile(r'^$')  # nothing excluded yet — no bio streams in this deck

for LANG, (OUT, TITLE) in LANGS.items():
    src = source_for(LANG)
    sections = re.findall(r'<section class="slide[^"]*"[^>]*>(.*?)</section>', src, re.S)
    labels = re.findall(r'<section class="slide[^"]*"([^>]*)>', src)
    L = [f"# {TITLE}", "",
         "Copy for every slide. Slide numbers match the live deck. The standing running",
         "header is omitted; footers appear as `footer:` where they carry anything of their own.", ""]
    n_all = n_inc = 0
    for attrs, body in zip(labels, sections):
        n_all += 1
        m = re.search(r'data-label-%s="([^"]*)"' % LANG, attrs) or re.search(r'data-label="([^"]*)"', attrs)
        if not m: continue
        lab = clean(m.group(1))
        if EXCLUDE.match(lab): continue
        n_inc += 1
        w = Walk(); w.feed(body)
        L += [f"## {n_all:02d} · {lab}", ""]
        if not w.out:
            L += ["_(no copy — image only)_", ""]; continue
        prev_list = False
        for tag, cls, txt, foot in w.out:
            is_list = tag == 'li' or bool(PAIR_BLOCK.search(cls))
            if prev_list and not is_list: L.append("")
            if foot:                            L += [f"footer: {txt}", ""]
            elif tag in ('h1','h2','h3','h4'):  L += [f"### {txt}", ""]
            elif is_list:                       L += [f"- {txt}"]
            elif 'eyebrow' in cls or 'duo__tag' in cls: L += [f"**{txt}**", ""]
            else:                               L += [txt, ""]
            prev_list = is_list
        if L[-1] != "": L.append("")
    pathlib.Path(OUT).write_text(re.sub(r'\n{3,}', '\n\n', '\n'.join(L)) + '\n')
    print(f"  {LANG}: slides {n_all}, written {n_inc}, excluded {n_all - n_inc} → {OUT}")
