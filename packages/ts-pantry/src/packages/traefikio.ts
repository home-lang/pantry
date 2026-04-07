/**
 * **traefik** - The Cloud Native Application Proxy
 *
 * @domain `traefik.io`
 * @programs `traefik`
 * @version `3.6.11` (95 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install traefik.io`
 * @homepage https://traefik.io/
 * @buildDependencies `go.dev` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.traefikio
 * console.log(pkg.name)        // "traefik"
 * console.log(pkg.description) // "The Cloud Native Application Proxy"
 * console.log(pkg.programs)    // ["traefik"]
 * console.log(pkg.versions[0]) // "3.6.11" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/traefik-io.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const traefikioPackage = {
  /**
  * The display name of this package.
  */
  name: 'traefik' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'traefik.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'The Cloud Native Application Proxy' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/traefik.io/package.yml' as const,
  homepageUrl: 'https://traefik.io/' as const,
  githubUrl: 'https://github.com/traefik/traefik' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install traefik.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +traefik.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install traefik.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'traefik',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '3.7.0-ea.2',
    '3.6.13',
    '3.6.12',
    '3.6.11',
    '3.6.10',
    '3.6.9',
    '3.6.8',
    '3.6.7',
    '3.6.6',
    '3.6.5',
    '3.6.4',
    '3.6.2',
    '3.6.1',
    '3.6.0',
    '3.5.6',
    '3.5.4',
    '3.5.3',
    '3.5.2',
    '3.5.1',
    '3.5.0',
    '3.5.0-rc1',
    '3.4.5',
    '3.4.4',
    '3.4.3',
    '3.4.2',
    '3.4.1',
    '3.4.0',
    '3.3.7',
    '3.3.6',
    '3.3.5',
    '2.11.42',
    '2.11.41',
    '2.11.40',
    '2.11.38',
    '2.11.37',
    '2.11.36',
    '2.11.35',
    '2.11.34',
    '2.11.33',
    '2.11.32',
    '2.11.31',
    '2.11.30',
    '2.11.29',
    '2.11.28',
    '2.11.27',
    '2.11.26',
    '2.11.25',
    '2.11.24',
  ] as const,
  aliases: [] as const,
}

export type TraefikioPackage = typeof traefikioPackage
