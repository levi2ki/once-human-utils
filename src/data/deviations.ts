import raw from './deviations.json'
import type { Deviation } from '../types'

const creatureImages = import.meta.glob('../assets/creatures/*', {
  eager: true,
  import: 'default',
}) as Record<string, string>

function getCreatureIcon(filename?: string | null): string {
  if (!filename) return ''
  const key = `../assets/creatures/${filename}`
  return creatureImages[key] ?? ''
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
}

type DeviationSource = {
  category: 'animals' | 'furniture'
  trait: string
  animal: string | null
  item: string | null
  icon?: string | null
  combatEffect: string
  craftingEffect: string
}

const deviations: Deviation[] = (raw.deviations as DeviationSource[]).map(
  (d) => ({
    id: `${d.category}-${slugify(d.trait)}-${slugify(d.animal ?? d.item ?? '')}`,
    category: d.category,
    trait: d.trait,
    animal: d.animal ?? null,
    item: d.item ?? null,
    combatEffect: d.combatEffect,
    craftingEffect: d.craftingEffect,
    icon: getCreatureIcon(d.icon) || undefined,
  }),
)

export const animals = deviations.filter((d) => d.category === 'animals')
export const furniture = deviations.filter((d) => d.category === 'furniture')
export const deviationsById = new Map(deviations.map((d) => [d.id, d]))
