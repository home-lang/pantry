#!/usr/bin/env bun

import { $ } from 'bun'
import { existsSync, statSync } from 'node:fs'
import process from 'node:process'

const platforms = [
  { name: 'linux-x64', target: 'bun-linux-x64', output: 'bin/ts-pkgx-linux-x64' },
  { name: 'linux-arm64', target: 'bun-linux-arm64', output: 'bin/ts-pkgx-linux-arm64' },
  { name: 'darwin-x64', target: 'bun-darwin-x64', output: 'bin/ts-pkgx-darwin-x64' },
  { name: 'darwin-arm64', target: 'bun-darwin-arm64', output: 'bin/ts-pkgx-darwin-arm64' },
  { name: 'windows-x64', target: 'bun-windows-x64', output: 'bin/ts-pkgx-windows-x64.exe' },
]

async function waitForFile(filepath: string, maxAttempts = 10): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    if (existsSync(filepath)) {
      const stats = statSync(filepath)
      if (stats.size > 0) {
        return true
      }
    }
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  return false
}

async function compilePlatform(platform: typeof platforms[0]) {
  console.log(`Building ${platform.name}...`)

  try {
    // Remove existing file if it exists
    if (existsSync(platform.output)) {
      await $`rm -f ${platform.output}`
    }

    await $`bun build ./bin/cli.ts --compile --minify --target=${platform.target} --outfile ${platform.output}`

    // Wait for the file to be fully written
    const fileReady = await waitForFile(platform.output)
    if (!fileReady) {
      throw new Error(`Output file ${platform.output} was not created or is empty after waiting`)
    }

    // Final verification
    const stats = statSync(platform.output)
    console.log(`✅ ${platform.name} compiled successfully (${Math.round(stats.size / 1024 / 1024)}MB)`)

    // Set proper permissions for the executable
    await $`chmod +r ${platform.output}`

    // For Windows, add a small extra delay to ensure file handle is released
    if (platform.name === 'windows-x64') {
      console.log('⏳ Waiting for Windows file handle to be released...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      // Extra permission check for Windows
      await $`chmod 644 ${platform.output}`
    }

    return true
  }
  catch (error) {
    console.error(`❌ Failed to compile ${platform.name}:`, error)
    return false
  }
}

async function zipPlatform(platform: typeof platforms[0]) {
  if (!existsSync(platform.output)) {
    console.error(`❌ Cannot zip ${platform.name}: file ${platform.output} does not exist`)
    return false
  }

  const zipFile = platform.output.replace(/(\.[^.]*)?$/, '.zip')

  try {
    console.log(`Creating zip for ${platform.name}...`)

    // Remove existing zip if it exists
    if (existsSync(zipFile)) {
      await $`rm -f ${zipFile}`
    }

    // For Windows, do an extra file check before zipping
    if (platform.name === 'windows-x64') {
      console.log(`Verifying Windows executable is accessible...`)
      await $`ls -la ${platform.output}`

      // Try to verify we can read the file
      const stats = statSync(platform.output)
      if (stats.size === 0) {
        throw new Error(`Windows executable is empty`)
      }

      // Ensure proper permissions before zipping
      console.log('Setting proper permissions for Windows executable...')
      await $`chmod 644 ${platform.output}`
      await $`ls -la ${platform.output}`

      // Test if we can actually read the file
      try {
        await $`head -c 1 ${platform.output} > /dev/null`
        console.log('✅ Windows executable is readable')
      }
      catch (readError) {
        console.error('❌ Cannot read Windows executable:', readError)
        throw new Error('Windows executable is not readable')
      }
    }

    try {
      await $`zip -j ${zipFile} ${platform.output}`
    }
    catch {
      // If zip fails, try to fix permissions and retry
      console.log(`Zip failed, attempting to fix permissions and retry...`)
      await $`chmod 644 ${platform.output}`
      await $`zip -j ${zipFile} ${platform.output}`
    }

    if (!existsSync(zipFile)) {
      throw new Error(`Zip file ${zipFile} was not created`)
    }

    console.log(`✅ ${platform.name} zipped successfully`)
    return true
  }
  catch (error) {
    console.error(`❌ Failed to zip ${platform.name}:`, error)

    // Add extra debugging for Windows
    if (platform.name === 'windows-x64') {
      console.error('Windows debugging info:')
      try {
        await $`ls -la ${platform.output}`
        await $`file ${platform.output}`
      }
      catch (debugError) {
        console.error('Debug commands failed:', debugError)
      }
    }

    return false
  }
}

async function main() {
  console.log('🚀 Starting cross-platform build...')

  // Create bin directory if it doesn't exist
  await $`mkdir -p bin`

  let allSucceeded = true

  // Compile all platforms
  for (const platform of platforms) {
    const success = await compilePlatform(platform)
    if (!success) {
      allSucceeded = false
    }
  }

  if (!allSucceeded) {
    console.error('❌ Some compilations failed, stopping')
    process.exit(1)
  }

  // Wait a bit more before zipping
  console.log('⏳ Waiting before starting zip process...')
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Zip all platforms
  for (const platform of platforms) {
    const success = await zipPlatform(platform)
    if (!success) {
      allSucceeded = false
    }
  }

  if (allSucceeded) {
    console.log('🎉 All builds completed successfully!')
  }
  else {
    console.error('❌ Some operations failed')
    process.exit(1)
  }
}

if (import.meta.main) {
  main().catch((error) => {
    console.error('Build script failed:', error)
    process.exit(1)
  })
}
