/**
 * **exr** - The OpenEXR project provides the specification and reference implementation of the EXR file format, the professional-grade image storage format of the motion picture industry.
 *
 * @domain `openexr.com`
 * @programs `exr2aces`, `exrenvmap`, `exrheader`, `exrmakepreview`, `exrmaketiled`, ... (+3 more)
 * @version `3.4.4` (28 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install openexr.com`
 * @homepage https://www.openexr.com/
 * @dependencies `zlib.net^1`, `openexr.com/imath`, `linux:gnu.org/gcc/libstdcxx^14 # needed since 3.4.0` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `cmake.org`, `linux:gnu.org/gcc@14` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.openexrcom
 * console.log(pkg.name)        // "exr"
 * console.log(pkg.description) // "The OpenEXR project provides the specification ..."
 * console.log(pkg.programs)    // ["exr2aces", "exrenvmap", ...]
 * console.log(pkg.versions[0]) // "3.4.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/openexr-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const openexrcomPackage = {
  /**
   * The display name of this package.
   */
  name: 'exr' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'openexr.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The OpenEXR project provides the specification and reference implementation of the EXR file format, the professional-grade image storage format of the motion picture industry.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/openexr.com/package.yml' as const,
  homepageUrl: 'https://www.openexr.com/' as const,
  githubUrl: 'https://github.com/AcademySoftwareFoundation/openexr' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install openexr.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +openexr.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install openexr.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'exr2aces',
    'exrenvmap',
    'exrheader',
    'exrmakepreview',
    'exrmaketiled',
    'exrmultipart',
    'exrmultiview',
    'exrstdattr',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'zlib.net^1',
    'openexr.com/imath',
    'linux:gnu.org/gcc/libstdcxx^14 # needed since 3.4.0',
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
    '3.4.4',
    '3.4.3',
    '3.4.2',
    '3.4.1',
    '3.4.0',
    '3.3.6',
    '3.3.5',
    '3.3.4',
    '3.3.3',
    '3.3.2',
    '3.3.1',
    '3.3.0',
    '3.2.126',
    '3.2.5',
    '3.2.4',
    '3.2.3',
    '3.2.2',
    '3.2.1',
    '3.2.0',
    '3.1.13',
    '3.1.12',
    '3.1.11',
    '3.1.10',
    '3.1.9',
    '3.1.8',
    '3.1.7',
    '3.1.6',
    '2.5.10',
  ] as const,
  aliases: [] as const,
}

export type OpenexrcomPackage = typeof openexrcomPackage
