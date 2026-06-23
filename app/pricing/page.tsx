import Link from 'next/link'
import { Check, Minus, ArrowRight } from 'lucide-react'
import MarketingNav from '@/components/marketing/nav'
import MarketingFooter from '@/components/marketing/footer'
import PricingCards from '@/components/marketing/pricing-cards'

const COMPARISON = [
  { feature: 'Workspaces', free: '1', lite: '10', pro: 'Unlimited' },
  { feature: 'Team members', free: null, lite: '2 per workspace', pro: 'Unlimited' },
  { feature: 'Boards per workspace', free: 'Unlimited', lite: 'Unlimited', pro: 'Unlimited' },
  { feature: 'Email invitations', free: null, lite: true, pro: true },
  { feature: 'AI assistant', free: null, lite: null, pro: true },
  { feature: 'Priority support', free: null, lite: null, pro: true },
]

const FAQ = [
  {
    q: 'Can I switch plans anytime?',
    a: 'Yes — upgrades take effect immediately. Downgrades apply at the end of your billing cycle so you keep access until then.',
  },
  {
    q: 'What happens when I hit a plan limit?',
    a: "You'll see a prompt to upgrade. Your existing data is never deleted — you simply can't add more until you upgrade or free up space.",
  },
  {
    q: 'Is there a free trial for paid plans?',
    a: 'All paid plans start with a free trial when you sign up. No credit card required to start.',
  },
]

function Cell({ value }: { value: string | boolean | null }) {
  if (value === null) {
    return (
      <td className="px-6 py-4 text-center">
        <Minus className="size-4 mx-auto" style={{ color: 'rgba(255,255,255,0.2)' }} />
      </td>
    )
  }
  if (value === true) {
    return (
      <td className="px-6 py-4 text-center">
        <Check className="size-4 mx-auto" style={{ color: 'oklch(0.6 0.22 264)' }} />
      </td>
    )
  }
  return (
    <td className="px-6 py-4 text-center text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
      {value}
    </td>
  )
}

export default function PricingPage() {
  return (
    <div
      className="dark min-h-screen antialiased"
      style={{ background: 'oklch(0.1 0 0)', color: 'oklch(0.985 0 0)' }}
    >
      <MarketingNav />

      <main className="max-w-5xl mx-auto px-6 pt-36 pb-24">
        {/* Hero */}
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-5">
            Find the right plan
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.48)' }}>
            Start for free with one workspace. Upgrade as your team grows — no surprises.
          </p>
        </div>

        {/* Pricing cards */}
        <PricingCards />

        {/* Feature comparison table */}
        <div className="mt-24 mb-20">
          <h2 className="text-xl font-bold text-white mb-8">Compare all features</h2>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <th
                    className="text-left px-6 py-4 font-medium w-1/2"
                    style={{
                      background: 'oklch(0.15 0 0)',
                      color: 'rgba(255,255,255,0.4)',
                    }}
                  >
                    Feature
                  </th>
                  {['Free', 'Lite', 'Pro'].map((plan, i) => (
                    <th
                      key={plan}
                      className="text-center px-6 py-4 font-semibold"
                      style={{
                        background:
                          i === 1 ? 'oklch(0.18 0.04 264)' : 'oklch(0.15 0 0)',
                        color: i === 1 ? 'oklch(0.75 0.15 264)' : 'rgba(255,255,255,0.7)',
                      }}
                    >
                      {plan}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, ri) => (
                  <tr
                    key={row.feature}
                    style={{
                      borderTop: ri > 0 ? '1px solid rgba(255,255,255,0.05)' : undefined,
                      background:
                        ri % 2 === 0 ? 'oklch(0.13 0 0)' : 'oklch(0.145 0 0)',
                    }}
                  >
                    <td
                      className="px-6 py-4"
                      style={{ color: 'rgba(255,255,255,0.55)' }}
                    >
                      {row.feature}
                    </td>
                    <Cell value={row.free} />
                    <Cell value={row.lite} />
                    <Cell value={row.pro} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-24">
          <h2 className="text-xl font-bold text-white mb-8">Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <div
                key={item.q}
                className="rounded-2xl p-6"
                style={{
                  background: 'oklch(0.15 0 0)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <p className="font-semibold text-white mb-2">{item.q}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div
          className="rounded-3xl p-14 text-center"
          style={{
            background: 'oklch(0.15 0 0)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Start building today
          </h2>
          <p className="mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
            No credit card required. Free plan always available.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl px-8 py-4 font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'oklch(0.6 0.22 264)' }}
          >
            Get started free
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </main>

      <MarketingFooter />
    </div>
  )
}
