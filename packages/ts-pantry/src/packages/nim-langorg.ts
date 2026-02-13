/**
 * **nim-lang** - Nim is a statically typed compiled systems programming language. It combines successful concepts from mature languages like Python, Ada and Modula. Its design focuses on efficiency, expressiveness, and elegance (in that order of priority).
 *
 * @domain `nim-lang.org`
 * @programs `nim`, `nim_dbg`, `testament`, `nimsuggest`, `nimgrep`, ... (+4 more)
 * @version `2.2.6` (16 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install nim-lang.org`
 * @homepage https://nim-lang.org
 * @dependencies `gnu.org/gcc`, `pcre.org`, `openssl.org`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.nimlangorg
 * console.log(pkg.name)        // "nim-lang"
 * console.log(pkg.description) // "Nim is a statically typed compiled systems prog..."
 * console.log(pkg.programs)    // ["nim", "nim_dbg", ...]
 * console.log(pkg.versions[0]) // "2.2.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/nim-lang-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const nimlangorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'nim-lang' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'nim-lang.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Nim is a statically typed compiled systems programming language. It combines successful concepts from mature languages like Python, Ada and Modula. Its design focuses on efficiency, expressiveness, and elegance (in that order of priority).' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/nim-lang.org/package.yml' as const,
  homepageUrl: 'https://nim-lang.org' as const,
  githubUrl: 'https://github.com/nim-lang/Nim' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install nim-lang.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +nim-lang.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install nim-lang.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'nim',
    'nim_dbg',
    'testament',
    'nimsuggest',
    'nimgrep',
    'nim-gdb',
    'atlas',
    'nimpretty',
    'nimble',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnu.org/gcc',
    'pcre.org',
    'openssl.org',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.2.6',
    '2.2.4',
    '2.2.2',
    '2.2.0',
    '2.0.16',
    '2.0.14',
    '2.0.12',
    '2.0.8',
    '2.0.6',
    '2.0.4',
    '2.0.2',
    '2.0.0',
    '1.6.20',
    '1.6.18',
    '1.6.16',
    '1.6.14',
  ] as const,
  aliases: [] as const,
}

export type NimlangorgPackage = typeof nimlangorgPackage
