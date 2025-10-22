import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import sniff from '../src/dev/sniff'

describe('Bun Test Environments Integration', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-bun-test-envs-'))
  })

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  // Helper function to copy test environment
  const copyTestEnv = (envName: string): string => {
    // Use __dirname to get the directory of this test file, then navigate to test-envs
    const testFileDir = path.dirname(import.meta.url.replace('file://', ''))
    const sourceDir = path.join(testFileDir, '../test-envs', envName)
    const targetDir = path.join(tempDir, envName)

    if (!fs.existsSync(sourceDir)) {
      throw new Error(`Test environment ${envName} not found at ${sourceDir}`)
    }

    fs.mkdirSync(targetDir, { recursive: true })

    // Copy package.json
    const packageJsonSource = path.join(sourceDir, 'package.json')
    if (fs.existsSync(packageJsonSource)) {
      fs.copyFileSync(packageJsonSource, path.join(targetDir, 'package.json'))
    }

    // Copy all possible dependency files
    const possibleFiles = ['dependencies.yaml', 'deps.yaml', 'deps.yml', 'pkgx.yaml']
    for (const fileName of possibleFiles) {
      const sourceFile = path.join(sourceDir, fileName)
      if (fs.existsSync(sourceFile)) {
        fs.copyFileSync(sourceFile, path.join(targetDir, fileName))
      }
    }

    // Copy src directory if it exists
    const srcDir = path.join(sourceDir, 'src')
    if (fs.existsSync(srcDir)) {
      const targetSrcDir = path.join(targetDir, 'src')
      fs.mkdirSync(targetSrcDir, { recursive: true })
      const srcFiles = fs.readdirSync(srcDir)
      for (const file of srcFiles) {
        fs.copyFileSync(path.join(srcDir, file), path.join(targetSrcDir, file))
      }
    }

    return targetDir
  }

  describe('Basic Bun Package Manager Tests', () => {
    it('bun-package-manager-basic: should install only Bun when packageManager is "bun"', async () => {
      const envDir = copyTestEnv('bun-package-manager-basic')
      const result = await sniff({ string: envDir })

      // Should install Bun
      const bunPackage = result.pkgs.find(pkg => pkg.project === 'bun.sh')
      expect(bunPackage).toBeDefined()
      expect(bunPackage?.constraint.toString()).toBe('*') // Latest version

      // Should NOT install Node.js
      const nodePackage = result.pkgs.find(pkg => pkg.project === 'nodejs.org')
      expect(nodePackage).toBeUndefined()

      // Should NOT install npm (since Bun has its own package manager)
      const npmPackage = result.pkgs.find(pkg => pkg.project === 'npmjs.com')
      expect(npmPackage).toBeUndefined()

      // Verify the package structure
      expect(result.pkgs.length).toBeGreaterThanOrEqual(1) // At least Bun
      expect(result.pkgs.every(pkg => pkg.project !== 'nodejs.org')).toBe(true)
    })

    it('bun-package-manager-versioned: should install specific Bun version when packageManager has version', async () => {
      const envDir = copyTestEnv('bun-package-manager-versioned')
      const result = await sniff({ string: envDir })

      // Should install Bun with specific version
      const bunPackage = result.pkgs.find(pkg => pkg.project === 'bun.sh')
      expect(bunPackage).toBeDefined()
      expect(bunPackage?.constraint.toString()).toBe('1.2.20')

      // Should NOT install Node.js even though we have @types/node
      const nodePackage = result.pkgs.find(pkg => pkg.project === 'nodejs.org')
      expect(nodePackage).toBeUndefined()

      // Should NOT install npm or yarn
      expect(result.pkgs.find(pkg => pkg.project === 'npmjs.com')).toBeUndefined()
      expect(result.pkgs.find(pkg => pkg.project === 'yarnpkg.com')).toBeUndefined()
    })

    it('bun-package-manager-with-deps: should handle complex scenarios with additional dependencies', async () => {
      const envDir = copyTestEnv('bun-package-manager-with-deps')
      const result = await sniff({ string: envDir })

      // Should install Bun (latest since @latest)
      const bunPackage = result.pkgs.find(pkg => pkg.project === 'bun.sh')
      expect(bunPackage).toBeDefined()
      expect(bunPackage?.constraint.toString()).toBe('*')

      // Should NOT install Node.js despite React/Next.js dependencies
      const nodePackage = result.pkgs.find(pkg => pkg.project === 'nodejs.org')
      expect(nodePackage).toBeUndefined()

      // Should install additional tools from dependencies.yaml
      const allProjects = result.pkgs.map(pkg => pkg.project)

      // At least some of the expected tools should be present
      const expectedTools = ['esbuild.github.io', 'swc.rs', 'git-scm.org', 'deno.land']
      const foundTools = expectedTools.filter(tool => allProjects.includes(tool))

      if (foundTools.length === 0) {
        console.warn('Expected tools found:', foundTools)
        console.warn('All packages found:', allProjects)
      }

      // Should have at least git-scm.org which is commonly available
      expect(foundTools.length).toBeGreaterThan(0)

      // Should NOT include Node.js in any of the dependencies
      expect(result.pkgs.every(pkg => pkg.project !== 'nodejs.org')).toBe(true)
    })

    it('bun-vs-node-engines: should prioritize Bun over Node.js engines configuration', async () => {
      const envDir = copyTestEnv('bun-vs-node-engines')
      const result = await sniff({ string: envDir })

      // Should install Bun (package manager takes priority)
      const bunPackage = result.pkgs.find(pkg => pkg.project === 'bun.sh')
      expect(bunPackage).toBeDefined()
      expect(bunPackage?.constraint.toString()).toBe('*') // Latest version

      // Should NOT install Node.js despite engines.node specification
      const nodePackage = result.pkgs.find(pkg => pkg.project === 'nodejs.org')
      expect(nodePackage).toBeUndefined()

      // Should NOT install npm despite engines.npm specification
      const npmPackage = result.pkgs.find(pkg => pkg.project === 'npmjs.com')
      expect(npmPackage).toBeUndefined()

      // Verify that package manager takes precedence over volta configuration
      expect(result.pkgs.every(pkg => pkg.project !== 'nodejs.org')).toBe(true)
    })
  })

  describe('Bun Package Manager Edge Cases', () => {
    it('should handle packageManager: "bun" without version gracefully', () => {
      const testDir = path.join(tempDir, 'test-no-version')
      fs.mkdirSync(testDir, { recursive: true })

      const packageJson = {
        name: 'test-no-version',
        packageManager: 'bun', // No version specified
        dependencies: {
          lodash: '^4.17.21',
        },
      }

      fs.writeFileSync(
        path.join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2),
      )

      return sniff({ string: testDir }).then((result) => {
        const bunPackage = result.pkgs.find(pkg => pkg.project === 'bun.sh')
        expect(bunPackage).toBeDefined()
        expect(bunPackage?.constraint.toString()).toBe('*') // Should default to latest

        // Should NOT install Node.js
        expect(result.pkgs.find(pkg => pkg.project === 'nodejs.org')).toBeUndefined()
      })
    })

    it('should handle packageManager: "bun@latest" explicitly', () => {
      const testDir = path.join(tempDir, 'test-latest-explicit')
      fs.mkdirSync(testDir, { recursive: true })

      const packageJson = {
        name: 'test-latest-explicit',
        packageManager: 'bun@latest',
        dependencies: {
          express: '^4.18.0',
        },
      }

      fs.writeFileSync(
        path.join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2),
      )

      return sniff({ string: testDir }).then((result) => {
        const bunPackage = result.pkgs.find(pkg => pkg.project === 'bun.sh')
        expect(bunPackage).toBeDefined()
        expect(bunPackage?.constraint.toString()).toBe('*')

        // Should NOT install Node.js
        expect(result.pkgs.find(pkg => pkg.project === 'nodejs.org')).toBeUndefined()
      })
    })

    it('should handle complex version constraints', () => {
      const testDir = path.join(tempDir, 'test-complex-version')
      fs.mkdirSync(testDir, { recursive: true })

      const packageJson = {
        name: 'test-complex-version',
        packageManager: 'bun@^1.2.0',
        engines: {
          node: '>=18.0.0', // Should be ignored
          npm: '>=9.0.0', // Should be ignored
        },
        volta: {
          node: '20.10.0', // Should be ignored
          npm: '10.2.3', // Should be ignored
        },
      }

      fs.writeFileSync(
        path.join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2),
      )

      return sniff({ string: testDir }).then((result) => {
        const bunPackage = result.pkgs.find(pkg => pkg.project === 'bun.sh')
        expect(bunPackage).toBeDefined()
        expect(bunPackage?.constraint.toString()).toBe('^1.2.0')

        // Should NOT install Node.js or npm despite engines and volta
        expect(result.pkgs.find(pkg => pkg.project === 'nodejs.org')).toBeUndefined()
        expect(result.pkgs.find(pkg => pkg.project === 'npmjs.com')).toBeUndefined()
      })
    })
  })

  describe('Bun vs Other Package Managers', () => {
    it('should prefer bun when both bun.lock and package-lock.json exist', () => {
      const testDir = path.join(tempDir, 'test-conflict-resolution')
      fs.mkdirSync(testDir, { recursive: true })

      const packageJson = {
        name: 'test-conflict-resolution',
        packageManager: 'bun@1.2.0',
      }

      fs.writeFileSync(
        path.join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2),
      )

      // Create both lock files to simulate a migration scenario
      fs.writeFileSync(path.join(testDir, 'bun.lock'), '')
      fs.writeFileSync(path.join(testDir, 'package-lock.json'), '{}')

      return sniff({ string: testDir }).then((result) => {
        const bunPackage = result.pkgs.find(pkg => pkg.project === 'bun.sh')
        expect(bunPackage).toBeDefined()
        expect(bunPackage?.constraint.toString()).toBe('1.2.0')

        // Should NOT install Node.js or npm when Bun is explicitly chosen
        expect(result.pkgs.find(pkg => pkg.project === 'nodejs.org')).toBeUndefined()
        expect(result.pkgs.find(pkg => pkg.project === 'npmjs.com')).toBeUndefined()
      })
    })

    it('should handle mixed package manager scenarios correctly', () => {
      const testDir = path.join(tempDir, 'test-mixed-managers')
      fs.mkdirSync(testDir, { recursive: true })

      const packageJson = {
        name: 'test-mixed-managers',
        packageManager: 'bun@latest',
        engines: {
          node: '>=18.0.0',
          pnpm: '^8.0.0', // Different package manager in engines
        },
        volta: {
          yarn: '3.0.0', // Yet another package manager
        },
      }

      fs.writeFileSync(
        path.join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2),
      )

      return sniff({ string: testDir }).then((result) => {
        // Should only install Bun since packageManager takes precedence
        const bunPackage = result.pkgs.find(pkg => pkg.project === 'bun.sh')
        expect(bunPackage).toBeDefined()
        expect(bunPackage?.constraint.toString()).toBe('*')

        // Should NOT install any other runtimes or package managers
        expect(result.pkgs.find(pkg => pkg.project === 'nodejs.org')).toBeUndefined()
        expect(result.pkgs.find(pkg => pkg.project === 'pnpm.io')).toBeUndefined()
        expect(result.pkgs.find(pkg => pkg.project === 'yarnpkg.com')).toBeUndefined()
      })
    })
  })

  describe('Regression Tests', () => {
    it('should not break existing npm/yarn/pnpm detection when bun is not involved', () => {
      const testDir = path.join(tempDir, 'test-other-managers')
      fs.mkdirSync(testDir, { recursive: true })

      const packageJson = {
        name: 'test-other-managers',
        packageManager: 'npm@10.0.0',
      }

      fs.writeFileSync(
        path.join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2),
      )

      return sniff({ string: testDir }).then((result) => {
        // Should install npm and Node.js
        const npmPackage = result.pkgs.find(pkg => pkg.project === 'npmjs.com')
        expect(npmPackage).toBeDefined()
        expect(npmPackage?.constraint.toString()).toBe('10.0.0')

        const nodePackage = result.pkgs.find(pkg => pkg.project === 'nodejs.org')
        expect(nodePackage).toBeDefined()

        // Should NOT install Bun
        expect(result.pkgs.find(pkg => pkg.project === 'bun.sh')).toBeUndefined()
      })
    })

    it('should maintain backward compatibility with existing bun.lock detection', () => {
      const testDir = path.join(tempDir, 'test-bun-lock-compat')
      fs.mkdirSync(testDir, { recursive: true })

      const packageJson = {
        name: 'test-bun-lock-compat',
        dependencies: {
          react: '^18.0.0',
        },
        // No packageManager field
      }

      fs.writeFileSync(
        path.join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2),
      )

      // Only bun.lock file exists
      fs.writeFileSync(path.join(testDir, 'bun.lock'), '')

      return sniff({ string: testDir }).then((result) => {
        // Should still detect Bun from bun.lock file
        const bunPackage = result.pkgs.find(pkg => pkg.project === 'bun.sh')
        expect(bunPackage).toBeDefined()

        // Should NOT install Node.js when bun.lock is present
        expect(result.pkgs.find(pkg => pkg.project === 'nodejs.org')).toBeUndefined()
      })
    })

    it('should handle Bun + Node.js coexistence correctly', async () => {
      const testDir = copyTestEnv('bun-with-nodejs')

      return sniff({ string: testDir }).then((result) => {
        // Should detect both Bun and Node.js
        const bunPackage = result.pkgs.find(pkg => pkg.project === 'bun.sh')
        const nodePackage = result.pkgs.find(pkg => pkg.project.includes('nodejs.org'))
        const npmPackage = result.pkgs.find(pkg => pkg.project.includes('npmjs.com'))

        expect(bunPackage).toBeDefined()
        expect(bunPackage?.constraint.toString()).toBe('1.2.0')

        // Node.js should be detected from dependencies.yaml even when packageManager is bun
        expect(nodePackage).toBeDefined()
        expect(nodePackage?.constraint.toString()).toBe('*')

        expect(npmPackage).toBeDefined()
        expect(npmPackage?.constraint.toString()).toBe('*')

        // Both should be present - no exclusion when explicitly specified
        expect(result.pkgs.length).toBeGreaterThanOrEqual(5) // At least bun, node, npm, git, fd
      })
    })
  })
})
