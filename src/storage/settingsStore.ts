export type ThemePreference = 'light' | 'dark' | 'system'

const THEME_KEY = 'once-human-theme'

export const getThemePreference = (): ThemePreference => {
  if (typeof window === 'undefined') {
    return 'system'
  }
  const value = window.localStorage.getItem(THEME_KEY)
  if (value === 'light' || value === 'dark' || value === 'system') {
    return value
  }
  return 'system'
}

export const setThemePreference = (value: ThemePreference): void => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(THEME_KEY, value)
}
