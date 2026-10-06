import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')
const entry = resolve(dist, 'index.js')

await mkdir(dist, { recursive: true })
await copyFile(resolve(root, 'src/markdoc.css'), resolve(dist, 'markdoc.css'))

const source = await readFile(entry, 'utf8')
if (!source.startsWith('"use client"')) {
  await writeFile(entry, `"use client";\n${source}`)
}

// The `/server` entry must stay free of the client boundary so RSC and other
// server runtimes can call `createMarkdocConfig` without pulling in React.
const reactImport = /(?:from|require\()\s*['"]react(?:-dom)?(?:\/[^'"]*)?['"]/

async function assertServerSafe(file, seen = new Set()) {
  if (seen.has(file)) return
  seen.add(file)
  const code = await readFile(file, 'utf8')
  if (file.endsWith('server.js') && code.startsWith('"use client"')) {
    throw new Error('dist/server.js must not start with "use client"')
  }
  if (reactImport.test(code)) {
    throw new Error(`${file} must not import react or react-dom`)
  }
  for (const match of code.matchAll(/from\s*['"](\.[^'"]+)['"]/g)) {
    await assertServerSafe(resolve(dirname(file), match[1]), seen)
  }
}

await assertServerSafe(resolve(dist, 'server.js'))
