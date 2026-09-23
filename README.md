# VisitBrief

Half of what you meant to tell the doctor evaporates in the waiting room. VisitBrief fixes that.

**Live:** https://ilanis-agent.github.io/visitbrief/ (open `app.html` for the app)

## What it does

Log symptoms as they happen (name, date, severity 1-10). VisitBrief compiles a ranked, copyable brief for the appointment:

- **Onset tracking** - "day 12 since onset" per symptom, no mental math in the exam room
- **Trend detection** - average severity over the last 3 days vs the 3 before: getting worse / stable / improving (needs data in both windows, and says so when there isn't any)
- **Peak recall** - worst severity and the exact day it happened, with a plain-English severity word
- **Ranking** - the symptom with the worst recent average leads the brief
- **Questions** - a persistent list of what you meant to ask, merged into the brief

Everything persists in localStorage. No backend, no account.

## Files

- `index.html` - landing page
- `app.html` - the app
- `engine.js` - pure symptom-log functions (shared with node tests, no DOM)
- `README.md` - this file

Static client-side app; vanilla JS.
