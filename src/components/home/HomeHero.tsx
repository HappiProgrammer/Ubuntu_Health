'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Heart,
  Moon,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Sun,
  MapPin,
  Clock,
  CheckCircle2,
  Stethoscope,
  Menu,
  X,
  Activity,
  Users,
  Star,
  Smartphone
} from 'lucide-react'
import type { HomeCopy, Language } from '@/lib/home-content'

type HomeHeroProps = {
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

/**
 * Interactive Title where each letter changes to yellow and floats on hover
 */
function HoverFloatingTitle({ title }: { title: string }) {
  return (
    <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-tight text-slate-950 dark:text-white sm:text-5xl md:text-6xl flex flex-wrap gap-x-3">
      {title.split(' ').map((word, wordIdx) => (
        <span key={wordIdx} className="inline-block whitespace-nowrap">
          {word.split('').map((char, charIdx) => (
            <span
              key={charIdx}
              className="inline-block transition-all duration-200 hover:-translate-y-3 hover:scale-125 hover:text-amber-400 dark:hover:text-yellow-300 hover:drop-shadow-[0_0_12px_rgba(245,158,11,0.8)] cursor-pointer"
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </h1>
  )
}

/**
 * Hero Statistics Panel that animates stats count-up and loading bars
 */
function HeroStatsPanel({ careType, selectedCity, selectedDuration, setCareType, setSelectedCity, setSelectedDuration, content }: any) {
  const [activeTab, setActiveTab] = useState<'stats' | 'quickFinder'>('stats')
  
  // Animated Stat Values
  const [availableCount, setAvailableCount] = useState(0)
  const [responseMinutes, setResponseMinutes] = useState(0)
  const [trustScore, setTrustScore] = useState(0)

  // Animated Progress Widths
  const [doualaProgress, setDoualaProgress] = useState(0)
  const [yaoundeProgress, setYaoundeProgress] = useState(0)
  const [bueaProgress, setBueaProgress] = useState(0)

  useEffect(() => {
    const duration = 1800
    const startTime = performance.now()

    const animateStats = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)

      setAvailableCount(Math.floor(127 * ease))
      setResponseMinutes(Math.floor(18 * ease))
      setTrustScore(parseFloat((4.9 * ease).toFixed(1)))

      setDoualaProgress(Math.floor(92 * ease))
      setYaoundeProgress(Math.floor(88 * ease))
      setBueaProgress(Math.floor(81 * ease))

      if (progress < 1) {
        requestAnimationFrame(animateStats)
      } else {
        setAvailableCount(127)
        setResponseMinutes(18)
        setTrustScore(4.9)
        setDoualaProgress(92)
        setYaoundeProgress(88)
        setBueaProgress(81)
      }
    }

    requestAnimationFrame(animateStats)
  }, [])

  return (
    <div className="relative group">
      {/* Morphing Glow Background */}
      <div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-cyan-500/25 via-sky-400/20 to-emerald-500/20 blur-2xl animate-morph" />
      
      {/* Floating Card Container */}
      <div className="glass-panel relative overflow-hidden p-6 sm:p-8 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:border-cyan-400/80">
        
        {/* Tab Header Switcher */}
        <div className="mb-6 flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                activeTab === 'stats' 
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-soft-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              Live Signal & Stats
            </button>
            <button
              onClick={() => setActiveTab('quickFinder')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                activeTab === 'quickFinder' 
                  ? 'bg-cyan-500 text-slate-950 shadow-soft-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-cyan-600'
              }`}
            >
              Quick Care Finder
            </button>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            Online
          </span>
        </div>

        {activeTab === 'stats' ? (
          /* TAB 1: Animated Statistics & Coverage Pulse */
          <div className="space-y-6">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
                Live Care Signal
              </p>
              <h3 className="font-display text-xl font-black text-slate-950 dark:text-white">
                Nearby support is active
              </h3>
            </div>

            {/* 3 Stats Tiles Floating on Hover */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-3.5 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft-lg hover:border-amber-400/60">
                <p className="font-display text-2xl font-black text-slate-950 dark:text-white">{availableCount}</p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">Available now</p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-3.5 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft-lg hover:border-amber-400/60">
                <p className="font-display text-2xl font-black text-slate-950 dark:text-white">{responseMinutes}m</p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">Avg response</p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-3.5 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft-lg hover:border-amber-400/60">
                <p className="font-display text-2xl font-black text-slate-950 dark:text-white">{trustScore}</p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">Trust score</p>
              </div>
            </div>

            {/* Care Flow & Coverage Grid */}
            <div className="grid gap-4 sm:grid-cols-2 pt-1">
              
              {/* Care Flow Steps */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-4 space-y-3">
                <p className="text-xs font-bold text-slate-900 dark:text-white">Care flow</p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-[10px] font-bold">1</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Request received</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-slate-950 text-[10px] font-bold">2</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Best caregivers matched</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold">3</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Visit ready to confirm</span>
                  </div>
                </div>
              </div>

              {/* Coverage Pulse Loading Progress Bars */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-4 space-y-3">
                <p className="text-xs font-bold text-slate-900 dark:text-white">Coverage pulse</p>
                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                      <span>Douala</span>
                      <span className="text-cyan-600 dark:text-cyan-400">{doualaProgress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-75"
                        style={{ width: `${doualaProgress}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                      <span>Yaoundé</span>
                      <span className="text-cyan-600 dark:text-cyan-400">{yaoundeProgress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-400 transition-all duration-75"
                        style={{ width: `${yaoundeProgress}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                      <span>Buea</span>
                      <span className="text-cyan-600 dark:text-cyan-400">{bueaProgress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-amber-400 transition-all duration-75"
                        style={{ width: `${bueaProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <Link
              href="/checkout?service=senior"
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-500 py-3.5 text-center text-sm font-black text-slate-950 shadow-glow-cyan hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2"
            >
              <Smartphone className="h-4 w-4" />
              <span>Book Verified Caregiver Now</span>
            </Link>
          </div>
        ) : (
          /* TAB 2: Quick Care Finder */
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                {content.hero.quickFinder.step1Label}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {content.hero.quickFinder.careTypes.map((item: any) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCareType(item.id)}
                    className={`flex items-center gap-2 rounded-xl p-3 text-left text-xs font-semibold transition ${
                      careType === item.id
                        ? 'bg-primary-600 text-white shadow-soft'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="leading-tight">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary-500" />
                {content.hero.quickFinder.step2Label}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {content.hero.quickFinder.cities.map((city: string) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedCity(city)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      selectedCity === city
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-primary-500" />
                {content.hero.quickFinder.step3Label}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {content.hero.quickFinder.durations.map((dur: any) => (
                  <button
                    key={dur.id}
                    type="button"
                    onClick={() => setSelectedDuration(dur.id)}
                    className={`rounded-lg p-2 text-center text-xs font-semibold transition ${
                      selectedDuration === dur.id
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {dur.label}
                  </button>
                ))}
              </div>
            </div>

            <Link
              href={`/checkout?service=${careType}&city=${selectedCity}&urgency=${selectedDuration}`}
              className="w-full mt-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-500 py-4 text-center text-sm font-black text-slate-950 shadow-glow-cyan hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2"
            >
              <span>{content.hero.quickFinder.cta}</span>
            </Link>

            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> No commitment required
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Free coordination
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export function HomeHero({
  content,
  language,
  onLanguageToggle,
  onThemeToggle,
  theme,
  selectedRole,
  onSelectRole,
  textSize = 'normal',
  onTextSizeChange,
}: HomeHeroProps) {
  const [careType, setCareType] = useState('senior')
  const [selectedCity, setSelectedCity] = useState('Douala')
  const [selectedDuration, setSelectedDuration] = useState('today')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const roleHref = selectedRole ? `/auth/register?role=${selectedRole}` : `/auth/register?role=client&care=${careType}&city=${selectedCity}`

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-3 sm:px-6 lg:px-8 lg:pb-24">
      {/* 24/7 Emergency & CareLine Quick Banner */}
      <div className="mx-auto mb-4 max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200/80 bg-gradient-to-r from-red-500/10 via-amber-500/10 to-primary-500/10 px-4 py-2.5 text-xs sm:text-sm backdrop-blur dark:border-red-900/40 dark:from-red-950/30 dark:via-amber-950/20 dark:to-primary-950/30">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-0.5 font-bold uppercase tracking-wider text-white shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
              {content.emergencyBanner.badge}
            </span>
            <span className="font-medium hidden sm:inline">{content.emergencyBanner.text}</span>
          </div>
          <a
            href={`tel:${content.emergencyBanner.phoneNumber}`}
            className="inline-flex items-center gap-1.5 font-bold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-transform hover:scale-105"
          >
            <PhoneCall className="h-3.5 w-3.5" />
            <span>{content.emergencyBanner.callText}</span>
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Navigation Bar */}
        <header className="glass-panel sticky top-3 z-40 mb-8 flex items-center justify-between gap-4 px-5 py-4 backdrop-blur-2xl shadow-soft-lg border-white/80 dark:border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-cyan-400 text-white shadow-soft ring-1 ring-white/50">
              <Heart className="h-6 w-6 fill-white" />
            </div>
            <div>
              <p className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">BridgeCare</p>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-600 dark:text-primary-400">
                Cameroon Santé
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
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

          {/* Accessibility & Auth Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Text Size Scale Controls */}
            {onTextSizeChange && (
              <div className="hidden sm:flex items-center gap-1 rounded-full border border-slate-300/70 bg-white/70 p-1 dark:border-slate-700 dark:bg-slate-900/60" title="Adjust text size for easier reading">
                <button
                  onClick={() => onTextSizeChange('normal')}
                  className={`h-7 w-7 rounded-full text-xs font-bold transition ${textSize === 'normal' ? 'bg-primary-500 text-white' : 'text-slate-600 dark:text-slate-300'}`}
                >
                  A
                </button>
                <button
                  onClick={() => onTextSizeChange('large')}
                  className={`h-7 w-7 rounded-full text-xs font-bold transition ${textSize === 'large' ? 'bg-primary-500 text-white' : 'text-slate-600 dark:text-slate-300'}`}
                >
                  A+
                </button>
                <button
                  onClick={() => onTextSizeChange('xl')}
                  className={`h-7 w-7 rounded-full text-xs font-bold transition ${textSize === 'xl' ? 'bg-primary-500 text-white' : 'text-slate-600 dark:text-slate-300'}`}
                >
                  A++
                </button>
              </div>
            )}

            <button onClick={onThemeToggle} className="icon-button" aria-label="Toggle theme">
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <button onClick={onLanguageToggle} className="pill-button text-sm font-bold text-primary-700 dark:text-primary-300">
              {language === 'en' ? '🇨🇲 FR' : '🇬🇧 EN'}
            </button>
            <Link href="/auth/login" className="hidden text-sm font-semibold text-slate-700 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white sm:inline-flex">
              {content.nav.login}
            </Link>
            <Link href="/auth/register" className="btn-primary hidden sm:inline-flex">
              {content.nav.register}
            </Link>

            {/* Mobile Menu Hamburger Button */}
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
          <div className="glass-panel mb-8 p-6 lg:hidden animate-slide-up space-y-5 border-cyan-500/30">
            <nav className="flex flex-col gap-3 font-semibold text-slate-800 dark:text-slate-200">
              <a
                href="#services"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-xl bg-slate-100 dark:bg-slate-800/80 p-3 text-sm hover:text-cyan-600 transition"
              >
                {content.nav.services}
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-xl bg-slate-100 dark:bg-slate-800/80 p-3 text-sm hover:text-cyan-600 transition"
              >
                {content.nav.howItWorks}
              </a>
              <a
                href="#safety"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-xl bg-slate-100 dark:bg-slate-800/80 p-3 text-sm hover:text-cyan-600 transition"
              >
                {content.nav.safety}
              </a>
              <a
                href="#faq"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-xl bg-slate-100 dark:bg-slate-800/80 p-3 text-sm hover:text-cyan-600 transition"
              >
                {content.nav.faq}
              </a>
            </nav>

            {/* Text Size Scale Controls in Mobile Menu */}
            {onTextSizeChange && (
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Text Size:</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onTextSizeChange('normal')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${textSize === 'normal' ? 'bg-cyan-500 text-white' : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    A
                  </button>
                  <button
                    onClick={() => onTextSizeChange('large')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${textSize === 'large' ? 'bg-cyan-500 text-white' : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    A+
                  </button>
                  <button
                    onClick={() => onTextSizeChange('xl')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${textSize === 'xl' ? 'bg-cyan-500 text-white' : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    A++
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-800">
              <Link
                href="/auth/login"
                onClick={() => setMobileNavOpen(false)}
                className="w-full text-center rounded-xl border border-slate-300 dark:border-slate-700 py-3 text-sm font-bold text-slate-800 dark:text-slate-200"
              >
                {content.nav.login}
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileNavOpen(false)}
                className="w-full text-center btn-primary py-3 text-sm font-bold"
              >
                {content.nav.register}
              </Link>
            </div>
          </div>
        )}

        {/* Hero Main Content */}
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50/80 px-4 py-2 text-sm font-medium text-emerald-800 shadow-soft backdrop-blur dark:border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>{content.announcement}</span>
            </div>

            <div className="space-y-5">
              <p className="font-display text-sm font-bold uppercase tracking-[0.35em] text-primary-600 dark:text-primary-400">
                {content.hero.eyebrow}
              </p>
              
              {/* Interactive Hover-Floating Title */}
              <HoverFloatingTitle title={content.hero.title} />

              <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                {content.hero.subtitle}
              </p>
            </div>

            {/* Role Selection Cards (Floating Divs) */}
            <div className="grid gap-3 sm:max-w-xl sm:grid-cols-2">
              <button
                onClick={() => onSelectRole('client')}
                className={`choice-card ${selectedRole === 'client' ? 'choice-card-active' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-block rounded-md bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">
                      Families & Patients
                    </span>
                    <p className="text-base font-bold text-slate-900 dark:text-white">{content.hero.clientLabel}</p>
                  </div>
                  <Heart className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                </div>
              </button>

              <button
                onClick={() => onSelectRole('nurse')}
                className={`choice-card ${selectedRole === 'nurse' ? 'choice-card-active' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-block rounded-md bg-primary-100 dark:bg-primary-950/60 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300 mb-2">
                      Healthcare Professionals
                    </span>
                    <p className="text-base font-bold text-slate-900 dark:text-white">{content.hero.nurseLabel}</p>
                  </div>
                  <Stethoscope className="h-6 w-6 text-primary-600 dark:text-primary-400 shrink-0" />
                </div>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={roleHref} className="btn-primary inline-flex items-center justify-center gap-2 text-base">
                <span>{content.hero.primaryCta}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/auth/register?role=nurse" className="btn-secondary inline-flex items-center justify-center gap-2 text-base">
                <span>{content.hero.secondaryCta}</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2.5">
              {['💳 MTN MoMo & Orange Money Accepted', ...content.hero.trustBadges].map((badge) => (
                <span key={badge} className="pill-muted text-xs sm:text-sm font-medium">
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Right Column: Floating Hero Statistics Panel */}
          <HeroStatsPanel
            careType={careType}
            selectedCity={selectedCity}
            selectedDuration={selectedDuration}
            setCareType={setCareType}
            setSelectedCity={setSelectedCity}
            setSelectedDuration={setSelectedDuration}
            content={content}
          />

        </div>
      </div>
    </section>
  )
}
