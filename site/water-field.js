(() => {
  'use strict';

  const canvas = document.getElementById('water-field');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  // Four independent pools. Each chapter has its own palette and arrangement.
  // A stop holds the pigment, its centre (viewport units), and its tilt.
  const compositions = [
    { section: '#top', pools: [
      ['#e38981', .015, .34, -.51], ['#65b2ad', .98, .77, -.56],
      ['#e8ad67', .15, -.08, -.16], ['#ae91bf', .31, 1.12, -.31]
    ] },
    { section: '#approach', pools: [
      ['#e4b167', -.03, .78, -.65], ['#80b4c2', 1.04, .29, .59],
      ['#b3c399', .23, .94, -.39], ['#a6a3d3', .80, -.10, -.27]
    ] },
    { section: '#reading', pools: [
      ['#799dc6', .03, .30, .72], ['#af8bc4', .91, .91, -.37],
      ['#75b7ba', .32, 1.03, -.51], ['#de9aad', 1.02, .15, .61]
    ] },
    { section: '#about', pools: [
      ['#90af8b', .03, .84, -.43], ['#dd9b7f', 1.04, .22, .59],
      ['#c6ba7f', .09, .16, -.71], ['#d89fae', .71, 1.13, -.35]
    ] },
    { section: '#session', pools: [
      ['#b899b8', -.01, .28, .70], ['#dcac77', .98, .81, -.65],
      ['#84afb1', .21, .98, .23], ['#cb8f99', .85, -.06, -.32]
    ] },
    { section: '.site-footer', pools: [
      ['#dc958e', .06, .74, -.68], ['#83acc4', .95, .44, .71],
      ['#d4b781', .18, -.03, -.52], ['#a998bd', .71, .97, .24]
    ] }
  ];
  const mix = (a, b, value) => a + (b - a) * value;
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = (start, end, value) => {
    const n = clamp((value - start) / (end - start));
    return n * n * (3 - 2 * n);
  };
  for (const chapter of compositions) {
    chapter.element = document.querySelector(chapter.section);
    chapter.pools = chapter.pools.map(([hex, x, y, angle]) => ({
      rgb: hex.match(/[0-9a-f]{2}/gi).map(value => parseInt(value, 16)), x, y, angle
    }));
  }
  const chapters = compositions.filter(chapter => chapter.element);
  if (!chapters.length) return;

  // Paint each pigment mask once. Low-frequency noise shapes the blooms, finer
  // noise breaks the drying edges, and grain varies the pigment density.
  const stampSize = 312;
  const maskCanvas = () => {
    const surface = document.createElement('canvas');
    surface.width = surface.height = stampSize;
    return surface;
  };
  function paintPigment(seed) {
    let state = seed;
    const random = () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 4294967296;
    };
    const lattice = Float32Array.from({ length: 4096 }, random);
    function noise(x, y) {
      const ix = Math.floor(x), iy = Math.floor(y);
      const fx = x - ix, fy = y - iy;
      const tx = fx * fx * (3 - 2 * fx), ty = fy * fy * (3 - 2 * fy);
      const top = (iy & 63) << 6, bottom = ((iy + 1) & 63) << 6;
      return mix(mix(lattice[top + (ix & 63)], lattice[top + ((ix + 1) & 63)], tx),
        mix(lattice[bottom + (ix & 63)], lattice[bottom + ((ix + 1) & 63)], tx), ty);
    }
    const source = maskCanvas();
    const painter = source.getContext('2d');
    const image = painter.createImageData(stampSize, stampSize);
    for (let py = 0; py < stampSize; py++) {
      const y = (2 * py + 1) / stampSize - 1;
      for (let px = 0; px < stampSize; px++) {
        const x = (2 * px + 1) / stampSize - 1;
        const bloom = noise(3.1 * x + 12, 3.1 * y + 29);
        const grain = noise(13 * x + 7, 13 * y + 23);
        const warpX = x + .25 * (noise(2.5 * x + 27, 2.5 * y + 3) - .5);
        const warpY = y + .31 * (noise(2.3 * x + 19, 2.3 * y + 17) - .5);
        const radius = Math.sqrt(warpX * warpX * 1.10 + warpY * warpY * 1.40);
        const edge = radius + .21 * (bloom - .5) + .044 * (grain - .5)
          + .014 * (noise(67 * x, 67 * y) - .5);
        const wet = (1 - smooth(.68, .91, edge)) * (1 - smooth(.89, .995, Math.max(Math.abs(x), Math.abs(y))));
        if (wet <= 0) continue;
        const interior = .18 + .30 * bloom + .11 * grain;
        const tideLine = .17 * Math.exp(-Math.pow((edge - .756) / .026, 2));
        const innerTide = .08 * Math.exp(-Math.pow((edge - .63 - .08 * bloom) / .044, 2));
        const channel = warpY + .29 * Math.sin(3.8 * warpX + 1.4) - .21 * (bloom - .5);
        const finePigment = .085 * Math.exp(-Math.pow((channel - .16) / .063, 2));
        const clearWater = .30 * (1 - smooth(.12, .57, Math.hypot(warpX + .14, warpY - .24)))
          + .09 * Math.exp(-Math.pow((channel - .04) / .10, 2));
        image.data[(py * stampSize + px) * 4 + 3] = 255 * wet
          * Math.max(.035, interior + tideLine + innerTide + finePigment - clearWater + .06 * (random() - .5));
      }
    }
    painter.putImageData(image, 0, 0);
    return source;
  }

  const pigments = [5143, 23147, 7313, 85163].map(paintPigment);
  const wetPigment = maskCanvas();
  const wet = wetPigment.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let width = 1, height = 1, anchors = [];
  let elapsed = 0, lastPaint = null, frame = 0, layoutDirty = true, firstPaint = true;
  let currentView = null;

  function measure() {
    width = Math.max(canvas.clientWidth, 1);
    height = Math.max(canvas.clientHeight, 1);
    // Water is deliberately soft. Cap the decorative canvas on high-DPI devices.
    const resolution = Math.min(1, 1100 / width, 900 / height);
    const pixelsWide = Math.round(width * resolution), pixelsHigh = Math.round(height * resolution);
    if (canvas.width !== pixelsWide || canvas.height !== pixelsHigh) {
      canvas.width = pixelsWide;
      canvas.height = pixelsHigh;
    }
    const end = Math.max(0, document.documentElement.scrollHeight - height);
    anchors = chapters.map(({ element }, i) => {
      if (!i) return 0;
      if (i === chapters.length - 1) return end;
      const rect = element.getBoundingClientRect();
      return Math.max(0, Math.min(end, rect.top + window.scrollY + Math.min(rect.height * .38, height * .4) - height * .48));
    });
    layoutDirty = false;
  }

  // Refract horizontal bands of the painted mask in a changing current before
  // placing it on the paper. The boundaries and interior pigment deform together.
  function refract(source, t, tint) {
    const n = stampSize;
    wet.globalCompositeOperation = 'source-over';
    wet.clearRect(0, 0, n, n);
    let lastY = 0;
    for (let row = 0; row < n; row += 6) {
      const next = Math.min(n, row + 6);
      const v = (row + next) / (2 * n);
      const swell = Math.sin(v * Math.PI);
      const flow = 6 * Math.sin(v * 6.8 + t * .58) + 3 * Math.sin(v * 11.6 - t * .40);
      const scale = 1 + .035 * swell * Math.sin(v * 6.6 + t * .49);
      const nextY = Math.round(next + 5 * Math.sin(next / n * Math.PI) * Math.sin(next / n * 7.1 - t * .56));
      wet.drawImage(source, 0, row, n, next - row,
        (1 - scale) * n / 2 + swell * flow, lastY, n * scale, nextY - lastY);
      lastY = nextY;
    }
    wet.globalCompositeOperation = 'source-in';
    wet.fillStyle = tint;
    wet.fillRect(0, 0, n, n);
  }

  function locateView(still) {
    const scroll = Math.max(0, window.scrollY);
    let left = 0;
    while (left < chapters.length - 2 && scroll >= anchors[left + 1]) left++;
    const right = Math.min(left + 1, chapters.length - 1);
    let blend = smooth(anchors[left], Math.max(anchors[right], anchors[left] + 1), scroll);
    if (still) blend = blend < .5 ? 0 : 1;
    return { left, right, blend };
  }

  function draw(t, { left, right, blend }) {
    ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
    ctx.fillStyle = '#fdfaf5';
    ctx.fillRect(0, 0, width, height);
    const portrait = smooth(1.15, .65, width / height);
    for (let i = 0; i < pigments.length; i++) {
      const from = chapters[left].pools[i], to = chapters[right].pools[i];
      const rgb = from.rgb.map((c, k) => Math.round(mix(c, to.rgb[k], blend))).join(',');
      const phase = t + i * 13.72;
      const x = width * (mix(from.x, to.x, blend) + .023 * Math.sin(.29 * phase) + .012 * Math.cos(.49 * phase));
      const y = height * (mix(from.y, to.y, blend) + .030 * Math.sin(.37 * phase) + .013 * Math.sin(.60 * phase));
      const angle = mix(from.angle, to.angle, blend) * (1 - .48 * portrait) + .075 * Math.sin(.36 * phase);
      const scale = 1 + .045 * Math.sin(.41 * phase);
      const w = width * (i < 2 ? mix(.95, 1.12, portrait) : mix(.66, .95, portrait)) * scale;
      const h = height * (i < 2 ? mix(1.10, .88, portrait) : mix(.75, .52, portrait)) / scale;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.scale(w, h);
      const diffuse = ctx.createRadialGradient(0, 0, .05, 0, 0, .68);
      diffuse.addColorStop(0, 'rgba(' + rgb + ',.28)');
      diffuse.addColorStop(.52, 'rgba(' + rgb + ',.14)');
      diffuse.addColorStop(1, 'rgba(' + rgb + ',0)');
      ctx.fillStyle = diffuse;
      ctx.fillRect(-.68, -.68, 1.36, 1.36);
      refract(pigments[i], phase, 'rgb(' + rgb + ')');
      if (i < 2) {
        // A second, more dilute wash creeps past the first wet edge.
        ctx.save();
        ctx.globalAlpha = .24;
        ctx.translate(.051 * Math.sin(phase * .24 - 1.7), .064 * Math.cos(phase * .31));
        ctx.rotate(.11 + .09 * Math.sin(phase * .23));
        ctx.drawImage(wetPigment, -.56, -.48, 1.12, .96);
        ctx.restore();
      }
      ctx.drawImage(wetPigment, -.5, -.5, 1, 1);
      ctx.restore();
    }
    if (firstPaint) {
      canvas.classList.add('is-painted');
      firstPaint = false;
    }
  }

  function frameTick(now) {
    frame = 0;
    if (document.hidden) return;
    const paused = document.documentElement.classList.contains('motion-paused');
    if (paused && currentView && !layoutDirty) return;
    const still = reduced.matches || paused;
    const resize = layoutDirty;
    if (resize) measure();
    if (lastPaint === null || now - lastPaint >= 40 || still || resize) {
      if (!still && lastPaint !== null) elapsed += Math.min(now - lastPaint, 120) / 1000;
      const next = paused && currentView ? currentView : locateView(reduced.matches);
      if (!still || resize || !currentView || next.left !== currentView.left || next.blend !== currentView.blend) {
        draw(elapsed, next);
      }
      currentView = next;
      lastPaint = now;
    }
    if (!still) frame = requestAnimationFrame(frameTick);
  }
  function requestPaint() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(frameTick);
  }
  function invalidateLayout() { layoutDirty = true; requestPaint(); }
  function restart() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastPaint = null;
    requestPaint();
  }
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(invalidateLayout);
    observer.observe(canvas);
    chapters.forEach(({ element }) => observer.observe(element));
  }
  window.addEventListener('resize', invalidateLayout, { passive: true });
  window.addEventListener('scroll', requestPaint, { passive: true });
  document.addEventListener('visibilitychange', restart);
  document.addEventListener('scene-motion-change', restart);
  reduced.addEventListener('change', restart);
  requestPaint();
})();
