/**
 * **pandoc-crossref** - Pandoc filter for numbering and cross-referencing
 *
 * @domain `pandoc.org/crossref`
 * @programs `pandoc-crossref`
 * @version `0.3.22` (10 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install pandoc.org/crossref`
 * @homepage https://lierdakil.github.io/pandoc-crossref/
 * @dependencies `pandoc.org^3.8`, `zlib.net@1`, `gnu.org/gmp@6`
 * @buildDependencies `haskell.org@~9.8.4`, `haskell.org/cabal@^3`, `openssl.org@^1.1` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pandocorgcrossref
 * console.log(pkg.name)        // "pandoc-crossref"
 * console.log(pkg.description) // "Pandoc filter for numbering and cross-referencing"
 * console.log(pkg.programs)    // ["pandoc-crossref"]
 * console.log(pkg.versions[0]) // "0.3.22" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pandoc-org/crossref.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pandocorgcrossrefPackage = {
  /**
   * The display name of this package.
   */
  name: 'pandoc-crossref' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'pandoc.org/crossref' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Pandoc filter for numbering and cross-referencing' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pandoc.org/crossref/package.yml' as const,
  homepageUrl: 'https://lierdakil.github.io/pandoc-crossref/' as const,
  githubUrl: 'https://github.com/lierdakil/pandoc-crossref' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install pandoc.org/crossref' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pandoc.org/crossref -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install pandoc.org/crossref' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'pandoc-crossref',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'pandoc.org^3.8',
    'zlib.net@1',
    'gnu.org/gmp@6',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'haskell.org@~9.8.4',
    'haskell.org/cabal@^3',
    'openssl.org@^1.1',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.3.22',
    '0.3.21',
    '0.3.20',
    '0.3.19',
    '0.3.18.2',
    '0.3.18.1',
    '0.3.17.1',
    '0.3.17.0',
    '0.3.16.0',
    '0.3.15.2',
  ] as const,
  aliases: [] as const,
}

export type PandocorgcrossrefPackage = typeof pandocorgcrossrefPackage
