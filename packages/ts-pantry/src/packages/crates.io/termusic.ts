/**
 * **termusic** - Music Player TUI written in Rust
 *
 * @domain `crates.io/termusic`
 * @programs `termusic`, `termusic-server`
 * @version `0.12.1` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/termusic`
 * @dependencies `linux:alsa-project.org/alsa-lib`, `linux:freedesktop.org/dbus` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `protobuf.dev`, `abseil.io@^20250127` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiotermusic
 * console.log(pkg.name)        // "termusic"
 * console.log(pkg.description) // "Music Player TUI written in Rust"
 * console.log(pkg.programs)    // ["termusic", "termusic-server"]
 * console.log(pkg.versions[0]) // "0.12.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/termusic.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiotermusicPackage = {
  /**
   * The display name of this package.
   */
  name: 'termusic' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/termusic' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Music Player TUI written in Rust' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/termusic/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/tramhao/termusic' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/termusic' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/termusic -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/termusic' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'termusic',
    'termusic-server',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'linux:alsa-project.org/alsa-lib',
    'linux:freedesktop.org/dbus',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'protobuf.dev',
    'abseil.io@^20250127',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.12.1',
    '0.12.0',
    '0.11.0',
    '0.10.0',
    '0.9.1',
    '0.9.0',
  ] as const,
  aliases: [] as const,
}

export type CratesiotermusicPackage = typeof cratesiotermusicPackage
