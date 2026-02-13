/**
 * **air** - ☁️ Live reload for Go apps
 *
 * @domain `github.com/cosmtrek/air`
 * @programs `air`
 * @version `1.64.3` (30 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/cosmtrek/air`
 * @buildDependencies `go.dev@^1.22` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomcosmtrekair
 * console.log(pkg.name)        // "air"
 * console.log(pkg.description) // "☁️ Live reload for Go apps"
 * console.log(pkg.programs)    // ["air"]
 * console.log(pkg.versions[0]) // "1.64.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/cosmtrek/air.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const airPackage = {
  /**
   * The display name of this package.
   */
  name: 'air' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/cosmtrek/air' as const,
  /**
   * Brief description of what this package does.
   */
  description: '☁️ Live reload for Go apps' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/cosmtrek/air/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/cosmtrek/air' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/cosmtrek/air' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/cosmtrek/air -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/cosmtrek/air' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'air',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.22',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.64.3',
    '1.64.2',
    '1.64.1',
    '1.64.0',
    '1.63.9',
    '1.63.8',
    '1.63.7',
    '1.63.6',
    '1.63.5',
    '1.63.4',
    '1.63.3',
    '1.63.2',
    '1.63.1',
    '1.63.0',
    '1.62.0',
    '1.61.7',
    '1.61.6',
    '1.61.5',
    '1.61.4',
    '1.61.3',
    '1.61.1',
    '1.61.0',
    '1.60.0',
    '1.52.3',
    '1.52.2',
    '1.52.1',
    '1.52.0',
    '1.51.0',
    '1.50.0',
    '1.49.0',
  ] as const,
  aliases: [] as const,
}

export type AirPackage = typeof airPackage
