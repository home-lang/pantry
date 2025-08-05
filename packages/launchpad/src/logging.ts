/* eslint-disable no-console */
import fs from 'node:fs'
import process from 'node:process'
import { config } from './config'

// Global message deduplication for shell mode
const shellModeMessageCache = new Set<string>()
let hasTemporaryProcessingMessage = false
let spinnerInterval: Timer | null = null
// Global tracker for completed packages (by domain only) to prevent duplicate success messages
const globalCompletedPackages = new Set<string>()

// Reset all global state for a new environment setup (critical for test isolation)
export function resetInstalledTracker(): void {
  // Only reset tracking state, NOT installed packages
  // This prevents tests from accidentally uninstalling system dependencies
  globalCompletedPackages.clear()
  shellModeMessageCache.clear()
  cleanupSpinner()

  // Add safety check to prevent actual package removal during tests
  if (process.env.NODE_ENV === 'test') {
    // Log warning if test tries to reset package installations
    console.warn('Test environment detected: resetInstalledTracker only clears tracking state, not actual packages')
  }
}

// Centralized cleanup function for spinner and processing messages
export function cleanupSpinner(): void {
  if (spinnerInterval) {
    clearInterval(spinnerInterval)
    spinnerInterval = null
  }
  // Clear any spinner line
  if (hasTemporaryProcessingMessage) {
    if (process.env.LAUNCHPAD_SHELL_INTEGRATION === '1') {
      process.stderr.write('\x1B[1A\r\x1B[K')
    }
    else {
      process.stdout.write('\x1B[1A\r\x1B[K')
    }
    hasTemporaryProcessingMessage = false
  }
}

// Function to clean up all lingering processing messages at the end
export function cleanupAllProcessingMessages(): void {
  cleanupSpinner()
  // Additional cleanup can be added here if needed
}

// Setup signal handlers for clean exit
function setupSignalHandlers(): void {
  process.on('SIGINT', () => {
    cleanupSpinner()
    process.exit(130) // Standard exit code for SIGINT
  })

  process.on('SIGTERM', () => {
    cleanupSpinner()
    process.exit(143) // Standard exit code for SIGTERM
  })

  process.on('beforeExit', () => {
    cleanupSpinner()
  })

  process.on('exit', () => {
    cleanupSpinner()
  })
}

// Initialize signal handlers
setupSignalHandlers()

// Show success messages and temporary processing messages immediately after
export function logUniqueMessage(message: string, forceLog = false): void {
  // Clear any temporary processing message before showing any new message
  if (hasTemporaryProcessingMessage && (message.startsWith('✅') || message.startsWith('⚠️') || message.startsWith('❌'))) {
    // Stop spinner
    if (spinnerInterval) {
      clearInterval(spinnerInterval)
      spinnerInterval = null
    }

    // Clear the current spinner line by moving cursor up and clearing the line
    if (process.env.LAUNCHPAD_SHELL_INTEGRATION === '1') {
      process.stderr.write('\x1B[1A\r\x1B[K') // Move up and clear line
    }
    else {
      process.stdout.write('\x1B[1A\r\x1B[K') // Move up and clear line
    }
    hasTemporaryProcessingMessage = false
  }

  // In shell mode, deduplicate messages to avoid spam
  if (process.env.LAUNCHPAD_SHELL_INTEGRATION === '1' && !forceLog) {
    const messageKey = message.replace(/\r.*/, '').trim() // Remove progress overwrite chars
    if (shellModeMessageCache.has(messageKey)) {
      return // Skip duplicate message
    }
    shellModeMessageCache.add(messageKey)
  }

  // Global deduplication for package completion messages to prevent x.org/x11 duplicates
  if (message.startsWith('✅') && message.includes('(v')) {
    const domainMatch = message.match(/✅\s+(\S+)\s+/)
    if (domainMatch) {
      const domain = domainMatch[1]
      if (globalCompletedPackages.has(domain)) {
        return // Skip duplicate completion message for this domain
      }
      globalCompletedPackages.add(domain)
    }
  }

  // In shell mode, always use stderr for progress indicators and force flush
  if (process.env.LAUNCHPAD_SHELL_INTEGRATION === '1') {
    process.stderr.write(`${message}\n`)
    // Force flush to ensure real-time display
    if (process.stderr.isTTY) {
      // Use sync write for TTY to avoid buffering
      fs.writeSync(process.stderr.fd, '')
    }
  }
  else {
    console.log(message)
  }

  // Show temporary processing message immediately after package success messages (not the final environment message)
  // Use a simple static message instead of animated spinner to avoid conflicts with download progress
  // But don't show it for the final package completion or summary messages
  if (!config.verbose && message.startsWith('✅')
    && !message.includes('Environment activated')
    && !message.includes('Successfully set up environment')
    && !message.includes('Installed')
    && !message.includes('packages')
    && !message.includes('(v')) { // Don't show processing message after individual package success messages
    // Add a small delay to make the success message visible before showing processing message
    setTimeout(() => {
      // Only show processing message if we haven't completed all packages
      if (!hasTemporaryProcessingMessage) {
        const processingMsg = `🔄 Processing next dependency...`

        if (process.env.LAUNCHPAD_SHELL_INTEGRATION === '1') {
          process.stderr.write(`${processingMsg}\n`)
          if (process.stderr.isTTY) {
            fs.writeSync(process.stderr.fd, '')
          }
        }
        else {
          process.stdout.write(`${processingMsg}\n`)
        }

        hasTemporaryProcessingMessage = true
      }
    }, 50) // Small delay to ensure success message is visible
  }
}

export function clearMessageCache(): void {
  shellModeMessageCache.clear()
}
