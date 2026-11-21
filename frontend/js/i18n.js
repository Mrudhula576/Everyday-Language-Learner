// Every piece of text the app shows lives here, in English and Telugu.
// Pages never hard-code words: they ask for a key with t() or bi().
//
// Text mode (changed in Settings):
//   'both' -> English with Telugu underneath (default)
//   'en'   -> English only

const STRINGS = {
  appName: { en: 'Maatalu', te: 'మాటలు' },

  // Navigation
  navHome: { en: 'Home', te: 'హోమ్' },
  navLessons: { en: 'Lessons', te: 'పాఠాలు' },
  navProgress: { en: 'Progress', te: 'ప్రగతి' },
  navSettings: { en: 'Settings', te: 'సెట్టింగ్స్' },
  logIn: { en: 'Log in', te: 'లాగిన్' },
  signUp: { en: 'Sign up', te: 'ఖాతా తెరవండి' },
  exit: { en: 'Exit', te: 'బయటకు' },

  // Page titles
  pageLanding: { en: 'Learn everyday English, explained in Telugu', te: 'రోజువారీ ఇంగ్లీష్, తెలుగులో నేర్చుకోండి' },
  pageSignup: { en: 'Create your account', te: 'మీ ఖాతా తెరవండి' },
  pageLogin: { en: 'Welcome back', te: 'మళ్ళీ స్వాగతం' },
  pageForgot: { en: 'Reset your password', te: 'పాస్‌వర్డ్ మార్చండి' },
  pageReset: { en: 'Set a new password', te: 'కొత్త పాస్‌వర్డ్ పెట్టండి' },
  pageLevel: { en: 'Level check', te: 'మీ స్థాయి తెలుసుకుందాం' },
  pagePlan: { en: 'Your plan is ready', te: 'మీ కోసం పాఠాలు సిద్ధం' },
  pageHome: { en: 'Home', te: 'హోమ్' },
  pageLessons: { en: 'Your lessons', te: 'మీ పాఠాలు' },
  pageLearnOral: { en: 'Learn orally', te: 'మాట్లాడుతూ నేర్చుకోండి' },
  pageLearnRead: { en: 'Learn normally', te: 'చదువుతూ నేర్చుకోండి' },
  pageLessonDone: { en: 'Lesson done!', te: 'పాఠం పూర్తయింది' },
  pageKite: { en: 'Kite game', te: 'గాలిపటం ఆట' },
  pageBridge: { en: 'Bridge game', te: 'వంతెన ఆట' },
  pageResult: { en: 'Quiz result', te: 'ఆట ఫలితం' },
  pageProgress: { en: 'Your progress', te: 'మీ ప్రగతి' },
  pageSettings: { en: 'Settings', te: 'సెట్టింగ్స్' },
  pageNotFound: { en: 'Page not found', te: 'ఈ పేజీ లేదు' },

  // Placeholder pages (until each page's own issue is built)
  comingSoon: { en: 'This page is being built in issue', te: 'ఈ పేజీ తయారవుతోంది' },
  goTo: { en: 'Go to', te: 'వెళ్ళండి' },
  backHome: { en: 'Back to the start', te: 'మొదటికి వెళ్ళండి' },

  // Text mode switch (temporary home on the Settings placeholder)
  textMode: { en: 'App text', te: 'యాప్ అక్షరాలు' },
  textModeBoth: { en: 'English + Telugu', te: 'ఇంగ్లీష్ + తెలుగు' },
  textModeEn: { en: 'English only', te: 'ఇంగ్లీష్ మాత్రమే' },
};

const MODE_KEY = 'maatalu.textMode';

function readMode() {
  try {
    return localStorage.getItem(MODE_KEY) === 'en' ? 'en' : 'both';
  } catch {
    return 'both';
  }
}

let mode = readMode();
const listeners = new Set();

export function getTextMode() {
  return mode;
}

export function setTextMode(next) {
  mode = next === 'en' ? 'en' : 'both';
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {
    // Private browsing: the choice just won't be remembered.
  }
  listeners.forEach((fn) => fn(mode));
}

export function onTextModeChange(fn) {
  listeners.add(fn);
}

function entry(key) {
  const value = STRINGS[key];
  if (!value) {
    console.warn(`Missing string: ${key}`);
    return { en: key, te: '' };
  }
  return value;
}

/** Plain text in one language (for titles, aria-labels, placeholders). */
export function t(key, lang = 'en') {
  return entry(key)[lang] || entry(key).en;
}

export function esc(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** HTML for a bilingual label: English, plus Telugu underneath when the mode is 'both'. */
export function bi(key) {
  const { en, te } = entry(key);
  if (mode === 'en' || !te) return `<span class="bi"><span class="bi-en">${esc(en)}</span></span>`;
  return `<span class="bi"><span class="bi-en">${esc(en)}</span><span class="bi-te telugu" lang="te">${esc(te)}</span></span>`;
}
