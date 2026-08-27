# PROJECT CONTEXT — CatBowl

> **Read this before making any change.** This file is the single source of truth for the project's direction, decisions, and conventions. Stay on this track. Do not revert finalized decisions without explicit instruction.

---

## 1. What is CatBowl

CatBowl is a **cat-feeding crypto charity meme coin** on pump.fun. Every trade generates creator rewards, and **100% of those rewards are converted into cat food** for street cats — with receipts, photos, and on-chain proof for every batch.

- Codebase name: `neobrutalism` (the repo folder). Brand name: **CatBowl** (configurable via `settings.projectName`).
- The site is the public landing page; `/gosdorxda` is the admin panel.

## 2. Mission & The Non-Negotiable

**We never give cash. We only give food.**

This is the core differentiator and must never be contradicted in copy, code, or feature design:

- Creator rewards are converted into cat food **before** reaching anyone.
- Aid to cat rescue partners is **always food**, never funds. Cash can be misused; food cannot.
- Every batch is documented with receipts + photos + on-chain records.
- Transparency is the product. "You don't have to trust us. You only have to look."

**Do not** introduce features, copy, or flows that imply cash donations to shelters/partners. The output is always meals.

## 3. Voice & Writing

- **Language: English** for all user-facing text on the site.
- **Tone: formal, elegant, conviction** — not casual, not "AI-generated" cliché.
- Avoid em-dashes (—) in copy; use periods or restructure. Avoid marketing fluff.
- Tagline (primary): **"Every swap fills a bowl."**
- Community slogan: **"Fill bowls, not wallets."**
- Punchline used in philosophy note: "You don't have to trust us. You only have to look."

## 4. Tech Stack

- **Next.js 16.3.0** (App Router, React 19). This is NOT the Next.js from training data — read `node_modules/next/dist/docs/` before touching conventions.
  - `middleware.ts` is **deprecated → use `proxy.ts`** (function name `proxy`, not `middleware`).
- Tailwind v4 (CSS-based, `app/globals.css`), TypeScript strict.
- **recharts must stay v2** (`^2.15.x`). `components/ui/chart.tsx` (neobrutalism.dev) is written for recharts v2; v3 breaks its types.
- `vaul` (drawer), `framer-motion` (animation), `@radix-ui/*`, `@upstash/redis`, `sharp`.
- neobrutalism.dev components (shadcn-style registry). Installed by manually copying registry `chart.tsx`/`drawer.tsx`/`slider.tsx` content + `npm install` the listed deps. Config in `components.json`.

## 5. Design System (neobrutalism)

- Signature: **bold 2px black borders (`border-2 border-border`), hard shadows (`shadow-shadow`), `rounded-base`**.
- Tokens (in `app/globals.css`, multi-theme via `.theme-*`):
  - `--main` (orange `#ff8e3a`), `--main-foreground` (black)
  - `--chart-1..5`, `--border` (black), `--background`, `--secondary-background`, `--foreground`, `--overlay`, `--ring`
  - Tailwind utilities: `bg-main`, `text-main-foreground`, `border-border`, `shadow-shadow`, `rounded-base`, `font-heading`, `font-base`.
- Cards default to `bg-white` (even in dark themes — this project's themes are light: original/mint/lavender/lemon).
- User preference (respect unless asked): **minimal shadows** — several sections intentionally drop `shadow-shadow` (philosophy note, slider thumb, drawer body, kalkulasi stat cards). Don't re-add shadows where they've been removed.
- Rewards value in hero uses a gradient text: `linear-gradient(90deg,#5a9a0c 34.62%,#009970)` (darkened green for contrast on white). Don't revert to the lighter original.

## 6. App Structure

### Public homepage (`app/(site)/page.tsx`)
Order (do not reorder without instruction):
```
Hero → StatsBar → BatchHistory → Gallery → HowItWorks → Partners → TokenInfo → AreaCover → FAQ
```

### Partners section (`components/partners.tsx`)
- Heading "Cats We've Helped".
- Contains the **philosophy note** (the "no cash, just food" comparison) **below the "Need support? Request support" link** — it is NOT a standalone section. It's a two-column note (problem | solution) with a thin gray divider (`divide-foreground/20`, 1px), transparent bg, no outer border. Left: faded `Dog` icon. Right: navbar project logo image.
- Don't split the philosophy note back into its own section.

### Kalkulasi (calculator) — `components/kalkulasi.tsx`
- **Not a page section.** It's a **global floating button → Drawer** (neobrutalism `Drawer`, `vaul`), mounted in `app/layout.tsx` so it appears on all pages.
- Floating button: bottom-right, `PawPrint` icon, `bg-main`. No badge.
- Drawer title: **"Volume & Rewards"**. Caption links to `https://pump.fun/docs/fees`. Drawer body constrained to `max-w-md mx-auto`.
- Logic: volume slider `$1K–$1M` (step `$1K`, gradient track orange→red, tick marks), fee **fixed 0.3%**, monthly = dailyFee × 30, **1 USD = 1 cat** (`Math.floor(monthly / USD_PER_CAT)`).

### Admin (`app/gosdorxda/`)
- Slug is **`/gosdorxda`** (obscured, not `/admin`). Old `/admin` redirects to `/` via `next.config.ts` redirects.
- Auth: `/api/auth` GET verifies `Authorization: Bearer <ADMIN_PASSWORD>`. Password stored in `sessionStorage`. Login actually validates server-side (don't make it fake again).
- `app/gosdorxda/layout.tsx` sets `robots: noindex`.
- **Maintenance mode** toggle: `settings.maintenanceMode` + `settings.maintenanceMessage`. When ON, `app/(site)/layout.tsx` (force-dynamic) renders `MaintenanceScreen` instead of the site. Admin & API stay accessible so it can be toggled off.

## 7. Data & API Conventions

- Settings: `data/settings.json` (read/written via `lib/settings.ts` `getSettings()`/`saveSettings()`).
- Batches: `data/batches.json` (read/written in `app/api/batches/route.ts`).
- `1 USD = 1 cat` is the project-wide assumption (see `lib/cache.ts` `Math.floor(totalFeesUsd)` and the calculator). Keep consistent.
- Estimated food: **$5 = 1 kg** (hero "Est. Food" stat = `stats.totalFees / 5`). Replaces the former "Feed a Cat" in-card CTA. See `components/hero.tsx`.
- `settings.heroBackground` (image path) — optional background photo for the "Our Impact So Far" section (`components/stats-bar.tsx`) with a dark overlay (`bg-black/70`); empty = default gradient + sleeping cat. Heading text goes light when a photo is set. NOT the hero section.
- Hero "the proof" link → `https://pump.fun/profile/{settings.creatorWallet}?tab=creator-rewards`; falls back to `#token` if wallet unset. See `components/hero.tsx`.
- Rewards/bowls stats use a **last-known-good** Redis pattern: every successful live fetch (`fetchFreshStats`) writes `stats:summary` (60s TTL) + persistent `stats:last-good`. On fetch failure, serve `stats:last-good` instead of the misleading batches.json cumulative. See `lib/cache.ts` `getStats`.
- Auth pattern: `checkAuth(request)` compares `Authorization: Bearer <ADMIN_PASSWORD>` against `process.env.ADMIN_PASSWORD`. Applied to all mutating endpoints (POST/DELETE). **GET `/api/batches` and `/api/settings` are intentionally PUBLIC** — the homepage reads them. Do not add auth to those GETs or you'll break the homepage.
- Secrets in `.env.local` (`ADMIN_PASSWORD`, Redis, SolanaTracker, RPC). Never commit secrets.

## 8. Decisions That Are Final (do not revert)

1. Admin slug `/gosdorxda` (not `/admin`).
2. Login verifies via `/api/auth` (no fake login).
3. `app/favicon.ico` deleted — favicon comes from `settings` via `metadata.icons`.
4. Kalkulasi is a drawer (floating button), not a page section.
5. Philosophy note lives inside Partners, below "Request support".
6. recharts v2 only.
7. `proxy.ts` (not `middleware.ts`) for Next 16.
8. All user-facing copy in English.
9. Maintenance mode via settings + `(site)/layout.tsx`.
10. Slider/hero cards: no shadow where removed.
11. Hero "Est. Food" stat = `rewards_USD / 5` ($5 per kg). Replaces former "Feed a Cat" in-card CTA.
12. `settings.heroBackground` → background image on StatsBar ("Our Impact So Far"), dark overlay — NOT the hero section.
13. Drawer title "Volume & Rewards" (was "From Volume to Meals"); caption links to `https://pump.fun/docs/fees`.
14. "the proof" link → `https://pump.fun/profile/{creatorWallet}?tab=creator-rewards` (fallback `#token`).
15. Rewards/bowls use last-known-good Redis pattern (`stats:last-good` persistent) on fetch failure.
16. `data/batches.json`, `data/fund-activity.json`, `data/stats-cache.json`, `public/uploads/*` are gitignored (test data/photos don't leak to GitHub). `data/settings.json` stays tracked (brand config). Admin "Clear All Data" wipes batches + fund-activity + stats-cache + all uploads, keeps settings.

## 9. Ongoing Direction

- Community group **"Bowl Brigade"**, members called **"Feeders"**. Full Telegram setup guide & posting templates (group name, topics, `#fund-activity`/`#feeding-proof` formats, etc.) live in **`TELEGRAM_GUIDE.md`**.
- Transparency topics planned: `#feeding-proof`, `#fund-activity` (public treasury log — every reward in, every food purchase out, with tx + receipt).
- "Fund activity" is a priority theme — the project positions itself as a publicly auditable charity. Features that increase on-chain/wallet transparency align with the vision.
- **Fund-activity bot (built-in)**: `lib/fund-activity.ts` auto-posts to Telegram `#fund-activity` (incoming donations to foundation wallet, filters: skip creator-wallet sender, skip dust < `fundActivityMinUsd`, classify SOL/USDC/USDT/CATBOWL/unknown) and `#current-batch` (live batch status, edit-on-change). Outgoing foundation tx + rewards transfer (creator→foundation) stay MANUAL. State in `data/fund-activity.json` (log + `lastSignature` dedupe + `currentBatchMessageId`). Config: `fundActivityEnabled` + `fundActivityMinUsd` in settings; Telegram env (`TELEGRAM_BOT_TOKEN`/`CHAT_ID`/`FUND_TOPIC_ID`/`BATCH_TOPIC_ID`) + `FUND_ACTIVITY_CRON_SECRET`. Routes: `/api/fund-activity/check` (cron + admin), `/api/fund-activity/log` (admin). Admin panel tab "Fund" shows log table + summary. See `TELEGRAM_GUIDE.md` §8.
- The site is self-hosted Node (see `DEPLOY.md`, `ecosystem.config.js` PM2).

## 10. Dev Commands

- `npm run dev` — start dev server.
- `npm run build` / `npm run start` — production.
- `npm run lint` — eslint.
- `npx tsc --noEmit` — typecheck (no separate script; run this to verify types).
- No test suite. Verify changes with `npx tsc --noEmit` + `npm run lint` + manual render check (curl `http://localhost:3000/`).

## 11. Agent Guidelines

- **Before writing code**: read the relevant `node_modules/next/dist/docs/` guide (Next 16 differs from training data).
- **Match existing patterns** — `checkAuth`, `cn`, neobrutalism component conventions. Check `components.json` and neighboring files before adding libraries.
- **Don't add comments** unless asked.
- **Don't commit** unless explicitly asked.
- **Don't re-add shadows/borders** that were intentionally removed (see §5, §8).
- **Keep copy English, formal, no em-dashes.**
- **Never contradict "no cash, just food"** in any feature or text.
- After changes, run `npx tsc --noEmit` and `npm run lint`; fix anything you introduced.
