/**
 * **valkey** - A flexible distributed key-value datastore that is optimized for caching and other realtime workloads.
 *
 * @domain `valkey.io`
 * @programs `valkey-server`, `valkey-cli`, `valkey-benchmark`
 * @version `9.0.1` (22 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install valkey.io`
 * @homepage https://valkey.io
 * @dependencies `openssl.org^1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.valkeyio
 * console.log(pkg.name)        // "valkey"
 * console.log(pkg.description) // "A flexible distributed key-value datastore that..."
 * console.log(pkg.programs)    // ["valkey-server", "valkey-cli", ...]
 * console.log(pkg.versions[0]) // "9.0.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/valkey-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const valkeyioPackage = {
  /**
   * The display name of this package.
   */
  name: 'valkey' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'valkey.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A flexible distributed key-value datastore that is optimized for caching and other realtime workloads.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/valkey.io/package.yml' as const,
  homepageUrl: 'https://valkey.io' as const,
  githubUrl: 'https://github.com/valkey-io/valkey' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install valkey.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +valkey.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install valkey.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'valkey-server',
    'valkey-cli',
    'valkey-benchmark',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openssl.org^1',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '9.0.1',
    '9.0.0',
    '8.1.5',
    '8.1.4',
    '8.1.3',
    '8.1.2',
    '8.1.1',
    '8.1.0',
    '8.0.6',
    '8.0.5',
    '8.0.4',
    '8.0.3',
    '8.0.2',
    '8.0.1',
    '8.0.0',
    '7.2.11',
    '7.2.10',
    '7.2.9',
    '7.2.8',
    '7.2.7',
    '7.2.6',
    '7.2.5',
  ] as const,
  aliases: [] as const,
}

export type ValkeyioPackage = typeof valkeyioPackage
