/**
 * Pantry Pack Command
 *
 * Detects package.json and creates a tarball of the package.
 * Usage: bun run pack.ts [directory]
 */

import { existsSync, readFileSync, statSync, readdirSync } from 'node:fs'
import { join, basename, relative } from 'node:path'
import { spawn } from 'node:child_process'

interface PackageJson {
  name: string
  version: string
  files?: string[]
  main?: string
  module?: string
  types?: string
  bin?: Record<string, string> | string
}

// Files/directories to always exclude
const DEFAULT_IGNORES = [
  'node_modules',
  '.git',
  '.DS_Store',
  '*.log',
  '.env',
  '.env.*',
  'dist',
  'coverage',
  '.nyc_output',
  '.cache',
  '.turbo',
  '.next',
  '.nuxt',
  '.output',
  'bun.lockb',
  'bun.lock',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
]

async function pack(targetDir: string = process.cwd()): Promise<string> {
  console.log('📦 Pantry Pack')
  console.log('='.repeat(40))
  console.log()

  // Check for package.json
  const packageJsonPath = join(targetDir, 'package.json')
  if (!existsSync(packageJsonPath)) {
    console.error('❌ No package.json found in', targetDir)
    console.error('   Run this command from a directory with a package.json file.')
    process.exit(1)
  }

  // Read package.json
  const packageJson: PackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

  if (!packageJson.name) {
    console.error('❌ package.json is missing "name" field')
    process.exit(1)
  }

  if (!packageJson.version) {
    console.error('❌ package.json is missing "version" field')
    process.exit(1)
  }

  // Sanitize package name for filename (replace @ and / with safe chars)
  const safeName = packageJson.name.replace('@', '').replace('/', '-')
  const tarballName = `${safeName}-${packageJson.version}.tgz`

  console.log(`📋 Package: ${packageJson.name}`)
  console.log(`📋 Version: ${packageJson.version}`)
  console.log(`📋 Output:  ${tarballName}`)
  console.log()

  // Collect files to include
  console.log('📂 Collecting files...')
  const filesToInclude = await collectFiles(targetDir, packageJson)

  console.log(`   Found ${filesToInclude.length} files to pack`)
  if (filesToInclude.length <= 10) {
    for (const file of filesToInclude) {
      console.log(`   - ${file}`)
    }
  } else {
    for (const file of filesToInclude.slice(0, 5)) {
      console.log(`   - ${file}`)
    }
    console.log(`   ... and ${filesToInclude.length - 5} more files`)
  }
  console.log()

  // Create tarball using tar command
  console.log('🗜️  Creating tarball...')
  const tarballPath = join(targetDir, tarballName)

  await createTarball(targetDir, tarballPath, filesToInclude)

  // Get tarball size
  const stats = statSync(tarballPath)
  const sizeKB = (stats.size / 1024).toFixed(2)

  console.log()
  console.log('✅ Package created successfully!')
  console.log(`   📦 ${tarballName} (${sizeKB} KB)`)
  console.log()

  // List tarball contents for verification
  console.log('📋 Tarball contents:')
  await listTarballContents(tarballPath)
  console.log()

  return tarballPath
}

function listTarballContents(tarballPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tar = spawn('tar', ['-tzf', tarballPath], { stdio: ['pipe', 'pipe', 'inherit'] })

    let output = ''
    tar.stdout?.on('data', (data) => {
      output += data.toString()
    })

    tar.on('close', (code) => {
      if (code === 0) {
        const files = output.trim().split('\n')
        for (const file of files.slice(0, 15)) {
          console.log(`   ${file}`)
        }
        if (files.length > 15) {
          console.log(`   ... and ${files.length - 15} more files`)
        }
        resolve()
      } else {
        reject(new Error(`tar list exited with code ${code}`))
      }
    })

    tar.on('error', reject)
  })
}

async function collectFiles(dir: string, packageJson: PackageJson): Promise<string[]> {
  const files: string[] = []

  // Always include package.json
  files.push('package.json')

  // If "files" field exists in package.json, use it (don't apply ignore rules)
  if (packageJson.files && packageJson.files.length > 0) {
    for (const pattern of packageJson.files) {
      const matches = await globFiles(dir, pattern, false) // skipIgnore = false means don't ignore
      files.push(...matches)
    }
  } else {
    // Otherwise, include all files except ignored ones
    const allFiles = await walkDir(dir, dir, true) // applyIgnore = true
    files.push(...allFiles)
  }

  // Always include bin files (npm standard behavior)
  if (packageJson.bin) {
    const binPaths = typeof packageJson.bin === 'string'
      ? [packageJson.bin]
      : Object.values(packageJson.bin)

    for (const binPath of binPaths) {
      // Normalize path (remove leading ./)
      const normalizedPath = binPath.replace(/^\.\//, '')
      if (existsSync(join(dir, normalizedPath)) && !files.includes(normalizedPath)) {
        files.push(normalizedPath)
        console.log(`   + Including bin: ${normalizedPath}`)
      }
    }
  }

  // Also include common important files if they exist
  const importantFiles = ['README.md', 'README', 'LICENSE', 'LICENSE.md', 'CHANGELOG.md']
  for (const file of importantFiles) {
    if (existsSync(join(dir, file)) && !files.includes(file)) {
      files.push(file)
    }
  }

  // Deduplicate
  return [...new Set(files)]
}

async function globFiles(baseDir: string, pattern: string, applyIgnore: boolean = true): Promise<string[]> {
  const fullPath = join(baseDir, pattern)

  // If it's a directory, include all files in it
  if (existsSync(fullPath) && statSync(fullPath).isDirectory()) {
    return walkDir(fullPath, baseDir, applyIgnore)
  }

  // If it's a file, include it directly
  if (existsSync(fullPath) && statSync(fullPath).isFile()) {
    return [pattern]
  }

  // TODO: Handle glob patterns like "dist/**"
  return []
}

async function walkDir(dir: string, baseDir: string, applyIgnore: boolean = true): Promise<string[]> {
  const files: string[] = []
  const entries = readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    const relativePath = relative(baseDir, fullPath)

    // Check if should be ignored (only if applyIgnore is true)
    if (applyIgnore && shouldIgnore(entry.name, relativePath)) {
      continue
    }

    if (entry.isDirectory()) {
      const subFiles = await walkDir(fullPath, baseDir, applyIgnore)
      files.push(...subFiles)
    } else if (entry.isFile()) {
      files.push(relativePath)
    }
  }

  return files
}

function shouldIgnore(name: string, relativePath: string): boolean {
  for (const pattern of DEFAULT_IGNORES) {
    // Exact match
    if (name === pattern || relativePath === pattern) {
      return true
    }
    // Wildcard match (simple)
    if (pattern.startsWith('*.') && name.endsWith(pattern.slice(1))) {
      return true
    }
    // Directory in path
    if (relativePath.includes(`/${pattern}/`) || relativePath.startsWith(`${pattern}/`)) {
      return true
    }
  }
  return false
}

function createTarball(baseDir: string, outputPath: string, files: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    // Use tar command to create gzipped tarball
    const args = [
      '-czf',
      outputPath,
      '-C',
      baseDir,
      ...files,
    ]

    const tar = spawn('tar', args, { stdio: 'inherit' })

    tar.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`tar exited with code ${code}`))
      }
    })

    tar.on('error', reject)
  })
}

// Run if called directly
const targetDir = process.argv[2] || process.cwd()
pack(targetDir).catch((err) => {
  console.error('Failed to pack:', err)
  process.exit(1)
})
