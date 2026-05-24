/**
 * Pantry dependency inspector — lockfile + on-disk analysis.
 * Zero runtime dependencies beyond Node/Bun builtins.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'

export interface LockPackage {
  name?: string
  version?: string
  source?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  bin?: Record<string, string> | string
}

export interface LockData {
  version?: string
  lockfileVersion?: number
  workspaces?: Record<string, {
    name?: string
    version?: string
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
    system?: Record<string, string>
  }>
  packages?: Record<string, LockPackage>
}

export interface ProjectAnalysis {
  projectRoot: string
  projectName: string
  lockPath: string
  lockData: LockData
  workspaces: Array<{ path: string, name: string, version?: string, depCount: number, devCount: number, systemCount: number }>
  totalPkgs: number
  pantryPkgs: number
  npmPkgs: number
  linkedPkgs: number
  depGraph: Record<string, string[]>
  reverseDepGraph: Record<string, string[]>
  depths: Record<string, number>
  maxDepth: number
  transitiveCounts: Record<string, number>
  mostDepended: Array<{ name: string, count: number, dependents: string[] }>
  heaviestChains: Array<{ name: string, count: number }>
  depthEntries: Array<[string, number]>
  depthDist: Record<string, number>
  sourceEntries: Array<[string, number]>
  diskTotalFormatted: string
  packageList: Array<{
    key: string
    name: string
    version: string
    source: string
    depCount: number
    transitive: number
    depth: number
    dependents: number
    hasBin: boolean
    isLinked: boolean
    peerDeps: number
    diskBytes?: number
  }>
  diskTotalBytes: number
  diskScanned: number
  duplicateVersions: Array<{ name: string, versions: string[] }>
  graphNodes: Array<{ id: string, type: string, depCount: number, inDegree?: number, diskBytes?: number }>
  graphEdges: Array<{ from: string, to: string, type: string }>
}

export function formatSize(bytes: number): string {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${bytes} B`
}

export function findProjectRoot(start?: string): string {
  let projectRoot = start || process.env.PANTRY_PROJECT_ROOT || process.cwd()
  let searchDir = projectRoot
  while (searchDir !== '/') {
    if (existsSync(join(searchDir, 'pantry.lock'))) {
      return searchDir
    }
    searchDir = dirname(searchDir)
  }
  return projectRoot
}

export function loadLockfile(projectRoot: string): { lockPath: string, lockData: LockData } {
  const lockPath = join(projectRoot, 'pantry.lock')
  let lockData: LockData = { workspaces: {}, packages: {} }
  if (existsSync(lockPath)) {
    try {
      lockData = JSON.parse(readFileSync(lockPath, 'utf-8')) as LockData
    }
    catch {
      // keep empty
    }
  }
  return { lockPath, lockData }
}

/** Sum file sizes under a directory (skips symlinks, caps depth). */
function dirSize(dir: string, maxDepth = 12, depth = 0): number {
  if (!existsSync(dir) || depth > maxDepth) return 0
  let total = 0
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isSymbolicLink()) continue
      if (entry.isDirectory()) {
        total += dirSize(full, maxDepth, depth + 1)
      }
      else if (entry.isFile()) {
        try {
          total += statSync(full).size
        }
        catch {
          // skip unreadable
        }
      }
    }
  }
  catch {
    // skip unreadable dirs
  }
  return total
}

/** Resolve on-disk install path for a package name (pantry flat layout). */
export function resolvePackageDir(projectRoot: string, name: string): string | null {
  const candidates: string[] = []
  if (name.startsWith('@')) {
    const parts = name.split('/')
    if (parts.length >= 2) {
      candidates.push(
        join(projectRoot, 'pantry', parts[0], parts[1]),
        join(projectRoot, 'node_modules', parts[0], parts[1]),
      )
    }
  }
  else {
    candidates.push(
      join(projectRoot, 'pantry', name),
      join(projectRoot, 'node_modules', name),
      join(projectRoot, 'pantry', 'node_modules', name),
    )
  }
  for (const c of candidates) {
    if (existsSync(join(c, 'package.json'))) return c
  }
  return null
}

export function scanDiskSizes(projectRoot: string, packageNames: string[], limit = 800): Record<string, number> {
  const sizes: Record<string, number> = {}
  const names = packageNames.slice(0, limit)
  for (const name of names) {
    const dir = resolvePackageDir(projectRoot, name)
    if (dir) sizes[name] = dirSize(dir)
  }
  return sizes
}

function buildGraph(lockData: LockData) {
  const allPackages = Object.entries(lockData.packages || {})
  const depGraph: Record<string, string[]> = {}
  const reverseDepGraph: Record<string, string[]> = {}

  allPackages.forEach(([, pkg]) => {
    const n = pkg.name || ''
    if (!n) return
    const deps = Object.keys(pkg.dependencies || {})
    depGraph[n] = deps
    deps.forEach((d) => {
      if (!reverseDepGraph[d]) reverseDepGraph[d] = []
      reverseDepGraph[d].push(n)
    })
  })

  return { allPackages, depGraph, reverseDepGraph }
}

function computeDepths(lockData: LockData, allPackages: Array<[string, LockPackage]>) {
  const depths: Record<string, number> = {}
  const queue: string[] = []
  const workspaces = Object.entries(lockData.workspaces || {})

  workspaces.forEach(([, ws]) => {
    const allDeps = { ...ws.dependencies, ...ws.devDependencies }
    Object.keys(allDeps).forEach((d) => {
      if (depths[d] === undefined) {
        depths[d] = 1
        queue.push(d)
      }
    })
  })

  while (queue.length > 0) {
    const current = queue.shift()!
    const pkg = allPackages.find(([, v]) => v.name === current)
    if (pkg) {
      Object.keys(pkg[1].dependencies || {}).forEach((d) => {
        if (depths[d] === undefined) {
          depths[d] = depths[current] + 1
          queue.push(d)
        }
      })
    }
  }

  return depths
}

function getTransitiveDeps(name: string, allPackages: Array<[string, LockPackage]>, visited: Set<string>): Set<string> {
  if (visited.has(name)) return visited
  visited.add(name)
  const pkg = allPackages.find(([, v]) => v.name === name)
  if (pkg) {
    Object.keys(pkg[1].dependencies || {}).forEach(d => getTransitiveDeps(d, allPackages, visited))
  }
  return visited
}

export function analyzeProject(startDir?: string): ProjectAnalysis {
  const projectRoot = findProjectRoot(startDir)
  const { lockPath, lockData } = loadLockfile(projectRoot)
  const projectName = projectRoot.split('/').pop() || 'project'

  const { allPackages, depGraph, reverseDepGraph } = buildGraph(lockData)
  const depths = computeDepths(lockData, allPackages)
  const maxDepth = Math.max(...Object.values(depths).map(Number), 1)

  const transitiveCounts: Record<string, number> = {}
  allPackages.forEach(([, pkg]) => {
    if (!pkg.name) return
    const visited = new Set<string>()
    getTransitiveDeps(pkg.name, allPackages, visited)
    visited.delete(pkg.name)
    transitiveCounts[pkg.name] = visited.size
  })

  const pantryPkgs = allPackages.filter(([, v]) => v.source === 'pantry')
  const npmPkgs = allPackages.filter(([, v]) => v.source === 'npm')
  const linkedPkgs = allPackages.filter(([, v]) => v.source === 'npm' && (v.version || '').startsWith('link:'))

  const mostDepended = Object.entries(reverseDepGraph)
    .map(([name, dependents]) => ({ name, count: dependents.length, dependents }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const heaviestChains = Object.entries(transitiveCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const depthDist: Record<number, number> = {}
  Object.values(depths).forEach((d) => { depthDist[d] = (depthDist[d] || 0) + 1 })
  const depthDistStr: Record<string, number> = {}
  Object.entries(depthDist).forEach(([k, v]) => { depthDistStr[String(k)] = v })
  const depthEntries = Object.entries(depthDistStr)
    .map(([k, v]) => [k, v] as [string, number])
    .sort((a, b) => Number(a[0]) - Number(b[0]))

  const sourceDistMap = {
    pantry: pantryPkgs.length,
    npm: npmPkgs.length - linkedPkgs.length,
    linked: linkedPkgs.length,
  }
  const sourceEntries = Object.entries(sourceDistMap).filter(([, v]) => v > 0) as Array<[string, number]>

  const uniqueNames = [...new Set(allPackages.map(([, p]) => p.name).filter(Boolean))] as string[]
  const diskSizes = scanDiskSizes(projectRoot, uniqueNames)
  let diskTotalBytes = 0
  let diskScanned = 0
  for (const bytes of Object.values(diskSizes)) {
    diskTotalBytes += bytes
    diskScanned++
  }

  const versionByName: Record<string, Set<string>> = {}
  allPackages.forEach(([, pkg]) => {
    if (!pkg.name) return
    if (!versionByName[pkg.name]) versionByName[pkg.name] = new Set()
    versionByName[pkg.name].add((pkg.version || '').replace(/^\^|~/, ''))
  })
  const duplicateVersions = Object.entries(versionByName)
    .filter(([, vers]) => vers.size > 1)
    .map(([name, vers]) => ({ name, versions: [...vers] }))
    .sort((a, b) => b.versions.length - a.versions.length)
    .slice(0, 20)

  const packageList = allPackages
    .map(([key, pkg]) => ({
      key,
      name: pkg.name || key,
      version: (pkg.version || '').replace(/^\^|~/, ''),
      source: pkg.source || 'unknown',
      depCount: Object.keys(pkg.dependencies || {}).length,
      transitive: transitiveCounts[pkg.name || ''] || 0,
      depth: depths[pkg.name || ''] || 0,
      dependents: (reverseDepGraph[pkg.name || ''] || []).length,
      hasBin: !!pkg.bin,
      isLinked: (pkg.version || '').startsWith('link:'),
      peerDeps: Object.keys(pkg.peerDependencies || {}).length,
      diskBytes: pkg.name ? diskSizes[pkg.name] : undefined,
    }))
    .sort((a, b) => b.dependents - a.dependents || b.transitive - a.transitive)

  const workspaces = Object.entries(lockData.workspaces || {}).map(([wsPath, ws]) => ({
    path: wsPath || '(root)',
    name: ws.name || wsPath || 'root',
    version: ws.version,
    depCount: Object.keys(ws.dependencies || {}).length,
    devCount: Object.keys(ws.devDependencies || {}).length,
    systemCount: Object.keys(ws.system || {}).length,
  }))

  const nodes: ProjectAnalysis['graphNodes'] = []
  const edges: ProjectAnalysis['graphEdges'] = []
  const nodeSet = new Set<string>()

  Object.entries(lockData.workspaces || {}).forEach(([wsPath, ws]) => {
    const name = ws.name || wsPath || 'root'
    if (!nodeSet.has(name)) {
      nodeSet.add(name)
      nodes.push({ id: name, type: 'workspace', depCount: Object.keys({ ...ws.dependencies, ...ws.devDependencies }).length })
    }
    const allDeps = { ...ws.dependencies, ...ws.devDependencies }
    Object.keys(allDeps).forEach((dep) => {
      edges.push({ from: name, to: dep, type: ws.devDependencies?.[dep] ? 'dev' : 'prod' })
    })
  })

  allPackages.forEach(([, pkg]) => {
    const name = pkg.name || ''
    if (!name) return
    if (!nodeSet.has(name)) {
      nodeSet.add(name)
      nodes.push({
        id: name,
        type: pkg.source || 'unknown',
        depCount: Object.keys(pkg.dependencies || {}).length,
        diskBytes: diskSizes[name],
      })
    }
    Object.keys(pkg.dependencies || {}).forEach((dep) => {
      edges.push({ from: name, to: dep, type: 'prod' })
      if (!nodeSet.has(dep)) {
        nodeSet.add(dep)
        nodes.push({ id: dep, type: 'unknown', depCount: 0 })
      }
    })
  })

  const inDegree: Record<string, number> = {}
  edges.forEach((e) => { inDegree[e.to] = (inDegree[e.to] || 0) + 1 })
  nodes.forEach((n) => { n.inDegree = inDegree[n.id] || 0 })

  return {
    projectRoot,
    projectName,
    lockPath,
    lockData,
    workspaces,
    totalPkgs: allPackages.length,
    pantryPkgs: pantryPkgs.length,
    npmPkgs: npmPkgs.length - linkedPkgs.length,
    linkedPkgs: linkedPkgs.length,
    depGraph,
    reverseDepGraph,
    depths,
    maxDepth,
    transitiveCounts,
    mostDepended,
    heaviestChains,
    depthEntries,
    depthDist: depthDistStr,
    sourceEntries,
    diskTotalFormatted: formatSize(diskTotalBytes),
    packageList,
    diskTotalBytes,
    diskScanned,
    duplicateVersions,
    graphNodes: nodes,
    graphEdges: edges,
  }
}
