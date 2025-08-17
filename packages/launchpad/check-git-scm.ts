#!/usr/bin/env bun
/* eslint-disable no-console */

import { aliases, packages } from 'ts-pkgx'
import { getAvailableVersions, getLatestVersion, resolvePackageName } from './src/package-resolution'

console.log('Git alias in ts-pkgx:', aliases.git)
console.log('Resolved git to:', resolvePackageName('git'))

// Check for git-scm.com in packages
console.log('\nIs git-scm.com in packages?', 'git-scm.com' in packages)

// Check latest version
console.log('\nLatest version of git-scm.com:', getLatestVersion('git-scm.com'))

// Check available versions
console.log('\nAvailable versions of git-scm.com:', getAvailableVersions('git-scm.com'))

// Dump all package keys
console.log('\nAll package keys (first 20):')
console.log(Object.keys(packages).slice(0, 20))

// Check if git-scm.org exists
console.log('\nIs git-scm.org in packages?', 'git-scm.org' in packages)

// Check if gitscm.org exists
console.log('\nIs gitscm.org in packages?', 'gitscm.org' in packages)

// Check if git exists
console.log('\nIs git in packages?', 'git' in packages)
