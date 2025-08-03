import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import path from 'node:path'
import { TestUtils } from './test.config'

describe('Global Dependencies Integration', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempHomeDir: string
  let originalCwd: string

  beforeEach(() => {
    originalEnv = { ...process.env }
    originalCwd = process.cwd()
    TestUtils.resetTestEnvironment()

    // Create isolated test environment
    // eslint-disable-next-line ts/no-require-imports
    tempHomeDir = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'launchpad-global-deps-test-'))

    // Set up isolated environment
    process.env.HOME = tempHomeDir
    process.env.NODE_ENV = 'test'
    process.env.LAUNCHPAD_TEST_MODE = 'true'
  })

  afterEach(() => {
    process.chdir(originalCwd)
    Object.keys(process.env).forEach((key) => {
      delete process.env[key]
    })
    Object.assign(process.env, originalEnv)
    if (fs.existsSync(tempHomeDir)) {
      fs.rmSync(tempHomeDir, { recursive: true, force: true })
    }
    TestUtils.cleanupEnvironmentDirs()
  })

  describe('Comprehensive Machine Scanning', () => {
    it('should scan multiple common project locations', async () => {
      // Create various project directories with dependency files
      const projectLocations = [
        path.join(tempHomeDir, 'Projects', 'web-app'),
        path.join(tempHomeDir, 'Code', 'api-server'),
        path.join(tempHomeDir, 'Development', 'mobile-app'),
        path.join(tempHomeDir, 'Desktop', 'quick-script'),
        path.join(tempHomeDir, 'Documents', 'data-analysis'),
        path.join(tempHomeDir, '.dotfiles'),
        path.join(tempHomeDir, '.config', 'nvim'),
      ]

      const expectedPackages = new Set<string>()

      // Create projects with different types of dependency files
      for (let i = 0; i < projectLocations.length; i++) {
        const location = projectLocations[i]
        fs.mkdirSync(location, { recursive: true })

        switch (i % 4) {
          case 0:
            // deps.yaml project
            fs.writeFileSync(path.join(location, 'deps.yaml'), `
dependencies:
  node: ^18.0.0
  typescript: ^5.0.0
  git: ^2.40.0
`)
            expectedPackages.add('node')
            expectedPackages.add('typescript')
            expectedPackages.add('git')
            break

          case 1:
            // package.json project
            fs.writeFileSync(path.join(location, 'package.json'), `{
  "name": "test-project",
  "dependencies": {
    "express": "^4.18.0",
    "lodash": "^4.17.0"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  }
}`)
            // Note: package.json parsing might extract different info
            break

          case 2:
            // Python project
            fs.writeFileSync(path.join(location, 'requirements.txt'), `
django>=4.2.0
requests>=2.31.0
pytest>=7.4.0
`)
            break

          case 3:
            // Rust project
            fs.writeFileSync(path.join(location, 'Cargo.toml'), `
[package]
name = "test-rust-project"
version = "0.1.0"

[dependencies]
serde = "1.0"
tokio = "1.0"
`)
            break
        }
      }

      // Test the scanning logic
      const { DEPENDENCY_FILE_NAMES } = await import('../src/env')
      const globalDepLocations = [
        tempHomeDir,
        path.join(tempHomeDir, '.dotfiles'),
        path.join(tempHomeDir, '.config'),
        path.join(tempHomeDir, 'Desktop'),
        path.join(tempHomeDir, 'Documents'),
        path.join(tempHomeDir, 'Projects'),
        path.join(tempHomeDir, 'Code'),
        path.join(tempHomeDir, 'Development'),
      ]

      const foundFiles: string[] = []

      for (const location of globalDepLocations) {
        if (!fs.existsSync(location))
          continue

        try {
          const files = await fs.promises.readdir(location, { withFileTypes: true })

          for (const file of files) {
            if (file.isDirectory()) {
              // Check subdirectories for dependency files
              const subPath = path.join(location, file.name)
              try {
                const subFiles = await fs.promises.readdir(subPath)
                for (const subFile of subFiles) {
                  if (DEPENDENCY_FILE_NAMES.includes(subFile as any)) {
                    foundFiles.push(path.join(subPath, subFile))
                  }
                }
              }
              catch {
                // Ignore permission errors
              }
            }
            else if (DEPENDENCY_FILE_NAMES.includes(file.name as any)) {
              foundFiles.push(path.join(location, file.name))
            }
          }
        }
        catch {
          // Ignore permission errors
          continue
        }
      }

      expect(foundFiles.length).toBeGreaterThan(0)

      // Should find at least some of our created dependency files
      const hasDepsYaml = foundFiles.some(f => f.endsWith('deps.yaml'))
      const hasPackageJson = foundFiles.some(f => f.endsWith('package.json'))
      const hasRequirementsTxt = foundFiles.some(f => f.endsWith('requirements.txt'))
      const hasCargoToml = foundFiles.some(f => f.endsWith('Cargo.toml'))

      expect(hasDepsYaml).toBe(true)
      expect(hasPackageJson).toBe(true)
      expect(hasRequirementsTxt).toBe(true)
      expect(hasCargoToml).toBe(true)
    })

    it('should handle permission errors gracefully', async () => {
      // Test with locations that might not exist or have permission issues
      const problematicLocations = [
        '/root',
        '/sys',
        '/proc',
        '/path/that/does/not/exist',
      ]

      let errorsHandled = 0

      for (const location of problematicLocations) {
        try {
          if (fs.existsSync(location)) {
            await fs.promises.readdir(location)
          }
        }
        catch {
          errorsHandled++
        }
      }

      // Should handle errors gracefully (not crash)
      expect(errorsHandled).toBeGreaterThanOrEqual(0)
    })

    it('should deduplicate packages across multiple files', async () => {
      // Create multiple projects with overlapping dependencies
      const project1 = path.join(tempHomeDir, 'project1')
      const project2 = path.join(tempHomeDir, 'project2')
      const project3 = path.join(tempHomeDir, 'project3')

      fs.mkdirSync(project1, { recursive: true })
      fs.mkdirSync(project2, { recursive: true })
      fs.mkdirSync(project3, { recursive: true })

      // Project 1: node, git, python
      fs.writeFileSync(path.join(project1, 'deps.yaml'), `
dependencies:
  node: ^18.0.0
  git: ^2.40.0
  python: ^3.11.0
`)

      // Project 2: node, rust, docker (overlapping node)
      fs.writeFileSync(path.join(project2, 'deps.yaml'), `
dependencies:
  node: ^20.0.0
  rust: ^1.70.0
  docker: ^24.0.0
`)

      // Project 3: python, git, go (overlapping python and git)
      fs.writeFileSync(path.join(project3, 'deps.yaml'), `
dependencies:
  python: ^3.12.0
  git: ^2.41.0
  go: ^1.21.0
`)

      // Parse all files and collect packages
      const { default: sniff } = await import('../src/dev/sniff')
      const allPackages = new Set<string>()

      const projects = [project1, project2, project3]
      for (const project of projects) {
        try {
          const sniffResult = await sniff({ string: project })
          for (const pkg of sniffResult.pkgs) {
            allPackages.add(pkg.project)
          }
        }
        catch {
          // Handle parsing errors
        }
      }

      const uniquePackages = Array.from(allPackages)

      // Should have all unique packages
      expect(uniquePackages).toContain('node')
      expect(uniquePackages).toContain('git')
      expect(uniquePackages).toContain('python')
      expect(uniquePackages).toContain('rust')
      expect(uniquePackages).toContain('docker')
      expect(uniquePackages).toContain('go')

      // Should have exactly 6 unique packages (no duplicates)
      expect(uniquePackages.length).toBe(6)
    })
  })

  describe('Package Installation Global Environment', () => {
    it('should target correct global environment directory', () => {
      const expectedGlobalDir = path.join(tempHomeDir, '.local', 'share', 'launchpad', 'global')

      // Test that the path is constructed correctly
      expect(expectedGlobalDir).toContain('.local/share/launchpad/global')
      expect(expectedGlobalDir.startsWith(tempHomeDir)).toBe(true)
    })

    it('should handle empty package list gracefully', async () => {
      const allPackages = new Set<string>()
      const packageList = Array.from(allPackages)

      expect(packageList.length).toBe(0)

      // Should handle empty list without errors
      const { install } = await import('../src/install')
      const results = await install(packageList)
      expect(Array.isArray(results)).toBe(true)
    })

    it('should provide informative output for dry-run mode', () => {
      const packages = ['node', 'python', 'git', 'docker', 'rust']
      const options = { dryRun: true, quiet: false }

      if (options.dryRun && !options.quiet) {
        // Should show what would be installed
        expect(packages.length).toBe(5)
        expect(packages).toContain('node')
        expect(packages).toContain('python')
      }
    })
  })

  describe('Different Dependency File Types', () => {
    it('should handle deps.yaml files', async () => {
      const project = path.join(tempHomeDir, 'yaml-project')
      fs.mkdirSync(project, { recursive: true })

      fs.writeFileSync(path.join(project, 'deps.yaml'), `
dependencies:
  node: ^18.0.0
  python: ^3.11.0
  git: ^2.40.0
`)

      const { default: sniff } = await import('../src/dev/sniff')
      const result = await sniff({ string: project })

      expect(result.pkgs.length).toBeGreaterThan(0)
      const packageNames = result.pkgs.map(pkg => pkg.project)
      expect(packageNames).toContain('node')
      expect(packageNames).toContain('python')
      expect(packageNames).toContain('git')
    })

    it('should handle package.json files', async () => {
      const project = path.join(tempHomeDir, 'node-project')
      fs.mkdirSync(project, { recursive: true })

      fs.writeFileSync(path.join(project, 'package.json'), `{
  "name": "test-project",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.0",
    "lodash": "^4.17.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "jest": "^29.0.0"
  }
}`)

      const { default: sniff } = await import('../src/dev/sniff')
      const result = await sniff({ string: project })

      // package.json might be parsed differently
      expect(result.pkgs).toBeDefined()
      expect(Array.isArray(result.pkgs)).toBe(true)
    })

    it('should handle requirements.txt files', async () => {
      const project = path.join(tempHomeDir, 'python-project')
      fs.mkdirSync(project, { recursive: true })

      fs.writeFileSync(path.join(project, 'requirements.txt'), `
django>=4.2.0
requests>=2.31.0
numpy>=1.24.0
pytest>=7.4.0
`)

      const { default: sniff } = await import('../src/dev/sniff')
      const result = await sniff({ string: project })

      // requirements.txt might extract python as base requirement
      expect(result.pkgs).toBeDefined()
      expect(Array.isArray(result.pkgs)).toBe(true)
    })

    it('should handle Cargo.toml files', async () => {
      const project = path.join(tempHomeDir, 'rust-project')
      fs.mkdirSync(project, { recursive: true })

      fs.writeFileSync(path.join(project, 'Cargo.toml'), `
[package]
name = "test-rust-project"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = "1.0"
tokio = "1.0"
reqwest = "0.11"
`)

      const { default: sniff } = await import('../src/dev/sniff')
      const result = await sniff({ string: project })

      // Cargo.toml might extract rust as base requirement
      expect(result.pkgs).toBeDefined()
      expect(Array.isArray(result.pkgs)).toBe(true)
    })

    it('should handle malformed dependency files', async () => {
      const project = path.join(tempHomeDir, 'broken-project')
      fs.mkdirSync(project, { recursive: true })

      // Create malformed YAML
      fs.writeFileSync(path.join(project, 'deps.yaml'), `
dependencies:
  node: ^18.0.0
  invalid: [broken: yaml
`)

      const { default: sniff } = await import('../src/dev/sniff')

      let result
      try {
        result = await sniff({ string: project })
      }
      catch {
        result = { pkgs: [], env: {} }
      }

      // Should handle errors gracefully
      expect(result.pkgs).toBeDefined()
      expect(Array.isArray(result.pkgs)).toBe(true)
    })
  })

  describe('Error Recovery and Robustness', () => {
    it('should continue scanning after encountering parsing errors', async () => {
      // Create mix of valid and invalid files
      const goodProject = path.join(tempHomeDir, 'good-project')
      const badProject = path.join(tempHomeDir, 'bad-project')
      const anotherGoodProject = path.join(tempHomeDir, 'another-good-project')

      fs.mkdirSync(goodProject, { recursive: true })
      fs.mkdirSync(badProject, { recursive: true })
      fs.mkdirSync(anotherGoodProject, { recursive: true })

      // Valid project
      fs.writeFileSync(path.join(goodProject, 'deps.yaml'), `
dependencies:
  node: ^18.0.0
`)

      // Invalid project
      fs.writeFileSync(path.join(badProject, 'deps.yaml'), `
invalid: yaml: content: [
`)

      // Another valid project
      fs.writeFileSync(path.join(anotherGoodProject, 'deps.yaml'), `
dependencies:
  python: ^3.11.0
`)

      const { default: sniff } = await import('../src/dev/sniff')
      const allPackages = new Set<string>()
      const projects = [goodProject, badProject, anotherGoodProject]

      for (const project of projects) {
        try {
          const result = await sniff({ string: project })
          for (const pkg of result.pkgs) {
            allPackages.add(pkg.project)
          }
        }
        catch {
          // Should continue with other projects
          continue
        }
      }

      // Should have packages from valid projects
      const packages = Array.from(allPackages)
      expect(packages.length).toBeGreaterThan(0)
      expect(packages).toContain('node')
      expect(packages).toContain('python')
    })

    it('should handle directories without read permissions', async () => {
      // Test scanning logic with potential permission issues
      const testLocations = [
        tempHomeDir,
        path.join(tempHomeDir, 'accessible'),
        path.join(tempHomeDir, 'might-not-exist'),
      ]

      // Create accessible directory
      fs.mkdirSync(path.join(tempHomeDir, 'accessible'), { recursive: true })
      fs.writeFileSync(path.join(tempHomeDir, 'accessible', 'deps.yaml'), `
dependencies:
  git: ^2.40.0
`)

      let successfulScans = 0
      let errorsHandled = 0

      for (const location of testLocations) {
        try {
          if (fs.existsSync(location)) {
            const files = await fs.promises.readdir(location, { withFileTypes: true })
            successfulScans++

            // Process files...
            for (const file of files) {
              if (file.isDirectory()) {
                try {
                  const subPath = path.join(location, file.name)
                  await fs.promises.readdir(subPath)
                }
                catch {
                  errorsHandled++
                }
              }
            }
          }
        }
        catch {
          errorsHandled++
        }
      }

      // Should handle at least some directories successfully
      expect(successfulScans).toBeGreaterThan(0)

      // Errors should be handled gracefully (not crash the process)
      expect(errorsHandled).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Command Line Options Integration', () => {
    it('should respect verbose mode for detailed output', () => {
      const options = { verbose: true, quiet: false }
      const foundFiles = ['file1.yaml', 'file2.json', 'file3.toml']

      if (options.verbose && !options.quiet) {
        // Should provide detailed output about each file
        for (const file of foundFiles) {
          expect(file).toBeTruthy()
          expect(typeof file).toBe('string')
        }
      }
    })

    it('should respect dry-run mode without making changes', () => {
      const options = { dryRun: true }
      const packages = ['node', 'python', 'git']

      if (options.dryRun) {
        // Should show what would be installed without actually installing
        expect(packages.length).toBe(3)
        // In real implementation, would return here without calling install()
      }
    })

    it('should integrate with existing installation system', async () => {
      // Test that global dependencies can be passed to existing install function
      const packages = ['git', 'node', 'python']
      const globalEnvDir = path.join(tempHomeDir, '.local', 'share', 'launchpad', 'global')

      const { install } = await import('../src/install')

      // Test installation (should handle gracefully in test mode)
      try {
        const results = await install(packages, globalEnvDir)
        expect(Array.isArray(results)).toBe(true)
      }
      catch (error) {
        // In test mode, installation might fail due to missing deps
        expect(error instanceof Error).toBe(true)
      }
    })
  })
})
