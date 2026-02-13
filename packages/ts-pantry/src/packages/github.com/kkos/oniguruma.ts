/**
 * **onig-config** - Regular expressions library
 *
 * @domain `github.com/kkos/oniguruma`
 * @programs `onig-config`
 * @version `6.9.10` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/kkos/oniguruma`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomkkosoniguruma
 * console.log(pkg.name)        // "onig-config"
 * console.log(pkg.description) // "Regular expressions library"
 * console.log(pkg.programs)    // ["onig-config"]
 * console.log(pkg.versions[0]) // "6.9.10" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/kkos/oniguruma.md
 * @see https://ts-pkgx.netlify.app/usage
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
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/kkos/oniguruma' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/kkos/oniguruma -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/kkos/oniguruma' as const,
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
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '6.9.10',
    '6.9.9',
    '6.9.8',
  ] as const,
  aliases: [] as const,
}

export type OnigurumaPackage = typeof onigurumaPackage
