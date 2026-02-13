/**
 * **pandoc** - Swiss-army knife of markup format conversion
 *
 * @domain `pandoc.org`
 * @programs `pandoc`
 * @version `3.8.3` (36 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install pandoc.org`
 * @homepage https://pandoc.org/
 * @dependencies `gnu.org/gmp@6`, `zlib.net@1`, `sourceware.org/libffi@3`
 * @buildDependencies `haskell.org@~9.4`, `haskell.org/cabal@~3.10`, `linux:gnu.org/binutils@~2.44` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pandocorg
 * console.log(pkg.name)        // "pandoc"
 * console.log(pkg.description) // "Swiss-army knife of markup format conversion"
 * console.log(pkg.programs)    // ["pandoc"]
 * console.log(pkg.versions[0]) // "3.8.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pandoc-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pandocorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'pandoc' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'pandoc.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Swiss-army knife of markup format conversion' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pandoc.org/package.yml' as const,
  homepageUrl: 'https://pandoc.org/' as const,
  githubUrl: 'https://github.com/jgm/pandoc' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install pandoc.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pandoc.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install pandoc.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'pandoc',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnu.org/gmp@6',
    'zlib.net@1',
    'sourceware.org/libffi@3',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'haskell.org@~9.4',
    'haskell.org/cabal@~3.10',
    'linux:gnu.org/binutils@~2.44',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.8.3',
    '3.8.2.1',
    '3.8.2',
    '3.8.1',
    '3.8.0',
    '3.7.0.2',
    '3.7.0.1',
    '3.7.0',
    '3.6.4',
    '3.6.3',
    '3.6.2',
    '3.6.1',
    '3.6.0',
    '3.5.0',
    '3.4.0',
    '3.3.0',
    '3.2.1',
    '3.2.0',
    '3.1.13',
    '3.1.12.3',
    '3.1.12.2',
    '3.1.12.1',
    '3.1.12',
    '3.1.11.1',
    '3.1.11',
    '3.1.10',
    '3.1.9',
    '3.1.8',
    '3.1.7',
    '3.1.6.2',
    '3.1.6',
    '3.1.5',
    '3.1.4',
    '3.1.3',
    '3.1.2',
    '2.19.2',
  ] as const,
  aliases: [] as const,
}

export type PandocorgPackage = typeof pandocorgPackage
