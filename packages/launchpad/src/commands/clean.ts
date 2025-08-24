import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import process from 'node:process'
import { type Command } from '../cli/types'
import { config } from '../config'
import { install_prefix } from '../install'

function formatSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

async function getGlobalDependencies(keepGlobal: boolean, verbose?: boolean): Promise<{ globalDeps: Set<string>, explicitTrue: Set<string>, hadTopLevelGlobal: boolean }> {
  const globalDeps = new Set<string>()
  const explicitTrue = new Set<string>()
  let hadTopLevelGlobal = false

  if (!keepGlobal) return { globalDeps, explicitTrue, hadTopLevelGlobal }

  const homeDir = os.homedir()
  const globalDepFiles = [
    path.join(homeDir, '.dotfiles', 'deps.yaml'),
    path.join(homeDir, '.dotfiles', 'deps.yml'),
    path.join(homeDir, '.dotfiles', 'dependencies.yaml'),
    path.join(homeDir, '.dotfiles', 'dependencies.yml'),
    path.join(homeDir, 'deps.yaml'),
    path.join(homeDir, 'deps.yml'),
    path.join(homeDir, 'dependencies.yaml'),
    path.join(homeDir, 'dependencies.yml'),
  ]

  for (const depFile of globalDepFiles) {
    if (!fs.existsSync(depFile)) continue
    try {
      const content = fs.readFileSync(depFile, 'utf8')
      const lines = content.split('\n')
      let topLevelGlobal = false
      let inDependencies = false
      let depsIndent = -1
      let currentIndent = 0
      const explicitFalse: Set<string> = new Set()

      for (let idx = 0; idx < lines.length; idx++) {
        const line = lines[idx]
        const trimmed = line.trim()
        const lineIndent = line.length - line.trimStart().length
        if (!trimmed || trimmed.startsWith('#')) continue

        if (lineIndent === 0 && trimmed.startsWith('global:')) {
          const value = trimmed.split(':')[1]?.trim()
          topLevelGlobal = value === 'true' || value === 'yes'
          if (topLevelGlobal) hadTopLevelGlobal = true
          continue
        }

        if (trimmed.startsWith('dependencies:')) {
          inDependencies = true
          currentIndent = lineIndent
          depsIndent = -1
          continue
        }
        if (!inDependencies) continue
        if (lineIndent <= currentIndent && trimmed.length > 0) {
          inDependencies = false
          depsIndent = -1
          continue
        }
        if (!trimmed.includes(':')) continue
        if (depsIndent === -1 && lineIndent > currentIndent) depsIndent = lineIndent
        if (lineIndent !== depsIndent) continue

        const depName = trimmed.split(':')[0].trim()
        if (!depName || depName === 'version' || depName === 'global' || (!depName.includes('.') && !depName.includes('/'))) continue

        const colonIndex = trimmed.indexOf(':')
        const afterColon = trimmed.substring(colonIndex + 1).trim()

        if (afterColon && !afterColon.startsWith('{') && afterColon !== '') {
          if (topLevelGlobal) globalDeps.add(depName)
        }
        else {
          let foundGlobal = false
          for (let j = idx + 1; j < lines.length; j++) {
            const nextLine = lines[j]
            const nextTrimmed = nextLine.trim()
            const nextIndent = nextLine.length - nextLine.trimStart().length
            if (nextIndent <= depsIndent && nextTrimmed.length > 0) break
            if (nextTrimmed.startsWith('global:')) {
              const globalValue = nextTrimmed.split(':')[1]?.trim()
              foundGlobal = globalValue === 'true' || globalValue === 'yes'
              if (globalValue === 'false' || globalValue === 'no') explicitFalse.add(depName)
              break
            }
          }
          if (foundGlobal) {
            explicitTrue.add(depName)
            globalDeps.add(depName)
          }
          else if (topLevelGlobal) {
            globalDeps.add(depName)
          }
        }
      }

      for (const pkg of explicitFalse) {
        globalDeps.delete(pkg)
        explicitTrue.delete(pkg)
      }

      const isDomainLike = (s: string) => s.includes('.') || s.includes('/')
      for (const pkg of Array.from(globalDeps)) if (!isDomainLike(pkg)) globalDeps.delete(pkg)
      for (const pkg of Array.from(explicitTrue)) if (!isDomainLike(pkg)) explicitTrue.delete(pkg)
    }
    catch (error) {
      if (verbose) console.log(`⚠️  Could not parse ${depFile}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return { globalDeps, explicitTrue, hadTopLevelGlobal }
}

async function getLaunchpadBinaries(installPrefix: string, keepGlobal: boolean, globalDeps: Set<string>): Promise<Array<{ binary: string, package: string, fullPath: string }>> {
  const binaries: Array<{ binary: string, package: string, fullPath: string }> = []
  const pkgsDir = path.join(installPrefix, 'pkgs')
  const binDir = path.join(installPrefix, 'bin')

  if (fs.existsSync(pkgsDir)) {
    try {
      const domains = fs.readdirSync(pkgsDir, { withFileTypes: true }).filter(d => d.isDirectory())
      for (const domain of domains) {
        const domainPath = path.join(pkgsDir, domain.name)
        const versions = fs.readdirSync(domainPath, { withFileTypes: true }).filter(d => d.isDirectory())
        for (const version of versions) {
          const versionPath = path.join(domainPath, version.name)
          const metadataPath = path.join(versionPath, 'metadata.json')
          if (!fs.existsSync(metadataPath)) continue
          try {
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))
            if (metadata.binaries && Array.isArray(metadata.binaries)) {
              for (const binary of metadata.binaries) {
                const binaryPath = path.join(binDir, binary)
                if (!fs.existsSync(binaryPath)) continue
                if (keepGlobal && globalDeps.has(domain.name)) continue
                binaries.push({ binary, package: `${domain.name}@${version.name.slice(1)}`, fullPath: binaryPath })
              }
            }
          }
          catch {}
        }
      }
    }
    catch {}
  }

  if (fs.existsSync(binDir)) {
    try {
      const binFiles = fs.readdirSync(binDir, { withFileTypes: true }).filter(d => d.isFile())
      for (const file of binFiles) {
        const filePath = path.join(binDir, file.name)
        try {
          const content = fs.readFileSync(filePath, 'utf8')
          if (content.includes('Launchpad shim')) {
            const alreadyTracked = binaries.some(b => b.binary === file.name)
            if (!alreadyTracked) binaries.push({ binary: file.name, package: 'unknown', fullPath: filePath })
          }
        }
        catch {}
      }
    }
    catch {}
  }

  return binaries
}

const command: Command = {
  name: 'clean',
  description: 'Remove all Launchpad-installed packages and environments',
  async run(ctx) {
    const argv = ctx.argv
    const verbose = argv.includes('--verbose')
    const force = argv.includes('--force')
    const dryRun = argv.includes('--dry-run')
    const keepCache = argv.includes('--keep-cache')
    const keepGlobal = argv.includes('--keep-global')

    if (verbose) config.verbose = true

    try {
      if (dryRun) console.log('🔍 DRY RUN MODE - Nothing will actually be removed')

      console.log(`${dryRun ? 'Would perform' : 'Performing'} complete cleanup...`)

      if (!force && !dryRun) {
        console.log('⚠️  This will remove ALL Launchpad-installed packages and environments')
        console.log('Use --force to skip confirmation or --dry-run to preview')
        return 0
      }

      const homeDir = os.homedir()
      const installPrefix = install_prefix().string

      const { globalDeps, explicitTrue, hadTopLevelGlobal } = await getGlobalDependencies(keepGlobal, verbose)

      let runningServices: string[] = []
      try {
        const services = await import('../services')
        const serviceDefs = services.getAllServiceDefinitions()
        const candidateServices = serviceDefs.filter((def: any) => keepGlobal && def.packageDomain ? !globalDeps.has(def.packageDomain) : true)
        for (const def of candidateServices) {
          if (!def.name) continue
          let shouldInclude = false
          try {
            const status = await services.getServiceStatus(def.name)
            if (status !== 'stopped') shouldInclude = true
          }
          catch {}
          try {
            const serviceFile = services.getServiceFilePath(def.name)
            if (serviceFile && fs.existsSync(serviceFile)) shouldInclude = true
          }
          catch {}
          try {
            if (def.dataDirectory && fs.existsSync(def.dataDirectory)) shouldInclude = true
          }
          catch {}
          if (shouldInclude) runningServices.push(def.name)
        }
      }
      catch {}

      const localShareDir = path.join(homeDir, '.local', 'share', 'launchpad')
      const cacheDir = path.join(homeDir, '.cache', 'launchpad')
      const pkgsDir = path.join(installPrefix, 'pkgs')

      const dirsToCheck: { path: string, name: string }[] = [
        { path: pkgsDir, name: 'Package metadata' },
        { path: localShareDir, name: 'Project environments' },
      ]
      if (!keepCache) dirsToCheck.push({ path: cacheDir, name: 'Cache directory' })

      try {
        const domains = fs.readdirSync(installPrefix, { withFileTypes: true })
          .filter(d => d.isDirectory() && !['bin', 'pkgs', '.tmp', '.cache', '.local'].includes(d.name))
        for (const domain of domains) {
          if (keepGlobal && globalDeps.has(domain.name)) {
            if (verbose) console.log(`Skipping global dependency: ${domain.name}`)
            continue
          }
          const domainPath = path.join(installPrefix, domain.name)
          dirsToCheck.push({ path: domainPath, name: `Package files (${domain.name})` })
        }
      }
      catch {}

      const launchpadBinaries = await getLaunchpadBinaries(installPrefix, keepGlobal, globalDeps)

      // stats
      let totalSize = 0
      let totalFiles = 0
      const existingDirs: { path: string, name: string, size: number, files: number }[] = []

      for (const dir of dirsToCheck) {
        if (!fs.existsSync(dir.path)) continue
        let dirSize = 0
        let dirFiles = 0
        try {
          const stack = [dir.path]
          while (stack.length) {
            const current = stack.pop()!
            try {
              const entries = fs.readdirSync(current, { withFileTypes: true })
              for (const entry of entries) {
                const fullPath = path.join(current, entry.name)
                if (entry.isFile()) {
                  try {
                    const st = fs.statSync(fullPath)
                    dirSize += st.size
                    dirFiles++
                  }
                  catch {}
                }
                else if (entry.isDirectory()) {
                  stack.push(fullPath)
                }
              }
            }
            catch {}
          }
        }
        catch {}
        existingDirs.push({ path: dir.path, name: dir.name, size: dirSize, files: dirFiles })
        totalSize += dirSize
        totalFiles += dirFiles
      }

      for (const binary of launchpadBinaries) {
        try {
          const st = fs.statSync(binary.fullPath)
          totalSize += st.size
          totalFiles++
        }
        catch {}
      }

      if (dryRun) {
        if (existingDirs.length > 0 || launchpadBinaries.length > 0) {
          console.log('📊 Cleanup statistics:')
          console.log(`   • Total size: ${formatSize(totalSize)}`)
          console.log(`   • Total files: ${totalFiles}`)
          console.log('')
          console.log('Would remove:')
          existingDirs.forEach((dir) => {
            console.log(`   • ${dir.name}: ${dir.path} (${formatSize(dir.size)}, ${dir.files} files)`) 
          })
          if (launchpadBinaries.length > 0) {
            console.log(`   • Launchpad binaries: ${launchpadBinaries.length} files`)
            console.log('')
            console.log('🔧 Binaries that would be removed:')
            const byPkg = launchpadBinaries.reduce((acc, b) => {
              if (!acc[b.package]) acc[b.package] = []
              acc[b.package].push(b.binary)
              return acc
            }, {} as Record<string, string[]>)
            Object.entries(byPkg).forEach(([pkg, bins]) => {
              console.log(`   • ${pkg}: ${bins.join(', ')}`)
            })
          }
          if (keepGlobal && (explicitTrue.size > 0 || hadTopLevelGlobal)) {
            console.log('')
            console.log('✅ Global dependencies that would be preserved:')
            const toPrint = explicitTrue.size > 0 ? explicitTrue : globalDeps
            Array.from(toPrint).sort().forEach(dep => console.log(`   • ${dep}`))
          }
          if (runningServices.length > 0) {
            console.log('')
            console.log('🛑 Services that would be stopped:')
            runningServices.forEach(name => console.log(`   • ${name}`))
          }
        }
        else {
          console.log('📭 Nothing found to clean')
        }
        return 0
      }

      // stop services, remove service files
      try {
        const services = await import('../services')
        for (const name of runningServices) {
          try { await services.stopService(name) } catch {}
          try { await services.disableService(name) } catch {}
          try {
            const file = services.getServiceFilePath(name)
            if (file && fs.existsSync(file)) await services.removeServiceFile(name)
          } catch {}
        }
      }
      catch {}

      // remove binaries
      for (const b of launchpadBinaries) {
        try { fs.rmSync(b.fullPath, { force: true }) } catch {}
      }

      // remove directories
      for (const dir of existingDirs) {
        try { fs.rmSync(dir.path, { recursive: true, force: true }) } catch {}
      }

      console.log('✅ Cleanup complete!')
      console.log(`   • Freed ${formatSize(totalSize)} of disk space`)
      console.log(`   • Removed ${totalFiles} files`)

      return 0
    }
    catch (error) {
      console.error('Failed to clean:', error instanceof Error ? error.message : String(error))
      return 1
    }
  },
}

export default command
