/* ============================================================
   NAVBAR — scroll & mobile toggle
   ============================================================ */
const navbar  = document.getElementById('navbar');
const toggle  = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

toggle?.addEventListener('click', () => {
  navbar.classList.toggle('menu-open');
});

navLinks?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navbar.classList.remove('menu-open'));
});

/* Active nav link on scroll */
const sections = document.querySelectorAll('section[id]');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      document.querySelectorAll('.nav-links a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${e.target.id}`);
      });
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => observer.observe(s));

/* ============================================================
   HERO CANVAS — animated grid / particle field
   ============================================================ */
const canvas = document.getElementById('hero-canvas');
const ctx    = canvas.getContext('2d');
let W, H, dots;

function resize() {
  W = canvas.width  = canvas.offsetWidth;
  H = canvas.height = canvas.offsetHeight;
  initDots();
}

function initDots() {
  const count = Math.floor((W * H) / 12000);
  dots = Array.from({ length: count }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    r: Math.random() * 1.5 + 0.5,
  }));
}

function drawDots() {
  ctx.clearRect(0, 0, W, H);

  /* Connect nearby dots */
  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const dx = dots[i].x - dots[j].x;
      const dy = dots[i].y - dots[j].y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 110) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(88, 166, 255, ${0.12 * (1 - dist/110)})`;
        ctx.lineWidth = 0.6;
        ctx.moveTo(dots[i].x, dots[i].y);
        ctx.lineTo(dots[j].x, dots[j].y);
        ctx.stroke();
      }
    }
  }

  /* Draw dots */
  dots.forEach(d => {
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(88, 166, 255, 0.5)';
    ctx.fill();

    d.x += d.vx;
    d.y += d.vy;
    if (d.x < 0 || d.x > W) d.vx *= -1;
    if (d.y < 0 || d.y > H) d.vy *= -1;
  });

  requestAnimationFrame(drawDots);
}

window.addEventListener('resize', resize);
resize();
drawDots();

/* ============================================================
   TYPED TEXT
   ============================================================ */
const phrases = [
  'Software Engineer',
  'AI / ML Researcher',
  'Accessibility Advocate',
  'Full-Stack Developer',
  'BCI Enthusiast',
];

const typedEl = document.querySelector('.typed-text');
let  phraseIdx = 0;
let  charIdx   = 0;
let  deleting  = false;

function type() {
  const current = phrases[phraseIdx];
  if (!deleting) {
    typedEl.textContent = current.slice(0, ++charIdx);
    if (charIdx === current.length) {
      deleting = true;
      setTimeout(type, 1800);
      return;
    }
  } else {
    typedEl.textContent = current.slice(0, --charIdx);
    if (charIdx === 0) {
      deleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
    }
  }
  setTimeout(type, deleting ? 45 : 80);
}
type();

/* ============================================================
   REVEAL ON SCROLL
   ============================================================ */
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      /* Stagger children in same parent */
      const siblings = Array.from(e.target.parentElement?.querySelectorAll('.reveal') ?? []);
      const delay = siblings.indexOf(e.target) * 80;
      setTimeout(() => e.target.classList.add('visible'), delay);
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

reveals.forEach(el => revealObserver.observe(el));
