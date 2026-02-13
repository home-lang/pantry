/**
 * **ruby** - Powerful, clean, object-oriented scripting language
 *
 * @domain `ruby-lang.org`
 * @programs `erb`, `irb`, `rake`, `rdoc`, `ri`, ... (+1 more)
 * @version `4.0.1` (52 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install ruby-lang.org`
 * @aliases `ruby`
 * @homepage https://www.ruby-lang.org/
 * @dependencies `openssl.org^1.1`, `pyyaml.org^0.2`, `zlib.net^1`
 * @buildDependencies `gnu.org/gettext@^0.21`, `gnu.org/patch`, `gnu.org/bison@^3`, ... (+3 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * // Access via alias (recommended)
 * const pkg = pantry.ruby
 * // Or access via domain
 * const samePkg = pantry.rubylangorg
 * console.log(pkg === samePkg) // true
 * console.log(pkg.name)        // "ruby-lang"
 * console.log(pkg.description) // "Powerful, clean, object-oriented scripting lang..."
 * console.log(pkg.programs)    // ["erb", "irb", ...]
 * console.log(pkg.versions[0]) // "4.0.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/ruby-lang-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rubyPackage = {
  /**
   * The display name of this package.
   */
  name: 'ruby-lang' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'ruby-lang.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Powerful, clean, object-oriented scripting language' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/ruby-lang.org/package.yml' as const,
  homepageUrl: 'https://www.ruby-lang.org/' as const,
  githubUrl: 'https://github.com/ruby/ruby' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install ruby-lang.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +ruby-lang.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install ruby-lang.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'erb',
    'irb',
    'rake',
    'rdoc',
    'ri',
    'ruby',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openssl.org^1.1',
    'pyyaml.org^0.2',
    'zlib.net^1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'gnu.org/gettext@^0.21',
    'gnu.org/patch',
    'gnu.org/bison@^3',
    'gnu.org/autoconf',
    'rsync.samba.org',
    'linux:rubygems.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.0.1',
    '4.0.0',
    '3.4.8',
    '3.4.7',
    '3.4.6',
    '3.4.5',
    '3.4.4',
    '3.4.3',
    '3.4.2',
    '3.4.1',
    '3.3.10',
    '3.3.9',
    '3.3.8',
    '3.3.7',
    '3.3.6',
    '3.3.5',
    '3.3.4',
    '3.3.3',
    '3.3.2',
    '3.3.1',
    '3.3.0',
    '3.2.10',
    '3.2.9',
    '3.2.8',
    '3.2.7',
    '3.2.6',
    '3.2.5',
    '3.2.4',
    '3.2.3',
    '3.2.2',
    '3.2.1',
    '3.2.0',
    '3.1.7',
    '3.1.6',
    '3.1.5',
    '3.1.4',
    '3.1.3',
    '3.1.2',
    '3.1.1',
    '3.1.0',
    '3.0.7',
    '3.0.6',
    '3.0.5',
    '3.0.4',
    '3.0.3',
    '3.0.2',
    '3.0.1',
    '3.0.0',
    '2.7.8',
    '2.7.6',
    '2.6.10',
    '2.5.9',
  ] as const,
  /**
   * Alternative names for this package.
   * You can use any of these names to access the package.
   */
  aliases: [
    'ruby',
  ] as const,
}

export type RubyPackage = typeof rubyPackage
