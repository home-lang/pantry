/**
 * **libraw** - Library for reading RAW files from digital photo cameras
 *
 * @domain `libraw.org`
 * @programs `4channels`, `dcraw_emu`, `dcraw_half`, `half_mt`, `mem_image`, ... (+6 more)
 * @version `0.22.0` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install libraw.org`
 * @homepage https://www.libraw.org/
 * @dependencies `github.com/jasper-software/jasper`, `libjpeg-turbo.org`, `littlecms.com`, ... (+2 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/automake`, `gnu.org/libtool`, ... (+2 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.libraworg
 * console.log(pkg.name)        // "libraw"
 * console.log(pkg.description) // "Library for reading RAW files from digital phot..."
 * console.log(pkg.programs)    // ["4channels", "dcraw_emu", ...]
 * console.log(pkg.versions[0]) // "0.22.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/libraw-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libraworgPackage = {
  /**
   * The display name of this package.
   */
  name: 'libraw' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'libraw.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Library for reading RAW files from digital photo cameras' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/libraw.org/package.yml' as const,
  homepageUrl: 'https://www.libraw.org/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install libraw.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +libraw.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install libraw.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    '4channels',
    'dcraw_emu',
    'dcraw_half',
    'half_mt',
    'mem_image',
    'multirender_test',
    'postprocessing_benchmark',
    'raw-identify',
    'rawtextdump',
    'simple_dcraw',
    'unprocessed_raw',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'github.com/jasper-software/jasper',
    'libjpeg-turbo.org',
    'littlecms.com',
    'zlib.net',
    'darwin:openmp.llvm.org',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'gnu.org/autoconf',
    'gnu.org/automake',
    'gnu.org/libtool',
    'darwin:llvm.org',
    'linux:gnu.org/gcc',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.22.0',
    '0.21.5',
    '0.21.4',
    '0.21.3',
    '0.21.2',
    '0.21.1',
  ] as const,
  aliases: [] as const,
}

export type LibraworgPackage = typeof libraworgPackage
