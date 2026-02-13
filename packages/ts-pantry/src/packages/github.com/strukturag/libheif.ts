/**
 * **heif** - libheif is an HEIF and AVIF file format decoder and encoder.
 *
 * @domain `github.com/strukturag/libheif`
 * @programs `heif-enc`, `heif-info`, `heif-thumbnailer`
 * @version `1.21.2` (26 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/strukturag/libheif`
 * @homepage https://www.libde265.org/
 * @dependencies `aomedia.googlesource.com/aom`, `libjpeg-turbo.org`, `github.com/strukturag/libde265`, ... (+4 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `cmake.org`, `linux:gnu.org/gcc@14` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomstrukturaglibheif
 * console.log(pkg.name)        // "heif"
 * console.log(pkg.description) // "libheif is an HEIF and AVIF file format decoder..."
 * console.log(pkg.programs)    // ["heif-enc", "heif-info", ...]
 * console.log(pkg.versions[0]) // "1.21.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/strukturag/libheif.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libheifPackage = {
  /**
   * The display name of this package.
   */
  name: 'heif' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/strukturag/libheif' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'libheif is an HEIF and AVIF file format decoder and encoder.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/strukturag/libheif/package.yml' as const,
  homepageUrl: 'https://www.libde265.org/' as const,
  githubUrl: 'https://github.com/strukturag/libheif' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/strukturag/libheif' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/strukturag/libheif -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/strukturag/libheif' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'heif-enc',
    'heif-info',
    'heif-thumbnailer',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'aomedia.googlesource.com/aom',
    'libjpeg-turbo.org',
    'github.com/strukturag/libde265',
    'libpng.org',
    'freedesktop.org/shared-mime-info',
    'videolan.org/x265@3.2',
    'linux:gnu.org/gcc/libstdcxx@14',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'cmake.org',
    'linux:gnu.org/gcc@14',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.21.2',
    '1.21.1',
    '1.21.0',
    '1.20.2',
    '1.20.1',
    '1.20.0',
    '1.19.8',
    '1.19.7',
    '1.19.6',
    '1.19.5',
    '1.19.4',
    '1.19.3',
    '1.19.2',
    '1.19.1',
    '1.19.0',
    '1.18.2',
    '1.18.1',
    '1.18.0',
    '1.17.6',
    '1.17.5',
    '1.17.4',
    '1.17.3',
    '1.17.2',
    '1.17.1',
    '1.17.0',
    '1.16.2',
  ] as const,
  aliases: [] as const,
}

export type LibheifPackage = typeof libheifPackage
