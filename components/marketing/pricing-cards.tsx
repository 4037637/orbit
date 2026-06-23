import Link from 'next/link'
import { Check } from 'lucide-react'
import { PLANS, type Plan } from '@/lib/plans'

const FEATURES: Record<Plan, string[]> = {
  free: [
    '1 workspace',
    'Unlimited boards',
    'Solo — no team members',
    'Email support',
  ],
  lite: [
    '10 workspaces',
    'Unlimited boards',
    '2 team members per workspace',
    'Email invitations',
    'Email support',
  ],
  pro: [
    'Unlimited workspaces',
    'Unlimited boards',
    'Unlimited team members',
    'Email invitations',
    'AI assistant',
    'Priority support',
  ],
}

const CTA: Record<Plan, string> = {
  free: 'Get started free',
  lite: 'Start free trial',
  pro: 'Go Pro',
}

export default function PricingCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {(['free', 'lite', 'pro'] as Plan[]).map((plan) => {
        const isHighlighted = plan === 'lite'
        return (
          <div
            key={plan}
            className={`relative flex flex-col rounded-2xl p-8 gap-8 transition-transform ${
              isHighlighted ? 'scale-[1.02] md:scale-105' : ''
            }`}
            style={{
              background: isHighlighted
                ? 'oklch(0.18 0.04 264)'
                : 'oklch(0.15 0 0)',
              border: isHighlighted
                ? '1px solid oklch(0.6 0.22 264 / 0.5)'
                : '1px solid oklch(1 0 0 / 0.08)',
              boxShadow: isHighlighted
                ? '0 0 40px oklch(0.6 0.22 264 / 0.15)'
                : 'none',
            }}
          >
            {isHighlighted && (
              <span
                className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full text-white"
                style={{ background: 'oklch(0.6 0.22 264)' }}
              >
                Most popular
              </span>
            )}

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">
                {PLANS[plan].name}
              </p>
              <div className="flex items-end gap-1">
                {PLANS[plan].price === 0 ? (
                  <span className="text-4xl font-bold text-white">Free</span>
                ) : (
                  <>
                    <span className="text-4xl font-bold text-white">
                      ${PLANS[plan].price}
                    </span>
                    <span className="text-white/40 mb-1">/mo</span>
                  </>
                )}
              </div>
            </div>

            <ul className="space-y-3 flex-1">
              {FEATURES[plan].map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-white/70">
                  <Check
                    className="size-4 mt-0.5 shrink-0"
                    style={{ color: 'oklch(0.6 0.22 264)' }}
                  />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className="text-center text-sm font-semibold py-3 rounded-xl transition-all hover:opacity-90 active:scale-95"
              style={
                isHighlighted
                  ? { background: 'oklch(0.6 0.22 264)', color: 'white' }
                  : {
                      background: 'transparent',
                      color: 'oklch(0.985 0 0)',
                      border: '1px solid oklch(1 0 0 / 0.12)',
                    }
              }
            >
              {CTA[plan]}
            </Link>
          </div>
        )
      })}
    </div>
  )
}
