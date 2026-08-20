'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Globe2,
  HeartHandshake,
  HelpCircle,
  MapPinned,
  MessageSquareHeart,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  ArrowRight
} from 'lucide-react'
import type { HomeCopy } from '@/lib/home-content'

const featureIcons = [ShieldCheck, MapPinned, MessageSquareHeart, HeartHandshake]

/**
 * Animated Counter Component for Statistics
 */
function AnimatedCounter({ value }: { value: string }) {
  const [displayValue, setDisplayValue] = useState('0')
  const counterRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    // Extract target number and suffix/prefix
    // e.g. "500+" -> target: 500, suffix: "+"
    // e.g. "2,400+" -> target: 2400, suffix: "+"
    // e.g. "4.95 / 5" -> target: 4.95, suffix: " / 5"
    let target = 0
    let isFloat = false
    let prefix = ''
    let suffix = ''

    if (value.includes('/')) {
      const parts = value.split('/')
      target = parseFloat(parts[0].trim())
      isFloat = true
      suffix = ' / ' + parts[1].trim()
    } else {
      const numStr = value.replace(/[^0-9.]/g, '')
      target = parseFloat(numStr) || 0
      if (value.endsWith('+')) suffix = '+'
    }

    const duration = 2000
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3)
      const currentNum = target * easedProgress

      if (isFloat) {
        setDisplayValue(prefix + currentNum.toFixed(2) + suffix)
      } else {
        const formatted = Math.floor(currentNum).toLocaleString('en-US')
        setDisplayValue(prefix + formatted + suffix)
      }

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setDisplayValue(value)
      }
    }

    requestAnimationFrame(animate)
  }, [value])

  return (
    <p ref={counterRef} className="font-display text-4xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
      {displayValue}
    </p>
  )
}

export function HomeMetrics({ metrics }: { metrics: HomeCopy['metrics'] }) {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Morphing Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 bg-gradient-to-tr from-cyan-500/15 via-emerald-500/10 to-amber-500/15 blur-3xl animate-morph -z-10" />

      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
        {metrics.map((metric, idx) => (
          <div
            key={metric.label}
            className="group relative overflow-hidden rounded-[2.2rem] border border-white/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-8 shadow-soft-lg backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-glow-cyan hover:border-cyan-400/60"
          >
            {/* Morphing Accent Shape inside card */}
            <div className={`absolute -right-8 -top-8 h-28 w-28 animate-morph opacity-40 transition-opacity duration-500 group-hover:opacity-80 ${
              idx === 0 
                ? 'bg-gradient-to-br from-cyan-400 to-sky-500' 
                : idx === 1 
                ? 'bg-gradient-to-br from-emerald-400 to-teal-500' 
                : 'bg-gradient-to-br from-amber-400 to-orange-500'
            } blur-xl`}/>

            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <AnimatedCounter value={metric.value} />
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition duration-300">
                  <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
                </div>
              </div>
              <p className="text-base font-extrabold text-slate-900 dark:text-white">{metric.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{metric.subtext}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function HomeServicesSection({ content }: { content: HomeCopy['servicesSection'] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <section id="services" className="px-4 py-16 sm:px-6 lg:px-8 scroll-mt-20 relative">
      <div className="mx-auto max-w-6xl">
        
        {/* Section Header with Horizontal Scroll Arrows */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="section-kicker">Tailored Care</p>
            <h2 className="section-title">{content.title}</h2>
            <p className="section-copy">{content.subtitle}</p>
          </div>

          {/* Horizontal Scroll Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => scroll('left')}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-300/80 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-100 shadow-soft backdrop-blur transition-all duration-200 hover:bg-white hover:border-cyan-400 hover:text-cyan-600 active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-300/80 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-100 shadow-soft backdrop-blur transition-all duration-200 hover:bg-white hover:border-cyan-400 hover:text-cyan-600 active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Horizontal Snap Scroll Cards Container */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-6 pt-2"
        >
          {content.services.map((service) => (
            <div
              key={service.id}
              className="snap-start shrink-0 w-[300px] sm:w-[360px] feature-card flex flex-col justify-between group hover:border-cyan-400 transition-all duration-300 relative overflow-hidden"
            >
              {/* Morphing Glow Backdrop on Hover */}
              <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl group-hover:bg-cyan-500/25 animate-morph transition-all duration-500" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl p-3 rounded-2xl bg-cyan-50 dark:bg-slate-800/80 border border-cyan-100 dark:border-slate-700 shadow-soft-sm">
                    {service.icon}
                  </span>
                  <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-800 dark:text-cyan-300 border border-cyan-500/20">
                    {service.badge}
                  </span>
                </div>

                <h3 className="mb-2 text-2xl font-black text-slate-950 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition">
                  {service.title}
                </h3>
                <p className="mb-5 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {service.description}
                </p>

                <ul className="space-y-2 mb-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={`/checkout?service=${service.id}`}
                className="btn-secondary w-full text-center text-xs font-bold py-3 flex items-center justify-center gap-2 group-hover:bg-gradient-to-r group-hover:from-cyan-500 group-hover:to-emerald-500 group-hover:text-slate-950 group-hover:border-transparent shadow-soft transition-all duration-300"
              >
                <span>Book {service.title}</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export function HomeHowItWorks({ content }: { content: HomeCopy['howItWorks'] }) {
  return (
    <section id="how-it-works" className="px-4 py-16 sm:px-6 lg:px-8 scroll-mt-20 bg-slate-50/50 dark:bg-slate-900/30 relative overflow-hidden">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <p className="section-kicker">Peace of Mind</p>
          <h2 className="section-title">{content.title}</h2>
          <p className="section-copy mx-auto">{content.subtitle}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {content.steps.map((step, index) => (
            <div key={step.title} className="glass-panel relative flex flex-col justify-between p-7 group hover:-translate-y-1 hover:shadow-glow-cyan transition-all duration-300">
              <div>
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-2xl font-black text-white shadow-soft group-hover:scale-105 transition">
                  0{index + 1}
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-950 dark:text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 mb-4">{step.description}</p>
              </div>
              <div className="rounded-xl bg-cyan-500/10 p-3 text-xs font-semibold text-cyan-900 dark:text-cyan-300 border border-cyan-500/20">
                💡 {step.tip}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function HomeDiasporaSection({ content }: { content: HomeCopy['diasporaSection'] }) {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-cyan-500/30 bg-gradient-to-br from-slate-950 via-primary-950 to-slate-900 p-8 sm:p-12 text-white shadow-soft-lg">
          {/* Morphing glowing background */}
          <div className="absolute -right-10 -top-10 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl animate-morph" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/30 px-3.5 py-1 text-xs font-bold tracking-wider text-cyan-200 border border-cyan-400/30 shadow-xs">
                <Globe2 className="h-3.5 w-3.5" />
                {content.badge}
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight text-white">
                {content.title}
              </h2>
              <p className="text-base leading-relaxed text-slate-300 max-w-2xl">{content.description}</p>

              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                {content.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs sm:text-sm font-medium text-slate-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3">
                <Link
                  href="/checkout?service=senior&source=diaspora"
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 px-7 py-4 text-sm font-black text-slate-950 shadow-glow-cyan hover:scale-105 transition"
                >
                  {content.cta}
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-300 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Care Log Example
              </p>
              <div className="space-y-3 text-xs">
                <div className="rounded-xl bg-white/10 p-3 flex items-center justify-between">
                  <span className="font-semibold text-slate-200">👵 Maman Clarisse (Douala)</span>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-emerald-300 font-bold">Checked In</span>
                </div>
                <div className="rounded-xl bg-white/10 p-3 space-y-1.5">
                  <div className="flex justify-between text-slate-300">
                    <span>Blood Pressure:</span>
                    <span className="font-bold text-white">125/80 mmHg (Normal)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Morning Medication:</span>
                    <span className="font-bold text-emerald-400">Administered</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Physical Walk:</span>
                    <span className="font-bold text-cyan-300">20 mins in garden</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  "Nurse Mireille shared morning photo and pharmacy receipt with family in WhatsApp group."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function HomeFeatures({ content }: { content: HomeCopy['features'] }) {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <p className="section-kicker">Experience</p>
          <h2 className="section-title">{content.title}</h2>
          <p className="section-copy mx-auto">{content.subtitle}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {content.items.map((item, index) => {
            const Icon = featureIcons[index % featureIcons.length]
            return (
              <article key={item.title} className="feature-card flex flex-col justify-between group hover:border-cyan-400 transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="feature-icon !mb-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      {item.highlight}
                    </span>
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-slate-950 dark:text-white group-hover:text-cyan-600 transition">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.description}</p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function HomeTrustSafety({ content }: { content: HomeCopy['trustSafety'] }) {
  return (
    <section id="safety" className="px-4 py-16 sm:px-6 lg:px-8 scroll-mt-20 bg-slate-50/50 dark:bg-slate-900/30">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <p className="section-kicker">Protection & Ethics</p>
          <h2 className="section-title">{content.title}</h2>
          <p className="section-copy mx-auto">{content.subtitle}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.points.map((point, i) => (
            <div key={i} className="glass-panel p-6 flex flex-col justify-between group hover:-translate-y-1 hover:border-cyan-400 transition-all duration-300">
              <div>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-950 dark:text-white">{point.title}</h3>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{point.description}</p>
              </div>
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
        <div className="mb-12 text-center">
          <p className="section-kicker">Answers</p>
          <h2 className="section-title">{content.title}</h2>
          <p className="section-copy mx-auto">{content.subtitle}</p>
        </div>

        <div className="space-y-3">
          {content.items.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={index}
                className="glass-panel overflow-hidden border border-slate-200/80 dark:border-slate-800 transition duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between p-5 text-left text-base font-bold text-slate-900 dark:text-white hover:text-cyan-600 transition"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-cyan-500 shrink-0" />
                    <span>{item.question}</span>
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-cyan-500' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/60">
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
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <section id="testimonials" className="px-4 py-16 sm:px-6 lg:px-8 relative">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="section-kicker">Community Stories</p>
            <h2 className="section-title">{content.title}</h2>
            <p className="section-copy">{content.subtitle}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => scroll('left')}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-300/80 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-100 shadow-soft backdrop-blur hover:bg-white hover:border-cyan-400 hover:text-cyan-600 active:scale-95 transition"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-300/80 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-100 shadow-soft backdrop-blur hover:bg-white hover:border-cyan-400 hover:text-cyan-600 active:scale-95 transition"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Snap Scroll Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-6 pt-2"
        >
          {content.items.map((item, i) => (
            <blockquote
              key={i}
              className="snap-start shrink-0 w-[300px] sm:w-[350px] feature-card flex flex-col justify-between p-6 hover:border-cyan-400 transition-all duration-300"
            >
              <div>
                <div className="flex gap-1 mb-4 text-amber-500">
                  {[...Array(item.rating || 5)].map((_, r) => (
                    <Star key={r} className="h-4 w-4 fill-amber-500" />
                  ))}
                </div>
                <p className="mb-6 text-sm leading-relaxed italic text-slate-700 dark:text-slate-200">
                  "{item.quote}"
                </p>
              </div>
              <footer className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <p className="font-bold text-slate-950 dark:text-white text-sm">{item.name}</p>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span>{item.role}</span>
                  <span className="font-semibold text-cyan-600 dark:text-cyan-400">{item.location}</span>
                </div>
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
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-gradient-to-br from-slate-950 via-primary-950 to-slate-900 px-8 py-14 text-white shadow-soft-lg text-center sm:px-14">
          <div className="absolute -right-10 -bottom-10 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl animate-morph" />
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="font-display text-3xl sm:text-5xl font-black text-white leading-tight">
              {content.title}
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-slate-300 max-w-2xl mx-auto">
              {content.description}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/checkout?service=senior"
                className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 px-8 py-4 text-base font-black text-slate-950 shadow-glow-cyan hover:scale-105 transition"
              >
                {content.primary}
              </Link>
              <a
                href="tel:+237671159461"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white/80 px-7 py-3.5 text-base font-bold text-white hover:bg-white/10 transition"
              >
                <PhoneCall className="h-4 w-4" />
                <span>{content.secondary}</span>
              </a>
            </div>
            <p className="text-xs text-slate-400 pt-2">{content.callSupport}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
