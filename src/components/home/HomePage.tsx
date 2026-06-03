'use client'

import { useState } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { HomeFooter } from '@/components/home/HomeFooter'
import { HomeHero } from '@/components/home/HomeHero'
import { HomeCta, HomeFeatures, HomeHowItWorks, HomeMetrics, HomeTestimonials } from '@/components/home/HomeSections'
import { homeContent, type Language } from '@/lib/home-content'

export default function HomePage() {
  const [selectedRole, setSelectedRole] = useState<'nurse' | 'client' | null>(null)
  const [language, setLanguage] = useState<Language>('en')
  const { theme, toggleTheme } = useTheme()

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
