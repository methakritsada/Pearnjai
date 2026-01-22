# FX News → Top 5 Trade Decision System (Pro)

Production-ready MVP for generating a daily FX macro brief, currency bias matrix, and ranked Top 5 trade scenarios using OpenAI Responses API + Vercel Cron. Built with Next.js App Router, Prisma, TailwindCSS, and shadcn/ui.

## Features
- Fetches 24–48h FX/macro news via OpenAI web_search (Call 1) with strict JSON schema outputs.
- Builds a currency bias matrix for USD, EUR, GBP, JPY, CHF, AUD, NZD, CAD.
- Ranks FX pairs and outputs Top 5 scenarios (Call 2) using RSI 75/25 + SMC logic.
- Stores daily reports in Postgres (production) or SQLite (local development).
- Dashboard, history list, and report detail pages.
- Secure cron endpoint with `CRON_SECRET`.

## Tech stack
- Next.js 14 (App Router) + TypeScript
- TailwindCSS + shadcn/ui
- Prisma ORM
- OpenAI Node SDK (Responses API)
- Vercel Postgres (production) + SQLite (local)

## Local setup
```bash
pnpm i
cp .env.example .env
pnpm prisma migrate dev --name init
pnpm dev
```

### `.env` (example)
```
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
DATABASE_PROVIDER=sqlite
DATABASE_URL="file:./dev.db"
CRON_SECRET=
APP_URL=
```

## Manual run (cron simulation)
```bash
curl -X POST "$APP_URL/api/run" \
  -H "Authorization: Bearer $CRON_SECRET"
```

## Vercel deployment
1. Create a Vercel Postgres database.
2. Set `DATABASE_URL` to the Postgres connection string.
3. Set `DATABASE_PROVIDER=postgresql`.
4. Add `OPENAI_API_KEY` and `CRON_SECRET`.
5. Deploy.

## Vercel Cron
The cron schedule runs daily at **07:00 Asia/Bangkok** (00:00 UTC).

`vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/run",
      "schedule": "0 0 * * *"
    }
  ]
}
```

Configure the cron request header:
```
Authorization: Bearer CRON_SECRET
```

## Cost notes
- `web_search` is enabled only for Call 1; Call 2 is analysis-only.

## Safety disclaimer
This tool provides automated macro analysis for educational purposes and does **not** constitute financial advice. Always trade at your own risk.
