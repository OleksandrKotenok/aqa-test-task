# CivicFlow Demo

CivicFlow Demo is a local web app for AQA candidate exercises. It provides a fake applicant portal with sign-in, dashboard navigation, a Projects page, and custom project creation for Playwright testing practice.

All data is fake, browser-local, and stored only in `localStorage`. The app does not connect to a real backend, real customers, real jurisdictions, or production services.

## Prerequisites

- Node.js 20 or newer
- npm
- Playwright browsers for local e2e testing

## Install

```bash
npm install
npx playwright install
```

## Run The App

```bash
npm run dev
```

Local app URL: `http://localhost:5173`

## Run Tests

```bash
npm run test:e2e            # run the full suite (UI + API, all profiles)
npx playwright show-report  # open the HTML report after a run
```

The Playwright config builds the app and serves the production bundle with
`vite preview` on `http://127.0.0.1:4173`, so the tests run against the same
bundle that CI uses. For manual exploration, use the Vite dev server on
`http://localhost:5173` (`npm run dev`).

Useful scripts:

```bash
npm run build
npm run test:e2e:ui                       # interactive UI mode
npx playwright test --project=chromium-desktop   # one profile only
npx playwright test --project=api                # API tests only
```

### Test structure

```
tests/
  helpers.ts                       # login helper, clean-start, error collector
  e2e/
    sign-in.spec.ts                # sign-in: positive, negative, validation, logout
    projects.spec.ts               # navigation, seeded data, custom project creation
  api/
    automationexercise.spec.ts     # public API: 1 positive + 1 negative case
```

Browser/device coverage is defined in `playwright.config.ts`: Chromium, Firefox
and WebKit on desktop, plus iPhone 14, Pixel 7 and Galaxy S9+ for mobile. API
tests run in a separate browser-less `api` project.

Test cases, possible bugs and a summary are documented in
[`TEST_DOCUMENTATION.md`](./TEST_DOCUMENTATION.md).

## CI And Docker

- **`.github/workflows/playwright.yml`** - installs dependencies and browsers,
  runs the suite, and uploads the HTML report as a build artifact.
- **`.github/workflows/playwright-docker.yml`** - runs the suite inside the
  official Playwright Docker container and publishes the HTML report to GitHub
  Pages. (Enable Pages with "GitHub Actions" as the source in repository
  Settings → Pages.)

Run the tests in Docker locally:

```bash
docker compose up --build
```

The HTML report is written to `./playwright-report` on the host via a mounted
volume.

## Fake Credentials

- Email: `applicant@example.com`
- Password: `Password123!`
- User role: `Applicant`

## Local Data

The app seeds fake projects on first load and stores created projects in `localStorage`. To reset the app manually, clear browser `localStorage` or use the visible `Reset demo data` button on the Projects page.
