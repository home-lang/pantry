/**
 * **hcloud** - A command-line interface for Hetzner Cloud
 *
 * @domain `hetzner.com/hcloud`
 * @programs `hcloud`
 * @version `1.60.0` (32 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install hetzner.com/hcloud`
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.hetznercomhcloud
 * console.log(pkg.name)        // "hcloud"
 * console.log(pkg.description) // "A command-line interface for Hetzner Cloud"
 * console.log(pkg.programs)    // ["hcloud"]
 * console.log(pkg.versions[0]) // "1.60.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/hetzner-com/hcloud.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const hetznercomhcloudPackage = {
  /**
   * The display name of this package.
   */
  name: 'hcloud' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'hetzner.com/hcloud' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A command-line interface for Hetzner Cloud' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/hetzner.com/hcloud/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/hetznercloud/cli' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install hetzner.com/hcloud' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +hetzner.com/hcloud -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install hetzner.com/hcloud' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'hcloud',
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
    '1.60.0',
    '1.59.0',
    '1.58.0',
    '1.57.0',
    '1.56.0',
    '1.55.0',
    '1.54.0',
    '1.53.0',
    '1.52.0',
    '1.51.0',
    '1.50.0',
    '1.49.0',
    '1.48.0',
    '1.47.0',
    '1.46.0',
    '1.45.0',
    '1.44.2',
    '1.44.1',
    '1.44.0',
    '1.43.1',
    '1.43.0',
    '1.42.0',
    '1.41.1',
    '1.41.0',
    '1.40.0',
    '1.39.0',
    '1.38.3',
    '1.38.2',
    '1.38.1',
    '1.38.0',
    '1.37.0',
    '1.36.0',
  ] as const,
  aliases: [] as const,
}

export type HetznercomhcloudPackage = typeof hetznercomhcloudPackage
