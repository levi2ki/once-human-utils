import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ConfigProvider, theme as antdTheme } from 'antd'
import { getThemePreference, setThemePreference, type ThemePreference } from '../storage/settingsStore'

type ThemeContextValue = {
  preference: ThemePreference
  resolved: 'light' | 'dark'
  setPreference: (value: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const resolveTheme = (preference: ThemePreference): 'light' | 'dark' => {
  if (preference === 'light' || preference === 'dark') {
    return preference
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [preference, setPreferenceState] = useState<ThemePreference>(() =>
    getThemePreference(),
  )
  const [resolved, setResolved] = useState<'light' | 'dark'>(() =>
    resolveTheme(getThemePreference()),
  )

  useEffect(() => {
    setThemePreference(preference)
    const nextResolved = resolveTheme(preference)
    setResolved(nextResolved)
    if (typeof document !== 'undefined') {
      document.body.dataset.theme = nextResolved
    }
  }, [preference])

  useEffect(() => {
    if (preference !== 'system' || typeof window === 'undefined' || !window.matchMedia) {
      return
    }
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const nextResolved = media.matches ? 'dark' : 'light'
      setResolved(nextResolved)
      if (typeof document !== 'undefined') {
        document.body.dataset.theme = nextResolved
      }
    }
    handler()
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [preference])

  const value = useMemo(
    () => ({
      preference,
      resolved,
      setPreference: setPreferenceState,
    }),
    [preference, resolved],
  )

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider
        theme={{
          algorithm:
            resolved === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: { colorPrimary: '#1677ff' },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
