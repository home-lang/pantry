#!/usr/bin/env bun
/* eslint-disable no-console */

import { aliases, packages } from 'ts-pkgx'

console.log('Git alias in ts-pkgx:', aliases.git)

// Check for git-scm.com domain
if (packages['git-scm.com']) {
  console.log('\nGit versions available in ts-pkgx:')
  console.log(JSON.stringify(packages['git-scm.com'], null, 2))
}
else {
  console.log('\ngit-scm.com not found in ts-pkgx packages')
}

// Check for git-scm.org domain
if (packages['git-scm.org']) {
  console.log('\nGit versions available in ts-pkgx (git-scm.org):')
  console.log(JSON.stringify(packages['git-scm.org'], null, 2))
}
else {
  console.log('\ngit-scm.org not found in ts-pkgx packages')
}

// Check for gitscm.org domain
if (packages['gitscm.org']) {
  console.log('\nGit versions available in ts-pkgx (gitscm.org):')
  console.log(JSON.stringify(packages['gitscm.org'], null, 2))
}
else {
  console.log('\ngitscm.org not found in ts-pkgx packages')
}

// List all git-related packages with versions
console.log('\nGit-related packages with versions:')
const gitPackages = Object.keys(packages).filter(pkg => pkg.includes('git'))

for (const pkg of gitPackages.slice(0, 5)) {
  console.log(`\n${pkg}:`, JSON.stringify(packages[pkg], null, 2))
}
