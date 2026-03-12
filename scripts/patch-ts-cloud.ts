#!/usr/bin/env bun
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

// The @stacksjs/ts-cloud npm package ships dist/ with .d.ts types only (no .js
// runtime files). Since Bun imports .ts natively, we clone the source repo and
// symlink it so the ./src/ exports work. This replaces 7 duplicated CI steps.
const root = resolve(import.meta.dir, '..')
const tmpDir = resolve(root, '.cache', 'ts-cloud')
const srcPkg = resolve(tmpDir, 'packages', 'ts-cloud')

// Clone source if not already cached
if (!existsSync(resolve(srcPkg, 'package.json'))) {
  rmSync(tmpDir, { recursive: true, force: true })
  mkdirSync(resolve(root, '.cache'), { recursive: true })
  execSync(`git clone --depth 1 https://github.com/stacksjs/ts-cloud.git ${tmpDir}`, { stdio: 'inherit' })
  execSync('bun install', { cwd: tmpDir, stdio: 'inherit' })
}

// Patch exports: ./dist/ -> ./src/, .d.ts -> .ts, .js -> .ts
const pkgJsonPath = resolve(srcPkg, 'package.json')
if (existsSync(pkgJsonPath)) {
  const content = readFileSync(pkgJsonPath, 'utf-8')
    .replaceAll('"./dist/', '"./src/')
    .replaceAll('.d.ts"', '.ts"')
    .replaceAll('.js"', '.ts"')
  writeFileSync(pkgJsonPath, content)
}

// Symlink into all node_modules locations
const targets = [
  resolve(root, 'node_modules', '@stacksjs', 'ts-cloud'),
  resolve(root, 'packages', 'ts-pantry', 'node_modules', '@stacksjs', 'ts-cloud'),
]

for (const target of targets) {
  if (existsSync(target)) {
    rmSync(target, { recursive: true, force: true })
  }
  mkdirSync(resolve(target, '..'), { recursive: true })
  symlinkSync(srcPkg, target)
}

// ---- Patch @stacksjs/stx ----
// The npm version of stx doesn't include renderTemplate (added after 0.2.6).
// Clone source and symlink it, same approach as ts-cloud.
const stxTmpDir = resolve(root, '.cache', 'stx')
const stxSrcPkg = resolve(stxTmpDir, 'packages', 'stx')

if (!existsSync(resolve(stxSrcPkg, 'package.json'))) {
  rmSync(stxTmpDir, { recursive: true, force: true })
  mkdirSync(resolve(root, '.cache'), { recursive: true })
  execSync(`git clone --depth 1 https://github.com/stacksjs/stx.git ${stxTmpDir}`, { stdio: 'inherit' })
  execSync('bun install', { cwd: stxTmpDir, stdio: 'inherit' })
}

// Patch stx exports: ./dist/ -> ./src/, .d.ts -> .ts, .js -> .ts
const stxPkgJsonPath = resolve(stxSrcPkg, 'package.json')
if (existsSync(stxPkgJsonPath)) {
  const stxContent = readFileSync(stxPkgJsonPath, 'utf-8')
    .replaceAll('"./dist/', '"./src/')
    .replaceAll('.d.ts"', '.ts"')
    .replaceAll('.js"', '.ts"')
  writeFileSync(stxPkgJsonPath, stxContent)
}

// Symlink stx into node_modules
const stxTarget = resolve(root, 'node_modules', '@stacksjs', 'stx')
if (existsSync(stxTarget)) {
  rmSync(stxTarget, { recursive: true, force: true })
}
mkdirSync(resolve(stxTarget, '..'), { recursive: true })
symlinkSync(stxSrcPkg, stxTarget)
