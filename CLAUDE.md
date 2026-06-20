# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server (Turbopack, outputs to .next/dev)
npm run build    # Production build (Turbopack)
npm run start    # Start production server
npm run lint     # Run ESLint directly (not `next lint` — that command was removed in v16)
```

## Architecture

**Stack**: Next.js 16, React 19.2, TypeScript, Tailwind CSS 4 (PostCSS plugin), App Router.

**Entry points**: `app/layout.tsx` (root layout with Geist fonts), `app/page.tsx` (home route). Path alias `@/*` maps to the repo root.

**Routing**: File-system based via the `app/` directory. A folder becomes a public route only when it contains `page.tsx` or `route.ts`. Special files: `layout`, `page`, `loading`, `error`, `not-found`, `route`, `template`, `default`.

**Server vs Client Components**: All layouts and pages are Server Components by default. Add `'use client'` only for components that need state, event handlers, or browser APIs. The `'use client'` directive marks a boundary — everything imported into that file is pulled into the client bundle.

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
