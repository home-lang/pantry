/**
 * **dhall** - Interpreter for the Dhall language
 *
 * @domain `dhall-lang.org`
 * @programs `dhall`
 * @version `1.42.3` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install dhall-lang.org`
 * @homepage https://dhall-lang.org/
 * @dependencies `invisible-island.net/ncurses^6.4`, `zlib.net^1.3`
 * @buildDependencies `haskell.org@~9.8`, `haskell.org/cabal` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.dhalllangorg
 * console.log(pkg.name)        // "dhall"
 * console.log(pkg.description) // "Interpreter for the Dhall language"
 * console.log(pkg.programs)    // ["dhall"]
 * console.log(pkg.versions[0]) // "1.42.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/dhall-lang-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const dhalllangorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'dhall' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'dhall-lang.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Interpreter for the Dhall language' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/dhall-lang.org/package.yml' as const,
  homepageUrl: 'https://dhall-lang.org/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install dhall-lang.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +dhall-lang.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install dhall-lang.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'dhall',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'invisible-island.net/ncurses^6.4',
    'zlib.net^1.3',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'haskell.org@~9.8',
    'haskell.org/cabal',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.42.3',
    '1.42.2',
    '1.42.1',
  ] as const,
  aliases: [] as const,
}

export type DhalllangorgPackage = typeof dhalllangorgPackage
