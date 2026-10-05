/* ═══════════════════════════════════════════════════
   MISSION CONTROL — 3D launch & tower catch
   Three.js is lazy-loaded when the section approaches.
   ═══════════════════════════════════════════════════ */
(() => {
  const section = document.getElementById('playground');
  const stage = document.getElementById('stage');
  if (!section || !stage) return;

  const host = stage.querySelector('.stage-canvas');
  const btn = document.getElementById('launch-btn');
  const el = {
    clock: document.getElementById('hud-clock'),
    status: document.getElementById('hud-status'),
    hint: document.getElementById('hud-hint'),
    booster: document.getElementById('hud-booster'),
    ship: document.getElementById('hud-ship'),
    alt: document.getElementById('hud-alt'),
    speed: document.getElementById('hud-speed'),
    orbit: document.getElementById('hud-orbit'),
    orbitText: document.getElementById('hud-orbit-text'),
    progress: document.getElementById('hud-progress'),
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 700px)').matches;
  const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

  const hasWebGL = (() => {
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch (e) { return false; }
  })();

  function unavailable(reason) {
    stage.classList.add('is-unavailable');
    btn.disabled = true;
    btn.textContent = '3D unavailable';
    el.hint.textContent = reason || 'This browser could not start the 3D scene.';
    el.status.textContent = 'Static view';
  }

  if (!hasWebGL) { unavailable('WebGL is not available in this browser.'); return; }

  const starter = new IntersectionObserver(entries => {
    if (!entries.some(e => e.isIntersecting)) return;
    starter.disconnect();
    el.status.textContent = 'Loading 3D scene…';
    import(THREE_URL)
      .then(init)
      .catch(err => { console.warn('Three.js failed to load', err); unavailable('The 3D library could not be loaded.'); });
  }, { rootMargin: '700px 0px' });
  starter.observe(section);

  /* ─────────────────────────── helpers ─────────────────────────── */
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const easeInQuad = t => t * t;
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  const easeInOutCubic = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const pad2 = n => String(n).padStart(2, '0');
  const fmtClock = s => {
    const sign = s < 0 ? 'T-' : 'T+';
    const a = Math.abs(s);
    const whole = Math.floor(a);
    const h = Math.floor(whole / 3600), m = Math.floor((whole % 3600) / 60), sec = whole % 60;
    return `${sign}${pad2(h)}:${pad2(m)}:${pad2(sec)}`;
  };
  const fmtInt = n => new Intl.NumberFormat('en-US').format(Math.round(n));

  /* ─────────────────────────── timeline ─────────────────────────── */
  const T0 = 3.5;              // ignition + liftoff
  const T_SEP = T0 + 7;        // MECO + hot staging
  const T_CUT = T0 + 10.5;     // camera cut to the tower
  const T_BURN = T_CUT + 2.6;  // landing burn start
  const T_CATCH = T0 + 17.5;   // arms close on the booster
  const T_END = T0 + 20;       // mission complete

  /* ─────────────────────────── dimensions ─────────────────────────── */
  const R = 0.5;                       // body radius
  const HB = 7.0;                      // booster height
  const HS_BODY = 4.2, HS_NOSE = 1.8, HS = HS_BODY + HS_NOSE;
  const PAD_Y = 1.3;                   // booster bottom when on the mount
  const TOWER_X = -4.6, TOWER_H = 15;
  const ARM_Y = 8.6;                   // arm carriage height
  const CATCH_PIN = HB - 1.1;          // catch pins measured from the booster bottom
  const CATCH_BOTTOM = ARM_Y - CATCH_PIN;
  const ARM_OPEN = 0.46, ARM_CLOSED = 0.055;

  function init(THREE) {
    /* renderer */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xf0a892, 70, 240);

    const camera = new THREE.PerspectiveCamera(38, 16 / 9, 0.1, 600);

    /* lights */
    scene.add(new THREE.HemisphereLight(0xcfd0ff, 0xf1b39d, 1.25));
    const sun = new THREE.DirectionalLight(0xfff2e2, 2.4);
    sun.position.set(14, 20, 10);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x9d9dff, 0.9);
    fill.position.set(-16, 9, -12);
    scene.add(fill);

    /* materials */
    const steel = new THREE.MeshStandardMaterial({ color: 0xe1e2e8, metalness: 0.45, roughness: 0.36 });
    const steelDark = new THREE.MeshStandardMaterial({ color: 0x454856, metalness: 0.5, roughness: 0.5 });
    const tiles = new THREE.MeshStandardMaterial({ color: 0x24262f, metalness: 0.15, roughness: 0.85 });
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x2c2e3f, metalness: 0.2, roughness: 0.75, transparent: true, opacity: 0.92 });
    const latticeMat = new THREE.MeshStandardMaterial({ color: 0x777a99, metalness: 0.3, roughness: 0.6 });
    const accent = new THREE.MeshStandardMaterial({ color: 0xf0876a, metalness: 0.1, roughness: 0.55 });
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x6b667d, roughness: 1, metalness: 0 });
    const padMat = new THREE.MeshStandardMaterial({ color: 0x7c7892, roughness: 0.95 });
    const mesh = (geo, mat) => new THREE.Mesh(geo, mat);

    /* ground + pad + mount */
    const ground = mesh(new THREE.CircleGeometry(400, 72), groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    const slab = mesh(new THREE.CylinderGeometry(5.2, 5.2, 0.16, 56), padMat);
    slab.position.y = 0.08;
    scene.add(slab);
    const mount = new THREE.Group();
    const ring = mesh(new THREE.TorusGeometry(1.15, 0.22, 14, 48), steelDark);
    ring.rotation.x = Math.PI / 2; ring.position.y = PAD_Y - 0.22;
    mount.add(ring);
    for (let i = 0; i < 6; i++) {
      const leg = mesh(new THREE.CylinderGeometry(0.12, 0.14, 1.0, 12), steelDark);
      const a = (i / 6) * Math.PI * 2;
      leg.position.set(Math.cos(a) * 1.15, 0.58, Math.sin(a) * 1.15);
      mount.add(leg);
    }
    scene.add(mount);

    /* contact shadow */
    const shadow = mesh(new THREE.CircleGeometry(1.5, 40), new THREE.MeshBasicMaterial({ color: 0x1a1830, transparent: true, opacity: 0.3, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.17;
    scene.add(shadow);

    /* flames */
    function buildFlame(r, h) {
      const g = new THREE.Group();
      const outer = mesh(new THREE.ConeGeometry(r, h, 26, 1, true), new THREE.MeshBasicMaterial({ color: 0xff8a3c, transparent: true, opacity: 0.92, depthWrite: false, side: THREE.DoubleSide }));
      outer.rotation.x = Math.PI; outer.position.y = -h / 2;
      const inner = mesh(new THREE.ConeGeometry(r * 0.55, h * 0.72, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xe4f1ff, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
      inner.rotation.x = Math.PI; inner.position.y = -h * 0.36;
      const light = new THREE.PointLight(0xffa25a, 0, 26, 1.8);
      light.position.y = -1.0;
      g.add(outer, inner, light);
      g.userData = { light };
      g.visible = false;
      return g;
    }
    function setFlame(flame, power, time) {
      if (power <= 0.002) { flame.visible = false; flame.userData.light.intensity = 0; return; }
      flame.visible = true;
      const f = 1 + 0.10 * Math.sin(time * 41) + 0.07 * Math.sin(time * 27 + 1.3) + 0.05 * Math.sin(time * 63 + 2.1);
      flame.scale.set(power * (0.92 + 0.08 * f), power * f, power * (0.92 + 0.08 * f));
      flame.userData.light.intensity = 90 * power;
    }

    /* booster (origin at its centre) */
    const booster = new THREE.Group();
    {
      const body = mesh(new THREE.CylinderGeometry(R, R, HB, 44), steel);
      const skirt = mesh(new THREE.CylinderGeometry(R + 0.012, R + 0.012, 0.9, 44), steelDark);
      skirt.position.y = -HB / 2 + 0.45;
      const hotRing = mesh(new THREE.CylinderGeometry(R + 0.012, R + 0.012, 0.36, 44), steelDark);
      hotRing.position.y = HB / 2 - 0.18;
      booster.add(body, skirt, hotRing);
      // grid fins
      for (let i = 0; i < 4; i++) {
        const fin = mesh(new THREE.BoxGeometry(0.62, 0.34, 0.09), steel);
        const a = i * Math.PI / 2 + Math.PI / 4;
        fin.position.set(Math.cos(a) * (R + 0.31), HB / 2 - 0.75, Math.sin(a) * (R + 0.31));
        fin.rotation.y = -a;
        booster.add(fin);
      }
      // catch pins
      for (const s of [1, -1]) {
        const pin = mesh(new THREE.BoxGeometry(0.16, 0.14, 0.14), accent);
        pin.position.set(0, -HB / 2 + CATCH_PIN, s * (R + 0.06));
        booster.add(pin);
      }
      // engines: centre, ring of 4, ring of 8
      const engGeo = new THREE.ConeGeometry(0.075, 0.24, 12);
      const addEngine = (x, z) => { const e = mesh(engGeo, steelDark); e.rotation.x = Math.PI; e.position.set(x, -HB / 2 - 0.1, z); booster.add(e); };
      addEngine(0, 0);
      for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; addEngine(Math.cos(a) * 0.17, Math.sin(a) * 0.17); }
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + Math.PI / 8; addEngine(Math.cos(a) * 0.36, Math.sin(a) * 0.36); }
    }
    const boosterFlame = buildFlame(0.52, 3.6);
    boosterFlame.position.y = -HB / 2 - 0.12;
    booster.add(boosterFlame);

    /* ship (origin at its centre) */
    const ship = new THREE.Group();
    {
      const body = mesh(new THREE.CylinderGeometry(R, R, HS_BODY, 44), steel);
      body.position.y = -HS / 2 + HS_BODY / 2;
      const nose = mesh(new THREE.CylinderGeometry(0.05, R, HS_NOSE, 44), steel);
      nose.position.y = -HS / 2 + HS_BODY + HS_NOSE / 2;
      // heat shield on the -x side
      const shieldBody = mesh(new THREE.CylinderGeometry(R + 0.014, R + 0.014, HS_BODY, 44, 1, true, Math.PI, Math.PI), tiles);
      shieldBody.position.copy(body.position);
      const shieldNose = mesh(new THREE.CylinderGeometry(0.06, R + 0.014, HS_NOSE, 44, 1, true, Math.PI, Math.PI), tiles);
      shieldNose.position.copy(nose.position);
      ship.add(body, nose, shieldBody, shieldNose);
      // flaps
      for (const s of [1, -1]) {
        const fwd = mesh(new THREE.BoxGeometry(0.42, 0.95, 0.5), steel);
        fwd.position.set(-0.16, -HS / 2 + HS_BODY + 0.45, s * (R + 0.22));
        const aft = mesh(new THREE.BoxGeometry(0.55, 1.25, 0.62), steel);
        aft.position.set(-0.14, -HS / 2 + 0.75, s * (R + 0.28));
        ship.add(fwd, aft);
      }
      // engines
      const engGeo = new THREE.ConeGeometry(0.09, 0.26, 12);
      const addEngine = (x, z) => { const e = mesh(engGeo, steelDark); e.rotation.x = Math.PI; e.position.set(x, -HS / 2 - 0.1, z); ship.add(e); };
      for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3; addEngine(Math.cos(a) * 0.15, Math.sin(a) * 0.15); }
      for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3 + Math.PI / 3; addEngine(Math.cos(a) * 0.34, Math.sin(a) * 0.34); }
      // Orbit's mission patch
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const g = c.getContext('2d');
      g.fillStyle = '#ffb49b'; g.beginPath(); g.arc(64, 64, 60, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#171a21';
      g.beginPath(); g.ellipse(46, 58, 8, 10, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(82, 58, 8, 10, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#171a21'; g.lineWidth = 6; g.lineCap = 'round';
      g.beginPath(); g.arc(64, 74, 14, Math.PI * 0.15, Math.PI * 0.85); g.stroke();
      g.fillStyle = 'rgba(240,100,100,.45)';
      g.beginPath(); g.ellipse(34, 76, 9, 5, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(94, 76, 9, 5, 0, 0, Math.PI * 2); g.fill();
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
      const patch = mesh(new THREE.CircleGeometry(0.24, 32), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
      patch.position.set(0.12, -HS / 2 + HS_BODY - 0.9, R - 0.02);
      patch.rotation.y = 0.24;
      ship.add(patch);
    }
    const shipFlame = buildFlame(0.44, 3.0);
    shipFlame.position.y = -HS / 2 - 0.12;
    ship.add(shipFlame);

    /* stack */
    const stack = new THREE.Group();
    stack.add(booster, ship);
    scene.add(stack);

    /* tower with chopstick arms */
    const tower = new THREE.Group();
    {
      const core = mesh(new THREE.BoxGeometry(1.5, TOWER_H, 1.5), towerMat);
      core.position.set(TOWER_X, TOWER_H / 2, 0);
      tower.add(core);
      for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const post = mesh(new THREE.BoxGeometry(0.14, TOWER_H, 0.14), latticeMat);
        post.position.set(TOWER_X + sx * 0.75, TOWER_H / 2, sz * 0.75);
        tower.add(post);
      }
      const barX = new THREE.BoxGeometry(1.56, 0.07, 0.07);
      const barZ = new THREE.BoxGeometry(0.07, 0.07, 1.56);
      for (let y = 1.4; y < TOWER_H; y += 1.4) {
        for (const sz of [1, -1]) { const b = mesh(barX, latticeMat); b.position.set(TOWER_X, y, sz * 0.75); tower.add(b); }
        for (const sx of [1, -1]) { const b = mesh(barZ, latticeMat); b.position.set(TOWER_X + sx * 0.75, y, 0); tower.add(b); }
      }
      const cap = mesh(new THREE.BoxGeometry(2.3, 0.5, 2.3), accent);
      cap.position.set(TOWER_X, TOWER_H + 0.25, 0);
      tower.add(cap);
      const carriage = mesh(new THREE.BoxGeometry(1.2, 1.1, 2.6), steelDark);
      carriage.position.set(TOWER_X + 1.15, ARM_Y, 0);
      tower.add(carriage);
    }
    scene.add(tower);

    const arms = [];
    for (const s of [1, -1]) {
      const pivot = new THREE.Group();
      pivot.position.set(TOWER_X + 1.7, ARM_Y, s * 0.78);
      const arm = mesh(new THREE.BoxGeometry(5.8, 0.5, 0.44), steelDark);
      arm.position.x = 2.9;
      const tip = mesh(new THREE.BoxGeometry(0.5, 0.56, 0.5), accent);
      tip.position.x = 5.6;
      pivot.add(arm, tip);
      pivot.userData.side = s;
      scene.add(pivot);
      arms.push(pivot);
    }
    const setArms = a => arms.forEach(p => { p.rotation.y = -p.userData.side * a; });

    // quick-disconnect arm at ship height
    const qd = new THREE.Group();
    qd.position.set(TOWER_X + 0.75, PAD_Y + HB + 1.2, 0);
    const qdArm = mesh(new THREE.BoxGeometry(3.1, 0.3, 0.46), steelDark);
    qdArm.position.x = 1.55;
    qd.add(qdArm);
    scene.add(qd);

    /* ─────────── spaceport scenery: planets, rockets, robots, technology ─────────── */
    const animators = [];
    const scenery = new THREE.Group();
    scene.add(scenery);
    {
      const white = new THREE.MeshStandardMaterial({ color: 0xf1f1f5, metalness: 0.2, roughness: 0.5 });
      const navy = new THREE.MeshStandardMaterial({ color: 0x2f3160, metalness: 0.3, roughness: 0.6 });
      const butter = new THREE.MeshStandardMaterial({ color: 0xf1cf6a, metalness: 0.1, roughness: 0.6 });
      const concrete = new THREE.MeshStandardMaterial({ color: 0xe6e3ea, roughness: 0.85 });
      const lamp = new THREE.MeshBasicMaterial({ color: 0xffd9a8 });
      const blade = new THREE.MeshStandardMaterial({ color: 0x8e90a8, transparent: true, opacity: 0.6 });
      const add = (m, x, y, z, parent = scenery) => { m.position.set(x, y, z); parent.add(m); return m; };

      /* planets, beyond the fog */
      const planetMat = new THREE.MeshStandardMaterial({ color: 0xb9b6ff, roughness: 0.9, metalness: 0, fog: false });
      const planet = add(mesh(new THREE.SphereGeometry(34, 48, 32), planetMat), -294, 74, -190);
      planet.scale.setScalar(0.7);
      const bandMat = new THREE.MeshStandardMaterial({ color: 0x9d99ea, roughness: 0.9, fog: false });
      for (const [y, r] of [[8, 33.1], [-6, 33.6], [16, 30.2], [-18, 29.0]]) {
        const band = mesh(new THREE.TorusGeometry(r, 1.1, 8, 72), bandMat);
        band.rotation.x = Math.PI / 2; band.position.y = y; planet.add(band);
      }
      const ring = mesh(new THREE.RingGeometry(44, 66, 80), new THREE.MeshStandardMaterial({ color: 0xe6e3ff, roughness: 0.8, fog: false, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }));
      ring.rotation.x = Math.PI / 2 - 0.42; ring.rotation.y = 0.25;
      planet.add(ring);
      const moonMat = new THREE.MeshStandardMaterial({ color: 0xefecf6, roughness: 1, fog: false });
      const moon = add(mesh(new THREE.SphereGeometry(13, 36, 24), moonMat), -69, 70, -260);
      const craterMat = new THREE.MeshStandardMaterial({ color: 0xd7d3e3, roughness: 1, fog: false });
      for (const [phi, theta, r] of [[1.2, 0.3, 3.2], [1.8, 0.9, 2.2], [1.0, 1.3, 2.6], [2.1, 0.1, 1.8], [1.5, 1.9, 1.4]]) {
        const c = mesh(new THREE.SphereGeometry(r, 16, 12), craterMat);
        c.position.setFromSphericalCoords(12.4, phi, theta);
        moon.add(c);
      }
      animators.push(dt => { planet.rotation.y += dt * 0.02; moon.rotation.y += dt * 0.03; });

      /* propellant tank farm with piping */
      for (let i = 0; i < 5; i++) {
        const h = 5 + (i % 3) * 0.8, x = -34 + i * 3.1;
        add(mesh(new THREE.CylinderGeometry(1.15, 1.15, h, 24), white), x, h / 2, -14);
        add(mesh(new THREE.SphereGeometry(1.15, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), white), x, h, -14);
        add(mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.25, 24), steelDark), x, 0.12, -14);
      }
      add(mesh(new THREE.CylinderGeometry(0.12, 0.12, 13.5, 10), steelDark), -28, 2.4, -12.6).rotation.z = Math.PI / 2;
      add(mesh(new THREE.CylinderGeometry(0.1, 0.1, 10, 10), steelDark), -22, 0.6, -7).rotation.x = Math.PI / 2;

      /* lighting masts */
      for (const [x, z] of [[-20, -6], [-8, -36], [-34, -22], [10, -40]]) {
        add(mesh(new THREE.CylinderGeometry(0.12, 0.2, 15, 10), steelDark), x, 7.5, z);
        add(mesh(new THREE.BoxGeometry(0.9, 0.5, 0.9), lamp), x, 15.1, z);
      }

      /* solar array */
      for (let i = 0; i < 7; i++) {
        const x = -46 + i * 1.9;
        add(mesh(new THREE.BoxGeometry(1.7, 0.08, 1.2), navy), x, 0.95, -30).rotation.x = -0.55;
        add(mesh(new THREE.BoxGeometry(0.12, 0.9, 0.12), steelDark), x, 0.45, -30);
      }

      /* control building, radar dome, tracking dish */
      add(mesh(new THREE.BoxGeometry(6.5, 2.2, 3.2), concrete), 4, 1.1, -44);
      add(mesh(new THREE.BoxGeometry(6.9, 0.25, 3.6), steelDark), 4, 2.3, -44);
      add(mesh(new THREE.BoxGeometry(5.6, 0.5, 0.06), navy), 4, 1.3, -42.37);
      add(mesh(new THREE.CylinderGeometry(1.0, 1.1, 1.2, 20), steelDark), 8.6, 2.95, -44.5);
      add(mesh(new THREE.SphereGeometry(1.5, 28, 18), white), 8.6, 4.6, -44.5);
      const dishBase = add(new THREE.Group(), -44, 0, -8);
      add(mesh(new THREE.CylinderGeometry(0.22, 0.32, 3.2, 12), steelDark), 0, 1.6, 0, dishBase);
      const dishHead = add(new THREE.Group(), 0, 3.3, 0, dishBase);
      const dish = add(mesh(new THREE.ConeGeometry(1.9, 0.8, 28, 1, true), new THREE.MeshStandardMaterial({ color: 0xf1f1f5, roughness: 0.5, side: THREE.DoubleSide })), 0, 0.5, 0, dishHead);
      dish.rotation.x = Math.PI - 0.9;
      add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.4, 8), steelDark), 0, 0.9, 0.5, dishHead).rotation.x = 0.9;
      animators.push(dt => { dishHead.rotation.y += dt * 0.25; });

      /* extra pads with Falcon-style rockets and strongbacks */
      const falconPad = (px, pz, ry) => {
        const g = add(new THREE.Group(), px, 0, pz);
        g.rotation.y = ry;
        add(mesh(new THREE.CylinderGeometry(3, 3, 0.2, 32), padMat), 0, 0.1, 0, g);
        add(mesh(new THREE.CylinderGeometry(0.32, 0.32, 6, 24), white), 0, 3.5, 0, g);
        add(mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.5, 24), steelDark), 0, 4.7, 0, g);
        add(mesh(new THREE.ConeGeometry(0.32, 1.1, 24), white), 0, 7.05, 0, g);
        add(mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.5, 24), steelDark), 0, 0.75, 0, g);
        for (let i = 0; i < 4; i++) {
          const a = i * Math.PI / 2 + Math.PI / 4;
          const leg = add(mesh(new THREE.BoxGeometry(0.1, 2.3, 0.22), steelDark), Math.cos(a) * 0.42, 1.3, Math.sin(a) * 0.42, g);
          leg.rotation.y = -a; leg.rotation.z = 0.1;
        }
        add(mesh(new THREE.BoxGeometry(0.6, 7.6, 0.6), towerMat), 0.95, 3.8, 0, g);
        add(mesh(new THREE.BoxGeometry(1.0, 0.3, 0.5), steelDark), 0.5, 5.9, 0, g);
      };
      falconPad(-40, -16, 0.4);
      falconPad(-6, -56, -0.6);

      /* distant rocket that launches on a loop */
      const bgRocket = add(new THREE.Group(), -16, 0, -70);
      add(mesh(new THREE.CylinderGeometry(0.42, 0.42, 7, 20), white), 0, 3.5, 0, bgRocket);
      add(mesh(new THREE.ConeGeometry(0.42, 1.3, 20), white), 0, 7.65, 0, bgRocket);
      add(mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.6, 20), steelDark), 0, 0.3, 0, bgRocket);
      for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3; add(mesh(new THREE.BoxGeometry(0.4, 1.2, 0.1), white), Math.cos(a) * 0.5, 0.6, Math.sin(a) * 0.5, bgRocket).rotation.y = -a; }
      const bgFlame = buildFlame(0.4, 2.8); bgFlame.position.y = -0.05; bgRocket.add(bgFlame);
      add(mesh(new THREE.CylinderGeometry(3.2, 3.2, 0.2, 32), padMat), -16, 0.1, -70);
      add(mesh(new THREE.BoxGeometry(0.9, 9, 0.9), towerMat), -17.9, 4.5, -70.7);
      animators.push((dt, time) => {
        const c = (time + 11) % 32;
        if (c < 4) { bgRocket.visible = true; bgRocket.position.y = 0; bgRocket.rotation.z = 0; setFlame(bgFlame, smooth(3.2, 3.9, c), time); }
        else if (c < 16) { const p = (c - 4) / 12; bgRocket.position.y = 120 * p * p; bgRocket.rotation.z = -0.14 * p; setFlame(bgFlame, 1, time); }
        else { bgRocket.visible = false; setFlame(bgFlame, 0, time); }
      });

      /* tiny rockets on the horizon */
      for (const [x, z, h] of [[-117, -50, 8], [-94, -82, 7], [-52, -113, 9], [-15, -126, 7.5]]) {
        add(mesh(new THREE.CylinderGeometry(0.5, 0.5, h, 12), white), x, h / 2, z);
        add(mesh(new THREE.ConeGeometry(0.5, 1.4, 12), white), x, h + 0.7, z);
        add(mesh(new THREE.BoxGeometry(0.9, h + 2, 0.9), towerMat), x - 2.2, (h + 2) / 2, z);
      }

      /* robot dog patrolling behind the tower */
      const dog = add(new THREE.Group(), -21, 0, -10);
      add(mesh(new THREE.BoxGeometry(1.1, 0.34, 0.46), butter), 0, 0.72, 0, dog);
      add(mesh(new THREE.BoxGeometry(0.34, 0.26, 0.3), steelDark), 0.62, 0.86, 0, dog);
      add(mesh(new THREE.BoxGeometry(0.1, 0.08, 0.2), lamp), 0.8, 0.86, 0, dog);
      const hips = [];
      for (const [x, z] of [[0.4, 0.18], [0.4, -0.18], [-0.4, 0.18], [-0.4, -0.18]]) {
        const hip = add(new THREE.Group(), x, 0.62, z, dog);
        add(mesh(new THREE.BoxGeometry(0.1, 0.64, 0.12), steelDark), 0, -0.32, 0, hip);
        hips.push(hip);
      }
      animators.push((dt, time) => {
        const s = Math.sin(time * 0.35);
        dog.position.x = -21 + s * 5;
        dog.rotation.y = Math.cos(time * 0.35) >= 0 ? 0 : Math.PI;
        hips.forEach((hip, i) => { hip.rotation.z = Math.sin(time * 7 + (i % 3 === 0 ? 0 : Math.PI)) * 0.45; });
        dog.position.y = Math.abs(Math.sin(time * 7)) * 0.05;
      });

      /* six-wheel rover circling on the right */
      const rover = add(new THREE.Group(), -2, 0, -26);
      add(mesh(new THREE.BoxGeometry(1.5, 0.4, 1.0), white), 0, 0.7, 0, rover);
      add(mesh(new THREE.BoxGeometry(0.9, 0.3, 0.7), navy), -0.1, 1.05, 0, rover);
      add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8), steelDark), 0.4, 1.6, 0, rover);
      add(mesh(new THREE.BoxGeometry(0.34, 0.2, 0.26), steelDark), 0.4, 2.1, 0, rover);
      add(mesh(new THREE.BoxGeometry(0.9, 0.05, 0.6), navy), -0.1, 1.24, 0, rover);
      const wheelGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.2, 14);
      for (const [x, z] of [[0.55, 0.55], [0, 0.55], [-0.55, 0.55], [0.55, -0.55], [0, -0.55], [-0.55, -0.55]]) {
        add(mesh(wheelGeo, steelDark), x, 0.26, z, rover).rotation.x = Math.PI / 2;
      }
      animators.push((dt, time) => {
        const a = time * 0.18;
        rover.position.set(-2 + Math.cos(a) * 4.5, 0, -26 + Math.sin(a) * 4.5);
        rover.rotation.y = Math.atan2(-Math.cos(a), -Math.sin(a));
      });

      /* industrial robotic arm near the control building */
      const armBase = add(new THREE.Group(), 6, 0, -30);
      add(mesh(new THREE.CylinderGeometry(0.7, 0.9, 0.5, 20), steelDark), 0, 0.25, 0, armBase);
      const shoulder = add(new THREE.Group(), 0, 0.5, 0, armBase);
      add(mesh(new THREE.BoxGeometry(0.5, 0.6, 0.5), accent), 0, 0.3, 0, shoulder);
      const upper = add(new THREE.Group(), 0, 0.6, 0, shoulder);
      add(mesh(new THREE.BoxGeometry(0.3, 2.4, 0.3), white), 0, 1.2, 0, upper);
      const elbow = add(new THREE.Group(), 0, 2.4, 0, upper);
      add(mesh(new THREE.BoxGeometry(0.26, 2.0, 0.26), white), 0, 1.0, 0, elbow);
      const wrist = add(new THREE.Group(), 0, 2.0, 0, elbow);
      add(mesh(new THREE.BoxGeometry(0.12, 0.5, 0.3), accent), 0.13, 0.25, 0, wrist);
      add(mesh(new THREE.BoxGeometry(0.12, 0.5, 0.3), accent), -0.13, 0.25, 0, wrist);
      animators.push((dt, time) => {
        shoulder.rotation.y = Math.sin(time * 0.4) * 1.2;
        upper.rotation.z = 0.5 + Math.sin(time * 0.6) * 0.35;
        elbow.rotation.z = -0.9 + Math.sin(time * 0.6 + 1.2) * 0.5;
        wrist.rotation.z = Math.sin(time * 1.1) * 0.4;
      });

      /* quadcopter drones */
      const drones = [];
      for (const [cx, cy, cz, r, speed] of [[-18, 6.5, -8, 3.0, 0.45], [-4, 8, -30, 4.0, -0.35]]) {
        const d = add(new THREE.Group(), cx, cy, cz);
        add(mesh(new THREE.BoxGeometry(0.5, 0.18, 0.5), steelDark), 0, 0, 0, d);
        add(mesh(new THREE.BoxGeometry(0.2, 0.12, 0.2), accent), 0, 0.12, 0, d);
        const rotors = [];
        for (const [x, z] of [[0.38, 0.38], [-0.38, 0.38], [0.38, -0.38], [-0.38, -0.38]]) {
          add(mesh(new THREE.BoxGeometry(0.36, 0.03, 0.08), steelDark), x / 2, 0.08, z / 2, d).rotation.y = Math.atan2(-z, x);
          rotors.push(add(mesh(new THREE.BoxGeometry(0.7, 0.02, 0.08), blade), x, 0.14, z, d));
        }
        drones.push({ d, cx, cy, cz, r, speed, rotors, phase: Math.random() * 6 });
      }
      animators.push((dt, time) => {
        for (const o of drones) {
          const a = time * o.speed + o.phase;
          o.d.position.set(o.cx + Math.cos(a) * o.r, o.cy + Math.sin(time * 1.3 + o.phase) * 0.35, o.cz + Math.sin(a) * o.r);
          o.d.rotation.y = -a; o.d.rotation.z = Math.sin(time * 1.3 + o.phase) * 0.08;
          o.rotors.forEach(rt => { rt.rotation.y += dt * 40; });
        }
      });
    }

    /* cartoon smoke puffs */
    const PUFFS = 150;
    const puffs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.32, 10, 8), new THREE.MeshStandardMaterial({ color: 0xf7f3f6, roughness: 1, transparent: true, opacity: 0.9 }), PUFFS);
    puffs.frustumCulled = false;
    scene.add(puffs);
    const puff = Array.from({ length: PUFFS }, () => ({ life: 0, max: 1, p: new THREE.Vector3(), v: new THREE.Vector3(), s: 1 }));
    const m4 = new THREE.Matrix4(), q0 = new THREE.Quaternion(), v3 = new THREE.Vector3();
    let puffCursor = 0, puffAcc = 0;
    function emitPuffs(x, y, z, n, spread, up, size) {
      for (let i = 0; i < n; i++) {
        const p = puff[puffCursor]; puffCursor = (puffCursor + 1) % PUFFS;
        const a = Math.random() * Math.PI * 2;
        const sp = spread * (0.5 + Math.random());
        p.p.set(x + Math.cos(a) * 0.4, y, z + Math.sin(a) * 0.4);
        p.v.set(Math.cos(a) * sp, up * (0.5 + Math.random()), Math.sin(a) * sp);
        p.life = 0; p.max = 1.6 + Math.random() * 1.4; p.s = size * (0.7 + Math.random() * 0.6);
      }
    }
    function updatePuffs(dt) {
      for (let i = 0; i < PUFFS; i++) {
        const p = puff[i];
        if (p.life >= p.max) { m4.makeScale(0, 0, 0); puffs.setMatrixAt(i, m4); continue; }
        p.life += dt;
        p.v.multiplyScalar(Math.pow(0.35, dt));
        p.v.y -= 0.15 * dt;
        p.p.addScaledVector(p.v, dt);
        if (p.p.y < 0.35) p.p.y = 0.35;
        const k = p.life / p.max;
        const s = p.s * (0.25 + 0.95 * Math.sin(Math.PI * Math.min(k, 1)) ** 0.8);
        v3.set(s, s, s);
        m4.compose(p.p, q0, v3);
        puffs.setMatrixAt(i, m4);
      }
      puffs.instanceMatrix.needsUpdate = true;
    }

    /* camera rig */
    const rig = { pos: new THREE.Vector3(16, 8, 21), target: new THREE.Vector3(0, 7.2, 0), mode: 'pad' };
    const desired = { pos: new THREE.Vector3(), target: new THREE.Vector3() };
    const orbit = { yaw: 0, pitch: 0, vyaw: 0, vpitch: 0, auto: 0, dragging: false, lastX: 0, lastY: 0 };

    function computeDesired(t) {
      if (rig.mode === 'pad') {
        desired.pos.set(15, 7.5, 21); desired.target.set(-0.6, 7.4, 0);
      } else if (rig.mode === 'follow') {
        const p = booster.position;
        const alt = Math.max(0, p.y - PAD_Y - HB / 2);
        const d = 28 + alt * 0.45;
        desired.target.set(p.x, p.y + 2.5, p.z);
        desired.pos.set(p.x + d * 0.68, p.y + 3 + alt * 0.05, p.z + d * 0.92);
      } else {
        desired.pos.set(14.5, 9.5, 21.5); desired.target.set(-1.2, 8.2, 0);
      }
    }

    function applyCamera(dt, snap) {
      const k = snap ? 1 : 1 - Math.exp(-dt * 3.2);
      rig.pos.lerp(desired.pos, k);
      rig.target.lerp(desired.target, k);
      // user orbit offsets around the target
      const off = v3.copy(rig.pos).sub(rig.target);
      const yaw = orbit.yaw + orbit.auto;
      const cosY = Math.cos(yaw), sinY = Math.sin(yaw);
      const x = off.x * cosY - off.z * sinY, z = off.x * sinY + off.z * cosY;
      off.set(x, off.y, z);
      const len = off.length();
      const horiz = Math.hypot(off.x, off.z);
      let el0 = Math.atan2(off.y, horiz) + orbit.pitch;
      el0 = clamp(el0, -0.05, 1.2);
      const h2 = Math.cos(el0) * len, y2 = Math.sin(el0) * len;
      const sc = horiz > 1e-6 ? h2 / horiz : 0;
      camera.position.set(rig.target.x + off.x * sc, rig.target.y + y2, rig.target.z + off.z * sc);
      camera.lookAt(rig.target);
    }

    /* pointer orbit */
    const canvas = renderer.domElement;
    canvas.addEventListener('pointerdown', e => {
      orbit.dragging = true; orbit.lastX = e.clientX; orbit.lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', e => {
      if (!orbit.dragging) return;
      const dx = e.clientX - orbit.lastX, dy = e.clientY - orbit.lastY;
      orbit.lastX = e.clientX; orbit.lastY = e.clientY;
      orbit.vyaw = dx * 0.0062; orbit.vpitch = dy * 0.0035;
      orbit.yaw += orbit.vyaw; orbit.pitch = clamp(orbit.pitch + orbit.vpitch, -0.35, 0.45);
    });
    const endDrag = () => { orbit.dragging = false; };
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);
    canvas.addEventListener('pointerleave', endDrag);

    /* sizing */
    function resize() {
      const w = host.clientWidth, h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = camera.aspect < 0.9 ? 54 : 38;
      camera.updateProjectionMatrix();
    }
    new ResizeObserver(resize).observe(host);
    resize();

    /* mission state */
    const state = { running: false, done: false, t: 0, time: 0, cutDone: false, lastHud: 0 };
    let visible = false;

    function resetVehicle() {
      if (ship.parent !== stack) stack.attach(ship);
      stack.position.set(0, 0, 0); stack.rotation.set(0, 0, 0);
      booster.position.set(0, PAD_Y + HB / 2, 0); booster.rotation.set(0, 0, 0);
      ship.position.set(0, PAD_Y + HB + HS / 2, 0); ship.rotation.set(0, 0, 0);
      ship.visible = true;
      setFlame(boosterFlame, 0, 0); setFlame(shipFlame, 0, 0);
      setArms(ARM_OPEN);
      qd.rotation.y = 0;
      shadow.position.set(0, 0.17, 0); shadow.scale.setScalar(1); shadow.material.opacity = 0.3;
      for (const p of puff) p.life = p.max;
      updatePuffs(0);
      rig.mode = 'pad';
      state.cutDone = false;
      stage.classList.remove('is-cut');
    }

    function setText(node, text) { if (node && node.textContent !== text) node.textContent = text; }
    let lastOrbitLine = '';
    function say(line) {
      if (line === lastOrbitLine) return;
      lastOrbitLine = line;
      setText(el.orbitText, line);
      el.orbit.classList.remove('is-pop'); void el.orbit.offsetWidth; el.orbit.classList.add('is-pop');
    }

    function updateHud(t) {
      const mission = state.running || state.done ? t - T0 : -3;
      setText(el.clock, fmtClock(state.done ? T_END - T0 : mission));
      el.progress.style.width = `${clamp(t / T_END, 0, 1) * 100}%`;

      let bStat, sStat, line, altKm, spd;
      if (!state.running && !state.done) {
        bStat = 'Go for launch'; sStat = 'Go for launch'; line = 'All systems nominal. Ready when you are.'; altKm = 0; spd = 0;
      } else if (t < T0) {
        bStat = t > T0 - 1 ? 'Ignition' : 'Startup'; sStat = 'Attached'; line = 'Ignition sequence start.'; altKm = 0; spd = 0;
      } else if (t < T_SEP) {
        const p = (t - T0) / (T_SEP - T0);
        bStat = p < 0.45 ? 'Liftoff · ascent' : 'Ascent · max Q passed'; sStat = 'Attached';
        line = p < 0.4 ? 'We have liftoff!' : 'Vehicle is supersonic. Looking good.';
        altKm = 65 * p * p; spd = 5400 * Math.pow(p, 1.5);
      } else if (t < T_CUT) {
        const q = t - T_SEP;
        bStat = q < 0.6 ? 'MECO' : q < 2.2 ? 'Flip manoeuvre' : 'Boostback burn';
        sStat = q < 0.5 ? 'Hot staging · ignition' : 'Ascent burn';
        line = q < 1.2 ? 'Hot staging. My favourite part.' : 'Booster is flipping for boostback.';
        altKm = 65 + 8 * q - 2.2 * q * q; spd = 5400 - 900 * Math.min(q, 3.5);
      } else if (t < T_CATCH) {
        const p = (t - T_CUT) / (T_CATCH - T_CUT);
        bStat = t < T_BURN ? 'Entry · grid fins active' : 'Landing burn';
        sStat = 'Engine cutoff · nominal ✓';
        line = t < T_BURN ? 'Tower cam is live. Booster inbound.' : 'Chopsticks, engage.';
        altKm = 90 * (1 - easeOutCubic(p)); spd = 4300 * Math.pow(1 - easeOutCubic(p), 0.75);
      } else {
        bStat = 'Caught by the tower ✓'; sStat = 'Coasting to orbit ✓';
        line = state.done ? 'Nominal. Want to fly again?' : 'The tower has caught the booster!';
        altKm = 0; spd = 0;
      }
      setText(el.booster, bStat); setText(el.ship, sStat);
      setText(el.alt, `${altKm.toFixed(1)} km`); setText(el.speed, `${fmtInt(spd)} km/h`);
      say(line);
    }

    function updateMission(dt) {
      const t = state.t, time = state.time;

      // quick-disconnect arm swings away just before liftoff
      qd.rotation.y = -1.1 * smooth(T0 - 0.7, T0 + 0.3, t);

      let boosterBottom, boosterX = 0, boosterTilt = 0;
      let boosterPower = 0, shipPower = 0;

      if (t < T0) {
        boosterBottom = PAD_Y;
        boosterPower = smooth(T0 - 0.9, T0 - 0.15, t);
        if (boosterPower > 0.1) emitAt(0, 0.35, 0, 30 * boosterPower, 5.5, 0.6, 1.0, dt);
      } else if (t < T_SEP) {
        const p = (t - T0) / (T_SEP - T0);
        const alt = 44 * easeInQuad(p);
        boosterBottom = PAD_Y + alt;
        boosterX = 1.6 * p * p;
        boosterTilt = -0.07 * p;
        boosterPower = 1;
        if (alt < 7) emitAt(0, 0.35, 0, 30 * (1 - alt / 7), 6.5, 0.9, 1.1, dt);
      } else if (t < T_CUT) {
        const q = t - T_SEP;
        boosterBottom = PAD_Y + 44 + 5.5 * q - 1.55 * q * q;
        boosterX = 1.6 + 1.1 * q - 0.32 * q * q;
        boosterTilt = lerp(-0.07, 2.55, easeInOutCubic(smooth(0.4, 2.3, q)));
        boosterPower = 0.75 * smooth(1.6, 1.9, q) * (1 - smooth(3.1, 3.4, q));
        // ship departs under its own power
        shipPower = smooth(0.15, 0.5, q);
        if (ship.parent === stack) scene.attach(ship);
        const s = q * q * 3.2 + q * 1.5;
        ship.position.set(1.6 + 0.9 * q, PAD_Y + 44 + HB + HS / 2 + s, 0);
        ship.rotation.z = -0.07 - 0.05 * q;
      } else {
        if (!state.cutDone) {
          state.cutDone = true;
          rig.mode = 'tower';
          orbit.yaw = 0; orbit.pitch = 0;
          ship.visible = false;
          computeDesired(t); applyCamera(0, true);
        }
        const p = clamp((t - T_CUT) / (T_CATCH - T_CUT), 0, 1);
        const e = easeOutCubic(p);
        const settle = smooth(T_CATCH, T_CATCH + 0.7, t);
        boosterBottom = CATCH_BOTTOM + (62 - CATCH_BOTTOM) * (1 - e) - 0.12 * settle;
        boosterX = 2.6 * (1 - e) + 0.14 * Math.sin(t * 1.7) * (1 - p);
        boosterTilt = 0.09 * Math.sin(t * 1.3) * (1 - p);
        boosterPower = t < T_CATCH + 0.12 ? smooth(T_BURN, T_BURN + 0.5, t) * lerp(0.85, 0.5, smooth(T_BURN + 1.5, T_CATCH - 0.5, t)) : 0;
        if (boosterPower > 0 && boosterBottom < 7.5) emitAt(boosterX, 0.35, 0, 26 * boosterPower, 5, 0.7, 0.9, dt);
        const armT = easeInOutCubic(smooth(T_CATCH - 1.5, T_CATCH, t));
        setArms(lerp(ARM_OPEN, ARM_CLOSED, armT));
      }

      booster.position.set(boosterX, boosterBottom + HB / 2, 0);
      booster.rotation.z = boosterTilt;
      if (ship.parent === stack) {
        ship.position.set(booster.position.x - Math.sin(boosterTilt) * (HB / 2 + HS / 2), booster.position.y + Math.cos(boosterTilt) * (HB / 2 + HS / 2), 0);
        ship.rotation.z = boosterTilt;
      }
      setFlame(boosterFlame, boosterPower, time);
      setFlame(shipFlame, shipPower, time);

      // contact shadow follows the booster near the ground
      const alt = boosterBottom - PAD_Y;
      shadow.position.x = boosterX;
      shadow.scale.setScalar(1 + Math.max(0, alt) * 0.05);
      shadow.material.opacity = 0.3 * (1 - smooth(0, 14, Math.max(0, alt)));

      // mission complete
      if (t >= T_END && !state.done) {
        state.done = true; state.running = false;
        stage.classList.remove('is-running');
        btn.textContent = 'Replay';
        setText(el.status, 'Mission complete · booster caught');
        setText(el.hint, 'Drag to orbit · replay any time');
      }
      // camera cut fade
      stage.classList.toggle('is-cut', t > T_CUT - 0.28 && t < T_CUT + 0.3);
      if (rig.mode === 'pad' && t >= T0 - 0.2) rig.mode = 'follow';
    }

    function emitAt(x, y, z, rate, spread, up, size, dt) {
      puffAcc += rate * dt;
      const n = Math.floor(puffAcc);
      if (n > 0) { puffAcc -= n; emitPuffs(x, y, z, n, spread, up, size); }
    }

    /* main loop */
    let raf = 0, last = 0;
    function frame(now) {
      raf = 0;
      if (!visible || document.hidden) { last = 0; return; }
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      state.time += dt;
      if (state.running) state.t += dt;

      updateMission(dt);
      updatePuffs(dt);
      for (const a of animators) a(dt, state.time);

      // idle auto-orbit when not dragging and not flying
      if (!orbit.dragging && (rig.mode !== 'follow') && !reduceMotion) orbit.auto += dt * 0.06;
      if (!orbit.dragging) { orbit.vyaw *= 0.9; orbit.vpitch *= 0.9; orbit.yaw += orbit.vyaw; orbit.pitch = clamp(orbit.pitch + orbit.vpitch, -0.35, 0.45); }

      computeDesired(state.t);
      applyCamera(dt, false);
      renderer.render(scene, camera);

      if (now - state.lastHud > 90) { state.lastHud = now; updateHud(state.t); }
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); }

    /* controls */
    function launch() {
      resetVehicle();
      state.t = 0; state.running = true; state.done = false;
      stage.classList.add('is-running');
      lastOrbitLine = '';
      kick();
    }
    btn.addEventListener('click', launch);
    let autoLaunched = false;
    const vis = new IntersectionObserver(entries => {
      const e = entries[0];
      visible = e.isIntersecting;
      if (visible) {
        kick();
        if (!autoLaunched && !reduceMotion && e.intersectionRatio >= 0.55) {
          autoLaunched = true;
          setTimeout(() => { if (!state.running && !state.done) launch(); }, 900);
        }
      }
    }, { threshold: [0, 0.55] });
    vis.observe(stage);
    document.addEventListener('visibilitychange', kick);

    /* first frame */
    resetVehicle();
    computeDesired(0); applyCamera(0, true);
    renderer.render(scene, camera);
    stage.classList.add('is-ready');
    setText(el.status, 'Vehicle on the pad');
    updateHud(0);
    kick();

    // small test hook (harmless in production)
    window.__mission = {
      launch,
      seek(sec) { if (!state.running) launch(); state.t = sec; state.done = false; updateMission(0); computeDesired(state.t); applyCamera(0, true); updateHud(sec); },
    };
  }
})();
