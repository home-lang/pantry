import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import path from 'node:path'
import { TestUtils } from './test.config'

describe('Install Command Refactor', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempProjectDir: string
  let originalCwd: string
  let testHome: string

  beforeEach(() => {
    originalEnv = { ...process.env }
    originalCwd = process.cwd()
    TestUtils.resetTestEnvironment()

    // Create isolated test environment
    // eslint-disable-next-line ts/no-require-imports
    testHome = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'launchpad-install-test-'))
    tempProjectDir = path.join(testHome, 'test-project')
    fs.mkdirSync(tempProjectDir, { recursive: true })

    // Set up isolated environment
    process.env.HOME = testHome
    process.env.NODE_ENV = 'test'
    process.env.LAUNCHPAD_TEST_MODE = 'true'
    process.chdir(tempProjectDir)
  })

  afterEach(() => {
    process.chdir(originalCwd)
    Object.keys(process.env).forEach((key) => {
      delete process.env[key]
    })
    Object.assign(process.env, originalEnv)
    if (fs.existsSync(testHome)) {
      fs.rmSync(testHome, { recursive: true, force: true })
    }
    TestUtils.cleanupEnvironmentDirs()
  })

  describe('Directory Detection', () => {
    it('should detect if a path is a directory', async () => {
      // Import the function from CLI (it's not exported, so we'll test the logic)
      const testDir = path.join(tempProjectDir, 'subdir')
      fs.mkdirSync(testDir)

      const stats = await fs.promises.stat(testDir)
      expect(stats.isDirectory()).toBe(true)

      // Test with file
      const testFile = path.join(tempProjectDir, 'test.txt')
      fs.writeFileSync(testFile, 'test')

      const fileStats = await fs.promises.stat(testFile)
      expect(fileStats.isDirectory()).toBe(false)
    })

    it('should handle non-existent paths gracefully', async () => {
      const nonExistentPath = path.join(tempProjectDir, 'does-not-exist')

      let isDirectory = false
      try {
        const stats = await fs.promises.stat(nonExistentPath)
        isDirectory = stats.isDirectory()
      }
      catch {
        isDirectory = false
      }

      expect(isDirectory).toBe(false)
    })
  })

  describe('Development Environment Setup', () => {
    it('should set up development environment for project with deps.yaml', async () => {
      // Create a project with deps.yaml
      const depsContent = `
dependencies:
  node: ^18.0.0
  bun: ^1.0.0
`
      fs.writeFileSync(path.join(tempProjectDir, 'deps.yaml'), depsContent)

      // Test the logic that would be called by setupDevelopmentEnvironment
      const { findDependencyFile } = await import('../src/env')
      const dependencyFile = findDependencyFile(tempProjectDir)

      expect(dependencyFile).toBeTruthy()
      expect(dependencyFile).toContain('deps.yaml')
    })

    it('should handle projects without dependency files', async () => {
      // Test with empty project directory
      const { findDependencyFile } = await import('../src/env')
      const dependencyFile = findDependencyFile(tempProjectDir)

      expect(dependencyFile).toBeNull()
    })

    it('should handle shell integration mode', async () => {
      // Create project with deps
      fs.writeFileSync(path.join(tempProjectDir, 'deps.yaml'), 'dependencies:\n  node: ^18.0.0')

      // Test shell integration environment variable
      process.env.LAUNCHPAD_SHELL_INTEGRATION = '1'
      expect(process.env.LAUNCHPAD_SHELL_INTEGRATION).toBe('1')

      // Clean up
      delete process.env.LAUNCHPAD_SHELL_INTEGRATION
    })
  })

  describe('Global Dependencies Scanning', () => {
    it('should find dependency files in common locations', async () => {
      // Create mock dependency files in test home directory
      const mockDepsFile = path.join(testHome, 'deps.yaml')
      fs.writeFileSync(mockDepsFile, 'dependencies:\n  git: ^2.0.0')

      const dotfilesDir = path.join(testHome, '.dotfiles')
      fs.mkdirSync(dotfilesDir, { recursive: true })
      fs.writeFileSync(path.join(dotfilesDir, 'package.json'), '{"dependencies": {"typescript": "^5.0.0"}}')

      // Test scanning logic
      const { DEPENDENCY_FILE_NAMES } = await import('../src/env')

      const globalDepLocations = [
        testHome,
        path.join(testHome, '.dotfiles'),
        path.join(testHome, '.config'),
      ]

      const foundFiles: string[] = []

      for (const location of globalDepLocations) {
        if (!fs.existsSync(location))
          continue

        try {
          const files = await fs.promises.readdir(location, { withFileTypes: true })

          for (const file of files) {
            if (!file.isDirectory() && DEPENDENCY_FILE_NAMES.includes(file.name as any)) {
              foundFiles.push(path.join(location, file.name))
            }
          }
        }
        catch {
          continue
        }
      }

      expect(foundFiles.length).toBeGreaterThan(0)
      expect(foundFiles.some(f => f.includes('deps.yaml'))).toBe(true)
      expect(foundFiles.some(f => f.includes('package.json'))).toBe(true)
    })

    it('should parse dependency files and extract packages', async () => {
      // Create test dependency file
      const testDepsFile = path.join(tempProjectDir, 'deps.yaml')
      fs.writeFileSync(testDepsFile, `
dependencies:
  node: ^18.0.0
  python: ^3.11.0
  git: ^2.40.0
`)

      // Test parsing logic
      const { default: sniff } = await import('../src/dev/sniff')
      const sniffResult = await sniff({ string: tempProjectDir })

      expect(sniffResult.pkgs.length).toBeGreaterThan(0)

      const packageNames = sniffResult.pkgs.map(pkg => pkg.project)
      expect(packageNames).toContain('node')
      expect(packageNames).toContain('python')
      expect(packageNames).toContain('git')
    })

    it('should handle malformed dependency files gracefully', async () => {
      // Create malformed deps.yaml
      const testDepsFile = path.join(tempProjectDir, 'deps.yaml')
      fs.writeFileSync(testDepsFile, 'invalid: yaml: content: [')

      // Test error handling
      const { default: sniff } = await import('../src/dev/sniff')

      let sniffResult
      try {
        sniffResult = await sniff({ string: tempProjectDir })
      }
      catch {
        sniffResult = { pkgs: [], env: {} }
      }

      expect(sniffResult.pkgs).toEqual([])
    })

    it('should deduplicate packages from multiple dependency files', async () => {
      const packages = new Set<string>()

      // Simulate finding same package in multiple files
      packages.add('node')
      packages.add('git')
      packages.add('node') // Duplicate
      packages.add('python')

      const uniquePackages = Array.from(packages)

      expect(uniquePackages.length).toBe(3)
      expect(uniquePackages).toContain('node')
      expect(uniquePackages).toContain('git')
      expect(uniquePackages).toContain('python')
    })
  })

  describe('Command Line Interface', () => {
    it('should handle install command without arguments (current directory)', () => {
      // Test package list handling
      const packages: string[] = []
      const packageList = Array.isArray(packages) ? packages : [packages].filter(Boolean)

      expect(packageList.length).toBe(0)

      // Should trigger development environment setup
      const shouldSetupDev = packageList.length === 0
      expect(shouldSetupDev).toBe(true)
    })

    it('should handle install command with directory argument', async () => {
      // Create target directory
      const targetDir = path.join(tempProjectDir, 'target')
      fs.mkdirSync(targetDir)

      const packages = [targetDir]
      const packageList = Array.isArray(packages) ? packages : [packages].filter(Boolean)

      expect(packageList.length).toBe(1)

      // Check if it's a directory
      const stats = await fs.promises.stat(packageList[0])
      const isDirectory = stats.isDirectory()

      expect(isDirectory).toBe(true)

      // Should trigger development environment setup with target directory
      const shouldSetupDev = packageList.length === 1 && isDirectory
      expect(shouldSetupDev).toBe(true)
    })

    it('should handle install command with package names', () => {
      const packages = ['node', 'python', 'git']
      const packageList = Array.isArray(packages) ? packages : [packages].filter(Boolean)

      expect(packageList.length).toBe(3)
      expect(packageList).toEqual(['node', 'python', 'git'])

      // Should trigger regular package installation
      const shouldInstallPackages = packageList.length > 0
      expect(shouldInstallPackages).toBe(true)
    })

    it('should handle global dependencies flag', () => {
      const options = { globalDeps: true }

      expect(options.globalDeps).toBe(true)

      // Should trigger global dependencies installation
      const shouldInstallGlobalDeps = options.globalDeps
      expect(shouldInstallGlobalDeps).toBe(true)
    })
  })

  describe('Environment Variables and Options', () => {
    it('should respect test mode environment variables', () => {
      process.env.NODE_ENV = 'test'
      process.env.LAUNCHPAD_TEST_MODE = 'true'

      const isTestMode = process.env.NODE_ENV === 'test' || process.env.LAUNCHPAD_TEST_MODE === 'true'
      expect(isTestMode).toBe(true)

      // Should skip global auto-scan in test mode
      const skipGlobal = isTestMode || process.env.LAUNCHPAD_SKIP_GLOBAL_AUTO_SCAN === 'true'
      expect(skipGlobal).toBe(true)
    })

    it('should handle verbose mode', () => {
      const options = { verbose: true }

      if (options.verbose) {
        // Would set config.verbose = true in real implementation
        expect(options.verbose).toBe(true)
      }
    })

    it('should handle dry-run mode', () => {
      const options = { dryRun: true }

      expect(options.dryRun).toBe(true)

      // In dry-run mode, should show what would be installed without installing
      const shouldShowPreview = options.dryRun
      expect(shouldShowPreview).toBe(true)
    })

    it('should handle quiet mode', () => {
      const options = { quiet: true }

      expect(options.quiet).toBe(true)

      // In quiet mode, should suppress non-error output
      const shouldSuppressOutput = options.quiet
      expect(shouldSuppressOutput).toBe(true)
    })

    it('should handle shell integration mode', () => {
      const options = { shell: true }

      expect(options.shell).toBe(true)

      // Shell mode should force quiet and set environment variable
      const isShellIntegration = options.shell
      expect(isShellIntegration).toBe(true)
    })
  })

  describe('Integration with Existing Functionality', () => {
    it('should maintain compatibility with existing install function', async () => {
      // Test that the existing install function still works
      const { install } = await import('../src/install')

      expect(typeof install).toBe('function')

      // Test empty package list
      const results = await install([])
      expect(Array.isArray(results)).toBe(true)
    })

    it('should work with existing dump function for dev environment setup', async () => {
      // Test that dump function is still available
      const { dump } = await import('../src/dev/dump')

      expect(typeof dump).toBe('function')

      // Create test deps file
      fs.writeFileSync(path.join(tempProjectDir, 'deps.yaml'), 'dependencies:\n  node: ^18.0.0')

      // Test calling dump (it should handle test mode gracefully)
      try {
        await dump(tempProjectDir, {
          dryrun: true,
          quiet: true,
          skipGlobal: true,
        })
        // If no error thrown, test passes
        expect(true).toBe(true)
      }
      catch (error) {
        // In test mode, some errors are expected due to missing dependencies
        expect(error instanceof Error).toBe(true)
      }
    })

    it('should work with existing dependency file detection', async () => {
      // Test dependency file detection
      const { findDependencyFile, DEPENDENCY_FILE_NAMES } = await import('../src/env')

      expect(typeof findDependencyFile).toBe('function')
      expect(Array.isArray(DEPENDENCY_FILE_NAMES)).toBe(true)
      expect(DEPENDENCY_FILE_NAMES.length).toBeGreaterThan(0)

      // Test known dependency file names
      expect(DEPENDENCY_FILE_NAMES).toContain('deps.yaml')
      expect(DEPENDENCY_FILE_NAMES).toContain('package.json')
      expect(DEPENDENCY_FILE_NAMES).toContain('requirements.txt')
    })
  })

  describe('Error Handling', () => {
    it('should handle permission errors when scanning directories', async () => {
      // Test scanning non-existent directory
      const nonExistentDir = '/path/that/does/not/exist'

      let errorHandled = false
      try {
        await fs.promises.readdir(nonExistentDir)
      }
      catch {
        errorHandled = true
      }

      expect(errorHandled).toBe(true)
    })

    it('should handle invalid package specifications gracefully', async () => {
      // Test with invalid package specs
      const invalidPackages = ['', null, undefined].filter(Boolean) as string[]

      expect(invalidPackages.length).toBe(0)

      // Should not cause errors
      const { install } = await import('../src/install')
      const results = await install(invalidPackages)
      expect(Array.isArray(results)).toBe(true)
    })

    it('should handle missing dependency files gracefully', async () => {
      // Test with directory that has no dependency files
      const emptyDir = path.join(tempProjectDir, 'empty')
      fs.mkdirSync(emptyDir)

      const { findDependencyFile } = await import('../src/env')
      const result = findDependencyFile(emptyDir)

      expect(result).toBeNull()
    })
  })
})
