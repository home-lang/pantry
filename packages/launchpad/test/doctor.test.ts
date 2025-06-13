import type { DiagnosticResult, DoctorReport } from '../src/doctor'
import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { formatDoctorReport, runDoctorChecks } from '../src/doctor'

describe('Doctor Functionality', () => {
  let tempDir: string
  let originalEnv: Record<string, string | undefined>

  beforeEach(() => {
    // Create a temporary directory for testing
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-doctor-test-'))

    // Save original environment
    originalEnv = { ...process.env }
  })

  afterEach(() => {
    // Restore original environment
    Object.assign(process.env, originalEnv)

    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('runDoctorChecks', () => {
    test('should return a valid doctor report', async () => {
      const report = await runDoctorChecks()

      expect(report).toBeDefined()
      expect(report.overall).toMatch(/^(healthy|issues|critical)$/)
      expect(report.results).toBeArray()
      expect(report.summary).toBeDefined()
      expect(report.summary.passed).toBeNumber()
      expect(report.summary.warnings).toBeNumber()
      expect(report.summary.failed).toBeNumber()
    })

    test('should include all expected diagnostic checks', async () => {
      const report = await runDoctorChecks()

      const checkNames = report.results.map(r => r.name)

      expect(checkNames).toContain('Installation Directory')
      expect(checkNames).toContain('PATH Configuration')
      expect(checkNames).toContain('Shim Directory')
      expect(checkNames).toContain('Permissions')
      expect(checkNames).toContain('Shell Integration')
      expect(checkNames).toContain('System Dependencies')
      expect(checkNames).toContain('Network Connectivity')
    })

    test('should calculate summary correctly', async () => {
      const report = await runDoctorChecks()

      const totalChecks = report.results.length
      const calculatedTotal = report.summary.passed + report.summary.warnings + report.summary.failed

      expect(calculatedTotal).toBe(totalChecks)
    })

    test('should determine overall status correctly', async () => {
      const report = await runDoctorChecks()

      if (report.summary.failed > 0) {
        expect(report.overall).toBe('critical')
      }
      else if (report.summary.warnings > 0) {
        expect(report.overall).toBe('issues')
      }
      else {
        expect(report.overall).toBe('healthy')
      }
    })
  })

  describe('Individual Diagnostic Checks', () => {
    test('should validate diagnostic result structure', async () => {
      const report = await runDoctorChecks()

      for (const result of report.results) {
        expect(result.name).toBeString()
        expect(result.status).toMatch(/^(pass|warn|fail)$/)
        expect(result.message).toBeString()

        if (result.suggestion) {
          expect(result.suggestion).toBeString()
        }
      }
    })

    test('should handle missing installation directory', async () => {
      // This test would require mocking the install_prefix function
      // For now, we'll just verify the structure
      const report = await runDoctorChecks()
      const installCheck = report.results.find(r => r.name === 'Installation Directory')

      expect(installCheck).toBeDefined()
      expect(installCheck?.status).toMatch(/^(pass|warn|fail)$/)
    })

    test('should check PATH configuration', async () => {
      const report = await runDoctorChecks()
      const pathCheck = report.results.find(r => r.name === 'PATH Configuration')

      expect(pathCheck).toBeDefined()
      expect(pathCheck?.message).toBeString()
    })

    test('should check shell integration', async () => {
      const report = await runDoctorChecks()
      const shellCheck = report.results.find(r => r.name === 'Shell Integration')

      expect(shellCheck).toBeDefined()

      // If SHELL is not set, should warn
      if (!process.env.SHELL) {
        expect(shellCheck?.status).toBe('warn')
      }
    })

    test('should check system dependencies', async () => {
      const report = await runDoctorChecks()
      const depsCheck = report.results.find(r => r.name === 'System Dependencies')

      expect(depsCheck).toBeDefined()
      expect(depsCheck?.message).toContain(os.platform())
      expect(depsCheck?.message).toContain(os.arch())
    })

    test('should check network connectivity', async () => {
      const report = await runDoctorChecks()
      const networkCheck = report.results.find(r => r.name === 'Network Connectivity')

      expect(networkCheck).toBeDefined()
      // Network check might pass or fail depending on connectivity
      expect(networkCheck?.status).toMatch(/^(pass|warn|fail)$/)
    })
  })

  describe('formatDoctorReport', () => {
    test('should format a healthy report correctly', () => {
      const mockReport: DoctorReport = {
        overall: 'healthy',
        results: [
          {
            name: 'Test Check',
            status: 'pass',
            message: 'Everything is working',
          },
        ],
        summary: {
          passed: 1,
          warnings: 0,
          failed: 0,
        },
      }

      const formatted = formatDoctorReport(mockReport)

      expect(formatted).toContain('🩺 Launchpad Health Check')
      expect(formatted).toContain('✅ Overall Status: All systems operational')
      expect(formatted).toContain('✅ Test Check')
      expect(formatted).toContain('Everything is working')
      expect(formatted).toContain('✅ Passed: 1')
      expect(formatted).toContain('⚠️  Warnings: 0')
      expect(formatted).toContain('❌ Failed: 0')
    })

    test('should format a report with issues correctly', () => {
      const mockReport: DoctorReport = {
        overall: 'issues',
        results: [
          {
            name: 'Warning Check',
            status: 'warn',
            message: 'Minor issue detected',
            suggestion: 'Fix this issue',
          },
        ],
        summary: {
          passed: 0,
          warnings: 1,
          failed: 0,
        },
      }

      const formatted = formatDoctorReport(mockReport)

      expect(formatted).toContain('⚠️ Overall Status: Some issues detected')
      expect(formatted).toContain('⚠️ Warning Check')
      expect(formatted).toContain('Minor issue detected')
      expect(formatted).toContain('💡 Fix this issue')
      expect(formatted).toContain('💡 Run "launchpad bootstrap" to fix common issues')
    })

    test('should format a critical report correctly', () => {
      const mockReport: DoctorReport = {
        overall: 'critical',
        results: [
          {
            name: 'Critical Check',
            status: 'fail',
            message: 'Critical failure',
            suggestion: 'Urgent fix needed',
          },
        ],
        summary: {
          passed: 0,
          warnings: 0,
          failed: 1,
        },
      }

      const formatted = formatDoctorReport(mockReport)

      expect(formatted).toContain('❌ Overall Status: Critical issues found')
      expect(formatted).toContain('❌ Critical Check')
      expect(formatted).toContain('Critical failure')
      expect(formatted).toContain('💡 Urgent fix needed')
      expect(formatted).toContain('💡 Run "launchpad bootstrap" to fix common issues')
    })

    test('should handle results without suggestions', () => {
      const mockReport: DoctorReport = {
        overall: 'healthy',
        results: [
          {
            name: 'Simple Check',
            status: 'pass',
            message: 'All good',
          },
        ],
        summary: {
          passed: 1,
          warnings: 0,
          failed: 0,
        },
      }

      const formatted = formatDoctorReport(mockReport)

      expect(formatted).toContain('✅ Simple Check')
      expect(formatted).toContain('All good')
      expect(formatted).not.toContain('💡')
    })

    test('should include proper emoji for each status', () => {
      const mockReport: DoctorReport = {
        overall: 'issues',
        results: [
          {
            name: 'Pass Check',
            status: 'pass',
            message: 'Passed',
          },
          {
            name: 'Warn Check',
            status: 'warn',
            message: 'Warning',
          },
          {
            name: 'Fail Check',
            status: 'fail',
            message: 'Failed',
          },
        ],
        summary: {
          passed: 1,
          warnings: 1,
          failed: 1,
        },
      }

      const formatted = formatDoctorReport(mockReport)

      expect(formatted).toContain('✅ Pass Check')
      expect(formatted).toContain('⚠️ Warn Check')
      expect(formatted).toContain('❌ Fail Check')
    })
  })

  describe('Error Handling', () => {
    test('should handle errors gracefully in individual checks', async () => {
      // The doctor checks should not throw errors, but handle them internally
      const report = await runDoctorChecks()

      expect(report).toBeDefined()
      expect(report.results).toBeArray()

      // All results should have valid status
      for (const result of report.results) {
        expect(result.status).toMatch(/^(pass|warn|fail)$/)
      }
    })

    test('should provide helpful suggestions for common issues', async () => {
      const report = await runDoctorChecks()

      // Look for results with suggestions
      const resultsWithSuggestions = report.results.filter(r => r.suggestion)

      for (const result of resultsWithSuggestions) {
        expect(result.suggestion).toBeString()
        expect(result.suggestion!.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Platform Compatibility', () => {
    test('should work on current platform', async () => {
      const report = await runDoctorChecks()
      const depsCheck = report.results.find(r => r.name === 'System Dependencies')

      expect(depsCheck).toBeDefined()

      // Should at least detect the current platform
      const currentPlatform = os.platform()
      expect(depsCheck?.message).toContain(currentPlatform)
    })

    test('should detect current architecture', async () => {
      const report = await runDoctorChecks()
      const depsCheck = report.results.find(r => r.name === 'System Dependencies')

      expect(depsCheck).toBeDefined()

      // Should detect the current architecture
      const currentArch = os.arch()
      expect(depsCheck?.message).toContain(currentArch)
    })
  })

  describe('Integration Tests', () => {
    test('should provide actionable feedback', async () => {
      const report = await runDoctorChecks()

      // Every failed or warning result should have a suggestion
      const issueResults = report.results.filter(r => r.status === 'fail' || r.status === 'warn')

      for (const result of issueResults) {
        expect(result.suggestion).toBeDefined()
        expect(result.suggestion).toBeString()
      }
    })

    test('should be consistent across multiple runs', async () => {
      const report1 = await runDoctorChecks()
      const report2 = await runDoctorChecks()

      // Results should be consistent (assuming no environment changes)
      expect(report1.results.length).toBe(report2.results.length)

      for (let i = 0; i < report1.results.length; i++) {
        expect(report1.results[i].name).toBe(report2.results[i].name)
        // Status might vary due to network conditions, but names should be consistent
      }
    })
  })
})
