/**
 * **zig** - General-purpose programming language and toolchain for maintaining robust, optimal, and reusable software.
 *
 * @domain `ziglang.org`
 * @programs `zig`
 * @version `0.15.2` (10 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install ziglang.org`
 * @homepage https://ziglang.org/
 * @buildDependencies `curl.se`, `gnu.org/tar`, `tukaani.org/xz` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.ziglangorg
 * console.log(pkg.name)        // "zig"
 * console.log(pkg.description) // "General-purpose programming language and toolch..."
 * console.log(pkg.programs)    // ["zig"]
 * console.log(pkg.versions[0]) // "0.15.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/ziglang-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const ziglangorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'zig' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'ziglang.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'General-purpose programming language and toolchain for maintaining robust, optimal, and reusable software.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/ziglang.org/package.yml' as const,
  homepageUrl: 'https://ziglang.org/' as const,
  githubUrl: 'https://github.com/ziglang/zig' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install ziglang.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +ziglang.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install ziglang.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'zig',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'curl.se',
    'gnu.org/tar',
    'tukaani.org/xz',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.15.2',
    '0.15.1',
    '0.15.0',
    '0.14.1',
    '0.14.0',
    '0.13.0',
    '0.12.1',
    '0.12.0',
    '0.11.0',
    '0.10.1',
  ] as const,
  aliases: [] as const,
}

export type ZiglangorgPackage = typeof ziglangorgPackage
