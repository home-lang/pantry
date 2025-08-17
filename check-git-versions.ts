#!/usr/bin/env bun
/* eslint-disable no-console */

import { packages } from 'ts-pkgx'

// Check if git-scm.com exists in the packages
if (packages['git-scm.com']) {
  console.log('Git versions available in ts-pkgx:')
  console.log(JSON.stringify(packages['git-scm.com'], null, 2))
}
else {
  console.log('git-scm.com not found in ts-pkgx packages')

  // Check if git is available as an alias
  const { aliases } = await import('ts-pkgx')
  if (aliases.git) {
    console.log(`Git is aliased to: ${aliases.git}`)

    // Check if the aliased package exists
    const aliasedPackage = aliases.git
    if (packages[aliasedPackage]) {
      console.log(`Aliased package versions:`, JSON.stringify(packages[aliasedPackage], null, 2))
    }
    else {
      console.log(`Aliased package ${aliasedPackage} not found in packages`)
    }
  }
  else {
    console.log('git is not defined as an alias in ts-pkgx')
  }

  // List all available packages starting with git
  console.log('\nPackages related to git:')
  for (const pkg in packages) {
    if (pkg.includes('git')) {
      console.log(`- ${pkg}`)
    }
  }
}
