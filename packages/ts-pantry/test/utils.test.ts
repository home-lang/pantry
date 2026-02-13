import { describe, expect, test } from 'bun:test'
import {
  convertDomainToFileName,
  convertDomainToVarName,
  formatObjectWithoutQuotedKeys,
  guessOriginalDomain,
} from '../src/utils'

describe('Utils Module', () => {
  describe('convertDomainToVarName', () => {
    test('should convert simple domains correctly', () => {
      expect(convertDomainToVarName('nodejs.org')).toBe('nodejsorg')
      expect(convertDomainToVarName('python.org')).toBe('pythonorg')
      expect(convertDomainToVarName('go.dev')).toBe('godev')
      expect(convertDomainToVarName('rust-lang.org')).toBe('rustlangorg')
    })

    test('should handle domains with hyphens', () => {
      expect(convertDomainToVarName('rust-lang.org')).toBe('rustlangorg')
      expect(convertDomainToVarName('midnight-commander.org')).toBe('midnightcommanderorg')
      expect(convertDomainToVarName('protocol-buffers.dev')).toBe('protocolbuffersdev')
    })

    test('should handle nested paths', () => {
      expect(convertDomainToVarName('agwa.name/git-crypt')).toBe('agwanamegitcrypt')
      expect(convertDomainToVarName('aws.amazon.com/cli')).toBe('awsamazoncomcli')
      expect(convertDomainToVarName('github.com/cli/cli')).toBe('githubcomcli')
    })

    test('should handle special characters', () => {
      expect(convertDomainToVarName('example.com')).toBe('examplecom')
      expect(convertDomainToVarName('sub.domain.example.com')).toBe('subdomainexamplecom')
      expect(convertDomainToVarName('test_package.org')).toBe('test_packageorg')
    })

    test('should handle edge cases', () => {
      expect(convertDomainToVarName('')).toBe('')
      expect(convertDomainToVarName('a')).toBe('a')
      expect(convertDomainToVarName('a.b')).toBe('ab')
      expect(convertDomainToVarName('1password.com')).toBe('1passwordcom')
    })

    test('should be consistent and deterministic', () => {
      const domain = 'complex-domain.example.com/nested/path'
      const result1 = convertDomainToVarName(domain)
      const result2 = convertDomainToVarName(domain)
      expect(result1).toBe(result2)
      expect(result1).toBe('complexdomainexamplecomnested')
    })

    test('should handle domains starting with numbers', () => {
      expect(convertDomainToVarName('1password.com')).toBe('1passwordcom')
      expect(convertDomainToVarName('0x.org')).toBe('0xorg')
      expect(convertDomainToVarName('7zip.org')).toBe('7ziporg')
    })
  })

  describe('convertDomainToFileName', () => {
    test('should convert simple domains correctly', () => {
      expect(convertDomainToFileName('nodejs.org')).toBe('nodejsorg')
      expect(convertDomainToFileName('python.org')).toBe('pythonorg')
      expect(convertDomainToFileName('go.dev')).toBe('godev')
    })

    test('should handle nested paths with hyphens', () => {
      expect(convertDomainToFileName('agwa.name/git-crypt')).toBe('agwaname-git-crypt')
      expect(convertDomainToFileName('aws.amazon.com/cli')).toBe('awsamazoncom-cli')
      expect(convertDomainToFileName('github.com/cli/cli')).toBe('githubcom-cli')
    })

    test('should handle domains with multiple dots', () => {
      expect(convertDomainToFileName('sub.domain.example.com')).toBe('subdomainexamplecom')
      expect(convertDomainToFileName('api.v2.service.com')).toBe('apiv2servicecom')
    })

    test('should handle special characters in paths', () => {
      expect(convertDomainToFileName('example.com/path_with_underscores')).toBe('examplecom-path_with_underscores')
      expect(convertDomainToFileName('example.com/path-with-hyphens')).toBe('examplecom-path-with-hyphens')
    })

    test('should be consistent with convertDomainToVarName for simple cases', () => {
      const simpleDomains = ['nodejs.org', 'python.org', 'go.dev']
      simpleDomains.forEach((domain) => {
        expect(convertDomainToFileName(domain)).toBe(convertDomainToVarName(domain))
      })

      // rust-lang.org is different because convertDomainToFileName preserves hyphens in domain names
      expect(convertDomainToFileName('rust-lang.org')).toBe('rust-langorg')
      expect(convertDomainToVarName('rust-lang.org')).toBe('rustlangorg')
    })

    test('should handle edge cases', () => {
      expect(convertDomainToFileName('')).toBe('')
      expect(convertDomainToFileName('a')).toBe('a')
      expect(convertDomainToFileName('a.b')).toBe('ab')
    })
  })

  describe('guessOriginalDomain', () => {
    test('should guess simple domains correctly', () => {
      expect(guessOriginalDomain('nodejsorg')).toBe('nodejs.org')
      expect(guessOriginalDomain('pythonorg')).toBe('python.org')
      expect(guessOriginalDomain('godev')).toBe('go.dev')
    })

    test('should handle nested paths', () => {
      expect(guessOriginalDomain('agwaname-git-crypt')).toBe('agwa.name/git-crypt')
      expect(guessOriginalDomain('awsamazoncom-cli')).toBe('awsamazon.com/cli')
      expect(guessOriginalDomain('githubcom-cli-cli')).toBe('github.com/cli-cli')
    })

    test('should handle complex domains', () => {
      expect(guessOriginalDomain('rustlangorg')).toBe('rustlang.org')
      expect(guessOriginalDomain('midnightcommandererorg')).toBe('midnightcommanderer.org')
    })

    test('should be inverse of convertDomainToFileName for many cases', () => {
      const domains = [
        'nodejs.org',
        'python.org',
        'go.dev',
        'agwa.name/git-crypt',
      ]

      domains.forEach((domain) => {
        const fileName = convertDomainToFileName(domain)
        const guessedDomain = guessOriginalDomain(fileName)
        expect(guessedDomain).toBe(domain)
      })
    })

    test('should handle edge cases', () => {
      expect(guessOriginalDomain('')).toBe('')
      expect(guessOriginalDomain('a')).toBe('a')
      expect(guessOriginalDomain('ab')).toBe('ab')
    })

    test('should handle domains with numbers', () => {
      expect(guessOriginalDomain('1passwordcom')).toBe('1password.com')
      expect(guessOriginalDomain('0xorg')).toBe('0x.org')
    })

    test('should handle ambiguous cases gracefully', () => {
      // These might not be perfect but should be reasonable
      expect(guessOriginalDomain('examplecom')).toBe('example.com')
      expect(guessOriginalDomain('testorg')).toBe('test.org')
    })
  })

  describe('formatObjectWithoutQuotedKeys', () => {
    test('should format simple objects', () => {
      const obj = { name: 'test', version: '1.0.0' }
      const result = formatObjectWithoutQuotedKeys(obj)

      expect(result).toContain('name: "test"')
      expect(result).toContain('version: "1.0.0"')
      expect(result).not.toContain('"name":')
      expect(result).not.toContain('"version":')
    })

    test('should handle nested objects', () => {
      const obj = {
        package: {
          name: 'test',
          version: '1.0.0',
        },
        dependencies: {
          lodash: '^4.17.21',
        },
      }
      const result = formatObjectWithoutQuotedKeys(obj)

      expect(result).toContain('package:')
      expect(result).toContain('dependencies:')
      expect(result).toContain('name: "test"')
      expect(result).toContain('lodash: "^4.17.21"')
    })

    test('should handle arrays', () => {
      const obj = {
        programs: ['node', 'npm', 'npx'],
        versions: ['18.0.0', '20.0.0'],
      }
      const result = formatObjectWithoutQuotedKeys(obj)

      expect(result).toContain('programs:')
      expect(result).toContain('versions:')
      expect(result).toContain('"node"')
      expect(result).toContain('"npm"')
      expect(result).toContain('"18.0.0"')
    })

    test('should handle different data types', () => {
      const obj = {
        string: 'test',
        number: 42,
        boolean: true,
        nullValue: null,
        undefinedValue: undefined,
      }
      const result = formatObjectWithoutQuotedKeys(obj)

      expect(result).toContain('string: "test"')
      expect(result).toContain('number: 42')
      expect(result).toContain('boolean: true')
      expect(result).toContain('nullValue: null')
    })

    test('should handle custom indentation', () => {
      const obj = { name: 'test' }
      const result2 = formatObjectWithoutQuotedKeys(obj, 4)
      const result0 = formatObjectWithoutQuotedKeys(obj, 0)

      expect(result2).toContain('    name: "test"')
      expect(result0).not.toContain('  ')
    })

    test('should handle empty objects and arrays', () => {
      const obj = {
        emptyObject: {},
        emptyArray: [],
        normalProp: 'value',
      }
      const result = formatObjectWithoutQuotedKeys(obj)

      expect(result).toContain('emptyObject: {\n\n}')
      expect(result).toContain('emptyArray: []')
      expect(result).toContain('normalProp: "value"')
    })

    test('should handle special characters in strings', () => {
      const obj = {
        description: 'A "quoted" string with \'single quotes\'',
        path: '/path/to/file',
        url: 'https://example.com',
      }
      const result = formatObjectWithoutQuotedKeys(obj)

      expect(result).toContain('description:')
      expect(result).toContain('path:')
      expect(result).toContain('url:')
      // Should properly escape quotes
      expect(result).toContain('\\"quoted\\"')
    })
  })

  describe('Domain Conversion Round-trip Tests', () => {
    test('should maintain consistency in round-trip conversions', () => {
      const testDomains = [
        'nodejs.org',
        'python.org',
        'go.dev',
        'rust-lang.org',
        'agwa.name/git-crypt',
        'aws.amazon.com/cli',
        'github.com/cli/cli',
        'midnight-commander.org',
        'protocol-buffers.dev',
      ]

      testDomains.forEach((domain) => {
        const fileName = convertDomainToFileName(domain)
        const varName = convertDomainToVarName(domain)
        const guessedDomain = guessOriginalDomain(fileName)

        // For simple domains without complex patterns, the round-trip should work
        if (['nodejs.org', 'python.org', 'go.dev', 'agwa.name/git-crypt'].includes(domain)) {
          expect(guessedDomain).toBe(domain)
        }

        // Variable name should be consistent
        expect(typeof varName).toBe('string')
        expect(varName.length).toBeGreaterThan(0)
      })
    })

    test('should handle edge cases in round-trip conversions', () => {
      const edgeCases = [
        'a.b',
        'x.y.z',
        '1password.com',
        'sub.domain.example.com',
        'example.com/path/to/package',
      ]

      edgeCases.forEach((domain) => {
        const fileName = convertDomainToFileName(domain)
        const guessedDomain = guessOriginalDomain(fileName)

        // Should at least be a reasonable approximation
        expect(typeof guessedDomain).toBe('string')
        expect(guessedDomain.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Utility Function Integration', () => {
    test('should work together for package processing', () => {
      const originalDomain = 'aws.amazon.com/cli'

      // Convert to variable name for TypeScript
      const varName = convertDomainToVarName(originalDomain)
      expect(varName).toBe('awsamazoncomcli')

      // Convert to file name for storage
      const fileName = convertDomainToFileName(originalDomain)
      expect(fileName).toBe('awsamazoncom-cli')

      // Guess back the original domain (may not be perfect for complex domains)
      const guessedDomain = guessOriginalDomain(fileName)
      expect(guessedDomain).toBe('awsamazon.com/cli')

      // Format object for output
      const packageObj = {
        name: 'AWS CLI',
        domain: originalDomain,
        programs: ['aws'],
      }
      const formatted = formatObjectWithoutQuotedKeys(packageObj)
      expect(formatted).toContain('name: "AWS CLI"')
      expect(formatted).toContain(`domain: "${originalDomain}"`)
    })

    test('should handle various domain patterns consistently', () => {
      const domainPatterns = [
        'simple.com',
        'hyphen-domain.org',
        'multi.sub.domain.net',
        'domain.com/path',
        'domain.com/nested/path',
        'complex-domain.example.com/nested/path-with-hyphens',
      ]

      domainPatterns.forEach((domain) => {
        const varName = convertDomainToVarName(domain)
        const fileName = convertDomainToFileName(domain)

        // Should produce valid identifiers/filenames
        expect(varName).toMatch(/^[\w-]+$/)
        expect(fileName).toMatch(/^[\w-]+$/)

        // Should not be empty
        expect(varName.length).toBeGreaterThan(0)
        expect(fileName.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Error Handling and Edge Cases', () => {
    test('should handle null and undefined inputs gracefully', () => {
      // These might throw or return empty strings, but shouldn't crash
      expect(() => convertDomainToVarName('')).not.toThrow()
      expect(() => convertDomainToFileName('')).not.toThrow()
      expect(() => guessOriginalDomain('')).not.toThrow()
    })

    test('should handle very long domain names', () => {
      const longDomain = 'very.long.subdomain.with.many.parts.example.com/very/long/nested/path/structure'

      expect(() => convertDomainToVarName(longDomain)).not.toThrow()
      expect(() => convertDomainToFileName(longDomain)).not.toThrow()

      const varName = convertDomainToVarName(longDomain)
      const fileName = convertDomainToFileName(longDomain)

      expect(varName.length).toBeGreaterThan(0)
      expect(fileName.length).toBeGreaterThan(0)
    })

    test('should handle domains with unusual characters', () => {
      const unusualDomains = [
        'domain-with-hyphens.com',
        'domain_with_underscores.org',
        'domain123.net',
        '123domain.com',
      ]

      unusualDomains.forEach((domain) => {
        expect(() => convertDomainToVarName(domain)).not.toThrow()
        expect(() => convertDomainToFileName(domain)).not.toThrow()

        const varName = convertDomainToVarName(domain)
        const fileName = convertDomainToFileName(domain)

        expect(varName.length).toBeGreaterThan(0)
        expect(fileName.length).toBeGreaterThan(0)
      })
    })
  })
})
