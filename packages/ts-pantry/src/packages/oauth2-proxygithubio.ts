/**
 * **oauth2-proxy** - A reverse proxy that provides authentication with Google, Azure, OpenID Connect and many more identity providers.
 *
 * @domain `oauth2-proxy.github.io`
 * @programs `oauth2-proxy`
 * @version `7.14.2` (14 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install oauth2-proxy.github.io`
 * @homepage https://oauth2-proxy.github.io/oauth2-proxy/
 * @buildDependencies `go.dev@1.22.4` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.oauth2proxygithubio
 * console.log(pkg.name)        // "oauth2-proxy"
 * console.log(pkg.description) // "A reverse proxy that provides authentication wi..."
 * console.log(pkg.programs)    // ["oauth2-proxy"]
 * console.log(pkg.versions[0]) // "7.14.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/oauth2-proxy-github-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const oauth2proxygithubioPackage = {
  /**
   * The display name of this package.
   */
  name: 'oauth2-proxy' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'oauth2-proxy.github.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A reverse proxy that provides authentication with Google, Azure, OpenID Connect and many more identity providers.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/oauth2-proxy.github.io/package.yml' as const,
  homepageUrl: 'https://oauth2-proxy.github.io/oauth2-proxy/' as const,
  githubUrl: 'https://github.com/oauth2-proxy/oauth2-proxy' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install oauth2-proxy.github.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +oauth2-proxy.github.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install oauth2-proxy.github.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'oauth2-proxy',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@1.22.4',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '7.14.2',
    '7.14.1',
    '7.14.0',
    '7.13.0',
    '7.12.0',
    '7.11.0',
    '7.10.0',
    '7.9.0',
    '7.8.2',
    '7.8.1',
    '7.8.0',
    '7.7.1',
    '7.7.0',
    '7.6.0',
  ] as const,
  aliases: [] as const,
}

export type Oauth2proxygithubioPackage = typeof oauth2proxygithubioPackage
