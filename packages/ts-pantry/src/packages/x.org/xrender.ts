/**
 * **xrender** - pkgx package
 *
 * @domain `x.org/xrender`
 * @version `0.9.12` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install x.org/xrender`
 * @dependencies `x.org/x11^1`, `x.org/protocol`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.xorgxrender
 * console.log(pkg.name)        // "xrender"
 * console.log(pkg.versions[0]) // "0.9.12" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/x-org/xrender.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xorgxrenderPackage = {
  /**
  * The display name of this package.
  */
  name: 'xrender' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'x.org/xrender' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/x.org/xrender/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install x.org/xrender' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +x.org/xrender -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install x.org/xrender' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'x.org/x11^1',
    'x.org/protocol',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.9.12',
    '0.9.11',
  ] as const,
  aliases: [] as const,
}

export type XorgxrenderPackage = typeof xorgxrenderPackage
