/* eslint-disable no-console */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { config } from '../config'
import { install, install_prefix } from '../install'

export interface DumpOptions {
  dryrun?: boolean
  quiet?: boolean
  shellOutput?: boolean
}

// Cache for environment readiness to avoid repeated filesystem calls
const envReadinessCache = new Map<string, { ready: boolean, timestamp: number, envDir?: string, sniffResult?: any }>()
const CACHE_TTL = 30000 // 30 seconds

function isEnvironmentReady(projectHash: string, envDir: string): { ready: boolean, sniffResult?: any } {
  const cacheKey = projectHash
  const cached = envReadinessCache.get(cacheKey)
  const now = Date.now()

  // Return cached result if still valid
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return { ready: cached.ready, sniffResult: cached.sniffResult }
  }

  // Check if environment has binaries
  const envBinPath = path.join(envDir, 'bin')
  const envSbinPath = path.join(envDir, 'sbin')

  const hasBinaries = (fs.existsSync(envBinPath) && fs.readdirSync(envBinPath).length > 0)
    || (fs.existsSync(envSbinPath) && fs.readdirSync(envSbinPath).length > 0)

  // Cache the result (sniffResult will be added later when first computed)
  envReadinessCache.set(cacheKey, {
    ready: hasBinaries,
    timestamp: now,
    envDir: hasBinaries ? envDir : undefined,
  })

  return { ready: hasBinaries }
}

function cacheSniffResult(projectHash: string, sniffResult: any): void {
  const cached = envReadinessCache.get(projectHash)
  if (cached) {
    cached.sniffResult = sniffResult
    cached.timestamp = Date.now() // Refresh timestamp
  }
}

export async function dump(dir: string, options: DumpOptions = {}): Promise<void> {
  const { dryrun = false, quiet = false, shellOutput = false } = options

  try {
    // Find dependency file
    const dependencyFile = findDependencyFile(dir)
    if (!dependencyFile) {
      if (!quiet && !shellOutput) {
        console.log('No dependency file found')
      }
      return
    }

    // Set up project-specific environment
    const projectHash = generateProjectHash(dir)
    const envDir = path.join(process.env.HOME || '', '.local', 'share', 'launchpad', projectHash)
    const envBinPath = path.join(envDir, 'bin')
    const envSbinPath = path.join(envDir, 'sbin')

    // Fast environment readiness check using cache
    const { ready: isReady } = isEnvironmentReady(projectHash, envDir)

    // For shell output mode with ready environment, output immediately without sniff
    if (shellOutput && isReady) {
      // For shell mode with ready environments, skip sniff entirely for maximum speed
      // The environment is already set up, we just need to output the shell code
      outputShellCode(dir, envBinPath, envSbinPath, projectHash, null)
      return
    }

    // Continue with normal flow for non-shell mode or when environment isn't ready
    const projectDir = path.dirname(dependencyFile)
    const { default: sniff } = await import('./sniff')
    const sniffResult = await sniff({ string: projectDir })

    // Cache the sniff result for future fast-path usage
    cacheSniffResult(projectHash, sniffResult)

    const packages = sniffResult.pkgs.map((pkg: any) => `${pkg.project}@${pkg.constraint.toString()}`)

    if (packages.length === 0) {
      if (!quiet && !shellOutput) {
        console.log('No packages found in dependency file')
      }
      return
    }

    if (!quiet && !shellOutput) {
      console.log(`Found dependency file: ${dependencyFile}`)
      console.log(`Packages: ${packages.join(', ')}`)
    }

    if (dryrun) {
      if (!quiet && !shellOutput) {
        console.log('Dry run - would install:', packages.join(', '))
      }
      return
    }

    const installPath = install_prefix().string
    let results: string[] = []
    let installationSucceeded = false

    if (!isReady) {
      // Install packages to the main installation directory
      const originalVerbose = config.verbose
      const originalShowShellMessages = config.showShellMessages

      if (shellOutput) {
        config.showShellMessages = false
        const originalConsoleLog = console.log
        const originalConsoleWarn = console.warn

        console.log = (...args) => {
          process.stderr.write(`${args.join(' ')}\n`)
        }
        console.warn = (...args) => {
          process.stderr.write(`${args.join(' ')}\n`)
        }

        try {
          results = await install(packages, installPath)
          installationSucceeded = true
        }
        catch (error) {
          installationSucceeded = false
          // For shell mode, output error to stderr and don't throw
          process.stderr.write(`Failed to install packages: ${error instanceof Error ? error.message : String(error)}\n`)
        }
        finally {
          console.log = originalConsoleLog
          console.warn = originalConsoleWarn
        }
      }
      else {
        try {
          results = await install(packages, installPath)
          installationSucceeded = true
        }
        catch (error) {
          installationSucceeded = false
          throw error // Re-throw for non-shell mode
        }
      }

      config.verbose = originalVerbose
      config.showShellMessages = originalShowShellMessages
    }
    else if (!quiet && !shellOutput) {
      console.log('📦 Using cached environment...')
      installationSucceeded = true
    }

    // Set up environment directories and symlinks only if installation succeeded
    if (installationSucceeded || isReady) {
      await setupEnvironmentDirectories(envDir, envBinPath, envSbinPath, packages, installPath)
    }

    // Output results
    if (shellOutput) {
      // For shell mode, always output shell code (even if installation failed)
      // This ensures the shell gets proper environment setup
      outputShellCode(dir, envBinPath, envSbinPath, projectHash, sniffResult)
    }
    else {
      outputNormalResults(results, packages, envDir, sniffResult, quiet)
    }
  }
  catch (error) {
    if (!quiet && !shellOutput) {
      console.error('Failed to set up environment:', error instanceof Error ? error.message : String(error))
    }
    const isTestEnvironment = process.env.NODE_ENV === 'test' || process.argv.some(arg => arg.includes('test'))
    if (!shellOutput && !isTestEnvironment) {
      process.exit(1)
    }
    if (isTestEnvironment) {
      throw error
    }
  }
}

async function setupEnvironmentDirectories(envDir: string, envBinPath: string, envSbinPath: string, packages: string[], installPath: string): Promise<void> {
  // Ensure the environment directories exist
  if (!fs.existsSync(envBinPath)) {
    fs.mkdirSync(envBinPath, { recursive: true })
  }
  if (!fs.existsSync(envSbinPath)) {
    fs.mkdirSync(envSbinPath, { recursive: true })
  }

  // Create symlinks for installed binaries in the project environment
  const mainBinPath = path.join(installPath, 'bin')
  const mainSbinPath = path.join(installPath, 'sbin')

  const binaryDirs = [
    { sourcePath: mainBinPath, targetPath: envBinPath },
    { sourcePath: mainSbinPath, targetPath: envSbinPath },
  ]

  for (const { sourcePath: mainPath, targetPath: envPath } of binaryDirs) {
    if (fs.existsSync(mainPath)) {
      for (const _packageSpec of packages) {
        const pkgDir = path.join(installPath, 'pkgs')

        try {
          const domains = fs.readdirSync(pkgDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())

          for (const domain of domains) {
            const domainPath = path.join(pkgDir, domain.name)
            const versions = fs.readdirSync(domainPath, { withFileTypes: true })
              .filter(dirent => dirent.isDirectory())

            for (const version of versions) {
              const versionPath = path.join(domainPath, version.name)
              const metadataPath = path.join(versionPath, 'metadata.json')

              if (fs.existsSync(metadataPath)) {
                try {
                  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))
                  const packageName = `${domain.name}@${version.name.slice(1)}`

                  const isRequestedPackage = packages.some((reqPkg: string) => {
                    const [reqName] = reqPkg.split('@')
                    const [metaName] = packageName.split('@')
                    return reqName === metaName || reqPkg === packageName
                  })

                  if (isRequestedPackage && metadata.binaries && Array.isArray(metadata.binaries)) {
                    for (const binary of metadata.binaries) {
                      const sourcePath = path.join(mainPath, binary)
                      const targetPath = path.join(envPath, binary)

                      if (fs.existsSync(sourcePath)) {
                        if (fs.existsSync(targetPath)) {
                          fs.unlinkSync(targetPath)
                        }
                        fs.symlinkSync(sourcePath, targetPath)
                      }
                    }
                  }
                }
                catch {
                  // Ignore invalid metadata files
                }
              }
            }
          }
        }
        catch {
          // Ignore errors reading package directory
        }
      }
    }
  }
}

function outputShellCode(dir: string, envBinPath: string, envSbinPath: string, projectHash: string, sniffResult?: any): void {
  console.log(`# Launchpad environment setup for ${dir}`)
  console.log(`if [[ -z "$LAUNCHPAD_ORIGINAL_PATH" ]]; then`)
  console.log(`  export LAUNCHPAD_ORIGINAL_PATH="$PATH"`)
  console.log(`fi`)
  console.log(`# Ensure we have basic system paths if LAUNCHPAD_ORIGINAL_PATH is empty`)
  console.log(`if [[ -z "$LAUNCHPAD_ORIGINAL_PATH" ]]; then`)
  console.log(`  export LAUNCHPAD_ORIGINAL_PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"`)
  console.log(`fi`)
  console.log(`export PATH="${envBinPath}:${envSbinPath}:$LAUNCHPAD_ORIGINAL_PATH"`)
  console.log(`export LAUNCHPAD_ENV_BIN_PATH="${envBinPath}"`)
  console.log(`export LAUNCHPAD_PROJECT_DIR="${dir}"`)
  console.log(`export LAUNCHPAD_PROJECT_HASH="${projectHash}"`)

  // Export environment variables from the dependency file
  if (sniffResult && sniffResult.env) {
    for (const [key, value] of Object.entries(sniffResult.env)) {
      console.log(`export ${key}=${value}`)
    }
  }
}

function outputNormalResults(results: string[], packages: string[], envDir: string, sniffResult: any, quiet: boolean): void {
  if (!quiet) {
    if (results.length > 0) {
      console.log(`✅ Successfully set up environment with ${packages.length} packages`)
      console.log(`Environment directory: ${envDir}`)
      console.log(`Installed ${results.length} binaries:`)
      results.forEach((file) => {
        console.log(`  ${file}`)
      })
    }
    else {
      console.log('⚠️  No binaries were installed')
    }

    const envVars = Object.entries(sniffResult.env)
    if (envVars.length > 0) {
      console.log(`Environment variables:`)
      envVars.forEach(([key, value]) => {
        console.log(`  ${key}=${value}`)
      })
    }
  }
}

function findDependencyFile(dir: string): string | null {
  const possibleFiles = [
    'dependencies.yaml',
    'dependencies.yml',
    'deps.yaml',
    'deps.yml',
    'pkgx.yaml',
    'pkgx.yml',
    'launchpad.yaml',
    'launchpad.yml',
  ]

  let currentDir = dir
  while (currentDir !== '/') {
    for (const file of possibleFiles) {
      const fullPath = path.join(currentDir, file)
      if (fs.existsSync(fullPath)) {
        return fullPath
      }
    }
    currentDir = path.dirname(currentDir)
  }

  return null
}

function generateProjectHash(projectPath: string): string {
  // Generate a simple hash based on the project path
  const hash = crypto.createHash('md5').update(projectPath).digest('hex')
  const projectName = path.basename(projectPath)
  return `${projectName}_${hash.slice(0, 8)}`
}
