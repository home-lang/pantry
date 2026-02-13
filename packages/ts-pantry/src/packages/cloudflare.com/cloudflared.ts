/**
 * **cloudflared** - Cloudflare Tunnel client (formerly Argo Tunnel)
 *
 * @domain `cloudflare.com/cloudflared`
 * @programs `cloudflared`
 * @version `2026.1.1` (38 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install cloudflare.com/cloudflared`
 * @homepage https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/tunnel-guide
 * @buildDependencies `go.dev@~1.24` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cloudflarecomcloudflared
 * console.log(pkg.name)        // "cloudflared"
 * console.log(pkg.description) // "Cloudflare Tunnel client (formerly Argo Tunnel)"
 * console.log(pkg.programs)    // ["cloudflared"]
 * console.log(pkg.versions[0]) // "2026.1.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/cloudflare-com/cloudflared.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cloudflarecomcloudflaredPackage = {
  /**
   * The display name of this package.
   */
  name: 'cloudflared' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'cloudflare.com/cloudflared' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Cloudflare Tunnel client (formerly Argo Tunnel)' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/cloudflare.com/cloudflared/package.yml' as const,
  homepageUrl: 'https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/tunnel-guide' as const,
  githubUrl: 'https://github.com/cloudflare/cloudflared' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install cloudflare.com/cloudflared' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +cloudflare.com/cloudflared -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install cloudflare.com/cloudflared' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'cloudflared',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@~1.24',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2026.1.1',
    '2025.11.1',
    '2025.11.0',
    '2025.10.1',
    '2025.10.0',
    '2025.9.1',
    '2025.9.0',
    '2025.8.1',
    '2025.8.0',
    '2025.7.0',
    '2025.6.1',
    '2025.6.0',
    '2025.5.0',
    '2025.4.2',
    '2025.4.0',
    '2025.2.1',
    '2025.2.0',
    '2025.1.1',
    '2025.1.0',
    '2024.12.2',
    '2024.12.1',
    '2024.12.0',
    '2024.11.1',
    '2024.11.0',
    '2024.10.1',
    '2024.10.0',
    '2024.9.1',
    '2024.9.0',
    '2024.8.3',
    '2024.8.2',
    '2024.7.3',
    '2024.6.1',
    '2024.6.0',
    '2024.5.0',
    '2024.4.1',
    '2024.4.0',
    '2024.3.0',
    '2024.2.1',
  ] as const,
  aliases: [] as const,
}

export type CloudflarecomcloudflaredPackage = typeof cloudflarecomcloudflaredPackage
