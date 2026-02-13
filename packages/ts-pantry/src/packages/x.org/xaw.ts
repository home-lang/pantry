/**
 * **xaw** - pkgx package
 *
 * @domain `x.org/xaw`
 * @version `1.0.16` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install x.org/xaw`
 * @dependencies `x.org/x11`, `x.org/exts`, `x.org/xmu`, ... (+2 more)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.xorgxaw
 * console.log(pkg.name)        // "xaw"
 * console.log(pkg.versions[0]) // "1.0.16" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/x-org/xaw.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xorgxawPackage = {
  /**
   * The display name of this package.
   */
  name: 'xaw' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'x.org/xaw' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/x.org/xaw/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install x.org/xaw' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +x.org/xaw -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install x.org/xaw' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'x.org/x11',
    'x.org/exts',
    'x.org/xmu',
    'x.org/xt',
    'x.org/xpm',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.0.16',
    '1.0.15',
  ] as const,
  aliases: [] as const,
}

export type XorgxawPackage = typeof xorgxawPackage
