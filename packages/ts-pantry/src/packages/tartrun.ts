/**
 * **tart** - macOS and Linux VMs on Apple Silicon to use in CI and other automations
 *
 * @domain `tart.run`
 * @programs `tart`
 * @version `2.30.1` (65 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install tart.run`
 * @homepage https://tart.run
 * @buildDependencies `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.tartrun
 * console.log(pkg.name)        // "tart"
 * console.log(pkg.description) // "macOS and Linux VMs on Apple Silicon to use in ..."
 * console.log(pkg.programs)    // ["tart"]
 * console.log(pkg.versions[0]) // "2.30.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/tart-run.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const tartrunPackage = {
  /**
   * The display name of this package.
   */
  name: 'tart' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'tart.run' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'macOS and Linux VMs on Apple Silicon to use in CI and other automations' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/tart.run/package.yml' as const,
  homepageUrl: 'https://tart.run' as const,
  githubUrl: 'https://github.com/cirruslabs/tart' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install tart.run' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +tart.run -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install tart.run' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'tart',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'curl.se',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.30.1',
    '2.30.0',
    '2.29.0',
    '2.28.6',
    '2.28.5',
    '2.28.4',
    '2.28.3',
    '2.28.2',
    '2.28.1',
    '2.28.0',
    '2.27.3',
    '2.27.2',
    '2.27.1',
    '2.27.0',
    '2.26.1',
    '2.26.0',
    '2.25.0',
    '2.24.1',
    '2.24.0',
    '2.23.0',
    '2.22.4',
    '2.22.3',
    '2.22.2',
    '2.22.0',
    '2.21.0',
    '2.20.2',
    '2.20.1',
    '2.20.0',
    '2.19.3',
    '2.19.2',
    '2.19.1',
    '2.19.0',
    '2.18.5',
    '2.18.4',
    '2.18.3',
    '2.18.2',
    '2.18.1',
    '2.18.0',
    '2.17.0',
    '2.16.0',
    '2.15.0',
    '2.14.0',
    '2.13.0',
    '2.12.0',
    '2.11.1',
    '2.11.0',
    '2.10.0',
    '2.9.1',
    '2.9.0',
    '2.8.1',
    '2.8.0',
    '2.7.2',
    '2.7.1',
    '2.7.0',
    '2.6.1',
    '2.6.0',
    '2.4.4',
    '2.4.3',
    '2.4.2',
    '2.4.1',
    '2.4.0',
    '2.3.0',
    '2.2.1',
    '2.2.0',
    '0.38.0',
  ] as const,
  aliases: [] as const,
}

export type TartrunPackage = typeof tartrunPackage
