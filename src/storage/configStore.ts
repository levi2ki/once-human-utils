import type { Config, TechList, TechSlot, TechSlotStatus, TierGroup } from '../types'

const STORAGE_KEY = 'once-human-configs-v1'

const createEmptySlot = (): TechSlot => ({ perkId: null, status: null, wishId: null })

const emptyTiers = (): Record<TierGroup, Record<number, TechSlot>> => ({
  tier1: { 5: createEmptySlot(), 10: createEmptySlot(), 15: createEmptySlot() },
  tier2: {
    20: createEmptySlot(),
    25: createEmptySlot(),
    30: createEmptySlot(),
    35: createEmptySlot(),
  },
  tier3: { 40: createEmptySlot(), 45: createEmptySlot(), 50: createEmptySlot() },
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

const normalizeSlot = (value: unknown): TechSlot => {
  if (typeof value === 'string') {
    return { perkId: value, status: null, wishId: null }
  }
  if (!value || typeof value !== 'object') {
    return createEmptySlot()
  }
  const slot = value as Partial<TechSlot>
  const status =
    slot.status === 'HOLD' || slot.status === 'REPLACE' ? slot.status : null
  return {
    perkId: slot.perkId ?? null,
    status: status as TechSlotStatus | null,
    wishId: slot.wishId ?? null,
  }
}

const normalizeTierSlots = (
  source: Record<number, unknown> | undefined,
  base: Record<number, TechSlot>,
): Record<number, TechSlot> => {
  const next: Record<number, TechSlot> = { ...base }
  Object.keys(base).forEach((level) => {
    const key = Number(level)
    next[key] = normalizeSlot(source?.[key])
  })
  return next
}

const normalizeTiers = (
  tiers:
    | Record<TierGroup, Record<number, TechSlot | string | null>>
    | Record<TierGroup, string[]>
    | undefined,
): Record<TierGroup, Record<number, TechSlot>> => {
  const base = emptyTiers()
  if (!tiers) {
    return base
  }
  if (Array.isArray((tiers as Record<TierGroup, string[]>).tier1)) {
    return base
  }
  const typed = tiers as Record<TierGroup, Record<number, TechSlot | string | null>>
  return {
    tier1: normalizeTierSlots(typed.tier1, base.tier1),
    tier2: normalizeTierSlots(typed.tier2, base.tier2),
    tier3: normalizeTierSlots(typed.tier3, base.tier3),
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
