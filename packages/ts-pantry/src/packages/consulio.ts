/**
 * **consul** - Consul is a distributed, highly available, and data center aware solution to connect and configure applications across dynamic, distributed infrastructure.
 *
 * @domain `consul.io`
 * @programs `consul`
 * @version `1.22.3` (19 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install consul.io`
 * @homepage https://www.consul.io
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.consulio
 * console.log(pkg.name)        // "consul"
 * console.log(pkg.description) // "Consul is a distributed, highly available, and ..."
 * console.log(pkg.programs)    // ["consul"]
 * console.log(pkg.versions[0]) // "1.22.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/consul-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const consulioPackage = {
  /**
   * The display name of this package.
   */
  name: 'consul' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'consul.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Consul is a distributed, highly available, and data center aware solution to connect and configure applications across dynamic, distributed infrastructure.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/consul.io/package.yml' as const,
  homepageUrl: 'https://www.consul.io' as const,
  githubUrl: 'https://github.com/hashicorp/consul' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install consul.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +consul.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install consul.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'consul',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.20',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.22.3',
    '1.22.2',
    '1.22.1',
    '1.22.0',
    '1.21.5',
    '1.21.4',
    '1.21.3',
    '1.21.2',
    '1.21.1',
    '1.21.0',
    '1.20.6',
    '1.20.5',
    '1.20.4',
    '1.20.3',
    '1.20.2',
    '1.20.1',
    '1.20.0',
    '1.19.2',
    '1.19.1',
  ] as const,
  aliases: [] as const,
}

export type ConsulioPackage = typeof consulioPackage
