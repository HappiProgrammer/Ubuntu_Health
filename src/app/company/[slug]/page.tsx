'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import { 
  Heart, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  Smartphone, 
  PhoneCall, 
  Sparkles, 
  ArrowRight,
  HelpCircle,
  ChevronDown,
  Stethoscope,
  HeartHandshake,
  Globe2,
  MapPin,
  Activity,
  ShieldAlert,
  UserCheck,
  Lock,
  Star,
  Award,
  MessageSquareHeart
} from 'lucide-react'
import { featurePagesData } from '@/lib/feature-pages-content'
import { HomeFooter } from '@/components/home/HomeFooter'
import { homeContent } from '@/lib/home-content'

const iconMap: Record<string, any> = {
  HeartHandshake,
  Stethoscope,
  CheckCircle2,
  Globe2,
  ShieldCheck,
  Sparkles,
  Activity,
  MessageSquareHeart,
  ShieldAlert,
  MapPin,
  Smartphone,
  PhoneCall,
  UserCheck,
  Lock,
  Star,
  Award
}

export default function FeatureDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const data = featurePagesData[slug]

  if (!data || data.category !== 'company') {
    notFound()
  }

  const checkoutUrl = `/checkout?service=${data.checkoutServiceId || 'senior'}`

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>

          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-cyan-400 text-white shadow-soft">
              <Heart className="h-5 w-5 fill-white" />
            </div>
            <span className="font-display font-bold text-slate-950 dark:text-white text-base">
              BridgeCare
            </span>
          </Link>

          <Link
            href={checkoutUrl}
            className="btn-primary text-xs font-bold py-2.5 px-4 hidden sm:inline-flex items-center gap-1.5"
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Book Now</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-16 space-y-16 flex-1 w-full">
        
        {/* Hero Banner */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-50/80 dark:bg-cyan-950/40 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-cyan-800 dark:text-cyan-300 shadow-xs">
            <span className="text-base">{data.icon}</span>
            <span>{data.eyebrow}</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 dark:text-white tracking-tight leading-tight">
            {data.title}
          </h1>

          <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300 font-normal">
            {data.subtitle}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={checkoutUrl}
              className="w-full sm:w-auto btn-primary inline-flex items-center justify-center gap-2 py-4 px-8 text-sm font-black shadow-glow-cyan"
            >
              <Smartphone className="h-4 w-4" />
              <span>Book & Pay via MoMo / Orange</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="tel:+237671159461"
              className="w-full sm:w-auto btn-secondary inline-flex items-center justify-center gap-2 py-4 px-6 text-sm font-bold"
            >
              <PhoneCall className="h-4 w-4 text-red-500" />
              <span>Call (+237) 671 159 461</span>
            </a>
          </div>
        </div>

        {/* Hero Description Card */}
        <div className="glass-panel p-8 sm:p-10 border border-white/80 dark:border-white/10 shadow-soft-lg space-y-4">
          <h2 className="text-xl font-bold text-slate-950 dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Overview & Care Assurance
          </h2>
          <p className="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-200">
            {data.heroDescription}
          </p>
        </div>

        {/* Key Features Grid */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="section-kicker">Core Features</p>
            <h2 className="section-title">What Makes This Unique</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {data.keyFeatures.map((feat, i) => {
              const IconComp = iconMap[feat.iconName] || CheckCircle2
              return (
                <div key={i} className="feature-card flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-soft">
                        <IconComp className="h-6 w-6" />
                      </div>
                      {feat.badge && (
                        <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-800 dark:text-cyan-300 border border-cyan-500/20">
                          {feat.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="mb-2 text-xl font-extrabold text-slate-950 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition">
                      {feat.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {feat.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Benefits Checklist */}
        <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-50/70 via-white to-cyan-50/50 p-8 dark:from-emerald-950/30 dark:via-slate-900/80 dark:to-cyan-950/30 shadow-soft">
          <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-6 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Key Benefits for Your Family
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.benefits.map((ben, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{ben}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section if present */}
        {data.faq && data.faq.length > 0 && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto">
              <p className="section-kicker">Questions & Answers</p>
              <h2 className="section-title">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-3">
              {data.faq.map((f, index) => {
                const isOpen = openFaq === index
                return (
                  <div key={index} className="glass-panel overflow-hidden border border-slate-200/80 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="flex w-full items-center justify-between p-5 text-left text-base font-bold text-slate-900 dark:text-white hover:text-cyan-600 transition"
                    >
                      <span className="flex items-center gap-3">
                        <HelpCircle className="h-5 w-5 text-cyan-500 shrink-0" />
                        <span>{f.question}</span>
                      </span>
                      <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-cyan-500' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800">
                        {f.answer}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* CTA Card */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-primary-950 to-slate-900 p-8 sm:p-12 text-white shadow-soft-lg text-center space-y-6">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
              {data.ctaTitle}
            </h3>
            <p className="text-base text-slate-300">
              {data.ctaDescription}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={checkoutUrl}
                className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-8 py-4 text-base font-black text-slate-950 shadow-glow-cyan hover:scale-105 transition"
              >
                Book Care Now
              </Link>
              <a
                href="tel:+237671159461"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white/80 px-7 py-3.5 text-base font-bold text-white hover:bg-white/10 transition"
              >
                <PhoneCall className="h-4 w-4" />
                <span>Call CareLine</span>
              </a>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <HomeFooter content={homeContent.en.footer} />

    </div>
  )
}
