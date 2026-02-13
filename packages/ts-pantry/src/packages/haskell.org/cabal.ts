/**
 * **cabal** - Official upstream development repository for Cabal and cabal-install
 *
 * @domain `haskell.org/cabal`
 * @programs `cabal`
 * @version `3.8.1` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install haskell.org/cabal`
 * @homepage https://www.haskell.org/cabal/
 * @dependencies `haskell.org@9`, `gnu.org/gmp@6`, `zlib.net@1`
 * @buildDependencies `haskell.org@<9.6.4`, `curl.se`, `tukaani.org/xz@5` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.haskellorgcabal
 * console.log(pkg.name)        // "cabal"
 * console.log(pkg.description) // "Official upstream development repository for Ca..."
 * console.log(pkg.programs)    // ["cabal"]
 * console.log(pkg.versions[0]) // "3.8.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/haskell-org/cabal.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const haskellorgcabalPackage = {
  /**
   * The display name of this package.
   */
  name: 'cabal' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'haskell.org/cabal' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Official upstream development repository for Cabal and cabal-install' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/haskell.org/cabal/package.yml' as const,
  homepageUrl: 'https://www.haskell.org/cabal/' as const,
  githubUrl: 'https://github.com/haskell/cabal' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install haskell.org/cabal' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +haskell.org/cabal -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install haskell.org/cabal' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'cabal',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'haskell.org@9',
    'gnu.org/gmp@6',
    'zlib.net@1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'haskell.org@<9.6.4',
    'curl.se',
    'tukaani.org/xz@5',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.8.1',
    '3.14.2.0',
    '3.14.1.1',
    '3.14.1.0',
    '3.12.1.0',
    '3.10.3.0',
    '3.10.1',
  ] as const,
  aliases: [] as const,
}

export type HaskellorgcabalPackage = typeof haskellorgcabalPackage
