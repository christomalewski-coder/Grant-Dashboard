# Grant Opportunity Dashboard - Production Package

This package is a deployable Next.js dashboard designed as a pipeline engine for:
- DOE funding opportunities
- EECBG opportunities
- State energy office funding
- Utility rebate and infrastructure funding

## What it does
1. Pulls live federal opportunity data from the Grants.gov XML extract
2. Adds curated high-signal programs for DOE, EECBG, state energy offices, and utility incentives
3. Scores opportunities using business-fit rules built for lighting, ESCO, and public-sector pursuit
4. Buckets results into Pursue, Review, Watch, and Expired
5. Surfaces Go / No-Go and Real Deal / Not Real Deal decisions
6. Exports the filtered pipeline to CSV

## Stack
- Frontend: Next.js hosted web dashboard
- Backend: Vercel serverless API route
- Ingestion: Grants.gov XML extract + curated source registry
- Scoring: Rule-based commercial-fit engine
- Export: Browser CSV download
- Deployment: GitHub + Vercel

## Mac-friendly workflow
This is browser-based and cloud-hosted. You can manage the entire workflow from a Mac using:
- GitHub in browser or GitHub Desktop
- Vercel dashboard
- ChatGPT for code replacement
- CSV export from the browser

## File map
- `app/page.tsx` - dashboard UI
- `app/api/opportunities/route.ts` - unified API endpoint
- `lib/sources/grantsGovXml.ts` - federal feed adapter
- `lib/sources/curatedPrograms.ts` - DOE / EECBG / state / utility starter registry
- `lib/scoring.ts` - scoring engine
- `lib/pipeline.ts` - merge, dedupe, classify, summarize
- `data/sourceRegistry.ts` - business filters and exclusions

## Deploy to Vercel
1. Create a new GitHub repo.
2. Upload all files from this folder.
3. Push to GitHub.
4. Log into Vercel.
5. Click **Add New > Project**.
6. Import the GitHub repo.
7. Leave the framework preset as **Next.js**.
8. In Environment Variables, optionally add:
   - `PRIORITY_STATES=IN,TX,AR,AL,MT`
   - `GRANTS_GOV_XML_URL=` only if you need to override the default feed URL
9. Click **Deploy**.
10. Open the live URL and click **Refresh pipeline**.

## Local run
```bash
npm install
npm run dev
```
Then open `http://localhost:3000`.

## Recommended next upgrades
1. Add a state-by-state source registry JSON for all 50 state energy offices.
2. Add DSIRE state export ingestion instead of curated-only starter rows.
3. Add user-authenticated saved filters.
4. Add CRM push for Pursue opportunities.
5. Add email or chat alerts for new high-score items.
6. Add opportunity owner, next step, and stage fields for sales execution.

## Important security note
If you later wire in authenticated APIs, keep all API keys server-side in Vercel environment variables. Do not commit them into GitHub.
