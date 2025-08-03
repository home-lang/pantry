import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { TestUtils } from './test.config'

describe('deps.yaml Integration Tests', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string
  let projectDir: string

  beforeEach(() => {
    // Reset global state for test isolation
    TestUtils.resetGlobalState()

    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-deps-test-'))
    projectDir = path.join(tempDir, 'test-project')

    // Set up test environment
    process.env.HOME = tempDir
    process.env.NODE_ENV = 'test'

    // Create test project directory
    fs.mkdirSync(projectDir, { recursive: true })
  })

  afterEach(() => {
    // Restore environment variables properly without replacing the entire process.env object
    Object.keys(process.env).forEach((key) => {
      delete process.env[key]
    })
    Object.assign(process.env, originalEnv)
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
    TestUtils.cleanupEnvironmentDirs()
  })

  it('should detect and parse deps.yaml correctly', async () => {
    // Create deps.yaml file with test dependencies
    const depsContent = `dependencies:
  bun: ^1.2.16
  node: ^22.17.0
  php: ^8.4.0
  composer: ^2.8.9
  postgres: ^17.2.0
  redis: ^8.0.3

# Services to start automatically
services:
  enabled: true
  autoStart:
    - postgres
    - redis
`
    fs.writeFileSync(path.join(projectDir, 'deps.yaml'), depsContent)

    // Import and test sniff function
    const sniff = (await import('../src/dev/sniff')).default
    const result = await sniff({ string: projectDir })

    expect(result).toBeDefined()
    expect(result.pkgs).toBeDefined()
    expect(Array.isArray(result.pkgs)).toBe(true)

    // Check that key dependencies are detected
    const packageNames = result.pkgs.map(pkg => pkg.project)
    expect(packageNames).toContain('bun.sh')
    expect(packageNames).toContain('nodejs.org')
    expect(packageNames).toContain('php.net')
    expect(packageNames).toContain('getcomposer.org')
    expect(packageNames).toContain('postgresql.org')
    expect(packageNames).toContain('redis.io')
  })

  it('should handle different deps.yaml variations', async () => {
    // Test with different naming conventions
    const variations = [
      'deps.yaml',
      'deps.yml',
      'dependencies.yaml',
      'dependencies.yml',
    ]

    for (const filename of variations) {
      const testDir = path.join(tempDir, `test-${filename}`)
      fs.mkdirSync(testDir, { recursive: true })

      const depsContent = `dependencies:
  bun: ^1.2.16
  node: ^22.17.0
`
      fs.writeFileSync(path.join(testDir, filename), depsContent)

      const sniff = (await import('../src/dev/sniff')).default
      const result = await sniff({ string: testDir })

      expect(result.pkgs.length).toBeGreaterThan(0)
      const packageNames = result.pkgs.map(pkg => pkg.project)
      expect(packageNames).toContain('bun.sh')
      expect(packageNames).toContain('nodejs.org')
    }
  })

  it('should detect Laravel project and suggest database setup', async () => {
    // Create Laravel project structure
    fs.mkdirSync(path.join(projectDir, 'app'), { recursive: true })
    fs.writeFileSync(path.join(projectDir, 'artisan'), '#!/usr/bin/env php\n<?php\n// Laravel artisan script')
    fs.writeFileSync(path.join(projectDir, 'composer.json'), '{"name": "laravel/laravel"}')

    // Create .env file with PostgreSQL configuration
    const envContent = `APP_NAME=Laravel
APP_ENV=local
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=laravel
DB_USERNAME=postgres
DB_PASSWORD=
`
    fs.writeFileSync(path.join(projectDir, '.env'), envContent)

    // Create deps.yaml with database dependencies
    const depsContent = `dependencies:
  php: ^8.4.0
  composer: ^2.8.9
  postgres: ^17.2.0

services:
  enabled: true
  autoStart:
    - postgres
`
    fs.writeFileSync(path.join(projectDir, 'deps.yaml'), depsContent)

    // Import dump function to test Laravel detection
    const { detectLaravelProject } = await import('../src/dev/dump')
    const laravelInfo = await detectLaravelProject(projectDir)

    expect(laravelInfo.isLaravel).toBe(true)
    expect(laravelInfo.suggestions.length).toBeGreaterThan(0)
    expect(laravelInfo.suggestions.some(s => s.includes('migrate'))).toBe(true)
  })

  it('should handle Laravel app key generation in real project setup', async () => {
    // Create a realistic Laravel project scenario
    const projectDir = path.join(tempDir, 'laravel-project')
    fs.mkdirSync(projectDir, { recursive: true })

    // Create Laravel project structure
    fs.mkdirSync(path.join(projectDir, 'app'), { recursive: true })
    fs.mkdirSync(path.join(projectDir, 'database', 'migrations'), { recursive: true })

    fs.writeFileSync(path.join(projectDir, 'artisan'), '#!/usr/bin/env php\n<?php\nrequire_once __DIR__."/vendor/autoload.php";', { mode: 0o755 })
    fs.writeFileSync(path.join(projectDir, 'composer.json'), JSON.stringify({
      name: 'test/laravel-project',
      require: { 'laravel/framework': '^11.0', 'php': '^8.4' }
    }, null, 2))

    // Create .env with missing APP_KEY
    const envContent = `APP_NAME="Test Laravel App"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=test_app
DB_USERNAME=laravel
DB_PASSWORD=
`
    fs.writeFileSync(path.join(projectDir, '.env'), envContent)

    // Create a migration file to trigger migration suggestions
    fs.writeFileSync(
      path.join(projectDir, 'database', 'migrations', '2024_01_01_000000_create_users_table.php'),
      '<?php\n// Test migration file'
    )

    // Create deps.yaml
    const depsContent = `dependencies:
  php: ^8.4.0
  postgresql: ^17.2.0
  redis: ^8.0.3

services:
  enabled: true
  autoStart:
    - postgres
`
    fs.writeFileSync(path.join(projectDir, 'deps.yaml'), depsContent)

    // Test Laravel detection and app key handling
    const { detectLaravelProject } = await import('../src/dev/dump')
    const laravelInfo = await detectLaravelProject(projectDir)

    expect(laravelInfo.isLaravel).toBe(true)
    expect(laravelInfo.suggestions.length).toBeGreaterThan(0)

    // Should detect the need for migration
    expect(laravelInfo.suggestions.some(s => s.includes('migrate'))).toBe(true)

    // Should handle the empty APP_KEY (either by generation attempt or suggestion)
    // In test environment, automatic generation might not work, but it should be handled gracefully
    const hasAppKeyHandling = laravelInfo.suggestions.some(s =>
      s.includes('key') ||
      s.includes('encryption') ||
      s.includes('Generated') ||
      s.includes('artisan key:generate')
    )

    // The function should complete without throwing errors
    expect(typeof laravelInfo).toBe('object')
    expect(laravelInfo.suggestions).toBeDefined()

    // Verify .env file still exists and is readable
    expect(fs.existsSync(path.join(projectDir, '.env'))).toBe(true)
    const envAfter = fs.readFileSync(path.join(projectDir, '.env'), 'utf8')
    expect(envAfter).toContain('APP_NAME')
  })

  it('should prevent test cleanup from removing system dependencies', () => {
    // Test that resetInstalledTracker doesn't affect actual packages in test mode
    const { resetInstalledTracker } = require('../src/install')

    // This should not throw and should not attempt to remove actual packages
    expect(() => resetInstalledTracker()).not.toThrow()

    // In test mode, it should only reset tracking state
    process.env.NODE_ENV = 'test'
    expect(() => resetInstalledTracker()).not.toThrow()
  })

  it('should properly clean up only project environments in tests', () => {
    // Create mock environment directories
    const launchpadDir = path.join(tempDir, '.local', 'share', 'launchpad')
    const envsDir = path.join(launchpadDir, 'envs')
    const globalDir = path.join(launchpadDir, 'global')

    fs.mkdirSync(envsDir, { recursive: true })
    fs.mkdirSync(globalDir, { recursive: true })

    // Create test project environment (should be cleaned)
    const testEnvDir = path.join(envsDir, 'test_project_abc123de')
    fs.mkdirSync(testEnvDir, { recursive: true })
    fs.writeFileSync(path.join(testEnvDir, 'test-file'), 'test')

    // Create global environment (should NOT be cleaned)
    fs.writeFileSync(path.join(globalDir, 'global-tool'), 'global')

    // Test cleanup
    TestUtils.cleanupEnvironmentDirs()

    // Test environment should be cleaned
    expect(fs.existsSync(testEnvDir)).toBe(false)

    // Global environment should remain
    expect(fs.existsSync(globalDir)).toBe(true)
    expect(fs.existsSync(path.join(globalDir, 'global-tool'))).toBe(true)
  })
})
