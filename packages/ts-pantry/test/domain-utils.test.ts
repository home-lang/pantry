import { describe, expect, test } from 'bun:test'
import {
  convertDomainToFileName,
  convertDomainToVarName,
  guessOriginalDomain,
} from '../src/utils'

describe('Domain Utilities', () => {
  // Test convertDomainToVarName
  describe('convertDomainToVarName', () => {
    test('should convert standard domains correctly', () => {
      expect(convertDomainToVarName('example.com')).toBe('examplecom')
      expect(convertDomainToVarName('bun.sh')).toBe('bunsh')
      expect(convertDomainToVarName('python.org')).toBe('pythonorg')
    })

    test('should handle nested paths correctly', () => {
      expect(convertDomainToVarName('agwa.name/git-crypt')).toBe('agwanamegitcrypt')
      expect(convertDomainToVarName('apache.org/httpd')).toBe('apacheorghttpd')
      expect(convertDomainToVarName('aws.amazon.com/cli')).toBe('awsamazoncomcli')
    })
  })

  // Test convertDomainToFileName
  describe('convertDomainToFileName', () => {
    test('should convert domains to filename-safe strings', () => {
      expect(convertDomainToFileName('example.com')).toBe('examplecom')
      expect(convertDomainToFileName('agwa.name/git-crypt')).toBe('agwaname-git-crypt')
      expect(convertDomainToFileName('aws.amazon.com/cli')).toBe('awsamazoncom-cli')
    })
  })

  // Test guessOriginalDomain
  describe('guessOriginalDomain', () => {
    test('should guess standard domain from filename', () => {
      expect(guessOriginalDomain('nodejsorg')).toBe('nodejs.org')
      expect(guessOriginalDomain('bunsh')).toBe('bun.sh')
      expect(guessOriginalDomain('pythonorg')).toBe('python.org')
    })

    test('should guess nested paths from filenames with dashes', () => {
      expect(guessOriginalDomain('agwaname-git-crypt')).toBe('agwa.name/git-crypt')
      expect(guessOriginalDomain('apacheorg-httpd')).toBe('apache.org/httpd')
    })
  })
})
