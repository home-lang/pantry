/**
 * **jpegxl** - JPEG XL image format reference implementation
 *
 * @domain `jpeg.org/jpegxl`
 * @programs `cjxl`, `djxl`, `jxlinfo`
 * @version `0.11.1` (18 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install jpeg.org/jpegxl`
 * @homepage https://jpeg.org/jpegxl/index.html
 * @dependencies `github.com/google/brotli^1`, `littlecms.com^2.13`, `google.com/highway^1`, ... (+4 more)
 * @buildDependencies `cmake.org@^3`, `gnu.org/coreutils` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.jpegorgjpegxl
 * console.log(pkg.name)        // "jpegxl"
 * console.log(pkg.description) // "JPEG XL image format reference implementation"
 * console.log(pkg.programs)    // ["cjxl", "djxl", ...]
 * console.log(pkg.versions[0]) // "0.11.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/jpeg-org/jpegxl.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const jpegorgjpegxlPackage = {
  /**
   * The display name of this package.
   */
  name: 'jpegxl' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'jpeg.org/jpegxl' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'JPEG XL image format reference implementation' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/jpeg.org/jpegxl/package.yml' as const,
  homepageUrl: 'https://jpeg.org/jpegxl/index.html' as const,
  githubUrl: 'https://github.com/libjxl/libjxl' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install jpeg.org/jpegxl' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +jpeg.org/jpegxl -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install jpeg.org/jpegxl' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'cjxl',
    'djxl',
    'jxlinfo',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'github.com/google/brotli^1',
    'littlecms.com^2.13',
    'google.com/highway^1',
    'google.com/webp^1',
    'giflib.sourceforge.io^5',
    'openexr.com^3',
    'libpng.org^1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org@^3',
    'gnu.org/coreutils',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.11.1',
    '0.11.0',
    '0.10.4',
    '0.10.3',
    '0.10.2',
    '0.10.1',
    '0.10.0',
    '0.9.4',
    '0.9.3',
    '0.9.2',
    '0.9.1',
    '0.9.0',
    '0.8.4',
    '0.8.3',
    '0.8.2',
    '0.8.1',
    '0.7.2',
    '0.7.1',
  ] as const,
  aliases: [] as const,
}

export type JpegorgjpegxlPackage = typeof jpegorgjpegxlPackage
