import type { PlainObject } from 'is-what'
import { semver } from 'bun'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { isArray, isNumber, isPlainObject, isString } from 'is-what'

// Define our own types to replace libpkgx types
export interface PackageRequirement {
  project: string
  constraint: SemverRange
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
        const value = trimmed.substring(colonIndex + 1).trim()

        // Remove quotes if present
        const cleanValue = value.replace(/^["']|["']$/g, '')

        if (cleanValue === '') {
          // This is the start of a nested object or array - we'll determine which when we see the content
          current.obj[key] = {}
          stack.push({ obj: current.obj[key], key: null, indent })
        }
        else {
          current.obj[key] = cleanValue
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
function parsePackage(input: string): PackageRequirement {
  // Simple package parsing logic
  const atIndex = input.lastIndexOf('@')
  if (atIndex > 0) {
    const project = input.substring(0, atIndex)
    const constraint = input.substring(atIndex + 1)
    return { project, constraint: new SemverRange(constraint) }
  }
  return { project: input, constraint: new SemverRange('*') }
}

// Package validation
function validatePackageRequirement(project: string, constraint: string): PackageRequirement | undefined {
  try {
    return { project, constraint: new SemverRange(constraint) }
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

export default async function sniff(dir: SimplePath | { string: string }): Promise<{ pkgs: PackageRequirement[], env: Record<string, string> }> {
  const dirPath = dir instanceof SimplePath ? dir : new SimplePath(dir.string)

  if (!dirPath.isDirectory()) {
    throw new Error(`not a directory: ${dirPath.string}`)
  }

  const constraint = new SemverRange('*')
  let has_package_json = false

  const pkgs: PackageRequirement[] = []
  const env: Record<string, string> = {}

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
          pkgs.push({ project: 'rust-lang.org', constraint })
          await read_YAML_FM(path)
          break
        case 'skaffold.yaml':
          pkgs.push({ project: 'skaffold.dev', constraint })
          await skaffold_yaml(path)
          break
        case 'go.mod':
        case 'go.sum':
          pkgs.push({ project: 'go.dev', constraint })
          await read_YAML_FM(path)
          break
        case 'requirements.txt':
        case 'pipfile':
        case 'pipfile.lock':
        case 'setup.py':
          pkgs.push({ project: 'pip.pypa.io', constraint })
          await read_YAML_FM(path)
          break
        case 'pyproject.toml':
          await pyproject(path)
          break
        case 'Gemfile':
          pkgs.push({ project: 'ruby-lang.org', constraint })
          await read_YAML_FM(path)
          break
        case '.yarnrc':
          pkgs.push({ project: 'classic.yarnpkg.com', constraint })
          await read_YAML_FM(path)
          break
        case 'yarn.lock':
          pkgs.push({ project: 'yarnpkg.com', constraint })
          break
        case '.yarnrc.yml':
          pkgs.push({ project: 'yarnpkg.com', constraint })
          await read_YAML_FM(path)
          break
        case 'bun.lock':
        case 'bun.lockb':
          pkgs.push({ project: 'bun.sh', constraint: new SemverRange('>=1') })
          break
        case 'pnpm-lock.yaml':
          pkgs.push({ project: 'pnpm.io', constraint })
          break
        case 'pixi.toml':
          pkgs.push({ project: 'prefix.dev', constraint })
          await read_YAML_FM(path)
          break
        case 'pkgx.yml':
        case 'pkgx.yaml':
        case '.pkgx.yml':
        case '.pkgx.yaml':
        case 'launchpad.yml':
        case 'launchpad.yaml':
        case '.launchpad.yml':
        case '.launchpad.yaml':
        case 'dependencies.yml':
        case 'dependencies.yaml':
        case '.dependencies.yml':
        case '.dependencies.yaml':
        case 'deps.yml':
        case 'deps.yaml':
        case '.deps.yml':
        case '.deps.yaml':
          await parse_well_formatted_node(await path.readYAML())
          break
        case 'cdk.json':
          pkgs.push({ project: 'aws.amazon.com/cdk', constraint })
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
      }
    }
    else if (isDirectory) {
      switch (name) {
        case '.git':
          // Only add git on non-macOS platforms (macOS has git built-in)
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

  if (
    has_package_json && !pkgs.some(pkg => pkg.project === 'bun.sh')
    && !pkgs.some(pkg => pkg.project === 'nodejs.org')
  ) {
    pkgs.push({ project: 'nodejs.org', constraint })
  }

  return { pkgs, env }

  // ---------------------------------------------- parsers
  async function deno(path: SimplePath) {
    pkgs.push({ project: 'deno.land', constraint })
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
    pkgs.push(parsePackage(s))
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
        pkgs.push(parsePackage(l))
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
    pkgs.push(parsePackage(package_descriptor))
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
      if (json.engines.pnpm)
        allDependencies['pnpm.io'] = json.engines.pnpm
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
      if (json.volta.pnpm)
        allDependencies['pnpm.io'] = json.volta.pnpm
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

    // Create the final node with all dependencies
    const node = Object.keys(allDependencies).length > 0
      ? { dependencies: allDependencies, ...(pkgxNode?.env && { env: pkgxNode.env }) }
      : pkgxNode

    await parse_well_formatted_node(node)
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
        })
      }
      if (yaml.deploy?.kubectl) {
        lpkgs.push({
          project: 'kubernetes.io/kubectl',
          constraint: new SemverRange(`*`),
        })
      }
      if (yaml.deploy?.kubeContext?.match('minikube')) {
        lpkgs.push({
          project: 'kubernetes.io/minikube',
          constraint: new SemverRange(`*`),
        })
      }
      if (yaml.deploy?.helm || yaml.manifests?.helm) {
        lpkgs.push({
          project: 'helm.sh',
          constraint: new SemverRange(`*`),
        })
      }
      if (yaml.deploy?.kpt || yaml.manifests?.kpt) {
        lpkgs.push({
          project: 'kpt.dev',
          constraint: new SemverRange(`*`),
        })
      }
      if (yaml.manifests?.kustomize) {
        lpkgs.push({
          project: 'kubernetes.io/kustomize',
          constraint: new SemverRange(`*`),
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
      })
    }
    await parse_well_formatted_node(yaml.pkgx)
  }

  async function pyproject(path: SimplePath) {
    const content = await path.read()
    // Always add python.org for pyproject.toml files
    pkgs.push({ project: 'python.org', constraint })

    // Also add the build system
    if (content.includes('poetry.core.masonry.api')) {
      pkgs.push({ project: 'python-poetry.org', constraint })
    }
    else {
      pkgs.push({ project: 'pip.pypa.io', constraint })
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
): { deps: PackageRequirement[], env: Record<string, unknown> } {
  const deps = parse_deps(yaml.dependencies)
  const env = isPlainObject(yaml.env) ? yaml.env : {}
  return { deps, env }
}

function parse_deps(node: unknown) {
  if (isString(node))
    node = node.split(/\s+/).filter(x => x)

  function parse(input: string) {
    if (input.endsWith('@latest'))
      input = input.slice(0, -6)

    return parsePackage(input)
  }

  if (isArray(node)) {
    node = node.map(parse).reduce((acc, curr) => {
      acc[curr.project] = curr.constraint.toString()
      return acc
    }, {} as Record<string, string>)
  }

  if (!isPlainObject(node)) {
    return []
  }

  return Object.entries(node)
    .map(([project, constraint]) => {
      if (/^@?latest$/.test(constraint))
        constraint = '*'
      return validatePackageRequirement(project, constraint)
    })
    .filter(Boolean) as PackageRequirement[]
}

export const _internals: { validateDollarSignUsage: typeof validateDollarSignUsage } = {
  validateDollarSignUsage,
}
