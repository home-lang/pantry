/**
 * **HDF5** - pkgx package
 *
 * @domain `hdfgroup.org/HDF5`
 * @programs `h5c++`, `h5cc`, `h5clear`, `h5copy`, `h5debug`, ... (+16 more)
 * @version `2.0.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install hdfgroup.org/HDF5`
 * @dependencies `dkrz.de/libaec@1`, `linux:zlib.net@1` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `cmake.org`, `gnu.org/autoconf`, `gnu.org/automake`, ... (+3 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.hdfgrouporghdf5
 * console.log(pkg.name)        // "HDF5"
 * console.log(pkg.programs)    // ["h5c++", "h5cc", ...]
 * console.log(pkg.versions[0]) // "2.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/hdfgroup-org/HDF5.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const hdfgrouporghdf5Package = {
  /**
   * The display name of this package.
   */
  name: 'HDF5' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'hdfgroup.org/HDF5' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/hdfgroup.org/HDF5/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install hdfgroup.org/HDF5' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +hdfgroup.org/HDF5 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install hdfgroup.org/HDF5' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'h5c++',
    'h5cc',
    'h5clear',
    'h5copy',
    'h5debug',
    'h5delete',
    'h5diff',
    'h5dump',
    'h5fc',
    'h5format_convert',
    'h5import',
    'h5jam',
    'h5ls',
    'h5mkgrp',
    'h5perf_serial',
    'h5redeploy',
    'h5repack',
    'h5repart',
    'h5stat',
    'h5unjam',
    'h5watch',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'dkrz.de/libaec@1',
    'linux:zlib.net@1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'cmake.org',
    'gnu.org/autoconf',
    'gnu.org/automake',
    'gnu.org/libtool',
    'linux:gnu.org/gcc',
    'darwin:llvm.org@20',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.0.0',
    '1.14.6',
    '1.14.5',
    '1.14.1',
  ] as const,
  aliases: [] as const,
}

export type Hdfgrouporghdf5Package = typeof hdfgrouporghdf5Package
