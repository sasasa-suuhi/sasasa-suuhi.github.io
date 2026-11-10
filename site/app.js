(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const form = document.getElementById('birth-form');
  const year = document.getElementById('birth-year');
  const month = document.getElementById('birth-month');
  const day = document.getElementById('birth-day');
  const error = document.getElementById('birth-error');
  const result = document.getElementById('reading-result');
  const fields = [year, month, day];
  const calculator = window.SasasaNumerology;
  const garden = document.querySelector('.number-garden');
  const gardenNumber = document.getElementById('visual-number');
  const gardenCaption = document.getElementById('visual-caption');
  const readingPanel = document.querySelector('.reading-panel');
  function showGarden(number = null) {
    garden.classList.toggle('has-result', number !== null);
    if (number === null) delete readingPanel.dataset.baseNumber;
    else readingPanel.dataset.baseNumber = String(number);
    gardenNumber.textContent = number === null ? '?' : String(number);
    gardenCaption.textContent = number === null ? 'あなたの数字に、出会う。' : '自分を知る、小さな手がかり。';
    garden.querySelectorAll('[data-number]').forEach(digit => digit.classList.toggle('is-active', Number(digit.dataset.number) === number));
  }
  function refreshDays() {
    const selected = day.value;
    const y = /^\d{4}$/.test(year.value) ? Number(year.value) : 2000;
    const m = Number(month.value);
    const max = m ? new Date(Date.UTC(y, m, 0)).getUTCDate() : 31;
    day.replaceChildren(new Option('―', ''));
    for (let i = 1; i <= max; i++) day.add(new Option(String(i), String(i)));
    if (Number(selected) <= max) day.value = selected;
  }
  refreshDays();
  function clearResult() {
    result.hidden = true;
    error.hidden = true;
    fields.forEach(field => field.removeAttribute('aria-invalid'));
    showGarden();
  }
  year.addEventListener('input', () => { clearResult(); refreshDays(); });
  month.addEventListener('change', () => { clearResult(); refreshDays(); });
  day.addEventListener('change', clearResult);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const normalizedYear = year.value.trim().replace(/[０-９]/g, char => String.fromCharCode(char.charCodeAt(0) - 0xfee0));
    year.value = normalizedYear;
    const y = Number(normalizedYear), m = Number(month.value), d = Number(day.value);
    const missing = fields.find(field => !field.value);
    const message = missing || !/^\d{4}$/.test(normalizedYear) ? '生年月日をすべて入力してください。年は西暦4桁でお願いします。' : calculator.validateDate(y, m, d);
    if (message) {
      result.hidden = true;
      error.textContent = message;
      error.hidden = false;
      const invalid = missing || year;
      invalid.setAttribute('aria-invalid', 'true');
      invalid.focus();
      return;
    }
    error.hidden = true;
    fields.forEach(field => field.removeAttribute('aria-invalid'));
    const number = calculator.birthNumber(y, m, d);
    const meaning = calculator.meanings[number];
    showGarden(number);
    document.getElementById('result-number').textContent = String(number);
    document.getElementById('result-announcement').textContent = String(number);
    document.getElementById('result-keywords').textContent = meaning.keywords;
    document.getElementById('result-title').textContent = meaning.title.replace('、', '、\n');
    document.getElementById('result-description').textContent = meaning.description;
    document.getElementById('result-tendency').textContent = meaning.tendency;
    document.getElementById('result-hint').textContent = meaning.hint;
    document.getElementById('result-question').textContent = meaning.question;
    result.classList.remove('is-new');
    result.hidden = false;
    requestAnimationFrame(() => {
      result.classList.add('is-new');
      document.getElementById('result-heading').focus({ preventScroll: true });
      result.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
    });
  });
  form.querySelector('fieldset').disabled = false;
  form.querySelector('[type="submit"]').disabled = false;

  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.getElementById('mobile-menu');
  function closeMenu(restoreFocus = false) {
    menu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'メニューを開く');
    if (restoreFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.hidden) closeMenu(true); });
  document.addEventListener('click', event => { if (!menu.hidden && !event.target.closest('.site-header')) closeMenu(); });
  window.matchMedia('(min-width: 881px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  // The browser owns scrolling and anchor navigation. Motion only reflects position.
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.page-progress span');
  const navSections = Array.from(document.querySelectorAll('.desktop-nav a[href^="#"]'), link => ({
    link,
    section: document.getElementById(link.hash.slice(1))
  })).filter(item => item.section);
  const hero = document.getElementById('top');
  const story = document.querySelector('[data-reading-story]');
  const example = story.querySelector('.story-example');
  const stage = story.querySelector('.story-stage');
  const questions = document.getElementById('questions');
  const mobileDock = document.querySelector('.mobile-dock');
  const scrollArt = document.querySelector('[data-scroll-art]');
  const scrollPanels = Array.from(document.querySelectorAll('[data-scroll-panel]'));
  let currentLink = null;
  let scrollFrame = null;
  const clampProgress = value => Math.max(0, Math.min(1, value));

  function setProgress(element, property, value) {
    const next = clampProgress(value).toFixed(4);
    if (element.style.getPropertyValue(property) !== next) element.style.setProperty(property, next);
  }

  function updateScrollState() {
    scrollFrame = null;
    const { innerHeight, scrollY } = window;
    const maxScroll = document.documentElement.scrollHeight - innerHeight;
    const fraction = maxScroll > 0 ? clampProgress(scrollY / maxScroll) : 0;
    const headerBottom = header.getBoundingClientRect().bottom;
    const navLine = headerBottom + 24;
    let nextLink = null;
    let closestTop = -Infinity;
    for (const { link, section } of navSections) {
      const top = section.getBoundingClientRect().top;
      if (top <= navLine && top > closestTop) {
        closestTop = top;
        nextLink = link;
      }
    }
    const heroRect = hero?.getBoundingClientRect();
    const animate = !reducedMotion.matches;
    const storyRect = animate ? story.getBoundingClientRect() : null;
    const exampleRect = example.getBoundingClientRect();
    const stageHeight = animate ? stage.getBoundingClientRect().height : 0;
    const panelRects = animate ? scrollPanels.map(panel => panel.getBoundingClientRect()) : [];

    const questionsTop = animate ? questions?.getBoundingClientRect().top : undefined;
    const artRect = animate ? scrollArt?.getBoundingClientRect() : undefined;

    progress.style.transform = `scaleX(${fraction})`;
    header.classList.toggle('is-scrolled', scrollY > 24);
    mobileDock?.classList.toggle('is-ready', exampleRect.bottom < innerHeight * .67);
    if (nextLink !== currentLink) {
      currentLink?.removeAttribute('aria-current');
      nextLink?.setAttribute('aria-current', 'location');
      currentLink = nextLink;
    }
    if (storyRect) {
      const viewport = Math.max(1, innerHeight - headerBottom);
      const pinDistance = Math.max(1, exampleRect.height - stageHeight);
      const entry = clampProgress((innerHeight - exampleRect.top) / viewport);
      const scene = clampProgress((headerBottom - exampleRect.top) / pinDistance);
      const photo = (entry - .04) / .96 + scene * .22;
      const quote = (entry - .38) / .62 + scene * .35;
      const answer = (scene - .34) / .47;

      setProgress(story, '--hero-progress', (headerBottom - heroRect.top) / heroRect.height);
      setProgress(story, '--wash-progress', (headerBottom - storyRect.top) / Math.max(1, storyRect.height - viewport));
      setProgress(story, '--scene-entry', entry);
      setProgress(story, '--scene-progress', scene);
      setProgress(story, '--photo-progress', photo);
      setProgress(story, '--quote-progress', quote);
      setProgress(story, '--answer-progress', answer);

      const activeScene = entry < .69 ? '1' : answer < .51 ? '2' : '3';
      if (story.dataset.scene !== activeScene) story.dataset.scene = activeScene;
    }
    if (questionsTop !== undefined) {
      const chapterTravel = Math.max(1, (innerHeight - headerBottom) * .75);
      const chapterProgress = (innerHeight - questionsTop) / chapterTravel;
      setProgress(questions, '--chapter-progress', chapterProgress);
    }
    if (artRect) {
      const artProgress = (innerHeight - artRect.top) / (innerHeight + artRect.height);
      setProgress(scrollArt, '--art-progress', artProgress);
    }
    panelRects.forEach((rect, index) => {
      const panelProgress = (innerHeight - rect.top) / (innerHeight + rect.height);
      setProgress(scrollPanels[index], '--panel-progress', panelProgress);
    });
  }

  function scheduleScrollState() {
    if (scrollFrame === null) scrollFrame = requestAnimationFrame(updateScrollState);
  }
  window.addEventListener('scroll', scheduleScrollState, { passive: true });
  window.addEventListener('resize', scheduleScrollState, { passive: true });
  story.classList.toggle('motion-ready', !reducedMotion.matches);
  reducedMotion.addEventListener('change', event => {
    story.classList.toggle('motion-ready', !event.matches);
    if (event.matches) {
      questions?.style.removeProperty('--chapter-progress');
      scrollArt?.style.removeProperty('--art-progress');
      scrollPanels.forEach(panel => panel.style.removeProperty('--panel-progress'));
    }
    scheduleScrollState();
  });
  scheduleScrollState();

  document.querySelectorAll('[data-dialog]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.dialog).showModal()));
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
  });
  // Only defer content below the first viewport. Focus always reveals it immediately.
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const revealSelector = '.reveal, [data-reveal]';
    const waiting = new Set();
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) reveal(entry.target, true);
    }), { threshold: 0, rootMargin: '0px 0px -24px 0px' });

    function reveal(target, animate) {
      if (!waiting.delete(target)) return;
      target.classList.remove('is-waiting');
      if (animate) target.classList.add('is-visible');
      observer.unobserve(target);
    }

    document.querySelectorAll('[data-stagger]').forEach(group => {
      Array.from(group.children).filter(child => child.matches(revealSelector)).forEach((child, index) => {
        child.style.setProperty('--reveal-delay', `${Math.min(index * 75, 225)}ms`);
      });
    });
    document.querySelectorAll(revealSelector).forEach(target => {
      if (target.getBoundingClientRect().top <= window.innerHeight) return;
      waiting.add(target);
      target.classList.add('is-waiting');
      observer.observe(target);
    });
    document.addEventListener('focusin', event => {
      waiting.forEach(target => {
        if (target.contains(event.target)) reveal(target, false);
      });
    });
    reducedMotion.addEventListener('change', event => {
      if (!event.matches) return;
      waiting.forEach(target => reveal(target, false));
      observer.disconnect();
    });
  }
})();
