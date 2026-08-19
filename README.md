# Unconference Voting

A small Next.js app for running an unconference: participants propose topics, vote on them, and claim sessions. Built for projection on a big screen during the session.

## Stack

- Next.js 15 (App Router) + React 19
- Tailwind CSS 4
- Neon serverless Postgres

## Setup

```bash
npm install
cp .env.local.example .env.local   # add your DATABASE_URL
npx tsx scripts/setup-db.ts        # create tables
npm run dev
```

## Scripts

- `npm run dev` — dev server
- `npm run build` / `npm start` — production build
- `npx tsx scripts/setup-db.ts` — create the schema
- `npx tsx scripts/clean-db.ts` — wipe data

## How it runs

The board moves through phases (propose → vote → claim). Admins sign in to advance the phase and can reset the database from the board header.
