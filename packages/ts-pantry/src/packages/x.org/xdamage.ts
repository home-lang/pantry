/**
 * **xdamage** - pkgx package
 *
 * @domain `x.org/xdamage`
 * @version `1.1.6` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install x.org/xdamage`
 * @dependencies `x.org/x11`, `x.org/protocol`, `x.org/xfixes`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.xorgxdamage
 * console.log(pkg.name)        // "xdamage"
 * console.log(pkg.versions[0]) // "1.1.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/x-org/xdamage.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xorgxdamagePackage = {
  /**
   * The display name of this package.
   */
  name: 'xdamage' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'x.org/xdamage' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/x.org/xdamage/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install x.org/xdamage' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +x.org/xdamage -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install x.org/xdamage' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'x.org/x11',
    'x.org/protocol',
    'x.org/xfixes',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.1.6',
  ] as const,
  aliases: [] as const,
}

export type XorgxdamagePackage = typeof xorgxdamagePackage
