'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, Moon, Sun, ArrowLeft } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export interface AuthHeaderProps {
  language?: 'en' | 'fr'
  onLanguageToggle?: () => void
}

export function AuthHeader({ language = 'en', onLanguageToggle }: AuthHeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const [internalLang, setInternalLang] = useState<'en' | 'fr'>(language)

  const handleLangToggle = () => {
    if (onLanguageToggle) {
      onLanguageToggle()
    } else {
      setInternalLang((prev) => (prev === 'en' ? 'fr' : 'en'))
    }
  }

  const currentLang = onLanguageToggle ? language : internalLang

  return (
    <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      <div className="glass-panel flex items-center justify-between gap-4 px-4 sm:px-6 py-3.5 backdrop-blur-xl shadow-soft-sm border-white/80 dark:border-white/10">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group transition-transform active:scale-95">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-cyan-500 text-white shadow-soft transition-transform group-hover:scale-105">
            <Heart className="h-5 w-5 sm:h-6 sm:w-6 fill-white" />
          </div>
          <div>
            <p className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              BridgeCare
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">
              Cameroon Santé
            </p>
          </div>
        </Link>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="icon-button h-9 w-9 sm:h-10 sm:w-10"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={handleLangToggle}
            className="pill-button text-xs font-bold text-primary-700 dark:text-primary-300 px-3 py-1.5 sm:px-4"
          >
            {currentLang === 'en' ? '🇨🇲 FR' : '🇬🇧 EN'}
          </button>

          {/* Back to Home Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 pill-button text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-1.5 sm:px-4 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{currentLang === 'en' ? 'Back to Home' : 'Accueil'}</span>
            <span className="sm:hidden">{currentLang === 'en' ? 'Home' : 'Accueil'}</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
