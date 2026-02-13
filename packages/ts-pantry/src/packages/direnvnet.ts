/**
 * **direnv** - Load/unload environment variables based on $PWD
 *
 * @domain `direnv.net`
 * @programs `direnv`
 * @version `2.37.1` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install direnv.net`
 * @homepage https://direnv.net/
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.direnvnet
 * console.log(pkg.name)        // "direnv"
 * console.log(pkg.description) // "Load/unload environment variables based on $PWD"
 * console.log(pkg.programs)    // ["direnv"]
 * console.log(pkg.versions[0]) // "2.37.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/direnv-net.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const direnvnetPackage = {
  /**
   * The display name of this package.
   */
  name: 'direnv' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'direnv.net' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Load/unload environment variables based on $PWD' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/direnv.net/package.yml' as const,
  homepageUrl: 'https://direnv.net/' as const,
  githubUrl: 'https://github.com/direnv/direnv' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install direnv.net' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +direnv.net -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install direnv.net' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'direnv',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.18',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.37.1',
    '2.37.0',
    '2.36.0',
    '2.35.0',
    '2.34.0',
    '2.33.0',
    '2.32.3',
    '2.32.2',
  ] as const,
  aliases: [] as const,
}

export type DirenvnetPackage = typeof direnvnetPackage
