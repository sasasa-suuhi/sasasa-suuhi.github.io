(() => {
  'use strict';

  // Travel is relative to the page. A distance of 1 would be ordinary
  // document scroll; a distant numeral trails it, a close one passes it.
  const paths = {
    1: { travel: .65, sideways: -.022, period: 10.6 },
    2: { travel: 1.17, sideways: -.038, period: 8.1 },
    3: { travel: 1.39, sideways: .048, period: 7.9 },
    4: { travel: .84, sideways: .034, period: 9.7 },
    5: { travel: 1.26, sideways: -.035, period: 8.8 },
    6: { travel: 1.48, sideways: -.036, period: 7.3 },
    7: { travel: .55, sideways: .019, period: 12.1 },
    8: { travel: .71, sideways: -.029, period: 11.2 },
    9: { travel: .91, sideways: .03, period: 9.3 }
  };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const chapters = [];
  const randomOffset = () => Math.random() * 2 - 1;
  // Assign the artwork just once per visit. Shuffle within the two optical
  // sizes so the large and small gestures stay balanced at every breakpoint.
  const artwork = new Map();
  for (const slots of [[2, 6, 3, 5], [8, 4, 7, 9, 1]]) {
    const numbers = [...slots];
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    slots.forEach((slot, index) => artwork.set(slot, numbers[index]));
  }
  for (const layer of document.querySelectorAll('.number-plane')) {
    const digits = [];
    for (const image of layer.querySelectorAll('.space-number')) {
      const slot = Number(image.dataset.slot);
      const path = paths[slot];
      if (!path) continue;
      const number = String(artwork.get(slot));
      if (number !== image.dataset.number) {
        image.src = './assets/digit-' + number + '.webp';
        image.dataset.number = number;
      }
      const float = 2 + path.travel * 2.5;
      image.style.setProperty('--period', path.period + 's');
      image.style.setProperty('--phase', -(Math.random() * path.period) + 's');
      image.style.setProperty('--drift-x', Math.sign(path.sideways) * float + 'px');
      image.style.setProperty('--drift-y', -float * 1.3 + 'px');
      digits.push({ image, path, shiftX: randomOffset(), shiftY: randomOffset(), turn: randomOffset() });
    }
    chapters.push({ layer, opening: layer.parentElement.id === 'top', digits });
  }
  if (!chapters.length) return;

  let viewWidth = 0, viewHeight = 0, frame = 0, layoutDirty = true;
  const limit = (value, max) => Math.max(-max, Math.min(max, value));
  function measure() {
    viewWidth = document.documentElement.clientWidth;
    viewHeight = Math.max(1, window.innerHeight);
    for (const { layer, digits } of chapters) {
      const sectionTop = layer.getBoundingClientRect().top + window.scrollY;
      for (const digit of digits) digit.anchorY = sectionTop + digit.image.offsetTop;
    }
    layoutDirty = false;
  }
  function draw() {
    frame = 0;
    if (document.hidden) return;
    if (layoutDirty) measure();
    if (!reduced.matches && document.documentElement.classList.contains('motion-paused')) return;
    const camera = window.scrollY;
    const narrow = viewWidth <= 720;
    for (const { digits, opening } of chapters) {
      for (const digit of digits) {
        const { image, path, anchorY } = digit;
        if (reduced.matches) {
          image.style.removeProperty('transform');
          image.classList.remove('in-view');
          continue;
        }
        const passage = limit((opening ? camera : camera + viewHeight * .5 - anchorY) / viewHeight, 1.25);
        let y = passage * viewHeight * (1 - path.travel);
        if (narrow && !opening) y = limit(y, Math.min(32, viewHeight * .06));
        y += digit.shiftY * (narrow ? 4 : 9);
        const distanceY = anchorY + y - camera;
        const visible = distanceY >= -230 && distanceY <= viewHeight + 230;
        image.classList.toggle('in-view', visible);
        if (!visible) continue;
        const swing = Math.sin(passage * 1.2);
        const x = swing * path.sideways * Math.min(viewWidth, narrow ? 220 : 1050)
          + digit.shiftX * (narrow ? 2.5 : 6);
        const direction = Math.sign(path.sideways);
        const yaw = direction * (path.travel * 12 * swing + digit.turn * 2);
        const roll = direction * path.travel * 6 * swing + digit.turn * 1.5;
        const scale = 1 + passage * (.04 + (path.travel - 1) * .14);
        image.style.transform = 'translate(-50%, -50%) translate3d(' + x.toFixed(2) + 'px,' +
          y.toFixed(2) + 'px,0) perspective(750px) rotateY(' + yaw.toFixed(2) +
          'deg) rotate(calc(var(--tilt) + ' + roll.toFixed(2) + 'deg)) scale(' + scale.toFixed(4) + ')';
      }
    }
  }
  function schedule() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(draw);
  }
  function resize() { layoutDirty = true; schedule(); }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pageshow', resize);
  document.addEventListener('scene-motion-change', schedule);
  document.addEventListener('visibilitychange', () => {
    document.documentElement.classList.toggle('numbers-asleep', document.hidden);
    if (!document.hidden) resize();
  });
  reduced.addEventListener('change', schedule);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(resize);
    chapters.forEach(chapter => observer.observe(chapter.layer.parentElement));
  }
  schedule();
})();
