/**
 * **licensed** - A Ruby gem to cache and verify the licenses of dependencies
 *
 * @domain `github.com/licensee/licensed`
 * @programs `licensed`
 * @version `5.0.6` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install github.com/licensee/licensed`
 * @dependencies `ruby-lang.org~3.4`, `rubygems.org`
 * @buildDependencies `cmake.org@^4`, `tukaani.org/xz` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.githubcomlicenseelicensed
 * console.log(pkg.name)        // "licensed"
 * console.log(pkg.description) // "A Ruby gem to cache and verify the licenses of ..."
 * console.log(pkg.programs)    // ["licensed"]
 * console.log(pkg.versions[0]) // "5.0.6" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/github-com/licensee/licensed.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install github.com/licensee/licensed' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/licensee/licensed -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install github.com/licensee/licensed' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '5.1.0',
    '5.0.6',
    '5.0.4',
    '5.0.3',
    '5.0.2',
    '5.0.1',
    '5.0.0',
    '4.5.0',
    '4.4.0',
    '4.3.1',
    '4.3.0',
    '4.2.0',
    '4.1.0',
    '4.0.4',
    '4.0.3',
    '4.0.2',
    '4.0.1',
    '4.0.0',
    '3.9.1',
    '3.9.0',
    '3.8.0',
    '3.7.5',
    '3.7.4',
    '3.7.3',
    '3.7.2',
    '3.7.1',
    '3.7.0',
    '3.6.0',
    '3.5.0',
    '3.4.4',
    '3.4.3',
    '3.4.2',
    '3.4.1',
    '3.4.0',
    '3.3.1',
    '3.3.0',
    '3.2.3',
    '3.2.2',
    '3.2.1',
    '3.2.0',
    '3.1.0',
    '3.0.1',
    '3.0.0',
    '2.15.2',
    '2.15.1',
    '2.15.0',
    '2.14.4',
    '2.14.3',
    '2.14.2',
    '2.14.1',
  ] as const,
  aliases: [] as const,
}

export type LicensedPackage = typeof licensedPackage
