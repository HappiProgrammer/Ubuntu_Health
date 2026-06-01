import Link from 'next/link'
import { HeartHandshake, MapPinned, MessageSquareHeart, ShieldCheck, Sparkles } from 'lucide-react'
import type { HomeCopy } from '@/lib/home-content'

const featureIcons = [ShieldCheck, MapPinned, MessageSquareHeart, HeartHandshake]

export function HomeMetrics({ metrics }: { metrics: HomeCopy['metrics'] }) {
  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="glass-panel px-6 py-5">
            <p className="font-display text-4xl text-slate-950 dark:text-white">{metric.value}</p>
            <p className="mt-2 text-sm uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">{metric.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function HomeFeatures({ content }: { content: HomeCopy['features'] }) {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-3xl">
          <p className="section-kicker">Experience</p>
          <h2 className="section-title">{content.title}</h2>
          <p className="section-copy">{content.subtitle}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {content.items.map((item, index) => {
            const Icon = featureIcons[index]
            return (
              <article key={item.title} className="feature-card">
                <div className="feature-icon">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-950 dark:text-white">{item.title}</h3>
                <p className="text-base leading-7 text-slate-600 dark:text-slate-300">{item.description}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function HomeHowItWorks({ content }: { content: HomeCopy['howItWorks'] }) {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="section-kicker">Journey</p>
          <h2 className="section-title">{content.title}</h2>
          <p className="section-copy">
            A smoother care experience starts with clear next steps and fewer places to get lost.
          </p>
        </div>
        <div className="grid gap-4">
          {content.steps.map((step, index) => (
            <div key={step.title} className="glass-panel flex gap-4 px-5 py-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white dark:bg-white dark:text-slate-950">
                {index + 1}
              </div>
              <div>
                <h3 className="mb-2 text-lg font-bold text-slate-950 dark:text-white">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function HomeTestimonials({ content }: { content: HomeCopy['testimonials'] }) {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <h2 className="section-title !mb-0">{content.title}</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {content.items.map((item) => (
            <blockquote key={item.name} className="feature-card">
              <p className="mb-6 text-lg leading-8 text-slate-700 dark:text-slate-200">"{item.quote}"</p>
              <footer>
                <p className="font-bold text-slate-950 dark:text-white">{item.name}</p>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">{item.role}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}

export function HomeCta({ content }: { content: HomeCopy['cta'] }) {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-[linear-gradient(135deg,rgba(14,165,233,0.18),rgba(244,114,182,0.16),rgba(255,255,255,0.88))] px-6 py-10 shadow-soft-lg backdrop-blur sm:px-10 dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(14,165,233,0.24),rgba(244,114,182,0.18),rgba(15,23,42,0.82))]">
          <div className="absolute -right-12 top-0 h-40 w-40 rounded-full bg-white/50 blur-3xl dark:bg-primary-400/20" />
          <div className="relative z-10 max-w-3xl">
            <p className="section-kicker">Ready</p>
            <h2 className="section-title">{content.title}</h2>
            <p className="section-copy">{content.description}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/auth/register" className="btn-primary inline-flex items-center justify-center">
                {content.primary}
              </Link>
              <Link href="/auth/login" className="btn-secondary inline-flex items-center justify-center">
                {content.secondary}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
