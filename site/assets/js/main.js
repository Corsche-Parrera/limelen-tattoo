(() => {
  const IMG = 'assets/img/';

  const works = [
    [1, 960, 1280], [2, 605, 1080], [3, 605, 1080], [4, 1179, 1547], [5, 1179, 1539], [6, 853, 1280],
    [7, 960, 1280], [8, 960, 1280], [9, 605, 1080], [10, 1179, 2054], [11, 1179, 1553], [12, 1179, 1532],
    [13, 1179, 1529], [14, 1179, 2037], [15, 1179, 1553], [16, 1179, 1556], [17, 776, 1280], [18, 1179, 1560],
    [19, 720, 1080], [20, 719, 1080], [21, 1179, 1520], [22, 719, 1080], [23, 810, 1080], [24, 719, 1080],
    [25, 720, 1080], [26, 720, 1080], [27, 960, 1280], [28, 605, 1080], [29, 720, 1080], [30, 503, 763],
    [31, 720, 1080], [32, 605, 1080],
  ].map(([n, w, h]) => ({ src: `${IMG}work-${String(n).padStart(2, '0')}.jpg`, w, h, type: 'tattoo', alt: `Татуировка, работа ${n}` }));

  const piercing = [
    [1, 1680, 2240], [2, 1680, 2240], [3, 960, 1280], [4, 1179, 1541], [5, 960, 1280], [6, 1179, 2096],
  ].map(([n, w, h]) => ({ src: `${IMG}piercing-${n}.jpg`, w, h, type: 'piercing', alt: `Пирсинг, работа ${n}` }));

  const studio = [
    [3, 1179, 871], [2, 1179, 1564], [5, 1179, 874], [1, 1179, 2093], [7, 1179, 1199],
    [6, 1179, 651], [4, 1179, 2076], [8, 1179, 1755],
  ].map(([n, w, h]) => ({ src: `${IMG}studio-${n}.jpg`, w, h, alt: 'Студия GLOW в Красноярске' }));
  studio.splice(2, 0, { src: `${IMG}glow-mirror.jpg`, w: 388, h: 512, alt: 'Неоновая вывеска GLOW в студии' });

  const reviews = [
    [1, 1179, 2094], [2, 1106, 2051], [3, 932, 1629], [4, 1179, 2100], [5, 995, 1836], [6, 859, 1539],
    [7, 1179, 2556], [8, 1019, 1799], [9, 969, 1732], [10, 1179, 2081], [11, 1179, 2039], [12, 1179, 2049],
  ].map(([n, w, h]) => ({ src: `${IMG}review-${String(n).padStart(2, '0')}.jpg`, w, h, alt: `Отзыв клиента ${n}` }));

  // Interleave piercing into the tattoo feed so "Все" doesn't end with a block of piercing
  const all = [];
  works.forEach((item, i) => {
    all.push(item);
    if (i % 5 === 4 && piercing[(i - 4) / 5]) all.push(piercing[(i - 4) / 5]);
  });

  /* Lightbox */
  const lb = document.getElementById('lightbox');
  const lbImg = lb.querySelector('.lightbox__img');
  const lbCount = lb.querySelector('.lightbox__count');
  let lbItems = [];
  let lbIndex = 0;
  let lbReturnFocus = null;

  function lbShow(i) {
    lbIndex = (i + lbItems.length) % lbItems.length;
    const item = lbItems[lbIndex];
    lbImg.src = item.src;
    lbImg.alt = item.alt;
    lbCount.textContent = `${lbIndex + 1} / ${lbItems.length}`;
  }

  function lbOpen(items, i) {
    lbItems = items;
    lbReturnFocus = document.activeElement;
    lb.hidden = false;
    document.body.classList.add('is-locked');
    lbShow(i);
    lb.querySelector('.lightbox__close').focus();
  }

  function lbClose() {
    lb.hidden = true;
    lbImg.removeAttribute('src');
    document.body.classList.remove('is-locked');
    if (lbReturnFocus) lbReturnFocus.focus();
  }

  lb.querySelector('.lightbox__close').addEventListener('click', lbClose);
  lb.querySelector('.lightbox__nav--prev').addEventListener('click', () => lbShow(lbIndex - 1));
  lb.querySelector('.lightbox__nav--next').addEventListener('click', () => lbShow(lbIndex + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) lbClose(); });
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') lbClose();
    if (e.key === 'ArrowLeft') lbShow(lbIndex - 1);
    if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
  });

  let touchX = null;
  lb.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) lbShow(lbIndex + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  function makeButton(item, cls, onClick) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = cls;
    btn.setAttribute('aria-label', `Открыть фото: ${item.alt}`);
    const img = document.createElement('img');
    img.src = item.src;
    img.width = item.w;
    img.height = item.h;
    img.alt = item.alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    btn.append(img);
    btn.addEventListener('click', onClick);
    return btn;
  }

  /* Gallery */
  const gallery = document.getElementById('gallery');
  const moreBtn = document.getElementById('more');
  const PAGE = 12;
  let filter = 'all';
  let shown = PAGE;

  function currentList() {
    if (filter === 'tattoo') return works;
    if (filter === 'piercing') return piercing;
    return all;
  }

  function renderGallery() {
    const list = currentList();
    const visible = list.slice(0, shown);
    gallery.replaceChildren(...visible.map((item, i) =>
      makeButton(item, 'gallery__item', () => lbOpen(list, i))));
    moreBtn.parentElement.hidden = shown >= list.length;
  }

  document.querySelectorAll('.filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter').forEach((b) => {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-selected', String(b === btn));
      });
      filter = btn.dataset.filter;
      shown = PAGE;
      renderGallery();
    });
  });

  moreBtn.addEventListener('click', () => {
    shown += PAGE;
    renderGallery();
  });

  renderGallery();

  /* Strips */
  function renderStrip(id, items) {
    const el = document.getElementById(id);
    el.replaceChildren(...items.map((item, i) => makeButton(item, 'strip__item', () => lbOpen(items, i))));
  }
  renderStrip('studio-strip', studio);
  renderStrip('reviews-strip', reviews);

  /* Why: swap the sticky photo to match the hovered/visible item */
  const whyImg = document.getElementById('why-img');
  const whyItems = document.querySelectorAll('.why__list li');
  let whyCurrent = whyImg.getAttribute('src');

  function setWhy(li) {
    whyItems.forEach((x) => x.classList.toggle('is-active', x === li));
    const next = IMG + li.dataset.img;
    if (next === whyCurrent) return;
    whyCurrent = next;
    whyImg.classList.add('is-fading');
    const pre = new Image();
    pre.onload = () => {
      whyImg.src = next;
      whyImg.classList.remove('is-fading');
    };
    pre.src = next;
  }

  whyItems.forEach((li) => li.addEventListener('mouseenter', () => setWhy(li)));
  if (whyItems.length) {
    whyItems[0].classList.add('is-active');
    const whyObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setWhy(e.target); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    whyItems.forEach((li) => whyObserver.observe(li));
  }

  /* Header + mobile menu */
  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.classList.toggle('is-locked', open);
  }
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) setMenu(false);
  });

  /* Reveal on scroll */
  const revealTargets = document.querySelectorAll('.section__head, .why__list li, .facts li, .about__pics, .steps li, .form, .contacts, .rent');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-visible');
      revealObserver.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  revealTargets.forEach((el) => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });

  document.getElementById('year').textContent = new Date().getFullYear();

  /* Booking form */
  const form = document.getElementById('lead-form');
  const status = document.getElementById('form-status');
  const TG_FALLBACK = '<a href="https://t.me/ELEONORA_Lim" target="_blank" rel="noopener">напиши мне в Telegram</a>';

  function setStatus(html, kind) {
    status.innerHTML = html;
    status.className = 'form__status' + (kind ? ` is-${kind}` : '');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const digits = phone.replace(/\D/g, '');

    form.name.setAttribute('aria-invalid', String(!name));
    form.phone.setAttribute('aria-invalid', String(digits.length < 10));

    if (!name || digits.length < 10) {
      setStatus('Заполни имя и телефон, чтобы я могла связаться.', 'error');
      (name ? form.phone : form.name).focus();
      return;
    }
    if (!form.consent.checked) {
      setStatus('Нужно согласие на обработку персональных данных.', 'error');
      form.consent.focus();
      return;
    }

    const payload = {
      name,
      phone,
      services: [...form.querySelectorAll('input[name="service"]:checked')].map((i) => i.value),
      idea: form.idea.value.trim(),
      website: form.website.value,
    };

    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    setStatus('Отправляю…');

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setStatus('Заявка отправлена! Скоро свяжусь с тобой ✦', 'ok');
    } catch {
      setStatus(`Не получилось отправить заявку. Пожалуйста, ${TG_FALLBACK} или позвони.`, 'error');
    } finally {
      submit.disabled = false;
    }
  });
})();
