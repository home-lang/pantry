/**
 * **zimg** - Scaling, colorspace conversion, and dithering library
 *
 * @domain `github.com/sekrit-twc/zimg`
 * @version `3.0.6` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/sekrit-twc/zimg`
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/automake`, `gnu.org/libtool` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomsekrittwczimg
 * console.log(pkg.name)        // "zimg"
 * console.log(pkg.description) // "Scaling, colorspace conversion, and dithering l..."
 * console.log(pkg.versions[0]) // "3.0.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/sekrit-twc/zimg.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const zimgPackage = {
  /**
   * The display name of this package.
   */
  name: 'zimg' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/sekrit-twc/zimg' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Scaling, colorspace conversion, and dithering library' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/sekrit-twc/zimg/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/sekrit-twc/zimg' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/sekrit-twc/zimg' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/sekrit-twc/zimg -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/sekrit-twc/zimg' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/autoconf',
    'gnu.org/automake',
    'gnu.org/libtool',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.0.6',
    '3.0.5',
    '3.0.4',
  ] as const,
  aliases: [] as const,
}

export type ZimgPackage = typeof zimgPackage
