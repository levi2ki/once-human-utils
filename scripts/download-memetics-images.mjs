import { readFile, mkdir, writeFile, stat } from 'node:fs/promises'
import path from 'node:path'

const IMAGE_ROOT = 'https://ohdex.gg/_next/image?url=%2Fassets%2F'
const DATA_PATH = new URL('../src/data/memetics.json', import.meta.url)
const ASSETS_ROOT = new URL('../src/assets/', import.meta.url)
const OUTPUT_DIR = new URL('../src/assets/memetics/', import.meta.url)
const TARGET_WIDTH = 828

const fileExists = async (filePath) => {
  try {
    const info = await stat(filePath)
    return info.size > 0
  } catch {
    return false
  }
}

const fetchBinary = async (url) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }
  return response.arrayBuffer()
}

const run = async () => {
  const raw = await readFile(DATA_PATH, 'utf-8')
  const data = JSON.parse(raw)
  const memetics = data.memetics ?? []

  await mkdir(OUTPUT_DIR, { recursive: true })

  const seen = new Set()
  let downloaded = 0
  let skipped = 0
  const skippedMissing = []
  const skippedDuplicate = []
  const skippedExisting = []

  for (const item of memetics) {
    const fileName = item.imgUrl
    if (!fileName) {
      skipped += 1
      skippedMissing.push(item.name ?? 'unknown')
      continue
    }
    if (seen.has(fileName)) {
      skipped += 1
      skippedDuplicate.push(fileName)
      continue
    }
    seen.add(fileName)

    const targetPath = new URL(path.join('./', fileName), OUTPUT_DIR)
    const legacyPath = new URL(path.join('./', fileName), ASSETS_ROOT)
    if (await fileExists(legacyPath)) {
      await mkdir(OUTPUT_DIR, { recursive: true })
      await writeFile(
        targetPath,
        await readFile(legacyPath),
      )
    }
    if (await fileExists(targetPath)) {
      skipped += 1
      skippedExisting.push(fileName)
      continue
    }

    const url = `${IMAGE_ROOT}${encodeURIComponent(fileName)}&w=${TARGET_WIDTH}&q=100`
    const buffer = await fetchBinary(url)
    await writeFile(targetPath, Buffer.from(buffer))
    downloaded += 1
  }

  console.log(
    `Images downloaded: ${downloaded}, skipped: ${skipped}, total unique: ${seen.size}`,
  )
  console.log(
    `Skipped missing: ${skippedMissing.length}, duplicate: ${skippedDuplicate.length}, existing: ${skippedExisting.length}`,
  )
  if (skippedMissing.length) {
    console.log('Missing imgUrl:', skippedMissing)
  }
  if (skippedDuplicate.length) {
    console.log('Duplicate imgUrl:', skippedDuplicate)
  }
  if (skippedExisting.length) {
    console.log('Already exists:', skippedExisting)
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
