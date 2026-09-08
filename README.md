# Flip for Business — Registration Automation

Take-home test (Test Engineer). Two deliverables:

| # | Deliverable | Where |
|---|---|---|
| 1 | **Automation** for business registration on `https://business.flip.id/signup` | this repo — `tests/web/registration.spec.ts` |
| 2 | **Test cases** for the registration flow | **Google Sheet:** <https://docs.google.com/spreadsheets/d/1rsezznJ74xyabuST7KncQVbNRLtwLC6vMAilo8USYGM/edit?usp=sharing> · offline copies in [`docs/`](docs/) (`.xlsx` / `.csv`) |

Stack: **Playwright + TypeScript**.

---

## 1. Automation

### Requirements

- Node.js LTS (18 or newer)

### Setup (for the reviewer)

```bash
git clone <this-repo-url>
cd flip-business-registration-automation

npm install
npx playwright install --with-deps   # one-time: download the browser
```

### Run the tests

```bash
npm run test:regression   # 7 tests — validation & conditional-field checks; safe to run repeatedly
npm run report            # open the HTML report from the last run
```

That is the suite a reviewer normally wants: it exercises the form end-to-end
through the browser **without creating any account** (it submits invalid data
that the form rejects, or doesn't submit at all).

Other commands:

| Command | What it does |
|---|---|
| `npm test` | every test (chromium, headless) |
| `npm run test:regression` | `@regression` only — 7 tests, no account created |
| `npm run test:smoke` | `@smoke` only — 2 happy-path tests (**creates a real account**, see below) |
| `npm run test:headed` | run with a visible browser |
| `npm run test:ui` | Playwright UI mode (watch / step through) |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript checks |

### What the suite covers

**`@smoke` — happy path (2)**

| Test | Result asserted |
|---|---|
| Register a new individual business (Perseorangan) with valid data | lands on `/verification/email`, "Email verifikasi terkirim!", registered email shown |
| Register a new legal-entity business (Badan Usaha) with valid data | same, and "Nama Bisnis" only appears after choosing "Badan Usaha" |

**`@regression` — validation & UI behaviour (7)**

| Test | Result asserted |
|---|---|
| Invalid email format | inline error "Format email salah" |
| "Buat Akun" button stays disabled until every required field is filled | disabled → enabled transition |
| Selecting **Perseorangan** reveals the Buat ID field + ID suggestions | conditional field + suggestion chips appear |
| Selecting **Badan Usaha** reveals **Nama Bisnis** + Buat ID | both conditional fields appear |
| Password shorter than 8 chars | inline error "Kata sandi minimal 8 karakter" |
| Weak 8+ char password | server error "Kata sandi terlalu lemah …", stays on `/signup` |
| Buat ID containing a space | inline error "Hanya diperbolehkan kombinasi huruf, angka dan garis bawah (_)" |

Seven more cases are documented in the Sheet but not automated (need inbox
access, a pre-existing account, or unconfirmed expected behaviour).

### About the `@smoke` tests

They submit a **valid** form, so they **create a real account** on
`business.flip.id` and trigger a verification email — that is why they are not
in CI and are run on demand:

```bash
# optional: point generated emails at an inbox you control
SIGNUP_EMAIL_DOMAIN=your-domain.com npm run test:smoke
```

Signup emails are generated as `flip.qa.<unique>@<domain>` (a dot, not `+` —
Flip's form rejects plus-addressing; Gmail ignores dots so every run still lands
in one inbox). Completing the verification link is out of scope (needs inbox
access).

### Project layout

```
tests/web/registration.spec.ts   one test() per test case; title matches the test-case doc verbatim
pages/SignupPage.ts              Page Object — fields located via the app's data-qaid attribute
data/users.ts                    factories that build valid, per-run-unique signup data
playwright.config.ts             baseURL, testIdAttribute = 'data-qaid', reporter
eslint.config.mjs                ESLint (typescript-eslint + eslint-plugin-playwright)
```

Design notes:

- **Page Object Model** — all locators live in `SignupPage`; specs contain no raw selectors.
- **Locators use `data-qaid`** (the app's stable QA hook), set as Playwright's `testIdAttribute`.
- **Unique data per run** — email / phone / business ID are generated with a short
  unique suffix so re-runs never collide on Flip's unique fields.
- **One Qase-style case = one `test()`**, tagged with exactly one of
  `@smoke` / `@regression`, plus `@registration`.
- No `test.skip()`; imports use the `@pages` / `@data` path aliases.

### Configuration

| Env var | Default | Purpose |
|---|---|---|
| `BASE_URL` | `https://business.flip.id` | target origin |
| `SIGNUP_EMAIL_DOMAIN` | `example.com` | domain for generated signup emails |
| `CI` | — | when set: retries on, single worker, GitHub reporter |

---

## 2. Test cases

Full set (16 cases) in the Google Sheet:
<https://docs.google.com/spreadsheets/d/1rsezznJ74xyabuST7KncQVbNRLtwLC6vMAilo8USYGM/edit?usp=sharing>

- One row per step: `ID · Title · Type · Priority · Automated · Precondition ·
  Step # · Action · Test Data · Expected Result · Postcondition · Status · Notes`.
- Product UI text (labels, buttons, error messages) is quoted verbatim in Indonesian.
- Offline copies committed at [`docs/test-cases-registration.xlsx`](docs/test-cases-registration.xlsx)
  and [`.csv`](docs/test-cases-registration.csv).

`TC-01`…`TC-09` are automated (same titles as the `test()` blocks); `TC-10`…`TC-16`
are manual / not-yet-automatable.

---

## 3. What runs on a Pull Request

`.github/workflows/playwright.yml` triggers on every PR to `main` / `master`:

| Job | Steps | Purpose |
|---|---|---|
| **`lint`** | `npm ci` → `npm run lint` → `npm run typecheck` | ESLint + TypeScript must pass |
| **`regression`** | `npm ci` → install browser → `npx playwright test --grep-invert @smoke` | the 7 no-account tests must pass; uploads the HTML report as a build artifact |

The `@smoke` tests are **excluded from CI** (they create real accounts) — run them
locally with `npm run test:smoke`.

Both jobs can be made required status checks on `main` via a branch ruleset.
