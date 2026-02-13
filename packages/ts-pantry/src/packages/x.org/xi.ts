/**
 * **xi** - pkgx package
 *
 * @domain `x.org/xi`
 * @version `1.8.2` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install x.org/xi`
 * @dependencies `x.org/x11`, `x.org/protocol`, `x.org/xfixes`, ... (+1 more)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.xorgxi
 * console.log(pkg.name)        // "xi"
 * console.log(pkg.versions[0]) // "1.8.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/x-org/xi.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xorgxiPackage = {
  /**
   * The display name of this package.
   */
  name: 'xi' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'x.org/xi' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/x.org/xi/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install x.org/xi' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +x.org/xi -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install x.org/xi' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'x.org/x11',
    'x.org/protocol',
    'x.org/xfixes',
    'x.org/exts',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.8.2',
    '1.8.1',
  ] as const,
  aliases: [] as const,
}

export type XorgxiPackage = typeof xorgxiPackage
