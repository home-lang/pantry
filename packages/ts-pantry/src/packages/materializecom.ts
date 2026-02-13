/**
 * **mz** - Real-time Data Integration and Transformation: use SQL to transform, deliver, and act on fast-changing data.
 *
 * @domain `materialize.com`
 * @programs `mz`
 * @version `0.112.2` (45 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install materialize.com`
 * @homepage https://materialize.com
 * @dependencies `openssl.org^1.1`
 * @buildDependencies `cmake.org@^3`, `perl.org`, `gnu.org/automake`, ... (+4 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.materializecom
 * console.log(pkg.name)        // "mz"
 * console.log(pkg.description) // "Real-time Data Integration and Transformation: ..."
 * console.log(pkg.programs)    // ["mz"]
 * console.log(pkg.versions[0]) // "0.112.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/materialize-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const materializecomPackage = {
  /**
   * The display name of this package.
   */
  name: 'mz' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'materialize.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Real-time Data Integration and Transformation: use SQL to transform, deliver, and act on fast-changing data.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/materialize.com/package.yml' as const,
  homepageUrl: 'https://materialize.com' as const,
  githubUrl: 'https://github.com/MaterializeInc/materialize' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install materialize.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +materialize.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install materialize.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'mz',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openssl.org^1.1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'cmake.org@^3',
    'perl.org',
    'gnu.org/automake',
    'gnu.org/autoconf',
    'protobuf.dev@26.1',
    'linux:gnu.org/make',
    'linux:llvm.org@<17',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.112.2',
    '0.111.3',
    '0.110.1',
    '0.109.1',
    '0.108.4',
    '0.107.3',
    '0.106.2',
    '0.105.1',
    '0.104.2',
    '0.103.0',
    '0.102.2',
    '0.101.1',
    '0.100.1',
    '0.99.2',
    '0.98.6',
    '0.97.2',
    '0.96.2',
    '0.95.2',
    '0.94.2',
    '0.93.1',
    '0.92.1',
    '0.91.0',
    '0.90.1',
    '0.89.2',
    '0.88.1',
    '0.87.2',
    '0.86.1',
    '0.85.2',
    '0.84.2',
    '0.83.4',
    '0.82.2',
    '0.81.3',
    '0.80.2',
    '0.79.1',
    '0.77.1',
    '0.76.0',
    '0.75.1',
    '0.74.2',
    '0.73.0',
    '0.72.1',
    '0.71.0',
    '0.70.2',
    '0.69.1',
    '0.68.1',
    '0.67.3',
  ] as const,
  aliases: [] as const,
}

export type MaterializecomPackage = typeof materializecomPackage
