# Orbit — Milestone Tracker

## M1 — Foundation & Design System
- [x] shadcn/ui initialized (`npx shadcn@latest init`)
- [x] Core shadcn components added (button, input, label, card, dialog, dropdown-menu, avatar, badge, separator, skeleton, sonner, sheet)
- [x] `next-themes` ThemeProvider wired in `app/layout.tsx` (dark default)
- [x] `components/theme-toggle.tsx` — sun/moon toggle
- [x] `proxy.ts` scaffold (pass-through placeholder)
- [x] Tailwind 4 CSS variables extended for Orbit palette

## M2 — Supabase Auth & Database
- [x] `supabase init` + Supabase CLI installed (`supabase` npm dev dep)
- [x] `supabase/migrations/20260621120959_initial_schema.sql` — all tables + RLS policies
  - [x] `profiles`
  - [x] `workspaces`
  - [x] `workspace_members`
  - [x] `boards`
  - [x] `columns`
  - [x] `issues`
- [x] `lib/supabase/server.ts` — async-cookies server client
- [x] `lib/supabase/client.ts` — browser client singleton
- [x] `lib/supabase/middleware.ts` — session refresh helper
- [x] `lib/supabase/types.ts` — typed Database interface
- [x] `app/(auth)/login/page.tsx` — email/password form
- [x] `app/(auth)/signup/page.tsx` — email/password form
- [x] `app/auth/callback/route.ts` — PKCE exchange
- [x] `proxy.ts` — session refresh + `/dashboard/*` guard
- [ ] `supabase start` — requires Docker Desktop running locally

## M3 — Onboarding & Welcome Email
- [x] `app/onboarding/page.tsx` — multi-step wizard shell
- [x] `components/onboarding/workspace-form.tsx`
- [x] `components/onboarding/team-invite-form.tsx`
- [x] `components/onboarding/onboarding-done.tsx`
- [x] `app/api/onboarding/route.ts` — create workspace, set onboarding_complete, send email
- [x] `lib/email/resend.ts` — `sendWelcomeEmail()`
- [x] `proxy.ts` — redirect to `/onboarding` if `onboarding_complete = false`

## M4 — Workspaces & Boards
- [x] `app/(app)/layout.tsx` — authenticated sidebar shell
- [x] `app/(app)/[workspaceSlug]/page.tsx` — workspace home
- [x] `app/(app)/[workspaceSlug]/boards/page.tsx` — board grid
- [x] `app/(app)/[workspaceSlug]/boards/[boardId]/page.tsx` — single board shell
- [x] `components/app/sidebar.tsx` — nav + workspace switcher
- [x] `components/app/board-card.tsx`
- [x] `components/app/create-board-dialog.tsx`
- [x] `app/api/workspaces/[workspaceSlug]/boards/route.ts` — GET + POST
- [x] `lib/data/boards.ts` — query helpers

## M5 — Kanban Board with Drag-and-Drop
- [x] `components/kanban/board.tsx` — DndContext host
- [x] `components/kanban/column.tsx` — droppable column
- [x] `components/kanban/issue-card.tsx` — draggable card
- [x] `components/kanban/issue-detail-sheet.tsx` — edit sheet
- [x] `components/kanban/create-issue-dialog.tsx`
- [x] `app/api/issues/route.ts` — POST
- [x] `app/api/issues/[issueId]/route.ts` — PATCH + DELETE
- [x] `lib/data/issues.ts` — query helpers
- [x] Fractional indexing reorder (midpoint strategy)

## M6 — Team & User Management
- [ ] `app/(app)/[workspaceSlug]/settings/layout.tsx` — settings sidebar
- [ ] `app/(app)/[workspaceSlug]/settings/members/page.tsx` — member list
- [ ] `components/settings/invite-member-dialog.tsx`
- [ ] `app/api/workspaces/[workspaceSlug]/members/route.ts` — GET + POST
- [ ] `app/api/workspaces/[workspaceSlug]/members/[memberId]/route.ts` — PATCH + DELETE
- [ ] `lib/data/members.ts` — query helpers with owner-only RLS

## M7 — Stripe Billing (Lite / Pro)
- [ ] `lib/stripe.ts` — SDK singleton
- [ ] `lib/plans.ts` — `canUseFeature(plan, feature)`
- [ ] `app/(app)/[workspaceSlug]/settings/billing/page.tsx`
- [ ] `app/api/stripe/checkout/route.ts`
- [ ] `app/api/stripe/portal/route.ts`
- [ ] `app/api/stripe/webhook/route.ts` — subscription lifecycle events
- [ ] Stripe products + prices configured in dashboard (Lite/Pro)

## M8 — AI Features & Polish
- [ ] `app/api/ai/generate-description/route.ts` — streaming with AI SDK
- [ ] `components/kanban/ai-description-button.tsx`
- [ ] `components/app/error-boundary.tsx`
- [ ] Loading skeletons for BoardCard, IssueCard, Column
- [ ] Empty states for zero-boards / zero-issues views
