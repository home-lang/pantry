/**
 * **xcursor** - pkgx package
 *
 * @domain `x.org/xcursor`
 * @version `1.2.3` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install x.org/xcursor`
 * @dependencies `x.org/x11`, `x.org/xfixes`, `x.org/xrender`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.xorgxcursor
 * console.log(pkg.name)        // "xcursor"
 * console.log(pkg.versions[0]) // "1.2.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/x-org/xcursor.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xorgxcursorPackage = {
  /**
  * The display name of this package.
  */
  name: 'xcursor' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'x.org/xcursor' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/x.org/xcursor/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install x.org/xcursor' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +x.org/xcursor -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install x.org/xcursor' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'x.org/x11',
    'x.org/xfixes',
    'x.org/xrender',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.2.3',
    '1.2.2',
    '1.2.1',
  ] as const,
  aliases: [] as const,
}

export type XorgxcursorPackage = typeof xorgxcursorPackage
