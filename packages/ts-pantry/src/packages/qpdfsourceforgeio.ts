/**
 * **qpdf** - qpdf: A content-preserving PDF document transformer
 *
 * @domain `qpdf.sourceforge.io`
 * @programs `qpdf`
 * @version `12.3.1` (12 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install qpdf.sourceforge.io`
 * @homepage https://qpdf.sourceforge.io/
 * @dependencies `zlib.net^1`, `libjpeg-turbo.org^2`, `openssl.org^1.1`, ... (+2 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `cmake.org@^3`, `pyyaml.org/libyaml`, `python.org@^3`, ... (+2 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.qpdfsourceforgeio
 * console.log(pkg.name)        // "qpdf"
 * console.log(pkg.description) // "qpdf: A content-preserving PDF document transfo..."
 * console.log(pkg.programs)    // ["qpdf"]
 * console.log(pkg.versions[0]) // "12.3.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/qpdf-sourceforge-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const qpdfsourceforgeioPackage = {
  /**
   * The display name of this package.
   */
  name: 'qpdf' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'qpdf.sourceforge.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'qpdf: A content-preserving PDF document transformer' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/qpdf.sourceforge.io/package.yml' as const,
  homepageUrl: 'https://qpdf.sourceforge.io/' as const,
  githubUrl: 'https://github.com/qpdf/qpdf' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install qpdf.sourceforge.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +qpdf.sourceforge.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install qpdf.sourceforge.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'qpdf',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'zlib.net^1',
    'libjpeg-turbo.org^2',
    'openssl.org^1.1',
    'gnutls.org^3',
    'linux:gnu.org/gcc/libstdcxx^13 # needs newer libstdc++ for C++20 support',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'cmake.org@^3',
    'pyyaml.org/libyaml',
    'python.org@^3',
    'pip.pypa.io',
    'linux:gnu.org/gcc@^13',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '12.3.1',
    '12.3.0',
    '12.2.0',
    '12.1.0',
    '12.0.0',
    '11.10.1',
    '11.10.0',
    '11.9.1',
    '11.9.0',
    '11.8.0',
    '11.7.0',
    '11.6.4',
  ] as const,
  aliases: [] as const,
}

export type QpdfsourceforgeioPackage = typeof qpdfsourceforgeioPackage
