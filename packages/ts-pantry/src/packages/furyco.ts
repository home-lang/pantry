/**
 * **fury** - Gemfury CLI
 *
 * @domain `fury.co`
 * @programs `fury`
 * @version `0.23.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install fury.co`
 * @homepage https://fury.co/guide/cli
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.furyco
 * console.log(pkg.name)        // "fury"
 * console.log(pkg.description) // "Gemfury CLI"
 * console.log(pkg.programs)    // ["fury"]
 * console.log(pkg.versions[0]) // "0.23.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/fury-co.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const furycoPackage = {
  /**
   * The display name of this package.
   */
  name: 'fury' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'fury.co' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Gemfury CLI' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/fury.co/package.yml' as const,
  homepageUrl: 'https://fury.co/guide/cli' as const,
  githubUrl: 'https://github.com/gemfury/cli' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install fury.co' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +fury.co -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install fury.co' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'fury',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.21',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.23.0',
    '0.22.0',
    '0.21.0',
  ] as const,
  aliases: [] as const,
}

export type FurycoPackage = typeof furycoPackage
