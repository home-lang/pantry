/**
 * **syncthing** - Open source continuous file synchronization application
 *
 * @domain `syncthing.net`
 * @programs `syncthing`
 * @version `2.0.13` (34 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install syncthing.net`
 * @homepage https://syncthing.net/
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.syncthingnet
 * console.log(pkg.name)        // "syncthing"
 * console.log(pkg.description) // "Open source continuous file synchronization app..."
 * console.log(pkg.programs)    // ["syncthing"]
 * console.log(pkg.versions[0]) // "2.0.13" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/syncthing-net.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const syncthingnetPackage = {
  /**
   * The display name of this package.
   */
  name: 'syncthing' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'syncthing.net' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Open source continuous file synchronization application' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/syncthing.net/package.yml' as const,
  homepageUrl: 'https://syncthing.net/' as const,
  githubUrl: 'https://github.com/syncthing/syncthing' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install syncthing.net' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +syncthing.net -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install syncthing.net' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'syncthing',
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
    '2.0.13',
    '2.0.12',
    '2.0.11',
    '2.0.10',
    '2.0.9',
    '2.0.8',
    '2.0.7',
    '2.0.6',
    '2.0.5',
    '2.0.4',
    '2.0.3',
    '2.0.2',
    '2.0.1',
    '2.0.0',
    '1.30.0',
    '1.29.7',
    '1.29.6',
    '1.29.5',
    '1.29.4',
    '1.29.3',
    '1.29.2',
    '1.29.1',
    '1.29.0',
    '1.28.1',
    '1.28.0',
    '1.27.12',
    '1.27.11',
    '1.27.10',
    '1.27.9',
    '1.27.8',
    '1.27.7',
    '1.27.6',
    '1.27.5',
    '1.27.4',
  ] as const,
  aliases: [] as const,
}

export type SyncthingnetPackage = typeof syncthingnetPackage
