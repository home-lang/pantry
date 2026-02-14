/**
 * **xcb** - pkgx package
 *
 * @domain `x.org/xcb`
 * @version `1.17.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install x.org/xcb`
 * @dependencies `x.org/xau^1`, `x.org/xdmcp^1`
 * @buildDependencies `python.org@~3.11`, `x.org/protocol/xcb@^1`, `gnu.org/patch` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.xorgxcb
 * console.log(pkg.name)        // "xcb"
 * console.log(pkg.versions[0]) // "1.17.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/x-org/xcb.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xorgxcbPackage = {
  /**
  * The display name of this package.
  */
  name: 'xcb' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'x.org/xcb' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/x.org/xcb/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install x.org/xcb' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +x.org/xcb -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install x.org/xcb' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'x.org/xau^1',
    'x.org/xdmcp^1',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'python.org@~3.11',
    'x.org/protocol/xcb@^1',
    'gnu.org/patch',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.17.0',
    '1.16.1',
    '1.16.0',
    '1.15.0',
  ] as const,
  aliases: [] as const,
}

export type XorgxcbPackage = typeof xorgxcbPackage
