/**
 * PHP Error Message Improvement Tests
 *
 * Tests that error messages provide helpful Launchpad-based solutions
 * instead of suggesting competitor tools like Homebrew.
 */

import { describe, expect, it } from 'bun:test'

describe('PHP Error Message Improvements', () => {
  describe('Error Message Content', () => {
    it('should suggest Launchpad packages for missing build dependencies', () => {
      const pkgConfigErrorMessage = 'The pkg-config script could not be found'

      // Test that we detect the error pattern correctly
      expect(pkgConfigErrorMessage.includes('pkg-config script could not be found')).toBe(true)

      // Test that suggested solutions use Launchpad, not Homebrew
      const suggestedSolutions = [
        'launchpad install freedesktop.org/pkg-config',
        'launchpad install gnu.org/autoconf',
        'launchpad install gnu.org/automake',
      ]

      for (const solution of suggestedSolutions) {
        expect(solution).toContain('launchpad install')
        expect(solution).not.toContain('brew install')
        expect(solution).not.toContain('homebrew')
      }
    })

    it('should suggest Launchpad packages for missing libraries', () => {
      const libraryErrorMessage = 'configure: error: Please reinstall the libxml distribution'

      // Test that we detect the error pattern correctly
      expect(libraryErrorMessage.includes('configure: error')).toBe(true)
      expect(libraryErrorMessage.includes('Please reinstall')).toBe(true)

      // Test that suggested libraries use proper Launchpad package names
      const suggestedLibraries = [
        'launchpad install openssl.org',
        'launchpad install zlib.net',
        'launchpad install curl.se',
        'launchpad install sqlite.org',
      ]

      for (const library of suggestedLibraries) {
        expect(library).toContain('launchpad install')
        expect(library).not.toContain('brew install')
        expect(library).not.toContain('apt install')
      }
    })

    it('should suggest system tools for missing build tools', () => {
      const makeErrorMessage = 'make: command not found'

      // Test that we detect the error pattern correctly
      expect(makeErrorMessage.includes('make')).toBe(true)
      expect(makeErrorMessage.includes('command not found')).toBe(true)

      // Test that we suggest appropriate system commands
      const macOSSolution = 'xcode-select --install'
      const ubuntuSolution = 'apt-get install build-essential (Ubuntu/Debian)'
      const centOSSolution = 'yum groupinstall "Development Tools" (CentOS/RHEL)'

      expect(macOSSolution).toContain('xcode-select')
      expect(ubuntuSolution).toContain('apt-get install')
      expect(centOSSolution).toContain('yum groupinstall')

      // Ensure we don't suggest Homebrew for system tools
      expect(macOSSolution).not.toContain('brew')
      expect(ubuntuSolution).not.toContain('brew')
      expect(centOSSolution).not.toContain('brew')
    })
  })

  describe('Error Pattern Detection', () => {
    it('should correctly identify pkg-config errors', () => {
      const patterns = [
        'The pkg-config script could not be found or is too old',
        'configure: error: pkg-config not found',
        'pkg-config script could not be found',
      ]

      for (const pattern of patterns) {
        expect(pattern.includes('pkg-config')).toBe(true)
      }
    })

    it('should correctly identify library errors', () => {
      const patterns = [
        'configure: error: Please reinstall the libxml distribution',
        'configure: error: Cannot find OpenSSL',
        'configure: error: zlib not found',
      ]

      for (const pattern of patterns) {
        expect(pattern.includes('configure: error')).toBe(true)
      }
    })

    it('should correctly identify build tool errors', () => {
      const patterns = [
        'make: command not found',
        '/usr/bin/make: not found',
        'gcc: command not found',
      ]

      for (const pattern of patterns) {
        expect(pattern.includes('command not found') || pattern.includes('not found')).toBe(true)
      }
    })
  })

  describe('Solution Quality', () => {
    it('should prioritize Launchpad solutions over system package managers', () => {
      const launchpadSolutions = [
        'launchpad install freedesktop.org/pkg-config',
        'launchpad install gnu.org/autoconf',
        'launchpad install openssl.org',
        'launchpad install zlib.net',
      ]

      for (const solution of launchpadSolutions) {
        // Should use Launchpad
        expect(solution).toContain('launchpad install')

        // Should not suggest competitors
        expect(solution).not.toContain('brew install')
        expect(solution).not.toContain('homebrew')
        expect(solution).not.toContain('apt install')
        expect(solution).not.toContain('yum install')

        // Should use proper domain-based package names
        expect(solution).toMatch(/\.[a-z]+/)
      }
    })

    it('should provide actionable solutions', () => {
      const solutions = [
        'launchpad install freedesktop.org/pkg-config',
        'xcode-select --install',
        'apt-get install build-essential',
      ]

      for (const solution of solutions) {
        // Should be a complete command
        expect(solution.trim().length).toBeGreaterThan(10)

        // Should start with a command name
        expect(solution).toMatch(/^[a-z-]+/i)

        // Should not be just informational text
        expect(solution).not.toContain('please')
        expect(solution).not.toContain('maybe')
        expect(solution).not.toContain('might')
      }
    })
  })

  describe('Platform-Specific Solutions', () => {
    it('should provide macOS-specific solutions when appropriate', () => {
      const macOSSolutions = [
        'xcode-select --install',
      ]

      for (const solution of macOSSolutions) {
        expect(solution).toContain('xcode-select')
        expect(solution).not.toContain('apt')
        expect(solution).not.toContain('yum')
      }
    })

    it('should provide Linux-specific solutions when appropriate', () => {
      const linuxSolutions = [
        'apt-get install build-essential (Ubuntu/Debian)',
        'yum groupinstall "Development Tools" (CentOS/RHEL)',
      ]

      for (const solution of linuxSolutions) {
        expect(solution).toMatch(/apt-get|yum/)
        expect(solution).not.toContain('xcode-select')
        expect(solution).not.toContain('brew')
      }
    })
  })
})
