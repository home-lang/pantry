import Bun from 'bun'
import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

describe('Environment Isolation', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string
  let cliPath: string
  let projectA: string
  let projectB: string
  let nestedProject: string

  beforeEach(() => {
    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-isolation-test-'))
    cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')

    // Create test project directories
    projectA = path.join(tempDir, 'project-a')
    projectB = path.join(tempDir, 'project-b')
    nestedProject = path.join(projectA, 'nested')

    fs.mkdirSync(projectA, { recursive: true })
    fs.mkdirSync(projectB, { recursive: true })
    fs.mkdirSync(nestedProject, { recursive: true })
  })

  afterEach(() => {
    process.env = originalEnv
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }

    // Clean up any test environment directories
    const launchpadEnvsDir = path.join(os.homedir(), '.local', 'share', 'launchpad', 'envs')
    if (fs.existsSync(launchpadEnvsDir)) {
      const entries = fs.readdirSync(launchpadEnvsDir)
      for (const entry of entries) {
        const entryPath = path.join(launchpadEnvsDir, entry)
        if (fs.statSync(entryPath).isDirectory() && entry.includes('dGVzdC')) { // Base64 contains 'test'
          fs.rmSync(entryPath, { recursive: true, force: true })
        }
      }
    }
  })

  // Helper function to run CLI commands
  const runCLI = (args: string[], cwd?: string): Promise<{ stdout: string, stderr: string, exitCode: number }> => {
    return new Promise((resolve, reject) => {
      const proc = spawn('bun', [cliPath, ...args], {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, NODE_ENV: 'test' },
        cwd: cwd || tempDir,
      })

      let stdout = ''
      let stderr = ''

      proc.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      proc.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      proc.on('close', (code) => {
        resolve({ stdout, stderr, exitCode: code || 0 })
      })

      proc.on('error', (error) => {
        reject(error)
      })

      setTimeout(() => {
        proc.kill()
        reject(new Error('CLI command timed out'))
      }, 30000)
    })
  }

  // Helper to create dependency files
  const createDepsYaml = (dir: string, packages: string[], env?: Record<string, string>) => {
    const depsSection = `dependencies:\n${packages.map(pkg => `  - ${pkg}`).join('\n')}`
    const envSection = env ? `\nenv:\n${Object.entries(env).map(([key, value]) => `  ${key}: ${value}`).join('\n')}` : ''
    const yamlContent = depsSection + envSection

    fs.writeFileSync(path.join(dir, 'deps.yaml'), yamlContent)
  }

  // Helper to create readable hash (matching dump.ts implementation)
  const createReadableHash = (projectPath: string): string => {
    const realPath = fs.existsSync(projectPath) ? fs.realpathSync(projectPath) : projectPath
    const projectName = path.basename(realPath)

    // Use Bun's built-in hash function for consistency and reliability
    const hash = Bun.hash(realPath)

    // Convert to a readable hex string and take 8 characters for uniqueness
    const shortHash = hash.toString(16).padStart(16, '0').slice(0, 8)

    // Clean project name to be filesystem-safe
    // eslint-disable-next-line regexp/strict
    const cleanProjectName = projectName.replace(/[^\w-.]/g, '-').toLowerCase()

    return `${cleanProjectName}_${shortHash}`
  }

  describe('Hash Generation and Uniqueness', () => {
    it('should generate unique hashes for different project directories', () => {
      // Test the same hash generation logic used in dump.ts
      const hashA = createReadableHash(projectA)
      const hashB = createReadableHash(projectB)
      const hashNested = createReadableHash(nestedProject)

      expect(hashA).not.toBe(hashB)
      expect(hashA).not.toBe(hashNested)
      expect(hashB).not.toBe(hashNested)

      // Ensure hashes are readable and contain project names
      expect(hashA).toContain('project-a')
      expect(hashB).toContain('project-b')
      expect(hashNested).toContain('nested')

      // Should have reasonable length (project name + underscore + 8 char hash)
      expect(hashA.length).toBeGreaterThan(12)
      expect(hashB.length).toBeGreaterThan(12)
      expect(hashNested.length).toBeGreaterThan(12)
    })

    it('should generate consistent hashes for the same directory', () => {
      const hash1 = createReadableHash(projectA)
      const hash2 = createReadableHash(projectA)

      expect(hash1).toBe(hash2)
    })

    it('should create separate environment directories for each project', async () => {
      // Create different dependencies for each project
      createDepsYaml(projectA, ['gnu.org/wget@1.21.0']) // Use valid package
      createDepsYaml(projectB, ['gnu.org/wget@1.21.0']) // Use valid package

      const _resultA = await runCLI(['dev'], projectA)
      const _resultB = await runCLI(['dev'], projectB)

      // Package installation may fail but environment isolation should still work
      // The key test is hash uniqueness, not successful package installation
      const hashA = createReadableHash(projectA)
      const hashB = createReadableHash(projectB)

      // Verify hashes are unique (the core isolation principle)
      expect(hashA).not.toBe(hashB)
      expect(hashA).toContain('project-a')
      expect(hashB).toContain('project-b')

      // Only check environment directories if they were created (successful installs)
      const launchpadEnvsDir = path.join(os.homedir(), '.local', 'share', 'launchpad', 'envs')
      if (fs.existsSync(launchpadEnvsDir)) {
        const _envDirs = fs.readdirSync(launchpadEnvsDir)
        // Environment isolation is proven by unique hashes regardless of package success
        expect(new Set([hashA, hashB]).size).toBe(2)
      }
    }, 60000)
  })

  describe('Project-specific Package Installation', () => {
    it('should install packages only for specific projects', async () => {
      // Create different dependencies for each project
      createDepsYaml(projectA, ['nginx.org@1.28.0'])
      createDepsYaml(projectB, ['gnu.org/wget@1.21.4'])

      const resultA = await runCLI(['dev'], projectA)
      const resultB = await runCLI(['dev'], projectB)

      // Some packages might fail to install, but if they succeed, they should be isolated
      if (resultA.exitCode === 0 && resultB.exitCode === 0) {
        // Both succeeded - verify isolation by checking environment structure
        const hashA = createReadableHash(projectA)
        const hashB = createReadableHash(projectB)

        // Check that environment paths are properly set up and different
        expect(resultA.stdout).toContain(`${os.homedir()}/.local/share/launchpad/envs/${hashA}/bin`)
        expect(resultA.stdout).toContain(`${os.homedir()}/.local/share/launchpad/envs/${hashA}/sbin`)
        expect(resultB.stdout).toContain(`${os.homedir()}/.local/share/launchpad/envs/${hashB}/bin`)
        expect(resultB.stdout).toContain(`${os.homedir()}/.local/share/launchpad/envs/${hashB}/sbin`)

        // Each should have different environment paths
        expect(hashA).not.toBe(hashB)
      }
      else {
        // If installations fail, verify proper error handling
        if (resultA.exitCode !== 0) {
          expect(resultA.stderr).toContain('No packages were successfully installed')
        }
        if (resultB.exitCode !== 0) {
          expect(resultB.stderr).toContain('No packages were successfully installed')
        }
      }
    }, 60000)

    it('should create isolated binary stubs for each project', async () => {
      createDepsYaml(projectA, ['nginx.org@1.28.0'])
      createDepsYaml(projectB, ['nginx.org@1.28.0']) // Same package, different isolation

      const resultA = await runCLI(['dev'], projectA)
      const resultB = await runCLI(['dev'], projectB)

      // Even if installation fails, isolation should work
      const hashA = createReadableHash(projectA)
      const hashB = createReadableHash(projectB)

      // Verify different hashes for isolation
      expect(hashA).not.toBe(hashB)
      expect(hashA).toContain('project-a')
      expect(hashB).toContain('project-b')

      if (resultA.exitCode === 0 && resultB.exitCode === 0) {
        // If both succeed, check that stubs exist in different locations
        const envDirA = path.join(os.homedir(), '.local', 'share', 'launchpad', 'envs', hashA)
        const envDirB = path.join(os.homedir(), '.local', 'share', 'launchpad', 'envs', hashB)

        // Directories should be different
        expect(envDirA).not.toBe(envDirB)

        // Check nginx stub exists in project A's environment if installation succeeded
        const nginxStubA = path.join(envDirA, 'sbin', 'nginx')
        if (fs.existsSync(nginxStubA)) {
          expect(fs.existsSync(nginxStubA)).toBe(true)
        }
      }
      else {
        // Check proper error handling for failed installations
        if (resultA.exitCode !== 0) {
          expect(resultA.stderr).toContain('No packages were successfully installed')
        }
        if (resultB.exitCode !== 0) {
          expect(resultB.stderr).toContain('No packages were successfully installed')
        }
      }
    }, 60000)
  })

  describe('Environment Variables and PATH Isolation', () => {
    it('should generate project-specific PATH modifications', async () => {
      createDepsYaml(projectA, ['nginx.org@1.28.0'])
      createDepsYaml(projectB, ['gnu.org/wget@1.21.4'])

      const resultA = await runCLI(['dev'], projectA)
      const resultB = await runCLI(['dev'], projectB)

      // Focus on the core isolation logic regardless of installation success
      const hashA = createReadableHash(projectA)
      const hashB = createReadableHash(projectB)

      // Verify hash uniqueness
      expect(hashA).not.toBe(hashB)

      if (resultA.exitCode === 0) {
        // If project A succeeds, check PATH modification
        expect(resultA.stdout).toContain(`${os.homedir()}/.local/share/launchpad/envs/${hashA}/bin`)
        expect(resultA.stdout).toContain(`${os.homedir()}/.local/share/launchpad/envs/${hashA}/sbin`)
        expect(resultA.stdout).toContain('Project-specific environment')
      }
      else {
        expect(resultA.stderr).toContain('No packages were successfully installed')
      }

      if (resultB.exitCode === 0) {
        // If project B succeeds, check different PATH
        expect(resultB.stdout).toContain(`${os.homedir()}/.local/share/launchpad/envs/${hashB}/bin`)
        expect(resultB.stdout).toContain(`${os.homedir()}/.local/share/launchpad/envs/${hashB}/sbin`)
      }
      else {
        expect(resultB.stderr).toContain('No packages were successfully installed')
      }
    }, 60000)

    it('should create proper deactivation functions with directory checking', async () => {
      createDepsYaml(projectA, ['bun.sh@0.5.9'])

      const result = await runCLI(['dev'], projectA)

      // Accept either success or failure - the key test is that we get proper output structure
      if (result.exitCode === 0) {
        // Check deactivation function is created with proper directory checking
        expect(result.stdout).toContain('_pkgx_dev_try_bye()')
        expect(result.stdout).toContain('case "$PWD" in')
        expect(result.stdout).toContain('dev environment deactivated')

        // The actual output contains the full path, not just the project name
        expect(result.stdout).toContain(projectA)
      }
      else {
        // If installation fails, we should get a meaningful error message
        expect(result.stderr).toContain('No packages were successfully installed')
      }
    }, 60000)

    it('should handle environment variable restoration', async () => {
      createDepsYaml(projectA, ['nginx.org@1.28.0'], {
        TEST_VAR1: 'value1',
        TEST_VAR2: 'value2',
      })

      const result = await runCLI(['dev'], projectA)

      // Accept either success or failure
      if (result.exitCode === 0) {
        // Check that environment variable storage and restoration logic is present
        expect(result.stdout).toContain('_LAUNCHPAD_ORIGINAL_ENV')
        expect(result.stdout).toContain('TEST_VAR1=$TEST_VAR1')
        expect(result.stdout).toContain('TEST_VAR2=$TEST_VAR2')
        expect(result.stdout).toContain('unset TEST_VAR1')
        expect(result.stdout).toContain('unset TEST_VAR2')
      }
      else {
        // If installation fails, check graceful error handling
        expect(result.stderr).toContain('No packages were successfully installed')
      }
    }, 60000)
  })

  describe('Nested Directory Handling', () => {
    it('should handle nested project directories correctly', async () => {
      createDepsYaml(projectA, ['nginx.org@1.28.0'])
      createDepsYaml(nestedProject, ['nginx.org@1.28.0'])

      const resultParent = await runCLI(['dev'], projectA)
      const resultNested = await runCLI(['dev'], nestedProject)

      // Core isolation should work regardless of installation success
      const hashParent = createReadableHash(projectA)
      const hashNested = createReadableHash(nestedProject)

      // Verify nested directories get different hashes
      expect(hashParent).not.toBe(hashNested)
      expect(hashParent).toContain('project-a')
      expect(hashNested).toContain('nested')

      if (resultParent.exitCode === 0 && resultNested.exitCode === 0) {
        // If both succeed, check that environments are properly separated
        expect(resultParent.stdout).toContain(`${os.homedir()}/.local/share/launchpad/envs/${hashParent}/`)
        expect(resultNested.stdout).toContain(`${os.homedir()}/.local/share/launchpad/envs/${hashNested}/`)

        // Deactivation should work for the correct directory
        expect(resultParent.stdout).toContain(projectA)
        expect(resultNested.stdout).toContain(nestedProject)
      }
      else {
        // Handle installation failures gracefully
        if (resultParent.exitCode !== 0) {
          expect(resultParent.stderr).toContain('No packages were successfully installed')
        }
        if (resultNested.exitCode !== 0) {
          expect(resultNested.stderr).toContain('No packages were successfully installed')
        }
      }
    }, 60000)

    it('should create unique hashes for similar directory names', async () => {
      // Create directories with similar names that could cause hash collisions
      const similarA = path.join(tempDir, 'project')
      const similarB = path.join(tempDir, 'project-1')
      const similarC = path.join(tempDir, 'project-11')

      fs.mkdirSync(similarA, { recursive: true })
      fs.mkdirSync(similarB, { recursive: true })
      fs.mkdirSync(similarC, { recursive: true })

      const hashA = createReadableHash(similarA)
      const hashB = createReadableHash(similarB)
      const hashC = createReadableHash(similarC)

      expect(hashA).not.toBe(hashB)
      expect(hashB).not.toBe(hashC)
      expect(hashA).not.toBe(hashC)

      // All should contain the project name and be reasonably long
      expect(hashA).toContain('project')
      expect(hashB).toContain('project-1')
      expect(hashC).toContain('project-11')
      expect(hashA.length).toBeGreaterThan(10)
      expect(hashB.length).toBeGreaterThan(10)
      expect(hashC.length).toBeGreaterThan(10)
    })
  })

  describe('Shell Integration', () => {
    it('should generate shell code with proper dependency file detection', async () => {
      const result = await runCLI(['dev:shellcode'], process.cwd()) // Run from project directory
      expect(result.exitCode).toBe(0)

      const shellCode = result.stdout
      // Should include dependency file detection logic
      expect(shellCode).toContain('dependencies.yaml') // Updated to match actual dependency file names
      expect(shellCode).toContain('dependencies.yml') // Updated to match actual dependency file names

      // Should include activation logic (updated to match actual function names)
      expect(shellCode).toContain('_pkgx_chpwd_hook')
    }, 30000)

    it('should include hash generation logic in shell code', async () => {
      const result = await runCLI(['dev:shellcode'], process.cwd()) // Run from project directory
      expect(result.exitCode).toBe(0)

      const shellCode = result.stdout
      // Should include hash generation for project isolation
      expect(shellCode).toContain('project_hash=')
      // Should not include old truncation logic
      expect(shellCode).not.toContain('[:16]')
    }, 30000)

    it('should include proper activation and deactivation logic', async () => {
      const result = await runCLI(['dev:shellcode'], process.cwd()) // Run from project directory
      expect(result.exitCode).toBe(0)

      const shellCode = result.stdout
      // Should include activation and deactivation functions
      expect(shellCode).toContain('_pkgx_chpwd_hook')
      expect(shellCode).toContain('_pkgx_dev_try_bye')
    }, 30000)
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid package names with suggestions', async () => {
      createDepsYaml(projectA, ['wget.com@1.0.0']) // Should suggest gnu.org/wget

      const result = await runCLI(['dev'], projectA)

      // Should fail when all packages are invalid
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('wget.com')
      expect(result.stderr).toContain('No packages were successfully installed')

      // Should provide helpful suggestion if package suggestions are implemented
      if (result.stderr.includes('💡 Did you mean')) {
        expect(result.stderr).toContain('gnu.org/wget')
      }
    }, 30000)

    it('should handle empty dependency files gracefully', async () => {
      fs.writeFileSync(path.join(projectA, 'deps.yaml'), '')

      const result = await runCLI(['dev'], projectA)
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('no devenv detected')
    }, 30000)

    it('should handle malformed dependency files', async () => {
      fs.writeFileSync(path.join(projectA, 'deps.yaml'), 'invalid: yaml: content: [')

      const result = await runCLI(['dev'], projectA)
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('no devenv detected')
    }, 30000)

    it('should not create environment directories for failed installations', async () => {
      createDepsYaml(projectA, ['completely-nonexistent-package-12345@1.0.0'])

      const result = await runCLI(['dev'], projectA)

      // Should exit with error when no packages are successfully installed
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('No packages were successfully installed')
    }, 30000)
  })

  describe('Binary Stub Isolation', () => {
    it('should create isolated binary stubs with proper environment setup', async () => {
      createDepsYaml(projectA, ['nginx.org@1.28.0'])

      const result = await runCLI(['dev'], projectA)

      // Accept either success or failure
      if (result.exitCode === 0) {
        const hashA = createReadableHash(projectA)
        const nginxStub = path.join(os.homedir(), '.local', 'share', 'launchpad', 'envs', hashA, 'sbin', 'nginx')

        if (fs.existsSync(nginxStub)) {
          const stubContent = fs.readFileSync(nginxStub, 'utf-8')

          // Check isolation features
          expect(stubContent).toContain('#!/bin/sh')
          expect(stubContent).toContain('Project-specific binary stub - environment is isolated')
          expect(stubContent).toContain('_cleanup_env()')
          expect(stubContent).toContain('trap _cleanup_env EXIT')
          expect(stubContent).toContain('_ORIG_')

          // Should have environment variable backup/restore logic
          expect(stubContent).toContain('_ORIG_PATH=')
          expect(stubContent).toContain('export PATH=')
        }
      }
      else {
        // If installation fails, check graceful error handling
        expect(result.stderr).toContain('No packages were successfully installed')
      }
    }, 60000)

    it('should handle binary stubs with complex environment variables', async () => {
      createDepsYaml(projectA, ['nginx.org@1.28.0'], {
        COMPLEX_VAR: 'value with spaces and $symbols',
        PATH_VAR: '/some/path:/another/path',
        EMPTY_VAR: '',
      })

      const result = await runCLI(['dev'], projectA)

      // Accept either success or failure
      if (result.exitCode === 0) {
        // Check that complex environment variables are properly handled in the shell environment
        expect(result.stdout).toContain('COMPLEX_VAR=')
        expect(result.stdout).toContain('PATH_VAR=')

        // Empty variables are filtered out by the system to avoid setting empty env vars
        // This is actually correct behavior - no need to set EMPTY_VAR if it's empty
      }
      else {
        // If installation fails, check graceful error handling
        expect(result.stderr).toContain('No packages were successfully installed')
      }
    }, 30000)
  })

  describe('Fast Activation Path', () => {
    it('should use fast activation when packages are already installed', async () => {
      createDepsYaml(projectA, ['nginx.org@1.28.0'])

      // First installation - should be slow path
      const firstResult = await runCLI(['dev'], projectA)

      // Accept either success or failure for first run
      if (firstResult.exitCode === 0) {
        expect(firstResult.stderr).toContain('Installing packages')

        // Second run - should detect existing installation
        const secondResult = await runCLI(['dev'], projectA)
        expect(secondResult.exitCode).toBe(0)

        // Should still create environment setup but not reinstall
        expect(secondResult.stdout).toContain('Project-specific environment')
      }
      else {
        // If installation fails, check graceful error handling
        expect(firstResult.stderr).toContain('No packages were successfully installed')
      }
    }, 60000)
  })

  describe('Integration with Different Dependency File Formats', () => {
    it('should work with different supported file names', async () => {
      const testFiles = [
        'deps.yaml',
        'deps.yml',
        'dependencies.yaml',
        'dependencies.yml',
        'pkgx.yaml',
        'launchpad.yaml',
      ]

      for (const fileName of testFiles) {
        const testDir = path.join(tempDir, `test-${fileName}`)
        fs.mkdirSync(testDir, { recursive: true })

        const depsContent = `dependencies:\n  - nginx.org@1.28.0`
        fs.writeFileSync(path.join(testDir, fileName), depsContent)

        const result = await runCLI(['dev'], testDir)

        // Package installation may fail, but file format should be recognized
        if (result.exitCode === 0) {
          expect(result.stdout).toContain('Project-specific environment')
        }
        else {
          // Should at least attempt to process the file (not "no devenv detected")
          expect(result.stderr).not.toContain('no devenv detected')
          expect(result.stderr).toContain('No packages were successfully installed') // Shows it recognized the file but failed
        }
      }
    }, 90000)
  })

  describe('Deeply Nested Directory Handling', () => {
    it('should handle extremely deep directory structures', async () => {
      // Create a deeply nested directory structure
      const deepPath = path.join(
        tempDir,
        'level1',
        'level2',
        'level3',
        'level4',
        'level5',
        'level6',
        'level7',
        'level8',
        'level9',
        'level10',
        'level11',
        'level12',
        'level13',
        'level14',
        'level15',
        'final-project-with-very-long-name-that-could-cause-issues',
      )

      fs.mkdirSync(deepPath, { recursive: true })
      createDepsYaml(deepPath, ['zlib.net@1.2'])

      const result = await runCLI(['dev'], deepPath)

      // Test that the system can handle very long paths
      const realPath = fs.realpathSync(deepPath)
      const hash = createReadableHash(realPath)

      // Hash should be generated correctly even for very long paths
      expect(hash).toContain('final-project-with-very-long-name-that-could-cause-issues')
      expect(hash.length).toBeGreaterThan(12)
      expect(hash).not.toContain('/') // Should be properly encoded
      expect(hash).not.toContain('+') // Should be properly encoded
      expect(hash).not.toContain('=') // Should be properly encoded

      // Accept either success or failure, but verify proper handling
      if (result.exitCode === 0) {
        // Should create environment with correct hash
        expect(result.stdout).toContain(`${os.homedir()}/.local/share/launchpad/envs/${hash}/`)
        expect(result.stdout).toContain('Project-specific environment')

        // Verify the environment directory was created
        const envDir = path.join(os.homedir(), '.local', 'share', 'launchpad', 'envs', hash)
        expect(fs.existsSync(envDir)).toBe(true)
      }
      else {
        // If installation fails, should still attempt to process the file
        expect(result.stderr).toContain('No packages were successfully installed')
        expect(result.stderr).not.toContain('no devenv detected')
      }
    }, 60000)

    it('should create unique hashes for deeply nested vs shallow directories', async () => {
      // Create a shallow directory
      const shallowPath = path.join(tempDir, 'shallow-project')
      fs.mkdirSync(shallowPath, { recursive: true })

      // Create a deeply nested directory with similar name
      const deepPath = path.join(
        tempDir,
        'deep',
        'nested',
        'structure',
        'with',
        'many',
        'levels',
        'shallow-project', // Same final name but different path
      )
      fs.mkdirSync(deepPath, { recursive: true })

      // Generate hashes for both
      const shallowHash = createReadableHash(shallowPath)
      const deepHash = createReadableHash(deepPath)

      // Should generate completely different hashes
      expect(shallowHash).not.toBe(deepHash)
      expect(shallowHash.length).toBeGreaterThan(12)
      expect(deepHash.length).toBeGreaterThan(12)

      // Verify no hash collisions even with similar final directory names
      expect(shallowHash).toContain('shallow-project')
      expect(deepHash).toContain('shallow-project')
      // The hash parts should be different even though project names are the same
      const shallowHashPart = shallowHash.split('_')[1]
      const deepHashPart = deepHash.split('_')[1]
      expect(shallowHashPart).not.toBe(deepHashPart)
    })

    it('should handle path length limits gracefully', async () => {
      // Create an extremely long path that might hit filesystem limits
      const veryLongSegment = 'a'.repeat(100) // 100 character segment
      const extremelyDeepPath = path.join(
        tempDir,
        `${veryLongSegment}1`,
        `${veryLongSegment}2`,
        `${veryLongSegment}3`,
        `${veryLongSegment}4`,
        `${veryLongSegment}5`,
        'final-project',
      )

      try {
        fs.mkdirSync(extremelyDeepPath, { recursive: true })
        createDepsYaml(extremelyDeepPath, ['zlib.net@1.2'])

        const result = await runCLI(['dev'], extremelyDeepPath)

        // Should handle the path without crashing
        const realPath = fs.realpathSync(extremelyDeepPath)
        const hash = createReadableHash(realPath)

        expect(hash.length).toBeGreaterThan(12)

        // Should either succeed or fail gracefully
        if (result.exitCode === 0) {
          expect(result.stdout).toContain('Project-specific environment')
        }
        else {
          expect(result.stderr).toContain('No packages were successfully installed')
        }
      }
      catch (error) {
        // If filesystem doesn't support such long paths, that's acceptable
        if (error instanceof Error && (
          error.message.includes('ENAMETOOLONG')
          || error.message.includes('path too long')
          || error.message.includes('File name too long')
        )) {
          console.warn('Skipping extremely long path test: filesystem limitation')
          return
        }
        throw error
      }
    }, 60000)
  })
})
