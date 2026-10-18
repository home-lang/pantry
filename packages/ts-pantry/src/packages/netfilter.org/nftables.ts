/**
 * **nftables** - Native nftables ruleset management with JSON and an interactive CLI.
 *
 * @domain `netfilter.org/nftables`
 * @programs `nft`
 * @version `1.1.7` (20 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install netfilter.org/nftables`
 * @homepage https://www.netfilter.org/projects/nftables/
 * @dependencies `netfilter.org/libmnl^1`, `netfilter.org/libnftnl^1`, `gnu.org/readline^8`, ... (+2 more)
 * @buildDependencies `kernel.org/linux-headers`, `freedesktop.org/pkg-config`, `gnu.org/bison`, ... (+1 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.netfilterorgnftables
 * console.log(pkg.name)        // "nftables"
 * console.log(pkg.description) // "Native nftables ruleset management with JSON an..."
 * console.log(pkg.programs)    // ["nft"]
 * console.log(pkg.versions[0]) // "1.1.7" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/netfilter-org/nftables.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const nftablesPackage = {
  /**
  * The display name of this package.
  */
  name: 'nftables' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'netfilter.org/nftables' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Native nftables ruleset management with JSON and an interactive CLI.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://www.netfilter.org/projects/nftables/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install netfilter.org/nftables' as const,
  pantryInstallCommand: 'pantry install netfilter.org/nftables' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'nft',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'netfilter.org/libmnl^1',
    'netfilter.org/libnftnl^1',
    'gnu.org/readline^8',
    'digip.org/jansson^2',
    'gnu.org/gmp^6',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'kernel.org/linux-headers',
    'freedesktop.org/pkg-config',
    'gnu.org/bison',
    'github.com/westes/flex',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.1.7',
    '1.1.6',
    '1.1.5',
    '1.1.4',
    '1.1.3',
    '1.1.2',
    '1.1.1',
    '1.1.0',
    '1.0.9',
    '1.0.8',
    '1.0.7',
    '1.0.6',
    '1.0.5',
    '1.0.4',
    '1.0.3',
    '1.0.2',
    '1.0.1',
    '1.0.0',
    '0.9.9',
    '0.9.8',
  ] as const,
  aliases: [] as const,
}

export type NftablesPackage = typeof nftablesPackage
