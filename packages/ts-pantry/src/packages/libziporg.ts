/**
 * **zip** - A C library for reading, creating, and modifying zip archives.
 *
 * @domain `libzip.org`
 * @programs `zipcmp`, `zipmerge`, `ziptool`
 * @version `1.11.4` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install libzip.org`
 * @homepage https://libzip.org/
 * @dependencies `facebook.com/zstd>=1.5.0`, `darwin:sourceware.org/bzip2>=1.0.8`, `darwin:tukaani.org/xz>=5.2.7`, ... (+2 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `cmake.org@>=3.24` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.libziporg
 * console.log(pkg.name)        // "zip"
 * console.log(pkg.description) // "A C library for reading, creating, and modifyin..."
 * console.log(pkg.programs)    // ["zipcmp", "zipmerge", ...]
 * console.log(pkg.versions[0]) // "1.11.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/libzip-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libziporgPackage = {
  /**
   * The display name of this package.
   */
  name: 'zip' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'libzip.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A C library for reading, creating, and modifying zip archives.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/libzip.org/package.yml' as const,
  homepageUrl: 'https://libzip.org/' as const,
  githubUrl: 'https://github.com/nih-at/libzip' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install libzip.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +libzip.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install libzip.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'zipcmp',
    'zipmerge',
    'ziptool',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'facebook.com/zstd>=1.5.0',
    'darwin:sourceware.org/bzip2>=1.0.8',
    'darwin:tukaani.org/xz>=5.2.7',
    'darwin:zlib.net>=1.2.13',
    'linux:openssl.org^1.1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org@>=3.24',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.11.4',
    '1.11.3',
    '1.11.2',
    '1.11.1',
    '1.10.1',
    '1.10.0',
    '1.9.2',
  ] as const,
  aliases: [] as const,
}

export type LibziporgPackage = typeof libziporgPackage
