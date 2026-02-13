/**
 * **libde265** - Open h.265 video codec implementation.
 *
 * @domain `github.com/strukturag/libde265`
 * @programs `acceleration_speed`, `bjoentegaard`, `block-rate-estim`, `gen-enc-table`, `rd-curves`, ... (+2 more)
 * @version `1.0.16` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/strukturag/libde265`
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/automake` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomstrukturaglibde265
 * console.log(pkg.name)        // "libde265"
 * console.log(pkg.description) // "Open h.265 video codec implementation."
 * console.log(pkg.programs)    // ["acceleration_speed", "bjoentegaard", ...]
 * console.log(pkg.versions[0]) // "1.0.16" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/strukturag/libde265.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libde265Package = {
  /**
   * The display name of this package.
   */
  name: 'libde265' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/strukturag/libde265' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Open h.265 video codec implementation.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/strukturag/libde265/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/strukturag/libde265' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/strukturag/libde265' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/strukturag/libde265 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/strukturag/libde265' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'acceleration_speed',
    'bjoentegaard',
    'block-rate-estim',
    'gen-enc-table',
    'rd-curves',
    'tests',
    'yuv-distortion',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/autoconf',
    'gnu.org/automake',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.0.16',
    '1.0.15',
    '1.0.14',
    '1.0.13',
    '1.0.12',
    '1.0.11',
  ] as const,
  aliases: [] as const,
}

export type Libde265Package = typeof libde265Package
