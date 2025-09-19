#!/usr/bin/env bun

import { logUniqueMessage } from './packages/launchpad/src/logging'
import { BuildDependencyManager } from './packages/launchpad/src/php/build-dependencies'

async function testBuildDependencies() {
  logUniqueMessage('Testing PHP Build Dependencies Installation')
  logUniqueMessage('==========================================')

  try {
    const depManager = new BuildDependencyManager()

    logUniqueMessage('Installing build dependencies...')
    await depManager.installBuildDependencies()

    logUniqueMessage('Getting dependency paths...')
    const paths = depManager.getDependencyPaths()

    logUniqueMessage(`Found ${paths.includeDirs.length} include directories:`)
    paths.includeDirs.forEach(dir => logUniqueMessage(`  - ${dir}`))

    logUniqueMessage(`Found ${paths.libDirs.length} library directories:`)
    paths.libDirs.forEach(dir => logUniqueMessage(`  - ${dir}`))

    logUniqueMessage(`Found ${paths.pkgConfigDirs.length} pkg-config directories:`)
    paths.pkgConfigDirs.forEach(dir => logUniqueMessage(`  - ${dir}`))

    logUniqueMessage('✅ Build dependencies test completed successfully!')
  }
  catch (error) {
    logUniqueMessage(`❌ Build dependencies test failed: ${error}`)
    process.exit(1)
  }
}

if (import.meta.main) {
  testBuildDependencies()
}
