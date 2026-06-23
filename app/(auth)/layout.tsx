import MarketingNav from '@/components/marketing/nav'
import MarketingFooter from '@/components/marketing/footer'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="dark min-h-screen antialiased flex flex-col"
      style={{ background: 'oklch(0.1 0 0)', color: 'oklch(0.985 0 0)' }}
    >
      <MarketingNav />
      <main className="flex-1 flex items-center justify-center px-4 pt-16">
        {children}
      </main>
      <MarketingFooter />
    </div>
  )
}
