/**
 * **unxip** - A fast Xcode unarchiver
 *
 * @domain `github.com/saagarjha/unxip`
 * @programs `unxip`
 * @version `3.3.0` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/saagarjha/unxip`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomsaagarjhaunxip
 * console.log(pkg.name)        // "unxip"
 * console.log(pkg.description) // "A fast Xcode unarchiver"
 * console.log(pkg.programs)    // ["unxip"]
 * console.log(pkg.versions[0]) // "3.3.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/saagarjha/unxip.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const unxipPackage = {
  /**
   * The display name of this package.
   */
  name: 'unxip' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/saagarjha/unxip' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A fast Xcode unarchiver' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/saagarjha/unxip/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/saagarjha/unxip' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/saagarjha/unxip' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/saagarjha/unxip -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/saagarjha/unxip' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'unxip',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.3.0',
    '3.2.0',
    '3.1.0',
    '3.0.0',
    '2.2.0',
    '2.1.0',
  ] as const,
  aliases: [] as const,
}

export type UnxipPackage = typeof unxipPackage
