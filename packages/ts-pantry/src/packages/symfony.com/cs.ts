/**
 * **php-cs-fixer** - A tool to automatically fix PHP Coding Standards issues
 *
 * @domain `symfony.com/cs`
 * @programs `php-cs-fixer`
 * @version `3.92.5` (82 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install symfony.com/cs`
 * @homepage https://cs.symfony.com/
 * @dependencies `php.net>=7.4<8.4`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.symfonycomcs
 * console.log(pkg.name)        // "php-cs-fixer"
 * console.log(pkg.description) // "A tool to automatically fix PHP Coding Standard..."
 * console.log(pkg.programs)    // ["php-cs-fixer"]
 * console.log(pkg.versions[0]) // "3.92.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/symfony-com/cs.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const symfonycomcsPackage = {
  /**
   * The display name of this package.
   */
  name: 'php-cs-fixer' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'symfony.com/cs' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A tool to automatically fix PHP Coding Standards issues' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/symfony.com/cs/package.yml' as const,
  homepageUrl: 'https://cs.symfony.com/' as const,
  githubUrl: 'https://github.com/PHP-CS-Fixer/PHP-CS-Fixer' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install symfony.com/cs' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +symfony.com/cs -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install symfony.com/cs' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'php-cs-fixer',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'php.net>=7.4<8.4',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.92.5',
    '3.92.4',
    '3.92.3',
    '3.92.2',
    '3.92.1',
    '3.92.0',
    '3.91.3',
    '3.91.2',
    '3.91.1',
    '3.91.0',
    '3.89.2',
    '3.89.1',
    '3.89.0',
    '3.88.2',
    '3.88.1',
    '3.88.0',
    '3.87.2',
    '3.87.1',
    '3.87.0',
    '3.86.0',
    '3.85.1',
    '3.85.0',
    '3.84.0',
    '3.83.0',
    '3.82.2',
    '3.82.1',
    '3.82.0',
    '3.81.0',
    '3.80.0',
    '3.79.0',
    '3.78.1',
    '3.78.0',
    '3.77.0',
    '3.76.0',
    '3.75.0',
    '3.74.0',
    '3.73.1',
    '3.73.0',
    '3.72.0',
    '3.71.0',
    '3.70.2',
    '3.70.1',
    '3.70.0',
    '3.69.1',
    '3.69.0',
    '3.68.5',
    '3.68.4',
    '3.68.3',
    '3.68.2',
    '3.68.1',
    '3.68.0',
    '3.67.1',
    '3.67.0',
    '3.66.2',
    '3.66.1',
    '3.66.0',
    '3.65.0',
    '3.64.0',
    '3.63.2',
    '3.63.1',
    '3.62.0',
    '3.61.1',
    '3.61.0',
    '3.60.0',
    '3.59.3',
    '3.59.2',
    '3.59.1',
    '3.59.0',
    '3.58.1',
    '3.58.0',
    '3.57.2',
    '3.57.1',
    '3.57.0',
    '3.56.2',
    '3.56.1',
    '3.56.0',
    '3.55.0',
    '3.54.0',
    '3.53.0',
    '3.52.1',
    '3.52.0',
    '3.51.0',
  ] as const,
  aliases: [] as const,
}

export type SymfonycomcsPackage = typeof symfonycomcsPackage
