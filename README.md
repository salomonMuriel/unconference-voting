# Unconference Voting

A small Next.js app for running an unconference: participants propose topics, vote on them, and claim sessions. Built for projection on a big screen during the session.

## Stack

- Next.js 15 (App Router) + React 19
- Tailwind CSS 4
- Neon serverless Postgres
- Lucide icons

## Design

The UI follows the **Ignia design system**. Tokens (colors, radii, shadows, motion) live in
`src/app/globals.css`; shared primitives are in `src/components/ui.tsx`.

House rules worth keeping in mind when editing:

- **Emoji: 🔥 only.** Everything else is a Lucide icon at stroke 1.5.
- **CTAs are always pill-shaped.** Inputs and admin buttons use the tight `0.2rem` base radius.
- Slate near-black is the primary fill; `#db6934` is an accent for one marquee element at a time.
- Space Grotesk carries display type, Geist carries body/UI. Both are self-hosted in `public/fonts/`.
- Cards lift 4px on hover with a top accent line that scales in from the left.
- Copy is Spanish (Colombia), warm and direct — nosotros + tú, never usted.
- The palette is light only — slate near-black on white, per Ignia's canonical web palette.

Brand assets (`logo-light.png`, favicons, fonts) are copied into `public/` from the Ignia
design system project — don't regenerate them.

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
