/**
 * **tailscale** - pkgx package
 *
 * @domain `tailscale.com`
 * @programs `tailscale`, `tailscaled`
 * @version `1.96.3` (16 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install tailscale.com`
 * @buildDependencies `go.dev@=1.25.1` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.tailscalecom
 * console.log(pkg.name)        // "tailscale"
 * console.log(pkg.programs)    // ["tailscale", "tailscaled"]
 * console.log(pkg.versions[0]) // "1.96.3" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/tailscale-com.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install tailscale.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +tailscale.com -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install tailscale.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'tailscale',
    'tailscaled',
  ] as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.96.3',
    '1.96.2',
    '1.94.2',
    '1.94.1',
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
    '1.88.1',
    '1.86.2',
    '1.86.0',
    '1.84.2',
    '1.84.1',
    '1.84.0',
    '1.82.5',
    '1.82.0',
    '1.80.3',
    '1.80.2',
    '1.80.1',
    '1.80.0',
    '1.78.1',
    '1.78.0',
    '1.76.6',
    '1.76.1',
    '1.76.0',
    '1.74.1',
    '1.74.0',
    '1.72.1',
    '1.72.0',
    '1.70.0',
    '1.68.2',
    '1.68.1',
    '1.68.0',
    '1.66.4',
    '1.66.3',
    '1.66.2',
    '1.66.1',
    '1.66.0',
    '1.64.2',
    '1.64.1',
    '1.64.0',
  ] as const,
  aliases: [] as const,
}

export type TailscalecomPackage = typeof tailscalecomPackage
