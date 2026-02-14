/**
 * **tig** - Text interface for Git repositories
 *
 * @domain `jonas.github.io/tig`
 * @programs `tig`
 * @version `2.6.0` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install jonas.github.io/tig`
 * @homepage https://jonas.github.io/tig/
 * @dependencies `gnu.org/libiconv^1`, `invisible-island.net/ncurses^6`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.jonasgithubiotig
 * console.log(pkg.name)        // "tig"
 * console.log(pkg.description) // "Text interface for Git repositories"
 * console.log(pkg.programs)    // ["tig"]
 * console.log(pkg.versions[0]) // "2.6.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/jonas-github-io/tig.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const jonasgithubiotigPackage = {
  /**
  * The display name of this package.
  */
  name: 'tig' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'jonas.github.io/tig' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Text interface for Git repositories' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/jonas.github.io/tig/package.yml' as const,
  homepageUrl: 'https://jonas.github.io/tig/' as const,
  githubUrl: 'https://github.com/jonas/tig' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install jonas.github.io/tig' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +jonas.github.io/tig -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install jonas.github.io/tig' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'tig',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnu.org/libiconv^1',
    'invisible-island.net/ncurses^6',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.6.0',
    '2.5.12',
    '2.5.11',
    '2.5.10',
    '2.5.9',
    '2.5.8',
  ] as const,
  aliases: [] as const,
}

export type JonasgithubiotigPackage = typeof jonasgithubiotigPackage
