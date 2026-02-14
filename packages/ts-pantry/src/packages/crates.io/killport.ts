/**
 * **killport** - A command-line tool to easily kill processes running on a specified port.
 *
 * @domain `crates.io/killport`
 * @programs `killport`
 * @version `1.1.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/killport`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiokillport
 * console.log(pkg.name)        // "killport"
 * console.log(pkg.description) // "A command-line tool to easily kill processes ru..."
 * console.log(pkg.programs)    // ["killport"]
 * console.log(pkg.versions[0]) // "1.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/killport.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiokillportPackage = {
  /**
  * The display name of this package.
  */
  name: 'killport' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/killport' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A command-line tool to easily kill processes running on a specified port.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/killport/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/jkfran/killport' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install crates.io/killport' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/killport -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/killport' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'killport',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.1.0',
    '1.0.0',
    '0.9.2',
    '0.9.1',
  ] as const,
  aliases: [] as const,
}

export type CratesiokillportPackage = typeof cratesiokillportPackage
