/**
 * **shout** - Data and connectivity library for the icecast server
 *
 * @domain `xiph.org/libshout`
 * @programs `shout`
 * @version `2.4.6` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install xiph.org/libshout`
 * @homepage https://icecast.org/
 * @dependencies `xiph.org/ogg`, `xiph.org/vorbis`, `openssl.org~1`, ... (+2 more)
 * @buildDependencies `darwin:curl.se`, `darwin:gnu.org/patch`, `linux:gnu.org/gcc` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.xiphorglibshout
 * console.log(pkg.name)        // "shout"
 * console.log(pkg.description) // "Data and connectivity library for the icecast s..."
 * console.log(pkg.programs)    // ["shout"]
 * console.log(pkg.versions[0]) // "2.4.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/xiph-org/libshout.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xiphorglibshoutPackage = {
  /**
   * The display name of this package.
   */
  name: 'shout' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'xiph.org/libshout' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Data and connectivity library for the icecast server' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/xiph.org/libshout/package.yml' as const,
  homepageUrl: 'https://icecast.org/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install xiph.org/libshout' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +xiph.org/libshout -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install xiph.org/libshout' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'shout',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'xiph.org/ogg',
    'xiph.org/vorbis',
    'openssl.org~1',
    'speex.org',
    'theora.org',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'darwin:curl.se',
    'darwin:gnu.org/patch',
    'linux:gnu.org/gcc',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.4.6',
  ] as const,
  aliases: [] as const,
}

export type XiphorglibshoutPackage = typeof xiphorglibshoutPackage
