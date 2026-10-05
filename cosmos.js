/* ═══════════════════════════════════════════════════
   COSMOS — decorative animated sky behind the page:
   planets, rockets, flying cars, satellites, drones.
   Pure SVG + CSS animations; respects reduced motion.
   ═══════════════════════════════════════════════════ */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const host = document.createElement('div');
  host.className = 'cosmos' + (reduce ? ' cz-static' : '');
  host.setAttribute('aria-hidden', 'true');
  document.body.prepend(host);

  const C = {
    indigo: '#5b5bd6', lavender: '#c9c7ff', lavSoft: '#ecebff', lavDeep: '#8e8cf0',
    peach: '#ffb49b', peachDeep: '#f0876a', peachSoft: '#ffe9e1',
    mint: '#a9e9cb', mintDeep: '#5cc99a', mintSoft: '#e3f7ec',
    butter: '#ffe08a', butterDeep: '#f1cf6a', ink: '#2c2e3f', white: '#ffffff',
  };
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const rand = (a, b) => a + rnd() * (b - a);
  const f = n => Number(n.toFixed(1));

  /* ───────── drawings (all centred on 0,0) ───────── */
  const rocket = (c1, c2, flame) => `
    <path d="M0,-60 C14,-40 16,-10 14,30 L-14,30 C-16,-10 -14,-40 0,-60Z" fill="${c1}"/>
    <path d="M0,-60 C8,-48 11,-36 12,-24 L-12,-24 C-11,-36 -8,-48 0,-60Z" fill="${c2}"/>
    <path d="M-14,8 L-32,44 L-14,36Z" fill="${c2}"/><path d="M14,8 L32,44 L14,36Z" fill="${c2}"/>
    <circle cx="0" cy="-10" r="6.5" fill="${C.white}"/><circle cx="0" cy="-10" r="3.5" fill="${C.lavDeep}"/>
    <rect x="-14" y="24" width="28" height="6" fill="${c2}"/>
    <g class="cz-flame"><path d="M-10,30 C-6,52 6,52 10,30Z" fill="${flame}"/><path d="M-5,30 C-2,44 2,44 5,30Z" fill="${C.white}" opacity=".8"/></g>
    <path d="M0,54 L0,118" stroke="${c2}" stroke-width="3" stroke-linecap="round" stroke-dasharray="3 9" opacity=".45"/>`;

  const car = (c1, c2, glow) => `
    <ellipse cx="0" cy="30" rx="44" ry="6" fill="${glow}" opacity=".45"/>
    <path d="M-50,8 C-50,-4 -38,-10 -22,-12 L20,-14 C36,-14 46,-6 50,4 L50,12 C50,18 44,20 38,20 L-42,20 C-48,20 -50,16 -50,10Z" fill="${c1}"/>
    <path d="M-18,-12 C-12,-28 16,-30 26,-14Z" fill="${c2}" opacity=".95"/>
    <path d="M-12,-14 C-8,-24 10,-26 18,-16Z" fill="${C.white}" opacity=".55"/>
    <rect x="-36" y="20" width="18" height="6" rx="3" fill="${c2}"/><rect x="16" y="20" width="18" height="6" rx="3" fill="${c2}"/>
    <ellipse cx="-27" cy="29" rx="9" ry="3" fill="${glow}" opacity=".8"/><ellipse cx="25" cy="29" rx="9" ry="3" fill="${glow}" opacity=".8"/>
    <circle cx="47" cy="4" r="3.5" fill="${C.white}"/>
    <path d="M-52,10 L-82,10" stroke="${c2}" stroke-width="3" stroke-linecap="round" opacity=".45"/>
    <path d="M-52,16 L-70,16" stroke="${c2}" stroke-width="2" stroke-linecap="round" opacity=".3"/>`;

  const satellite = () => `
    <rect x="-70" y="-9" width="48" height="18" rx="2" fill="${C.lavender}"/><rect x="22" y="-9" width="48" height="18" rx="2" fill="${C.lavender}"/>
    <path d="M-58,-9 V9 M-46,-9 V9 M-34,-9 V9 M34,-9 V9 M46,-9 V9 M58,-9 V9 M-70,0 H-22 M22,0 H70" stroke="${C.lavDeep}" stroke-width="1.2" opacity=".7"/>
    <rect x="-16" y="-12" width="32" height="24" rx="5" fill="${C.ink}" opacity=".75"/>
    <circle cx="0" cy="-22" r="9" fill="none" stroke="${C.peachDeep}" stroke-width="3"/><path d="M0,-12 V-22" stroke="${C.peachDeep}" stroke-width="3"/>
    <circle cx="0" cy="0" r="4" fill="${C.butter}"/>`;

  const station = () => `
    <circle r="64" fill="none" stroke="${C.lavender}" stroke-width="13"/>
    <circle r="64" fill="none" stroke="${C.lavDeep}" stroke-width="2" opacity=".6"/>
    <path d="M0,-64 V64 M-64,0 H64" stroke="${C.lavender}" stroke-width="6"/>
    <circle r="20" fill="${C.white}" stroke="${C.lavDeep}" stroke-width="3"/>
    <circle r="7" fill="${C.peachDeep}"/>
    <rect x="-14" y="-96" width="28" height="22" rx="4" fill="${C.ink}" opacity=".7"/><rect x="-14" y="74" width="28" height="22" rx="4" fill="${C.ink}" opacity=".7"/>
    <rect x="-130" y="-7" width="54" height="14" rx="2" fill="${C.mint}"/><rect x="76" y="-7" width="54" height="14" rx="2" fill="${C.mint}"/>
    <path d="M-120,-7 V7 M-108,-7 V7 M-96,-7 V7 M-84,-7 V7 M86,-7 V7 M98,-7 V7 M110,-7 V7 M122,-7 V7" stroke="${C.mintDeep}" stroke-width="1.2" opacity=".7"/>`;

  const ufo = () => `
    <ellipse cx="0" cy="0" rx="44" ry="13" fill="${C.lavDeep}"/>
    <ellipse cx="0" cy="-4" rx="44" ry="11" fill="${C.lavender}"/>
    <path d="M-20,-8 C-16,-30 16,-30 20,-8Z" fill="${C.mintSoft}" stroke="${C.mintDeep}" stroke-width="2"/>
    <circle cx="-22" cy="4" r="3.5" fill="${C.butter}"/><circle cx="0" cy="7" r="3.5" fill="${C.peachDeep}"/><circle cx="22" cy="4" r="3.5" fill="${C.butter}"/>
    <path d="M-16,13 L-30,60 L30,60 L16,13Z" fill="${C.butter}" opacity=".18"/>`;

  const drone = () => `
    <rect x="-12" y="-6" width="24" height="12" rx="4" fill="${C.ink}" opacity=".75"/>
    <path d="M-12,-2 L-30,-14 M12,-2 L30,-14 M-12,2 L-30,12 M12,2 L30,12" stroke="${C.ink}" stroke-width="3" stroke-linecap="round" opacity=".6"/>
    <ellipse cx="-30" cy="-14" rx="13" ry="3.5" fill="${C.lavDeep}" opacity=".55"/><ellipse cx="30" cy="-14" rx="13" ry="3.5" fill="${C.lavDeep}" opacity=".55"/>
    <ellipse cx="-30" cy="12" rx="13" ry="3.5" fill="${C.lavDeep}" opacity=".55"/><ellipse cx="30" cy="12" rx="13" ry="3.5" fill="${C.lavDeep}" opacity=".55"/>
    <circle cx="0" cy="8" r="3" fill="${C.peachDeep}"/>`;

  const ringedPlanet = (r) => `
    <ellipse rx="${r * 1.85}" ry="${r * .42}" fill="none" stroke="${C.peach}" stroke-width="${r * .12}" opacity=".7" transform="rotate(-16)"/>
    <circle r="${r}" fill="url(#cz-lav)"/>
    <path d="M${-r * .96},${-r * .28} Q0,${-r * .12} ${r * .96},${-r * .28}" stroke="${C.lavDeep}" stroke-width="${r * .07}" fill="none" opacity=".45"/>
    <path d="M${-r * .9},${r * .35} Q0,${r * .5} ${r * .9},${r * .35}" stroke="${C.lavDeep}" stroke-width="${r * .06}" fill="none" opacity=".4"/>
    <path d="M${-r * 1.85},0 A${r * 1.85},${r * .42} 0 0 0 ${r * 1.85},0" fill="none" stroke="${C.peach}" stroke-width="${r * .12}" opacity=".8" transform="rotate(-16)"/>`;

  const crateredPlanet = (r, fill, crater) => `
    <circle r="${r}" fill="${fill}"/>
    <circle cx="${-r * .35}" cy="${-r * .25}" r="${r * .2}" fill="${crater}"/><circle cx="${r * .3}" cy="${r * .15}" r="${r * .14}" fill="${crater}"/>
    <circle cx="${-r * .05}" cy="${r * .5}" r="${r * .1}" fill="${crater}"/><circle cx="${r * .45}" cy="${-r * .45}" r="${r * .09}" fill="${crater}"/>`;

  const constellation = (pts) => {
    const lines = pts.slice(1).map((p, i) => `<path d="M${pts[i][0]},${pts[i][1]} L${p[0]},${p[1]}" />`).join('');
    const dots = pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="3" />`).join('');
    return `<g class="cz-const">${lines}${dots}</g>`;
  };

  /* ───────── scene ───────── */
  function build() {
    seed = 7;
    const portrait = window.innerWidth < window.innerHeight;
    const lite = window.innerWidth < 700;
    const W = portrait ? 800 : 1600, H = 1000, X0 = portrait ? 400 : 0;
    const px = fx => f(X0 + fx * W), py = fy => f(fy * H);
    const g = (cls, x, y, inner, extra = '') => `<g class="${cls}" transform="translate(${x},${y})" ${extra}>${inner}</g>`;
    const p = [];

    p.push(`<defs>
      <radialGradient id="cz-lav" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="${C.lavSoft}"/><stop offset="1" stop-color="${C.lavender}"/></radialGradient>
      <radialGradient id="cz-peach" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="${C.peachSoft}"/><stop offset="1" stop-color="${C.peach}"/></radialGradient>
      <radialGradient id="cz-horizon" cx="50%" cy="20%" r="70%"><stop offset="0" stop-color="${C.lavender}" stop-opacity=".35"/><stop offset="1" stop-color="${C.lavender}" stop-opacity="0"/></radialGradient>
      <linearGradient id="cz-shoot" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.peachDeep}" stop-opacity="0"/><stop offset="1" stop-color="${C.white}"/></linearGradient>
    </defs>`);

    // stars
    const nStars = lite ? 36 : 70;
    for (let i = 0; i < nStars; i++) {
      const x = px(rnd()), y = py(rnd() * .92), r = f(rand(1, 2.6));
      const tw = i % 3 === 0 ? ` class="cz-star" style="--d:${f(rand(2.4, 5))}s;animation-delay:-${f(rand(0, 5))}s"` : '';
      p.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${i % 7 === 0 ? C.peach : C.lavDeep}" opacity=".5"${tw}/>`);
    }

    // planet horizon at the bottom
    p.push(`<circle cx="${px(.5)}" cy="${py(1.62)}" r="${f(W * .55)}" fill="url(#cz-horizon)"/>`);
    p.push(`<circle cx="${px(.5)}" cy="${py(1.62)}" r="${f(W * .56)}" fill="none" stroke="${C.lavender}" stroke-width="2" opacity=".35"/>`);

    // planets and moon
    p.push(g('cz-drift', px(portrait ? .82 : .86), py(.17), ringedPlanet(lite ? 60 : 92), 'style="--dur:16s"'));
    p.push(g('cz-drift', px(portrait ? .1 : .1), py(.66), `<g class="cz-spin-slow">${crateredPlanet(lite ? 46 : 70, 'url(#cz-peach)', C.peachDeep)}</g>`, 'style="--dur:20s;animation-delay:-6s"'));
    p.push(g('cz-drift', px(portrait ? .22 : .2), py(.15), crateredPlanet(26, C.lavSoft, C.lavender), 'style="--dur:14s;animation-delay:-3s"'));
    if (!lite) {
      p.push(g('', px(.78), py(.78), `
        <circle r="36" fill="url(#cz-lav)"/><path d="M-34,-10 Q0,4 34,-10" stroke="${C.lavDeep}" stroke-width="3" fill="none" opacity=".5"/>
        <circle r="66" fill="none" stroke="${C.lavDeep}" stroke-width="1.5" stroke-dasharray="4 7" opacity=".55"/>
        <g class="cz-orbit"><circle cx="66" cy="0" r="5" fill="${C.peachDeep}"/></g>
        <circle r="92" fill="none" stroke="${C.lavDeep}" stroke-width="1" stroke-dasharray="2 8" opacity=".35"/>
        <g class="cz-orbit" style="animation-duration:22s;animation-direction:reverse"><circle cx="92" cy="0" r="3.5" fill="${C.mintDeep}"/></g>`));
    }

    // constellation circuits
    p.push(constellation([[px(.3), py(.08)], [px(.36), py(.12)], [px(.42), py(.07)], [px(.45), py(.14)], [px(.52), py(.1)]]));
    if (!lite) p.push(constellation([[px(.55), py(.86)], [px(.6), py(.9)], [px(.66), py(.84)], [px(.7), py(.92)], [px(.63), py(.96)]]));

    // station, satellite, ufo, drones
    if (!lite) p.push(g('cz-drift', px(.12), py(.36), `<g class="cz-spin-slow" style="animation-duration:140s">${station()}</g>`, 'style="--dur:24s;animation-delay:-9s;opacity:.75"'));
    p.push(g('cz-drift', px(portrait ? .72 : .62), py(.3), `<g class="cz-spin-slow" style="animation-duration:90s;animation-direction:reverse">${satellite()}</g>`, 'style="--dur:18s;animation-delay:-4s"'));
    p.push(`<g class="cz-ufo" style="--y:${py(.09)}px;--x0:${px(-.15)}px;--x1:${px(1.15)}px;animation-duration:${lite ? 46 : 64}s;animation-delay:-20s"><g class="cz-wobble">${ufo()}</g></g>`);
    const drones = lite ? [[.88, .5]] : [[.9, .5], [.45, .72]];
    drones.forEach(([x, y], i) => p.push(g('cz-hover', px(x), py(y), drone(), `style="animation-delay:-${i * 1.3}s"`)));

    // rockets on long diagonal loops
    const rocketSets = [
      [C.white, C.peachDeep, C.butter], [C.lavSoft, C.indigo, C.peach], [C.white, C.mintDeep, C.butter],
      [C.peachSoft, C.peachDeep, C.butter], [C.white, C.lavDeep, C.peach], [C.mintSoft, C.mintDeep, C.butter],
    ];
    const nRockets = lite ? 3 : 6;
    for (let i = 0; i < nRockets; i++) {
      const [c1, c2, fl] = rocketSets[i];
      const scale = f(rand(.42, .95)), dur = f(rand(26, 48)), delay = f(rand(0, dur));
      const y0 = py(rand(.75, 1.25)), y1 = py(rand(-.3, .1));
      const x0 = px(rand(-.25, .35)), x1 = px(rand(.75, 1.3));
      const ang = f(Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI + 90);
      const style = reduce
        ? `transform:translate(${f((x0 + x1) / 2)}px,${f((y0 + y1) / 2)}px)`
        : `--x0:${x0}px;--y0:${y0}px;--x1:${x1}px;--y1:${y1}px;animation-duration:${dur}s;animation-delay:-${delay}s`;
      p.push(`<g class="cz-rocket" style="${style};opacity:${f(rand(.5, .8))}"><g transform="rotate(${ang}) scale(${scale})">${rocket(c1, c2, fl)}</g></g>`);
    }

    // flying cars
    const cars = lite ? [[.26, C.white, C.indigo, C.lavDeep, 40]] : [[.24, C.white, C.indigo, C.lavDeep, 44], [.74, C.peachSoft, C.peachDeep, C.butter, 56], [.5, C.mintSoft, C.mintDeep, C.mint, 50]];
    cars.forEach(([fy, c1, c2, glow, dur], i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      const x0 = dir > 0 ? px(-.12) : px(1.12), x1 = dir > 0 ? px(1.12) : px(-.12);
      const style = reduce ? `transform:translate(${px(.2 + i * .3)}px,${py(fy)}px)` : `--x0:${x0}px;--x1:${x1}px;--y:${py(fy)}px;animation-duration:${dur}s;animation-delay:-${f(dur * (i + 1) / 3)}s`;
      const scale = f(rand(.7, 1));
      p.push(`<g class="cz-car" style="${style};opacity:.75"><g class="cz-bob" style="animation-delay:-${i}s"><g transform="scale(${dir * scale},${scale})">${car(c1, c2, glow)}</g></g></g>`);
    });

    // shooting stars
    if (!reduce) {
      [[.55, .05, 9, 0], [.15, .25, 13, 5], [.8, .4, 11, 8]].slice(0, lite ? 2 : 3).forEach(([fx, fy, dur, delay]) => {
        p.push(`<path class="cz-shoot" d="M0,0 L150,-50" stroke="url(#cz-shoot)" stroke-width="2.5" stroke-linecap="round" style="--x0:${px(fx)}px;--y0:${py(fy)}px;animation-duration:${dur}s;animation-delay:${delay}s"/>`);
      });
    }

    host.innerHTML = `<svg viewBox="${X0} 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${p.join('')}</svg>`;
  }

  build();
  let wasPortrait = window.innerWidth < window.innerHeight, wasLite = window.innerWidth < 700;
  window.addEventListener('resize', () => {
    const portrait = window.innerWidth < window.innerHeight, lite = window.innerWidth < 700;
    if (portrait !== wasPortrait || lite !== wasLite) { wasPortrait = portrait; wasLite = lite; build(); }
  });

  /* gentle pointer parallax */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const step = () => {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      host.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)`;
      raf = (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) ? requestAnimationFrame(step) : 0;
    };
    window.addEventListener('pointermove', e => {
      tx = (e.clientX / window.innerWidth - 0.5) * 16;
      ty = (e.clientY / window.innerHeight - 0.5) * 12;
      if (!raf) raf = requestAnimationFrame(step);
    }, { passive: true });
  }
})();
