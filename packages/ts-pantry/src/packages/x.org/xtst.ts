/**
 * **xtst** - pkgx package
 *
 * @domain `x.org/xtst`
 * @version `1.2.5` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install x.org/xtst`
 * @dependencies `x.org/xi`, `x.org/protocol`
 * @buildDependencies `gnu.org/make` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.xorgxtst
 * console.log(pkg.name)        // "xtst"
 * console.log(pkg.versions[0]) // "1.2.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/x-org/xtst.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xorgxtstPackage = {
  /**
   * The display name of this package.
   */
  name: 'xtst' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'x.org/xtst' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/x.org/xtst/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install x.org/xtst' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +x.org/xtst -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install x.org/xtst' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'x.org/xi',
    'x.org/protocol',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/make',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.2.5',
    '1.2.4',
  ] as const,
  aliases: [] as const,
}

export type XorgxtstPackage = typeof xorgxtstPackage
