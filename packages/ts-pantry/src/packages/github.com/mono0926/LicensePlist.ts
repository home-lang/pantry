/**
 * **license-plist** - A license list generator of all your dependencies for iOS applications
 *
 * @domain `github.com/mono0926/LicensePlist`
 * @programs `license-plist`
 * @version `3.27.2` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/mono0926/LicensePlist`
 * @homepage https://www.slideshare.net/mono0926/licenseplist-a-license-list-generator-of-all-your-dependencies-for-ios-applications
 * @buildDependencies `swift.org@6` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcommono0926licenseplist
 * console.log(pkg.name)        // "license-plist"
 * console.log(pkg.description) // "A license list generator of all your dependenci..."
 * console.log(pkg.programs)    // ["license-plist"]
 * console.log(pkg.versions[0]) // "3.27.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/mono0926/LicensePlist.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const licenseplistPackage = {
  /**
   * The display name of this package.
   */
  name: 'license-plist' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/mono0926/LicensePlist' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A license list generator of all your dependencies for iOS applications' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/mono0926/LicensePlist/package.yml' as const,
  homepageUrl: 'https://www.slideshare.net/mono0926/licenseplist-a-license-list-generator-of-all-your-dependencies-for-ios-applications' as const,
  githubUrl: 'https://github.com/mono0926/LicensePList' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/mono0926/LicensePlist' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/mono0926/LicensePlist -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/mono0926/LicensePlist' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'license-plist',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'swift.org@6',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.27.2',
    '3.27.1',
    '3.27.0',
    '3.26.0',
    '3.25.1',
  ] as const,
  aliases: [] as const,
}

export type LicenseplistPackage = typeof licenseplistPackage
