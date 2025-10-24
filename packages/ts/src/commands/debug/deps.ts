/* eslint-disable no-console */
import type { Command } from '../../cli/types'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

function parseArgv(argv: string[]): { pkg?: string, ver?: string } {
  let pkg: string | undefined
  let ver: string | undefined
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--package' || a === '-p') {
      pkg = argv[i + 1]
      i += 1
    }
    else if (a.startsWith('--package=')) {
      pkg = a.split('=')[1]
    }
    else if (a === '--version' || a === '-v') {
      ver = argv[i + 1]
      i += 1
    }
    else if (a.startsWith('--version=')) {
      ver = a.split('=')[1]
    }
  }
  return { pkg, ver }
}

const cmd: Command = {
  name: 'debug:deps',
  description: 'Debug global dependencies and show their sources',
  async run({ argv }) {
    const { pkg, ver } = parseArgv(argv)
    const homedir = os.homedir()

    console.log('🔍 Debugging global dependencies...\n')

    const globalDepFileNames = [
      'deps.yaml',
      'deps.yml',
      'dependencies.yaml',
      'dependencies.yml',
    ]

    const globalDepLocations = [
      homedir,
      path.join(homedir, '.dotfiles'),
      path.join(homedir, '.config'),
      path.join(homedir, 'Projects'),
      path.join(homedir, 'Code'),
      path.join(homedir, 'Development'),
      path.join(homedir, 'dev'),
      path.join(homedir, 'workspace'),
      path.join(homedir, 'src'),
      path.join(homedir, 'Desktop'),
      '/opt',
      '/usr/local',
    ]

    const foundFiles: Array<{ file: string, packages: Array<{ name: string, version?: string }> }> = []
    const packageSources: Map<string, Array<{ file: string, version?: string }>> = new Map()

    for (const location of globalDepLocations) {
      if (!fs.existsSync(location))
        continue

      for (const fileName of globalDepFileNames) {
        async function scanDir(dir: string, depth: number = 0): Promise<void> {
          if (depth > 6)
            return
          try {
            const entries = await fs.promises.readdir(dir, { withFileTypes: true })
            for (const entry of entries) {
              const fullPath = path.join(dir, entry.name)
              if (entry.isDirectory()) {
                if (['node_modules', 'vendor', '.git', '.svn', '.hg', 'dist', 'build', 'target', 'venv', '__pycache__', '.vscode', '.idea', 'coverage', '.nyc_output', 'logs', 'test-envs', 'test', 'tests', '__tests__'].includes(entry.name)) {
                  continue
                }
                await scanDir(fullPath, depth + 1)
              }
              else if (entry.name === fileName) {
                try {
                  await fs.promises.readFile(fullPath, 'utf-8')
                  const { default: sniff } = await import('../../dev/sniff')
                  const sniffResult = await sniff({ string: path.dirname(fullPath) })
                  const packages = sniffResult.pkgs.map((p: any) => ({ name: p.project, version: String(p.constraint) }))
                  foundFiles.push({ file: fullPath, packages })
                  for (const p of packages) {
                    if (!packageSources.has(p.name))
                      packageSources.set(p.name, [])
                    packageSources.get(p.name)!.push({ file: fullPath, version: String(p.version) })
                  }
                }
                catch {
                  // ignore parse errors
                }
              }
            }
          }
          catch {
            // ignore read errors
          }
        }

        if (location === homedir) {
          const directFile = path.join(location, fileName)
          if (fs.existsSync(directFile)) {
            try {
              await fs.promises.readFile(directFile, 'utf-8')
              const { default: sniff } = await import('../../dev/sniff')
              const sniffResult = await sniff({ string: location })
              const packages = sniffResult.pkgs.map((p: any) => ({ name: p.project, version: String(p.constraint) }))
              foundFiles.push({ file: directFile, packages })
              for (const p of packages) {
                if (!packageSources.has(p.name))
                  packageSources.set(p.name, [])
                packageSources.get(p.name)!.push({ file: directFile, version: String(p.version) })
              }
            }
            catch {
              // ignore
            }
          }
        }
        else {
          await scanDir(location, 0)
        }
      }
    }

    let filteredSources = packageSources
    if (pkg) {
      const filtered = new Map<string, Array<{ file: string, version?: string }>>()
      for (const [pname, sources] of packageSources) {
        if (pname.toLowerCase().includes(pkg.toLowerCase()))
          filtered.set(pname, sources)
      }
      filteredSources = filtered
    }

    if (ver) {
      const filtered = new Map<string, Array<{ file: string, version?: string }>>()
      for (const [pname, sources] of filteredSources) {
        const matching = sources.filter(s => s.version && s.version.includes(ver))
        if (matching.length > 0)
          filtered.set(pname, matching)
      }
      filteredSources = filtered
    }

    console.log(`📄 Found ${foundFiles.length} dependency files`)
    console.log(`📦 Found ${packageSources.size} unique packages\n`)

    if (pkg || ver)
      console.log('🔍 Filtered results:\n')

    for (const [packageName, sources] of filteredSources) {
      console.log(`📦 ${packageName}`)
      const versionGroups = new Map<string, string[]>()
      for (const source of sources) {
        const v = source.version || 'unspecified'
        if (!versionGroups.has(v))
          versionGroups.set(v, [])
        versionGroups.get(v)!.push(source.file)
      }
      for (const [v, files] of versionGroups) {
        console.log(`  📌 ${v}`)
        for (const file of files) console.log(`     📄 ${file}`)
      }
      console.log()
    }

    const conflicts = Array.from(packageSources.entries()).filter(([_, sources]) => {
      const versions = new Set(sources.map(s => s.version).filter(Boolean))
      return versions.size > 1
    })

    if (conflicts.length > 0) {
      console.log('⚠️  Version conflicts detected:\n')
      for (const [packageName, sources] of conflicts) {
        console.log(`📦 ${packageName}`)
        const versionGroups = new Map<string, string[]>()
        for (const source of sources) {
          const v = source.version || 'unspecified'
          if (!versionGroups.has(v))
            versionGroups.set(v, [])
          versionGroups.get(v)!.push(source.file)
        }
        for (const [v, files] of versionGroups) {
          console.log(`  ⚠️  ${v} (${files.length} files)`)
        }
        console.log()
      }
    }

    console.log('💡 Usage examples:')
    console.log('  launchpad debug:deps --package bun')
    console.log('  launchpad debug:deps --version 1.2.3')
    console.log('  launchpad debug:deps --package php --version 8.4')

    return 0
  },
}

export default cmd
