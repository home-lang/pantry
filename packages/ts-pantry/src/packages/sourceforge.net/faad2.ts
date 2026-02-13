/**
 * **faad** - Freeware Advanced Audio (AAC) Decoder faad2 mirror
 *
 * @domain `sourceforge.net/faad2`
 * @programs `faad`
 * @version `2.11.2` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install sourceforge.net/faad2`
 * @homepage https://sourceforge.net/projects/faac/
 * @buildDependencies `cmake.org`, `gnu.org/autoconf`, `gnu.org/automake`, ... (+2 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.sourceforgenetfaad2
 * console.log(pkg.name)        // "faad"
 * console.log(pkg.description) // "Freeware Advanced Audio (AAC) Decoder faad2 mirror"
 * console.log(pkg.programs)    // ["faad"]
 * console.log(pkg.versions[0]) // "2.11.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/sourceforge-net/faad2.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const sourceforgenetfaad2Package = {
  /**
   * The display name of this package.
   */
  name: 'faad' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'sourceforge.net/faad2' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Freeware Advanced Audio (AAC) Decoder faad2 mirror' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/sourceforge.net/faad2/package.yml' as const,
  homepageUrl: 'https://sourceforge.net/projects/faac/' as const,
  githubUrl: 'https://github.com/knik0/faad2' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install sourceforge.net/faad2' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +sourceforge.net/faad2 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install sourceforge.net/faad2' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'faad',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'cmake.org',
    'gnu.org/autoconf',
    'gnu.org/automake',
    'gnu.org/libtool',
    'linux:gnu.org/gcc',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.11.2',
    '2.11.1',
    '2.11.0',
    '2.10.1',
  ] as const,
  aliases: [] as const,
}

export type Sourceforgenetfaad2Package = typeof sourceforgenetfaad2Package
