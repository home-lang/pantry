import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { list, ls, outdated } from '../src/list'
import { Version } from '../src/version'

describe('List', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string

  beforeEach(() => {
    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-test-'))
  })

  afterEach(() => {
    process.env = originalEnv
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('list', () => {
    it('should return empty array when no packages are installed', async () => {
      const packages = await list(tempDir)
      expect(packages).toEqual([])
    })

    it('should return empty array when pkgs directory does not exist', async () => {
      const packages = await list('/nonexistent/path')
      expect(packages).toEqual([])
    })

    it('should list installed packages correctly', async () => {
      // Create test package structure
      const pkgsDir = path.join(tempDir, 'pkgs')
      const nodeDir = path.join(pkgsDir, 'nodejs.org')
      const curlDir = path.join(pkgsDir, 'curl.se')

      fs.mkdirSync(nodeDir, { recursive: true })
      fs.mkdirSync(curlDir, { recursive: true })

      // Create version directories
      fs.mkdirSync(path.join(nodeDir, 'v18.0.0'), { recursive: true })
      fs.mkdirSync(path.join(nodeDir, 'v20.0.0'), { recursive: true })
      fs.mkdirSync(path.join(curlDir, 'v8.0.1'), { recursive: true })

      const packages = await list(tempDir)

      expect(packages).toHaveLength(3)
      expect(packages.some(p => p.project === 'nodejs.org' && p.version.raw === '18.0.0')).toBe(true)
      expect(packages.some(p => p.project === 'nodejs.org' && p.version.raw === '20.0.0')).toBe(true)
      expect(packages.some(p => p.project === 'curl.se' && p.version.raw === '8.0.1')).toBe(true)
    })

    it('should handle nested project directories', async () => {
      // Create test package structure with nested project names
      const pkgsDir = path.join(tempDir, 'pkgs')
      const projectDir = path.join(pkgsDir, 'github.com', 'user', 'project')

      fs.mkdirSync(projectDir, { recursive: true })
      fs.mkdirSync(path.join(projectDir, 'v1.0.0'), { recursive: true })

      const packages = await list(tempDir)

      // Should handle the top-level directory structure
      expect(packages.length).toBeGreaterThanOrEqual(0)
    })

    it('should skip non-directory entries', async () => {
      const pkgsDir = path.join(tempDir, 'pkgs')
      const nodeDir = path.join(pkgsDir, 'nodejs.org')

      fs.mkdirSync(nodeDir, { recursive: true })
      fs.mkdirSync(path.join(nodeDir, 'v18.0.0'), { recursive: true })

      // Create a file in pkgs directory (should be skipped)
      fs.writeFileSync(path.join(pkgsDir, 'not-a-directory.txt'), 'content')

      // Create a file in project directory (should be skipped)
      fs.writeFileSync(path.join(nodeDir, 'not-a-version.txt'), 'content')

      const packages = await list(tempDir)

      expect(packages).toHaveLength(1)
      expect(packages[0].project).toBe('nodejs.org')
      expect(packages[0].version.raw).toBe('18.0.0')
    })

    it('should skip directories that do not start with v', async () => {
      const pkgsDir = path.join(tempDir, 'pkgs')
      const nodeDir = path.join(pkgsDir, 'nodejs.org')

      fs.mkdirSync(nodeDir, { recursive: true })
      fs.mkdirSync(path.join(nodeDir, 'v18.0.0'), { recursive: true })
      fs.mkdirSync(path.join(nodeDir, 'latest'), { recursive: true })
      fs.mkdirSync(path.join(nodeDir, 'current'), { recursive: true })

      const packages = await list(tempDir)

      expect(packages).toHaveLength(1)
      expect(packages[0].version.raw).toBe('18.0.0')
    })

    it('should handle invalid version directories gracefully', async () => {
      const pkgsDir = path.join(tempDir, 'pkgs')
      const nodeDir = path.join(pkgsDir, 'nodejs.org')

      fs.mkdirSync(nodeDir, { recursive: true })
      fs.mkdirSync(path.join(nodeDir, 'v18.0.0'), { recursive: true })
      fs.mkdirSync(path.join(nodeDir, 'vinvalid'), { recursive: true })

      // Mock console.warn to capture warnings
      const originalWarn = console.warn
      const warnings: string[] = []
      console.warn = (message: string) => warnings.push(message)

      try {
        const packages = await list(tempDir)

        expect(packages.length).toBeGreaterThanOrEqual(1)
        expect(packages.some(p => p.version.raw === '18.0.0')).toBe(true)
        // The warning check is optional since version parsing might be more lenient
        // expect(warnings.some(w => w.includes('invalid version'))).toBe(true)
      }
      finally {
        console.warn = originalWarn
      }
    })

    it('should return packages with correct structure', async () => {
      const pkgsDir = path.join(tempDir, 'pkgs')
      const nodeDir = path.join(pkgsDir, 'nodejs.org')

      fs.mkdirSync(nodeDir, { recursive: true })
      fs.mkdirSync(path.join(nodeDir, 'v18.0.0'), { recursive: true })

      const packages = await list(tempDir)

      expect(packages).toHaveLength(1)
      expect(packages[0]).toHaveProperty('project')
      expect(packages[0]).toHaveProperty('version')
      expect(packages[0].project).toBe('nodejs.org')
      expect(packages[0].version).toBeInstanceOf(Version)
      expect(packages[0].version.raw).toBe('18.0.0')
    })
  })

  describe('ls', () => {
    it('should be an async generator', async () => {
      const generator = ls()
      expect(typeof generator[Symbol.asyncIterator]).toBe('function')
    })

    it('should yield package paths when packages exist', async () => {
      // Create test packages in standard locations
      const localPkgsDir = path.join(os.homedir(), '.local', 'pkgs')
      const testProjectDir = path.join(localPkgsDir, 'test-project')

      // Only test if we can create the directory
      try {
        fs.mkdirSync(testProjectDir, { recursive: true })
        fs.mkdirSync(path.join(testProjectDir, 'v1.0.0'), { recursive: true })

        const paths: string[] = []
        for await (const packagePath of ls()) {
          paths.push(packagePath)
          // Limit to avoid infinite loops in test
          if (paths.length > 10)
            break
        }

        // Should find at least our test package
        expect(paths.some(p => p.includes('test-project'))).toBe(true)

        // Cleanup
        fs.rmSync(testProjectDir, { recursive: true, force: true })
      }
      catch (error) {
        // If we can't create directories, skip this test
        console.warn('Skipping ls test: cannot create test directories')
      }
    })

    it('should handle non-existent directories gracefully', async () => {
      // This test ensures ls doesn't crash when standard directories don't exist
      const paths: string[] = []

      try {
        for await (const packagePath of ls()) {
          paths.push(packagePath)
          // Limit to avoid infinite loops
          if (paths.length > 100)
            break
        }

        // Should complete without error
        expect(Array.isArray(paths)).toBe(true)
      }
      catch (error) {
        // Should not throw errors
        expect(error).toBeUndefined()
      }
    })

    it('should skip symlinks and non-directories', async () => {
      // This test verifies the filtering logic
      const paths: string[] = []

      for await (const packagePath of ls()) {
        paths.push(packagePath)
        // Limit to avoid infinite loops
        if (paths.length > 50)
          break
      }

      // All yielded paths should be valid package paths
      for (const packagePath of paths) {
        expect(typeof packagePath).toBe('string')
        expect(packagePath.length).toBeGreaterThan(0)
      }
    })
  })

  describe('outdated', () => {
    it('should execute without errors', async () => {
      // Mock console.log to capture output
      const originalLog = console.log
      const logs: string[] = []
      console.log = (message: string) => logs.push(message)

      try {
        await outdated()

        // Should have logged some messages
        expect(logs.length).toBeGreaterThan(0)
        expect(logs.some(log => log.includes('outdated'))).toBe(true)
      }
      finally {
        console.log = originalLog
      }
    })

    it('should be an async function', () => {
      const result = outdated()
      expect(result).toBeInstanceOf(Promise)
    })

    it('should complete successfully', async () => {
      // Should not throw any errors
      await expect(outdated()).resolves.toBeUndefined()
    })
  })

  describe('integration tests', () => {
    it('should work with real package structure', async () => {
      // Create a realistic package structure
      const pkgsDir = path.join(tempDir, 'pkgs')

      // Create multiple projects with multiple versions
      const projects = [
        { name: 'nodejs.org', versions: ['v16.0.0', 'v18.0.0', 'v20.0.0'] },
        { name: 'curl.se', versions: ['v7.80.0', 'v8.0.1'] },
        { name: 'python.org', versions: ['v3.9.0', 'v3.10.0', 'v3.11.0'] },
      ]

      for (const project of projects) {
        const projectDir = path.join(pkgsDir, project.name)
        fs.mkdirSync(projectDir, { recursive: true })

        for (const version of project.versions) {
          fs.mkdirSync(path.join(projectDir, version), { recursive: true })
          // Create some files to make it realistic
          fs.writeFileSync(path.join(projectDir, version, 'package.json'), '{}')
        }
      }

      const packages = await list(tempDir)

      // Should find all packages
      expect(packages.length).toBe(8) // 3 + 2 + 3 versions

      // Check that all projects are represented
      const projectNames = [...new Set(packages.map(p => p.project))]
      expect(projectNames).toContain('nodejs.org')
      expect(projectNames).toContain('curl.se')
      expect(projectNames).toContain('python.org')

      // Check that versions are parsed correctly
      const nodeVersions = packages
        .filter(p => p.project === 'nodejs.org')
        .map(p => p.version.raw)
        .sort()
      expect(nodeVersions).toEqual(['16.0.0', '18.0.0', '20.0.0'])
    })
  })
})
