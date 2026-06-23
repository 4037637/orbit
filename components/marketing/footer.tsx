import Link from 'next/link'
import { Circle } from 'lucide-react'

export default function MarketingFooter() {
  return (
    <footer className="border-t border-white/8 px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-10 mb-12">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white mb-3">
              <Circle className="size-5 fill-[oklch(0.6_0.22_264)] text-[oklch(0.6_0.22_264)]" />
              Orbit
            </Link>
            <p className="text-sm text-white/40">Built for teams who ship.</p>
          </div>

          <div className="flex gap-16 text-sm">
            <div>
              <p className="text-white/30 font-medium mb-4 uppercase tracking-wider text-xs">
                Product
              </p>
              <div className="flex flex-col gap-3 text-white/60">
                <a href="#features" className="hover:text-white transition-colors">
                  Features
                </a>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Pricing
                </Link>
              </div>
            </div>
            <div>
              <p className="text-white/30 font-medium mb-4 uppercase tracking-wider text-xs">
                Account
              </p>
              <div className="flex flex-col gap-3 text-white/60">
                <Link href="/login" className="hover:text-white transition-colors">
                  Sign in
                </Link>
                <Link href="/signup" className="hover:text-white transition-colors">
                  Get started
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <p>© {new Date().getFullYear()} Orbit. All rights reserved.</p>
          <p>Built with Next.js, Supabase &amp; Claude</p>
        </div>
      </div>
    </footer>
  )
}
