/**
 * **tailscale** - pkgx package
 *
 * @domain `tailscale.com`
 * @version `1.92.5` (12 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install tailscale.com`
 * @buildDependencies `go.dev@=1.25.1` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.tailscalecom
 * console.log(pkg.name)        // "tailscale"
 * console.log(pkg.versions[0]) // "1.92.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/tailscale-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const tailscalecomPackage = {
  /**
   * The display name of this package.
   */
  name: 'tailscale' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'tailscale.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/tailscale.com/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install tailscale.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +tailscale.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install tailscale.com' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@=1.25.1',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.92.5',
    '1.92.3',
    '1.92.2',
    '1.92.1',
    '1.90.9',
    '1.90.8',
    '1.90.6',
    '1.90.4',
    '1.90.3',
    '1.90.2',
    '1.90.1',
    '1.88.3',
  ] as const,
  aliases: [] as const,
}

export type TailscalecomPackage = typeof tailscalecomPackage
