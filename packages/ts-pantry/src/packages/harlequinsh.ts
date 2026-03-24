/**
 * **harlequin.sh** - pkgx package
 *
 * @domain `harlequin.sh`
 * @programs `harlequin`
 * @version `2.5.1` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install harlequin.sh`
 * @dependencies `pkgx.sh>=1`, `unixodbc.org`
 * @buildDependencies `python.org@~3.11` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.harlequinsh
 * console.log(pkg.name)        // "harlequin.sh"
 * console.log(pkg.programs)    // ["harlequin"]
 * console.log(pkg.versions[0]) // "2.5.1" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/harlequin-sh.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const harlequinshPackage = {
  /**
  * The display name of this package.
  */
  name: 'harlequin.sh' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'harlequin.sh' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/harlequin.sh/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install harlequin.sh' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +harlequin.sh -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install harlequin.sh' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'harlequin',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'pkgx.sh>=1',
    'unixodbc.org',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'python.org@~3.11',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2.5.1',
    '2.5.0',
    '2.4.1',
    '2.4.0',
    '2.3.0',
    '2.2.1',
    '2.2.0',
    '2.1.3',
    '2.1.2',
    '2.1.1',
    '2.1.0',
    '2.0.5',
    '2.0.4',
    '2.0.3',
    '2.0.2',
    '2.0.1',
    '2.0.0',
    '1.25.2',
    '1.25.1',
    '1.25.0',
    '1.24.1',
    '1.24.0',
    '1.23.2',
    '1.23.1',
    '1.23.0',
    '1.22.2',
    '1.22.1',
    '1.22.0',
    '1.21.0',
    '1.20.0',
    '1.19.0',
    '1.18.0',
    '1.17.0',
    '1.16.2',
    '1.16.1',
    '1.16.0',
    '1.15.0',
    '1.14.0',
    '1.13.0',
    '1.12.0',
    '1.11.0',
    '1.10.0',
    '1.9.2',
    '1.9.1',
    '1.9.0',
    '1.8.0',
    '1.7.3',
    '1.7.2',
    '1.7.1',
    '1.7.0',
  ] as const,
  aliases: [] as const,
}

export type HarlequinshPackage = typeof harlequinshPackage
