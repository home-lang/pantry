/**
 * **cpz** - Modern, performance focused unix commands
 *
 * @domain `crates.io/cpz`
 * @programs `cpz`
 * @version `3.1.1` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/cpz`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiocpz
 * console.log(pkg.name)        // "cpz"
 * console.log(pkg.description) // "Modern, performance focused unix commands"
 * console.log(pkg.programs)    // ["cpz"]
 * console.log(pkg.versions[0]) // "3.1.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/cpz.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiocpzPackage = {
  /**
  * The display name of this package.
  */
  name: 'cpz' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/cpz' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Modern, performance focused unix commands' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/cpz/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/supercilex/fuc' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install crates.io/cpz' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/cpz -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/cpz' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'cpz',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '3.1.1',
    '3.1.0',
    '3.0.1',
    '3.0.0',
    '2.2.0',
    '2.1.0',
  ] as const,
  aliases: [] as const,
}

export type CratesiocpzPackage = typeof cratesiocpzPackage
