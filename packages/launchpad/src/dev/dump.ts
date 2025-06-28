/* eslint-disable no-console */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { config } from '../config'
import { install, install_prefix } from '../install'
import sniff from './sniff'

export interface DumpOptions {
  dryrun?: boolean
  quiet?: boolean
  shellOutput?: boolean
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

    // Check if environment is already set up and packages are installed
    const isEnvironmentReady = fs.existsSync(envBinPath)
      && fs.readdirSync(envBinPath).length > 0

    // For shell output mode, if environment is ready, skip all the heavy work
    if (shellOutput && isEnvironmentReady) {
      // Output shell code to set up the environment
      console.log(`# Launchpad environment setup for ${dir}`)
      console.log(`if [[ -z "$LAUNCHPAD_ORIGINAL_PATH" ]]; then`)
      console.log(`  export LAUNCHPAD_ORIGINAL_PATH="$PATH"`)
      console.log(`fi`)
      console.log(`# Ensure we have basic system paths if LAUNCHPAD_ORIGINAL_PATH is empty`)
      console.log(`if [[ -z "$LAUNCHPAD_ORIGINAL_PATH" ]]; then`)
      console.log(`  export LAUNCHPAD_ORIGINAL_PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"`)
      console.log(`fi`)
      console.log(`export PATH="${envBinPath}:$LAUNCHPAD_ORIGINAL_PATH"`)
      console.log(`export LAUNCHPAD_ENV_BIN_PATH="${envBinPath}"`)
      console.log(`export LAUNCHPAD_PROJECT_DIR="${dir}"`)
      console.log(`export LAUNCHPAD_PROJECT_HASH="${projectHash}"`)
      return
    }

    // Sniff the packages from the directory containing the dependency file
    const projectDir = path.dirname(dependencyFile)
    const sniffResult = await sniff({ string: projectDir })
    const packages = sniffResult.pkgs.map(pkg => `${pkg.project}@${pkg.constraint.toString()}`)

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

    if (!isEnvironmentReady) {
      // Install packages to the main installation directory

      // Temporarily disable verbose output for shell mode to avoid control characters
      const originalVerbose = config.verbose
      if (shellOutput) {
        config.verbose = false
      }

      results = await install(packages, installPath)

      // Restore original verbose setting
      config.verbose = originalVerbose
    }
    else if (!quiet && !shellOutput) {
      console.log('📦 Using cached environment...')
    }

    // Ensure the environment directories exist
    if (!fs.existsSync(envBinPath)) {
      fs.mkdirSync(envBinPath, { recursive: true })
    }

    // Create symlinks for installed binaries in the project environment
    const mainBinPath = path.join(installPath, 'bin')
    if (fs.existsSync(mainBinPath)) {
      for (const _packageSpec of packages) {
        // Find all binaries for this package
        const pkgDir = path.join(installPath, 'pkgs')

        // Look for package metadata to find its binaries
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
                  const packageName = `${domain.name}@${version.name.slice(1)}` // Remove 'v' prefix

                  // Check if this is one of our requested packages
                  const isRequestedPackage = packages.some((reqPkg: string) => {
                    const [reqName] = reqPkg.split('@')
                    const [metaName] = packageName.split('@')
                    return reqName === metaName || reqPkg === packageName
                  })

                  if (isRequestedPackage && metadata.binaries && Array.isArray(metadata.binaries)) {
                    for (const binary of metadata.binaries) {
                      const sourcePath = path.join(mainBinPath, binary)
                      const targetPath = path.join(envBinPath, binary)

                      if (fs.existsSync(sourcePath)) {
                        // Remove existing symlink if it exists
                        if (fs.existsSync(targetPath)) {
                          fs.unlinkSync(targetPath)
                        }

                        // Create symlink
                        fs.symlinkSync(sourcePath, targetPath)

                        if (!quiet && !shellOutput) {
                          console.log(`  Linked ${binary} -> ${sourcePath}`)
                        }
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

    if (shellOutput) {
      // Output shell code to set up the environment
      console.log(`# Launchpad environment setup for ${dir}`)
      console.log(`if [[ -z "$LAUNCHPAD_ORIGINAL_PATH" ]]; then`)
      console.log(`  export LAUNCHPAD_ORIGINAL_PATH="$PATH"`)
      console.log(`fi`)
      console.log(`# Ensure we have basic system paths if LAUNCHPAD_ORIGINAL_PATH is empty`)
      console.log(`if [[ -z "$LAUNCHPAD_ORIGINAL_PATH" ]]; then`)
      console.log(`  export LAUNCHPAD_ORIGINAL_PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"`)
      console.log(`fi`)
      console.log(`export PATH="${envBinPath}:$LAUNCHPAD_ORIGINAL_PATH"`)
      console.log(`export LAUNCHPAD_ENV_BIN_PATH="${envBinPath}"`)
      console.log(`export LAUNCHPAD_PROJECT_DIR="${dir}"`)
      console.log(`export LAUNCHPAD_PROJECT_HASH="${projectHash}"`)
    }
    else {
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
      }
    }
  }
  catch (error) {
    if (!quiet && !shellOutput) {
      console.error('Failed to set up environment:', error instanceof Error ? error.message : String(error))
    }
    if (!shellOutput) {
      process.exit(1)
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
