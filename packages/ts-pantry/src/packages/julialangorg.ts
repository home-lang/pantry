/**
 * **julia** - The Julia Programming Language
 *
 * @domain `julialang.org`
 * @programs `julia`
 * @version `1.12.4` (27 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install julialang.org`
 * @homepage https://julialang.org/
 * @buildDependencies `curl.se`, `gnu.org/tar` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.julialangorg
 * console.log(pkg.name)        // "julia"
 * console.log(pkg.description) // "The Julia Programming Language"
 * console.log(pkg.programs)    // ["julia"]
 * console.log(pkg.versions[0]) // "1.12.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/julialang-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const julialangorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'julia' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'julialang.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The Julia Programming Language' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/julialang.org/package.yml' as const,
  homepageUrl: 'https://julialang.org/' as const,
  githubUrl: 'https://github.com/JuliaLang/julia' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install julialang.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +julialang.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install julialang.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'julia',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'curl.se',
    'gnu.org/tar',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.12.4',
    '1.12.3',
    '1.12.2',
    '1.12.1',
    '1.12.0',
    '1.11.8',
    '1.11.7',
    '1.11.6',
    '1.11.5',
    '1.11.4',
    '1.11.3',
    '1.11.2',
    '1.11.1',
    '1.11.0',
    '1.10.10',
    '1.10.9',
    '1.10.8',
    '1.10.7',
    '1.10.6',
    '1.10.5',
    '1.10.4',
    '1.10.3',
    '1.10.2',
    '1.10.1',
    '1.10.0',
    '1.9.4',
    '1.9.3',
  ] as const,
  aliases: [] as const,
}

export type JulialangorgPackage = typeof julialangorgPackage
