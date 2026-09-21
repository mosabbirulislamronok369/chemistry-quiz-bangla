# Chemistry Quiz BD — Class 9–10

A local-first Bangla Chemistry MCQ PWA starter built with React + Vite.

## Included
- Chapter selection
- Multi-chapter exam
- Whole-book/model-test style selection
- Random unique question selection by unique question IDs
- User-defined question count/marks and time
- 10/10, 20/20, 30/30 presets
- Countdown timer
- Score/result screen
- PWA manifest + service worker
- No Supabase, database, login, or external storage required
- Chemistry Game hub placeholder for future animated mini-games
- Data file separated at `data/questions.json` for later expansion
- Ready for Cloudflare Pages

## Important content note
The included question bank is a small ORIGINAL demo set to validate the app architecture. It is not a reproduction of the NCTB textbook. For a production release, populate `data/questions.json` with question content you are authorized to use and verify it against the exact 2026 NCTB edition.

## Local run
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
npm run preview
```

## Cloudflare Pages
```bash
npx wrangler login
npx wrangler pages project create chemistry-quiz-bangla --production-branch=main
npm run cf:deploy
```

Or connect the Git repository in Cloudflare Pages and use:
- Build command: `npm run build`
- Build output directory: `dist`

## Android APK
This starter is PWA-ready. For a signed Android APK, the recommended next phase is to wrap the deployed PWA with a Trusted Web Activity (Bubblewrap) or package it with Capacitor. The APK signing/release step requires an Android SDK/JDK environment.

## Future data model
MCQ objects already have:
`id`, `chapter`, `chapterName`, `q`, `options`, `answer`, `explanation`.

Creative questions can later be added as a separate JSON collection without changing the exam engine.
