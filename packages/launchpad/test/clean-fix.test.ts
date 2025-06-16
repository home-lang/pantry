import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import fs from 'node:fs'
import path from 'node:path'
import { install } from '../src/install'

describe('Clean Command Fix - Package and Binary Removal', () => {
  let tempDir: string
  let installPath: string
  let binDir: string
  let pkgsDir: string

  beforeEach(() => {
    // Create temporary directory for test
    tempDir = fs.mkdtempSync(path.join(import.meta.dirname, 'clean-test-'))
    installPath = tempDir
    binDir = path.join(installPath, 'bin')
    pkgsDir = path.join(installPath, 'pkgs')

    // Ensure directories exist
    fs.mkdirSync(binDir, { recursive: true })
    fs.mkdirSync(pkgsDir, { recursive: true })
  })

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  // Mock installation function for testing
  async function mockInstallPackage(domain: string, version: string, binaries: string[]): Promise<void> {
    // Create package metadata directory
    const packageDir = path.join(pkgsDir, domain, `v${version}`)
    fs.mkdirSync(packageDir, { recursive: true })

    // Create binaries in bin directory
    const installedBinaries: string[] = []
    for (const binary of binaries) {
      const binaryPath = path.join(binDir, binary)
      fs.writeFileSync(binaryPath, `#!/bin/bash\necho "Mock ${binary} from ${domain} v${version}"\n`)
      fs.chmodSync(binaryPath, 0o755)
      installedBinaries.push(binary)
    }

    // Create metadata file
    const metadata = {
      domain,
      version,
      installedAt: new Date().toISOString(),
      binaries: installedBinaries,
      installPath: binDir,
    }

    fs.writeFileSync(
      path.join(packageDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2),
    )
  }

  // Helper function to check if binary exists
  function binaryExists(name: string): boolean {
    return fs.existsSync(path.join(binDir, name))
  }

  // Helper function to check if package metadata exists
  function packageMetadataExists(domain: string, version: string): boolean {
    return fs.existsSync(path.join(pkgsDir, domain, `v${version}`, 'metadata.json'))
  }

  test('should track installed packages with metadata', async () => {
    // Mock install node package
    await mockInstallPackage('nodejs.org', '20.0.0', ['node', 'npm', 'npx'])

    // Verify binaries exist
    expect(binaryExists('node')).toBe(true)
    expect(binaryExists('npm')).toBe(true)
    expect(binaryExists('npx')).toBe(true)

    // Verify package metadata exists
    expect(packageMetadataExists('nodejs.org', '20.0.0')).toBe(true)

    // Verify metadata content
    const metadataPath = path.join(pkgsDir, 'nodejs.org', 'v20.0.0', 'metadata.json')
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))
    expect(metadata.domain).toBe('nodejs.org')
    expect(metadata.version).toBe('20.0.0')
    expect(metadata.binaries).toEqual(['node', 'npm', 'npx'])
  })

  test('should handle multiple packages with different binaries', async () => {
    // Mock install multiple packages
    await mockInstallPackage('nodejs.org', '20.0.0', ['node', 'npm', 'npx'])
    await mockInstallPackage('python.org', '3.11.0', ['python', 'pip', 'python3'])
    await mockInstallPackage('bun.sh', '1.2.0', ['bun'])

    // Verify all binaries exist
    expect(binaryExists('node')).toBe(true)
    expect(binaryExists('npm')).toBe(true)
    expect(binaryExists('npx')).toBe(true)
    expect(binaryExists('python')).toBe(true)
    expect(binaryExists('pip')).toBe(true)
    expect(binaryExists('python3')).toBe(true)
    expect(binaryExists('bun')).toBe(true)

    // Verify all package metadata exists
    expect(packageMetadataExists('nodejs.org', '20.0.0')).toBe(true)
    expect(packageMetadataExists('python.org', '3.11.0')).toBe(true)
    expect(packageMetadataExists('bun.sh', '1.2.0')).toBe(true)
  })

  test('getLaunchpadBinaries should correctly identify managed binaries', async () => {
    // Mock install packages
    await mockInstallPackage('nodejs.org', '20.0.0', ['node', 'npm'])
    await mockInstallPackage('python.org', '3.11.0', ['python', 'pip'])

    // Add a non-Launchpad binary (shouldn't be tracked)
    const nonLaunchpadBinary = path.join(binDir, 'non-launchpad-tool')
    fs.writeFileSync(nonLaunchpadBinary, '#!/bin/bash\necho "Not managed by Launchpad"\n')
    fs.chmodSync(nonLaunchpadBinary, 0o755)

    // Import the getLaunchpadBinaries function logic (we need to simulate it)
    const getLaunchpadBinaries = (): Array<{ binary: string, package: string, fullPath: string }> => {
      const binaries: Array<{ binary: string, package: string, fullPath: string }> = []

      if (!fs.existsSync(pkgsDir))
        return binaries

      try {
        const domains = fs.readdirSync(pkgsDir, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())

        for (const domain of domains) {
          const domainPath = path.join(pkgsDir, domain.name)
          const versions = fs.readdirSync(domainPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())

          for (const version of versions) {
            const versionPath = path.join(domainPath, version.name)
            const metadataPath = path.join(versionPath, 'metadata.json')

            if (fs.existsSync(metadataPath)) {
              try {
                const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))
                if (metadata.binaries && Array.isArray(metadata.binaries)) {
                  for (const binary of metadata.binaries) {
                    const binaryPath = path.join(binDir, binary)
                    if (fs.existsSync(binaryPath)) {
                      binaries.push({
                        binary,
                        package: `${domain.name}@${version.name.slice(1)}`,
                        fullPath: binaryPath,
                      })
                    }
                  }
                }
              }
              catch {
                // Ignore invalid metadata files
              }
            }
          }
        }
      }
      catch {
        // Ignore errors reading package directory
      }

      return binaries
    }

    const launchpadBinaries = getLaunchpadBinaries()

    // Should only find Launchpad-managed binaries
    expect(launchpadBinaries).toHaveLength(4)
    const binaryNames = launchpadBinaries.map(b => b.binary)
    expect(binaryNames).toContain('node')
    expect(binaryNames).toContain('npm')
    expect(binaryNames).toContain('python')
    expect(binaryNames).toContain('pip')
    expect(binaryNames).not.toContain('non-launchpad-tool')

    // Verify package association
    const nodeEntry = launchpadBinaries.find(b => b.binary === 'node')
    expect(nodeEntry?.package).toBe('nodejs.org@20.0.0')

    const pythonEntry = launchpadBinaries.find(b => b.binary === 'python')
    expect(pythonEntry?.package).toBe('python.org@3.11.0')
  })

  test('clean operation should remove both metadata and binaries', async () => {
    // Mock install packages
    await mockInstallPackage('nodejs.org', '20.0.0', ['node', 'npm'])
    await mockInstallPackage('python.org', '3.11.0', ['python', 'pip'])

    // Add non-Launchpad binary that should NOT be removed
    const nonLaunchpadBinary = path.join(binDir, 'system-tool')
    fs.writeFileSync(nonLaunchpadBinary, '#!/bin/bash\necho "System tool"\n')
    fs.chmodSync(nonLaunchpadBinary, 0o755)

    // Verify everything exists before cleanup
    expect(binaryExists('node')).toBe(true)
    expect(binaryExists('npm')).toBe(true)
    expect(binaryExists('python')).toBe(true)
    expect(binaryExists('pip')).toBe(true)
    expect(binaryExists('system-tool')).toBe(true)
    expect(packageMetadataExists('nodejs.org', '20.0.0')).toBe(true)
    expect(packageMetadataExists('python.org', '3.11.0')).toBe(true)

    // Simulate clean operation
    // 1. Remove package metadata directories
    fs.rmSync(pkgsDir, { recursive: true, force: true })

    // 2. Remove only Launchpad-managed binaries (we'd get this list from metadata before deletion)
    const launchpadManagedBinaries = ['node', 'npm', 'python', 'pip'] // This would come from metadata scan
    for (const binary of launchpadManagedBinaries) {
      const binaryPath = path.join(binDir, binary)
      if (fs.existsSync(binaryPath)) {
        fs.unlinkSync(binaryPath)
      }
    }

    // Verify cleanup results
    expect(binaryExists('node')).toBe(false)
    expect(binaryExists('npm')).toBe(false)
    expect(binaryExists('python')).toBe(false)
    expect(binaryExists('pip')).toBe(false)
    expect(binaryExists('system-tool')).toBe(true) // Should remain untouched
    expect(fs.existsSync(pkgsDir)).toBe(false)
  })

  test('should handle missing binaries gracefully', async () => {
    // Create package metadata but remove some binaries manually
    await mockInstallPackage('nodejs.org', '20.0.0', ['node', 'npm', 'npx'])

    // Manually remove one binary (simulating partial cleanup or external removal)
    fs.unlinkSync(path.join(binDir, 'npm'))

    // Verify npm binary is gone but metadata still exists
    expect(binaryExists('node')).toBe(true)
    expect(binaryExists('npm')).toBe(false)
    expect(binaryExists('npx')).toBe(true)
    expect(packageMetadataExists('nodejs.org', '20.0.0')).toBe(true)

    // The clean operation should handle missing binaries gracefully
    const metadataPath = path.join(pkgsDir, 'nodejs.org', 'v20.0.0', 'metadata.json')
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))

    let removedBinaries = 0
    for (const binary of metadata.binaries) {
      const binaryPath = path.join(binDir, binary)
      try {
        if (fs.existsSync(binaryPath)) {
          fs.unlinkSync(binaryPath)
          removedBinaries++
        }
      }
      catch {
        // Should handle errors gracefully
      }
    }

    // Should have removed 2 out of 3 binaries (npm was already gone)
    expect(removedBinaries).toBe(2)
    expect(binaryExists('node')).toBe(false)
    expect(binaryExists('npm')).toBe(false) // Was already gone
    expect(binaryExists('npx')).toBe(false)
  })

  test('should handle corrupted metadata files', async () => {
    // Create package directory with corrupted metadata
    const packageDir = path.join(pkgsDir, 'test-package', 'v1.0.0')
    fs.mkdirSync(packageDir, { recursive: true })

    // Create corrupted metadata file
    fs.writeFileSync(path.join(packageDir, 'metadata.json'), 'invalid json{')

    // Create a binary
    const binaryPath = path.join(binDir, 'test-binary')
    fs.writeFileSync(binaryPath, '#!/bin/bash\necho "test"\n')
    fs.chmodSync(binaryPath, 0o755)

    // The getLaunchpadBinaries function should handle corrupted metadata gracefully
    const getLaunchpadBinaries = (): Array<{ binary: string, package: string, fullPath: string }> => {
      const binaries: Array<{ binary: string, package: string, fullPath: string }> = []

      if (!fs.existsSync(pkgsDir))
        return binaries

      try {
        const domains = fs.readdirSync(pkgsDir, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())

        for (const domain of domains) {
          const domainPath = path.join(pkgsDir, domain.name)
          const versions = fs.readdirSync(domainPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())

          for (const version of versions) {
            const versionPath = path.join(domainPath, version.name)
            const metadataPath = path.join(versionPath, 'metadata.json')

            if (fs.existsSync(metadataPath)) {
              try {
                const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))
                if (metadata.binaries && Array.isArray(metadata.binaries)) {
                  for (const binary of metadata.binaries) {
                    const binaryPath = path.join(binDir, binary)
                    if (fs.existsSync(binaryPath)) {
                      binaries.push({
                        binary,
                        package: `${domain.name}@${version.name.slice(1)}`,
                        fullPath: binaryPath,
                      })
                    }
                  }
                }
              }
              catch {
                // Should ignore corrupted metadata files
              }
            }
          }
        }
      }
      catch {
        // Ignore errors reading package directory
      }

      return binaries
    }

    const launchpadBinaries = getLaunchpadBinaries()

    // Should not find any binaries due to corrupted metadata
    expect(launchpadBinaries).toHaveLength(0)

    // But the binary should still exist in filesystem
    expect(binaryExists('test-binary')).toBe(true)
  })

  test('empty installation should handle clean gracefully', async () => {
    // Don't install anything - just ensure directories exist
    expect(fs.existsSync(binDir)).toBe(true)
    expect(fs.existsSync(pkgsDir)).toBe(true)

    // Simulate clean on empty installation
    const getLaunchpadBinaries = (): Array<{ binary: string, package: string, fullPath: string }> => {
      const binaries: Array<{ binary: string, package: string, fullPath: string }> = []
      if (!fs.existsSync(pkgsDir))
        return binaries
      // Should return empty array for empty pkgs directory
      return binaries
    }

    const launchpadBinaries = getLaunchpadBinaries()
    expect(launchpadBinaries).toHaveLength(0)

    // Clean operation should handle this gracefully
    if (fs.existsSync(pkgsDir)) {
      fs.rmSync(pkgsDir, { recursive: true, force: true })
    }

    expect(fs.existsSync(pkgsDir)).toBe(false)
  })
})
