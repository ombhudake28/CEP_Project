# Cyber Suraksha Backend API

This is the Node.js + Express backend for Cyber Suraksha. It provides localized details on cyber frauds, educational quizzes, regional helplines, and a reporting API.

## Features
- **Language support**: Pass `?lang=en` (or `hi`, `mr`) to GET endpoints. Defaults to `en`.
- **Stateless storage**: Appends reports defensively to a local JSON file queue.
- **Robustness**: Covered with rate limits, CORS configurations, security headers, and strong schemas using Zod.
- **Contract-matched**: Every response exactly matches initial requirements.

## Quick Start
1. `npm run install:all` (Make sure you are in the workspace root or pass `--prefix server`)
2. `npm run dev` to start server (or `npm start` for production).
Server runs on port 5000 by default.

## Usage / Endpoints (cURL examples)
- **Health**: 
  `curl http://localhost:5000/api/health`
- **List Scams in Hindi**:
  `curl http://localhost:5000/api/scams?lang=hi`
- **Specific Scam (Phishing)**:
  `curl http://localhost:5000/api/scams/phishing`
- **Helplines in Maharashtra**:
  `curl "http://localhost:5000/api/helplines?state=MH"`
- **Quiz**:
  `curl http://localhost:5000/api/quiz`
- **Submit Report**:
  ```bash
  curl -X POST http://localhost:5000/api/report \
    -H "Content-Type: application/json" \
    -d '{"channel":"email","message":"Test report with enough characters...","consent":true}'
  ```

## How to add a language
1. Add the language code (e.g., `gu` for Gujarati) to the `VALID_LANGUAGES` array in `server/src/middleware/language.js`.
2. Add the equivalent language object/keys inside `server/src/data/scams.json`, `quiz.json`, and `helplines.json`.
   e.g. `"gu": [ ... ]`

## How to add a state helpline
1. In `server/src/data/helplines.json`, add your new state key into the `states` object under each language.
   For example, for Gujarat (`GJ`):
   ```json
   "GJ": {
     "code": "GJ",
     "name": "Gujarat",
     "contacts": [{ "name": "Gujarat Cyber Cell", "phone": "", "website": "", "description": "Call 1930..." }]
   }
   ```
2. Add the state to the `availableStates` array in the same file.

*IMPORTANT: Only include VERIFIED state police numbers. If uncertain, leave the phone empty and prompt users to call 1930 or visit https://cybercrime.gov.in.*

## How to add a scam
1. Define a slug. e.g. `loan-app-fraud`.
2. Create SVG images and place them in the Vite client at `client/public/images/scams/loan-app-fraud-hero.svg` (and `-example.svg`, `-redflags.svg`).
3. Add a new object into `server/src/data/scams.json` for each language mimicking the exact schema (title, slug, image array, howItWorks, etc).
