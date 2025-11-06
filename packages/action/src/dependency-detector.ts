import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'
import * as core from '@actions/core'

// Simple semver range implementation for Node.js compatibility
class SemverRange {
  private range: string

  constructor(range: string) {
    this.range = range
  }

  toString(): string {
    return this.range
  }
}

// Package requirement interface
interface PackageRequirement {
  project: string
  constraint: SemverRange
}

// Simple path utility for Node.js
class SimplePath {
  public string: string

  constructor(path: string) {
    this.string = resolve(path)
  }

  isDirectory(): boolean {
    try {
      return statSync(this.string).isDirectory()
    }
    catch {
      return false
    }
  }

  read(): string {
    return readFileSync(this.string, 'utf8')
  }

  * ls(): Generator<[SimplePath, { name: string, isFile: boolean, isSymlink: boolean, isDirectory: boolean }]> {
    try {
      const entries = readdirSync(this.string, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = new SimplePath(join(this.string, entry.name))
        yield [fullPath, {
          name: entry.name,
          isFile: entry.isFile(),
          isSymlink: entry.isSymbolicLink(),
          isDirectory: entry.isDirectory(),
        }]
      }
    }
    catch {
      // Directory doesn't exist or can't be read
    }
  }
}

// Simple package parsing
function parsePackage(input: string): PackageRequirement {
  const atIndex = input.lastIndexOf('@')
  if (atIndex > 0) {
    const project = input.substring(0, atIndex)
    const constraint = input.substring(atIndex + 1)
    return { project, constraint: new SemverRange(constraint) }
  }
  return { project: input, constraint: new SemverRange('*') }
}

// Simple JSON with comments parser
function parseJSONC(content: string): any {
  try {
    const cleaned = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')
    return JSON.parse(cleaned)
  }
  catch {
    return {}
  }
}

// Simple YAML parser (basic implementation)
function parseYAML(content: string): any {
  try {
    // For JSON-like YAML
    if (content.trim().startsWith('{')) {
      return JSON.parse(content)
    }

    // Basic YAML parsing for simple key-value pairs
    const lines = content.split('\n')
    const result: any = {}
    const currentSection: any = result
    let currentKey = ''

    for (const line of lines) {
      let trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#'))
        continue

      // Strip inline comments (but preserve quoted strings)
      const commentIndex = trimmed.indexOf('#')
      if (commentIndex > -1) {
        // Simple check: if we're not inside quotes, strip the comment
        const beforeComment = trimmed.substring(0, commentIndex)
        const quoteCount = (beforeComment.match(/"/g) || []).length
        if (quoteCount % 2 === 0) { // Even number of quotes means we're not inside a quoted string
          trimmed = beforeComment.trim()
        }
      }

      if (!trimmed)
        continue

      // Handle arrays (simple case)
      if (trimmed.startsWith('- ')) {
        const value = trimmed.substring(2).trim()
        if (!currentSection[currentKey]) {
          currentSection[currentKey] = []
        }
        if (Array.isArray(currentSection[currentKey])) {
          currentSection[currentKey].push(value)
        }
        continue
      }

      const colonIndex = trimmed.indexOf(':')
      if (colonIndex > 0) {
        const key = trimmed.substring(0, colonIndex).trim()
        let value = trimmed.substring(colonIndex + 1).trim()

        if (value === '') {
          // This is a section header
          currentSection[key] = []
          currentKey = key
        }
        else {
          // Remove quotes if present
          value = value.replace(/^["']|["']$/g, '')

          // Handle boolean values
          if (value === 'true') {
            currentSection[key] = true
          }
          else if (value === 'false') {
            currentSection[key] = false
          }
          else {
            currentSection[key] = value
          }
        }
      }
    }

    return result
  }
  catch {
    return {}
  }
}

// Parse pkgx dependencies from YAML
function parsePkgxDependencies(deps: any): PackageRequirement[] {
  const packages: PackageRequirement[] = []

  if (typeof deps === 'string') {
    // Single dependency as string
    packages.push(parsePackage(deps))
  }
  else if (Array.isArray(deps)) {
    // Array of dependencies
    for (const dep of deps) {
      if (typeof dep === 'string') {
        packages.push(parsePackage(dep))
      }
    }
  }
  else if (typeof deps === 'object' && deps !== null) {
    // Object with package: version pairs or complex objects
    for (const [pkg, versionOrConfig] of Object.entries(deps)) {
      if (typeof versionOrConfig === 'string') {
        if (versionOrConfig === 'latest' || versionOrConfig === '*') {
          packages.push({ project: pkg, constraint: new SemverRange('*') })
        }
        else {
          packages.push(parsePackage(`${pkg}@${versionOrConfig}`))
        }
      }
      else if (typeof versionOrConfig === 'object' && versionOrConfig !== null) {
        // Handle complex dependency objects with version and global flags
        const config = versionOrConfig as any
        const version = config.version || '*'
        const constraint = version === 'latest' || version === '*'
          ? new SemverRange('*')
          : new SemverRange(version)

        packages.push({ project: pkg, constraint })
        // Note: global flag is handled at the environment level, not per package in GitHub Actions
      }
      else {
        packages.push({ project: pkg, constraint: new SemverRange('*') })
      }
    }
  }

  return packages
}

// Simplified sniff implementation for GitHub Actions
function sniffDirectory(dirPath: SimplePath): { pkgs: PackageRequirement[], env: Record<string, string> } {
  const constraint = new SemverRange('*')
  let has_package_json = false
  const pkgs: PackageRequirement[] = []
  const env: Record<string, string> = {}

  for (const [path, { name, isFile, isSymlink, isDirectory }] of dirPath.ls()) {
    if (isFile || isSymlink) {
      switch (name) {
        case 'deno.json':
        case 'deno.jsonc':
          pkgs.push({ project: 'deno.land', constraint })
          try {
            const json = parseJSONC(path.read())
            if (json?.pkgx) {
              // Handle pkgx dependencies in deno.json
            }
          }
          catch {
            // Ignore parsing errors
          }
          break
        case '.nvmrc':
        case '.node-version':
          try {
            let version = path.read().trim()
            if (version.startsWith('v'))
              version = version.slice(1)
            if (version.match(/^\d/))
              version = `@${version}`
            pkgs.push(parsePackage(`nodejs.org${version}`))
          }
          catch {
            pkgs.push({ project: 'nodejs.org', constraint })
          }
          break
        case '.ruby-version':
          try {
            let version = path.read().trim()
            if (version.startsWith('v'))
              version = version.slice(1)
            if (version.match(/^\d/))
              version = `@${version}`
            pkgs.push(parsePackage(`ruby-lang.org${version}`))
          }
          catch {
            pkgs.push({ project: 'ruby-lang.org', constraint })
          }
          break
        case '.python-version':
          try {
            const content = path.read().trim()
            const lines = content.split('\n')
            for (const line of lines) {
              const l = line.trim()
              if (!l || l.startsWith('#'))
                continue
              try {
                pkgs.push(parsePackage(`python.org@${l}`))
                break
              }
              catch {
                // Skip invalid versions
              }
            }
          }
          catch {
            pkgs.push({ project: 'python.org', constraint })
          }
          break
        case 'package.json':
          has_package_json = true
          try {
            const json = JSON.parse(path.read())

            // Check engines
            if (json?.engines) {
              if (json.engines.node)
                pkgs.push(parsePackage(`nodejs.org@${json.engines.node}`))
              if (json.engines.npm)
                pkgs.push(parsePackage(`npmjs.com@${json.engines.npm}`))
              if (json.engines.yarn)
                pkgs.push(parsePackage(`yarnpkg.com@${json.engines.yarn}`))
              if (json.engines.pnpm)
                pkgs.push(parsePackage(`pnpm.io@${json.engines.pnpm}`))
            }

            // Check packageManager (corepack)
            if (json?.packageManager) {
              const match = json.packageManager.match(/^([^@]+)@([^+]+)/)
              if (match) {
                const [, pkg, version] = match
                switch (pkg) {
                  case 'npm':
                    pkgs.push(parsePackage(`npmjs.com@${version}`))
                    break
                  case 'yarn':
                    pkgs.push(parsePackage(`yarnpkg.com@${version}`))
                    break
                  case 'pnpm':
                    pkgs.push(parsePackage(`pnpm.io@${version}`))
                    break
                }
              }
            }

            // Check volta
            if (json?.volta) {
              if (json.volta.node)
                pkgs.push(parsePackage(`nodejs.org@${json.volta.node}`))
              if (json.volta.npm)
                pkgs.push(parsePackage(`npmjs.com@${json.volta.npm}`))
              if (json.volta.yarn)
                pkgs.push(parsePackage(`yarnpkg.com@${json.volta.yarn}`))
              if (json.volta.pnpm)
                pkgs.push(parsePackage(`pnpm.io@${json.volta.pnpm}`))
            }
          }
          catch {
            // If we can't parse package.json, just add node
            pkgs.push({ project: 'nodejs.org', constraint })
          }
          break
        case 'Cargo.toml':
          pkgs.push({ project: 'rust-lang.org', constraint })
          break
        case 'go.mod':
        case 'go.sum':
          pkgs.push({ project: 'go.dev', constraint })
          break
        case 'requirements.txt':
        case 'pipfile':
        case 'pipfile.lock':
        case 'setup.py':
          pkgs.push({ project: 'pip.pypa.io', constraint })
          break
        case 'pyproject.toml':
          try {
            const content = path.read()
            if (content.includes('poetry.core.masonry.api')) {
              pkgs.push({ project: 'python-poetry.org', constraint })
            }
            else {
              pkgs.push({ project: 'pip.pypa.io', constraint })
            }
          }
          catch {
            pkgs.push({ project: 'pip.pypa.io', constraint })
          }
          break
        case 'Gemfile':
          pkgs.push({ project: 'ruby-lang.org', constraint })
          break
        case '.yarnrc':
          pkgs.push({ project: 'classic.yarnpkg.com', constraint })
          break
        case 'yarn.lock':
          pkgs.push({ project: 'yarnpkg.com', constraint })
          break
        case '.yarnrc.yml':
          pkgs.push({ project: 'yarnpkg.com', constraint })
          break
        case 'bun.lock':
        case 'bun.lockb':
          pkgs.push({ project: 'bun.sh', constraint: new SemverRange('>=1') })
          break
        case 'pnpm-lock.yaml':
          pkgs.push({ project: 'pnpm.io', constraint })
          break
        case 'composer.json':
          pkgs.push({ project: 'php.net', constraint })
          break
        case 'pom.xml':
        case 'build.gradle':
        case 'build.gradle.kts':
          pkgs.push({ project: 'java.oracle.com', constraint })
          break
        case 'justfile':
        case 'Justfile':
          pkgs.push({ project: 'just.systems', constraint })
          break
        case 'Taskfile.yml':
          pkgs.push({ project: 'taskfile.dev', constraint })
          break
        case 'uv.lock':
          pkgs.push({ project: 'astral.sh/uv', constraint })
          break
        case 'pkgx.yml':
        case 'pkgx.yaml':
        case '.pkgx.yml':
        case '.pkgx.yaml':
        case 'pantry.yml':
        case 'pantry.yaml':
        case '.pantry.yml':
        case '.pantry.yaml':
        case 'dependencies.yml':
        case 'dependencies.yaml':
        case '.dependencies.yml':
        case '.dependencies.yaml':
        case 'deps.yml':
        case 'deps.yaml':
        case '.deps.yml':
        case '.deps.yaml':
          try {
            const content = path.read()
            const yaml = parseYAML(content)
            if (yaml?.dependencies) {
              const deps = parsePkgxDependencies(yaml.dependencies)
              pkgs.push(...deps)
            }
          }
          catch {
            // Ignore parsing errors
          }
          break
      }
    }
    else if (isDirectory) {
      switch (name) {
        case '.git':
          if (process.platform !== 'darwin') {
            pkgs.push({ project: 'git-scm.org', constraint })
          }
          break
        case '.hg':
          pkgs.push({ project: 'mercurial-scm.org', constraint })
          break
        case '.svn':
          pkgs.push({ project: 'apache.org/subversion', constraint })
          break
      }
    }
  }

  // Add Node.js if we have package.json but no specific runtime
  if (has_package_json && !pkgs.some(pkg => pkg.project === 'bun.sh') && !pkgs.some(pkg => pkg.project === 'nodejs.org')) {
    pkgs.push({ project: 'nodejs.org', constraint })
  }

  return { pkgs, env }
}

/**
 * Detect project dependencies using simplified sniff functionality
 */
export async function detectProjectDependencies(configPath?: string): Promise<string[]> {
  try {
    // If a config path is provided, try to read dependencies from it
    if (configPath) {
      core.info(`Reading dependencies from config: ${configPath}`)
      const configFilePath = new SimplePath(configPath)

      if (configFilePath.string.endsWith('.json')) {
        try {
          const content = configFilePath.read()
          const config = JSON.parse(content)

          if (config.dependencies) {
            const deps: string[] = []

            for (const [name, spec] of Object.entries(config.dependencies)) {
              // Handle different dependency formats
              if (typeof spec === 'string') {
                // GitHub format: "github:org/repo" or "~/path"
                if (spec.startsWith('github:')) {
                  deps.push(spec) // Keep full github: format
                }
                else if (spec.startsWith('~')) {
                  // Skip local paths in CI
                  core.warning(`Skipping local dependency: ${name} (${spec})`)
                }
                else {
                  deps.push(name)
                }
              }
              else if (typeof spec === 'object' && spec !== null) {
                // Object format with github/version
                if ('github' in spec) {
                  deps.push(`github:${spec.github}`)
                }
                else {
                  deps.push(name)
                }
              }
            }

            if (deps.length > 0) {
              core.info(`Found dependencies from config: ${deps.join(', ')}`)
              return deps
            }
          }
        }
        catch (error) {
          core.warning(`Failed to parse config file: ${error instanceof Error ? error.message : String(error)}`)
        }
      }
    }

    // Fall back to directory sniffing
    const currentDir = new SimplePath(process.cwd())

    core.info(`Sniffing dependencies in: ${currentDir.string}`)

    if (!currentDir.isDirectory()) {
      throw new Error(`not a directory: ${currentDir.string}`)
    }

    const { pkgs } = sniffDirectory(currentDir)

    const dependencies = pkgs.map((pkg) => {
      return convertPackageName(pkg.project)
    })

    core.info(`Detected dependencies: ${dependencies.join(', ')}`)

    return [...new Set(dependencies)] // Remove duplicates
  }
  catch (error) {
    core.warning(`Failed to detect dependencies: ${error instanceof Error ? error.message : String(error)}`)
    return []
  }
}

/**
 * Convert full package names to simple names for pantry install
 */
function convertPackageName(fullName: string): string {
  // Manual mapping for packages
  const packageMap: Record<string, string> = {
    'nodejs.org': 'node',
    'python.org': 'python',
    'pip.pypa.io': 'python',
    'python-poetry.org': 'python',
    'go.dev': 'go',
    'rust-lang.org': 'rust',
    'ruby-lang.org': 'ruby',
    'php.net': 'php',
    'java.oracle.com': 'java',
    'openjdk.org': 'java',
    'bun.sh': 'bun',
    'deno.land': 'deno',
    'yarnpkg.com': 'yarn',
    'classic.yarnpkg.com': 'yarn',
    'pnpm.io': 'pnpm',
    'npmjs.com': 'npm',
    'git-scm.org': 'git',
    'mercurial-scm.org': 'hg',
    'apache.org/subversion': 'svn',
    'docker.com/cli': 'docker',
    'kubernetes.io/kubectl': 'kubectl',
    'kubernetes.io/minikube': 'minikube',
    'helm.sh': 'helm',
    'terraform.io': 'terraform',
    'just.systems': 'just',
    'taskfile.dev': 'task',
    'skaffold.dev': 'skaffold',
    'aws.amazon.com/cdk': 'aws-cdk',
    'astral.sh/uv': 'uv',
    'prefix.dev': 'pixi',
    'kpt.dev': 'kpt',
    'kubernetes.io/kustomize': 'kustomize',
  }

  return packageMap[fullName] || fullName
}
