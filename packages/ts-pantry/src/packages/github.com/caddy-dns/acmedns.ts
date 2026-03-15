/**
 * **acmedns** - pkgx package
 *
 * @domain `github.com/caddy-dns/acmedns`
 * @programs `caddy-acmedns`
 * @version `0.6.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install github.com/caddy-dns/acmedns`
 * @buildDependencies `github.com/caddyserver/xcaddy` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomcaddydnsacmedns
 * console.log(pkg.name)        // "acmedns"
 * console.log(pkg.programs)    // ["caddy-acmedns"]
 * console.log(pkg.versions[0]) // "0.6.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/caddy-dns/acmedns.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const acmednsPackage = {
  /**
  * The display name of this package.
  */
  name: 'acmedns' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/caddy-dns/acmedns' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/caddy-dns/acmedns/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install github.com/caddy-dns/acmedns' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/caddy-dns/acmedns -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install github.com/caddy-dns/acmedns' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'caddy-acmedns',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'github.com/caddyserver/xcaddy',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.6.0',
    '0.5.0',
    '0.4.1',
  ] as const,
  aliases: [] as const,
}

export type AcmednsPackage = typeof acmednsPackage
