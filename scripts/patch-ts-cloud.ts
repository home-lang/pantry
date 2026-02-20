#!/usr/bin/env bun
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

// The @stacksjs/ts-cloud npm package ships dist/ with .d.ts types only (no .js),
// but also ships src/ with full .ts source. Since Bun imports .ts natively,
// rewrite exports to point at ./src/ instead of ./dist/.
const locations = [
  resolve(import.meta.dir, '..', 'node_modules', '@stacksjs', 'ts-cloud', 'package.json'),
  resolve(import.meta.dir, '..', 'packages', 'ts-pantry', 'node_modules', '@stacksjs', 'ts-cloud', 'package.json'),
]

for (const pkgPath of locations) {
  if (existsSync(pkgPath)) {
    const content = readFileSync(pkgPath, 'utf-8')
      .replaceAll('"./dist/', '"./src/')
      .replaceAll('.d.ts"', '.ts"')
      .replaceAll('.js"', '.ts"')
    writeFileSync(pkgPath, content)
  }
}
