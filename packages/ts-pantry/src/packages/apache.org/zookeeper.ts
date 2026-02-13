/**
 * **zookeeper** - pkgx package
 *
 * @domain `apache.org/zookeeper`
 * @programs `zkCleanup`, `zkCli`, `zkEnv`, `zkServer-initialize`, `zkServer`, ... (+4 more)
 * @version `3.9.4` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install apache.org/zookeeper`
 * @dependencies `openjdk.org`, `openssl.org`
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/automake`, `freedesktop.org/cppunit`, ... (+3 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.apacheorgzookeeper
 * console.log(pkg.name)        // "zookeeper"
 * console.log(pkg.programs)    // ["zkCleanup", "zkCli", ...]
 * console.log(pkg.versions[0]) // "3.9.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/apache-org/zookeeper.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const apacheorgzookeeperPackage = {
  /**
   * The display name of this package.
   */
  name: 'zookeeper' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'apache.org/zookeeper' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/apache.org/zookeeper/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install apache.org/zookeeper' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +apache.org/zookeeper -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install apache.org/zookeeper' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'zkCleanup',
    'zkCli',
    'zkEnv',
    'zkServer-initialize',
    'zkServer',
    'zkSnapshotComparer',
    'zkSnapshotRecursiveSummaryToolkit',
    'zkSnapShotToolkit',
    'zkTxnLogToolkit',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openjdk.org',
    'openssl.org',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'gnu.org/autoconf',
    'gnu.org/automake',
    'freedesktop.org/cppunit',
    'gnu.org/libtool',
    'maven.apache.org',
    'linux:gnu.org/gcc',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.9.4',
    '3.9.3',
    '3.9.2',
    '3.9.1',
  ] as const,
  aliases: [] as const,
}

export type ApacheorgzookeeperPackage = typeof apacheorgzookeeperPackage
