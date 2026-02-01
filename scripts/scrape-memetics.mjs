import { writeFile } from 'node:fs/promises'
import { setTimeout as delay } from 'node:timers/promises'

const API_ROOT = 'https://ohdex.gg/api/memetics/search'
const OUTPUT_PATH = new URL('../src/data/memetics.json', import.meta.url)

const fetchJson = async (url) => {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; MemeticsScraper/1.0)',
    },
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }
  return response.json()
}

const run = async () => {
  const results = []
  let page = 1
  let totalPages = 1
  let total = 0

  while (page <= totalPages) {
    const url = `${API_ROOT}?name=&category=&keyword=&page=${page}`
    const data = await fetchJson(url)
    totalPages = data.totalPages ?? 1
    total = data.total ?? total

    data.memetics.forEach((item) => {
      results.push(item)
    })

    page += 1
    await delay(120)
  }

  const deduped = new Map()
  results.forEach((item) => {
    const dedupeKey = item.memory_item_number !== '0' ? item.memory_item_number : item.id
    if (!deduped.has(dedupeKey)) {
      deduped.set(dedupeKey, item)
    }
  })

  const sorted = Array.from(deduped.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  )

  const payload = {
    version: '1.0.0',
    source: API_ROOT,
    generatedAt: new Date().toISOString(),
    memetics: sorted,
    total,
    totalPages,
  }

  await writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8')
  console.log(`Saved ${sorted.length} memetics to ${OUTPUT_PATH.pathname}`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
