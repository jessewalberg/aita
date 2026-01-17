import { createFileRoute, Link } from '@tanstack/react-router'
import { Gavel, Scale, Sparkles, ArrowRight } from 'lucide-react'
import { VerdictForm } from '@/features/verdict/components/VerdictForm'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const remainingSingle = 3
  const isPro = false

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute -top-32 -right-32 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute top-1/3 -left-20 h-80 w-80 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%)]" />
      </div>

      <main className="relative mx-auto max-w-6xl px-6 pb-20 pt-16">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/70 font-mono">
              <Sparkles className="h-3.5 w-3.5" />
              The Panel Will See You Now
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold leading-[0.95] tracking-tight font-serif">
                Your story.
                <br />
                Three judges.
                <br />
                One ruling.
              </h1>
              <p className="text-lg md:text-xl text-white/70 max-w-xl">
                3 AI judges. 1 ruling. Your verdict awaits. Get clarity fast or
                summon the full panel for a deeper debate.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <Gavel className="h-5 w-5 text-amber-300" />
                <span className="text-sm text-white/80">Instant verdicts</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <Scale className="h-5 w-5 text-emerald-300" />
                <span className="text-sm text-white/80">Balanced deliberation</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-white/60">
              <Link
                to="/stats"
                className="inline-flex items-center gap-2 font-medium text-white hover:text-emerald-200 transition"
              >
                Judge analytics
                <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="h-4 w-px bg-white/20" />
              <span>Transparent model performance</span>
            </div>
          </div>

          <div className="lg:pt-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-150">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
              <VerdictForm
                remainingSingle={remainingSingle}
                isPro={isPro}
              />
              {!isPro && (
                <p className="mt-4 text-xs text-white/60 text-center">
                  Upgrade to unlock Panel Mode and priority deliberation.
                </p>
              )}
            </div>
          </div>
        </div>

        <section className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            {
              title: 'Step 1: Tell the full story',
              detail:
                'Lay out the facts, the feelings, and the fallout. The panel reads everything.',
            },
            {
              title: 'Step 2: Judges weigh in',
              detail:
                'Empathy, logic, and practicality collide. Three perspectives, no fluff.',
            },
            {
              title: 'Step 3: Chief Judge rules',
              detail:
                'A final decision with confidence, context, and clear takeaways.',
            },
          ].map((step, index) => (
            <div
              key={step.title}
              className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 backdrop-blur animate-in fade-in-0 slide-in-from-bottom-6 duration-700"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <h3 className="text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm text-white/70">{step.detail}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}
