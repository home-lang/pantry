import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import process from 'node:process'
import { formatBytes, formatTime, ProgressBar, Spinner } from '../src/progress'

describe('Install Progress Integration', () => {
  let originalStderr: typeof process.stderr.write
  let stderrOutput: string[]

  beforeEach(() => {
    stderrOutput = []
    originalStderr = process.stderr.write
    // Mock stderr.write to capture output (progress utilities write to stderr)
    process.stderr.write = mock((chunk: any) => {
      stderrOutput.push(chunk.toString())
      return true
    })
  })

  afterEach(() => {
    process.stderr.write = originalStderr
  })

  describe('Progress Integration Scenarios', () => {
    it('should simulate a complete download flow', async () => {
      const totalSize = 1024 * 1024 // 1MB
      const bar = new ProgressBar(totalSize, {
        showBytes: true,
        showSpeed: true,
        showETA: true,
      })

      // Simulate download chunks
      const chunkSize = 64 * 1024 // 64KB
      let downloaded = 0

      while (downloaded < totalSize) {
        downloaded += chunkSize
        if (downloaded > totalSize)
          downloaded = totalSize

        bar.update(downloaded)
        await new Promise(resolve => setTimeout(resolve, 5)) // Small delay
      }

      bar.complete()

      const output = stderrOutput.join('')
      expect(output).toContain('100.0%')
      expect(output).toContain('1.0 MB/1.0 MB')
      expect(output).toContain('\n') // Final newline
    })

    it('should simulate extraction with spinner', async () => {
      const spinner = new Spinner()
      spinner.start('🔧 Extracting package...')

      // Simulate extraction time
      await new Promise(resolve => setTimeout(resolve, 100))

      spinner.stop('✅ Extraction complete')

      const output = stderrOutput.join('')
      expect(output).toContain('🔧 Extracting package...')
      expect(output).toContain('\r') // Carriage return for clearing
    })

    it('should simulate installation with spinner', async () => {
      const spinner = new Spinner()
      spinner.start('⚡ Installing binaries...')

      // Simulate installation time
      await new Promise(resolve => setTimeout(resolve, 50))

      spinner.stop('✅ Installation complete')

      // Spinner should have been active (check for spinner characters or clearing)
      const output = stderrOutput.join('')
      const hasSpinnerActivity = output.includes('⚡') || output.includes('\r') || output.includes('⠋')
      expect(hasSpinnerActivity).toBe(true)
    })

    it('should handle multiple progress operations', async () => {
      // First: Download progress
      const downloadBar = new ProgressBar(2048, { showBytes: true })
      downloadBar.update(1024)
      downloadBar.complete()

      // Second: Extraction spinner
      const extractSpinner = new Spinner()
      extractSpinner.start('🔧 Extracting...')
      await new Promise(resolve => setTimeout(resolve, 50))
      extractSpinner.stop()

      // Third: Installation spinner
      const installSpinner = new Spinner()
      installSpinner.start('⚡ Installing...')
      await new Promise(resolve => setTimeout(resolve, 50))
      installSpinner.stop()

      const output = stderrOutput.join('')
      expect(output).toContain('100.0%')
      // Check for spinner activity (characters or clearing)
      const hasSpinnerActivity = output.includes('🔧') || output.includes('⚡') || output.includes('\r')
      expect(hasSpinnerActivity).toBe(true)
    })

    it('should format download sizes correctly', () => {
      expect(formatBytes(1024)).toBe('1.0 KB')
      expect(formatBytes(1048576)).toBe('1.0 MB')
      expect(formatBytes(1073741824)).toBe('1.0 GB')
      expect(formatBytes(5.5 * 1024 * 1024)).toBe('5.5 MB')
    })

    it('should format time estimates correctly', () => {
      expect(formatTime(30)).toBe('30s')
      expect(formatTime(90)).toBe('1m 30s')
      expect(formatTime(3600)).toBe('1h 0m')
      expect(formatTime(3665)).toBe('1h 1m')
    })

    it('should handle rapid progress updates efficiently', () => {
      const bar = new ProgressBar(1000)

      const start = Date.now()
      for (let i = 0; i <= 1000; i += 50) {
        bar.update(i)
      }
      const end = Date.now()

      // Should complete quickly
      expect(end - start).toBeLessThan(500)

      const output = stderrOutput.join('')
      expect(output).toContain('100.0%')
    })

    it('should handle progress bar with dynamic total', () => {
      const bar = new ProgressBar(100)
      bar.update(50)

      // Update total size (content-length discovered)
      bar.update(50, 200)

      const output = stderrOutput.join('')
      expect(output).toContain('25.0%') // 50/200 = 25%
    })

    it('should handle spinner state changes', async () => {
      const spinner = new Spinner()

      // Multiple start/stop cycles should work
      spinner.start('First task')
      await new Promise(resolve => setTimeout(resolve, 50))
      spinner.stop()

      spinner.start('Second task')
      spinner.update('Updated task')
      await new Promise(resolve => setTimeout(resolve, 50))
      spinner.stop()

      const output = stderrOutput.join('')
      // Check for spinner activity and clearing
      const hasSpinnerActivity = output.includes('\r') || output.includes('⠋') || output.includes('⠙')
      expect(hasSpinnerActivity).toBe(true)
    })

    it('should handle edge cases gracefully', () => {
      // Zero total
      const zeroBar = new ProgressBar(0)
      zeroBar.update(0)

      // Negative values
      const negBar = new ProgressBar(100)
      negBar.update(-10)

      // Values exceeding total
      const exceedBar = new ProgressBar(100)
      exceedBar.update(150)

      const output = stderrOutput.join('')
      expect(output).toContain('0.0%')
      expect(output).toContain('100.0%')
    })

    it('should clear progress display properly', () => {
      const bar = new ProgressBar(100)
      bar.update(25)
      bar.update(50)
      bar.update(75)
      bar.complete()

      const output = stderrOutput.join('')
      // Should contain carriage returns for clearing previous lines
      expect(output).toContain('\r')
      // Should end with newline
      expect(output).toContain('\n')
    })
  })

  describe('Real-world Scenarios', () => {
    it('should simulate downloading Node.js', async () => {
      const nodeSize = 25 * 1024 * 1024 // 25MB
      const bar = new ProgressBar(nodeSize, {
        showBytes: true,
        showSpeed: true,
        showETA: true,
      })

      // Simulate realistic download chunks
      let downloaded = 0
      const chunkSizes = [128, 256, 512, 1024] // KB

      while (downloaded < nodeSize) {
        const chunkSize = chunkSizes[Math.floor(Math.random() * chunkSizes.length)] * 1024
        downloaded += chunkSize
        if (downloaded > nodeSize)
          downloaded = nodeSize

        bar.update(downloaded)
        await new Promise(resolve => setTimeout(resolve, 2))
      }

      bar.complete()

      const output = stderrOutput.join('')
      expect(output).toContain('25.0 MB/25.0 MB')
      expect(output).toContain('100.0%')
    })

    it('should simulate multi-package installation', async () => {
      const packages = ['node@20.1.0', 'python@3.11.0', 'go@1.20.0']

      for (let i = 0; i < packages.length; i++) {
        const pkg = packages[i]

        // Download phase
        const downloadBar = new ProgressBar(5 * 1024 * 1024, { showBytes: true })
        let downloaded = 0
        while (downloaded < 5 * 1024 * 1024) {
          downloaded += 256 * 1024
          if (downloaded > 5 * 1024 * 1024)
            downloaded = 5 * 1024 * 1024
          downloadBar.update(downloaded)
          await new Promise(resolve => setTimeout(resolve, 1))
        }
        downloadBar.complete()

        // Extraction phase
        const extractSpinner = new Spinner()
        extractSpinner.start(`🔧 Extracting ${pkg}...`)
        await new Promise(resolve => setTimeout(resolve, 30))
        extractSpinner.stop()

        // Installation phase
        const installSpinner = new Spinner()
        installSpinner.start(`⚡ Installing ${pkg}...`)
        await new Promise(resolve => setTimeout(resolve, 20))
        installSpinner.stop(`✅ Successfully installed ${pkg}`)
      }

      const output = stderrOutput.join('')
      // Check for progress bars and spinner activity
      expect(output).toContain('100.0%') // Progress bars completed
      expect(output).toContain('5.0 MB/5.0 MB') // File size indicators
      const hasSpinnerActivity = output.includes('\r') || output.includes('⠋') || output.includes('⠙')
      expect(hasSpinnerActivity).toBe(true)
    })

    it('should handle slow network conditions', async () => {
      const bar = new ProgressBar(1024 * 1024, {
        showBytes: true,
        showSpeed: true,
        showETA: true,
      })

      // Simulate slow download with variable speeds
      let downloaded = 0
      const slowChunk = 8 * 1024 // 8KB chunks

      while (downloaded < 1024 * 1024) {
        downloaded += slowChunk
        if (downloaded > 1024 * 1024)
          downloaded = 1024 * 1024

        bar.update(downloaded)
        await new Promise(resolve => setTimeout(resolve, 10)) // Slower updates
      }

      bar.complete()

      const output = stderrOutput.join('')
      expect(output).toContain('/s') // Speed indicator
      expect(output).toContain('ETA:') // Time estimate
    })
  })
})
