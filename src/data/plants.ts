import rawData from './plants.json'
import type { Plant } from '../types'

type PlantSource = {
  group: string
  name: string
  waterMin: number
  waterMax: number
  lightMin: number
  lightMax: number
}

type PlantCollection = {
  version: string
  plants: PlantSource[]
}

const data = rawData as PlantCollection

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

export const plants: Plant[] = data.plants.map((plant) => ({
  id: slugify(plant.name),
  name: plant.name,
  group: plant.group,
  waterMin: plant.waterMin,
  waterMax: plant.waterMax,
  lightMin: plant.lightMin,
  lightMax: plant.lightMax,
}))

export const plantOptions = plants.map((plant) => ({
  label: plant.name,
  value: plant.id,
}))

export const plantMap = new Map(plants.map((plant) => [plant.id, plant]))
