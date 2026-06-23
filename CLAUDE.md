# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server on port 4000 (Turbopack, outputs to .next/dev) → http://localhost:4000
npm run build    # Production build (Turbopack)
npm run start    # Start production server
npm run lint     # Run ESLint directly (not `next lint` — that command was removed in v16)

supabase start          # Start local Supabase (Docker required)
supabase stop           # Stop local Supabase
supabase db reset       # Reset DB and re-run all migrations
supabase migration new <name>  # Create a new migration file
stripe listen --forward-to localhost:4000/api/stripe/webhook  # Forward Stripe webhooks locally
```

## Architecture

**Stack**: Next.js 16, React 19.2, TypeScript, Tailwind CSS 4 (PostCSS plugin), App Router.

**Integrations**: Supabase (`@supabase/supabase-js` + `@supabase/ssr`), Stripe (`stripe` + `@stripe/stripe-js`), Resend (`resend`), Vercel AI SDK (`ai` + `@ai-sdk/anthropic`).

**UI**: Shadcn/ui (`npx shadcn@latest add <component>`); `next-themes` for dark/light toggle; `lucide-react` for icons; `lib/utils.ts` exports `cn()`.

**Forms & validation**: `react-hook-form` + `@hookform/resolvers` + `zod`.

**Drag-and-drop**: `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`.

**Entry points**: `app/layout.tsx` (root layout with Geist fonts), `app/page.tsx` (home route). Path alias `@/*` maps to the repo root.

**Routing**: File-system based via the `app/` directory. A folder becomes a public route only when it contains `page.tsx` or `route.ts`. Special files: `layout`, `page`, `loading`, `error`, `not-found`, `route`, `template`, `default`.

**Server vs Client Components**: All layouts and pages are Server Components by default. Add `'use client'` only for components that need state, event handlers, or browser APIs. The `'use client'` directive marks a boundary — everything imported into that file is pulled into the client bundle.

## Key Conventions

- **Proxy**: Auth session refresh and route guards live in `proxy.ts` at repo root — no `edge` runtime directive. Unauthenticated `/dashboard/*` redirects to `/login`; incomplete onboarding redirects to `/onboarding`.
- **Supabase server client**: Always created via `lib/supabase/server.ts` using `await cookies()`. Never import the browser client in Server Components.
- **Data fetching**: Server Components call `lib/data/*.ts` helpers directly. Mutations go through Route Handlers in `app/api/`.
- **Feature gating**: `lib/plans.ts` exports `canUseFeature(plan: 'lite' | 'pro', feature: string)`. Call before returning Pro-gated data.
- **Issue positions**: Use fractional indexing — `newPos = (prevPos + nextPos) / 2` — on the `position: float` column. Never re-index the full column on reorder.
- **`params` / `searchParams`**: Always `await` in page and layout components per Next.js 16 async APIs.

## Next.js 16 Breaking Changes

These differ from what you likely know from training data:

- **Async Request APIs** — `cookies()`, `headers()`, `draftMode()`, `params`, and `searchParams` are now **async only**. Always `await` them. Run `npx next typegen` to generate `PageProps`/`LayoutProps`/`RouteContext` helpers.
- **`next lint` removed** — use `eslint` directly. `next build` no longer runs the linter automatically.
- **`middleware` → `proxy`** — rename `middleware.ts` to `proxy.ts` and the exported function to `proxy`. The `edge` runtime is not supported in `proxy`.
- **`revalidateTag` requires a second argument** — `revalidateTag('key', 'max')`. For immediate updates use `updateTag` (Server Actions only).
- **`cacheLife`/`cacheTag` stabilized** — import directly from `next/cache`, no `unstable_` prefix.
- **PPR** — replaced by `cacheComponents: true` in `next.config.ts`. The old `experimental.ppr` flag is removed.
- **Parallel routes require `default.js`** — every `@slot` must have an explicit `default.js` or builds fail.
- **ESLint flat config** — use `eslint.config.mjs` (already set up). Legacy `.eslintrc` format is not recommended.
- **`serverRuntimeConfig`/`publicRuntimeConfig` removed** — use `process.env` directly; prefix client-accessible vars with `NEXT_PUBLIC_`.
- **Turbopack is the default** — `next dev` and `next build` use Turbopack. Pass `--webpack` to opt out. Custom webpack config will break `next build`.
- **`next/legacy/image` deprecated** — use `next/image`.
- **`images.domains` deprecated** — use `images.remotePatterns`.
- **Concurrent dev/build** — `next dev` outputs to `.next/dev`; `next build` outputs to `.next`.
- **AMP removed** — `next/amp` and `useAmp` no longer exist.
