/**
 * **libmnl** - Minimal userspace library for Netlink communications.
 *
 * @domain `netfilter.org/libmnl`
 * @version `1.0.5` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install netfilter.org/libmnl`
 * @homepage https://www.netfilter.org/projects/libmnl/
 * @buildDependencies `kernel.org/linux-headers`, `freedesktop.org/pkg-config` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.netfilterorglibmnl
 * console.log(pkg.name)        // "libmnl"
 * console.log(pkg.description) // "Minimal userspace library for Netlink communica..."
 * console.log(pkg.versions[0]) // "1.0.5" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/netfilter-org/libmnl.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const libmnlPackage = {
  /**
  * The display name of this package.
  */
  name: 'libmnl' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'netfilter.org/libmnl' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Minimal userspace library for Netlink communications.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://www.netfilter.org/projects/libmnl/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install netfilter.org/libmnl' as const,
  pantryInstallCommand: 'pantry install netfilter.org/libmnl' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'kernel.org/linux-headers',
    'freedesktop.org/pkg-config',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.0.5',
    '1.0.4',
    '1.0.3',
    '1.0.2',
    '1.0.1',
    '1.0.0',
  ] as const,
  aliases: [] as const,
}

export type LibmnlPackage = typeof libmnlPackage
