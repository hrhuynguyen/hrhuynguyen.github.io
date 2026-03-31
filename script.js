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
  <svg viewBox="0 0 120 120" aria-hidden="true">
    <ellipse cx="60" cy="103" rx="20" ry="8" fill="rgba(255,255,255,0.14)" />
    <path d="M65 20c18 8 29 28 24 58L60 94 31 78c-5-30 6-50 24-58Z" fill="#93c5fd" stroke="#f8fafc" stroke-width="4" stroke-linejoin="round" />
    <path d="M60 18c9 0 16 4 22 11-8 2-15 2-22 2s-14 0-22-2c6-7 13-11 22-11Z" fill="#f9a8d4" />
    <circle cx="60" cy="52" r="12" fill="#eff6ff" stroke="#38bdf8" stroke-width="4" />
    <circle cx="60" cy="52" r="5" fill="#38bdf8" opacity="0.75" />
    <path d="M43 73c4 4 10 6 17 6s13-2 17-6" fill="none" stroke="#1e3a8a" stroke-width="4" stroke-linecap="round" />
    <circle cx="52" cy="67" r="2.5" fill="#1e3a8a" />
    <circle cx="68" cy="67" r="2.5" fill="#1e3a8a" />
    <path d="M36 79 24 92l15-3 6-11Z" fill="#fbbf24" stroke="#fff7db" stroke-width="4" stroke-linejoin="round" />
    <path d="M84 79 96 92l-15-3-6-11Z" fill="#fbbf24" stroke="#fff7db" stroke-width="4" stroke-linejoin="round" />
    <path class="rocket-flame" d="M60 94c-7 9-7 14 0 22 7-8 7-13 0-22Z" fill="#fb7185" />
    <path class="rocket-flame" d="M60 95c-4 6-4 10 0 16 4-6 4-10 0-16Z" fill="#fde68a" />
  </svg>
`;

const robotIcon = `
  <svg viewBox="0 0 120 120" aria-hidden="true">
    <ellipse cx="60" cy="103" rx="21" ry="8" fill="rgba(255,255,255,0.14)" />
    <path d="M60 18v11" fill="none" stroke="#fff7db" stroke-width="4" stroke-linecap="round" />
    <circle cx="60" cy="15" r="6" fill="#f472b6" stroke="#fff7db" stroke-width="4" />
    <rect x="28" y="30" width="64" height="50" rx="20" fill="#fde68a" stroke="#fff7db" stroke-width="4" />
    <rect x="37" y="41" width="46" height="22" rx="11" fill="#93c5fd" />
    <circle class="robot-eye" cx="50" cy="52" r="5" fill="#1e3a8a" />
    <circle class="robot-eye" cx="70" cy="52" r="5" fill="#1e3a8a" />
    <circle cx="42" cy="63" r="4" fill="#f9a8d4" opacity="0.9" />
    <circle cx="78" cy="63" r="4" fill="#f9a8d4" opacity="0.9" />
    <path d="M49 68c3 3 7 4 11 4s8-1 11-4" fill="none" stroke="#92400e" stroke-width="4" stroke-linecap="round" />
    <path d="M28 52H17" fill="none" stroke="#fff7db" stroke-width="4" stroke-linecap="round" />
    <g class="robot-wave-arm">
      <path d="M92 52h11" fill="none" stroke="#fff7db" stroke-width="4" stroke-linecap="round" />
      <path d="M103 52c5-1 8-4 9-9" fill="none" stroke="#fff7db" stroke-width="4" stroke-linecap="round" />
    </g>
    <path d="M42 80v15" fill="none" stroke="#fff7db" stroke-width="4" stroke-linecap="round" />
    <path d="M78 80v15" fill="none" stroke="#fff7db" stroke-width="4" stroke-linecap="round" />
    <path d="M39 96c2 3 4 4 7 4" fill="none" stroke="#fff7db" stroke-width="4" stroke-linecap="round" />
    <path d="M74 100c3 0 5-1 7-4" fill="none" stroke="#fff7db" stroke-width="4" stroke-linecap="round" />
  </svg>
`;

const starIcon = `
  <svg viewBox="0 0 120 120" aria-hidden="true">
    <path class="star-core" d="M60 18c7 20 10 23 31 31-21 8-24 11-31 31-7-20-10-23-31-31 21-8 24-11 31-31Z" fill="#fef08a" stroke="#fff7db" stroke-width="4" stroke-linejoin="round" />
    <circle cx="50" cy="54" r="3.6" fill="#854d0e" />
    <circle cx="70" cy="54" r="3.6" fill="#854d0e" />
    <path d="M50 67c3 3 6 4 10 4s7-1 10-4" fill="none" stroke="#854d0e" stroke-width="4" stroke-linecap="round" />
    <circle cx="39" cy="40" r="4" fill="#f9a8d4" opacity="0.9" />
    <circle cx="82" cy="42" r="3.4" fill="#93c5fd" opacity="0.9" />
  </svg>
`;

const bubbleIcon = `
  <svg viewBox="0 0 120 120" aria-hidden="true">
    <path d="M28 34c0-9 7-16 16-16h32c10 0 18 8 18 18v16c0 10-8 18-18 18H57L40 86l4-16h-2c-8 0-14-6-14-14V34Z" fill="#fce7f3" stroke="#fff7db" stroke-width="4" stroke-linejoin="round" />
    <path class="bubble-heart" d="M60 57c-9-6-13-10-13-16 0-5 3-8 8-8 3 0 5 1 7 4 2-3 4-4 7-4 5 0 8 3 8 8 0 6-4 10-13 16l-2 1-2-1Z" fill="#f472b6" />
    <circle cx="88" cy="82" r="6" fill="#bae6fd" opacity="0.95" />
    <circle cx="99" cy="92" r="3.5" fill="#fef08a" opacity="0.95" />
  </svg>
`;

const sceneLayouts = [
  [
    { type: 'rocket', pos: 'left: 3%; top: 12%;', size: '5.8rem', rotate: '-14deg', parallaxX: '-14px', parallaxY: '10px', opacity: '0.24', duration: '9s', delay: '-2s' },
    { type: 'robot', pos: 'left: 16%; top: 40%;', size: '5.1rem', rotate: '8deg', parallaxX: '-10px', parallaxY: '8px', opacity: '0.2', duration: '8.6s', delay: '-1.5s' },
    { type: 'rocket', pos: 'right: 8%; top: 18%;', size: '5.4rem', rotate: '12deg', parallaxX: '12px', parallaxY: '-9px', opacity: '0.25', duration: '8.8s', delay: '-3.2s' },
    { type: 'robot', pos: 'right: 4%; top: 52%;', size: '5rem', rotate: '-9deg', parallaxX: '9px', parallaxY: '10px', opacity: '0.21', duration: '9.6s', delay: '-0.8s' },
    { type: 'rocket', pos: 'left: 30%; bottom: 8%;', size: '4.9rem', rotate: '-10deg', parallaxX: '-7px', parallaxY: '9px', opacity: '0.18', duration: '8.1s', delay: '-4s' },
    { type: 'robot', pos: 'right: 27%; bottom: 7%;', size: '4.6rem', rotate: '7deg', parallaxX: '8px', parallaxY: '-8px', opacity: '0.18', duration: '9.9s', delay: '-2.7s' },
    { type: 'star', pos: 'left: 22%; top: 16%;', size: '3rem', rotate: '4deg', parallaxX: '-5px', parallaxY: '5px', opacity: '0.2', duration: '6.4s', delay: '-0.9s' },
    { type: 'bubble', pos: 'right: 19%; top: 34%;', size: '3.6rem', rotate: '-5deg', parallaxX: '6px', parallaxY: '-4px', opacity: '0.18', duration: '7.1s', delay: '-2.2s' },
    { type: 'rocket', pos: 'left: 48%; top: 8%;', size: '4.5rem', rotate: '6deg', parallaxX: '6px', parallaxY: '-6px', opacity: '0.15', duration: '7.8s', delay: '-1.9s' },
    { type: 'robot', pos: 'left: 52%; bottom: 15%;', size: '4.3rem', rotate: '-5deg', parallaxX: '-6px', parallaxY: '7px', opacity: '0.14', duration: '10.2s', delay: '-3.7s' },
    { type: 'star', pos: 'right: 43%; bottom: 12%;', size: '2.7rem', rotate: '10deg', parallaxX: '4px', parallaxY: '4px', opacity: '0.15', duration: '5.8s', delay: '-1.1s' },
    { type: 'bubble', pos: 'left: 60%; top: 26%;', size: '3.1rem', rotate: '7deg', parallaxX: '-4px', parallaxY: '4px', opacity: '0.14', duration: '6.8s', delay: '-3.3s' },
  ],
  [
    { type: 'robot', pos: 'left: 5%; top: 18%;', size: '5.6rem', rotate: '-12deg', parallaxX: '-11px', parallaxY: '8px', opacity: '0.23', duration: '9.2s', delay: '-2.8s' },
    { type: 'rocket', pos: 'left: 23%; top: 6%;', size: '5rem', rotate: '11deg', parallaxX: '9px', parallaxY: '-10px', opacity: '0.19', duration: '8.1s', delay: '-1.3s' },
    { type: 'robot', pos: 'right: 10%; top: 14%;', size: '5.2rem', rotate: '10deg', parallaxX: '10px', parallaxY: '-8px', opacity: '0.22', duration: '9.8s', delay: '-3.1s' },
    { type: 'rocket', pos: 'right: 3%; bottom: 18%;', size: '5.6rem', rotate: '-14deg', parallaxX: '13px', parallaxY: '10px', opacity: '0.24', duration: '8.9s', delay: '-4.2s' },
    { type: 'robot', pos: 'left: 34%; bottom: 9%;', size: '4.7rem', rotate: '6deg', parallaxX: '-7px', parallaxY: '7px', opacity: '0.18', duration: '10.4s', delay: '-1.7s' },
    { type: 'rocket', pos: 'right: 33%; bottom: 6%;', size: '4.8rem', rotate: '9deg', parallaxX: '7px', parallaxY: '-6px', opacity: '0.17', duration: '8.4s', delay: '-2.1s' },
    { type: 'star', pos: 'left: 16%; top: 58%;', size: '2.9rem', rotate: '-8deg', parallaxX: '-4px', parallaxY: '4px', opacity: '0.18', duration: '5.9s', delay: '-2.7s' },
    { type: 'bubble', pos: 'right: 18%; top: 38%;', size: '3.4rem', rotate: '6deg', parallaxX: '5px', parallaxY: '-5px', opacity: '0.17', duration: '7.3s', delay: '-0.6s' },
    { type: 'robot', pos: 'left: 52%; top: 22%;', size: '4.4rem', rotate: '-6deg', parallaxX: '-6px', parallaxY: '6px', opacity: '0.14', duration: '9.5s', delay: '-0.9s' },
    { type: 'rocket', pos: 'left: 58%; bottom: 20%;', size: '4.2rem', rotate: '-8deg', parallaxX: '5px', parallaxY: '5px', opacity: '0.13', duration: '7.6s', delay: '-3.4s' },
    { type: 'star', pos: 'right: 44%; top: 12%;', size: '2.5rem', rotate: '12deg', parallaxX: '4px', parallaxY: '3px', opacity: '0.14', duration: '5.4s', delay: '-1.8s' },
    { type: 'bubble', pos: 'left: 63%; bottom: 10%;', size: '2.9rem', rotate: '-6deg', parallaxX: '-4px', parallaxY: '4px', opacity: '0.13', duration: '6.9s', delay: '-2.9s' },
  ],
  [
    { type: 'rocket', pos: 'left: 8%; top: 10%;', size: '5.4rem', rotate: '-11deg', parallaxX: '-12px', parallaxY: '10px', opacity: '0.24', duration: '8.7s', delay: '-2.6s' },
    { type: 'robot', pos: 'left: 6%; bottom: 14%;', size: '5.3rem', rotate: '9deg', parallaxX: '-10px', parallaxY: '9px', opacity: '0.21', duration: '10.1s', delay: '-1.2s' },
    { type: 'rocket', pos: 'right: 16%; top: 12%;', size: '5rem', rotate: '10deg', parallaxX: '11px', parallaxY: '-7px', opacity: '0.21', duration: '8.2s', delay: '-3.9s' },
    { type: 'robot', pos: 'right: 6%; bottom: 10%;', size: '5.2rem', rotate: '-10deg', parallaxX: '10px', parallaxY: '10px', opacity: '0.22', duration: '9.3s', delay: '-2.4s' },
    { type: 'rocket', pos: 'left: 32%; top: 28%;', size: '4.8rem', rotate: '8deg', parallaxX: '7px', parallaxY: '-7px', opacity: '0.17', duration: '7.9s', delay: '-1.8s' },
    { type: 'robot', pos: 'right: 31%; top: 36%;', size: '4.6rem', rotate: '6deg', parallaxX: '-7px', parallaxY: '7px', opacity: '0.17', duration: '10.6s', delay: '-4.1s' },
    { type: 'star', pos: 'left: 23%; bottom: 24%;', size: '2.8rem', rotate: '6deg', parallaxX: '-3px', parallaxY: '3px', opacity: '0.18', duration: '5.5s', delay: '-3.1s' },
    { type: 'bubble', pos: 'right: 21%; top: 28%;', size: '3.5rem', rotate: '-7deg', parallaxX: '5px', parallaxY: '-5px', opacity: '0.18', duration: '7.5s', delay: '-1.4s' },
    { type: 'rocket', pos: 'left: 48%; bottom: 7%;', size: '4.3rem', rotate: '-7deg', parallaxX: '5px', parallaxY: '6px', opacity: '0.14', duration: '8.3s', delay: '-0.7s' },
    { type: 'robot', pos: 'left: 57%; top: 8%;', size: '4.1rem', rotate: '-4deg', parallaxX: '-5px', parallaxY: '5px', opacity: '0.13', duration: '9.7s', delay: '-3s' },
    { type: 'star', pos: 'right: 40%; bottom: 12%;', size: '2.6rem', rotate: '-10deg', parallaxX: '4px', parallaxY: '4px', opacity: '0.14', duration: '5.6s', delay: '-2.2s' },
    { type: 'bubble', pos: 'left: 64%; top: 18%;', size: '3rem', rotate: '5deg', parallaxX: '-4px', parallaxY: '4px', opacity: '0.13', duration: '6.7s', delay: '-0.8s' },
  ],
];

function buildSpriteMarkup(sprite) {
  const iconMap = {
    rocket: rocketIcon,
    robot: robotIcon,
    star: starIcon,
    bubble: bubbleIcon,
  };
  const icon = iconMap[sprite.type] || robotIcon;
  const style = [
    sprite.pos,
    `--size: ${sprite.size}`,
    `--rotate: ${sprite.rotate}`,
    `--parallax-x: ${sprite.parallaxX}`,
    `--parallax-y: ${sprite.parallaxY}`,
    `--opacity: ${sprite.opacity}`,
    `--float-duration: ${sprite.duration}`,
    `--float-delay: ${sprite.delay}`,
  ].join('; ');

  return `<div class="scene-sprite scene-${sprite.type}" style="${style}">${icon}</div>`;
}

function buildSectionScene(index) {
  const layout = sceneLayouts[index % sceneLayouts.length];
  const scene = document.createElement('div');
  scene.className = 'section-scene';
  scene.setAttribute('aria-hidden', 'true');
  scene.innerHTML = layout.map(buildSpriteMarkup).join('');
  return scene;
}

Array.from(sections).forEach((section, index) => {
  if (section.querySelector('.section-scene')) return;

  const scene = buildSectionScene(index);
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

  section.style.setProperty('--scene-x', '0');
  section.style.setProperty('--scene-y', '0');

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
