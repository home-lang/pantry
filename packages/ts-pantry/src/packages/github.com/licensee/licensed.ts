/**
 * **licensed** - A Ruby gem to cache and verify the licenses of dependencies
 *
 * @domain `github.com/licensee/licensed`
 * @programs `licensed`
 * @version `5.0.4` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/licensee/licensed`
 * @dependencies `ruby-lang.org~3.4`, `rubygems.org`
 * @buildDependencies `cmake.org@^4`, `tukaani.org/xz` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomlicenseelicensed
 * console.log(pkg.name)        // "licensed"
 * console.log(pkg.description) // "A Ruby gem to cache and verify the licenses of ..."
 * console.log(pkg.programs)    // ["licensed"]
 * console.log(pkg.versions[0]) // "5.0.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/licensee/licensed.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const licensedPackage = {
  /**
  * The display name of this package.
  */
  name: 'licensed' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/licensee/licensed' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A Ruby gem to cache and verify the licenses of dependencies' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/licensee/licensed/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/licensee/licensed' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/licensee/licensed' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/licensee/licensed -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/licensee/licensed' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'licensed',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'ruby-lang.org~3.4',
    'rubygems.org',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org@^4',
    'tukaani.org/xz',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '5.0.4',
  ] as const,
  aliases: [] as const,
}

export type LicensedPackage = typeof licensedPackage
