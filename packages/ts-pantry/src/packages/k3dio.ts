/**
 * **k3d** - Little helper to run CNCF's k3s in Docker
 *
 * @domain `k3d.io`
 * @programs `k3d`
 * @version `5.8.3` (17 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install k3d.io`
 * @homepage https://k3d.io
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.k3dio
 * console.log(pkg.name)        // "k3d"
 * console.log(pkg.description) // "Little helper to run CNCF's k3s in Docker"
 * console.log(pkg.programs)    // ["k3d"]
 * console.log(pkg.versions[0]) // "5.8.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/k3d-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const k3dioPackage = {
  /**
   * The display name of this package.
   */
  name: 'k3d' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'k3d.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Little helper to run CNCF\'s k3s in Docker' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/k3d.io/package.yml' as const,
  homepageUrl: 'https://k3d.io' as const,
  githubUrl: 'https://github.com/k3d-io/k3d' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install k3d.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +k3d.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install k3d.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'k3d',
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
    '5.8.3',
    '5.8.2',
    '5.8.1',
    '5.8.0',
    '5.7.5',
    '5.7.4',
    '5.7.3',
    '5.7.2',
    '5.7.1',
    '5.7.0',
    '5.6.3',
    '5.6.2',
    '5.6.0',
    '5.5.2',
    '5.5.1',
    '5.5.0',
    '5.4.9',
  ] as const,
  aliases: [] as const,
}

export type K3dioPackage = typeof k3dioPackage
