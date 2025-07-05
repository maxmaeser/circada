import { useThemeStore } from './themeStore'
// JSDOM already provides localStorage; ensure clean slate before each.

describe('themeStore persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    // Reset Zustand store state between tests
    useThemeStore.setState({ theme: 'dark' })
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('default theme is dark when no preference in localStorage', () => {
    const { theme } = useThemeStore.getState()
    expect(theme).toBe('dark')
  })

  it('setTheme updates localStorage and store state', () => {
    useThemeStore.getState().setTheme('light')
    expect(useThemeStore.getState().theme).toBe('light')
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('store initializes with saved preference from localStorage', async () => {
    localStorage.setItem('theme', 'light')
    // Reload the module to execute getInitialTheme again
    jest.resetModules?.()
    const { useThemeStore: freshStore } = await import('./themeStore')
    expect(freshStore.getState().theme).toBe('light')
  })
}) 