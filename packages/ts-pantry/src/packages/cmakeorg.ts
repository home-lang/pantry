/**
 * **cmake** - Mirror of CMake upstream repository
 *
 * @domain `cmake.org`
 * @programs `cmake`, `ccmake`, `cpack`, `ctest`
 * @version `4.2.2` (74 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install cmake.org`
 * @homepage https://www.cmake.org/
 * @dependencies `curl.se>=5<8.13`, `zlib.net@1`, `sourceware.org/bzip2@1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cmakeorg
 * console.log(pkg.name)        // "cmake"
 * console.log(pkg.description) // "Mirror of CMake upstream repository"
 * console.log(pkg.programs)    // ["cmake", "ccmake", ...]
 * console.log(pkg.versions[0]) // "4.2.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/cmake-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cmakeorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'cmake' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'cmake.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Mirror of CMake upstream repository' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/cmake.org/package.yml' as const,
  homepageUrl: 'https://www.cmake.org/' as const,
  githubUrl: 'https://github.com/Kitware/CMake' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install cmake.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +cmake.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install cmake.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'cmake',
    'ccmake',
    'cpack',
    'ctest',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'curl.se>=5<8.13',
    'zlib.net@1',
    'sourceware.org/bzip2@1',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.2.2',
    '4.2.1',
    '4.2.0',
    '4.1.4',
    '4.1.3',
    '4.1.2',
    '4.1.1',
    '4.1.0',
    '4.0.5',
    '4.0.4',
    '4.0.3',
    '4.0.2',
    '4.0.1',
    '4.0.0',
    '3.31.10',
    '3.31.9',
    '3.31.8',
    '3.31.7',
    '3.31.6',
    '3.31.5',
    '3.31.4',
    '3.31.3',
    '3.31.2',
    '3.31.1',
    '3.31.0',
    '3.30.9',
    '3.30.8',
    '3.30.7',
    '3.30.6',
    '3.30.5',
    '3.30.4',
    '3.30.3',
    '3.30.2',
    '3.30.1',
    '3.30.0',
    '3.29.9',
    '3.29.8',
    '3.29.7',
    '3.29.6',
    '3.29.5',
    '3.29.4',
    '3.29.3',
    '3.29.2',
    '3.29.1',
    '3.29.0',
    '3.28.6',
    '3.28.5',
    '3.28.4',
    '3.28.3',
    '3.28.2',
    '3.28.1',
    '3.28.0',
    '3.27.9',
    '3.27.8',
    '3.27.7',
    '3.27.6',
    '3.27.5',
    '3.27.4',
    '3.27.3',
    '3.27.2',
    '3.27.1',
    '3.27.0',
    '3.26.6',
    '3.26.5',
    '3.26.4',
    '3.26.3',
    '3.26.2',
    '3.26.1',
    '3.26.0',
    '3.25.3',
    '3.25.2',
    '3.25.1',
    '3.24.4',
    '3.24.2',
  ] as const,
  aliases: [] as const,
}

export type CmakeorgPackage = typeof cmakeorgPackage
