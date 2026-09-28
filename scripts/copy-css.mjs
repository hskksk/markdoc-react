import { copyFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const target = resolve(root, 'dist/markdoc.css')

await mkdir(dirname(target), { recursive: true })
await copyFile(resolve(root, 'src/markdoc.css'), target)
