# lfcs-study-dashboard

A local-first React + Vite dashboard for LFCS/LFS207 study tracking.

## Features

- Static 8-week LFCS roadmap from JSON data.
- Week-based task blocks.
- Task status tracking (`not started`, `in progress`, `passed`, `failed`).
- Local persistence in `localStorage`.
- Task detail page with full requirements.
- Copy button for a strict ChatGPT grading prompt including the user's evidence.

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start dev server:
   ```bash
   npm run dev
   ```
3. Open the URL shown by Vite (usually `http://localhost:5173`).

## Build for production

```bash
npm run build
npm run preview
```

## Project structure

- `src/data/roadmap.json` – static 8-week study roadmap.
- `src/pages/DashboardPage.jsx` – overview page by week.
- `src/pages/TaskDetailPage.jsx` – task detail + evidence + prompt copy flow.
- `src/lib.js` – localStorage helpers and prompt builder.
