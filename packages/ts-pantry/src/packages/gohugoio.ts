/**
 * **hugo** - The world’s fastest framework for building websites.
 *
 * @domain `gohugo.io`
 * @programs `hugo`
 * @version `0.154.5` (149 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gohugo.io`
 * @homepage https://gohugo.io/
 * @buildDependencies `go.dev@~1.22.6` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gohugoio
 * console.log(pkg.name)        // "hugo"
 * console.log(pkg.description) // "The world’s fastest framework for building webs..."
 * console.log(pkg.programs)    // ["hugo"]
 * console.log(pkg.versions[0]) // "0.154.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gohugo-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gohugoioPackage = {
  /**
   * The display name of this package.
   */
  name: 'hugo' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gohugo.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The world’s fastest framework for building websites.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gohugo.io/package.yml' as const,
  homepageUrl: 'https://gohugo.io/' as const,
  githubUrl: 'https://github.com/gohugoio/hugo' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gohugo.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gohugo.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gohugo.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'hugo',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@~1.22.6',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.154.5',
    '0.154.4',
    '0.154.3',
    '0.154.2',
    '0.154.1',
    '0.154.0',
    '0.153.5',
    '0.153.4',
    '0.153.3',
    '0.153.2',
    '0.153.1',
    '0.153.0',
    '0.152.2',
    '0.152.1',
    '0.152.0',
    '0.151.2',
    '0.151.1',
    '0.151.0',
    '0.150.1',
    '0.150.0',
    '0.149.1',
    '0.149.0',
    '0.148.2',
    '0.148.1',
    '0.148.0',
    '0.147.9',
    '0.147.8',
    '0.147.7',
    '0.147.6',
    '0.147.5',
    '0.147.4',
    '0.147.3',
    '0.147.2',
    '0.147.1',
    '0.147.0',
    '0.146.7',
    '0.146.6',
    '0.146.5',
    '0.146.4',
    '0.146.3',
    '0.146.2',
    '0.146.1',
    '0.146.0',
    '0.145.0',
    '0.144.2',
    '0.144.1',
    '0.144.0',
    '0.143.1',
    '0.143.0',
    '0.142.0',
    '0.141.0',
    '0.140.2',
    '0.140.1',
    '0.140.0',
    '0.139.5',
    '0.139.4',
    '0.139.3',
    '0.139.2',
    '0.139.1',
    '0.139.0',
    '0.138.0',
    '0.137.1',
    '0.137.0',
    '0.136.5',
    '0.136.4',
    '0.136.3',
    '0.136.2',
    '0.136.1',
    '0.136.0',
    '0.135.0',
    '0.134.3',
    '0.134.2',
    '0.134.1',
    '0.134.0',
    '0.133.1',
    '0.133.0',
    '0.132.2',
    '0.132.1',
    '0.132.0',
    '0.131.0',
    '0.130.0',
    '0.129.0',
    '0.128.2',
    '0.128.1',
    '0.128.0',
    '0.127.0',
    '0.126.3',
    '0.126.2',
    '0.126.1',
    '0.126.0',
    '0.125.7',
    '0.125.6',
    '0.125.5',
    '0.125.4',
    '0.125.3',
    '0.125.2',
    '0.125.1',
    '0.125.0',
    '0.124.1',
    '0.124.0',
    '0.123.8',
    '0.123.7',
    '0.123.6',
    '0.123.5',
    '0.123.4',
    '0.123.3',
    '0.123.2',
    '0.123.1',
    '0.123.0',
    '0.122.0',
    '0.121.2',
    '0.121.1',
    '0.121.0',
    '0.120.4',
    '0.120.3',
    '0.120.2',
    '0.120.1',
    '0.120.0',
    '0.119.0',
    '0.118.2',
    '0.118.1',
    '0.118.0',
    '0.116.1',
    '0.116.0',
    '0.115.4',
    '0.115.3',
    '0.115.2',
    '0.115.1',
    '0.115.0',
    '0.114.1',
    '0.114.0',
    '0.113.0',
    '0.112.7',
    '0.112.6',
    '0.112.5',
    '0.112.4',
    '0.112.3',
    '0.112.2',
    '0.112.1',
    '0.112.0',
    '0.111.3',
    '0.111.2',
    '0.111.1',
    '0.111.0',
    '0.109.0',
    '0.108.0',
    '0.107.0',
    '0.105.0',
    '0.104.3',
  ] as const,
  aliases: [] as const,
}

export type GohugoioPackage = typeof gohugoioPackage
