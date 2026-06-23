'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Circle, Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Features', href: '#features', external: true },
  { label: 'Pricing', href: '/pricing', external: false },
]

export default function MarketingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change / resize past md
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen
          ? 'bg-[oklch(0.1_0_0)]/95 backdrop-blur-md border-b border-white/8'
          : ''
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg text-white"
          onClick={() => setMenuOpen(false)}
        >
          <Circle className="size-5 fill-[oklch(0.6_0.22_264)] text-[oklch(0.6_0.22_264)]" />
          Orbit
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-white/60">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a key={link.label} href={link.href} className="hover:text-white transition-colors">
                {link.label}
              </a>
            ) : (
              <Link key={link.label} href={link.href} className="hover:text-white transition-colors">
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:block text-sm text-white/60 hover:text-white transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="hidden sm:block text-sm font-semibold px-4 py-2 rounded-lg text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'oklch(0.6 0.22 264)' }}
          >
            Get started free
          </Link>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden flex items-center justify-center size-9 rounded-lg text-white/70 hover:text-white hover:bg-white/8 transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="md:hidden border-t border-white/8 px-6 py-5 flex flex-col gap-1"
          style={{ background: 'oklch(0.1 0 0)' }}
        >
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-white/70 hover:text-white transition-colors py-2.5"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-white/70 hover:text-white transition-colors py-2.5"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            )
          )}
          <div
            className="mt-3 pt-4 flex flex-col gap-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            <Link
              href="/login"
              className="text-sm text-white/60 hover:text-white transition-colors py-1"
              onClick={() => setMenuOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold px-4 py-2.5 rounded-lg text-white text-center transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'oklch(0.6 0.22 264)' }}
              onClick={() => setMenuOpen(false)}
            >
              Get started free
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
