import type { PlantingConfig, PlantingFloor, PlantingGroup } from '../types'

const STORAGE_KEY = 'once-human-planting-configs-v1'

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`

const defaultLight = 50
const defaultIrrigation = 50

export const createPlantingGroup = (): PlantingGroup => ({
  id: createId(),
  plantId: null,
  light: defaultLight,
})

export const createPlantingFloor = (): PlantingFloor => ({
  id: createId(),
  irrigation: defaultIrrigation,
  groups: Array.from({ length: 4 }, () => createPlantingGroup()),
})

export const createPlantingConfig = (name: string): PlantingConfig => ({
  id: createId(),
  name,
  autoMode: false,
  floors: [],
})

export const loadPlantingConfigs = (): PlantingConfig[] => {
  if (typeof window === 'undefined') {
    return []
  }
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return []
  }
  try {
    const parsed = JSON.parse(raw) as PlantingConfig[]
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.map((config) => ({
      ...config,
      autoMode: Boolean(config.autoMode),
      floors: config.floors.map((floor) => ({
        ...floor,
        irrigation: floor.irrigation ?? defaultIrrigation,
        groups: floor.groups.length
          ? floor.groups.map((group) => ({
              ...group,
              light: group.light ?? defaultLight,
              plantId: group.plantId ?? null,
            }))
          : Array.from({ length: 4 }, () => createPlantingGroup()),
      })),
    }))
  } catch {
    return []
  }
}

export const savePlantingConfigs = (configs: PlantingConfig[]): void => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(configs))
}
