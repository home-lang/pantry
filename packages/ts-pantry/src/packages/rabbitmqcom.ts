/**
 * **rabbitmq** - Open source RabbitMQ: core server and tier 1 (built-in) plugins
 *
 * @domain `rabbitmq.com`
 * @programs `rabbitmqctl`, `rabbitmq-defaults`, `rabbitmq-diagnostics`, `rabbitmq-env`, `rabbitmq-plugins`, ... (+5 more)
 * @version `4.2.3` (44 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install rabbitmq.com`
 * @homepage https://www.rabbitmq.com/
 * @dependencies `erlang.org`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.rabbitmqcom
 * console.log(pkg.name)        // "rabbitmq"
 * console.log(pkg.description) // "Open source RabbitMQ: core server and tier 1 (b..."
 * console.log(pkg.programs)    // ["rabbitmqctl", "rabbitmq-defaults", ...]
 * console.log(pkg.versions[0]) // "4.2.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/rabbitmq-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rabbitmqcomPackage = {
  /**
   * The display name of this package.
   */
  name: 'rabbitmq' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'rabbitmq.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Open source RabbitMQ: core server and tier 1 (built-in) plugins' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/rabbitmq.com/package.yml' as const,
  homepageUrl: 'https://www.rabbitmq.com/' as const,
  githubUrl: 'https://github.com/rabbitmq/rabbitmq-server' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install rabbitmq.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +rabbitmq.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install rabbitmq.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'rabbitmqctl',
    'rabbitmq-defaults',
    'rabbitmq-diagnostics',
    'rabbitmq-env',
    'rabbitmq-plugins',
    'rabbitmq-queues',
    'rabbitmq-server',
    'rabbitmq-streams',
    'rabbitmq-upgrade',
    'vmware-rabbitmq',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'erlang.org',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.2.3',
    '4.2.2',
    '4.2.1',
    '4.2.0',
    '4.1.8',
    '4.1.7',
    '4.1.6',
    '4.1.5',
    '4.1.4',
    '4.1.3',
    '4.1.2',
    '4.1.1',
    '4.1.0',
    '4.0.9',
    '4.0.8',
    '4.0.7',
    '4.0.6',
    '4.0.5',
    '4.0.4',
    '4.0.3',
    '4.0.2',
    '4.0.1',
    '4.0.0',
    '3.13.7',
    '3.13.6',
    '3.13.5',
    '3.13.4',
    '3.13.3',
    '3.13.2',
    '3.13.1',
    '3.13.0',
    '3.12.14',
    '3.12.13',
    '3.12.12',
    '3.12.11',
    '3.12.10',
    '3.12.9',
    '3.12.8',
    '3.12.7',
    '3.12.6',
    '3.11.28',
    '3.11.26',
    '3.11.25',
    '3.11.24',
  ] as const,
  aliases: [] as const,
}

export type RabbitmqcomPackage = typeof rabbitmqcomPackage
