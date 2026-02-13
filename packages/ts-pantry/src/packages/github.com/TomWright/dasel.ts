/**
 * **dasel** - Select, put and delete data from JSON, TOML, YAML, XML and CSV files with a single tool. Supports conversion between formats and can be used as a Go package.
 *
 * @domain `github.com/TomWright/dasel`
 * @programs `dasel`
 * @version `3.2.1` (14 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/TomWright/dasel`
 * @homepage https://daseldocs.tomwright.me
 * @buildDependencies `go.dev@^1` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomtomwrightdasel
 * console.log(pkg.name)        // "dasel"
 * console.log(pkg.description) // "Select, put and delete data from JSON, TOML, YA..."
 * console.log(pkg.programs)    // ["dasel"]
 * console.log(pkg.versions[0]) // "3.2.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/TomWright/dasel.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const daselPackage = {
  /**
   * The display name of this package.
   */
  name: 'dasel' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/TomWright/dasel' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Select, put and delete data from JSON, TOML, YAML, XML and CSV files with a single tool. Supports conversion between formats and can be used as a Go package.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/TomWright/dasel/package.yml' as const,
  homepageUrl: 'https://daseldocs.tomwright.me' as const,
  githubUrl: 'https://github.com/TomWright/dasel' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/TomWright/dasel' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/TomWright/dasel -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/TomWright/dasel' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'dasel',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.2.1',
    '3.2.0',
    '3.1.5',
    '3.1.3',
    '3.1.2',
    '3.1.1',
    '3.1.0',
    '3.0.0',
    '2.8.1',
    '2.8.0',
    '2.7.0',
    '2.6.0',
    '2.5.0',
    '2.4.1',
  ] as const,
  aliases: [] as const,
}

export type DaselPackage = typeof daselPackage
