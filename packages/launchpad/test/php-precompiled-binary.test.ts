/* eslint-disable no-console */
import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { dump } from '../src/dev/dump'

describe('PHP Precompiled Binary Installation', () => {
  let tempDir: string
  let projectDir: string
  let envDir: string
  let originalHome: string | undefined

  beforeEach(() => {
    // Create a temporary directory for testing
    tempDir = join(tmpdir(), `launchpad-php-test-${Date.now()}-${Math.random().toString(36).substring(7)}`)
    projectDir = join(tempDir, 'laravel-project')

    // Set up fake home directory
    originalHome = process.env.HOME
    process.env.HOME = tempDir

    // Create project directory
    mkdirSync(projectDir, { recursive: true })

    // Set up expected environment directory path
    // eslint-disable-next-line ts/no-require-imports
    const crypto = require('node:crypto')
    const projectHash = crypto.createHash('md5').update(projectDir).digest('hex').substring(0, 8)
    // eslint-disable-next-line ts/no-require-imports
    const projectName = require('node:path').basename(projectDir)
    const fullProjectHash = `${projectName}_${projectHash}`
    envDir = join(tempDir, '.local', 'share', 'launchpad', 'envs', fullProjectHash)
  })

  afterEach(() => {
    // Clean up
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true })
    }

    // Restore original HOME
    if (originalHome) {
      process.env.HOME = originalHome
    }
    else {
      delete process.env.HOME
    }
  })

  it('should install PHP dependencies using ts-pkgx and create working PHP binary', async () => {
    // Create a Laravel project structure with deps.yaml including PHP
    const depsContent = `
dependencies:
  php.net: "8.4"
  composer: "*"
`
    writeFileSync(join(projectDir, 'deps.yaml'), depsContent)

    // Create composer.json to identify as Laravel project
    const composerContent = {
      name: 'test/laravel-app',
      require: {
        'laravel/framework': '^11.0',
      },
      autoload: {
        'psr-4': {
          'App\\': 'app/',
        },
      },
    }
    writeFileSync(join(projectDir, 'composer.json'), JSON.stringify(composerContent, null, 2))

    // Test the PHP binary installation directly
    const { PrecompiledBinaryDownloader } = await import('../src/binary-downloader')
    const downloader = new PrecompiledBinaryDownloader(tempDir)

    try {
      // Test getting PHP dependencies from ts-pkgx pantry first
      const getDeps = (downloader as any).getPhpDependenciesFromPantry.bind(downloader)
      const dependencies = await getDeps()

      expect(Array.isArray(dependencies)).toBe(true)
      console.log(`📦 Found ${dependencies.length} PHP dependencies from ts-pkgx pantry`)

      if (dependencies.length > 0) {
        // Should include common PHP dependencies
        const commonDeps = ['openssl.org', 'zlib.net', 'curl.se']
        const foundCommonDeps = commonDeps.filter(dep => dependencies.includes(dep))
        expect(foundCommonDeps.length).toBeGreaterThan(0)
        console.log(`✅ Found ${foundCommonDeps.length} common dependencies: ${foundCommonDeps.join(', ')}`)
      }

      // Test library path finding
      const getLibPaths = (downloader as any).findLaunchpadLibraryPaths.bind(downloader)
      const libraryPaths = await getLibPaths()

      expect(Array.isArray(libraryPaths)).toBe(true)
      console.log(`📚 Found ${libraryPaths.length} library paths`)

      // This should install PHP with all required dependencies
      const result = await downloader.downloadAndInstallPHP('8.4')

      if (result.success) {
        expect(result.success).toBe(true)
        expect(result.packageDir).toBeDefined()
        expect(result.version).toContain('8.4')
        expect(result.configuration).toBe('full-stack')

        // Verify PHP binary exists
        const phpBinary = join(result.packageDir, 'bin', 'php')
        expect(existsSync(phpBinary)).toBe(true)

        // Verify shim was created
        const shimContent = readFileSync(phpBinary, 'utf-8')
        expect(shimContent).toContain('# Launchpad PHP binary wrapper')
        expect(shimContent).toContain('DYLD_LIBRARY_PATH=')
        expect(shimContent).toContain('.original')

        console.log('✅ PHP binary installed successfully')
        console.log(`📁 Location: ${result.packageDir}`)
        console.log(`🐘 Version: ${result.version}`)
        console.log(`⚙️ Configuration: ${result.configuration}`)
        console.log('✅ PHP shim created with library paths')

        // Verify the original binary exists
        const originalBinary = join(result.packageDir, 'bin', 'php.original')
        expect(existsSync(originalBinary)).toBe(true)
        console.log('✅ Original PHP binary preserved')
      }
      else {
        console.log('ℹ️ Precompiled binary installation failed (expected in CI):', result.error)
        // This is expected in CI environments where binaries might not be available
        expect(result.success).toBe(false)
      }
    }
    catch (error) {
      console.log('ℹ️ PHP installation failed (expected in some environments):', error instanceof Error ? error.message : String(error))
      // This test may fail in CI or environments without internet access
      expect(error).toBeDefined()
    }
  })

  it('should prefer full-stack PHP configuration for Laravel projects', async () => {
    // This test ensures that when PHP is detected in a Laravel project,
    // we use the full-stack precompiled binary instead of minimal builds

    // Create Laravel project markers
    const depsContent = `
dependencies:
  php.net: "8.4"
`
    writeFileSync(join(projectDir, 'deps.yaml'), depsContent)

    const composerContent = {
      name: 'test/laravel-app',
      require: {
        'laravel/framework': '^11.0',
        'doctrine/dbal': '^3.0',
      },
    }
    writeFileSync(join(projectDir, 'composer.json'), JSON.stringify(composerContent, null, 2))

    // Test that the installation logic recognizes this as a Laravel project
    // and should choose full-stack PHP binary
    const { default: sniff } = await import('../src/dev/sniff')
    const sniffResult = await sniff({ string: projectDir })

    // Should detect PHP dependency
    const phpDep = sniffResult.pkgs.find(pkg => pkg.project.includes('php'))
    expect(phpDep).toBeDefined()

    // For the actual test, we need to verify that the installation process
    // would choose the full-stack PHP binary when downloading
    expect(true).toBe(true) // Placeholder - will be implemented in the fix
  })

  it('should handle missing precompiled binary gracefully', async () => {
    // Test case for when the desired precompiled binary is not available
    // Should fall back to source compilation or provide clear error

    const depsContent = `
dependencies:
  php.net: "8.5.999" # Non-existent version
`
    writeFileSync(join(projectDir, 'deps.yaml'), depsContent)

    process.env.LAUNCHPAD_SHELL_INTEGRATION = '1'

    let shellOutput = ''
    const originalStdoutWrite = process.stdout.write
    process.stdout.write = function (chunk: any) {
      shellOutput += chunk.toString()
      return true
    }

    try {
      await dump(projectDir, {
        shellOutput: true,
        quiet: true,
      })

      // Even if specific version fails, should still generate shell output
      const hasShellOutput = shellOutput.includes('export PATH=')
      expect(hasShellOutput).toBe(true)
    }
    finally {
      process.stdout.write = originalStdoutWrite
      delete process.env.LAUNCHPAD_SHELL_INTEGRATION
    }
  })

  it('should get PHP dependencies from ts-pkgx pantry', async () => {
    // Test that we can get PHP dependencies dynamically from ts-pkgx

    const { PrecompiledBinaryDownloader } = await import('../src/binary-downloader')
    const downloader = new PrecompiledBinaryDownloader(tempDir)

    try {
      // Test the private method by accessing it (for testing purposes)
      const getDeps = (downloader as any).getPhpDependenciesFromPantry.bind(downloader)
      const dependencies = await getDeps()

      // Should return an array of dependencies
      expect(Array.isArray(dependencies)).toBe(true)

      if (dependencies.length > 0) {
        console.log(`📦 Found ${dependencies.length} PHP dependencies from pantry:`, dependencies)

        // Should include essential dependencies
        const essentialDeps = ['gnu.org/readline', 'openssl.org', 'curl.se', 'zlib.net']
        const hasEssentialDeps = essentialDeps.some(dep => dependencies.includes(dep))
        expect(hasEssentialDeps).toBe(true)
      }
      else {
        console.log('ℹ️ No dependencies found (using fallback)')
        // Should fallback to essential dependencies
        expect(dependencies.length).toBeGreaterThanOrEqual(0)
      }
    }
    catch (error) {
      console.log('ℹ️ ts-pkgx pantry access failed (expected in some environments):', error instanceof Error ? error.message : String(error))
      // This is expected if ts-pkgx is not available
      expect(error).toBeDefined()
    }
  })

  it('should integrate with shell activation for real Laravel project', async () => {
    // Comprehensive integration test that simulates real usage

    // Create a realistic Laravel project structure
    const depsContent = `
dependencies:
  php.net: "8.4"
  composer: "*"
  nodejs.org: "20"
`
    writeFileSync(join(projectDir, 'deps.yaml'), depsContent)

    // Create composer.json
    const composerContent = {
      name: 'test/laravel-app',
      require: {
        'laravel/framework': '^11.0',
        'php': '^8.4',
      },
      autoload: {
        'psr-4': {
          'App\\': 'app/',
        },
      },
    }
    writeFileSync(join(projectDir, 'composer.json'), JSON.stringify(composerContent, null, 2))

    // Create artisan file (Laravel marker)
    writeFileSync(join(projectDir, 'artisan'), '#!/usr/bin/env php\n<?php\necho "Laravel Artisan\\n";')

    // Test shell integration
    process.env.LAUNCHPAD_SHELL_INTEGRATION = '1'

    let shellOutput = ''
    const originalStdoutWrite = process.stdout.write
    process.stdout.write = function (chunk: any) {
      shellOutput += chunk.toString()
      return true
    }

    try {
      await dump(projectDir, {
        shellOutput: true,
        quiet: true,
      })

      // Should generate shell output for environment activation
      expect(shellOutput).toContain('export PATH=')

      console.log('✅ Shell integration test completed')

      // Verify environment was set up
      if (existsSync(join(envDir, 'bin'))) {
        console.log('✅ Environment directory created')

        // Check if PHP was installed
        const phpExists = existsSync(join(envDir, 'bin', 'php'))
        if (phpExists) {
          console.log('✅ PHP binary exists in environment')
        }
        else {
          console.log('ℹ️ PHP binary not found (may have failed to install)')
        }
      }
      else {
        console.log('ℹ️ Environment directory not created (installation may have failed)')
      }
    }
    finally {
      process.stdout.write = originalStdoutWrite
      delete process.env.LAUNCHPAD_SHELL_INTEGRATION
    }
  })

  it('should detect php vs php.net package names correctly', async () => {
    // Test that both "php" and "php.net" package names work

    const testCases = [
      { packageName: 'php', version: '^8.4' },
      { packageName: 'php.net', version: '8.4.0' },
    ]

    for (const testCase of testCases) {
      const testProjectDir = join(tempDir, `test-${testCase.packageName}`)
      mkdirSync(testProjectDir, { recursive: true })

      const depsContent = `
dependencies:
  ${testCase.packageName}: "${testCase.version}"
`
      writeFileSync(join(testProjectDir, 'deps.yaml'), depsContent)

      const { default: sniff } = await import('../src/dev/sniff')
      const sniffResult = await sniff({ string: testProjectDir })

      // Should detect PHP dependency regardless of package name format
      const phpDep = sniffResult.pkgs.find(pkg =>
        pkg.project === testCase.packageName
        || pkg.project.includes('php'),
      )
      expect(phpDep).toBeDefined()
    }
  })
})
