/**
 * **btop** - Resource monitor. C++ version and continuation of bashtop and bpytop
 *
 * @domain `github.com/aristocratos/btop`
 * @programs `btop`
 * @version `1.4.6` (10 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/aristocratos/btop`
 * @dependencies `linux:gnu.org/gcc/libstdcxx@14` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `linux:gnu.org/gcc@14`, `linux:llvm.org` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomaristocratosbtop
 * console.log(pkg.name)        // "btop"
 * console.log(pkg.description) // "Resource monitor. C++ version and continuation ..."
 * console.log(pkg.programs)    // ["btop"]
 * console.log(pkg.versions[0]) // "1.4.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/aristocratos/btop.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const btopPackage = {
  /**
   * The display name of this package.
   */
  name: 'btop' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/aristocratos/btop' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Resource monitor. C++ version and continuation of bashtop and bpytop' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/aristocratos/btop/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/aristocratos/btop' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/aristocratos/btop' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/aristocratos/btop -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/aristocratos/btop' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'btop',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'linux:gnu.org/gcc/libstdcxx@14',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'linux:gnu.org/gcc@14',
    'linux:llvm.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.4.6',
    '1.4.5',
    '1.4.4',
    '1.4.3',
    '1.4.2',
    '1.4.1',
    '1.4.0',
    '1.3.2',
    '1.3.1',
    '1.3.0',
  ] as const,
  aliases: [] as const,
}

export type BtopPackage = typeof btopPackage
