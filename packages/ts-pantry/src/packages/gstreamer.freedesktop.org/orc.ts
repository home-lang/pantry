/**
 * **orc** - Oil Runtime Compiler (ORC)
 *
 * @domain `gstreamer.freedesktop.org/orc`
 * @programs `orcc`, `orc-bugreport`
 * @version `0.4.42` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gstreamer.freedesktop.org/orc`
 * @homepage https://gstreamer.freedesktop.org/projects/orc.html
 * @buildDependencies `mesonbuild.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gstreamerfreedesktoporgorc
 * console.log(pkg.name)        // "orc"
 * console.log(pkg.description) // "Oil Runtime Compiler (ORC)"
 * console.log(pkg.programs)    // ["orcc", "orc-bugreport"]
 * console.log(pkg.versions[0]) // "0.4.42" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gstreamer-freedesktop-org/orc.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gstreamerfreedesktoporgorcPackage = {
  /**
   * The display name of this package.
   */
  name: 'orc' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gstreamer.freedesktop.org/orc' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Oil Runtime Compiler (ORC)' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gstreamer.freedesktop.org/orc/package.yml' as const,
  homepageUrl: 'https://gstreamer.freedesktop.org/projects/orc.html' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gstreamer.freedesktop.org/orc' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gstreamer.freedesktop.org/orc -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gstreamer.freedesktop.org/orc' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'orcc',
    'orc-bugreport',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'mesonbuild.com',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.4.42',
    '0.4.41',
    '0.4.40',
    '0.4.39',
    '0.4.38',
    '0.4.37',
    '0.4.36',
    '0.4.35',
    '0.4.34',
  ] as const,
  aliases: [] as const,
}

export type GstreamerfreedesktoporgorcPackage = typeof gstreamerfreedesktoporgorcPackage
