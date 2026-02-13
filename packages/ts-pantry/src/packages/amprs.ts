/**
 * **amp** - A complete text editor for your terminal.
 *
 * @domain `amp.rs`
 * @programs `amp`
 * @version `0.7.1` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install amp.rs`
 * @homepage https://amp.rs
 * @dependencies `zlib.net@1`, `libgit2.org@1`, `linux:openssl.org@1.1` (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.amprs
 * console.log(pkg.name)        // "amp"
 * console.log(pkg.description) // "A complete text editor for your terminal."
 * console.log(pkg.programs)    // ["amp"]
 * console.log(pkg.versions[0]) // "0.7.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/amp-rs.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const amprsPackage = {
  /**
   * The display name of this package.
   */
  name: 'amp' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'amp.rs' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A complete text editor for your terminal.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/amp.rs/package.yml' as const,
  homepageUrl: 'https://amp.rs' as const,
  githubUrl: 'https://github.com/jmacdonald/amp' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install amp.rs' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +amp.rs -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install amp.rs' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'amp',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'zlib.net@1',
    'libgit2.org@1',
    'linux:openssl.org@1.1',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.7.1',
  ] as const,
  aliases: [] as const,
}

export type AmprsPackage = typeof amprsPackage
