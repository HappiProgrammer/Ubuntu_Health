'use client'

import { useEffect, useState } from 'react'
import { HomeFooter } from '@/components/home/HomeFooter'
import { HomeHero } from '@/components/home/HomeHero'
import { HomeCta, HomeFeatures, HomeHowItWorks, HomeMetrics, HomeTestimonials } from '@/components/home/HomeSections'
import { homeContent, type Language } from '@/lib/home-content'

export default function HomePage() {
  const [selectedRole, setSelectedRole] = useState<'nurse' | 'client' | null>(null)
  const [language, setLanguage] = useState<Language>('en')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'dark' : 'light')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    localStorage.theme = newTheme
  }

  const content = homeContent[language]

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="site-orb site-orb-a" />
      <div className="site-orb site-orb-b" />
      <div className="site-orb site-orb-c" />

      <HomeHero
        content={content}
        language={language}
        onLanguageToggle={() => setLanguage((current) => (current === 'en' ? 'fr' : 'en'))}
        onThemeToggle={toggleTheme}
        theme={theme}
        selectedRole={selectedRole}
        onSelectRole={setSelectedRole}
      />
      <HomeMetrics metrics={content.metrics} />
      <HomeFeatures content={content.features} />
      <HomeHowItWorks content={content.howItWorks} />
      <HomeTestimonials content={content.testimonials} />
      <HomeCta content={content.cta} />
      <HomeFooter content={content.footer} />
    </main>
  )
}
