// =========================================================
// MARQUEE — duplicate the phrase sequence once so the
// scroll-left keyframe (-50%) loops with no seam/gap
// =========================================================
function setupMarquee() {
  const track = document.querySelector('.marquee');
  if (!track) return;
  track.innerHTML = track.innerHTML + track.innerHTML;
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
