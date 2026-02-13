/**
 * **cargo** - The Rust package manager
 *
 * @domain `rust-lang.org/cargo`
 * @programs `cargo`
 * @version `0.94.0` (32 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install rust-lang.org/cargo`
 * @homepage https://doc.rust-lang.org/cargo
 * @dependencies `zlib.net^1`, `libgit2.org~1.7 # links to libgit2.so.1.7`, `curl.se/ca-certs`, ... (+2 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `gnu.org/tar`, `tukaani.org/xz` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.rustlangorgcargo
 * console.log(pkg.name)        // "cargo"
 * console.log(pkg.description) // "The Rust package manager"
 * console.log(pkg.programs)    // ["cargo"]
 * console.log(pkg.versions[0]) // "0.94.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/rust-lang-org/cargo.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rustlangorgcargoPackage = {
  /**
   * The display name of this package.
   */
  name: 'cargo' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'rust-lang.org/cargo' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The Rust package manager' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/rust-lang.org/cargo/package.yml' as const,
  homepageUrl: 'https://doc.rust-lang.org/cargo' as const,
  githubUrl: 'https://github.com/rust-lang/cargo' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install rust-lang.org/cargo' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +rust-lang.org/cargo -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install rust-lang.org/cargo' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'cargo',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'zlib.net^1',
    'libgit2.org~1.7 # links to libgit2.so.1.7',
    'curl.se/ca-certs',
    'linux:llvm.org',
    'linux:curl.se',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/tar',
    'tukaani.org/xz',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.94.0',
    '0.93.0',
    '0.92.0',
    '0.91.0',
    '0.90.0',
    '0.89.0',
    '0.88.0',
    '0.87.0',
    '0.86.0',
    '0.85.0',
    '0.84.0',
    '0.83.0',
    '0.82.0',
    '0.81.0',
    '0.80.0',
    '0.79.0',
    '0.78.1',
    '0.78.0',
    '0.77.0',
    '0.76.0',
    '0.75.0',
    '0.74.0',
    '0.73.1',
    '0.72.1',
    '0.72.0',
    '0.71.0',
    '0.70.1',
    '0.70.0',
    '0.69.1',
    '0.69.0',
    '0.66.0',
    '0.65.0',
  ] as const,
  aliases: [] as const,
}

export type RustlangorgcargoPackage = typeof rustlangorgcargoPackage
