/**
 * **fnm** - 🚀 Fast and simple Node.js version manager, built in Rust
 *
 * @domain `crates.io/fnm`
 * @programs `fnm`
 * @version `1.38.1` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/fnm`
 * @homepage https://fnm.vercel.app
 * @dependencies `darwin:zlib.net^1` (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiofnm
 * console.log(pkg.name)        // "fnm"
 * console.log(pkg.description) // "🚀 Fast and simple Node.js version manager, bui..."
 * console.log(pkg.programs)    // ["fnm"]
 * console.log(pkg.versions[0]) // "1.38.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/fnm.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiofnmPackage = {
  /**
   * The display name of this package.
   */
  name: 'fnm' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/fnm' as const,
  /**
   * Brief description of what this package does.
   */
  description: '🚀 Fast and simple Node.js version manager, built in Rust' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/fnm/package.yml' as const,
  homepageUrl: 'https://fnm.vercel.app' as const,
  githubUrl: 'https://github.com/Schniz/fnm' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/fnm' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/fnm -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/fnm' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'fnm',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'darwin:zlib.net^1',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.38.1',
    '1.38.0',
    '1.37.2',
    '1.37.1',
    '1.37.0',
    '1.36.0',
    '1.35.1',
    '1.35.0',
  ] as const,
  aliases: [] as const,
}

export type CratesiofnmPackage = typeof cratesiofnmPackage
