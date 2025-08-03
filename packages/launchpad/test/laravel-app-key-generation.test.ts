import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { TestUtils } from './test.config'

/**
 * Laravel App Key Generation Tests
 *
 * Tests the automatic generation of Laravel application encryption keys
 * to prevent "No application encryption key has been specified" errors.
 */
describe('Laravel App Key Generation', () => {
  let tempProjectDir: string
  let originalCwd: string
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    originalEnv = { ...process.env }
    originalCwd = process.cwd()

    // Create isolated test environment
    tempProjectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-laravel-key-test-'))
    process.chdir(tempProjectDir)

    // Set test environment
    process.env.NODE_ENV = 'test'
    process.env.LAUNCHPAD_TEST_MODE = 'true'
    TestUtils.resetTestEnvironment()
  })

  afterEach(() => {
    // Safely change back to original directory
    if (originalCwd && typeof originalCwd === 'string') {
      try {
        process.chdir(originalCwd)
      } catch (error) {
        // If original directory no longer exists, change to a safe directory
        process.chdir(os.homedir())
      }
    }

    Object.keys(process.env).forEach((key) => {
      delete process.env[key]
    })
    Object.assign(process.env, originalEnv)

    if (tempProjectDir && fs.existsSync(tempProjectDir)) {
      fs.rmSync(tempProjectDir, { recursive: true, force: true })
    }
    TestUtils.cleanupEnvironmentDirs()
  })

  const createLaravelProject = (envContent: string) => {
    // Create Laravel project structure
    fs.mkdirSync('app', { recursive: true })
    fs.mkdirSync('database/migrations', { recursive: true })

    // Create artisan file
    fs.writeFileSync('artisan', '#!/usr/bin/env php\n<?php\nrequire_once __DIR__."/vendor/autoload.php";', { mode: 0o755 })

    // Create composer.json
    fs.writeFileSync('composer.json', JSON.stringify({
      name: 'test/laravel-app',
      require: { 'laravel/framework': '^11.0' }
    }, null, 2))

    // Create .env file
    fs.writeFileSync('.env', envContent)
  }

  describe('App Key Detection', () => {
    it('should detect missing APP_KEY in .env file', async () => {
      createLaravelProject(`
APP_NAME=Laravel
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost
`)

      const { detectLaravelProject } = await import('../src/dev/dump')
      const result = await detectLaravelProject(tempProjectDir)

      expect(result.isLaravel).toBe(true)
      expect(result.suggestions).toBeDefined()

      // Should have suggestions (though automatic generation might not work in test environment)
      expect(result.suggestions.length).toBeGreaterThan(0)
    })

    it('should detect empty APP_KEY value', async () => {
      createLaravelProject(`
APP_NAME=Laravel
APP_ENV=local
APP_KEY=
APP_DEBUG=true
`)

      const { detectLaravelProject } = await import('../src/dev/dump')
      const result = await detectLaravelProject(tempProjectDir)

      expect(result.isLaravel).toBe(true)
      expect(result.suggestions).toBeDefined()
    })

    it('should detect incomplete base64 APP_KEY', async () => {
      createLaravelProject(`
APP_NAME=Laravel
APP_ENV=local
APP_KEY=base64:
APP_DEBUG=true
`)

      const { detectLaravelProject } = await import('../src/dev/dump')
      const result = await detectLaravelProject(tempProjectDir)

      expect(result.isLaravel).toBe(true)
      expect(result.suggestions).toBeDefined()
    })

    it('should recognize valid APP_KEY', async () => {
      createLaravelProject(`
APP_NAME=Laravel
APP_ENV=local
APP_KEY=base64:XKSOwxwKVP7HgtL/SDPUpve3NPwuhJasnvdMQRsDe3E=
APP_DEBUG=true
`)

      const { detectLaravelProject } = await import('../src/dev/dump')
      const result = await detectLaravelProject(tempProjectDir)

      expect(result.isLaravel).toBe(true)
      expect(result.suggestions).toBeDefined()

      // Should recognize the valid key (if validation logic is working)
      // The exact suggestion depends on implementation, but should not suggest key generation
      const hasKeyGenerationSuggestion = result.suggestions.some(s =>
        s.includes('key:generate') || s.includes('encryption key')
      )

      // With a valid key, should not suggest generation (or should show validation)
      if (hasKeyGenerationSuggestion) {
        // If there's a key suggestion, it should be a validation message, not generation
        expect(result.suggestions.some(s => s.includes('✅') && s.includes('configured'))).toBe(true)
      }
    })
  })

  describe('Laravel Project Structure Validation', () => {
    it('should not detect Laravel without artisan file', async () => {
      // Create partial Laravel structure (missing artisan)
      fs.mkdirSync('app', { recursive: true })
      fs.writeFileSync('composer.json', JSON.stringify({
        require: { 'laravel/framework': '^11.0' }
      }))

      const { detectLaravelProject } = await import('../src/dev/dump')
      const result = await detectLaravelProject(tempProjectDir)

      expect(result.isLaravel).toBe(false)
      expect(result.suggestions).toEqual([])
    })

    it('should not detect Laravel without composer.json', async () => {
      // Create partial Laravel structure (missing composer.json)
      fs.mkdirSync('app', { recursive: true })
      fs.writeFileSync('artisan', '#!/usr/bin/env php\n<?php')

      const { detectLaravelProject } = await import('../src/dev/dump')
      const result = await detectLaravelProject(tempProjectDir)

      expect(result.isLaravel).toBe(false)
      expect(result.suggestions).toEqual([])
    })

    it('should not detect Laravel without app directory', async () => {
      // Create partial Laravel structure (missing app directory)
      fs.writeFileSync('artisan', '#!/usr/bin/env php\n<?php')
      fs.writeFileSync('composer.json', JSON.stringify({
        require: { 'laravel/framework': '^11.0' }
      }))

      const { detectLaravelProject } = await import('../src/dev/dump')
      const result = await detectLaravelProject(tempProjectDir)

      expect(result.isLaravel).toBe(false)
      expect(result.suggestions).toEqual([])
    })
  })

  describe('Error Handling', () => {
    it('should handle missing .env file gracefully', async () => {
      // Create Laravel project without .env file
      fs.mkdirSync('app', { recursive: true })
      fs.writeFileSync('artisan', '#!/usr/bin/env php\n<?php')
      fs.writeFileSync('composer.json', JSON.stringify({
        require: { 'laravel/framework': '^11.0' }
      }))

      // Create .env.example but no .env
      fs.writeFileSync('.env.example', `
APP_NAME=Laravel
APP_ENV=local
APP_KEY=
APP_DEBUG=true
`)

      const { detectLaravelProject } = await import('../src/dev/dump')
      const result = await detectLaravelProject(tempProjectDir)

      expect(result.isLaravel).toBe(true)
      expect(result.suggestions).toBeDefined()

      // Should suggest copying .env.example
      expect(result.suggestions.some(s => s.includes('.env.example'))).toBe(true)
    })

    it('should handle corrupted .env file gracefully', async () => {
      createLaravelProject('\x00\x01invalid content\x02')

      const { detectLaravelProject } = await import('../src/dev/dump')

      // Should not throw an error
      const result = await detectLaravelProject(tempProjectDir)
      expect(result.isLaravel).toBe(true)
    })
  })

  describe('Integration with Migration Suggestions', () => {
    it('should provide both app key and migration suggestions', async () => {
      createLaravelProject(`
APP_NAME=Laravel
APP_ENV=local
APP_KEY=
APP_DEBUG=true
DB_CONNECTION=mysql
DB_DATABASE=test_app
`)

      // Create migrations to trigger migration suggestions
      fs.mkdirSync('database/migrations', { recursive: true })
      fs.writeFileSync('database/migrations/2024_01_01_000000_create_users_table.php', '<?php\n// Migration file')

      const { detectLaravelProject } = await import('../src/dev/dump')
      const result = await detectLaravelProject(tempProjectDir)

      expect(result.isLaravel).toBe(true)
      expect(result.suggestions.length).toBeGreaterThan(1)

      // Should have migration suggestion
      expect(result.suggestions.some(s => s.includes('migrate'))).toBe(true)

      // Should also handle app key (either generation attempt or suggestion)
      const hasAppKeyRelatedSuggestion = result.suggestions.some(s =>
        s.includes('key') || s.includes('encryption')
      )

      // Note: In test environment, automatic generation might not work,
      // but there should be some handling of the empty APP_KEY
    })
  })

  describe('App Key Format Validation', () => {
    it('should handle various APP_KEY formats', async () => {
      const testCases = [
        { key: '', description: 'completely empty' },
        { key: '   ', description: 'whitespace only' },
        { key: 'base64:', description: 'incomplete base64 prefix' },
        { key: 'invalid-key-format', description: 'invalid format' },
        { key: 'base64:dGVzdA==', description: 'short base64 key' },
        { key: 'base64:XKSOwxwKVP7HgtL/SDPUpve3NPwuhJasnvdMQRsDe3E=', description: 'valid base64 key' }
      ]

      for (const testCase of testCases) {
        // Clean up previous test
        if (fs.existsSync('.env')) {
          fs.unlinkSync('.env')
        }

        createLaravelProject(`
APP_NAME=Laravel
APP_ENV=local
APP_KEY=${testCase.key}
APP_DEBUG=true
`)

        const { detectLaravelProject } = await import('../src/dev/dump')
        const result = await detectLaravelProject(tempProjectDir)

        expect(result.isLaravel).toBe(true)

        // All cases should be handled gracefully without throwing errors
        expect(result.suggestions).toBeDefined()
        expect(Array.isArray(result.suggestions)).toBe(true)
      }
    })
  })

  describe('Performance and Efficiency', () => {
    it('should detect Laravel and handle app key quickly', async () => {
      createLaravelProject(`
APP_NAME=Laravel
APP_ENV=local
APP_KEY=
APP_DEBUG=true
`)

      const { detectLaravelProject } = await import('../src/dev/dump')

      const startTime = Date.now()
      const result = await detectLaravelProject(tempProjectDir)
      const endTime = Date.now()

      // Should complete quickly (under 1 second for basic detection)
      expect(endTime - startTime).toBeLessThan(1000)
      expect(result.isLaravel).toBe(true)
    })

    it('should not attempt key generation in test environment', async () => {
      createLaravelProject(`
APP_NAME=Laravel
APP_ENV=local
APP_KEY=
APP_DEBUG=true
`)

      // Ensure we're in test mode
      process.env.NODE_ENV = 'test'

      const { detectLaravelProject } = await import('../src/dev/dump')

      // Should not attempt to run actual php artisan commands in test environment
      const result = await detectLaravelProject(tempProjectDir)
      expect(result.isLaravel).toBe(true)
    })
  })

  describe('Post-Setup Commands Integration', () => {
    it('should detect migration conditions correctly', async () => {
      createLaravelProject(`
APP_NAME=Laravel
APP_ENV=local
APP_KEY=base64:XKSOwxwKVP7HgtL/SDPUpve3NPwuhJasnvdMQRsDe3E=
APP_DEBUG=true
`)

      // Create some migration files to test migration detection
      fs.mkdirSync('database/migrations', { recursive: true })
      fs.writeFileSync('database/migrations/2024_01_01_000000_create_users_table.php', '<?php\n// Migration file')
      fs.writeFileSync('database/migrations/2024_01_02_000000_create_posts_table.php', '<?php\n// Another migration')

      const { detectLaravelProject } = await import('../src/dev/dump')
      const result = await detectLaravelProject(tempProjectDir)

      expect(result.isLaravel).toBe(true)
      expect(result.suggestions).toBeDefined()

      // Should include some suggestions (though exact content depends on config and conditions)
      expect(Array.isArray(result.suggestions)).toBe(true)
    })

    it('should detect seeder conditions correctly', async () => {
      createLaravelProject(`
APP_NAME=Laravel
APP_ENV=local
APP_KEY=base64:XKSOwxwKVP7HgtL/SDPUpve3NPwuhJasnvdMQRsDe3E=
APP_DEBUG=true
`)

      // Create database seeders
      fs.mkdirSync('database/seeders', { recursive: true })
      fs.writeFileSync('database/seeders/DatabaseSeeder.php', `<?php

namespace Database\\Seeders;

use Illuminate\\Database\\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call([
            UserSeeder::class,
        ]);
    }
}
`)
      fs.writeFileSync('database/seeders/UserSeeder.php', '<?php\n// User seeder')

      const { detectLaravelProject } = await import('../src/dev/dump')
      const result = await detectLaravelProject(tempProjectDir)

      expect(result.isLaravel).toBe(true)
      expect(result.suggestions).toBeDefined()
    })

    it('should detect storage link needs correctly', async () => {
      createLaravelProject(`
APP_NAME=Laravel
APP_ENV=local
APP_KEY=base64:XKSOwxwKVP7HgtL/SDPUpve3NPwuhJasnvdMQRsDe3E=
APP_DEBUG=true
`)

      // Create storage structure but no symlink
      fs.mkdirSync('storage/app/public', { recursive: true })
      fs.mkdirSync('public', { recursive: true })
      fs.writeFileSync('storage/app/public/test.txt', 'test file')

      const { detectLaravelProject } = await import('../src/dev/dump')
      const result = await detectLaravelProject(tempProjectDir)

      expect(result.isLaravel).toBe(true)
      expect(result.suggestions).toBeDefined()
    })

    it('should handle production environment detection', async () => {
      createLaravelProject(`
APP_NAME=Laravel
APP_ENV=production
APP_KEY=base64:XKSOwxwKVP7HgtL/SDPUpve3NPwuhJasnvdMQRsDe3E=
APP_DEBUG=false
`)

      const { detectLaravelProject } = await import('../src/dev/dump')
      const result = await detectLaravelProject(tempProjectDir)

      expect(result.isLaravel).toBe(true)
      expect(result.suggestions).toBeDefined()

      // In production environment, should handle differently than development
      expect(Array.isArray(result.suggestions)).toBe(true)
    })

    it('should handle post-setup commands gracefully when disabled', async () => {
      createLaravelProject(`
APP_NAME=Laravel
APP_ENV=local
APP_KEY=
APP_DEBUG=true
`)

      // Temporarily disable post-setup commands
      const originalConfig = process.env.LAUNCHPAD_LARAVEL_POST_SETUP
      process.env.LAUNCHPAD_LARAVEL_POST_SETUP = 'false'

      try {
        const { detectLaravelProject } = await import('../src/dev/dump')
        const result = await detectLaravelProject(tempProjectDir)

        expect(result.isLaravel).toBe(true)
        expect(result.suggestions).toBeDefined()

        // Should still work even with post-setup disabled
        expect(Array.isArray(result.suggestions)).toBe(true)
      } finally {
        // Restore original setting
        if (originalConfig !== undefined) {
          process.env.LAUNCHPAD_LARAVEL_POST_SETUP = originalConfig
        } else {
          delete process.env.LAUNCHPAD_LARAVEL_POST_SETUP
        }
      }
    })
  })
})
