# SP Mortgages — Queries filter redesign

**Live prototype:** https://yashviheizen.github.io/sp-mortgages-filter-redesign/

A standalone design prototype of the SP Mortgages Admin Console *Queries* page, comparing three filter UI approaches. Use the **Option 1 / 2 / 3** switcher above the filters — the sidebar, header, search and table stay identical; only the filter UI changes.

| Option | Approach | Behaviour |
| --- | --- | --- |
| 1 | Linear-style compact dropdowns | Status / Assigned to / Category / Due date chips with checkbox popovers and live counts; results update instantly |
| 2 | Notion-style filter builder | "Where *field* *is / is not* *values*" conditions; add, edit, remove; active conditions shown as chips |
| 3 | Unified filter popover | One panel with all sections + date range; changes apply on **Apply filters**; applied filters shown as chips |

Sample data is fictional; "today" is fixed to 8 Oct 2026 so due-date labels stay stable.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Filter variations live in `src/components/filters/`.

## Deployment

Every push to `main` builds a static export and publishes it to GitHub Pages via `.github/workflows/pages.yml`.
