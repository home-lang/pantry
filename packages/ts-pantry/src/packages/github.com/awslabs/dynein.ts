/**
 * **dy** - DynamoDB CLI written in Rust.
 *
 * @domain `github.com/awslabs/dynein`
 * @programs `dy`
 * @version `0.3.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/awslabs/dynein`
 * @dependencies `linux:openssl.org^1.1` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `cmake.org@3`, `linux:openssl.org` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomawslabsdynein
 * console.log(pkg.name)        // "dy"
 * console.log(pkg.description) // "DynamoDB CLI written in Rust."
 * console.log(pkg.programs)    // ["dy"]
 * console.log(pkg.versions[0]) // "0.3.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/awslabs/dynein.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const dyneinPackage = {
  /**
   * The display name of this package.
   */
  name: 'dy' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/awslabs/dynein' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'DynamoDB CLI written in Rust.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/awslabs/dynein/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/awslabs/dynein' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/awslabs/dynein' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/awslabs/dynein -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/awslabs/dynein' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'dy',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'linux:openssl.org^1.1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'cmake.org@3',
    'linux:openssl.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.3.0',
    '0.2.1',
  ] as const,
  aliases: [] as const,
}

export type DyneinPackage = typeof dyneinPackage
