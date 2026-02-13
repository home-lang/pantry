/**
 * **paper** - Library and command-line tools for configuring and getting information on paper sizes
 *
 * @domain `github.com/rrthomas/libpaper`
 * @programs `paper`
 * @version `2.2.7` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/rrthomas/libpaper`
 * @buildDependencies `gnu.org/make`, `gnu.org/help2man` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomrrthomaslibpaper
 * console.log(pkg.name)        // "paper"
 * console.log(pkg.description) // "Library and command-line tools for configuring ..."
 * console.log(pkg.programs)    // ["paper"]
 * console.log(pkg.versions[0]) // "2.2.7" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/rrthomas/libpaper.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libpaperPackage = {
  /**
   * The display name of this package.
   */
  name: 'paper' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/rrthomas/libpaper' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Library and command-line tools for configuring and getting information on paper sizes' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/rrthomas/libpaper/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/rrthomas/libpaper' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/rrthomas/libpaper' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/rrthomas/libpaper -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/rrthomas/libpaper' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'paper',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/make',
    'gnu.org/help2man',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.2.7',
    '2.2.6',
    '2.2.5',
    '2.2.4',
    '2.2.3',
    '2.1.3',
    '2.1.2',
    '2.1.1',
  ] as const,
  aliases: [] as const,
}

export type LibpaperPackage = typeof libpaperPackage
