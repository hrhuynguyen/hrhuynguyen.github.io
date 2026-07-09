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
   XP SCROLL PROGRESS
   ═══════════════════════════════════════════════════ */
const xpBar = document.getElementById('xp-bar');
function updateXpBar() {
  if (!xpBar) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? (window.scrollY / max) * 100 : 0;
  xpBar.style.width = p.toFixed(1) + '%';
}
window.addEventListener('scroll', updateXpBar, { passive: true });
updateXpBar();

/* ═══════════════════════════════════════════════════
   TYPEWRITER
   ═══════════════════════════════════════════════════ */
const phrases = [
  'AI Engineer',
  'Data Scientist',
  'Full-Stack Builder',
  'Competitive Programmer',
];
const typedEl = document.querySelector('.typed');
let pi = 0, ci = 0, del = false;

function type() {
  const phrase = phrases[pi];
  if (!del) {
    typedEl.textContent = phrase.slice(0, ++ci);
    if (ci === phrase.length) { del = true; setTimeout(type, 1900); return; }
  } else {
    typedEl.textContent = phrase.slice(0, --ci);
    if (ci === 0) { del = false; pi = (pi + 1) % phrases.length; }
  }
  setTimeout(type, del ? 36 : 72);
}
if (typedEl) setTimeout(type, 500);

/* ═══════════════════════════════════════════════════
   MASCOT SPEECH
   ═══════════════════════════════════════════════════ */
const mascotMsgEl = document.getElementById('mascot-msg');
const mascotMessages = [
  "Hi! I'm Orbit — Huy's copilot.",
  '9+ hackathon wins and counting…',
  'Scroll down to start the quest ↓',
  'Achievement unlocked: Kaggle Master.',
  'Peak 2332 on LeetCode. Nominal.',
];
if (mascotMsgEl) {
  let mi = 0;
  setInterval(() => {
    mi = (mi + 1) % mascotMessages.length;
    mascotMsgEl.textContent = mascotMessages[mi];
  }, 4200);
}

/* ═══════════════════════════════════════════════════
   STARFIELD CANVAS (with comets)
   ═══════════════════════════════════════════════════ */
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let W = 0, H = 0, stars = [], comets = [];
let mx = 0, my = 0, smx = 0, smy = 0;
const STAR_DENSITY = 1.4;

function resizeStars() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  const n = Math.round((W * H) / 10000 * STAR_DENSITY);
  stars = [];
  for (let i = 0; i < n; i++) {
    const z = 0.25 + Math.random() * 0.75;
    const tint = Math.random();
    stars.push({
      x: Math.random() * W, y: Math.random() * H, z,
      r: z * (0.6 + Math.random() * 1.1),
      ph: Math.random() * Math.PI * 2,
      sp: 0.4 + Math.random() * 1.2,
      c: tint < 0.82 ? '207,224,255' : (tint < 0.91 ? '255,180,84' : '63,227,155'),
    });
  }
}
window.addEventListener('resize', resizeStars);
window.addEventListener('mousemove', e => {
  mx = (e.clientX / W) * 2 - 1;
  my = (e.clientY / H) * 2 - 1;
});
resizeStars();

let t = 0;
function drawStars() {
  t += 0.016;
  smx += (mx - smx) * 0.04;
  smy += (my - smy) * 0.04;
  ctx.clearRect(0, 0, W, H);
  for (const s of stars) {
    s.x -= s.z * 0.05;
    if (s.x < -2) s.x = W + 2;
    const a = (0.32 + 0.6 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph))) * s.z;
    const px = s.x - smx * s.z * 20;
    const py = s.y - smy * s.z * 20;
    ctx.beginPath();
    ctx.arc(px, py, s.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(' + s.c + ',' + a.toFixed(3) + ')';
    ctx.fill();
  }
  if (comets.length < 2 && Math.random() < 0.003) {
    const fromLeft = Math.random() < 0.5;
    comets.push({
      x: fromLeft ? -60 : Math.random() * W,
      y: fromLeft ? Math.random() * H * 0.5 : -60,
      vx: 7 + Math.random() * 5,
      vy: 3 + Math.random() * 3,
      life: 1,
    });
  }
  comets = comets.filter(c => c.life > 0 && c.x < W + 200 && c.y < H + 200);
  for (const c of comets) {
    c.x += c.vx; c.y += c.vy; c.life -= 0.004;
    const grad = ctx.createLinearGradient(c.x, c.y, c.x - c.vx * 16, c.y - c.vy * 16);
    grad.addColorStop(0, 'rgba(255,232,200,' + (0.9 * c.life).toFixed(3) + ')');
    grad.addColorStop(1, 'rgba(255,180,84,0)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(c.x, c.y);
    ctx.lineTo(c.x - c.vx * 16, c.y - c.vy * 16);
    ctx.stroke();
  }
  requestAnimationFrame(drawStars);
}
drawStars();

/* ═══════════════════════════════════════════════════
   SKILL TREE TABS
   ═══════════════════════════════════════════════════ */
const skillTabs = Array.from(document.querySelectorAll('[data-skill-tab]'));
const skillPanels = Array.from(document.querySelectorAll('[data-skill-panel]'));

function activateSkillTab(tab) {
  const target = tab.dataset.skillTab;
  skillTabs.forEach(btn => {
    const isActive = btn === tab;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', String(isActive));
    btn.tabIndex = isActive ? 0 : -1;
  });
  skillPanels.forEach(panel => {
    const isActive = panel.dataset.skillPanel === target;
    panel.classList.toggle('active', isActive);
    panel.hidden = !isActive;
  });
}

skillTabs.forEach((tab, index) => {
  tab.tabIndex = tab.classList.contains('active') ? 0 : -1;
  tab.addEventListener('click', () => activateSkillTab(tab));
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % skillTabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + skillTabs.length) % skillTabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = skillTabs.length - 1;
    skillTabs[nextIndex].focus();
    activateSkillTab(skillTabs[nextIndex]);
  });
});

/* ═══════════════════════════════════════════════════
   QUESTS EXPANDER
   ═══════════════════════════════════════════════════ */
function setupExpander({ toggleSelector, gridSelector, extraSelector, labelSelector, moreLabel, lessLabel, sectionId }) {
  const grid = document.querySelector(gridSelector);
  const toggleBtn = document.querySelector(toggleSelector);
  const label = document.querySelector(labelSelector);
  const extraCards = grid ? Array.from(grid.querySelectorAll(extraSelector)) : [];
  if (!grid || !toggleBtn) return;

  function setExpanded(expanded) {
    grid.classList.toggle('is-expanded', expanded);
    toggleBtn.setAttribute('aria-expanded', String(expanded));
    if (label) label.textContent = expanded ? `▲ Collapse ${lessLabel}` : `▼ ${moreLabel}`;
    extraCards.forEach((card, index) => {
      if (expanded) {
        setTimeout(() => card.classList.add('visible'), index * 55);
      } else {
        card.classList.remove('visible');
      }
    });
    if (!expanded) {
      document.getElementById(sectionId)?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }

  toggleBtn.addEventListener('click', () => {
    setExpanded(toggleBtn.getAttribute('aria-expanded') !== 'true');
  });
}

setupExpander({
  toggleSelector: '[data-quest-toggle]',
  gridSelector: '#quest-grid',
  extraSelector: '.quest-extra',
  labelSelector: '[data-quest-toggle-label]',
  moreLabel: 'Reveal 9 more quests',
  lessLabel: 'quest log',
  sectionId: 'quests',
});

setupExpander({
  toggleSelector: '[data-sidequest-toggle]',
  gridSelector: '#sidequest-list',
  extraSelector: '.sidequest-extra',
  labelSelector: '[data-sidequest-toggle-label]',
  moreLabel: 'Show 8 more side quests',
  lessLabel: 'side quests',
  sectionId: 'sidequests',
});

/* ═══════════════════════════════════════════════════
   LIVE PROFILE DASHBOARDS (Awards)
   ═══════════════════════════════════════════════════ */
const dashboardCards = document.querySelectorAll('.award-card[data-profile-source]');

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
  const note = card.querySelector('.award-note');
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
const revealEls = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const group = Array.from(e.target.parentElement?.querySelectorAll('.reveal') ?? []);
      const idx = group.indexOf(e.target);
      setTimeout(() => e.target.classList.add('visible'), idx * 90);
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
revealEls.forEach(el => revealObs.observe(el));
