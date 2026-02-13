/**
 * **groonga** - An embeddable fulltext search engine. Groonga is the successor project to Senna.
 *
 * @domain `groonga.org`
 * @programs `groonga`, `groonga-suggest-create-dataset`
 * @version `15.2.3` (37 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install groonga.org`
 * @homepage https://groonga.org/
 * @dependencies `darwin:taku910.github.io/mecab`, `darwin:taku910.github.io/mecab-ipadic`, `msgpack.org`, ... (+4 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `linux:curl.se` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.groongaorg
 * console.log(pkg.name)        // "groonga"
 * console.log(pkg.description) // "An embeddable fulltext search engine. Groonga i..."
 * console.log(pkg.programs)    // ["groonga", "groonga-suggest-create-dataset"]
 * console.log(pkg.versions[0]) // "15.2.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/groonga-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const groongaorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'groonga' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'groonga.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'An embeddable fulltext search engine. Groonga is the successor project to Senna.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/groonga.org/package.yml' as const,
  homepageUrl: 'https://groonga.org/' as const,
  githubUrl: 'https://github.com/groonga/groonga' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install groonga.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +groonga.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install groonga.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'groonga',
    'groonga-suggest-create-dataset',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'darwin:taku910.github.io/mecab',
    'darwin:taku910.github.io/mecab-ipadic',
    'msgpack.org',
    'openssl.org',
    'pcre.org/v2',
    'github.com/besser82/libxcrypt',
    'linux:gnome.org/glib',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'linux:curl.se',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '15.2.3',
    '15.2.1',
    '15.2.0',
    '15.1.9',
    '15.1.8',
    '15.1.7',
    '15.1.5',
    '15.1.4',
    '15.1.3',
    '15.1.2',
    '15.1.1',
    '15.0.9',
    '15.0.4',
    '15.0.3',
    '15.0.2',
    '15.0.1',
    '15.0.0',
    '14.1.3',
    '14.1.2',
    '14.1.1',
    '14.1.0',
    '14.0.9',
    '14.0.8',
    '14.0.7',
    '14.0.6',
    '14.0.5',
    '14.0.4',
    '14.0.3',
    '14.0.2',
    '14.0.1',
    '14.0.0',
    '13.1.1',
    '13.1.0',
    '13.0.9',
    '13.0.8',
    '13.0.7',
    '13.0.6',
  ] as const,
  aliases: [] as const,
}

export type GroongaorgPackage = typeof groongaorgPackage
