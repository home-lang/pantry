/**
 * **onig-config** - Regular expressions library
 *
 * @domain `github.com/kkos/oniguruma`
 * @programs `onig-config`
 * @version `6.9.10` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install github.com/kkos/oniguruma`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.githubcomkkosoniguruma
 * console.log(pkg.name)        // "onig-config"
 * console.log(pkg.description) // "Regular expressions library"
 * console.log(pkg.programs)    // ["onig-config"]
 * console.log(pkg.versions[0]) // "6.9.10" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/github-com/kkos/oniguruma.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const onigurumaPackage = {
  /**
  * The display name of this package.
  */
  name: 'onig-config' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/kkos/oniguruma' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Regular expressions library' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/kkos/oniguruma/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/kkos/oniguruma' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install github.com/kkos/oniguruma' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/kkos/oniguruma -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install github.com/kkos/oniguruma' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'onig-config',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '6.9.10',
    '6.9.9',
    '6.9.8',
    '6.9.7.1',
    '6.9.7',
    '6.9.6',
    '6.9.5_rev1',
    '6.9.5',
    '6.9.4',
    '6.9.3',
    '6.9.2',
    '6.9.1',
    '6.9.0',
    '6.8.2',
    '6.8.1',
    '6.8.0',
    '6.7.1',
    '6.7.0',
    '6.6.1',
    '6.6.0',
    '6.5.0',
    '6.4.0',
    '6.3.0',
    '6.2.0',
    '6.1.3',
    '6.1.2',
    '6.1.1',
    '6.1.0',
    '6.0.0',
    '5.9.6_p1',
    '5.9.6',
  ] as const,
  aliases: [] as const,
}

export type OnigurumaPackage = typeof onigurumaPackage
