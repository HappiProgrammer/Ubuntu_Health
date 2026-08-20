'use client'

import { useState } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { HomeFooter } from '@/components/home/HomeFooter'
import { HomeHero } from '@/components/home/HomeHero'
import {
  HomeCta,
  HomeDiasporaSection,
  HomeFAQ,
  HomeFeatures,
  HomeHowItWorks,
  HomeMetrics,
  HomeServicesSection,
  HomeTestimonials,
  HomeTrustSafety,
} from '@/components/home/HomeSections'
import { homeContent, type Language } from '@/lib/home-content'

export default function HomePage() {
  const [selectedRole, setSelectedRole] = useState<'nurse' | 'client' | null>(null)
  const [language, setLanguage] = useState<Language>('en')
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'xl'>('normal')
  const { theme, toggleTheme } = useTheme()

  const content = homeContent[language]

  const textSizeClass = textSize === 'xl' ? 'text-lg' : textSize === 'large' ? 'text-base' : ''

  return (
    <main className={`relative min-h-screen overflow-hidden ${textSizeClass}`}>
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
        textSize={textSize}
        onTextSizeChange={setTextSize}
      />
      <HomeMetrics metrics={content.metrics} />
      <HomeServicesSection content={content.servicesSection} />
      <HomeHowItWorks content={content.howItWorks} />
      <HomeDiasporaSection content={content.diasporaSection} />
      <HomeFeatures content={content.features} />
      <HomeTrustSafety content={content.trustSafety} />
      <HomeFAQ content={content.faq} />
      <HomeTestimonials content={content.testimonials} />
      <HomeCta content={content.cta} />
      <HomeFooter content={content.footer} />
    </main>
  )
}
