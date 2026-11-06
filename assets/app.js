// Grzegorz Dzikiewicz - static prototype behaviour.
// Skeleton loading: sections reveal in reading order once fonts and the hero portrait are ready.
// Demo switches: ?skeleton keeps the skeleton on screen, ?instant skips it, ?formfail shows the sign-up rollback.
(function () {
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  const main = document.querySelector('main');
  const live = document.querySelector('[aria-live]');
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasIO = 'IntersectionObserver' in window;

  // ---- runs once the skeleton is gone: reveal on scroll, count-up numbers ----
  let loaded = false;
  function afterLoad() {
    if (loaded) return;
    loaded = true;
    if (calm || !hasIO) return;

    const targets = document.querySelectorAll(
      '.c .man-in > *, .c .sec-head > *, .c .sec-head > div > *, .c .model, .c .n, .c .film-copy > *, .c .film, ' +
      '.c .steps, .c .qa, .c .perk, .c .form, .c .foot-word > *, .c .foot-g > div');
    const seen = new Map();
    targets.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight * 0.9) return; // already on screen: leave it be
      const i = seen.get(el.parentElement) || 0;
      seen.set(el.parentElement, i + 1);
      el.style.setProperty('--d', Math.min(i * 0.08, 0.48) + 's');
      el.classList.add('rv');
    });
    const ro = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); ro.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    document.querySelectorAll('.rv').forEach((el) => ro.observe(el));

    const co = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        co.unobserve(en.target);
        const el = en.target, to = +el.dataset.to, t0 = performance.now(), dur = 1400;
        const tick = (t) => {
          const k = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - k, 3);
          el.textContent = Math.round(to * e);
          if (k < 1) requestAnimationFrame(tick);
        };
        el.textContent = '0';
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('.c .count').forEach((el) => co.observe(el));
  }

  // ---- scroll progress line ----
  const bar = document.querySelector('.progress');
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.setProperty('--sp', max > 0 ? (scrollY / max).toFixed(4) : 0);
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- active nav link ----
  if (hasIO) {
    const links = document.querySelectorAll('[data-spy]');
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => a.classList.toggle('on', a.dataset.spy === en.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['modele', 'o-mnie', 'proces', 'dolacz', 'kontakt'].forEach((id) => { const el = document.getElementById(id); if (el) spy.observe(el); });
  }

  // ---- hero cursor glow (mouse / trackpad only) ----
  const hero = document.querySelector('.hero');
  if (hero && !calm && window.matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      hero.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  }

  // ---- mobile sticky CTA: after the hero, hidden while the form or footer is on screen ----
  const mbar = document.querySelector('.mbar');
  if (mbar && hasIO) {
    const state = { hero: true, join: false, foot: false };
    const update = () => {
      const show = !state.hero && !state.join && !state.foot;
      mbar.classList.toggle('show', show);
      mbar.setAttribute('aria-hidden', show ? 'false' : 'true');
      mbar.tabIndex = show ? 0 : -1;
    };
    const mo = new IntersectionObserver((entries) => {
      entries.forEach((en) => { state[en.target.dataset.mbar] = en.isIntersecting; });
      update();
    });
    [['.hero', 'hero'], ['#dolacz', 'join'], ['.foot', 'foot']].forEach(([sel, key]) => {
      const el = document.querySelector(sel); if (el) { el.dataset.mbar = key; mo.observe(el); }
    });
  }

  // ---- process path filter ----
  function setPath(path) {
    const steps = document.querySelector('.c .steps');
    if (steps) steps.dataset.current = path;
    document.querySelectorAll('.c .path [data-path]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.path === path ? 'true' : 'false'));
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.path [data-path]');
    if (b) transition(() => setPath(b.dataset.path));
    const m = e.target.closest('[data-set-path]');
    if (m) setPath(m.dataset.setPath);
  });

  // ---- copy e-mail ----
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-copy]');
    if (!b) return;
    const done = () => { b.textContent = 'Skopiowano'; b.classList.add('ok'); setTimeout(() => { b.textContent = 'Kopiuj'; b.classList.remove('ok'); }, 2000); };
    if (navigator.clipboard) navigator.clipboard.writeText(b.dataset.copy).then(done, () => {});
  });

  function reveal(step) {
    document.querySelectorAll('[data-s="' + step + '"]').forEach((el) => el.classList.add('done'));
  }
  function finish() {
    root.classList.remove('sk-on');
    if (main) main.setAttribute('aria-busy', 'false');
    if (live) live.textContent = 'Strona załadowana';
    afterLoad();
  }

  if (params.has('instant')) {
    finish();
  } else if (!params.has('skeleton')) {
    const portrait = new Image();
    const imgReady = new Promise((res) => { portrait.onload = portrait.onerror = res; portrait.src = 'assets/grzegorz.jpg'; });
    const minDelay = Promise.resolve(); // no artificial wait: the skeleton shows only while the page really loads
    const cap = new Promise((res) => setTimeout(res, 1200)); // never hold real content longer than this
    Promise.race([Promise.all([imgReady, minDelay]), cap]).then(() => {
      for (let i = 1; i <= 8; i++) setTimeout(() => { reveal(i); if (i === 8) finish(); }, (i - 1) * 60);
    });
  }

  // ---- view transitions: smooth state swaps where the browser supports them ----
  function transition(update) {
    if (calm || !document.startViewTransition) { update(); return; }
    document.startViewTransition(update);
  }

  // ---- blurred previews: fade each photo in over its blur once it has loaded ----
  document.querySelectorAll('.portrait .ph img, .film img').forEach((img) => {
    const done = () => img.classList.add('is-loaded');
    if (img.complete && img.naturalWidth) done();
    else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true }); }
  });

  // ---- mobile menu: back gesture closes it, swipe down dismisses it ----
  const menu = document.querySelector('.menu-w');
  const panel = menu && menu.querySelector('.menu');
  const opener = document.querySelector('[data-open-menu]');
  let menuEntry = false; // true while our history entry for the open menu is on the stack

  const behind = () => [...document.body.children].filter((el) => el !== menu && el.tagName !== 'SCRIPT');
  function showMenu(open) {
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    behind().forEach((el) => { el.inert = open; });
    if (panel) { panel.classList.remove('leaving', 'dragging'); panel.style.transform = ''; }
    if (open) { const c = menu.querySelector('[data-close-menu]'); if (c) c.focus(); }
    else if (opener) opener.focus();
  }
  function openMenu() {
    if (!menu || !menu.hidden) return;
    history.pushState({ menu: true }, '');
    menuEntry = true;
    showMenu(true);
  }
  // how: 'button' (also Escape and swipe) pops our history entry, 'link' keeps it so the anchor jump still works
  function closeMenu(how) {
    if (!menu || menu.hidden) return;
    showMenu(false);
    if (how === 'button' && menuEntry) { menuEntry = false; history.back(); }
    else menuEntry = false;
  }
  addEventListener('popstate', () => {
    // Android predictive back and the browser back button land here
    if (menu && !menu.hidden) { menuEntry = false; showMenu(false); }
  });
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-open-menu]')) openMenu();
    else {
      const c = e.target.closest('[data-close-menu]');
      if (c) closeMenu(c.tagName === 'A' && c.getAttribute('href').startsWith('#') ? 'link' : 'button');
    }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu && !menu.hidden) closeMenu('button'); });

  if (panel) {
    let y0 = 0, t0 = 0, dy = 0, dragging = false;
    panel.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' || !e.target.closest('.menu-top, .grab')) return; // drag from the handle; the list itself scrolls
      dragging = true; y0 = e.clientY; t0 = performance.now(); dy = 0;
      panel.classList.add('dragging');
      try { panel.setPointerCapture(e.pointerId); } catch (_) { /* pointer already gone: the drag still works without capture */ }
    });
    panel.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      dy = Math.max(0, e.clientY - y0); // only downward
      panel.style.transform = 'translateY(' + dy + 'px)';
    });
    const end = () => {
      if (!dragging) return;
      dragging = false;
      panel.classList.remove('dragging');
      const v = dy / Math.max(1, performance.now() - t0); // px per ms
      if (dy > 120 || v > 0.6) {
        panel.style.transform = '';
        panel.classList.add('leaving');
        setTimeout(() => closeMenu('button'), calm ? 0 : 280);
      } else {
        panel.style.transform = ''; // springs back; the CSS transition can be interrupted by a new drag
      }
    };
    panel.addEventListener('pointerup', end);
    panel.addEventListener('pointercancel', end);
  }

  // video: swap the poster for the Vimeo player on click (no third-party load until then)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.film[data-vimeo] .play');
    if (!btn) return;
    e.preventDefault(); // without JS the link opens the film on Vimeo
    const film = btn.closest('.film');
    const id = film.getAttribute('data-vimeo');
    const f = document.createElement('iframe');
    f.src = 'https://player.vimeo.com/video/' + id + '?autoplay=1&title=0&byline=0&portrait=0&dnt=1&color=C9A96E';
    f.title = 'Okazje na flipa z Warszawskim Dealerem Nieruchomości';
    f.allow = 'autoplay; fullscreen; picture-in-picture';
    f.allowFullscreen = true;
    f.className = 'film-player';
    film.replaceChildren(f);
    film.classList.add('playing');
  });

  // segmented investor type
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.seg [data-type]');
    if (!b) return;
    b.parentElement.querySelectorAll('[data-type]').forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
  });

  // ---- sign-up form: optimistic success, rolled back if the send fails ----
  // Set SIGNUP_ENDPOINT to the real API when the backend exists. Until then sends are simulated.
  const SIGNUP_ENDPOINT = '';
  const form = document.getElementById('join-form');
  const newKey = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(16).slice(2));
  let idemKey = newKey(); // one key per submission: retries of the same sign-up reuse it, so the server never stores it twice
  let inFlight = false;

  function sendSignup(data) {
    if (!SIGNUP_ENDPOINT) return new Promise((res, rej) => setTimeout(params.has('formfail') ? () => rej(new Error('demo')) : res, 600)); // ?formfail demos the rollback
    return fetch(SIGNUP_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idemKey },
      body: JSON.stringify(data)
    }).then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); });
  }

  if (form) {
    const idle = document.querySelector('.form-idle');
    const sent = document.querySelector('.form-sent');
    const err = form.querySelector('.form-err');
    const btn = form.querySelector('button[type=submit]');
    form.addEventListener('input', (e) => { e.target.classList.remove('invalid'); if (err) err.hidden = true; });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (inFlight) return; // double-click guard
      const bad = [...form.querySelectorAll('input[required]')].filter((i) => !i.checkValidity());
      bad.forEach((i) => i.classList.add('invalid'));
      if (bad.length) { bad[0].focus(); return; }

      const pressed = form.querySelector('.seg [aria-pressed=true]');
      const data = {
        name: form.querySelector('#f-name').value.trim(),
        email: form.querySelector('#f-mail').value.trim(),
        type: pressed ? pressed.dataset.type : null
      };
      inFlight = true;
      btn.disabled = true;

      // optimistic: show the success state right away
      const name = data.name.split(/\s+/)[0];
      const hello = sent.querySelector('.hello');
      if (hello) hello.textContent = name ? ', ' + name : '';
      transition(() => { idle.hidden = true; sent.hidden = false; });
      const t = sent.querySelector('.form-t');
      if (t) { t.setAttribute('tabindex', '-1'); t.focus(); }

      sendSignup(data).then(() => {
        idemKey = newKey(); // next sign-up is a new submission
      }).catch(() => {
        // roll back: bring the filled-in form back with a message. The same key is kept for the retry.
        transition(() => { sent.hidden = true; idle.hidden = false; });
        if (err) { err.textContent = 'Nie udało się wysłać zgłoszenia. Sprawdź połączenie i spróbuj ponownie.'; err.hidden = false; }
        btn.focus();
      }).finally(() => { inFlight = false; btn.disabled = false; });
    });
  }
})();
