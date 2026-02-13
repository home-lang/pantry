#!/usr/bin/env bun
/**
 * Enhanced documentation generator for ts-pkgx packages
 * Creates comprehensive VitePress-compatible documentation
 *
 * This script now delegates to the consolidated generation logic in src/generate.ts
 */

import path from 'node:path'
import process from 'node:process'
import { generateDocs } from '../src/generate'

// Default output directory
const DEFAULT_DOCS_DIR = path.join(process.cwd(), 'docs')

// Main function - only called when run directly
async function main() {
  try {
    const outputDir = process.argv[2] || DEFAULT_DOCS_DIR
    await generateDocs(outputDir)
    console.error('\n✨ Documentation generation completed successfully!')
  }
  catch (error) {
    console.error('💥 Error generating documentation:', error)
    process.exit(1)
  }
}

// Run the main function only when run directly
if (import.meta.url.endsWith('generate-docs.ts')) {
  main()
}
