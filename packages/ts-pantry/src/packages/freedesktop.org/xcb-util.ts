/**
 * **xcb-util** - pkgx package
 *
 * @domain `freedesktop.org/xcb-util`
 * @version `0.4.1` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install freedesktop.org/xcb-util`
 * @dependencies `x.org/xcb`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.freedesktoporgxcbutil
 * console.log(pkg.name)        // "xcb-util"
 * console.log(pkg.versions[0]) // "0.4.1" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/freedesktop-org/xcb-util.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const freedesktoporgxcbutilPackage = {
  /**
  * The display name of this package.
  */
  name: 'xcb-util' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'freedesktop.org/xcb-util' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/xcb-util/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install freedesktop.org/xcb-util' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +freedesktop.org/xcb-util -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install freedesktop.org/xcb-util' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.4.1',
  ] as const,
  aliases: [] as const,
}

export type FreedesktoporgxcbutilPackage = typeof freedesktoporgxcbutilPackage
