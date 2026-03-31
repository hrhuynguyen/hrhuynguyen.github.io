/* ═══════════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════════ */
const navbar = document.getElementById('navbar');
const toggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

toggle?.addEventListener('click', () => navbar.classList.toggle('open'));
navLinks?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navbar.classList.remove('open')));

// Active link on scroll
const sections = document.querySelectorAll('section[id]');
const navSectionLinks = navLinks ? Array.from(navLinks.querySelectorAll('a')) : [];
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navSectionLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${e.target.id}`);
      });
    }
  });
}, { threshold: 0.35 });
sections.forEach(section => navObserver.observe(section));

/* ═══════════════════════════════════════════════════
   SECTION DECOR
   ═══════════════════════════════════════════════════ */
const rocketIcon = `
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M40 10c-8 2-14 8-18 18l14 14c10-4 16-10 18-18-3-6-8-11-14-14Z" />
    <path d="M29 35 19 45" />
    <path d="M39 45 49 55" />
    <path d="M22 48c-6 0-10 4-10 10 6 0 10-4 10-10Z" />
    <circle cx="38" cy="26" r="4" />
    <path d="M16 28 9 21" />
  </svg>
`;

const robotIcon = `
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="18" y="20" width="28" height="24" rx="8" />
    <path d="M32 12v8" />
    <path d="M24 52v-8" />
    <path d="M40 52v-8" />
    <path d="M15 30h-5" />
    <path d="M54 30h-5" />
    <circle cx="27" cy="30" r="2.5" fill="currentColor" stroke="none" />
    <circle cx="37" cy="30" r="2.5" fill="currentColor" stroke="none" />
    <path d="M26 38c1.8 1.6 4 2.4 6 2.4s4.2-.8 6-2.4" />
  </svg>
`;

function buildSectionScene() {
  const scene = document.createElement('div');
  scene.className = 'section-scene';
  scene.setAttribute('aria-hidden', 'true');
  scene.innerHTML = `
    <div class="scene-sprite scene-rocket">${rocketIcon}</div>
    <div class="scene-sprite scene-robot">${robotIcon}</div>
  `;
  return scene;
}

Array.from(sections).forEach(section => {
  if (section.querySelector('.section-scene')) return;

  const scene = buildSectionScene();
  if (section.id === 'home') {
    const stars = section.querySelector('#stars');
    if (stars) {
      stars.insertAdjacentElement('afterend', scene);
    } else {
      section.prepend(scene);
    }
  } else {
    section.prepend(scene);
  }

  const updateScene = event => {
    const rect = section.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) - 0.5;
    const y = ((event.clientY - rect.top) / rect.height) - 0.5;
    section.style.setProperty('--scene-x', x.toFixed(3));
    section.style.setProperty('--scene-y', y.toFixed(3));
  };

  section.addEventListener('pointermove', updateScene);
  section.addEventListener('pointerleave', () => {
    section.style.setProperty('--scene-x', '0');
    section.style.setProperty('--scene-y', '0');
  });
});

/* ═══════════════════════════════════════════════════
   STARFIELD CANVAS
   ═══════════════════════════════════════════════════ */
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let W, H, particles;

function resize() {
  W = canvas.width  = canvas.offsetWidth;
  H = canvas.height = canvas.offsetHeight;
  init();
}

function init() {
  const count = Math.floor((W * H) / 8000);
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.2 + 0.2,
    vx: (Math.random() - 0.5) * 0.15,
    vy: (Math.random() - 0.5) * 0.15,
    alpha: Math.random() * 0.6 + 0.2,
  }));
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  // Connection lines
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(114, 9, 183, ${0.15 * (1 - dist / 100)})`;
        ctx.lineWidth = 0.5;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }

  // Stars
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(247, 37, 133, ${p.alpha})`;
    ctx.fill();
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;
  });

  requestAnimationFrame(draw);
}

window.addEventListener('resize', resize);
resize();
draw();

/* ═══════════════════════════════════════════════════
   TYPEWRITER
   ═══════════════════════════════════════════════════ */
const phrases = [
  'Student',
  'Software Engineer',
  'AI Enthusiast',
];
const typedEl = document.querySelector('.typed');
let pi = 0, ci = 0, del = false;

function type() {
  const phrase = phrases[pi];
  if (!del) {
    typedEl.textContent = phrase.slice(0, ++ci);
    if (ci === phrase.length) { del = true; setTimeout(type, 1800); return; }
  } else {
    typedEl.textContent = phrase.slice(0, --ci);
    if (ci === 0) { del = false; pi = (pi + 1) % phrases.length; }
  }
  setTimeout(type, del ? 40 : 75);
}
type();

/* ═══════════════════════════════════════════════════
   PROJECTS CAROUSEL
   ═══════════════════════════════════════════════════ */
const carousel = document.getElementById('projects-carousel');
const dotsContainer = document.getElementById('projects-dots');
const cards = carousel ? Array.from(carousel.querySelectorAll('.project-card')) : [];

// Determine cards per page based on viewport
function perPage() {
  if (window.innerWidth >= 1024) return 3;
  if (window.innerWidth >= 768)  return 2;
  return 1;
}

let page = 0;
let pp = perPage();
let totalPages = Math.ceil(cards.length / pp);

function buildDots() {
  if (!dotsContainer) return;
  dotsContainer.innerHTML = '';
  for (let i = 0; i < totalPages; i++) {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === page ? ' active' : '');
    dot.setAttribute('aria-label', `Page ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  }
}

function updateDots() {
  dotsContainer?.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === page);
  });
}

function goTo(p) {
  page = Math.max(0, Math.min(p, totalPages - 1));
  cards.forEach((c, i) => {
    const slot = Math.floor(i / pp);
    c.style.display = slot === page ? '' : 'none';
  });
  updateDots();
}

function initCarousel() {
  pp = perPage();
  totalPages = Math.ceil(cards.length / pp);
  page = Math.min(page, totalPages - 1);
  buildDots();
  goTo(page);
}

document.querySelector('.carousel-prev')?.addEventListener('click', () => goTo(page - 1));
document.querySelector('.carousel-next')?.addEventListener('click', () => goTo(page + 1));
window.addEventListener('resize', initCarousel);
initCarousel();

/* ═══════════════════════════════════════════════════
   PROFILE DASHBOARDS
   ═══════════════════════════════════════════════════ */
const dashboardCards = document.querySelectorAll('.achievement-dashboard[data-profile-source]');

function formatInteger(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '—';
  return new Intl.NumberFormat('en-US').format(Math.round(number));
}

function formatPercent(value, digits = 2) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '—';
  return `${number.toFixed(digits)}%`;
}

function titleCase(value = '') {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function setDashboardStat(card, key, value) {
  const stat = card.querySelector(`[data-stat="${key}"]`);
  if (stat && value) stat.textContent = value;
}

function setDashboardNote(card, value) {
  const note = card.querySelector('.achievement-dashboard-note');
  if (note && value) note.textContent = value;
}

async function loadCodeforcesDashboard(card) {
  try {
    const response = await fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(card.dataset.handle)}`);
    if (!response.ok) throw new Error(`Codeforces HTTP ${response.status}`);

    const payload = await response.json();
    const user = payload.result?.[0];
    if (!user) throw new Error('Missing Codeforces user data');

    setDashboardStat(card, 'rating', formatInteger(user.rating));
    setDashboardStat(card, 'rank', titleCase(user.rank));
    setDashboardStat(card, 'maxRating', formatInteger(user.maxRating));
    setDashboardStat(card, 'country', user.country || '—');
    setDashboardNote(card, 'Live profile data synced from the public Codeforces API.');
  } catch (error) {
    console.warn('Codeforces dashboard fallback', error);
  }
}

async function loadLeetCodeDashboard(card) {
  const query = `
    query userPublicProfile($username: String!) {
      matchedUser(username: $username) {
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
      userContestRanking(username: $username) {
        rating
        globalRanking
        topPercentage
      }
    }
  `;

  try {
    const response = await fetch('https://leetcode.com/graphql/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { username: card.dataset.username },
      }),
    });

    if (!response.ok) throw new Error(`LeetCode HTTP ${response.status}`);

    const payload = await response.json();
    const ranking = payload.data?.userContestRanking;
    const solvedStats = payload.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum || [];
    const solvedAll = solvedStats.find(entry => entry.difficulty === 'All')?.count;

    if (!ranking && solvedAll == null) throw new Error('Missing LeetCode profile data');

    setDashboardStat(card, 'rating', formatInteger(ranking?.rating));
    setDashboardStat(card, 'globalRank', formatInteger(ranking?.globalRanking));
    setDashboardStat(card, 'topPercent', formatPercent(ranking?.topPercentage));
    setDashboardStat(card, 'solved', formatInteger(solvedAll));
    setDashboardNote(card, 'Live profile data synced from LeetCode\'s public profile query.');
  } catch (error) {
    console.warn('LeetCode dashboard fallback', error);
  }
}

async function loadDevpostDashboard(card) {
  const profileUrl = card.dataset.profileUrl;
  if (!profileUrl) return;

  try {
    const response = await fetch(profileUrl);
    if (!response.ok) throw new Error(`Devpost HTTP ${response.status}`);

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const navItems = Array.from(doc.querySelectorAll('#portfolio-navigation li a'));
    const getCount = label => navItems.find(item => item.textContent.includes(label))?.querySelector('.totals span')?.textContent?.trim();

    setDashboardStat(card, 'projects', getCount('Projects'));
    setDashboardStat(card, 'hackathons', getCount('Hackathons'));
    setDashboardStat(card, 'achievements', getCount('Achievements'));
    setDashboardStat(card, 'followers', getCount('Followers'));
    setDashboardNote(card, 'Live profile data synced from your public Devpost profile.');
  } catch (error) {
    console.warn('Devpost dashboard fallback', error);
  }
}

dashboardCards.forEach(card => {
  const source = card.dataset.profileSource;
  if (source === 'codeforces') loadCodeforcesDashboard(card);
  if (source === 'leetcode') loadLeetCodeDashboard(card);
  if (source === 'devpost') loadDevpostDashboard(card);
});

/* ═══════════════════════════════════════════════════
   SCROLL REVEAL
   ═══════════════════════════════════════════════════ */
const revealEls = document.querySelectorAll('.reveal, .timeline-item, .achievement-card, .contact-card');
const revealObs = new IntersectionObserver(entries => {
  entries.forEach((e, _, all) => {
    if (e.isIntersecting) {
      const group = Array.from(e.target.parentElement?.querySelectorAll('.reveal, .timeline-item, .achievement-card') ?? []);
      const idx = group.indexOf(e.target);
      setTimeout(() => e.target.classList.add('visible'), idx * 100);
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
revealEls.forEach(el => revealObs.observe(el));
