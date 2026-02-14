/**
 * **bats** - Bash Automated Testing System
 *
 * @domain `github.com/bats-core/bats-core`
 * @programs `bats`
 * @version `1.13.0` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/bats-core/bats-core`
 * @homepage https://bats-core.readthedocs.io/
 * @dependencies `gnu.org/coreutils^9.4`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcombatscorebatscore
 * console.log(pkg.name)        // "bats"
 * console.log(pkg.description) // "Bash Automated Testing System"
 * console.log(pkg.programs)    // ["bats"]
 * console.log(pkg.versions[0]) // "1.13.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/bats-core/bats-core.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const batscorePackage = {
  /**
  * The display name of this package.
  */
  name: 'bats' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/bats-core/bats-core' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Bash Automated Testing System' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/bats-core/bats-core/package.yml' as const,
  homepageUrl: 'https://bats-core.readthedocs.io/' as const,
  githubUrl: 'https://github.com/bats-core/bats-core' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/bats-core/bats-core' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/bats-core/bats-core -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/bats-core/bats-core' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'bats',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnu.org/coreutils^9.4',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.13.0',
    '1.12.0',
    '1.11.1',
    '1.11.0',
    '1.10.0',
  ] as const,
  aliases: [] as const,
}

export type BatscorePackage = typeof batscorePackage
