'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Heart,
  Moon,
  Sun,
  MapPin,
  Clock,
  Stethoscope,
  Menu,
  X
} from 'lucide-react'
import type { HomeCopy, Language } from '@/lib/home-content'

export type HomeHeroProps = {
  content: HomeCopy
  language: Language
  onLanguageToggle: () => void
  onThemeToggle: () => void
  theme: 'light' | 'dark'
  selectedRole: 'nurse' | 'client' | null
  onSelectRole: (role: 'nurse' | 'client') => void
  textSize?: 'normal' | 'large' | 'xl'
  onTextSizeChange?: (size: 'normal' | 'large' | 'xl') => void
}

export function HomeHero({
  content,
  language,
  onLanguageToggle,
  onThemeToggle,
  theme,
  selectedRole,
  onSelectRole,
}: HomeHeroProps) {
  const [selectedCity, setSelectedCity] = useState('Douala')
  const [selectedDuration, setSelectedDuration] = useState('today')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const roleHref = selectedRole
    ? `/auth/register?role=${selectedRole}`
    : `/checkout?service=senior&city=${selectedCity}&urgency=${selectedDuration}`

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-3 sm:px-6 lg:px-8 lg:pb-24">
      <div className="mx-auto max-w-7xl">
        {/* Navigation Bar */}
        <header className="glass-panel sticky top-3 z-40 mb-8 flex items-center justify-between gap-4 px-5 py-4 backdrop-blur-xl shadow-soft-sm border-white/80 dark:border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-cyan-500 text-white shadow-soft">
              <Heart className="h-6 w-6 fill-white" />
            </div>
            <div>
              <p className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">BridgeCare</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">
                Cameroon Santé
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#services" className="hover:text-primary-600 dark:hover:text-primary-400 transition">
              {content.nav.services}
            </a>
            <a href="#how-it-works" className="hover:text-primary-600 dark:hover:text-primary-400 transition">
              {content.nav.howItWorks}
            </a>
            <a href="#safety" className="hover:text-primary-600 dark:hover:text-primary-400 transition">
              {content.nav.safety}
            </a>
            <a href="#faq" className="hover:text-primary-600 dark:hover:text-primary-400 transition">
              {content.nav.faq}
            </a>
          </nav>

          {/* Controls & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={onThemeToggle} className="icon-button" aria-label="Toggle theme">
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <button onClick={onLanguageToggle} className="pill-button text-xs font-bold text-primary-700 dark:text-primary-300">
              {language === 'en' ? '🇨🇲 FR' : '🇬🇧 EN'}
            </button>
            <Link href="/auth/login" className="hidden text-sm font-semibold text-slate-700 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white sm:inline-flex">
              {content.nav.login}
            </Link>
            <Link href="/auth/register" className="btn-primary hidden sm:inline-flex py-2.5 text-xs">
              {content.nav.register}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="icon-button lg:hidden"
              aria-label="Toggle Navigation Menu"
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="glass-panel mb-8 p-6 lg:hidden animate-slide-up space-y-4 border-slate-200 dark:border-slate-800">
            <nav className="flex flex-col gap-2 font-semibold text-slate-800 dark:text-slate-200">
              <a
                href="#services"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-xl bg-slate-100 dark:bg-slate-800/80 p-3 text-sm hover:text-primary-600 transition"
              >
                {content.nav.services}
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-xl bg-slate-100 dark:bg-slate-800/80 p-3 text-sm hover:text-primary-600 transition"
              >
                {content.nav.howItWorks}
              </a>
              <a
                href="#safety"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-xl bg-slate-100 dark:bg-slate-800/80 p-3 text-sm hover:text-primary-600 transition"
              >
                {content.nav.safety}
              </a>
              <a
                href="#faq"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-xl bg-slate-100 dark:bg-slate-800/80 p-3 text-sm hover:text-primary-600 transition"
              >
                {content.nav.faq}
              </a>
            </nav>

            <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-200/80 dark:border-slate-800">
              <Link
                href="/auth/login"
                onClick={() => setMobileNavOpen(false)}
                className="w-full text-center rounded-xl border border-slate-300 dark:border-slate-700 py-2.5 text-sm font-bold text-slate-800 dark:text-slate-200"
              >
                {content.nav.login}
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileNavOpen(false)}
                className="w-full text-center btn-primary py-2.5 text-sm font-bold"
              >
                {content.nav.register}
              </Link>
            </div>
          </div>
        )}

        {/* Hero Main Content */}
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-primary-600 dark:text-primary-400">
                {content.hero.eyebrow}
              </p>
              
              <h1 className="max-w-2xl font-display text-4xl font-black leading-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
                {content.hero.title}
              </h1>

              <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                {content.hero.subtitle}
              </p>
            </div>

            {/* Role Selection Cards */}
            <div className="grid gap-3 sm:max-w-xl sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onSelectRole('client')}
                className={`rounded-2xl border-2 p-4 text-left transition ${
                  selectedRole === 'client'
                    ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-950/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                      For Families
                    </span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{content.hero.clientLabel}</p>
                  </div>
                  <Heart className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => onSelectRole('nurse')}
                className={`rounded-2xl border-2 p-4 text-left transition ${
                  selectedRole === 'nurse'
                    ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-950/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-primary-700 dark:text-primary-400 mb-1">
                      For Healthcare Pros
                    </span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{content.hero.nurseLabel}</p>
                  </div>
                  <Stethoscope className="h-5 w-5 text-primary-600 dark:text-primary-400 shrink-0" />
                </div>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row pt-2">
              <Link href={roleHref} className="btn-primary inline-flex items-center justify-center gap-2 text-sm sm:text-base">
                <span>{content.hero.primaryCta}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/auth/register?role=nurse" className="btn-secondary inline-flex items-center justify-center gap-2 text-sm sm:text-base">
                <span>{content.hero.secondaryCta}</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              {['💳 MTN MoMo & Orange Money Accepted', ...content.hero.trustBadges].map((badge) => (
                <span key={badge} className="pill-muted text-xs font-medium">
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Right Column: Direct & Streamlined Care Booking Card */}
          <div className="glass-panel p-6 sm:p-8 space-y-6">
            {/* Step 1: Select City */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary-500" />
                <span>{content.hero.quickFinder.step2Label}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {content.hero.quickFinder.cities.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedCity(city)}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                      selectedCity === city
                        ? 'bg-emerald-600 text-white shadow-soft'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Timing / Urgency */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary-500" />
                <span>{content.hero.quickFinder.step3Label}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {content.hero.quickFinder.durations.map((dur) => (
                  <button
                    key={dur.id}
                    type="button"
                    onClick={() => setSelectedDuration(dur.id)}
                    className={`rounded-xl p-2.5 text-center text-xs font-bold transition ${
                      selectedDuration === dur.id
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-soft'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {dur.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Booking CTA */}
            <Link
              href={`/checkout?service=senior&city=${selectedCity}&urgency=${selectedDuration}`}
              className="btn-primary w-full py-4 text-center text-sm font-bold flex items-center justify-center gap-2 shadow-soft"
            >
              <span>{content.hero.quickFinder.cta}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            {/* 3 Simple Metrics Badges */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-200/80 dark:border-slate-800 text-center">
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-base">120+</p>
                <p className="text-[11px] text-slate-500">Verified Nurses</p>
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-base">15 min</p>
                <p className="text-[11px] text-slate-500">Avg Response</p>
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-base">4.9 / 5</p>
                <p className="text-[11px] text-slate-500">Family Rating</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
