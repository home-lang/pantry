/* eslint-disable no-console */
import type { Command } from '../cli/types'
import fs from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { config, defaultConfig } from '../config'
import { install, installDependenciesOnly } from '../install'
import { createGlobalBinarySymlinks } from '../install-helpers'

function parseArgs(argv: string[]): { pkgs: string[], opts: Record<string, string | boolean> } {
  const opts: Record<string, string | boolean> = {}
  const pkgs: string[] = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '-g') {
      opts.global = true
      continue
    }
    if (a === '-v') {
      opts.verbose = true
      continue
    }
    if (a.startsWith('--')) {
      const [k, v] = a.split('=')
      const key = k.replace(/^--/, '')
      if (typeof v !== 'undefined') {
        opts[key] = v
      }
      else if (i + 1 < argv.length && !argv[i + 1].startsWith('-')) {
        i += 1
        opts[key] = argv[i]
      }
      else {
        opts[key] = true
      }
    }
    else {
      pkgs.push(a)
    }
  }
  return { pkgs, opts }
}

async function isDirectory(p: string): Promise<boolean> {
  try {
    const st = await fs.promises.stat(p)
    return st.isDirectory()
  }
  catch { return false }
}

async function setupDevelopmentEnvironment(targetDir: string, options: { dryRun?: boolean, quiet?: boolean, shell?: boolean }) {
  const isShellIntegration = options?.shell || false
  if (isShellIntegration)
    process.env.LAUNCHPAD_SHELL_INTEGRATION = '1'
  const { dump } = await import('../dev/dump')
  await dump(targetDir, {
    dryrun: options?.dryRun || false,
    quiet: options?.quiet || isShellIntegration,
    shellOutput: isShellIntegration,
    skipGlobal: process.env.NODE_ENV === 'test' || process.env.LAUNCHPAD_SKIP_GLOBAL_AUTO_SCAN === 'true',
  })
}

function triggerShellGlobalRefresh(): void {
  try {
    const refreshDir = path.join(homedir(), '.cache', 'launchpad', 'shell_cache')
    fs.mkdirSync(refreshDir, { recursive: true })
    const marker = path.join(refreshDir, 'global_refresh_needed')
    fs.writeFileSync(marker, '')
  }
  catch {}
}

async function ensureShellIntegrationInstalled(): Promise<void> {
  try {
    const home = homedir()
    const zshrc = path.join(process.env.ZDOTDIR || home, '.zshrc')
    const bashrc = path.join(home, '.bashrc')
    const bashProfile = path.join(home, '.bash_profile')
    const needle1 = 'launchpad dev:shellcode'
    const needle2 = 'LAUNCHPAD_SHELL_INTEGRATION=1'
    const files = [zshrc, bashrc, bashProfile].filter(f => fs.existsSync(f))
    let found = false
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8')
      if (content.includes(needle1) || content.includes(needle2)) {
        found = true
        break
      }
    }
    if (!found) {
      const { default: integrate } = await import('../dev/integrate')
      await integrate('install', { dryrun: false })
    }
  }
  catch {}
}

async function installPackagesGlobally(packages: string[], options: { verbose?: boolean, quiet?: boolean, noInteractive?: boolean }) {
  const { install } = await import('../install-main')
  const globalEnvDir = path.join(homedir(), '.local', 'share', 'launchpad', 'global')
  if (!options.quiet)
    console.log(`Installing ${packages.length} package${packages.length === 1 ? '' : 's'} globally...`)

  const prevBuildDepsEnv = process.env.LAUNCHPAD_INSTALL_BUILD_DEPS
  const explicitlyRequested = prevBuildDepsEnv === '1'
  if (!explicitlyRequested) {
    process.env.LAUNCHPAD_INSTALL_BUILD_DEPS = '0'
    if (options.verbose)
      console.log('ℹ️  Global install: build-time dependency installation is disabled (set LAUNCHPAD_INSTALL_BUILD_DEPS=1 to enable)')
  }

  const results = await install(packages, globalEnvDir)
  if (!explicitlyRequested) {
    if (prevBuildDepsEnv === undefined)
      delete process.env.LAUNCHPAD_INSTALL_BUILD_DEPS
    else process.env.LAUNCHPAD_INSTALL_BUILD_DEPS = prevBuildDepsEnv
  }

  await createGlobalBinarySymlinks(globalEnvDir)
  if (!options.quiet && !options.noInteractive) {
    await ensureShellIntegrationInstalled()
    triggerShellGlobalRefresh()
  }

  if (!options.quiet) {
    if (results.length > 0) {
      console.log(`🎉 Successfully installed ${packages.join(', ')} globally (${results.length} ${results.length === 1 ? 'binary' : 'binaries'})`)
      results.forEach(f => console.log(`  ${f}`))
    }
    else {
      console.log('✅ All specified packages were already installed globally')
    }
  }
}

async function installGlobalDependencies(options: { dryRun?: boolean, quiet?: boolean, verbose?: boolean, noInteractive?: boolean }) {
  if (!options.quiet)
    console.log('🔍 Scanning machine for dependency files...')

  const overallStartTime = Date.now()
  const globalDepFileNames = ['deps.yaml', 'deps.yml', 'dependencies.yaml', 'dependencies.yml']
  const locations = [
    homedir(),
    path.join(homedir(), '.dotfiles'),
    path.join(homedir(), '.config'),
    path.join(homedir(), 'Projects'),
    path.join(homedir(), 'Code'),
    path.join(homedir(), 'Development'),
    path.join(homedir(), 'dev'),
    path.join(homedir(), 'workspace'),
    path.join(homedir(), 'src'),
    path.join(homedir(), 'Desktop'),
    '/opt',
    '/usr/local',
  ]

  const dependencyPatterns = globalDepFileNames.map(n => `**/${n}`)
  const foundFiles: string[] = []
  const allPackages = new Set<string>()

  for (const location of locations) {
    if (!fs.existsSync(location))
      continue
    try {
      if (options.verbose)
        console.log(`🔍 Scanning ${location}...`)
      const locationStart = Date.now()

      const isHomeDir = location === homedir()
      const isCodeDir = location.includes('/Code') || location.includes('/Projects') || location.includes('/Development')

      for (const pattern of dependencyPatterns) {
        let fileCount = 0
        const startTime = Date.now()
        const maxScanTime = isHomeDir ? 1000 : (isCodeDir ? 5000 : 2000)
        const fileName = pattern.replace('**/', '')

        if (isHomeDir) {
          try {
            const entries = await fs.promises.readdir(location)
            for (const entry of entries) {
              if (entry === fileName) {
                foundFiles.push(path.join(location, entry))
                fileCount++
              }
            }
          }
          catch {}
        }
        else {
          async function scanDir(dir: string, depth: number = 0): Promise<void> {
            if (Date.now() - startTime > maxScanTime || fileCount >= 100 || depth > 6)
              return
            try {
              const entries = await fs.promises.readdir(dir, { withFileTypes: true })
              for (const entry of entries) {
                if (Date.now() - startTime > maxScanTime || fileCount >= 100)
                  break
                const fullPath = path.join(dir, entry.name)
                if (entry.isFile() && entry.name === fileName) {
                  foundFiles.push(fullPath)
                  fileCount++
                }
                else if (entry.isDirectory()) {
                  const skip = [
                    'node_modules',
                    'vendor',
                    '.git',
                    '.svn',
                    '.hg',
                    'dist',
                    'build',
                    'target',
                    'out',
                    'tmp',
                    'temp',
                    'cache',
                    '.cache',
                    '.npm',
                    '.yarn',
                    '.pnpm',
                    '.bun',
                    'logs',
                    'coverage',
                    '.nyc_output',
                    '.pytest_cache',
                    '__pycache__',
                    '.venv',
                    'venv',
                    'env',
                    '.env',
                    'virtualenv',
                    '.next',
                    '.nuxt',
                    '.output',
                    'public',
                    'static',
                    'assets',
                    'uploads',
                    'storage',
                    'backups',
                    'dumps',
                    'migrations',
                    'seeds',
                    'test-results',
                    'playwright-report',
                    '.playwright',
                    '.vscode',
                    '.idea',
                    'docs',
                    'documentation',
                    'examples',
                    'demo',
                    'demos',
                    'samples',
                    'test',
                    'tests',
                    '__tests__',
                    'test-envs',
                    'test-environments',
                    'spec',
                    'cypress',
                    'e2e',
                    '.turbo',
                    '.vercel',
                    '.netlify',
                    '.github',
                    '.gitlab',
                    '.bitbucket',
                  ].includes(entry.name)
                  if (!skip)
                    await scanDir(fullPath, depth + 1)
                }
              }
            }
            catch {}
          }
          await scanDir(location)
        }
        if (options.verbose && fileCount > 0)
          console.log(`  ✓ Found ${fileCount} files matching ${pattern} in ${location} (${Date.now() - startTime}ms)`)
      }
      const time = Date.now() - locationStart
      if (options.verbose || time > 1000)
        console.log(`📍 Completed ${location} in ${time}ms`)
    }
    catch (error) {
      if (options.verbose)
        console.warn(`Failed to scan ${location}: ${error instanceof Error ? error.message : String(error)}`)
      continue
    }
  }

  const overallTime = Date.now() - overallStartTime
  if (!options.quiet)
    console.log(`📁 Found ${foundFiles.length} dependency files in ${overallTime}ms`)

  const { default: sniff } = await import('../dev/sniff')
  for (const file of foundFiles) {
    try {
      const dir = path.dirname(file)
      const sniffResult = await sniff({ string: dir })
      const globalPkgs = sniffResult.pkgs.filter(p => p.global)
      for (const pkg of globalPkgs) allPackages.add(pkg.project)
      if (options.verbose) {
        const skipped = sniffResult.pkgs.length - globalPkgs.length
        console.log(`  📄 ${file}: ${globalPkgs.length} global package(s)${skipped > 0 ? `, skipped ${skipped} local` : ''}`)
      }
    }
    catch (error) {
      if (options.verbose)
        console.warn(`Failed to parse ${file}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const fakePackagePatterns = ['fake.com', 'nonexistent.org', 'test.com', 'example.com', 'localhost', 'invalid.domain', 'mock.test', 'dummy.pkg']
  let filteredPackages = Array.from(allPackages).filter((pkg) => {
    const packageName = pkg.split('@')[0].toLowerCase()
    const isFake = fakePackagePatterns.some(pattern => packageName.includes(pattern) || packageName === pattern)
    if (isFake && options.verbose)
      console.log(`🚫 Skipping fake/test package: ${pkg}`)
    return !isFake
  })

  if (!options.quiet) {
    console.log(`📦 Found ${filteredPackages.length} unique global dependencies`)
    if (options.dryRun) {
      console.log('🔍 Packages that would be installed:')
      filteredPackages.forEach(pkg => console.log(`  • ${pkg}`))
      return
    }
  }

  if (filteredPackages.length === 0) {
    if (!options.quiet)
      console.log('ℹ️  No global dependencies found')
    return
  }

  const globalEnvDir = path.join(homedir(), '.local', 'share', 'launchpad', 'global')

  try {
    process.env.LAUNCHPAD_SUPPRESS_INSTALL_SUMMARY = 'true'
    const pkgNames = ['php', 'php.net']
    const isListed = (val: unknown): boolean => {
      if (typeof val === 'string')
        return pkgNames.includes(val)
      if (Array.isArray(val))
        return val.some(v => typeof v === 'string' && pkgNames.includes(v))
      return false
    }
    // Check for excluded dependencies configuration
    const excludedDeps = (config as any).excludeDependencies || []
    const globalExcludedDeps = (config as any).excludeGlobalDependencies || []
    const phpExcludedDeps = (config.services?.php as any)?.excludeDependencies || []
    
    const allExcludedDeps = new Set([
      ...excludedDeps,
      ...globalExcludedDeps, 
      ...phpExcludedDeps
    ])

    // Always install PHP dependencies by default - they are runtime dependencies, not build dependencies
    // Only exclude if explicitly configured to do so
    if (allExcludedDeps.size > 0) {
      try {
        const { pantry } = await import('ts-pkgx')
        const phpPackage = (pantry as any)?.phpnet
        const phpDeps: string[] = (phpPackage?.dependencies || []).map((dep: any) => {
          let name = ''
          if (typeof dep === 'string')
            name = dep
          else if (dep && typeof dep === 'object' && 'project' in dep)
            name = dep.project as string
          else name = String(dep)
          name = name.replace(/^[^:]+:/, '')
          name = name.replace(/[~^<>=].*$/, '')
          return name
        }).filter(Boolean)
        
        if (phpDeps.length > 0) {
          const before = filteredPackages.length
          filteredPackages = filteredPackages.filter(pkg => !allExcludedDeps.has(pkg))
          const removed = before - filteredPackages.length
          if (options.verbose && removed > 0)
            console.log(`ℹ️  Excluded ${removed} dependencies from global install based on configuration.`)
        }
      }
      catch {}
    }

    const prevBuildDepsEnv = process.env.LAUNCHPAD_INSTALL_BUILD_DEPS
    const explicitlyRequested = prevBuildDepsEnv === '1'
    if (!explicitlyRequested) {
      process.env.LAUNCHPAD_INSTALL_BUILD_DEPS = '0'
      if (options.verbose)
        console.log('ℹ️  Global dependency install: build-time dependency installation is disabled (set LAUNCHPAD_INSTALL_BUILD_DEPS=1 to enable)')
    }

    const results = await install(filteredPackages, globalEnvDir)
    if (!explicitlyRequested) {
      if (prevBuildDepsEnv === undefined)
        delete process.env.LAUNCHPAD_INSTALL_BUILD_DEPS
      else process.env.LAUNCHPAD_INSTALL_BUILD_DEPS = prevBuildDepsEnv
    }
    delete process.env.LAUNCHPAD_SUPPRESS_INSTALL_SUMMARY

    await createGlobalBinarySymlinks(globalEnvDir)
    if (!options.noInteractive) {
      await ensureShellIntegrationInstalled()
      triggerShellGlobalRefresh()
    }

    if (!options.quiet) {
      if (results.length > 0)
        console.log(`🎉 Successfully installed ${filteredPackages.length} global dependencies (${results.length} binaries)`)
      else console.log('✅ All global dependencies were already installed')
    }
  }
  catch (error) {
    if (!options.quiet)
      console.error('❌ Failed to install global dependencies:', error instanceof Error ? error.message : String(error))
    throw error
  }
}

const command: Command = {
  name: 'install',
  description: 'Install packages or set up development environment',
  async run(ctx) {
    const { pkgs, opts } = parseArgs(ctx.argv)

    if (opts.verbose)
      config.verbose = true
    if (opts.force)
      config.forceReinstall = true
    if (opts.deps)
      config.installDependencies = true
    if (opts['no-deps'])
      config.installDependencies = false

    // Global paths
    const defaultGlobalPath = path.join(homedir(), '.local', 'share', 'launchpad', 'global')
    const basePath = typeof opts.path === 'string' ? String(opts.path) : (config.installPath ?? defaultConfig.installPath ?? defaultGlobalPath)

    // Dry run only prints plan if not combined with special modes handled below
    const dryRun = Boolean(opts['dry-run'])

    // Handle global installation
    if (opts.global) {
      const list = pkgs
      if (list.length === 0) {
        await installGlobalDependencies({ dryRun, quiet: Boolean(opts.quiet), verbose: Boolean(opts.verbose) })
        return 0
      }
      await installPackagesGlobally(list, { verbose: Boolean(opts.verbose), quiet: Boolean(opts.quiet) })
      return 0
    }

    // Handle dependencies-only installation
    if (opts['deps-only']) {
      if (pkgs.length === 0) {
        console.error('Error: --deps-only requires at least one package to be specified')
        return 1
      }
      process.env.LAUNCHPAD_SUPPRESS_INSTALL_SUMMARY = 'true'
      const results = await installDependenciesOnly(pkgs, basePath)
      delete process.env.LAUNCHPAD_SUPPRESS_INSTALL_SUMMARY
      if (basePath === defaultGlobalPath) {
        await createGlobalBinarySymlinks(basePath)
      }
      await ensureShellIntegrationInstalled()
      triggerShellGlobalRefresh()
      if (!opts.quiet && opts.verbose && results.length > 0)
        results.forEach(f => console.log(`  ${f}`))
      return 0
    }

    // Dev environment setup if no packages or if single directory path
    if (pkgs.length === 0 || (pkgs.length === 1 && await isDirectory(pkgs[0]))) {
      const targetDir = pkgs.length === 1 ? path.resolve(pkgs[0]) : process.cwd()
      await setupDevelopmentEnvironment(targetDir, { dryRun, quiet: Boolean(opts.quiet), shell: Boolean(opts.shell) })
      return 0
    }

    // Dry-run plan for regular install
    if (dryRun) {
      const unique: string[] = []
      const seen = new Set<string>()
      for (const p of pkgs) {
        if (!seen.has(p)) {
          seen.add(p)
          unique.push(p)
        }
      }
      if (!opts.quiet) {
        console.log('Dry run: would install the following packages:')
        unique.forEach(p => console.log(`  - ${p}`))
        console.log(`Target path: ${basePath}`)
      }
      return 0
    }

    // Regular package installation
    try {
      process.env.LAUNCHPAD_SUPPRESS_INSTALL_SUMMARY = 'true'
      const results = await install(pkgs, basePath)
      delete process.env.LAUNCHPAD_SUPPRESS_INSTALL_SUMMARY
      if (basePath === defaultGlobalPath) {
        await createGlobalBinarySymlinks(basePath)
      }
      await ensureShellIntegrationInstalled()
      triggerShellGlobalRefresh()
      if (!opts.quiet) {
        if (results.length > 0) {
          console.log(`🎉 Successfully installed ${pkgs.join(', ')} (${results.length} ${results.length === 1 ? 'binary' : 'binaries'})`)
          results.forEach(f => console.log(`  ${f}`))
        }
        else {
          console.log('⚠️  No binaries were installed')
        }
      }
      return 0
    }
    catch (err) {
      if (!opts.quiet)
        console.error('Installation failed:', err instanceof Error ? err.message : String(err))
      return 1
    }
  },
}

export default command
