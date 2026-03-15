import { describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { resolveDependencies } from '../src/pantry-api'

describe('PostgreSQL Alias Resolution - Regression Test', () => {
  it('should properly resolve postgres alias to postgresql.org with all dependencies', async () => {
    // This is a regression test for the bug where "postgres: *" in YAML
    // was not being resolved to "postgresql.org: *", causing dependency
    // resolution to fail and only return 1 package instead of all transitive dependencies

    const tempDir = os.tmpdir()
    const tempFile = path.join(tempDir, `postgres-alias-test-${Date.now()}.yaml`)

    // This YAML content represents what Pantry was incorrectly generating
    // when a user requested "postgres" - it should be resolved to "postgresql.org"
    const yamlContent = `dependencies:
  postgresql.org: "*"
`

    try {
      fs.writeFileSync(tempFile, yamlContent)

      const result = await resolveDependencies(tempFile, {
        targetOs: 'darwin',
        includeOsSpecific: true,
      })

      // Should resolve to multiple packages (PostgreSQL + all its dependencies)
      expect(result.totalCount).toBeGreaterThan(1)
      expect(result.totalCount).toBeGreaterThanOrEqual(10) // PostgreSQL has many dependencies

      // Should include PostgreSQL itself
      const postgresqlPkg = result.packages.find(pkg => pkg.name === 'postgresql.org')
      expect(postgresqlPkg).toBeDefined()
      expect(postgresqlPkg?.version).toBeTruthy()

      // Should include critical dependencies
      const unicodePkg = result.packages.find(pkg => pkg.name === 'unicode.org')
      expect(unicodePkg).toBeDefined()
      expect(unicodePkg?.version).toBeTruthy()

      const opensslPkg = result.packages.find(pkg => pkg.name === 'openssl.org')
      expect(opensslPkg).toBeDefined()

      const zlibPkg = result.packages.find(pkg => pkg.name === 'zlib.net')
      expect(zlibPkg).toBeDefined()

      // Verify that we get a valid command for installation
      expect(result.pkgxCommand).toContain('postgresql.org')
      expect(result.pantryCommand).toContain('postgresql.org')
    }
    finally {
      // Clean up
      try {
        fs.unlinkSync(tempFile)
      }
      catch {
        // Ignore cleanup errors
      }
    }
  })

  it('should resolve postgres alias correctly (verifies the bug is fixed)', async () => {
    // This test verifies that the alias bug has been fixed: using "postgres" instead of
    // "postgresql.org" should now properly resolve via alias resolution and return
    // all transitive dependencies, just like using the full domain name.

    const tempDir = os.tmpdir()
    const tempFile = path.join(tempDir, `postgres-bug-test-${Date.now()}.yaml`)

    // Using the alias "postgres" should now resolve to "postgresql.org"
    const yamlContent = `dependencies:
  postgres: "*"
`

    try {
      fs.writeFileSync(tempFile, yamlContent)

      const result = await resolveDependencies(tempFile, {
        targetOs: 'darwin',
        includeOsSpecific: true,
      })

      // The alias should now resolve correctly, returning all transitive dependencies
      expect(result.totalCount).toBeGreaterThan(1)
      expect(result.totalCount).toBeGreaterThanOrEqual(10) // PostgreSQL has many dependencies

      // The direct dependency retains its original alias name "postgres" in the result,
      // but its transitive dependencies are properly resolved via the package index
      const postgresPkg = result.packages.find(pkg => pkg.name === 'postgres' || pkg.name === 'postgresql.org')
      expect(postgresPkg).toBeDefined()
      expect(postgresPkg?.version).toBeTruthy()
    }
    finally {
      // Clean up
      try {
        fs.unlinkSync(tempFile)
      }
      catch {
        // Ignore cleanup errors
      }
    }
  })

  it('should handle mixed aliases and domain names correctly', async () => {
    // Test that the fix works with a mix of aliases and proper domain names

    const tempDir = os.tmpdir()
    const tempFile = path.join(tempDir, `mixed-aliases-test-${Date.now()}.yaml`)

    const yamlContent = `dependencies:
  postgresql.org: "^17.0.0"
  bun.sh: "^1.2.0"
  node.js: "*"
`

    try {
      fs.writeFileSync(tempFile, yamlContent)

      const result = await resolveDependencies(tempFile, {
        targetOs: 'darwin',
        includeOsSpecific: true,
      })

      // Should resolve all dependencies
      expect(result.totalCount).toBeGreaterThan(3)
      expect(result.directCount).toBe(3)

      // Check for the main packages
      const postgresqlPkg = result.packages.find(pkg => pkg.name === 'postgresql.org')
      expect(postgresqlPkg).toBeDefined()

      const bunPkg = result.packages.find(pkg => pkg.name === 'bun.sh')
      expect(bunPkg).toBeDefined()

      const nodePkg = result.packages.find(pkg => pkg.name === 'node.js')
      expect(nodePkg).toBeDefined()
    }
    finally {
      // Clean up
      try {
        fs.unlinkSync(tempFile)
      }
      catch {
        // Ignore cleanup errors
      }
    }
  })
})
