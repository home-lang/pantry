/**
 * **doctl** - The official command line interface for the DigitalOcean API.
 *
 * @domain `digitalocean.com/doctl`
 * @programs `doctl`
 * @version `2.59.3` (54 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install digitalocean.com/doctl`
 * @homepage https://docs.digitalocean.com/reference/doctl/
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.digitaloceancomdoctl
 * console.log(pkg.name)        // "doctl"
 * console.log(pkg.description) // "The official command line interface for the Dig..."
 * console.log(pkg.programs)    // ["doctl"]
 * console.log(pkg.versions[0]) // "2.59.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/digitalocean-com/doctl.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const digitaloceancomdoctlPackage = {
  /**
   * The display name of this package.
   */
  name: 'doctl' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'digitalocean.com/doctl' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The official command line interface for the DigitalOcean API.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/digitalocean.com/doctl/package.yml' as const,
  homepageUrl: 'https://docs.digitalocean.com/reference/doctl/' as const,
  githubUrl: 'https://github.com/digitalocean/doctl' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install digitalocean.com/doctl' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +digitalocean.com/doctl -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install digitalocean.com/doctl' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'doctl',
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
    '2.59.3',
    '2.59.2',
    '1.149.0',
    '1.148.0',
    '1.147.0',
    '1.146.0',
    '1.145.0',
    '1.144.0',
    '1.143.0',
    '1.142.0',
    '1.141.0',
    '1.140.0',
    '1.139.0',
    '1.138.0',
    '1.137.0',
    '1.136.0',
    '1.135.0',
    '1.134.0',
    '1.133.0',
    '1.132.0',
    '1.131.0',
    '1.130.0',
    '1.129.0',
    '1.128.0',
    '1.127.0',
    '1.126.0',
    '1.125.1',
    '1.125.0',
    '1.124.0',
    '1.123.0',
    '1.122.0',
    '1.121.0',
    '1.120.2',
    '1.120.1',
    '1.120.0',
    '1.119.1',
    '1.119.0',
    '1.118.0',
    '1.117.0',
    '1.116.1',
    '1.116.0',
    '1.115.0',
    '1.114.0',
    '1.113.0',
    '1.112.0',
    '1.111.0',
    '1.110.0',
    '1.109.1',
    '1.109.0',
    '1.108.0',
    '1.107.0',
    '1.106.0',
    '1.105.0',
    '1.104.0',
  ] as const,
  aliases: [] as const,
}

export type DigitaloceancomdoctlPackage = typeof digitaloceancomdoctlPackage
