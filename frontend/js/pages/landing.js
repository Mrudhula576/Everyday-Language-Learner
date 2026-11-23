// Page 1 · Landing (issue #3). A long public page that scrolls:
// hero (video + Get started) → what you can do → accents → ready to start → footer.

import { ACCENTS, sampleUrl } from '../accents.js';
import { API_BASE } from '../config.js';
import { bi, biPara, esc, getTextMode, t } from '../i18n.js';
import { link } from '../router.js';

// The four modes, in dashboard tile colors (see theme.css --mustard etc.).
const MODES = [
  { key: 'modeSpeak', body: 'modeSpeakBody', tone: 'mustard', art: '🎙️' },
  { key: 'modeRead', body: 'modeReadBody', tone: 'leaf', art: '📖' },
  { key: 'modeKite', body: 'modeKiteBody', tone: 'maroon', art: '🪁' },
  { key: 'modeBridge', body: 'modeBridgeBody', tone: 'blue', art: '🌉' },
];

// Shown straight away; replaced by the list from GET /api/voices when it loads.
const FALLBACK_ACCENTS = Object.keys(ACCENTS);

function getStarted(extraClass = '') {
  return `<a class="btn btn-primary ${extraClass}" href="${link('/signup')}">${bi('getStarted')}<span aria-hidden="true">→</span></a>`;
}

function hero() {
  return `
    <section class="hero" aria-labelledby="heroTitle">
      <div class="hero-text">
        <h1 id="heroTitle">${bi('pageLanding')}</h1>
        <div class="hero-sub">${biPara('heroSub')}</div>
      </div>
      <div class="hero-video" role="img" aria-label="${esc(t('demoVideo'))}">
        <span class="hero-play" aria-hidden="true">▶</span>
        ${bi('demoVideo')}
      </div>
      <div class="hero-cta">
        ${getStarted('hero-start')}
        <p class="hero-note muted">${bi('heroNote')}</p>
      </div>
    </section>
    <button type="button" class="scroll-hint" data-scroll-to="how">${bi('scrollHint')} <span aria-hidden="true">↓</span></button>`;
}

function modes() {
  return `
    <section class="landing-section" id="how" aria-labelledby="howTitle">
      <h2 id="howTitle">${bi('whatYouCanDo')}</h2>
      <div class="modes">
        ${MODES.map((m) => `
          <article class="mode mode-${m.tone}">
            <div class="mode-art" aria-hidden="true">${m.art}</div>
            <div class="mode-text">
              <h3>${bi(m.key)}</h3>
              ${biPara(m.body)}
              <a class="mode-try" href="${link('/signup')}">${bi('tryIt')} <span aria-hidden="true">→</span></a>
            </div>
          </article>`).join('')}
      </div>
    </section>`;
}

function accentButtons(codes) {
  return codes
    .filter((code) => ACCENTS[code])
    .map((code) => {
      const a = ACCENTS[code];
      return `
        <button type="button" class="accent" data-accent="${code}" aria-pressed="false"
                aria-label="${esc(t('playSample', 'en', { accent: a.en }))}">
          <span class="accent-flag" aria-hidden="true">${a.flag}</span>
          <span class="bi"><span class="bi-en">${esc(a.en)}</span>${textModeTe(a.te)}</span>
          <span class="accent-icon" aria-hidden="true">🔊</span>
        </button>`;
    }).join('');
}

// Telugu accent name under the English one (only when the page shows Telugu).
function textModeTe(te) {
  return getTextMode() === 'en' ? '' : `<span class="bi-te telugu" lang="te">${esc(te)}</span>`;
}

function accents(codes) {
  return `
    <section class="landing-section" id="accents" aria-labelledby="accentsTitle">
      <h2 id="accentsTitle">${bi('accentsTitle', { n: codes.length })}</h2>
      <p class="muted">${bi('accentsHint')}</p>
      <div class="accent-grid">${accentButtons(codes)}</div>
      <div class="telugu-voice">
        <span class="telugu-voice-icon" aria-hidden="true">🔊</span>
        <div>
          <h3>${bi('teluguVoice')}</h3>
          ${biPara('teluguVoiceBody', 'muted')}
        </div>
      </div>
    </section>`;
}

function ready() {
  return `
    <section class="landing-section ready" aria-labelledby="readyTitle">
      <h2 id="readyTitle">${bi('readyTitle')}</h2>
      ${getStarted('ready-start')}
    </section>
    <footer class="landing-footer muted">
      <span>${esc(t('footerAbout'))}</span> · <span>${esc(t('footerPrivacy'))}</span> · <span>${esc(t('footerContact'))}</span>
    </footer>`;
}

export default {
  render() {
    return `<div class="landing">${hero()}${modes()}${accents(FALLBACK_ACCENTS)}${ready()}</div>`;
  },

  mount(root) {
    const audio = new Audio();
    let playing = null;   // the accent button that is playing
    let alive = true;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Top-bar links and the scroll hint scroll down this page.
    function onScrollClick(e) {
      const button = e.target.closest('[data-scroll-to]');
      if (!button) return;
      const target = root.querySelector(`#${button.dataset.scrollTo}`);
      if (!target) return;
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      const heading = target.querySelector('h2');
      heading?.setAttribute('tabindex', '-1');
      heading?.focus({ preventScroll: true });
    }

    function setPlaying(button) {
      if (playing) {
        playing.classList.remove('playing');
        playing.setAttribute('aria-pressed', 'false');
      }
      playing = button;
      if (button) {
        button.classList.add('playing');
        button.setAttribute('aria-pressed', 'true');
      }
    }

    // Tap an accent to hear it; tap it again (or another one) to stop.
    function onAccentClick(e) {
      const button = e.target.closest('[data-accent]');
      if (!button) return;
      audio.pause();
      if (playing === button) {
        setPlaying(null);
        return;
      }
      setPlaying(button);
      audio.src = sampleUrl(button.dataset.accent);
      audio.play().catch(() => setPlaying(null));
    }

    audio.addEventListener('ended', () => setPlaying(null));
    audio.addEventListener('error', () => setPlaying(null));

    document.addEventListener('click', onScrollClick);
    root.addEventListener('click', onAccentClick);

    // Build the accent list from the backend. If it's not running, the
    // built-in list stays.
    fetch(`${API_BASE}/api/voices`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => {
        const codes = Object.keys(data.english || {}).filter((code) => ACCENTS[code]);
        if (!alive || !codes.length) return;
        audio.pause();
        setPlaying(null);
        const section = root.querySelector('#accents');
        section.querySelector('#accentsTitle').innerHTML = bi('accentsTitle', { n: codes.length });
        section.querySelector('.accent-grid').innerHTML = accentButtons(codes);
      })
      .catch((err) => console.info('Accent list from the backend not available, using the built-in list:', err));

    return () => {
      alive = false;
      audio.pause();
      audio.removeAttribute('src');
      document.removeEventListener('click', onScrollClick);
      root.removeEventListener('click', onAccentClick);
    };
  },
};
