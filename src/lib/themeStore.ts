import { create } from 'zustand'
import type { ThemeName } from '@/theme/themes'

type Theme = ThemeName

interface ThemeState {
  theme: Theme
  setTheme: (t: Theme) => void
  toggle: () => void
}

const getInitialTheme = (): Theme => {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored === 'light' || stored === 'dark') return stored
  }
  return 'dark'
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),
  setTheme: (t) => {
    localStorage.setItem('theme', t)
    set({ theme: t })
  },
  toggle: () => set((s) => {
    const next = s.theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', next)
    return { theme: next }
  }),
})) 