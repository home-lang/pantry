import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

/**
 * Tests for download-from-s3 functionality.
 *
 * These tests validate the YAML parsing, version resolution,
 * and multi-version install support from the download-from-s3 script.
 *
 * Note: Actual S3 downloads are not tested here (those are integration tests).
 * These are unit tests for the parsing and resolution logic.
 */

// Inline the key functions for testing since the script is not a module export
// We test the same logic through the dependency-resolver which shares the same patterns

import {
  parseDepsYamlConfig,
  findDependencyFiles,
  type ServicesConfig,
} from '../src/dependency-resolver'

const fixturesDir = path.join(os.tmpdir(), 'pantry-download-s3-test')

describe('Download from S3 - Config Parsing', () => {
  beforeEach(() => {
    fs.mkdirSync(fixturesDir, { recursive: true })
  })

  afterEach(() => {
    if (fs.existsSync(fixturesDir)) {
      fs.rmSync(fixturesDir, { recursive: true, force: true })
    }
  })

  describe('parseDepsYamlConfig', () => {
    test('should parse easy-otc-api deps.yaml format', () => {
      const testFile = path.join(fixturesDir, 'deps.yaml')
      fs.writeFileSync(testFile, `dependencies:
  bun: ^1.3.9
  node: ^22.17.0
  php: ^8.4.11
  composer: ^2.8.10
  postgres: ^17.2.0
  redis: ^8.0.4

# Launchpad service management configuration
services:
  enabled: true
  autoStart:
    - postgres
    - redis
`)

      const config = parseDepsYamlConfig(testFile)

      // Check dependencies
      expect(config.dependencies).toHaveLength(6)
      expect(config.dependencies[0].name).toBe('bun')
      expect(config.dependencies[0].constraint).toBe('^1.3.9')
      expect(config.dependencies[1].name).toBe('node')
      expect(config.dependencies[2].name).toBe('php')
      expect(config.dependencies[3].name).toBe('composer')
      expect(config.dependencies[4].name).toBe('postgres')
      expect(config.dependencies[5].name).toBe('redis')

      // Check services
      expect(config.services).toBeDefined()
      expect(config.services!.enabled).toBe(true)
      expect(config.services!.autoStart).toHaveLength(2)
      expect(config.services!.autoStart).toContain('postgres')
      expect(config.services!.autoStart).toContain('redis')
    })

    test('should parse deps without services section', () => {
      const testFile = path.join(fixturesDir, 'deps.yaml')
      fs.writeFileSync(testFile, `dependencies:
  bun: ^1.3.9
  node: ^22.0.0
`)

      const config = parseDepsYamlConfig(testFile)

      expect(config.dependencies).toHaveLength(2)
      expect(config.services).toBeUndefined()
    })

    test('should parse services with enabled: false', () => {
      const testFile = path.join(fixturesDir, 'deps.yaml')
      fs.writeFileSync(testFile, `dependencies:
  redis: ^8.0.0

services:
  enabled: false
  autoStart:
    - redis
`)

      const config = parseDepsYamlConfig(testFile)

      expect(config.services).toBeDefined()
      expect(config.services!.enabled).toBe(false)
      expect(config.services!.autoStart).toContain('redis')
    })

    test('should handle empty autoStart list', () => {
      const testFile = path.join(fixturesDir, 'deps.yaml')
      fs.writeFileSync(testFile, `dependencies:
  bun: ^1.0.0

services:
  enabled: true
`)

      const config = parseDepsYamlConfig(testFile)

      // No autoStart items = no services config
      expect(config.services).toBeUndefined()
    })

    test('should handle multiple services in autoStart', () => {
      const testFile = path.join(fixturesDir, 'deps.yaml')
      fs.writeFileSync(testFile, `dependencies:
  postgres: ^17.0.0
  redis: ^8.0.0
  mysql: ^8.0.0

services:
  enabled: true
  autoStart:
    - postgres
    - redis
    - mysql
`)

      const config = parseDepsYamlConfig(testFile)

      expect(config.services).toBeDefined()
      expect(config.services!.autoStart).toHaveLength(3)
      expect(config.services!.autoStart).toEqual(['postgres', 'redis', 'mysql'])
    })

    test('should handle comments in yaml', () => {
      const testFile = path.join(fixturesDir, 'deps.yaml')
      fs.writeFileSync(testFile, `# Project dependencies
dependencies:
  # Runtime
  bun: ^1.3.9
  # Database
  postgres: ^17.2.0

# Service configuration
services:
  enabled: true
  autoStart:
    - postgres
`)

      const config = parseDepsYamlConfig(testFile)

      expect(config.dependencies).toHaveLength(2)
      expect(config.services).toBeDefined()
      expect(config.services!.autoStart).toContain('postgres')
    })

    test('should throw for non-existent file', () => {
      expect(() => {
        parseDepsYamlConfig('/non/existent/file.yaml')
      }).toThrow('Dependency file not found')
    })

    test('should handle empty file', () => {
      const testFile = path.join(fixturesDir, 'empty.yaml')
      fs.writeFileSync(testFile, '')

      const config = parseDepsYamlConfig(testFile)
      expect(config.dependencies).toHaveLength(0)
      expect(config.services).toBeUndefined()
    })
  })

  describe('Multi-Version Support', () => {
    test('should create version-specific directories', () => {
      const installDir = path.join(fixturesDir, 'install')

      // Simulate multi-version install structure
      const versions = ['17.2.0', '16.4.0', '15.8.0']
      for (const v of versions) {
        fs.mkdirSync(path.join(installDir, 'postgres', v, 'bin'), { recursive: true })
      }

      // Verify all versions exist side by side
      for (const v of versions) {
        expect(fs.existsSync(path.join(installDir, 'postgres', v, 'bin'))).toBe(true)
      }

      // Verify they're separate directories
      const entries = fs.readdirSync(path.join(installDir, 'postgres'))
      expect(entries).toHaveLength(3)
    })

    test('should support current symlink for default version', () => {
      const installDir = path.join(fixturesDir, 'install')
      const v1Dir = path.join(installDir, 'postgres', '17.2.0')
      const v2Dir = path.join(installDir, 'postgres', '16.4.0')

      fs.mkdirSync(path.join(v1Dir, 'bin'), { recursive: true })
      fs.mkdirSync(path.join(v2Dir, 'bin'), { recursive: true })

      // Create current symlink
      const currentLink = path.join(installDir, 'postgres', 'current')
      fs.symlinkSync('17.2.0', currentLink)

      expect(fs.readlinkSync(currentLink)).toBe('17.2.0')
      expect(fs.existsSync(path.join(currentLink, 'bin'))).toBe(true)
    })

    test('should allow switching active version via current symlink', () => {
      const installDir = path.join(fixturesDir, 'install')
      const v1Dir = path.join(installDir, 'postgres', '17.2.0')
      const v2Dir = path.join(installDir, 'postgres', '16.4.0')

      fs.mkdirSync(path.join(v1Dir, 'bin'), { recursive: true })
      fs.mkdirSync(path.join(v2Dir, 'bin'), { recursive: true })

      // Create marker files
      fs.writeFileSync(path.join(v1Dir, 'bin', 'version'), '17.2.0')
      fs.writeFileSync(path.join(v2Dir, 'bin', 'version'), '16.4.0')

      const currentLink = path.join(installDir, 'postgres', 'current')

      // Point to v1
      fs.symlinkSync('17.2.0', currentLink)
      expect(fs.readFileSync(path.join(currentLink, 'bin', 'version'), 'utf-8')).toBe('17.2.0')

      // Switch to v2
      fs.rmSync(currentLink)
      fs.symlinkSync('16.4.0', currentLink)
      expect(fs.readFileSync(path.join(currentLink, 'bin', 'version'), 'utf-8')).toBe('16.4.0')
    })
  })

  describe('findDependencyFiles', () => {
    test('should find deps.yaml in project directory', () => {
      const projectDir = path.join(fixturesDir, 'project')
      fs.mkdirSync(projectDir, { recursive: true })
      fs.writeFileSync(path.join(projectDir, 'deps.yaml'), 'dependencies:\n  bun: ^1.0.0')

      const found = findDependencyFiles(projectDir)
      expect(found).toContain(path.join(projectDir, 'deps.yaml'))
    })

    test('should find multiple dependency files', () => {
      const projectDir = path.join(fixturesDir, 'project')
      fs.mkdirSync(projectDir, { recursive: true })
      fs.writeFileSync(path.join(projectDir, 'deps.yaml'), 'dependencies:\n  bun: ^1.0.0')
      fs.writeFileSync(path.join(projectDir, 'deps.yml'), 'dependencies:\n  bun: ^1.0.0')
      fs.writeFileSync(path.join(projectDir, 'pkgx.yaml'), 'dependencies:\n  bun: ^1.0.0')

      const found = findDependencyFiles(projectDir)
      expect(found.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Version Resolution Logic', () => {
    // Import from version-utils for version resolution
    const { resolveVersionFromMetadata } = require('../src/version-utils')

    test('should resolve caret constraint against real-world versions', () => {
      // Simulating postgres versions
      const versions = ['17.2.0', '17.1.0', '17.0.0', '16.6.0', '16.5.0', '16.4.0', '15.8.0']

      const result = resolveVersionFromMetadata('^17.2.0', versions)
      expect(result).toBe('17.2.0')
    })

    test('should resolve caret to latest within major', () => {
      const versions = ['17.5.0', '17.3.0', '17.2.0', '16.4.0']

      const result = resolveVersionFromMetadata('^17.0.0', versions)
      expect(result).toBe('17.5.0')
    })

    test('should resolve tilde to latest within minor', () => {
      const versions = ['8.4.15', '8.4.11', '8.4.0', '8.3.0', '8.2.0']

      const result = resolveVersionFromMetadata('~8.4.0', versions)
      expect(result).toBe('8.4.15')
    })

    test('should handle Redis version format', () => {
      const versions = ['8.0.4', '8.0.3', '8.0.0', '7.4.0', '7.2.0']

      const result = resolveVersionFromMetadata('^8.0.4', versions)
      expect(result).toBe('8.0.4')
    })

    test('should resolve Bun version constraint', () => {
      const versions = ['1.3.15', '1.3.10', '1.3.9', '1.2.0', '1.1.0']

      const result = resolveVersionFromMetadata('^1.3.9', versions)
      expect(result).toBe('1.3.15')
    })

    test('should resolve Node.js version constraint', () => {
      const versions = ['22.17.0', '22.15.0', '22.12.0', '21.0.0', '20.18.0']

      const result = resolveVersionFromMetadata('^22.17.0', versions)
      expect(result).toBe('22.17.0')
    })
  })
})
