#!/usr/bin/env bun
import fs from 'node:fs'
import process from 'node:process'

/**
 * Simple MD5 utility for shell integration
 * Usage: bun md5-util.ts <file-path>
 * Returns: MD5 hash (first 8 characters) of the file content
 */

function computeFileMD5(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath)
    const hasher = new Bun.CryptoHasher('md5')
    hasher.update(content)
    const hash = hasher.digest('hex')
    return hash.slice(0, 8) // Return first 8 characters like the shell code expects
  }
  catch {
    // If file doesn't exist or can't be read, return empty string
    return ''
  }
}

// Get file path from command line arguments
const filePath = process.argv[2]

if (!filePath) {
  console.error('Usage: bun md5-util.ts <file-path>')
  process.exit(1)
}

// Output just the hash (no extra output for shell parsing)
// eslint-disable-next-line no-console
console.log(computeFileMD5(filePath))
