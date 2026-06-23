import { LayoutGrid, Users, Sparkles } from 'lucide-react'

const FEATURES = [
  {
    icon: LayoutGrid,
    title: 'Kanban boards',
    description:
      'Drag-and-drop boards with unlimited columns and flexible workflows. Organize any project, any way you like.',
  },
  {
    icon: Users,
    title: 'Team collaboration',
    description:
      'Invite members, assign tasks, and work together in real time. Everyone stays in sync, no standups required.',
  },
  {
    icon: Sparkles,
    title: 'AI assistant',
    description:
      "Ask questions across your entire workspace — \"what's urgent?\", \"what does Alice have?\" — Claude answers instantly.",
    badge: 'Pro',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything your team needs
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">
            A focused set of tools that cover the full project lifecycle — from idea to shipped.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group relative rounded-2xl p-8 transition-all duration-200"
              style={{
                background: 'oklch(0.15 0 0)',
                border: '1px solid oklch(1 0 0 / 0.07)',
              }}
            >
              <div
                className="size-11 rounded-xl flex items-center justify-center mb-6"
                style={{ background: 'oklch(0.6 0.22 264 / 0.15)' }}
              >
                <f.icon
                  className="size-5"
                  style={{ color: 'oklch(0.75 0.15 264)' }}
                />
              </div>

              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold text-white">{f.title}</h3>
                {f.badge && (
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: 'oklch(0.6 0.22 264 / 0.2)',
                      color: 'oklch(0.75 0.15 264)',
                    }}
                  >
                    {f.badge}
                  </span>
                )}
              </div>

              <p className="text-sm text-white/50 leading-relaxed">{f.description}</p>

              {/* Hover glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ border: '1px solid oklch(0.6 0.22 264 / 0.3)' }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
