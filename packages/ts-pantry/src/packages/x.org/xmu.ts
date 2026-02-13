/**
 * **xmu** - pkgx package
 *
 * @domain `x.org/xmu`
 * @version `1.2.1` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install x.org/xmu`
 * @dependencies `x.org/exts`, `x.org/xt`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.xorgxmu
 * console.log(pkg.name)        // "xmu"
 * console.log(pkg.versions[0]) // "1.2.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/x-org/xmu.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xorgxmuPackage = {
  /**
   * The display name of this package.
   */
  name: 'xmu' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'x.org/xmu' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/x.org/xmu/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install x.org/xmu' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +x.org/xmu -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install x.org/xmu' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'x.org/exts',
    'x.org/xt',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.2.1',
    '1.2.0',
    '1.1.4',
  ] as const,
  aliases: [] as const,
}

export type XorgxmuPackage = typeof xorgxmuPackage
