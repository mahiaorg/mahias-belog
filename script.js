'use strict';

// Filter visibility and accessible selection share a single implementation.
function initFilter(buttonSelector, itemSelector, buttonKey, itemKey, statusId) {
  const buttons = Array.from(document.querySelectorAll(buttonSelector));
  const items = Array.from(document.querySelectorAll(itemSelector));
  const status = document.getElementById(statusId);
  function select(value, announce) {
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset[buttonKey] === value)));
    let count = 0;
    items.forEach(item => {
      item.hidden = value !== 'all' && !(item.dataset[itemKey] || '').split(/\s+/).includes(value);
      if (!item.hidden) count++;
    });
    if (status && announce) status.textContent = count + ' ' + (statusId === 'project-status' ? 'projects' : 'skill groups') + ' shown';
  }
  buttons.forEach(button => button.addEventListener('click', () => select(button.dataset[buttonKey], true)));
  select('all', false);
}
initFilter('.skill-filter-btn', '.skill-category-block', 'filter', 'category', 'skill-status');
initFilter('.pfilter-btn', '.project-card', 'pfilter', 'ptag', 'project-status');

// Prepare an email; sending is performed by the visitor's email app.
(function initContact() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.hidden = false;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const message = form.elements.message.value.trim();
    if (!name || !message) {
      document.getElementById('form-feedback').textContent = 'Please enter your name and a message.';
      return;
    }
    const subject = 'Portfolio enquiry from ' + name;
    const body = message + '\n\nFrom: ' + name + '\nReply to: ' + email;
    document.getElementById('form-feedback').textContent = 'Continue in your email app to send. If it does not open, use the direct email link. Your message stays here.';
    window.location.href = 'mailto:mahiatavakkoli9@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });
})();
const year = document.getElementById('copyright-year');
if (year) year.textContent = String(new Date().getFullYear());

document.getElementById('copy-email').addEventListener('click', async () => {
  const status = document.getElementById('copy-email-status');
  try {
    await navigator.clipboard.writeText('mahiatavakkoli9@gmail.com');
    status.textContent = 'Email address copied.';
    document.getElementById('copy-email').textContent = 'Email copied';
  } catch {
    status.textContent = 'Copy is unavailable. Select the email address above to copy it.';
    status.className = 'contact-help';
  }
});

    // Responsive hobbies carousel: one position per card advance.
    (function initHobbiesCarousel() {
      const track = document.getElementById('hobbies-track');
      const viewport = document.getElementById('hobbies-carousel-viewport');
      const dotsContainer = document.getElementById('hobby-dots-container');
      const prev = document.getElementById('hobby-prev-btn');
      const next = document.getElementById('hobby-next-btn');
      const slides = Array.from(document.querySelectorAll('.hobby-card-slide'));
      if (!track || !viewport || !dotsContainer || !slides.length) return;
      let index = 0, maxIndex = 0, step = 0, pointer = null, visible = 1;
      const status = document.getElementById('hobby-status');
      function render() {
        slides.forEach((slide, i) => { slide.setAttribute('aria-hidden', String(i < index || i >= index + visible)); });
        if (status) status.textContent = 'Showing hobbies ' + (index + 1) + ' to ' + Math.min(slides.length, index + visible) + ' of ' + slides.length;
        track.style.transform = 'translateX(-' + (step * index) + 'px)';
        Array.from(dotsContainer.children).forEach((dot, i) => {
          dot.setAttribute('aria-current', i === index ? 'true' : 'false');
        });
      }
      function goTo(position) {
        index = Math.max(0, Math.min(position, maxIndex));
        render();
      }
      function measure() {
        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        const width = slides[0].getBoundingClientRect().width;
        if (!width || !viewport.clientWidth) return;
        step = width + gap;
        visible = Math.max(1, Math.round((viewport.clientWidth + gap) / step));
        maxIndex = Math.max(0, slides.length - visible);
        index = Math.min(index, maxIndex);
        if (dotsContainer.children.length !== maxIndex + 1) {
          const focused = dotsContainer.contains(document.activeElement);
          dotsContainer.replaceChildren();
          for (let i = 0; i <= maxIndex; i++) {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'hobby-dot';
            dot.setAttribute('aria-label', 'Show hobbies starting at card ' + (i + 1));
            dot.setAttribute('aria-controls', 'hobbies-track');
            dot.addEventListener('click', () => goTo(i));
            dotsContainer.appendChild(dot);
          }
          if (focused) dotsContainer.children[index].focus();
        }
        if (prev) prev.disabled = maxIndex === 0;
        if (next) next.disabled = maxIndex === 0;
        render();
      }
      if (prev) prev.addEventListener('click', () => goTo(index === 0 ? maxIndex : index - 1));
      if (next) next.addEventListener('click', () => goTo(index === maxIndex ? 0 : index + 1));
      viewport.addEventListener('pointerdown', event => {
        if (!event.isPrimary || event.button !== 0) return;
        pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
        viewport.setPointerCapture(event.pointerId);
      });
      viewport.addEventListener('pointerup', event => {
        if (!pointer || pointer.id !== event.pointerId) return;
        const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
        pointer = null;
        if (Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy)) {
          goTo(dx < 0 ? (index === maxIndex ? 0 : index + 1) : (index === 0 ? maxIndex : index - 1));
        }
      });
      viewport.addEventListener('pointercancel', () => { pointer = null; });
      viewport.addEventListener('lostpointercapture', () => { pointer = null; });
      viewport.addEventListener('keydown', event => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        goTo(index + (event.key === 'ArrowRight' ? 1 : -1));
      });
      window.addEventListener('resize', measure);
      if (typeof ResizeObserver !== 'undefined') new ResizeObserver(measure).observe(viewport);
      measure();
    })();

// Accessible mobile navigation disclosure.
(function initMobileNavigation() {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const navigation = document.getElementById('mobile-navigation');
  const header = document.querySelector('.site-header');
  if (!toggle || !navigation || !header) return;
  function setOpen(open, restoreFocus = false) {
    navigation.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    if (restoreFocus) toggle.focus();
  }
  toggle.addEventListener('click', () => setOpen(navigation.hidden));
  navigation.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    setOpen(false);
    const href = link.getAttribute('href');
    const target = href && href !== '#' ? document.querySelector(href) : null;
    if (target) {
      const hadTabindex = target.hasAttribute('tabindex');
      if (!hadTabindex) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      if (!hadTabindex) target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    } else toggle.focus();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !navigation.hidden) setOpen(false, true);
  });
  document.addEventListener('click', event => {
    if (!navigation.hidden && !header.contains(event.target)) setOpen(false);
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', event => {
    if (event.matches) setOpen(false);
  });
})();

// Keep desktop and mobile navigation in sync with the visible section.
(function initSectionNavigation() {
  const links = Array.from(document.querySelectorAll('.site-header nav a[href^="#"]')).filter(link => link.getAttribute('href').length > 1);
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  if (!sections.length) return;
  function update() {
    const marker = document.querySelector('.site-header-row').getBoundingClientRect().bottom + 32;
    let active = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= marker) active = section;
    }
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) active = sections[sections.length - 1];
    for (const link of links) {
      if (link.getAttribute('href') === '#' + active.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }
  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; update(); });
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('load', schedule);
  update();
})();

// Lightweight, time-based decorative motion with a user-controlled pause.
(function initMotion() {
  const hero = document.getElementById('home');
  const ambient = document.getElementById('ambient-bubbles-canvas');
  const cursor = document.getElementById('cursor-bubbles-canvas');
  const button = document.getElementById('motion-toggle');
  const context = ambient && ambient.getContext('2d');
  const trail = cursor && cursor.getContext('2d');
  if (!hero || !context || !trail) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(pointer: fine)');
  let paused = false, width = 0, height = 0, ambientFrame = 0, cursorFrame = 0;
  let cursorWidth = 0, cursorHeight = 0;
  let visible = true;
  let lastAmbient = 0, lastCursor = 0, lastSpawn = 0;
  const bubbles = [], particles = [];
  const canAnimate = () => !paused && !reduced.matches && !document.hidden;
  function size(canvas, ctx, width, height) {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  const palette = [[196,181,253], [168,85,247], [254,240,138], [244,114,182], [129,140,248], [56,189,248]];
  function drawAmbient() {
    context.clearRect(0, 0, width, height);
    for (const bubble of bubbles) {
      const radius = bubble.radius * (1 + Math.sin(bubble.phase) * 0.08);
      const alpha = bubble.alpha + Math.sin(bubble.phase) * 0.04;
      const rgb = bubble.color.join(',');
      const gradient = context.createRadialGradient(bubble.x - radius * .3, bubble.y - radius * .3, radius * .1, bubble.x, bubble.y, radius);
      gradient.addColorStop(0, 'rgba(255,255,255,' + alpha * 1.5 + ')');
      gradient.addColorStop(.35, 'rgba(' + rgb + ',' + alpha * .9 + ')');
      gradient.addColorStop(.85, 'rgba(' + rgb + ',' + alpha * .5 + ')');
      gradient.addColorStop(1, 'rgba(' + rgb + ',0)');
      context.save();
      context.beginPath();
      context.arc(bubble.x, bubble.y, radius, 0, Math.PI * 2);
      context.fillStyle = gradient;
      context.fill();
      context.strokeStyle = 'rgba(255,255,255,' + alpha * .6 + ')';
      context.lineWidth = 1;
      context.stroke();
      context.beginPath();
      context.ellipse(bubble.x - radius * .36, bubble.y - radius * .36, radius * .22, radius * .12, Math.PI / 4, 0, Math.PI * 2);
      context.fillStyle = 'rgba(255,255,255,' + alpha * 1.8 + ')';
      context.fill();
      context.restore();
    }
  }
  function animateAmbient(time) {
    ambientFrame = 0;
    if (!visible || !canAnimate()) return;
    const dt = lastAmbient ? Math.min((time - lastAmbient) / 1000, 0.05) : 0;
    lastAmbient = time;
    for (const bubble of bubbles) {
      bubble.phase += dt * .9;
      bubble.x += (bubble.drift + Math.sin(bubble.phase) * 14) * dt;
      bubble.y -= bubble.speed * dt;
      if (bubble.x < -bubble.radius) bubble.x = width + bubble.radius;
      if (bubble.x > width + bubble.radius) bubble.x = -bubble.radius;
      if (bubble.y < -bubble.radius) bubble.y = height + bubble.radius;
    }
    drawAmbient();
    ambientFrame = requestAnimationFrame(animateAmbient);
  }
  function animateCursor(time) {
    cursorFrame = 0;
    if (!canAnimate()) return;
    const dt = lastCursor ? Math.min((time - lastCursor) / 1000, 0.05) : 0;
    lastCursor = time;
    trail.clearRect(0, 0, cursorWidth, cursorHeight);
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      particle.life -= dt;
      if (particle.life <= 0) { particles.splice(i, 1); continue; }
      particle.y -= particle.speed * dt;
      particle.x += particle.drift * dt;
      particle.radius += dt * 2;
      trail.beginPath();
      trail.save();
      trail.globalAlpha = Math.max(0, particle.life / particle.duration);
      trail.shadowBlur = 14;
      trail.shadowColor = particle.color;
      trail.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      trail.fillStyle = particle.color;
      trail.fill();
      trail.beginPath();
      trail.arc(particle.x - particle.radius * .3, particle.y - particle.radius * .3, particle.radius * .35, 0, Math.PI * 2);
      trail.fillStyle = '#fff';
      trail.fill();
      trail.restore();
    }
    if (particles.length) cursorFrame = requestAnimationFrame(animateCursor);
    else lastCursor = 0;
  }
  function sync() {
    cancelAnimationFrame(ambientFrame);
    cancelAnimationFrame(cursorFrame);
    ambientFrame = cursorFrame = 0;
    lastAmbient = lastCursor = 0;
    particles.length = 0;
    trail.clearRect(0, 0, cursorWidth, cursorHeight);
    drawAmbient();
    if (visible && canAnimate()) ambientFrame = requestAnimationFrame(animateAmbient);
    hero.dataset.motion = visible && canAnimate() ? 'running' : 'paused';
    if (button) {
      button.disabled = reduced.matches;
      button.setAttribute('aria-pressed', String(paused || reduced.matches));
      button.textContent = reduced.matches ? 'Reduced motion enabled' : paused ? 'Resume animations' : 'Pause animations';
    }
  }
  function resize() {
    width = hero.clientWidth;
    height = hero.clientHeight;
    cursorWidth = document.documentElement.clientWidth;
    cursorHeight = window.innerHeight;
    size(ambient, context, width, height);
    size(cursor, trail, cursorWidth, cursorHeight);
    bubbles.length = 0;
    for (let i = 0; i < Math.max(18, Math.min(32, Math.floor(width / 45))); i++) {
      bubbles.push({ x: Math.random() * width, y: Math.random() * height, radius: 14 + Math.random() * 24, speed: 15 + Math.random() * 27, drift: (Math.random() - .5) * 27, phase: Math.random() * Math.PI * 2, color: palette[i % palette.length], alpha: .13 + Math.random() * .05 });
    }
    sync(); // Redraw even when motion is paused or reduced.
  }
  window.addEventListener('pointermove', event => {
    if (!canAnimate() || !finePointer.matches || event.pointerType !== 'mouse') return;
    const x = event.clientX, y = event.clientY;
    const now = performance.now();
    if (now - lastSpawn < 16) return;
    lastSpawn = now;
    if (particles.length < 90) {
      const colors = ['#c084fc', '#a855f7', '#818cf8', '#38bdf8', '#fde047', '#f472b6', '#34d399'];
      for (let i = 0; i < 2; i++) {
        const duration = .55 + Math.random() * .6;
        particles.push({ x: x + (Math.random() - .5) * 12, y: y + (Math.random() - .5) * 12, life: duration, duration, radius: 2.5 + Math.random() * 4.5, speed: 48 + Math.random() * 108, drift: (Math.random() - .5) * 84, color: colors[Math.floor(Math.random() * colors.length)] });
      }
    }
    if (!cursorFrame) { lastCursor = 0; cursorFrame = requestAnimationFrame(animateCursor); }
  }, { passive: true });
  if (button) button.addEventListener('click', () => { paused = !paused; sync(); });
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('resize', resize);
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(resize).observe(hero);
  if (typeof IntersectionObserver !== 'undefined') new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }, { rootMargin: '-80px 0px 0px 0px' }).observe(hero);
  resize();
})();
