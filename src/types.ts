export type TierGroup = 'tier1' | 'tier2' | 'tier3'

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
  tiers: Record<TierGroup, Record<number, string | null>>
}

export type Config = {
  id: string
  name: string
  scenario: string | null
  lists: TechList[]
}
