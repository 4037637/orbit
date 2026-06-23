import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import MarketingNav from '@/components/marketing/nav'
import MarketingFooter from '@/components/marketing/footer'
import Features from '@/components/marketing/features'
import PricingCards from '@/components/marketing/pricing-cards'

// ─── Dashboard mockup ────────────────────────────────────────────────────────

type MockCard = { title: string; label: string; color: string }
type MockColumn = { title: string; cards: MockCard[] }

const COLUMNS: MockColumn[] = [
  {
    title: 'Todo',
    cards: [
      { title: 'Design system setup', label: 'Design', color: '#7c5cfc' },
      { title: 'User research interviews', label: 'Research', color: '#22c55e' },
      { title: 'Write API specs', label: 'Backend', color: '#f59e0b' },
    ],
  },
  {
    title: 'In Progress',
    cards: [
      { title: 'Stripe integration', label: 'Backend', color: '#f59e0b' },
      { title: 'Auth middleware', label: 'Backend', color: '#f59e0b' },
    ],
  },
  {
    title: 'Done',
    cards: [
      { title: 'Project scaffolding', label: 'DevOps', color: '#22c55e' },
      { title: 'Database schema', label: 'Backend', color: '#f59e0b' },
    ],
  },
]

function DashboardMockup() {
  return (
    <div className="relative mx-auto max-w-5xl px-4">
      {/* Glow */}
      <div
        className="absolute -inset-10 opacity-30 blur-3xl pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 65%, oklch(0.6 0.22 264) 0%, transparent 68%)',
        }}
      />

      {/* Browser chrome */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-2xl"
        style={{ border: '1px solid rgba(255,255,255,0.09)' }}
      >
        {/* Top bar */}
        <div
          className="flex items-center gap-2 px-5 py-3.5 border-b"
          style={{
            background: 'oklch(0.13 0 0)',
            borderColor: 'rgba(255,255,255,0.06)',
          }}
        >
          <span className="size-3 rounded-full" style={{ background: 'rgba(239,68,68,0.6)' }} />
          <span className="size-3 rounded-full" style={{ background: 'rgba(234,179,8,0.6)' }} />
          <span className="size-3 rounded-full" style={{ background: 'rgba(34,197,94,0.6)' }} />
          <div
            className="flex-1 mx-4 rounded-md px-4 py-1.5 text-xs"
            style={{ background: 'oklch(0.1 0 0)', color: 'rgba(255,255,255,0.22)' }}
          >
            orbit.app / my-workspace / sprint-1
          </div>
        </div>

        {/* App body */}
        <div className="flex h-[400px] sm:h-[460px]" style={{ background: 'oklch(0.145 0 0)' }}>
          {/* Sidebar */}
          <div
            className="w-14 border-r flex flex-col items-center py-5 gap-3 shrink-0"
            style={{
              background: 'oklch(0.16 0 0)',
              borderColor: 'rgba(255,255,255,0.06)',
            }}
          >
            <div
              className="size-8 rounded-lg flex items-center justify-center mb-2 text-white text-sm font-bold"
              style={{ background: 'oklch(0.6 0.22 264)' }}
            >
              O
            </div>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="size-7 rounded-lg"
                style={{
                  background:
                    i === 0 ? 'oklch(0.6 0.22 264 / 0.18)' : 'oklch(0.22 0 0)',
                }}
              />
            ))}
          </div>

          {/* Main */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {/* Board header */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b shrink-0"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <div className="flex flex-col gap-1.5">
                <div
                  className="h-4 w-28 rounded-md"
                  style={{ background: 'oklch(0.28 0 0)' }}
                />
                <div
                  className="h-3 w-16 rounded-md"
                  style={{ background: 'oklch(0.22 0 0)' }}
                />
              </div>
              <div
                className="h-8 px-4 rounded-lg text-xs font-medium flex items-center"
                style={{ background: 'oklch(0.6 0.22 264)', color: 'white' }}
              >
                + New issue
              </div>
            </div>

            {/* Kanban */}
            <div className="flex gap-4 p-5 overflow-x-auto flex-1">
              {COLUMNS.map((col) => (
                <div key={col.title} className="flex-1 min-w-[150px] flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs font-medium"
                      style={{ color: 'rgba(255,255,255,0.45)' }}
                    >
                      {col.title}
                    </span>
                    <span
                      className="text-[10px] size-4 rounded-full flex items-center justify-center font-medium"
                      style={{
                        background: 'oklch(0.24 0 0)',
                        color: 'rgba(255,255,255,0.35)',
                      }}
                    >
                      {col.cards.length}
                    </span>
                  </div>

                  {col.cards.map((card) => (
                    <div
                      key={card.title}
                      className="rounded-xl p-3 flex flex-col gap-2.5"
                      style={{
                        background: 'oklch(0.21 0 0)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <p
                        className="text-xs font-medium leading-snug"
                        style={{ color: 'rgba(255,255,255,0.82)' }}
                      >
                        {card.title}
                      </p>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-md self-start font-medium"
                        style={{
                          background: `${card.color}26`,
                          color: card.color,
                        }}
                      >
                        {card.label}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div
      className="dark min-h-screen antialiased"
      style={{ background: 'oklch(0.1 0 0)', color: 'oklch(0.985 0 0)' }}
    >
      <MarketingNav />

      {/* ── Hero ── */}
      <section className="relative pt-36 pb-12 px-6 overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] opacity-20 blur-[100px] pointer-events-none"
          style={{ background: 'oklch(0.6 0.22 264)' }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Eyebrow badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm mb-8"
            style={{
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            <span
              className="size-1.5 rounded-full"
              style={{ background: 'oklch(0.6 0.22 264)' }}
            />
            Project management, reimagined
          </div>

          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.04] mb-6 text-white"
          >
            The workspace your<br className="hidden sm:block" /> team will actually use
          </h1>

          <p
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.52)' }}
          >
            Orbit brings your boards, tasks, and team together in one fast, focused workspace.
            Stop context-switching. Start shipping.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 font-semibold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'oklch(0.6 0.22 264)' }}
            >
              Start for free
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 font-medium transition-all hover:border-white/30 hover:text-white"
              style={{
                border: '1px solid rgba(255,255,255,0.13)',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              See pricing
            </Link>
          </div>
        </div>

        {/* Mockup */}
        <div className="relative mt-20">
          <DashboardMockup />
        </div>
      </section>

      {/* ── Features ── */}
      <Features />

      {/* ── Pricing ── */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)' }}>
              Start free. Upgrade when your team is ready.
            </p>
          </div>

          <PricingCards />

          <p className="text-center mt-10">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-sm transition-colors hover:text-white"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              See full feature comparison
              <ArrowRight className="size-3.5" />
            </Link>
          </p>
        </div>
      </section>

      {/* ── CTA band ── */}
      <section className="py-24 px-6">
        <div
          className="max-w-3xl mx-auto rounded-3xl p-16 text-center"
          style={{
            background: 'oklch(0.15 0 0)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to get organized?
          </h2>
          <p className="mb-10" style={{ color: 'rgba(255,255,255,0.45)' }}>
            No credit card required. Free plan always available.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl px-8 py-4 font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'oklch(0.6 0.22 264)' }}
          >
            Start building today
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
