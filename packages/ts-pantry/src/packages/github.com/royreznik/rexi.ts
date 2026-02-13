/**
 * **rexi** - Terminal UI for Regex Testing
 *
 * @domain `github.com/royreznik/rexi`
 * @programs `rexi`
 * @version `1.2.1` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/royreznik/rexi`
 * @dependencies `pkgx.sh^1`
 * @buildDependencies `python.org@>=3.8` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomroyreznikrexi
 * console.log(pkg.name)        // "rexi"
 * console.log(pkg.description) // "Terminal UI for Regex Testing"
 * console.log(pkg.programs)    // ["rexi"]
 * console.log(pkg.versions[0]) // "1.2.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/royreznik/rexi.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rexiPackage = {
  /**
   * The display name of this package.
   */
  name: 'rexi' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/royreznik/rexi' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Terminal UI for Regex Testing' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/royreznik/rexi/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/royreznik/rexi' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/royreznik/rexi' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/royreznik/rexi -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/royreznik/rexi' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'rexi',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'pkgx.sh^1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'python.org@>=3.8',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.2.1',
    '1.2.0',
    '1.1.4',
    '1.1.3',
    '1.1.2',
  ] as const,
  aliases: [] as const,
}

export type RexiPackage = typeof rexiPackage
