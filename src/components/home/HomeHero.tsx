'use client'

import Link from 'next/link'
import { ArrowRight, Moon, ShieldCheck, Sparkles, Sun, UserRound, UsersRound } from 'lucide-react'
import type { HomeCopy, Language } from '@/lib/home-content'

type HomeHeroProps = {
  content: HomeCopy
  language: Language
  onLanguageToggle: () => void
  onThemeToggle: () => void
  theme: 'light' | 'dark'
  selectedRole: 'nurse' | 'client' | null
  onSelectRole: (role: 'nurse' | 'client') => void
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
  const roleHref = selectedRole ? `/auth/register?role=${selectedRole}` : '/auth/register'

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pb-24">
      <div className="mx-auto max-w-7xl">
        <header className="glass-panel mb-8 flex items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_rgba(255,255,255,0.08))] ring-1 ring-white/50">
              <ShieldCheck className="h-6 w-6 text-primary-700 dark:text-primary-300" />
            </div>
            <div>
              <p className="font-display text-xl text-slate-900 dark:text-white">BridgeCare</p>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Cameroon</p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={onThemeToggle} className="icon-button" aria-label="Toggle theme">
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <button onClick={onLanguageToggle} className="pill-button text-sm font-semibold">
              {language === 'en' ? 'FR' : 'EN'}
            </button>
            <Link href="/auth/login" className="hidden text-sm font-semibold text-slate-700 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white sm:inline-flex">
              {content.nav.login}
            </Link>
            <Link href="/auth/register" className="btn-primary">
              {content.nav.register}
            </Link>
          </div>
        </header>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm text-slate-700 shadow-soft backdrop-blur dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>{content.announcement}</span>
            </div>

            <div className="space-y-5">
              <p className="font-display text-sm uppercase tracking-[0.35em] text-primary-700 dark:text-primary-300">
                {content.hero.eyebrow}
              </p>
              <h1 className="max-w-3xl text-5xl font-black leading-[0.95] text-slate-950 dark:text-white md:text-7xl">
                {content.hero.title}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300 md:text-xl">
                {content.hero.subtitle}
              </p>
            </div>

            <div className="grid gap-3 sm:max-w-xl sm:grid-cols-2">
              <button
                onClick={() => onSelectRole('nurse')}
                className={`choice-card ${selectedRole === 'nurse' ? 'choice-card-active' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                      {content.hero.rolePrompt}
                    </p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{content.hero.nurseLabel}</p>
                  </div>
                  <UsersRound className="h-6 w-6 text-primary-600 dark:text-primary-300" />
                </div>
              </button>
              <button
                onClick={() => onSelectRole('client')}
                className={`choice-card ${selectedRole === 'client' ? 'choice-card-active' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                      {content.hero.rolePrompt}
                    </p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{content.hero.clientLabel}</p>
                  </div>
                  <UserRound className="h-6 w-6 text-secondary-600 dark:text-secondary-300" />
                </div>
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={roleHref} className="btn-primary inline-flex items-center justify-center gap-2">
                <span>{content.hero.primaryCta}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard" className="btn-secondary inline-flex items-center justify-center gap-2">
                <span>{content.hero.secondaryCta}</span>
              </Link>
            </div>

            <div className="flex flex-wrap gap-3">
              {content.hero.trustBadges.map((badge) => (
                <span key={badge} className="pill-muted">
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.22),_transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.18),_transparent_40%)] blur-2xl" />
            <div className="glass-panel relative overflow-hidden p-6 sm:p-8">
              <div className="absolute inset-x-6 top-6 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20" />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="dashboard-card md:col-span-2">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Live care signal</p>
                      <p className="font-display text-2xl text-slate-950 dark:text-white">Nearby support is active</p>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Online
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="stat-tile">
                      <p className="stat-value">127</p>
                      <p className="stat-label">Available now</p>
                    </div>
                    <div className="stat-tile">
                      <p className="stat-value">18m</p>
                      <p className="stat-label">Avg response</p>
                    </div>
                    <div className="stat-tile">
                      <p className="stat-value">4.9</p>
                      <p className="stat-label">Trust score</p>
                    </div>
                  </div>
                </div>

                <div className="dashboard-card">
                  <p className="mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Care flow</p>
                  <div className="space-y-3">
                    {['Request received', 'Best caregivers matched', 'Visit ready to confirm'].map((item, index) => (
                      <div key={item} className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white dark:bg-white dark:text-slate-900">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dashboard-card">
                  <p className="mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Coverage pulse</p>
                  <div className="space-y-3">
                    {[
                      { city: 'Douala', level: '92%' },
                      { city: 'Yaounde', level: '88%' },
                      { city: 'Buea', level: '81%' },
                    ].map((city) => (
                      <div key={city.city}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700 dark:text-slate-200">{city.city}</span>
                          <span className="text-slate-500 dark:text-slate-400">{city.level}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-primary-500 via-cyan-400 to-secondary-500"
                            style={{ width: city.level }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
