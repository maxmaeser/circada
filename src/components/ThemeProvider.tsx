"use client"
import { useEffect } from 'react'
import { useThemeStore } from '@/lib/themeStore'
import type { PropsWithChildren } from 'react'
import { themes } from '@/theme/themes'

export default function ThemeProvider({ children }: PropsWithChildren) {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement as HTMLElement & { style: CSSStyleDeclaration }
    const vars = themes[theme]
    Object.entries(vars).forEach(([k, v]) => {
      root.style.setProperty(k, v)
    })

    const fam = (vars as any)['--font-family']
    if (fam) root.style.setProperty('font-family', fam)

    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  return <>{children}</>
} 