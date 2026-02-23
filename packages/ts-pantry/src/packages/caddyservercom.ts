/**
 * **caddy** - Fast and extensible multi-platform HTTP/1-2-3 web server with automatic HTTPS
 *
 * @domain `caddyserver.com`
 * @programs `caddy`
 * @version `2.11.1` (13 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install caddyserver.com`
 * @homepage https://caddyserver.com/
 * @buildDependencies `go.dev`, `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.caddyservercom
 * console.log(pkg.name)        // "caddy"
 * console.log(pkg.description) // "Fast and extensible multi-platform HTTP/1-2-3 w..."
 * console.log(pkg.programs)    // ["caddy"]
 * console.log(pkg.versions[0]) // "2.11.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/caddyserver-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const caddyservercomPackage = {
  /**
  * The display name of this package.
  */
  name: 'caddy' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'caddyserver.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Fast and extensible multi-platform HTTP/1-2-3 web server with automatic HTTPS' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/caddyserver.com/package.yml' as const,
  homepageUrl: 'https://caddyserver.com/' as const,
  githubUrl: 'https://github.com/caddyserver/caddy' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install caddyserver.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +caddyserver.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install caddyserver.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'caddy',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev',
    'curl.se',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.11.1',
    '2.10.2',
    '2.10.1',
    '2.10.0',
    '2.9.1',
    '2.9.0',
    '2.8.4',
    '2.8.2',
    '2.8.1',
    '2.8.0',
    '2.7.6',
    '2.7.5',
    '2.7.4',
  ] as const,
  aliases: [] as const,
}

export type CaddyservercomPackage = typeof caddyservercomPackage
