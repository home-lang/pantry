/**
 * Mock pantry for package lookup tests
 */

import type { PkgxPackage } from '../../src/types'

// Mock example.com package
export const examplecomPackage: PkgxPackage = {
  name: 'Example Package',
  domain: 'example.com',
  description: 'Example package for testing',
  installCommand: 'pkgx example.com',
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) example.com -- $SHELL -i',
  launchpadInstallCommand: 'launchpad install example.com',
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/example.com/package.yml',
  homepageUrl: 'https://example.com',
  githubUrl: 'https://github.com/example/example',
  programs: ['example'],
  companions: [],
  dependencies: [],
  versions: ['1.0.0'],
  aliases: ['sample'],
}

// Mock agwa.name package
export const agwanamePackage: PkgxPackage = {
  name: 'AGWA Repository',
  domain: 'agwa.name',
  description: 'Repository for AGWA tools',
  installCommand: 'pkgx agwa.name',
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) agwa.name -- $SHELL -i',
  launchpadInstallCommand: 'launchpad install agwa.name',
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/agwa.name/package.yml',
  homepageUrl: 'https://agwa.name',
  githubUrl: 'https://github.com/agwa/repo',
  programs: [],
  companions: [],
  dependencies: [],
  versions: ['1.0.0'],
}

// Mock agwa.name/git-crypt package
export const agwanamegitcryptPackage: PkgxPackage = {
  name: 'git-crypt',
  domain: 'agwa.name',
  description: 'Enable transparent encryption/decryption of files in a git repo',
  installCommand: 'pkgx agwa.name/git-crypt',
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +agwa.name/git-crypt -- $SHELL -i',
  launchpadInstallCommand: 'launchpad install git-crypt',
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/agwa.name/git-crypt/package.yml',
  homepageUrl: 'https://www.agwa.name/projects/git-crypt/',
  githubUrl: 'https://github.com/AGWA/git-crypt',
  programs: ['git-crypt'],
  companions: [],
  dependencies: [],
  versions: ['0.7.0'],
  fullPath: 'agwa.name/git-crypt',
  aliases: ['git-crypt'],
}

// Define an interface for the pantry to support string indexing
interface Pantry {
  [key: string]: PkgxPackage
}

// Export mock package data for tests
export const pantry: Pantry = {
  'example.com': examplecomPackage,
  'agwa.name': agwanamePackage,
  'agwa.name/git-crypt': agwanamegitcryptPackage,
}

// Mock getPackage function
export function getPackage(nameOrDomain: string): PkgxPackage | undefined {
  // Direct lookup first
  if (pantry[nameOrDomain])
    return pantry[nameOrDomain]

  // Try alias lookup
  for (const domain in pantry) {
    const pkg = pantry[domain]
    if (pkg.aliases && pkg.aliases.includes(nameOrDomain))
      return pkg
  }

  // Try subpath lookup for nested packages
  if (nameOrDomain.includes('/')) {
    const [parentDomain, subPath] = nameOrDomain.split('/')
    if (pantry[`${parentDomain}/${subPath}`])
      return pantry[`${parentDomain}/${subPath}`]
  }

  return undefined
}
