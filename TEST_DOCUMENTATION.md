# Test Documentation - CivicFlow Demo

## Short Summary

- **Tester:** AQA Candidate
- **Date:** 2026-06-20
- **Environment:** Local Demo (`http://127.0.0.1:4173`, production build served by `vite preview`)
- **Browser/device coverage:** Chromium, Firefox, WebKit (desktop) + iPhone 14, Pixel 7, Galaxy S9+ (mobile)
- **API target:** Automation Exercise public API (`https://automationexercise.com/api`)
- **Build or commit:** local checkout of `oleksandr-savchuk-uitop/aqa`
- **Overall result:** All automated tests pass. 13 UI tests run across 6 browser/device profiles (78 runs) + 2 API tests. A few minor UX observations are listed under *Possible Bugs*.

### How to run

```bash
npm install
npx playwright install
npm run test:e2e          # all UI + API tests, all profiles
npx playwright show-report
```

## Test Cases

| ID | Area | Scenario | Preconditions | Steps | Expected Result | Actual Result | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| UI-001 | Sign In | Valid applicant login | App open on sign-in page | Enter valid email + password, submit | Dashboard ("Applicant dashboard") is visible | As expected | Pass | Positive |
| UI-002 | Sign In | Log out returns to sign-in | Signed in | Click Log out | Sign-in page ("CivicFlow Demo") is visible again | As expected | Pass | Positive |
| UI-003 | Sign In | Empty email validation | App open on sign-in page | Submit empty form | `Email is required.` is shown | As expected | Pass | Negative |
| UI-004 | Sign In | Invalid email format | App open on sign-in page | Enter `not-an-email` + valid password, submit | `Enter a valid email address.` is shown | As expected | Pass | Negative |
| UI-005 | Sign In | Empty password validation | App open on sign-in page | Enter valid email, empty password, submit | `Password is required.` is shown | As expected | Pass | Negative |
| UI-006 | Sign In | Wrong credentials | App open on sign-in page | Enter valid email + wrong password, submit | `Invalid email or password.` is shown | As expected | Pass | Negative |
| UI-007 | Projects | Projects page visible | Signed in | Click Projects in left menu | Projects page ("My Project Templates") is visible | As expected | Pass | Navigation |
| UI-008 | Projects | Seeded project cards shown | On Projects page | Observe project list | 3 cards: Garage Addition, Retail Renovation, Site Improvement | As expected | Pass | Seed data |
| UI-009 | Projects | Missing project name | On Create Custom Project form | Submit with empty name | `Project name is required.` is shown | As expected | Pass | Required field |
| UI-010 | Projects | Missing jurisdiction | On Create form | Fill name only, submit | `Jurisdiction is required.` is shown | As expected | Pass | Required field |
| UI-011 | Projects | Missing address line | On Create form | Fill name + jurisdiction, submit | `Address line is required.` is shown | As expected | Pass | Required field |
| UI-012 | Projects | Duplicate project name | On Create form | Use existing name `Garage Addition` + valid fields, submit | `Project name already exists.` is shown | As expected | Pass | Validation |
| UI-013 | Projects | Create custom project | On Create form | Fill required + optional fields, submit | Returns to list; new card shows name, jurisdiction, address+unit, description, `Draft`, `0%`, created date | As expected | Pass | Positive, happy path |
| API-001 | API | Get products list (positive) | API reachable | `GET /api/productsList` | Body `responseCode: 200`, non-empty `products` array | As expected | Pass | See API details |
| API-002 | API | Verify login without email (negative) | API reachable | `POST /api/verifyLogin` with password only | Body `responseCode: 400`, missing-parameter message | As expected | Pass | See API details |

## Possible Bugs

These are minor observations. The README states some areas are intentionally minimal for the demo scope, so several of these may be by design - they are documented for completeness as a tester would report them.

| Bug ID | Title | Severity | Area | Status |
| --- | --- | --- | --- | --- |
| BUG-001 | Several controls have no effect when clicked | Low | UI / Navigation | Open |
| BUG-002 | Only the first validation error is shown at a time | Low | Forms / UX | Open |

### BUG-001: Several controls have no effect when clicked

- **Severity:** Low
- **Environment:** Local Demo, all browsers
- **Browser/device:** Reproduced on Chromium desktop
- **Test data:** N/A

Reproduction steps:

1. On the sign-in page, click `Lost your password?`.
2. After signing in, on the dashboard click the `New packet`, `Estimate`, or `View settings` card buttons.
3. On the Projects page, click `Explore Templates`.

Expected result:

- Each control performs an action (navigation, modal, or visible feedback).

Actual result:

- Nothing happens - these controls have no click handler. (The Projects card button and the sidebar navigation do work.)

### BUG-002: Only the first validation error is shown at a time

- **Severity:** Low
- **Environment:** Local Demo, all browsers
- **Browser/device:** Reproduced on Chromium desktop
- **Test data:** Empty sign-in form / empty project form

Reproduction steps:

1. On the sign-in page, leave both email and password empty and submit.
2. On the Create Custom Project form, leave all fields empty and submit.

Expected result:

- Ideally all missing required fields are highlighted, or a per-field message is shown.

Actual result:

- Only the first failing field's message is shown (e.g. `Email is required.` / `Project name is required.`), one at a time. Fixing the first field and resubmitting then reveals the next error.

Console/network errors:

```text
None observed.
```

## API Test Details

| ID | Method | Endpoint | Request Data | Expected Status | Expected Body | Actual Status | Actual Body | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| API-001 | GET | `/api/productsList` | none | Body `responseCode: 200` | `products` is a non-empty array with `id` and `name` | `responseCode: 200` | Non-empty product list returned | Pass |
| API-002 | POST | `/api/verifyLogin` | `password` only (no `email`) | Body `responseCode: 400` | `Bad request, email or password parameter is missing in POST request.` | `responseCode: 400` | Exact message returned | Pass |

> Note: the Automation Exercise API always returns HTTP `200` and reports the real result code inside the JSON body field `responseCode`. The tests assert on `responseCode` rather than the HTTP status. This behavior is itself worth flagging as a deviation from typical REST conventions (returning `200` for a `400`-class error).

## Screenshots And Videos

Screenshots and videos are captured automatically only on failure (`screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`) and traces on first retry. Since all tests pass, no failure artifacts are attached. The full HTML report is produced by `npx playwright show-report` and is published to GitHub Pages by the Docker CI workflow.

| File | Scenario | Notes |
| --- | --- | --- |
| (none) | - | No failures, so no failure artifacts generated |

## Console And Network Errors

A listener (`collectPageErrors` in `tests/helpers.ts`) records `console` errors, `pageerror` events, and failed network requests during every UI test and attaches them to the report if any occur.

| Scenario | Error Source | Message | Impact |
| --- | --- | --- | --- |
| All UI flows | Console | None observed | - |
| All UI flows | Network | None observed | - |

## Final Notes

- **Main risks:** The app stores all state in `localStorage`; tests clear it before each run to stay deterministic. The Automation Exercise public API is external and can occasionally be slow or rate-limited. When called from inside the Playwright Docker container in CI, that API responds with an endless redirect to its homepage (bot protection / data-center networking), so the API tests run in the main `playwright.yml` workflow and via local `docker compose` (where they pass); the Docker CI workflow runs the browser suite only.
- **Coverage gaps:** No tests for the Settings screen or the non-functional controls in BUG-001 (out of task scope). No accessibility or visual-regression checks.
- **Recommended follow-ups:** Add per-field validation messages (BUG-002), wire up or hide the inert controls (BUG-001), and consider seeding state via `localStorage` injection to speed up project-creation setup.
