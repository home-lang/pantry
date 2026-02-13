/**
 * **unicode** - The home of the ICU project source code.
 *
 * @domain `unicode.org`
 * @programs `derb`, `genbrk`, `gencfu`, `gencnval`, `gendict`, ... (+7 more)
 * @version `78.2.0` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install unicode.org`
 * @homepage https://icu.unicode.org/
 * @buildDependencies `curl.se`, `darwin:llvm.org@20` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.unicodeorg
 * console.log(pkg.name)        // "unicode"
 * console.log(pkg.description) // "The home of the ICU project source code."
 * console.log(pkg.programs)    // ["derb", "genbrk", ...]
 * console.log(pkg.versions[0]) // "78.2.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/unicode-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const unicodeorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'unicode' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'unicode.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The home of the ICU project source code.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/unicode.org/package.yml' as const,
  homepageUrl: 'https://icu.unicode.org/' as const,
  githubUrl: 'https://github.com/unicode-org/icu' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install unicode.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +unicode.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install unicode.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'derb',
    'genbrk',
    'gencfu',
    'gencnval',
    'gendict',
    'genrb',
    'icu-config',
    'icuexportdata',
    'icuinfo',
    'makeconv',
    'pkgdata',
    'uconv',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'curl.se',
    'darwin:llvm.org@20',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '78.2.0',
    '78.1.0',
    '77.1.0',
    '76.1.0',
    '75.1.0',
    '74.2.0',
    '74.1.0',
    '73.2.0',
    '71.1.0',
  ] as const,
  aliases: [] as const,
}

export type UnicodeorgPackage = typeof unicodeorgPackage
