(() => {
  'use strict';

  const canvas = document.getElementById('water-field');
  if (!canvas) return;
  const surface = canvas.getContext('2d', { alpha: false });
  if (!surface) return;

  // Keep only a viewport-sized crop in memory. The full painting always
  // retains its native proportions, including when a reading makes the page longer.
  const crop = document.createElement('canvas');
  const across = document.createElement('canvas');
  const paper = crop.getContext('2d', { alpha: false });
  const flow = across.getContext('2d', { alpha: false });
  if (!paper || !flow) return;

  const portrait = matchMedia('(max-aspect-ratio: 4/5)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let painting = null;
  let progress = 0, lastCrop = -1, scrollRange = 1;
  let pixelRatio = 1, pad = 0, sourceScale = 1, travel = 0, wavelength = 1;
  let clock = 0, lastPaint = null, frame = 0, dirtyLayout = true;

  function loadPainting() {
    const source = new Image();
    const name = portrait.matches ? 'water-scroll-mobile.webp' : 'water-scroll.webp';
    painting = source;
    canvas.classList.remove('is-painted');
    source.onload = () => { if (source === painting) invalidate(); };
    source.src = './assets/' + name;
  }

  function measure() {
    const w = Math.max(1, canvas.clientWidth);
    const h = Math.max(1, canvas.clientHeight);
    // Fine watercolor edges benefit from some extra resolution on phones.
    pixelRatio = Math.min(devicePixelRatio || 1, 1.65, Math.sqrt(1600000 / (w * h)));
    wavelength = Math.max(450, Math.min(1050, w)) * pixelRatio;
    const width = Math.round(w * pixelRatio);
    const height = Math.round(h * pixelRatio);
    const gutter = Math.ceil((Math.min(15, w * .019) + 3) * pixelRatio);
    if (canvas.width !== width || canvas.height !== height || gutter !== pad) {
      canvas.width = width;
      canvas.height = height;
      pad = gutter;
      crop.width = across.width = width + 2 * pad;
      crop.height = across.height = height + 2 * pad;
    }
    sourceScale = Math.max(crop.width / painting.naturalWidth, crop.height / painting.naturalHeight);
    travel = Math.max(0, painting.naturalHeight - crop.height / sourceScale);
    scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    lastCrop = -1;
    dirtyLayout = false;
  }

  function readCrop() {
    const top = progress * travel;
    const w = crop.width / sourceScale;
    const h = crop.height / sourceScale;
    const left = Math.max(0, (painting.naturalWidth - w) / 2);
    paper.drawImage(painting, left, top, w, h, 0, 0, crop.width, crop.height);
    lastCrop = progress;
  }

  // Two perpendicular shears bend the fibers and the pigment edges together.
  // Adjacent strips share the exact same displacement along their common edge.
  function refract() {
    const w = crop.width, h = crop.height;
    const step = Math.max(6, Math.round(9 * pixelRatio));
    const amplitude = pad - 2 * pixelRatio;
    const worldY = (progress * travel * sourceScale) / wavelength;
    const t = clock;
    function driftX(y) {
      const v = worldY + y / wavelength;
      return amplitude * (.54 * Math.sin(6.4 * v + .46 * t)
        + .32 * Math.sin(11.2 * v - .57 * t + 1.6) + .14 * Math.sin(19 * v + .34 * t - 1));
    }
    function driftY(x) {
      const v = x / wavelength;
      return amplitude * (.54 * Math.sin(5.6 * v + 1.3 * worldY - .52 * t)
        + .30 * Math.sin(9.1 * v - .7 * worldY + .42 * t + 1.1)
        + .16 * Math.sin(17.3 * v + worldY - .38 * t - .8));
    }
    let shift = driftX(0);
    for (let y = 0; y < h; y += step) {
      const size = Math.min(step, h - y);
      const next = driftX(y + size);
      const skew = (next - shift) / size;
      flow.setTransform(1, 0, skew, 1, shift - skew * y, 0);
      flow.drawImage(crop, 0, y, w, size, 0, y, w, size);
      shift = next;
    }
    shift = driftY(pad);
    for (let x = pad; x < w - pad; x += step) {
      const size = Math.min(step, w - pad - x);
      const next = driftY(x + size);
      const skew = (next - shift) / size;
      surface.setTransform(1, skew, 0, 1, -pad, shift - skew * x - pad);
      surface.drawImage(across, x, 0, size, h, x, 0, size, h);
      shift = next;
    }
  }

  function tick(now) {
    frame = 0;
    if (document.hidden || !painting?.complete || !painting.naturalWidth) return;
    const paused = document.documentElement.classList.contains('motion-paused');
    const painted = canvas.classList.contains('is-painted');
    if (paused && painted && !dirtyLayout) return;
    const needsLayout = dirtyLayout;
    if (needsLayout) measure();
    const animate = !reduced.matches && !paused;
    if (!paused || !painted) {
      progress = Math.min(1, Math.max(0, window.scrollY / scrollRange));
    }
    const moved = lastCrop !== progress;
    if (moved) readCrop();
    if (moved || needsLayout || lastPaint === null || animate && now - lastPaint >= 40) {
      if (animate && lastPaint !== null) clock += Math.min(now - lastPaint, 100) / 1000;
      if (reduced.matches) {
        surface.setTransform(1, 0, 0, 1, 0, 0);
        surface.drawImage(crop, -pad, -pad);
      } else {
        refract();
      }
      lastPaint = now;
      canvas.classList.add('is-painted');
    }
    if (animate) schedule();
  }

  function schedule() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function invalidate() {
    dirtyLayout = true;
    schedule();
  }
  function restart() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastPaint = null;
    schedule();
  }
  if ('ResizeObserver' in window) new ResizeObserver(invalidate).observe(document.body);
  window.addEventListener('resize', invalidate, { passive: true });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('pageshow', invalidate);
  document.addEventListener('visibilitychange', restart);
  document.addEventListener('scene-motion-change', restart);
  reduced.addEventListener('change', restart);
  portrait.addEventListener('change', loadPainting);
  loadPainting();
})();
