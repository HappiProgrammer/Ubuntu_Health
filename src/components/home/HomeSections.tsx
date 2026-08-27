'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  ChevronDown,
  Globe2,
  HeartHandshake,
  MapPinned,
  MessageSquareHeart,
  PhoneCall,
  ShieldCheck,
  Star,
  ArrowRight,
  Stethoscope,
  Baby,
  Activity,
  Users
} from 'lucide-react'
import type { HomeCopy } from '@/lib/home-content'

const serviceIconMap: Record<string, any> = {
  elderly: Users,
  nursing: Stethoscope,
  maternal: Baby,
  rehab: Activity,
}

const serviceColorMap: Record<string, string> = {
  elderly: 'from-blue-600 to-cyan-500',
  nursing: 'from-emerald-600 to-teal-500',
  maternal: 'from-rose-500 to-pink-500',
  rehab: 'from-amber-500 to-orange-500',
}

const featureIcons = [ShieldCheck, MapPinned, MessageSquareHeart, HeartHandshake]

export function HomeMetrics({ metrics }: { metrics: HomeCopy['metrics'] }) {
  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="group rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-6 sm:p-8 shadow-soft-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary-500/60 hover:scale-[1.02] cursor-pointer"
          >
            <p className="font-display text-4xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {metric.value}
            </p>
            <p className="text-base font-bold text-slate-900 dark:text-white mb-1">{metric.label}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{metric.subtext}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function HomeServicesSection({ content }: { content: HomeCopy['servicesSection'] }) {
  return (
    <section id="services" className="px-4 py-16 sm:px-6 lg:px-8 scroll-mt-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center md:text-left">
          <p className="section-kicker">Tailored Care</p>
          <h2 className="section-title">{content.title}</h2>
          <p className="section-copy">{content.subtitle}</p>
        </div>

        {/* Responsive Grid with Active Floating Divs (No Emojis, Clean SVG Icons) */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.services.map((service) => {
            const Icon = serviceIconMap[service.id] || Stethoscope
            const gradient = serviceColorMap[service.id] || 'from-primary-600 to-cyan-500'

            return (
              <div
                key={service.id}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-soft transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl hover:border-primary-500 hover:scale-[1.02] cursor-pointer"
              >
                <div>
                  <div className="mb-5 flex items-center justify-between">
                    {/* Professional SVG Healthcare Icon Badge (No Emojis) */}
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-soft group-hover:scale-110 group-hover:rotate-3 transition duration-300`}>
                      <Icon className="h-6 w-6 stroke-[2.2]" />
                    </div>

                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      {service.badge}
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-slate-950 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
                    {service.description}
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {service.features.slice(0, 3).map((f) => (
                      <li key={f} className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                  <Link
                    href={`/checkout?service=${service.id}`}
                    className="btn-primary w-full py-2.5 text-center text-xs font-bold flex items-center justify-center gap-1.5 shadow-soft transition group-hover:shadow-md"
                  >
                    <span>Request Care</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function HomeHowItWorks({ content }: { content: HomeCopy['howItWorks'] }) {
  return (
    <section id="how-it-works" className="px-4 py-16 sm:px-6 lg:px-8 scroll-mt-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center md:text-left">
          <p className="section-kicker">Simple Steps</p>
          <h2 className="section-title">{content.title}</h2>
          <p className="section-copy">{content.subtitle}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {content.steps.map((step, idx) => (
            <div
              key={step.title}
              className="card relative transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary-500/60 hover:scale-[1.01] cursor-pointer"
            >
              <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-sm font-black text-white shadow-soft">
                {idx + 1}
              </span>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function HomeDiasporaSection({ content }: { content: HomeCopy['diasporaSection'] }) {
  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-600 via-sky-600 to-primary-600 p-8 sm:p-12 text-white shadow-soft transition-all duration-300 hover:shadow-xl">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold">
            <Globe2 className="h-3.5 w-3.5" />
            <span>{content.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold">{content.title}</h2>
          <p className="text-sm leading-relaxed text-cyan-100">{content.description}</p>
          <ul className="space-y-2 text-xs text-cyan-50 pt-2">
            {content.benefits.map((b) => (
              <li key={b} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-4 pt-3">
            <Link
              href="/checkout?diaspora=true"
              className="rounded-2xl bg-white px-6 py-3 text-sm font-bold text-slate-950 shadow-soft transition hover:bg-slate-100 active:scale-95"
            >
              {content.cta}
            </Link>
            <a
              href="https://wa.me/237690000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/40 bg-white/10 px-5 py-3 text-sm font-bold hover:bg-white/20 transition active:scale-95"
            >
              <PhoneCall className="h-4 w-4" />
              <span>WhatsApp Coordinator</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export function HomeFeatures({ content }: { content: HomeCopy['features'] }) {
  return (
    <section id="safety" className="px-4 py-16 sm:px-6 lg:px-8 scroll-mt-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center md:text-left">
          <p className="section-kicker">Trust & Standards</p>
          <h2 className="section-title">{content.title}</h2>
          <p className="section-copy">{content.subtitle}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.items.map((feature, idx) => {
            const Icon = featureIcons[idx % featureIcons.length]
            return (
              <div
                key={feature.title}
                className="card flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary-500/60 hover:scale-[1.01] cursor-pointer"
              >
                <div>
                  <div className="feature-icon">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function HomeTrustSafety({ content }: { content: HomeCopy['trustSafety'] }) {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-8 sm:p-10 shadow-soft-sm transition-all duration-300 hover:shadow-md">
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white mb-2">{content.title}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">{content.subtitle}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {content.points.map((pt) => (
            <div key={pt.title} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{pt.title}</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-6">{pt.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function HomeFAQ({ content }: { content: HomeCopy['faq'] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="px-4 py-16 sm:px-6 lg:px-8 scroll-mt-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <p className="section-kicker">Answers</p>
          <h2 className="section-title">{content.title}</h2>
          <p className="section-copy mx-auto">{content.subtitle}</p>
        </div>

        <div className="space-y-3">
          {content.items.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={item.question}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between p-5 text-left font-bold text-slate-900 dark:text-white hover:text-primary-600 transition text-sm sm:text-base"
                >
                  <span>{item.question}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary-600' : 'text-slate-400'}`} />
                </button>
                {isOpen && (
                  <div className="border-t border-slate-100 dark:border-slate-800 px-5 pb-5 pt-3 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {item.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function HomeTestimonials({ content }: { content: HomeCopy['testimonials'] }) {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center md:text-left">
          <p className="section-kicker">Community Stories</p>
          <h2 className="section-title">{content.title}</h2>
          <p className="section-copy">{content.subtitle}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {content.items.map((item) => (
            <div
              key={item.name}
              className="card flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary-500/60 hover:scale-[1.01] cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(item.rating || 5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs italic leading-relaxed text-slate-700 dark:text-slate-300">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>
              <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                <p className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</p>
                <p className="text-[11px] text-slate-500">{item.role} • {item.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function HomeCta({ content }: { content: HomeCopy['cta'] }) {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 sm:p-14 text-center text-white shadow-soft transition-all duration-300 hover:shadow-xl">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">{content.title}</h2>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 mb-8 leading-relaxed">
          {content.description}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/register" className="btn-primary w-full sm:w-auto px-8 py-3.5 text-sm font-bold shadow-soft">
            {content.primary}
          </Link>
          <Link href="/auth/register?role=nurse" className="btn-secondary w-full sm:w-auto px-8 py-3.5 text-sm font-bold shadow-soft">
            {content.secondary}
          </Link>
        </div>
      </div>
    </section>
  )
}
