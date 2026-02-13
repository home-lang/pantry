/**
 * **lavinmq** - Lightweight and fast AMQP (0-9-1) server
 *
 * @domain `lavinmq.com`
 * @programs `lavinmq`, `lavinmqctl`, `lavinmqperf`
 * @version `2.6.4` (24 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install lavinmq.com`
 * @homepage https://lavinmq.com
 * @dependencies `openssl.org^1.1`, `pcre.org/v2@10`, `libevent.org@2`, ... (+1 more)
 * @buildDependencies `lz4.org@^1`, `gnu.org/help2man@=1.49.3`, `perl.org@=5.40.0`, ... (+1 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.lavinmqcom
 * console.log(pkg.name)        // "lavinmq"
 * console.log(pkg.description) // "Lightweight and fast AMQP (0-9-1) server"
 * console.log(pkg.programs)    // ["lavinmq", "lavinmqctl", ...]
 * console.log(pkg.versions[0]) // "2.6.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/lavinmq-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const lavinmqcomPackage = {
  /**
   * The display name of this package.
   */
  name: 'lavinmq' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'lavinmq.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Lightweight and fast AMQP (0-9-1) server' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/lavinmq.com/package.yml' as const,
  homepageUrl: 'https://lavinmq.com' as const,
  githubUrl: 'https://github.com/cloudamqp/lavinmq' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install lavinmq.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +lavinmq.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install lavinmq.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'lavinmq',
    'lavinmqctl',
    'lavinmqperf',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openssl.org^1.1',
    'pcre.org/v2@10',
    'libevent.org@2',
    'hboehm.info/gc@8',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'lz4.org@^1',
    'gnu.org/help2man@=1.49.3',
    'perl.org@=5.40.0',
    'etcd.io',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.6.4',
    '2.6.3',
    '2.6.2',
    '2.6.1',
    '2.6.0',
    '2.5.5',
    '2.5.4',
    '2.5.3',
    '2.5.2',
    '2.5.1',
    '2.5.0',
    '2.4.5',
    '2.4.4',
    '2.4.3',
    '2.4.2',
    '2.4.1',
    '2.4.0',
    '2.3.0',
    '2.2.0',
    '2.1.0',
    '2.0.2',
    '2.0.1',
    '2.0.0',
    '1.3.1',
  ] as const,
  aliases: [] as const,
}

export type LavinmqcomPackage = typeof lavinmqcomPackage
