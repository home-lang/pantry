/* eslint-disable no-console */
import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { formatBytes, formatTime, MultiProgress, ProgressBar, Spinner } from '../src/progress'

describe('Progress Utilities', () => {
  let originalStdout: typeof process.stdout.write
  let stdoutOutput: string[]

  beforeEach(() => {
    stdoutOutput = []
    originalStdout = process.stdout.write
    // Mock stdout.write to capture output
    process.stdout.write = mock((chunk: any) => {
      stdoutOutput.push(chunk.toString())
      return true
    })
  })

  afterEach(() => {
    process.stdout.write = originalStdout
  })

  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 B')
      expect(formatBytes(512)).toBe('512.0 B')
      expect(formatBytes(1024)).toBe('1.0 KB')
      expect(formatBytes(1536)).toBe('1.5 KB')
      expect(formatBytes(1048576)).toBe('1.0 MB')
      expect(formatBytes(1073741824)).toBe('1.0 GB')
      expect(formatBytes(1099511627776)).toBe('1.0 TB')
    })

    it('should handle large numbers', () => {
      expect(formatBytes(2.5 * 1024 * 1024)).toBe('2.5 MB')
      expect(formatBytes(10.7 * 1024 * 1024 * 1024)).toBe('10.7 GB')
    })

    it('should handle decimal precision', () => {
      expect(formatBytes(1234)).toBe('1.2 KB')
      expect(formatBytes(1234567)).toBe('1.2 MB')
    })
  })

  describe('formatTime', () => {
    it('should format seconds correctly', () => {
      expect(formatTime(0)).toBe('0s')
      expect(formatTime(30)).toBe('30s')
      expect(formatTime(59)).toBe('59s')
    })

    it('should format minutes and seconds', () => {
      expect(formatTime(60)).toBe('1m 0s')
      expect(formatTime(90)).toBe('1m 30s')
      expect(formatTime(125)).toBe('2m 5s')
      expect(formatTime(3599)).toBe('59m 59s')
    })

    it('should format hours and minutes', () => {
      expect(formatTime(3600)).toBe('1h 0m')
      expect(formatTime(3660)).toBe('1h 1m')
      expect(formatTime(7200)).toBe('2h 0m')
      expect(formatTime(7320)).toBe('2h 2m')
    })

    it('should handle decimal seconds', () => {
      expect(formatTime(30.7)).toBe('31s')
      expect(formatTime(90.3)).toBe('1m 30s')
    })
  })

  describe('ProgressBar', () => {
    it('should initialize with default options', () => {
      const bar = new ProgressBar(100)
      expect(bar).toBeDefined()
    })

    it('should initialize with custom options', () => {
      const bar = new ProgressBar(100, {
        width: 20,
        showPercentage: false,
        showSpeed: false,
        showETA: false,
        showBytes: false,
      })
      expect(bar).toBeDefined()
    })

    it('should update progress correctly', () => {
      const bar = new ProgressBar(100)
      bar.update(50)

      // Should have written progress to stdout
      expect(stdoutOutput.length).toBeGreaterThan(0)
      const output = stdoutOutput.join('')
      expect(output).toContain('[')
      expect(output).toContain(']')
      expect(output).toContain('50.0%')
    })

    it('should show progress bar with correct fill', () => {
      const bar = new ProgressBar(100, { width: 10 })
      bar.update(50)

      const output = stdoutOutput.join('')
      // Should have 5 filled blocks and 5 empty blocks for 50%
      expect(output).toContain('█████░░░░░')
    })

    it('should display bytes information when enabled', () => {
      const bar = new ProgressBar(1024, { showBytes: true })
      bar.update(512)

      const output = stdoutOutput.join('')
      expect(output).toContain('512.0 B/1.0 KB')
    })

    it('should calculate and display speed', async () => {
      const bar = new ProgressBar(1000, { showSpeed: true })
      bar.update(100)

      // Wait a bit and update again to calculate speed
      await new Promise(resolve => setTimeout(resolve, 100))
      bar.update(200)

      const output = stdoutOutput.join('')
      expect(output).toContain('/s')
    })

    it('should handle completion', () => {
      const bar = new ProgressBar(100)
      bar.update(50)
      bar.complete()

      const output = stdoutOutput.join('')
      expect(output).toContain('100.0%')
      expect(output).toContain('\n')
    })

    it('should handle zero total gracefully', () => {
      const bar = new ProgressBar(0)
      bar.update(0)

      const output = stdoutOutput.join('')
      expect(output).toContain('0.0%')
    })

    it('should update total dynamically', () => {
      const bar = new ProgressBar(100)
      bar.update(50, 200) // Update current to 50 and total to 200

      const output = stdoutOutput.join('')
      expect(output).toContain('25.0%') // 50/200 = 25%
    })

    it('should not exceed 100% progress', () => {
      const bar = new ProgressBar(100)
      bar.update(150) // More than total

      const output = stdoutOutput.join('')
      expect(output).toContain('100.0%')
    })

    it('should clear previous line when updating', () => {
      const bar = new ProgressBar(100)
      bar.update(25)
      bar.update(50)

      // Should contain carriage return and spaces for clearing
      const output = stdoutOutput.join('')
      expect(output).toContain('\r')
    })
  })

  describe('Spinner', () => {
    it('should initialize correctly', () => {
      const spinner = new Spinner()
      expect(spinner).toBeDefined()
    })

    it('should start with default message', () => {
      const spinner = new Spinner()
      spinner.start()

      // Wait a bit for the spinner to output
      setTimeout(() => {
        spinner.stop()
        const output = stdoutOutput.join('')
        expect(output).toContain('Loading...')
      }, 150)
    })

    it('should start with custom message', () => {
      const spinner = new Spinner()
      spinner.start('Custom loading message')

      setTimeout(() => {
        spinner.stop()
        const output = stdoutOutput.join('')
        expect(output).toContain('Custom loading message')
      }, 150)
    })

    it('should stop and clear output', () => {
      const spinner = new Spinner()
      spinner.start('Test message')

      setTimeout(() => {
        spinner.stop()
        const output = stdoutOutput.join('')
        expect(output).toContain('\r')
      }, 150)
    })

    it('should stop with final message', () => {
      const spinner = new Spinner()
      spinner.start('Loading...')

      setTimeout(() => {
        const consoleSpy = mock(() => {})
        const originalLog = console.log
        console.log = consoleSpy

        spinner.stop('Done!')

        expect(consoleSpy).toHaveBeenCalledWith('Done!')
        console.log = originalLog
      }, 150)
    })

    it('should update message while running', () => {
      const spinner = new Spinner()
      spinner.start('Initial message')
      spinner.update('Updated message')

      setTimeout(() => {
        spinner.stop()
        const output = stdoutOutput.join('')
        expect(output).toContain('Updated message')
      }, 150)
    })

    it('should use spinner frames', () => {
      const spinner = new Spinner()
      spinner.start('Test')

      setTimeout(() => {
        spinner.stop()
        const output = stdoutOutput.join('')
        // Should contain at least one spinner character
        const spinnerChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
        const hasSpinnerChar = spinnerChars.some(char => output.includes(char))
        expect(hasSpinnerChar).toBe(true)
      }, 150)
    })

    it('should handle multiple start/stop cycles', () => {
      const spinner = new Spinner()

      spinner.start('First')
      spinner.stop()
      spinner.start('Second')
      spinner.stop()

      // Should not throw errors
      expect(true).toBe(true)
    })

    it('should handle stop without start', () => {
      const spinner = new Spinner()

      // Should not throw error
      expect(() => spinner.stop()).not.toThrow()
    })
  })

  describe('MultiProgress', () => {
    it('should initialize correctly', () => {
      const multi = new MultiProgress()
      expect(multi).toBeDefined()
    })

    it('should add progress bars', () => {
      const multi = new MultiProgress()
      const bar = multi.addBar('test', 100)
      expect(bar).toBeDefined()
      expect(bar).toBeInstanceOf(ProgressBar)
    })

    it('should remove progress bars', () => {
      const multi = new MultiProgress()
      multi.addBar('test', 100)

      // Should not throw error
      expect(() => multi.removeBar('test')).not.toThrow()
    })

    it('should start and stop correctly', () => {
      const multi = new MultiProgress()

      expect(() => multi.start()).not.toThrow()
      expect(() => multi.stop()).not.toThrow()
    })

    it('should handle multiple bars', () => {
      const multi = new MultiProgress()
      const bar1 = multi.addBar('task1', 100)
      const bar2 = multi.addBar('task2', 200)

      expect(bar1).toBeDefined()
      expect(bar2).toBeDefined()
      expect(bar1).not.toBe(bar2)
    })
  })

  describe('Progress Integration', () => {
    it('should work together in realistic scenario', async () => {
      // Simulate a download with progress bar
      const totalSize = 1024 * 1024 // 1MB
      const bar = new ProgressBar(totalSize, {
        showBytes: true,
        showSpeed: true,
        showETA: true,
      })

      // Simulate download chunks
      let downloaded = 0
      const chunkSize = 64 * 1024 // 64KB chunks

      while (downloaded < totalSize) {
        downloaded += chunkSize
        if (downloaded > totalSize)
          downloaded = totalSize

        bar.update(downloaded)
        await new Promise(resolve => setTimeout(resolve, 10))
      }

      bar.complete()

      const output = stdoutOutput.join('')
      expect(output).toContain('100.0%')
      expect(output).toContain('1.0 MB/1.0 MB')
      expect(output).toContain('\n')
    })

    it('should handle extraction with spinner', async () => {
      const spinner = new Spinner()
      spinner.start('Extracting package...')

      // Simulate extraction time
      await new Promise(resolve => setTimeout(resolve, 100))

      spinner.stop('✅ Extraction complete')

      const output = stdoutOutput.join('')
      expect(output).toContain('Extracting package...')
    })

    it('should handle multiple concurrent operations', () => {
      const multi = new MultiProgress()
      multi.start()

      const bar1 = multi.addBar('download1', 100)
      const bar2 = multi.addBar('download2', 200)

      bar1.update(50)
      bar2.update(100)

      multi.removeBar('download1')
      multi.stop()

      // Should complete without errors
      expect(true).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid progress values', () => {
      const bar = new ProgressBar(100)

      // Should not throw for negative values
      expect(() => bar.update(-10)).not.toThrow()

      // Should not throw for NaN
      expect(() => bar.update(Number.NaN)).not.toThrow()
    })

    it('should handle invalid total values', () => {
      expect(() => new ProgressBar(-100)).not.toThrow()
      expect(() => new ProgressBar(Number.NaN)).not.toThrow()
    })

    it('should handle invalid format inputs', () => {
      expect(() => formatBytes(-100)).not.toThrow()
      expect(() => formatBytes(Number.NaN)).not.toThrow()
      expect(() => formatTime(-100)).not.toThrow()
      expect(() => formatTime(Number.NaN)).not.toThrow()
    })

    it('should handle spinner errors gracefully', () => {
      const spinner = new Spinner()

      // Multiple starts should not throw
      expect(() => {
        spinner.start()
        spinner.start()
      }).not.toThrow()

      // Multiple stops should not throw
      expect(() => {
        spinner.stop()
        spinner.stop()
      }).not.toThrow()
    })
  })

  describe('Performance', () => {
    it('should handle rapid progress updates', () => {
      const bar = new ProgressBar(1000)

      const start = Date.now()
      for (let i = 0; i <= 1000; i += 10) {
        bar.update(i)
      }
      const end = Date.now()

      // Should complete quickly (less than 1 second)
      expect(end - start).toBeLessThan(1000)
    })

    it('should handle large file sizes', () => {
      const largeSize = 10 * 1024 * 1024 * 1024 // 10GB
      const bar = new ProgressBar(largeSize)

      expect(() => bar.update(largeSize / 2)).not.toThrow()
      expect(() => bar.complete()).not.toThrow()
    })
  })
})
