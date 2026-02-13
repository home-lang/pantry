#!/usr/bin/env bun
/**
 * Version bumping script with support for major, minor, and patch bumps
 *
 * Usage:
 *   bun run release          - patch bump (0.2.82 → 0.2.83)
 *   bun run release minor    - minor bump (0.2.82 → 0.3.0)
 *   bun run release major    - major bump (0.2.82 → 1.0.0)
 *   bun run release --version=0.3.0  - specific version
 *   bun run release --dry-run        - preview changes without applying
 */
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

interface PackageJson {
  name: string
  version: string
  [key: string]: any
}

function bumpVersion(currentVersion: string, bumpType: 'major' | 'minor' | 'patch' = 'patch'): string {
  const parts = currentVersion.split('.')
  if (parts.length !== 3) {
    throw new Error(`Invalid version format: ${currentVersion}`)
  }

  const [major, minor, patch] = parts.map(Number)
  if (Number.isNaN(major) || Number.isNaN(minor) || Number.isNaN(patch)) {
    throw new TypeError(`Invalid version format: ${currentVersion}`)
  }

  switch (bumpType) {
    case 'major':
      return `${major + 1}.0.0`
    case 'minor':
      return `${major}.${minor + 1}.0`
    case 'patch':
      return `${major}.${minor}.${patch + 1}`
    default:
      throw new Error(`Invalid bump type: ${bumpType}`)
  }
}

function isValidVersion(version: string): boolean {
  const parts = version.split('.')
  if (parts.length !== 3)
    return false
  return parts.every(part => !Number.isNaN(Number(part)) && Number(part) >= 0)
}

function execCommand(command: string): string {
  try {
    return execSync(command, { encoding: 'utf-8' }).trim()
  }
  catch (error) {
    console.error(`Failed to execute: ${command}`)
    throw error
  }
}

function main() {
  const packageJsonPath = path.join(process.cwd(), 'package.json')
  const isDryRun = process.argv.includes('--dry-run')

  // Parse command line arguments
  const args = process.argv.slice(2).filter(arg => !arg.startsWith('--'))
  const versionArg = process.argv.find(arg => arg.startsWith('--version='))?.split('=')[1]

  let bumpType: 'major' | 'minor' | 'patch' = 'patch'
  const specificVersion: string | undefined = versionArg

  // Check for bump type argument
  if (args.length > 0 && ['major', 'minor', 'patch'].includes(args[0])) {
    bumpType = args[0] as 'major' | 'minor' | 'patch'
  }

  console.log('🔍 Reading package.json...')

  // Read current package.json
  const packageJson: PackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
  const currentVersion = packageJson.version

  console.log(`📦 Current version: ${currentVersion}`)

  // Calculate new version
  let newVersion: string
  if (specificVersion) {
    if (!isValidVersion(specificVersion)) {
      throw new Error(`Invalid version format: ${specificVersion}`)
    }
    newVersion = specificVersion
    console.log(`🎯 Specific version: ${newVersion}`)
  }
  else {
    newVersion = bumpVersion(currentVersion, bumpType)
    console.log(`🚀 New ${bumpType} version: ${newVersion}`)
  }

  if (isDryRun) {
    console.log('🧪 Dry run mode - no changes will be made')
    return
  }

  // Update package.json
  packageJson.version = newVersion
  writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`)
  console.log('✅ Updated package.json')

  // Git operations
  console.log('📝 Committing changes...')
  execCommand('git add package.json')
  execCommand(`git commit -m "chore: release v${newVersion}"`)

  console.log('🏷️  Creating tag...')
  execCommand(`git tag v${newVersion}`)

  console.log('📤 Pushing changes and tag...')
  execCommand('git push origin main')
  execCommand(`git push origin v${newVersion}`)

  console.log(`🎉 Successfully released v${newVersion}!`)

  // Output for GitHub Actions
  if (process.env.GITHUB_ACTIONS) {
    // Use the new environment file method instead of deprecated ::set-output
    const githubOutput = process.env.GITHUB_OUTPUT
    if (githubOutput) {
      writeFileSync(githubOutput, `version=${newVersion}\ntag=v${newVersion}\n`, { flag: 'a' })
    }
  }
}

if (import.meta.main) {
  try {
    main()
  }
  catch (error) {
    console.error('❌ Release failed:', error)
    process.exit(1)
  }
}
