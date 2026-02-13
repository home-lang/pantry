/**
 * **epstool** - Edit preview images and fix bounding boxes in EPS files
 *
 * @domain `ghostgum.com.au/epstool`
 * @programs `epstool`
 * @version `3.9.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install ghostgum.com.au/epstool`
 * @homepage http://www.ghostgum.com.au/software/epstool.htm
 * @dependencies `ghostscript.com`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.ghostgumcomauepstool
 * console.log(pkg.name)        // "epstool"
 * console.log(pkg.description) // "Edit preview images and fix bounding boxes in E..."
 * console.log(pkg.programs)    // ["epstool"]
 * console.log(pkg.versions[0]) // "3.9.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/ghostgum-com-au/epstool.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const ghostgumcomauepstoolPackage = {
  /**
   * The display name of this package.
   */
  name: 'epstool' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'ghostgum.com.au/epstool' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Edit preview images and fix bounding boxes in EPS files' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/ghostgum.com.au/epstool/package.yml' as const,
  homepageUrl: 'http://www.ghostgum.com.au/software/epstool.htm' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install ghostgum.com.au/epstool' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +ghostgum.com.au/epstool -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install ghostgum.com.au/epstool' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'epstool',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'ghostscript.com',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.9.0',
  ] as const,
  aliases: [] as const,
}

export type GhostgumcomauepstoolPackage = typeof ghostgumcomauepstoolPackage
