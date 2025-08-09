import type { PlainObject } from 'is-what'

import { semver } from 'bun'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { isArray, isNumber, isPlainObject, isString } from 'is-what'

export interface PackageRequirement {
  project: string
  constraint: SemverRange
  global?: boolean
  source?: 'explicit' | 'inferred' // Track where this requirement came from
}

export class SemverRange {
  private range: string

  constructor(range: string) {
    this.range = range
  }

  toString(): string {
    return this.range
  }

  satisfies(version: string): boolean {
    return semver.satisfies(version, this.range)
  }
}

// Simple Path replacement for libpkgx Path
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

  async read(): Promise<string> {
    return readFileSync(this.string, 'utf8')
  }

  async readYAML(): Promise<any> {
    const content = await this.read()
    return parseYaml(content)
  }

  async readYAMLAll(): Promise<any[]> {
    const content = await this.read()
    // Simple YAML multi-document parsing
    const docs = content.split(/^---$/m)
    return docs.map(doc => parseYaml(doc.trim())).filter(Boolean)
  }

  async* ls(): AsyncGenerator<[SimplePath, { name: string, isFile: boolean, isSymlink: boolean, isDirectory: boolean }]> {
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

  static home(): SimplePath {
    return new SimplePath(homedir())
  }
}

// Simple YAML parser (basic implementation)
function parseYaml(content: string): any {
  try {
    // For now, use JSON.parse for simple cases
    // In a real implementation, you'd want a proper YAML parser
    if (content.trim().startsWith('{')) {
      return JSON.parse(content)
    }

    // Basic YAML parsing for simple key-value pairs, arrays, and nested objects
    const lines = content.split('\n')
    const result: any = {}
    const stack: Array<{ obj: any, key: string | null, indent: number }> = [{ obj: result, key: null, indent: -1 }]

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#'))
        continue

      const indent = line.length - line.trimStart().length

      // Pop stack items with higher or equal indentation
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
        stack.pop()
      }

      const current = stack[stack.length - 1]

      // Handle array items
      if (trimmed.startsWith('- ')) {
        const item = trimmed.substring(2).trim()

        // We need to find the key that should contain this array
        // Look for the most recent key in the stack that has the right indentation
        let targetKey: string | null = null
        let targetObj: any = null

        // Go through the stack from most recent to oldest
        for (let i = stack.length - 1; i >= 0; i--) {
          const stackItem = stack[i]
          if (stackItem.indent < indent) {
            // Find the key in this object that was just created
            const keys = Object.keys(stackItem.obj)
            const lastKey = keys[keys.length - 1]
            if (lastKey) {
              targetKey = lastKey
              targetObj = stackItem.obj
              break
            }
          }
        }

        if (targetKey && targetObj) {
          if (!Array.isArray(targetObj[targetKey])) {
            targetObj[targetKey] = []
          }
          targetObj[targetKey].push(item)
        }
        continue
      }

      const colonIndex = trimmed.indexOf(':')
      if (colonIndex > 0) {
        const key = trimmed.substring(0, colonIndex).trim()
        let value = trimmed.substring(colonIndex + 1).trim()

        // Remove inline comments
        const commentIndex = value.indexOf('#')
        if (commentIndex >= 0) {
          value = value.substring(0, commentIndex).trim()
        }

        // Remove quotes if present
        const cleanValue = value.replace(/^["']|["']$/g, '')

        if (cleanValue === '') {
          // This is the start of a nested object or array - we'll determine which when we see the content
          current.obj[key] = {}
          stack.push({ obj: current.obj[key], key: null, indent })
        }
        else {
          // Convert boolean and numeric values
          let parsedValue: any = cleanValue
          if (cleanValue === 'true') {
            parsedValue = true
          }
          else if (cleanValue === 'false') {
            parsedValue = false
          }
          else if (cleanValue === 'null') {
            parsedValue = null
          }
          else if (/^\d+$/.test(cleanValue)) {
            parsedValue = Number.parseInt(cleanValue, 10)
          }
          else if (/^\d+\.\d+$/.test(cleanValue)) {
            parsedValue = Number.parseFloat(cleanValue)
          }
          current.obj[key] = parsedValue
        }
      }
    }

    return result
  }
  catch {
    return {}
  }
}

// Simple JSONC parser
function parseJSONC(content: string): any {
  try {
    // Remove comments and parse as JSON
    const cleaned = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')
    return JSON.parse(cleaned)
  }
  catch {
    return {}
  }
}

// Package parsing utility
function parsePackage(input: string, source: 'explicit' | 'inferred' = 'explicit'): PackageRequirement {
  // Simple package parsing logic
  const atIndex = input.lastIndexOf('@')
  if (atIndex > 0) {
    const project = input.substring(0, atIndex)
    const constraint = input.substring(atIndex + 1)
    return { project, constraint: new SemverRange(constraint), source }
  }
  return { project: input, constraint: new SemverRange('*'), source }
}

// Package validation
function validatePackageRequirement(project: string, constraint: string, source: 'explicit' | 'inferred' = 'explicit'): PackageRequirement | undefined {
  try {
    return { project, constraint: new SemverRange(constraint), source }
  }
  catch {
    return undefined
  }
}

// Read lines utility
async function* readLines(filePath: string): AsyncGenerator<string> {
  try {
    const content = readFileSync(filePath, 'utf8')
    const lines = content.split('\n')
    for (const line of lines) {
      yield line
    }
  }
  catch {
    // If file can't be read, yield nothing

  }
}

// Memoization cache for dependency detection
const dependencyCache = new Map<string, string | null>()
const cacheTimestamps = new Map<string, number>()
const CACHE_TTL = 5000 // 5 seconds cache TTL

/**
 * Clear stale cache entries
 */
function clearStaleCache(): void {
  const now = Date.now()
  for (const [key, timestamp] of cacheTimestamps) {
    if (now - timestamp > CACHE_TTL) {
      dependencyCache.delete(key)
      cacheTimestamps.delete(key)
    }
  }
}

/**
 * Check if we have a valid cached result
 */
function getCachedResult(dir: string): string | null | undefined {
  clearStaleCache()
  const cached = dependencyCache.get(dir)
  if (cached !== undefined) {
    return cached
  }
  return undefined
}

/**
 * Cache a result
 */
function setCachedResult(dir: string, result: string | null): void {
  dependencyCache.set(dir, result)
  cacheTimestamps.set(dir, Date.now())
}

export default async function sniff(dir: SimplePath | { string: string }): Promise<{ pkgs: PackageRequirement[], env: Record<string, string>, services?: { enabled?: boolean, autoStart?: string[] } }> {
  const dirPath = dir instanceof SimplePath ? dir : new SimplePath(dir.string)

  if (!dirPath.isDirectory()) {
    throw new Error(`not a directory: ${dirPath.string}`)
  }

  // Check cache first
  const cachedResult = getCachedResult(dirPath.string)
  if (cachedResult !== undefined) {
    return cachedResult ? JSON.parse(cachedResult) : { pkgs: [], env: {}, services: undefined }
  }

  const constraint = new SemverRange('*')
  let has_package_json = false
  let has_bun_lock = false
  let has_deps_file = false
  let detected_pnpm_usage = false

  const pkgs: PackageRequirement[] = []
  const env: Record<string, string> = {}
  let services: { enabled?: boolean, autoStart?: string[] } | undefined

  for await (
    const [path, { name, isFile, isSymlink, isDirectory }] of dirPath.ls()
  ) {
    if (isFile || isSymlink) {
      switch (name) {
        case 'deno.json':
        case 'deno.jsonc':
          await deno(path)
          break
        case '.nvmrc':
        case '.node-version':
          await version_file(path, 'nodejs.org')
          break
        case '.ruby-version':
          await version_file(path, 'ruby-lang.org')
          break
        case '.python-version':
          await python_version(path)
          break
        case '.terraform-version':
          await terraform_version(path)
          break
        case 'package.json':
          await package_json(path)
          break
        case 'action.yml':
        case 'action.yaml':
          await github_actions(path)
          break
        case 'Cargo.toml':
          pkgs.push({ project: 'rust-lang.org', constraint, source: 'inferred' })
          await read_YAML_FM(path)
          break
        case 'skaffold.yaml':
          pkgs.push({ project: 'skaffold.dev', constraint, source: 'inferred' })
          await skaffold_yaml(path)
          break
        case 'go.mod':
        case 'go.sum':
          pkgs.push({ project: 'go.dev', constraint, source: 'inferred' })
          await read_YAML_FM(path)
          break
        case 'requirements.txt':
        case 'pipfile':
        case 'pipfile.lock':
        case 'setup.py':
          pkgs.push({ project: 'pip.pypa.io', constraint, source: 'inferred' })
          await read_YAML_FM(path)
          break
        case 'pyproject.toml':
          await pyproject(path)
          break
        case 'Gemfile':
          pkgs.push({ project: 'ruby-lang.org', constraint, source: 'inferred' })
          await read_YAML_FM(path)
          break
        case '.yarnrc':
          pkgs.push({ project: 'classic.yarnpkg.com', constraint, source: 'inferred' })
          await read_YAML_FM(path)
          break
        case 'yarn.lock':
          pkgs.push({ project: 'yarnpkg.com', constraint, source: 'inferred' })
          break
        case '.yarnrc.yml':
          pkgs.push({ project: 'yarnpkg.com', constraint, source: 'inferred' })
          await read_YAML_FM(path)
          break
        case 'bun.lock':
        case 'bun.lockb':
          has_bun_lock = true
          pkgs.push({ project: 'bun.sh', constraint: new SemverRange('>=1'), source: 'inferred' })
          break
        case 'pnpm-lock.yaml':
          detected_pnpm_usage = true
          pkgs.push({ project: 'pnpm.io', constraint, source: 'inferred' })
          break
        case 'pixi.toml':
          pkgs.push({ project: 'prefix.dev', constraint, source: 'inferred' })
          await read_YAML_FM(path)
          break
        case 'dependencies.yaml':
        case 'dependencies.yml':
        case '.dependencies.yml':
        case '.dependencies.yaml':
        case 'deps.yml':
        case 'deps.yaml':
        case '.deps.yml':
        case '.deps.yaml':
        case 'pkgx.yaml':
        case 'pkgx.yml':
        case '.pkgx.yml':
        case '.pkgx.yaml':
        case 'launchpad.yaml':
        case 'launchpad.yml':
        case '.launchpad.yml':
        case '.launchpad.yaml':
          has_deps_file = true
          await parse_well_formatted_node(await path.readYAML())
          break
        case 'cdk.json':
          pkgs.push({ project: 'aws.amazon.com/cdk', constraint, source: 'inferred' })
          break
        case 'justfile':
        case 'Justfile':
          pkgs.push({ project: 'just.systems', constraint, source: 'inferred' })
          break
        case 'Taskfile.yml':
          pkgs.push({ project: 'taskfile.dev', constraint, source: 'inferred' })
          break
        case 'uv.lock':
          pkgs.push({ project: 'astral.sh/uv', constraint, source: 'inferred' })
          break
      }
    }
    else if (isDirectory) {
      switch (name) {
        case '.git':
          // Only add git on non-macOS platforms (macOS has git built-in)
          if (process.platform !== 'darwin') {
            pkgs.push({ project: 'git-scm.org', constraint, source: 'inferred' })
          }
          break
        case '.hg':
          pkgs.push({ project: 'mercurial-scm.org', constraint, source: 'inferred' })
          break
        case '.svn':
          pkgs.push({ project: 'apache.org/subversion', constraint, source: 'inferred' })
          break
      }
    }
  }

  // Auto-install pnpm if detected usage but not explicitly installed
  if (detected_pnpm_usage && !pkgs.some(pkg => pkg.project === 'pnpm.io' || pkg.project === 'pnpm')) {
    pkgs.push({ project: 'pnpm.io', constraint, source: 'inferred' })
  }

  // Only auto-add nodejs.org if we have a package.json but no JS runtime is explicitly specified
  // This should not interfere with explicit dependencies defined in deps.yaml files
  const hasAnyJSRuntime = pkgs.some((pkg) => {
    // Check for any explicit JS runtime specification
    return pkg.project === 'bun.sh'
      || pkg.project === 'bun.com'
      || pkg.project === 'bun'
      || pkg.project === 'nodejs.org'
      || pkg.project === 'node'
      || pkg.project === 'deno.land'
      || pkg.project === 'deno.com'
      || pkg.project === 'deno'
      || pkg.project.includes('bun')
      || pkg.project.includes('nodejs')
      || pkg.project.includes('deno')
  })

  // Auto-infer nodejs.org only if:
  // 1. We have package.json
  // 2. No explicit JS runtime was specified
  // 3. No bun.lock is present (indicating Bun usage)
  // 4. No deps files are present (user controls dependencies explicitly)
  if (has_package_json && !hasAnyJSRuntime && !has_bun_lock && !has_deps_file) {
    // Use Node.js LTS (v22) for better compatibility with older OpenSSL versions
    const nodeConstraint = new SemverRange('^22')
    pkgs.push({ project: 'nodejs.org', constraint: nodeConstraint, source: 'inferred' })
  }

  // Optimized deduplication with source-aware priority
  // Priority: explicit > inferred, then by constraint specificity
  const packageMap = new Map<string, PackageRequirement>()

  // First pass: collect all packages by project
  const packagesByProject = new Map<string, PackageRequirement[]>()
  for (const pkg of pkgs) {
    const existing = packagesByProject.get(pkg.project) || []
    existing.push(pkg)
    packagesByProject.set(pkg.project, existing)
  }

  // Second pass: apply prioritization logic for each project
  for (const [project, projectPkgs] of packagesByProject) {
    // Separate explicit and inferred packages
    const explicitPkgs = projectPkgs.filter(pkg => pkg.source === 'explicit')
    const inferredPkgs = projectPkgs.filter(pkg => pkg.source === 'inferred')

    let selectedPkg: PackageRequirement

    // ALWAYS prefer explicit sources over inferred sources
    if (explicitPkgs.length > 0) {
      // If we have explicit packages, use the most specific one
      selectedPkg = explicitPkgs.reduce((best, current) => {
        const bestConstraint = best.constraint.toString()
        const currentConstraint = current.constraint.toString()

        // Prefer specific versions over ranges
        const isBestSpecific = /^\d+\.\d+(?:\.\d+)?$/.test(bestConstraint)
        const isCurrentSpecific = /^\d+\.\d+(?:\.\d+)?$/.test(currentConstraint)

        if (isCurrentSpecific && !isBestSpecific) {
          return current
        }

        // Prefer non-wildcard over wildcard
        if (bestConstraint === '*' && currentConstraint !== '*') {
          return current
        }

        return best
      })
    }
    else if (inferredPkgs.length > 0) {
      // If we only have inferred packages, use the most specific one
      selectedPkg = inferredPkgs.reduce((best, current) => {
        const bestConstraint = best.constraint.toString()
        const currentConstraint = current.constraint.toString()

        // Prefer specific versions over ranges
        const isBestSpecific = /^\d+\.\d+(?:\.\d+)?$/.test(bestConstraint)
        const isCurrentSpecific = /^\d+\.\d+(?:\.\d+)?$/.test(currentConstraint)

        if (isCurrentSpecific && !isBestSpecific) {
          return current
        }

        // Prefer non-wildcard over wildcard
        if (bestConstraint === '*' && currentConstraint !== '*') {
          return current
        }

        return best
      })
    }
    else {
      // This shouldn't happen, but use the first package as fallback
      selectedPkg = projectPkgs[0]
    }

    packageMap.set(project, selectedPkg)
  }

  const deduplicatedPkgs = Array.from(packageMap.values())

  // If services are not explicitly configured, derive from framework config when enabled
  if (!services?.enabled && shouldInferServices()) {
    const inferred = await inferServicesFromFramework(dirPath.string)
    if (inferred.autoStart.length > 0) {
      services = { enabled: true, autoStart: inferred.autoStart }
    }
  }

  const result = { pkgs: deduplicatedPkgs, env, services }

  // Cache the result
  setCachedResult(dirPath.string, JSON.stringify(result))

  return result

  // ---------------------------------------------- parsers
  async function deno(path: SimplePath) {
    pkgs.push({ project: 'deno.land', constraint, source: 'inferred' })
    const json = parseJSONC(await path.read())
    if (isPlainObject(json) && (json as any).pkgx) {
      let node = (json as any).pkgx
      if (isString(node) || isArray(node))
        node = { dependencies: node }
      await parse_well_formatted_node(node)
    }
  }

  async function version_file(path: SimplePath, project: string) {
    let s = (await path.read()).trim()
    if (s.startsWith('v'))
      s = s.slice(1) // v prefix has no effect but is allowed
    if (s.match(/^\d/))
      s = `@${s}` // bare versions are `@`ed
    s = `${project}${s}`
    pkgs.push(parsePackage(s, 'inferred'))
  }

  async function python_version(path: SimplePath) {
    const s = (await path.read()).trim()
    const lines = s.split('\n')
    for (let l of lines) {
      l = l.trim()
      if (!l)
        continue // skip empty lines
      if (l.startsWith('#'))
        continue // skip commented lines
      l = `python.org@${l}`
      try {
        pkgs.push(parsePackage(l, 'inferred'))
        break // only one thanks
      }
      catch {
        // noop pyenv sticks random shit in here
      }
    }
  }

  async function terraform_version(path: SimplePath) {
    const terraform_version = (await path.read()).trim()
    const package_descriptor = `terraform.io@${terraform_version}`
    pkgs.push(parsePackage(package_descriptor, 'inferred'))
  }

  async function package_json(path: SimplePath) {
    const json = JSON.parse(await path.read())

    // Collect all dependencies from different sources
    const allDependencies: Record<string, string> = {}

    // Process engines
    if (json?.engines) {
      if (json.engines.node)
        allDependencies['nodejs.org'] = json.engines.node
      if (json.engines.npm)
        allDependencies['npmjs.com'] = json.engines.npm
      if (json.engines.yarn)
        allDependencies['yarnpkg.com'] = json.engines.yarn
      if (json.engines.pnpm) {
        allDependencies['pnpm.io'] = json.engines.pnpm
        detected_pnpm_usage = true
      }
    }

    // Process packageManager (corepack)
    if (json?.packageManager) {
      const match = json.packageManager.match(
        /^(?<pkg>[^@]+)@(?<version>[^+]+)/,
      )

      if (match) {
        const { pkg, version } = match.groups as {
          pkg: string
          version: string
        }

        switch (pkg) {
          case 'npm':
            allDependencies['npmjs.com'] = version
            break
          case 'yarn':
            allDependencies['yarnpkg.com'] = version
            break
          case 'pnpm':
            detected_pnpm_usage = true
            allDependencies['pnpm.io'] = version
            break
        }
      }
    }

    // Process volta
    if (json?.volta) {
      if (json.volta.node)
        allDependencies['nodejs.org'] = json.volta.node
      if (json.volta.npm)
        allDependencies['npmjs.com'] = json.volta.npm
      if (json.volta.yarn)
        allDependencies['yarnpkg.com'] = json.volta.yarn
      if (json.volta.pnpm) {
        allDependencies['pnpm.io'] = json.volta.pnpm
        detected_pnpm_usage = true
      }
    }

    // Process pkgx section
    let pkgxNode = json?.pkgx
    if (isString(pkgxNode) || isArray(pkgxNode))
      pkgxNode = { dependencies: pkgxNode }

    if (pkgxNode?.dependencies) {
      if (isPlainObject(pkgxNode.dependencies)) {
        Object.assign(allDependencies, pkgxNode.dependencies)
      }
    }

    // Process package.json dependencies as inferred (not explicit)
    if (Object.keys(allDependencies).length > 0) {
      for (const [project, constraint] of Object.entries(allDependencies)) {
        try {
          let processedConstraint = constraint
          if (processedConstraint.endsWith('@latest')) {
            processedConstraint = processedConstraint.slice(0, -6)
          }
          if (/^@?latest$/.test(processedConstraint)) {
            processedConstraint = '*'
          }

          const requirement = validatePackageRequirement(project, processedConstraint, 'inferred')
          if (requirement) {
            pkgs.push(requirement)
          }
        }
        catch {
          // Skip invalid package specifications
        }
      }
    }

    // Process pkgx section if it exists (this should be explicit)
    if (pkgxNode && (pkgxNode.dependencies || pkgxNode.env)) {
      await parse_well_formatted_node(pkgxNode)
    }

    has_package_json = true
  }

  async function skaffold_yaml(path: SimplePath) {
    const yamls = await path.readYAMLAll() as unknown as any[]
    const lpkgs: PackageRequirement[] = []

    for (const yaml of yamls) {
      if (!isPlainObject(yaml))
        continue

      if (
        yaml.build?.local?.useDockerCLI?.toString() === 'true'
        || yaml.deploy?.docker
      ) {
        lpkgs.push({
          project: 'docker.com/cli',
          constraint: new SemverRange(`*`),
          source: 'inferred',
        })
      }
      if (yaml.deploy?.kubectl) {
        lpkgs.push({
          project: 'kubernetes.io/kubectl',
          constraint: new SemverRange(`*`),
          source: 'inferred',
        })
      }
      if (yaml.deploy?.kubeContext?.match('minikube')) {
        lpkgs.push({
          project: 'kubernetes.io/minikube',
          constraint: new SemverRange(`*`),
          source: 'inferred',
        })
      }
      if (yaml.deploy?.helm || yaml.manifests?.helm) {
        lpkgs.push({
          project: 'helm.sh',
          constraint: new SemverRange(`*`),
          source: 'inferred',
        })
      }
      if (yaml.deploy?.kpt || yaml.manifests?.kpt) {
        lpkgs.push({
          project: 'kpt.dev',
          constraint: new SemverRange(`*`),
          source: 'inferred',
        })
      }
      if (yaml.manifests?.kustomize) {
        lpkgs.push({
          project: 'kubernetes.io/kustomize',
          constraint: new SemverRange(`*`),
          source: 'inferred',
        })
      }
    }

    const deduped = Array.from(
      new Map(lpkgs.map(pkg => [pkg.project, pkg])).values(),
    )
    pkgs.push(...deduped)
  }

  async function github_actions(path: SimplePath) {
    const yaml = await path.readYAML()
    if (!isPlainObject(yaml))
      return
    const rv = yaml.runs?.using?.match(/node(\d+)/)
    if (rv?.[1]) {
      pkgs.push({
        project: 'nodejs.org',
        constraint: new SemverRange(`^${rv?.[1]}`),
        source: 'inferred',
      })
    }
    await parse_well_formatted_node(yaml.pkgx)
  }

  async function pyproject(path: SimplePath) {
    const content = await path.read()
    // Always add python.org for pyproject.toml files
    pkgs.push({ project: 'python.org', constraint, source: 'inferred' })

    // Also add the build system
    if (content.includes('poetry.core.masonry.api')) {
      pkgs.push({ project: 'python-poetry.org', constraint, source: 'inferred' })
    }
    else {
      pkgs.push({ project: 'pip.pypa.io', constraint, source: 'inferred' })
    }
    await read_YAML_FM(path)
  }

  // ---------------------------------------------- YAML FM utils

  async function read_YAML_FM(path: SimplePath) {
    let yaml: string | undefined

    for await (const line of readLines(path.string)) {
      if (yaml !== undefined) {
        if (/^(?:(?:#|\/\/)\s*)?---(?:\s*\*\/)?$/.test(line.trim())) {
          let node = parseYaml(yaml)
          if (isPlainObject(node) && node.pkgx) {
            node = isString(node.pkgx) || isArray(node.pkgx)
              ? { dependencies: node.pkgx }
              : node.pkgx
          }
          return await parse_well_formatted_node(node)
        }
        yaml += line?.replace(/^(#|\/\/)/, '')
        yaml += '\n'
      }
      else if (/^(?:(?:\/\*|#|\/\/)\s*)?---/.test(line.trim())) {
        yaml = ''
      }
    }
  }

  async function parse_well_formatted_node(obj: unknown) {
    if (!isPlainObject(obj)) {
      return
    }

    const yaml = await extract_well_formatted_entries(obj)

    for (let [k, v] of Object.entries(yaml.env)) {
      if (isNumber(v))
        v = v.toString()
      if (isString(v)) {
        env[k] = fix(v)
      }
    }

    pkgs.push(...yaml.deps)

    // Collect services configuration (last one wins)
    if (yaml.services) {
      services = yaml.services
    }

    // Support shorthand: services.infer: true (and deprecated: inferServices / framework)
    const wantsInference = (obj as any).services?.infer === true || (obj as any).inferServices === true || (obj as any).framework === true
    // Only infer when globally allowed by environment/config toggles
    if (wantsInference && shouldInferServices()) {
      if (!services || !services.enabled) {
        const inferred = await inferServicesFromFramework(dirPath.string)
        if (inferred.autoStart.length > 0) {
          services = { enabled: true, autoStart: inferred.autoStart }
        }
      }
    }

    function fix(input: string): string {
      // Simple variable replacement
      const replacements = [
        { from: '{{home}}', to: SimplePath.home().string },
        { from: '{{srcroot}}', to: dirPath.string },
      ]

      let result = input
      for (const { from, to } of replacements) {
        result = result.replace(new RegExp(from, 'g'), to)
      }

      validateDollarSignUsage(result)
      return result
    }
  }
}

function shouldInferServices(): boolean {
  // Controlled by config via env vars (wired in default config):
  // LAUNCHPAD_FRAMEWORKS_ENABLED and LAUNCHPAD_SERVICES_INFER
  const frameworksEnabled = process.env.LAUNCHPAD_FRAMEWORKS_ENABLED !== 'false'
  const inferServices = process.env.LAUNCHPAD_SERVICES_INFER !== 'false'
  const laravelEnabled = process.env.LAUNCHPAD_LARAVEL_ENABLED !== 'false'
  const stacksEnabled = process.env.LAUNCHPAD_STACKS_ENABLED !== 'false'
  return frameworksEnabled && inferServices && (laravelEnabled || stacksEnabled)
}

async function inferServicesFromFramework(projectDir: string): Promise<{ autoStart: string[] }> {
  const autoStart: string[] = []

  // Stacks/Laravel detection via presence of buddy or artisan and .env
  try {
    const artisanPath = join(projectDir, 'artisan')
    const buddyPath = join(projectDir, 'buddy')
    const envPath = join(projectDir, '.env')
    const hasArtisan = (() => {
      try {
        return statSync(artisanPath).isFile()
      }
      catch { return false }
    })()
    const hasBuddy = (() => {
      try {
        return statSync(buddyPath).isFile()
      }
      catch { return false }
    })()
    const hasEnv = statSync(envPath).isFile()
    if (!(hasArtisan || hasBuddy) || !hasEnv)
      return { autoStart }

    const envContent = readFileSync(envPath, 'utf8')
    const dbConn = getEnvValue(envContent, 'DB_CONNECTION')
    const cacheDriver = getEnvValue(envContent, 'CACHE_STORE') || getEnvValue(envContent, 'CACHE_DRIVER')

    // Database
    if (dbConn === 'pgsql' || dbConn === 'postgres' || dbConn === 'postgresql') {
      autoStart.push('postgres')
    }
    else if (dbConn === 'mysql' || dbConn === 'mariadb') {
      autoStart.push('mysql')
    }

    // Cache
    if (cacheDriver === 'redis') {
      autoStart.push('redis')
    }
    else if (cacheDriver === 'memcached') {
      autoStart.push('memcached')
    }
  }
  catch {
    // Ignore inference errors
  }

  // Deduplicate
  return { autoStart: Array.from(new Set(autoStart)) }
}

function getEnvValue(envContent: string, key: string): string | undefined {
  // Simple .env parser: supports KEY=VALUE, ignores commented lines
  const lines = envContent.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#'))
      continue
    const idx = trimmed.indexOf('=')
    if (idx === -1)
      continue
    const k = trimmed.substring(0, idx).trim()
    if (k !== key)
      continue
    let v = trimmed.substring(idx + 1).trim()
    // Strip quotes
    v = v.replace(/^['"]|['"]$/g, '')
    return v
  }
  return undefined
}

function validateDollarSignUsage(str: string): void {
  let currentIndex = 0

  while (true) {
    const nextIndex = str.indexOf('$', currentIndex)
    if (nextIndex === -1)
      break

    currentIndex = nextIndex
    const substring = str.substring(currentIndex)

    // Check for ${FOO} format
    const isValidCurlyFormat = /^\$\{[A-Z_]\w*\}/i.test(substring)
    // Check for $FOO format
    const isValidDirectFormat = /^\$[A-Z_]\w*/i.test(substring)

    if (!isValidCurlyFormat && !isValidDirectFormat) {
      throw new Error('Invalid dollar sign usage detected.')
    }

    // Move past this $ instance
    currentIndex++
  }
}

function extract_well_formatted_entries(
  yaml: PlainObject,
): { deps: PackageRequirement[], env: Record<string, unknown>, services?: { enabled?: boolean, autoStart?: string[] } } {
  // Extract top-level global flag
  const topLevelGlobal = yaml.global === true || yaml.global === 'true'
  const deps = parse_deps(yaml.dependencies, topLevelGlobal)
  const env = isPlainObject(yaml.env) ? yaml.env : {}

  // Extract services configuration
  let services: { enabled?: boolean, autoStart?: string[] } | undefined
  if (isPlainObject(yaml.services)) {
    services = {
      enabled: yaml.services.enabled === true,
      autoStart: Array.isArray(yaml.services.autoStart) ? yaml.services.autoStart : undefined,
    }
  }

  return { deps, env, services }
}

function parse_deps(node: unknown, topLevelGlobal = false) {
  if (isString(node))
    node = node.split(/\s+/).filter(x => x)

  function parse(input: string) {
    if (input.endsWith('@latest'))
      input = input.slice(0, -6)

    return parsePackage(input, 'explicit')
  }

  if (isArray(node)) {
    node = node.map(input => parse(input)).reduce((acc, curr) => {
      acc[curr.project] = curr.constraint.toString()
      return acc
    }, {} as Record<string, string>)
  }

  if (!isPlainObject(node)) {
    return []
  }

  return Object.entries(node)
    .map(([project, constraint]) => {
      // Handle object format: { version: "1.0.0", global: true }
      if (isPlainObject(constraint)) {
        const constraintObj = constraint as { version?: string, global?: boolean | string }
        const version = constraintObj.version || '*'
        // Handle both boolean and string values for global flag
        // Individual global flag overrides top-level global flag
        const hasIndividualGlobal = constraintObj.global === true || constraintObj.global === 'true' || constraintObj.global === false || constraintObj.global === 'false'
        const global = hasIndividualGlobal
          ? (constraintObj.global === true || constraintObj.global === 'true')
          : topLevelGlobal

        if (/^@?latest$/.test(version)) {
          const versionConstraint = '*'
          const requirement = validatePackageRequirement(project, versionConstraint, 'explicit')
          return requirement ? { ...requirement, global } : null
        }

        const requirement = validatePackageRequirement(project, version, 'explicit')
        return requirement ? { ...requirement, global } : null
      }

      // Handle string format: "1.0.0" (uses top-level global flag)
      if (/^@?latest$/.test(constraint))
        constraint = '*'
      const requirement = validatePackageRequirement(project, constraint, 'explicit')
      return requirement && topLevelGlobal ? { ...requirement, global: topLevelGlobal } : requirement
    })
    .filter(Boolean) as PackageRequirement[]
}

export const _internals: { validateDollarSignUsage: typeof validateDollarSignUsage } = {
  validateDollarSignUsage,
}
