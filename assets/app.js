// Grzegorz Dzikiewicz - static prototype behaviour.
// Skeleton loading: sections reveal in reading order once fonts and the hero portrait are ready.
// Demo switches: ?skeleton keeps the skeleton on screen, ?instant skips it.
(function () {
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  const main = document.querySelector('main');
  const live = document.querySelector('[aria-live]');

  function reveal(step) {
    document.querySelectorAll('[data-s="' + step + '"]').forEach((el) => el.classList.add('done'));
  }
  function finish() {
    root.classList.remove('sk-on');
    if (main) main.setAttribute('aria-busy', 'false');
    if (live) live.textContent = 'Strona załadowana';
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
        const sent = document.querySelector('.form-sent');
        sent.hidden = false;
        const t = sent.querySelector('.form-t');
        if (t) { t.setAttribute('tabindex', '-1'); t.focus(); }
      }, 1400);
    });
  }
})();
