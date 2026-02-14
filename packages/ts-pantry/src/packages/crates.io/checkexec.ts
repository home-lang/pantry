/**
 * **checkexec** - CLI tool to conditionally execute commands only when files in a dependency list have been updated. Like `make`, but standalone.
 *
 * @domain `crates.io/checkexec`
 * @programs `checkexec`
 * @version `0.2.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/checkexec`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiocheckexec
 * console.log(pkg.name)        // "checkexec"
 * console.log(pkg.description) // "CLI tool to conditionally execute commands only..."
 * console.log(pkg.programs)    // ["checkexec"]
 * console.log(pkg.versions[0]) // "0.2.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/checkexec.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiocheckexecPackage = {
  /**
  * The display name of this package.
  */
  name: 'checkexec' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/checkexec' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'CLI tool to conditionally execute commands only when files in a dependency list have been updated. Like `make`, but standalone.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/checkexec/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/kurtbuilds/checkexec' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install crates.io/checkexec' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/checkexec -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/checkexec' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'checkexec',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.2.0',
  ] as const,
  aliases: [] as const,
}

export type CratesiocheckexecPackage = typeof cratesiocheckexecPackage
