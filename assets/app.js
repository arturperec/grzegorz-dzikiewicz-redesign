// Grzegorz Dzikiewicz - static prototype behaviour.
// Skeleton loading: sections reveal in reading order once fonts and the hero portrait are ready.
// Demo switches: ?skeleton keeps the skeleton on screen, ?instant skips it.
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
      '.c .steps, .c .perk, .c .form, .c .foot-word > *, .c .foot-g > div');
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
    if (b) setPath(b.dataset.path);
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
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    const minDelay = new Promise((res) => setTimeout(res, 900));
    const cap = new Promise((res) => setTimeout(res, 4000));
    Promise.race([Promise.all([imgReady, fontsReady, minDelay]), cap]).then(() => {
      for (let i = 1; i <= 7; i++) setTimeout(() => { reveal(i); if (i === 7) finish(); }, (i - 1) * 300);
    });
  }

  // mobile menu
  const menu = document.querySelector('.menu-w');
  const opener = document.querySelector('[data-open-menu]');
  function setMenu(open) {
    if (!menu) return;
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { const c = menu.querySelector('[data-close-menu]'); if (c) c.focus(); }
    else if (opener) opener.focus();
  }
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-open-menu]')) setMenu(true);
    else if (e.target.closest('[data-close-menu]')) setMenu(false);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu && !menu.hidden) setMenu(false); });

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

  // sign-up form (prototype: no backend yet)
  const form = document.getElementById('join-form');
  if (form) {
    form.addEventListener('input', (e) => e.target.classList.remove('invalid'));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const bad = [...form.querySelectorAll('input[required]')].filter((i) => !i.checkValidity());
      bad.forEach((i) => i.classList.add('invalid'));
      if (bad.length) { bad[0].focus(); return; }
      const btn = form.querySelector('button[type=submit]');
      btn.disabled = true;
      btn.querySelector('.when-idle').hidden = true;
      btn.querySelector('.when-sending').hidden = false;
      setTimeout(() => {
        document.querySelector('.form-idle').hidden = true;
        const name = (form.querySelector('#f-name').value || '').trim().split(/\s+/)[0];
        const hello = document.querySelector('.form-sent .hello');
        if (hello && name) hello.textContent = ', ' + name;
        const sent = document.querySelector('.form-sent');
        sent.hidden = false;
        const t = sent.querySelector('.form-t');
        if (t) { t.setAttribute('tabindex', '-1'); t.focus(); }
      }, 1400);
    });
  }
})();
