/**
 * **libnftnl** - Low-level userspace library for nftables Netlink messages.
 *
 * @domain `netfilter.org/libnftnl`
 * @version `1.3.2` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install netfilter.org/libnftnl`
 * @homepage https://www.netfilter.org/projects/libnftnl/
 * @dependencies `netfilter.org/libmnl^1`
 * @buildDependencies `kernel.org/linux-headers`, `freedesktop.org/pkg-config` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.netfilterorglibnftnl
 * console.log(pkg.name)        // "libnftnl"
 * console.log(pkg.description) // "Low-level userspace library for nftables Netlin..."
 * console.log(pkg.versions[0]) // "1.3.2" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/netfilter-org/libnftnl.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const libnftnlPackage = {
  /**
  * The display name of this package.
  */
  name: 'libnftnl' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'netfilter.org/libnftnl' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Low-level userspace library for nftables Netlink messages.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://www.netfilter.org/projects/libnftnl/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install netfilter.org/libnftnl' as const,
  pantryInstallCommand: 'pantry install netfilter.org/libnftnl' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'netfilter.org/libmnl^1',
  ] as const,
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
    '1.3.2',
  ] as const,
  aliases: [] as const,
}

export type LibnftnlPackage = typeof libnftnlPackage
