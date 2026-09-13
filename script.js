// =========================================================
// MARQUEE — duplicate the phrase sequence once so the
// scroll-left keyframe (-50%) loops with no seam/gap
// (applies to every .marquee on the page, not just one)
// =========================================================
function setupMarquee() {
  document.querySelectorAll('.marquee').forEach(track => {
    track.innerHTML = track.innerHTML + track.innerHTML;
  });
}
setupMarquee();

// =========================================================
// HERO NOTE — draw the arrow, then write the name in
// letter by letter, like it's being handwritten
// =========================================================
function setupHeroNote() {
  const note = document.querySelector('.hero-note');
  const textEl = document.querySelector('.hero-note-text');
  if (!note || !textEl) return;

  const lines = textEl.innerHTML.split(/<br\s*\/?>/i);
  textEl.innerHTML = lines
    .map(line =>
      line
        .trim()
        .split('')
        .map(ch => (ch === ' ' ? ' ' : `<span class="letter">${ch}</span>`))
        .join('')
    )
    .join('<br>');

  const letters = textEl.querySelectorAll('.letter');
  const arrowDrawTime = 650; // ms, matches the draw-arrow CSS animation
  letters.forEach((el, i) => {
    el.style.animationDelay = `${arrowDrawTime + i * 65}ms`;
  });

  requestAnimationFrame(() => {
    setTimeout(() => note.classList.add('in-view'), 30);
  });
}

// =========================================================
// PAGE LOADER
// Runs as soon as the DOM is ready — NOT on window "load",
// which would wait for every video on the page to finish
// downloading before the loader (and the hero-note writing
// animation it triggers) ever starts.
// =========================================================
function runPageLoader() {
  const loader = document.querySelector('.page-loader');
  const number = document.querySelector('.loader-number');
  const line = document.querySelector('.loader-line span');
  let pct = 0;

  const tick = setInterval(() => {
    pct += Math.floor(Math.random() * 12) + 4;
    if (pct >= 100) {
      pct = 100;
      clearInterval(tick);
      setTimeout(() => {
        loader && loader.classList.add('done');
        setupHeroNote();
      }, 250);
    }
    if (number) number.textContent = pct.toString().padStart(2, '0') + '%';
    if (line) line.style.width = pct + '%';
  }, 90);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runPageLoader);
} else {
  runPageLoader();
}

// =========================================================
// MENU TOGGLE
// =========================================================
const menuButton = document.getElementById('menuButton');
const menuOverlay = document.getElementById('menuOverlay');
const menuClose = document.getElementById('menuClose');

menuButton && menuButton.addEventListener('click', () => menuOverlay.classList.add('open'));
menuClose && menuClose.addEventListener('click', () => menuOverlay.classList.remove('open'));

document.querySelectorAll('.menu-links a').forEach(link => {
  link.addEventListener('click', () => menuOverlay.classList.remove('open'));
});

// =========================================================
// CUSTOM CURSOR
// =========================================================
const cursor = document.querySelector('.cursor');
const cursorText = document.querySelector('.cursor-text');

if (cursor && window.matchMedia('(hover: hover)').matches) {
  window.addEventListener(
    'mousemove',
    (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
      if (!cursor.classList.contains('ready')) cursor.classList.add('ready');
    },
    { passive: true }
  );

  document.querySelectorAll('.video-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      cursor.classList.add('active');
      if (cursorText) cursorText.textContent = 'VIEW';
    });
    card.addEventListener('mouseleave', () => cursor.classList.remove('active'));
  });

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (!el.closest('.video-card')) {
        cursor.classList.add('active', 'dark');
        if (cursorText) cursorText.textContent = '';
      }
    });
    el.addEventListener('mouseleave', () => cursor.classList.remove('active', 'dark'));
  });
}

// =========================================================
// MAGNETIC BUTTONS — shift is capped so large elements
// (like a full-width service row) never drag text offscreen
// =========================================================
const MAGNETIC_MAX_SHIFT = 14; // px

document.querySelectorAll('.magnetic').forEach(el => {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const clampedX = Math.max(-MAGNETIC_MAX_SHIFT, Math.min(MAGNETIC_MAX_SHIFT, x * 0.25));
    const clampedY = Math.max(-MAGNETIC_MAX_SHIFT, Math.min(MAGNETIC_MAX_SHIFT, y * 0.25));
    el.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = 'translate(0, 0)';
  });
});

// =========================================================
// DECORATIVE PATTERN PARALLAX (about + experience)
// =========================================================
document.querySelectorAll('.about, .experience').forEach(section => {
  const deco = section.querySelector('.about-deco, .exp-deco');
  if (!deco) return;
  section.addEventListener('mousemove', (e) => {
    const rect = section.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    deco.style.transform = `translate(${relX * 16}px, ${relY * 16}px)`;
  });
  section.addEventListener('mouseleave', () => {
    deco.style.transform = 'translate(0, 0)';
  });
});

// =========================================================
// REVEAL ON SCROLL
// =========================================================
const revealEls = document.querySelectorAll('.reveal, .reveal-text');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => observer.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('active'));
}

// =========================================================
// COUNT-UP STATS — numbers grow from 0 to their target once
// they scroll into view, keeping any suffix like "+"
// =========================================================
function setupCountUp() {
  const stats = document.querySelectorAll('.about-stats strong');
  if (!stats.length) return;

  stats.forEach(el => {
    const raw = el.textContent.trim();
    const target = parseInt(raw, 10);
    const suffix = raw.replace(/^[0-9]+/, ''); // e.g. "+"
    if (isNaN(target)) return;
    el.dataset.target = target;
    el.dataset.suffix = suffix;
    el.textContent = '0' + suffix;
  });

  const animateCount = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = Math.round(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window) {
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    stats.forEach(el => statObserver.observe(el));
  } else {
    stats.forEach(animateCount);
  }
}
setupCountUp();

// =========================================================
// EXPERIENCE TIMELINE PROGRESS — a vertical line in the
// empty right-hand column that fills as the section scrolls
// past, giving the row of rings/pluses some actual motion
// tied to reading progress instead of just floating alone
// =========================================================
function setupExperienceProgress() {
  const section = document.querySelector('.experience.section');
  const fill = document.querySelector('.exp-progress-fill');
  if (!section || !fill) return;

  function update() {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = rect.height + vh;
    const passed = vh - rect.top;
    const pct = Math.max(0, Math.min(1, passed / total));
    fill.style.height = (pct * 100) + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}
setupExperienceProgress();

// =========================================================
// VIDEO MODAL
// =========================================================
const videoModal = document.getElementById('videoModal');
const modalVideo = document.getElementById('modalVideo');
const modalClose = document.getElementById('modalClose');

document.querySelectorAll('.video-card').forEach(card => {
  card.addEventListener('click', () => {
    const src = card.querySelector('video')?.getAttribute('src');
    if (!src || !videoModal || !modalVideo) return;
    modalVideo.src = src;
    videoModal.classList.add('open');
    modalVideo.play().catch(() => {});
  });
});

function closeModal() {
  if (!videoModal || !modalVideo) return;
  videoModal.classList.remove('open');
  modalVideo.pause();
  modalVideo.src = '';
}

modalClose && modalClose.addEventListener('click', closeModal);
videoModal && videoModal.addEventListener('click', (e) => {
  if (e.target === videoModal) closeModal();
});

// =========================================================
// BACK TO TOP
// =========================================================
const backTop = document.getElementById('backTop');
backTop && backTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
