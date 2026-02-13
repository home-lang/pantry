/**
 * **velero** - Backup and migrate Kubernetes applications and their persistent volumes
 *
 * @domain `velero.io`
 * @programs `velero`
 * @version `1.17.2` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install velero.io`
 * @homepage https://velero.io/
 * @buildDependencies `go.dev@~1.23.8` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.veleroio
 * console.log(pkg.name)        // "velero"
 * console.log(pkg.description) // "Backup and migrate Kubernetes applications and ..."
 * console.log(pkg.programs)    // ["velero"]
 * console.log(pkg.versions[0]) // "1.17.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/velero-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const veleroioPackage = {
  /**
   * The display name of this package.
   */
  name: 'velero' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'velero.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Backup and migrate Kubernetes applications and their persistent volumes' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/velero.io/package.yml' as const,
  homepageUrl: 'https://velero.io/' as const,
  githubUrl: 'https://github.com/vmware-tanzu/velero' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install velero.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +velero.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install velero.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'velero',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@~1.23.8',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.17.2',
    '1.17.1',
    '1.17.0',
    '1.16.2',
    '1.16.1',
  ] as const,
  aliases: [] as const,
}

export type VeleroioPackage = typeof veleroioPackage
