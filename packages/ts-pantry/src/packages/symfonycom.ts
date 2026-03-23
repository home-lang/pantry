/**
 * **symfony** - The Symfony CLI tool
 *
 * @domain `symfony.com`
 * @programs `symfony`
 * @version `5.16.1` (58 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install symfony.com`
 * @homepage https://symfony.com/download
 * @dependencies `php.net`
 * @buildDependencies `gnu.org/wget` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.symfonycom
 * console.log(pkg.name)        // "symfony"
 * console.log(pkg.description) // "The Symfony CLI tool"
 * console.log(pkg.programs)    // ["symfony"]
 * console.log(pkg.versions[0]) // "5.16.1" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/symfony-com.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const symfonycomPackage = {
  /**
  * The display name of this package.
  */
  name: 'symfony' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'symfony.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'The Symfony CLI tool' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/symfony.com/package.yml' as const,
  homepageUrl: 'https://symfony.com/download' as const,
  githubUrl: 'https://github.com/symfony-cli/symfony-cli' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install symfony.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +symfony.com -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install symfony.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'symfony',
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
    'gnu.org/wget',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '5.16.1',
    '5.16.0',
    '5.15.1',
    '5.15.0',
    '5.14.2',
    '5.14.1',
    '5.14.0',
    '5.13.0',
    '5.12.0',
    '5.11.0',
    '5.10.9',
    '5.10.8',
    '5.10.7',
    '5.10.6',
    '5.10.5',
    '5.10.4',
    '5.10.3',
    '5.10.2',
    '5.10.1',
    '5.10.0',
  ] as const,
  aliases: [] as const,
}

export type SymfonycomPackage = typeof symfonycomPackage
