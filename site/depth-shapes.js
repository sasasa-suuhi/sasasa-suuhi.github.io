(() => {
  'use strict';

  // Each piece belongs to a place on the page. The camera passes it only once.
  // Offsets are measured within the chapter so opening a reading keeps the
  // following pieces alongside their own chapters.
  const compositions = {
    approach: [
      { at: .14, x: .90, size: .16, turn: -64, depth: 'front', form: 'splinter', ink: 'lagoon' },
      { at: -.22, x: .13, size: .11, turn: 25, depth: 'back', form: 'leaf', ink: 'ochre' },
      { at: .40, x: .13, size: .24, turn: 12, depth: 'front', form: 'sail', ink: 'rose' },
      { at: .55, x: .79, size: .12, turn: -20, depth: 'back', form: 'sail', ink: 'mint' },
      { at: .91, x: .86, size: .21, turn: -37, depth: 'front', form: 'splinter', ink: 'iris' }
    ],
    reading: [
      { at: .15, x: .08, size: .14, turn: -42, depth: 'back', form: 'splinter', ink: 'iris' },
      { at: .43, x: .89, size: .19, turn: 30, depth: 'front', form: 'leaf', ink: 'lagoon' },
      { at: .61, x: .085, size: .20, turn: 143, depth: 'front', form: 'splinter', ink: 'mint' },
      { at: .87, x: .81, size: .10, turn: -63, depth: 'back', form: 'sail', ink: 'ochre' }
    ],
    about: [
      { at: .07, x: .22, size: .12, turn: -22, depth: 'back', form: 'sail', ink: 'iris' },
      { at: .25, x: .91, size: .23, turn: 132, depth: 'front', form: 'sail', ink: 'honey' },
      { at: .70, x: .055, size: .19, turn: -49, depth: 'front', form: 'leaf', ink: 'rose' },
      { at: 1.02, x: .85, size: .11, turn: 31, depth: 'back', form: 'leaf', ink: 'mint' }
    ],
    session: [
      { at: .08, x: .86, size: .17, turn: -18, depth: 'front', form: 'splinter', ink: 'iris' },
      { at: .21, x: .20, size: .10, turn: 57, depth: 'back', form: 'sail', ink: 'honey' },
      { at: .44, x: .10, size: .22, turn: 36, depth: 'front', form: 'sail', ink: 'orchid' },
      { at: .56, x: .83, size: .12, turn: -26, depth: 'back', form: 'leaf', ink: 'rose' },
      { at: .80, x: .88, size: .19, turn: -43, depth: 'front', form: 'leaf', ink: 'honey' },
      { at: .94, x: .08, size: .14, turn: 19, depth: 'back', form: 'splinter', ink: 'lagoon' }
    ]
  };

  // The outer contours and a second, translucent wash are drawn at sprite
  // resolution once. Scroll frames then only move the finished pieces.
  const outlines = {
    sail: [
      'M4 14 Q43 28 71 31 Q112 39 152 42 L193 43 Q191 48 182 55 L129 103 Q122 110 117 105 Q88 81 67 63 Q37 38 4 14Z',
      'M4 14 Q67 45 111 47 Q151 49 193 43 Q134 58 119 106 Q106 88 94 76Z'
    ],
    splinter: [
      'M4 105 Q44 77 82 53 L135 18 Q146 12 153 14 Q167 28 179 40 L195 49 Q179 63 154 69 Q88 84 4 105Z',
      'M4 105 Q70 72 136 49 Q158 42 195 49 Q167 50 150 59 Q94 87 4 105Z'
    ],
    leaf: [
      'M4 92 Q31 79 54 56 Q88 24 123 17 Q149 12 170 21 Q184 27 195 40 Q169 68 138 76 Q104 85 73 84 Q40 84 4 92Z',
      'M4 92 Q52 64 91 54 Q144 40 195 40 Q152 55 107 62 Q63 67 4 92Z'
    ]
  };
  const inks = {
    rose: ['209,83,133', '251,175,172'], lagoon: ['44,148,174', '138,213,211'],
    iris: ['112,103,185', '191,178,221'], mint: ['82,157,142', '180,218,174'],
    honey: ['195,134,63', '248,202,139'], ochre: ['198,156,60', '244,213,155'],
    orchid: ['176,97,164', '237,172,192']
  };
  const sprites = new Map();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const layers = {};
  const sections = [];
  const pieces = [];
  let frame = 0;
  let dirtyLayout = true;
  let lastCamera = null;
  let viewportWidth = 0;
  let viewportHeight = 0;

  for (const depth of ['back', 'front']) {
    const layer = document.createElement('div');
    layer.className = 'drift-depth drift-depth--' + depth;
    layer.setAttribute('aria-hidden', 'true');
    document.body.append(layer);
    layers[depth] = layer;
  }

  function paint(form, ink) {
    const key = form + ink;
    if (sprites.has(key)) return sprites.get(key);
    const image = document.createElement('canvas');
    image.width = 400;
    image.height = 240;
    const ctx = image.getContext('2d');
    if (!ctx) return image;
    ctx.scale(2, 2);
    const [dark, light] = inks[ink];
    const outline = new Path2D(outlines[form][0]);
    ctx.clip(outline);

    const wash = ctx.createLinearGradient(13, 80, 157, 23);
    wash.addColorStop(0, 'rgba(' + light + ',.13)');
    wash.addColorStop(.28, 'rgba(' + light + ',.46)');
    wash.addColorStop(.71, 'rgba(' + dark + ',.66)');
    wash.addColorStop(1, 'rgba(' + dark + ',.82)');
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, 200, 120);

    const pool = ctx.createRadialGradient(152, 70, 2, 152, 70, 64);
    pool.addColorStop(0, 'rgba(' + dark + ',.44)');
    pool.addColorStop(.6, 'rgba(' + dark + ',.18)');
    pool.addColorStop(1, 'rgba(' + dark + ',0)');
    ctx.fillStyle = pool;
    ctx.fillRect(0, 0, 200, 120);
    const crease = ctx.createLinearGradient(30, 20, 165, 75);
    crease.addColorStop(0, 'rgba(255,255,251,0)');
    crease.addColorStop(.65, 'rgba(255,252,240,.31)');
    crease.addColorStop(1, 'rgba(' + light + ',.12)');
    ctx.fillStyle = crease;
    ctx.save();
    ctx.filter = 'blur(1.4px)';
    ctx.fill(new Path2D(outlines[form][1]));
    ctx.restore();
    ctx.strokeStyle = 'rgba(' + dark + ',.16)';
    ctx.lineWidth = 1.2;
    ctx.stroke(outline);
    sprites.set(key, image);
    return image;
  }

  for (const [id, composition] of Object.entries(compositions)) {
    const element = document.getElementById(id);
    if (!element) continue;
    const chapter = { element, top: 0, height: 0 };
    sections.push(chapter);
    for (const spec of composition) {
      const index = pieces.length;
      const piece = document.createElement('span');
      piece.className = 'drift-piece';
      piece.hidden = true;
      piece.style.setProperty('--drift-period', (6 + index % 4) + 's');
      piece.style.setProperty('--drift-delay', -(index * 1.7) + 's');
      const sprite = paint(spec.form, spec.ink);
      if (sprite.isConnected) {
        const copy = sprite.cloneNode(false);
        const ctx = copy.getContext('2d');
        if (ctx) ctx.drawImage(sprite, 0, 0);
        piece.append(copy);
      } else {
        piece.append(sprite);
      }
      layers[spec.depth].append(piece);
      const near = spec.depth === 'front';
      pieces.push({
        spec, piece, chapter, near,
        speed: near ? 1.25 + (index % 4) * .075 : .61 + (index % 3) * .075,
        sway: (index % 2 ? -1 : 1) * (.025 + (index % 3) * .009)
      });
    }
  }

  function measure() {
    viewportWidth = document.documentElement.clientWidth;
    viewportHeight = window.innerHeight;
    for (const chapter of sections) {
      const bounds = chapter.element.getBoundingClientRect();
      chapter.top = bounds.top + window.scrollY;
      chapter.height = bounds.height;
    }
    const narrow = viewportWidth <= 680;
    for (const item of pieces) {
      const { spec, chapter, near } = item;
      item.anchor = chapter.top + chapter.height * spec.at;
      item.width = Math.min(near ? 445 : 245, Math.max(near ? 100 : 48, viewportWidth * spec.size));
      // Foreshorten the distance between the sprite and the edge on a phone.
      // The colored tips still enter the page but leave the form easy to read.
      const sideOffset = Math.min(spec.x, 1 - spec.x);
      const inset = narrow ? sideOffset * (near ? .24 : .72) : sideOffset;
      item.centerX = viewportWidth * (spec.x < .5 ? inset : 1 - inset);
      item.piece.style.width = item.width.toFixed(1) + 'px';
    }
    dirtyLayout = false;
  }

  function draw() {
    frame = 0;
    if (document.hidden) return;
    if (dirtyLayout) measure();
    const paused = reduced.matches || document.documentElement.classList.contains('motion-paused');
    if (!paused || lastCamera === null) lastCamera = window.scrollY;
    const camera = lastCamera;
    const height = Math.max(1, viewportHeight);
    // Introduce the first shards as the reader moves past the opening numerals.
    const entrance = Math.min(1, Math.max(0, (camera / height - .10) / .42));
    for (const item of pieces) {
      const { spec, near, width, piece } = item;
      const distance = (item.anchor - camera - height * .5) / height;
      const centerY = height * (.5 + distance * item.speed);
      const fades = Math.min(1, Math.max(0, (1.14 - Math.abs(distance)) / .39));
      const visible = entrance * fades > .01 && centerY > -width && centerY < height + width;
      if (!visible) {
        if (!piece.hidden) piece.hidden = true;
        continue;
      }
      piece.hidden = false;
      const travel = Math.max(-1, Math.min(1, distance));
      const centerX = item.centerX + travel * viewportWidth * item.sway * (near ? 1 : .45);
      const yaw = travel * (near ? 25 : 12);
      const roll = spec.turn - travel * (near ? 18 : 7);
      const scale = 1 - travel * (near ? .13 : .055);
      piece.style.opacity = (entrance * fades * (near ? .88 : .46)).toFixed(3);
      piece.style.transform = 'translate3d(' + (centerX - width * .5).toFixed(1) + 'px,' +
        (centerY - width * .3).toFixed(1) + 'px,0) perspective(720px) rotate(' + roll.toFixed(2) +
        'deg) rotateY(' + yaw.toFixed(2) + 'deg) scale(' + scale.toFixed(3) + ')';
    }
  }

  function schedule() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(draw);
  }
  function resize() {
    dirtyLayout = true;
    schedule();
  }
  function followScroll() {
    if (!reduced.matches && !document.documentElement.classList.contains('motion-paused')) schedule();
  }

  window.addEventListener('scroll', followScroll, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pageshow', resize);
  document.addEventListener('scene-motion-change', schedule);
  document.addEventListener('visibilitychange', () => {
    for (const layer of Object.values(layers)) layer.classList.toggle('is-asleep', document.hidden);
    if (!document.hidden) resize();
  });
  reduced.addEventListener('change', schedule);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(resize);
    for (const chapter of sections) observer.observe(chapter.element);
    const hero = document.getElementById('top');
    if (hero) observer.observe(hero);
  }
  schedule();
})();
