/**
 * **xcb-util-image** - pkgx package
 *
 * @domain `freedesktop.org/xcb-util-image`
 * @version `0.4.1` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install freedesktop.org/xcb-util-image`
 * @dependencies `x.org/xcb`, `freedesktop.org/xcb-util`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.freedesktoporgxcbutilimage
 * console.log(pkg.name)        // "xcb-util-image"
 * console.log(pkg.versions[0]) // "0.4.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/freedesktop-org/xcb-util-image.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const freedesktoporgxcbutilimagePackage = {
  /**
  * The display name of this package.
  */
  name: 'xcb-util-image' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'freedesktop.org/xcb-util-image' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/xcb-util-image/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install freedesktop.org/xcb-util-image' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +freedesktop.org/xcb-util-image -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install freedesktop.org/xcb-util-image' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'x.org/xcb',
    'freedesktop.org/xcb-util',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.4.1',
  ] as const,
  aliases: [] as const,
}

export type FreedesktoporgxcbutilimagePackage = typeof freedesktoporgxcbutilimagePackage
