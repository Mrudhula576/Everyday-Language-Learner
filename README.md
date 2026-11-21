# Everyday Language Learner (మాటలు · Maatalu)

An app that teaches **English to Telugu speakers**, with a focus on **regional accents**.
The app guides you in Telugu, both on screen and out loud. It teaches the English
people actually speak where you live (or where you're going), using natural
conversation, voice practice, and games.

## Core idea

- **Taught in Telugu.** Explanations, instructions, and feedback are written and spoken in Telugu.
- **Accent-aware English.** The app uses your location to pick an English accent
  (for example, US English in Texas, British English in London, Australian English in Sydney,
  or Indian English at home). You can also choose an accent yourself.
- **Voice first.** You listen to native-accent audio (text-to-speech) and answer by speaking
  (speech-to-text). The app scores your pronunciation against the target accent.
- **Works without voice too.** If you can't speak or listen right now, games teach the same material.

## Learning modes

| Mode | What it is | Needs mic/speaker? |
|------|------------|--------------------|
| **Scenarios** | Guided real-life situations (grocery store, restaurant, meeting someone) with about 5 exchanges each | Optional |
| **Free conversation** | Open-ended chat with an AI partner that speaks in your chosen accent and gives gentle corrections in Telugu | Yes (typing is the fallback) |
| **Quiz game** | Multiple-choice and fill-in questions on phrases and meanings | No |
| **Jump game** | Every right answer makes your character jump one step forward. Reach the end to win the level | No |

## How accent selection works

1. The browser asks for your location (Geolocation API). If you say no, the app guesses your country from your IP address.
2. Your country or region is mapped to an English accent code (e.g. `US → en-US`, `GB → en-GB`, `AU → en-AU`, `IN → en-IN`, `NG → en-NG`).
3. That code chooses the speech voice and the pronunciation-scoring model.
4. You can always change the accent manually in settings.

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Plain HTML / CSS / JavaScript |
| Backend | Python, FastAPI |
| Database | Supabase (Postgres): scenarios, quiz questions, user progress |
| Speech (TTS, STT, pronunciation) | Azure AI Speech: regional English voices and Telugu (`te-IN`) |
| Conversation and feedback | Gemini API (free tier, Gemini 4 Hydrogen), behind one swappable function so another provider (e.g. Claude) can be used later |

## Project structure

```
Everyday-Language-Learner/
├── frontend/
│   ├── index.html     # app shell (one page; pages are drawn by JavaScript)
│   ├── manifest.webmanifest, sw.js, icons/   # installable app (PWA)
│   ├── css/           # theme.css (colors, buttons, cards), shell.css (layouts), one file per page
│   ├── audio/accents/ # short sample per accent (made by backend/make_accent_samples.py)
│   └── js/            # app.js, router.js, routes.js, i18n.js, config.js (API address), pages/
├── wireframes.drawio  # phone + browser wireframes for every page
├── backend/
│   ├── main.py        # FastAPI app and CORS
│   ├── database.py    # Supabase client
│   ├── routes/        # API endpoints (scenarios, speech, chat, games)
│   ├── make_accent_samples.py  # re-run after changing a default voice
│   └── requirements.txt
├── database/          # SQL schema and seed data
└── docs/
```

## Running locally

**Backend**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload        # http://127.0.0.1:8000
```

Create `backend/.env` (never commit it):

```
SUPABASE_URL=...
SUPABASE_KEY=...
AZURE_SPEECH_KEY=...
AZURE_SPEECH_REGION=...
GEMINI_API_KEY=...
```

**Frontend**

```bash
cd frontend
python3 -m http.server 5500      # http://127.0.0.1:5500
```

Pages use hash URLs, for example `http://127.0.0.1:5500/#/home` or `#/lessons/3/oral`.
All routes are listed in `frontend/js/routes.js`. Pages that aren't built yet show a
placeholder with the issue number and links to the next pages, so the whole flow can be clicked through.

Below 700px wide the app uses the phone layout (bottom menu); from 700px up it uses the
laptop layout (left sidebar). On a phone, "Add to Home Screen" installs it like an app.

> The microphone and location only work on `localhost`/`127.0.0.1` or over HTTPS.
> The service worker caches app files: if a change doesn't show up, do a hard reload.

## Project status

🚧 In development.

- [x] App shell: routing, phone + laptop layouts, installable app (PWA), English + Telugu text
- [x] Scenario list loaded from Supabase (prototype; becoming lesson topics)
- [ ] Location → accent detection
- [ ] Text-to-speech in Telugu and accented English
- [ ] Speech-to-text and pronunciation scoring
- [ ] Free conversation with an AI partner
- [ ] Quiz game
- [ ] Jump game
- [ ] User progress tracking
