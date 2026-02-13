/**
 * **xcb-util-renderutil** - pkgx package
 *
 * @domain `freedesktop.org/xcb-util-renderutil`
 * @version `0.3.10` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install freedesktop.org/xcb-util-renderutil`
 * @dependencies `x.org/xcb`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.freedesktoporgxcbutilrenderutil
 * console.log(pkg.name)        // "xcb-util-renderutil"
 * console.log(pkg.versions[0]) // "0.3.10" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/freedesktop-org/xcb-util-renderutil.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const freedesktoporgxcbutilrenderutilPackage = {
  /**
   * The display name of this package.
   */
  name: 'xcb-util-renderutil' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'freedesktop.org/xcb-util-renderutil' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/xcb-util-renderutil/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install freedesktop.org/xcb-util-renderutil' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +freedesktop.org/xcb-util-renderutil -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install freedesktop.org/xcb-util-renderutil' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'x.org/xcb',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.3.10',
  ] as const,
  aliases: [] as const,
}

export type FreedesktoporgxcbutilrenderutilPackage = typeof freedesktoporgxcbutilrenderutilPackage
