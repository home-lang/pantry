/**
 * **composer** - Dependency Manager for PHP
 *
 * @domain `getcomposer.org`
 * @programs `composer`, `composer.phar`
 * @version `2.9.4` (39 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install getcomposer.org`
 * @homepage https://getcomposer.org/
 * @dependencies `php.net`
 * @buildDependencies `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.getcomposerorg
 * console.log(pkg.name)        // "composer"
 * console.log(pkg.description) // "Dependency Manager for PHP"
 * console.log(pkg.programs)    // ["composer", "composer.phar"]
 * console.log(pkg.versions[0]) // "2.9.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/getcomposer-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const getcomposerorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'composer' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'getcomposer.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Dependency Manager for PHP' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/getcomposer.org/package.yml' as const,
  homepageUrl: 'https://getcomposer.org/' as const,
  githubUrl: 'https://github.com/composer/composer' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install getcomposer.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +getcomposer.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install getcomposer.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'composer',
    'composer.phar',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'php.net',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'curl.se',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.9.4',
    '2.9.3',
    '2.9.2',
    '2.9.1',
    '2.9.0',
    '2.8.12',
    '2.8.11',
    '2.8.10',
    '2.8.9',
    '2.8.8',
    '2.8.7',
    '2.8.6',
    '2.8.5',
    '2.8.4',
    '2.8.3',
    '2.8.2',
    '2.8.1',
    '2.8.0',
    '2.7.9',
    '2.7.8',
    '2.7.7',
    '2.7.6',
    '2.7.5',
    '2.7.4',
    '2.7.3',
    '2.7.2',
    '2.7.1',
    '2.7.0',
    '2.6.6',
    '2.6.5',
    '2.6.4',
    '2.6.3',
    '2.6.2',
    '2.6.1',
    '2.6.0',
    '2.5.8',
    '2.2.26',
    '2.2.24',
    '2.2.23',
  ] as const,
  aliases: [] as const,
}

export type GetcomposerorgPackage = typeof getcomposerorgPackage
