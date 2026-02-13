/**
 * **laravel** - The Laravel application installer.
 *
 * @domain `laravel.com`
 * @programs `laravel`
 * @version `5.24.2` (29 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install laravel.com`
 * @homepage https://laravel.com/docs
 * @dependencies `php.net^8.2`, `getcomposer.org^2.7`, `linux:info-zip.org/unzip^6` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `curl.se`, `pkgx.sh@^1` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.laravelcom
 * console.log(pkg.name)        // "laravel"
 * console.log(pkg.description) // "The Laravel application installer."
 * console.log(pkg.programs)    // ["laravel"]
 * console.log(pkg.versions[0]) // "5.24.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/laravel-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const laravelcomPackage = {
  /**
   * The display name of this package.
   */
  name: 'laravel' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'laravel.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The Laravel application installer.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/laravel.com/package.yml' as const,
  homepageUrl: 'https://laravel.com/docs' as const,
  githubUrl: 'https://github.com/laravel/installer' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install laravel.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +laravel.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install laravel.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'laravel',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'php.net^8.2',
    'getcomposer.org^2.7',
    'linux:info-zip.org/unzip^6',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'curl.se',
    'pkgx.sh@^1',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '5.24.2',
    '5.24.1',
    '5.24.0',
    '5.23.2',
    '5.23.1',
    '5.23.0',
    '5.22.0',
    '5.21.0',
    '5.20.0',
    '5.19.0',
    '5.18.0',
    '5.17.0',
    '5.16.0',
    '5.15.0',
    '5.14.1',
    '5.14.0',
    '5.13.0',
    '5.12.2',
    '5.12.1',
    '5.12.0',
    '5.11.2',
    '5.11.1',
    '5.11.0',
    '5.10.0',
    '5.9.2',
    '5.9.1',
    '5.9.0',
    '5.8.5',
    '5.8.3',
  ] as const,
  aliases: [] as const,
}

export type LaravelcomPackage = typeof laravelcomPackage
