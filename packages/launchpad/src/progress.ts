/* eslint-disable no-console */
/**
 * Progress bar utilities for download operations
 */
import process from 'node:process'

export interface ProgressOptions {
  total?: number
  width?: number
  showPercentage?: boolean
  showSpeed?: boolean
  showETA?: boolean
  showBytes?: boolean
}

export interface ProgressState {
  current: number
  total: number
  startTime: number
  lastUpdate: number
  speed: number
  eta: number
}

export class ProgressBar {
  private state: ProgressState
  private options: Required<ProgressOptions>
  private lastLine = ''

  constructor(total = 0, options: ProgressOptions = {}) {
    this.state = {
      current: 0,
      total,
      startTime: Date.now(),
      lastUpdate: Date.now(),
      speed: 0,
      eta: 0,
    }

    this.options = {
      total,
      width: 40,
      showPercentage: true,
      showSpeed: true,
      showETA: true,
      showBytes: true,
      ...options,
    }
  }

  update(current: number, total?: number): void {
    const now = Date.now()
    const timeDiff = (now - this.state.lastUpdate) / 1000

    if (total !== undefined) {
      this.state.total = total
      this.options.total = total
    }

    // Calculate speed (bytes per second)
    if (timeDiff > 0) {
      const bytesDiff = current - this.state.current
      this.state.speed = bytesDiff / timeDiff
    }

    this.state.current = current
    this.state.lastUpdate = now

    // Calculate ETA
    if (this.state.speed > 0 && this.state.total > 0) {
      const remaining = this.state.total - this.state.current
      this.state.eta = remaining / this.state.speed
    }

    this.render()
  }

  complete(): void {
    this.state.current = this.state.total
    this.render()
    // Add extra newline to separate from next output
    process.stderr.write('\n')
  }

  private render(): void {
    const { current, total } = this.state
    const { showPercentage, showSpeed, showETA, showBytes } = this.options

    // Calculate percentage
    const percentage = total > 0 ? Math.min(100, Math.max(0, (current / total) * 100)) : 0

    // Get terminal width, fallback to 80 if not available
    const terminalWidth = process.stderr.columns || 80

    // Format stats components
    const statsParts: string[] = []

    // Add percentage
    if (showPercentage) {
      statsParts.push(`${percentage.toFixed(1)}%`)
    }

    // Add bytes information
    if (showBytes && total > 0) {
      statsParts.push(`${formatBytes(current)}/${formatBytes(total)}`)
    }

    // Add speed
    if (showSpeed && this.state.speed > 0) {
      statsParts.push(`${formatBytes(this.state.speed)}/s`)
    }

    // Add ETA
    if (showETA && this.state.eta > 0 && this.state.eta < Infinity) {
      statsParts.push(`ETA: ${formatTime(this.state.eta)}`)
    }

    const statsText = statsParts.length > 0 ? ` ${statsParts.join(' ')}` : ''

    // Calculate available width for progress bar
    // Reserve space for brackets [  ] and stats text
    const reservedWidth = 2 + statsText.length
    const barWidth = Math.max(10, terminalWidth - reservedWidth)

    const completed = Math.max(0, Math.min(barWidth, Math.floor((percentage / 100) * barWidth)))
    const remaining = Math.max(0, barWidth - completed)

    // Create progress bar
    const bar = '█'.repeat(completed) + '░'.repeat(remaining)

    // Combine everything on one line
    const fullDisplay = `[${bar}]${statsText}`

    // Clear previous line and write new one
    if (this.lastLine) {
      process.stderr.write(`\r${' '.repeat(this.lastLine.length)}\r`)
    }

    process.stderr.write(fullDisplay)
    this.lastLine = fullDisplay
  }
}

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0)
    return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`
}

/**
 * Format time in seconds to human readable format
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`
  }
  else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return `${minutes}m ${remainingSeconds}s`
  }
  else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }
}

/**
 * Simple spinner for indeterminate progress
 */
export class Spinner {
  private frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
  private interval: Timer | null = null
  private currentFrame = 0
  private message = ''

  start(message = 'Loading...'): void {
    this.message = message
    this.interval = setInterval(() => {
      process.stderr.write(`\r${this.frames[this.currentFrame]} ${this.message}`)
      this.currentFrame = (this.currentFrame + 1) % this.frames.length
    }, 100)
  }

  stop(finalMessage?: string): void {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }

    // Clear the line
    process.stderr.write(`\r${' '.repeat(this.message.length + 2)}\r`)

    if (finalMessage) {
      process.stderr.write(`${finalMessage}\n`)
    }
  }

  update(message: string): void {
    this.message = message
  }
}

/**
 * Multi-line progress display for multiple concurrent operations
 */
export class MultiProgress {
  private bars: Map<string, ProgressBar> = new Map()
  private lines: string[] = []
  private isActive = false

  addBar(id: string, total = 0, options: ProgressOptions = {}): ProgressBar {
    const bar = new ProgressBar(total, { ...options, width: 30 })
    this.bars.set(id, bar)
    return bar
  }

  removeBar(id: string): void {
    this.bars.delete(id)
    this.render()
  }

  private render(): void {
    if (!this.isActive)
      return

    // Move cursor up to overwrite previous lines
    if (this.lines.length > 0) {
      process.stdout.write(`\x1B[${this.lines.length}A`)
    }

    this.lines = []
    for (const [id, _bar] of this.bars) {
      const line = `${id}: ${this.getBarString(_bar)}`
      this.lines.push(line)
      console.log(line)
    }
  }

  private getBarString(_bar: ProgressBar): string {
    // This is a simplified version - in a real implementation,
    // we'd need to access the bar's internal state
    return '[████████████████████████████████] 100%'
  }

  start(): void {
    this.isActive = true
  }

  stop(): void {
    this.isActive = false
  }
}
