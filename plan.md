# Orbit — Milestone Tracker

## M1 — Foundation & Design System

- [X] shadcn/ui initialized (`npx shadcn@latest init`)
- [X] Core shadcn components added (button, input, label, card, dialog, dropdown-menu, avatar, badge, separator, skeleton, sonner, sheet)
- [X] `next-themes` ThemeProvider wired in `app/layout.tsx` (dark default)
- [X] `components/theme-toggle.tsx` — sun/moon toggle
- [X] `proxy.ts` scaffold (pass-through placeholder)
- [X] Tailwind 4 CSS variables extended for Orbit palette

## M2 — Supabase Auth & Database

- [X] `supabase init` + Supabase CLI installed (`supabase` npm dev dep)
- [X] `supabase/migrations/20260621120959_initial_schema.sql` — all tables + RLS policies
  - [X] `profiles`
  - [X] `workspaces`
  - [X] `workspace_members`
  - [X] `boards`
  - [X] `columns`
  - [X] `issues`
- [X] `lib/supabase/server.ts` — async-cookies server client
- [X] `lib/supabase/client.ts` — browser client singleton
- [X] `lib/supabase/middleware.ts` — session refresh helper
- [X] `lib/supabase/types.ts` — typed Database interface
- [X] `app/(auth)/login/page.tsx` — email/password form
- [X] `app/(auth)/signup/page.tsx` — email/password form
- [X] `app/auth/callback/route.ts` — PKCE exchange
- [X] `proxy.ts` — session refresh + `/dashboard/*` guard
- [ ] `supabase start` — requires Docker Desktop running locally

## M3 — Onboarding & Welcome Email

- [X] `app/onboarding/page.tsx` — multi-step wizard shell
- [X] `components/onboarding/workspace-form.tsx`
- [X] `components/onboarding/team-invite-form.tsx`
- [X] `components/onboarding/onboarding-done.tsx`
- [X] `app/api/onboarding/route.ts` — create workspace, set onboarding_complete, send email
- [X] `lib/email/resend.ts` — `sendWelcomeEmail()`
- [X] `proxy.ts` — redirect to `/onboarding` if `onboarding_complete = false`

## M4 — Workspaces & Boards

- [X] `app/(app)/layout.tsx` — authenticated sidebar shell
- [X] `app/(app)/[workspaceSlug]/page.tsx` — workspace home
- [X] `app/(app)/[workspaceSlug]/boards/page.tsx` — board grid
- [X] `app/(app)/[workspaceSlug]/boards/[boardId]/page.tsx` — single board shell
- [X] `components/app/sidebar.tsx` — nav + workspace switcher
- [X] `components/app/board-card.tsx`
- [X] `components/app/create-board-dialog.tsx`
- [X] `app/api/workspaces/[workspaceSlug]/boards/route.ts` — GET + POST
- [X] `lib/data/boards.ts` — query helpers

## M5 — Kanban Board with Drag-and-Drop

- [X] `components/kanban/board.tsx` — DndContext host
- [X] `components/kanban/column.tsx` — droppable column
- [X] `components/kanban/issue-card.tsx` — draggable card
- [X] `components/kanban/issue-detail-sheet.tsx` — edit sheet
- [X] `components/kanban/create-issue-dialog.tsx`
- [X] `app/api/issues/route.ts` — POST
- [X] `app/api/issues/[issueId]/route.ts` — PATCH + DELETE
- [X] `lib/data/issues.ts` — query helpers
- [X] Fractional indexing reorder (midpoint strategy)

## M6 — Team & User Management

- [X] `app/(app)/[workspaceSlug]/settings/layout.tsx` — settings sidebar
- [X] `app/(app)/[workspaceSlug]/settings/members/page.tsx` — member list
- [X] `components/settings/invite-member-dialog.tsx`
- [X] `app/api/workspaces/[workspaceSlug]/members/route.ts` — GET + POST
- [X] `app/api/workspaces/[workspaceSlug]/members/[memberId]/route.ts` — PATCH + DELETE
- [X] `lib/data/members.ts` — query helpers with owner-only RLS

## M7 — Stripe Billing (Lite / Pro)

- [X] `lib/stripe.ts` — SDK singleton
- [X] `lib/plans.ts` — `canUseFeature(plan, feature)`
- [X] `app/(app)/[workspaceSlug]/settings/billing/page.tsx`
- [X] `app/api/stripe/checkout/route.ts`
- [X] `app/api/stripe/portal/route.ts`
- [X] `app/api/stripe/webhook/route.ts` — subscription lifecycle events
- [X] Stripe products + prices configured in dashboard (Lite/Pro)

## M8 — AI Features & Polish

- [X] `app/api/ai/generate-description/route.ts` — streaming with AI SDK
- [X] `components/kanban/ai-description-button.tsx`
- [X] `components/app/error-boundary.tsx`
- [X] Loading skeletons for BoardCard, IssueCard, Column
- [X] Empty states for zero-boards / zero-issues views
