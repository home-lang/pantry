import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { create_v_symlinks, symlink, symlink_with_overwrite } from '../src/symlink'

describe('Symlink', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string

  beforeEach(() => {
    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-test-'))
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
  })

  describe('symlink_with_overwrite', () => {
    it('should create a symlink', () => {
      const src = path.join(tempDir, 'source')
      const dst = path.join(tempDir, 'destination')

      // Create source file
      fs.writeFileSync(src, 'test content')

      symlink_with_overwrite(src, dst)

      expect(fs.existsSync(dst)).toBe(true)
      expect(fs.lstatSync(dst).isSymbolicLink()).toBe(true)
      expect(fs.readlinkSync(dst)).toBe(src)
    })

    it('should overwrite existing symlink', () => {
      const src1 = path.join(tempDir, 'source1')
      const src2 = path.join(tempDir, 'source2')
      const dst = path.join(tempDir, 'destination')

      // Create source files
      fs.writeFileSync(src1, 'content1')
      fs.writeFileSync(src2, 'content2')

      // Create initial symlink
      fs.symlinkSync(src1, dst)
      expect(fs.readlinkSync(dst)).toBe(src1)

      // Overwrite with new symlink
      symlink_with_overwrite(src2, dst)
      expect(fs.readlinkSync(dst)).toBe(src2)
    })

    it('should handle non-existent destination', () => {
      const src = path.join(tempDir, 'source')
      const dst = path.join(tempDir, 'nonexistent', 'destination')

      fs.writeFileSync(src, 'test content')

      // Should not throw even if parent directory doesn't exist
      expect(() => symlink_with_overwrite(src, dst)).not.toThrow()
    })

    it('should handle relative paths', () => {
      const originalCwd = process.cwd()
      process.chdir(tempDir)

      try {
        fs.writeFileSync('source', 'test content')

        symlink_with_overwrite('./source', './destination')

        expect(fs.existsSync('./destination')).toBe(true)
        expect(fs.lstatSync('./destination').isSymbolicLink()).toBe(true)
      }
      finally {
        process.chdir(originalCwd)
      }
    })

    it('should handle existing regular file at destination', () => {
      const src = path.join(tempDir, 'source')
      const dst = path.join(tempDir, 'destination')

      fs.writeFileSync(src, 'source content')
      fs.writeFileSync(dst, 'existing content')

      // Should not overwrite regular files, only symlinks
      symlink_with_overwrite(src, dst)

      // The regular file should still exist (symlink creation should fail)
      expect(fs.existsSync(dst)).toBe(true)
      expect(fs.lstatSync(dst).isSymbolicLink()).toBe(false)
    })
  })

  describe('symlink', () => {
    it('should symlink standard directories', async () => {
      const srcDir = path.join(tempDir, 'src')
      const dstDir = path.join(tempDir, 'dst')

      // Create source structure
      fs.mkdirSync(srcDir, { recursive: true })
      fs.mkdirSync(path.join(srcDir, 'bin'), { recursive: true })
      fs.mkdirSync(path.join(srcDir, 'lib'), { recursive: true })
      fs.writeFileSync(path.join(srcDir, 'bin', 'executable'), 'binary content')
      fs.writeFileSync(path.join(srcDir, 'lib', 'library.so'), 'library content')

      await symlink(srcDir, dstDir)

      // Check that destination structure was created
      expect(fs.existsSync(path.join(dstDir, 'bin'))).toBe(true)
      expect(fs.existsSync(path.join(dstDir, 'lib'))).toBe(true)
      expect(fs.existsSync(path.join(dstDir, 'bin', 'executable'))).toBe(true)
      expect(fs.existsSync(path.join(dstDir, 'lib', 'library.so'))).toBe(true)

      // Check that files are symlinked
      expect(fs.lstatSync(path.join(dstDir, 'bin', 'executable')).isSymbolicLink()).toBe(true)
      expect(fs.lstatSync(path.join(dstDir, 'lib', 'library.so')).isSymbolicLink()).toBe(true)
    })

    it('should handle nested directory structures', async () => {
      const srcDir = path.join(tempDir, 'src')
      const dstDir = path.join(tempDir, 'dst')

      // Create nested source structure
      fs.mkdirSync(path.join(srcDir, 'share', 'man', 'man1'), { recursive: true })
      fs.writeFileSync(path.join(srcDir, 'share', 'man', 'man1', 'test.1'), 'man page')

      await symlink(srcDir, dstDir)

      expect(fs.existsSync(path.join(dstDir, 'share', 'man', 'man1', 'test.1'))).toBe(true)
      expect(fs.lstatSync(path.join(dstDir, 'share', 'man', 'man1', 'test.1')).isSymbolicLink()).toBe(true)
    })

    it('should skip non-standard directories', async () => {
      const srcDir = path.join(tempDir, 'src')
      const dstDir = path.join(tempDir, 'dst')

      // Create source structure with non-standard directory
      fs.mkdirSync(path.join(srcDir, 'custom'), { recursive: true })
      fs.writeFileSync(path.join(srcDir, 'custom', 'file'), 'content')

      await symlink(srcDir, dstDir)

      // Custom directory should not be symlinked
      expect(fs.existsSync(path.join(dstDir, 'custom'))).toBe(false)
    })

    it('should handle empty source directory', async () => {
      const srcDir = path.join(tempDir, 'src')
      const dstDir = path.join(tempDir, 'dst')

      fs.mkdirSync(srcDir)

      await symlink(srcDir, dstDir)

      // Should not create destination directory if source is empty
      expect(fs.existsSync(dstDir)).toBe(false)
    })

    it('should overwrite existing symlinks', async () => {
      const srcDir = path.join(tempDir, 'src')
      const dstDir = path.join(tempDir, 'dst')

      // Create source and initial destination
      fs.mkdirSync(path.join(srcDir, 'bin'), { recursive: true })
      fs.writeFileSync(path.join(srcDir, 'bin', 'new-executable'), 'new content')

      fs.mkdirSync(path.join(dstDir, 'bin'), { recursive: true })
      fs.writeFileSync(path.join(tempDir, 'old-file'), 'old content')
      fs.symlinkSync(path.join(tempDir, 'old-file'), path.join(dstDir, 'bin', 'new-executable'))

      await symlink(srcDir, dstDir)

      // Should overwrite the old symlink
      expect(fs.readlinkSync(path.join(dstDir, 'bin', 'new-executable')))
        .toBe(path.join(srcDir, 'bin', 'new-executable'))
    })

    it('should handle all standard directory types', async () => {
      const srcDir = path.join(tempDir, 'src')
      const dstDir = path.join(tempDir, 'dst')

      const standardDirs = ['bin', 'sbin', 'share', 'lib', 'libexec', 'var', 'etc', 'ssl']

      // Create all standard directories with files
      for (const dir of standardDirs) {
        fs.mkdirSync(path.join(srcDir, dir), { recursive: true })
        fs.writeFileSync(path.join(srcDir, dir, 'test-file'), `content for ${dir}`)
      }

      await symlink(srcDir, dstDir)

      // Check all directories were processed
      for (const dir of standardDirs) {
        expect(fs.existsSync(path.join(dstDir, dir, 'test-file'))).toBe(true)
        expect(fs.lstatSync(path.join(dstDir, dir, 'test-file')).isSymbolicLink()).toBe(true)
      }
    })
  })

  describe('create_v_symlinks', () => {
    it('should create version symlinks for major versions', async () => {
      const shelfDir = path.join(tempDir, 'shelf')
      fs.mkdirSync(shelfDir, { recursive: true })

      // Create version directories
      const versions = ['v1.0.0', 'v1.1.0', 'v1.2.0', 'v2.0.0', 'v2.1.0']
      for (const version of versions) {
        const versionDir = path.join(shelfDir, version)
        fs.mkdirSync(versionDir, { recursive: true })
        fs.writeFileSync(path.join(versionDir, 'test'), 'content')
      }

      await create_v_symlinks(path.join(shelfDir, 'v1.2.0'))

      // Should create symlinks for latest in each major version
      expect(fs.existsSync(path.join(shelfDir, 'v1'))).toBe(true)
      expect(fs.existsSync(path.join(shelfDir, 'v2'))).toBe(true)
      expect(fs.lstatSync(path.join(shelfDir, 'v1')).isSymbolicLink()).toBe(true)
      expect(fs.lstatSync(path.join(shelfDir, 'v2')).isSymbolicLink()).toBe(true)

      // Should point to latest versions
      expect(fs.readlinkSync(path.join(shelfDir, 'v1'))).toBe('v1.2.0')
      expect(fs.readlinkSync(path.join(shelfDir, 'v2'))).toBe('v2.1.0')
    })

    it('should handle pre-release versions', async () => {
      const shelfDir = path.join(tempDir, 'shelf')
      fs.mkdirSync(shelfDir, { recursive: true })

      // Create version directories including pre-release
      const versions = ['v1.0.0', 'v1.1.0-alpha.1', 'v1.1.0', 'v2.0.0-beta.1']
      for (const version of versions) {
        const versionDir = path.join(shelfDir, version)
        fs.mkdirSync(versionDir, { recursive: true })
      }

      await create_v_symlinks(path.join(shelfDir, 'v1.1.0'))

      // Should prefer stable versions over pre-release
      expect(fs.readlinkSync(path.join(shelfDir, 'v1'))).toBe('v1.1.0')
    })

    it('should skip invalid version directories', async () => {
      const shelfDir = path.join(tempDir, 'shelf')
      fs.mkdirSync(shelfDir, { recursive: true })

      // Create mix of valid and invalid directories
      const items = ['v1.0.0', 'v2.0.0', 'var', 'invalid', 'not-version']
      for (const item of items) {
        fs.mkdirSync(path.join(shelfDir, item), { recursive: true })
      }

      await create_v_symlinks(path.join(shelfDir, 'v1.0.0'))

      // Should create symlinks for valid versions
      expect(fs.existsSync(path.join(shelfDir, 'v1'))).toBe(true)
      expect(fs.existsSync(path.join(shelfDir, 'v2'))).toBe(true)

      // Should not create symlinks for invalid directories
      expect(fs.existsSync(path.join(shelfDir, 'invalid'))).toBe(true) // Directory exists
      expect(fs.lstatSync(path.join(shelfDir, 'invalid')).isSymbolicLink()).toBe(false) // But not a symlink
    })

    it('should handle empty shelf directory', async () => {
      const shelfDir = path.join(tempDir, 'shelf')
      fs.mkdirSync(shelfDir, { recursive: true })

      await create_v_symlinks(path.join(shelfDir, 'nonexistent'))

      // Should not create any symlinks
      const entries = fs.readdirSync(shelfDir)
      expect(entries.length).toBe(0)
    })

    it('should skip existing symlinks when scanning', async () => {
      const shelfDir = path.join(tempDir, 'shelf')
      fs.mkdirSync(shelfDir, { recursive: true })

      // Create version directory and existing symlink
      fs.mkdirSync(path.join(shelfDir, 'v1.0.0'), { recursive: true })
      fs.symlinkSync('v1.0.0', path.join(shelfDir, 'v1'))

      await create_v_symlinks(path.join(shelfDir, 'v1.0.0'))

      // Should still work correctly
      expect(fs.existsSync(path.join(shelfDir, 'v1'))).toBe(true)
      expect(fs.readlinkSync(path.join(shelfDir, 'v1'))).toBe('v1.0.0')
    })

    it('should update existing version symlinks', async () => {
      const shelfDir = path.join(tempDir, 'shelf')
      fs.mkdirSync(shelfDir, { recursive: true })

      // Create version directories
      fs.mkdirSync(path.join(shelfDir, 'v1.0.0'), { recursive: true })
      fs.mkdirSync(path.join(shelfDir, 'v1.1.0'), { recursive: true })

      // Create initial symlink to older version
      fs.symlinkSync('v1.0.0', path.join(shelfDir, 'v1'))

      await create_v_symlinks(path.join(shelfDir, 'v1.1.0'))

      // Should update to newer version
      expect(fs.readlinkSync(path.join(shelfDir, 'v1'))).toBe('v1.1.0')
    })
  })

  describe('error handling', () => {
    it('should handle permission errors gracefully', async () => {
      const srcDir = path.join(tempDir, 'src')
      const dstDir = path.join(tempDir, 'dst')

      fs.mkdirSync(path.join(srcDir, 'bin'), { recursive: true })
      fs.writeFileSync(path.join(srcDir, 'bin', 'test'), 'content')

      // Create read-only destination
      fs.mkdirSync(dstDir, { recursive: true })
      try {
        fs.chmodSync(dstDir, 0o444)

        // May throw due to permission errors, which is expected
        try {
          await symlink(srcDir, dstDir)
        }
        catch (error) {
          // Permission errors are expected and handled gracefully
          expect(error).toBeInstanceOf(Error)
        }
      }
      finally {
        // Restore permissions for cleanup
        try {
          fs.chmodSync(dstDir, 0o755)
        }
        catch {
          // Ignore cleanup errors
        }
      }
    })

    it('should handle non-existent source directory', async () => {
      const srcDir = path.join(tempDir, 'nonexistent')
      const dstDir = path.join(tempDir, 'dst')

      // Should complete without error (no-op for non-existent source)
      await symlink(srcDir, dstDir)

      // Destination should not be created
      expect(fs.existsSync(dstDir)).toBe(false)
    })
  })
})
