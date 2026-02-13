/**
 * **carthage** - A simple, decentralized dependency manager for Cocoa
 *
 * @domain `github.com/Carthage/Carthage`
 * @programs `carthage`
 * @version `0.40.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/Carthage/Carthage`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomcarthagecarthage
 * console.log(pkg.name)        // "carthage"
 * console.log(pkg.description) // "A simple, decentralized dependency manager for ..."
 * console.log(pkg.programs)    // ["carthage"]
 * console.log(pkg.versions[0]) // "0.40.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/Carthage/Carthage.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const carthagePackage = {
  /**
   * The display name of this package.
   */
  name: 'carthage' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/Carthage/Carthage' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A simple, decentralized dependency manager for Cocoa' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/Carthage/Carthage/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/Carthage/Carthage' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/Carthage/Carthage' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/Carthage/Carthage -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/Carthage/Carthage' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'carthage',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.40.0',
    '0.39.1',
    '0.39.0',
  ] as const,
  aliases: [] as const,
}

export type CarthagePackage = typeof carthagePackage
