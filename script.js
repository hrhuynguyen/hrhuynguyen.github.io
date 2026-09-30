/* ═══════════════════════════════════════════════════
   SETUP
   ═══════════════════════════════════════════════════ */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ═══════════════════════════════════════════════════
   NAV — scroll state, mobile menu, sliding indicator
   ═══════════════════════════════════════════════════ */
const nav = $('#nav');
const navToggle = $('#nav-toggle');
const navLinks = $('#nav-links');
const navPill = $('.nav-pill');
const navAnchors = navLinks ? $$('a', navLinks) : [];

function onScrollNav() {
  nav?.classList.toggle('is-scrolled', window.scrollY > 8);
}
window.addEventListener('scroll', onScrollNav, { passive: true });
onScrollNav();

navToggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});
navAnchors.forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  navToggle?.setAttribute('aria-expanded', 'false');
}));

function movePill(target) {
  if (!navPill || !target) return;
  const parentBox = navLinks.getBoundingClientRect();
  const box = target.getBoundingClientRect();
  navPill.style.left = `${box.left - parentBox.left}px`;
  navPill.style.width = `${box.width}px`;
  navPill.classList.add('is-on');
}

let activeAnchor = null;
function setActive(id) {
  const anchor = navAnchors.find(a => a.getAttribute('href') === `#${id}`);
  navAnchors.forEach(a => a.classList.toggle('active', a === anchor));
  activeAnchor = anchor || null;
  if (anchor) movePill(anchor); else navPill?.classList.remove('is-on');
}

const sections = $$('main section[id]');
const sectionObserver = new IntersectionObserver(entries => {
  const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (visible) setActive(visible.target.id);
}, { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.1, 0.25, 0.5] });
sections.forEach(s => sectionObserver.observe(s));

navAnchors.forEach(a => {
  a.addEventListener('mouseenter', () => movePill(a));
  a.addEventListener('mouseleave', () => activeAnchor ? movePill(activeAnchor) : navPill?.classList.remove('is-on'));
});
window.addEventListener('resize', () => activeAnchor && movePill(activeAnchor));

/* ═══════════════════════════════════════════════════
   SCROLL PROGRESS
   ═══════════════════════════════════════════════════ */
const progressBar = $('#progress-bar');
function updateProgress() {
  if (!progressBar) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

/* ═══════════════════════════════════════════════════
   ROTATING HEADLINE WORD
   ═══════════════════════════════════════════════════ */
const rotator = $('#rotator');
const rotatorWords = ['AI engineer', 'Data scientist', 'Full-stack builder', 'Competitive programmer'];
if (rotator && !reduceMotion) {
  const word = $('.rotator-word', rotator);
  let i = 0;
  setInterval(() => {
    word.classList.remove('is-in');
    word.classList.add('is-out');
    word.addEventListener('animationend', () => {
      i = (i + 1) % rotatorWords.length;
      word.textContent = rotatorWords[i];
      word.classList.remove('is-out');
      word.classList.add('is-in');
    }, { once: true });
  }, 2800);
}

/* ═══════════════════════════════════════════════════
   ORBIT — eye tracking, blink, messages
   ═══════════════════════════════════════════════════ */
const buddy = $('#buddy');
const pupils = $$('.buddy-eye i');
const bubble = $('#buddy-bubble');
const bubbleLines = [
  "Hi! I'm Orbit, Huy's copilot.",
  '9+ hackathon wins and counting.',
  'Kaggle Master · top 1%.',
  'Peak 2332 on LeetCode.',
  'Scroll down to see the work ↓',
];

if (buddy && !reduceMotion) {
  let targetX = 0, targetY = 0, curX = 0, curY = 0, raf = null;

  window.addEventListener('pointermove', e => {
    const box = buddy.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy) || 1;
    const strength = Math.min(1, dist / 320);
    targetX = (dx / dist) * 6 * strength;
    targetY = (dy / dist) * 6 * strength;
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });

  function tick() {
    curX += (targetX - curX) * 0.18;
    curY += (targetY - curY) * 0.18;
    pupils.forEach(p => { p.style.transform = `translate(${curX.toFixed(2)}px, ${curY.toFixed(2)}px)`; });
    raf = (Math.abs(targetX - curX) > 0.05 || Math.abs(targetY - curY) > 0.05) ? requestAnimationFrame(tick) : null;
  }

  buddy.addEventListener('click', () => {
    buddy.classList.remove('is-happy');
    void buddy.offsetWidth;
    buddy.classList.add('is-happy');
    showBubble('Yay! Thanks for stopping by.', 2200);
  });
}

let bubbleTimer = null;
function showBubble(text, hold = 3200) {
  if (!bubble) return;
  clearTimeout(bubbleTimer);
  bubble.textContent = text;
  bubble.classList.add('is-on');
  bubbleTimer = setTimeout(() => bubble.classList.remove('is-on'), hold);
}
if (bubble) {
  let li = 0;
  setTimeout(() => showBubble(bubbleLines[0]), 1400);
  setInterval(() => {
    li = (li + 1) % bubbleLines.length;
    showBubble(bubbleLines[li]);
  }, 6500);
}

/* ═══════════════════════════════════════════════════
   SCROLL REVEAL (staggered within each parent)
   ═══════════════════════════════════════════════════ */
const revealEls = $$('.reveal');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const siblings = $$('.reveal', el.parentElement).filter(s => !s.classList.contains('in'));
    const idx = Math.min(siblings.indexOf(el), 5);
    el.style.setProperty('--d', `${Math.max(idx, 0) * 0.08}s`);
    el.classList.add('in');
    if (el.classList.contains('tl-item')) el.classList.add('is-lit');
    revealObserver.unobserve(el);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
revealEls.forEach(el => revealObserver.observe(el));

/* ═══════════════════════════════════════════════════
   COUNTERS
   ═══════════════════════════════════════════════════ */
const counters = $$('.count');
function animateCount(el) {
  const to = Number(el.dataset.to);
  const suffix = el.dataset.suffix || '';
  if (!Number.isFinite(to) || reduceMotion) { el.textContent = `${to}${suffix}`; return; }
  const duration = 1400;
  const start = performance.now();
  const ease = t => 1 - Math.pow(1 - t, 3);
  function step(now) {
    const p = Math.min(1, (now - start) / duration);
    el.textContent = `${Math.round(to * ease(p))}${suffix}`;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
const countObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    animateCount(e.target);
    countObserver.unobserve(e.target);
  });
}, { threshold: 0.4 });
counters.forEach(c => countObserver.observe(c));

/* ═══════════════════════════════════════════════════
   EXPANDERS (projects, research)
   ═══════════════════════════════════════════════════ */
$$('[data-expander]').forEach(btn => {
  const list = $(btn.dataset.expander);
  const label = $('span', btn);
  if (!list) return;
  const section = list.closest('section');

  btn.addEventListener('click', () => {
    const expand = btn.getAttribute('aria-expanded') !== 'true';
    list.classList.toggle('is-expanded', expand);
    btn.setAttribute('aria-expanded', String(expand));
    if (label) label.textContent = expand ? btn.dataset.less : btn.dataset.more;

    $$('.is-extra', list).forEach((item, i) => {
      item.style.animationDelay = expand ? `${i * 0.05}s` : '';
    });

    if (!expand && section) {
      section.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  });
});

/* ═══════════════════════════════════════════════════
   TIMELINE FILL
   ═══════════════════════════════════════════════════ */
const timeline = $('#timeline');
const tlFill = $('#tl-fill');
function updateTimeline() {
  if (!timeline || !tlFill || reduceMotion) return;
  const box = timeline.getBoundingClientRect();
  const focus = window.innerHeight * 0.7;
  const progress = (focus - box.top) / box.height;
  tlFill.style.transform = `scaleY(${Math.min(1, Math.max(0, progress)).toFixed(3)})`;
}
window.addEventListener('scroll', updateTimeline, { passive: true });
window.addEventListener('resize', updateTimeline);
updateTimeline();

/* ═══════════════════════════════════════════════════
   LIVE PROFILE STATS (Highlights)
   ═══════════════════════════════════════════════════ */
const dashboardCards = $$('.award[data-profile-source]');

const formatInteger = value => {
  const n = Number(value);
  return Number.isFinite(n) ? new Intl.NumberFormat('en-US').format(Math.round(n)) : null;
};
const formatPercent = (value, digits = 2) => {
  const n = Number(value);
  return Number.isFinite(n) ? `${n.toFixed(digits)}%` : null;
};
const titleCase = (value = '') => value.split(/\s+/).filter(Boolean).map(p => p[0].toUpperCase() + p.slice(1)).join(' ');

function setStat(card, key, value) {
  const el = $(`[data-stat="${key}"]`, card);
  if (el && value) el.textContent = value;
}
function setNote(card, value) {
  const el = $('.card-note', card);
  if (el && value) el.textContent = value;
}

async function loadCodeforces(card) {
  try {
    const res = await fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(card.dataset.handle)}`);
    if (!res.ok) throw new Error(`Codeforces HTTP ${res.status}`);
    const user = (await res.json()).result?.[0];
    if (!user) throw new Error('Missing Codeforces user');
    setStat(card, 'rating', formatInteger(user.rating));
    setStat(card, 'rank', titleCase(user.rank));
    setStat(card, 'maxRating', formatInteger(user.maxRating));
    setStat(card, 'country', user.country);
    setNote(card, 'Live data from the public Codeforces API.');
  } catch (err) {
    console.warn('Codeforces fallback', err);
  }
}

async function loadLeetCode(card) {
  const query = `
    query userPublicProfile($username: String!) {
      matchedUser(username: $username) { submitStatsGlobal { acSubmissionNum { difficulty count } } }
      userContestRanking(username: $username) { rating globalRanking topPercentage }
    }`;
  try {
    const res = await fetch('https://leetcode.com/graphql/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { username: card.dataset.username } }),
    });
    if (!res.ok) throw new Error(`LeetCode HTTP ${res.status}`);
    const data = (await res.json()).data;
    const ranking = data?.userContestRanking;
    const solved = data?.matchedUser?.submitStatsGlobal?.acSubmissionNum?.find(e => e.difficulty === 'All')?.count;
    if (!ranking && solved == null) throw new Error('Missing LeetCode data');
    setStat(card, 'rating', formatInteger(ranking?.rating));
    setStat(card, 'globalRank', formatInteger(ranking?.globalRanking));
    setStat(card, 'topPercent', formatPercent(ranking?.topPercentage));
    setStat(card, 'solved', formatInteger(solved));
    setNote(card, "Live data from LeetCode's public profile query.");
  } catch (err) {
    console.warn('LeetCode fallback', err);
  }
}

async function loadDevpost(card) {
  const url = card.dataset.profileUrl;
  if (!url) return;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Devpost HTTP ${res.status}`);
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    const items = $$('#portfolio-navigation li a', doc);
    const count = label => items.find(i => i.textContent.includes(label))?.querySelector('.totals span')?.textContent?.trim();
    setStat(card, 'projects', count('Projects'));
    setStat(card, 'hackathons', count('Hackathons'));
    setStat(card, 'achievements', count('Achievements'));
    setStat(card, 'followers', count('Followers'));
    setNote(card, 'Live data from the public Devpost profile.');
  } catch (err) {
    console.warn('Devpost fallback', err);
  }
}

dashboardCards.forEach(card => {
  const src = card.dataset.profileSource;
  if (src === 'codeforces') loadCodeforces(card);
  if (src === 'leetcode') loadLeetCode(card);
  if (src === 'devpost') loadDevpost(card);
});

/* ═══════════════════════════════════════════════════
   FOOTER YEAR
   ═══════════════════════════════════════════════════ */
const year = $('#year');
if (year) year.textContent = String(new Date().getFullYear());
