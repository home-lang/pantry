import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { shellcode } from '../src/dev/shellcode'
import { DEPENDENCY_FILE_NAMES, findDependencyFile } from '../src/env'

describe('Project File Detection', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-test-'))
  })

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('DEPENDENCY_FILE_NAMES constant', () => {
    it('should include all major project file types', () => {
      const expectedFiles = [
        // Launchpad-specific files
        'dependencies.yaml',
        'dependencies.yml',
        'deps.yaml',
        'deps.yml',
        'pkgx.yaml',
        'pkgx.yml',
        'launchpad.yaml',
        'launchpad.yml',

        // Node.js/JavaScript
        'package.json',

        // Python
        'pyproject.toml',
        'requirements.txt',
        'setup.py',
        'Pipfile',
        'Pipfile.lock',

        // Rust
        'Cargo.toml',

        // Go
        'go.mod',
        'go.sum',

        // Ruby
        'Gemfile',

        // Deno
        'deno.json',
        'deno.jsonc',

        // GitHub Actions
        'action.yml',
        'action.yaml',

        // Kubernetes/Docker
        'skaffold.yaml',
        'skaffold.yml',

        // Version files
        '.nvmrc',
        '.node-version',
        '.ruby-version',
        '.python-version',
        '.terraform-version',

        // Package managers
        'yarn.lock',
        'bun.lockb',
        '.yarnrc',
      ]

      for (const file of expectedFiles) {
        expect(DEPENDENCY_FILE_NAMES).toContain(file)
      }
    })
  })

  describe('findDependencyFile function', () => {
    const testCases = [
      // Launchpad-specific files (highest priority)
      { file: 'dependencies.yaml', type: 'Launchpad dependencies' },
      { file: 'dependencies.yml', type: 'Launchpad dependencies (yml)' },
      { file: 'deps.yaml', type: 'Launchpad deps' },
      { file: 'deps.yml', type: 'Launchpad deps (yml)' },
      { file: 'pkgx.yaml', type: 'pkgx' },
      { file: 'pkgx.yml', type: 'pkgx (yml)' },
      { file: 'launchpad.yaml', type: 'Launchpad config' },
      { file: 'launchpad.yml', type: 'Launchpad config (yml)' },

      // Node.js/JavaScript projects
      { file: 'package.json', type: 'Node.js project' },

      // Python projects
      { file: 'pyproject.toml', type: 'Python project (pyproject.toml)' },
      { file: 'requirements.txt', type: 'Python project (requirements.txt)' },
      { file: 'setup.py', type: 'Python project (setup.py)' },
      { file: 'Pipfile', type: 'Python project (Pipfile)' },
      { file: 'Pipfile.lock', type: 'Python project (Pipfile.lock)' },

      // Rust projects
      { file: 'Cargo.toml', type: 'Rust project' },

      // Go projects
      { file: 'go.mod', type: 'Go project (go.mod)' },
      { file: 'go.sum', type: 'Go project (go.sum)' },

      // Ruby projects
      { file: 'Gemfile', type: 'Ruby project' },

      // Deno projects
      { file: 'deno.json', type: 'Deno project (deno.json)' },
      { file: 'deno.jsonc', type: 'Deno project (deno.jsonc)' },

      // GitHub Actions
      { file: 'action.yml', type: 'GitHub Action (yml)' },
      { file: 'action.yaml', type: 'GitHub Action (yaml)' },

      // Kubernetes/Docker
      { file: 'skaffold.yaml', type: 'Skaffold project (yaml)' },
      { file: 'skaffold.yml', type: 'Skaffold project (yml)' },

      // Version files
      { file: '.nvmrc', type: 'Node version file' },
      { file: '.node-version', type: 'Node version file (alternative)' },
      { file: '.ruby-version', type: 'Ruby version file' },
      { file: '.python-version', type: 'Python version file' },
      { file: '.terraform-version', type: 'Terraform version file' },

      // Package managers
      { file: 'yarn.lock', type: 'Yarn lockfile' },
      { file: 'bun.lockb', type: 'Bun lockfile' },
      { file: '.yarnrc', type: 'Yarn config' },
    ]

    testCases.forEach(({ file, type }) => {
      it(`should detect ${type} (${file})`, () => {
        const filePath = path.join(tempDir, file)
        fs.writeFileSync(filePath, `# Test content for ${file}`)

        const result = findDependencyFile(tempDir)
        expect(result).toBe(filePath)
      })
    })

    it('should prioritize Launchpad files over other project files', () => {
      // Create multiple project files
      fs.writeFileSync(path.join(tempDir, 'package.json'), '{}')
      fs.writeFileSync(path.join(tempDir, 'Cargo.toml'), '[package]')
      fs.writeFileSync(path.join(tempDir, 'dependencies.yaml'), 'dependencies: []')

      const result = findDependencyFile(tempDir)
      expect(result).toBe(path.join(tempDir, 'dependencies.yaml'))
    })

    it('should find files in ancestor directories when searchAncestors is true', () => {
      const subDir = path.join(tempDir, 'subdir')
      fs.mkdirSync(subDir)

      const filePath = path.join(tempDir, 'package.json')
      fs.writeFileSync(filePath, '{}')

      const result = findDependencyFile(subDir, true)
      expect(result).toBe(filePath)
    })

    it('should not find files in ancestor directories when searchAncestors is false', () => {
      const subDir = path.join(tempDir, 'subdir')
      fs.mkdirSync(subDir)

      fs.writeFileSync(path.join(tempDir, 'package.json'), '{}')

      const result = findDependencyFile(subDir, false)
      expect(result).toBeNull()
    })

    it('should return null when no dependency files are found', () => {
      const result = findDependencyFile(tempDir)
      expect(result).toBeNull()
    })
  })

  describe('Shellcode integration', () => {
    it('should generate shellcode that supports all project file types', () => {
      const code = shellcode(true) // test mode

      // Check that the shellcode includes detection for all major project types
      expect(code).toContain('pyproject.toml')
      expect(code).toContain('requirements.txt')
      expect(code).toContain('Cargo.toml')
      expect(code).toContain('go.mod')
      expect(code).toContain('Gemfile')
      expect(code).toContain('deno.json')
      expect(code).toContain('action.yml')
      expect(code).toContain('skaffold.yaml')
      expect(code).toContain('.nvmrc')
      expect(code).toContain('yarn.lock')
      expect(code).toContain('bun.lockb')
    })

    it('should maintain proper priority order in shellcode', () => {
      const code = shellcode(true)

      // Launchpad files should be checked first
      const launchpadIndex = code.indexOf('dependencies')
      const packageJsonIndex = code.indexOf('package.json')
      const cargoIndex = code.indexOf('Cargo.toml')

      expect(launchpadIndex).toBeGreaterThan(0)
      expect(packageJsonIndex).toBeGreaterThan(launchpadIndex)
      expect(cargoIndex).toBeGreaterThan(packageJsonIndex)
    })
  })

  describe('Performance and caching', () => {
    it('should handle directories with many files efficiently', () => {
      // Create a directory with many non-project files
      for (let i = 0; i < 100; i++) {
        fs.writeFileSync(path.join(tempDir, `file${i}.txt`), 'content')
      }

      // Add one project file
      fs.writeFileSync(path.join(tempDir, 'package.json'), '{}')

      const start = Date.now()
      const result = findDependencyFile(tempDir)
      const duration = Date.now() - start

      expect(result).toBe(path.join(tempDir, 'package.json'))
      expect(duration).toBeLessThan(100) // Should be fast
    })
  })

  describe('Edge cases', () => {
    it('should handle symbolic links correctly', () => {
      const targetFile = path.join(tempDir, 'package.json')
      const linkFile = path.join(tempDir, 'package-link.json')

      fs.writeFileSync(targetFile, '{}')
      fs.symlinkSync(targetFile, linkFile)

      const result = findDependencyFile(tempDir)
      expect(result).toBe(targetFile) // Should find the actual file, not the link
    })

    it('should handle non-existent directories gracefully', () => {
      const nonExistentDir = path.join(tempDir, 'does-not-exist')

      const result = findDependencyFile(nonExistentDir)
      expect(result).toBeNull()
    })

    it('should handle empty directories', () => {
      const emptyDir = path.join(tempDir, 'empty')
      fs.mkdirSync(emptyDir)

      const result = findDependencyFile(emptyDir)
      expect(result).toBeNull()
    })
  })
})
