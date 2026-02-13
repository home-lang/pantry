/**
 * **gollum** - An n:m message multiplexer written in Go
 *
 * @domain `github.com/gollum/gollum`
 * @programs `gollum`
 * @version `6.1.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/gollum/gollum`
 * @homepage https://gollum.readthedocs.io/en/latest/
 * @dependencies `ruby-lang.org^3.1`, `rubygems.org~3.3`
 * @buildDependencies `cmake.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomgollumgollum
 * console.log(pkg.name)        // "gollum"
 * console.log(pkg.description) // "An n:m message multiplexer written in Go"
 * console.log(pkg.programs)    // ["gollum"]
 * console.log(pkg.versions[0]) // "6.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/gollum/gollum.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gollumPackage = {
  /**
   * The display name of this package.
   */
  name: 'gollum' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/gollum/gollum' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'An n:m message multiplexer written in Go' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/gollum/gollum/package.yml' as const,
  homepageUrl: 'https://gollum.readthedocs.io/en/latest/' as const,
  githubUrl: 'https://github.com/trivago/gollum' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/gollum/gollum' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/gollum/gollum -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/gollum/gollum' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'gollum',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'ruby-lang.org^3.1',
    'rubygems.org~3.3',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org@^3',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '6.1.0',
    '6.0.1',
    '6.0.0',
    '5.3.2',
  ] as const,
  aliases: [] as const,
}

export type GollumPackage = typeof gollumPackage
