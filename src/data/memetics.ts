import rawData from './memetics.json'
import type { Memetic, MemeticApiItem, MemeticsData, TierGroup } from '../types'
import { memeticRatings } from './memeticsRatings'

const data = rawData as MemeticsData

const memeticImages = import.meta.glob('../assets/memetics/*', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const mapTierGroup = (levelGroup: number): TierGroup => {
  if (levelGroup === 1) return 'tier1'
  if (levelGroup === 2) return 'tier2'
  return 'tier3'
}

const getLocalIcon = (fileName?: string): string => {
  if (!fileName) return ''
  const key = `../assets/memetics/${fileName}`
  return memeticImages[key] ?? ''
}

export const memetics: Memetic[] = data.memetics.map((item) => {
  if ('memory_item_number' in item) {
    const apiItem = item as MemeticApiItem
    const id =
      apiItem.memory_item_number !== '0' ? apiItem.memory_item_number : apiItem.id
    return {
      id,
      name: apiItem.name,
      description: apiItem.effect_description,
      tierGroup: apiItem.tierGroup ?? mapTierGroup(apiItem.level_group),
      icon: apiItem.icon ?? getLocalIcon(apiItem.imgUrl),
      sourceUrl: apiItem.sourceUrl ?? '',
      identity: apiItem.identity,
      effectCategory: apiItem.effect_category,
      levels: apiItem.levels,
      effectTitle: apiItem.effect_title,
      scenarios: apiItem.scenarios,
      rating: memeticRatings[id] ?? apiItem.rating,
    }
  }

  return item as Memetic
})
export const memeticsTotal = data.total ?? data.memetics.length
export const memeticsTotalPages = data.totalPages ?? 1
export const memeticsVersion = data.version ?? '1.0.0'
export const memeticsSource = data.source ?? ''
export const memeticsGeneratedAt = data.generatedAt ?? ''

export const tierLabels: Record<TierGroup, string> = {
  tier1: 'Lv. 5 / 10 / 15',
  tier2: 'Lv. 20 / 25 / 30 / 35',
  tier3: 'Lv. 40 / 45 / 50',
}

export const getMemeticById = (id: string): Memetic | undefined =>
  memetics.find((item) => item.id === id)
