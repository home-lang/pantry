#!/usr/bin/env bun
/* eslint-disable no-console */

import { aliases } from 'ts-pkgx'
import { resolvePackageName } from './src/package-resolution'

// Check git alias
console.log('Git alias in ts-pkgx:', aliases.git)
console.log('Resolved git to:', resolvePackageName('git'))

// Check if the alias is correctly mapped
if (aliases.git === 'git-scm.com' && resolvePackageName('git') === 'git-scm.com') {
  console.log('\n⚠️ Problem detected: The git alias points to git-scm.com but the actual package is git-scm.org')
  console.log('This is causing the installation failure.')
}

// Check all aliases to find git-related ones
console.log('\nAll aliases in ts-pkgx:')
for (const [alias, domain] of Object.entries(aliases)) {
  console.log(`${alias} -> ${domain}`)
}
