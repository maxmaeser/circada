"use client"
import { useThemeStore } from '@/lib/themeStore'

export default function ThemeDropdown() {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  return (
    <div className="fixed bottom-4 right-4 select-none bg-card/80 backdrop-blur border border-border rounded-md shadow-lg px-3 py-1.5">
      <label className="sr-only" htmlFor="theme-select">Theme</label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'terminal')}
        className="bg-transparent text-card-foreground text-sm font-medium pr-6 focus:outline-none focus:ring-2 focus:ring-ring/50 cursor-pointer appearance-none"
      >
        <option value="dark">🌙 Night</option>
        <option value="light">☀️ Light</option>
        <option value="terminal">🖥️ Terminal</option>
      </select>
      {/* custom dropdown arrow */}
      <svg
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 size-4 text-card-foreground"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  )
} 