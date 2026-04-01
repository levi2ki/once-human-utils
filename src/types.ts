export type TierGroup = 'tier1' | 'tier2' | 'tier3'

export type MemeticRating = 'SS' | 'S' | 'A' | 'B' | 'C'

export type Memetic = {
  id: string
  name: string
  description: string
  tierGroup: TierGroup
  icon: string
  sourceUrl: string
  identity?: string
  effectCategory?: string
  levels?: number[]
  effectTitle?: string
  scenarios?: string[]
  rating?: MemeticRating
}

export type MemeticApiItem = {
  memory_item_number: string
  name: string
  identity: string
  effect_category: string
  level_group: number
  levels: number[]
  effect_title: string
  effect_description: string
  scenarios: string[]
  imgUrl: string
  id: string
  tierGroup?: TierGroup
  icon?: string
  sourceUrl?: string
  rating?: MemeticRating
}

export type MemeticsData = {
  version?: string
  source?: string
  generatedAt?: string
  memetics: MemeticSourceItem[]
  total?: number
  totalPages?: number
}

export type MemeticSourceItem = Memetic | MemeticApiItem

export type TechList = {
  id: string
  name: string
  tiers: Record<TierGroup, Record<number, TechSlot>>
}

export type Config = {
  id: string
  name: string
  scenario: string | null
  lists: TechList[]
}

export type TechSlotStatus = 'HOLD' | 'REPLACE'

export type TechSlot = {
  perkId: string | null
  status: TechSlotStatus | null
  wishId: string | null
}

export type Plant = {
  id: string
  name: string
  group: string
  waterMin: number
  waterMax: number
  lightMin: number
  lightMax: number
}

export type PlantingGroup = {
  id: string
  plantId: string | null
  light: number
}

export type PlantingFloor = {
  id: string
  irrigation: number
  groups: PlantingGroup[]
}

export type PlantingConfig = {
  id: string
  name: string
  autoMode: boolean
  floors: PlantingFloor[]
}

export type DeviationCategory = 'animals' | 'furniture'

export type Deviation = {
  id: string
  category: DeviationCategory
  trait: string
  animal: string | null
  item: string | null
  combatEffect: string
  craftingEffect: string
  icon?: string
}
