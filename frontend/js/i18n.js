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

  // Landing page
  navHowItWorks: { en: 'How it works', te: 'ఎలా పనిచేస్తుంది' },
  navAccents: { en: 'Accents', te: 'యాసలు' },
  heroSub: {
    en: 'Speak or tap, at your own pace. A Telugu voice guides every step.',
    te: 'మాట్లాడుతూ లేదా నొక్కుతూ, మీ వేగంలో నేర్చుకోండి. ప్రతి అడుగులో తెలుగు గొంతు దారి చూపిస్తుంది.',
  },
  getStarted: { en: 'Get started', te: 'మొదలుపెట్టండి' },
  heroNote: { en: 'Free · works on phone and laptop', te: 'ఉచితం · ఫోన్‌లో, ల్యాప్‌టాప్‌లో పనిచేస్తుంది' },
  demoVideo: { en: 'Demo video coming soon', te: 'డెమో వీడియో త్వరలో' },
  scrollHint: { en: 'Scroll to see what you can do', te: 'మీరు ఏమి చేయగలరో చూడటానికి కిందకు జరపండి' },
  whatYouCanDo: { en: 'What you can do', te: 'మీరు ఏమి చేయగలరు' },
  tryIt: { en: 'Try it', te: 'ప్రయత్నించండి' },
  modeSpeak: { en: 'Learn by speaking', te: 'మాట్లాడుతూ నేర్చుకోండి' },
  modeSpeakBody: {
    en: 'Hear a phrase in a US voice, say it back, and see a score for every word. A Telugu voice explains each step.',
    te: 'US గొంతులో ఒక మాట విని, మళ్ళీ చెప్పండి. ప్రతి పదానికి మార్కు కనిపిస్తుంది. ప్రతి అడుగును తెలుగు గొంతు వివరిస్తుంది.',
  },
  modeRead: { en: 'Learn by reading', te: 'చదువుతూ నేర్చుకోండి' },
  modeReadBody: {
    en: 'The same lessons with no mic. Put words in order, pick the meaning, fill in blanks. Good for quiet places.',
    te: 'అవే పాఠాలు, మైక్ అవసరం లేదు. పదాలను వరుసలో పెట్టండి, అర్థం ఎంచుకోండి, ఖాళీలు పూరించండి. నిశ్శబ్దంగా ఉండాల్సిన చోట్లకు బాగుంటుంది.',
  },
  modeKite: { en: 'Kite game (speak)', te: 'గాలిపటం ఆట (మాట్లాడి)' },
  modeKiteBody: {
    en: 'Say the word right and your kite flies higher. Three misses and the string snaps.',
    te: 'పదాన్ని సరిగ్గా పలికితే మీ గాలిపటం ఇంకా పైకి ఎగురుతుంది. మూడు సార్లు తప్పితే దారం తెగిపోతుంది.',
  },
  modeBridge: { en: 'Bridge game (tap)', te: 'వంతెన ఆట (నొక్కి)' },
  modeBridgeBody: {
    en: 'Each right answer is one step across the bridge. Three wrong answers or 60 seconds and you fall.',
    te: 'ప్రతి సరైన జవాబుకు వంతెనపై ఒక అడుగు ముందుకు. మూడు తప్పులు లేదా 60 సెకన్లు అయితే కింద పడిపోతారు.',
  },
  accentsTitle: { en: '{n} English accents', te: '{n} ఇంగ్లీష్ యాసలు' },
  accentsHint: {
    en: 'Tap one to hear it · switch any time in Settings',
    te: 'వినడానికి ఒకదాన్ని నొక్కండి · సెట్టింగ్స్‌లో ఎప్పుడైనా మార్చుకోవచ్చు',
  },
  playSample: { en: 'Play the {accent} accent', te: '{accent} యాస వినండి' },
  teluguVoice: { en: 'A Telugu voice guides you the whole way', te: 'మొదటి నుండి చివరి వరకు తెలుగు గొంతు మీకు తోడుగా ఉంటుంది' },
  teluguVoiceBody: { en: 'Instructions and tips are spoken in Telugu.', te: 'సూచనలు, చిట్కాలు తెలుగులో వినిపిస్తాయి.' },
  readyTitle: { en: 'Ready to start?', te: 'మొదలుపెడదామా?' },
  footerAbout: { en: 'About', te: 'మా గురించి' },
  footerPrivacy: { en: 'Privacy', te: 'గోప్యత' },
  footerContact: { en: 'Contact', te: 'సంప్రదించండి' },

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

/** Fill {name} slots: fill('{n} accents', {n: 7}) -> '7 accents' */
function fill(text, vars) {
  return vars ? text.replace(/\{(\w+)\}/g, (slot, name) => (name in vars ? vars[name] : slot)) : text;
}

/** Plain text in one language (for titles, aria-labels, placeholders). */
export function t(key, lang = 'en', vars = null) {
  return fill(entry(key)[lang] || entry(key).en, vars);
}

export function esc(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** HTML for a bilingual label: English, plus Telugu underneath when the mode is 'both'. */
export function bi(key, vars = null) {
  const en = fill(entry(key).en, vars);
  const te = entry(key).te && fill(entry(key).te, vars);
  if (mode === 'en' || !te) return `<span class="bi"><span class="bi-en">${esc(en)}</span></span>`;
  return `<span class="bi"><span class="bi-en">${esc(en)}</span><span class="bi-te telugu" lang="te">${esc(te)}</span></span>`;
}

/** HTML for a bilingual paragraph: an English <p>, plus a Telugu <p> when the mode is 'both'. */
export function biPara(key, className = '') {
  const { en, te } = entry(key);
  const cls = className ? ` ${className}` : '';
  const english = `<p class="para-en${cls}">${esc(en)}</p>`;
  if (mode === 'en' || !te) return english;
  return `${english}<p class="para-te telugu${cls}" lang="te">${esc(te)}</p>`;
}
