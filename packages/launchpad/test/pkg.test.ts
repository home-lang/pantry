import { test, expect, describe, mock, beforeEach, afterEach } from 'bun:test'
import * as path from 'node:path'
import * as fs from 'node:fs'
import * as os from 'node:os'
import { spawn, spawnSync } from 'node:child_process'
import { parseArgs } from 'node:util'
import type { PathLike } from 'node:fs'
import type { ChildProcessWithoutNullStreams } from 'node:child_process'

// Mock the config import
const mockConfig = {
  verbose: false,
}

// Create a mock module loader instead of using jest
const originalImport = globalThis.import
const mockModules: Record<string, any> = {
  '../src/config': { config: mockConfig }
}

// Override the dynamic import
// @ts-ignore - Overriding global import
globalThis.import = async (specifier: string) => {
  if (mockModules[specifier]) {
    return mockModules[specifier]
  }
  return originalImport(specifier)
}

// Create temp directory for tests
const TEST_DIR = path.join(os.tmpdir(), 'launchpad-test-' + Math.random().toString(36).substring(2))

// Mock functions with proper types
const mockSpawn = mock(function mockSpawnFn(command: string, args?: string[], options?: any): ChildProcessWithoutNullStreams {
  const mockProc = {
    stdout: {
      on: (event: string, callback: (data: any) => void) => {
        if (event === 'data') {
          setTimeout(() => {
            callback(JSON.stringify({
              pkgs: [{ path: '/usr/local/pkgs/node/v18.0.0', project: 'node', version: '18.0.0' }],
              env: {},
              runtime_env: { node: { PATH: '/usr/local/bin' } }
            }))
          }, 10)
        }
        return mockProc.stdout
      }
    },
    on: (event: string, callback: (code: number) => void) => {
      if (event === 'close') {
        setTimeout(() => {
          callback(0)
        }, 20)
      }
      return mockProc
    }
  } as unknown as ChildProcessWithoutNullStreams

  return mockProc
})

const mockSpawnSync = mock(function mockSpawnSyncFn(command: string, args?: string[], options?: any) {
  if (command.includes('pkgx') && args?.includes('--version')) {
    return { status: 0, stdout: 'pkgx 2.5.0' }
  }
  return { status: 0, stdout: '' }
})

// Mock file system functions with proper types
const mockFs = {
  existsSync: mock(function(path: PathLike): boolean {
    const pathStr = path.toString()
    if (pathStr.includes('pkgx')) return true
    if (pathStr.includes('.writable_test')) return false
    return false
  }),

  statSync: mock(function(path: PathLike, options?: any): fs.Stats {
    const pathStr = path.toString()
    return {
      isDirectory: () => pathStr.includes('pkgs'),
      isFile: () => pathStr.includes('bin/'),
    } as unknown as fs.Stats
  }),

  lstatSync: mock(function(path: PathLike): fs.Stats {
    const pathStr = path.toString()
    return {
      isSymbolicLink: () => pathStr.includes('v1'),
    } as unknown as fs.Stats
  }),

  readdirSync: mock(function(path: PathLike, options?: any): fs.Dirent[] {
    const pathStr = path.toString()
    if (pathStr.includes('pkgs')) {
      return [
        { name: 'v1.0.0', isDirectory: () => true, isSymbolicLink: () => false },
        { name: 'v2.0.0', isDirectory: () => true, isSymbolicLink: () => false },
      ] as unknown as fs.Dirent[]
    }
    return [] as fs.Dirent[]
  }),

  mkdirSync: mock(fs.mkdirSync),
  rmdirSync: mock(fs.rmdirSync),
  unlinkSync: mock(fs.unlinkSync),
  writeFileSync: mock(fs.writeFileSync),
  readFileSync: mock(fs.readFileSync),
  rmSync: mock(fs.rmSync),
  symlinkSync: mock(fs.symlinkSync),
  linkSync: mock(fs.linkSync),
  copyFileSync: mock(fs.copyFileSync),
  readlinkSync: mock(fs.readlinkSync),
}

// Mock process
const originalProcess = global.process
const mockProcess = {
  ...originalProcess,
  env: { ...originalProcess.env, PATH: '/usr/local/bin:/usr/bin:/bin' },
  exit: mock((code?: number) => { /* do nothing in tests */ }),
  getuid: mock(() => 0),
}

// Setup and teardown
beforeEach(() => {
  // Setup mock process
  global.process = mockProcess as any

  // Reset all mocks
  mockSpawn.mockReset()
  mockSpawnSync.mockReset()
  Object.values(mockFs).forEach(mockFn => {
    if (typeof mockFn.mockReset === 'function') {
      mockFn.mockReset()
    }
  })

  // Override fs functions in the global scope
  for (const [key, value] of Object.entries(mockFs)) {
    // @ts-ignore - Dynamic property assignment
    fs[key] = value
  }

  // Override spawn functions
  spawn.prototype = mockSpawn
  spawnSync.prototype = mockSpawnSync

  // Create test directory
  if (!fs.existsSync(TEST_DIR)) {
    fs.mkdirSync(TEST_DIR, { recursive: true })
  }
})

afterEach(() => {
  // Restore process
  global.process = originalProcess

  // Clean up test directory
  if (fs.existsSync(TEST_DIR)) {
    try {
      fs.rmSync(TEST_DIR, { recursive: true, force: true })
    } catch (err) {
      console.error('Failed to clean up test directory:', err)
    }
  }

  // Restore the original import
  // @ts-ignore - Restoring global import
  globalThis.import = originalImport
})

// Import the module under test - we need to dynamically import it to ensure mocks are set up first
let pkg: typeof import('../src/pkg')

test('Module imports correctly', async () => {
  pkg = await import('../src/pkg')
  expect(pkg).toBeDefined()
  expect(typeof pkg.run).toBe('function')
  expect(typeof pkg.install).toBe('function')
  expect(typeof pkg.shim).toBe('function')
  expect(typeof pkg.uninstall).toBe('function')
  expect(typeof pkg.ls).toBe('function')
  expect(typeof pkg.update).toBe('function')
  expect(typeof pkg.outdated).toBe('function')
})

describe('Version class', () => {
  test('parses version strings correctly', async () => {
    pkg = await import('../src/pkg')

    // We need to get access to the Version class from the module
    // This is a bit hacky but allows us to test the internal Version class
    // @ts-ignore - Accessing private class
    const Version = pkg.Version || Object.values(pkg).find(
      val => typeof val === 'function' && val.toString().includes('constructor(version)')
    )

    if (!Version) {
      throw new Error('Version class not found in pkg module')
    }

    const v1 = new Version('1.2.3')
    expect(v1.major).toBe(1)
    expect(v1.minor).toBe(2)
    expect(v1.patch).toBe(3)
    expect(v1.toString()).toBe('1.2.3')

    const v2 = new Version('v2.3.4')
    expect(v2.major).toBe(2)
    expect(v2.minor).toBe(3)
    expect(v2.patch).toBe(4)
    expect(v2.toString()).toBe('v2.3.4')
  })
})

describe('Path class', () => {
  test('provides path manipulation utilities', async () => {
    pkg = await import('../src/pkg')

    // Access the Path class from the module
    // @ts-ignore - Accessing private class
    const Path = pkg.Path || Object.values(pkg).find(
      val => typeof val === 'function' && val.toString().includes('join(...parts)')
    )

    if (!Path) {
      throw new Error('Path class not found in pkg module')
    }

    const testPath = new Path('/test/path')
    expect(testPath.string).toBe('/test/path')

    const joined = testPath.join('subdir', 'file.txt')
    expect(joined.string).toBe('/test/path/subdir/file.txt')

    expect(Path.home().string).toBe(os.homedir())

    const parent = testPath.join('subdir').parent()
    expect(parent.string).toBe('/test/path')

    const base = testPath.join('file.txt').basename()
    expect(base).toBe('file.txt')
  })
})

describe('run function', () => {
  test('prints help text when --help flag is provided', async () => {
    pkg = await import('../src/pkg')

    await pkg.run(['--help'])

    expect(mockSpawnSync).toHaveBeenCalledTimes(1)
    expect(mockSpawnSync.mock.calls[0][0]).toBe('pkgx')
    expect(mockSpawnSync.mock.calls[0][1]).toContain('glow')
  })

  test('displays version when --version flag is provided', async () => {
    pkg = await import('../src/pkg')
    const consoleSpy = mock(console.log)

    await pkg.run(['--version'])

    expect(consoleSpy).toHaveBeenCalledWith('launchpad 0.0.0+dev')
    consoleSpy.mockRestore()
  })
})

describe('install function', () => {
  test('installs a package', async () => {
    pkg = await import('../src/pkg')

    mockFs.existsSync.mockImplementation((path: PathLike): boolean => {
      const pathStr = path.toString()
      if (pathStr.includes('pkgx')) return true
      if (pathStr.includes('/usr/local')) return true
      return false
    })

    // Mock the function to check writability
    mockFs.mkdirSync.mockImplementation(() => undefined)
    mockFs.rmdirSync.mockImplementation(() => undefined)

    const installResult = await pkg.install(['node'], '/usr/local')

    expect(mockSpawn).toHaveBeenCalled()
    expect(installResult).toBeInstanceOf(Array)
  })

  test('throws error when no packages are specified', async () => {
    pkg = await import('../src/pkg')

    await pkg.install([], '/usr/local')

    expect(mockProcess.exit).toHaveBeenCalledWith(1)
  })
})

describe('shim function', () => {
  test('creates shims for a package', async () => {
    pkg = await import('../src/pkg')

    mockFs.existsSync.mockImplementation((path: PathLike): boolean => {
      const pathStr = path.toString()
      if (pathStr.includes('pkgx')) return true
      if (pathStr.includes('/bin/')) return false
      return true
    })

    mockFs.readdirSync.mockImplementation((path: PathLike): any => {
      const pathStr = path.toString()
      if (pathStr.includes('/bin')) {
        return [
          { name: 'node', isFile: () => true, isSymbolicLink: () => false },
          { name: 'npm', isFile: () => true, isSymbolicLink: () => false },
        ]
      }
      return []
    })

    const consoleSpy = mock(console.log)

    await pkg.shim(['node'], '/usr/local')

    expect(mockFs.mkdirSync).toHaveBeenCalled()
    expect(mockFs.writeFileSync).toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })
})

describe('uninstall function', () => {
  test('uninstalls a package', async () => {
    pkg = await import('../src/pkg')

    mockFs.existsSync.mockImplementation((path: PathLike): boolean => {
      const pathStr = path.toString()
      if (pathStr.includes('pkgx')) return true
      if (pathStr.includes('/usr/local')) return true
      if (pathStr.includes('/pkgs/node')) return true
      return false
    })

    mockFs.statSync.mockImplementation((path: PathLike): any => {
      const pathStr = path.toString()
      return {
        isDirectory: () => pathStr.includes('pkgs/node'),
        isFile: () => pathStr.includes('bin/'),
      }
    })

    const result = await pkg.uninstall('node')

    expect(mockFs.rmSync).toHaveBeenCalled()
    expect(result).toBe(true)
  })

  test('handles non-existent package', async () => {
    pkg = await import('../src/pkg')

    mockFs.statSync.mockImplementation((path: PathLike): any => {
      return {
        isDirectory: () => false,
        isFile: () => false,
      }
    })

    const consoleSpy = mock(console.error)

    const result = await pkg.uninstall('nonexistent')

    expect(consoleSpy).toHaveBeenCalled()
    expect(result).toBe(false)

    consoleSpy.mockRestore()
  })
})

describe('ls function', () => {
  test('lists installed packages', async () => {
    pkg = await import('../src/pkg')

    mockFs.existsSync.mockImplementation((path: PathLike): boolean => {
      const pathStr = path.toString()
      if (pathStr.includes('/usr/local/pkgs')) return true
      return false
    })

    mockFs.statSync.mockImplementation((path: PathLike): any => {
      const pathStr = path.toString()
      return {
        isDirectory: () => pathStr.includes('pkgs'),
        isFile: () => pathStr.includes('bin/'),
      }
    })

    mockFs.readdirSync.mockImplementation((path: PathLike): any => {
      const pathStr = path.toString()
      if (pathStr.includes('/usr/local/pkgs')) {
        return [
          { name: 'node', isDirectory: () => true, isSymbolicLink: () => false },
        ]
      }
      if (pathStr.includes('/usr/local/pkgs/node')) {
        return [
          { name: 'v18.0.0', isDirectory: () => true, isSymbolicLink: () => false },
        ]
      }
      return []
    })

    // Mock the Path.ls method
    const pathLsMock = mock(function* () {
      yield [
        { string: '/usr/local/pkgs/node/v18.0.0' },
        { name: 'v18.0.0', isDirectory: true, isSymlink: false },
      ]
    })

    // @ts-ignore - Accessing private class
    const Path = pkg.Path || Object.values(pkg).find(
      val => typeof val === 'function' && val.toString().includes('join(...parts)')
    )

    // Replace the ls method with our mock
    const originalLs = Path.prototype.ls
    Path.prototype.ls = pathLsMock

    const packages = []
    for await (const pkgPath of pkg.ls()) {
      packages.push(pkgPath)
    }

    expect(packages.length).toBeGreaterThan(0)
    expect(packages[0]).toContain('/usr/local/pkgs')

    // Restore original ls method
    Path.prototype.ls = originalLs
  })
})

describe('update and outdated functions', () => {
  test('update function logs message', async () => {
    pkg = await import('../src/pkg')

    const consoleSpy = mock(console.log)

    await pkg.update()

    expect(consoleSpy).toHaveBeenCalledTimes(2)
    expect(consoleSpy.mock.calls[0][0]).toBe('Updating packages...')

    consoleSpy.mockRestore()
  })

  test('outdated function logs message', async () => {
    pkg = await import('../src/pkg')

    const consoleSpy = mock(console.log)

    await pkg.outdated()

    expect(consoleSpy).toHaveBeenCalledTimes(2)
    expect(consoleSpy.mock.calls[0][0]).toBe('Checking for outdated packages...')

    consoleSpy.mockRestore()
  })
})

describe('semver functionality', () => {
  test('version comparison works correctly', async () => {
    // Import Bun's semver directly
    const { semver } = Bun

    // Test basic comparison
    expect(semver.order('1.0.0', '2.0.0')).toBe(-1)
    expect(semver.order('2.0.0', '1.0.0')).toBe(1)
    expect(semver.order('1.0.0', '1.0.0')).toBe(0)

    // Test version satisfies
    expect(semver.satisfies('1.2.3', '^1.0.0')).toBe(true)
    expect(semver.satisfies('2.0.0', '^1.0.0')).toBe(false)
  })

  test('create_v_symlinks creates correct symlinks', async () => {
    pkg = await import('../src/pkg')

    // Get access to the private function
    // @ts-ignore - Accessing private function
    const create_v_symlinks = pkg.create_v_symlinks || Object.values(pkg).find(
      val => typeof val === 'function' && val.toString().includes('create_v_symlinks')
    )

    if (!create_v_symlinks) {
      throw new Error('create_v_symlinks function not found in pkg module')
    }

    mockFs.existsSync.mockImplementation(() => false)
    mockFs.symlinkSync.mockImplementation(() => undefined)

    mockFs.readdirSync.mockImplementation((): any => [
      { name: 'v1.0.0', isSymbolicLink: () => false, isDirectory: () => true },
      { name: 'v1.1.0', isSymbolicLink: () => false, isDirectory: () => true },
      { name: 'v2.0.0', isSymbolicLink: () => false, isDirectory: () => true },
    ])

    await create_v_symlinks('/usr/local/pkgs/node/v2.0.0')

    // Should create symlinks for major versions
    expect(mockFs.symlinkSync).toHaveBeenCalledTimes(2)
  })
})

describe('utility functions', () => {
  test('standardPath returns correct path', async () => {
    pkg = await import('../src/pkg')

    // Get access to the private function
    // @ts-ignore - Accessing private function
    const standardPath = pkg.standardPath || Object.values(pkg).find(
      val => typeof val === 'function' && val.toString().includes('standardPath')
    )

    if (!standardPath) {
      throw new Error('standardPath function not found in pkg module')
    }

    const path = standardPath()

    // Should include standard paths
    expect(path).toContain('/usr/local/bin')
    expect(path).toContain('/usr/bin')
    expect(path).toContain('/bin')

    // Should include homebrew path on macOS
    if (os.platform() === 'darwin') {
      expect(path).toContain('/opt/homebrew/bin')
    }
  })

  test('install_prefix returns correct path', async () => {
    pkg = await import('../src/pkg')

    // Get access to the private function
    // @ts-ignore - Accessing private function
    const install_prefix = pkg.install_prefix || Object.values(pkg).find(
      val => typeof val === 'function' && val.toString().includes('install_prefix')
    )

    if (!install_prefix) {
      throw new Error('install_prefix function not found in pkg module')
    }

    // Mock directory writability
    mockFs.mkdirSync.mockImplementation(() => undefined)
    mockFs.rmdirSync.mockImplementation(() => undefined)
    mockFs.existsSync.mockImplementation((path: PathLike): boolean => {
      return path.toString().includes('/usr/local')
    })

    const prefix = install_prefix()

    // Should be /usr/local if writable
    expect(prefix.string).toBe('/usr/local')

    // Should be ~/.local if /usr/local is not writable
    mockFs.mkdirSync.mockImplementation((path: any) => {
      if (path.toString().includes('/usr/local')) {
        throw new Error('Permission denied')
      }
    })

    const fallbackPrefix = install_prefix()
    expect(fallbackPrefix.string).toContain('.local')
  })

  test('dev_stub_text generates correct script', async () => {
    pkg = await import('../src/pkg')

    // Get access to the private function
    // @ts-ignore - Accessing private function
    const dev_stub_text = pkg.dev_stub_text || Object.values(pkg).find(
      val => typeof val === 'function' && val.toString().includes('dev_stub_text')
    )

    if (!dev_stub_text) {
      throw new Error('dev_stub_text function not found in pkg module')
    }

    // For non-dev paths, should return simple exec
    const simplePath = '/home/user/.local/bin/node'
    const simpleText = dev_stub_text(simplePath, '/home/user/.local/pkgs/node/v18.0.0/bin', 'node')
    expect(simpleText).toBe(`exec /home/user/.local/pkgs/node/v18.0.0/bin/node "$@"`)

    // For /usr/local paths (except dev), should return complex script
    const usrLocalPath = '/usr/local/bin/node'
    const complexText = dev_stub_text(usrLocalPath, '/usr/local/pkgs/node/v18.0.0/bin', 'node')
    expect(complexText).toContain('dev_check()')
    expect(complexText).toContain('exec /usr/local/pkgs/node/v18.0.0/bin/node "$@"')
  })
})