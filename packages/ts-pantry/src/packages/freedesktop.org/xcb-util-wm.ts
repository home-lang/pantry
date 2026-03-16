/**
 * **xcb-util-wm** - pkgx package
 *
 * @domain `freedesktop.org/xcb-util-wm`
 * @version `0.4.2` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install freedesktop.org/xcb-util-wm`
 * @dependencies `x.org/xcb`, `gnu.org/m4`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.freedesktoporgxcbutilwm
 * console.log(pkg.name)        // "xcb-util-wm"
 * console.log(pkg.versions[0]) // "0.4.2" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/freedesktop-org/xcb-util-wm.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const freedesktoporgxcbutilwmPackage = {
  /**
  * The display name of this package.
  */
  name: 'xcb-util-wm' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'freedesktop.org/xcb-util-wm' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/xcb-util-wm/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install freedesktop.org/xcb-util-wm' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +freedesktop.org/xcb-util-wm -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install freedesktop.org/xcb-util-wm' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'x.org/xcb',
    'gnu.org/m4',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.4.2',
  ] as const,
  aliases: [] as const,
}

export type FreedesktoporgxcbutilwmPackage = typeof freedesktoporgxcbutilwmPackage
