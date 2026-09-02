/* ---------------------------------------------------------
   STATE
--------------------------------------------------------- */
let SCENARIOS = [];

let state = {
  uiLang: 'en',          // preferred language — everything the app says is in this
  direction: null,       // 'te' = learning Telugu, 'en' = learning English
  scenario: null,
  turnIndex: 0,
  correctCount: 0,
  answered: false,
  scenarioStatus: 'loading'   // 'loading' | 'ready' | 'error'
};

/* ---------------------------------------------------------
   INTERFACE STRINGS
   Keyed by preferred language. {lang} is filled with the name of the
   language being learned, written in the preferred language.
--------------------------------------------------------- */
const I18N = {
  en: {
    heroKicker: 'Real situations, real words',
    heroGreeting: 'Hi!',
    heroTitle: 'Welcome to Everyday Language Learner.',
    heroBody: "We'll get you speaking {lang} smoothly — one real, everyday situation at a time. The grocery store, a restaurant, meeting someone new: you practice saying things in your own words and get honest, useful feedback either way. Everything from here on is in {ui}, so you can put all your attention on the {lang}.",
    setupLearn: "You're learning",
    setupGuide: 'Guided in',
    startBtn: 'Continue →',
    back: '← Back',
    scenarioHeading: 'Pick a situation',
    scenarioSub: 'Each one is a short, real conversation — about five exchanges.',
    scenariosLoading: 'Loading situations…',
    scenariosEmpty: 'No situations available yet.',
    scenariosError: "Couldn't load the situations — the server didn't respond.",
    retry: 'Try again',
    learningBadge: 'Learning {lang}',
    steps: 'steps',
    exitScenario: '← Exit scenario',
    answerLabel: 'Your response, in {lang}',
    answerPlaceholder: "Type what you'd actually say…",
    checkBtn: 'Check my answer',
    nextBtn: 'Continue →',
    verdictCorrect: 'Communication successful ✅',
    textCorrect: 'That gets the message across naturally.',
    verdictClose: 'Almost there',
    textClose: "You're close — here's a more natural way to say it:",
    verdictRetry: "Let's try that again",
    textRetry: 'A natural way to communicate this is:',
    summaryLabel: 'Scenario complete',
    summaryDone: '{title} — done',
    summaryPerfect: 'Every response communicated clearly. That whole conversation would work in real life.',
    summaryGood: 'Solid conversation overall — a couple of responses could sound a little more natural.',
    summaryFair: 'Good first pass. Try the suggested phrases out loud, then run through this scenario again.',
    tryAnother: 'Try another situation',
    home: 'Home',
    footer: 'Rule-based feedback for now — smarter, LLM-flexible checking is coming in V2.',
    langName: { en: 'English', te: 'Telugu' }
  },
  te: {
    heroKicker: 'నిజమైన సందర్భాలు, నిజమైన మాటలు',
    heroGreeting: 'నమస్కారం!',
    heroTitle: 'ఎవ్రీడే లాంగ్వేజ్ లెర్నర్‌కు స్వాగతం.',
    heroBody: 'మిమ్మల్ని {lang} సాఫీగా మాట్లాడేలా చేస్తాం — ఒక్కో రోజువారీ సందర్భం ద్వారా. కిరాణా దుకాణం, రెస్టారెంట్, కొత్త వ్యక్తిని కలవడం: మీ సొంత మాటల్లో చెప్పడం సాధన చేస్తారు, ప్రతిసారీ నిజాయితీగా ఉపయోగపడే సలహా అందుతుంది. ఇక్కడి నుండి అంతా {ui}లోనే ఉంటుంది, కాబట్టి మీ దృష్టి అంతా {lang} మీదే ఉంచవచ్చు.',
    setupLearn: 'మీరు నేర్చుకుంటున్నది',
    setupGuide: 'మార్గదర్శకత్వం',
    startBtn: 'కొనసాగించండి →',
    back: '← వెనుకకు',
    scenarioHeading: 'ఒక సందర్భాన్ని ఎంచుకోండి',
    scenarioSub: 'ప్రతి ఒక్కటీ ఒక చిన్న, నిజమైన సంభాషణ — సుమారు ఐదు మాటల మార్పిడి.',
    scenariosLoading: 'సందర్భాలు లోడ్ అవుతున్నాయి…',
    scenariosEmpty: 'ఇంకా సందర్భాలు ఏవీ లేవు.',
    scenariosError: 'సందర్భాలను లోడ్ చేయలేకపోయాం — సర్వర్ స్పందించలేదు.',
    retry: 'మళ్ళీ ప్రయత్నించండి',
    learningBadge: '{lang} నేర్చుకుంటున్నారు',
    steps: 'అంచెలు',
    exitScenario: '← సందర్భం నుండి బయటకు',
    answerLabel: 'మీ సమాధానం, {lang}లో',
    answerPlaceholder: 'మీరు నిజంగా చెప్పేదాన్ని టైప్ చేయండి…',
    checkBtn: 'నా సమాధానాన్ని తనిఖీ చేయండి',
    nextBtn: 'కొనసాగించండి →',
    verdictCorrect: 'సంభాషణ విజయవంతం ✅',
    textCorrect: 'ఇది భావాన్ని సహజంగా అందిస్తుంది.',
    verdictClose: 'దాదాపు వచ్చేసింది',
    textClose: 'మీరు దగ్గరగా ఉన్నారు — దీన్ని చెప్పడానికి మరింత సహజమైన మార్గం ఇది:',
    verdictRetry: 'మళ్ళీ ప్రయత్నిద్దాం',
    textRetry: 'దీన్ని చెప్పడానికి సహజమైన మార్గం ఇది:',
    summaryLabel: 'సందర్భం పూర్తయింది',
    summaryDone: '{title} — పూర్తయింది',
    summaryPerfect: 'ప్రతి సమాధానమూ భావాన్ని స్పష్టంగా అందించింది. ఈ సంభాషణ నిజ జీవితంలో పని చేస్తుంది.',
    summaryGood: 'మొత్తంగా మంచి సంభాషణ — కొన్ని సమాధానాలు ఇంకొంచెం సహజంగా ఉండవచ్చు.',
    summaryFair: 'మంచి మొదటి ప్రయత్నం. సూచించిన వాక్యాలను గట్టిగా చెప్పి చూడండి, ఆ తర్వాత ఈ సందర్భాన్ని మళ్ళీ ప్రయత్నించండి.',
    tryAnother: 'మరో సందర్భాన్ని ప్రయత్నించండి',
    home: 'హోమ్',
    footer: 'ప్రస్తుతానికి నియమాల ఆధారిత సలహా — V2లో మరింత తెలివైన, LLM ఆధారిత తనిఖీ వస్తుంది.',
    langName: { en: 'English', te: 'తెలుగు' }
  }
};

/* Language names, always written in the preferred language. */
function langName(code) {
  return I18N[state.uiLang].langName[code] || '';
}

function t(key) {
  const str = I18N[state.uiLang][key] || '';
  return str
    .replace(/\{lang\}/g, langName(state.direction))
    .replace(/\{ui\}/g, langName(state.uiLang));
}

/* ---------------------------------------------------------
   LANGUAGE SETUP (screen-main)
--------------------------------------------------------- */
function confirmLanguages() {
  const pref = document.getElementById('prefLangSelect').value;
  const learn = document.getElementById('learnLangSelect').value;
  const warning = document.getElementById('langWarning');

  if (pref === learn) {
    warning.classList.add('show');
    return;
  }
  warning.classList.remove('show');

  setLanguages(pref, learn);
  goTo('home');
}

/* Preferred and learning language are complementary, so either one determines
   the pair. `learn` is also what the rest of the app calls `direction`. */
function setLanguages(pref, learn) {
  state.uiLang = pref;
  state.direction = learn;

  document.body.classList.toggle('lang-te', pref === 'te');
  document.documentElement.lang = pref;

  document.getElementById('prefLangSelect').value = pref;
  document.getElementById('learnLangSelect').value = learn;

  applyI18n();
}

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });

  const greeting = document.getElementById('heroGreeting');
  greeting.textContent = t('heroGreeting');

  document.getElementById('setupLearnValue').textContent = langName(state.direction);
  document.getElementById('setupGuideValue').textContent = langName(state.uiLang);

  document.getElementById('scenarioBadge').textContent = t('learningBadge');
}

/* ---------------------------------------------------------
   NAVIGATION
--------------------------------------------------------- */
function goTo(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + screen).classList.add('active');
  if (screen === 'scenario') renderScenarioList();
}

function renderScenarioList() {
  const list = document.getElementById('scenarioList');
  document.getElementById('dirBadge').textContent = t('learningBadge');
  list.innerHTML = '';

  if (state.scenarioStatus !== 'ready') {
    const failed = state.scenarioStatus === 'error';
    list.appendChild(listNote(failed ? t('scenariosError') : t('scenariosLoading'), failed));
    return;
  }
  if (!SCENARIOS.length) {
    list.appendChild(listNote(t('scenariosEmpty'), false));
    return;
  }

  SCENARIOS.forEach(sc => {
    const card = document.createElement('button');
    card.className = 'scenario-card';
    card.onclick = () => startScenario(sc.id);
    card.innerHTML = `
      <div class="emoji">${sc.emoji}</div>
      <div class="meta">
        <h3>${scenarioTitle(sc)}</h3>
        <p>${sc.subtitle}</p>
      </div>
      <div class="count">${sc.turns.length} ${t('steps')}</div>
    `;
    list.appendChild(card);
  });
}

/* Stand-in card for the states where there is nothing to pick from: still
   loading, nothing in the database, or the fetch failed. */
function listNote(message, retryable) {
  const note = document.createElement('div');
  note.className = 'list-note' + (retryable ? ' error' : '');
  note.textContent = message;
  if (retryable) {
    const btn = document.createElement('button');
    btn.className = 'btn btn-ghost';
    btn.textContent = t('retry');
    btn.onclick = loadScenarios;
    note.appendChild(btn);
  }
  return note;
}

/* Scenario copy comes from the database; fall back to the English column when a
   row has no Telugu title yet. */
function scenarioTitle(sc) {
  return state.uiLang === 'te' ? sc.title_te : sc.title_en;
}

/* ---------------------------------------------------------
   CONVERSATION FLOW
--------------------------------------------------------- */
function startScenario(id) {
  state.scenario = SCENARIOS.find(s => s.id === id);
  state.turnIndex = 0;
  state.correctCount = 0;
  document.getElementById('scenarioBadge').textContent = scenarioTitle(state.scenario);
  goTo('conversation');
  renderTurn();
}

function renderTurn() {
  state.answered = false;
  const sc = state.scenario;
  const turn = sc.turns[state.turnIndex];
  const learningTelugu = state.direction === 'te';

  document.getElementById('goalLabel').textContent = turn.goal;
  const promptEl = document.getElementById('promptText');
  if (learningTelugu) {
    promptEl.textContent = turn.promptEn;
    promptEl.classList.remove('telugu');
  } else {
    promptEl.textContent = turn.promptTe;
    promptEl.classList.add('telugu');
  }

  document.getElementById('answerLabel').textContent = t('answerLabel');
  const input = document.getElementById('answerInput');
  input.value = '';
  input.placeholder = t('answerPlaceholder');
  input.focus();

  document.getElementById('feedbackBox').className = 'feedback-inline';
  document.getElementById('checkBtn').style.display = 'inline-flex';
  document.getElementById('nextBtn').style.display = 'none';

  renderDots();
}

function renderDots() {
  const dots = document.getElementById('progressDots');
  dots.innerHTML = '';
  state.scenario.turns.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'dot' + (i < state.turnIndex ? ' done' : i === state.turnIndex ? ' current' : '');
    dots.appendChild(d);
  });
}

/* ---- Simple rule-based evaluator (Phase 2/3 stand-in for the LLM step) ---- */
function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[.,!?¿।॥"'‘’]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function overlapScore(userWords, targetWords) {
  if (!userWords.length) return 0;
  const targetSet = new Set(targetWords);
  const hits = userWords.filter(w => targetSet.has(w)).length;
  return hits / targetWords.length;
}

function evaluate(input, targets) {
  const userWords = normalize(input);
  let best = 0;
  targets.forEach(t => {
    const score = overlapScore(userWords, normalize(t));
    if (score > best) best = score;
  });
  if (best >= 0.6) return 'correct';
  if (best >= 0.3) return 'close';
  return 'retry';
}

function checkAnswer() {
  if (state.answered) return;
  const input = document.getElementById('answerInput').value.trim();
  if (!input) {
    document.getElementById('answerInput').focus();
    return;
  }
  const turn = state.scenario.turns[state.turnIndex];
  const learningTelugu = state.direction === 'te';
  const targets = learningTelugu ? turn.targetsTe : turn.targetsEn;
  const suggest = learningTelugu ? turn.suggestTe : turn.suggestEn;

  const result = evaluate(input, targets);
  state.answered = true;

  const box = document.getElementById('feedbackBox');
  const verdict = document.getElementById('feedbackVerdict');
  const text = document.getElementById('feedbackText');
  const suggestEl = document.getElementById('feedbackSuggest');

  if (result === 'correct') {
    box.className = 'feedback-inline show correct';
    verdict.textContent = t('verdictCorrect');
    text.textContent = t('textCorrect');
    suggestEl.innerHTML = '';
    state.correctCount++;
  } else if (result === 'close') {
    box.className = 'feedback-inline show close';
    verdict.textContent = t('verdictClose');
    text.textContent = t('textClose');
    suggestEl.className = 'suggest ' + (learningTelugu ? 'telugu' : '');
    suggestEl.textContent = suggest;
    state.correctCount += 0.5;
  } else {
    box.className = 'feedback-inline show retry';
    verdict.textContent = t('verdictRetry');
    text.textContent = t('textRetry');
    suggestEl.className = 'suggest ' + (learningTelugu ? 'telugu' : '');
    suggestEl.textContent = suggest;
  }

  document.getElementById('checkBtn').style.display = 'none';
  document.getElementById('nextBtn').style.display = 'inline-flex';
}

function nextTurn() {
  state.turnIndex++;
  if (state.turnIndex >= state.scenario.turns.length) {
    renderSummary();
    goTo('summary');
  } else {
    renderTurn();
  }
}

function renderSummary() {
  const total = state.scenario.turns.length;
  const score = Math.round(state.correctCount * 10) / 10;
  document.getElementById('summaryScore').textContent = `${score}/${total}`;
  document.getElementById('summaryTitle').textContent =
    t('summaryDone').replace('{title}', scenarioTitle(state.scenario));
  let line;
  if (score === total) {
    line = t('summaryPerfect');
  } else if (score >= total * 0.6) {
    line = t('summaryGood');
  } else {
    line = t('summaryFair');
  }
  document.getElementById('summaryLine').textContent = line;
}

/* Clear the "pick two different languages" nudge as soon as either changes. */
['prefLangSelect', 'learnLangSelect'].forEach(id => {
  document.getElementById(id)?.addEventListener('change', () => {
    document.getElementById('langWarning').classList.remove('show');
  });
});

document.getElementById('answerInput')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (!state.answered) checkAnswer(); else nextTurn();
  }
});

async function loadScenarios() {
  state.scenarioStatus = 'loading';
  refreshScenarioList();

  try {
    const response = await fetch('http://127.0.0.1:8000/api/scenarios');

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    SCENARIOS = await response.json();
    state.scenarioStatus = 'ready';

    console.log('Scenarios loaded:', SCENARIOS);
  } catch (error) {
    SCENARIOS = [];
    state.scenarioStatus = 'error';
    console.error('Error loading scenarios:', error);
  }

  refreshScenarioList();
}

/* The fetch can land while the user is still on an earlier screen, so only
   repaint the list when they're actually looking at it. */
function refreshScenarioList() {
  if (document.getElementById('screen-scenario').classList.contains('active')) {
    renderScenarioList();
  }
}

loadScenarios();