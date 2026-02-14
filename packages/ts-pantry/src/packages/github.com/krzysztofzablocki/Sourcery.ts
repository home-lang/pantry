/**
 * **Sourcery** - Meta-programming for Swift, stop writing boilerplate code.
 *
 * @domain `github.com/krzysztofzablocki/Sourcery`
 * @programs `sourcery`
 * @version `2.3.0` (20 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/krzysztofzablocki/Sourcery`
 * @homepage http://merowing.info
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomkrzysztofzablockisourcery
 * console.log(pkg.name)        // "Sourcery"
 * console.log(pkg.description) // "Meta-programming for Swift, stop writing boiler..."
 * console.log(pkg.programs)    // ["sourcery"]
 * console.log(pkg.versions[0]) // "2.3.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/krzysztofzablocki/Sourcery.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const sourceryPackage = {
  /**
  * The display name of this package.
  */
  name: 'Sourcery' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/krzysztofzablocki/Sourcery' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Meta-programming for Swift, stop writing boilerplate code.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/krzysztofzablocki/Sourcery/package.yml' as const,
  homepageUrl: 'http://merowing.info' as const,
  githubUrl: 'https://github.com/krzysztofzablocki/Sourcery' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/krzysztofzablocki/Sourcery' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/krzysztofzablocki/Sourcery -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/krzysztofzablocki/Sourcery' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'sourcery',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.3.0',
    '2.2.7',
    '2.2.6',
    '2.2.5',
    '2.2.4',
    '2.2.3',
    '2.2.2',
    '2.2.1',
    '2.2.0',
    '2.1.8',
    '2.1.7',
    '2.1.6',
    '2.1.5',
    '2.1.4',
    '2.1.3',
    '2.1.2',
    '2.1.1',
    '2.1.0',
    '2.0.3',
    '2.0.2',
  ] as const,
  aliases: [] as const,
}

export type SourceryPackage = typeof sourceryPackage
