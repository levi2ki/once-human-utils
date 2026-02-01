const STORAGE_KEY = 'once-human-fusing-v1'

export type FusingUiState = {
  expandedSections: ('animals' | 'furniture')[]
}

const defaultState: FusingUiState = {
  expandedSections: ['animals', 'furniture'],
}

export const loadFusingUiState = (): FusingUiState => {
  if (typeof window === 'undefined') return defaultState
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    const parsed = JSON.parse(raw) as Partial<FusingUiState>
    return {
      expandedSections:
        Array.isArray(parsed.expandedSections) &&
        parsed.expandedSections.every(
          (s) => s === 'animals' || s === 'furniture',
        )
          ? parsed.expandedSections
          : defaultState.expandedSections,
    }
  } catch {
    return defaultState
  }
}

export const saveFusingUiState = (state: FusingUiState): void => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
