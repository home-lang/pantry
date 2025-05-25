import { describe, expect, it } from 'bun:test'
import { parseVersion, Version } from '../src/version'

describe('Version', () => {
  describe('constructor', () => {
    it('should create a Version from string', () => {
      const v = new Version('1.2.3')
      expect(v.raw).toBe('1.2.3')
    })

    it('should handle semantic versions', () => {
      const v = new Version('2.4.1')
      expect(v.raw).toBe('2.4.1')
    })

    it('should handle versions with pre-release', () => {
      const v = new Version('1.0.0-alpha.1')
      expect(v.raw).toBe('1.0.0-alpha.1')
    })

    it('should handle versions with build metadata', () => {
      const v = new Version('1.0.0+build.1')
      expect(v.raw).toBe('1.0.0+build.1')
    })

    it('should handle complex versions', () => {
      const v = new Version('1.0.0-alpha.1+build.1')
      expect(v.raw).toBe('1.0.0-alpha.1+build.1')
    })

    it('should handle versions with v prefix', () => {
      const v = new Version('v1.2.3')
      expect(v.raw).toBe('v1.2.3')
      expect(v.major).toBe(1)
      expect(v.minor).toBe(2)
      expect(v.patch).toBe(3)
    })
  })

  describe('parsing', () => {
    it('should parse major version', () => {
      const v = new Version('2.4.1')
      expect(v.major).toBe(2)
    })

    it('should parse minor version', () => {
      const v = new Version('2.4.1')
      expect(v.minor).toBe(4)
    })

    it('should parse patch version', () => {
      const v = new Version('2.4.1')
      expect(v.patch).toBe(1)
    })

    it('should handle single digit versions', () => {
      const v = new Version('1.0.0')
      expect(v.major).toBe(1)
      expect(v.minor).toBe(0)
      expect(v.patch).toBe(0)
    })

    it('should handle double digit versions', () => {
      const v = new Version('12.34.56')
      expect(v.major).toBe(12)
      expect(v.minor).toBe(34)
      expect(v.patch).toBe(56)
    })
  })

  describe('edge cases', () => {
    it('should handle versions with leading zeros', () => {
      const v = new Version('01.02.03')
      expect(v.major).toBe(1)
      expect(v.minor).toBe(2)
      expect(v.patch).toBe(3)
    })

    it('should handle empty version string gracefully', () => {
      const v = new Version('')
      expect(v.raw).toBe('')
      expect(v.major).toBe(0)
      expect(v.minor).toBe(0)
      expect(v.patch).toBe(0)
    })

    it('should handle malformed version strings', () => {
      const v = new Version('not.a.version')
      expect(v.raw).toBe('not.a.version')
      expect(v.major).toBeNaN()
      expect(v.minor).toBeNaN()
      expect(v.patch).toBeNaN()
    })

    it('should handle partial version strings', () => {
      const v1 = new Version('1')
      expect(v1.major).toBe(1)
      expect(v1.minor).toBe(0)
      expect(v1.patch).toBe(0)

      const v2 = new Version('1.2')
      expect(v2.major).toBe(1)
      expect(v2.minor).toBe(2)
      expect(v2.patch).toBe(0)
    })
  })

  describe('parseVersion', () => {
    it('should parse valid version strings', () => {
      const v = parseVersion('1.2.3')
      expect(v).not.toBeNull()
      expect(v!.major).toBe(1)
      expect(v!.minor).toBe(2)
      expect(v!.patch).toBe(3)
    })

    it('should parse versions with v prefix', () => {
      const v = parseVersion('v2.4.1')
      expect(v).not.toBeNull()
      expect(v!.major).toBe(2)
      expect(v!.minor).toBe(4)
      expect(v!.patch).toBe(1)
    })

    it('should return null for invalid versions', () => {
      expect(parseVersion('')).toBeNull()
      expect(parseVersion('not.a.version')).toBeNull()
      expect(parseVersion('abc')).toBeNull()
    })

    it('should return null for non-string input', () => {
      expect(parseVersion(null as any)).toBeNull()
      expect(parseVersion(undefined as any)).toBeNull()
      expect(parseVersion(123 as any)).toBeNull()
    })

    it('should parse partial versions', () => {
      const v1 = parseVersion('1')
      expect(v1).not.toBeNull()
      expect(v1!.major).toBe(1)

      const v2 = parseVersion('1.2')
      expect(v2).not.toBeNull()
      expect(v2!.major).toBe(1)
      expect(v2!.minor).toBe(2)
    })
  })

  describe('toString', () => {
    it('should return string representation', () => {
      const v = new Version('1.2.3')
      expect(v.toString()).toBe('1.2.3')
    })

    it('should be same as raw property', () => {
      const v = new Version('2.4.1')
      expect(v.toString()).toBe(v.raw)
    })
  })
})
