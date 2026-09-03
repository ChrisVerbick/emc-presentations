/* ═══════════════════════════════════════════════════════════════════════════
   EMC deck engine — keyboard, mouse, USB pointer, touch, video.

   No dependencies and no build step: this file runs from file:// on the
   presenting laptop with the network unplugged, which is the point.

   Slides are authored at a fixed 1600×900 (see deck.css) and this scales the
   canvas to fit. Everything else here is input handling.
   ═══════════════════════════════════════════════════════════════════════════ */
(() => {
    'use strict';

    const canvas = document.getElementById('canvas');
    const slides = Array.from(document.querySelectorAll('.slide'));
    const progress = document.getElementById('progress');
    const counter = document.getElementById('counter');
    const overview = document.getElementById('overview');
    const slideNo = document.getElementById('slideno');
    const root = document.documentElement;

    if (!slides.length) return;

    const DESIGN_W = 1600;
    const DESIGN_H = 900;

    let index = 0;
    let idleTimer = null;

    /* ── Scaling ─────────────────────────────────────────────────────────── */

    // A 16:9 slide on an upright phone renders as a strip about a fifth of the
    // screen tall. This used to lay the canvas on its side to fill the display,
    // which suits a deck you opened on purpose and startles a reader who has just
    // tapped a link and found the page lying down. Ask instead, and let them turn
    // the device — coarse pointers only, since a narrow window is resizable.
    const coarse = window.matchMedia('(pointer:coarse)');
    let turnDismissed = false;

    const turn = document.createElement('div');
    turn.id = 'turn';
    turn.setAttribute('role', 'status');
    turn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"'
        + ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
        + '<rect x="8" y="2" width="8" height="14" rx="1.6"></rect>'
        + '<path d="M4.5 15.5a8 8 0 0 0 7 6.4"></path><path d="M4.2 19.4 4.5 15.4l4 .4">'
        + '</path></svg>'
        + '<span>Turn your phone for a full-size slide</span>'
        + '<button type="button" aria-label="Dismiss">\u00d7</button>';
    turn.querySelector('button').addEventListener('click', () => {
        turnDismissed = true;
        body.classList.remove('cramped');
    });

    function fit() {
        const vw = window.innerWidth, vh = window.innerHeight;
        const upright = Math.min(vw / DESIGN_W, vh / DESIGN_H);
        const sideways = Math.min(vh / DESIGN_W, vw / DESIGN_H);
        canvas.style.setProperty('--scale', upright);
        // Only worth asking when turning buys real size: a phone held upright gains
        // ~1.8x, a tablet ~1.4x, a near-square window nothing. No device sniffing.
        body.classList.toggle('cramped',
            coarse.matches && !turnDismissed && sideways > upright * 1.25);
    }

    /* ── Navigation ──────────────────────────────────────────────────────── */

    function show(next, { restartVideo = true } = {}) {
        const target = Math.max(0, Math.min(slides.length - 1, next));
        if (target === index && slides[index].hasAttribute('data-active')) return;

        // Leaving a slide always stops its video — a talk track continuing under
        // the next slide is the worst failure mode here.
        const leaving = slides[index];
        if (leaving) {
            leaving.removeAttribute('data-active');
            const v = leaving.querySelector('video');
            if (v) { v.pause(); if (restartVideo) v.currentTime = 0; leaving.removeAttribute('data-video-playing'); }
        }

        index = target;
        const slide = slides[index];
        slide.setAttribute('data-active', '');

        // Mode is per-slide: the rebrand reveal can flip to Pro and back.
        root.setAttribute('data-mode', slide.dataset.mode || 'fun');

        if (slideNo) {
            slideNo.textContent = String(index + 1).padStart(2, '0');
            // Match the band rather than hard-coding a colour: the deck alternates
            // light and dark slides and one fixed value would vanish on half of them.
            slideNo.style.color = getComputedStyle(slide).color;
        }

        progress.style.width = `${((index + 1) / slides.length) * 100}%`;
        counter.textContent = `${String(index + 1).padStart(2, '0')} / ${slides.length}`;

        if (slide.querySelector('video')) armVideoDeadline(slide);
        if (slide.dataset.autoplay !== undefined) playVideo(slide);
        syncOverview();
        // Deep-link the slide number. Guarded because the deck is also embedded in a
        // sandboxed iframe in the members' Library, where the document has an opaque
        // origin. Chrome allows a fragment-only replaceState there — verified — but
        // the History API has a thin history of agreeing across engines, and a slide
        // deck losing navigation mid-talk is not the place to find out.
        try { history.replaceState(null, '', `#${index + 1}`); } catch {}
    }

    const next = () => show(index + 1);
    const prev = () => show(index - 1);

    /* ── Video ───────────────────────────────────────────────────────────── */

    function playVideo(slide) {
        const v = (slide || slides[index]).querySelector('video');
        if (!v) return;
        v.play().then(() => {
            (slide || slides[index]).setAttribute('data-video-playing', '');
        }).catch(() => {
            if (v.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
                (slide || slides[index]).setAttribute('data-video-missing', '');
            }
            // Autoplay with sound is blocked until the page has been interacted
            // with. Presenting always involves a keypress or click first, so this
            // only bites on a slide entered before any input — leave the poster up.
        });
    }

    /**
     * Last-resort check: if a slide's video has not produced a frame shortly after the
     * slide opens, show the "not found" poster. Generous, because a large local
     * file is legitimately slow to produce its first frame and the poster is only
     * an overlay — it clears itself the moment data arrives.
     *
     * The event-based signals below cover a clean 404, but not every transport fails
     * cleanly — served over HTTP with a redirect to HTTPS, a missing file comes back as
     * a 301 to an HTML error page and the element simply sits in NETWORK_LOADING
     * forever. A deadline catches every variant, and `loadeddata` clears it again if a
     * slow file does arrive.
     */
    function armVideoDeadline(slide) {
        const v = slide.querySelector('video');
        if (!v) return;
        clearTimeout(v._deadline);
        if (v.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return;
        v._deadline = setTimeout(() => {
            if (v.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
                slide.setAttribute('data-video-missing', '');
            }
        }, 8000);
    }

    function toggleVideo() {
        const slide = slides[index];
        const v = slide.querySelector('video');
        if (!v) return false;
        if (v.paused) {
            v.play().then(() => slide.setAttribute('data-video-playing', ''));
        } else {
            v.pause();
            slide.removeAttribute('data-video-playing');
        }
        return true;
    }

    function scrubVideo(seconds) {
        const v = slides[index].querySelector('video');
        if (!v) return false;
        v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + seconds));
        return true;
    }

    // Mark slides whose media is missing, so it is discovered now and not on stage.
    //
    // Subtle: when a <video> uses <source> children, a failed load fires `error` on the
    // LAST <source>, never on the <video> itself — the video only reports
    // networkState = NETWORK_NO_SOURCE. Listening on the video alone silently misses it
    // and the slide plays black. Watch both.
    slides.forEach((slide) => {
        const v = slide.querySelector('video');
        if (!v) return;

        const markMissing = () => slide.setAttribute('data-video-missing', '');
        const check = () => {
            if (v.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) markMissing();
        };

        v.addEventListener('error', markMissing);
        v.querySelectorAll('source').forEach((src) => src.addEventListener('error', check));
        v.addEventListener('stalled', check);
        v.addEventListener('loadeddata', () => {
            clearTimeout(v._deadline);
            slide.removeAttribute('data-video-missing');
        });
        v.addEventListener('ended', () => slide.removeAttribute('data-video-playing'));

        // Belt and braces: the source errors race the first paint, so re-check shortly
        // after load. Cheap, and the alternative is finding out in front of a room.
        setTimeout(check, 1200);
    });

    /* ── Overlays ────────────────────────────────────────────────────────── */

    const body = document.body;
    const toggleClass = (name) => body.classList.toggle(name);
    const clearOverlays = () => body.classList.remove('overview', 'help', 'blanked', 'blanked-white');

    // Thumbnails are live clones of the slides, scaled down — cheaper and always
    // in sync, where a screenshot pipeline would need a build step and would go
    // stale the moment a slide is edited.
    function buildOverview() {
        overview.innerHTML = '';
        slides.forEach((slide, i) => {
            const card = document.createElement('div');
            card.className = 'card';

            const thumb = document.createElement('div');
            thumb.className = 'thumb';
            // Tokens resolve off [data-mode] on any ancestor, so carrying the slide's
            // own mode here keeps a Pro slide Pro inside a Fun deck.
            thumb.setAttribute('data-mode', slide.dataset.mode || 'fun');
            const copy = slide.cloneNode(true);
            copy.setAttribute('data-active', '');
            // Drop media from the clone: a cloned <video preload="auto"> fetches the
            // whole file a second time just to sit in a 300px thumbnail.
            copy.querySelectorAll('video').forEach((el) => {
                const ph = document.createElement('div');
                ph.style.cssText = 'position:absolute;inset:0;background:#000';
                el.replaceWith(ph);
            });
            thumb.appendChild(copy);

            card.appendChild(thumb);
            card.insertAdjacentHTML('beforeend',
                `<b>${String(i + 1).padStart(2, '0')}</b><span>${slide.dataset.label || ''}</span>`);
            card.addEventListener('click', () => { body.classList.remove('overview'); show(i); });
            overview.appendChild(card);
        });
    }

    // Cards have no width until the grid is displayed, so the scale is measured on
    // open rather than at build time.
    function sizeThumbs() {
        const card = overview.querySelector('.card');
        if (card && card.clientWidth) {
            const w = card.clientWidth;
            overview.style.setProperty('--thumb-scale', w / DESIGN_W);
            overview.style.gridAutoRows = `${w * DESIGN_H / DESIGN_W}px`;
        }
    }

    function syncOverview() {
        Array.from(overview.children).forEach((c, i) =>
            i === index ? c.setAttribute('data-current', '') : c.removeAttribute('data-current'));
    }

    /* ── Input ───────────────────────────────────────────────────────────── */

    // USB presentation remotes almost all emit PageDown/PageUp. Some Logitech
    // units send F5 to start and Esc to stop instead, and a few send "." to blank
    // — all handled below so a clicker works without configuration.
    const FORWARD = new Set(['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Spacebar', 'Enter', 'n', 'N']);
    const BACK = new Set(['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace', 'p', 'P']);

    window.addEventListener('keydown', (e) => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        const k = e.key;

        // Overlays swallow navigation while open.
        if (body.classList.contains('help')) {
            if (k === 'Escape' || k === '?' || k === '/') { body.classList.remove('help'); e.preventDefault(); }
            return;
        }
        if (body.classList.contains('overview')) {
            if (k === 'Escape' || k === 'o' || k === 'O') { body.classList.remove('overview'); e.preventDefault(); }
            else if (FORWARD.has(k)) { show(index + 1); e.preventDefault(); }
            else if (BACK.has(k)) { show(index - 1); e.preventDefault(); }
            return;
        }
        if (body.classList.contains('blanked') || body.classList.contains('blanked-white')) {
            // Any key restores — fumbling for the right one in a dark room is worse.
            clearOverlays();
            e.preventDefault();
            return;
        }

        // Space plays/pauses a video rather than advancing, which is what a
        // presenter expects while a film is on screen.
        if ((k === ' ' || k === 'Spacebar' || k === 'k' || k === 'K') && slides[index].querySelector('video')) {
            if (toggleVideo()) { e.preventDefault(); return; }
        }

        if (FORWARD.has(k)) { next(); e.preventDefault(); return; }
        if (BACK.has(k)) { prev(); e.preventDefault(); return; }

        switch (k) {
            case 'Home': show(0); break;
            case 'End': show(slides.length - 1); break;
            case 'f': case 'F': case 'F5': toggleFullscreen(); break;
            case 'Escape': if (document.fullscreenElement) document.exitFullscreen(); break;
            case 'b': case 'B': case '.': body.classList.toggle('blanked'); break;
            case 'w': case 'W': case ',': body.classList.toggle('blanked-white'); break;
            case 'o': case 'O': toggleClass('overview'); sizeThumbs(); syncOverview(); break;
            case '?': case '/': toggleClass('help'); break;
            case 'm': case 'M': {
                const slide = slides[index];
                slide.dataset.mode = (slide.dataset.mode === 'pro') ? 'fun' : 'pro';
                root.setAttribute('data-mode', slide.dataset.mode);
                break;
            }
            case 'ArrowRight': case 'ArrowLeft': break;
            default:
                if (/^[0-9]$/.test(k)) { /* number keys jump: 1-9 */ show(parseInt(k, 10) - 1); }
                return;
        }
        e.preventDefault();
    });

    function toggleFullscreen() {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen?.().catch(() => {});
    }

    // Click zones. A click on a video slide plays/pauses instead of advancing.
    document.querySelector('#navzones .prev').addEventListener('click', prev);
    document.querySelector('#navzones .next').addEventListener('click', () => {
        if (slides[index].querySelector('video') && toggleVideo()) return;
        next();
    });

    // Mouse wheel — horizontal only, and deliberately throttled so a trackpad's
    // inertia doesn't skip four slides on one flick. Vertical belongs to whatever
    // is embedding the deck: in the Library's iframe a plain scroll down the page
    // was walking the deck forward under the reader.
    let wheelLock = 0;
    window.addEventListener('wheel', (e) => {
        if (body.classList.contains('overview')) return;
        const now = Date.now();
        if (now - wheelLock < 600) return;
        if (Math.abs(e.deltaX) < 20) return;
        wheelLock = now;
        e.deltaX > 0 ? next() : prev();
    }, { passive: true });

    // Touch — for reviewing on a tablet.
    let touchX = null, touchY = null;
    window.addEventListener('touchstart', (e) => {
        touchX = e.changedTouches[0].clientX; touchY = e.changedTouches[0].clientY;
    }, { passive: true });
    window.addEventListener('touchend', (e) => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        const dy = e.changedTouches[0].clientY - touchY;
        // Horizontal only. A swipe up or down is the reader scrolling the page the
        // deck is embedded in, not a request for the next slide.
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) dx < 0 ? next() : prev();
        touchX = touchY = null;
    }, { passive: true });

    // Hide the cursor and chrome when idle, so a still slide photographs cleanly.
    function wake() {
        body.classList.remove('idle');
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => body.classList.add('idle'), 2500);
    }
    ['mousemove', 'keydown', 'touchstart', 'click'].forEach((ev) =>
        window.addEventListener(ev, wake, { passive: true }));

    /* ── Boot ────────────────────────────────────────────────────────────── */

    window.addEventListener('resize', () => { fit(); sizeThumbs(); });
    body.appendChild(turn);
    fit();
    buildOverview();

    // Deep link: #7 opens on slide 7, so a rehearsal can resume where it stopped.
    const fromHash = parseInt((location.hash || '').slice(1), 10);
    show(Number.isFinite(fromHash) && fromHash > 0 ? fromHash - 1 : 0, { restartVideo: false });
    wake();
})();
