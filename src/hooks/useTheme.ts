'use client'

import { useState, useEffect, useCallback } from 'react'

export type Theme = 'light' | 'dark'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    // Initial theme check
    const isDark = document.documentElement.classList.contains('dark') || 
                  (localStorage.theme === 'dark') || 
                  (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    
    if (isDark) {
      setTheme('dark')
      document.documentElement.classList.add('dark')
    } else {
      setTheme('light')
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const newTheme = prev === 'light' ? 'dark' : 'light'
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
        localStorage.theme = 'dark'
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.theme = 'light'
      }
      return newTheme
    })
  }, [])

  return { theme, setTheme, toggleTheme, isDark: theme === 'dark' }
}
