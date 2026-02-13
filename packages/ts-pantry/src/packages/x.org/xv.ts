/**
 * **xv** - pkgx package
 *
 * @domain `x.org/xv`
 * @version `1.0.13` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install x.org/xv`
 * @dependencies `x.org/x11`, `x.org/protocol`, `x.org/exts`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.xorgxv
 * console.log(pkg.name)        // "xv"
 * console.log(pkg.versions[0]) // "1.0.13" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/x-org/xv.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xorgxvPackage = {
  /**
   * The display name of this package.
   */
  name: 'xv' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'x.org/xv' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/x.org/xv/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install x.org/xv' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +x.org/xv -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install x.org/xv' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'x.org/x11',
    'x.org/protocol',
    'x.org/exts',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.0.13',
    '1.0.12',
  ] as const,
  aliases: [] as const,
}

export type XorgxvPackage = typeof xorgxvPackage
