/**
 * **xfixes** - pkgx package
 *
 * @domain `x.org/xfixes`
 * @version `6.0.2` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install x.org/xfixes`
 * @dependencies `x.org/x11`, `x.org/protocol`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.xorgxfixes
 * console.log(pkg.name)        // "xfixes"
 * console.log(pkg.versions[0]) // "6.0.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/x-org/xfixes.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xorgxfixesPackage = {
  /**
   * The display name of this package.
   */
  name: 'xfixes' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'x.org/xfixes' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/x.org/xfixes/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install x.org/xfixes' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +x.org/xfixes -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install x.org/xfixes' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'x.org/x11',
    'x.org/protocol',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '6.0.2',
    '6.0.1',
  ] as const,
  aliases: [] as const,
}

export type XorgxfixesPackage = typeof xorgxfixesPackage
