#!/usr/bin/env bun
/* eslint-disable no-console */

import { getAvailableVersions, getLatestVersion, resolvePackageName } from './src/package-resolution'

console.log('Testing git package resolution fix:')
console.log('----------------------------------')

// Test git alias resolution
console.log('Resolving git package name:')
console.log(`git -> ${resolvePackageName('git')}`)
console.log(`git-scm.com -> ${resolvePackageName('git-scm.com')}`)
console.log(`git-scm.org -> ${resolvePackageName('git-scm.org')}`)

// Test latest version resolution
console.log('\nGetting latest version:')
console.log(`git: ${getLatestVersion('git')}`)
console.log(`git-scm.com: ${getLatestVersion('git-scm.com')}`)
console.log(`git-scm.org: ${getLatestVersion('git-scm.org')}`)

// Test available versions
console.log('\nGetting available versions:')
console.log(`git: ${getAvailableVersions('git').slice(0, 5).join(', ')}... (${getAvailableVersions('git').length} versions)`)
console.log(`git-scm.com: ${getAvailableVersions('git-scm.com').slice(0, 5).join(', ')}... (${getAvailableVersions('git-scm.com').length} versions)`)
console.log(`git-scm.org: ${getAvailableVersions('git-scm.org').slice(0, 5).join(', ')}... (${getAvailableVersions('git-scm.org').length} versions)`)
