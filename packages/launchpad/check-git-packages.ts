#!/usr/bin/env bun
/* eslint-disable no-console */

import { aliases, packages } from 'ts-pkgx'

// Check all aliases to find git-related ones
console.log('Git-related aliases in ts-pkgx:')
for (const [alias, domain] of Object.entries(aliases)) {
  if (alias.includes('git')) {
    console.log(`${alias} -> ${domain}`)
  }
}

// Check for git-scm.org domain
if (packages['git-scm.org']) {
  console.log('\nGit versions available in ts-pkgx (git-scm.org):')
  console.log(JSON.stringify(packages['git-scm.org'], null, 2))
}

// Check for git package
if (packages.git) {
  console.log('\nGit package info:')
  console.log(JSON.stringify(packages.git, null, 2))
}

// Check for git in packages
const gitPackage = Object.keys(packages).find(pkg => pkg === 'git')
if (gitPackage) {
  console.log(`\nFound git package: ${gitPackage}`)
  console.log(JSON.stringify(packages[gitPackage], null, 2))
}

// Find any package that might be git
console.log('\nSearching for exact git packages:')
for (const pkg in packages) {
  if (pkg === 'git' || pkg.endsWith('/git')) {
    console.log(`- ${pkg}:`, JSON.stringify(packages[pkg], null, 2))
  }
}
