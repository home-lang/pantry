/**
 * **caddy** - Fast and extensible multi-platform HTTP/1-2-3 web server with automatic HTTPS
 *
 * @domain `caddyserver.com`
 * @programs `caddy`
 * @version `2.11.2` (14 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install caddyserver.com`
 * @homepage https://caddyserver.com/
 * @buildDependencies `go.dev`, `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.caddyservercom
 * console.log(pkg.name)        // "caddy"
 * console.log(pkg.description) // "Fast and extensible multi-platform HTTP/1-2-3 w..."
 * console.log(pkg.programs)    // ["caddy"]
 * console.log(pkg.versions[0]) // "2.11.2" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/caddyserver-com.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install caddyserver.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +caddyserver.com -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install caddyserver.com' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2.11.2',
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
    '2.7.3',
    '2.7.2',
    '2.7.1',
    '2.7.0',
    '2.6.4',
    '2.6.3',
    '2.6.2',
    '2.6.1',
    '2.6.0',
    '2.5.2',
    '2.5.1',
    '2.5.0',
    '2.4.6',
    '2.4.5',
    '2.4.4',
    '2.4.3',
    '2.4.2',
    '2.4.1',
    '2.4.0',
  ] as const,
  aliases: [] as const,
}

export type CaddyservercomPackage = typeof caddyservercomPackage
