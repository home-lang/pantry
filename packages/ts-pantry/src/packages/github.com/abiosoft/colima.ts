/**
 * **colima** - Container runtimes on macOS (and Linux) with minimal setup
 *
 * @domain `github.com/abiosoft/colima`
 * @programs `colima`
 * @version `0.9.1` (27 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/abiosoft/colima`
 * @dependencies `lima-vm.io`
 * @buildDependencies `go.dev` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomabiosoftcolima
 * console.log(pkg.name)        // "colima"
 * console.log(pkg.description) // "Container runtimes on macOS (and Linux) with mi..."
 * console.log(pkg.programs)    // ["colima"]
 * console.log(pkg.versions[0]) // "0.9.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/abiosoft/colima.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const colimaPackage = {
  /**
   * The display name of this package.
   */
  name: 'colima' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/abiosoft/colima' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Container runtimes on macOS (and Linux) with minimal setup' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/abiosoft/colima/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/abiosoft/colima' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/abiosoft/colima' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/abiosoft/colima -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/abiosoft/colima' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'colima',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'lima-vm.io',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.9.1',
    '0.9.0',
    '0.8.4',
    '0.8.3',
    '0.8.2',
    '0.8.1',
    '0.8.0',
    '0.7.6',
    '0.7.5',
    '0.7.4',
    '0.7.3',
    '0.7.2',
    '0.7.1',
    '0.7.0',
    '0.6.10',
    '0.6.9',
    '0.6.8',
    '0.6.7',
    '0.6.6',
    '0.6.5',
    '0.6.4',
    '0.6.3',
    '0.6.2',
    '0.6.1',
    '0.6.0',
    '0.5.6',
    '0.5.5',
  ] as const,
  aliases: [] as const,
}

export type ColimaPackage = typeof colimaPackage
