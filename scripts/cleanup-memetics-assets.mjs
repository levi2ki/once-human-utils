import { readdir, unlink } from 'node:fs/promises'
import path from 'node:path'

const ASSETS_ROOT = new URL('../src/assets/', import.meta.url)

const run = async () => {
  const entries = await readdir(ASSETS_ROOT, { withFileTypes: true })
  const pngFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.png'))
    .map((entry) => entry.name)

  let removed = 0
  for (const fileName of pngFiles) {
    const filePath = new URL(path.join('./', fileName), ASSETS_ROOT)
    await unlink(filePath)
    removed += 1
  }

  console.log(`Removed ${removed} png files from src/assets`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
