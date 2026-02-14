/**
 * **soxr.sourceforge** - pkgx package
 *
 * @domain `soxr.sourceforge.net`
 * @version `0.1.3` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install soxr.sourceforge.net`
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.soxrsourceforgenet
 * console.log(pkg.name)        // "soxr.sourceforge"
 * console.log(pkg.versions[0]) // "0.1.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/soxr-sourceforge-net.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const soxrsourceforgenetPackage = {
  /**
  * The display name of this package.
  */
  name: 'soxr.sourceforge' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'soxr.sourceforge.net' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/soxr.sourceforge.net/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install soxr.sourceforge.net' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +soxr.sourceforge.net -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install soxr.sourceforge.net' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.1.3',
  ] as const,
  aliases: [] as const,
}

export type SoxrsourceforgenetPackage = typeof soxrsourceforgenetPackage
