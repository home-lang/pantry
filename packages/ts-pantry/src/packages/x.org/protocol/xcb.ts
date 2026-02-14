/**
 * **xcb** - pkgx package
 *
 * @domain `x.org/protocol/xcb`
 * @version `1.17.0` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install x.org/protocol/xcb`
 * @buildDependencies `python.org@~3.11` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.xorgprotocolxcb
 * console.log(pkg.name)        // "xcb"
 * console.log(pkg.versions[0]) // "1.17.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/x-org/protocol/xcb.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xorgprotocolxcbPackage = {
  /**
  * The display name of this package.
  */
  name: 'xcb' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'x.org/protocol/xcb' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/x.org/protocol/xcb/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install x.org/protocol/xcb' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +x.org/protocol/xcb -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install x.org/protocol/xcb' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'python.org@~3.11',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.17.0',
    '1.16.0',
    '1.15.2',
    '1.15.1',
    '1.15.0',
    '1.14.1',
  ] as const,
  aliases: [] as const,
}

export type XorgprotocolxcbPackage = typeof xorgprotocolxcbPackage
