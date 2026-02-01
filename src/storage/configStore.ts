import type { Config, TechList, TierGroup } from '../types'

const STORAGE_KEY = 'once-human-configs-v1'

const emptyTiers = (): Record<TierGroup, Record<number, string | null>> => ({
  tier1: { 5: null, 10: null, 15: null },
  tier2: { 20: null, 25: null, 30: null, 35: null },
  tier3: { 40: null, 45: null, 50: null },
})

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`

export const createConfig = (name: string): Config => ({
  id: createId(),
  name,
  scenario: null,
  lists: [],
})

export const createTechList = (name: string): TechList => ({
  id: createId(),
  name,
  tiers: emptyTiers(),
})

const normalizeTiers = (
  tiers: Record<TierGroup, Record<number, string | null>> | Record<TierGroup, string[]> | undefined,
): Record<TierGroup, Record<number, string | null>> => {
  const base = emptyTiers()
  if (!tiers) {
    return base
  }
  if (Array.isArray((tiers as Record<TierGroup, string[]>).tier1)) {
    return base
  }
  const typed = tiers as Record<TierGroup, Record<number, string | null>>
  return {
    tier1: { ...base.tier1, ...typed.tier1 },
    tier2: { ...base.tier2, ...typed.tier2 },
    tier3: { ...base.tier3, ...typed.tier3 },
  }
}

export const loadConfigs = (): Config[] => {
  if (typeof window === 'undefined') {
    return []
  }
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return []
  }
  try {
    const parsed = JSON.parse(raw) as Config[]
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.map((config) => ({
      ...config,
      scenario: config.scenario ?? null,
      lists: config.lists.map((list) => ({
        ...list,
        tiers: normalizeTiers(list.tiers),
      })),
    }))
  } catch {
    return []
  }
}

export const saveConfigs = (configs: Config[]): void => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(configs))
}
